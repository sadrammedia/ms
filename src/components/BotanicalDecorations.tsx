import React from 'react';

// Delicate Gold Floral Center Divider (as seen in the mockup under couple names)
export const GoldFloralDivider: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-[#C5A059]" }) => (
  <div className={`flex items-center justify-center gap-3 my-3 ${className}`}>
    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#C5A059]/60 to-[#C5A059]" />
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#C5A059]" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C12 2 13.5 6 17 8C13.5 10 12 14 12 14C12 14 10.5 10 7 8C10.5 6 12 2 12 2Z" fill="#C5A059" fillOpacity="0.25" />
      <circle cx="12" cy="8" r="1.5" fill="#C5A059" />
      <path d="M7 17C10 16 12 14 12 14C12 14 14 16 17 17" strokeLinecap="round" />
    </svg>
    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-[#C5A059]/60 to-[#C5A059]" />
  </div>
);

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
