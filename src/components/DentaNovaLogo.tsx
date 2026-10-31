import React from 'react';

interface DentaNovaLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const DentaNovaLogo: React.FC<DentaNovaLogoProps> = ({
  className = '',
  variant = 'color',
  size = 'md',
  showSubtitle = true,
}) => {
  const isDark = variant === 'dark';

  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: {
      top: 'text-[9px] tracking-wide',
      bottom: 'text-xs tracking-tight',
    },
    md: {
      top: 'text-[11px] sm:text-xs tracking-wide',
      bottom: 'text-base sm:text-lg tracking-tight',
    },
    lg: {
      top: 'text-xs sm:text-sm tracking-wide',
      bottom: 'text-xl sm:text-2xl tracking-tight',
    },
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Okrągły niebieski emblemat DentaNova */}
      <div 
        className={`${emblemSizes[size]} shrink-0 rounded-full flex items-center justify-center shadow-sm relative overflow-hidden transition-transform group-hover:scale-105`}
        style={{ backgroundColor: '#1B64A5' }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full p-1.5"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
                    {/* Tło kuli */}
          <circle cx="50" cy="50" r="46" fill="#1B64A5" />
          
          {/* Monogram DN */}
          <g fill="#FFFFFF">
            <text x="50" y="62" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="38" letterSpacing="1">DN</text>
            <rect x="22" y="70" width="56" height="3" rx="1.5" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* Typografia logotypu: KLINIKA STOMATOLOGICZNA DENTANOVA */}
      <div className="flex flex-col justify-center leading-none">
        <span 
          className={`font-bold uppercase tracking-wider ${textSizes[size].top} ${
            isDark ? 'text-slate-300' : 'text-[#1B64A5]'
          }`}
        >
          KLINIKA STOMATOLOGICZNA
        </span>
        <span 
          className={`font-black uppercase tracking-tight ${textSizes[size].bottom} ${
            isDark ? 'text-white' : 'text-[#1B64A5]'
          }`}
        >
          DENTANOVA
        </span>
        {showSubtitle && (
          <span className={`text-[10px] tracking-normal font-medium mt-0.5 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Klinika Stomatologiczna • Chirurgia • Implanty • RTG 3D
          </span>
        )}
      </div>
    </div>
  );
};
