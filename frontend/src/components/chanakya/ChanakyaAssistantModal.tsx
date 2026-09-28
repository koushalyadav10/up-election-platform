import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  RotateCcw, 
  Flame, 
  TrendingUp, 
  Users, 
  ChevronRight,
  ShieldAlert,
  Loader2,
  Info
} from 'lucide-react';
import { askChanakya, fetchChanakyaPrompts, ChanakyaResponse, ChanakyaPrompt } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'chanakya';
  text: string;
  stats?: Record<string, any>;
  speechSnippet?: string;
  followups?: string[];
  timestamp: string;
}

interface ChanakyaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDistrict?: string;
}

/**
 * Helper to parse inline markdown:
 * **bold** -> <strong>
 * *italic* -> <em>
 * `code` -> <code>
 * Eliminates all raw asterisks from text.
 */
const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];

  // Match **bold**, *italic*, `code`
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-extrabold text-amber-300">
          {inner}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-slate-200">
          {inner}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-200 font-mono text-[11px] border border-slate-700">
          {inner}
        </code>
      );
    }
    // Clean any accidental stray double asterisks
    const cleaned = part.replace(/\*\*/g, '');
    return <span key={index}>{cleaned}</span>;
  }).filter(Boolean) as React.ReactNode[];
};

/**
 * FormattedChanakyaMessage:
 * Parses headings (###, ####), quotes (>), horizontal rules (---),
 * numbered items (1., 2.), and bullet lists without showing raw markdown syntax.
 */
const FormattedChanakyaMessage: React.FC<{ content: string; isUser?: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-line text-xs sm:text-sm font-sans">{renderInlineMarkdown(content)}</div>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Horizontal rule divider
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <div key={`hr-${i}`} className="my-2.5 border-t border-slate-700/60" />
      );
      continue;
    }

    // Heading 3: "### 🔥 Title"
    if (trimmed.startsWith('### ')) {
      const heading = trimmed.slice(4).trim();
      elements.push(
        <div key={`h3-${i}`} className="font-extrabold text-sm sm:text-base text-amber-300 mt-2.5 mb-1 pb-1 border-b border-slate-700/60 flex items-center gap-1.5">
          {renderInlineMarkdown(heading)}
        </div>
      );
      continue;
    }

    // Heading 4: "#### 💣 Title"
    if (trimmed.startsWith('#### ')) {
      const heading = trimmed.slice(5).trim();
      elements.push(
        <div key={`h4-${i}`} className="font-bold text-xs sm:text-sm text-red-300 mt-2 mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
          {renderInlineMarkdown(heading)}
        </div>
      );
      continue;
    }

    // Speech Quotes / Rally excerpts: "> *Quote*" or "> Quote"
    if (trimmed.startsWith('> ') || trimmed.startsWith('>*')) {
      const quote = trimmed.replace(/^>\s*\*?/, '').replace(/\*?$/, '').trim();
      elements.push(
        <div key={`quote-${i}`} className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-l-4 border-red-500 text-slate-100 text-xs sm:text-sm leading-relaxed shadow-inner">
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-400" /> रैली संबोधन सूत्र
          </div>
          <div className="italic text-slate-100">
            {renderInlineMarkdown(quote)}
          </div>
        </div>
      );
      continue;
    }

    // Numbered list items: "1. Item" or "**1. Item:** Detail"
    const numMatch = trimmed.match(/^(?:\*\*)?(\d+)\.\s*(.+)$/);
    if (numMatch) {
      const num = numMatch[1];
      const itemBody = numMatch[2].replace(/\*\*$/, '');
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600/30 border border-red-500/50 text-red-200 text-xs font-black shrink-0 mt-0.5 shadow-xs">
            {num}
          </span>
          <div className="flex-1 text-slate-100 text-xs sm:text-sm leading-relaxed">
            {renderInlineMarkdown(itemBody)}
          </div>
        </div>
      );
      continue;
    }

    // Bullet items: "- ...", "* ...", "• ...", or indented "   - ..."
    const isIndented = rawLine.startsWith('   ') || rawLine.startsWith('\t');
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      const bulletBody = bulletMatch[1];
      elements.push(
        <div key={`bullet-${i}`} className={`flex items-start gap-2 my-1 leading-relaxed ${isIndented ? 'ml-4 text-slate-300' : 'text-slate-100'}`}>
          <span className={`rounded-full shrink-0 mt-2 ${isIndented ? 'w-1 h-1 bg-slate-400' : 'w-1.5 h-1.5 bg-amber-400'}`} />
          <div className="flex-1 text-xs sm:text-sm">
            {renderInlineMarkdown(bulletBody)}
          </div>
        </div>
      );
      continue;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm leading-relaxed text-slate-100 my-1">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
};

export const ChanakyaAssistantModal: React.FC<ChanakyaAssistantModalProps> = ({
  isOpen,
  onClose,
  initialDistrict
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'chanakya',
      text: `जय समाजवाद! मैं **चुनावी चाणक्य AI** हूं—उत्तर प्रदेश 2027 चुनाव का आपका डिजिटल वॉर रूम रणनीतिकार।\n\nमैं 75 जिलों की जमीनी रिपोर्ट, जातिगत समीकरण (PDA), 403 विधानसभाओं के नतीजों और भाषण सूत्रों से लैस हूं।\n\nआप मुझसे हिंदी, English या Hinglish में कुछ भी पूछ सकते हैं!`,
      followups: [
        'अयोध्या में कुर्मी और मुस्लिम वोट को एकजुट करने का सबसे सटीक भाषण क्या होगा?',
        'गोरखपुर में भाजपा के स्थानीय विधायक को घेरने के 3 सबसे बड़े मुद्दे क्या हैं?',
        'अगर बसपा का 6% वोट इंडिया गठबंधन में आता है, तो हम कितनी सीटें जीतेंगे?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<ChanakyaPrompt[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoices(available);
        }
      } catch (err) {
        console.warn('Voices load error:', err);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    fetchChanakyaPrompts().then(res => {
      if (res && res.prompts) setQuickPrompts(res.prompts);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Prevent background scroll bleed by capturing wheel events
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !isOpen) return;

    const stopWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    container.addEventListener('wheel', stopWheel, { passive: true });
    return () => {
      container.removeEventListener('wheel', stopWheel);
    };
  }, [isOpen]);

  // Speech-to-Text (STT) handler with interim results & permission support
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicNotice('आपके ब्राउज़र में वॉइस इनपुट सपोर्ट उपलब्ध नहीं है। कृपया लिखकर प्रश्न पूछें।');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMicNotice(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputValue(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicNotice('माइक अनुमति आवश्यक है: URL बार में 🔒 या "Not Secure" पर क्लिक करके Microphone को "Allow" करें।');
        } else if (event.error === 'no-speech') {
          setMicNotice('कोई आवाज नहीं पहचानी गई। कृपया माइक बटन दबाकर दोबारा बोलें।');
        } else if (event.error === 'network') {
          setMicNotice('नेटवर्क त्रुटि: वॉइस सेवा से संपर्क नहीं हो सका।');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
      setIsListening(false);
      setMicNotice('वॉइस इनपुट प्रारंभ नहीं हो सका। कृपया टाइप करके पूछें।');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    setMicNotice(null);

    // Request audio stream permission via getUserMedia first if available (prompts Chrome dialog)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach(track => track.stop());
          startListening();
        })
        .catch((err) => {
          console.warn('getUserMedia permission error:', err);
          // Try recognition anyway as fallback
          startListening();
        });
    } else {
      startListening();
    }
  };

  // Text-to-Speech (TTS) Speaker handler
  const handleSpeak = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('आपके ब्राउज़र में स्पीच सिंथेसिस उपलब्ध नहीं है।');
      return;
    }

    // Toggle stop if already speaking this message
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      activeUtteranceRef.current = null;
      return;
    }

    // Cancel existing utterance and resume audio engine
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    // Clean markdown formatting characters for natural pronunciation
    const cleanText = text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/>\s*/g, '')
      .replace(/[-•]\s*/g, '')
      .replace(/\d+\.\s*/g, '')
      .replace(/[-_~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Take concise oratorical segment
    const speechSnippet = cleanText.slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(speechSnippet);

    // Store in ref to avoid Chromium Garbage Collector issue
    activeUtteranceRef.current = utterance;
    (window as any)._activeChanakyaUtterance = utterance;

    // Match best available voice: Hindi > Indian English > Default
    const hindiVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith('hi') || 
      v.name.toLowerCase().includes('hindi') || 
      v.name.toLowerCase().includes('hemant') || 
      v.name.toLowerCase().includes('kalpana') ||
      v.name.toLowerCase().includes('swara')
    );
    const indianVoice = voices.find(v => 
      v.lang.toLowerCase().includes('en-in') || 
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('ravi')
    );
    const chosenVoice = hindiVoice || indianVoice || (voices.length > 0 ? voices[0] : null);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = 'hi-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMsgId(null);
      activeUtteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setSpeakingMsgId(null);
      activeUtteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputValue).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res: ChanakyaResponse = await askChanakya(q);
      const chanakyaMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'chanakya',
        text: res.answer,
        stats: res.key_stats,
        speechSnippet: res.speech_snippet,
        followups: res.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, chanakyaMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'chanakya',
        text: 'माफ़ कीजिए, सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    const clean = text.replace(/[*#>`_-]/g, ' ').replace(/\s+/g, ' ').trim();
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded 
          ? 'inset-2 sm:inset-6 flex items-center justify-center' 
          : 'bottom-2 right-2 left-2 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[500px] h-[86vh] sm:h-[650px] max-h-[92vh]'
      }`}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full h-full bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden backdrop-blur-xl ring-1 ring-red-500/20"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Bot className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                  चुनावी चाणक्य AI
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600/40 text-red-200 border border-red-500/40">
                    WAR ROOM 2027
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>75 जिले</span>
                <span>•</span>
                <span>403 ACs डेटाबेस</span>
                <span>•</span>
                <span>PDA रणनीतिकार</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isExpanded ? 'छोटा करें' : 'बड़ा करें'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompt Chips (Horizontal Scroll) */}
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            शीघ्र प्रश्न:
          </span>
          {quickPrompts.map(p => (
            <button
              key={p.id}
              onClick={() => handleSend(p.query)}
              className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-800/90 hover:bg-red-950/80 hover:text-red-200 hover:border-red-700/50 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Messages Stream - Isolated scroll with min-h-0 and overscroll-contain */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 min-h-0 p-4 overflow-y-auto overscroll-contain space-y-4"
          style={{ overscrollBehavior: 'contain' }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-tr-xs'
                  : 'bg-slate-800/95 text-slate-100 rounded-tl-xs border border-slate-700/80 shadow-slate-950/50'
              }`}>
                {/* Header inside chanakya bubble */}
                {msg.sender === 'chanakya' && (
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-700/60 text-[11px] text-slate-400">
                    <span className="font-bold text-red-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-400" /> चाणक्य रणनीतिक सुझाव
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(msg.speechSnippet || msg.text, msg.id)}
                        className={`p-1.5 rounded-lg flex items-center gap-1 text-xs transition-colors cursor-pointer ${
                          speakingMsgId === msg.id
                            ? 'bg-red-600 text-white font-bold animate-pulse'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                        title={speakingMsgId === msg.id ? "बोलना रोकें" : "आवाज में सुनें"}
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span className="text-[10px]">रोकें</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">सुनें</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="साफ टेक्स्ट कॉपी करें"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Formatted Message Body (Zero Raw Asterisks) */}
                <FormattedChanakyaMessage content={msg.text} isUser={msg.sender === 'user'} />

                {/* Stats Badge Strip if present */}
                {msg.stats && Object.keys(msg.stats).length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-2 text-[11px]">
                    {msg.stats.projected_seats && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 font-bold">
                        अनुमानित सीटें: {msg.stats.projected_seats} / 403
                      </span>
                    )}
                    {msg.stats.pda_potential && (
                      <span className="px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-600/40 text-blue-300 font-bold">
                        PDA आधार: {msg.stats.pda_potential}%
                      </span>
                    )}
                    {msg.stats.flipped_seats && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-600/40 text-amber-300 font-bold">
                        सीधे पलटने वाली सीटें: +{msg.stats.flipped_seats}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-slate-400 text-right">
                  {msg.timestamp}
                </div>
              </div>

              {/* Follow-up Prompts */}
              {msg.followups && msg.followups.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                  {msg.followups.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(f)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>{f}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 max-w-[75%]">
              <Loader2 className="w-4 h-4 text-red-500 animate-spin shrink-0" />
              <span className="text-xs text-slate-300 leading-tight">
                चाणक्य 75 जिलों और 403 विधानसभाओं का डेटा विश्लेषित कर रहे हैं...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
          
          {/* Active Listening Indicator Banner */}
          {isListening && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-red-950 border border-red-500/60 rounded-xl mb-2 text-xs text-red-200 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="font-semibold text-white">
                  🔴 आपकी आवाज सुन रहा हूँ... बोलिए!
                </span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[11px] underline text-red-300 hover:text-white cursor-pointer"
              >
                रोकें
              </button>
            </div>
          )}

          {/* Microphone Permission / Helper Banner */}
          {micNotice && (
            <div className="flex items-start justify-between p-2 bg-amber-950/90 border border-amber-600/50 rounded-xl mb-2 text-xs text-amber-200">
              <div className="flex items-center gap-1.5 flex-1 pr-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-snug">{micNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setMicNotice(null)}
                className="text-amber-400 hover:text-white p-0.5 cursor-pointer"
                title="हटाएं"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? "सुन रहा हूँ... बोलिए..." : "पूछिए: 'अयोध्या में कुर्मी-मुस्लिम समीकरण?' या 'गोरखपुर के मुद्दे'..."}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isListening 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isListening ? "माइक बंद करें" : "बोलकर पूछें (वॉइस इनपुट)"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-red-600/30 transition-all cursor-pointer"
              title="भेजें"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>💡 माइक पर बोलें या सीधे हिंदी, English, Hinglish में लिखें</span>
            <span>मिशन यूपी 2027</span>
          </div>
        </div>

      </div>
    </div>
  );
};
