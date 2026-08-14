import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'mark' | 'full';
  theme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 40,
  variant = 'mark',
  theme = 'dark'
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Emblem SVG */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 shadow-md shadow-blue-900/30"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Background Gradient Circle */}
          <circle cx="50" cy="50" r="48" fill="url(#logo-bg-grad)" />

          {/* Outer Swirl Rings */}
          <circle cx="50" cy="50" r="44" stroke="url(#ring-grad)" strokeWidth="3" opacity="0.9" />
          <path
            d="M 12 50 A 38 38 0 0 1 88 50"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Circuit Board Sphere Nodes & Lines */}
          <g stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Center Cross / Core */}
            <path d="M50 22 V78 M22 50 H78" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />
            
            {/* Quadrant 1 Circuits */}
            <path d="M50 34 H62 V26" />
            <path d="M50 42 H70 V32" />
            <path d="M58 50 V38 H68" />
            <path d="M66 50 V42 H74" />

            {/* Quadrant 2 Circuits */}
            <path d="M50 34 H38 V26" />
            <path d="M50 42 H30 V32" />
            <path d="M42 50 V38 H32" />
            <path d="M34 50 V42 H26" />

            {/* Quadrant 3 Circuits */}
            <path d="M50 66 H38 V74" />
            <path d="M50 58 H30 V68" />
            <path d="M42 50 V62 H32" />
            <path d="M34 50 V58 H26" />

            {/* Quadrant 4 Circuits */}
            <path d="M50 66 H62 V74" />
            <path d="M50 58 H70 V68" />
            <path d="M42 50 V62 H68" />
            <path d="M34 50 V58 H74" />

            {/* Outer Circular Bounds */}
            <circle cx="50" cy="50" r="28" stroke="#7DD3FC" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
          </g>

          {/* Circuit Terminal Nodes (Dots) */}
          <g fill="#38BDF8">
            <circle cx="62" cy="26" r="2.5" fill="#FFFFFF" />
            <circle cx="70" cy="32" r="2.5" fill="#FFFFFF" />
            <circle cx="68" cy="38" r="2.5" fill="#FFFFFF" />
            <circle cx="74" cy="42" r="2.5" fill="#FFFFFF" />

            <circle cx="38" cy="26" r="2.5" fill="#FFFFFF" />
            <circle cx="30" cy="32" r="2.5" fill="#FFFFFF" />
            <circle cx="32" cy="38" r="2.5" fill="#FFFFFF" />
            <circle cx="26" cy="42" r="2.5" fill="#FFFFFF" />

            <circle cx="38" cy="74" r="2.5" fill="#FFFFFF" />
            <circle cx="30" cy="68" r="2.5" fill="#FFFFFF" />
            <circle cx="32" cy="62" r="2.5" fill="#FFFFFF" />
            <circle cx="26" cy="58" r="2.5" fill="#FFFFFF" />

            <circle cx="62" cy="74" r="2.5" fill="#FFFFFF" />
            <circle cx="70" cy="68" r="2.5" fill="#FFFFFF" />
            <circle cx="68" cy="62" r="2.5" fill="#FFFFFF" />
            <circle cx="74" cy="58" r="2.5" fill="#FFFFFF" />

            {/* Core Center Dot */}
            <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="logo-bg-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="50%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Full Typography Option */}
      {variant === 'full' && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-bold tracking-wider uppercase text-sm sm:text-base ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Flávio Santiago
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-sky-400 flex items-center gap-1 mt-0.5">
            CONSULTOR
            <span className="text-sky-300 font-extrabold italic">IA</span>
            {/* Microchip Icon */}
            <svg className="w-3 h-3 text-sky-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="6" y="6" width="12" height="12" rx="2" />
              <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
};
