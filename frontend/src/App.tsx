import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';
import { Navbar, SelectedElection } from './components/layout/Navbar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { OverviewPage } from './pages/OverviewPage';
import { RoadTo2027Page } from './pages/RoadTo2027Page';
import { DelimitationHistoryPage } from './pages/DelimitationHistoryPage';
import { LokSabhaExplorer } from './pages/LokSabhaExplorer';
import { VidhanSabhaExplorer } from './pages/VidhanSabhaExplorer';
import { PCDetailPage } from './pages/PCDetailPage';
import { DistrictIntelligencePage } from './pages/DistrictIntelligencePage';
import { CasteEquationsPage } from './pages/CasteEquationsPage';
import { ACComparisonLabPage } from './pages/ACComparisonLabPage';
import { ElectionComparisonLabPage } from './pages/ElectionComparisonLabPage';
import { PartyIntelligencePage } from './pages/PartyIntelligencePage';
import { CloseContestsPage } from './pages/CloseContestsPage';
import { ScenarioLabPage } from './pages/ScenarioLabPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { AskAIPage } from './pages/AskAIPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { AdminImportPage } from './pages/AdminImportPage';
import { UPMap } from './components/maps/UPMap';
import { ACDossierModal } from './components/common/ACDossierModal';
import { AdminRoleModal } from './components/common/AdminRoleModal';
import { SourceBadge } from './components/common/SourceBadge';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ElectraProvider } from './context/ElectraContext';
import { ElectraPanel } from './components/electra/ElectraPanel';
import { EvidenceModal } from './components/electra/EvidenceModal';
import { NotificationCenter } from './components/electra/NotificationCenter';
import { DailyDigestModal } from './components/electra/DailyDigestModal';
import { ElectraObservabilityModal } from './components/electra/ElectraObservabilityModal';

function MainApp() {
  const { language, t } = useLanguage();

  // 1. Initial State synchronized from URL Query Parameters
  const getInitialParams = () => {
    if (typeof window === 'undefined') return { tab: 'overview', pcId: null, acNo: null, search: false, notif: false };
    const params = new URLSearchParams(window.location.search);
    return {
      tab: params.get('tab') || 'overview',
      pcId: params.get('pc') ? parseInt(params.get('pc')!, 10) : null,
      acNo: params.get('ac') ? parseInt(params.get('ac')!, 10) : null,
      search: params.get('search') === '1',
      notif: params.get('notif') === '1'
    };
  };

  const initialParams = getInitialParams();
  const [activeTab, setActiveTab] = useState<string>(initialParams.tab);
  const [selectedPCId, setSelectedPCId] = useState<number | null>(initialParams.pcId);
  const [selectedACNo, setSelectedACNo] = useState<number | null>(initialParams.acNo);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(initialParams.search);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(initialParams.notif);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [selectedElection, setSelectedElection] = useState<SelectedElection>({
    year: 2024,
    type: 'Lok Sabha'
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Push state to browser history and update URL parameters
  const pushNavState = (opts: {
    tab?: string;
    pcId?: number | null;
    acNo?: number | null;
    search?: boolean;
    notif?: boolean;
  }) => {
    const targetTab = opts.tab !== undefined ? opts.tab : activeTab;
    const targetPC = opts.pcId !== undefined ? opts.pcId : selectedPCId;
    const targetAC = opts.acNo !== undefined ? opts.acNo : selectedACNo;
    const targetSearch = opts.search !== undefined ? opts.search : isSearchOpen;
    const targetNotif = opts.notif !== undefined ? opts.notif : isNotificationOpen;

    const url = new URL(window.location.href);
    if (targetTab === 'overview') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', targetTab);
    }

    if (targetPC) {
      url.searchParams.set('pc', String(targetPC));
    } else {
      url.searchParams.delete('pc');
    }

    if (targetAC) {
      url.searchParams.set('ac', String(targetAC));
    } else {
      url.searchParams.delete('ac');
      url.searchParams.delete('booth');
    }

    if (targetSearch) {
      url.searchParams.set('search', '1');
    } else {
      url.searchParams.delete('search');
    }

    if (targetNotif) {
      url.searchParams.set('notif', '1');
    } else {
      url.searchParams.delete('notif');
    }

    window.history.pushState(
      { tab: targetTab, pcId: targetPC, acNo: targetAC, search: targetSearch, notif: targetNotif },
      '',
      url.toString()
    );
  };

  // Listen to popstate event (triggered on Android back gesture, browser Back button)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab') || 'overview';
      const pcFromUrl = params.get('pc') ? parseInt(params.get('pc')!, 10) : null;
      const acFromUrl = params.get('ac') ? parseInt(params.get('ac')!, 10) : null;
      const searchFromUrl = params.get('search') === '1';
      const notifFromUrl = params.get('notif') === '1';

      setActiveTab(tabFromUrl);
      setSelectedPCId(pcFromUrl);
      setSelectedACNo(acFromUrl);
      setIsSearchOpen(searchFromUrl);
      setIsNotificationOpen(notifFromUrl);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateTab = (tab: string, pcId: number | null = null) => {
    setActiveTab(tab);
    setSelectedPCId(pcId);
    pushNavState({ tab, pcId, search: false, notif: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPC = (pcId: number) => {
    setSelectedPCId(pcId);
    setActiveTab('pc-detail');
    pushNavState({ tab: 'pc-detail', pcId, search: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAC = (acNo: number) => {
    setSelectedACNo(acNo);
    pushNavState({ acNo, search: false });
  };

  const handleCloseAC = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('ac') || params.has('booth')) {
      window.history.back();
    } else {
      setSelectedACNo(null);
    }
  };

  const handleSelectDistrict = (districtName: string) => {
    handleNavigateTab('districts');
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    pushNavState({ search: true });
  };

  const handleCloseSearch = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('search')) {
      window.history.back();
    } else {
      setIsSearchOpen(false);
    }
  };

  const handleOpenNotifications = () => {
    setIsNotificationOpen(true);
    pushNavState({ notif: true });
  };

  const handleCloseNotifications = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('notif')) {
      window.history.back();
    } else {
      setIsNotificationOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenSearch={handleOpenSearch}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        selectedElection={selectedElection}
        setSelectedElection={setSelectedElection}
        onOpenNotifications={handleOpenNotifications}
      />

      {/* 2. Global Analytical Search Palette */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onSelectPC={handleSelectPC}
        onSelectAC={handleSelectAC}
        onSelectDistrict={handleSelectDistrict}
      />

      {/* 3. Main Dynamic Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* 3.1 Smart Step-Back Navigation & Breadcrumb Bar */}
        {activeTab !== 'overview' && (
          <div className="mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-xs transition-colors">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs active:scale-95"
              title={language === 'hi' ? 'एक कदम पीछे जाएं' : 'Go back one step'}
            >
              <ArrowLeft className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{language === 'hi' ? 'पीछे जाएं' : 'Back'}</span>
            </button>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono overflow-x-auto ml-2">
              <button 
                onClick={() => handleNavigateTab('overview')} 
                className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase truncate max-w-[140px] sm:max-w-none">
                {activeTab.replace(/-/g, ' ')}
              </span>
              {selectedPCId && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    PC #{selectedPCId}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <OverviewPage 
            onSelectPC={handleSelectPC} 
            onNavigateTab={(tab: string) => handleNavigateTab(tab)} 
            onOpenSearch={handleOpenSearch}
            selectedElection={selectedElection}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-6 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                    Uttar Pradesh Interactive Electoral Map
                  </h1>
                  <SourceBadge type="OFFICIAL" document="ECI Parliamentary & Assembly Geometry" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dual-layer vector choropleth: toggle between Parliamentary (80 PCs) and Assembly (403 ACs) with multi-election historical switching.
                </p>
              </div>
            </div>
            <UPMap 
              onSelectPC={handleSelectPC} 
              onSelectAC={handleSelectAC}
              selectedPCId={selectedPCId} 
              initialChamber="Parliamentary"
            />
          </div>
        )}

        {activeTab === 'lok-sabha' && (
          <LokSabhaExplorer onSelectPC={handleSelectPC} />
        )}

        {activeTab === 'vidhan-sabha' && (
          <VidhanSabhaExplorer onSelectPC={handleSelectPC} />
        )}

        {activeTab === 'districts' && (
          <DistrictIntelligencePage onSelectPC={handleSelectPC} />
        )}

        {activeTab === 'caste-equations' && (
          <CasteEquationsPage />
        )}

        {activeTab === 'road-to-2027' && (
          <RoadTo2027Page />
        )}

        {activeTab === 'ac-comparison' && (
          <ACComparisonLabPage />
        )}

        {activeTab === 'election-comparison' && (
          <ElectionComparisonLabPage />
        )}

        {activeTab === 'scenario-lab' && (
          <ScenarioLabPage onSelectPC={handleSelectPC} />
        )}

        {activeTab === 'pc-detail' && selectedPCId && (
          <PCDetailPage
            pcId={selectedPCId}
            onBack={() => window.history.back()}
            onSelectPC={handleSelectPC}
          />
        )}

        {activeTab === 'parties' && (
          <PartyIntelligencePage onSelectPC={handleSelectPC} />
        )}

        {activeTab === 'close-contests' && (
          <CloseContestsPage onSelectPC={handleSelectPC} />
        )}

        {activeTab === 'delimitation' && (
          <DelimitationHistoryPage />
        )}

        {activeTab === 'data-quality' && (
          <DataQualityPage />
        )}

        {(activeTab === 'ask-ai' || activeTab === 'ai-assistant') && (
          <AskAIPage />
        )}

        {activeTab === 'sources' && (
          <DataSourcesPage />
        )}

        {activeTab === 'importer' && (
          <AdminImportPage />
        )}
      </main>

      {/* 4. Global AC Dossier Modal */}
      <ACDossierModal
        acNo={selectedACNo}
        isOpen={selectedACNo !== null}
        onClose={handleCloseAC}
      />

      {/* 4.1 Global Admin & RBAC Modal */}
      <AdminRoleModal currentACNo={selectedACNo} />

      {/* 4.2 Electra Intelligence Suite */}
      <ElectraPanel />
      <EvidenceModal />
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
      <DailyDigestModal />
      <ElectraObservabilityModal />

      {/* 5. Editorial & Provenance Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-extrabold text-blue-600 dark:text-blue-400">UP ELECTORAL INTELLIGENCE</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-medium text-[11px] sm:text-xs">DATA FIRST. EVIDENCE FIRST. AI NEVER INVENTS FACTS.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-xs font-mono">
            <span>Official Archive: <strong>1991–2024 (80 PCs / 403 ACs / 75 Districts)</strong></span>
            <span className="hidden sm:inline">•</span>
            <span>Source: Election Commission of India</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ElectraProvider>
          <MainApp />
        </ElectraProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
