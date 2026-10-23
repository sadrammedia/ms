import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Send, 
  Volume2, 
  VolumeX, 
  Share2, 
  Menu, 
  X, 
  ChevronDown, 
  Users, 
  Check, 
  Copy, 
  Car, 
  Utensils, 
  ExternalLink,
  Gift,
  ArrowRight
} from 'lucide-react';
import { WeddingProject, GuestbookEntry } from '../types/wedding';
import { submitRsvpWish, subscribeToGuestbook } from '../services/firebase';
import { BotanicalCorner, GoldFloralDivider, BotanicalSwag } from './BotanicalDecorations';
import { LightboxModal } from './LightboxModal';
import { ShareModal } from './ShareModal';

interface InvitationViewProps {
  project: WeddingProject;
  guestNameParam?: string;
  isEmbedPreview?: boolean;
}

export const InvitationView: React.FC<InvitationViewProps> = ({
  project,
  guestNameParam,
  isEmbedPreview = false
}) => {
  const config = project.config;
  const [isOpened, setIsOpened] = useState(isEmbedPreview);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [guestName, setGuestName] = useState(guestNameParam || 'Tamu Undangan');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // RSVP Form States
  const [rsvpName, setRsvpName] = useState(guestNameParam || '');
  const [rsvpGuestCount, setRsvpGuestCount] = useState<number>(1);
  const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Mungkin'>('Hadir');
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Wishes Form States
  const [wishName, setWishName] = useState(guestNameParam || '');
  const [wishMessage, setWishMessage] = useState('');
  const [wishLoading, setWishLoading] = useState(false);
  const [wishesList, setWishesList] = useState<GuestbookEntry[]>([]);
  
  // Lightbox & Share Modal States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  // Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize guest name from URL if provided
  useEffect(() => {
    if (guestNameParam) {
      setGuestName(guestNameParam);
      setRsvpName(guestNameParam);
      setWishName(guestNameParam);
    }
  }, [guestNameParam]);

  // Subscribe to real-time wishes from Firestore / Local
  useEffect(() => {
    const unsub = subscribeToGuestbook(project.id, (entries) => {
      setWishesList(entries);
    });
    return () => unsub();
  }, [project.id]);

  // Countdown calculation
  useEffect(() => {
    const targetDate = new Date(config.tanggalCountdownIso || '2025-11-23T08:00:00').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.tanggalCountdownIso]);

  // Handle open invitation
  const handleOpenInvitation = () => {
    setIsOpened(true);

    // Burst confetti
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#2C4A3E', '#C5A059', '#FAF7F2', '#E8C547']
      });
    } catch (e) {}

    // Auto-play music if enabled
    if (config.musik.enabled && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(() => {
        // Autoplay may be restricted until subsequent user interaction
        setIsPlayingMusic(false);
      });
    }

    // Smooth scroll to profile section
    setTimeout(() => {
      const el = document.getElementById('tentang-kami');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(console.warn);
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setRsvpLoading(true);

    try {
      await submitRsvpWish({
        idProyek: project.id,
        nama: rsvpName.trim(),
        status: rsvpStatus,
        jumlahTamu: rsvpGuestCount,
        pesan: `Konfirmasi kehadiran: ${rsvpStatus} (${rsvpGuestCount} Tamu)`
      });
      setRsvpSuccess(true);
      setTimeout(() => setRsvpSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishMessage.trim()) return;
    setWishLoading(true);

    try {
      await submitRsvpWish({
        idProyek: project.id,
        nama: wishName.trim() || 'Tamu Terhormat',
        status: 'Hadir',
        pesan: wishMessage.trim()
      });
      setWishMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setWishLoading(false);
    }
  };

  const handleCopyAccount = (noRek: string) => {
    navigator.clipboard.writeText(noRek);
    setCopiedAccount(noRek);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(config.judulUndangan);
    const details = encodeURIComponent(`${config.subJudulSampul}\n\nLokasi: ${config.lokasi.alamatLengkap}`);
    const location = encodeURIComponent(`${config.lokasi.namaTempat}, ${config.lokasi.alamatLengkap}`);
    const startTime = '20251123T010000Z'; // UTC for 08:00 WIB
    const endTime = '20251123T080000Z'; // UTC for 15:00 WIB

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 font-sans selection:bg-[#1F362D] selection:text-[#FAF7F2] relative overflow-x-hidden">
      {/* Background Audio */}
      {config.musik.enabled && (
        <audio 
          ref={audioRef} 
          src={config.musik.audioUrl} 
          loop 
          preload="auto"
        />
      )}

      {/* Floating Audio & Menu Controls (Visible when opened) */}
      {isOpened && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {config.musik.enabled && (
            <button
              onClick={toggleMusic}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border ${
                isPlayingMusic 
                  ? 'bg-[#1F362D] text-[#DFBF7A] border-[#C5A059]/40 animate-pulse' 
                  : 'bg-white/80 backdrop-blur-md text-slate-600 border-white/60'
              }`}
              title={isPlayingMusic ? 'Jeda Musik' : 'Putar Musik'}
              aria-label="Kontrol Musik"
            >
              {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setShareModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-slate-700 border border-white/60 flex items-center justify-center shadow-lg hover:bg-white transition-all"
            title="Bagikan Undangan"
            aria-label="Bagikan Undangan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Nav Drawer Modal */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-[#FAF7F2] w-64 h-full p-6 shadow-2xl flex flex-col justify-between animate-fade-in border-l border-[#C5A059]/20">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="font-script text-2xl text-[#1F362D]">{project.mempelai}</span>
                <button onClick={() => setMenuOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-6 space-y-3 font-serif text-sm">
                <a href="#hero-cover" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:text-[#1F362D] transition-colors">Sampul Undangan</a>
                <a href="#tentang-kami" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:text-[#1F362D] transition-colors">Tentang Kami</a>
                {config.kisahCinta.enabled && (
                  <a href="#kisah-cinta" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:text-[#1F362D] transition-colors">Kisah Cinta</a>
                )}
                <a href="#acara" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:text-[#1F362D] transition-colors">Agenda Acara</a>
                {config.galeri.enabled && (
                  <a href="#galeri" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:text-[#1F362D] transition-colors">Galeri Foto</a>
                )}
                <a href="#lokasi" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:text-[#1F362D] transition-colors">Lokasi & Navigasi</a>
                {config.rsvp.enabled && (
                  <a href="#rsvp" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:text-[#1F362D] transition-colors">Konfirmasi RSVP</a>
                )}
                {config.bukuTamu.enabled && (
                  <a href="#doa-ucapan" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:text-[#1F362D] transition-colors">Doa & Ucapan</a>
                )}
              </nav>
            </div>
            <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
              MS Undangan Digital
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO COVER (Matching image_2904f1c4.png Mockup)                       */}
      {/* ========================================================================= */}
      <section 
        id="hero-cover" 
        className={`relative w-full min-h-screen flex flex-col items-center justify-between transition-all duration-700 ${
          isOpened ? 'hidden' : 'block'
        }`}
      >
        {/* Background photo & artistic scrim */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 filter brightness-[0.88]"
          style={{ backgroundImage: `url(${config.fotoSampul})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/90 via-[#FAF7F2]/75 to-transparent h-[60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent top-[45%]" />
        </div>

        {/* Botanical Foliage Accents */}
        <BotanicalCorner position="top-left" />
        <BotanicalCorner position="top-right" />

        {/* Main invitation card container */}
        <div className="relative z-10 w-full max-w-md mx-auto pt-12 px-6 text-center flex-1 flex flex-col justify-between">
          <div className="pt-2">
            {/* Header label */}
            <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-[#1F362D]/90 font-medium mb-3">
              {config.labelSampul}
            </p>

            {/* Couple calligraphy name */}
            <h1 className="font-script text-5xl md:text-6xl text-[#1F362D] mb-1 font-normal tracking-wide drop-shadow-sm">
              {project.mempelai}
            </h1>

            {/* Gold floral divider */}
            <GoldFloralDivider className="my-2" />

            {/* Intro invitation text */}
            <p className="text-xs md:text-sm text-slate-700 max-w-xs mx-auto leading-relaxed mt-2 font-serif">
              {config.subJudulSampul}
            </p>

            {/* Date Stack (SABTU / 23 / NOV 2025) */}
            <div className="my-6 inline-flex flex-col items-center justify-center px-6 py-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#1F362D] font-semibold">
                {config.hariTanggalLengkap.split(',')[0] || 'SABTU'}
              </span>
              <span className="font-serif text-4xl md:text-5xl font-bold text-[#1F362D] my-0.5 tracking-tight">
                {config.tanggalResmi.match(/\d+/)?.[0] || '23'}
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#1F362D] font-medium">
                {config.tanggalResmi.replace(/^\d+\s*/, '') || 'NOV 2025'}
              </span>
            </div>

            {/* Venue snippet */}
            <div className="text-xs text-slate-700 font-serif mb-5">
              <p className="font-semibold text-slate-900">{config.lokasi.namaTempat}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{config.lokasi.alamatLengkap}</p>
            </div>

            {/* Guest Greeting */}
            <div className="bg-white/80 backdrop-blur-md border border-[#C5A059]/30 rounded-2xl py-3 px-4 max-w-xs mx-auto shadow-sm mb-6">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-sans">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
              <h2 className="text-base font-semibold text-[#1F362D] mt-0.5 font-serif">{guestName}</h2>
            </div>

            {/* Buka Undangan CTA Button (Dark forest green) */}
            <button
              onClick={handleOpenInvitation}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#1F362D] hover:bg-[#162720] text-white font-medium text-xs md:text-sm tracking-wide shadow-xl transition-all transform hover:scale-105 active:scale-95 group"
            >
              <span>{config.teksTombol || 'Buka Undangan'}</span>
              <ArrowRight className="w-4 h-4 text-[#DFBF7A] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Bottom couple scenic area & scroll prompt */}
          <div className="pb-8 pt-12 text-center text-white/90">
            <div className="flex flex-col items-center justify-center gap-1 animate-bounce opacity-80">
              <ChevronDown className="w-5 h-5 text-white" />
              <span className="text-[11px] font-sans tracking-wider uppercase drop-shadow">Scroll untuk melihat lebih lanjut</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN INVITATION CONTENT (Displayed once opened)                       */}
      {/* ========================================================================= */}
      <main className={`transition-opacity duration-700 ${isOpened ? 'opacity-100' : 'hidden opacity-0'}`}>
        
        {/* Top Floating App Bar */}
        <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#C5A059]/20 px-6 py-3 flex items-center justify-between">
          <span className="font-script text-2xl text-[#1F362D] tracking-wide">
            {project.mempelai}
          </span>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-slate-700 hover:text-[#1F362D] p-1.5 rounded-lg transition-colors"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Content Container (Optimized for Mobile Phone Frame or Center Column) */}
        <div className="max-w-md mx-auto bg-white/70 backdrop-blur-sm border-x border-[#C5A059]/15 shadow-sm min-h-screen">

          {/* --------------------------------------------------------------------- */}
          {/* Section: Tentang Kami / Profil Mempelai                                */}
          {/* --------------------------------------------------------------------- */}
          <section id="tentang-kami" className="relative py-14 px-6 text-center border-b border-[#C5A059]/15 overflow-hidden">
            <BotanicalCorner position="top-right" className="opacity-40" />
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">Pasangan Mempelai</p>
            <h2 className="font-serif text-3xl font-semibold text-[#1F362D] mb-3">Tentang Kami</h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-8">
              {config.kutipanAwal}
            </p>

            {/* Couple Portraits Side-by-Side */}
            <div className="grid grid-cols-2 gap-4 items-start mb-8">
              {/* Groom */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 border-2 border-[#C5A059] shadow-md mb-3 overflow-hidden bg-slate-100">
                  <img
                    src={config.pria.foto}
                    alt={config.pria.namaLengkap}
                    className="w-full h-full rounded-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#1F362D]">{config.pria.namaLengkap}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Putra dari <br />
                  <span className="font-medium text-slate-700">{config.pria.namaAyah}</span> <br />
                  & <span className="font-medium text-slate-700">{config.pria.namaIbu}</span>
                </p>
                {config.pria.instagram && (
                  <span className="text-[10px] text-[#C5A059] font-medium mt-1">{config.pria.instagram}</span>
                )}
              </div>

              {/* Bride */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 border-2 border-[#C5A059] shadow-md mb-3 overflow-hidden bg-slate-100">
                  <img
                    src={config.wanita.foto}
                    alt={config.wanita.namaLengkap}
                    className="w-full h-full rounded-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#1F362D]">{config.wanita.namaLengkap}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Putri dari <br />
                  <span className="font-medium text-slate-700">{config.wanita.namaAyah}</span> <br />
                  & <span className="font-medium text-slate-700">{config.wanita.namaIbu}</span>
                </p>
                {config.wanita.instagram && (
                  <span className="text-[10px] text-[#C5A059] font-medium mt-1">{config.wanita.instagram}</span>
                )}
              </div>
            </div>

            <GoldFloralDivider className="my-4" />
            
            {/* Love Quote */}
            <p className="italic font-serif text-xs text-slate-600 max-w-xs mx-auto">
              {config.kutipanAkhir}
            </p>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* Section: Kisah Cinta (Optional)                                       */}
          {/* --------------------------------------------------------------------- */}
          {config.kisahCinta.enabled && config.kisahCinta.ceritaList.length > 0 && (
            <section id="kisah-cinta" className="py-12 px-6 border-b border-[#C5A059]/15 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">Perjalanan Cinta</p>
              <h2 className="font-serif text-2xl font-semibold text-[#1F362D] mb-6">Kisah Kami</h2>
              
              <div className="space-y-4 text-left">
                {config.kisahCinta.ceritaList.map((story, idx) => (
                  <div key={story.id || idx} className="bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-sm relative">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1F362D] text-[#DFBF7A] text-[10px] font-semibold">
                        {story.tahun}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-slate-900">{story.judul}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-serif pl-1">
                      {story.cerita}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* Section: Acara & Countdown                                            */}
          {/* --------------------------------------------------------------------- */}
          <section id="acara" className="py-14 px-6 text-center border-b border-[#C5A059]/15 relative">
            <BotanicalCorner position="bottom-left" className="opacity-30" />
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">Waktu & Tempat</p>
            <h2 className="font-serif text-3xl font-semibold text-[#1F362D] mb-2">Rangkaian Acara</h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
              Kami mengundang Anda untuk hadir dan menjadi bagian dari hari istimewa kami.
            </p>

            {/* Countdown Box */}
            <div className="bg-[#1F362D] text-white p-5 rounded-3xl shadow-lg max-w-sm mx-auto mb-8 relative overflow-hidden border border-[#C5A059]/30">
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#DFBF7A] mb-3 font-semibold">
                {timeLeft.isPast ? 'Acara Telah Berlangsung' : 'Hitung Mundur Menuju Hari Bahagia'}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/10 rounded-2xl py-2 px-1">
                  <span className="block font-serif text-2xl font-bold text-white">{timeLeft.days}</span>
                  <span className="text-[10px] text-white/70 uppercase">Hari</span>
                </div>
                <div className="bg-white/10 rounded-2xl py-2 px-1">
                  <span className="block font-serif text-2xl font-bold text-white">{timeLeft.hours}</span>
                  <span className="text-[10px] text-white/70 uppercase">Jam</span>
                </div>
                <div className="bg-white/10 rounded-2xl py-2 px-1">
                  <span className="block font-serif text-2xl font-bold text-white">{timeLeft.minutes}</span>
                  <span className="text-[10px] text-white/70 uppercase">Menit</span>
                </div>
                <div className="bg-white/10 rounded-2xl py-2 px-1">
                  <span className="block font-serif text-2xl font-bold text-white">{timeLeft.seconds}</span>
                  <span className="text-[10px] text-white/70 uppercase">Detik</span>
                </div>
              </div>

              <button
                onClick={handleAddToCalendar}
                className="mt-4 w-full py-2 px-4 rounded-xl bg-[#DFBF7A] hover:bg-[#c9a65d] text-[#1F362D] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Calendar className="w-3.5 h-3.5" />
                Simpan ke Google Calendar
              </button>
            </div>

            {/* Event Timeline Cards (Akad Nikah & Resepsi) */}
            <div className="space-y-4 max-w-sm mx-auto text-left">
              {config.acaraList.map((evt) => (
                <div 
                  key={evt.id} 
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1F362D] text-[#DFBF7A] flex items-center justify-center shrink-0 shadow-sm">
                    {evt.judul.toLowerCase().includes('akad') ? (
                      <Calendar className="w-5 h-5" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-base text-[#1F362D]">{evt.judul}</h4>
                    <p className="text-xs text-slate-700 font-medium mt-1">{evt.hariTanggal}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#C5A059]" />
                      {evt.waktu}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-serif">{evt.tempat}</p>
                  </div>
                </div>
              ))}
            </div>

            <BotanicalSwag className="mx-auto mt-6" />
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* Section: Galeri Foto & Video                                          */}
          {/* --------------------------------------------------------------------- */}
          {config.galeri.enabled && (
            <section id="galeri" className="py-14 px-6 text-center border-b border-[#C5A059]/15">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">Momen Bahagia</p>
              <h2 className="font-serif text-3xl font-semibold text-[#1F362D] mb-2">Galeri Foto</h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.galeri.deskripsi}
              </p>

              {/* 2x2 Photo Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {config.galeri.fotoList.slice(0, 4).map((foto, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                    className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group relative bg-slate-100"
                  >
                    <img
                      src={foto}
                      alt={`Foto Galeri ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                      Perbesar
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="px-6 py-2.5 rounded-full bg-[#1F362D] hover:bg-[#162720] text-white text-xs font-semibold tracking-wider transition-colors shadow-md"
              >
                Lihat Semua Foto ({config.galeri.fotoList.length})
              </button>
            </section>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* Section: Konfirmasi Kehadiran (RSVP)                                   */}
          {/* --------------------------------------------------------------------- */}
          {config.rsvp.enabled && (
            <section id="rsvp" className="py-14 px-6 text-center border-b border-[#C5A059]/15">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">Kehadiran</p>
              <h2 className="font-serif text-3xl font-semibold text-[#1F362D] mb-2">Konfirmasi Kehadiran</h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.rsvp.pesanCatatan}
              </p>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-left max-w-sm mx-auto">
                {rsvpSuccess ? (
                  <div className="py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-base text-slate-900">Terima Kasih!</h4>
                    <p className="text-xs text-slate-500 mt-1">Konfirmasi kehadiran Anda telah tersimpan dengan aman.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRsvpSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="Masukkan nama Anda"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Jumlah Tamu
                      </label>
                      <select
                        value={rsvpGuestCount}
                        onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D] transition-all bg-white"
                      >
                        <option value={1}>1 Orang</option>
                        <option value={2}>2 Orang</option>
                        <option value={3}>3 Orang</option>
                        <option value={4}>4 Orang</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Status Kehadiran
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Hadir', 'Tidak Hadir', 'Mungkin'] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setRsvpStatus(status)}
                            className={`py-2 text-[11px] font-medium rounded-xl border transition-all ${
                              rsvpStatus === status
                                ? 'bg-[#1F362D] text-white border-[#1F362D] shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={rsvpLoading}
                      className="w-full py-3 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white font-medium text-xs tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 text-[#DFBF7A]" />
                      <span>{rsvpLoading ? 'Mengirim...' : 'Kirim Konfirmasi'}</span>
                    </button>
                  </form>
                )}
                <p className="text-[11px] text-center text-slate-400 mt-3 font-serif">
                  ♥ Terima kasih atas doa dan kehadiran Anda.
                </p>
              </div>
            </section>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* Section: Doa & Ucapan (Guestbook)                                      */}
          {/* --------------------------------------------------------------------- */}
          {config.bukuTamu.enabled && (
            <section id="doa-ucapan" className="py-14 px-6 text-center border-b border-[#C5A059]/15">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">Buku Tamu</p>
              <h2 className="font-serif text-3xl font-semibold text-[#1F362D] mb-2">Doa & Ucapan</h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.bukuTamu.subJudul}
              </p>

              {/* Input Form */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-left max-w-sm mx-auto mb-6">
                <form onSubmit={handleWishSubmit} className="space-y-3">
                  <div>
                    <textarea
                      required
                      maxLength={300}
                      rows={3}
                      value={wishMessage}
                      onChange={(e) => setWishMessage(e.target.value)}
                      placeholder="Tulis doa dan ucapan untuk kami..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D] resize-none"
                    />
                    <div className="text-right text-[10px] text-slate-400">
                      {wishMessage.length}/300
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={wishName}
                      onChange={(e) => setWishName(e.target.value)}
                      placeholder="Nama Anda (opsional)"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1F362D]/20 focus:border-[#1F362D]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={wishLoading || !wishMessage.trim()}
                    className="w-full py-2.5 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white font-medium text-xs tracking-wider transition-colors shadow flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5 text-[#DFBF7A]" />
                    <span>{wishLoading ? 'Mengirim...' : 'Kirim'}</span>
                  </button>
                </form>
              </div>

              {/* Wishes Feed */}
              <div className="max-w-sm mx-auto space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar text-left">
                {wishesList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 italic">
                    Belum ada ucapan. Jadilah yang pertama memberikan doa!
                  </p>
                ) : (
                  wishesList.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 font-serif">{item.nama}</span>
                        <span className="text-[10px] text-slate-400">
                          {item.status === 'Hadir' ? '✓ Hadir' : item.status}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-serif">
                        "{item.pesan}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* Section: Lokasi & Navigasi                                            */}
          {/* --------------------------------------------------------------------- */}
          <section id="lokasi" className="py-14 px-6 text-center border-b border-[#C5A059]/15">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">Peta & Arah</p>
            <h2 className="font-serif text-3xl font-semibold text-[#1F362D] mb-2">Lokasi & Navigasi</h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
              Silakan gunakan peta untuk memudahkan perjalanan Anda ke lokasi acara.
            </p>

            {/* Map Preview Card */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 max-w-sm mx-auto mb-6">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-200 mb-3 border border-slate-100 relative">
                {config.lokasi.embedMapsUrl ? (
                  <iframe
                    src={config.lokasi.embedMapsUrl}
                    title="Peta Lokasi"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-emerald-50/50">
                    <MapPin className="w-8 h-8 text-rose-500 mb-1 animate-bounce" />
                    <span className="font-serif font-bold text-xs text-slate-800">{config.lokasi.namaTempat}</span>
                    <span className="text-[10px] text-slate-500">{config.lokasi.alamatLengkap}</span>
                  </div>
                )}
              </div>

              <div className="text-center mb-3">
                <h4 className="font-serif font-bold text-sm text-[#1F362D]">{config.lokasi.namaTempat}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{config.lokasi.alamatLengkap}</p>
              </div>

              <a
                href={config.lokasi.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#DFBF7A]" />
                Buka di Google Maps
              </a>
            </div>

            {/* Informasi Tambahan (Parkir, Jamuan, Ketepatan Waktu) */}
            <div className="max-w-sm mx-auto space-y-2.5 text-left">
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Informasi Tambahan</p>
              {config.infoTambahan.map((info) => (
                <div key={info.id} className="bg-white/80 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1F362D] flex items-center justify-center shrink-0">
                    {info.icon === 'car' ? <Car className="w-4 h-4" /> :
                     info.icon === 'utensils' ? <Utensils className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-xs text-slate-800">{info.judul}</h5>
                    <p className="text-[11px] text-slate-500">{info.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* Section: Tanda Kasih / Amplop Digital                                 */}
          {/* --------------------------------------------------------------------- */}
          {config.amplopDigital.enabled && (
            <section id="amplop-digital" className="py-14 px-6 text-center border-b border-[#C5A059]/15">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">Tanda Kasih</p>
              <h2 className="font-serif text-3xl font-semibold text-[#1F362D] mb-2">Amplop Digital</h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.amplopDigital.deskripsi}
              </p>

              <div className="max-w-sm mx-auto space-y-3">
                {config.amplopDigital.rekeningList.map((rek) => (
                  <div key={rek.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-[#1F362D] font-serif">{rek.bank}</span>
                      <button
                        onClick={() => handleCopyAccount(rek.noRek)}
                        className="text-[11px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        {copiedAccount === rek.noRek ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedAccount === rek.noRek ? 'Tersalin' : 'Salin No. Rek'}
                      </button>
                    </div>
                    <p className="font-mono text-sm tracking-wider font-semibold text-slate-800">{rek.noRek}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">a.n {rek.atasNama}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* Section: Penutup Undangan                                             */}
          {/* --------------------------------------------------------------------- */}
          <footer className="py-16 px-6 text-center bg-gradient-to-b from-white/60 to-[#FAF7F2] relative">
            <BotanicalSwag className="mx-auto mb-4" />
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-4">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
            </p>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Kami yang berbahagia,</p>
            <h3 className="font-script text-4xl text-[#1F362D] mb-6">{project.mempelai}</h3>

            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-md transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Bagikan ke Teman / Keluarga
            </button>

            <div className="mt-12 text-[10px] text-slate-400 font-sans tracking-wide">
              <a href="/admin" className="hover:text-slate-600 transition-colors">
                MS Undangan Digital © {new Date().getFullYear()} · All Rights Reserved
              </a>
            </div>
          </footer>

        </div>
      </main>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={config.galeri.fotoList}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        project={project}
      />
    </div>
  );
};
