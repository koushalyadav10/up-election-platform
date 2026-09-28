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
  Loader2
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('आपके ब्राउज़र में वॉइस इनपुट सपोर्ट उपलब्ध नहीं है। कृपया लिखकर प्रश्न पूछें।');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#>`_-]/g, ' ').slice(0, 400);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
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
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isExpanded 
        ? 'inset-2 sm:inset-6 flex items-center justify-center' 
        : 'bottom-2 right-2 left-2 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[480px] h-[85vh] sm:h-[640px] max-h-[92vh]'
    }`}>
      <div className="w-full h-full bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden backdrop-blur-xl ring-1 ring-red-500/20">
        
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
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'छोटा करें' : 'बड़ा करें'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[90%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-tr-xs'
                  : 'bg-slate-800/95 text-slate-100 rounded-tl-xs border border-slate-700/80'
              }`}>
                {/* Header inside chanakya bubble */}
                {msg.sender === 'chanakya' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60 text-[11px] text-slate-400">
                    <span className="font-bold text-red-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-400" /> चाणक्य रणनीतिक सुझाव
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(msg.speechSnippet || msg.text)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="आवाज में सुनें"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="कॉपी करें"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-line prose prose-invert prose-xs max-w-none font-sans">
                  {msg.text}
                </div>

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
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
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
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 max-w-[70%]">
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
              <span className="text-xs text-slate-300">
                चाणक्य 75 जिलों और 403 विधानसभाओं का डेटा विश्लेषित कर रहे हैं...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
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
                placeholder="पूछिए: 'अयोध्या में कुर्मी-मुस्लिम समीकरण?' या 'गोरखपुर के घोटाले?'..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="बोलकर पूछें (वॉइस इनपुट)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-red-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>💡 हिंदी, English, व Hinglish तीनों में सवाल पूछ सकते हैं</span>
            <span>मिशन यूपी 2027</span>
          </div>
        </div>

      </div>
    </div>
  );
};
