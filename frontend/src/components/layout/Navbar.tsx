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
  Sparkles,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const moreTabs = ['ac-comparison', 'election-comparison', 'scenario-lab', 'parties', 'close-contests', 'delimitation', 'data-quality', 'sources', 'ask-ai'];
  const isMoreTabActive = moreTabs.includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* 1. Brand Logo & Title */}
          <div 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0 min-w-0" 
            onClick={() => setActiveTab('overview')}
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-md ring-1 ring-blue-400/30 shrink-0 overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-400/20 transition-colors" />
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 drop-shadow-sm" />
              <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-black tracking-tighter text-blue-200 bg-blue-950/80 px-1 rounded-xs">UP</span>
            </div>
            <div className="min-w-0">
              <div className="font-display font-extrabold text-xs sm:text-sm md:text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                UP ELECTORAL <span className="hidden sm:inline">INTELLIGENCE</span>
              </div>
              <div className="hidden md:block text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400">
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Ask Electra Pill Button */}
            <button
              onClick={toggleElectra}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm hover:shadow active:scale-95 cursor-pointer"
              title="Toggle Electra Intelligence Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden md:inline">Ask Electra</span>
            </button>

            {/* Electra Notifications Bell */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
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

            {/* RBAC Mode / Admin Button (hidden on small mobile, accessible in mobile drawer) */}
            <button
              onClick={openAuthModal}
              title={language === 'hi' ? 'प्रशासनिक व दर्शक मोड प्रबंधन' : 'RBAC & Mode Management'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
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
                  <span className="hidden md:inline">Viewer</span>
                </>
              )}
            </button>

            {/* Language Switcher Button (hidden on small mobile, accessible in mobile drawer) */}
            <button
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Analytical Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle (hidden on small mobile, accessible in mobile drawer) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="hidden sm:flex p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Menu Toggle (< lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 active:scale-95"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              title="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between transition-transform duration-200 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-400/30 overflow-hidden">
              <Landmark className="w-4 h-4 text-amber-300 drop-shadow-sm" />
              <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono font-black text-blue-200 bg-blue-950/80 px-0.5 rounded-xs">UP</span>
            </div>
            <div>
              <div className="font-display font-extrabold text-xs text-slate-900 dark:text-white">
                UP ELECTORAL
              </div>
              <div className="text-[9px] font-mono text-slate-500">Navigation Hub</div>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Primary Modules
          </div>

          <button
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => { setActiveTab('map'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors ${
              activeTab === 'map'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Map className="w-4 h-4 text-emerald-600" />
            <span>Interactive Map (Dual Layer)</span>
          </button>

          <button
            onClick={() => { setActiveTab('lok-sabha'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors ${
              activeTab === 'lok-sabha'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4 text-amber-600" />
            <span>Lok Sabha (80 PCs)</span>
          </button>

          <button
            onClick={() => { setActiveTab('vidhan-sabha'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors ${
              activeTab === 'vidhan-sabha'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Vidhan Sabha (403 ACs)</span>
          </button>

          <button
            onClick={() => { setActiveTab('districts'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors ${
              activeTab === 'districts'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>Districts (75)</span>
          </button>

          <button
            onClick={() => { setActiveTab('road-to-2027'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors ${
              activeTab === 'road-to-2027'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Road to 2027 (Mission 202+)</span>
          </button>

          {/* Labs & Research Accordion */}
          <div className="pt-2">
            <button
              onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <span>Labs & Research ({moreTabs.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileMoreOpen && (
              <div className="pl-2 space-y-1 mt-1 border-l-2 border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => { setActiveTab('ac-comparison'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'ac-comparison' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>AC Comparison Lab</span>
                </button>

                <button
                  onClick={() => { setActiveTab('election-comparison'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'election-comparison' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5 text-purple-600" />
                  <span>Election Comparison Lab</span>
                </button>

                <button
                  onClick={() => { setActiveTab('scenario-lab'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'scenario-lab' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hypothetical Simulator</span>
                </button>

                <button
                  onClick={() => { setActiveTab('parties'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'parties' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Party Intelligence</span>
                </button>

                <button
                  onClick={() => { setActiveTab('close-contests'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'close-contests' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Close Contests (&lt; 10k)</span>
                </button>

                <button
                  onClick={() => { setActiveTab('delimitation'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'delimitation' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delimitation (1991–2024)</span>
                </button>

                <button
                  onClick={() => { setActiveTab('data-quality'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'data-quality' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Data Quality Center</span>
                </button>

                <button
                  onClick={() => { setActiveTab('sources'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'sources' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Methodology & ECI Vault</span>
                </button>

                <button
                  onClick={() => { setActiveTab('ask-ai'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'ask-ai' ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Electra Research Lab (AI)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Drawer Bottom Quick Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'en' ? 'हिन्दी में बदलें' : 'Switch to EN'}</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>RBAC ({role})</span>
            </button>

            <button
              onClick={() => { onOpenSearch(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search (Ctrl+K)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
