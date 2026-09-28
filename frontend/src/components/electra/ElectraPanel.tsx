import React, { useState, useRef, useEffect } from 'react';
import { useElectra } from '../../context/ElectraContext';
import { 
  Sparkles, 
  X, 
  Send, 
  MapPin, 
  RotateCcw, 
  ShieldCheck, 
  Loader2, 
  Layers, 
  Bell, 
  Activity, 
  FileText 
} from 'lucide-react';
import { askElectraIntelligence, ElectraQueryResponse } from '../../services/api';
import { ElectraResponse } from './ElectraResponse';

interface Message {
  role: 'user' | 'assistant';
  content?: string;
  data?: ElectraQueryResponse;
}

export const ElectraPanel: React.FC = () => {
  const { 
    isPanelOpen, 
    closeElectra, 
    activeDistrict, 
    activeAC, 
    activeACName, 
    activeBooth, 
    activeContextString,
    clearContext,
    openDigest,
    openObservability
  } = useElectra();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusStage, setStatusStage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isPanelOpen) return null;

  // Context-adaptive prompt suggestions
  const getPromptSuggestions = () => {
    if (activeBooth && activeAC) {
      return [
        `Booth #${activeBooth} par 2022 vs 2024 mein kya badla?`,
        `Assigned booth president and BLA-2 details at Booth #${activeBooth}`,
        `Is there any electoral roll drop alert at Booth #${activeBooth}?`
      ];
    }
    if (activeAC) {
      return [
        `2022 vs 2024 mein AC #${activeAC} par kya badla?`,
        `Why did the winner lead transition in AC #${activeAC}?`,
        `Latest local news and public issues in AC #${activeAC}`,
        `Explain strategic classification of this seat`
      ];
    }
    if (activeDistrict) {
      return [
        `2024 parliamentary segment sweep across ${activeDistrict}`,
        `Latest administrative updates and SSR camps in ${activeDistrict}`,
        `Which ACs in ${activeDistrict} had the closest margins?`
      ];
    }
    return [
      "Compare 2022 Assembly vs 2024 Lok Sabha sweep across UP",
      "Which constituencies had victory margin under 1,000 votes?",
      "Latest ECI official circulars and electoral roll directives"
    ];
  };

  const handleSend = async (qText?: string) => {
    const textToSend = qText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setStatusStage("Searching verified election records...");
    const stageTimer1 = setTimeout(() => setStatusStage("Checking current official sources..."), 400);
    const stageTimer2 = setTimeout(() => setStatusStage("Validating numerical evidence..."), 800);

    try {
      const res = await askElectraIntelligence({
        query: textToSend,
        context: {
          district: activeDistrict,
          ac_no: activeAC,
          ac_name: activeACName,
          booth_no: activeBooth
        }
      });
      setMessages(prev => [...prev, { role: 'assistant', data: res }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error retrieving verified evidence: ${err.message || 'Server timeout'}` 
      }]);
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setLoading(false);
      setStatusStage(null);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col font-sans transition-all">
      
      {/* 1. Header Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                <span>ELECTRA INTELLIGENCE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  STRICT RAG
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Evidence-Grounded UP Electoral Research Analyst
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={openObservability}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Developer Audit Trace"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={closeElectra}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Electra Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Context Strip */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate font-mono text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate" title={activeContextString}>{activeContextString}</span>
          </div>
          {(activeDistrict || activeAC || activeBooth) && (
            <button
              onClick={clearContext}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
              title="Clear context and query statewide"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Messages Conversation View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="py-8 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                How can Electra assist your election research?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Ask about historical returns, Form 20 booth metrics, winner transitions, or real-time local updates.
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="pt-2 text-left space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Suggested Contextual Inquiries:
              </span>
              <div className="space-y-1.5">
                {getPromptSuggestions().map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors shadow-2xs"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx}>
              {m.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-3 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-medium shadow-xs">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="w-full">
                    {m.data ? (
                      <ElectraResponse data={m.data} />
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200">
                        {m.content}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading / Status Stages */}
        {loading && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 animate-pulse font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>{statusStage || "Processing..."}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Form */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Electra about this seat, booth, or UP trends..."
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            title="Submit Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
