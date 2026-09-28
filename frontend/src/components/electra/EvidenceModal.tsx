import React from 'react';
import { useElectra } from '../../context/ElectraContext';
import { 
  X, 
  Layers, 
  ShieldCheck, 
  Calculator, 
  Database, 
  ExternalLink,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const EvidenceModal: React.FC = () => {
  const { activeEvidence, closeEvidenceModal } = useElectra();
  if (!activeEvidence) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                AUDIT ID #{activeEvidence.evidence_id}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {activeEvidence.confidence_overall}
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Grounded Evidence & Calculation Inspector</span>
            </h3>
          </div>

          <button
            onClick={closeEvidenceModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Mathematical Formulas & Calculations */}
        {activeEvidence.calculations && activeEvidence.calculations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mathematical Calculations & Formulas</span>
            </h4>
            <div className="space-y-2.5">
              {activeEvidence.calculations.map(c => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                    <span>{c.label}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Result: {c.result}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    <strong>Formula:</strong> {c.formula}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    {Object.entries(c.inputs).map(([k, v]) => (
                      <div key={k} className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400">{k}:</span> <strong className="text-slate-700 dark:text-slate-200">{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Authority: {c.verification}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Underlying Evidence Records */}
        {activeEvidence.evidence_items && activeEvidence.evidence_items.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Underlying Official Database Records & Sources</span>
            </h4>
            <div className="space-y-2">
              {activeEvidence.evidence_items.map(it => (
                <div key={it.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{it.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {it.verification_status}
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2">
                    <span>{it.authority}</span>
                    {it.year && <span>• Year {it.year}</span>}
                    {it.publication_date && <span>• Published {it.publication_date}</span>}
                  </div>
                  {it.metrics && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 font-mono text-[11px]">
                      {Object.entries(it.metrics).map(([k, v]) => (
                        <div key={k} className="p-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400">{k}:</span> <strong>{Array.isArray(v) ? v.join(', ') : String(v)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                  {it.source_url && (
                    <div className="pt-1">
                      <a 
                        href={it.source_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Inspect Original Source Publication</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={closeEvidenceModal}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-lg"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
