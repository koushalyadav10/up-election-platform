import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Vote, 
  Building2, 
  Landmark, 
  ShieldCheck, 
  Filter, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { compareElections, ElectionComparisonResponse } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { ACDossierModal } from '../components/common/ACDossierModal';
import { useLanguage } from '../context/LanguageContext';

export const ElectionComparisonLabPage: React.FC = () => {
  const { language } = useLanguage();
  
  // Election comparison pairs preset
  const PRESETS = [
    { label: "2024 LS Leads vs 2022 Vidhan Sabha (403 ACs)", y1: 2022, t1: "Vidhan Sabha", y2: 2024, t2: "Lok Sabha" },
    { label: "2022 Vidhan Sabha vs 2017 Vidhan Sabha (403 ACs)", y1: 2017, t1: "Vidhan Sabha", y2: 2022, t2: "Vidhan Sabha" },
    { label: "2024 Lok Sabha vs 2019 Lok Sabha (80 PCs)", y1: 2019, t1: "Lok Sabha", y2: 2024, t2: "Lok Sabha" },
    { label: "2019 Lok Sabha vs 2014 Lok Sabha (80 PCs)", y1: 2014, t1: "Lok Sabha", y2: 2019, t2: "Lok Sabha" }
  ];

  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [data, setData] = useState<ElectionComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [flipFilter, setFlipFilter] = useState<string>('ALL');
  const [selectedACNo, setSelectedACNo] = useState<number | null>(null);

  useEffect(() => {
    const p = PRESETS[activePresetIndex];
    setLoading(true);
    compareElections(p.y1, p.t1, p.y2, p.t2)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to compare elections:", err);
        setLoading(false);
      });
  }, [activePresetIndex]);

  const getPartyColor = (party: string) => {
    const p = party.toUpperCase();
    if (p.includes('BJP')) return '#FF9933';
    if (p.includes('SP')) return '#E53935';
    if (p.includes('INC')) return '#1976D2';
    if (p.includes('BSP')) return '#1E40AF';
    if (p.includes('RLD')) return '#10B981';
    if (p.includes('ADAL')) return '#F59E0B';
    if (p.includes('ASPKR')) return '#8B5CF6';
    return '#64748B';
  };

  const filteredFlips = (data?.flipped_seats || []).filter(f => {
    if (flipFilter === 'ALL') return true;
    if (flipFilter === 'TO_SP') return f.comparison?.party === 'SP';
    if (flipFilter === 'TO_BJP') return f.comparison?.party === 'BJP';
    if (flipFilter === 'TO_INC') return f.comparison?.party === 'INC';
    if (flipFilter === 'FROM_BJP') return f.baseline?.party === 'BJP';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Election Comparison Lab
            </h1>
            <SourceBadge type="OFFICIAL" document="ECI Verified Cycle-over-Cycle Archive" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Perform rigorous cycle-over-cycle shift analysis across assembly leads and parliamentary general elections.
          </p>
        </div>

        {/* Preset cycle selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActivePresetIndex(idx)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activePresetIndex === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 font-mono animate-pulse">
          Computing election transition matrix and electoral swing metrics...
        </div>
      ) : !data ? (
        <div className="py-20 text-center text-slate-400 text-xs">No comparative data found.</div>
      ) : (
        <>
          {/* 2. Top Shift Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cycle 1 Summary */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Baseline Cycle</span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {data.baseline_election}
              </h3>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Seats Compared:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{data.total_seats_compared}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Retained by Incumbent:</span>
                  <span className="font-mono font-bold text-emerald-600">{data.retained_seats_count} Seats</span>
                </div>
              </div>
            </div>

            {/* Shift Summary */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">Macro Electoral Turnover</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-mono">
                    {data.flip_rate_pct}%
                  </span>
                  <span className="text-xs text-blue-200">Flip Rate</span>
                </div>
              </div>
              <div className="pt-3 border-t border-blue-800/80 text-xs text-blue-200">
                Total Flipped Seats: <strong className="text-white font-mono font-bold">{data.flipped_seats_count} Flips</strong>
              </div>
            </div>

            {/* Cycle 2 Summary */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Comparison Cycle</span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {data.comparison_election}
              </h3>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Units:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{data.total_seats_compared}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Party Flips:</span>
                  <span className="font-mono font-bold text-amber-600">{data.flipped_seats_count} Seats</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Party Seat Shifts Tally & What Changed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Party Seat Shifts */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Vote className="w-4 h-4 text-blue-600" />
                Party Seat / Lead Shift Breakdown
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {Object.entries(data.party_deltas || {}).map(([party, shift]) => (
                  <div key={party} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getPartyColor(party) }} />
                      <span className="font-bold text-slate-900 dark:text-white">{party}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500 font-mono text-right">
                        <span className="text-slate-400">{shift.baseline_seats}</span>
                        <span className="mx-1.5 text-slate-300">→</span>
                        <strong className="text-slate-900 dark:text-white">{shift.comparison_seats}</strong>
                      </div>
                      <span className={`w-16 text-right font-mono font-bold text-xs ${
                        shift.net_change > 0 ? 'text-emerald-600' :
                        shift.net_change < 0 ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {shift.net_change > 0 ? `+${shift.net_change}` : shift.net_change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What Changed? Analytical Highlights */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  What Changed? Verified Analytical Insights
                </h3>
                <div className="space-y-2.5">
                  {data.what_changed_takeaways && data.what_changed_takeaways.map((insight, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {insight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
                ECI Official Election Comparison Engine
              </div>
            </div>

          </div>

          {/* 4. Flipping Constituencies List */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Constituency Flips & Transitions ({filteredFlips.length})
                </h3>
                <p className="text-xs text-slate-500">Seats where the winning party changed between cycles.</p>
              </div>

              {/* Flip Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={flipFilter}
                  onChange={(e) => setFlipFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">All Flips ({data.flipped_seats_count})</option>
                  <option value="TO_SP">Flips to SP</option>
                  <option value="TO_BJP">Flips to BJP</option>
                  <option value="TO_INC">Flips to INC</option>
                  <option value="FROM_BJP">Losses by BJP</option>
                </select>
              </div>
            </div>

            {/* Flips Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">#</th>
                    <th className="p-3">Constituency</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Baseline Winner</th>
                    <th className="p-3">Comparison Winner</th>
                    <th className="p-3">New Margin</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFlips.map((flip: any) => (
                    <tr key={flip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-500">{flip.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {flip.name} <span className="text-[10px] text-slate-400">({flip.category})</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{flip.district}</td>
                      <td className="p-3">
                        <span className="font-bold px-1.5 py-0.5 rounded text-[11px]" style={{ backgroundColor: `${getPartyColor(flip.baseline?.party || '')}20`, color: getPartyColor(flip.baseline?.party || '') }}>
                          {flip.baseline?.party} ({flip.baseline?.candidate})
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold px-1.5 py-0.5 rounded text-[11px]" style={{ backgroundColor: `${getPartyColor(flip.comparison?.party || '')}20`, color: getPartyColor(flip.comparison?.party || '') }}>
                          {flip.comparison?.party} ({flip.comparison?.candidate})
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {flip.comparison?.margin?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedACNo(flip.id)}
                          className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                          Dossier →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

      {/* Embedded AC Dossier Modal */}
      <ACDossierModal
        acNo={selectedACNo}
        isOpen={selectedACNo !== null}
        onClose={() => setSelectedACNo(null)}
      />

    </div>
  );
};
