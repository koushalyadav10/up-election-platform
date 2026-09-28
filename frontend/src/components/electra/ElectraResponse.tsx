import React from 'react';
import { 
  ElectraQueryResponse, 
  ElectraFactorItem 
} from '../../services/api';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  FileText, 
  BarChart2, 
  Info,
  ShieldCheck,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useElectra } from '../../context/ElectraContext';

interface ElectraResponseProps {
  data: ElectraQueryResponse;
}

export const ElectraResponse: React.FC<ElectraResponseProps> = ({ data }) => {
  const { openEvidenceModal } = useElectra();
  const { sections, evidence, latency_ms } = data;

  const getFactorBadge = (type: string) => {
    switch (type) {
      case 'FACT':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'OBSERVATION':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'DOCUMENTED FACTOR':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'POSSIBLE FACTOR':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4 text-xs sm:text-sm font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
      
      {/* 1. Quick Answer Card */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-blue-700 dark:text-blue-300 font-bold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            ELECTRA RESEARCH ANSWER
          </span>
          <span className="text-slate-400 font-normal">{latency_ms}ms</span>
        </div>
        <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
          {sections.quick_answer}
        </p>
      </div>

      {/* 2. What the Data Shows */}
      {sections.what_data_shows && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>What the Data Shows (Verified Numbers)</span>
          </h4>
          <div className="whitespace-pre-line text-xs font-mono font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {sections.what_data_shows}
          </div>
        </div>
      )}

      {/* 3. What Changed */}
      {sections.what_changed && sections.what_changed !== 'N/A' && (
        <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>What Changed (Comparison Analysis)</span>
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {sections.what_changed}
          </p>
        </div>
      )}

      {/* 4. Current Context (News / Administrative Updates) */}
      {sections.current_context && (
        <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-600" />
            <span>Current Real-Time Context</span>
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {sections.current_context}
          </p>
        </div>
      )}

      {/* 5. Documented vs Possible Factors */}
      {sections.factors && sections.factors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Factor Classification (Empirical Separation)
          </h4>
          <div className="space-y-1.5">
            {sections.factors.map((fac, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 flex items-start gap-2.5 text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider border shrink-0 ${getFactorBadge(fac.type)}`}>
                  {fac.type}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white mr-1.5">{fac.label}:</span>
                  <span className="text-slate-600 dark:text-slate-300">{fac.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Evidence Bar & Deep Inspection Action */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{evidence.confidence_overall}</span>
        </div>

        <button
          onClick={() => openEvidenceModal(evidence)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View Deep Evidence ({evidence.calculations.length + evidence.evidence_items.length} Records)</span>
        </button>
      </div>

      {/* 7. Limitations Note */}
      {sections.limitations && (
        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 italic flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span><strong>Research Boundary:</strong> {sections.limitations}</span>
        </div>
      )}

    </div>
  );
};
