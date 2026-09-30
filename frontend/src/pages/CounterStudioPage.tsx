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
  const [posterStyle, setPosterStyle] = useState<'cdr-cartoon' | 'rally-banner' | 'news-card' | 'quote-duel' | 'statement-card' | 'pure-ai-art' | 'breaking-banner' | 'ai-poster' | 'server-canvas'>('cdr-cartoon');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [presets, setPresets] = useState<PresetAttack[]>([]);

  const downloadRichPosterCanvas = async () => {
    if (!response) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const triggerDownload = (filename: string) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = src;
      });
    };

    if (posterStyle === 'cdr-cartoon' || posterStyle === 'rally-banner' || posterStyle === 'pure-ai-art' || posterStyle === 'ai-poster') {
      // CorelDraw (CDR) & Photoshop Grade Political Cartoon Poster (1080 x 1080)
      canvas.width = 1080;
      canvas.height = 1080;

      const artSrc = posterStyle === 'rally-banner'
        ? '/assets/cartoons/sp_2027_rally.jpg'
        : (response.artwork_url || response.creative_assets.cdr_poster?.artwork_url || '/assets/cartoons/youth_paper_leak.jpg');

      try {
        const artImg = await loadImage(artSrc);
        ctx.drawImage(artImg, 0, 0, 1080, 1080);
      } catch (e) {
        const grad = ctx.createLinearGradient(0, 0, 0, 1080);
        grad.addColorStop(0, '#7f1d1d');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1080);
      }

      if (posterStyle === 'pure-ai-art') {
        triggerDownload(`Samajwadi_Cartoon_Artwork_${Date.now()}.png`);
        return;
      }

      // 1. Top Ribbon: Red & Gold CorelDraw Banner (y: 0 to 60)
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(0, 0, 1080, 60);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 56, 1080, 4);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('★ SAMAJWADI WAR ROOM 2027 • POLITICAL CARTOON & CDR POSTER ★', 30, 38);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('★ 100% सत्यमेव जयते ★', 840, 38);

      // 2. Category Pill Badge (y: 75 to 115)
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(30, 75, 520, 40, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(`मुद्दे का पलटवार: ${response.vector_label}`, 45, 102);

      // 3. Lower Third subtle gradient (from y=830 to y=1080) for 100% readable text
      const bGrad = ctx.createLinearGradient(0, 830, 0, 1080);
      bGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
      bGrad.addColorStop(0.35, 'rgba(15, 23, 42, 0.88)');
      bGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
      ctx.fillStyle = bGrad;
      ctx.fillRect(0, 830, 1080, 250);

      // 4. 3D Extruded Slogan (Gold with black shadow)
      const hText = response.cdr_headline_hi || response.copywriting.headline_hi.slice(0, 40);
      ctx.font = '900 42px system-ui, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText(hText, 34, 934);
      ctx.fillStyle = '#fde047';
      ctx.fillText(hText, 30, 930);

      // Subheadline
      ctx.fillStyle = '#e0f2fe';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(response.copywriting.sub_headline_hi.slice(0, 68), 30, 975);

      // 5. Bottom Victory Ribbon (y: 1010 to 1080)
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, 1010, 1080, 4);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 1014, 1080, 66);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('समाजवादी पार्टी • PDA (पिछड़ा, दलित, अल्पसंख्यक) परिवार', 30, 1052);
      ctx.fillStyle = '#fef08a';
      ctx.fillText('सत्य • समानता • सामाजिक न्याय • मिशन 2027', 680, 1052);

      triggerDownload(`Samajwadi_CDR_Cartoon_Poster_${Date.now()}.png`);
      return;
    }

    if (posterStyle === 'news-card') {
      // 1. Amar Ujala / Digital News Card (1200 x 675 Landscape)
      canvas.width = 1200;
      canvas.height = 675;

      // Off-white paper background
      ctx.fillStyle = '#fbf9f5';
      ctx.fillRect(0, 0, 1200, 675);

      // Top Masthead: Amar Ujala logo
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(520, 20, 36, 36, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText('अ', 530, 48);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.fillText('अमर उजाला', 565, 50);

      ctx.fillStyle = '#7f1d1d';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('amarujala.com', 568, 68);

      // Main Headline
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px system-ui, sans-serif';
      const headlineText = response.copywriting.headline_hi.split('•')[0].slice(0, 36) || 'योगी पर हमलावर अखिलेश';
      ctx.textAlign = 'center';
      ctx.fillText(headlineText, 600, 130);
      ctx.textAlign = 'left';

      // 3 Red Bullet Points (Centered with wide clear margins for cutouts)
      const tp1 = response.talking_points?.[0] ? response.talking_points[0].replace(/^[0-9]\.\s*/, '').slice(0, 46) : "'स्वजातीय टॉर्चर फोर्स' बनी एसटीएफ";
      const tp2 = response.talking_points?.[1] ? response.talking_points[1].replace(/^[0-9]\.\s*/, '').slice(0, 46) : 'पीडीए से होने के कारण केशव का हो रहा अपमान';
      const tp3 = response.talking_points?.[2] ? response.talking_points[2].replace(/^[0-9]\.\s*/, '').slice(0, 46) : 'डिंपल के फर्जी वीडियो बनवा रही है सरकार';

      const drawBullet = (text: string, y: number) => {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(360, y - 8, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 23px system-ui, sans-serif';
        ctx.fillText(text, 380, y);
      };

      drawBullet(tp1, 230);
      drawBullet(tp2, 330);
      drawBullet(tp3, 430);

      // Load Cutouts (Positioned firmly at borders so they NEVER overlap center text)
      try {
        const [yogiImg, akhileshImg] = await Promise.all([
          loadImage('/assets/leaders/cutouts/yogi_cutout.png'),
          loadImage('/assets/leaders/cutouts/akhilesh_cutout.png')
        ]);
        // Draw Yogi on left
        ctx.drawImage(yogiImg, 10, 250, 320, 425);
        // Draw Akhilesh on right
        ctx.drawImage(akhileshImg, 870, 230, 320, 445);
      } catch (e) {
        console.warn('Cutouts draw fallback:', e);
      }

      triggerDownload(`Amar_Ujala_News_Card_${Date.now()}.png`);
      return;
    }

    if (posterStyle === 'quote-duel') {
      // 2. Quote Duel - Split Screen (1080 x 1200)
      canvas.width = 1080;
      canvas.height = 1200;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1080, 1200);

      // Top Box (Opponent - Orange)
      ctx.fillStyle = '#fff7ed';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(30, 30, 1020, 540, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 70px Georgia, serif';
      ctx.fillText('“', 65, 110);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px system-ui, sans-serif';
      const opText = opponentClaim || 'यूपी में कोई चोरी करेगा तो अगले दिन लंगड़ा हो जाएगा';
      const opWords = opText.split(' ');
      ctx.fillText(opWords.slice(0, 5).join(' '), 65, 180);
      ctx.fillText(opWords.slice(5, 10).join(' '), 65, 235);
      if (opWords.length > 10) ctx.fillText(opWords.slice(10).join(' '), 65, 290);

      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(65, 360, 280, 55, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('- योगी आदित्यनाथ', 85, 398);

      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('CM, UP', 85, 450);

      // Bottom Box (Samajwadi - Red)
      ctx.fillStyle = '#fef2f2';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(30, 630, 1020, 540, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 70px Georgia, serif';
      ctx.fillText('“', 65, 710);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px system-ui, sans-serif';
      const spWords = response.copywriting.headline_hi.split(' ');
      ctx.fillText(spWords.slice(0, 5).join(' '), 65, 780);
      ctx.fillText(spWords.slice(5, 10).join(' '), 65, 835);
      if (spWords.length > 10) ctx.fillText(spWords.slice(10).join(' '), 65, 890);

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(65, 960, 260, 55, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('- अखिलेश यादव', 85, 998);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('सपा प्रमुख', 85, 1050);

      // Center VS Badge
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(540, 600, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VS', 540, 608);
      ctx.textAlign = 'left';

      // Load Cutouts
      try {
        const [yogiImg, akhileshImg] = await Promise.all([
          loadImage('/assets/leaders/cutouts/yogi_duel.png'),
          loadImage('/assets/leaders/cutouts/akhilesh_duel.png')
        ]);
        ctx.drawImage(yogiImg, 620, 80, 400, 490);
        ctx.drawImage(akhileshImg, 620, 680, 400, 490);
      } catch (e) {
        console.warn('Duel draw fallback:', e);
      }

      triggerDownload(`Quote_Duel_FaceOff_${Date.now()}.png`);
      return;
    }

    if (posterStyle === 'statement-card') {
      // 3. Statement Quote Card (1080 x 1080)
      canvas.width = 1080;
      canvas.height = 1080;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1080, 1080);

      // Left red bracket border
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(80, 120);
      ctx.lineTo(80, 800);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 80px Georgia, serif';
      ctx.fillText('“', 95, 160);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px system-ui, sans-serif';
      const sWords = response.copywriting.headline_hi.split(' ');
      ctx.fillText(sWords.slice(0, 5).join(' '), 105, 230);
      ctx.fillText(sWords.slice(5, 10).join(' '), 105, 280);
      if (sWords.length > 10) ctx.fillText(sWords.slice(10, 15).join(' '), 105, 330);
      if (sWords.length > 15) ctx.fillText(sWords.slice(15).join(' '), 105, 380);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 60px Georgia, serif';
      ctx.fillText('„', 105, 450);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('अखिलेश यादव', 105, 520);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('सपा प्रमुख • पूर्व मुख्यमंत्री, उप्र', 105, 560);

      // Bottom red curve bar
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 1040, 1080, 40);

      try {
        const [akhileshImg, circleImg] = await Promise.all([
          loadImage('/assets/leaders/cutouts/akhilesh_cutout.png'),
          loadImage('/assets/leaders/cutouts/akhilesh_circle.png')
        ]);
        ctx.drawImage(circleImg, 780, 60, 220, 220);
        ctx.drawImage(akhileshImg, 520, 360, 560, 680);
      } catch (e) {
        console.warn('Statement card fallback:', e);
      }

      triggerDownload(`Statement_Card_${Date.now()}.png`);
      return;
    }

    if (posterStyle === 'breaking-banner') {
      // 4. Yellow Breaking Banner (1080 x 1200)
      canvas.width = 1080;
      canvas.height = 1200;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 1080, 1200);

      // Yellow Center Banner
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, 500, 1080, 200);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const bWords = response.copywriting.headline_hi.split(' ');
      ctx.fillText(bWords.slice(0, 6).join(' '), 540, 565);
      if (bWords.length > 6) ctx.fillText(bWords.slice(6).join(' '), 540, 615);

      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('AKHILESH YADAV • CHIEF, SAMAJWADI PARTY', 540, 665);
      ctx.textAlign = 'left';

      try {
        const [akhileshImg, yogiImg] = await Promise.all([
          loadImage('/assets/leaders/cutouts/akhilesh_cutout.png'),
          loadImage('/assets/leaders/cutouts/yogi_cutout.png')
        ]);
        ctx.drawImage(akhileshImg, 320, 20, 440, 480);
        ctx.drawImage(yogiImg, 320, 710, 440, 480);
      } catch (e) {
        console.warn('Breaking banner fallback:', e);
      }

      triggerDownload(`Breaking_Banner_${Date.now()}.png`);
      return;
    }

    // Default Fallback: AI Photorealistic Poster (1080x1080)
    canvas.width = 1080;
    canvas.height = 1080;
    const bgUrl = response.creative_assets.square_1080.ai_visual_url;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const renderTextLayers = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, 1080);
      grad.addColorStop(0, 'rgba(127, 29, 29, 0.85)');
      grad.addColorStop(0.35, 'rgba(15, 23, 42, 0.88)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, 1080, 12);

      ctx.fillStyle = '#fecaca';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('SAMAJWADI WAR ROOM 2027 • STRATEGIC FACT-CHECK', 60, 48);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('OFFICIAL COUNTER-PUNCH', 740, 48);

      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(60, 80, 960, 65, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText(`मुद्दे का पलटवार: ${response.vector_label}`, 85, 122);

      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#6366f1';
      ctx.beginPath();
      ctx.roundRect(60, 175, 960, 200, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 34px system-ui, sans-serif';
      const hWords = response.copywriting.headline_hi.split(' ');
      ctx.fillText(hWords.slice(0, 7).join(' '), 85, 235);
      if (hWords.length > 7) ctx.fillText(hWords.slice(7).join(' '), 85, 280);

      ctx.fillStyle = '#c7d2fe';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText(response.copywriting.sub_headline_hi.slice(0, 75), 85, 335);

      triggerDownload(`Samajwadi_AI_Poster_${Date.now()}.png`);
    };

    if (bgUrl) {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1080, 1080);
        renderTextLayers();
      };
      img.onerror = () => renderTextLayers();
      img.src = bgUrl;
    } else {
      renderTextLayers();
    }
  };

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
              नीचे दिए गए 8 प्रमुख ज्वलंत राजनीतिक मुद्दों व व्यंग्य चित्र प्रीसेट्स में से किसी पर क्लिक करके देखें कि कैसे यह AI कुछ ही सेकंडों में विपक्षी नेरेटिव को पूरी तरह ध्वस्त करता है:
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
                  {/* Style Switcher for Political Cards */}
                  <div className="space-y-2 pb-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">भारतीय राजनीतिक मीडिया कार्ड टेम्पलेट्स:</span>
                      <span className="text-[10px] font-mono text-red-600 dark:text-red-400 font-semibold">1080p Studio Presets</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setPosterStyle('cdr-cartoon')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          posterStyle === 'cdr-cartoon'
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs font-black'
                            : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
                        }`}
                      >
                        <span>🎨 CDR व्यंग्य चित्र पोस्टर</span>
                      </button>
                      <button
                        onClick={() => setPosterStyle('rally-banner')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          posterStyle === 'rally-banner'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
                        }`}
                      >
                        <span>⚡ 3D विशाल रैली पोस्टर</span>
                      </button>
                      <button
                        onClick={() => setPosterStyle('news-card')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          posterStyle === 'news-card'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
                        }`}
                      >
                        <span>📰 अमर उजाला अखबारी कार्ड</span>
                      </button>
                      <button
                        onClick={() => setPosterStyle('quote-duel')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          posterStyle === 'quote-duel'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
                        }`}
                      >
                        <span>⚔️ आमने-सामने वार-पलटवार</span>
                      </button>
                      <button
                        onClick={() => setPosterStyle('statement-card')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          posterStyle === 'statement-card'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
                        }`}
                      >
                        <span>🎙️ बयान कार्ड / सिंगल पंच</span>
                      </button>
                      <button
                        onClick={() => setPosterStyle('pure-ai-art')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          posterStyle === 'pure-ai-art'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
                        }`}
                      >
                        <span>🖼️ केवल मूल कार्टून आर्ट</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode: CDR Political Cartoon Poster (CorelDraw / Photoshop Style) */}
                  {posterStyle === 'cdr-cartoon' && (
                    <div className="relative aspect-square max-h-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-red-700/70 bg-slate-950 text-white flex flex-col justify-between select-none group">
                      {/* Full-view Cartoon Artwork */}
                      <img
                        src={response.artwork_url || response.creative_assets.cdr_poster?.artwork_url || '/assets/cartoons/youth_paper_leak.jpg'}
                        alt="CDR Cartoon Artwork"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Top CorelDraw Metallic Ribbon */}
                      <div className="relative z-10 bg-gradient-to-r from-red-700 via-red-800 to-amber-700 px-3.5 py-2 shadow-lg border-b-2 border-yellow-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse" />
                          <span className="text-[11px] sm:text-xs font-black tracking-wide text-white drop-shadow uppercase font-sans">
                            💥 समाजवादी वॉर रूम 2027 • व्यंग्य चित्र
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-black text-yellow-200 bg-red-950/80 px-2 py-0.5 rounded border border-yellow-500/40">
                          {response.vector_label || 'जन-मुद्दा'}
                        </span>
                      </div>

                      {/* Lower-Third CorelDraw / Photoshop Typography (Subtle Dark Gradient) */}
                      <div className="relative z-10 mt-auto bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-2 px-4 space-y-1.5">
                        {/* 3D Extruded Devanagari Headline */}
                        <h3 className="text-base sm:text-lg md:text-xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] leading-snug tracking-tight">
                          {response.cdr_headline_hi || response.copywriting.headline_hi}
                        </h3>
                        <p className="text-[11px] sm:text-xs font-bold text-sky-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-2">
                          {response.copywriting.sub_headline_hi}
                        </p>
                      </div>

                      {/* Bottom Victory Ribbon (Dual Red & Green) */}
                      <div className="relative z-10 bg-red-600 border-t-2 border-green-600 px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-white shadow-md">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm">🚲</span>
                          <span>समाजवादी पार्टी • PDA परिवार</span>
                        </span>
                        <span className="text-yellow-200 font-mono text-[9px] tracking-wider">
                          सत्यमेव जयते • मिशन 2027
                        </span>
                      </div>

                      {/* Hover Overlay for 1-Click Download */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-3">
                        <button
                          onClick={downloadRichPosterCanvas}
                          className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white font-black text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-yellow-300"
                        >
                          <Download className="w-4 h-4" />
                          <span>CDR / HD व्यंग्य पोस्टर डाउनलोड करें (1080p PNG)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode: 3D Mega Rally Poster */}
                  {posterStyle === 'rally-banner' && (
                    <div className="relative aspect-square max-h-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-600/80 bg-slate-950 text-white flex flex-col justify-between select-none group">
                      <img
                        src="/assets/cartoons/sp_2027_rally.jpg"
                        alt="SP 2027 Mega Rally"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Top Ribbon */}
                      <div className="relative z-10 bg-gradient-to-r from-red-800 via-amber-600 to-red-800 px-3.5 py-2 shadow-lg border-b-2 border-yellow-400 flex items-center justify-between">
                        <span className="text-xs font-black tracking-wide text-white drop-shadow uppercase">
                          ⚡ महा-विजय शंखनाद • 2027 लखनऊ कूच
                        </span>
                        <span className="text-[10px] font-bold text-yellow-200 bg-black/50 px-2 py-0.5 rounded border border-yellow-400">
                          ऐतिहासिक जनसैलाब
                        </span>
                      </div>

                      {/* Lower Third */}
                      <div className="relative z-10 mt-auto bg-gradient-to-t from-black via-black/85 to-transparent pt-12 pb-2 px-4 space-y-1.5">
                        <h3 className="text-base sm:text-lg md:text-xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] leading-snug">
                          {response.cdr_headline_hi || 'अबकी बार PDA सरकार • सामाजिक न्याय का शंखनाद'}
                        </h3>
                        <p className="text-[11px] sm:text-xs font-bold text-emerald-200 drop-shadow">
                          {response.copywriting.call_to_action_hi || 'युवा, किसान और वंचितों की आवाज़ — अखिलेश यादव'}
                        </p>
                      </div>

                      {/* Bottom Footer */}
                      <div className="relative z-10 bg-red-600 border-t-2 border-green-600 px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-white shadow-md">
                        <span>🚲 विकास की रफ्तार • सामाजिक न्याय का आधार</span>
                        <span className="text-yellow-300">#Mission2027</span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-3">
                        <button
                          onClick={downloadRichPosterCanvas}
                          className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white font-black text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-yellow-300"
                        >
                          <Download className="w-4 h-4" />
                          <span>3D रैली पोस्टर डाउनलोड करें (1080p PNG)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 1: Amar Ujala / Digital News Media Card (Sample 1 Style) */}
                  {posterStyle === 'news-card' && (
                    <div className="relative aspect-video sm:aspect-[16/10] max-h-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 bg-[#fbf9f5] text-slate-900 flex flex-col justify-between p-4 sm:p-6 select-none group">
                      <div className="absolute inset-0 bg-[#fbf9f5] opacity-95 pointer-events-none" />

                      {/* Masthead Logo */}
                      <div className="relative z-10 flex flex-col items-center justify-center border-b border-red-200 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded bg-red-600 text-white font-black text-sm flex items-center justify-center font-serif">
                            अ
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-red-600 font-serif tracking-tight">
                            अमर उजाला
                          </span>
                        </div>
                        <span className="text-[10px] text-red-700/80 font-mono tracking-widest uppercase">
                          amarujala.com • राष्ट्रीय संस्करण
                        </span>
                      </div>

                      {/* Main Bold Headline */}
                      <div className="relative z-10 text-center my-1">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-black leading-tight drop-shadow-xs">
                          {response.copywriting.headline_hi.split('•')[0].slice(0, 38) || 'योगी पर हमलावर अखिलेश'}
                        </h3>
                      </div>

                      {/* 3 Red Bullet Points (Centered with wide clear margins for cutouts) */}
                      <div className="relative z-10 max-w-[46%] mx-auto space-y-2.5 my-auto bg-white/70 backdrop-blur-xs p-3.5 rounded-xl border border-red-100 shadow-xs">
                        <div className="flex items-start gap-2 text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 mt-1 shadow-xs" />
                          <span>
                            {response.talking_points?.[0]
                              ? response.talking_points[0].replace(/^[0-9]\.\s*/, '').slice(0, 52)
                              : "'स्वजातीय टॉर्चर फोर्स' बनी एसटीएफ"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 mt-1 shadow-xs" />
                          <span>
                            {response.talking_points?.[1]
                              ? response.talking_points[1].replace(/^[0-9]\.\s*/, '').slice(0, 52)
                              : 'पीडीए से होने के कारण केशव का हो रहा अपमान'}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 mt-1 shadow-xs" />
                          <span>
                            {response.talking_points?.[2]
                              ? response.talking_points[2].replace(/^[0-9]\.\s*/, '').slice(0, 52)
                              : 'डिंपल के फर्जी वीडियो बनवा रही है सरकार'}
                          </span>
                        </div>
                      </div>

                      {/* Cutout Left: Yogi */}
                      <img
                        src="/assets/leaders/cutouts/yogi_cutout.png"
                        alt="Yogi Adityanath Cutout"
                        className="absolute bottom-0 left-0 max-h-[80%] w-[28%] object-contain pointer-events-none drop-shadow-md z-10"
                      />

                      {/* Cutout Right: Akhilesh */}
                      <img
                        src="/assets/leaders/cutouts/akhilesh_cutout.png"
                        alt="Akhilesh Yadav Cutout"
                        className="absolute bottom-0 right-0 max-h-[85%] w-[28%] object-contain pointer-events-none drop-shadow-md z-10"
                      />

                      {/* Footer Attribution */}
                      <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-1 font-mono">
                        <span>स्रोत: प्रेस कॉन्फ्रेंस / आधिकारिक बयान</span>
                        <span className="text-red-600 font-bold">✓ डिजिटल न्यूज़ कार्ड</span>
                      </div>

                      {/* Hover Overlay for Download */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-3">
                        <button
                          onClick={downloadRichPosterCanvas}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>अखबारी कार्ड डाउनलोड करें (HD PNG)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Quote Duel - Split Screen (Sample 4 Style) */}
                  {posterStyle === 'quote-duel' && (
                    <div className="relative aspect-[4/5] max-h-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 bg-white text-slate-900 flex flex-col justify-between p-3 select-none group">
                      {/* Top Box: Opponent (Orange) */}
                      <div className="relative flex-1 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100/70 border border-orange-200 p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
                        <div className="relative z-10 max-w-[65%] space-y-1.5">
                          <span className="text-3xl sm:text-4xl text-orange-600 font-serif font-black leading-none block">“</span>
                          <p className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                            '{opponentClaim || 'यूपी में कोई चोरी करेगा तो अगले दिन लंगड़ा हो जाएगा'}'
                          </p>
                          <div className="pt-2">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-orange-600 text-white text-[10px] font-bold">
                              - योगी आदित्यनाथ
                            </span>
                            <span className="text-[10px] text-slate-600 font-bold block ml-1">CM, UP</span>
                          </div>
                        </div>
                        <img
                          src="/assets/leaders/cutouts/yogi_duel.png"
                          alt="Yogi Duel Cutout"
                          className="absolute right-0 bottom-0 max-h-[92%] w-[42%] object-contain pointer-events-none drop-shadow-sm"
                        />
                      </div>

                      {/* Center Divider VS Badge */}
                      <div className="relative z-20 flex items-center justify-center -my-3">
                        <div className="w-10 h-10 rounded-full bg-white shadow-lg border-2 border-red-600 flex items-center justify-center text-[10px] font-black text-red-600">
                          VS
                        </div>
                      </div>

                      {/* Bottom Box: Samajwadi (Red) */}
                      <div className="relative flex-1 rounded-xl bg-gradient-to-br from-rose-50 to-red-100/70 border border-red-200 p-3 sm:p-4 flex flex-col justify-between overflow-hidden mt-1">
                        <div className="relative z-10 max-w-[65%] space-y-1.5">
                          <span className="text-3xl sm:text-4xl text-red-600 font-serif font-black leading-none block">“</span>
                          <p className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                            '{response.copywriting.headline_hi}'
                          </p>
                          <div className="pt-2">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                              - अखिलेश यादव
                            </span>
                            <span className="text-[10px] text-slate-600 font-bold block ml-1">सपा प्रमुख</span>
                          </div>
                        </div>
                        <img
                          src="/assets/leaders/cutouts/akhilesh_duel.png"
                          alt="Akhilesh Duel Cutout"
                          className="absolute right-0 bottom-0 max-h-[95%] w-[42%] object-contain pointer-events-none drop-shadow-sm"
                        />
                      </div>

                      {/* Hover Overlay for Download */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-3">
                        <button
                          onClick={downloadRichPosterCanvas}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>आमने-सामने कार्ड डाउनलोड करें (HD PNG)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Statement Quote Card (Sample 2 & 3 Style) */}
                  {posterStyle === 'statement-card' && (
                    <div className="relative aspect-[4/5] max-h-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 bg-white text-slate-900 flex flex-col justify-between p-4 select-none group">
                      <div className="relative z-10 flex-1 flex flex-col justify-between">
                        <div className="space-y-3 pl-3 border-l-4 border-red-600">
                          <span className="text-4xl text-red-600 font-serif font-black leading-none block">“</span>
                          <p className="text-sm sm:text-base font-black text-slate-900 leading-snug max-w-[65%]">
                            '{response.copywriting.headline_hi}'
                          </p>
                          <span className="text-3xl text-red-600 font-serif font-black leading-none block">„</span>

                          <div className="pt-2">
                            <span className="text-sm font-black text-red-600 block">अखिलेश यादव</span>
                            <span className="text-xs font-semibold text-slate-500 block">सपा प्रमुख • पूर्व मुख्यमंत्री, उप्र</span>
                          </div>
                        </div>

                        {/* Circular Inset Photo */}
                        <div className="absolute right-2 top-2 w-28 h-28 rounded-full border-4 border-red-600 overflow-hidden shadow-md">
                          <img
                            src="/assets/leaders/cutouts/akhilesh_circle.png"
                            alt="Akhilesh Inset"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Large Cutout at Bottom */}
                        <img
                          src="/assets/leaders/cutouts/akhilesh_cutout.png"
                          alt="Akhilesh Cutout"
                          className="absolute right-0 bottom-0 max-h-[70%] w-[50%] object-contain pointer-events-none drop-shadow-md"
                        />
                      </div>

                      <div className="relative z-10 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="text-red-600 font-bold">WAR ROOM OFFICIAL STATEMENT</span>
                        <span>ECI COMPLIANT</span>
                      </div>

                      {/* Hover Overlay for Download */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-3">
                        <button
                          onClick={downloadRichPosterCanvas}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>बयान कार्ड डाउनलोड करें (HD PNG)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 4: Yellow Breaking Banner (Sample 5 Style) */}
                  {posterStyle === 'breaking-banner' && (
                    <div className="relative aspect-[4/5] max-h-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-white flex flex-col justify-between select-none group">
                      <div className="relative h-[40%] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                        <img
                          src="/assets/leaders/cutouts/akhilesh_cutout.png"
                          alt="Akhilesh Top"
                          className="max-h-full object-contain drop-shadow-md"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-amber-300 text-[10px] font-mono font-bold">
                          SAMAJWADI WAR ROOM
                        </div>
                      </div>

                      <div className="relative z-10 bg-[#facc15] text-black px-4 py-3 text-center shadow-lg border-y-2 border-amber-600">
                        <h4 className="text-xs sm:text-sm md:text-base font-black uppercase leading-tight font-sans">
                          {response.copywriting.headline_hi}
                        </h4>
                        <div className="mt-1 text-[11px] font-black text-red-800 tracking-wide uppercase">
                          AKHILESH YADAV • CHIEF, SAMAJWADI PARTY
                        </div>
                      </div>

                      <div className="relative h-[40%] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                        <img
                          src="/assets/leaders/cutouts/yogi_cutout.png"
                          alt="Yogi Bottom"
                          className="max-h-full object-contain drop-shadow-md"
                        />
                        <div className="absolute bottom-2 left-2 text-[9px] text-slate-400 font-mono">
                          (IMAGES: ELECTION PLATFORM WAR ROOM)
                        </div>
                      </div>

                      {/* Hover Overlay for Download */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-3">
                        <button
                          onClick={downloadRichPosterCanvas}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>ब्रेकिंग बैनर डाउनलोड करें (HD PNG)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 5: DALL-E AI Visual Poster */}
                  {posterStyle === 'ai-poster' && (
                    <div className="relative aspect-square max-h-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-red-900/60 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-5 select-none group">
                      {response.creative_assets.square_1080.ai_visual_url ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${response.creative_assets.square_1080.ai_visual_url})`
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-red-950/80 backdrop-blur-[1px]" />

                      <div className="relative z-10 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider">
                          <span className="text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                            SAMAJWADI WAR ROOM 2027
                          </span>
                          <span className="text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/40">
                            OFFICIAL COUNTER-PUNCH
                          </span>
                        </div>
                        <div className="inline-block px-2.5 py-0.5 rounded-lg bg-red-600/90 text-white text-[11px] font-bold shadow-xs">
                          मुद्दे का पलटवार: {response.vector_label}
                        </div>
                      </div>

                      <div className="relative z-10 space-y-2 my-auto bg-slate-900/70 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-white/10 shadow-lg">
                        <h4 className="text-sm sm:text-base md:text-lg font-black text-amber-300 leading-snug drop-shadow-md">
                          {response.copywriting.headline_hi}
                        </h4>
                        <p className="text-[11px] sm:text-xs font-semibold text-indigo-200 leading-relaxed">
                          {response.copywriting.sub_headline_hi}
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-2 text-[10px] font-mono">
                        <div>
                          <span className="text-red-400 font-bold block">समाजवादी पार्टी • PDA परिवार</span>
                          <span className="text-slate-400 text-[9px]">{response.copywriting.call_to_action_hi}</span>
                        </div>
                        <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                          ✓ ECI &amp; NCRB VERIFIED
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-3">
                        <button
                          onClick={downloadRichPosterCanvas}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>HD पोस्टर डाउनलोड करें (1080p PNG)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 6: Pure Political Cartoon Satire Artwork */}
                  {posterStyle === 'pure-ai-art' && (
                    <div className="relative aspect-square max-h-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 flex items-center justify-center group">
                      <img
                        src={response.artwork_url || response.creative_assets.cdr_poster?.artwork_url || response.creative_assets.square_1080.ai_visual_url || '/assets/cartoons/youth_paper_leak.jpg'}
                        alt="Political Cartoon Satire Art"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs text-white">
                        <span className="font-bold text-amber-300">🎨 उच्च रिज़ॉल्यूशन व्यंग्य चित्र (Editorial Cartoon Satire)</span>
                        <button
                          onClick={downloadRichPosterCanvas}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>HD डाउनलोड</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 7: Server Base64 Canvas */}
                  {posterStyle === 'server-canvas' && (
                    <div className="relative aspect-square max-h-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 flex items-center justify-center group">
                      <img
                        src={response.creative_assets.square_1080.image_base64}
                        alt="Server Base64 Poster"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}

                  {/* Bottom Download Controls */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>उपयुक्त: इंस्टाग्राम, फेसबुक, ट्विटर/X, व्हाट्सएप डिजिटल कार्ड</span>
                    <button
                      onClick={downloadRichPosterCanvas}
                      className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>1-Click HD Download</span>
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
