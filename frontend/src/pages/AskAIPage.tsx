import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Database, 
  Layers, 
  MapPin, 
  RotateCcw, 
  FileText, 
  Newspaper, 
  Calendar, 
  ChevronRight, 
  Activity, 
  BookOpen, 
  ExternalLink,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { useElectra } from '../context/ElectraContext';
import { useLanguage } from '../context/LanguageContext';
import { askElectraIntelligence, fetchElectraNews, ElectraQueryResponse, ElectraNewsItem } from '../services/api';
import { ElectraResponse } from '../components/electra/ElectraResponse';

export const AskAIPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { 
    activeDistrict, 
    activeAC, 
    activeACName, 
    activeBooth, 
    activeContextString, 
    clearContext,
    openDigest,
    openObservability
  } = useElectra();

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<ElectraQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusStage, setStatusStage] = useState<string | null>(null);
  const [newsFeed, setNewsFeed] = useState<ElectraNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    setNewsLoading(true);
    fetchElectraNews(activeDistrict || undefined, activeAC || undefined)
      .then(res => {
        setNewsFeed(res);
        setNewsLoading(false);
      })
      .catch(() => setNewsLoading(false));
  }, [activeDistrict, activeAC]);

  const sampleCategories = [
    {
      title: isHi ? 'विधानसभा एवं बूथ विश्लेषण' : 'Assembly & Polling Booth Analysis',
      questions: [
        activeAC 
          ? `What changed in AC #${activeAC} between 2022 and 2024?` 
          : 'What changed in AC #314 Dhanghata between 2022 and 2024?',
        activeBooth 
          ? `Booth #${activeBooth} voter turnout and margin shift` 
          : 'Booth #42 Dhanghata voter turnout and margin shift',
        'Compare SP vs BJP vote share across Sant Kabir Nagar'
      ]
    },
    {
      title: isHi ? 'संसदीय एवं राज्यव्यापी विश्लेषण' : 'Parliamentary & Statewide Records',
      questions: [
        'Which UP Lok Sabha seat had the closest margin in 2024?',
        'Explain Varanasi parliamentary margin shift in 2024',
        'What is the official party tally for Uttar Pradesh 2024?'
      ]
    },
    {
      title: isHi ? 'मतदाता सूची एवं प्रशासनिक अधिसूचना' : 'Voter Rolls & Official Dispatches',
      questions: [
        'Summarize ECI SSR voter list updates in Sant Kabir Nagar',
        'Identify assembly seats with high electoral roll net change'
      ]
    }
  ];

  const handleExecuteQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setPrompt(queryText);
    setLoading(true);
    setResponse(null);

    setStatusStage(isHi ? 'प्रश्नानुसार डेटा राउटिंग...' : 'Routing query intent...');
    setTimeout(() => {
      setStatusStage(isHi ? 'SQL डेटाबेस व Form 20 से प्रमाणित रिकॉर्ड प्राप्त किए जा रहे हैं...' : 'Querying certified SQL returns & Form 20 tables...');
    }, 450);

    setTimeout(() => {
      setStatusStage(isHi ? 'तथ्यों, प्रेक्षणों व आधिकारिक साक्ष्यों का संश्लेषण...' : 'Cross-checking source evidence & factor separation...');
    }, 1100);

    try {
      const res = await askElectraIntelligence({
        query: queryText,
        context: {
          district: activeDistrict,
          ac_no: activeAC,
          booth_no: activeBooth
        }
      });
      setResponse(res);
    } catch (err) {
      console.error('Electra query error:', err);
    } finally {
      setLoading(false);
      setStatusStage(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>ELECTRA RESEARCH LAB • Grounded UP Electoral Intelligence</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-2">
            {isHi ? 'इलेक्ट्रा: साक्ष्य-आधारित चुनावी शोध इंजन' : 'Electra: Evidence-Grounded Research Engine'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {isHi 
              ? 'प्रत्येक उत्तर भारत निर्वाचन आयोग के प्रमाणित फॉर्म 20 व आधिकारिक डेटाबेस पर आधारित है। एआई कभी भी आंकड़े नहीं गढ़ता।'
              : 'Synthesizes internal ECI returns, gazette notices, and real-time context. Strictly separates Facts, Observations, and Documented Factors.'}
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={openDigest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs cursor-pointer"
            title="Open Daily Intelligence Brief"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHi ? 'दैनिक ब्रीफ' : 'Daily Brief'}</span>
          </button>

          <button
            onClick={openObservability}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
            title="Inspect Electra RAG Execution Traces & Calibration"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audit Trace</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Query Console & Results (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Context Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isHi ? 'वर्तमान संदर्भ:' : 'Active Geographic Context:'}
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                {activeContextString}
              </span>
            </div>
            {(activeDistrict || activeAC || activeBooth) && (
              <button
                onClick={clearContext}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                title="Clear Context"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isHi ? 'रीसेट' : 'Reset Context'}</span>
              </button>
            )}
          </div>

          {/* Search / Input Box */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleExecuteQuery(prompt); }} 
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isHi
                      ? "उत्तर प्रदेश के किसी भी निर्वाचन क्षेत्र, बूथ या परिणाम पर तथ्य-आधारित प्रश्न पूछें..."
                      : "Ask any verifiable question about UP Parliamentary or Assembly elections..."
                  }
                  className="w-full py-3 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? (isHi ? 'खोज जारी...' : 'Analyzing...') : (isHi ? 'पूछें' : 'Query')}</span>
              </button>
            </form>

            {/* Live Progress Stage */}
            {statusStage && (
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/60 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>{statusStage}</span>
              </div>
            )}
          </div>

          {/* Structured Electra Output */}
          {response && !loading && (
            <div className="animate-in fade-in duration-300">
              <ElectraResponse data={response} />
            </div>
          )}

          {/* Quick Inquiry Categories (when not showing response) */}
          {!response && !loading && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isHi ? 'सुझाए गए विश्लेषणात्मक प्रश्न:' : 'Suggested Research Inquiries:'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sampleCategories.map((cat, cIdx) => (
                  <div 
                    key={cIdx} 
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5"
                  >
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{cat.title}</span>
                    </div>
                    <div className="space-y-1.5">
                      {cat.questions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleExecuteQuery(q)}
                          className="w-full text-left p-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 cursor-pointer"
                        >
                          "{q}"
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Local Intelligence & Verified News Feed (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isHi ? 'लाइव स्थानीय संदर्भ व गजट' : 'Live Local Context & Gazettes'}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                VERIFIED
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHi
                ? 'प्रशासनिक सूचनाएं, मतदाता सूची पुनरीक्षण व मुख्य समाचार।'
                : 'District administration notices, CEO UP press notes, and accredited press reports.'}
            </p>

            {newsLoading ? (
              <div className="py-8 text-center text-xs font-mono text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-indigo-600" />
                Loading verified intelligence feed...
              </div>
            ) : newsFeed.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active dispatches for current filter.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {newsFeed.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/70 dark:bg-slate-800/50 transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.source_name}
                      </span>
                      {item.cluster_count && item.cluster_count > 1 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {item.cluster_count} sources
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.publication_date}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {item.headline}
                    </h4>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.summary}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.district || 'Statewide'}
                      </span>
                      <button
                        onClick={() => handleExecuteQuery(`Explain the electoral impact of: ${item.headline}`)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Analyze</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
