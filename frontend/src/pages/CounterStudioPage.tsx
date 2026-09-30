import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Layers,
  Copy,
  Check,
  Shield,
  MessageSquare,
  Flame,
  Award,
  Smartphone,
  Square,
  Monitor,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  generateCounterCreative,
  fetchPresetAttacks,
  CounterCreativePayload,
  CounterCreativeResponse,
  PresetAttack
} from '../services/api';

export const CounterStudioPage: React.FC = () => {
  const [opponentClaim, setOpponentClaim] = useState<string>('');
  const [selectedVector, setSelectedVector] = useState<CounterCreativePayload['target_vector']>('AUTO_DETECT');
  const [tone, setTone] = useState<CounterCreativePayload['tone']>('FACTUAL_DIGNIFIED');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CounterCreativeResponse | null>(null);
  const [activeFormat, setActiveFormat] = useState<'square' | 'story' | 'banner'>('square');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [presets, setPresets] = useState<PresetAttack[]>([]);

  useEffect(() => {
    fetchPresetAttacks()
      .then(res => {
        if (res.presets && res.presets.length > 0) {
          setPresets(res.presets);
          // Set initial default claim from preset 0 (Religious / Sanatan Attack)
          const first = res.presets[0];
          setOpponentClaim(first.claim);
          setSelectedVector(first.vector as any);
          // Auto trigger initial generation for rich instant display
          triggerCounter(first.claim, first.vector as any, 'FACTUAL_DIGNIFIED');
        }
      })
      .catch(err => {
        console.warn('Could not load preset attacks:', err);
      });
  }, []);

  const triggerCounter = async (
    claim: string,
    vector = selectedVector,
    selectedTone = tone
  ) => {
    if (!claim.trim()) {
      setError('कृपया विपक्षी दावे या पोस्टर का टेक्स्ट दर्ज करें।');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await generateCounterCreative({
        opponent_claim: claim,
        target_vector: vector,
        tone: selectedTone
      });
      setResponse(data);
    } catch (err: any) {
      console.error('Counter creative error:', err);
      setError(err.message || 'काउंटर-क्रिएटिव जनरेशन में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (p: PresetAttack) => {
    setOpponentClaim(p.claim);
    setSelectedVector(p.vector as any);
    triggerCounter(p.claim, p.vector as any, tone);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadImage = (base64Data: string, filename = 'Samajwadi_Counter_Punch.png') => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToWhatsApp = () => {
    if (!response) return;
    const text = `🚨 *समाजवादी सीधा पलटवार:* 🚨\n\n*${response.copywriting.headline_hi}*\n\n${response.copywriting.sub_headline_hi}\n\n${response.copywriting.body_hi}\n\n📌 *${response.copywriting.call_to_action_hi}*\n\n${response.copywriting.hashtags.join(' ')}\n\n(प्रमाणित: UP Electoral Intelligence War Room)`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Executive Master Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-950 to-red-950 text-white p-6 sm:p-8 shadow-xl border border-red-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>CHITRAGUPTA WAR ROOM • STRATEGIC COUNTER-CREATIVE STUDIO</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              चित्रगुप्त: सार्वभौमिक रणनीतिक काउंटर-क्रिएटिव स्टूडियो
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              लोहिया-आंबेडकर-मुलायम-अखिलेश विचारधारा पर आधारित AI रणनीतिज्ञ। विपक्षी दल (भाजपा/अन्य) के किसी भी झूठे दुष्प्रचार (सांप्रदायिक, परिवारवाद, कानून-व्यवस्था, मुफ्त की रेवड़ी) का सेकंडों में गरिमामयी एवं सटीक डेटा-आधारित पलटवार।
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-3 shrink-0">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-red-900/60 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">रणनीतिक भूमिका</span>
              <span className="text-xs sm:text-sm font-black text-red-400 font-mono">मुख्य चुनाव रणनीतिकार</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-red-900/60 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">आउटपुट मानक</span>
              <span className="text-xs font-mono font-bold text-amber-300">1080p HD • ECI MCC Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Attack Input & Quick Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Console */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                विपक्षी हमला दर्ज करें (Opponent Attack Input)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Universal Re-framing Engine</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>विपक्षी का आरोप / पोस्टर स्लोगन / भाषण का अंश:</span>
              <span className="text-[10px] text-slate-400">किसी भी मुद्दे पर</span>
            </label>
            <textarea
              rows={4}
              value={opponentClaim}
              onChange={(e) => setOpponentClaim(e.target.value)}
              placeholder="उदा. 'सपा केवल एक वर्ग विशेष की पार्टी है, इनके शासन में केवल सैफई का विकास हुआ और गुंडाराज चरम पर था...'"
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
            />
          </div>

          {/* Controls: Target Vector & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                आरोप की श्रेणी (Attack Vector):
              </label>
              <select
                value={selectedVector}
                onChange={(e) => setSelectedVector(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 font-medium"
              >
                <option value="AUTO_DETECT">🤖 स्वतः पहचानें (Auto-Detect Vector)</option>
                <option value="RELIGIOUS_COMMUNAL">🚩 सांप्रदायिक / तुष्टिकरण / सनातन का झूठा आरोप</option>
                <option value="PARIVARWAAD">👑 परिवारवाद / वंशवाद का तंज</option>
                <option value="LAW_AND_ORDER">⚖️ कानून-व्यवस्था / गुंडाराज का दुष्प्रचार</option>
                <option value="DEVELOPMENT">🏗️ मुफ्त की रेवड़ी / विकास पर अनर्गल प्रहार</option>
                <option value="CASTE_PDA">✊ जाति जनगणना / PDA सामाजिक न्याय</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                पलटवार का लहज़ा (Campaign Tone):
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 font-medium"
              >
                <option value="FACTUAL_DIGNIFIED">🏛️ तथ्यात्मक एवं गरिमामयी (प्रवक्ता शैली)</option>
                <option value="AGGRESSIVE_COUNTER">⚡ आक्रामक पलटवार (जनसभा शैली)</option>
                <option value="YOUTH_VIRAL">📱 युवा एवं डिजिटल हुक (सोशल मीडिया वायरल)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={() => triggerCounter(opponentClaim, selectedVector, tone)}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
              loading
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-red-600/30 active:scale-98 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>रणनीतिक विश्लेषण व HD क्रिएटिव तैयार हो रहा है...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>शक्तिशाली पलटवार व पोस्टर तैयार करें (Generate Counter-Punch)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Quick Attack Presets */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                सामान्य विपक्षी हमलों के प्रीसेट्स (Quick Attack Scenarios)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              नीचे दिए गए मुख्य 5 चुनावी हमलों में से किसी पर क्लिक करके देखें कि कैसे यह AI कुछ ही सेकंडों में विपक्षी नेरेटिव को पूरी तरह ध्वस्त करता है:
            </p>

            <div className="space-y-2 pt-1">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-all group flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold uppercase">
                        {p.vector}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      "{p.claim}"
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              100% ECI आचार संहिता सम्मत
            </span>
            <span className="font-mono text-red-600 font-bold">LOHIA-AMBEDKAR DOCTRINE</span>
          </div>
        </div>
      </div>

      {/* 3. Generated Counter-Creative & Studio Area */}
      {response && (
        <div className="space-y-6">
          {/* Attack Vector Deconstruction Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-bold">
                    पहचाना गया चुनावी हमला (Detected Attack Vector)
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {response.vector_label}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={shareToWhatsApp}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>व्हाट्सएप पर शेयर करें</span>
                </button>
              </div>
            </div>
          </div>

          {/* Side-by-Side: The Visual Canvas vs The Spokesperson Brief */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Studio Canvas */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    HD विज़ुअल काउंटर पोस्टर (1080p Studio Canvas)
                  </h3>
                </div>

                {/* Format Tabs */}
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
                  <button
                    onClick={() => setActiveFormat('square')}
                    className={`px-2.5 py-1.5 rounded-md font-bold transition-all flex items-center gap-1 ${
                      activeFormat === 'square'
                        ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>1:1 Square</span>
                  </button>
                  <button
                    onClick={() => setActiveFormat('story')}
                    className={`px-2.5 py-1.5 rounded-md font-bold transition-all flex items-center gap-1 ${
                      activeFormat === 'story'
                        ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>9:16 Story</span>
                  </button>
                  <button
                    onClick={() => setActiveFormat('banner')}
                    className={`px-2.5 py-1.5 rounded-md font-bold transition-all flex items-center gap-1 ${
                      activeFormat === 'banner'
                        ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>16:9 X Card</span>
                  </button>
                </div>
              </div>

              {/* Render Area */}
              {activeFormat === 'square' && (
                <div className="space-y-3">
                  <div className="relative aspect-square max-h-[460px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 flex items-center justify-center group">
                    <img
                      src={response.creative_assets.square_1080.image_base64}
                      alt="Samajwadi Counter Poster"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() =>
                          downloadImage(
                            response.creative_assets.square_1080.image_base64,
                            'Samajwadi_Counter_1080.png'
                          )
                        }
                        className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-2 shadow-xl hover:bg-slate-100 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>HD डाउनलोड करें (1080x1080)</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>उपयुक्त: इंस्टाग्राम पोस्ट, फेसबुक फीड, व्हाट्सएप डीपी</span>
                    <button
                      onClick={() =>
                        downloadImage(
                          response.creative_assets.square_1080.image_base64,
                          'Samajwadi_Counter_1080.png'
                        )
                      }
                      className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>1-Click Download</span>
                    </button>
                  </div>
                </div>
              )}

              {activeFormat === 'story' && (
                <div className="space-y-3">
                  <div className="relative aspect-[9/16] max-h-[460px] mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 text-white p-5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                          PDA 2027 STATUS
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono">#SamajwadiKaam</span>
                      </div>
                      <h4 className="text-xl font-black text-amber-300 leading-tight">
                        {response.creative_assets.story_916.hook}
                      </h4>
                    </div>

                    <div className="space-y-3 my-auto bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <p className="text-sm font-bold text-white leading-relaxed">
                        {response.copywriting.headline_hi}
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {response.creative_assets.story_916.caption}
                      </p>
                    </div>

                    <div className="space-y-2 text-center border-t border-white/10 pt-3">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
                        {response.copywriting.call_to_action_hi}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {response.copywriting.hashtags.slice(0, 3).join(' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>उपयुक्त: व्हाट्सएप स्टेटस, इंस्टाग्राम स्टोरीज, रील्स हुक</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${response.creative_assets.story_916.hook}\n\n${response.creative_assets.story_916.caption}\n\n${response.copywriting.hashtags.join(' ')}`,
                          'story-copy'
                        )
                      }
                      className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'story-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'story-copy' ? 'कॉपी हो गया' : 'स्टोरी टेक्स्ट कॉपी'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeFormat === 'banner' && (
                <div className="space-y-3">
                  <div className="relative aspect-video max-h-[300px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 text-white p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest">
                        TWITTER / X PRESS CARD
                      </span>
                      <span className="text-[10px] font-mono text-amber-300">
                        {response.vector_label}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {response.creative_assets.banner_169.headline}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {response.creative_assets.banner_169.subhead}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-400 font-mono">
                      <span>समाजवादी पार्टी मीडिया सेल</span>
                      <span>#KaamBoltaHai</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>उपयुक्त: ट्विटर / X पोस्ट बैनर, प्रेस नोट हेडर</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${response.creative_assets.banner_169.headline}\n\n${response.creative_assets.banner_169.subhead}\n\n${response.copywriting.hashtags.join(' ')}`,
                          'banner-copy'
                        )
                      }
                      className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'banner-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'banner-copy' ? 'कॉपी हो गया' : 'ट्वीट कॉपी'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Spokesperson Primetime Debate Brief & Official Data */}
            <div className="lg:col-span-6 space-y-4">
              {/* Copywriting & Caption Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      सोशल मीडिया कॉपी एवं कैप्शन (Viral Hindi Copy)
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${response.copywriting.headline_hi}\n\n${response.copywriting.sub_headline_hi}\n\n${response.copywriting.body_hi}\n\n${response.copywriting.call_to_action_hi}\n\n${response.copywriting.hashtags.join(' ')}`,
                        'full-copy'
                      )
                    }
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedKey === 'full-copy' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'full-copy' ? 'कॉपी हो गया!' : 'पूर्ण कॉपी करें'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {response.copywriting.headline_hi}
                  </div>
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {response.copywriting.sub_headline_hi}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {response.copywriting.body_hi}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {response.copywriting.hashtags.map((h, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* TV Debate Spokesperson Dossier */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      प्रवक्ता प्राइम-टाइम डिबेट पॉइंट्स (TV Debate Dossier)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                    3 BULLET POINTS
                  </span>
                </div>

                <div className="space-y-2.5">
                  {response.talking_points.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed flex-1">
                        {pt}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Official NCRB / ECI Data Citations */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-2">
                    प्रमाणित सरकारी डेटा (Official Evidentiary Proof)
                  </span>
                  <div className="space-y-2">
                    {response.official_data_citations?.map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">{c.metric}</span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
                            सपा: {c.sp_value}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                            भाजपा: {c.bjp_value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spokesperson Caution Box */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-bold block">प्रवक्ता विशेष निर्देश (Debate Caution):</span>
                    <span className="text-[11px] leading-relaxed block mt-0.5 text-amber-700 dark:text-amber-300">
                      {response.spokesperson_caution}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
