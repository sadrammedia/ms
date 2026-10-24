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
  Gift,
  ArrowRight,
  Sparkles,
  Cake,
  Video,
  Play
} from 'lucide-react';
import { WeddingProject, GuestbookEntry } from '../types/wedding';
import { submitRsvpWish, subscribeToGuestbook } from '../services/firebase';
import { 
  BotanicalCorner, 
  GoldFloralDivider, 
  ModernDivider, 
  BotanicalSwag,
  IslamicDomeHeader,
  IslamicLantern,
  BirthdayPartyBalloons,
  BirthdayCrown,
  BirthdayCakeDecor
} from './BotanicalDecorations';
import { LightboxModal } from './LightboxModal';
import { ShareModal } from './ShareModal';
import { FlipbookReader } from './FlipbookReader';
import { FloatingParticles } from './FloatingParticles';
import { getCoverGreetingBoxStyles, getPhotoFrameStyles } from '../utils/frameStyles';
import { parseVideoUrl } from '../utils/videoHelper';

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
  const category = config.kategori || project.kategori || 'pernikahan';
  const isKhitan = category === 'khitan';
  const isBirthday = category === 'ulang-tahun';
  const isWedding = category === 'pernikahan';

  const [isOpened, setIsOpened] = useState(isEmbedPreview);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [guestName, setGuestName] = useState(guestNameParam || 'Tamu Undangan');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Navigation mode: 'scroll' (vertical) or 'flipbook' (3D paper book)
  const [activeNavMode, setActiveNavMode] = useState<'scroll' | 'flipbook'>(
    config.tema?.modeNavigasi || 'scroll'
  );

  useEffect(() => {
    if (config.tema?.modeNavigasi) {
      setActiveNavMode(config.tema.modeNavigasi);
    }
  }, [config.tema?.modeNavigasi]);
  
  // Dynamic theme variables
  const primaryColor = config.tema?.warnaUtama || (isKhitan ? '#0E3B68' : isBirthday ? '#E11D48' : '#1F362D');
  const accentColor = config.tema?.warnaAksen || (isKhitan ? '#D4AF37' : isBirthday ? '#F59E0B' : '#C5A059');
  const bgColor = config.tema?.warnaLatar || (isKhitan ? '#F0F6FC' : isBirthday ? '#FFF9F9' : '#FAF7F2');
  const visualStyle = config.tema?.styleTampilan || (isKhitan ? 'islamic-arch' : isBirthday ? 'festive-birthday' : 'classic-botanical');
  const fontJudul = config.tema?.fontJudul || (isKhitan ? 'Playfair Display' : 'Great Vibes');

  // Dynamic layout & frame styling
  const coverBoxStyles = getCoverGreetingBoxStyles(config.tataLetak, primaryColor, accentColor);
  const photoFrameStyles = getPhotoFrameStyles(config.tataLetak, accentColor);

  // Helper for title typography
  const getTitleFontClass = () => {
    switch (fontJudul) {
      case 'Alex Brush': return 'font-alex';
      case 'Playfair Display': return 'font-serif font-bold';
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

  // Sync audio source & volume dynamically when config updates
  useEffect(() => {
    if (audioRef.current && config.musik?.audioUrl) {
      audioRef.current.src = config.musik.audioUrl;
      audioRef.current.volume = config.musik.volume ?? 0.7;
      if (isPlayingMusic) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [config.musik?.audioUrl, config.musik?.volume]);

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
        particleCount: 90,
        spread: 75,
        origin: { y: 0.65 },
        colors: [primaryColor, accentColor, '#FAF7F2', '#FFD700', '#F43F5E']
      });
    } catch (e) {}

    // Auto-play music if enabled
    if (config.musik.enabled && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(() => {
        setIsPlayingMusic(false);
      });
    }

    // Smooth scroll down to main content section
    setTimeout(() => {
      const targetId = activeNavMode === 'flipbook' ? 'flipbook-container' : 'profil-utama';
      const el = document.getElementById(targetId);
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
        pesan: `Konfirmasi kehadiran: ${rsvpStatus} (${rsvpGuestCount} Orang)`
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
    const startTime = '20251123T010000Z';
    const endTime = '20251123T080000Z';

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
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border border-white/40 cursor-pointer"
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
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md text-slate-700 border border-white/60 flex items-center justify-center shadow-lg hover:bg-white transition-all cursor-pointer"
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
                  className={`${getTitleFontClass()} text-xl font-normal`}
                  style={{ color: primaryColor }}
                >
                  {project.mempelai}
                </span>
                <button onClick={() => setMenuOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-6 space-y-3 font-serif text-sm">
                <a href="#hero-cover" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Sampul Undangan</a>
                <a href="#profil-utama" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">
                  {isKhitan ? 'Profil Ananda' : isBirthday ? 'Profil Bintang Pesta' : 'Tentang Kami'}
                </a>
                {isWedding && config.kisahCinta.enabled && (
                  <a href="#kisah-cinta" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">Kisah Cinta</a>
                )}
                <a href="#acara" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700 hover:opacity-80 transition-opacity">
                  {isBirthday ? 'Jadwal Pesta' : 'Rangkaian Acara'}
                </a>
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
      {/* 1. HERO COVER (Tailored for Wedding, Khitan, or Birthday)                */}
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
            className="absolute inset-0 h-[65%]"
            style={{ 
              background: `linear-gradient(to bottom, ${bgColor}FA, ${bgColor}CC, transparent)` 
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent top-[40%]" />
        </div>

        {/* --- DECORATIONS BASED ON CATEGORY & STYLE --- */}
        {isKhitan ? (
          <>
            <IslamicLantern position="left" color={accentColor} />
            <IslamicLantern position="right" color={accentColor} />
          </>
        ) : isBirthday ? (
          <>
            <BirthdayPartyBalloons position="left" />
            <BirthdayPartyBalloons position="right" />
          </>
        ) : (
          visualStyle !== 'modern-clean' && (
            <>
              <BotanicalCorner position="top-left" />
              <BotanicalCorner position="top-right" />
            </>
          )
        )}

        {/* Main invitation card container */}
        <div className="relative z-10 w-full max-w-md mx-auto pt-8 px-6 text-center flex-1 flex flex-col justify-between">
          <div className="pt-2">

            {/* --- KHITAN TOP HEADER --- */}
            {isKhitan && (
              <div className="mb-2">
                <IslamicDomeHeader color={accentColor} />
                <p 
                  className="font-serif font-bold text-sm tracking-wide uppercase text-slate-800"
                  style={{ color: primaryColor }}
                >
                  TASYAKURAN KHITAN
                </p>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-sans mt-0.5">
                  Ananda
                </div>
                <h1 
                  className="font-serif text-3xl md:text-4xl font-bold mt-1 tracking-tight"
                  style={{ color: primaryColor }}
                >
                  {config.anak?.namaPanggilan || project.mempelai}
                </h1>
              </div>
            )}

            {/* --- BIRTHDAY TOP HEADER --- */}
            {isBirthday && (
              <div className="mb-2">
                <p className="text-[11px] uppercase tracking-[0.25em] text-rose-500 font-semibold mb-1">
                  YOU'RE INVITED!
                </p>
                <div className="inline-flex items-center justify-center gap-1.5 my-1">
                  <BirthdayCrown className="w-6 h-5" color={accentColor} />
                  <span className="font-script text-4xl text-rose-500 font-bold drop-shadow-xs">
                    Birthday Party
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-sans">
                  Join us to celebrate
                </p>
                <h1 
                  className="text-2xl md:text-3xl font-bold text-slate-900 mt-0.5"
                >
                  <span style={{ color: primaryColor }}>{config.ulangTahun?.namaPanggilan || project.mempelai}</span>{' '}
                  <span className="text-rose-500 font-medium">is turning {config.ulangTahun?.usiaKe || '10'}!</span>
                </h1>
              </div>
            )}

            {/* --- WEDDING TOP HEADER --- */}
            {isWedding && (
              <div>
                <p 
                  className="text-[11px] md:text-xs uppercase tracking-[0.25em] font-medium mb-2"
                  style={{ color: primaryColor }}
                >
                  {config.labelSampul || 'THE WEDDING OF'}
                </p>

                <h1 
                  className={`${getTitleFontClass()} text-5xl md:text-6xl mb-1 font-normal tracking-wide drop-shadow-xs`}
                  style={{ color: primaryColor }}
                >
                  {project.mempelai}
                </h1>

                {visualStyle === 'modern-clean' ? (
                  <ModernDivider className="my-2" color={primaryColor} />
                ) : (
                  <GoldFloralDivider className="my-2" color={accentColor} />
                )}
              </div>
            )}

            {/* Subtitle invitation quote */}
            <p className="text-xs md:text-sm text-slate-700 max-w-xs mx-auto leading-relaxed mt-2 font-serif">
              {config.subJudulSampul}
            </p>

            {/* --- CENTRAL PHOTO FOR KHITAN OR BIRTHDAY --- */}
            {isKhitan && (
              <div className="my-4 relative max-w-[190px] mx-auto">
                <div 
                  className="w-40 h-44 mx-auto rounded-t-[50px] rounded-b-2xl border-2 p-1.5 shadow-md overflow-hidden bg-white/95"
                  style={{ borderColor: accentColor }}
                >
                  <img 
                    src={config.anak?.foto || config.fotoSampul} 
                    alt={project.mempelai} 
                    className="w-full h-full object-cover rounded-t-[44px] rounded-b-xl"
                  />
                </div>
              </div>
            )}

            {isBirthday && (
              <div className="my-4 relative w-32 h-32 mx-auto">
                <div 
                  className="w-32 h-32 rounded-full border-3 p-1 shadow-md overflow-hidden bg-white/95"
                  style={{ borderColor: accentColor }}
                >
                  <img 
                    src={config.ulangTahun?.foto || config.fotoSampul} 
                    alt={project.mempelai} 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -top-2 -right-1 bg-white p-1 rounded-full shadow-md">
                  <BirthdayCrown className="w-5 h-5" color={accentColor} />
                </div>
              </div>
            )}

            {/* --- DATE CARD / STACK --- */}
            {isWedding ? (
              <div className="my-4 inline-flex flex-col items-center justify-center px-6 py-1.5">
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
            ) : (
              /* DUAL CARD FOR KHITAN & BIRTHDAY (Matching Mockup 2 & 3) */
              <div 
                className="my-3.5 grid grid-cols-2 gap-2 bg-white/90 backdrop-blur-md rounded-2xl p-2.5 max-w-xs mx-auto border shadow-xs"
                style={{ borderColor: `${accentColor}40` }}
              >
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-sans uppercase tracking-wider block">Hari / Tanggal</span>
                  <span className="font-serif font-bold text-xs text-slate-900 block mt-0.5">{config.hariTanggalLengkap}</span>
                </div>
                <div className="text-center border-l border-slate-200 pl-2">
                  <span className="text-[10px] text-slate-500 font-sans uppercase tracking-wider block">Pukul / Waktu</span>
                  <span className="font-serif font-bold text-xs text-slate-900 block mt-0.5">{config.acaraList[0]?.waktu || '10.00 WIB - Selesai'}</span>
                </div>
              </div>
            )}

            {/* Venue snippet */}
            <div className="text-xs text-slate-700 font-serif mb-3">
              <p className="font-semibold text-slate-900 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>{config.lokasi.namaTempat}</span>
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">{config.lokasi.alamatLengkap}</p>
            </div>

            {/* Guest Greeting & CTA Button Container (Adjustable position & vertical offset) */}
            <div 
              className="w-full flex flex-col items-center"
              style={coverBoxStyles.wrapperStyle}
            >
              {/* Guest Greeting Card */}
              <div 
                className={coverBoxStyles.cardClass}
                style={coverBoxStyles.cardStyle}
              >
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                <h2 
                  className="text-sm font-semibold mt-0.5 font-serif"
                  style={{ color: primaryColor }}
                >
                  {guestName}
                </h2>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleOpenInvitation}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-medium text-xs md:text-sm tracking-wide shadow-xl transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <span>{config.teksTombol || (isKhitan ? 'Konfirmasi Kehadiran' : isBirthday ? 'RSVP Sekarang' : 'Buka Undangan')}</span>
                <ArrowRight 
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                  style={{ color: accentColor }}
                />
              </button>
            </div>
          </div>

          {/* Bottom couple scenic area & interactive scroll prompt */}
          <button
            type="button"
            onClick={handleOpenInvitation}
            className="pb-7 pt-5 text-center text-white/95 w-full flex flex-col items-center justify-center gap-1 group cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
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
      {activeNavMode === 'flipbook' ? (
        <div id="flipbook-container" className={`transition-opacity duration-700 ${isOpened ? 'opacity-100 block' : 'hidden opacity-0'}`}>
          <FlipbookReader
            project={project}
            guestName={guestName}
            wishesList={wishesList}
            onOpenLightbox={(idx) => {
              setLightboxIndex(idx);
              setLightboxOpen(true);
            }}
            onOpenShareModal={() => setShareModalOpen(true)}
            onSwitchToScrollMode={() => setActiveNavMode('scroll')}
          />
        </div>
      ) : (
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
            className={`${getTitleFontClass()} text-xl tracking-wide`}
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
          {/* Section: Profil Utama (Tentang Mempelai / Ananda / Bintang Ultah)     */}
          {/* --------------------------------------------------------------------- */}
          <section 
            id="profil-utama" 
            className="relative py-12 px-6 text-center border-b overflow-hidden"
            style={{ borderColor: `${accentColor}20` }}
          >
            {isWedding && visualStyle !== 'modern-clean' && (
              <BotanicalCorner position="top-right" className="opacity-35" />
            )}

            {isKhitan ? (
              /* KHITAN PROFILE */
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
                  WALIMATUL KHITAN
                </p>
                <h2 className="font-serif text-3xl font-semibold mb-3" style={{ color: primaryColor }}>
                  Profil Ananda
                </h2>
                <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                  {config.kutipanAwal}
                </p>

                <div className="flex flex-col items-center max-w-sm mx-auto mb-6">
                  <div 
                    className="relative w-36 h-40 rounded-t-[45px] rounded-b-2xl p-1.5 border-2 shadow-md mb-3 overflow-hidden bg-white"
                    style={{ borderColor: accentColor }}
                  >
                    <img
                      src={config.anak?.foto || config.fotoSampul}
                      alt={config.anak?.namaLengkap || project.mempelai}
                      className="w-full h-full rounded-t-[40px] rounded-b-xl object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-serif font-bold text-base" style={{ color: primaryColor }}>
                    {config.anak?.namaLengkap || project.mempelai}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Putra tercinta dari <br />
                    <span className="font-medium text-slate-800">{config.anak?.namaAyah || config.pria.namaAyah}</span> <br />
                    & <span className="font-medium text-slate-800">{config.anak?.namaIbu || config.pria.namaIbu}</span>
                  </p>
                </div>

                {/* Doa Khitan Card */}
                <div 
                  className="bg-white/90 p-4 rounded-2xl border text-left text-xs text-slate-700 font-serif leading-relaxed shadow-xs"
                  style={{ borderColor: `${accentColor}30` }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1.5" style={{ color: primaryColor }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>Doa Walimatul Khitan</span>
                  </div>
                  <p className="italic">
                    "{config.anak?.doaKhitan || config.kutipanAkhir}"
                  </p>
                </div>
              </div>
            ) : isBirthday ? (
              /* BIRTHDAY PROFILE */
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1 text-rose-500">
                  THE BIRTHDAY STAR
                </p>
                <h2 className="font-serif text-3xl font-semibold mb-3" style={{ color: primaryColor }}>
                  Profil {config.ulangTahun?.namaPanggilan || project.mempelai}
                </h2>
                <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                  {config.kutipanAwal}
                </p>

                <div className="flex flex-col items-center max-w-sm mx-auto mb-6">
                  <div 
                    className="relative w-36 h-36 rounded-full p-1.5 border-3 shadow-md mb-3 overflow-hidden bg-white"
                    style={{ borderColor: accentColor }}
                  >
                    <img
                      src={config.ulangTahun?.foto || config.fotoSampul}
                      alt={config.ulangTahun?.namaLengkap || project.mempelai}
                      className="w-full h-full rounded-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {config.ulangTahun?.namaLengkap || project.mempelai}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white mt-1 shadow-xs" style={{ backgroundColor: primaryColor }}>
                    Merayakan Ulang Tahun ke-{config.ulangTahun?.usiaKe || '10'}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">
                    Putri/Putra dari <span className="font-medium text-slate-800">{config.ulangTahun?.namaOrtu || 'Bapak & Ibu Tercinta'}</span>
                  </p>
                </div>

                <div 
                  className="bg-white/90 p-4 rounded-2xl border text-center text-xs text-slate-700 font-serif leading-relaxed shadow-xs"
                  style={{ borderColor: `${accentColor}30` }}
                >
                  <p className="italic">
                    "{config.kutipanAkhir}"
                  </p>
                </div>
              </div>
            ) : (
              /* WEDDING PROFILE (Side-by-Side Groom & Bride) */
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
                  Pasangan Mempelai
                </p>
                <h2 className="font-serif text-3xl font-semibold mb-3" style={{ color: primaryColor }}>
                  Tentang Kami
                </h2>
                <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-8">
                  {config.kutipanAwal}
                </p>

                <div className="grid grid-cols-2 gap-4 items-start mb-8">
                  {/* Groom */}
                  <div className="flex flex-col items-center">
                    <div 
                      className={photoFrameStyles.containerClass}
                      style={photoFrameStyles.containerStyle}
                    >
                      <img
                        src={config.pria.foto}
                        alt={config.pria.namaLengkap}
                        className={photoFrameStyles.imgClass}
                        style={photoFrameStyles.imgStyle}
                      />
                      {photoFrameStyles.isPolaroid && (
                        <span className="block text-[10px] font-serif text-slate-700 mt-1 truncate max-w-full text-center font-medium">
                          {config.pria.namaPanggilan}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-sm" style={{ color: primaryColor }}>
                      {config.pria.namaLengkap}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Putra dari <br />
                      <span className="font-medium text-slate-700">{config.pria.namaAyah}</span> <br />
                      & <span className="font-medium text-slate-700">{config.pria.namaIbu}</span>
                    </p>
                    {config.pria.instagram && (
                      <span className="text-[10px] font-medium mt-1" style={{ color: accentColor }}>
                        {config.pria.instagram}
                      </span>
                    )}
                  </div>

                  {/* Bride */}
                  <div className="flex flex-col items-center">
                    <div 
                      className={photoFrameStyles.containerClass}
                      style={photoFrameStyles.containerStyle}
                    >
                      <img
                        src={config.wanita.foto}
                        alt={config.wanita.namaLengkap}
                        className={photoFrameStyles.imgClass}
                        style={photoFrameStyles.imgStyle}
                      />
                      {photoFrameStyles.isPolaroid && (
                        <span className="block text-[10px] font-serif text-slate-700 mt-1 truncate max-w-full text-center font-medium">
                          {config.wanita.namaPanggilan}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-sm" style={{ color: primaryColor }}>
                      {config.wanita.namaLengkap}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Putri dari <br />
                      <span className="font-medium text-slate-700">{config.wanita.namaAyah}</span> <br />
                      & <span className="font-medium text-slate-700">{config.wanita.namaIbu}</span>
                    </p>
                    {config.wanita.instagram && (
                      <span className="text-[10px] font-medium mt-1" style={{ color: accentColor }}>
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
                
                <p className="italic font-serif text-xs text-slate-600 max-w-xs mx-auto">
                  {config.kutipanAkhir}
                </p>
              </div>
            )}
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* Section: Kisah Cinta (Hanya untuk Undangan Pernikahan)                 */}
          {/* --------------------------------------------------------------------- */}
          {isWedding && config.kisahCinta.enabled && config.kisahCinta.ceritaList.length > 0 && (
            <section 
              id="kisah-cinta" 
              className="py-12 px-6 border-b text-center"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
                Perjalanan Cinta
              </p>
              <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: primaryColor }}>
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
            className="py-12 px-6 text-center border-b relative"
            style={{ borderColor: `${accentColor}20` }}
          >
            {isWedding && visualStyle !== 'modern-clean' && (
              <BotanicalCorner position="bottom-left" className="opacity-25" />
            )}
            <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
              Waktu & Tempat
            </p>
            <h2 className="font-serif text-3xl font-semibold mb-2" style={{ color: primaryColor }}>
              {isBirthday ? 'Jadwal Pesta' : isKhitan ? 'Rangkaian Tasyakuran' : 'Rangkaian Acara'}
            </h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
              {isBirthday 
                ? 'Yuk hadir tepat waktu agar tidak ketinggalan games seru dan sesi tiup lilin!'
                : 'Kami mengundang Anda untuk hadir dan menjadi bagian dari hari istimewa kami.'}
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

            {/* Event Timeline Cards */}
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
                    {isBirthday ? (
                      <Cake className="w-5 h-5" />
                    ) : evt.judul.toLowerCase().includes('akad') || evt.judul.toLowerCase().includes('doa') ? (
                      <Calendar className="w-5 h-5" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-base" style={{ color: primaryColor }}>
                      {evt.judul}
                    </h4>
                    <p className="text-xs text-slate-700 font-medium mt-1">{evt.hariTanggal}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" style={{ color: accentColor }} />
                      {evt.waktu}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-serif">{evt.tempat}</p>
                    {evt.deskripsi && (
                      <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">{evt.deskripsi}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isWedding && visualStyle !== 'modern-clean' && (
              <BotanicalSwag className="mx-auto mt-6" />
            )}
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* Section: Galeri Foto & Video                                          */}
          {/* --------------------------------------------------------------------- */}
          {config.galeri.enabled && (
            <section 
              id="galeri" 
              className="py-12 px-6 text-center border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
                Momen Bahagia
              </p>
              <h2 className="font-serif text-3xl font-semibold mb-2" style={{ color: primaryColor }}>
                Galeri & Video
              </h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.galeri.deskripsi}
              </p>

              {/* Video Teaser / Sinematik Player (Jika diaktifkan) */}
              {config.galeri.videoEnabled && config.galeri.videoUrl && (() => {
                const videoData = parseVideoUrl(config.galeri.videoUrl);
                if (!videoData.isValid) return null;
                return (
                  <div 
                    className="mb-8 p-3 sm:p-4 bg-white/95 rounded-3xl border shadow-md text-left transition-all"
                    style={{ borderColor: `${accentColor}40` }}
                  >
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs shrink-0" 
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Video className="w-4 h-4 text-amber-200" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {config.galeri.videoJudul || 'Video Teaser Momen Spesial'}
                        </h4>
                        {config.galeri.videoDeskripsi ? (
                          <p className="text-[10px] text-slate-500 line-clamp-1">{config.galeri.videoDeskripsi}</p>
                        ) : (
                          <p className="text-[10px] text-slate-400">Putar video kenangan indah di bawah ini</p>
                        )}
                      </div>
                    </div>

                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner border border-slate-200/80">
                      {videoData.type === 'direct' ? (
                        <video 
                          src={videoData.embedUrl} 
                          controls 
                          playsInline 
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <iframe
                          src={videoData.embedUrl}
                          title={config.galeri.videoJudul || 'Video Undangan'}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </div>
                );
              })()}

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
              className="py-12 px-6 text-center border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
                Kehadiran
              </p>
              <h2 className="font-serif text-3xl font-semibold mb-2" style={{ color: primaryColor }}>
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
              className="py-12 px-6 text-center border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
                Buku Tamu
              </p>
              <h2 className="font-serif text-3xl font-semibold mb-2" style={{ color: primaryColor }}>
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
                      placeholder={isBirthday ? 'Tuliskan ucapan selamat ulang tahun untuk Dinda...' : isKhitan ? 'Tuliskan doa restu untuk ananda Rafi...' : 'Tuliskan doa dan ucapan untuk kedua mempelai...'}
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
                    <span>{wishLoading ? 'Mengirim...' : 'Kirim Ucapan'}</span>
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
            className="py-12 px-6 text-center border-b"
            style={{ borderColor: `${accentColor}20` }}
          >
            <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
              Peta & Arah
            </p>
            <h2 className="font-serif text-3xl font-semibold mb-2" style={{ color: primaryColor }}>
              Lokasi & Navigasi
            </h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
              Silakan gunakan peta untuk memudahkan perjalanan Anda ke lokasi acara.
            </p>

            {/* Map Preview Card */}
            {(() => {
              const locationQuery = [config.lokasi?.namaTempat, config.lokasi?.alamatLengkap]
                .filter(Boolean)
                .join(' ')
                .trim() || config.acaraList?.[0]?.tempat || '';

              const isOldBandungTemplate = config.lokasi?.embedMapsUrl && (
                config.lokasi.embedMapsUrl.includes('Bandung%2C%20Bandung') ||
                config.lokasi.embedMapsUrl.includes('0x2e68e6398252477f')
              );

              const shouldGenerateDynamicEmbed = !config.lokasi?.embedMapsUrl || (isOldBandungTemplate && locationQuery && !locationQuery.toLowerCase().includes('bandung'));

              const effectiveEmbedUrl = shouldGenerateDynamicEmbed && locationQuery
                ? `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                : (config.lokasi?.embedMapsUrl || (locationQuery ? `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : ''));

              const directMapsLink = config.lokasi?.googleMapsUrl || (locationQuery ? `https://maps.google.com/?q=${encodeURIComponent(locationQuery)}` : '#');

              return (
                <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100 max-w-sm mx-auto mb-6">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100 relative">
                    {effectiveEmbedUrl ? (
                      <iframe
                        src={effectiveEmbedUrl}
                        title="Peta Lokasi"
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-emerald-50/50">
                        <MapPin className="w-8 h-8 text-rose-500 mb-1 animate-bounce" />
                        <span className="font-serif font-bold text-xs text-slate-800">{config.lokasi?.namaTempat || 'Lokasi Acara'}</span>
                        <span className="text-[10px] text-slate-500 text-center">{config.lokasi?.alamatLengkap}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-3">
                    <h4 className="font-serif font-bold text-sm" style={{ color: primaryColor }}>
                      {config.lokasi?.namaTempat || config.acaraList?.[0]?.tempat || 'Lokasi Acara'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{config.lokasi?.alamatLengkap || config.acaraList?.[0]?.alamat}</p>
                  </div>

                  <a
                    href={directMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    Buka di Google Maps
                  </a>
                </div>
              );
            })()}

            {/* Informasi Tambahan */}
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
          {/* Section: Tanda Kasih / Amplop Digital / Kado                          */}
          {/* --------------------------------------------------------------------- */}
          {config.amplopDigital.enabled && (
            <section 
              id="amplop-digital" 
              className="py-12 px-6 text-center border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-medium mb-1" style={{ color: accentColor }}>
                {isBirthday ? 'Hadiah & Wishlist' : 'Tanda Kasih'}
              </p>
              <h2 className="font-serif text-3xl font-semibold mb-2" style={{ color: primaryColor }}>
                {isBirthday ? 'Kado Ulang Tahun' : isKhitan ? 'Kado Khitanan' : 'Amplop Digital'}
              </h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-6">
                {config.amplopDigital.deskripsi}
              </p>

              <div className="max-w-sm mx-auto space-y-3">
                {config.amplopDigital.rekeningList.map((rek) => (
                  <div key={rek.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs font-serif" style={{ color: primaryColor }}>
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
            {isWedding && visualStyle !== 'modern-clean' && (
              <BotanicalSwag className="mx-auto mb-4" />
            )}

            <p className="text-xs text-slate-600 max-w-xs mx-auto font-serif leading-relaxed mb-4">
              {isBirthday 
                ? 'Kehadiran teman-teman dan keluarga adalah kebahagiaan terbesar bagi kami. Sampai jumpa di hari perayaan!'
                : 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.'}
            </p>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
              {isBirthday ? 'Salam Ceria,' : 'Kami yang berbahagia,'}
            </p>
            <h3 
              className={`${getTitleFontClass()} text-3xl md:text-4xl mb-6`}
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
      )}

      {/* Floating Mode Switcher Button (Allows guests to switch between Flipbook and Scroll mode freely) */}
      {isOpened && (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={() => setActiveNavMode(prev => prev === 'flipbook' ? 'scroll' : 'flipbook')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200/90 shadow-lg hover:bg-white text-xs font-semibold transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Ganti mode membaca undangan"
          >
            {activeNavMode === 'flipbook' ? (
              <>
                <span>📜 Mode Gulir Vertikal</span>
              </>
            ) : (
              <>
                <span>📖 Buka Mode Buku 3D</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Ambient Floating Particles */}
      <FloatingParticles 
        type={config.tema?.efekPartikel || 'none'} 
        color={accentColor} 
      />

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
