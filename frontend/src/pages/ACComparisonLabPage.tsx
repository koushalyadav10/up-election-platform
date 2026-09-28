import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  Plus, 
  X, 
  Activity, 
  TrendingUp, 
  Building2, 
  Landmark, 
  Award, 
  Vote, 
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { 
  compareConstituencies, 
  fetchAssemblyConstituencies, 
  ConstituencyComparisonResponse, 
  AssemblyConstituencyItem 
} from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { ACDossierModal } from '../components/common/ACDossierModal';
import { useLanguage } from '../context/LanguageContext';

export const ACComparisonLabPage: React.FC = () => {
  const { language } = useLanguage();
  
  // Selected AC IDs for comparison
  const [selectedACIds, setSelectedACIds] = useState<number[]>([1, 2]);
  const [allACs, setAllACs] = useState<AssemblyConstituencyItem[]>([]);
  const [comparisonData, setComparisonData] = useState<ConstituencyComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectorQuery, setSelectorQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Active Dossier Modal
  const [modalACNo, setModalACNo] = useState<number | null>(null);

  // Load all ACs for autocomplete
  useEffect(() => {
    fetchAssemblyConstituencies(2024, 'Lok Sabha')
      .then(res => setAllACs(res.items))
      .catch(err => console.error("Error loading AC list:", err));
  }, []);

  // Fetch comparison data whenever selectedACIds change
  useEffect(() => {
    if (selectedACIds.length === 0) {
      setComparisonData(null);
      return;
    }
    setLoading(true);
    compareConstituencies('Assembly', selectedACIds)
      .then(res => {
        setComparisonData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Comparison error:", err);
        setLoading(false);
      });
  }, [selectedACIds]);

  const handleAddAC = (acNo: number) => {
    if (selectedACIds.includes(acNo)) return;
    if (selectedACIds.length >= 4) {
      alert("You can compare up to 4 constituencies simultaneously.");
      return;
    }
    setSelectedACIds([...selectedACIds, acNo]);
    setSelectorQuery('');
    setIsDropdownOpen(false);
  };

  const handleRemoveAC = (acNo: number) => {
    setSelectedACIds(selectedACIds.filter(id => id !== acNo));
  };

  const filteredACs = allACs.filter(ac => {
    const q = selectorQuery.toLowerCase().trim();
    if (!q) return true;
    return ((ac.name || ac.ac_name) || ac.name || '').toLowerCase().includes(q) ||
           ac.ac_no.toString().includes(q) ||
           (ac.district || '').toLowerCase().includes(q);
  }).slice(0, 10);

  const getPartyColor = (party?: string) => {
    if (!party) return '#64748B';
    const p = party.toUpperCase();
    if (p.includes('BJP')) return '#FF9933';
    if (p.includes('SP')) return '#E53935';
    if (p.includes('INC')) return '#1976D2';
    if (p.includes('BSP')) return '#1E40AF';
    if (p.includes('RLD')) return '#10B981';
    return '#64748B';
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Assembly Constituency Comparison Lab
            </h1>
            <SourceBadge type="OFFICIAL" document="Verified ECI Side-by-Side Analytics" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare 2 to 4 Uttar Pradesh assembly constituencies side-by-side across competitiveness, electoral flips, and margin shifts.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Presets:</span>
          <button
            onClick={() => setSelectedACIds([1, 2, 3])}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Saharanpur Cluster
          </button>
          <button
            onClick={() => setSelectedACIds([171, 172, 173])}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Lucknow Urban
          </button>
          <button
            onClick={() => setSelectedACIds([387, 388, 390])}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Varanasi Segments
          </button>
        </div>
      </div>

      {/* 2. Constituency Selector Pills & Autocomplete Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">Selected Seats ({selectedACIds.length}/4):</span>
          
          {selectedACIds.map(id => {
            const acObj = allACs.find(a => a.ac_no === id);
            return (
              <span 
                key={id} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300"
              >
                <span>AC #{id} {acObj ? `• ${acObj.ac_name || acObj.name}` : ''}</span>
                <button
                  onClick={() => handleRemoveAC(id)}
                  className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {selectedACIds.length < 4 && (
            <div className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="+ Add AC (Name or #)..."
                  value={selectorQuery}
                  onChange={(e) => {
                    setSelectorQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-56 overflow-y-auto z-50">
                  {filteredACs.map(ac => (
                    <div
                      key={ac.ac_no}
                      onClick={() => handleAddAC(ac.ac_no)}
                      className="px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">AC #{ac.ac_no} {(ac.name || ac.ac_name) || ac.name}</span>
                        <div className="text-[10px] text-slate-400">{ac.district}</div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Side-by-Side Comparison Canvas */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 font-mono animate-pulse">
          Synthesizing multi-constituency comparative intelligence...
        </div>
      ) : !comparisonData || comparisonData.comparison_items.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Select at least two constituencies to begin comparative analysis.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {comparisonData.comparison_items.map((ac: any) => (
            <div 
              key={ac.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    AC #{ac.id} • {ac.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {ac.competitiveness?.classification || 'COMPETITIVE'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {ac.name}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {ac.district} • PC: {ac.parent_pc}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 text-xs">
                
                {/* Competitiveness Score */}
                {ac.competitiveness && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        Competitiveness Score
                      </span>
                      <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                        {ac.competitiveness.overall_score}/100
                      </span>
                    </div>
                    
                    {/* Sub components */}
                    {ac.competitiveness.components && (
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500">
                        <div>Tightness: <strong className="text-slate-800 dark:text-slate-200">{ac.competitiveness.components.margin_tightness}</strong></div>
                        <div>Proximity: <strong className="text-slate-800 dark:text-slate-200">{ac.competitiveness.components.runner_up_proximity}</strong></div>
                        <div>Turnover: <strong className="text-slate-800 dark:text-slate-200">{ac.competitiveness.components.winner_turnover}</strong></div>
                        <div>Volatility: <strong className="text-slate-800 dark:text-slate-200">{ac.competitiveness.components.historical_volatility}</strong></div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2024 Lok Sabha Assembly Segment Lead */}
                {ac.latest_election && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {ac.latest_election.cycle}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{ac.latest_election.winner_candidate}</span>
                      <span className="font-bold px-1.5 py-0.2 rounded text-[11px]" style={{ backgroundColor: `${getPartyColor(ac.latest_election.winner_party)}20`, color: getPartyColor(ac.latest_election.winner_party) }}>
                        {ac.latest_election.winner_party}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Margin: {ac.latest_election.margin?.toLocaleString()} votes ({ac.latest_election.margin_pct}%)
                    </div>
                  </div>
                )}

                {/* 2022 Vidhan Sabha Winner */}
                {ac.assembly_2022 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      2022 Vidhan Sabha
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{ac.assembly_2022.winner_candidate}</span>
                      <span className="font-bold px-1.5 py-0.2 rounded text-[11px]" style={{ backgroundColor: `${getPartyColor(ac.assembly_2022.winner_party)}20`, color: getPartyColor(ac.assembly_2022.winner_party) }}>
                        {ac.assembly_2022.winner_party}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Margin: {ac.assembly_2022.margin?.toLocaleString()} votes
                    </div>
                  </div>
                )}

                {/* 2017 Vidhan Sabha Winner */}
                {ac.assembly_2017 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      2017 Vidhan Sabha
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{ac.assembly_2017.winner_candidate}</span>
                      <span className="font-bold px-1.5 py-0.2 rounded text-[11px]" style={{ backgroundColor: `${getPartyColor(ac.assembly_2017.winner_party)}20`, color: getPartyColor(ac.assembly_2017.winner_party) }}>
                        {ac.assembly_2017.winner_party}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Margin: {ac.assembly_2017.margin?.toLocaleString()} votes
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Button */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setModalACNo(ac.id)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Open Full AC Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Embedded Complete AC Dossier Modal */}
      <ACDossierModal
        acNo={modalACNo}
        isOpen={modalACNo !== null}
        onClose={() => setModalACNo(null)}
      />

    </div>
  );
};
