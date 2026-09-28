import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  Flame, 
  Wheat, 
  GraduationCap, 
  Building, 
  ShieldAlert, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  MapPin,
  Landmark,
  UserCheck,
  Zap,
  HeartHandshake
} from 'lucide-react';
import { DistrictGroundIntelligence, PromiseVsReality, IncumbentAccountability } from '../../services/api';
import { SourceBadge } from '../common/SourceBadge';

interface DistrictRallyDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DistrictGroundIntelligence | null;
  loading?: boolean;
}

export const DistrictRallyDossierModal: React.FC<DistrictRallyDossierModalProps> = ({
  isOpen,
  onClose,
  data,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'speeches' | 'promises' | 'incumbents' | 'vision' | 'cue_card'>('speeches');
  const [speechTone, setSpeechTone] = useState<'aggressive' | 'kisan' | 'youth' | 'vikas'>('aggressive');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedSpeech, setCopiedSpeech] = useState(false);

  if (!isOpen) return null;

  const handleCopyWhatsApp = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.whatsapp_format);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleCopySpeech = () => {
    if (!data) return;
    const text = data.rally_speeches[speechTone];
    navigator.clipboard.writeText(text);
    setCopiedSpeech(true);
    setTimeout(() => setCopiedSpeech(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[94vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden my-auto print:max-h-none print:border-none print:shadow-none print:w-full">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-red-50/20 to-slate-50 dark:from-slate-900 dark:via-red-950/20 dark:to-slate-900 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                  {data?.district_name || 'जनपद'} ग्राउंड रिपोर्ट &amp; AI मंच भाषण
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 uppercase tracking-wider border border-red-200 dark:border-red-800">
                  {data?.region || 'उत्तर प्रदेश'}
                </span>
                <SourceBadge type="SURVEY" document="75 Districts Ground Intel & Campaign War Room" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>मुख्यालय: <strong className="text-slate-700 dark:text-slate-200">{data?.headquarters}</strong></span>
                <span>•</span>
                <span>ODOP उत्पाद: <strong className="text-slate-700 dark:text-slate-200">{data?.odop_product}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
              title="प्रिंट / कार्ड फॉर्मेट"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>प्रिंट कार्ड</span>
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs shadow-emerald-600/20"
              title="WhatsApp शेयर टेक्स्ट कॉपी करें"
            >
              {copiedWhatsApp ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedWhatsApp ? 'कॉपी हो गया!' : 'WhatsApp शेयर'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-x-auto shrink-0 print:hidden gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('speeches')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'speeches'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🎙️ मंच भाषण जनसंवाद</span>
            </button>

            <button
              onClick={() => setActiveTab('promises')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'promises'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>वादे बनाम हकीकत</span>
            </button>

            <button
              onClick={() => setActiveTab('incumbents')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'incumbents'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>सांसद व विधायक रिपोर्ट</span>
            </button>

            <button
              onClick={() => setActiveTab('vision')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'vision'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2027 का संकल्प</span>
            </button>

            <button
              onClick={() => setActiveTab('cue_card')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'cue_card'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>स्टेज क्यू कार्ड (Print)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {loading || !data ? (
            <div className="py-24 text-center text-slate-400 font-mono text-sm animate-pulse">
              जनपद ग्राउंड इंटेलिजेंस व भाषण लोड हो रहा है...
            </div>
          ) : (
            <>
              {/* TAB 1: AI RALLY SPEECHES */}
              {activeTab === 'speeches' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Tone Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">भाषण की शैली (Tone Switcher):</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setSpeechTone('aggressive')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          speechTone === 'aggressive'
                            ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-50'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>⚡ आक्रामक व तीखा प्रहार</span>
                      </button>

                      <button
                        onClick={() => setSpeechTone('kisan')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          speechTone === 'kisan'
                            ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        <Wheat className="w-3.5 h-3.5" />
                        <span>🌾 किसान व ग्रामीण जनसंवाद</span>
                      </button>

                      <button
                        onClick={() => setSpeechTone('youth')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          speechTone === 'youth'
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>🎓 युवा, रोजगार व छात्र</span>
                      </button>

                      <button
                        onClick={() => setSpeechTone('vikas')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          speechTone === 'vikas'
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>🏭 विकास, उद्योग व जनहित</span>
                      </button>
                    </div>
                  </div>

                  {/* Speech Display Card */}
                  <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/70 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-md">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          मंच भाषण प्रारूप: {speechTone === 'aggressive' ? 'आक्रामक व तीखा प्रहार' : speechTone === 'kisan' ? 'किसान व ग्रामीण जनसंवाद' : speechTone === 'youth' ? 'युवा, रोजगार व छात्र' : 'विकास, उद्योग व जनहित'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopySpeech}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          {copiedSpeech ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSpeech ? 'कॉपी हुआ!' : 'भाषण टेक्स्ट कॉपी करें'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-sm sm:text-base whitespace-pre-line bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 font-normal">
                      {data.rally_speeches[speechTone]}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>💡 <strong>टिप:</strong> मंच पर बोलते समय स्थानीय विधानसभा क्षेत्रों ({data.assembly_constituencies.slice(0, 3).join(', ')}) और स्थानीय मुद्दों का बार-बार उल्लेख करें।</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROMISES VS REALITY */}
              {activeTab === 'promises' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        वर्तमान सरकार के वादे बनाम जमीनी हकीकत ({data.promises_vs_reality.length} प्रमुख विफलताएं)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {data.district_name} के लिए double-engine सरकार द्वारा की गई घोषणाएं और धरातल पर उनकी वास्तविक स्थिति।
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {data.promises_vs_reality.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            मुद्दा #{idx + 1}: {item.tag}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                            item.status === 'विफल' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                            item.status === 'जुमला' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            स्थिति: {item.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                            <span className="block text-[11px] font-extrabold uppercase text-amber-800 dark:text-amber-400 mb-1">
                              📢 सरकार का चुनावी वादा:
                            </span>
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                              "{item.promise}"
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                            <span className="block text-[11px] font-extrabold uppercase text-rose-800 dark:text-rose-400 mb-1">
                              ❌ जमीनी हकीकत व विफलता:
                            </span>
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                              {item.reality}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: LOCAL INCUMBENT ACCOUNTABILITY */}
              {activeTab === 'incumbents' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-500" />
                      स्थानीय सांसद व विधायक जवाबदेही रिपोर्ट कार्ड ({data.district_name})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      जनप्रतिनिधियों का प्रदर्शन, जनता के प्रति जवाबदेही और 2022 से 2024 के बीच आए राजनीतिक बदलाव।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {data.incumbent_accountability.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                          <div>
                            <span className="font-mono text-[10px] text-slate-500 font-bold">AC #{item.ac_no}</span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.ac_name}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.mla_2022_party === 'SP' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                            item.mla_2022_party === 'BJP' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800'
                          }`}>
                            2022: {item.mla_2022_party}
                          </span>
                        </div>

                        <div className="text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                            <span>वर्तमान विधायक:</span>
                            <strong className="text-slate-900 dark:text-white">{item.mla_2022_candidate} ({item.mla_2022_party})</strong>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                            <span>2024 लोकसभा रुझान:</span>
                            <strong className="text-blue-600 dark:text-blue-400">{item.lead_2024_party} बढ़त ({item.lead_2024_candidate})</strong>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">जनता का आक्रोश व विफलता:</span>
                          {item.accountability_notes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: VISION 2027 */}
              {activeTab === 'vision' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-500" />
                      2027 में हमारी सरकार आएगी तो क्या करेंगे? (समाजवादी संकल्प पत्र)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {data.district_name} और प्रदेश की जनता के लिए हमारी सरकार के 5 ऐतिहासिक गारंटियां।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {data.vision_2027.map((promise, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-gradient-to-r from-red-50/40 via-white to-slate-50 dark:from-red-950/20 dark:via-slate-800 dark:to-slate-900 border border-red-200/80 dark:border-red-900/50 flex items-start gap-3.5 shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-red-600/30">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                            {promise}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PRINT CUE CARD */}
              {activeTab === 'cue_card' && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 space-y-6 print:border-none print:p-0">
                  <div className="text-center pb-4 border-b-2 border-slate-800 dark:border-slate-200">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-red-600">मिशन 2027 — मंच भाषण क्यू कार्ड</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {data.print_cue_card.rally_title}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      प्रमंडल/क्षेत्र: <strong>{data.print_cue_card.region}</strong> | मुख्यालय: <strong>{data.headquarters}</strong>
                    </p>
                  </div>

                  {/* Slogans */}
                  <div>
                    <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-red-600" />
                      प्रमुख नारे (Crowd Slogans)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {data.print_cue_card.key_slogans.map((s, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-900 dark:text-red-200 text-center">
                          "{s}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opening Hooks */}
                  <div>
                    <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-blue-600" />
                      शुरुआती संबोधन व जुड़ाव (Opening Hooks)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200 list-disc list-inside">
                      {data.print_cue_card.opening_hooks.map((h, idx) => (
                        <li key={idx} className="leading-relaxed"><strong>{h}</strong></li>
                      ))}
                    </ul>
                  </div>

                  {/* Attack Points */}
                  <div>
                    <h4 className="font-extrabold text-sm uppercase text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-600" />
                      तीखे चुनावी प्रहार बिंदु (Attack Points)
                    </h4>
                    <div className="space-y-2">
                      {data.print_cue_card.attack_points.map((p, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-l-4 border-rose-600 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vision Promises */}
                  <div>
                    <h4 className="font-extrabold text-sm uppercase text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      2027 के पक्के वादे (Closing Commitments)
                    </h4>
                    <div className="space-y-2">
                      {data.print_cue_card.vision_promises.map((v, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-600 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 text-center border-t border-slate-200 dark:border-slate-800 print:hidden">
                    <button
                      onClick={handlePrint}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
                    >
                      🖨️ इस कार्ड का प्रिंट निकालें (Print A4 Card)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between text-xs text-slate-500 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span>विधानसभा सीटें: <strong className="text-slate-800 dark:text-slate-200">{data?.total_acs} ACs</strong></span>
            <span>•</span>
            <span>लोकसभा सीटें: <strong className="text-slate-800 dark:text-slate-200">{data?.total_pcs} PCs</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              {copiedWhatsApp ? 'WhatsApp टेक्स्ट कॉपी हुआ!' : '📲 1-Click WhatsApp फॉर्मेट'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-300 transition-colors cursor-pointer"
            >
              बंद करें
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
