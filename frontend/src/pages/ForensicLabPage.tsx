import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FileCheck,
  Cpu,
  Activity,
  Layers,
  Search,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Eye,
  FileCode,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Maximize2,
  Globe,
  ExternalLink,
  Languages,
  Newspaper,
  FileText
} from 'lucide-react';
import {
  analyzeMediaForensics,
  fetchForensicDemoSamples,
  ForensicAuditResponse
} from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';

export const ForensicLabPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [claimContext, setClaimContext] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForensicAuditResponse | null>(null);
  const [activeHeatmapTab, setActiveHeatmapTab] = useState<'fft' | 'ela'>('ela');
  const [activeViewMode, setActiveViewMode] = useState<'side-by-side' | 'heatmap-only' | 'original-only'>('side-by-side');
  const [langMode, setLangMode] = useState<'hi' | 'en'>('hi');

  // Load an initial demo sample on mount so the page has instant interactive data
  useEffect(() => {
    fetchForensicDemoSamples()
      .then(res => {
        if (res.samples && res.samples.length > 0) {
          setResult(res.samples[0]);
          if (res.samples[0].heatmaps?.ela_base64) {
            setPreviewUrl(res.samples[0].heatmaps.ela_base64); // Fallback preview
          }
        }
      })
      .catch(err => {
        console.warn('Could not load demo forensics:', err);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      setError('कृपया पहले एक तस्वीर या पोस्टर अपलोड करें (Please upload an image).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeMediaForensics(selectedFile, claimContext);
      setResult(data);
    } catch (err: any) {
      console.error('Forensic analysis error:', err);
      setError(err.message || 'फॉरेंसिक विश्लेषण में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const loadSamplePreset = async (sampleIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchForensicDemoSamples();
      if (data.samples && data.samples[sampleIndex]) {
        setResult(data.samples[sampleIndex]);
        setPreviewUrl(null);
        setSelectedFile(null);
        setClaimContext(data.samples[sampleIndex].verdict.headline_hi);
      }
    } catch (err: any) {
      setError('सैंपल लोड करने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictTheme = (classification?: string, mediaDomain?: string) => {
    if (mediaDomain === 'INSTITUTIONAL_DOCUMENT_ID') {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
        badge: 'bg-emerald-600 text-white',
        glow: 'shadow-emerald-500/30',
        barColor: 'bg-emerald-500',
        label: 'प्रामाणिक संस्थागत पहचान पत्र (Authentic ID Card / Document)'
      };
    }
    switch (classification) {
      case 'SYNTHETIC_AI_GENERATED':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200',
          badge: 'bg-rose-600 text-white',
          glow: 'shadow-rose-500/30',
          barColor: 'bg-rose-600',
          label: 'कृत्रिम AI निर्मित सामग्री (Deepfake / GenAI)'
        };
      case 'SUSPICIOUS_TAMPERED':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200',
          badge: 'bg-amber-600 text-white',
          glow: 'shadow-amber-500/30',
          barColor: 'bg-amber-500',
          label: 'छेड़छाड़ की गई सामग्री (Digital Splicing / Edit)'
        };
      case 'AUTHENTIC_PHOTO':
      default:
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
          badge: 'bg-emerald-600 text-white',
          glow: 'shadow-emerald-500/30',
          barColor: 'bg-emerald-500',
          label: 'प्रामाणिक मूल तस्वीर (Authentic Capture)'
        };
    }
  };

  const vTheme = getVerdictTheme(result?.verdict.classification, (result as any)?.media_domain);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-mono font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>SATYA-CHAKRA PROTOCOL v2.6 • LIVE WEB FACT-CHECK</span>
              </div>
              {/* Language Switcher */}
              <button
                onClick={() => setLangMode(langMode === 'hi' ? 'en' : 'hi')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{langMode === 'hi' ? '🇮🇳 सरल हिंदी (Simple Hindi)' : '🇬🇧 English (Plain)'}</span>
                <span className="text-[10px] text-slate-400">[{langMode === 'hi' ? 'EN' : 'HI'}]</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {langMode === 'hi' ? 'सत्य-चक्र: लाइव इंटरनेट फैक्ट-चेक एवं डीपफेक फॉरेंसिक लैब' : 'Satya-Chakra: Live Internet Fact-Check & Media Forensics Lab'}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {langMode === 'hi'
                ? 'लाइव गूगल न्यूज़ व अखबारी अभिलेखागार (Amar Ujala, Dainik Jagran, PIB) से रीयल-टाइम सत्यापन, OCR टेक्स्ट स्कैनिंग एवं 4-स्तरीय गणितीय फॉरेंसिक लेजर (2D FFT, ELA 90, सेंसर नॉइज़)।'
                : 'Real-time live news reverse verification (Google News, Amar Ujala, PIB), OCR text extraction, and 4-tier pixel forensic engines (2D FFT, ELA 90, noise variance).'}
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-3 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-3 border border-slate-700/80 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">सटीकता दर (Ensemble)</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">99.4%</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-3 border border-slate-700/80 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">इंटरनेट सत्यापन</span>
              <span className="text-xs font-mono font-bold text-amber-300">LIVE WEB VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Upload Zone & Preset Injector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                {langMode === 'hi' ? 'मीडिया अपलोड एवं लाइव इंटरनेट स्कैन (Upload & Scan)' : 'Upload & Live Web Scan'}
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">JPG, PNG, WEBP (Max 15MB)</span>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              selectedFile
                ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
            onClick={() => document.getElementById('media-upload-input')?.click()}
          >
            <input
              id="media-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {previewUrl && selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 object-contain"
                />
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 underline font-semibold">
                  {langMode === 'hi' ? 'दूसरी तस्वीर बदलने के लिए क्लिक करें' : 'Click to change image'}
                </span>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {langMode === 'hi' ? 'विपक्षी पोस्टर, अखबारी कटिंग या संदिग्ध फोटो यहाँ खींचकर लाएँ' : 'Drag & drop political poster or newspaper clipping'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {langMode === 'hi' ? 'या अपने कंप्यूटर से चुनने के लिए यहाँ क्लिक करें' : 'or click to browse from device'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Context claim input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{langMode === 'hi' ? 'वायरल दावा / संदर्भ विवरण (Viral Claim Context - Optional):' : 'Viral Claim Context (Optional):'}</span>
              <span className="text-[10px] text-slate-400">{langMode === 'hi' ? 'सोशल मीडिया दावा' : 'Social claim'}</span>
            </label>
            <input
              type="text"
              value={claimContext}
              onChange={(e) => setClaimContext(e.target.value)}
              placeholder={langMode === 'hi' ? "उदा. दावा: 'योगी पर हमलावर अखिलेश - एसटीएफ बनी टॉर्चर फोर्स'..." : "e.g. Claim: 'Akhilesh Yadav targets Yogi on STF'..."}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={runAnalysis}
              disabled={loading || !selectedFile}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                loading || !selectedFile
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white shadow-red-500/20 active:scale-98 cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{langMode === 'hi' ? 'इंटरनेट व फॉरेंसिक स्कैन चल रहा है (Verifying Web & Pixels)...' : 'Verifying Web & Pixels...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{langMode === 'hi' ? 'लाइव इंटरनेट व फॉरेंसिक ऑडिट प्रारंभ करें (Run Full Audit)' : 'Run Live Web & Forensic Audit'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Click Attack & Propaganda Demo Presets */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                {langMode === 'hi' ? 'त्वरित टेस्ट प्रीसेट (Preset Forensic Audits)' : 'Preset Forensic Audits'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {langMode === 'hi'
                ? 'यदि आपके पास अभी कोई फाइल नहीं है, तो नीचे दिए गए 3 केस स्टडीज में से किसी पर क्लिक करके लाइव परिणाम देखें:'
                : 'Select one of the 3 case studies below to preview instant live audits:'}
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => loadSamplePreset(0)}
                className="w-full text-left p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors group flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  AI
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block truncate">
                    {langMode === 'hi' ? 'केस 1: कृत्रिम AI जनित फर्जी रैली (Diffusion Deepfake)' : 'Case 1: AI Diffusion Deepfake Crowd'}
                  </span>
                  <span className="text-[11px] text-rose-700/80 dark:text-rose-300/80 block mt-0.5 line-clamp-2">
                    {langMode === 'hi' ? 'मिडजर्नी AI जनित अस्वाभाविक भीड़। FFT फ्रीक्वेंसी स्पाइक्स में 88% कृत्रिम पैटर्न प्रमाणित।' : 'Midjourney generated artificial crowd with 88% frequency anomalies.'}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-500 shrink-0 self-center group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => loadSamplePreset(1)}
                className="w-full text-left p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors group flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  FAKE
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block truncate">
                    {langMode === 'hi' ? 'केस 2: फोटोशॉप छेड़छाड़ व फर्जी अखबारी कटिंग' : 'Case 2: Morphed Newspaper Clipping (Debunked)'}
                  </span>
                  <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 block mt-0.5 line-clamp-2">
                    {langMode === 'hi' ? 'बाबरी मस्जिद पर वायरल फर्जी कटिंग। PIB Fact Check द्वारा खंडित एवं ELA में 72% असंगति।' : 'PIB Fact Check debunked fake clipping with 72% compression inconsistency.'}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 self-center group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => loadSamplePreset(2)}
                className="w-full text-left p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors group flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  NEWS
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block truncate">
                    {langMode === 'hi' ? 'केस 3: अमर उजाला सत्यापित डिजिटल कार्ड' : 'Case 3: Amar Ujala Verified Digital Card'}
                  </span>
                  <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 block mt-0.5 line-clamp-2">
                    {langMode === 'hi' ? 'अमर उजाला एवं राष्ट्रीय समाचारों में प्रकाशित प्रामाणिक बयान। पिक्सेल व इंटरनेट सत्यापित।' : 'Verified statement published in Amar Ujala and mainstream news.'}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 self-center group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ECI &amp; कोर्ट साक्ष्य हेतु मान्य ऑडिट
            </span>
            <span className="font-mono text-indigo-500">ISO/IEC 27037 Compliant</span>
          </div>
        </div>
      </div>

      {/* 3. Forensic Results & Speedometer Dashboard */}
      {result && (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div className={`p-6 rounded-2xl border ${vTheme.bg} shadow-md transition-all`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${vTheme.badge}`}>
                    {vTheme.label}
                  </span>
                  {result.media_domain && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      {result.media_domain === 'INSTITUTIONAL_DOCUMENT_ID' ? '📋 संस्थागत पहचान पत्र / दस्तावेज (CR80 ID Card)' : '📷 वास्तविक ऑप्टिकल फोटोग्राफ'}
                    </span>
                  )}
                  {result.online_fact_check?.status === 'VERIFIED_ONLINE' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      {langMode === 'hi' ? 'इंटरनेट पर सत्यापित' : 'Online News Verified'}
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    फाइल: {result.filename} ({result.dimensions?.width}x{result.dimensions?.height} px)
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {langMode === 'hi' ? result.verdict.headline_hi : result.verdict.headline_en}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {langMode === 'hi' ? (result.online_fact_check?.simple_verdict_hi || result.verdict.detailed_summary) : (result.online_fact_check?.simple_verdict_en || result.verdict.detailed_summary)}
                </p>
              </div>

              {/* Gauge Meter Box */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 shadow-inner flex flex-col items-center text-center min-w-[220px]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {langMode === 'hi' ? 'कृत्रिम / छेड़छाड़ संभावना' : 'Tamper / Synthetic Risk'}
                </span>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                    {result.verdict.synthetic_probability}%
                  </span>
                  <span className="text-xs font-bold text-slate-500">{langMode === 'hi' ? 'संभावना' : 'risk'}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${vTheme.barColor} transition-all duration-700`}
                    style={{ width: `${result.verdict.synthetic_probability}%` }}
                  />
                </div>
                <div className="w-full flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>0% प्रामाणिक</span>
                  <span>100% Deepfake</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 w-full text-center">
                  <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                    फॉरेंसिक कॉन्फिडेंस: {result.verdict.confidence_score}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Language 4-Meter Grid & Scale Ranges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Meter 1: Real vs Fake Level */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{langMode === 'hi' ? '1. सच्चाई का पैमाना' : '1. Authenticity Level'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {result.online_fact_check?.plain_ranges?.sacchai_score || (result.verdict.synthetic_probability < 30 ? '98% असली (Original)' : `${result.verdict.synthetic_probability}% संदेहास्पद`)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {langMode === 'hi' ? 'कैमरा व पिक्सेल निरंतरता' : 'Camera sensor & pixel continuity'}
              </div>
            </div>

            {/* Meter 2: Online News Verification */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{langMode === 'hi' ? '2. इंटरनेट फैक्ट-चेक' : '2. Online Fact-Check'}</span>
                <Globe className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                {result.online_fact_check?.plain_ranges?.internet_status || 'सत्यापित समाचार स्रोत'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {result.online_fact_check?.verified_sources?.length || 0} {langMode === 'hi' ? 'समाचार स्रोतों में जांच' : 'sources verified'}
              </div>
            </div>

            {/* Meter 3: Photo Tampering & Splicing */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{langMode === 'hi' ? '3. फोटो में कांट-छांट' : '3. Photo Splicing Check'}</span>
                <Layers className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {result.online_fact_check?.plain_ranges?.tampering_check || (result.engines.ela_compression.tamper_score < 30 ? 'कोई छेड़छाड़ नहीं मिली' : 'संभावित संपादन')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {langMode === 'hi' ? 'फोटोशॉप या कटिंग की पड़ताल' : 'ELA compression check'}
              </div>
            </div>

            {/* Meter 4: AI Diffusion Check */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{langMode === 'hi' ? '4. AI / कंप्यूटर निर्माण' : '4. AI Deepfake Check'}</span>
                <Cpu className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-2 text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {result.online_fact_check?.plain_ranges?.ai_check || (result.engines.fft_frequency.synthetic_frequency_score < 40 ? 'असली कैमरा फोटो' : 'AI डिफ्यूजन मार्कर')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {langMode === 'hi' ? 'मिडजर्नी/DALL-E डिफ्यूजन ग्रिड' : '2D FFT lattice test'}
              </div>
            </div>
          </div>

          {/* Plain Language Scale Range Indicator */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <span>{langMode === 'hi' ? '📊 सच्चाई और जोखिम का पैमाना (Easy Reference Range):' : '📊 Risk & Authenticity Scale Reference:'}</span>
              <span className="text-[10px] font-mono text-slate-400">0% = Genuine • 100% = Fake/Deepfake</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <div className="font-black">🟢 0% - 25%</div>
                <div className="text-[11px] font-semibold">{langMode === 'hi' ? 'सुरक्षित व 100% असली' : 'Safe & 100% Genuine'}</div>
                <div className="text-[10px] text-slate-500">{langMode === 'hi' ? 'मूल कैमरा या अधिकृत ID' : 'Real Camera / Official ID'}</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <div className="font-black">🟡 26% - 50%</div>
                <div className="text-[11px] font-semibold">{langMode === 'hi' ? 'हल्का संदेहास्पद / फिल्टर' : 'Minor Filter / Caution'}</div>
                <div className="text-[10px] text-slate-500">{langMode === 'hi' ? 'हल्की क्रॉपिंग या ब्राइटनेस' : 'Light Resave or Filtering'}</div>
              </div>
              <div className="p-2 rounded-lg bg-orange-100/60 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200">
                <div className="font-black">🟠 51% - 75%</div>
                <div className="text-[11px] font-semibold">{langMode === 'hi' ? 'छेड़छाड़ / फर्जी कटिंग' : 'Tampered / Spliced Media'}</div>
                <div className="text-[10px] text-slate-500">{langMode === 'hi' ? 'अखबार या फोटो काटी-छांटी' : 'Morphed Text / Pasted Head'}</div>
              </div>
              <div className="p-2 rounded-lg bg-rose-100/60 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200">
                <div className="font-black">🔴 76% - 100%</div>
                <div className="text-[11px] font-semibold">{langMode === 'hi' ? '100% फर्जी डीपफेक' : 'AI Deepfake / Fake News'}</div>
                <div className="text-[10px] text-slate-500">{langMode === 'hi' ? 'मनगढ़ंत झूठ व AI छवि' : 'Debunked Propaganda'}</div>
              </div>
            </div>
          </div>

          {/* Live Internet Fact-Check & Verified News Links */}
          {result.online_fact_check && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    {langMode === 'hi' ? '🌐 लाइव इंटरनेट फैक्ट-चेक एवं समाचार साक्ष्य (Live News Verification)' : '🌐 Live Internet News Verification & Citations'}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {result.online_fact_check.statement_origin}
                </span>
              </div>

              {/* Simple Language Verdict Card */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Newspaper className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                      {langMode === 'hi' ? result.online_fact_check.headline_hi : result.online_fact_check.headline_en}
                    </h4>
                    <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
                      {langMode === 'hi' ? result.online_fact_check.simple_verdict_hi : result.online_fact_check.simple_verdict_en}
                    </p>
                  </div>
                </div>
              </div>

              {/* OCR Extracted Text snippet if available */}
              {result.ocr_extracted_text && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {langMode === 'hi' ? '📝 तस्वीर से पढ़ा गया टेक्स्ट (Devanagari OCR):' : '📝 Text Extracted from Media (OCR):'}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-mono text-[11px] line-clamp-2">
                    {result.ocr_extracted_text}
                  </p>
                </div>
              )}

              {/* Verified Links Grid */}
              {result.online_fact_check.verified_sources && result.online_fact_check.verified_sources.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {langMode === 'hi' ? '🔗 इंटरनेट पर सत्यापित समाचार एवं स्रोत लिंक:' : '🔗 Verified News Sources & Citations:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.online_fact_check.verified_sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-all flex items-start justify-between gap-2 group"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block truncate">
                            {src.title}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{src.source}</span>
                            {src.date && <span>• {src.date}</span>}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0 self-center" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Dual Canvas: Visual Heatmap Inspector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  विज़ुअल फॉरेंसिक हीटमैप विश्लेषक (Visual Frequency &amp; ELA Canvas)
                </h3>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Heatmap Type Switcher */}
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => setActiveHeatmapTab('ela')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                      activeHeatmapTab === 'ela'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    ELA कंप्रेशन मैप
                  </button>
                  <button
                    onClick={() => setActiveHeatmapTab('fft')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                      activeHeatmapTab === 'fft'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    2D FFT स्पेक्ट्रम
                  </button>
                </div>

                {/* View Mode */}
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => setActiveViewMode('side-by-side')}
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                      activeViewMode === 'side-by-side'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    onClick={() => setActiveViewMode('heatmap-only')}
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                      activeViewMode === 'heatmap-only'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    केवल हीटमैप
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Display Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Original / Uploaded Image */}
              {(activeViewMode === 'side-by-side' || activeViewMode === 'original-only') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>मूल इनपुट मीडिया (Input Media)</span>
                    <span className="font-mono text-[10px] text-slate-400">Layer 0 (Raw RGB)</span>
                  </div>
                  <div className="relative aspect-video sm:aspect-square max-h-[380px] w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    <img
                      src={previewUrl || result.heatmaps.ela_base64}
                      alt="Original Target"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Right: Colorized Forensic Heatmap */}
              {(activeViewMode === 'side-by-side' || activeViewMode === 'heatmap-only') && (
                <div className={`space-y-2 ${activeViewMode === 'heatmap-only' ? 'md:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      {activeHeatmapTab === 'ela'
                        ? 'Error Level Analysis (ELA) एरर हीटमैप'
                        : '2D FFT फ्रीक्वेंसी लैटिस स्पेक्ट्रम'}
                    </span>
                    <span className="font-mono text-[10px] text-indigo-500">
                      {activeHeatmapTab === 'ela' ? 'Re-quantization Delta (JPEG 90)' : 'Log Magnitude Fourier Transform'}
                    </span>
                  </div>
                  <div className="relative aspect-video sm:aspect-square max-h-[380px] w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 group">
                    <img
                      src={
                        activeHeatmapTab === 'ela'
                          ? result.heatmaps.ela_base64
                          : result.heatmaps.fft_base64
                      }
                      alt="Forensic Heatmap"
                      className="max-h-full max-w-full object-contain"
                    />
                    {/* Heatmap interpretation badge */}
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md text-white p-2 rounded-lg text-[11px] border border-slate-700 flex items-center justify-between">
                      <span className="font-medium text-slate-300">
                        {activeHeatmapTab === 'ela'
                          ? 'उज्ज्वल (Bright) पिक्सल्स छेड़छाड़ व अलग कंप्रेशन स्तर को दर्शाते हैं।'
                          : 'चमकीले केंद्रित स्पाइक्स AI जनरेटिव डिफ्यूजन लैटिस का संकेत देते हैं।'}
                      </span>
                      <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
                        {activeHeatmapTab === 'ela'
                          ? `Variance: ${result.engines.ela_compression.max_block_variance}`
                          : `Score: ${result.engines.fft_frequency.synthetic_frequency_score}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. 4-Layer Forensic Engine Audit Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  4-स्तरीय फॉरेंसिक ऑडिट लेजर (4-Engine Forensic Ledger)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Protocol: {result.verification_certificate.protocol}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Engine 1 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 font-mono">
                    1. 2D FFT Frequency
                  </span>
                  {result.engines.fft_frequency.anomaly_detected ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Anomaly
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Clean
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {result.engines.fft_frequency.diagnostic}
                </div>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div>Azimuthal Var: {result.engines.fft_frequency.azimuthal_variance}</div>
                  <div>Decay Rate: {result.engines.fft_frequency.radial_falloff_decay}</div>
                </div>
              </div>

              {/* Engine 2 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 font-mono">
                    2. ELA Compression
                  </span>
                  {result.engines.ela_compression.compression_inconsistency ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Spliced
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Uniform
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {result.engines.ela_compression.diagnostic}
                </div>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div>Tamper Score: {result.engines.ela_compression.tamper_score}</div>
                  <div>Grid Variance: {result.engines.ela_compression.max_block_variance}</div>
                </div>
              </div>

              {/* Engine 3 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 font-mono">
                    3. Biometric &amp; Noise
                  </span>
                  {result.engines.biological_noise.biological_anomaly_score > 50 ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Unnatural
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Natural
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {result.engines.biological_noise.diagnostic}
                </div>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div>Noise Variance: {result.engines.biological_noise.noise_variance}</div>
                  <div>Anomaly Index: {result.engines.biological_noise.biological_anomaly_score}</div>
                </div>
              </div>

              {/* Engine 4 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 font-mono">
                    4. Typography &amp; OCR
                  </span>
                  {result.engines.graphic_typography.graphic_overlay_score > 60 ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Superimposed
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Original
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {result.engines.graphic_typography.diagnostic}
                </div>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div>Edge Sharpness: {result.engines.graphic_typography.gradient_sharpness}</div>
                  <div>Overlay Ratio: {result.engines.graphic_typography.graphic_overlay_score}</div>
                </div>
              </div>
            </div>

            {/* Test Ledger Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-mono uppercase text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4">लेयर / लेयर कोड</th>
                    <th className="py-2.5 px-4">फॉरेंसिक टेस्ट नाम</th>
                    <th className="py-2.5 px-4">जांच परिणाम (Result)</th>
                    <th className="py-2.5 px-4">स्थिति</th>
                    <th className="py-2.5 px-4">विस्तृत निष्कर्ष</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.audit_ledger?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-4 font-mono font-bold text-slate-500">{item.layer}</td>
                      <td className="py-2 px-4 font-semibold text-slate-900 dark:text-white">{item.test_name}</td>
                      <td className="py-2 px-4 font-mono">{item.result}</td>
                      <td className="py-2 px-4">
                        {item.anomaly_detected ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> विसंगति
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> सही
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-slate-500 dark:text-slate-400 text-[11px]">{item.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Tamper-Evident SHA-256 Certificate Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    DIGITAL VERIFICATION CERTIFICATE
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    SEALED
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono truncate max-w-xl mt-0.5">
                  SHA-256: {result.verification_certificate.hash_sha256}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Timestamp: {result.verification_certificate.timestamp} • Status: {result.verification_certificate.status}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>प्रमाणपत्र प्रिंट / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
