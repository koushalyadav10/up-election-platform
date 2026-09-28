import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Map, 
  BarChart3, 
  Bot, 
  Moon, 
  Sun, 
  ChevronDown, 
  Target, 
  FileSpreadsheet, 
  History, 
  Scale, 
  Globe, 
  Flame, 
  Layers,
  MapPin,
  GitCompare,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Eye,
  Building2,
  Landmark,
  Bell,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useElectra } from '../../context/ElectraContext';

export interface SelectedElection {
  year: number;
  type: string;
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  selectedElection: SelectedElection;
  setSelectedElection: (election: SelectedElection) => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  darkMode,
  setDarkMode,
  selectedElection,
  setSelectedElection,
  onOpenNotifications
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { role, openAuthModal } = useAuth();
  const { toggleElectra, unreadCount } = useElectra();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moreTabs = ['ac-comparison', 'election-comparison', 'scenario-lab', 'parties', 'close-contests', 'delimitation', 'data-quality', 'sources', 'ask-ai'];
  const isMoreTabActive = moreTabs.includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* 1. Brand Logo & Title */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-base shadow-sm ring-1 ring-blue-500/20">
              UP
            </div>
            <div>
              <div className="font-display font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                UP ELECTORAL INTELLIGENCE
              </div>
              <div className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400">
                Data-driven electoral analysis across Uttar Pradesh
              </div>
            </div>
          </div>

          {/* 2. Core Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {/* Overview / Command Center */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Command Center
            </button>

            {/* Interactive Map */}
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>

            {/* Lok Sabha (80) */}
            <button
              onClick={() => setActiveTab('lok-sabha')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'lok-sabha'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Lok Sabha (80)
            </button>

            {/* Vidhan Sabha (403) */}
            <button
              onClick={() => setActiveTab('vidhan-sabha')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'vidhan-sabha'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Vidhan Sabha (403)
            </button>

            {/* District Intelligence */}
            <button
              onClick={() => setActiveTab('districts')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'districts'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Districts (75)</span>
            </button>

            {/* Road to 2027 */}
            <button
              onClick={() => setActiveTab('road-to-2027')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'road-to-2027'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Road to 2027</span>
            </button>

            {/* More Labs & Research Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  isMoreTabActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>Labs &amp; Research</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => { setActiveTab('ac-comparison'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'ac-comparison' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>AC Comparison Lab</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('election-comparison'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'election-comparison' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <GitCompare className="w-4 h-4 text-purple-600" />
                    <span>Election Comparison Lab</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('scenario-lab'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'scenario-lab' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>Hypothetical Simulator</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('parties'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'parties' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span>Party Intelligence</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('close-contests'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'close-contests' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Close Contests</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('delimitation'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'delimitation' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>Delimitation (1991–2024)</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                  <button
                    onClick={() => { setActiveTab('data-quality'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'data-quality' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Data Quality Center</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('sources'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'sources' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    <span>Methodology &amp; ECI Vault</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('ask-ai'); setMoreMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                      activeTab === 'ask-ai' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>Electra Research Lab (AI)</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Utility Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Ask Electra Pill Button */}
            <button
              onClick={toggleElectra}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm hover:shadow active:scale-95 cursor-pointer"
              title="Toggle Electra Intelligence Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Ask Electra</span>
            </button>

            {/* Electra Notifications Bell */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Electra Intelligence Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* RBAC Mode / Admin Button */}
            <button
              onClick={openAuthModal}
              title={language === 'hi' ? 'प्रशासनिक व दर्शक मोड प्रबंधन' : 'RBAC & Mode Management'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                role === 'admin'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/25 shadow-sm'
                  : role === 'editor'
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/40 hover:bg-blue-500/25 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              {role === 'admin' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin</span>
                </>
              ) : role === 'editor' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Editor</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Viewer</span>
                </>
              )}
            </button>

            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Analytical Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
