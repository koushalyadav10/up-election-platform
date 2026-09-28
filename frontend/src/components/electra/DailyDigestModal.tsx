import React, { useEffect, useState } from 'react';
import { useElectra } from '../../context/ElectraContext';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { fetchElectraDigest, ElectraDailyDigest } from '../../services/api';

export const DailyDigestModal: React.FC = () => {
  const { isDigestOpen, closeDigest } = useElectra();
  const [digest, setDigest] = useState<ElectraDailyDigest | null>(null);

  useEffect(() => {
    if (isDigestOpen) {
      fetchElectraDigest().then(setDigest).catch(() => null);
    }
  }, [isDigestOpen]);

  if (!isDigestOpen || !digest) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-5 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                DAILY INTELLIGENCE BRIEF
              </span>
              <span className="text-xs text-slate-400 font-mono">{digest.date}</span>
            </div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>{digest.title}</span>
            </h3>
          </div>

          <button onClick={closeDigest} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-800 border border-indigo-100 dark:border-indigo-900/60 space-y-1 text-xs">
          <div className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[11px]">
            Key Takeaways & Status
          </div>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {digest.executive_summary}
          </p>
        </div>

        {/* Bulletin Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Verified Today's Bulletins
          </h4>
          <div className="space-y-2.5">
            {digest.bulletin_items.map((b, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 space-y-1 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-bold text-slate-900 dark:text-white leading-snug">{b.headline}</h5>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    {b.badge}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {b.summary}
                </p>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Source: {b.source}</span>
                  <span>{b.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button onClick={closeDigest} className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-lg">
            Dismiss Brief
          </button>
        </div>

      </div>
    </div>
  );
};
