import React from 'react';

export interface PartySymbolProps {
  party: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'badge' | 'pill' | 'chip';
  showName?: boolean;
  className?: string;
}

export const PARTY_META: Record<string, {
  name: string;
  hindiName: string;
  symbolName: string;
  symbolNameHi: string;
  color: string;
  secondaryColor: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
}> = {
  SP: {
    name: 'Samajwadi Party',
    hindiName: 'सपा (समाजवादी पार्टी)',
    symbolName: 'Bicycle',
    symbolNameHi: 'साइकिल',
    color: '#E11D48',
    secondaryColor: '#16A34A',
    bgLight: 'bg-red-50 dark:bg-red-950/40',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  BJP: {
    name: 'Bharatiya Janata Party',
    hindiName: 'भाजपा (भारतीय जनता पार्टी)',
    symbolName: 'Lotus',
    symbolNameHi: 'कमल',
    color: '#EA580C',
    secondaryColor: '#16A34A',
    bgLight: 'bg-orange-50 dark:bg-orange-950/40',
    textColor: 'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  INC: {
    name: 'Indian National Congress',
    hindiName: 'कांग्रेस (भारतीय राष्ट्रीय कांग्रेस)',
    symbolName: 'Hand',
    symbolNameHi: 'हाथ का पंजा',
    color: '#0284C7',
    secondaryColor: '#16A34A',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    textColor: 'text-sky-700 dark:text-sky-400',
    borderColor: 'border-sky-200 dark:border-sky-800'
  },
  BSP: {
    name: 'Bahujan Samaj Party',
    hindiName: 'बसपा (बहुजन समाज पार्टी)',
    symbolName: 'Elephant',
    symbolNameHi: 'हाथी',
    color: '#2563EB',
    secondaryColor: '#1E40AF',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  RLD: {
    name: 'Rashtriya Lok Dal',
    hindiName: 'रालोद (राष्ट्रीय लोक दल)',
    symbolName: 'Hand Pump',
    symbolNameHi: 'हैंडपंप (नल)',
    color: '#16A34A',
    secondaryColor: '#15803D',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  ASPKR: {
    name: 'Azad Samaj Party (Kanshi Ram)',
    hindiName: 'आसपा (कांशीराम)',
    symbolName: 'Kettle',
    symbolNameHi: 'केतली',
    color: '#7C3AED',
    secondaryColor: '#6D28D9',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  ADAL: {
    name: 'Apna Dal (Sonelal)',
    hindiName: 'अपना दल (सोनेलाल)',
    symbolName: 'Cup and Saucer',
    symbolNameHi: 'कप और प्लेट',
    color: '#D97706',
    secondaryColor: '#B45309',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  AD: {
    name: 'Apna Dal',
    hindiName: 'अपना दल',
    symbolName: 'Cup and Saucer',
    symbolNameHi: 'कप और प्लेट',
    color: '#D97706',
    secondaryColor: '#B45309',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  SBSP: {
    name: 'Suheldev Bharatiya Samaj Party',
    hindiName: 'सुभासपा',
    symbolName: 'Walking Stick',
    symbolNameHi: 'छड़ी',
    color: '#EAB308',
    secondaryColor: '#CA8A04',
    bgLight: 'bg-yellow-50 dark:bg-yellow-950/40',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  AAP: {
    name: 'Aam Aadmi Party',
    hindiName: 'आप (आम आदमी पार्टी)',
    symbolName: 'Broom',
    symbolNameHi: 'झाड़ू',
    color: '#0EA5E9',
    secondaryColor: '#0284C7',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-800'
  },
  IND: {
    name: 'Independent',
    hindiName: 'निर्दलीय',
    symbolName: 'Ballot Stamp',
    symbolNameHi: 'मतपत्र मुहर',
    color: '#64748B',
    secondaryColor: '#475569',
    bgLight: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-300 dark:border-slate-700'
  }
};

const DIMENSIONS = {
  xs: { box: 'w-4 h-4', px: 16, icon: 'w-3 h-3', text: 'text-[10px]' },
  sm: { box: 'w-5 h-5', px: 20, icon: 'w-3.5 h-3.5', text: 'text-xs' },
  md: { box: 'w-7 h-7', px: 28, icon: 'w-4 h-4', text: 'text-xs' },
  lg: { box: 'w-9 h-9', px: 36, icon: 'w-5 h-5', text: 'text-sm' },
  xl: { box: 'w-12 h-12', px: 48, icon: 'w-7 h-7', text: 'text-base' }
};

export const PartySymbol: React.FC<PartySymbolProps> = ({
  party,
  size = 'md',
  variant = 'badge',
  showName = false,
  className = ''
}) => {
  const code = (party || 'IND').toUpperCase().trim();
  const meta = PARTY_META[code] || PARTY_META.IND;
  const dims = DIMENSIONS[size];

  // Official Crisp SVG Symbols
  const renderSvg = () => {
    switch (code) {
      case 'SP':
        // Samajwadi Party - Bicycle
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Rear Wheel */}
            <circle cx="10" cy="27" r="7" className="stroke-red-600 dark:stroke-red-500" strokeWidth="2.4" />
            <circle cx="10" cy="27" r="2" className="fill-red-600 dark:fill-red-500" />
            {/* Front Wheel */}
            <circle cx="30" cy="27" r="7" className="stroke-green-600 dark:stroke-green-500" strokeWidth="2.4" />
            <circle cx="30" cy="27" r="2" className="fill-green-600 dark:fill-green-500" />
            {/* Frame Triangle (Red) */}
            <path d="M10 27 L18 27 L24 16 L14 16 Z" className="stroke-red-600 dark:stroke-red-500" strokeWidth="2.2" />
            {/* Seat & Post */}
            <path d="M18 27 L13 14 M10 14 L16 14" className="stroke-slate-800 dark:stroke-white" strokeWidth="2.2" />
            {/* Front Fork & Handlebar */}
            <path d="M30 27 L25 12 M22 11 L28 11" className="stroke-slate-800 dark:stroke-white" strokeWidth="2.2" />
            {/* Chain Guard */}
            <line x1="10" y1="27" x2="18" y2="27" className="stroke-slate-700 dark:stroke-slate-300" strokeWidth="2" />
          </svg>
        );

      case 'BJP':
        // Bharatiya Janata Party - Lotus
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Central Saffron Petal */}
            <path d="M20 7 C18 13 18 19 20 25 C22 19 22 13 20 7 Z" className="fill-orange-500 stroke-orange-600" />
            {/* Left Petal */}
            <path d="M20 25 C14 23 9 17 11 11 C15 13 18 18 20 25 Z" className="fill-orange-400 stroke-orange-500" />
            {/* Right Petal */}
            <path d="M20 25 C26 23 31 17 29 11 C25 13 22 18 20 25 Z" className="fill-orange-400 stroke-orange-500" />
            {/* Outer Left Petal */}
            <path d="M20 25 C12 26 5 21 6 15 C10 17 15 21 20 25 Z" className="fill-orange-300 stroke-orange-400" />
            {/* Outer Right Petal */}
            <path d="M20 25 C28 26 35 21 34 15 C30 17 25 21 20 25 Z" className="fill-orange-300 stroke-orange-400" />
            {/* Green Calyx / Base Leaves */}
            <path d="M12 27 Q20 31 28 27 Q20 25 12 27 Z" className="fill-green-600 stroke-green-700" />
            <path d="M15 29 Q20 35 25 29" className="stroke-green-700" strokeWidth="2.5" />
          </svg>
        );

      case 'INC':
        // Indian National Congress - Open Hand
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Tricolor Ring Background */}
            <circle cx="20" cy="20" r="18" className="stroke-sky-500/30 dark:stroke-sky-400/30" strokeWidth="1.5" />
            {/* Palm & 5 Fingers */}
            <path 
              d="M13 21 L13 14 C13 12.5 14.5 12.5 14.5 14 L14.5 20 M14.5 14 L14.5 10 C14.5 8.5 16 8.5 16 10 L16 20 M16 10 L16 8.5 C16 7 17.5 7 17.5 8.5 L17.5 20 M17.5 9 L17.5 11 C17.5 9.5 19 9.5 19 11 L19 21 C19 24 18 27 15 29 C12 27 11 24 11 21 L11 18 C11 16.5 12.5 16.5 12.5 18 L12.5 21" 
              className="fill-sky-500/20 stroke-sky-600 dark:stroke-sky-400" 
              strokeWidth="2.2"
              transform="translate(4, 2)"
            />
            {/* Tiranga Accent Lines */}
            <line x1="14" y1="33" x2="26" y2="33" className="stroke-orange-500" strokeWidth="2.5" />
            <line x1="14" y1="36" x2="26" y2="36" className="stroke-green-600" strokeWidth="2.5" />
          </svg>
        );

      case 'BSP':
        // Bahujan Samaj Party - Elephant
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Proud Elephant Silhouette in Blue */}
            <path 
              d="M10 28 L10 22 C10 16 14 12 22 12 C28 12 32 15 33 19 C34 22 33 24 31 23 C29 22 28 20 28 18 C28 16 25 15 22 15 C17 15 14 18 14 22 L14 28 M18 28 L18 23 M26 28 L26 23 M30 28 L30 22" 
              className="fill-blue-600 stroke-blue-700 dark:fill-blue-500 dark:stroke-blue-400"
              strokeWidth="2.5"
            />
            {/* Raised Trunk */}
            <path d="M31 19 C34 18 36 15 35 13 C34 11 32 12 31 14" className="stroke-blue-700 dark:stroke-blue-400" strokeWidth="2.5" />
            {/* Tusk */}
            <path d="M28 20 L31 22" className="stroke-amber-200" strokeWidth="2" />
          </svg>
        );

      case 'RLD':
        // Rashtriya Lok Dal - Hand Pump
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Pump Body */}
            <rect x="17" y="14" width="6" height="15" className="fill-emerald-600 stroke-emerald-700 dark:stroke-emerald-400" rx="1" />
            {/* Base */}
            <line x1="12" y1="32" x2="28" y2="32" className="stroke-emerald-800 dark:stroke-emerald-300" strokeWidth="3" />
            <line x1="15" y1="29" x2="25" y2="29" className="stroke-emerald-700" strokeWidth="2" />
            {/* Spout */}
            <path d="M17 21 L11 21 L10 24" className="stroke-emerald-700 dark:stroke-emerald-400" strokeWidth="2.5" />
            {/* Pump Handle */}
            <path d="M20 14 L20 10 L32 16" className="stroke-emerald-800 dark:stroke-emerald-300" strokeWidth="2.5" />
            <circle cx="32" cy="16" r="2" className="fill-emerald-700 dark:fill-emerald-400" />
          </svg>
        );

      case 'ASPKR':
        // Azad Samaj Party - Kettle
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Kettle Body */}
            <ellipse cx="20" cy="24" rx="9" ry="7" className="fill-purple-600 stroke-purple-700 dark:fill-purple-500 dark:stroke-purple-400" />
            {/* Kettle Lid & Knob */}
            <rect x="16" y="15" width="8" height="3" rx="1" className="fill-purple-700 stroke-purple-800" />
            <circle cx="20" cy="13" r="1.5" className="fill-purple-800 dark:fill-purple-300" />
            {/* Spout */}
            <path d="M12 23 L7 19 L7 17 L11 20" className="fill-purple-600 stroke-purple-700" />
            {/* Top Handle */}
            <path d="M15 15 C15 8 25 8 25 15" className="stroke-purple-800 dark:stroke-purple-300" strokeWidth="2.5" />
          </svg>
        );

      case 'ADAL':
      case 'AD':
        // Apna Dal - Cup & Saucer
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Cup Body */}
            <path d="M13 16 L27 16 C27 24 23 26 20 26 C17 26 13 24 13 16 Z" className="fill-amber-500 stroke-amber-600 dark:fill-amber-600 dark:stroke-amber-400" />
            {/* Cup Handle */}
            <path d="M27 18 C31 18 31 23 26 23" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2" />
            {/* Saucer Plate */}
            <ellipse cx="20" cy="28" rx="12" ry="2.5" className="fill-amber-600 stroke-amber-700 dark:stroke-amber-300" />
            {/* Steam waves */}
            <path d="M17 13 Q18 10 17 8 M20 13 Q21 9 20 7 M23 13 Q24 10 23 8" className="stroke-amber-500" strokeWidth="1.5" />
          </svg>
        );

      case 'SBSP':
        // SBSP - Walking Stick
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Hook & Shaft */}
            <path d="M17 14 C17 9 24 9 24 14 L24 33" className="stroke-yellow-600 dark:stroke-yellow-400" strokeWidth="3" />
            <line x1="22" y1="33" x2="26" y2="33" className="stroke-slate-800" strokeWidth="3" />
          </svg>
        );

      case 'AAP':
        // AAP - Broom
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="30" y1="10" x2="20" y2="20" className="stroke-cyan-800 dark:stroke-cyan-300" strokeWidth="3" />
            <path d="M20 20 L10 28 L14 32 L22 22 Z" className="fill-cyan-500 stroke-cyan-600" />
            <path d="M9 29 L7 32 M12 31 L11 34 M15 32 L15 35" className="stroke-cyan-700" strokeWidth="2" />
          </svg>
        );

      default:
        // Independent / Other - Ballot Seal Stamp
        return (
          <svg viewBox="0 0 40 40" className={`${dims.icon} fill-none`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="20" cy="20" r="14" className="stroke-slate-400 dark:stroke-slate-500" strokeDasharray="2 2" />
            <circle cx="20" cy="20" r="8" className="stroke-slate-500 dark:stroke-slate-400" />
            <path d="M16 20 L19 23 L25 17" className="stroke-slate-600 dark:stroke-slate-300" strokeWidth="2.5" />
          </svg>
        );
    }
  };

  if (variant === 'icon') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`} title={`${meta.name} (${meta.symbolName})`}>
        {renderSvg()}
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span 
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${meta.bgLight} ${meta.textColor} ${meta.borderColor} ${className}`}
        title={`${meta.name} — चुनाव चिन्ह: ${meta.symbolNameHi}`}
      >
        <span className="shrink-0">{renderSvg()}</span>
        <span className="font-mono font-bold">{code}</span>
        {showName && <span className="opacity-90 font-medium text-[11px]">({meta.symbolNameHi})</span>}
      </span>
    );
  }

  // Default: badge
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${meta.bgLight} ${meta.textColor} ${meta.borderColor} shadow-xs transition-transform hover:scale-105 ${className}`}
      title={`${meta.name} — चुनाव चिन्ह: ${meta.symbolNameHi} (${meta.symbolName})`}
    >
      <div className={`${dims.box} rounded-md bg-white dark:bg-slate-900/90 flex items-center justify-center shadow-xs shrink-0 border border-slate-200/50 dark:border-slate-700/50`}>
        {renderSvg()}
      </div>
      <div className="flex flex-col text-left">
        <span className="font-mono font-bold leading-none">{code}</span>
        {showName && (
          <span className="text-[10px] opacity-80 leading-tight mt-0.5 truncate max-w-[120px]">
            {meta.symbolNameHi}
          </span>
        )}
      </div>
    </div>
  );
};
