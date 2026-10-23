import React, { useState, useEffect } from 'react';
import { 
  fetchAllProjects, 
  fetchProjectById, 
  getStoredAuth, 
  logout, 
  AuthState 
} from './services/firebase';
import { WeddingProject } from './types/wedding';
import { defaultProjectsList } from './data/defaultInvitations';
import { InvitationView } from './components/InvitationView';
import { DynamicEditor } from './components/DynamicEditor';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientDashboard } from './components/ClientDashboard';
import { AuthModal } from './components/AuthModal';
import { LayoutDashboard } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<WeddingProject[]>(defaultProjectsList);
  const [currentProject, setCurrentProject] = useState<WeddingProject>(defaultProjectsList[0]);
  const [activeView, setActiveView] = useState<'invitation' | 'editor' | 'admin' | 'client'>('invitation');
  const [auth, setAuth] = useState<AuthState>(getStoredAuth());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'admin' | 'client'>('admin');
  const [guestNameParam, setGuestNameParam] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from URL parameters on first load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const idParam = urlParams.get('id');
      const toParam = urlParams.get('to');
      const viewParam = urlParams.get('view');
      const hash = window.location.hash.replace('#', '');

      // Extract potential slug from path (e.g. domain.com/raka-sinta or domain.com/admin)
      const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const pathSlug = rawPath.split('/')[0] || '';
      const systemRoutes = ['admin', 'client', 'editor', 'login', 'index.html', ''];

      const targetIdentifier = idParam || (!systemRoutes.includes(pathSlug.toLowerCase()) ? pathSlug : null);

      if (toParam) setGuestNameParam(toParam);

      // Fetch all projects
      const allProjects = await fetchAllProjects();
      setProjects(allProjects);

      // Determine active project
      let matchedProj: WeddingProject | null = null;
      if (targetIdentifier) {
        matchedProj = await fetchProjectById(targetIdentifier);
      }
      if (!matchedProj && allProjects.length > 0) {
        matchedProj = allProjects[0];
      }
      if (matchedProj) {
        setCurrentProject(matchedProj);
      }

      // Check view routing
      if (viewParam === 'admin' || hash === 'admin' || pathSlug.toLowerCase() === 'admin') {
        const stored = getStoredAuth();
        if (stored.isLoggedIn && stored.role === 'admin') {
          setActiveView('admin');
        } else {
          setAuthModalRole('admin');
          setShowAuthModal(true);
          setActiveView('admin');
        }
      } else if (viewParam === 'client' || hash === 'client' || pathSlug.toLowerCase() === 'client') {
        const stored = getStoredAuth();
        if (stored.isLoggedIn) {
          setActiveView('client');
        } else {
          setAuthModalRole('client');
          setShowAuthModal(true);
          setActiveView('client');
        }
      } else if (viewParam === 'editor' || hash === 'editor' || pathSlug.toLowerCase() === 'editor') {
        setActiveView('editor');
      } else {
        // Pure clean public invitation
        setActiveView('invitation');
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  const handleRefreshProjects = async () => {
    const list = await fetchAllProjects();
    setProjects(list);
    const updatedCurrent = list.find(p => p.id === currentProject.id);
    if (updatedCurrent) setCurrentProject(updatedCurrent);
  };

  const handleOpenEditorForProject = (proj: WeddingProject) => {
    setCurrentProject(proj);
    setActiveView('editor');
  };

  const handleSaveSuccess = (updated: WeddingProject) => {
    setCurrentProject(updated);
    handleRefreshProjects();
  };

  const handleAuthSuccess = (newAuth: AuthState) => {
    setAuth(newAuth);
    if (newAuth.role === 'admin') {
      setActiveView('admin');
    } else {
      if (newAuth.assignedProjectId) {
        const found = projects.find(p => p.id === newAuth.assignedProjectId);
        if (found) setCurrentProject(found);
      }
      setActiveView('client');
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuth({ isLoggedIn: false, role: 'guest', email: '', name: '' });
    setActiveView('invitation');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#1F362D] border-t-transparent animate-spin mb-4" />
        <h2 className="font-serif text-lg font-bold text-[#1F362D]">Memuat Undangan Digital...</h2>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: PURE 100% PUBLIC INVITATION (No admin bar, edge-to-edge responsive)
  // =========================================================================
  if (activeView === 'invitation') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-slate-800 antialiased relative">
        {/* Full-width responsive wedding invitation */}
        <InvitationView 
          project={currentProject} 
          guestNameParam={guestNameParam} 
        />

        {/* Floating Admin Button ONLY visible if already authenticated as Admin */}
        {auth.isLoggedIn && auth.role === 'admin' && (
          <div className="fixed bottom-4 left-4 z-50 animate-fade-in">
            <button
              onClick={() => setActiveView('admin')}
              className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-medium shadow-xl flex items-center gap-1.5 border border-slate-700 backdrop-blur-md transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#DFBF7A]" />
              <span>Dasbor Admin</span>
            </button>
          </div>
        )}

        {/* Auth Modal (if opened via footer link or shortcut) */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          initialRole={authModalRole}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DYNAMIC EDITOR (For Admin or Couple with edit access)
  // =========================================================================
  if (activeView === 'editor') {
    return (
      <DynamicEditor
        project={currentProject}
        onSaveSuccess={handleSaveSuccess}
        onBack={() => {
          if (auth.isLoggedIn && auth.role === 'admin') {
            setActiveView('admin');
          } else if (auth.isLoggedIn && auth.role === 'client') {
            setActiveView('client');
          } else {
            setActiveView('invitation');
          }
        }}
      />
    );
  }

  // =========================================================================
  // VIEW 3: ADMIN DASHBOARD (Accessible via /admin or ?view=admin)
  // =========================================================================
  if (activeView === 'admin') {
    if (!auth.isLoggedIn || auth.role !== 'admin') {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <AuthModal
            isOpen={true}
            onClose={() => setActiveView('invitation')}
            onSuccess={handleAuthSuccess}
            initialRole="admin"
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <AdminDashboard
          projects={projects}
          onRefresh={handleRefreshProjects}
          onOpenEditor={handleOpenEditorForProject}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: CLIENT PORTAL (Accessible via /client or ?view=client)
  // =========================================================================
  if (activeView === 'client') {
    if (!auth.isLoggedIn) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <AuthModal
            isOpen={true}
            onClose={() => setActiveView('invitation')}
            onSuccess={handleAuthSuccess}
            initialRole="client"
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <ClientDashboard
          project={currentProject}
          onOpenEditor={() => setActiveView('editor')}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return null;
}
