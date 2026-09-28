import React from 'react';
import { ACComparisonItem } from '../../services/api';
import { X, ArrowRight, Layers, Trash2 } from 'lucide-react';

interface PinCompareDrawerProps {
  pinnedAcs: ACComparisonItem[];
  onRemoveAC: (acNo: number) => void;
  onClearAll: () => void;
  onOpenACDossier: (acNo: number) => void;
}

export const PinCompareDrawer: React.FC<PinCompareDrawerProps> = ({
  pinnedAcs,
  onRemoveAC,
  onClearAll,
  onOpenACDossier
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (pinnedAcs.length === 0) return null;

  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white dark:bg-emerald-600 dark:text-white rounded-full shadow-xl hover:shadow-2xl transition-all border border-slate-700"
        >
          <Layers className="w-4 h-4" />
          <span className="font-semibold text-xs tracking-wide">
            Compare Pinned Seats ({pinnedAcs.length}/3)
          </span>
          <span className="w-5 h-5 rounded-full bg-white text-slate-900 dark:bg-slate-900 dark:text-white text-[10px] font-bold flex items-center justify-center">
            {pinnedAcs.length}
          </span>
        </button>
      </div>

      {/* Expanded Bottom Drawer */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Multi-Constituency Comparative Laboratory ({pinnedAcs.length} Selected)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClearAll}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comparative Grid */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-left font-semibold">
                    <th className="p-3 border border-slate-200 dark:border-slate-800 w-44">Analytical Indicator</th>
                    {pinnedAcs.map(ac => (
                      <th key={ac.ac_no} className="p-3 border border-slate-200 dark:border-slate-800 min-w-[220px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{ac.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">AC #{ac.ac_no} • {ac.district}</div>
                          </div>
                          <button
                            onClick={() => onRemoveAC(ac.ac_no)}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">2022 Assembly Winner</td>
                    {pinnedAcs.map(ac => (
                      <td key={ac.ac_no} className="p-3">
                        <div className="font-bold">{ac.winner_2022}</div>
                        <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{ac.party_2022} (+{ac.margin_2022.toLocaleString()} | {ac.margin_pct_2022}%)</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">2017 Assembly Winner</td>
                    {pinnedAcs.map(ac => (
                      <td key={ac.ac_no} className="p-3">
                        <div>{ac.winner_2017}</div>
                        <div className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{ac.party_2017} (+{ac.margin_2017.toLocaleString()} | {ac.margin_pct_2017}%)</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">2024 Lok Sabha Segment Lead</td>
                    {pinnedAcs.map(ac => (
                      <td key={ac.ac_no} className="p-3">
                        <div className="font-medium">{ac.lead_2024}</div>
                        <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{ac.party_2024} (+{ac.margin_2024?.toLocaleString()} | {ac.margin_pct_2024}%)</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">Voter Turnout (2022 vs 2024)</td>
                    {pinnedAcs.map(ac => (
                      <td key={ac.ac_no} className="p-3 font-mono">
                        {ac.turnout_2022}% (VS) → {ac.turnout_2024}% (LS)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">SIR Electoral Roll Net Change</td>
                    {pinnedAcs.map(ac => (
                      <td key={ac.ac_no} className="p-3">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {ac.sir_net_change !== null && ac.sir_net_change !== undefined 
                            ? `${ac.sir_net_change > 0 ? '+' : ''}${ac.sir_net_change.toLocaleString()} (${ac.sir_pct_change}%)` 
                            : 'Unavailable'}
                        </div>
                        <div className="text-[10px] text-slate-500">{ac.sir_impact_label || 'Data Unavailable'}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">Demographics (District Benchmark)</td>
                    {pinnedAcs.map(ac => (
                      <td key={ac.ac_no} className="p-3 text-[11px]">
                        <div>SC: <strong>{ac.sc_pct}%</strong> | Literacy: <strong>{ac.literacy_pct}%</strong></div>
                        <div>Rural: <strong>{ac.rural_pct}%</strong></div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">Mission 2027 Classification</td>
                    {pinnedAcs.map(ac => (
                      <td key={ac.ac_no} className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold font-mono">
                          {ac.battleground_category}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">Action</td>
                    {pinnedAcs.map(ac => (
                      <td key={ac.ac_no} className="p-3">
                        <button
                          onClick={() => { onOpenACDossier(ac.ac_no); setIsOpen(false); }}
                          className="px-3 py-1.5 bg-slate-900 dark:bg-emerald-600 text-white rounded text-xs font-semibold hover:opacity-90 flex items-center gap-1.5"
                        >
                          Open Dossier <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
