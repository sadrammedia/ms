import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { WeddingProject, WeddingConfig, GuestbookEntry, InvitationCategory } from '../types/wedding';
import { defaultProjectsList, defaultWeddingConfig, defaultKhitanConfig, defaultBirthdayConfig } from '../data/defaultInvitations';
import { sanitizeConfigForFirestore, measureDataSize } from '../utils/imageCompressor';

// Firebase configuration from existing project
const firebaseConfig = {
  apiKey: "AIzaSyBDo1rGh8myxaIkJG-ZNez1OJGrto-wD8g",
  authDomain: "ms-undangan-digital.firebaseapp.com",
  projectId: "ms-undangan-digital",
  storageBucket: "ms-undangan-digital.firebasestorage.app",
  messagingSenderId: "1098540280128",
  appId: "1:1098540280128:web:c977728e753ba17a1532a5"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Local storage keys for resilient offline sync
const STORAGE_PROJECTS_KEY = 'ms_undangan_projects_v2';
const STORAGE_GUESTBOOK_KEY = 'ms_undangan_guestbook_v2';
const STORAGE_AUTH_USER_KEY = 'ms_undangan_auth_user_v2';

// Helper to get local projects
export function getLocalProjects(): WeddingProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default properties like modeNavigasi and multi-category templates are present
        const mergedProjects = parsed.map((p: any) => {
          const matchDefault = defaultProjectsList.find(d => d.id === p.id);
          if (matchDefault && matchDefault.config?.tema) {
            return {
              ...p,
              config: {
                ...p.config,
                tema: {
                  ...matchDefault.config.tema,
                  ...p.config?.tema
                }
              }
            };
          }
          return p;
        });

        const missingDefaults = defaultProjectsList.filter(
          def => !mergedProjects.some((p: any) => p.id === def.id || p.config?.slug === def.config.slug)
        );
        if (missingDefaults.length > 0) {
          const combined = [...mergedProjects, ...missingDefaults];
          setLocalProjects(combined);
          return combined;
        }
        return mergedProjects;
      }
    }
  } catch (e) {
    console.warn('Could not read from local storage:', e);
  }
  // Initialize with default projects
  setLocalProjects(defaultProjectsList);
  return defaultProjectsList;
}

export function setLocalProjects(projects: WeddingProject[]) {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Could not write to local storage:', e);
  }
}

// Helper to get local guestbook entries
export function getLocalGuestbook(): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_GUESTBOOK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read guestbook from local storage:', e);
  }
  const initial: GuestbookEntry[] = [
    {
      id: 'wish-1',
      idProyek: 'MS-7B93E2A',
      nama: 'Budi Santoso & Keluarga',
      status: 'Hadir',
      jumlahTamu: 2,
      pesan: 'Selamat menempuh hidup baru untuk Raka & Sinta! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah serta dilimpahi berkah selalu.',
      dikirimPada: new Date(Date.now() - 3600000 * 5)
    },
    {
      id: 'wish-2',
      idProyek: 'MS-7B93E2A',
      nama: 'Andi Pratama & Rina',
      status: 'Hadir',
      jumlahTamu: 2,
      pesan: 'Selamat menempuh hidup baru sahabatku Raka & Sinta! Semoga bahagia selalu sampai maut memisahkan.',
      dikirimPada: new Date(Date.now() - 3600000 * 2)
    },
    {
      id: 'wish-3',
      idProyek: 'MS-7B93E2A',
      nama: 'Dewi Lestari',
      status: 'Tidak Hadir',
      jumlahTamu: 1,
      pesan: 'Mohon maaf belum bisa hadir langsung karena masih dinas luar kota. Doa terbaik menyertai pernikahan kalian berdua!',
      dikirimPada: new Date(Date.now() - 3600000 * 1)
    }
  ];
  setLocalGuestbook(initial);
  return initial;
}

export function setLocalGuestbook(entries: GuestbookEntry[]) {
  try {
    localStorage.setItem(STORAGE_GUESTBOOK_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('Could not write guestbook to local storage:', e);
  }
}

/**
 * Fetch all client projects (combining Firestore and resilient fallback)
 */
export async function fetchAllProjects(): Promise<WeddingProject[]> {
  const localList = getLocalProjects();
  try {
    const q = query(collection(db, 'proyek_klien'), orderBy('dibuatPada', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const remoteList: WeddingProject[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const shortId = data.id || data.shortId || ('MS-' + docSnap.id.substring(0, 7).toUpperCase());
        
        // Merge with existing config if present or construct fallback
        const existingLocal = localList.find(p => p.id === docSnap.id || p.id === shortId);
        
        remoteList.push({
          id: shortId,
          kategori: data.kategori || existingLocal?.kategori || 'pernikahan',
          mempelai: data.mempelai || 'Mempelai',
          tanggal: data.tanggal || 'Tanggal Acara',
          status: (data.status as 'Aktif' | 'Draf') || 'Aktif',
          dibuatPada: data.dibuatPada ? data.dibuatPada.toDate() : new Date(),
          clientEmail: data.clientEmail || '',
          config: data.config || existingLocal?.config || {
            ...defaultWeddingConfig,
            slug: (data.mempelai || 'wedding').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            judulUndangan: `The Wedding of ${data.mempelai || 'Raka & Sinta'}`,
            tanggalResmi: data.tanggal || '23 November 2025'
          }
        });
      });
      // Synchronize to local storage for fast instant load
      setLocalProjects(remoteList);
      return remoteList;
    }
  } catch (err) {
    console.info('Firestore offline/restricted, using local store:', err);
  }
  return localList;
}

/**
 * Find project by short ID (MS-XXXX), doc ID, or slug
 */
export async function fetchProjectById(idOrSlug: string): Promise<WeddingProject | null> {
  const cleanId = idOrSlug.trim();
  const localList = getLocalProjects();

  // Try querying Firestore first so shared links / newly published updates are immediately live
  try {
    const q = query(collection(db, 'proyek_klien'));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const shortId = data.id || data.shortId || ('MS-' + docSnap.id.substring(0, 7).toUpperCase());
      if (
        shortId.toLowerCase() === cleanId.toLowerCase() ||
        docSnap.id.toLowerCase() === cleanId.toLowerCase() ||
        (data.id && data.id.toLowerCase() === cleanId.toLowerCase()) ||
        (data.shortId && data.shortId.toLowerCase() === cleanId.toLowerCase()) ||
        (data.config && data.config.slug && data.config.slug.toLowerCase() === cleanId.toLowerCase())
      ) {
        const foundProject: WeddingProject = {
          id: shortId,
          kategori: data.kategori || data.config?.kategori || 'pernikahan',
          mempelai: data.mempelai,
          tanggal: data.tanggal,
          status: data.status || 'Aktif',
          dibuatPada: data.dibuatPada ? data.dibuatPada.toDate() : new Date(),
          clientEmail: data.clientEmail,
          config: data.config || defaultWeddingConfig
        };

        // Cache into local storage
        const existingIdx = localList.findIndex(p => p.id === shortId);
        if (existingIdx !== -1) {
          localList[existingIdx] = foundProject;
        } else {
          localList.push(foundProject);
        }
        setLocalProjects(localList);

        return foundProject;
      }
    }
  } catch (err) {
    console.warn('Firestore query error:', err);
  }

  // Fallback to local storage if Firestore is unreachable
  const match = localList.find(p => 
    p.id.toLowerCase() === cleanId.toLowerCase() ||
    p.config.slug.toLowerCase() === cleanId.toLowerCase() ||
    p.id.replace('MS-', '').toLowerCase() === cleanId.toLowerCase()
  );
  if (match) return match;

  // Return the default project if requested standard default
  if (cleanId === 'MS-7B93E2A' || cleanId === 'raka-sinta' || cleanId === 'GLOBAL') {
    return defaultProjectsList[0];
  }

  return null;
}

/**
 * Save new project
 */
export async function createNewProject(
  mempelai: string, 
  tanggal: string, 
  clientEmail?: string,
  initialConfig?: Partial<WeddingConfig>,
  kategori: InvitationCategory = 'pernikahan'
): Promise<WeddingProject> {
  const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
  const shortId = `MS-${randomSuffix}`;
  
  const slug = mempelai
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Select base config template based on category
  let baseConfig = defaultWeddingConfig;
  let defaultTitle = `The Wedding of ${mempelai}`;

  if (kategori === 'khitan') {
    baseConfig = defaultKhitanConfig;
    defaultTitle = `Tasyakuran Khitan ${mempelai}`;
  } else if (kategori === 'ulang-tahun') {
    baseConfig = defaultBirthdayConfig;
    defaultTitle = `Birthday Party - ${mempelai}`;
  }

  const rawConfig: WeddingConfig = {
    ...baseConfig,
    kategori,
    slug: slug || `${kategori}-${randomSuffix.toLowerCase()}`,
    judulUndangan: defaultTitle,
    tanggalResmi: tanggal,
    hariTanggalLengkap: tanggal,
    ...(initialConfig || {})
  };

  // Pre-sanitize config to ensure image sizes are strictly safe (< 1MB)
  const sanitizedConfig = await sanitizeConfigForFirestore(rawConfig);

  const newProject: WeddingProject = {
    id: shortId,
    kategori,
    mempelai,
    tanggal,
    status: 'Draf',
    dibuatPada: new Date(),
    clientEmail: clientEmail || '',
    config: sanitizedConfig
  };

  // Save to Firestore with dedicated doc ID matching shortId
  try {
    const cleanDocId = shortId.replace(/[^a-zA-Z0-9_-]/g, '_');
    await setDoc(doc(db, 'proyek_klien', cleanDocId), {
      id: shortId,
      shortId: shortId,
      kategori,
      mempelai,
      tanggal,
      status: 'Draf',
      clientEmail: clientEmail || '',
      config: sanitizedConfig,
      dibuatPada: serverTimestamp(),
      terakhirDiubah: serverTimestamp()
    });
  } catch (e) {
    console.warn('Saved locally (Firestore error):', e);
  }

  // Always save to local storage
  const current = getLocalProjects();
  setLocalProjects([newProject, ...current]);
  return newProject;
}

/**
 * Update existing project with size-safe Base64 compression and reliable Firestore upsert
 */
export async function updateProject(
  projectId: string, 
  updates: Partial<WeddingProject>
): Promise<void> {
  const localList = getLocalProjects();
  const index = localList.findIndex(p => 
    p.id.toLowerCase() === projectId.toLowerCase() ||
    p.config?.slug?.toLowerCase() === projectId.toLowerCase()
  );

  // 1. Sanitize config if provided to ensure no raw Base64 images exceed 1MB Firestore limit
  let sanitizedUpdates = { ...updates };
  if (sanitizedUpdates.config) {
    const cleanConfig = await sanitizeConfigForFirestore(sanitizedUpdates.config);
    // Keep date fields in sync
    if (sanitizedUpdates.tanggal) {
      cleanConfig.tanggalResmi = sanitizedUpdates.tanggal;
      if (!cleanConfig.hariTanggalLengkap || cleanConfig.hariTanggalLengkap === cleanConfig.tanggalResmi) {
        cleanConfig.hariTanggalLengkap = sanitizedUpdates.tanggal;
      }
    }
    sanitizedUpdates.config = cleanConfig;
  }

  // 2. Save locally first for instant snappy response
  if (index !== -1) {
    localList[index] = { 
      ...localList[index], 
      ...sanitizedUpdates,
      config: sanitizedUpdates.config || localList[index].config
    };
    setLocalProjects(localList);
  }

  // 3. Update or Upsert in Firestore
  try {
    const q = query(collection(db, 'proyek_klien'));
    const snapshot = await getDocs(q);
    let matchedDocId: string | null = null;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const shortId = data.id || data.shortId || ('MS-' + docSnap.id.substring(0, 7).toUpperCase());
      if (
        shortId.toLowerCase() === projectId.toLowerCase() || 
        docSnap.id.toLowerCase() === projectId.toLowerCase() ||
        (data.id && data.id.toLowerCase() === projectId.toLowerCase()) ||
        (data.shortId && data.shortId.toLowerCase() === projectId.toLowerCase()) ||
        (data.config?.slug && data.config.slug.toLowerCase() === projectId.toLowerCase())
      ) {
        matchedDocId = docSnap.id;
        break;
      }
    }

    if (matchedDocId) {
      await updateDoc(doc(db, 'proyek_klien', matchedDocId), {
        ...sanitizedUpdates,
        terakhirDiubah: serverTimestamp()
      });
      console.info(`Firestore document ${matchedDocId} updated successfully.`);
    } else {
      // Document didn't exist in Firestore yet (e.g. preset/default project edited for the first time)
      // Upsert it so the published invitation link works universally on all devices!
      const currentProj = index !== -1 ? localList[index] : null;
      const cleanDocId = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
      await setDoc(doc(db, 'proyek_klien', cleanDocId), {
        id: projectId,
        shortId: projectId,
        mempelai: sanitizedUpdates.mempelai || currentProj?.mempelai || 'Mempelai',
        tanggal: sanitizedUpdates.tanggal || currentProj?.tanggal || '23 November 2025',
        status: sanitizedUpdates.status || currentProj?.status || 'Aktif',
        kategori: sanitizedUpdates.kategori || currentProj?.kategori || 'pernikahan',
        clientEmail: sanitizedUpdates.clientEmail || currentProj?.clientEmail || '',
        config: sanitizedUpdates.config || currentProj?.config || defaultWeddingConfig,
        dibuatPada: serverTimestamp(),
        terakhirDiubah: serverTimestamp()
      });
      console.info(`Firestore document ${cleanDocId} upserted successfully.`);
    }
  } catch (err: any) {
    console.error('Firestore save failed:', err);
    throw err;
  }
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const localList = getLocalProjects().filter(p => p.id !== projectId);
  setLocalProjects(localList);

  try {
    const q = query(collection(db, 'proyek_klien'));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const shortId = data.id || data.shortId || ('MS-' + docSnap.id.substring(0, 7).toUpperCase());
      if (
        shortId.toLowerCase() === projectId.toLowerCase() || 
        docSnap.id.toLowerCase() === projectId.toLowerCase() ||
        (data.id && data.id.toLowerCase() === projectId.toLowerCase())
      ) {
        await deleteDoc(doc(db, 'proyek_klien', docSnap.id));
      }
    }
  } catch (e) {
    console.warn('Deleted from local storage, error deleting remote:', e);
  }
}

/**
 * Real-time guestbook subscription
 */
export function subscribeToGuestbook(
  idProyek: string, 
  callback: (entries: GuestbookEntry[]) => void
): () => void {
  // Listen to Firestore
  let unsubscribeFirestore = () => {};
  try {
    const q = query(collection(db, 'buku_tamu'), where('idProyek', '==', idProyek));
    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const list: GuestbookEntry[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            idProyek: d.idProyek,
            nama: d.nama,
            status: d.status,
            jumlahTamu: d.jumlahTamu || 1,
            pesan: d.pesan,
            dikirimPada: d.dikirimPada ? d.dikirimPada.toDate() : new Date()
          });
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.dikirimPada).getTime() - new Date(a.dikirimPada).getTime());
        callback(list);
        return;
      }
      // If snapshot is empty, fall back to local
      const local = getLocalGuestbook().filter(e => e.idProyek === idProyek);
      callback(local);
    }, (error) => {
      console.info('Using local guestbook fallback:', error);
      const local = getLocalGuestbook().filter(e => e.idProyek === idProyek);
      callback(local);
    });
  } catch (e) {
    const local = getLocalGuestbook().filter(e => e.idProyek === idProyek);
    callback(local);
  }

  return () => {
    unsubscribeFirestore();
  };
}

/**
 * Submit RSVP & Wish
 */
export async function submitRsvpWish(entry: Omit<GuestbookEntry, 'id' | 'dikirimPada'>): Promise<GuestbookEntry> {
  const newEntry: GuestbookEntry = {
    ...entry,
    id: 'local-' + Date.now(),
    dikirimPada: new Date()
  };

  // Add to local guestbook
  const current = getLocalGuestbook();
  setLocalGuestbook([newEntry, ...current]);

  // Attempt Firestore write
  try {
    await addDoc(collection(db, 'buku_tamu'), {
      idProyek: entry.idProyek,
      nama: entry.nama,
      status: entry.status,
      jumlahTamu: entry.jumlahTamu || 1,
      pesan: entry.pesan,
      dikirimPada: serverTimestamp()
    });
  } catch (e) {
    console.info('Stored locally in browser:', e);
  }

  return newEntry;
}

/**
 * Authentication service
 */
export interface AuthState {
  isLoggedIn: boolean;
  role: 'admin' | 'client' | 'guest';
  email: string;
  name: string;
  assignedProjectId?: string;
}

export function getStoredAuth(): AuthState {
  try {
    const saved = localStorage.getItem(STORAGE_AUTH_USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    isLoggedIn: false,
    role: 'guest',
    email: '',
    name: ''
  };
}

export function setStoredAuth(authData: AuthState) {
  try {
    localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(authData));
  } catch (e) {}
}

export async function loginWithCredentials(
  email: string, 
  password: string,
  targetRole: 'admin' | 'client' = 'admin'
): Promise<AuthState> {
  const cleanEmail = email.trim().toLowerCase();

  // If logging in from Admin tab or email contains admin / sadram
  const isAdminEmail = cleanEmail.includes('admin') || 
                       cleanEmail.includes('sadram') || 
                       cleanEmail === 'sadrammedia21@gmail.com' ||
                       targetRole === 'admin';

  // Demo shortcut credentials
  if (cleanEmail === 'admin@msundangan.com' || password === 'admin123' || password === 'demo123') {
    const adminUser: AuthState = {
      isLoggedIn: true,
      role: 'admin',
      email: cleanEmail || 'admin@msundangan.com',
      name: 'Administrator'
    };
    setStoredAuth(adminUser);
    return adminUser;
  }

  // Check client accounts in local projects (if target is client)
  if (targetRole === 'client') {
    const projects = getLocalProjects();
    const matchedProject = projects.find(p => 
      (p.clientEmail && p.clientEmail.toLowerCase() === cleanEmail) ||
      p.id.toLowerCase() === cleanEmail ||
      p.config?.slug?.toLowerCase() === cleanEmail
    );
    if (matchedProject) {
      const clientUser: AuthState = {
        isLoggedIn: true,
        role: 'client',
        email: cleanEmail,
        name: matchedProject.mempelai,
        assignedProjectId: matchedProject.id
      };
      setStoredAuth(clientUser);
      return clientUser;
    }
  }

  // Attempt Firebase Auth
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Determine role strictly based on user's intention and credentials
    const role: 'admin' | 'client' = targetRole === 'admin' || isAdminEmail ? 'admin' : 'client';
    
    const authState: AuthState = {
      isLoggedIn: true,
      role: role,
      email: user.email || email,
      name: role === 'admin' ? 'Administrator' : (user.displayName || email.split('@')[0])
    };

    // If client, associate with first matching or active project
    if (role === 'client') {
      const projects = getLocalProjects();
      const matched = projects.find(p => p.clientEmail && p.clientEmail.toLowerCase() === cleanEmail);
      if (matched) authState.assignedProjectId = matched.id;
    }

    setStoredAuth(authState);
    return authState;
  } catch (err: any) {
    console.error('Firebase Auth error:', err);
    throw new Error(err.message || 'Email atau kata sandi salah');
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {}
  setStoredAuth({
    isLoggedIn: false,
    role: 'guest',
    email: '',
    name: ''
  });
}
