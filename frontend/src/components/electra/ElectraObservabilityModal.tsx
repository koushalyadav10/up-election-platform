import React, { useEffect, useState } from 'react';
import { useElectra } from '../../context/ElectraContext';
import { 
  X, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { fetchElectraTraceLogs, ElectraTraceLogItem } from '../../services/api';

export const ElectraObservabilityModal: React.FC = () => {
  const { isObservabilityOpen, closeObservability } = useElectra();
  const [logs, setLogs] = useState<ElectraTraceLogItem[]>([]);

  useEffect(() => {
    if (isObservabilityOpen) {
      fetchElectraTraceLogs().then(setLogs).catch(() => null);
    }
  }, [isObservabilityOpen]);

  if (!isObservabilityOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-4 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
              DEV & AUDIT TRACE
            </span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Electra RAG Observability & Anti-Hallucination Audit</span>
            </h3>
          </div>

          <button onClick={closeObservability} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2 px-3">Query</th>
                <th className="py-2 px-3">Intent</th>
                <th className="py-2 px-3">Latency</th>
                <th className="py-2 px-3">Records (Int/Ext)</th>
                <th className="py-2 px-3">Validation Check</th>
                <th className="py-2 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 max-w-xs truncate text-slate-900 dark:text-white font-sans" title={l.query}>
                    {l.query}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                    {l.intent}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {l.latency_ms}ms
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    {l.internal_records} / {l.external_sources}
                  </td>
                  <td className="py-2.5 px-3">
                    {l.numerical_checks_passed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> Flagged
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                    {l.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button onClick={closeObservability} className="px-4 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-lg">
            Close Trace
          </button>
        </div>

      </div>
    </div>
  );
};
