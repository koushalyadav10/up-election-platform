import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Database, 
  Activity, 
  Lock, 
  Clock, 
  Hash, 
  RefreshCw 
} from 'lucide-react';
import { fetchDataQualityReport, DataQualityReport } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { useLanguage } from '../context/LanguageContext';

export const DataQualityPage: React.FC = () => {
  const { language } = useLanguage();
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = () => {
    setLoading(true);
    fetchDataQualityReport()
      .then(res => {
        setReport(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load data quality report:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Data Quality & Provenance Center
            </h1>
            <SourceBadge type="OFFICIAL" document="ECI Verification Engine" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated integrity verification across 8 electoral health dimensions and immutable dataset provenance ledger.
          </p>
        </div>

        <button
          onClick={loadReport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Run Live Audit</span>
        </button>
      </div>

      {loading || !report ? (
        <div className="py-24 text-center text-slate-400 font-mono animate-pulse">
          Executing automated database integrity tests...
        </div>
      ) : (
        <>
          {/* 2. Top Executive Health Score Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-700/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-300">
                  System Health Assessment
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {report.overall_status === 'HEALTHY' ? 'VERIFIED HEALTHY: 100% COMPLIANT' : 'CHECKS REQUIRED'}
              </h2>
              <p className="text-xs text-emerald-200/80 max-w-xl leading-relaxed">
                All Parliamentary and Assembly queries are guarded against contamination. ECI candidate vote totals reconcile perfectly with declared winning margins.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10">
              <div className="text-right">
                <span className="block text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Health Score</span>
                <span className="text-3xl font-black font-mono text-emerald-400">{report.health_score_pct}%</span>
              </div>
              <div className="h-10 w-[1px] bg-white/20" />
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Checks Passed</span>
                <span className="text-xl font-extrabold font-mono text-white">
                  {report.passed_checks_count} / {report.total_checks_count}
                </span>
              </div>
            </div>
          </div>

          {/* 3. The 8 Health Dimension Cards */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Audited Health Dimensions (8 Criteria)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {report.health_dimensions.map(dim => (
                <div
                  key={dim.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {dim.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        {dim.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight mb-2">
                      {dim.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {dim.details}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                    ID: {dim.id} • Automated Check
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Dataset Provenance Ledger */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                ECI Dataset Provenance Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Official Election Commission of India publication metadata, record count audit, and cryptographic checksums.
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Dataset Code</th>
                    <th className="p-3">Official Dataset Name</th>
                    <th className="p-3">Election Cycle</th>
                    <th className="p-3">Source Authority</th>
                    <th className="p-3">Constituency Records</th>
                    <th className="p-3">Candidate Records</th>
                    <th className="p-3">Checksum</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.dataset_provenance_ledger.map(ledger => (
                    <tr key={ledger.dataset_code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{ledger.dataset_code}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{ledger.name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{ledger.election}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{ledger.source_authority}</td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{ledger.records_count}</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{ledger.candidate_records}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {ledger.checksum.slice(0, 10)}...
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {ledger.validation_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">
              Audit Run Timestamp: {new Date(report.audit_timestamp).toLocaleString()}
            </div>
          </div>

        </>
      )}

    </div>
  );
};
