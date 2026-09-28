import React from 'react';
import { ShieldCheck, Info, AlertTriangle, Cpu } from 'lucide-react';

interface SourceBadgeProps {
  type?: 'OFFICIAL' | 'DERIVED' | 'SECONDARY' | 'SURVEY' | 'SIMULATION';
  document?: string;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ 
  type = 'OFFICIAL', 
  document = 'ECI 2024 Gazette',
  className = ''
}) => {
  const configs = {
    OFFICIAL: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: ShieldCheck,
      label: 'OFFICIAL ECI',
      tooltip: 'Certified primary data directly sourced from Election Commission of India official publications.'
    },
    DERIVED: {
      bg: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
      icon: Info,
      label: 'DERIVED (OFFICIAL)',
      tooltip: 'Mathematically calculated from official ECI figures using validated analytical formulas.'
    },
    SECONDARY: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: Info,
      label: 'SECONDARY SOURCE',
      tooltip: 'Compiled from documented secondary research sources.'
    },
    SURVEY: {
      bg: 'bg-yellow-50 text-yellow-800 border-yellow-400 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-700',
      icon: AlertTriangle,
      label: 'OPINION POLL / SURVEY',
      tooltip: 'Pre-election survey or exit poll sample. NOT an official election result.'
    },
    SIMULATION: {
      bg: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      icon: Cpu,
      label: 'SIMULATION',
      tooltip: 'Hypothetical mathematical swing model. NOT an election forecast.'
    }
  };

  const cfg = configs[type] || configs.OFFICIAL;
  const Icon = cfg.icon;

  return (
    <span 
      title={`${cfg.tooltip} (${document})`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded border tracking-wide uppercase transition-colors ${cfg.bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
};
