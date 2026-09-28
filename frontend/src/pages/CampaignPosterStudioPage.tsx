import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Download, 
  Share2, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Check, 
  Flame, 
  Smartphone, 
  Square, 
  Monitor, 
  Copy,
  ChevronDown,
  Info
} from 'lucide-react';
import { fetchAllGroundIntelligence, DistrictGroundIntelligence, PromiseVsReality } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';

export const CampaignPosterStudioPage: React.FC = () => {
  const [districtsMap, setDistrictsMap] = useState<Record<string, DistrictGroundIntelligence>>({});
  const [districtNames, setDistrictNames] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Gorakhpur');
  const [loading, setLoading] = useState(true);

  // Poster Customization State
  const [format, setFormat] = useState<'story' | 'square' | 'banner'>('square');
  const [theme, setTheme] = useState<'samajwadi' | 'dark' | 'pda'>('samajwadi');
  const [headline, setHeadline] = useState<string>('');
  const [subHeadline, setSubHeadline] = useState<string>('डबल इंजन का अहंकार टूटेगा, 2027 में PDA का राज बनेगा!');
  const [leaderPhoto, setLeaderPhoto] = useState<string>('akhilesh');
  const [customSlogan, setCustomSlogan] = useState<string>('काम बोलता है • 2027 में समाजवाद लौटेगा');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchAllGroundIntelligence()
      .then((data: Record<string, DistrictGroundIntelligence>) => {
        setDistrictsMap(data);
        const names = Object.keys(data).sort();
        setDistrictNames(names);
        if (names.length > 0) {
          const defaultDist = names.includes('Gorakhpur') ? 'Gorakhpur' : names[0];
          setSelectedDistrict(defaultDist);
          updateHeadlineForDistrict(defaultDist, data);
        }
      })
      .catch((err: any) => console.error("Failed to load districts:", err))
      .finally(() => setLoading(false));
  }, []);

  const updateHeadlineForDistrict = (distName: string, map = districtsMap) => {
    const d = map[distName];
    if (d && d.promises_vs_reality && d.promises_vs_reality.length > 0) {
      setHeadline(d.promises_vs_reality[0].reality);
    } else {
      setHeadline('विकास कार्यों में भारी लूट व अफसरशाही से त्रस्त जनता!');
    }
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    updateHeadlineForDistrict(distName);
  };

  const currentDistrictData = districtsMap[selectedDistrict];

  // Draw Poster on HTML5 Canvas for HD Export
  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions based on format
    let width = 1080;
    let height = 1080;
    if (format === 'story') {
      width = 1080;
      height = 1920;
    } else if (format === 'banner') {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient
    if (theme === 'samajwadi') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#7f1d1d'); // deep red
      grad.addColorStop(0.5, '#1e293b'); // slate
      grad.addColorStop(1, '#064e3b'); // deep green
      ctx.fillStyle = grad;
    } else if (theme === 'dark') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
    } else {
      // PDA Theme
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#450a0a');
      grad.addColorStop(0.6, '#172554');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric accents
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.beginPath();
    ctx.arc(width * 0.9, height * 0.15, width * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.85, width * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // 2. Top Header Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(40, 40, width - 80, 80);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, 80);

    // District & Mission Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`📍 जनपद: ${selectedDistrict} • जमीनी आक्रोश रिपोर्ट`, 70, 92);

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('मिशन यूपी 2027', width - 260, 90);

    // 3. Main Center Content Box
    const boxY = height * 0.18;
    const boxHeight = height * 0.55;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(50, boxY, width - 100, boxHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, boxY, width - 100, boxHeight);

    // Red Alert Ribbon
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(50, boxY, width - 100, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'black 22px sans-serif';
    ctx.fillText('⚠️ डबल इंजन सरकार की वादाखिलाफी का पर्दाफाश!', 70, boxY + 34);

    // Headline (Auto wrapped)
    ctx.fillStyle = '#fef08a'; // bright yellow
    ctx.font = 'bold 38px sans-serif';
    wrapText(ctx, `"${headline}"`, 80, boxY + 110, width - 160, 48);

    // Sub-headline
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'normal 24px sans-serif';
    wrapText(ctx, subHeadline, 80, boxY + 230, width - 160, 34);

    // Bullet points (Top scandals of district)
    const scandals = currentDistrictData?.promises_vs_reality || [];
    let bulletY = boxY + 310;
    scandals.slice(0, 3).forEach((item: PromiseVsReality, idx: number) => {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`❌`, 80, bulletY);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 22px sans-serif';
      const cleanLine = `${item.tag}: ${item.reality.slice(0, 60)}...`;
      ctx.fillText(cleanLine, 115, bulletY);
      bulletY += 45;
    });

    // 4. Bottom SP Guarantee Ribbon
    const footY = height - 180;
    ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
    ctx.fillRect(50, footY, width - 100, 130);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, footY, width - 100, 130);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🚩 2027 समाजवादी सरकार का किसान-युवा संकल्प:', 75, footY + 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('100% मुफ्त बिजली • पुरानी पेंशन (OPS) • 3 लाख सरकारी नौकरी • कानूनी MSP', 75, footY + 85);

    // Watermark / Brand
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '16px monospace';
    ctx.fillText('UP ELECTION INTELLIGENCE WAR ROOM • 75 DISTRICTS COMMAND', 70, height - 20);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  };

  useEffect(() => {
    if (!loading && currentDistrictData) {
      drawPoster();
    }
  }, [selectedDistrict, format, theme, headline, subHeadline, leaderPhoto, loading, currentDistrictData]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);

    try {
      const link = document.createElement('a');
      link.download = `${selectedDistrict}_Samajwadi_Campaign_Poster_2027.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCaption = () => {
    const text = `🚨 *${selectedDistrict} चुनावी अलर्ट: डबल इंजन सरकार का सच!* 🚨\n\n"${headline}"\n\n👉 *2027 में समाजवादी सरकार का संकल्प:*\n• किसानों को मुफ्त बिजली\n• पुरानी पेंशन (OPS) बहाली\n• 3 लाख युवाओं को पक्की नौकरी\n\n#MissionUP2027 #SamajwadiParty #${selectedDistrict.replace(/\s+/g, '')}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            75 जिलों का सोशल मीडिया पोस्टर स्टूडियो तैयार हो रहा है...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Ribbon */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                <Palette className="w-5 h-5 text-amber-300" />
              </span>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">
                1-क्लिक सोशल मीडिया पोस्टर व बैनर स्टूडियो
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase">
                2027 वॉर रूम
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-100 max-w-2xl">
              उत्तर प्रदेश के किसी भी जिले को चुनें और तुरंत WhatsApp Status, Instagram Post, और X बैनर साइज का एचडी पोस्टर बनाकर 1-क्लिक में डाउनलोड व शेयर करें।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCaption}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xs"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'कैप्शन कॉपी हुआ!' : 'WhatsApp कैप्शन'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'डाउनलोड हो रहा...' : 'HD पोस्टर डाउनलोड करें'}</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Panel (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. District Selector */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>1. जनपद चयन (75 Districts)</span>
                <span className="text-red-600 font-bold text-[11px]">{selectedDistrict}</span>
              </label>
              
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                >
                  {districtNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {currentDistrictData && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                  <span>मुख्यालय: <strong>{currentDistrictData.headquarters}</strong></span>
                  <span>ODOP: <strong>{currentDistrictData.odop_product}</strong></span>
                </div>
              )}
            </div>

            {/* 2. Format & Theme Selection */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  2. पोस्टर साइज / फॉर्मेट
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFormat('square')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      format === 'square'
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-600 dark:text-red-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Square className="w-4 h-4" />
                    <span>Instagram (1:1)</span>
                  </button>

                  <button
                    onClick={() => setFormat('story')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      format === 'story'
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-600 dark:text-red-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>WhatsApp (9:16)</span>
                  </button>

                  <button
                    onClick={() => setFormat('banner')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      format === 'banner'
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-600 dark:text-red-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Twitter (16:9)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  3. कलर थीम
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('samajwadi')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      theme === 'samajwadi'
                        ? 'bg-red-600 text-white border-red-700 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-500 border border-white/50" />
                    <span>लाल-हरा</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-amber-300 border-amber-500 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-slate-900 border border-amber-400" />
                    <span>डार्क वॉर रूम</span>
                  </button>

                  <button
                    onClick={() => setTheme('pda')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      theme === 'pda'
                        ? 'bg-blue-900 text-white border-blue-500 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-blue-600 border border-white/50" />
                    <span>PDA गठबंधन</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Viral Headline & Points Selector */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>4. स्थानीय मुद्दा (शीर्षक)</span>
                <span className="text-slate-400 text-[11px]">क्लिक करके बदलें</span>
              </label>

              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                rows={2}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />

              {/* Quick Scandal Badges */}
              {currentDistrictData?.promises_vs_reality && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {selectedDistrict} के सत्यापित मुद्दे (क्लिक करके चुनें):
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {currentDistrictData.promises_vs_reality.map((item: PromiseVsReality, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setHeadline(item.reality)}
                        className="text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:border-red-400 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {item.tag}
                        </span>
                        <span className="truncate">{item.reality}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Canvas Live Preview (Right 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-4">
            <div className="w-full flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                लाइव एचडी पूर्वावलोकन (Canvas Render)
              </span>
              <span className="text-xs font-mono text-slate-400">
                {format === 'square' ? '1080 x 1080 px' : format === 'story' ? '1080 x 1920 px' : '1200 x 675 px'}
              </span>
            </div>

            {/* Canvas Box */}
            <div className="w-full max-w-lg p-3 rounded-3xl bg-slate-200 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-2xl shadow-lg border border-slate-700/50"
              />
            </div>

            {/* Quick Action Footer */}
            <div className="w-full max-w-lg flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleCopyCaption}
                className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span>{isCopied ? 'कैप्शन कॉपी हुआ!' : 'WhatsApp शेयर कैप्शन'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'तैयार हो रहा...' : 'HD PNG डाउनलोड करें'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
