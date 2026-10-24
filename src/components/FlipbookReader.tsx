import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Share2, 
  Volume2, 
  VolumeX, 
  Sparkles,
  BookOpen,
  ArrowRight,
  Cake,
  ExternalLink,
  Video
} from 'lucide-react';
import { WeddingProject, GuestbookEntry } from '../types/wedding';
import { submitRsvpWish } from '../services/firebase';
import { 
  BotanicalCorner, 
  DynamicDivider,
  GoldFloralDivider, 
  ModernDivider, 
  BotanicalSwag,
  IslamicDomeHeader,
  IslamicLantern,
  BirthdayPartyBalloons,
  BirthdayCrown
} from './BotanicalDecorations';
import { playRealisticPaperSound } from '../utils/audioEffects';
import { getPhotoFrameStyles } from '../utils/frameStyles';
import { parseVideoUrl } from '../utils/videoHelper';

interface FlipbookReaderProps {
  project: WeddingProject;
  guestName: string;
  wishesList: GuestbookEntry[];
  onOpenLightbox: (index: number) => void;
  onOpenShareModal: () => void;
  onSwitchToScrollMode?: () => void;
}

export const FlipbookReader: React.FC<FlipbookReaderProps> = ({
  project,
  guestName,
  wishesList,
  onOpenLightbox,
  onOpenShareModal,
  onSwitchToScrollMode
}) => {
  const config = project.config;
  const category = config.kategori || project.kategori || 'pernikahan';
  const isKhitan = category === 'khitan';
  const isBirthday = category === 'ulang-tahun';
  const isWedding = category === 'pernikahan';

  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');
  const [soundEnabled, setSoundEnabled] = useState(config.tema?.suaraKertas ?? true);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // RSVP state inside flipbook
  const [rsvpName, setRsvpName] = useState(guestName === 'Tamu Undangan' ? '' : guestName);
  const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Mungkin'>('Hadir');
  const [rsvpGuestCount, setRsvpGuestCount] = useState<number>(1);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Wish state
  const [wishName, setWishName] = useState(guestName === 'Tamu Undangan' ? '' : guestName);
  const [wishMessage, setWishMessage] = useState('');
  const [wishLoading, setWishLoading] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(config.tanggalCountdownIso || config.tanggalResmi).getTime();
    if (isNaN(targetDate)) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config.tanggalCountdownIso, config.tanggalResmi]);

  // Total pages
  const totalPages = 6;

  // Theme styling
  const primaryColor = config.tema?.warnaUtama || (isKhitan ? '#0E3B68' : isBirthday ? '#E11D48' : '#1F362D');
  const accentColor = config.tema?.warnaAksen || (isKhitan ? '#D4AF37' : isBirthday ? '#F59E0B' : '#C5A059');
  const bgColor = config.tema?.warnaLatar || (isKhitan ? '#F0F6FC' : isBirthday ? '#FFF9F9' : '#FAF7F2');
  const paperTexture = config.tema?.teksturKertas || 'vintage-parchment';
  const visualStyle = config.tema?.styleTampilan || (isKhitan ? 'islamic-arch' : isBirthday ? 'festive-birthday' : 'classic-botanical');
  const fontJudul = config.tema?.fontJudul || (isKhitan ? 'Playfair Display' : 'Great Vibes');

  // Photo frame styling for profile pictures
  const photoFrameStyles = getPhotoFrameStyles(config.tataLetak, accentColor);

  const getTitleFontClass = () => {
    switch (fontJudul) {
      case 'Alex Brush': return 'font-alex';
      case 'Playfair Display': return 'font-serif font-bold';
      case 'Cinzel': return 'font-cinzel tracking-wider';
      case 'Cormorant Garamond': return 'font-garamond';
      case 'Montserrat': return 'font-montserrat font-bold tracking-wider';
      case 'Marcellus': return 'font-marcellus tracking-wide';
      case 'Plus Jakarta Sans': return 'font-sans font-bold';
      default: return 'font-script';
    }
  };

  const getSectionTitleFontClass = () => {
    const font = config.tema?.fontJudulSection || config.tema?.fontJudul || 'Playfair Display';
    switch (font) {
      case 'Alex Brush': return 'font-alex';
      case 'Great Vibes': return 'font-script';
      case 'Cinzel': return 'font-cinzel tracking-wider';
      case 'Cormorant Garamond': return 'font-garamond font-semibold';
      case 'Montserrat': return 'font-montserrat font-bold tracking-wide uppercase';
      case 'Marcellus': return 'font-marcellus tracking-wide';
      case 'Plus Jakarta Sans': return 'font-sans font-bold';
      case 'Playfair Display':
      default: return 'font-serif font-semibold';
    }
  };

  const getProfileNameFontClass = () => {
    const font = config.tema?.fontNamaProfil || 'Playfair Display';
    switch (font) {
      case 'Alex Brush': return 'font-alex text-base';
      case 'Great Vibes': return 'font-script text-lg';
      case 'Cinzel': return 'font-cinzel tracking-wider';
      case 'Cormorant Garamond': return 'font-garamond';
      case 'Montserrat': return 'font-montserrat';
      case 'Marcellus': return 'font-marcellus';
      case 'Plus Jakarta Sans': return 'font-sans';
      case 'Playfair Display':
      default: return 'font-serif';
    }
  };

  // Turn page handler with sound & animation lock
  const goToPage = (nextIdx: number, dir: 'forward' | 'backward') => {
    if (isFlipping || nextIdx < 0 || nextIdx >= totalPages) return;
    setIsFlipping(true);
    setFlipDirection(dir);

    if (soundEnabled) {
      playRealisticPaperSound(0.4);
    }

    setTimeout(() => {
      setCurrentPage(nextIdx);
      setIsFlipping(false);
    }, 450);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      goToPage(currentPage + 1, 'forward');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1, 'backward');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isFlipping]);

  // Touch Swipe Handling on the book surface
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    // Ensure horizontal swipe is dominant and significant
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
  };

  const handleCopyAccount = (noRek: string) => {
    navigator.clipboard.writeText(noRek);
    setCopiedAccount(noRek);
    setTimeout(() => setCopiedAccount(null), 2500);
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

  // Determine paper background texture class
  const getTextureStyle = () => {
    switch (paperTexture) {
      case 'vintage-parchment':
        return {
          backgroundColor: '#FAF5EE',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(245,236,220,0.85) 100%),
            linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 20px 20px, 20px 20px'
        };
      case 'linen':
        return {
          backgroundColor: '#F8F6F0',
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 3px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 3px)
          `
        };
      case 'watercolor-matte':
        return {
          backgroundColor: '#FAF7F2',
          backgroundImage: `radial-gradient(ellipse at top left, rgba(255,255,255,0.9), transparent 60%), radial-gradient(ellipse at bottom right, rgba(210,195,175,0.18), transparent 60%)`
        };
      default:
        return {
          backgroundColor: bgColor
        };
    }
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center py-6 px-3 sm:px-6 select-none overflow-x-hidden">
      
      {/* Top Floating Mini Bar for Guest Comfort */}
      <div className="w-full max-w-md sm:max-w-lg mb-3 flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/70 shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span className="font-serif font-medium">Buku Undangan Fisik</span>
          <span className="text-slate-400">·</span>
          <span className="font-semibold" style={{ color: primaryColor }}>
            Halaman {currentPage + 1} dari {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound FX Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition-colors cursor-pointer"
            title={soundEnabled ? 'Efek Suara Desau Kertas: Aktif' : 'Efek Suara Desau Kertas: Bisu'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Switch to Scroll Mode Button */}
          {onSwitchToScrollMode && (
            <button
              onClick={onSwitchToScrollMode}
              className="text-[11px] px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-white shadow-xs font-medium transition-all cursor-pointer flex items-center gap-1"
              title="Ganti ke mode gulir vertikal konvensional"
            >
              <span>Mode Scroll 📜</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3D BOOK CASING & PAGES CONTAINER                                          */}
      {/* ========================================================================= */}
      <div 
        className="w-full max-w-md sm:max-w-lg relative transition-all"
        style={{ perspective: '1600px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Book Outer Binder Shadow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-stone-400/40 via-stone-300/20 to-stone-400/40 rounded-3xl blur-md -z-10" />

        {/* The Physical Paper Leaf Card */}
        <div 
          className={`relative rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden min-h-[580px] sm:min-h-[640px] flex flex-col justify-between transition-transform duration-500 ease-out ${
            isFlipping 
              ? flipDirection === 'forward' 
                ? 'scale-[0.98] -rotate-1 shadow-lg' 
                : 'scale-[0.98] rotate-1 shadow-lg' 
              : 'scale-100 rotate-0'
          }`}
          style={{
            ...getTextureStyle(),
            boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.22), inset 0 0 40px rgba(0, 0, 0, 0.03)'
          }}
        >
          {/* Left Spine Crease Simulation (Bayangan Punggung Buku Realistis) */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 pointer-events-none z-20"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 25%, rgba(255,255,255,0.45) 55%, transparent 100%)'
            }}
          />

          {/* Right Page Edge Gradient (Efek Tepi Kertas Buku Tebal) */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-3 pointer-events-none z-20"
            style={{
              background: 'linear-gradient(270deg, rgba(0,0,0,0.08) 0%, transparent 100%)'
            }}
          />

          {/* Corner Dog-Ear / Curled Paper Edge Flip Prompt (Pojok Kertas Terlipat) */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={handleNextPage}
              className="absolute bottom-0 right-0 z-30 w-12 h-12 overflow-hidden group cursor-pointer focus:outline-none"
              title="Balik ke lembar berikutnya"
            >
              <div 
                className="absolute bottom-0 right-0 w-10 h-10 transition-transform group-hover:scale-125"
                style={{
                  background: `linear-gradient(135deg, transparent 50%, ${accentColor} 50%)`,
                  filter: 'drop-shadow(-2px -2px 3px rgba(0,0,0,0.2))'
                }}
              />
              <span className="absolute bottom-1 right-1 text-[9px] text-white font-bold tracking-tighter">❯</span>
            </button>
          )}

          {/* PAGE CONTENT CONTAINER */}
          <div className="relative z-10 p-5 sm:p-7 flex-1 flex flex-col justify-between pl-8 sm:pl-10">

            {/* =================================================================== */}
            {/* LEMBAR 1: COVER / SALAM PEMBUKA & HITUNG MUNDUR                    */}
            {/* =================================================================== */}
            {currentPage === 0 && (
              <div className="animate-fade-in flex flex-col items-center justify-between h-full text-center py-2">
                <div>
                  {isKhitan ? (
                    <IslamicDomeHeader className="mx-auto mb-2 text-[#0E3B68]" />
                  ) : isBirthday ? (
                    <BirthdayCrown className="mx-auto mb-2 text-rose-500" />
                  ) : (
                    <DynamicDivider 
                      gayaPemisah={config.ornamenConfig?.gayaPemisah} 
                      color={accentColor} 
                      className="mx-auto mb-2" 
                    />
                  )}

                  <span className="text-[10px] tracking-[0.25em] font-sans uppercase text-slate-500 font-semibold">
                    {config.labelSampul || (isKhitan ? 'TASYAKURAN KHITAN' : isBirthday ? "YOU'RE INVITED" : 'THE WEDDING OF')}
                  </span>

                  <h1 
                    className={`${getTitleFontClass()} text-3xl sm:text-4xl my-2 leading-tight`}
                    style={{ color: primaryColor }}
                  >
                    {project.mempelai}
                  </h1>

                  <p className="text-xs text-slate-500 font-serif max-w-xs mx-auto mb-4 italic">
                    "{config.kutipanAwal || 'Dan di antara tanda-tanda kebesaran-Nya diciptakan-Nya untukmu pasangan hidup agar kamu merasa tentram.'}"
                  </p>
                </div>

                {/* Cover Main Photo */}
                <div className="relative my-2">
                  <div 
                    className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden mx-auto shadow-lg border-4"
                    style={{ borderColor: accentColor }}
                  >
                    <img 
                      src={config.fotoSampul} 
                      alt={project.mempelai} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>

                {/* Date & Countdown */}
                <div className="w-full mt-3">
                  <p className="text-xs font-serif font-bold text-slate-800 tracking-wide uppercase mb-2">
                    {config.hariTanggalLengkap || config.tanggalResmi}
                  </p>

                  <div className="flex justify-center gap-2 mb-4">
                    {[
                      { val: timeLeft.days, label: 'Hari' },
                      { val: timeLeft.hours, label: 'Jam' },
                      { val: timeLeft.minutes, label: 'Menit' },
                      { val: timeLeft.seconds, label: 'Detik' },
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="px-2.5 py-1.5 rounded-xl bg-white/90 border border-stone-200/90 shadow-2xs text-center min-w-[50px]"
                      >
                        <span className="block text-sm font-bold font-mono" style={{ color: primaryColor }}>
                          {String(item.val).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-medium">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans italic">
                    Geser layar atau klik pojok kertas untuk membuka lembaran profil ❯
                  </p>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* LEMBAR 2: PROFIL TOKOH / MEMPELAI                                  */}
            {/* =================================================================== */}
            {currentPage === 1 && (
              <div className="animate-fade-in flex flex-col justify-between h-full py-1">
                <div className="text-center mb-3">
                  <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-slate-500 font-semibold">
                    {isKhitan ? 'Profil Ananda' : isBirthday ? 'Bintang Hari Ini' : 'Tentang Mempelai'}
                  </span>
                  <h2 
                    className={`${getTitleFontClass()} text-2xl sm:text-3xl`}
                    style={{ color: primaryColor }}
                  >
                    {isKhitan ? 'Yang Berbahagia' : isBirthday ? 'Sweet Celebration' : 'Mempelai Pengantin'}
                  </h2>
                </div>

                {/* WEDDING PROFILE: Groom & Bride */}
                {isWedding && (
                  <div className="space-y-4 my-auto">
                    {/* Groom */}
                    <div className="flex items-center gap-3 bg-white/70 p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
                      <div 
                        className="w-16 h-16 shrink-0 overflow-hidden relative shadow-xs"
                        style={{
                          borderRadius: photoFrameStyles.imgStyle.borderRadius,
                          clipPath: photoFrameStyles.imgStyle.clipPath,
                          border: `2px solid ${accentColor}`
                        }}
                      >
                        <img 
                          src={config.pria.foto} 
                          alt={config.pria.namaLengkap} 
                          className={photoFrameStyles.imgClass}
                          style={photoFrameStyles.imgStyle}
                        />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-sm text-slate-900 truncate">
                          {config.pria.namaLengkap}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Putra dari Bpk. {config.pria.namaAyah} & Ibu {config.pria.namaIbu}
                        </p>
                        {config.pria.instagram && (
                          <span className="text-[10px] text-amber-700 font-medium">
                            @{config.pria.instagram}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <span className={`${getTitleFontClass()} text-2xl text-amber-700 font-serif`}>&</span>
                    </div>

                    {/* Bride */}
                    <div className="flex items-center gap-3 bg-white/70 p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
                      <div 
                        className="w-16 h-16 shrink-0 overflow-hidden relative shadow-xs"
                        style={{
                          borderRadius: photoFrameStyles.imgStyle.borderRadius,
                          clipPath: photoFrameStyles.imgStyle.clipPath,
                          border: `2px solid ${accentColor}`
                        }}
                      >
                        <img 
                          src={config.wanita.foto} 
                          alt={config.wanita.namaLengkap} 
                          className={photoFrameStyles.imgClass}
                          style={photoFrameStyles.imgStyle}
                        />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-sm text-slate-900 truncate">
                          {config.wanita.namaLengkap}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Putri dari Bpk. {config.wanita.namaAyah} & Ibu {config.wanita.namaIbu}
                        </p>
                        {config.wanita.instagram && (
                          <span className="text-[10px] text-amber-700 font-medium">
                            @{config.wanita.instagram}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* KHITAN PROFILE */}
                {isKhitan && (
                  <div className="text-center my-auto bg-white/75 p-5 rounded-2xl border border-blue-100 shadow-2xs space-y-3">
                    <img 
                      src={config.anak?.foto || config.fotoSampul} 
                      alt="Ananda Khitan" 
                      className="w-24 h-24 rounded-full mx-auto object-cover border-3 shadow-md"
                      style={{ borderColor: accentColor }}
                    />
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-900">
                        {config.anak?.namaLengkap || project.mempelai}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Putra tercinta dari Bpk. {config.anak?.namaAyah} & Ibu {config.anak?.namaIbu}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 italic bg-amber-50/70 p-3 rounded-xl border border-amber-200/50">
                      "{config.anak?.doaKhitan || 'Semoga menjadi anak yang sholeh, berbakti kepada orang tua, cerdas, dan berguna bagi nusa, bangsa, serta agama.'}"
                    </p>
                  </div>
                )}

                {/* BIRTHDAY PROFILE */}
                {isBirthday && (
                  <div className="text-center my-auto bg-white/75 p-5 rounded-2xl border border-rose-100 shadow-2xs space-y-3">
                    <img 
                      src={config.ulangTahun?.foto || config.fotoSampul} 
                      alt="Birthday Child" 
                      className="w-24 h-24 rounded-full mx-auto object-cover border-3 shadow-md"
                      style={{ borderColor: accentColor }}
                    />
                    <div>
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        {config.ulangTahun?.namaLengkap || project.mempelai}
                      </h3>
                      <p className="text-xs text-rose-600 font-semibold mt-0.5">
                        Merayakan Ulang Tahun Yang Ke-{config.ulangTahun?.usiaKe || 'Spesial'}
                      </p>
                      {config.ulangTahun?.namaOrtu && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Putra/Putri dari: {config.ulangTahun.namaOrtu}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-center text-[11px] text-slate-400 font-serif pt-2 border-t border-stone-200/60">
                  Lembar Profil Pengantin · Halaman 2
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* LEMBAR 3: RANGKAIAN ACARA & LOKASI PETA                             */}
            {/* =================================================================== */}
            {currentPage === 2 && (
              <div className="animate-fade-in flex flex-col justify-between h-full py-1">
                <div className="text-center mb-2">
                  <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-slate-500 font-semibold">
                    {isBirthday ? 'Jadwal Pesta' : 'Waktu & Tempat'}
                  </span>
                  <h2 
                    className={`${getTitleFontClass()} text-2xl sm:text-3xl`}
                    style={{ color: primaryColor }}
                  >
                    {isBirthday ? 'Rangkaian Pesta' : 'Rangkaian Acara'}
                  </h2>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1 custom-scrollbar my-auto">
                  {config.acaraList.map((acara, idx) => (
                    <div 
                      key={acara.id || idx}
                      className="bg-white/80 p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1.5 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-xs uppercase tracking-wide" style={{ color: primaryColor }}>
                          {acara.judul}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                          {acara.waktu}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{acara.hariTanggal}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-800">{acara.tempat}</strong>
                          <span className="text-[10px] text-slate-500 leading-tight block">{acara.alamat}</span>
                        </div>
                      </div>

                      {(() => {
                        const directLink = acara.linkMaps || config.lokasi?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent([acara.tempat, acara.alamat].filter(Boolean).join(' '))}`;
                        return (
                          <div className="pt-1">
                            <a
                              href={directLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 hover:text-amber-800 underline"
                            >
                              <span>Buka di Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                  ))}

                  {/* Info Tambahan (Dresscode, dsb) */}
                  {config.infoTambahan && config.infoTambahan.length > 0 && (
                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 text-[10px] text-slate-600 space-y-1">
                      <span className="font-bold text-amber-900 block font-serif">Catatan Acara:</span>
                      {config.infoTambahan.map(info => (
                        <p key={info.id}>• {info.judul}: {info.deskripsi}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-slate-400 font-serif pt-2 border-t border-stone-200/60">
                  Agenda Acara · Halaman 3
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* LEMBAR 4: GALERI FOTO KENANGAN (POLAROID ALBUM)                    */}
            {/* =================================================================== */}
            {currentPage === 3 && (
              <div className="animate-fade-in flex flex-col justify-between h-full py-1">
                <div className="text-center mb-2">
                  <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-slate-500 font-semibold">
                    Album Kenangan
                  </span>
                  <h2 
                    className={`${getTitleFontClass()} text-2xl sm:text-3xl`}
                    style={{ color: primaryColor }}
                  >
                    Galeri Foto Indah
                  </h2>
                  <p className="text-[11px] text-slate-500 font-serif">
                    Sentuh foto untuk memperbesar tampilan
                  </p>
                </div>

                {/* Video Teaser Embed in Book if Enabled */}
                {config.galeri.videoEnabled && config.galeri.videoUrl && (() => {
                  const videoData = parseVideoUrl(config.galeri.videoUrl);
                  if (!videoData.isValid) return null;
                  return (
                    <div className="mb-3 p-2 bg-white rounded-xl border border-stone-200/90 shadow-2xs">
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <Video className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        <span className="font-serif font-bold text-[11px] truncate text-slate-800">
                          {config.galeri.videoJudul || 'Video Teaser Sinematik'}
                        </span>
                      </div>
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                        {videoData.type === 'direct' ? (
                          <video src={videoData.embedUrl} controls playsInline className="w-full h-full object-contain" />
                        ) : (
                          <iframe
                            src={videoData.embedUrl}
                            title="Video"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Photos Grid Styled like a Photo Scrapbook Page */}
                <div className="grid grid-cols-2 gap-2 my-auto max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                  {config.galeri.fotoList.map((foto, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onOpenLightbox(idx)}
                      className="bg-white p-1.5 pb-2 rounded-xl border border-stone-200 shadow-2xs hover:shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer group"
                      style={{
                        transform: idx % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1.2deg)'
                      }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img 
                          src={foto} 
                          alt={`Momen ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 text-center font-serif mt-1">
                        Kenangan #{idx + 1}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center text-[11px] text-slate-400 font-serif pt-2 border-t border-stone-200/60">
                  Album Kenangan · Halaman 4
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* LEMBAR 5: RSVP & BUKU DOA UCAPAN TAMU                              */}
            {/* =================================================================== */}
            {currentPage === 4 && (
              <div className="animate-fade-in flex flex-col justify-between h-full py-1">
                <div className="text-center mb-2">
                  <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-slate-500 font-semibold">
                    Kehadiran & Doa
                  </span>
                  <h2 
                    className={`${getTitleFontClass()} text-2xl sm:text-3xl`}
                    style={{ color: primaryColor }}
                  >
                    Konfirmasi & Ucapan
                  </h2>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[370px] pr-1 custom-scrollbar my-auto">
                  {/* RSVP Form Card */}
                  <form onSubmit={handleRsvpSubmit} className="bg-white/85 p-3 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2 text-left">
                    <span className="font-serif font-bold text-xs text-slate-800 block">
                      Konfirmasi Kehadiran Anda:
                    </span>

                    <input 
                      type="text"
                      placeholder="Nama Lengkap Anda"
                      value={rsvpName}
                      onChange={e => setRsvpName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/70 focus:bg-white"
                      required
                    />

                    <div className="grid grid-cols-3 gap-1">
                      {(['Hadir', 'Tidak Hadir', 'Mungkin'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setRsvpStatus(st)}
                          className={`py-1 rounded-lg text-[10px] font-medium border cursor-pointer ${
                            rsvpStatus === st 
                              ? 'bg-slate-800 text-white border-slate-800' 
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={rsvpLoading}
                      className="w-full py-1.5 rounded-xl text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {rsvpLoading ? 'Mengirim...' : 'Kirim Konfirmasi'}
                    </button>

                    {rsvpSuccess && (
                      <p className="text-[10px] text-emerald-600 font-medium text-center">
                        ✓ Terima kasih! Konfirmasi kehadiran tersimpan.
                      </p>
                    )}
                  </form>

                  {/* Wishes List Card */}
                  <div className="bg-white/70 p-3 rounded-2xl border border-stone-200/80 text-left space-y-2">
                    <span className="font-serif font-bold text-xs text-slate-800 block">
                      Kirim Doa Restu:
                    </span>
                    <form onSubmit={handleWishSubmit} className="space-y-1.5">
                      <textarea
                        rows={2}
                        placeholder="Tuliskan doa & harapan tulus Anda..."
                        value={wishMessage}
                        onChange={e => setWishMessage(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/70 focus:bg-white"
                        required
                      />
                      <button
                        type="submit"
                        disabled={wishLoading}
                        className="w-full py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-[11px] cursor-pointer"
                      >
                        {wishLoading ? 'Mengirim...' : 'Kirim Doa Restu'}
                      </button>
                    </form>

                    {/* Latest 2 wishes */}
                    {wishesList.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5 max-h-24 overflow-y-auto">
                        {wishesList.slice(0, 3).map((w, i) => (
                          <div key={w.id || i} className="text-[10px] bg-slate-50 p-1.5 rounded-lg">
                            <strong className="text-slate-800 block">{w.nama}</strong>
                            <p className="text-slate-600 italic">"{w.pesan}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center text-[11px] text-slate-400 font-serif pt-2 border-t border-stone-200/60">
                  Buku Tamu · Halaman 5
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* LEMBAR 6: AMPLOP DIGITAL & SALAM PENUTUP BUKU                      */}
            {/* =================================================================== */}
            {currentPage === 5 && (
              <div className="animate-fade-in flex flex-col justify-between h-full py-1">
                <div className="text-center mb-2">
                  <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-slate-500 font-semibold">
                    Tanda Kasih & Penutup
                  </span>
                  <h2 
                    className={`${getTitleFontClass()} text-2xl sm:text-3xl`}
                    style={{ color: primaryColor }}
                  >
                    Amplop Digital & Doa
                  </h2>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[370px] pr-1 custom-scrollbar my-auto">
                  {/* Digital Envelope Account */}
                  {config.amplopDigital.enabled && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500 font-serif text-center">
                        {config.amplopDigital.deskripsi || 'Doa restu Anda merupakan karunia terindah bagi kami. Namun bagi yang ingin memberi tanda kasih, dapat melalui:'}
                      </p>

                      {config.amplopDigital.rekeningList.map((rek) => (
                        <div key={rek.id} className="bg-white/85 p-3 rounded-2xl border border-stone-200/90 shadow-2xs text-left">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs font-serif" style={{ color: primaryColor }}>
                              {rek.bank}
                            </span>
                            <button
                              onClick={() => handleCopyAccount(rek.noRek)}
                              className="text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              style={{ 
                                backgroundColor: `${primaryColor}15`, 
                                color: primaryColor 
                              }}
                            >
                              {copiedAccount === rek.noRek ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              {copiedAccount === rek.noRek ? 'Tersalin' : 'Salin No. Rek'}
                            </button>
                          </div>
                          <p className="font-mono text-xs font-semibold text-slate-800">{rek.noRek}</p>
                          <p className="text-[10px] text-slate-500">a.n {rek.atasNama}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Closing gratitude */}
                  <div className="text-center pt-2">
                    <p className="text-[11px] text-slate-600 font-serif italic mb-2">
                      {config.kutipanAkhir || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.'}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      Kami yang berbahagia,
                    </p>
                    <h3 
                      className={`${getTitleFontClass()} text-2xl sm:text-3xl my-1`}
                      style={{ color: primaryColor }}
                    >
                      {project.mempelai}
                    </h3>
                  </div>

                  {/* Share button */}
                  <div className="text-center pt-2">
                    <button
                      onClick={onOpenShareModal}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Bagikan Undangan Ini</span>
                    </button>
                  </div>
                </div>

                <div className="text-center text-[11px] text-slate-400 font-serif pt-2 border-t border-stone-200/60">
                  Halaman Terakhir · Salam Hangat
                </div>
              </div>
            )}

          </div>

          {/* PAGE BOTTOM CONTROLS & BREADCRUMBS */}
          <div className="relative z-20 px-5 py-3 border-t border-stone-200/70 bg-stone-50/50 flex items-center justify-between text-xs">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0 || isFlipping}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white/90 text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-all cursor-pointer shadow-2xs font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Page Dots Indicator */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i, i > currentPage ? 'forward' : 'backward')}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentPage === i 
                      ? 'w-6 shadow-xs' 
                      : 'w-2 bg-stone-300 hover:bg-stone-400'
                  }`}
                  style={{
                    backgroundColor: currentPage === i ? primaryColor : undefined
                  }}
                  title={`Buka Halaman ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1 || isFlipping}
              className="px-3 py-1.5 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-all cursor-pointer shadow-xs font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
