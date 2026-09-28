import React, { useState, useEffect } from 'react';
import { 
  fetchStrategySummary, 
  fetchStrategyMatrix, 
  simulateStrategySwing, 
  fetchACStrategyDetail,
  StrategySummary, 
  StrategyMatrixItem, 
  SwingSimulationResult,
  ACStrategyDetail 
} from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { 
  Target, 
  TrendingUp, 
  Sliders, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Search, 
  MapPin, 
  ArrowUpRight, 
  ChevronRight, 
  Download, 
  Printer, 
  Layers, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Vote,
  Sparkles,
  BarChart2
} from 'lucide-react';

export const RoadTo2027Page: React.FC = () => {
  const [summary, setSummary] = useState<StrategySummary | null>(null);
  const [matrix, setMatrix] = useState<StrategyMatrixItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [leadPartyFilter, setLeadPartyFilter] = useState<string>('ALL');
  const [winner2022Filter, setWinner2022Filter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAC, setSelectedAC] = useState<ACStrategyDetail | null>(null);
  const [acModalLoading, setAcModalLoading] = useState<boolean>(false);

  // Simulation Controls
  const [spSwing, setSpSwing] = useState<number>(0.0);
  const [bjpSwing, setBjpSwing] = useState<number>(0.0);
  const [bspTransfer, setBspTransfer] = useState<number>(0.0);
  const [simRegion, setSimRegion] = useState<string>('');
  const [simResult, setSimResult] = useState<SwingSimulationResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [showSimFlips, setShowSimFlips] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, matData] = await Promise.all([
        fetchStrategySummary(),
        fetchStrategyMatrix({})
      ]);
      setSummary(sumData);
      setMatrix(matData.items);
    } catch (err) {
      console.error("Error loading strategy data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await simulateStrategySwing({
        sp_swing_pct: spSwing,
        bjp_swing_pct: bjpSwing,
        bsp_transfer_to_sp_pct: bspTransfer,
        region_filter: simRegion || undefined
      });
      setSimResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetSim = () => {
    setSpSwing(0.0);
    setBjpSwing(0.0);
    setBspTransfer(0.0);
    setSimRegion('');
    setSimResult(null);
    setShowSimFlips(false);
  };

  const openACDossier = async (acNo: number) => {
    setAcModalLoading(true);
    try {
      const detail = await fetchACStrategyDetail(acNo);
      setSelectedAC(detail);
    } catch (err) {
      console.error("Failed to load AC detail:", err);
    } finally {
      setAcModalLoading(false);
    }
  };

  // Filtered matrix
  const filteredItems = matrix.filter(item => {
    if (activeCategory !== 'ALL') {
      if (activeCategory === 'BATTLEGROUND' && !item.is_battleground) return false;
      if (activeCategory === 'NEAR_MISS' && !item.is_near_miss) return false;
      if (activeCategory !== 'BATTLEGROUND' && activeCategory !== 'NEAR_MISS' && item.strategic_category !== activeCategory) return false;
    }
    if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false;
    if (leadPartyFilter !== 'ALL') {
      if (leadPartyFilter === 'INDIA' && !['SP', 'INC', 'AITC'].includes(item.lead_2024_party)) return false;
      if (leadPartyFilter === 'NDA' && !['BJP', 'RLD', 'ADAL', 'NINSHAD', 'SBSP'].includes(item.lead_2024_party)) return false;
      if (leadPartyFilter !== 'INDIA' && leadPartyFilter !== 'NDA' && item.lead_2024_party !== leadPartyFilter) return false;
    }
    if (winner2022Filter !== 'ALL') {
      if (item.winner_2022_party !== winner2022Filter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.ac_name.toLowerCase().includes(q);
      const matchDist = item.district.toLowerCase().includes(q);
      const matchPC = item.pc_name.toLowerCase().includes(q);
      const matchCand = item.lead_2024_candidate?.toLowerCase().includes(q);
      if (!matchName && !matchDist && !matchPC && !matchCand) return false;
    }
    return true;
  });

  const clearAllFilters = () => {
    setActiveCategory('ALL');
    setSelectedRegion('ALL');
    setLeadPartyFilter('ALL');
    setWinner2022Filter('ALL');
    setSearchQuery('');
  };

  const getPartyBadgeColor = (party: string) => {
    switch (party?.toUpperCase()) {
      case 'SP': return 'bg-[#16a34a]/15 text-[#15803d] border-[#16a34a]/30';
      case 'BJP': return 'bg-[#F37021]/15 text-[#c2410c] border-[#F37021]/30';
      case 'INC': return 'bg-[#0099FF]/15 text-[#0369a1] border-[#0099FF]/30';
      case 'RLD': return 'bg-[#006600]/15 text-[#166534] border-[#006600]/30';
      case 'ADAL': return 'bg-[#d97706]/15 text-[#b45309] border-[#d97706]/30';
      case 'BSP': return 'bg-[#2563eb]/15 text-[#1d4ed8] border-[#2563eb]/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryBadge = (category: string, isBattleground: boolean, isNearMiss: boolean) => {
    if (isBattleground) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40">
          <Flame className="w-3 h-3 text-orange-500" /> BATTLEGROUND &lt;5k
        </span>
      );
    }
    switch (category) {
      case 'FORTRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-200 dark:border-green-800/40">
            <ShieldCheck className="w-3 h-3 text-green-600" /> SP FORTRESS
          </span>
        );
      case 'PRIME_FLIP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" /> 2024 SP FLIP
          </span>
        );
      case 'ALLIANCE_FLIP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> ALLIANCE FLIP
          </span>
        );
      case 'DEFENSIVE_ALERT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/40">
            <ShieldAlert className="w-3 h-3 text-red-600" /> DEFENSE ALERT
          </span>
        );
      case 'NEAR_MISS_TARGET':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
            <Target className="w-3 h-3 text-amber-600" /> TARGET &lt;10k
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            OPPONENT BASE
          </span>
        );
    }
  };

  if (loading || !summary) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#B85C38] border-t-transparent mb-4"></div>
        <div className="text-sm font-mono text-[#626762] dark:text-[#A8ADA7]">
          Computing 2027 Vidhan Sabha Strategy Matrix across 403 Constituencies...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. Header & Command Center Introduction */}
      <div className="border-b border-[#E2DFD6] dark:border-[#2A302B] pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded bg-[#B85C38]/10 text-[#B85C38] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> STRATEGIC COMMAND CENTER
              </span>
              <SourceBadge type="OFFICIAL" document="ECI 2017-2024 Historical Multi-Election Matrix" />
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#171918] dark:text-[#F1EFE8] tracking-tight">
              Road to 2027: Mission 202+
            </h1>
            <p className="text-sm text-[#626762] dark:text-[#A8ADA7] mt-1.5 max-w-3xl leading-relaxed">
              Granular electoral translation mapping Uttar Pradesh's <strong>403 Vidhan Sabha constituencies</strong>. Translating 2024 Lok Sabha Assembly segment leads against 2022 Vidhan Sabha actuals to define the exact mathematical pathway to a commanding majority (202+ seats).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-[#1C201D] border border-[#D5D1C8] dark:border-[#353C37] text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#252B26] transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#626762]" />
              Print / Export Strategic Dossier
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Strategic KPI Filter Cards (Interactive) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#626762] dark:text-[#A8ADA7] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B85C38]" /> Interactive Strategic Cohorts (Click card to filter 403 ACs below)
          </span>
          {(activeCategory !== 'ALL' || leadPartyFilter !== 'ALL' || winner2022Filter !== 'ALL' || selectedRegion !== 'ALL' || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[#B85C38] hover:underline flex items-center gap-1"
            >
              Reset All Filters ({filteredItems.length} matching)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          {/* Card 1: 2024 INDIA Leads */}
          <div 
            onClick={() => {
              setLeadPartyFilter(leadPartyFilter === 'INDIA' ? 'ALL' : 'INDIA');
              setWinner2022Filter('ALL');
              setActiveCategory('ALL');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
              leadPartyFilter === 'INDIA'
                ? 'border-green-600 bg-green-50/80 dark:bg-green-950/30 ring-2 ring-green-600/30'
                : 'border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] hover:border-green-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
                2024 INDIA Leads
              </span>
              {leadPartyFilter === 'INDIA' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-green-700 dark:text-green-400 mt-1">
              {summary.india_leads_2024} <span className="text-xs font-normal text-gray-500">/ 403</span>
            </div>
            <div className="text-[11px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              SP: {summary.sp_leads_2024} | INC: {summary.inc_leads_2024}
            </div>
            <div className="mt-2 text-[10px] font-bold text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-950/50 px-1.5 py-0.5 rounded inline-block">
              {leadPartyFilter === 'INDIA' ? 'Active Filter: Showing 224' : `+${summary.india_leads_2024 - summary.majority_mark} Above Majority`}
            </div>
          </div>

          {/* Card 2: 2022 SP Won */}
          <div 
            onClick={() => {
              setWinner2022Filter(winner2022Filter === 'SP' ? 'ALL' : 'SP');
              setLeadPartyFilter('ALL');
              setActiveCategory('ALL');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
              winner2022Filter === 'SP'
                ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/30 ring-2 ring-emerald-600/30'
                : 'border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] hover:border-emerald-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#626762] dark:text-[#A8ADA7]">
                2022 SP Won
              </span>
              {winner2022Filter === 'SP' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-[#171918] dark:text-[#F1EFE8] mt-1">
              {summary.sp_actuals_2022}
            </div>
            <div className="text-[11px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              BJP Won: {summary.bjp_actuals_2022}
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded inline-block">
              {winner2022Filter === 'SP' ? 'Active Filter: 111 Seats' : '2022 Vidhan Sabha Base'}
            </div>
          </div>

          {/* Card 3: 2024 Prime Flips */}
          <div 
            onClick={() => {
              setActiveCategory(activeCategory === 'PRIME_FLIP' ? 'ALL' : 'PRIME_FLIP');
              setLeadPartyFilter('ALL');
              setWinner2022Filter('ALL');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
              activeCategory === 'PRIME_FLIP'
                ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/30 ring-2 ring-emerald-600/30'
                : 'border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] hover:border-emerald-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                2024 Prime Flips
              </span>
              {activeCategory === 'PRIME_FLIP' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-400 mt-1">
              96
            </div>
            <div className="text-[11px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              78 taken from BJP
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded inline-block">
              {activeCategory === 'PRIME_FLIP' ? 'Active Filter: 96 Flips' : 'Expansion Engine'}
            </div>
          </div>

          {/* Card 4: SP Fortress Holds */}
          <div 
            onClick={() => {
              setActiveCategory(activeCategory === 'FORTRESS' ? 'ALL' : 'FORTRESS');
              setLeadPartyFilter('ALL');
              setWinner2022Filter('ALL');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
              activeCategory === 'FORTRESS'
                ? 'border-green-600 bg-green-50/80 dark:bg-green-950/30 ring-2 ring-green-600/30'
                : 'border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] hover:border-green-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
                SP Fortress Holds
              </span>
              {activeCategory === 'FORTRESS' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-green-700 dark:text-green-400 mt-1">
              86
            </div>
            <div className="text-[11px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              Won '22 & Led '24
            </div>
            <div className="mt-2 text-[10px] font-bold text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-950/50 px-1.5 py-0.5 rounded inline-block">
              {activeCategory === 'FORTRESS' ? 'Active Filter: 86 Holds' : 'Solid Anchor Base'}
            </div>
          </div>

          {/* Card 5: Razor Battlegrounds */}
          <div 
            onClick={() => {
              setActiveCategory(activeCategory === 'BATTLEGROUND' ? 'ALL' : 'BATTLEGROUND');
              setLeadPartyFilter('ALL');
              setWinner2022Filter('ALL');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
              activeCategory === 'BATTLEGROUND'
                ? 'border-orange-600 bg-orange-50/80 dark:bg-orange-950/30 ring-2 ring-orange-600/30'
                : 'border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] hover:border-orange-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Battlegrounds &lt;5k
              </span>
              {activeCategory === 'BATTLEGROUND' && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-orange-600 dark:text-orange-400 mt-1">
              57
            </div>
            <div className="text-[11px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              BJP 28 | SP 27
            </div>
            <div className="mt-2 text-[10px] font-bold text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/50 px-1.5 py-0.5 rounded inline-block">
              {activeCategory === 'BATTLEGROUND' ? 'Active: 57 Battlegrounds' : 'Critical Booth Focus'}
            </div>
          </div>

          {/* Card 6: Near-Miss Targets */}
          <div 
            onClick={() => {
              setActiveCategory(activeCategory === 'NEAR_MISS' ? 'ALL' : 'NEAR_MISS');
              setLeadPartyFilter('ALL');
              setWinner2022Filter('ALL');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
              activeCategory === 'NEAR_MISS'
                ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/30 ring-2 ring-amber-600/30'
                : 'border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] hover:border-amber-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Targets &lt;10k Deficit
              </span>
              {activeCategory === 'NEAR_MISS' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-amber-600 dark:text-amber-400 mt-1">
              50
            </div>
            <div className="text-[11px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              Swing Needed &lt; 2.5%
            </div>
            <div className="mt-2 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 rounded inline-block">
              {activeCategory === 'NEAR_MISS' ? 'Active: 50 Near-Misses' : 'High-Value Targets'}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Interactive Swing Simulator Station */}
      <div className="bg-white dark:bg-[#181B19] rounded-xl border border-[#D5D1C8] dark:border-[#2A302B] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DFD6] dark:border-[#2A302B] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#B85C38]" />
            <h2 className="font-display font-bold text-lg text-[#171918] dark:text-[#F1EFE8]">
              2027 Vidhan Sabha Dynamic Swing Simulator
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {simResult && (
              <button
                onClick={handleResetSim}
                className="text-xs text-[#626762] dark:text-[#A8ADA7] hover:text-red-600 underline font-mono"
              >
                Reset to 2024 Actuals
              </button>
            )}
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="px-4 py-1.5 bg-[#B85C38] hover:bg-[#A04E2D] text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {simulating ? "Calculating..." : "Run Simulation"}
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          
          {/* SP Swing Slider */}
          <div className="bg-[#F7F5EF] dark:bg-[#202421] p-3.5 rounded-lg border border-[#E2DFD6] dark:border-[#2A302B]">
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="text-[#171918] dark:text-[#F1EFE8] font-bold">SP / INDIA Vote Swing</span>
              <span className={`font-mono font-bold text-sm ${spSwing >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {spSwing > 0 ? `+${spSwing}%` : `${spSwing}%`}
              </span>
            </div>
            <input
              type="range"
              min="-4.0"
              max="8.0"
              step="0.5"
              value={spSwing}
              onChange={(e) => setSpSwing(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#16a34a]"
            />
            <div className="flex justify-between text-[10px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              <span>-4.0%</span>
              <span>Baseline (0%)</span>
              <span>+8.0%</span>
            </div>
          </div>

          {/* BJP Swing Slider */}
          <div className="bg-[#F7F5EF] dark:bg-[#202421] p-3.5 rounded-lg border border-[#E2DFD6] dark:border-[#2A302B]">
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="text-[#171918] dark:text-[#F1EFE8] font-bold">BJP / NDA Vote Swing</span>
              <span className={`font-mono font-bold text-sm ${bjpSwing <= 0 ? 'text-orange-600' : 'text-red-500'}`}>
                {bjpSwing > 0 ? `+${bjpSwing}%` : `${bjpSwing}%`}
              </span>
            </div>
            <input
              type="range"
              min="-8.0"
              max="4.0"
              step="0.5"
              value={bjpSwing}
              onChange={(e) => setBjpSwing(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#F37021]"
            />
            <div className="flex justify-between text-[10px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              <span>-8.0%</span>
              <span>Baseline (0%)</span>
              <span>+4.0%</span>
            </div>
          </div>

          {/* BSP Transfer Slider */}
          <div className="bg-[#F7F5EF] dark:bg-[#202421] p-3.5 rounded-lg border border-[#E2DFD6] dark:border-[#2A302B]">
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="text-[#171918] dark:text-[#F1EFE8] font-bold">BSP Vote Shift to SP</span>
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                {bspTransfer}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={bspTransfer}
              onChange={(e) => setBspTransfer(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
            />
            <div className="flex justify-between text-[10px] text-[#626762] dark:text-[#A8ADA7] mt-1 font-mono">
              <span>0% (No shift)</span>
              <span>20%</span>
              <span>40% (Max)</span>
            </div>
          </div>

          {/* Region Selector */}
          <div className="bg-[#F7F5EF] dark:bg-[#202421] p-3.5 rounded-lg border border-[#E2DFD6] dark:border-[#2A302B] flex flex-col justify-between">
            <div className="text-xs font-bold text-[#171918] dark:text-[#F1EFE8] mb-1">
              Geographic Scope
            </div>
            <select
              value={simRegion}
              onChange={(e) => setSimRegion(e.target.value)}
              className="w-full bg-white dark:bg-[#181B19] border border-[#D5D1C8] dark:border-[#353C37] rounded px-2.5 py-1.5 text-xs text-[#171918] dark:text-[#F1EFE8] outline-none"
            >
              <option value="">All Uttar Pradesh (403 ACs)</option>
              <option value="Purvanchal">Purvanchal Only (130 ACs)</option>
              <option value="Awadh">Awadh Only (91 ACs)</option>
              <option value="Paschim UP">Paschim UP Only (73 ACs)</option>
              <option value="Rohilkhand">Rohilkhand Only (52 ACs)</option>
              <option value="Doab">Doab Only (38 ACs)</option>
              <option value="Bundelkhand">Bundelkhand Only (19 ACs)</option>
            </select>
            <div className="text-[10px] text-[#626762] dark:text-[#A8ADA7] mt-1">
              Test localized regional momentum vs statewide trends.
            </div>
          </div>

        </div>

        {/* Simulated Outcome Display */}
        {simResult && (
          <div className="mt-5 p-4 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <div className="font-display font-bold text-xl text-[#171918] dark:text-[#F1EFE8]">
                    Projected 2027 Outcome: INDIA Bloc {simResult.india_projected_total} Seats
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${simResult.majority_reached ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {simResult.majority_reached ? `MAJORITY (+${simResult.buffer_above_majority})` : 'SHORT OF MAJORITY'}
                  </span>
                </div>
                
                {/* Party breakdown pills */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {Object.entries(simResult.projected_tallies)
                    .sort((a, b) => b[1] - a[1])
                    .map(([p, count]) => (
                      <span key={p} className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getPartyBadgeColor(p)}`}>
                        {p}: {count}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSimFlips(!showSimFlips)}
                  className="text-xs font-semibold px-3 py-1.5 rounded bg-white dark:bg-[#181B19] border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  {showSimFlips ? "Hide Flipped Seats" : `View Flipped Seats (${simResult.flipped_seats_count})`}
                </button>
              </div>
            </div>

            {/* Flipped Seats Detail */}
            {showSimFlips && simResult.flipped_seats.length > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/40">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 mb-2">
                  Seats Flipping Under This Swing ({simResult.flipped_seats.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {simResult.flipped_seats.map((flip) => (
                    <div key={flip.ac_no} className="text-[11px] p-2 rounded bg-white dark:bg-[#181B19] border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                      <div>
                        <div className="font-bold">{flip.ac_name} <span className="text-gray-400 font-normal font-mono">({flip.district})</span></div>
                        <div className="text-[10px] text-gray-500 font-mono">2024: {flip.original_2024_lead} &rarr; Sim: <span className="font-bold text-green-600">{flip.simulated_winner}</span></div>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">+{flip.simulated_margin.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. Regional Power Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#B85C38]" />
            <h3 className="font-display font-bold text-base text-[#171918] dark:text-[#F1EFE8]">
              Regional Power Matrix (Uttar Pradesh 6 Regions)
            </h3>
          </div>
          <span className="text-xs text-[#626762] dark:text-[#A8ADA7]">
            Click any region to filter constituencies below
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {summary.regions.map(r => {
            const isSelected = selectedRegion === r.region;
            return (
              <div
                key={r.region}
                onClick={() => setSelectedRegion(isSelected ? 'ALL' : r.region)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[#B85C38] bg-[#B85C38]/5 shadow-sm' 
                    : 'border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-[#171918] dark:text-[#F1EFE8]">
                  <span>{r.region}</span>
                  <span className="font-mono text-[10px] text-[#626762]">{r.total_seats} seats</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-green-700 dark:text-green-400">
                    <span>SP '24 Leads:</span>
                    <span className="font-bold">{r.sp_2024_leads}</span>
                  </div>
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>BJP '24 Leads:</span>
                    <span className="font-bold">{r.bjp_2024_leads}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <span>'22 SP Wins:</span>
                    <span>{r.sp_2022}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Flips Gained:</span>
                    <span>+{r.prime_flips}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Constituency Strategy Matrix Header & Category Tabs */}
      <div className="bg-white dark:bg-[#181B19] rounded-xl border border-[#D5D1C8] dark:border-[#2A302B] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2DFD6] dark:border-[#2A302B] space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-lg text-[#171918] dark:text-[#F1EFE8]">
                Constituency Intelligence & Target Matrix
              </h3>
              <p className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-0.5">
                Showing {filteredItems.length} of 403 constituencies matching selected criteria.
              </p>
            </div>

            {/* Search Input & Table Export */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search AC, District, Candidate, PC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F5EF] dark:bg-[#202421] border border-[#D5D1C8] dark:border-[#353C37] rounded-md outline-none focus:border-[#B85C38]"
                />
              </div>

              <button
                onClick={() => {
                  const rows = [
                    ["AC No", "Constituency Name", "Category", "District", "Region", "PC Name", "2022 Winner", "2022 Margin", "2024 Lead Party", "2024 Lead Candidate", "2024 Runner Party", "2024 Runner Candidate", "2024 Margin", "Strategic Category", "2027 SP Target Votes", "Swing Needed %"],
                    ...filteredItems.map(it => [
                      it.ac_no,
                      `"${(it.ac_name || '').replace(/"/g, '""')}"`,
                      it.category || 'GEN',
                      `"${(it.district || '').replace(/"/g, '""')}"`,
                      `"${(it.region || '').replace(/"/g, '""')}"`,
                      `"${(it.pc_name || '').replace(/"/g, '""')}"`,
                      it.winner_2022_party,
                      it.margin_2022,
                      it.lead_2024_party,
                      `"${(it.lead_2024_candidate || '').replace(/"/g, '""')}"`,
                      it.runner_2024_party,
                      `"${(it.runner_2024_candidate || '').replace(/"/g, '""')}"`,
                      it.margin_2024,
                      `"${(it.strategic_category || '').replace(/"/g, '""')}"`,
                      it.target_priority,
                      it.swing_needed_pct
                    ])
                  ];
                  const csvContent = "\ufeff" + rows.map(r => r.join(",")).join("\n");
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `UP_403_Vidhan_Sabha_Mission_2027_Strategy_Matrix.csv`;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    if (document.body.contains(a)) document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }, 60000);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap shadow-sm cursor-pointer"
                title="Export current strategy matrix table to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Matrix (CSV)</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'ALL'
                  ? 'bg-[#171918] text-white dark:bg-[#F1EFE8] dark:text-[#171918] font-bold'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              All 403 Seats
            </button>

            <button
              onClick={() => setActiveCategory('PRIME_FLIP')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'PRIME_FLIP'
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              Prime 2024 Flips (96)
            </button>

            <button
              onClick={() => setActiveCategory('FORTRESS')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'FORTRESS'
                  ? 'bg-green-700 text-white font-bold'
                  : 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 hover:bg-green-100'
              }`}
            >
              SP Fortress (86)
            </button>

            <button
              onClick={() => setActiveCategory('BATTLEGROUND')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'BATTLEGROUND'
                  ? 'bg-orange-600 text-white font-bold'
                  : 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 hover:bg-orange-100'
              }`}
            >
              Razor Battlegrounds &lt;5k (57)
            </button>

            <button
              onClick={() => setActiveCategory('NEAR_MISS')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'NEAR_MISS'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              Near-Miss Targets &lt;10k (50)
            </button>

            <button
              onClick={() => setActiveCategory('ALLIANCE_FLIP')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'ALLIANCE_FLIP'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              Alliance Flips (40)
            </button>

            <button
              onClick={() => setActiveCategory('DEFENSIVE_ALERT')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'DEFENSIVE_ALERT'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 hover:bg-red-100'
              }`}
            >
              Defensive Watchlist (4)
            </button>
          </div>

        </div>

        {/* 6. Constituency Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F5EF] dark:bg-[#202421] border-b border-[#E2DFD6] dark:border-[#2A302B] text-[#626762] dark:text-[#A8ADA7] font-mono uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">AC No</th>
                <th className="py-2.5 px-3">Constituency</th>
                <th className="py-2.5 px-3">District / Region</th>
                <th className="py-2.5 px-3">2022 Actual</th>
                <th className="py-2.5 px-3">2024 LS Lead</th>
                <th className="py-2.5 px-3">2024 Runner-Up</th>
                <th className="py-2.5 px-3 text-right">Lead Margin</th>
                <th className="py-2.5 px-3">Strategic Status</th>
                <th className="py-2.5 px-3 text-right">Swing To Flip</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD6] dark:divide-[#2A302B]">
              {filteredItems.slice(0, 100).map((item) => {
                return (
                  <tr 
                    key={item.ac_no}
                    className="hover:bg-gray-50/80 dark:hover:bg-[#202421]/60 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#626762] dark:text-[#A8ADA7]">
                      {item.ac_no}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-[#171918] dark:text-[#F1EFE8]">
                      {item.ac_name}
                      {item.category === 'SC' && (
                        <span className="ml-1 px-1 py-0.2 text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded">
                          SC
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-[#171918] dark:text-[#F1EFE8]">{item.district}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{item.region} • {item.pc_name}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getPartyBadgeColor(item.winner_2022_party)}`}>
                        {item.winner_2022_party}
                      </span>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        +{item.margin_2022?.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getPartyBadgeColor(item.lead_2024_party)}`}>
                        {item.lead_2024_party}
                      </span>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate max-w-[120px]" title={item.lead_2024_candidate}>
                        {item.lead_2024_candidate}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getPartyBadgeColor(item.runner_2024_party)}`}>
                        {item.runner_2024_party}
                      </span>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate max-w-[120px]" title={item.runner_2024_candidate}>
                        {item.runner_2024_candidate}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={item.lead_2024_party === 'SP' ? 'text-green-600 dark:text-green-400' : item.lead_2024_party === 'INC' ? 'text-blue-600' : 'text-orange-600'}>
                        +{item.margin_2024.toLocaleString()}
                      </span>
                      <div className="text-[10px] text-gray-400 font-normal">
                        ({item.margin_pct_2024}%)
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {getCategoryBadge(item.strategic_category, item.is_battleground, item.is_near_miss)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-xs">
                      {item.swing_needed_pct}%
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => openACDossier(item.ac_no)}
                        className="px-2.5 py-1 rounded bg-white dark:bg-[#1C201D] border border-gray-300 dark:border-gray-700 hover:border-[#B85C38] text-[#B85C38] text-[11px] font-semibold transition-colors"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredItems.length > 100 && (
            <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 dark:bg-[#181B19] border-t border-gray-200 dark:border-gray-800">
              Showing first 100 of {filteredItems.length} records. Filter or search to narrow down results.
            </div>
          )}
        </div>

      </div>

      {/* 7. AC Strategic Dossier Modal */}
      {selectedAC && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181B19] rounded-xl border border-[#D5D1C8] dark:border-[#2A302B] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            
            <div className="flex justify-between items-start border-b border-[#E2DFD6] dark:border-[#2A302B] pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#B85C38] bg-[#B85C38]/10 px-2 py-0.5 rounded">
                    AC NO {selectedAC.ac_no}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {selectedAC.district} District • {selectedAC.region}
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl text-[#171918] dark:text-[#F1EFE8] mt-1">
                  {selectedAC.ac_name} {selectedAC.category === 'SC' && '(SC)'}
                </h3>
                <div className="text-xs text-[#626762] dark:text-[#A8ADA7]">
                  Parent Parliamentary Seat: <strong>{selectedAC.pc_name}</strong> (PC #{selectedAC.pc_no})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const downloadUrl = `/api/strategy/assembly/${selectedAC.ac_no}/export-dossier`;
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.setAttribute('download', `AC_${selectedAC.ac_no}_${(selectedAC.ac_name || '').replace(/\s+/g, '_')}_Mission_2027_War_Dossier.csv`);
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                      if (document.body.contains(link)) document.body.removeChild(link);
                    }, 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
                  title="Download Excel / CSV War Dossier with all booth targets and BLA contacts"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export War Dossier (Excel)</span>
                </button>

                <button
                  onClick={() => setSelectedAC(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Strategic Classification Box */}
            <div className="p-4 rounded-lg bg-[#F7F5EF] dark:bg-[#202421] border border-[#E2DFD6] dark:border-[#2A302B] mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38]">
                  STRATEGIC CLASSIFICATION
                </span>
                <span className="text-xs font-mono font-bold bg-[#B85C38] text-white px-2 py-0.5 rounded">
                  {selectedAC.strategic_profile.target_priority}
                </span>
              </div>
              <p className="text-sm font-medium text-[#171918] dark:text-[#F1EFE8] leading-relaxed">
                {selectedAC.strategic_profile.recommendation}
              </p>
              <div className="mt-2 text-xs font-mono text-gray-500">
                Swing required to overturn segment: <strong>{selectedAC.strategic_profile.swing_needed_pct}%</strong>
              </div>
            </div>

            {/* PDA Social Coalition & Candidate Recommendation Engine */}
            {selectedAC.pda_caste_intelligence && (
              <div className="p-4 rounded-xl border border-emerald-600/30 bg-emerald-50/40 dark:bg-emerald-950/20 mb-5 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-600/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                      PDA ENGINE
                    </span>
                    <h4 className="font-display font-bold text-sm text-[#171918] dark:text-[#F1EFE8]">
                      PDA Social Engineering & Candidate Recommendation (2027)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Synergy: {selectedAC.pda_caste_intelligence.pda_coalition.synergy_score}
                  </span>
                </div>

                {/* Specific Candidate Recommendation for Akhilesh Yadav */}
                <div className="p-3.5 rounded-lg bg-white dark:bg-[#181B19] border border-emerald-600/20 shadow-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#B85C38] flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#B85C38]" />
                    Akhilesh Yadav 2027 Candidate Caste Recommendation
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#171918] dark:text-[#F1EFE8] leading-relaxed">
                    {selectedAC.pda_caste_intelligence.candidate_caste_recommendation}
                  </p>
                  <p className="text-[11px] text-[#626762] dark:text-[#A8ADA7] mt-1.5 italic">
                    {selectedAC.pda_caste_intelligence.strategic_summary}
                  </p>
                </div>

                {/* 3 Pillars: OBC, Dalit, Minority Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-white/80 dark:bg-[#181B19]/80 border border-emerald-600/15">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] uppercase mb-1">
                      Pichhda (OBC) Matrix
                    </div>
                    <p className="text-[11px] text-[#626762] dark:text-[#A8ADA7] leading-tight">
                      {selectedAC.pda_caste_intelligence.pda_coalition.obc_profile}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/80 dark:bg-[#181B19]/80 border border-emerald-600/15">
                    <div className="font-bold text-purple-800 dark:text-purple-300 text-[11px] uppercase mb-1">
                      Dalit (SC) Matrix
                    </div>
                    <p className="text-[11px] text-[#626762] dark:text-[#A8ADA7] leading-tight">
                      {selectedAC.pda_caste_intelligence.pda_coalition.dalit_profile}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/80 dark:bg-[#181B19]/80 border border-emerald-600/15">
                    <div className="font-bold text-blue-800 dark:text-blue-300 text-[11px] uppercase mb-1">
                      Alpasankhyak (Minority)
                    </div>
                    <p className="text-[11px] text-[#626762] dark:text-[#A8ADA7] leading-tight">
                      {selectedAC.pda_caste_intelligence.pda_coalition.minority_profile}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4-Election Trajectory Timeline */}
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#626762] dark:text-[#A8ADA7] mb-3">
                Historical 4-Election Trajectory
              </h4>
              <div className="space-y-2">
                {selectedAC.timeline.map((evt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-[#1C201D] border border-[#E2DFD6] dark:border-[#2A302B] text-xs">
                    <div className="font-semibold text-[#171918] dark:text-[#F1EFE8] w-48">
                      {evt.election}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold border ${getPartyBadgeColor(evt.winner_party)}`}>
                        {evt.winner_party}
                      </span>
                      <span className="text-gray-500 font-mono text-[11px] truncate max-w-[150px]">
                        {evt.winner_candidate}
                      </span>
                    </div>
                    <div className="font-mono text-right font-bold text-gray-700 dark:text-gray-300">
                      +{evt.margin?.toLocaleString()} margin
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2024 Vote Distribution in AC */}
            {selectedAC.vote_distribution_2024 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#626762] dark:text-[#A8ADA7] mb-2">
                  2024 Assembly Segment Vote Breakdown
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {Object.entries(selectedAC.vote_distribution_2024).map(([pty, votes]) => (
                    <div key={pty} className="p-2 rounded bg-gray-50 dark:bg-[#202421] border border-gray-200 dark:border-gray-800">
                      <div className="font-bold text-gray-500">{pty}</div>
                      <div className="font-mono font-bold text-sm mt-0.5">{votes.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-[#E2DFD6] dark:border-[#2A302B] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  const downloadUrl = `/api/strategy/assembly/${selectedAC.ac_no}/export-dossier`;
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.setAttribute('download', `AC_${selectedAC.ac_no}_${(selectedAC.ac_name || '').replace(/\s+/g, '_')}_Mission_2027_War_Dossier.csv`);
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => {
                    if (document.body.contains(link)) document.body.removeChild(link);
                  }, 2000);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Booth War Dossier (Excel)</span>
              </button>

              <button
                onClick={() => setSelectedAC(null)}
                className="px-4 py-2 bg-[#171918] dark:bg-[#F1EFE8] text-white dark:text-[#171918] text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
