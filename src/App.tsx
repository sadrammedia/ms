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
import { 
  Eye, 
  Sparkles, 
  LayoutDashboard, 
  UserCheck, 
  Lock, 
  Smartphone, 
  Monitor, 
  Share2,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<WeddingProject[]>(defaultProjectsList);
  const [currentProject, setCurrentProject] = useState<WeddingProject>(defaultProjectsList[0]);
  const [activeView, setActiveView] = useState<'invitation' | 'editor' | 'admin' | 'client'>('invitation');
  const [auth, setAuth] = useState<AuthState>(getStoredAuth());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'admin' | 'client'>('admin');
  const [guestNameParam, setGuestNameParam] = useState<string>('');
  const [phoneFrameMode, setPhoneFrameMode] = useState(true);
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

      // Extract potential slug from path (e.g. domain.com/raka-sinta)
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
        setActiveView('admin');
      } else if (viewParam === 'client' || hash === 'client' || pathSlug.toLowerCase() === 'client') {
        setActiveView('client');
      } else if (viewParam === 'editor' || hash === 'editor' || pathSlug.toLowerCase() === 'editor') {
        setActiveView('editor');
      } else {
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

  const handleNavClick = (view: 'invitation' | 'editor' | 'admin' | 'client') => {
    if (view === 'admin') {
      if (!auth.isLoggedIn || auth.role !== 'admin') {
        setAuthModalRole('admin');
        setShowAuthModal(true);
        return;
      }
    } else if (view === 'client') {
      if (!auth.isLoggedIn) {
        setAuthModalRole('client');
        setShowAuthModal(true);
        return;
      }
    }
    setActiveView(view);
  };

  const handleAuthSuccess = (newAuth: AuthState) => {
    setAuth(newAuth);
    if (newAuth.role === 'admin') {
      setActiveView('admin');
    } else {
      // Find client assigned project
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
        <div className="w-12 h-12 rounded-full border-3 border-[#1F362D] border-t-transparent animate-spin mb-4" />
        <h2 className="font-serif text-xl font-bold text-[#1F362D]">Memuat Undangan Digital...</h2>
        <p className="text-xs text-slate-500 mt-1">Menghubungkan ke database MS Undangan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-800 antialiased selection:bg-[#1F362D] selection:text-[#FAF7F2]">
      
      {/* Global Top Navigation Bar for AI Studio Platform Review */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-50">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#1F362D] text-[#DFBF7A] flex items-center justify-center font-serif font-bold text-xs shadow-xs border border-[#C5A059]/40">
            MS
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-tight text-xs md:text-sm">MS Undangan Digital</span>
            <span className="hidden sm:inline text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              Platform Premium
            </span>
          </div>
        </div>

        {/* Center: Main View Tabs Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto text-xs">
          <button
            onClick={() => handleNavClick('invitation')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'invitation'
                ? 'bg-[#1F362D] text-[#DFBF7A] font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Undangan Publik</span>
          </button>

          <button
            onClick={() => handleNavClick('editor')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'editor'
                ? 'bg-[#1F362D] text-[#DFBF7A] font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#DFBF7A]" />
            <span>Editor Dinamis</span>
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'admin'
                ? 'bg-[#1F362D] text-[#DFBF7A] font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dasbor Admin</span>
          </button>

          <button
            onClick={() => handleNavClick('client')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'client'
                ? 'bg-[#1F362D] text-[#DFBF7A] font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Portal Klien</span>
          </button>
        </div>

        {/* Right: Invitation Switcher & Auth State */}
        <div className="flex items-center gap-2">
          {activeView === 'invitation' && (
            <div className="hidden lg:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setPhoneFrameMode(true)}
                className={`p-1 rounded-md ${phoneFrameMode ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Tampilan Smartphone (Mockup)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPhoneFrameMode(false)}
                className={`p-1 rounded-md ${!phoneFrameMode ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Tampilan Layar Penuh"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active project quick selector */}
          <select
            value={currentProject.id}
            onChange={(e) => {
              const selected = projects.find(p => p.id === e.target.value);
              if (selected) setCurrentProject(selected);
            }}
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none hidden sm:block"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.mempelai} ({p.id})
              </option>
            ))}
          </select>

          {auth.isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Keluar ({auth.role})
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalRole('admin');
                setShowAuthModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <Lock className="w-3 h-3 text-[#DFBF7A]" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </header>

      {/* Main View Display */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF7F2]">
        
        {/* VIEW 1: PUBLIC INVITATION */}
        {activeView === 'invitation' && (
          phoneFrameMode ? (
            /* Smartphone View Frame (matches the exact mobile mockups in image_2904f1c4.png) */
            <div className="flex-1 bg-slate-900/95 py-6 px-4 flex items-center justify-center overflow-y-auto">
              <div className="w-[380px] h-[780px] bg-slate-950 rounded-[50px] p-3 shadow-2xl ring-1 ring-slate-800 relative flex flex-col shrink-0">
                
                {/* Smartphone Dynamic Island Notch */}
                <div className="w-32 h-5 bg-black rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-end px-3">
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800" />
                </div>

                {/* Inner Screen */}
                <div className="w-full h-full rounded-[40px] overflow-hidden bg-[#FAF7F2] relative custom-scrollbar flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <InvitationView 
                      project={currentProject} 
                      guestNameParam={guestNameParam} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Responsive Full View */
            <div className="flex-1 overflow-y-auto">
              <InvitationView 
                project={currentProject} 
                guestNameParam={guestNameParam} 
              />
            </div>
          )
        )}

        {/* VIEW 2: DYNAMIC EDITOR */}
        {activeView === 'editor' && (
          <DynamicEditor
            project={currentProject}
            onSaveSuccess={handleSaveSuccess}
            onBack={() => setActiveView('invitation')}
          />
        )}

        {/* VIEW 3: ADMIN DASHBOARD */}
        {activeView === 'admin' && (
          <div className="flex-1 overflow-y-auto">
            <AdminDashboard
              projects={projects}
              onRefresh={handleRefreshProjects}
              onOpenEditor={handleOpenEditorForProject}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* VIEW 4: CLIENT DASHBOARD */}
        {activeView === 'client' && (
          <div className="flex-1 overflow-y-auto">
            <ClientDashboard
              project={currentProject}
              onOpenEditor={() => setActiveView('editor')}
              onLogout={handleLogout}
            />
          </div>
        )}

      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialRole={authModalRole}
      />
    </div>
  );
}
