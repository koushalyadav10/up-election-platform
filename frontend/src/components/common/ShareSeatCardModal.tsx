import { createPortal } from 'react-dom';
import React from 'react';
import { ACDossierResponse } from '../../services/api';
import { X, Download, Share2, Check, ShieldCheck } from 'lucide-react';

interface ShareSeatCardModalProps {
  data: ACDossierResponse;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareSeatCardModal: React.FC<ShareSeatCardModalProps> = ({ data, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
    // Lock scroll and handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tri = data.tri_election_comparison;
  const vs22 = tri?.assembly_2022;
  const vs17 = tri?.assembly_2017;
  const ls24 = tri?.lok_sabha_segment_2024;
  const m27 = data.mission_2027;

  const handleCopyText = () => {
    const text = `UP Election Intelligence Dossier: ${data.basic_info.name} (AC #${data.basic_info.ac_no}, ${data.basic_info.district})
• 2022 Assembly Winner: ${vs22?.winner} (${vs22?.party}) by +${vs22?.margin_votes.toLocaleString()} (${vs22?.margin_percentage}%)
• 2017 Assembly Winner: ${vs17?.winner} (${vs17?.party}) by +${vs17?.margin_votes.toLocaleString()} (${vs17?.margin_percentage}%)
• Electoral Roll: ${vs22?.total_electors?.toLocaleString()} electors (Electorate Change: ${data.sir_electoral_roll?.percentage_change !== null && data.sir_electoral_roll?.percentage_change !== undefined ? `${data.sir_electoral_roll.percentage_change}%` : 'Unavailable'})
• Classification: ${m27?.category} (${m27?.reason_metric})
ECI Official Data Warehouse • Grounded In Certified Gazette Records`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div className="fixed inset-0 z-command-overlay flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Share Seat Intelligence Card</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable/Shareable Card UI */}
        <div className="p-6">
          <div 
            id="shareable-seat-card" 
            className="p-6 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 shadow-md font-sans"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                  UP ELECTION INTELLIGENCE
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {data.basic_info.name} <span className="font-mono text-sm font-normal text-slate-500">#{data.basic_info.ac_no}</span>
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {data.basic_info.district} District • {data.basic_info.parent_pc.pc_name} PC
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white font-mono text-[10px] font-bold rounded uppercase tracking-wider">
                  {m27?.category}
                </span>
              </div>
            </div>

            {/* Tri-Election Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-500">2017 Assembly</div>
                <div className="font-bold text-xs mt-1 text-slate-900 dark:text-white truncate">{vs17?.winner}</div>
                <div className="text-xs font-mono font-bold text-orange-600">{vs17?.party}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">+{vs17?.margin_votes.toLocaleString()}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40">
                <div className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold">2022 Assembly</div>
                <div className="font-bold text-xs mt-1 text-slate-900 dark:text-white truncate">{vs22?.winner}</div>
                <div className="text-xs font-mono font-bold text-emerald-600">{vs22?.party}</div>
                <div className="text-[10px] font-mono text-slate-700 dark:text-slate-300 mt-0.5">+{vs22?.margin_votes.toLocaleString()}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase text-indigo-600 dark:text-indigo-400">2024 LS Segment</div>
                <div className="font-bold text-xs mt-1 text-slate-900 dark:text-white truncate">{ls24?.winner}</div>
                <div className="text-xs font-mono font-bold text-indigo-600">{ls24?.party}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">+{ls24?.margin_votes.toLocaleString()}</div>
              </div>
            </div>

            {/* Key Verified Trend Note */}
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-xs text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Trend: </strong>
              {m27?.reason_metric}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> ECI Certified Returns (Form 20)
              </span>
              <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCopyText}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Copied Text Summary!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> Copy Text Summary
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Print / Export Card
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
