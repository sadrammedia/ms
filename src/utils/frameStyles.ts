import { CSSProperties } from 'react';
import { LayoutConfig } from '../types/wedding';

export interface FrameShapeOption {
  id: NonNullable<LayoutConfig['bentukFrameFoto']>;
  label: string;
  desc: string;
  iconName: string;
}

export const FRAME_SHAPES: FrameShapeOption[] = [
  { id: 'circle', label: 'Lingkaran Klasik', desc: 'Bulat anggun & harmonis', iconName: 'circle' },
  { id: 'arch', label: 'Kubah Royal (Arch)', desc: 'Lengkung kubah mewah khas pernikahan', iconName: 'arch' },
  { id: 'arch-double', label: 'Kubah Ganda Emas', desc: 'Arch dengan aksen bingkai ganda', iconName: 'arch-double' },
  { id: 'squircle', label: 'Squircle Modern', desc: 'Kotak sudut membulat halus', iconName: 'squircle' },
  { id: 'oval', label: 'Oval Romantis', desc: 'Siluet oval anggun & elegan', iconName: 'oval' },
  { id: 'diamond', label: 'Diamond Rhombus', desc: 'Bentuk belah ketupat modern', iconName: 'diamond' },
  { id: 'hexagon', label: 'Hexagon Geometris', desc: 'Segienam simetris elegan', iconName: 'hexagon' },
  { id: 'scallop', label: 'Kelopak Bunga', desc: 'Gelombang floral estetik', iconName: 'scallop' },
  { id: 'polaroid', label: 'Vintage Polaroid', desc: 'Foto bingkai polaroid klasik', iconName: 'polaroid' },
  { id: 'blob', label: 'Organik Fluid Wave', desc: 'Bentuk dinamis artistik', iconName: 'blob' },
];

export const PHOTO_SIZES = [
  { id: 'sm', label: 'Kecil', desc: 'Ringkas (100px)', px: 100 },
  { id: 'md', label: 'Standar', desc: 'Ideal (130px)', px: 130 },
  { id: 'lg', label: 'Besar', desc: 'Menawan (160px)', px: 160 },
  { id: 'xl', label: 'Ekstra Besar', desc: 'Showcase (195px)', px: 195 },
  { id: 'custom', label: 'Kustom Slider', desc: 'Atur bebas', px: 130 },
] as const;

export const BORDER_STYLES = [
  { id: 'gold-ring', label: 'Cincin Emas Mengkilap', desc: 'Garis border emas solid berpendar' },
  { id: 'double-ring', label: 'Cincin Ganda Elegan', desc: 'Dua lapis garis cincin emas mewah' },
  { id: 'dashed-vintage', label: 'Jahitan Emas (Dashed)', desc: 'Garis putus-putus vintage klasik' },
  { id: 'floral-accent', label: 'Glow Aksen Emas', desc: 'Ring berpendar dengan aura hangat' },
  { id: 'subtle-shadow', label: 'Bayangan Lembut 3D', desc: 'Tanpa garis tebal, bayangan timbul' },
  { id: 'none', label: 'Polos Minimalis', desc: 'Tanpa border tepi' },
] as const;

export const COVER_BOX_POSITIONS = [
  { id: 'bawah', label: 'Bawah Standar', desc: 'Posisi nyaman di area bawah' },
  { id: 'tengah-bawah', label: 'Tengah-Bawah', desc: 'Sedikit lebih tinggi' },
  { id: 'tengah', label: 'Tepat di Tengah', desc: 'Center di layar sampul' },
  { id: 'bawah-ekstra', label: 'Rata Bawah Maksimal', desc: 'Sangat bawah agar foto pasangan bebas terlihat' },
] as const;

export const COVER_BOX_STYLES = [
  { id: 'frosted-glass', label: 'Kaca Buram (Glassmorphism)', desc: 'Semi transparan blur modern' },
  { id: 'clean-white', label: 'Putih Bersih Solid', desc: 'Jelas terbaca di latar apapun' },
  { id: 'gold-border', label: 'Bingkai Emas Elegan', desc: 'Aksen garis emas mewah' },
  { id: 'minimal-transparent', label: 'Ultra Minimalis', desc: 'Transparan ringan tanpa batas tegas' },
  { id: 'dark-glass', label: 'Kaca Gelap Elegan', desc: 'Cocok jika foto sampul dominan putih/terang' },
] as const;

/**
 * Returns dimensions and container classes based on layout config
 */
export function getPhotoFrameStyles(
  layout?: LayoutConfig,
  accentColor: string = '#C5A059'
): {
  containerStyle: CSSProperties;
  containerClass: string;
  imgClass: string;
  imgStyle: CSSProperties;
  isPolaroid: boolean;
} {
  const shape = layout?.bentukFrameFoto || 'circle';
  const sizeOption = layout?.ukuranFotoMempelai || 'md';
  const customPx = layout?.ukuranFotoKustom || 130;
  const borderStyle = layout?.gayaBorderFoto || 'gold-ring';
  const focus = layout?.posisiFokusFoto || 'top';
  const offsetY = layout?.geserVertikalFoto || 0;

  // Compute pixel width & height
  let widthPx = 130;
  if (sizeOption === 'sm') widthPx = 100;
  else if (sizeOption === 'md') widthPx = 130;
  else if (sizeOption === 'lg') widthPx = 160;
  else if (sizeOption === 'xl') widthPx = 195;
  else if (sizeOption === 'custom') widthPx = customPx;

  // Aspect ratio adjustments: Arch and Oval are slightly taller than wide
  const isTall = shape === 'arch' || shape === 'arch-double' || shape === 'oval';
  const heightPx = isTall ? Math.round(widthPx * 1.28) : widthPx;

  let shapeBorderRadius = '9999px';
  let clipPath: string | undefined = undefined;

  switch (shape) {
    case 'circle':
      shapeBorderRadius = '9999px';
      break;
    case 'arch':
    case 'arch-double':
      shapeBorderRadius = `${Math.round(widthPx * 0.5)}px ${Math.round(widthPx * 0.5)}px 18px 18px`;
      break;
    case 'squircle':
      shapeBorderRadius = `${Math.round(widthPx * 0.26)}px`;
      break;
    case 'oval':
      shapeBorderRadius = '50% / 60%';
      break;
    case 'diamond':
      clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      shapeBorderRadius = '0px';
      break;
    case 'hexagon':
      clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
      shapeBorderRadius = '0px';
      break;
    case 'scallop':
      shapeBorderRadius = '36% 64% 60% 40% / 40% 45% 55% 60%';
      break;
    case 'polaroid':
      shapeBorderRadius = '10px';
      break;
    case 'blob':
      shapeBorderRadius = '62% 38% 46% 54% / 54% 48% 52% 46%';
      break;
    default:
      shapeBorderRadius = '9999px';
  }

  // Border & Shadow logic
  let borderStyles: CSSProperties = {};
  let containerExtraClass = '';

  if (borderStyle === 'gold-ring') {
    borderStyles = {
      border: `2.5px solid ${accentColor}`,
      boxShadow: `0 8px 24px -4px ${accentColor}35, 0 4px 10px rgba(0,0,0,0.06)`,
    };
  } else if (borderStyle === 'double-ring') {
    borderStyles = {
      border: `2px solid ${accentColor}`,
      outline: `2px solid ${accentColor}80`,
      outlineOffset: '3.5px',
      boxShadow: `0 10px 25px -3px ${accentColor}30, 0 4px 10px rgba(0,0,0,0.06)`,
    };
  } else if (borderStyle === 'dashed-vintage') {
    borderStyles = {
      border: `2px dashed ${accentColor}`,
      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    };
  } else if (borderStyle === 'floral-accent') {
    borderStyles = {
      border: `2.5px solid ${accentColor}`,
      boxShadow: `0 0 0 4px ${accentColor}25, 0 10px 28px -2px ${accentColor}40`,
    };
  } else if (borderStyle === 'subtle-shadow') {
    borderStyles = {
      border: '1px solid rgba(255,255,255,0.85)',
      boxShadow: '0 14px 30px -4px rgba(15,23,42,0.18), 0 4px 8px rgba(0,0,0,0.06)',
    };
  } else {
    borderStyles = {
      boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
    };
  }

  const containerStyle: CSSProperties = {
    width: `${widthPx}px`,
    height: shape === 'polaroid' ? `${Math.round(widthPx * 1.25)}px` : `${heightPx}px`,
    borderRadius: shapeBorderRadius,
    clipPath,
    transform: offsetY !== 0 ? `translateY(${offsetY}px)` : undefined,
    ...borderStyles,
  };

  const containerClass = `relative mx-auto mb-3 overflow-hidden bg-slate-100 transition-all duration-300 ${
    shape === 'polaroid' ? 'p-2 pb-5 bg-white shadow-xl' : 'p-1'
  } ${containerExtraClass}`;

  const objectPosClass = focus === 'top' ? 'object-top' : focus === 'bottom' ? 'object-bottom' : 'object-center';
  const imgClass = `w-full h-full object-cover ${objectPosClass} hover:scale-105 transition-transform duration-500`;

  const imgStyle: CSSProperties = {
    borderRadius: shape === 'polaroid' ? '6px' : shapeBorderRadius,
    clipPath,
  };

  return {
    containerStyle,
    containerClass,
    imgClass,
    imgStyle,
    isPolaroid: shape === 'polaroid',
  };
}

/**
 * Returns classes and styles for the cover greeting box
 */
export function getCoverGreetingBoxStyles(
  layout?: LayoutConfig,
  primaryColor: string = '#1F362D',
  accentColor: string = '#C5A059'
): {
  wrapperStyle: CSSProperties;
  cardClass: string;
  cardStyle: CSSProperties;
} {
  const positionPreset = layout?.posisiKotakSampul || 'bawah';
  const offsetY = layout?.geserVertikalKotakSampul || 0;
  const boxStyle = layout?.gayaKotakSampul || 'frosted-glass';

  // Base vertical alignment adjustment based on preset
  let presetMarginTop: string | undefined = undefined;
  let presetMarginBottom: string | undefined = undefined;

  if (positionPreset === 'bawah-ekstra') {
    presetMarginTop = 'auto';
    presetMarginBottom = '0.5rem';
  } else if (positionPreset === 'tengah') {
    presetMarginTop = '-2.5rem';
    presetMarginBottom = '1.5rem';
  } else if (positionPreset === 'tengah-bawah') {
    presetMarginTop = '-1rem';
    presetMarginBottom = '2rem';
  }

  const wrapperStyle: CSSProperties = {
    transform: offsetY !== 0 ? `translateY(${offsetY}px)` : undefined,
    marginTop: presetMarginTop,
    marginBottom: presetMarginBottom,
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), margin 0.25s ease',
  };

  let cardClass = 'rounded-2xl py-2.5 px-4 max-w-xs mx-auto shadow-xs mb-3.5 border transition-all';
  let cardStyle: CSSProperties = {};

  switch (boxStyle) {
    case 'clean-white':
      cardClass += ' bg-white/95 shadow-lg border-white';
      cardStyle = {
        boxShadow: '0 10px 25px -4px rgba(0,0,0,0.15)',
      };
      break;
    case 'gold-border':
      cardClass += ' bg-white/90 backdrop-blur-md shadow-md';
      cardStyle = {
        borderColor: accentColor,
        borderWidth: '1.5px',
        boxShadow: `0 8px 20px -3px ${accentColor}30`,
      };
      break;
    case 'minimal-transparent':
      cardClass += ' bg-white/60 backdrop-blur-xs border-white/40 shadow-xs';
      break;
    case 'dark-glass':
      cardClass += ' bg-slate-900/80 backdrop-blur-md text-white border-white/20 shadow-xl';
      break;
    case 'frosted-glass':
    default:
      cardClass += ' bg-white/85 backdrop-blur-md shadow-xs';
      cardStyle = {
        borderColor: `${accentColor}40`,
      };
      break;
  }

  return {
    wrapperStyle,
    cardClass,
    cardStyle,
  };
}

/**
 * Returns typography classes & inline styles for cover text elements:
 * 1. Subjudul / Kalimat Pengantar (tanda kurung merah tengah)
 * 2. Judul Pengantin / Mempelai (tanda kurung merah atas)
 * 3. Info Tanggal & Lokasi (tanda kurung merah bawah)
 */
export function getCoverTextStyles(
  layout?: LayoutConfig,
  defaultPrimaryColor: string = '#1F362D'
): {
  subJudulStyle: CSSProperties;
  subJudulSizeClass: string;
  judulStyle: CSSProperties;
  judulSizeClass: string;
  infoStyle: CSSProperties;
  infoSizeClass: string;
} {
  const cfg = layout?.gayaTeksSampul;

  // 1. Subjudul / Kalimat Pengantar
  const subJudulColor = cfg?.subJudulWarna || '#334155';
  let subJudulSizeClass = 'text-xs md:text-sm';
  if (cfg?.subJudulUkuran === 'xs') subJudulSizeClass = 'text-[11px] md:text-xs';
  else if (cfg?.subJudulUkuran === 'sm') subJudulSizeClass = 'text-xs md:text-sm';
  else if (cfg?.subJudulUkuran === 'base') subJudulSizeClass = 'text-sm md:text-base';
  else if (cfg?.subJudulUkuran === 'lg') subJudulSizeClass = 'text-base md:text-lg';
  else if (cfg?.subJudulUkuran === 'xl') subJudulSizeClass = 'text-lg md:text-xl';

  const subJudulStyle: CSSProperties = {
    color: subJudulColor,
    fontWeight: cfg?.subJudulBold ? 700 : undefined,
    fontStyle: cfg?.subJudulItalic ? 'italic' : undefined,
    textShadow: cfg?.subJudulShadow 
      ? '0 1px 3px rgba(0,0,0,0.7), 0 0 10px rgba(255,255,255,0.8)' 
      : undefined,
    textAlign: cfg?.subJudulAlign || 'center',
  };

  // 2. Judul Pengantin / Mempelai
  const judulColor = cfg?.judulWarna || defaultPrimaryColor;
  let judulSizeClass = 'text-5xl md:text-6xl';
  if (cfg?.judulUkuran === 'sm') judulSizeClass = 'text-3xl md:text-4xl';
  else if (cfg?.judulUkuran === 'md') judulSizeClass = 'text-4xl md:text-5xl';
  else if (cfg?.judulUkuran === 'lg') judulSizeClass = 'text-5xl md:text-6xl';
  else if (cfg?.judulUkuran === 'xl') judulSizeClass = 'text-6xl md:text-7xl';
  else if (cfg?.judulUkuran === '2xl') judulSizeClass = 'text-7xl md:text-8xl';

  const judulStyle: CSSProperties = {
    color: judulColor,
    fontWeight: cfg?.judulBold ? 800 : undefined,
    textShadow: cfg?.judulShadow 
      ? '0 2px 8px rgba(0,0,0,0.6), 0 0 14px rgba(255,255,255,0.7)' 
      : undefined,
  };

  // 3. Info Tanggal & Lokasi
  const infoColor = cfg?.infoWarna || '#334155';
  let infoSizeClass = 'text-xs';
  if (cfg?.infoUkuran === 'xs') infoSizeClass = 'text-[10px] md:text-[11px]';
  else if (cfg?.infoUkuran === 'sm') infoSizeClass = 'text-xs md:text-sm';
  else if (cfg?.infoUkuran === 'base') infoSizeClass = 'text-sm md:text-base';

  const infoStyle: CSSProperties = {
    color: infoColor,
    fontWeight: cfg?.infoBold ? 700 : undefined,
    textShadow: cfg?.infoShadow 
      ? '0 1px 4px rgba(0,0,0,0.7), 0 0 8px rgba(255,255,255,0.8)' 
      : undefined,
  };

  return {
    subJudulStyle,
    subJudulSizeClass,
    judulStyle,
    judulSizeClass,
    infoStyle,
    infoSizeClass,
  };
}
