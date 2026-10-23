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
import { BotanicalCorner, GoldFloralDivider, ModernDivider, BotanicalSwag } from './BotanicalDecorations';
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
  
  // Dynamic theme variables
  const primaryColor = config.tema?.warnaUtama || '#1F362D';
  const accentColor = config.tema?.warnaAksen || '#C5A059';
  const bgColor = config.tema?.warnaLatar || '#FAF7F2';
  const visualStyle = config.tema?.styleTampilan || 'classic-botanical';
  const fontJudul = config.tema?.fontJudul || 'Great Vibes';

  // Helper for title typography
  const getTitleFontClass = () => {
    switch (fontJudul) {
      case 'Alex Brush': return 'font-alex';
      case 'Playfair Display': return 'font-serif';
      case 'Cinzel': return 'font-cinzel tracking-wider';
      default: return 'font-script';
    }
  };

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

    // Burst festive confetti
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.65 },
        colors: [primaryColor, accentColor, '#FAF7F2', '#E8C547']
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

    // Smooth scroll down to profile section
    setTimeout(() => {
      const el = document.getElementById('tentang-kami');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 250);
  };

  // Scroll / Wheel & Touch Swipe Detection on Cover Screen
  useEffect(() => {
    if (isOpened) return;

    let touchStartY = 0;
    let touchStartTime = 0;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 15) {
        handleOpenInvitation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const timeDiff = Date.now() - touchStartTime;
      const distance = touchStartY - touchEndY;
      // If swiped up by more than 25px in reasonable time
      if (distance > 25 && timeDiff < 1200) {
        handleOpenInvitation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        handleOpenInvitation();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpened, primaryColor, accentColor, config.musik.enabled]);

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
    <div 
      className={`min-h-screen text-slate-800 font-sans relative overflow-x-hidden ${
        isOpened ? 'overflow-y-auto' : 'h-screen overflow-hidden'
      }`}
      style={{ backgroundColor: bgColor }}
    >
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
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border border-white/40"
              style={{
                backgroundColor: isPlayingMusic ? primaryColor : 'rgba(255,255,255,0.85)',
                color: isPlayingMusic ? accentColor : '#475569'
              }}
              title={isPlayingMusic ? 'Jeda Musik' : 'Putar Musik'}
              aria-label="Kontrol Musik"
            >
              {isPlayingMusic ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setShareModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md text-slate-700 border border-white/60 flex items-center justify-center shadow-lg hover:bg-white transition-all"
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
          <div 
            className="w-64 h-full p-6 shadow-2xl flex flex-col justify-between animate-fade-in border-l"
            style={{ 
              backgroundColor: bgColor,
              borderColor: `${accentColor}30`
            }}
          >
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span 
                  className={`${getTitleFontClass()} text-2xl font-normal`}
                  style={{ color: primaryColor }}
                >
                  {project.mempelai}
                </span>
                <button onClick={() => setMenuOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-6 space-y-3 font-serif text-sm">
                <a href="#hero-cover" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Sampul Undangan</a>
                <a href="#tentang-kami" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Tentang Kami</a>
                {config.kisahCinta.enabled && (
                  <a href="#kisah-cinta" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Kisah Cinta</a>
                )}
                <a href="#acara" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Agenda Acara</a>
                {config.galeri.enabled && (
                  <a href="#galeri" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Galeri Foto</a>
                )}
                <a href="#lokasi" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Lokasi & Navigasi</a>
                {config.rsvp.enabled && (
                  <a href="#rsvp" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Konfirmasi RSVP</a>
                )}
                {config.bukuTamu.enabled && (
                  <a href="#doa-ucapan" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Doa & Ucapan</a>
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
        className="relative w-full min-h-screen flex flex-col items-center justify-between transition-all duration-700 select-none"
      >
        {/* Background photo & artistic scrim */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 filter brightness-[0.88]"
          style={{ backgroundImage: `url(${config.fotoSampul})` }}
        >
          <div 
            className="absolute inset-0 h-[60%]"
            style={{ 
              background: `linear-gradient(to bottom, ${bgColor}E6, ${bgColor}BF, transparent)` 
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent top-[45%]" />
        </div>

        {/* Botanical Foliage Accents (Visible in classic, romantic, luxury styles) */}
        {visualStyle !== 'modern-clean' && (
          <>
            <BotanicalCorner position="top-left" />
            <BotanicalCorner position="top-right" />
          </>
        )}

        {/* Main invitation card container */}
        <div className="relative z-10 w-full max-w-md mx-auto pt-10 px-6 text-center flex-1 flex flex-col justify-between">
          <div className="pt-2">
            {/* Header label */}
            <p 
              className="text-[11px] md:text-xs uppercase tracking-[0.25em] font-medium mb-3"
              style={{ color: primaryColor }}
            >
              {config.labelSampul}
            </p>

            {/* Couple calligraphy name */}
            <h1 
              className={`${getTitleFontClass()} text-5xl md:text-6xl mb-1 font-normal tracking-wide drop-shadow-xs`}
              style={{ color: primaryColor }}
            >
              {project.mempelai}
            </h1>

            {/* Floral / Modern divider */}
            {visualStyle === 'modern-clean' ? (
              <ModernDivider className="my-2" color={primaryColor} />
            ) : (
              <GoldFloralDivider className="my-2" color={accentColor} />
            )}

            {/* Intro invitation text */}
            <p className="text-xs md:text-sm text-slate-700 max-w-xs mx-auto leading-relaxed mt-2 font-serif">
              {config.subJudulSampul}
            </p>

            {/* Date Stack (SABTU / 23 / NOV 2025) */}
            <div className="my-5 inline-flex flex-col items-center justify-center px-6 py-2">
              <span 
                className="text-[11px] uppercase tracking-[0.2em] font-semibold"
                style={{ color: primaryColor }}
              >
                {config.hariTanggalLengkap.split(',')[0] || 'SABTU'}
              </span>
              <span 
                className="font-serif text-4xl md:text-5xl font-bold my-0.5 tracking-tight"
                style={{ color: primaryColor }}
              >
                {config.tanggalResmi.match(/\d+/)?.[0] || '23'}
              </span>
              <span 
                className="text-[11px] uppercase tracking-[0.2em] font-medium"
                style={{ color: primaryColor }}
              >
                {config.tanggalResmi.replace(/^\d+\s*/, '') || 'NOV 2025'}
              </span>
            </div>

            {/* Venue snippet */}
            <div className="text-xs text-slate-700 font-serif mb-4">
              <p className="font-semibold text-slate-900">{config.lokasi.namaTempat}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{config.lokasi.alamatLengkap}</p>
            </div>

            {/* Guest Greeting */}
            <div 
              className="bg-white/85 backdrop-blur-md rounded-2xl py-3 px-4 max-w-xs mx-auto shadow-sm mb-5 border"
              style={{ borderColor: `${accentColor}40` }}
            >
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-sans">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
              <h2 
                className="text-base font-semibold mt-0.5 font-serif"
                style={{ color: primaryColor }}
              >
                {guestName}
              </h2>
            </div>

            {/* Buka Undangan CTA Button */}
            <button
              onClick={handleOpenInvitation}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-xs md:text-sm tracking-wide shadow-xl transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{config.teksTombol || 'Buka Undangan'}</span>
              <ArrowRight 
                className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                style={{ color: accentColor }}
              />
            </button>
          </div>

          {/* Bottom couple scenic area & interactive scroll prompt */}
          <button
            type="button"
            onClick={handleOpenInvitation}
            className="pb-8 pt-8 text-center text-white/95 w-full flex flex-col items-center justify-center gap-1 group cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
            aria-label="Scroll atau klik untuk membuka undangan"
          >
            <div className="flex flex-col items-center justify-center gap-1 animate-bounce">
              <ChevronDown className="w-5 h-5 text-white drop-shadow-md" />
              <span className="text-[11px] font-sans tracking-wider uppercase drop-shadow-md font-semibold text-white/95">
                Scroll / Ketuk untuk melihat lebih lanjut
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN INVITATION CONTENT (Revealed and unlocked)                       */}
      {/* ========================================================================= */}
      <main className={`transition-opacity duration-700 ${isOpened ? 'opacity-100 block' : 'hidden opacity-0'}`}>
        
        {/* Top Floating App Bar */}
        <header 
          className="sticky top-0 z-40 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b shadow-xs"
          style={{ 
            backgroundColor: `${bgColor}EE`,
            borderColor: `${accentColor}25`
          }}
        >
          <span 
            className={`${getTitleFontClass()} text-2xl tracking-wide`}
            style={{ color: primaryColor }}
          >
            {project.mempelai}
          </span>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-slate-700 hover:text-slate-900 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Content Container */}
        <div 
          className="max-w-md mx-auto bg-white/70 backdrop-blur-sm border-x shadow-sm min-h-screen"
          style={{ borderColor: `${accentColor}20` }}
        >

          {/* --------------------------------------------------------------------- */}
          {/* Section: Tentang Kami / Profil Mempelai                                */}
          {/* --------------------------------------------------------------------- */}
          <section 
            id="tentang-kami" 
            className="relative py-14 px-6 text-center border-b overflow-hidden"
            style={{ borderColor: `${accentColor}20` }}
          >
            {visualStyle !== 'modern-clean' && (
              <BotanicalCorner position="top-right" className="opacity-35" />
            )}
            <p 
              className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
              style={{ color: accentColor }}
            >
              Pasangan Mempelai
            </p>
            <h2 
              className="font-serif text-3xl font-semibold mb-3"
              style={{ color: primaryColor }}
            >
              Tentang Kami
            </h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-8">
              {config.kutipanAwal}
            </p>

            {/* Couple Portraits Side-by-Side */}
            <div className="grid grid-cols-2 gap-4 items-start mb-8">
              {/* Groom */}
              <div className="flex flex-col items-center">
                <div 
                  className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 border-2 shadow-md mb-3 overflow-hidden bg-slate-100"
                  style={{ borderColor: accentColor }}
                >
                  <img
                    src={config.pria.foto}
                    alt={config.pria.namaLengkap}
                    className="w-full h-full rounded-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <h3 
                  className="font-serif font-bold text-sm"
                  style={{ color: primaryColor }}
                >
                  {config.pria.namaLengkap}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Putra dari <br />
                  <span className="font-medium text-slate-700">{config.pria.namaAyah}</span> <br />
                  & <span className="font-medium text-slate-700">{config.pria.namaIbu}</span>
                </p>
                {config.pria.instagram && (
                  <span 
                    className="text-[10px] font-medium mt-1"
                    style={{ color: accentColor }}
                  >
                    {config.pria.instagram}
                  </span>
                )}
              </div>

              {/* Bride */}
              <div className="flex flex-col items-center">
                <div 
                  className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 border-2 shadow-md mb-3 overflow-hidden bg-slate-100"
                  style={{ borderColor: accentColor }}
                >
                  <img
                    src={config.wanita.foto}
                    alt={config.wanita.namaLengkap}
                    className="w-full h-full rounded-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <h3 
                  className="font-serif font-bold text-sm"
                  style={{ color: primaryColor }}
                >
                  {config.wanita.namaLengkap}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Putri dari <br />
                  <span className="font-medium text-slate-700">{config.wanita.namaAyah}</span> <br />
                  & <span className="font-medium text-slate-700">{config.wanita.namaIbu}</span>
                </p>
                {config.wanita.instagram && (
                  <span 
                    className="text-[10px] font-medium mt-1"
                    style={{ color: accentColor }}
                  >
                    {config.wanita.instagram}
                  </span>
                )}
              </div>
            </div>

            {visualStyle === 'modern-clean' ? (
              <ModernDivider className="my-4" color={primaryColor} />
            ) : (
              <GoldFloralDivider className="my-4" color={accentColor} />
            )}
            
            {/* Love Quote */}
            <p className="italic font-serif text-xs text-slate-600 max-w-xs mx-auto">
              {config.kutipanAkhir}
            </p>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* Section: Kisah Cinta (Optional)                                       */}
          {/* --------------------------------------------------------------------- */}
          {config.kisahCinta.enabled && config.kisahCinta.ceritaList.length > 0 && (
            <section 
              id="kisah-cinta" 
              className="py-12 px-6 border-b text-center"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p 
                className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
                style={{ color: accentColor }}
              >
                Perjalanan Cinta
              </p>
              <h2 
                className="font-serif text-2xl font-semibold mb-6"
                style={{ color: primaryColor }}
              >
                Kisah Kami
              </h2>
              
              <div className="space-y-4 text-left">
                {config.kisahCinta.ceritaList.map((story, idx) => (
                  <div key={story.id || idx} className="bg-white/85 p-4 rounded-2xl border border-slate-100 shadow-xs relative">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: primaryColor, color: accentColor }}
                      >
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
          <section 
            id="acara" 
            className="py-14 px-6 text-center border-b relative"
            style={{ borderColor: `${accentColor}20` }}
          >
            {visualStyle !== 'modern-clean' && (
              <BotanicalCorner position="bottom-left" className="opacity-25" />
            )}
            <p 
              className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
              style={{ color: accentColor }}
            >
              Waktu & Tempat
            </p>
            <h2 
              className="font-serif text-3xl font-semibold mb-2"
              style={{ color: primaryColor }}
            >
              Rangkaian Acara
            </h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
              Kami mengundang Anda untuk hadir dan menjadi bagian dari hari istimewa kami.
            </p>

            {/* Countdown Box */}
            <div 
              className="text-white p-5 rounded-3xl shadow-lg max-w-sm mx-auto mb-8 relative overflow-hidden border"
              style={{ 
                backgroundColor: primaryColor,
                borderColor: `${accentColor}40`
              }}
            >
              <div 
                className="text-[10px] tracking-[0.2em] uppercase mb-3 font-semibold"
                style={{ color: accentColor }}
              >
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
                className="mt-4 w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                style={{ 
                  backgroundColor: accentColor, 
                  color: primaryColor 
                }}
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
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: primaryColor, color: accentColor }}
                  >
                    {evt.judul.toLowerCase().includes('akad') ? (
                      <Calendar className="w-5 h-5" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="font-serif font-bold text-base"
                      style={{ color: primaryColor }}
                    >
                      {evt.judul}
                    </h4>
                    <p className="text-xs text-slate-700 font-medium mt-1">{evt.hariTanggal}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" style={{ color: accentColor }} />
                      {evt.waktu}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-serif">{evt.tempat}</p>
                  </div>
                </div>
              ))}
            </div>

            {visualStyle !== 'modern-clean' && (
              <BotanicalSwag className="mx-auto mt-6" />
            )}
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* Section: Galeri Foto & Video                                          */}
          {/* --------------------------------------------------------------------- */}
          {config.galeri.enabled && (
            <section 
              id="galeri" 
              className="py-14 px-6 text-center border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p 
                className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
                style={{ color: accentColor }}
              >
                Momen Bahagia
              </p>
              <h2 
                className="font-serif text-3xl font-semibold mb-2"
                style={{ color: primaryColor }}
              >
                Galeri Foto
              </h2>
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
                    className="aspect-square rounded-2xl overflow-hidden shadow-xs border border-slate-100 cursor-pointer group relative bg-slate-100"
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
                className="px-6 py-2.5 rounded-full text-white text-xs font-semibold tracking-wider transition-opacity hover:opacity-90 shadow-md cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Lihat Semua Foto ({config.galeri.fotoList.length})
              </button>
            </section>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* Section: Konfirmasi Kehadiran (RSVP)                                   */}
          {/* --------------------------------------------------------------------- */}
          {config.rsvp.enabled && (
            <section 
              id="rsvp" 
              className="py-14 px-6 text-center border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p 
                className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
                style={{ color: accentColor }}
              >
                Kehadiran
              </p>
              <h2 
                className="font-serif text-3xl font-semibold mb-2"
                style={{ color: primaryColor }}
              >
                Konfirmasi Kehadiran
              </h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.rsvp.pesanCatatan}
              </p>

              <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 text-left max-w-sm mx-auto">
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
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Jumlah Tamu
                      </label>
                      <select
                        value={rsvpGuestCount}
                        onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all bg-white"
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
                            className="py-2 text-[11px] font-medium rounded-xl border transition-all cursor-pointer"
                            style={{
                              backgroundColor: rsvpStatus === status ? primaryColor : '#F8FAFC',
                              color: rsvpStatus === status ? '#FFFFFF' : '#334155',
                              borderColor: rsvpStatus === status ? primaryColor : '#E2E8F0'
                            }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={rsvpLoading}
                      className="w-full py-3 rounded-xl text-white font-medium text-xs tracking-wider transition-opacity hover:opacity-90 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Send className="w-3.5 h-3.5" style={{ color: accentColor }} />
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
            <section 
              id="doa-ucapan" 
              className="py-14 px-6 text-center border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p 
                className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
                style={{ color: accentColor }}
              >
                Buku Tamu
              </p>
              <h2 
                className="font-serif text-3xl font-semibold mb-2"
                style={{ color: primaryColor }}
              >
                Doa & Ucapan
              </h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.bukuTamu.subJudul}
              </p>

              {/* Input Form */}
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 text-left max-w-sm mx-auto mb-6">
                <form onSubmit={handleWishSubmit} className="space-y-3">
                  <div>
                    <textarea
                      required
                      maxLength={300}
                      rows={3}
                      value={wishMessage}
                      onChange={(e) => setWishMessage(e.target.value)}
                      placeholder="Tulis doa dan ucapan untuk kami..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
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
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={wishLoading || !wishMessage.trim()}
                    className="w-full py-2.5 rounded-xl text-white font-medium text-xs tracking-wider transition-opacity hover:opacity-90 shadow flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Send className="w-3.5 h-3.5" style={{ color: accentColor }} />
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
                    <div key={item.id || idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs text-xs">
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
          <section 
            id="lokasi" 
            className="py-14 px-6 text-center border-b"
            style={{ borderColor: `${accentColor}20` }}
          >
            <p 
              className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
              style={{ color: accentColor }}
            >
              Peta & Arah
            </p>
            <h2 
              className="font-serif text-3xl font-semibold mb-2"
              style={{ color: primaryColor }}
            >
              Lokasi & Navigasi
            </h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
              Silakan gunakan peta untuk memudahkan perjalanan Anda ke lokasi acara.
            </p>

            {/* Map Preview Card */}
            <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100 max-w-sm mx-auto mb-6">
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
                <h4 
                  className="font-serif font-bold text-sm"
                  style={{ color: primaryColor }}
                >
                  {config.lokasi.namaTempat}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{config.lokasi.alamatLengkap}</p>
              </div>

              <a
                href={config.lokasi.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                Buka di Google Maps
              </a>
            </div>

            {/* Informasi Tambahan (Parkir, Jamuan, Ketepatan Waktu) */}
            <div className="max-w-sm mx-auto space-y-2.5 text-left">
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Informasi Tambahan</p>
              {config.infoTambahan.map((info) => (
                <div key={info.id} className="bg-white/80 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
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
            <section 
              id="amplop-digital" 
              className="py-14 px-6 text-center border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p 
                className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
                style={{ color: accentColor }}
              >
                Tanda Kasih
              </p>
              <h2 
                className="font-serif text-3xl font-semibold mb-2"
                style={{ color: primaryColor }}
              >
                Amplop Digital
              </h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.amplopDigital.deskripsi}
              </p>

              <div className="max-w-sm mx-auto space-y-3">
                {config.amplopDigital.rekeningList.map((rek) => (
                  <div key={rek.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span 
                        className="font-bold text-xs font-serif"
                        style={{ color: primaryColor }}
                      >
                        {rek.bank}
                      </span>
                      <button
                        onClick={() => handleCopyAccount(rek.noRek)}
                        className="text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        style={{ 
                          backgroundColor: `${primaryColor}15`, 
                          color: primaryColor 
                        }}
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
          <footer 
            className="py-16 px-6 text-center relative"
            style={{ 
              background: `linear-gradient(to bottom, rgba(255,255,255,0.6), ${bgColor})` 
            }}
          >
            {visualStyle !== 'modern-clean' && (
              <BotanicalSwag className="mx-auto mb-4" />
            )}
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-4">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
            </p>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Kami yang berbahagia,</p>
            <h3 
              className={`${getTitleFontClass()} text-4xl mb-6`}
              style={{ color: primaryColor }}
            >
              {project.mempelai}
            </h3>

            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
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
