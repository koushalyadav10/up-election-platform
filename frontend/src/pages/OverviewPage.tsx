import React, { useEffect, useState } from 'react';
import { 
  fetchStateOverview, 
  StateOverview, 
  fetchCloseContests, 
  CloseContestItem 
} from '../services/api';
import { UPMap } from '../components/maps/UPMap';
import { SourceBadge } from '../components/common/SourceBadge';
import { PartySeatsModal } from '../components/common/PartySeatsModal';
import { ACDossierModal } from '../components/common/ACDossierModal';
import { MobileExploreHub } from '../components/layout/MobileExploreHub';
import { LeaderAvatar } from '../components/common/LeaderAvatar';
import { LeaderDossierModal } from '../components/common/LeaderDossierModal';
import { PartySymbol } from '../components/common/PartySymbol';
import { 
  Layers, 
  Users, 
  Vote, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Search,
  ExternalLink,
  ChevronRight,
  Building2,
  Landmark,
  Scale,
  GitCompare,
  Activity,
  Bot,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OverviewPageProps {
  onSelectPC: (pcId: number) => void;
  onNavigateTab: (tab: string) => void;
  onOpenSearch: () => void;
  selectedElection?: { year: number; type: string };
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onSelectPC,
  onNavigateTab,
  onOpenSearch,
  selectedElection
}) => {
  const { language, t } = useLanguage();
  const [overview, setOverview] = useState<StateOverview | null>(null);
  const [closestContests, setClosestContests] = useState<CloseContestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartyModal, setSelectedPartyModal] = useState<{
    code: string;
    name: string;
    color: string;
  } | null>(null);
  const [modalACNo, setModalACNo] = useState<number | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<{ name: string; candidateId?: number } | null>(null);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const yr = selectedElection ? selectedElection.year : 2024;
    const typ = selectedElection ? selectedElection.type : 'Lok Sabha';
    Promise.all([
      fetchStateOverview(yr, typ),
      fetchCloseContests(10000)
    ]).then(([ovData, closeData]) => {
      setOverview(ovData);
      setClosestContests(closeData.contests.slice(0, 5));
      setLoading(false);
    }).catch(err => {
      console.error("Error loading overview:", err);
      setLoading(false);
    });
  }, [selectedElection]);

  if (loading || !overview) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <div className="text-sm font-mono text-slate-500">Accessing certified ECI electoral intelligence warehouse...</div>
      </div>
    );
  }

  const { summary, party_tally } = overview;

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. Command Center Hero Banner */}
      <section className="relative pt-6 sm:pt-8 pb-6 px-4 sm:px-8 lg:px-10 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
          {/* Left: Text content */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> ECI CERTIFIED REPOSITORY (1991–2024)
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                Delimitation Standard: 2008_CURRENT • Zero Contamination Architecture
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              UP ELECTORAL INTELLIGENCE
              <span className="block text-base sm:text-xl lg:text-2xl text-blue-400 mt-1 font-semibold">
                Comprehensive Electoral Data Warehouse &amp; Analytical Command Center
              </span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Data-driven electoral analysis across Uttar Pradesh. Complete coverage of all 80 Parliamentary Seats, 403 Assembly Constituencies, and 75 Administrative Districts.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenSearch}
                className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Global Analytical Search (Ctrl+K)</span>
              </button>
              <button
                onClick={() => onNavigateTab('districts')}
                className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Explore 75 Districts</span>
              </button>
              <button
                onClick={() => onNavigateTab('ask-ai')}
                className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-300" />
                <span>Ask Electra AI</span>
              </button>
            </div>
          </div>

          {/* Right: Animated SVG Electoral Data Visualization */}
          <div className="hidden lg:flex items-center justify-center w-72 xl:w-80 shrink-0">
            <svg viewBox="0 0 280 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bjpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#be123c" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="bspGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.6"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              
              {/* Outer ring - animated */}
              <circle cx="140" cy="110" r="95" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="1"/>
              <circle cx="140" cy="110" r="95" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1" strokeDasharray="10 20" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" values="0 140 110;360 140 110" dur="30s" repeatCount="indefinite"/>
              </circle>
              
              {/* Middle ring */}
              <circle cx="140" cy="110" r="70" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="0.5"/>
              
              {/* UP Map silhouette (simplified polygon) */}
              <polygon
                points="80,70 100,55 130,50 160,52 185,58 200,72 210,88 205,108 195,125 175,138 155,148 135,150 110,145 92,132 78,115 70,95"
                fill="rgba(59,130,246,0.08)"
                stroke="rgba(59,130,246,0.4)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              
              {/* Election result bars - BJP */}
              <rect x="50" y="160" width="24" height="0" fill="url(#bjpGrad)" rx="3" filter="url(#glow)">
                <animate attributeName="height" from="0" to="45" dur="1.2s" fill="freeze" begin="0.2s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94"/>
                <animate attributeName="y" from="205" to="160" dur="1.2s" fill="freeze" begin="0.2s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94"/>
              </rect>
              <text x="62" y="158" textAnchor="middle" fontSize="7" fill="#f97316" fontFamily="monospace" fontWeight="bold">
                <tspan opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="1.2s"/>BJP</tspan>
              </text>
              <text x="62" y="214" textAnchor="middle" fontSize="6" fill="rgba(148,163,184,0.8)" fontFamily="monospace">36%</text>
              
              {/* SP bar */}
              <rect x="80" y="175" width="24" height="0" fill="url(#spGrad)" rx="3" filter="url(#glow)">
                <animate attributeName="height" from="0" to="30" dur="1.2s" fill="freeze" begin="0.4s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94"/>
                <animate attributeName="y" from="205" to="175" dur="1.2s" fill="freeze" begin="0.4s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94"/>
              </rect>
              <text x="92" y="173" textAnchor="middle" fontSize="7" fill="#e11d48" fontFamily="monospace" fontWeight="bold">
                <tspan opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="1.4s"/>SP</tspan>
              </text>
              <text x="92" y="214" textAnchor="middle" fontSize="6" fill="rgba(148,163,184,0.8)" fontFamily="monospace">32%</text>
              
              {/* BSP bar */}
              <rect x="110" y="185" width="24" height="0" fill="url(#bspGrad)" rx="3" filter="url(#glow)">
                <animate attributeName="height" from="0" to="20" dur="1.2s" fill="freeze" begin="0.6s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94"/>
                <animate attributeName="y" from="205" to="185" dur="1.2s" fill="freeze" begin="0.6s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94"/>
              </rect>
              <text x="122" y="183" textAnchor="middle" fontSize="7" fill="#3b82f6" fontFamily="monospace" fontWeight="bold">
                <tspan opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="1.6s"/>BSP</tspan>
              </text>
              <text x="122" y="214" textAnchor="middle" fontSize="6" fill="rgba(148,163,184,0.8)" fontFamily="monospace">13%</text>

              {/* INC bar */}
              <rect x="140" y="190" width="24" height="0" fill="url(#incGrad)" rx="3" filter="url(#glow)">
                <animate attributeName="height" from="0" to="15" dur="1.2s" fill="freeze" begin="0.8s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94"/>
                <animate attributeName="y" from="205" to="190" dur="1.2s" fill="freeze" begin="0.8s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94"/>
              </rect>
              <text x="152" y="188" textAnchor="middle" fontSize="7" fill="#22c55e" fontFamily="monospace" fontWeight="bold">
                <tspan opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="1.8s"/>INC</tspan>
              </text>
              <text x="152" y="214" textAnchor="middle" fontSize="6" fill="rgba(148,163,184,0.8)" fontFamily="monospace">6%</text>
              
              {/* Baseline */}
              <line x1="44" y1="205" x2="180" y2="205" stroke="rgba(148,163,184,0.3)" strokeWidth="0.5"/>
              
              {/* Orbiting dots */}
              <circle cx="140" cy="15" r="4" fill="#f97316" filter="url(#glow)">
                <animateTransform attributeName="transform" type="rotate" values="0 140 110;360 140 110" dur="8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="140" cy="15" r="2" fill="#e11d48" filter="url(#glow)">
                <animateTransform attributeName="transform" type="rotate" values="120 140 110;480 140 110" dur="8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="140" cy="15" r="3" fill="#3b82f6" filter="url(#glow)">
                <animateTransform attributeName="transform" type="rotate" values="240 140 110;600 140 110" dur="8s" repeatCount="indefinite"/>
              </circle>
              
              {/* Center: 403 ACs label */}
              <text x="140" y="104" textAnchor="middle" fontSize="18" fill="white" fontFamily="monospace" fontWeight="bold" filter="url(#glow)" opacity="0">
                <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" begin="0.8s"/>403
              </text>
              <text x="140" y="116" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.8)" fontFamily="monospace" opacity="0">
                <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" begin="1s"/>ASSEMBLY SEATS</text>
              
              {/* Corner labels */}
              <text x="200" y="65" fontSize="8" fill="rgba(148,163,184,0.6)" fontFamily="monospace">80 PCs</text>
              <text x="200" y="77" fontSize="8" fill="rgba(148,163,184,0.6)" fontFamily="monospace">75 Dists</text>
              
              {/* Pulse rings */}
              <circle cx="140" cy="110" r="20" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1">
                <animate attributeName="r" values="20;40" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0" dur="2.5s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
        </div>
      </section>
 
      {/* 1.5 Mobile-Only Dedicated Navigation & Exploration Card Hub */}
      <MobileExploreHub
        onNavigateTab={onNavigateTab}
        onOpenSearch={onOpenSearch}
        onOpenLeaderDossier={(name, candidateId) => {
          setSelectedLeader({ name, candidateId });
          setIsLeaderModalOpen(true);
        }}
      />

      {/* 2. Headline Database KPIs Ribbon */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Parliamentary</span>
          <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">80 PCs</div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">100% Mapped</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Assembly Segments</span>
          <div className="font-display font-extrabold text-2xl text-blue-600 dark:text-blue-400 mt-0.5">403 ACs</div>
          <span className="text-[10px] text-blue-500 font-semibold mt-0.5 block">Full Dossiers Available</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Districts</span>
          <div className="font-display font-extrabold text-2xl text-indigo-600 dark:text-indigo-400 mt-0.5">75 Districts</div>
          <span className="text-[10px] text-indigo-500 font-semibold mt-0.5 block">District Intelligence</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Total Electors (UP)</span>
          <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">15.34 Cr</div>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">153,403,322 registered</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">2024 Turnout</span>
          <div className="font-display font-extrabold text-2xl text-emerald-600 mt-0.5">{summary.turnout_pct}%</div>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">87.9M votes polled</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ECI Primary Files</span>
          <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">75 Files</div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">1991–2024 Archive</span>
        </div>
      </section>

      {/* 3. Centerpiece: Dual-Layer UP Interactive Map */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                Interactive Electoral Geometry Center
              </h2>
              <SourceBadge type="OFFICIAL" document="ECI Boundaries" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between Parliamentary (80 PCs) and Assembly (403 ACs) choropleth layers with multi-year election switching.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => onNavigateTab('map')}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Expand Map View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <UPMap 
          onSelectPC={onSelectPC} 
          onSelectAC={(acNo) => setModalACNo(acNo)}
          initialChamber="Parliamentary"
        />
      </section>

      {/* 4. Core Navigation Command Hub */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            Electoral Intelligence Modules &amp; Labs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dedicated research environments for deep constituency and cycle-over-cycle investigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Tile 1: District Intelligence */}
          <div 
            onClick={() => onNavigateTab('districts')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                District Intelligence (75)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Aggregated political intelligence across all 75 Uttar Pradesh administrative districts with constituent AC/PC linkages.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 flex items-center justify-between">
              <span>View Districts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tile 2: AC Comparison Lab */}
          <div 
            onClick={() => onNavigateTab('ac-comparison')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-3">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                AC Comparison Lab
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Compare 2 to 4 assembly constituencies side-by-side across competitiveness indices, historical turns, and margins.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 flex items-center justify-between">
              <span>Open Comparator</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tile 3: Election Comparison Lab */}
          <div 
            onClick={() => onNavigateTab('election-comparison')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-3">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                Election Comparison Lab
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Compare election cycles (2024 LS leads vs 2022 VS, 2022 vs 2017) with verified 'What Changed?' analytical synthesis.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-purple-600 flex items-center justify-between">
              <span>Analyze Shifts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tile 4: Data Quality & Provenance */}
          <div 
            onClick={() => onNavigateTab('data-quality')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Data Quality Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Automated auditing of 8 health dimensions, cryptographic provenance checksums, and dataset verification status.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-600 flex items-center justify-between">
              <span>Audit 8 Dimensions</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. Closest Contests Spotlight */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Closest Contests Spotlight (Victory Margins &lt; 10,000 Votes)
            </h3>
            <p className="text-xs text-slate-500">
              Constituencies decided by razor-thin margins in the latest general election.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('close-contests')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-auto"
          >
            View all close contests →
          </button>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">PC #</th>
                <th className="p-3">Parliamentary Seat</th>
                <th className="p-3">Winner Candidate</th>
                <th className="p-3">Runner-Up Candidate</th>
                <th className="p-3 text-right">Margin</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {closestContests.map(c => (
                <tr key={c.pc_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-500">{c.pc_no}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{c.pc_name}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <LeaderAvatar
                        name={c.winner_name}
                        candidateId={c.winner_candidate_id}
                        party={c.winner_party}
                        partyColor={c.winner_party_color}
                        size="xs"
                        shape="passport"
                        showBadge={true}
                        onClick={() => {
                          setSelectedLeader({ name: c.winner_name, candidateId: c.winner_candidate_id });
                          setIsLeaderModalOpen(true);
                        }}
                      />
                      <div className="flex flex-col">
                        <button
                          onClick={() => {
                            setSelectedLeader({ name: c.winner_name, candidateId: c.winner_candidate_id });
                            setIsLeaderModalOpen(true);
                          }}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors truncate max-w-[130px] sm:max-w-[180px]"
                        >
                          {c.winner_name}
                        </button>
                        <div className="mt-0.5">
                          <PartySymbol party={c.winner_party} size="xs" variant="pill" showName={false} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <LeaderAvatar
                        name={c.runner_up_name}
                        candidateId={c.runner_up_candidate_id}
                        party={c.runner_up_party}
                        partyColor={c.runner_up_party_color}
                        size="xs"
                        shape="passport"
                        showBadge={true}
                        onClick={() => {
                          setSelectedLeader({ name: c.runner_up_name, candidateId: c.runner_up_candidate_id });
                          setIsLeaderModalOpen(true);
                        }}
                      />
                      <div className="flex flex-col">
                        <button
                          onClick={() => {
                            setSelectedLeader({ name: c.runner_up_name, candidateId: c.runner_up_candidate_id });
                            setIsLeaderModalOpen(true);
                          }}
                          className="font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors truncate max-w-[130px] sm:max-w-[180px]"
                        >
                          {c.runner_up_name}
                        </button>
                        <div className="mt-0.5">
                          <PartySymbol party={c.runner_up_party} size="xs" variant="pill" showName={false} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-red-600 dark:text-red-400">
                    {c.margin.toLocaleString()} votes
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedLeader({ name: c.winner_name, candidateId: c.winner_candidate_id });
                          setIsLeaderModalOpen(true);
                        }}
                        className="px-2 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg font-bold hover:bg-amber-100 transition-colors text-[11px] whitespace-nowrap"
                        title="विजेता नेताजी का चुनावी इतिहास देखें"
                      >
                        नेताजी प्रोफाइल 👤
                      </button>
                      <button
                        onClick={() => onSelectPC(c.pc_id)}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg font-bold hover:bg-blue-100 transition-colors text-[11px] whitespace-nowrap"
                      >
                        PC Dossier →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Embedded AC Dossier Modal */}
      <ACDossierModal
        acNo={modalACNo}
        isOpen={modalACNo !== null}
        onClose={() => setModalACNo(null)}
      />

      {/* Embedded Leader & Netaji Dossier Modal */}
      <LeaderDossierModal
        candidateId={selectedLeader?.candidateId}
        candidateName={selectedLeader?.name}
        isOpen={isLeaderModalOpen}
        onClose={() => {
          setIsLeaderModalOpen(false);
          setSelectedLeader(null);
        }}
      />

    </div>
  );
};
