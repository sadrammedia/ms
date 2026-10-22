import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Share2, 
  Sparkles, 
  ExternalLink, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  LogOut,
  Clock,
  Heart
} from 'lucide-react';
import { WeddingProject, GuestbookEntry } from '../types/wedding';
import { subscribeToGuestbook } from '../services/firebase';
import { ShareModal } from './ShareModal';

interface ClientDashboardProps {
  project: WeddingProject;
  onOpenEditor: () => void;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  project,
  onOpenEditor,
  onLogout
}) => {
  const [wishes, setWishes] = useState<GuestbookEntry[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [filterWishes, setFilterWishes] = useState<'all' | 'Hadir' | 'Tidak Hadir'>('all');

  useEffect(() => {
    const unsub = subscribeToGuestbook(project.id, (entries) => {
      setWishes(entries);
    });
    return () => unsub();
  }, [project.id]);

  // Calculations for RSVP Stats
  const totalRsvps = wishes.length;
  const attendingList = wishes.filter(w => w.status === 'Hadir' || (w.status as string) === 'Ya, Saya akan hadir');
  const notAttendingList = wishes.filter(w => w.status === 'Tidak Hadir' || (w.status as string) === 'Maaf, saya tidak bisa hadir');
  const maybeList = wishes.filter(w => w.status === 'Mungkin');

  const totalGuestsAttending = attendingList.reduce((acc, curr) => acc + (curr.jumlahTamu || 1), 0);

  const filteredWishes = wishes.filter(w => {
    if (filterWishes === 'all') return true;
    return w.status === filterWishes;
  });

  const publicUrl = `?id=${project.id}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1F362D] text-[#DFBF7A] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              <Heart className="w-4 h-4 fill-[#DFBF7A]" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base">{project.mempelai}</span>
              <span className="ml-2 text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                Portal Klien
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Undangan</span>
            </a>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Welcome & Quick Action Card */}
        <div className="bg-gradient-to-r from-[#1F362D] to-[#2B4C3F] text-white rounded-3xl p-6 md:p-8 shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[#DFBF7A] font-semibold">Selamat Datang di Portal Mempelai</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mt-1 mb-2">{project.mempelai}</h1>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Pantau respon konfirmasi kehadiran tamu (RSVP) secara real-time, baca doa restu yang masuk, dan ubah susunan undangan Anda kapan saja melalui editor visual.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-white/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#DFBF7A]" />
                {project.tanggal}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#DFBF7A]" />
                {project.config.lokasi.namaTempat}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShareModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-[#DFBF7A]" />
              <span>Bagikan Undangan</span>
            </button>
            <button
              onClick={onOpenEditor}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#DFBF7A] hover:bg-[#c9a65d] text-[#1F362D] text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Edit Undangan</span>
            </button>
          </div>
        </div>

        {/* RSVP Analytics Cards */}
        <h2 className="text-base font-bold text-slate-900 mb-4 font-serif">Statistik Respon Kehadiran Tamu (RSVP)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Total Respon</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">{totalRsvps}</h3>
            <span className="text-[11px] text-slate-400">Tamu merespons</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-700 font-medium">Pasti Hadir</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-700 font-mono">{attendingList.length}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">
              Total {totalGuestsAttending} orang tamu
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-rose-700 font-medium">Berhalangan</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-rose-700 font-mono">{notAttendingList.length}</h3>
            <span className="text-[11px] text-slate-400">Tidak dapat hadir</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-700 font-medium">Mungkin / Ragu</span>
              <HelpCircle className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-amber-700 font-mono">{maybeList.length}</h3>
            <span className="text-[11px] text-slate-400">Belum dipastikan</span>
          </div>

        </div>

        {/* Wishes and Guestbook Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1F362D]" />
                <span>Buku Tamu & Ucapan Doa ({wishes.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Semua ucapan dan doa yang dikirimkan oleh tamu undangan</p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterWishes('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterWishes === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Semua ({wishes.length})
              </button>
              <button
                onClick={() => setFilterWishes('Hadir')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterWishes === 'Hadir' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Hadir ({attendingList.length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredWishes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada ucapan tamu yang sesuai.
              </div>
            ) : (
              filteredWishes.map((item, idx) => {
                const isHadir = item.status === 'Hadir' || (item.status as string) === 'Ya, Saya akan hadir';
                return (
                  <div key={item.id || idx} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs font-serif">{item.nama}</h4>
                        {item.jumlahTamu && item.jumlahTamu > 1 && (
                          <span className="text-[10px] text-slate-400 font-sans">
                            Membawa {item.jumlahTamu} orang
                          </span>
                        )}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isHadir ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-serif leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      "{item.pesan}"
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>

      {/* Share Modal */}
      {shareModalOpen && (
        <ShareModal
          isOpen={true}
          onClose={() => setShareModalOpen(false)}
          project={project}
        />
      )}
    </div>
  );
};
