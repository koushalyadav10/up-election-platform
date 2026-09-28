import React, { useEffect, useState } from 'react';
import { fetchConstituencyDetail, ConstituencyDetail } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { 
  ArrowLeft, 
  Printer, 
  MapPin, 
  Layers, 
  CheckCircle, 
  ShieldCheck,
  TrendingUp,
  Award,
  Vote,
  Calendar,
  RefreshCw,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PCDetailPageProps {
  pcId: number;
  onBack: () => void;
  onSelectPC: (id: number) => void;
}

export const PCDetailPage: React.FC<PCDetailPageProps> = ({ pcId, onBack, onSelectPC }) => {
  const { language, t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [detail, setDetail] = useState<ConstituencyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetail(selectedYear);
  }, [pcId, selectedYear]);

  const loadDetail = (yr: number) => {
    setLoading(true);
    setError(null);
    fetchConstituencyDetail(pcId, yr)
      .then(data => {
        setDetail(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading constituency detail:", err);
        setError("Failed to load official election results. Please try again.");
        setLoading(false);
      });
  };

  // 1. Loading State
  if (loading && !detail) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {language === 'hi' ? 'संसदीय क्षेत्र का आधिकारिक ECI डेटा लोड हो रहा है...' : 'Accessing Certified ECI Constituency Intelligence Dossier...'}
        </div>
      </div>
    );
  }

  // 2. Error Fallback State
  if (error || !detail) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            {language === 'hi' ? 'डेटा लोड करने में त्रुटि' : 'Unable to Load Dossier'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {error || 'ECI record temporarily unavailable.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => loadDetail(selectedYear)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              {language === 'hi' ? 'वापस जाएँ' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { pc, summary, dna, assembly_segments, candidates, historical, source } = detail;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* 1. Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline mr-1"
          >
            <ArrowLeft className="w-4 h-4" /> {t('btn.back')}
          </button>
          <span>/</span>
          <span>Uttar Pradesh</span>
          <span>/</span>
          <span className="font-bold text-slate-900 dark:text-white">{pc.name} (PC {pc.pc_no})</span>
        </div>

        <div className="flex items-center gap-2.5">
          <SourceBadge type="OFFICIAL" document={`ECI Official Results (${summary.election_year})`} />
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            {t('btn.print')}
          </button>
        </div>
      </div>

      {/* 2. Interactive Election Year Selector Tabs */}
      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            {language === 'hi' ? 'चुनाव वर्ष चुनें:' : 'Select Election Year:'}
          </span>
          <div className="flex items-center gap-1.5">
            {[2024, 2019, 2014].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span>{yr} Lok Sabha</span>
                {selectedYear === yr && <CheckCircle className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 pr-2">
          Showing verified results for <strong>{summary.election_year} General Election</strong>
        </div>
      </div>

      {/* 3. Hero Constituency Header & Winner Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">
                PC #{pc.pc_no}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {pc.category} Category
              </span>
              <span className="text-xs font-mono text-slate-500">
                {pc.delimitation_era}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              {pc.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {summary.election_year} {language === 'hi' ? 'विजेता सांसद:' : 'Elected MP:'}
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {summary.winner_name}
              </span>
              <span 
                className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: candidates[0]?.color || '#2563EB' }}
              >
                {summary.winner_party}
              </span>
            </div>
          </div>

          {/* Winner Headline Metrics Pill */}
          <div className="flex flex-wrap lg:flex-col items-end gap-2 bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                {language === 'hi' ? 'जीत का अंतर' : 'Winning Margin'}
              </span>
              <span className="text-xl font-mono font-extrabold text-slate-900 dark:text-white">
                {summary.margin.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 ml-1">votes</span>
            </div>

            <div className="text-right mt-1 pt-1 border-t border-slate-200 dark:border-slate-600">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                {language === 'hi' ? 'मतदान प्रतिशत' : 'Voter Turnout'}
              </span>
              <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {summary.turnout_pct.toFixed(2)}%
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Core Electoral Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">
            {t('metric.winner')}
          </span>
          <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
            {summary.winner_name}
          </div>
          <div className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {summary.winner_votes.toLocaleString()} votes ({summary.winner_vote_pct.toFixed(1)}%)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">
            {t('metric.runnerUp')}
          </span>
          <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
            {summary.runner_up_name || 'N/A'}
          </div>
          <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 mt-1">
            {summary.runner_up_party} ({summary.runner_up_votes.toLocaleString()} votes)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">
            {t('metric.margin')}
          </span>
          <div className="font-mono font-extrabold text-slate-900 dark:text-white text-base">
            {summary.margin.toLocaleString()}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            Buffer: {dna.margin_buffer_pct}%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">
            {t('metric.turnout')}
          </span>
          <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
            {summary.turnout_pct.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {dna.turnout_category}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">
            {t('metric.totalElectors')}
          </span>
          <div className="font-mono font-bold text-slate-900 dark:text-white text-base">
            {summary.total_electors.toLocaleString()}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            Polled: {summary.total_votes_polled.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">
            {t('metric.validVotes')}
          </span>
          <div className="font-mono font-bold text-slate-900 dark:text-white text-base">
            {summary.valid_votes.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            HHI: {dna.vote_concentration_hhi}
          </div>
        </div>

      </div>

      {/* 5. Assembly Constituencies (Segments) Under This PC */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              {language === 'hi' ? 'अंतर्गत विधानसभा क्षेत्र' : 'Assembly Segments under this Parliamentary Seat'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {assembly_segments.length} {language === 'hi' ? 'विधानसभा सीटें इस लोकसभा के अंतर्गत आती हैं' : 'assembly constituencies mapped to this parliamentary seat'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {assembly_segments.map(ac => (
            <div 
              key={ac.ac_no}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-col justify-between hover:border-blue-500 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">AC #{ac.ac_no}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    {ac.category}
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {ac.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {ac.district}
                </div>

                {/* 2022 Vidhan Sabha Winner vs 2024 Lok Sabha Lead Comparison */}
                <div className="mt-3 space-y-1.5 border-t border-slate-200 dark:border-slate-700/80 pt-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">2022 MLA:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {ac.winner_2022 || 'N/A'} {ac.margin_2022 ? `(+${ac.margin_2022.toLocaleString()})` : ''}
                    </span>
                  </div>
                  {ac.winner_2022_candidate && ac.winner_2022_candidate !== 'N/A' && (
                    <div className="text-[10px] text-slate-500 truncate" title={ac.winner_2022_candidate}>
                      {ac.winner_2022_candidate}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                    <span className="text-slate-500">2024 LS Lead:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {ac.lead_2024 || 'N/A'} {ac.margin_2024 ? `(+${ac.margin_2024.toLocaleString()})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {ac.strategic_category && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 block text-center">
                    {ac.strategic_category}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Candidate Performance Table (Specific to Selected Year) */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Vote className="w-4 h-4 text-blue-600" />
              {summary.election_year} {language === 'hi' ? 'उम्मीदवारों का संपूर्ण परिणाम' : 'Candidate Performance & EVM Vote Breakdown'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official candidate rankings, postal votes, EVM counts, and valid vote share for {summary.election_year}.
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {candidates.length} {language === 'hi' ? 'उम्मीदवार' : 'Contenders'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px] font-mono bg-slate-50 dark:bg-slate-800/60">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'उम्मीदवार' : 'Candidate'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'पार्टी' : 'Party'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'hi' ? 'ईवीएम वोट' : 'General Votes'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'hi' ? 'पोस्टल वोट' : 'Postal Votes'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'hi' ? 'कुल वोट' : 'Total Votes'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'hi' ? 'वोट शेयर' : 'Vote Share %'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {candidates.map((c, idx) => (
                <tr 
                  key={idx}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    c.is_winner ? 'bg-blue-50/40 dark:bg-blue-950/20 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold">
                    {c.rank}
                    {c.is_winner && <Award className="w-3.5 h-3.5 text-amber-500 inline ml-1" />}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                    {c.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span 
                      className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.party}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-slate-600 dark:text-slate-400">
                    {c.general_votes.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-slate-600 dark:text-slate-400">
                    {c.postal_votes.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-slate-900 dark:text-white">
                    {c.total_votes.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-blue-600 dark:text-blue-400">
                    {c.vote_pct_valid.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Multi-Election Historical Comparison & Interactive Year Cards */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              {language === 'hi' ? 'ऐतिहासिक चुनाव तुलना (2014, 2019, 2024)' : 'Historical Multi-Election Comparison (2014–2024)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'hi' ? 'किसी भी वर्ष के कार्ड पर क्लिक करके उस चुनाव का पूरा डेटा खोलें:' : 'Click any year card below to load full candidate and election results for that year:'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {historical.map(h => {
            const isSelected = (h.year === selectedYear);
            return (
              <div 
                key={h.year}
                onClick={() => setSelectedYear(h.year)}
                className={`p-4 rounded-xl border cursor-pointer transition-all transform hover:-translate-y-0.5 ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                    {h.year} Lok Sabha
                  </span>
                  <span className="font-bold px-2 py-0.5 rounded text-white bg-slate-800 dark:bg-slate-700">
                    {h.winner_party}
                  </span>
                </div>
                
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 truncate">
                  Winner: {h.winner_name}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span>Margin:</span>
                    <strong className="font-mono">{h.margin?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Turnout:</span>
                    <strong className="font-mono">{h.turnout}%</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {isSelected ? '✓ Currently Selected' : 'Click to View Year Results →'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
