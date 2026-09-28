import React, { useState } from 'react';
import { PartySymbol } from './PartySymbol';
import { User } from 'lucide-react';

export interface LeaderAvatarProps {
  name: string;
  candidateId?: number;
  party?: string;
  partyColor?: string;
  photoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'passport' | 'circle';
  showBadge?: boolean;
  onClick?: () => void;
  className?: string;
}

const LOCAL_PORTRAIT_MAP: Record<string, string> = {
  'AKHILESH YADAV': '/assets/leaders/akhilesh_yadav.jpg',
  'YOGI ADITYANATH': '/assets/leaders/yogi_adityanath.jpg',
  'ADITYANATH': '/assets/leaders/yogi_adityanath.jpg',
  'RAHUL GANDHI': '/assets/leaders/rahul_gandhi.jpg',
  'DIMPLE YADAV': '/assets/leaders/dimple_yadav.jpg',
  'NARENDRA MODI': '/assets/leaders/narendra_modi.jpg',
  'RAJNATH SINGH': '/assets/leaders/rajnath_singh.jpg',
  'MAYAWATI': '/assets/leaders/mayawati.jpg',
  'CHANDRASHEKHAR': '/assets/leaders/chandrashekhar_azad.jpg',
  'CHANDRASHEKHAR AZAD': '/assets/leaders/chandrashekhar_azad.jpg',
  'JAYANT CHAUDHARY': '/assets/leaders/jayant_chaudhary.jpg',
  'AFZAL ANSARI': '/assets/leaders/afzal_ansari.jpg',
  'HEMA MALINI': '/assets/leaders/hema_malini.jpg',
  'SMRITI IRANI': '/assets/leaders/smriti_irani.jpg',
  'RAVINDRA SHUKLA ALIAS RAVI KISHAN': '/assets/leaders/ravi_kishan.jpg',
  'RAVI KISHAN': '/assets/leaders/ravi_kishan.jpg',
  'SHIVPAL SINGH YADAV': '/assets/leaders/shivpal_yadav.jpg',
  'ANUPRIYA PATEL': '/assets/leaders/anupriya_patel.jpg',
  'KESHAV PRASAD MAURYA': '/assets/leaders/keshav_maurya.jpg',
  'BRAJESH PATHAK': '/assets/leaders/brajesh_pathak.jpg',
  'OM PRAKASH RAJBHAR': '/assets/leaders/op_rajbhar.jpg'
};

const SIZE_CONFIGS = {
  xs: {
    container: 'w-7 h-8',
    circle: 'w-7 h-7',
    img: 'w-7 h-8',
    badgeSize: 'xs' as const,
    badgeOffset: '-bottom-1 -right-1',
    initialsText: 'text-[10px]'
  },
  sm: {
    container: 'w-9 h-10',
    circle: 'w-9 h-9',
    img: 'w-9 h-10',
    badgeSize: 'xs' as const,
    badgeOffset: '-bottom-1 -right-1',
    initialsText: 'text-xs'
  },
  md: {
    container: 'w-11 h-13',
    circle: 'w-11 h-11',
    img: 'w-11 h-13',
    badgeSize: 'sm' as const,
    badgeOffset: '-bottom-1.5 -right-1.5',
    initialsText: 'text-xs'
  },
  lg: {
    container: 'w-14 h-16',
    circle: 'w-14 h-14',
    img: 'w-14 h-16',
    badgeSize: 'sm' as const,
    badgeOffset: '-bottom-1.5 -right-1.5',
    initialsText: 'text-sm'
  },
  xl: {
    container: 'w-20 h-24',
    circle: 'w-20 h-20',
    img: 'w-20 h-24',
    badgeSize: 'md' as const,
    badgeOffset: '-bottom-2 -right-2',
    initialsText: 'text-base font-bold'
  }
};

export const LeaderAvatar: React.FC<LeaderAvatarProps> = ({
  name,
  candidateId,
  party = 'IND',
  partyColor,
  photoUrl,
  size = 'md',
  shape = 'passport',
  showBadge = true,
  onClick,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const cfg = SIZE_CONFIGS[size];

  // Resolve image source
  let resolvedSrc = photoUrl;
  if (!resolvedSrc && name) {
    const upper = name.trim().toUpperCase();
    for (const [k, src] of Object.entries(LOCAL_PORTRAIT_MAP)) {
      if (upper.includes(k) || k.includes(upper)) {
        resolvedSrc = src;
        break;
      }
    }
  }

  // Generate clean initials
  const initials = (name || 'UP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 select-none ${isClickable ? 'cursor-pointer group' : ''} ${className}`}
      title={`${name} (${party}) — नेताजी प्रोफाइल देखें`}
    >
      {/* Photo Frame */}
      <div
        className={`overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs transition-all duration-200 ${
          shape === 'circle' ? `rounded-full ${cfg.circle}` : `rounded-lg ${cfg.container}`
        } ${isClickable ? 'group-hover:border-blue-500 group-hover:shadow-md group-hover:scale-105' : ''}`}
        style={partyColor ? { borderColor: `${partyColor}80` } : undefined}
      >
        {resolvedSrc && !imgError ? (
          <img
            src={resolvedSrc}
            alt={name}
            className={`w-full h-full object-cover object-top transition-transform duration-200 ${
              isClickable ? 'group-hover:scale-110' : ''
            }`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          /* Graceful stylized political profile avatar fallback */
          <div 
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
            style={{
              background: partyColor 
                ? `linear-gradient(135deg, ${partyColor}25 0%, ${partyColor}10 100%)`
                : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
            }}
          >
            <User className="w-1/2 h-1/2 opacity-40 text-slate-700 dark:text-slate-300" />
            <span 
              className={`font-mono font-bold leading-none mt-0.5 ${cfg.initialsText}`}
              style={{ color: partyColor || '#475569' }}
            >
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Official Party Watermark Badge in Bottom-Right Corner */}
      {showBadge && party && (
        <div 
          className={`absolute ${cfg.badgeOffset} z-10 rounded-full shadow-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 transition-transform duration-150 ${
            isClickable ? 'group-hover:scale-110' : ''
          }`}
        >
          <PartySymbol party={party} size={cfg.badgeSize} variant="icon" />
        </div>
      )}
    </div>
  );
};
