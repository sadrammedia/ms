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
import { WeddingProject, WeddingConfig, GuestbookEntry } from '../types/wedding';
import { defaultProjectsList, defaultWeddingConfig } from '../data/defaultInvitations';

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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
        const shortId = 'MS-' + docSnap.id.substring(0, 7).toUpperCase();
        
        // Merge with existing config if present or construct fallback
        const existingLocal = localList.find(p => p.id === docSnap.id || p.id === shortId);
        
        remoteList.push({
          id: shortId,
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

  // Try finding locally first
  const match = localList.find(p => 
    p.id.toLowerCase() === cleanId.toLowerCase() ||
    p.config.slug.toLowerCase() === cleanId.toLowerCase() ||
    p.id.replace('MS-', '').toLowerCase() === cleanId.toLowerCase()
  );
  if (match) return match;

  // Try querying Firestore
  try {
    const q = query(collection(db, 'proyek_klien'));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      const shortId = 'MS-' + docSnap.id.substring(0, 7).toUpperCase();
      const data = docSnap.data();
      if (
        shortId.toLowerCase() === cleanId.toLowerCase() ||
        docSnap.id.toLowerCase() === cleanId.toLowerCase() ||
        (data.config && data.config.slug && data.config.slug.toLowerCase() === cleanId.toLowerCase())
      ) {
        return {
          id: shortId,
          mempelai: data.mempelai,
          tanggal: data.tanggal,
          status: data.status || 'Aktif',
          dibuatPada: data.dibuatPada ? data.dibuatPada.toDate() : new Date(),
          clientEmail: data.clientEmail,
          config: data.config || defaultWeddingConfig
        };
      }
    }
  } catch (err) {
    console.warn('Firestore query error:', err);
  }

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
  initialConfig?: Partial<WeddingConfig>
): Promise<WeddingProject> {
  const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
  const shortId = `MS-${randomSuffix}`;
  
  const slug = mempelai
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newConfig: WeddingConfig = {
    ...defaultWeddingConfig,
    slug: slug || `wedding-${randomSuffix.toLowerCase()}`,
    judulUndangan: `The Wedding of ${mempelai}`,
    tanggalResmi: tanggal,
    hariTanggalLengkap: tanggal,
    ...(initialConfig || {})
  };

  const newProject: WeddingProject = {
    id: shortId,
    mempelai,
    tanggal,
    status: 'Draf',
    dibuatPada: new Date(),
    clientEmail: clientEmail || '',
    config: newConfig
  };

  // Save to Firestore if available
  try {
    await addDoc(collection(db, 'proyek_klien'), {
      mempelai,
      tanggal,
      status: 'Draf',
      clientEmail: clientEmail || '',
      config: newConfig,
      dibuatPada: serverTimestamp()
    });
  } catch (e) {
    console.info('Saved locally (Firestore unavailable):', e);
  }

  // Always save to local storage
  const current = getLocalProjects();
  setLocalProjects([newProject, ...current]);
  return newProject;
}

/**
 * Update existing project
 */
export async function updateProject(
  projectId: string, 
  updates: Partial<WeddingProject>
): Promise<void> {
  const localList = getLocalProjects();
  const index = localList.findIndex(p => p.id === projectId);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...updates };
    setLocalProjects(localList);
  }

  // Also update in Firestore
  try {
    const q = query(collection(db, 'proyek_klien'));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (docSnap) => {
      const shortId = 'MS-' + docSnap.id.substring(0, 7).toUpperCase();
      if (shortId === projectId || docSnap.id === projectId) {
        await updateDoc(doc(db, 'proyek_klien', docSnap.id), {
          ...updates,
          terakhirDiubah: serverTimestamp()
        });
      }
    });
  } catch (e) {
    console.info('Synced locally:', e);
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
    snapshot.forEach(async (docSnap) => {
      const shortId = 'MS-' + docSnap.id.substring(0, 7).toUpperCase();
      if (shortId === projectId || docSnap.id === projectId) {
        await deleteDoc(doc(db, 'proyek_klien', docSnap.id));
      }
    });
  } catch (e) {
    console.warn('Deleted from local storage:', e);
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

export async function loginWithCredentials(email: string, password: string): Promise<AuthState> {
  // If demo credentials or development mode
  if (email.toLowerCase().includes('admin') || password === 'admin123' || password === 'demo123') {
    const adminUser: AuthState = {
      isLoggedIn: true,
      role: 'admin',
      email: email || 'admin@msundangan.com',
      name: 'Administrator'
    };
    setStoredAuth(adminUser);
    return adminUser;
  }

  // Check client accounts
  const projects = getLocalProjects();
  const matchedProject = projects.find(p => p.clientEmail && p.clientEmail.toLowerCase() === email.toLowerCase());
  if (matchedProject) {
    const clientUser: AuthState = {
      isLoggedIn: true,
      role: 'client',
      email: email,
      name: matchedProject.mempelai,
      assignedProjectId: matchedProject.id
    };
    setStoredAuth(clientUser);
    return clientUser;
  }

  // Attempt Firebase Auth
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const authState: AuthState = {
      isLoggedIn: true,
      role: email.includes('admin') ? 'admin' : 'client',
      email: user.email || email,
      name: user.displayName || email.split('@')[0]
    };
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
