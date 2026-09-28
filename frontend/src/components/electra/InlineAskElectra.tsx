import React from 'react';
import { useElectra } from '../../context/ElectraContext';
import { Sparkles } from 'lucide-react';

interface InlineAskElectraProps {
  prompt: string;
  context?: Record<string, any>;
  label?: string;
  className?: string;
}

export const InlineAskElectra: React.FC<InlineAskElectraProps> = ({
  prompt,
  context,
  label = "Ask Electra",
  className = ""
}) => {
  const { openElectra } = useElectra();

  return (
    <button
      onClick={() => openElectra(prompt, context)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/80 dark:border-indigo-800 transition-colors shadow-xs cursor-pointer ${className}`}
      title={`Ask Electra: "${prompt}"`}
    >
      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
      <span>{label}</span>
    </button>
  );
};
