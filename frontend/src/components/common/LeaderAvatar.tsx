import React, { useState } from 'react';
import { PartySymbol } from './PartySymbol';

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
  'RAJ NATH SINGH': '/assets/leaders/rajnath_singh.jpg',
  'MAYAWATI': '/assets/leaders/mayawati.jpg',
  'CHANDRASHEKHAR': '/assets/leaders/chandrashekhar_azad.jpg',
  'CHANDRASHEKHAR AZAD': '/assets/leaders/chandrashekhar_azad.jpg',
  'CHANDRA SHEKHAR': '/assets/leaders/chandrashekhar_azad.jpg',
  'JAYANT CHAUDHARY': '/assets/leaders/jayant_chaudhary.jpg',
  'AFZAL ANSARI': '/assets/leaders/afzal_ansari.jpg',
  'HEMA MALINI': '/assets/leaders/hema_malini.jpg',
  'HEMAMALINI DHARMENDRA DEOL': '/assets/leaders/hema_malini.jpg',
  'SMRITI IRANI': '/assets/leaders/smriti_irani.jpg',
  'RAVINDRA SHUKLA ALIAS RAVI KISHAN': '/assets/leaders/ravi_kishan.jpg',
  'RAVI KISHAN': '/assets/leaders/ravi_kishan.jpg',
  'SHIVPAL SINGH YADAV': '/assets/leaders/shivpal_yadav.jpg',
  'SHIVPAL YADAV': '/assets/leaders/shivpal_yadav.jpg',
  'ANUPRIYA PATEL': '/assets/leaders/anupriya_patel.jpg',
  'KESHAV PRASAD MAURYA': '/assets/leaders/keshav_maurya.jpg',
  'BRAJESH PATHAK': '/assets/leaders/brajesh_pathak.jpg',
  'OM PRAKASH RAJBHAR': '/assets/leaders/op_rajbhar.jpg',
  'IMRAN MASOOD': '/assets/leaders/imran_masood.jpg',
  'ARUN GOVIL': '/assets/leaders/arun_govil.jpg',
  'MAHESH SHARMA': '/assets/leaders/mahesh_sharma.jpg',
  'DR. MAHESH SHARMA': '/assets/leaders/mahesh_sharma.jpg',
  'SATISH GAUTAM': '/assets/leaders/satish_gautam.jpg',
  'SATISH KUMAR GAUTAM': '/assets/leaders/satish_gautam.jpg',
  'RAJKUMAR CHAHAR': '/assets/leaders/rajkumar_chahar.jpg',
  'JITIN PRASADA': '/assets/leaders/jitin_prasada.jpg',
  'ANAND BHADAURIYA': '/assets/leaders/anand_bhadauriya.jpg',
  'SAKSHI MAHARAJ': '/assets/leaders/sakshi_maharaj.jpg',
  'SWAMI SACHCHIDANAND HARI SAKSHI': '/assets/leaders/sakshi_maharaj.jpg',
  'KISHORI LAL': '/assets/leaders/kishori_lal_sharma.jpg',
  'KISHORI LAL SHARMA': '/assets/leaders/kishori_lal_sharma.jpg',
  'PUSHPENDRA SAROJ': '/assets/leaders/pushpendra_saroj.jpg',
  'KARAN BHUSHAN SINGH': '/assets/leaders/karan_bhushan_singh.jpg',
  'KIRTIVARDHAN SINGH': '/assets/leaders/kirtivardhan_singh.jpg',
  'JAGDAMBIKA PAL': '/assets/leaders/jagdambika_pal.jpg',
  'PANKAJ CHAUDHARY': '/assets/leaders/pankaj_chaudhary.jpg',
  'BABU SINGH KUSHWAHA': '/assets/leaders/babu_singh_kushwaha.jpg',
  'PRIYA SAROJ': '/assets/leaders/priya_saroj.jpg',
  'DANISH ALI': '/assets/leaders/danish_ali.jpg',
  'KUNWAR DANISH ALI': '/assets/leaders/danish_ali.jpg',
  'DINESH LAL YADAV': '/assets/leaders/dinesh_lal_yadav.jpg',
  'NIRAHUA': '/assets/leaders/dinesh_lal_yadav.jpg',
  'VARUN GANDHI': '/assets/leaders/varun_gandhi.jpg',
  'S P SINGH BAGHEL': '/assets/leaders/sp_singh_baghel.jpg',
  'PROF S P SINGH BAGHEL': '/assets/leaders/sp_singh_baghel.jpg',
  'AKSHAYA YADAV': '/assets/leaders/akshay_yadav.jpg',
  'AKSHAY YADAV': '/assets/leaders/akshay_yadav.jpg',
  'ARUN KUMAR SAGAR': '/assets/leaders/arun_kumar_sagar.jpg',
  'MUKESH RAJPUT': '/assets/leaders/mukesh_rajput.jpg',
  'TANUJ PUNIA': '/assets/leaders/tanuj_punia.jpg',
  'AVTAR SINGH BHADANA': '/assets/leaders/avtar_singh_bhadana.jpg',
  'POONAM SINHA': '/assets/leaders/poonam_sinha.jpg'
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
          /* High-impact official political identity card with party symbol & initials */
          <div 
            className="w-full h-full flex flex-col items-center justify-between p-1 relative overflow-hidden"
            style={{
              background: partyColor 
                ? `linear-gradient(145deg, ${partyColor}18 0%, ${partyColor}35 100%)`
                : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)'
            }}
          >
            {/* Top party accent line */}
            <div 
              className="w-full h-0.5 rounded-full shrink-0"
              style={{ backgroundColor: partyColor || '#64748B' }}
            />

            {/* Official Party Symbol embedded prominently in center */}
            <div className="flex-1 flex items-center justify-center my-0.5 scale-110">
              <PartySymbol party={party} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} variant="icon" />
            </div>

            {/* Candidate Initials Badge */}
            <span 
              className={`font-mono font-black leading-none pb-0.5 tracking-tight ${cfg.initialsText}`}
              style={{ color: partyColor || '#1e293b' }}
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
