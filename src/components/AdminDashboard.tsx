import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Search, 
  Sliders, 
  LogOut, 
  Share2,
  Sparkles,
  Heart
} from 'lucide-react';
import { WeddingProject } from '../types/wedding';
import { createNewProject, deleteProject, updateProject } from '../services/firebase';
import { ShareModal } from './ShareModal';

interface AdminDashboardProps {
  projects: WeddingProject[];
  onRefresh: () => void;
  onOpenEditor: (project: WeddingProject) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  onRefresh,
  onOpenEditor,
  onLogout
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Aktif' | 'Draf'>('all');
  
  // Modal State for New Project
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMempelai, setNewMempelai] = useState('');
  const [newTanggal, setNewTanggal] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State for Quick Edit
  const [editProject, setEditProject] = useState<WeddingProject | null>(null);
  const [editMempelai, setEditMempelai] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editStatus, setEditStatus] = useState<'Aktif' | 'Draf'>('Aktif');

  // Share Modal
  const [shareProject, setShareProject] = useState<WeddingProject | null>(null);

  // Calculate Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Aktif').length;
  const draftProjects = projects.filter(p => p.status === 'Draf').length;

  // Filtered list
  const filteredProjects = projects.filter(p => {
    const matchSearch = p.mempelai.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Handle Add Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMempelai.trim()) return;
    setIsSubmitting(true);

    try {
      await createNewProject(
        newMempelai.trim(),
        newTanggal.trim() || '23 November 2025',
        newEmail.trim()
      );
      setNewMempelai('');
      setNewTanggal('');
      setNewEmail('');
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Gagal membuat proyek baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Edit Save
  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;

    try {
      await updateProject(editProject.id, {
        mempelai: editMempelai,
        tanggal: editTanggal,
        status: editStatus
      });
      setEditProject(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan.');
    }
  };

  // Handle Delete Project
  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin menghapus proyek "${name}" (${id})?`);
    if (!confirm) return;

    try {
      await deleteProject(id);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus proyek.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1F362D] text-[#DFBF7A] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              MS
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base">MS<span className="text-[#1F362D]">Undangan</span></span>
              <span className="ml-2 text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:inline">Masuk sebagai Administrator</span>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header and Add Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dasbor Pengelolaan Klien</h1>
            <p className="text-xs text-slate-500 mt-1">Kelola data klien, status publikasi, dan kustomisasi undangan pernikahan digital.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#1F362D] hover:bg-[#162720] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all transform hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#DFBF7A]" />
            <span>+ Proyek Baru</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Total Klien</span>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalProjects}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Undangan Aktif</span>
              <h3 className="text-3xl font-bold text-emerald-700 mt-1">{activeProjects}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Draf / Menunggu</span>
              <h3 className="text-3xl font-bold text-amber-600 mt-1">{draftProjects}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari nama mempelai / ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D]"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({totalProjects})
            </button>
            <button
              onClick={() => setFilterStatus('Aktif')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === 'Aktif' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aktif ({activeProjects})
            </button>
            <button
              onClick={() => setFilterStatus('Draf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === 'Draf' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draf ({draftProjects})
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Proyek Klien Aktif</h3>
            <span className="text-xs text-slate-400 font-sans">Menampilkan {filteredProjects.length} proyek</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-3.5 px-6">ID Proyek</th>
                  <th className="py-3.5 px-4">Nama Mempelai</th>
                  <th className="py-3.5 px-4">Tanggal Acara</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi & Editor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Tidak ada proyek ditemukan yang sesuai dengan kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(proj => {
                    const publicUrl = `?id=${proj.id}`;
                    return (
                      <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-indigo-700 font-mono">
                          {proj.id}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm">{proj.mempelai}</span>
                            {proj.config?.tema?.namaTema && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                · {proj.config.tema.namaTema}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {proj.tanggal}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            proj.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Open Public URL */}
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Buka Undangan Publik"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            {/* Share button */}
                            <button
                              onClick={() => setShareProject(proj)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Bagikan Tautan Undangan"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            {/* Dynamic Visual Editor button */}
                            <button
                              onClick={() => onOpenEditor(proj)}
                              className="px-3 py-1.5 rounded-lg bg-[#1F362D] hover:bg-[#162720] text-white font-medium text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                              title="Buka Editor Dinamis"
                            >
                              <Sparkles className="w-3 h-3 text-[#DFBF7A]" />
                              <span>Buka Editor</span>
                            </button>

                            {/* Quick text edit */}
                            <button
                              onClick={() => {
                                setEditProject(proj);
                                setEditMempelai(proj.mempelai);
                                setEditTanggal(proj.tanggal);
                                setEditStatus(proj.status);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Edit Singkat"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(proj.id, proj.mempelai)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Proyek"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Tambah Proyek Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-in border border-slate-100">
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">Buat Proyek Undangan Baru</h3>
            <p className="text-xs text-slate-500 mb-5">Tambahkan data klien baru. Desain dan konten dapat diedit kemudian.</p>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Pasangan Mempelai</label>
                <input
                  type="text"
                  required
                  value={newMempelai}
                  onChange={e => setNewMempelai(e.target.value)}
                  placeholder="Cth: Romeo & Juliet"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tanggal Acara</label>
                <input
                  type="text"
                  required
                  value={newTanggal}
                  onChange={e => setNewTanggal(e.target.value)}
                  placeholder="Cth: 14 Februari 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Klien (Opsional untuk Akses Mandiri)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="klien@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D]"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Proyek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Edit */}
      {editProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-in border border-slate-100">
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">Edit Proyek ({editProject.id})</h3>
            <p className="text-xs text-slate-500 mb-5">Ubah ringkasan data atau status publikasi</p>

            <form onSubmit={handleSaveQuickEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Pasangan Mempelai</label>
                <input
                  type="text"
                  required
                  value={editMempelai}
                  onChange={e => setEditMempelai(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tanggal Acara</label>
                <input
                  type="text"
                  required
                  value={editTanggal}
                  onChange={e => setEditTanggal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status Undangan</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as 'Aktif' | 'Draf')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D] bg-white"
                >
                  <option value="Aktif">Aktif (Dapat diakses publik)</option>
                  <option value="Draf">Draf (Hanya preview)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditProject(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white font-semibold transition-colors shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareProject && (
        <ShareModal
          isOpen={true}
          onClose={() => setShareProject(null)}
          project={shareProject}
        />
      )}
    </div>
  );
};
