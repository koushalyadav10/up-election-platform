import React, { useEffect, useState } from 'react';
import { fetchSourcesVault } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  History, 
  FileText, 
  Download, 
  FolderArchive, 
  Search, 
  FileSpreadsheet,
  BookOpen,
  Activity,
  Layers,
  Scale
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DataSourcesPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'vault' | 'methodology'>('methodology');
  const [vault, setVault] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchSourcesVault().then(data => {
      setVault(data);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading sources vault:", err);
      setLoading(false);
    });
  }, []);

  if (loading || !vault) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 font-mono animate-pulse">
        Accessing official ECI data repository & source vault...
      </div>
    );
  }

  const histFiles: any[] = vault.historical_repository || [];

  const filteredFiles = histFiles.filter(f => {
    if (yearFilter !== 'ALL' && f.election_year.toString() !== yearFilter) return false;
    if (formatFilter !== 'ALL' && f.format !== formatFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    }
    return true;
  });

  const uniqueYears = Array.from(new Set(histFiles.map(f => f.election_year))).sort((a: any, b: any) => b - a);

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> CERTIFIED ECI REPOSITORY
            </span>
            <SourceBadge type="OFFICIAL" document="ECI Delimitation & Primary Archives" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Methodology, Definitions &amp; ECI Primary Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Detailed statistical formulations, delimitation boundary standards, query isolation protocols, and local copies of all 75 official Election Commission of India files.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('methodology')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'methodology'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Methodology &amp; Formulas</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'vault'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>ECI File Vault ({histFiles.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'methodology' ? (
        /* ================= METHODOLOGY & DEFINITIONS SECTION ================= */
        <div className="space-y-6">
          
          {/* Section 1: Electoral Competitiveness Index (0-100) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                1. Electoral Competitiveness Index (0–100 Scale)
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlike simplistic two-party swing heuristics, our <strong>Electoral Competitiveness Engine</strong> is a formula-based, multi-dimensional metric computed directly from verified ECI returns across recent election cycles:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[10px] text-blue-600 font-bold">35% WEIGHT</span>
                <h4 className="font-bold text-slate-900 dark:text-white mt-1">Margin Tightness</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Inversely proportional to victory margin percentage. Margins below 2% receive maximum weight.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[10px] text-indigo-600 font-bold">20% WEIGHT</span>
                <h4 className="font-bold text-slate-900 dark:text-white mt-1">Runner-up Proximity</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Evaluates runner-up vote share relative to winning vote share.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[10px] text-purple-600 font-bold">20% WEIGHT</span>
                <h4 className="font-bold text-slate-900 dark:text-white mt-1">Winner Turnover</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Frequency of seat party transitions between assembly and parliamentary cycles.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[10px] text-amber-600 font-bold">15% WEIGHT</span>
                <h4 className="font-bold text-slate-900 dark:text-white mt-1">Historical Volatility</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Standard deviation of major party vote shares across 2017, 2019, 2022, and 2024 cycles.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[10px] text-emerald-600 font-bold">10% WEIGHT</span>
                <h4 className="font-bold text-slate-900 dark:text-white mt-1">Margin Variation</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Rate of margin narrowing or expansion between the last two election cycles.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
              <strong>Competitiveness Classifications:</strong> Hyper-Competitive (&gt;75) • High Competition (60–75) • Moderate (40–60) • Safe Fortress (&lt;40).
            </div>
          </div>

          {/* Section 2: Delimitation Eras & Boundary Continuity */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs leading-relaxed">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                2. Delimitation Boundaries: Pre-2008 vs Post-2008
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              The Delimitation Act, 2002 restructured parliamentary and assembly boundaries in Uttar Pradesh. The <strong>Delimitation Commission Order 2008</strong> came into force in the 2009 Lok Sabha and 2012 Vidhan Sabha elections:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Post-2008 Era (Current):</strong> 80 Parliamentary Constituencies and 403 Assembly Constituencies. All modern boundary geometries and Form 20 booth allocations match this post-delimitation standard.
              </li>
              <li>
                <strong>Pre-2008 Era (1991–2004):</strong> 85 Parliamentary Constituencies prior to Uttarakhand bifurcation in 2000, reduced to 80 PCs in 2004 with historical pre-delimitation boundaries. Pre-2008 records are strictly tagged to prevent misleading geographic overlaps.
              </li>
            </ul>
          </div>

          {/* Section 3: Data Isolation & Non-Contamination Guard */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs leading-relaxed">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                3. Constituency Isolation Protocol (Zero PC/AC Contamination)
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              In electoral database systems, failing to distinguish assembly segments from parliamentary constituencies causes MLA votes to leak into MP statistics. Our platform enforces mandatory query guards:
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1">
              <div># Parliamentary Query:</div>
              <div className="text-blue-600 dark:text-blue-400">ElectionResult.ac_id.is_(None) AND Election.election_type == 'Lok Sabha'</div>
              <div className="mt-2"># Assembly Query:</div>
              <div className="text-indigo-600 dark:text-indigo-400">ElectionResult.ac_id.isnot(None) AND Election.election_type == 'Vidhan Sabha'</div>
            </div>
            <p className="text-slate-500 text-[11px]">
              Verified continuously by <code>backend/tests/test_data_integrity.py</code> (8 automated unit tests).
            </p>
          </div>

        </div>
      ) : (
        /* ================= ECI PRIMARY FILE VAULT SECTION ================= */
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Historical Files Downloaded</div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
                {vault.historical_repository_count || histFiles.length}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Stored in historical_data/</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Elections Covered</div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-600 mt-1">1991 – 2024</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">33+ Years of Election Records</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Data Version</div>
              <div className="font-display font-bold text-lg text-slate-900 dark:text-white mt-1">{vault.active_version}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Full Delimitation Integration</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Constitutional Authority</div>
              <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">Election Commission of India</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Gazette &amp; Monographs</div>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search file name, report title, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none"
                >
                  <option value="ALL">All Formats (PDF &amp; Excel)</option>
                  <option value="PDF">PDF Monographs</option>
                  <option value="XLS">XLS Spreadsheets</option>
                  <option value="XLSX">XLSX Spreadsheets</option>
                </select>
              </div>
            </div>

            {/* Year Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              <button
                onClick={() => setYearFilter('ALL')}
                className={`px-3 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                  yearFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Years ({histFiles.length})
              </button>
              {uniqueYears.map((yr: any) => (
                <button
                  key={yr}
                  onClick={() => setYearFilter(yr.toString())}
                  className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                    yearFilter === yr.toString()
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Official ECI Primary Files Directory
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Showing {filteredFiles.length} of {histFiles.length} files
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Election Year</th>
                    <th className="py-2.5 px-4">Election Type</th>
                    <th className="py-2.5 px-4">Document Title / File Name</th>
                    <th className="py-2.5 px-4">Format</th>
                    <th className="py-2.5 px-4 text-right">File Size</th>
                    <th className="py-2.5 px-4 text-center">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFiles.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-4 font-mono font-bold text-slate-900 dark:text-white">{f.election_year}</td>
                      <td className="py-2 px-4 text-slate-600 dark:text-slate-300 font-semibold">{f.election_type}</td>
                      <td className="py-2 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{f.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{f.category}</div>
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          f.format === 'PDF' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {f.format}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        {f.size_bytes ? `${(f.size_bytes / 1024).toFixed(0)} KB` : 'N/A'}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <a
                          href={`/api/sources/download/${encodeURIComponent(f.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/50 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
