import React, { useEffect, useState } from 'react';
import { fetchAssemblyConstituencies, AssemblyConstituencyItem, ACComparisonItem } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { ACDossierModal } from '../components/common/ACDossierModal';
import { PinCompareDrawer } from '../components/common/PinCompareDrawer';
import { AssemblyToLokSabhaTrendCard } from '../components/analytics/AssemblyToLokSabhaTrendCard';
import { 
  Search, 
  ArrowUpDown, 
  Layers, 
  ChevronRight, 
  Calendar, 
  Award, 
  Vote,
  Filter,
  Flame,
  ChevronLeft,
  X,
  Sparkles
} from 'lucide-react';

interface VidhanSabhaExplorerProps {
  onSelectPC?: (pcId: number) => void;
  onAskAI?: (prompt: string) => void;
}

const HISTORICAL_YEARS = [
  { year: 2022, type: 'Vidhan Sabha', label: '2022 Assembly' },
  { year: 2024, type: 'Lok Sabha', label: '2024 LS Leads' },
  { year: 2017, type: 'Vidhan Sabha', label: '2017 Assembly' },
  { year: 2019, type: 'Lok Sabha', label: '2019 LS Leads' },
  { year: 2012, type: 'Vidhan Sabha', label: '2012 Assembly' },
  { year: 2007, type: 'Vidhan Sabha', label: '2007 Assembly' },
  { year: 2002, type: 'Vidhan Sabha', label: '2002 Assembly' },
  { year: 1996, type: 'Vidhan Sabha', label: '1996 Assembly' },
  { year: 1993, type: 'Vidhan Sabha', label: '1993 Assembly' },
  { year: 1991, type: 'Vidhan Sabha', label: '1991 Assembly' }
];

export const VidhanSabhaExplorer: React.FC<VidhanSabhaExplorerProps> = ({ onSelectPC, onAskAI }) => {
  const [selectedMode, setSelectedMode] = useState<{ year: number; type: string }>({
    year: 2022,
    type: 'Vidhan Sabha'
  });
  const [items, setItems] = useState<AssemblyConstituencyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [partyFilter, setPartyFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [marginFilter, setMarginFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'ac_no' | 'margin' | 'name' | 'district' | 'turnout'>('ac_no');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Selected AC for Dossier Modal
  const [selectedACNo, setSelectedACNo] = useState<number | null>(null);

  // Pinned ACs for Multi-Constituency Comparison
  const [pinnedACs, setPinnedACs] = useState<ACComparisonItem[]>([]);

  const handleTogglePin = (ac: AssemblyConstituencyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const exists = pinnedACs.some(p => p.ac_no === ac.ac_no);
    if (exists) {
      setPinnedACs(prev => prev.filter(p => p.ac_no !== ac.ac_no));
    } else {
      if (pinnedACs.length >= 3) {
        alert("You can compare up to 3 constituencies at once.");
        return;
      }
      const item: ACComparisonItem = {
        ac_no: ac.ac_no,
        name: ac.name,
        district: ac.district,
        category: ac.category,
        parent_pc: ac.parent_pc ? { pc_no: ac.parent_pc.pc_no, pc_name: ac.parent_pc.pc_name } : { pc_no: 0, pc_name: 'N/A' },
        winner_2022: ac.winner?.name || 'N/A',
        party_2022: ac.winner?.party || 'N/A',
        votes_2022: ac.winner?.votes || 0,
        margin_2022: ac.margin || 0,
        margin_pct_2022: ac.margin_pct || 0,
        turnout_2022: ac.turnout_pct || 0,
        electors_2022: ac.total_electors || 0,
        winner_2017: 'N/A',
        party_2017: 'N/A',
        votes_2017: 0,
        margin_2017: 0,
        margin_pct_2017: 0,
        turnout_2017: 0,
        lead_2024: 'N/A',
        party_2024: 'N/A',
        votes_2024: 0,
        margin_2024: 0,
        margin_pct_2024: 0,
        turnout_2024: 0,
        sir_net_change: 0,
        sir_pct_change: 0,
        sir_impact_label: 'Stable',
        sc_pct: 0,
        literacy_pct: 0,
        rural_pct: 0,
        battleground_category: ac.mission_2027?.category || 'Competitive',
        split_pattern: ac.split_voting?.pattern_category || 'Stable'
      };
      setPinnedACs(prev => [...prev, item]);
    }
  };

  useEffect(() => {
    loadData(selectedMode.year, selectedMode.type);
    setCurrentPage(1);
  }, [selectedMode]);

  const loadData = async (yr: number, typ: string) => {
    setLoading(true);
    try {
      const data = await fetchAssemblyConstituencies(yr, typ);
      setItems(data.items);
    } catch (err) {
      console.error("Error loading assembly data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (col: 'ac_no' | 'margin' | 'name' | 'district' | 'turnout') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder(col === 'margin' || col === 'turnout' ? 'desc' : 'asc');
    }
  };

  // Distinct districts
  const distinctDistricts = Array.from(new Set(items.map(i => i.district))).filter(Boolean).sort();

  // Compute party tally
  const partyTally: Record<string, number> = {};
  items.forEach(ac => {
    const p = ac.winner?.party || 'OTHER';
    partyTally[p] = (partyTally[p] || 0) + 1;
  });

  const filtered = items.filter(ac => {
    if (partyFilter && ac.winner?.party !== partyFilter) return false;
    if (districtFilter && ac.district !== districtFilter) return false;
    if (categoryFilter && ac.category !== categoryFilter) return false;
    if (marginFilter) {
      const m = ac.margin || 0;
      if (marginFilter === 'ultra_close' && m >= 5000) return false;
      if (marginFilter === 'competitive' && (m < 5000 || m > 15000)) return false;
      if (marginFilter === 'safe' && m <= 15000) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchName = ac.name.toLowerCase().includes(q);
      const matchNo = ac.ac_no.toString() === q || ac.ac_no.toString().includes(q);
      const matchDist = ac.district.toLowerCase().includes(q);
      const matchPC = ac.parent_pc?.pc_name.toLowerCase().includes(q);
      const matchWin = ac.winner?.name.toLowerCase().includes(q);
      const matchRun = ac.runner_up?.name.toLowerCase().includes(q);
      if (!matchName && !matchNo && !matchDist && !matchPC && !matchWin && !matchRun) return false;
    }
    return true;
  }).sort((a, b) => {
    let diff = 0;
    if (sortBy === 'ac_no') diff = a.ac_no - b.ac_no;
    else if (sortBy === 'name') diff = a.name.localeCompare(b.name);
    else if (sortBy === 'district') diff = a.district.localeCompare(b.district);
    else if (sortBy === 'margin') diff = (a.margin || 0) - (b.margin || 0);
    else if (sortBy === 'turnout') diff = (a.turnout_pct || 0) - (b.turnout_pct || 0);
    return sortOrder === 'asc' ? diff : -diff;
  });

  // Paged items
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filtered.length / pageSize);
  const pagedItems = pageSize === -1 
    ? filtered 
    : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPartyBadgeColor = (party?: string) => {
    switch (party?.toUpperCase()) {
      case 'SP': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'BJP': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
      case 'BSP': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'INC': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      case 'RLD': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800';
      case 'NINSHAD':
      case 'NISHAD': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'ADAL': 
      case 'AD': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold tracking-wide border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> VIDHAN SABHA ARCHIVES (1991–2022)
            </span>
            <SourceBadge type="OFFICIAL" document={`ECI Official Certified Returns (${selectedMode.year})`} />
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
            Uttar Pradesh Vidhan Sabha Constituencies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Certified electoral data across 403 Assembly constituencies spanning 8 general election cycles and Parliamentary leads.
          </p>
        </div>

        {/* Action Button: Quick Search / AI */}
        {onAskAI && (
          <button
            onClick={() => onAskAI("Provide a high-level summary of party performance across Uttar Pradesh assembly elections from 1991 to 2022.")}
            className="self-start md:self-auto px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Electra about Assembly Trends</span>
          </button>
        )}
      </div>

      {/* 2. Horizontal Election Year Switcher */}
      <div className="bg-white dark:bg-[#181B19] p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 shrink-0">
            Election Cycle:
          </span>
          {HISTORICAL_YEARS.map(y => {
            const isSelected = selectedMode.year === y.year && selectedMode.type === y.type;
            return (
              <button
                key={`${y.year}-${y.type}`}
                onClick={() => {
                  setSelectedMode({ year: y.year, type: y.type });
                  setPartyFilter('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs scale-102'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {y.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Party Seat Distribution Chips */}
      <div className="bg-white dark:bg-[#181B19] p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-indigo-500" />
          Seat Tally ({selectedMode.year}):
        </span>

        <button
          onClick={() => setPartyFilter('')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            !partyFilter 
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' 
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All (403)
        </button>

        {Object.entries(partyTally)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([party, count]) => {
            const isSelected = partyFilter === party;
            return (
              <button
                key={party}
                onClick={() => setPartyFilter(isSelected ? '' : party)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 ring-offset-1 font-bold'
                    : ''
                } ${getPartyBadgeColor(party)}`}
              >
                <span>{party}</span>
                <span className="font-mono font-bold text-[11px] px-1.5 py-0.2 rounded-full bg-white/70 dark:bg-black/30">
                  {count}
                </span>
              </button>
            );
          })}
      </div>

      {/* Historical Assembly vs Lok Sabha Power Shift & 2027 Forecast Card */}
      <AssemblyToLokSabhaTrendCard />

      {/* 4. Search & Detailed Filter Bar */}
      <div className="bg-white dark:bg-[#181B19] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search AC name, #, district, candidate..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District Dropdown */}
          <div>
            <select
              value={districtFilter}
              onChange={e => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Districts ({distinctDistricts.length})</option>
              {distinctDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="GEN">General (GEN)</option>
              <option value="SC">Reserved (SC)</option>
            </select>
          </div>

          {/* Margin Dropdown */}
          <div>
            <select
              value={marginFilter}
              onChange={e => { setMarginFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Margins</option>
              <option value="ultra_close">Ultra-close (&lt; 5,000)</option>
              <option value="competitive">Competitive (5k – 15k)</option>
              <option value="safe">Safe Seat (&gt; 15,000)</option>
            </select>
          </div>
        </div>

        {/* Results Count & Active Filter Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div>
            Showing <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{filtered.length}</span> of {items.length} constituencies
            {selectedMode.type === 'Lok Sabha' && (
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-mono">
                Lok Sabha Segment Leads
              </span>
            )}
          </div>

          {(partyFilter || districtFilter || categoryFilter || marginFilter || search) && (
            <button
              onClick={() => {
                setPartyFilter('');
                setDistrictFilter('');
                setCategoryFilter('');
                setMarginFilter('');
                setSearch('');
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* 5. Editorial Table / High-Density List (Zero Card Clutter) */}
      <div className="bg-white dark:bg-[#181B19] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-slate-500">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-xs font-medium">Retrieving certified assembly constituency records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[10px] uppercase font-mono text-slate-500">
                  <th 
                    onClick={() => handleSort('ac_no')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 w-16"
                  >
                    <div className="flex items-center gap-1">
                      <span>AC #</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('name')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>Constituency</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('district')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>District & Parent PC</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  <th className="py-3 px-3">
                    Elected Representative ({selectedMode.year})
                  </th>

                  <th className="py-3 px-3">
                    Runner-up Candidate
                  </th>

                  <th 
                    onClick={() => handleSort('margin')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 w-28"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Margin</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('turnout')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 w-24"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Turnout</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  <th className="py-3 px-3 text-right w-24">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {pagedItems.map(ac => (
                  <tr 
                    key={ac.ac_no}
                    onClick={() => setSelectedACNo(ac.ac_no)}
                    className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors group"
                  >
                    {/* AC # */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-400 text-xs">
                      #{ac.ac_no}
                    </td>

                    {/* Constituency Name & Tag */}
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {ac.name}
                        </span>
                        {ac.category === 'SC' && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded font-mono font-bold">
                            SC
                          </span>
                        )}
                      </div>
                    </td>

                    {/* District & Parent PC */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{ac.district}</div>
                      {ac.parent_pc && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          PC: {ac.parent_pc.pc_name}
                        </div>
                      )}
                    </td>

                    {/* Winner & Party */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPartyBadgeColor(ac.winner?.party)}`}>
                          {ac.winner?.party || "OTHER"}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                          {ac.winner?.name || "Elected MLA"}
                        </span>
                      </div>
                    </td>

                    {/* Runner-up */}
                    <td className="py-3 px-3">
                      {ac.runner_up ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${getPartyBadgeColor(ac.runner_up.party)}`}>
                            {ac.runner_up.party || "OTHER"}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                            {ac.runner_up.name || "Runner-up"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Margin */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {ac.margin ? `+${ac.margin.toLocaleString()}` : "—"}
                    </td>

                    {/* Turnout */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {ac.turnout_pct ? `${ac.turnout_pct.toFixed(1)}%` : "—"}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={e => handleTogglePin(ac, e)}
                          title={pinnedACs.some(p => p.ac_no === ac.ac_no) ? "Remove pin" : "Pin to compare"}
                          className={`p-1 rounded text-xs transition-colors ${
                            pinnedACs.some(p => p.ac_no === ac.ac_no)
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedACNo(ac.ac_no);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Dossier</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <Filter className="w-6 h-6 mx-auto text-slate-400" />
                <p className="font-medium">No assembly constituencies match the selected criteria.</p>
                <button
                  onClick={() => {
                    setPartyFilter('');
                    setDistrictFilter('');
                    setCategoryFilter('');
                    setMarginFilter('');
                    setSearch('');
                  }}
                  className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Pagination Footer */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={-1}>All (403)</option>
              </select>
            </div>

            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Integrated Assembly Constituency Dossier Modal */}
      <ACDossierModal
        acNo={selectedACNo}
        isOpen={selectedACNo !== null}
        onClose={() => setSelectedACNo(null)}
        onSelectPC={onSelectPC}
        onAskAI={onAskAI}
        onPinAC={(item) => {
          const exists = pinnedACs.some(p => p.ac_no === item.ac_no);
          if (exists) {
            setPinnedACs(prev => prev.filter(p => p.ac_no !== item.ac_no));
          } else {
            if (pinnedACs.length >= 3) {
              alert("You can compare up to 3 constituencies at once.");
              return;
            }
            setPinnedACs(prev => [...prev, item]);
          }
        }}
        isPinned={pinnedACs.some(p => p.ac_no === selectedACNo)}
      />

      {/* Persistent Multi-Constituency Pin & Compare Drawer */}
      <PinCompareDrawer
        pinnedAcs={pinnedACs}
        onRemoveAC={acNo => setPinnedACs(prev => prev.filter(p => p.ac_no !== acNo))}
        onClearAll={() => setPinnedACs([])}
        onOpenACDossier={acNo => setSelectedACNo(acNo)}
      />

    </div>
  );
};
