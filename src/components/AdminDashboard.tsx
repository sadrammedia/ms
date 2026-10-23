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
  Heart,
  Star,
  Cake,
  Smartphone,
  MapPin,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { WeddingProject, InvitationCategory } from '../types/wedding';
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
  const [filterKategori, setFilterKategori] = useState<'all' | 'pernikahan' | 'khitan' | 'ulang-tahun'>('all');
  
  // Modal State for New Project
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKategori, setNewKategori] = useState<InvitationCategory>('pernikahan');
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
  const weddingProjects = projects.filter(p => (p.kategori || 'pernikahan') === 'pernikahan').length;
  const khitanProjects = projects.filter(p => p.kategori === 'khitan').length;
  const birthdayProjects = projects.filter(p => p.kategori === 'ulang-tahun').length;

  // Filtered list
  const filteredProjects = projects.filter(p => {
    const pKategori = p.config?.kategori || p.kategori || 'pernikahan';
    const matchSearch = p.mempelai.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchKategori = filterKategori === 'all' || pKategori === filterKategori;
    return matchSearch && matchStatus && matchKategori;
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
        newEmail.trim(),
        {},
        newKategori
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

  const getCategoryBadge = (kat?: string) => {
    switch (kat) {
      case 'khitan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span>🕌</span> Khitan
          </span>
        );
      case 'ulang-tahun':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span>🎂</span> Ulang Tahun
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>💍</span> Pernikahan
          </span>
        );
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
                Super Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:inline">Masuk sebagai Administrator</span>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dasbor Undangan Multi-Momen</h1>
            <p className="text-xs text-slate-500 mt-1">Platform terpadu untuk Undangan Pernikahan, Tasyakuran Khitan, dan Pesta Ulang Tahun.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#1F362D] hover:bg-[#162720] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all transform hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#DFBF7A]" />
            <span>+ Buat Undangan Baru</span>
          </button>
        </div>

        {/* --- TEMPLATE SHOWCASE CARD (Matching User Mockup image_250b3295.png) --- */}
        <div className="bg-gradient-to-br from-slate-900 via-[#1F362D] to-slate-900 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/15">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#DFBF7A] font-semibold">Tiga Momen Spesial, Satu Solusi Modern</span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white mt-1">Template Format Undangan Digital</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span className="flex items-center gap-1">✦ Elegan</span>
                <span>·</span>
                <span className="flex items-center gap-1">✦ Interaktif</span>
                <span>·</span>
                <span className="flex items-center gap-1">✦ Responsif</span>
              </div>
            </div>

            {/* 3 Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Template 1: Pernikahan */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:border-[#DFBF7A]/50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1F362D] text-[#DFBF7A] text-[10px] font-bold border border-[#DFBF7A]/30">
                      UNDANGAN PERNIKAHAN
                    </span>
                    <Heart className="w-4 h-4 text-[#DFBF7A]" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-white">Raka & Sinta</h4>
                  <p className="text-[11px] text-white/70 mt-1 leading-snug">
                    "Cinta yang dirayakan dalam kehangatan keluarga dan sahabat."
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <a
                    href="?id=MS-7B93E2A"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat Undangan</span>
                  </a>
                  {projects.find(p => p.id === 'MS-7B93E2A') && (
                    <button
                      onClick={() => onOpenEditor(projects.find(p => p.id === 'MS-7B93E2A')!)}
                      className="px-3 py-2 rounded-xl bg-[#DFBF7A] text-[#1F362D] text-[11px] font-bold hover:bg-[#cba85a] transition-colors"
                      title="Buka Editor"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Template 2: Khitan */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:border-sky-400/50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-900/80 text-sky-300 text-[10px] font-bold border border-sky-400/30">
                      UNDANGAN KHITAN
                    </span>
                    <Star className="w-4 h-4 text-sky-300" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-white">Ananda Rafi Alfarizki</h4>
                  <p className="text-[11px] text-white/70 mt-1 leading-snug">
                    "Momen penuh syukur untuk langkah awal yang mulia."
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <a
                    href="?id=MS-KHITAN01"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-white text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat Undangan</span>
                  </a>
                  {projects.find(p => p.id === 'MS-KHITAN01') && (
                    <button
                      onClick={() => onOpenEditor(projects.find(p => p.id === 'MS-KHITAN01')!)}
                      className="px-3 py-2 rounded-xl bg-sky-400 text-sky-950 text-[11px] font-bold hover:bg-sky-300 transition-colors"
                      title="Buka Editor"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Template 3: Ulang Tahun */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:border-rose-400/50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-900/80 text-rose-300 text-[10px] font-bold border border-rose-400/30">
                      UNDANGAN ULANG TAHUN
                    </span>
                    <Cake className="w-4 h-4 text-rose-300" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-white">Dinda Permata is turning 10!</h4>
                  <p className="text-[11px] text-white/70 mt-1 leading-snug">
                    "Rayakan kebahagiaan dengan orang-orang terdekat."
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <a
                    href="?id=MS-ULTAH01"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-white text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat Undangan</span>
                  </a>
                  {projects.find(p => p.id === 'MS-ULTAH01') && (
                    <button
                      onClick={() => onOpenEditor(projects.find(p => p.id === 'MS-ULTAH01')!)}
                      className="px-3 py-2 rounded-xl bg-rose-400 text-rose-950 text-[11px] font-bold hover:bg-rose-300 transition-colors"
                      title="Buka Editor"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500">Total Proyek</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalProjects}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500">Pernikahan</span>
              <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">{weddingProjects}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500">Khitanan</span>
              <h3 className="text-2xl font-bold text-sky-700 mt-0.5">{khitanProjects}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500">Ulang Tahun</span>
              <h3 className="text-2xl font-bold text-rose-700 mt-0.5">{birthdayProjects}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Cake className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Category Filter Strip */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari nama / ID proyek..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: 'Semua Momen' },
              { id: 'pernikahan', label: '💍 Pernikahan' },
              { id: 'khitan', label: '🕌 Khitan' },
              { id: 'ulang-tahun', label: '🎂 Ulang Tahun' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterKategori(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  filterKategori === tab.id
                    ? 'bg-[#1F362D] text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Undangan Klien</h3>
            <span className="text-xs text-slate-400 font-sans">Menampilkan {filteredProjects.length} proyek</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-3.5 px-6">ID & Kategori</th>
                  <th className="py-3.5 px-4">Nama / Judul</th>
                  <th className="py-3.5 px-4">Tanggal Acara</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi & Editor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Tidak ada proyek ditemukan yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(proj => {
                    const publicUrl = `?id=${proj.id}`;
                    const kat = proj.config?.kategori || proj.kategori || 'pernikahan';
                    return (
                      <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-indigo-700 font-mono mb-1">{proj.id}</div>
                          {getCategoryBadge(kat)}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-900">
                          <div className="font-serif text-sm">{proj.mempelai}</div>
                          {proj.config?.tema?.namaTema && (
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                              {proj.config.tema.namaTema}
                            </div>
                          )}
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Bagikan Tautan Undangan"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            {/* Visual Editor button */}
                            <button
                              onClick={() => onOpenEditor(proj)}
                              className="px-3 py-1.5 rounded-lg bg-[#1F362D] hover:bg-[#162720] text-white font-medium text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit Singkat"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(proj.id, proj.mempelai)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">Buat Undangan Baru</h3>
            <p className="text-xs text-slate-500 mb-5">Pilih kategori acara dan isi data awal undangan.</p>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              {/* Category selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Kategori Acara</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pernikahan', label: '💍 Pernikahan' },
                    { id: 'khitan', label: '🕌 Khitan' },
                    { id: 'ulang-tahun', label: '🎂 Ulang Tahun' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewKategori(cat.id as InvitationCategory)}
                      className={`py-2 px-2 rounded-xl text-center font-medium transition-all cursor-pointer ${
                        newKategori === cat.id
                          ? 'bg-[#1F362D] text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {newKategori === 'khitan' 
                    ? 'Nama Ananda Yang Dikhitan' 
                    : newKategori === 'ulang-tahun' 
                    ? 'Nama Yang Berulang Tahun' 
                    : 'Nama Pasangan Mempelai'}
                </label>
                <input
                  type="text"
                  required
                  value={newMempelai}
                  onChange={e => setNewMempelai(e.target.value)}
                  placeholder={newKategori === 'khitan' ? 'Cth: Rafi Alfarizki' : newKategori === 'ulang-tahun' ? 'Cth: Dinda Permata' : 'Cth: Raka & Sinta'}
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
                  placeholder="Cth: 15 Desember 2025"
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
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
                <label className="block text-slate-700 font-semibold mb-1">Nama / Judul Acara</label>
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
                <label className="block text-slate-700 font-semibold mb-1">Status Publikasi</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D] bg-white"
                >
                  <option value="Aktif">Aktif (Dapat diakses publik)</option>
                  <option value="Draf">Draf (Sedang dipersiapkan)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditProject(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white font-semibold transition-colors shadow-sm cursor-pointer"
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
