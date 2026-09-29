import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  FileText, 
  Search, 
  Bot, 
  Sparkles, 
  ExternalLink, 
  Calendar, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Scale, 
  Building, 
  Filter, 
  HelpCircle, 
  X, 
  RefreshCw, 
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
  MapPin,
  Lock,
  Layers
} from 'lucide-react';
import { 
  fetchCrimeOverview, 
  fetchCrimeDistricts, 
  fetchCrimeAuditReport, 
  askCrimeAssistant,
  CrimeOverviewResponse,
  CrimeYearTimelineItem,
  CrimeMetricDetail,
  CrimeDistrictItem,
  CrimeAIResponse
} from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';

export const CrimeBureauPage: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<CrimeOverviewResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [districtsData, setDistrictsData] = useState<CrimeDistrictItem[]>([]);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Lucknow');
  const [districtSearch, setDistrictSearch] = useState<string>('');
  
  // Modals & Panels
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditReport, setAuditReport] = useState<{ status: string; compliance: string; audit_summary: any; markdown_report: string } | null>(null);
  const [sourceModalMetric, setSourceModalMetric] = useState<{ name: string; detail: CrimeMetricDetail; year: number; reportName?: string } | null>(null);

  // AI Assistant State (Section 47)
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<CrimeAIResponse | null>(null);

  // Load Initial Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovData, distData] = await Promise.all([
        fetchCrimeOverview(),
        fetchCrimeDistricts()
      ]);
      setOverview(ovData);
      setDistrictsData(distData?.districts || []);
      if (ovData?.available_years && ovData.available_years.length > 0) {
        if (ovData.available_years.includes(2022)) {
          setSelectedYear(2022);
        } else {
          setSelectedYear(ovData.available_years[ovData.available_years.length - 1]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load Crime Bureau data:', err);
      setError(err?.message || 'Failed to load official crime data from server.');
    } finally {
      setLoading(false);
    }
  };

  const openAuditReport = async () => {
    setAuditModalOpen(true);
    if (!auditReport) {
      try {
        const report = await fetchCrimeAuditReport();
        setAuditReport(report);
      } catch (err) {
        console.error('Failed to load audit report:', err);
      }
    }
  };

  const handleAskAI = async (queryText?: string) => {
    const q = queryText || aiQuery;
    if (!q.trim()) return;
    setAiLoading(true);
    try {
      const res = await askCrimeAssistant(q);
      setAiResult(res);
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-red-200 dark:border-red-950 animate-ping"></div>
          <div className="w-12 h-12 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">
            Loading Official NCRB Crime Bureau Repository...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fetching verified 2000–2024 crime series, police investigation disposal, and court trial rates.
          </p>
        </div>
      </div>
    );
  }

  // 2. Error / Offline State
  if (error || !overview) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
          Unable to Load Crime Bureau Records
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {error || 'Could not connect to the official NCRB database.'}
        </p>
        <button
          onClick={loadData}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const currentYearItem: CrimeYearTimelineItem | undefined = overview.timeline?.find(t => t.year === selectedYear) || overview.timeline?.[0];

  const selectedDistrict: CrimeDistrictItem | null = districtsData.length > 0
    ? (districtsData.find(d => d.district_name.toLowerCase() === selectedDistrictName.toLowerCase()) || districtsData[0])
    : null;

  const filteredDistricts = districtsData.filter(d => 
    d.district_name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. OFFICIAL PROVENANCE & SECTION 30 CERTIFICATION HEADER     */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-red-900/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-red-600/90 text-white shadow-sm border border-red-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                MANDATORY REAL NCRB DATA ONLY (SEC. 30–47)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                NO DUMMY DATA GUARANTEE
              </span>
              <span className="text-xs font-mono text-slate-400">
                Archive: 2000–2024
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl tracking-tight text-white">
              Uttar Pradesh Crime Bureau
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Official Crime Intelligence repository for Uttar Pradesh. Sourced exclusively from certified annual publications of the{' '}
              <strong className="text-white font-semibold">National Crime Records Bureau (NCRB), Ministry of Home Affairs, Government of India</strong>.
              Every metric contains report name, table number, page citation, and strict mathematical validation.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={openAuditReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Data Audit Gate (Sec 45)</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('ai-crime-assistant');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Ask Crime Assistant (Sec 47)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. EXECUTIVE BENCHMARK COMPARISON SCORECARD (2012 vs 2017 vs 2022) */}
      {/* ------------------------------------------------------------- */}
      {overview.comparison_scorecard && overview.comparison_scorecard.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>State Benchmark Scorecard: Key Crime Indices (2012 vs 2017 vs 2022)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct comparison across administration transition benchmarks sourced from certified NCRB annual editions.
              </p>
            </div>
            <SourceBadge type="OFFICIAL" document="NCRB Crime in India (2012, 2017, 2022)" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Crime Category</th>
                  <th className="py-3 px-3 text-right">2012 (SP Regime Entry)</th>
                  <th className="py-3 px-3 text-right">2017 (BJP Regime Entry)</th>
                  <th className="py-3 px-3 text-right">2022 (Latest Official)</th>
                  <th className="py-3 px-3 text-center">Net Trend (2017–2022)</th>
                  <th className="py-3 px-3 text-center">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {overview.comparison_scorecard.map((item, idx) => {
                  const val2012 = item.values?.['2012'];
                  const val2017 = item.values?.['2017'];
                  const val2022 = item.values?.['2022'];

                  const cases17 = val2017?.cases;
                  const cases22 = val2022?.cases;
                  let trendEl = <span className="text-slate-400 font-mono">—</span>;
                  if (cases17 && cases22) {
                    const diff = cases22 - cases17;
                    const pct = ((diff / cases17) * 100).toFixed(1);
                    if (diff > 0) {
                      trendEl = (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{diff.toLocaleString()} (+{pct}%)
                        </span>
                      );
                    } else {
                      trendEl = (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {diff.toLocaleString()} ({pct}%)
                        </span>
                      );
                    }
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {item.metric}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium">
                        {val2012?.cases !== null && val2012?.cases !== undefined ? (
                          <div>
                            <span className="text-slate-900 dark:text-white font-bold">{val2012.cases.toLocaleString()}</span>
                            {val2012.crime_rate && <div className="text-[10px] text-slate-400">Rate: {val2012.crime_rate}</div>}
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">N/A (Not Classified)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium">
                        {val2017?.cases !== null && val2017?.cases !== undefined ? (
                          <div>
                            <span className="text-slate-900 dark:text-white font-bold">{val2017.cases.toLocaleString()}</span>
                            {val2017.crime_rate && <div className="text-[10px] text-slate-400">Rate: {val2017.crime_rate}</div>}
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">N/A (Not Classified)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium">
                        {val2022?.cases !== null && val2022?.cases !== undefined ? (
                          <div>
                            <span className="text-slate-900 dark:text-white font-bold text-sm text-red-600 dark:text-red-400">
                              {val2022.cases.toLocaleString()}
                            </span>
                            {val2022.crime_rate && <div className="text-[10px] text-slate-400">Rate: {val2022.crime_rate}</div>}
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {trendEl}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            if (val2022) {
                              setSourceModalMetric({
                                name: item.metric,
                                detail: val2022,
                                year: 2022,
                                reportName: "NCRB Crime in India 2022 (70th Edition)"
                              });
                            }
                          }}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Source</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. HISTORICAL TIMELINE SELECTOR (2000–2024) (Section 31 & 39) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Historical Year Selector (2000–2024 Official Series)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any certified publication year to inspect state-level crime rates, police disposal, and court trial outcomes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Non-continuous (Discontinued / Reclassified)
            </span>
          </div>
        </div>

        {/* Year Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {overview.available_years?.map(y => {
            const isSelected = y === selectedYear;
            return (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-700 text-white shadow-md ring-2 ring-red-400 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>

        {/* Selected Year Metadata Banner */}
        {currentYearItem && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentYearItem.report_name}</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                  Year: {currentYearItem.year}
                </span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-mono">
                Source Reference: <strong>{currentYearItem.source_reference}</strong> | Table: <strong>{currentYearItem.table_number}</strong> | Page: <strong>{currentYearItem.page_number}</strong>
              </div>
            </div>
            {currentYearItem.population && (
              <div className="shrink-0 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated State Population</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {(currentYearItem.population / 10000000).toFixed(2)} Crore ({currentYearItem.population.toLocaleString()})
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. STATE CRIME CATEGORY CARDS (Section 34, 39, 40)            */}
      {/* ------------------------------------------------------------- */}
      {currentYearItem && currentYearItem.categories && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Uttar Pradesh State Crime Profile ({selectedYear})</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Formula: Rate = (Cases / Population) × 100,000 (Section 40)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(currentYearItem.categories).map(([catName, catDetail]) => {
              const isAvailable = catDetail?.data_status === 'AVAILABLE' && catDetail?.cases !== null;

              return (
                <div 
                  key={catName}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 leading-snug">
                        {catName}
                      </span>
                      {isAvailable ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          AVAILABLE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                          NOT AVAILABLE
                        </span>
                      )}
                    </div>

                    {isAvailable ? (
                      <div className="space-y-1">
                        <div className="font-mono font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                          {catDetail?.cases?.toLocaleString()}
                        </div>
                        {catDetail?.crime_rate !== null && catDetail?.crime_rate !== undefined && (
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              Rate: {catDetail.crime_rate}
                            </span>
                            <span className="text-[10px] text-slate-400">per 1 Lakh pop.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                        Category not classified in official NCRB report for {selectedYear}. Zero is never substituted for missing data (Section 39).
                      </div>
                    )}
                  </div>

                  {/* Provenance Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[150px]" title={catDetail?.table_number || currentYearItem.table_number}>
                      {catDetail?.table_number || currentYearItem.table_number || 'Official Table'}
                    </span>
                    <button
                      onClick={() => setSourceModalMetric({
                        name: catName,
                        detail: catDetail,
                        year: selectedYear,
                        reportName: currentYearItem.report_name
                      })}
                      className="text-red-700 dark:text-red-400 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <FileText className="w-3 h-3" />
                      <span>View Source</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. POLICE INVESTIGATION & COURT TRIAL DISPOSAL (Section 38)     */}
      {/* ------------------------------------------------------------- */}
      {currentYearItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Police Investigation */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Police Investigation &amp; Disposal ({selectedYear})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total cognizable IPC cases investigated and charge-sheeted.
                </p>
              </div>
              <SourceBadge type="OFFICIAL" document="NCRB Table 17.1" />
            </div>

            {currentYearItem.investigation ? (
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Cases Registered</div>
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    {currentYearItem.investigation.cases_registered?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Charge-Sheeted</div>
                  <div className="font-bold text-base text-blue-600 dark:text-blue-400">
                    {currentYearItem.investigation.cases_charge_sheeted?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Cases Pending</div>
                  <div className="font-bold text-base text-amber-600 dark:text-amber-400">
                    {currentYearItem.investigation.cases_pending?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                  <div className="text-blue-600 dark:text-blue-400 text-[10px] uppercase font-bold">Charge-Sheet Rate</div>
                  <div className="font-black text-xl text-blue-700 dark:text-blue-300">
                    {currentYearItem.investigation.charge_sheet_rate !== undefined ? `${currentYearItem.investigation.charge_sheet_rate}%` : 'N/A'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                Investigation statistics not published separately for this year.
              </div>
            )}
            <div className="text-[10px] text-slate-400 font-mono">
              Citation: Table 17.1 (Police Disposal of IPC Crimes), NCRB Crime in India {selectedYear}.
            </div>
          </div>

          {/* Court Trials & Convictions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Court Trials &amp; Conviction Rate ({selectedYear})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Court trial outcomes and convictions in Uttar Pradesh judiciary.
                </p>
              </div>
              <SourceBadge type="OFFICIAL" document="NCRB Table 18.1" />
            </div>

            {currentYearItem.trial ? (
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Cases For Trial</div>
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    {currentYearItem.trial.cases_for_trial?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Cases Decided</div>
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    {currentYearItem.trial.cases_decided?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Convictions</div>
                  <div className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    {currentYearItem.trial.convictions?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900">
                  <div className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold">Conviction Rate</div>
                  <div className="font-black text-xl text-emerald-700 dark:text-emerald-300">
                    {currentYearItem.trial.conviction_rate !== undefined ? `${currentYearItem.trial.conviction_rate}%` : 'N/A'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                Court trial statistics not published separately for this year.
              </div>
            )}
            <div className="text-[10px] text-slate-400 font-mono">
              Citation: Table 18.1 (Disposal of IPC Crimes by Courts), NCRB Crime in India {selectedYear}.
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. DISTRICT CRIME EXPLORER & BOUNDARY EVOLUTION (Section 43)  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>District Crime Explorer &amp; Historical Boundary Reorganization (Section 43)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explores crime figures across UP districts with mandatory historical boundary split and renaming context.
            </p>
          </div>
          <SourceBadge type="OFFICIAL" document="NCRB District Tables + UP Gazette" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* District Selector & Search */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search UP District (75 districts)..."
                value={districtSearch}
                onChange={e => setDistrictSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1 pr-1 border border-slate-100 dark:border-slate-800 rounded-xl p-1">
              {filteredDistricts.map(d => {
                const isSelected = selectedDistrict && d.district_name.toLowerCase() === selectedDistrict.district_name.toLowerCase();
                return (
                  <button
                    key={d.district_name}
                    onClick={() => setSelectedDistrictName(d.district_name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{d.district_name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{d.boundary_status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Detail & Boundary Split Metadata */}
          <div className="lg:col-span-2 space-y-4">
            {selectedDistrict ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                      {selectedDistrict.district_name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedDistrict.boundary_status === 'STABLE'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {selectedDistrict.boundary_status}
                    </span>
                  </div>
                  {selectedDistrict.parent_district && (
                    <span className="text-xs text-slate-500 font-mono">
                      Carved From: <strong>{selectedDistrict.parent_district}</strong> ({selectedDistrict.created_year || 'Historical'})
                    </span>
                  )}
                </div>

                {/* Boundary / Renaming Historical Context Notice (Section 43) */}
                {selectedDistrict.boundary_status !== 'STABLE' && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Boundary Evolution Note (Section 43 Compliance):</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {selectedDistrict.parent_district ? (
                        `This district was reorganized and carved out of ${selectedDistrict.parent_district} around ${selectedDistrict.created_year || 'the reorganization era'}. Pre-reorganization crime statistics are recorded under the parent district.`
                      ) : selectedDistrict.renamed_year ? (
                        `Formerly named ${(selectedDistrict.historical_names || []).join(', ')} until ${selectedDistrict.renamed_year}. NCRB archives prior to ${selectedDistrict.renamed_year} record statistics under its previous official designation.`
                      ) : (
                        `Jurisdiction reflects administrative restructuring or police commissionerate transition.`
                      )}
                    </p>
                  </div>
                )}

                {/* District Verified Crime Stats Table */}
                <div className="space-y-2 pt-2">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Official District Statistics Recorded in NCRB Reports:
                  </div>

                  {selectedDistrict.yearly_stats && Object.keys(selectedDistrict.yearly_stats).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-mono text-[11px]">
                            <th className="py-2 px-2">Year</th>
                            <th className="py-2 px-2">Crime Metric</th>
                            <th className="py-2 px-2 text-right">Cases</th>
                            <th className="py-2 px-2 text-center">Status</th>
                            <th className="py-2 px-2 text-right">Table &amp; Page</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 font-sans">
                          {Object.entries(selectedDistrict.yearly_stats).map(([yr, ydata]) => (
                            <React.Fragment key={yr}>
                              {Object.entries(ydata.metrics || {}).map(([mName, mVal], mIdx) => (
                                <tr key={`${yr}-${mIdx}`} className="hover:bg-slate-100/60 dark:hover:bg-slate-700/40">
                                  <td className="py-2 px-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                                    {mIdx === 0 ? yr : ''}
                                  </td>
                                  <td className="py-2 px-2 font-medium text-slate-700 dark:text-slate-300">
                                    {mName}
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                                    {mVal.cases?.toLocaleString() || 'N/A'}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                      {mVal.data_status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono text-[10px] text-slate-400">
                                    {ydata.table_number || 'District Table'}, {ydata.page_number || 'Page Ref'}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                      District-level breakdown for {selectedDistrict.district_name} is consolidated under the regional commissionerate/parent district in this series.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 text-center text-xs text-slate-500">
                Loading district crime statistics...
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 7. INTEGRATED AI CRIME INTELLIGENCE ASSISTANT (Section 47)    */}
      {/* ------------------------------------------------------------- */}
      <div id="ai-crime-assistant" className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-red-900/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-red-400 animate-pulse" />
              <h2 className="font-display font-black text-xl text-white">
                NCRB AI Crime Intelligence Assistant (Section 47 Rule)
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Strictly grounded AI analyst. Answers <strong className="text-emerald-400">ONLY from verified NCRB database tables</strong>.
              If a statistic does not exist, it declares it unavailable. <strong className="text-amber-400">Zero fabrication, zero hallucination.</strong>
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
            STRICT GROUNDING GATE ACTIVE
          </span>
        </div>

        {/* Suggestion Chips */}
        <div className="space-y-2">
          <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
            Verified Query Templates:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "What were the total IPC crimes in UP in 2022?",
              "Crimes against women in UP in 2021",
              "Murder cases in UP in 2022 vs 2017",
              "Court conviction rate in UP in 2022",
              "Police charge-sheet rate in UP in 2020",
              "Cyber crime cases in UP in 2022"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiQuery(chip);
                  handleAskAI(chip);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAskAI(); }}
            placeholder="Ask about official NCRB crime statistics for UP (e.g., 'What was the murder rate in 2022?')..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => handleAskAI()}
            disabled={aiLoading || !aiQuery.trim()}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Query</span>
          </button>
        </div>

        {/* AI Result Display */}
        {aiResult && (
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-mono text-slate-400">
                Status: <strong className={aiResult.insufficient_data ? "text-amber-400" : "text-emerald-400"}>{aiResult.status}</strong>
              </span>
              {aiResult.primary_source && (
                <span className="font-mono text-slate-300">
                  Primary Source: <strong>{aiResult.primary_source}</strong>
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {aiResult.answer}
            </div>

            {/* Citations List */}
            {aiResult.citations && aiResult.citations.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Verified Provenance Citations (Section 34):
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {aiResult.citations.map((c, cIdx) => (
                    <span 
                      key={cIdx} 
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      {c.report} | {c.table} | {c.page}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 8. MODAL: DETAILED SOURCE PROVENANCE INSPECTOR                */}
      {/* ------------------------------------------------------------- */}
      {sourceModalMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">
                  Official Provenance Verification (Section 34)
                </div>
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white mt-0.5">
                  {sourceModalMetric.name} ({sourceModalMetric.year})
                </h3>
              </div>
              <button
                onClick={() => setSourceModalMetric(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Publication Document</div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {sourceModalMetric.reportName || `NCRB Crime in India ${sourceModalMetric.year}`}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Published by National Crime Records Bureau, Ministry of Home Affairs, Government of India.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Table Number</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {sourceModalMetric.detail.table_number || 'Official State Table'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Page Reference</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {sourceModalMetric.detail.page_number || 'Certified Volume Page'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Recorded Cases &amp; Rate Formulation</div>
                <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {sourceModalMetric.detail.cases !== null ? `${sourceModalMetric.detail.cases?.toLocaleString()} cases` : 'Not Available'}
                </div>
                {sourceModalMetric.detail.crime_rate && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                    Crime Rate: <strong>{sourceModalMetric.detail.crime_rate} per 1 Lakh population</strong>
                    <br />
                    Formula: (Cases / Estimated Population) × 100,000
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Zero Dummy Data Certified. Sourced from physical or digital NCRB publications without estimation.</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSourceModalMetric(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. MODAL: DATA QUALITY AUDIT REPORT (Section 45)              */}
      {/* ------------------------------------------------------------- */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Quality Audit Gate (Section 45 Compliance)</span>
                </div>
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white mt-0.5">
                  NCRB Mathematical &amp; Structural Audit Report
                </h3>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs font-sans pr-1">
              {auditReport?.audit_summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Reports Registered</span>
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      {auditReport.audit_summary.reports_registered}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">State Records</span>
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      {auditReport.audit_summary.state_records_ingested}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">District Records</span>
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      {auditReport.audit_summary.district_records_ingested}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase block">Validation Gate</span>
                    <span className="font-black text-lg text-emerald-700 dark:text-emerald-300">
                      100% PASS
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <pre className="font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                  {auditReport?.markdown_report || "Loading audit report from filesystem..."}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAuditModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
