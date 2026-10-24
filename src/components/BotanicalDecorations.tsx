import React from 'react';

// Delicate Gold Floral Center Divider (Classic Wedding)
export const GoldFloralDivider: React.FC<{ className?: string; color?: string }> = ({ 
  className = "my-3",
  color = "#C5A059"
}) => (
  <div className={`flex items-center justify-center gap-3 select-none pointer-events-none ${className}`}>
    <div className="h-[1px] w-12" style={{ background: `linear-gradient(to right, transparent, ${color}99, ${color})` }} />
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color }} stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C12 2 13.5 6 17 8C13.5 10 12 14 12 14C12 14 10.5 10 7 8C10.5 6 12 2 12 2Z" fill="currentColor" fillOpacity="0.25" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <path d="M7 17C10 16 12 14 12 14C12 14 14 16 17 17" strokeLinecap="round" />
    </svg>
    <div className="h-[1px] w-12" style={{ background: `linear-gradient(to left, transparent, ${color}99, ${color})` }} />
  </div>
);

// Royal Gold Filigree Ribbon Divider (Baroque scroll & diamond crest)
export const GoldFiligreeDivider: React.FC<{ className?: string; color?: string }> = ({
  className = "my-3",
  color = "#C5A059"
}) => (
  <div className={`flex items-center justify-center gap-2 select-none pointer-events-none ${className}`}>
    <div className="h-[1.5px] w-12 md:w-16" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
    <svg viewBox="0 0 120 24" fill="none" className="w-24 md:w-28 h-6" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12 C25 6 35 18 50 12 C55 10 57 14 60 12 C63 14 65 10 70 12 C85 18 95 6 110 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 12 C30 16 40 16 48 13" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M72 13 C80 16 90 16 95 12" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M60 4 L66 12 L60 20 L54 12 Z" fill={color} />
      <circle cx="45" cy="12" r="1.5" fill={color} />
      <circle cx="75" cy="12" r="1.5" fill={color} />
      <circle cx="32" cy="10" r="1.2" fill={color} opacity="0.8" />
      <circle cx="88" cy="10" r="1.2" fill={color} opacity="0.8" />
    </svg>
    <div className="h-[1.5px] w-12 md:w-16" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
  </div>
);

// Organic Leaf Vine Botanical Divider (Curved foliage & blossom)
export const LeafVineDivider: React.FC<{ className?: string; color?: string }> = ({
  className = "my-3",
  color = "#3E6B56"
}) => (
  <div className={`flex items-center justify-center gap-2 select-none pointer-events-none ${className}`}>
    <div className="h-[1px] w-10 md:w-14" style={{ background: `linear-gradient(to right, transparent, ${color}80, ${color})` }} />
    <svg viewBox="0 0 120 26" fill="none" className="w-24 md:w-28 h-6" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 13 Q35 7 60 13 Q85 19 114 13" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <path d="M22 12 C26 6 36 8 35 15 C30 15 25 14 22 12 Z" fill={color} opacity="0.75" />
      <path d="M38 11 C44 5 52 9 50 15 C45 14 40 13 38 11 Z" fill={color} opacity="0.9" />
      <path d="M28 14 C33 20 41 19 42 13 C36 14 31 15 28 14 Z" fill={color} opacity="0.65" />
      <circle cx="60" cy="13" r="3.2" fill="#D4AF37" />
      <circle cx="60" cy="13" r="1.2" fill="#FFFFFF" />
      <path d="M82 14 C86 20 96 18 95 11 C90 11 85 12 82 14 Z" fill={color} opacity="0.75" />
      <path d="M70 13 C76 7 84 11 82 17 C77 16 72 15 70 13 Z" fill={color} opacity="0.9" />
      <path d="M92 12 C97 6 105 7 106 13 C100 12 95 11 92 12 Z" fill={color} opacity="0.65" />
    </svg>
    <div className="h-[1px] w-10 md:w-14" style={{ background: `linear-gradient(to left, transparent, ${color}80, ${color})` }} />
  </div>
);

// Sleek Minimalist Geometric Divider
export const ModernDivider: React.FC<{ className?: string; color?: string }> = ({
  className = "my-3",
  color = "#1F362D"
}) => (
  <div className={`flex items-center justify-center gap-2 select-none pointer-events-none ${className}`}>
    <div className="h-[1px] w-12 md:w-16" style={{ backgroundColor: `${color}40` }} />
    <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: color }} />
    <div className="h-[1px] w-12 md:w-16" style={{ backgroundColor: `${color}40` }} />
  </div>
);

// Clean Line Divider (Triple dots & diamond)
export const CleanLineDivider: React.FC<{ className?: string; color?: string }> = ({
  className = "my-3",
  color = "#64748B"
}) => (
  <div className={`flex items-center justify-center gap-2 select-none pointer-events-none ${className}`}>
    <div className="h-[1px] w-14 md:w-20" style={{ background: `linear-gradient(to right, transparent, ${color}60, ${color})` }} />
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: color }} />
      <div className="w-2 h-2 rotate-45 shadow-2xs" style={{ backgroundColor: color }} />
      <div className="w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: color }} />
    </div>
    <div className="h-[1px] w-14 md:w-20" style={{ background: `linear-gradient(to left, transparent, ${color}60, ${color})` }} />
  </div>
);

// Islamic Arch & Crescent Calligraphy Divider
export const IslamicCalligraphyDivider: React.FC<{ className?: string; color?: string }> = ({
  className = "my-3",
  color = "#D4AF37"
}) => (
  <div className={`flex items-center justify-center gap-2 select-none pointer-events-none ${className}`}>
    <div className="h-[1px] w-12 md:w-16" style={{ background: `linear-gradient(to right, transparent, ${color}80, ${color})` }} />
    <svg viewBox="0 0 100 24" fill="none" className="w-24 md:w-28 h-6" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12 Q30 5 45 12 Q50 8 55 12 Q70 5 90 12" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M47 7 A 5 5 0 1 0 53 15 A 6 6 0 1 1 47 7 Z" fill={color} />
      <circle cx="53" cy="9" r="1.2" fill={color} />
      <circle cx="28" cy="10" r="1.2" fill={color} />
      <circle cx="72" cy="10" r="1.2" fill={color} />
    </svg>
    <div className="h-[1px] w-12 md:w-16" style={{ background: `linear-gradient(to left, transparent, ${color}80, ${color})` }} />
  </div>
);

// Dynamic Divider Dispatcher (Reacts instantly to ornamenConfig.gayaPemisah)
export const DynamicDivider: React.FC<{
  gayaPemisah?: 'gold-filigree' | 'leaf-vine' | 'bismillah-calligraphy' | 'clean-line' | 'none';
  color?: string;
  className?: string;
}> = ({
  gayaPemisah = 'gold-filigree',
  color = '#C5A059',
  className = "my-3"
}) => {
  if (gayaPemisah === 'none') {
    return <div className={`h-2 ${className}`} />;
  }

  switch (gayaPemisah) {
    case 'leaf-vine':
      return <LeafVineDivider color={color} className={className} />;
    case 'clean-line':
      return <CleanLineDivider color={color} className={className} />;
    case 'bismillah-calligraphy':
      return <IslamicCalligraphyDivider color={color} className={className} />;
    case 'gold-filigree':
    default:
      return <GoldFiligreeDivider color={color} className={className} />;
  }
};

// Botanical Watercolor Corner Ornament (Top-Right / Top-Left)
export const BotanicalCorner: React.FC<{ 
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}> = ({ position, className = "" }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-left': return 'top-0 left-0';
      case 'top-right': return 'top-0 right-0 scale-x-[-1]';
      case 'bottom-left': return 'bottom-0 left-0 scale-y-[-1]';
      case 'bottom-right': return 'bottom-0 right-0 scale-[-1]';
    }
  };

  return (
    <div className={`absolute pointer-events-none select-none z-10 w-28 md:w-36 h-28 md:h-36 ${getTransform()} ${className}`}>
      <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-85">
        <defs>
          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3E6B56" />
            <stop offset="100%" stopColor="#1E382B" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C8C74" />
            <stop offset="100%" stopColor="#2D4D3D" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBF7A" />
            <stop offset="100%" stopColor="#B38938" />
          </linearGradient>
        </defs>

        {/* Delicate branch stems */}
        <path d="M0 0 C40 20 80 40 130 90" stroke="url(#goldGrad)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M0 20 C30 50 60 85 100 135" stroke="url(#goldGrad)" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />

        {/* Botanical leaves along branch 1 */}
        <path d="M25 15 C35 8 50 16 48 28 C40 28 30 24 25 15 Z" fill="url(#leafGrad1)" opacity="0.9" />
        <path d="M45 27 C60 22 72 32 68 45 C56 45 48 38 45 27 Z" fill="url(#leafGrad2)" opacity="0.85" />
        <path d="M68 42 C82 38 94 48 90 62 C78 60 70 52 68 42 Z" fill="url(#leafGrad1)" opacity="0.9" />
        <path d="M92 63 C108 60 118 72 112 85 C100 82 92 74 92 63 Z" fill="url(#leafGrad2)" opacity="0.8" />
        <path d="M115 84 C128 82 136 94 130 105 C120 102 115 94 115 84 Z" fill="url(#leafGrad1)" opacity="0.75" />

        {/* Small gold bud accents */}
        <circle cx="38" cy="18" r="2.5" fill="url(#goldGrad)" />
        <circle cx="62" cy="35" r="2" fill="url(#goldGrad)" />
        <circle cx="85" cy="52" r="2.2" fill="url(#goldGrad)" />
        <circle cx="108" cy="72" r="1.8" fill="url(#goldGrad)" />

        {/* Secondary branch foliage */}
        <path d="M18 35 C28 42 30 55 20 62 C15 54 12 42 18 35 Z" fill="url(#leafGrad2)" opacity="0.7" />
        <path d="M38 58 C50 68 52 82 40 90 C32 80 30 68 38 58 Z" fill="url(#leafGrad1)" opacity="0.65" />
        <path d="M62 88 C74 100 74 115 62 122 C52 112 52 98 62 88 Z" fill="url(#leafGrad2)" opacity="0.6" />
      </svg>
    </div>
  );
};

// Royal Gold Vintage Filigree Corner Ornament (Victorian / Baroque Scroll)
export const GoldFiligreeCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  color?: string;
}> = ({ position, className = "", color = "#DFBF7A" }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-left': return 'top-0 left-0';
      case 'top-right': return 'top-0 right-0 scale-x-[-1]';
      case 'bottom-left': return 'bottom-0 left-0 scale-y-[-1]';
      case 'bottom-right': return 'bottom-0 right-0 scale-[-1]';
    }
  };

  return (
    <div className={`absolute pointer-events-none select-none z-10 w-28 md:w-36 h-28 md:h-36 ${getTransform()} ${className}`}>
      <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-90 drop-shadow-sm">
        <defs>
          <linearGradient id="goldFiligreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBF7A" />
            <stop offset="40%" stopColor="#F7E7B4" />
            <stop offset="70%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#967228" />
          </linearGradient>
        </defs>
        {/* Main outer floral curl */}
        <path d="M6 6 C15 45 45 75 90 90 C120 100 135 125 140 140" stroke="url(#goldFiligreeGrad)" strokeWidth="1.8" strokeLinecap="round" />
        {/* Inner parallel swirl */}
        <path d="M6 16 C16 48 48 80 96 98" stroke="url(#goldFiligreeGrad)" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 3" />
        {/* Flourish swirls */}
        <path d="M12 6 C35 12 55 32 60 58 C62 70 52 82 40 78 C30 75 28 62 38 56 C46 52 54 58 52 66" stroke="url(#goldFiligreeGrad)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M6 12 C12 35 32 55 58 60 C70 62 82 52 78 40 C75 30 62 28 56 38 C52 46 58 54 66 52" stroke="url(#goldFiligreeGrad)" strokeWidth="1.3" strokeLinecap="round" />
        {/* Fleur-de-lis corner accent */}
        <path d="M15 15 C20 22 28 24 35 20 C28 28 22 36 15 42 C18 32 18 24 15 15 Z" fill="url(#goldFiligreeGrad)" opacity="0.85" />
        <circle cx="24" cy="24" r="2.5" fill="url(#goldFiligreeGrad)" />
        <circle cx="68" cy="74" r="2" fill="url(#goldFiligreeGrad)" />
        <circle cx="98" cy="98" r="3" fill="url(#goldFiligreeGrad)" />
        {/* Tiny stars */}
        <path d="M10 95 L12 90 L14 95 L19 97 L14 99 L12 104 L10 99 L5 97 Z" fill="url(#goldFiligreeGrad)" opacity="0.8" />
        <path d="M95 10 L97 5 L99 10 L104 12 L99 14 L97 19 L95 14 L90 12 Z" fill="url(#goldFiligreeGrad)" opacity="0.8" />
      </svg>
    </div>
  );
};

// Islamic Arabesque Arch Corner
export const IslamicArabesqueCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  color?: string;
}> = ({ position, className = "", color = "#D4AF37" }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-left': return 'top-0 left-0';
      case 'top-right': return 'top-0 right-0 scale-x-[-1]';
      case 'bottom-left': return 'bottom-0 left-0 scale-y-[-1]';
      case 'bottom-right': return 'bottom-0 right-0 scale-[-1]';
    }
  };

  return (
    <div className={`absolute pointer-events-none select-none z-10 w-28 md:w-36 h-28 md:h-36 ${getTransform()} ${className}`}>
      <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-90 drop-shadow-sm">
        <path d="M0 0 L140 0 C120 15 95 40 85 70 C75 100 40 125 0 140 Z" stroke={color} strokeWidth="1.2" strokeOpacity="0.6" />
        <path d="M0 0 L120 0 C100 15 80 35 70 60 C60 85 35 105 0 120 Z" stroke={color} strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.5" />
        {/* Moroccan Arch Peak */}
        <path d="M20 20 C40 25 55 40 60 60 C62 40 75 25 95 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        {/* Crescent Moon & 8-point Islamic Star */}
        <path d="M38 32 A 7 7 0 1 0 46 44 A 9 9 0 1 1 38 32 Z" fill={color} fillOpacity="0.85" />
        <circle cx="48" cy="34" r="1.5" fill={color} />
        {/* Arabesque palm leaves */}
        <path d="M70 12 C75 20 85 24 92 20 C85 26 80 32 75 40 Z" fill={color} fillOpacity="0.6" />
        <path d="M12 70 C20 75 24 85 20 92 C26 85 32 80 40 75 Z" fill={color} fillOpacity="0.6" />
      </svg>
    </div>
  );
};

// Dynamic Corner Ornament Component (Supports all styles + custom upload + none)
export const DynamicCornerOrnament: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  gayaSudut?: 'botanical-leaves' | 'gold-vintage' | 'islamic-arabesque' | 'minimal-modern' | 'none';
  customUrl?: string;
  color?: string;
  className?: string;
}> = ({
  position,
  gayaSudut = 'botanical-leaves',
  customUrl,
  color = '#DFBF7A',
  className = ""
}) => {
  // 1. If user disabled corner ornaments, render nothing
  if (gayaSudut === 'none') {
    return null;
  }

  // 2. If user uploaded a custom transparent PNG ornament
  if (customUrl) {
    const getPosClass = () => {
      switch (position) {
        case 'top-left': return 'top-1 left-1';
        case 'top-right': return 'top-1 right-1 scale-x-[-1]';
        case 'bottom-left': return 'bottom-1 left-0 scale-y-[-1]';
        case 'bottom-right': return 'bottom-1 right-1 scale-[-1]';
      }
    };
    return (
      <div className={`absolute pointer-events-none select-none z-10 w-28 md:w-36 h-28 md:h-36 ${getPosClass()} ${className}`}>
        <img 
          src={customUrl} 
          alt="Ornamen Kustom" 
          className="w-full h-full object-contain filter drop-shadow-xs" 
        />
      </div>
    );
  }

  // 3. Preset ornament styles
  switch (gayaSudut) {
    case 'gold-vintage':
      return <GoldFiligreeCorner position={position} className={className} color={color} />;
    case 'islamic-arabesque':
      return <IslamicArabesqueCorner position={position} className={className} color={color} />;
    case 'minimal-modern':
      return null;
    case 'botanical-leaves':
    default:
      return <BotanicalCorner position={position} className={className} />;
  }
};

// Elegant Botanical Bottom Swag (as shown in the bottom of cards in mockup)
export const BotanicalSwag: React.FC<{ className?: string }> = ({ className = "w-40 h-10 text-[#C5A059]" }) => (
  <div className={`flex items-center justify-center my-4 opacity-80 ${className}`}>
    <svg viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M10 20 Q50 35 100 20 Q150 5 190 20" stroke="#C5A059" strokeWidth="1" strokeLinecap="round" />
      {/* Center flower petal */}
      <circle cx="100" cy="20" r="3" fill="#C5A059" />
      <path d="M96 20 C96 16 104 16 104 20 C104 24 96 24 96 20 Z" fill="#2C4A3E" fillOpacity="0.4" />
      
      {/* Left leaves */}
      <path d="M75 22 C68 16 62 20 65 26 C72 26 74 24 75 22 Z" fill="#2C4A3E" fillOpacity="0.5" />
      <path d="M50 24 C44 18 38 22 41 28 C47 28 49 26 50 24 Z" fill="#2C4A3E" fillOpacity="0.4" />
      
      {/* Right leaves */}
      <path d="M125 18 C132 12 138 16 135 22 C128 22 126 20 125 18 Z" fill="#2C4A3E" fillOpacity="0.5" />
      <path d="M150 16 C156 10 162 14 159 20 C153 20 151 18 150 16 Z" fill="#2C4A3E" fillOpacity="0.4" />
    </svg>
  </div>
);

// =========================================================================
// ISLAMIC & KHITAN DECORATIONS (Matching Mockup 2: Tasyakuran Khitan)
// =========================================================================

// Islamic Mosque Silhouette & Dome Header
export const IslamicDomeHeader: React.FC<{ color?: string; className?: string }> = ({ 
  color = "#D4AF37", 
  className = "" 
}) => (
  <div className={`flex flex-col items-center justify-center my-2 ${className}`}>
    <svg viewBox="0 0 60 40" fill="none" className="w-12 h-8" style={{ color }}>
      {/* Mosque Dome and Minarets Silhouette */}
      <path 
        d="M30 4 C27 9 20 12 20 22 L40 22 C40 12 33 9 30 4 Z" 
        fill="currentColor" 
        fillOpacity="0.9"
      />
      {/* Minaret Crescent Crescent Peak */}
      <circle cx="30" cy="3" r="1.5" fill="currentColor" />
      <path d="M30 0.5 L30 3" stroke="currentColor" strokeWidth="1" />
      {/* Side Minarets */}
      <rect x="13" y="14" width="3" height="12" fill="currentColor" fillOpacity="0.8" />
      <path d="M14.5 10 L13 14 L16 14 Z" fill="currentColor" />
      <rect x="44" y="14" width="3" height="12" fill="currentColor" fillOpacity="0.8" />
      <path d="M45.5 10 L44 14 L47 14 Z" fill="currentColor" />
      {/* Base Arch */}
      <path d="M26 26 C26 23 34 23 34 26 L34 28 L26 28 Z" fill="white" />
    </svg>
  </div>
);

// Islamic Hanging Lantern (Fanous)
export const IslamicLantern: React.FC<{ position: 'left' | 'right'; color?: string }> = ({ 
  position, 
  color = "#D4AF37" 
}) => (
  <div className={`absolute top-0 pointer-events-none select-none z-10 ${position === 'left' ? 'left-4' : 'right-4'}`}>
    <svg viewBox="0 0 30 90" fill="none" className="w-6 h-18 opacity-90 drop-shadow-sm">
      {/* Hanging chain */}
      <line x1="15" y1="0" x2="15" y2="35" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
      {/* Lantern Cap */}
      <path d="M10 35 L20 35 L17 40 L13 40 Z" fill={color} />
      {/* Glass Body */}
      <polygon points="8,44 22,44 20,62 10,62" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1" />
      {/* Amber Candle Flame */}
      <ellipse cx="15" cy="52" rx="2" ry="4" fill="#F59E0B" />
      {/* Bottom Base & Tassel */}
      <path d="M11 62 L19 62 L17 66 L13 66 Z" fill={color} />
      <line x1="15" y1="66" x2="15" y2="76" stroke={color} strokeWidth="1.2" />
      <circle cx="15" cy="76" r="1.5" fill={color} />
    </svg>
  </div>
);

// Islamic Mihrab Arch Frame Wrapper
export const IslamicArchFrame: React.FC<{ children: React.ReactNode; borderColor?: string }> = ({
  children,
  borderColor = "#D4AF37"
}) => (
  <div className="relative p-1">
    <div 
      className="relative rounded-t-[40px] rounded-b-2xl border-2 p-5 bg-white/90 backdrop-blur-md shadow-md"
      style={{ borderColor: `${borderColor}60` }}
    >
      <div 
        className="absolute inset-1 rounded-t-[36px] rounded-b-xl border pointer-events-none"
        style={{ borderColor: `${borderColor}30` }}
      />
      {children}
    </div>
  </div>
);

// =========================================================================
// BIRTHDAY & FESTIVE PARTY DECORATIONS (Matching Mockup 3: Birthday Party)
// =========================================================================

// Festive Party Balloons in Top Corners
export const BirthdayPartyBalloons: React.FC<{ position: 'left' | 'right' }> = ({ position }) => (
  <div className={`absolute top-2 pointer-events-none select-none z-10 w-20 h-28 ${position === 'left' ? 'left-1' : 'right-1 scale-x-[-1]'}`}>
    <svg viewBox="0 0 80 110" fill="none" className="w-full h-full opacity-90 drop-shadow-sm">
      {/* Balloon 1: Pink/Coral */}
      <ellipse cx="30" cy="35" rx="18" ry="24" fill="#F43F5E" fillOpacity="0.85" />
      <ellipse cx="25" cy="27" rx="4" ry="7" fill="white" fillOpacity="0.4" />
      <polygon points="28,59 32,59 30,63" fill="#E11D48" />
      <path d="M30 63 Q25 80 35 100" stroke="#CBD5E1" strokeWidth="1" fill="none" />

      {/* Balloon 2: Sky Blue */}
      <ellipse cx="52" cy="45" rx="16" ry="22" fill="#0EA5E9" fillOpacity="0.8" />
      <ellipse cx="48" cy="38" rx="3" ry="6" fill="white" fillOpacity="0.4" />
      <polygon points="50,67 54,67 52,71" fill="#0284C7" />
      <path d="M52 71 Q60 85 45 105" stroke="#CBD5E1" strokeWidth="1" fill="none" />

      {/* Balloon 3: Gold/Yellow */}
      <ellipse cx="20" cy="55" rx="14" ry="18" fill="#F59E0B" fillOpacity="0.85" />
      <polygon points="18,73 22,73 20,76" fill="#D97706" />
      <path d="M20 76 Q15 90 30 105" stroke="#CBD5E1" strokeWidth="1" fill="none" />

      {/* Confetti stars */}
      <circle cx="68" cy="20" r="2.5" fill="#EC4899" />
      <circle cx="10" cy="25" r="2" fill="#F59E0B" />
      <circle cx="62" cy="75" r="2" fill="#8B5CF6" />
    </svg>
  </div>
);

// Birthday Crown Icon
export const BirthdayCrown: React.FC<{ className?: string; color?: string }> = ({ 
  className = "w-7 h-6", 
  color = "#F59E0B" 
}) => (
  <svg viewBox="0 0 24 20" fill="none" className={className}>
    <path 
      d="M2 17 L22 17 L20 6 L15 11 L12 3 L9 11 L4 6 Z" 
      fill={color} 
      stroke="#D97706" 
      strokeWidth="1.2" 
      strokeLinejoin="round" 
    />
    <circle cx="2" cy="6" r="1.5" fill="#EF4444" />
    <circle cx="12" cy="3" r="1.5" fill="#3B82F6" />
    <circle cx="22" cy="6" r="1.5" fill="#10B981" />
  </svg>
);

// Birthday Cake Illustration
export const BirthdayCakeDecor: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    {/* Plate */}
    <ellipse cx="20" cy="36" rx="18" ry="3" fill="#E2E8F0" />
    {/* Cake Tier 2 */}
    <rect x="7" y="24" width="26" height="10" rx="3" fill="#F43F5E" />
    <path d="M7 26 Q13 30 20 26 Q27 30 33 26" stroke="#FECDD3" strokeWidth="2" fill="none" />
    {/* Cake Tier 1 */}
    <rect x="11" y="16" width="18" height="9" rx="2" fill="#FB7185" />
    <path d="M11 18 Q16 21 20 18 Q25 21 29 18" stroke="#FFE4E6" strokeWidth="1.5" fill="none" />
    {/* Candles */}
    <line x1="16" y1="12" x2="16" y2="16" stroke="#F59E0B" strokeWidth="1.5" />
    <circle cx="16" cy="10" r="1.5" fill="#EF4444" />
    <line x1="20" y1="11" x2="20" y2="16" stroke="#3B82F6" strokeWidth="1.5" />
    <circle cx="20" cy="9" r="1.5" fill="#F59E0B" />
    <line x1="24" y1="12" x2="24" y2="16" stroke="#10B981" strokeWidth="1.5" />
    <circle cx="24" cy="10" r="1.5" fill="#EF4444" />
  </svg>
);
