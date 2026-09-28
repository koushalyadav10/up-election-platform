import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { BoothDetailDrawer } from './BoothDetailDrawer';
import { 
  fetchACDossier, 
  ACDossierResponse, 
  ACComparisonItem,
  fetchACPollingStations,
  PollingStationsResponse,
  PollingStationItem,
  fetchBoothClassification,
  BoothClassificationResponse,
  getACDossierExportUrl,
  fetchHQProgressTracker,
  HQProgressTrackerResponse
} from '../../services/api';
import { 
  Target,
  X, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  Vote, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck, 
  Layers,
  Sparkles,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Building2,
  Users,
  Activity,
  Calendar,
  ExternalLink,
  Info,
  Download,
  UploadCloud,
  Share2,
  Plus,
  Check,
  Award,
  Landmark,
  UserCheck,
  Search,
  ChevronRight,
  Loader2,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SourceBadge } from './SourceBadge';
import { DossierPrintView } from './DossierPrintView';
import { useElectra } from '../../context/ElectraContext';
import { InlineAskElectra } from '../electra/InlineAskElectra';
import { ShareSeatCardModal } from './ShareSeatCardModal';

interface ACDossierModalProps {
  acNo: number | null;
  isOpen?: boolean;
  onClose: () => void;
  onSelectPC?: (pcId: number) => void;
  onAskAI?: (prompt: string) => void;
  onPinAC?: (ac: ACComparisonItem) => void;
  isPinned?: boolean;
}

export const ACDossierModal: React.FC<ACDossierModalProps> = ({ 
  acNo, 
  isOpen, 
  onClose, 
  onSelectPC,
  onAskAI,
  onPinAC,
  isPinned = false
}) => {
  const { permissions, passcode, openAuthModal } = useAuth();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { setContext } = useElectra();

  const [data, setData] = useState<ACDossierResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimelineYear, setSelectedTimelineYear] = useState<number>(2022);
  const [showStoryEvidence, setShowStoryEvidence] = useState(false);
  const [showPublicEvidence, setShowPublicEvidence] = useState(false);
  const [showProvenanceDrawer, setShowProvenanceDrawer] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!acNo) return;
    try {
      setIsExporting(true);
      const exportUrl = `/api/strategy/assembly/${acNo}/export-dossier`;
      const headers: Record<string, string> = {};
      if (passcode) headers['x-role-key'] = passcode;

      // 1. Fetch file to read clean filename from Content-Disposition header
      const res = await fetch(exportUrl, { headers });
      if (!res.ok) {
        throw new Error(`Export fetch status: ${res.status}`);
      }

      const blob = await res.blob();
      let filename = `AC_${acNo}_Mission_2027_War_Dossier.csv`;
      const cd = res.headers.get('content-disposition');
      if (cd && cd.includes('filename=')) {
        const match = cd.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      // 2. Trigger download via object URL
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // CRITICAL FIX: Delay revocation by 60 seconds so browser download manager has time to complete!
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);

    } catch (err: any) {
      console.warn('Blob export failed, trying native direct download fallback:', err);
      // Fallback: Direct Anchor Download using backend streaming
      const fallbackLink = document.createElement('a');
      fallbackLink.href = `/api/strategy/assembly/${acNo}/export-dossier`;
      fallbackLink.setAttribute('download', `AC_${acNo}_Mission_2027_War_Dossier.csv`);
      fallbackLink.style.display = 'none';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      setTimeout(() => {
        if (document.body.contains(fallbackLink)) {
          document.body.removeChild(fallbackLink);
        }
      }, 2000);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  // Booth Explorer State (Verification-First & Neutral Analytics)
  const [showBoothExplorer, setShowBoothExplorer] = useState(false);
  const [boothPage, setBoothPage] = useState(1);
  const [boothSearch, setBoothSearch] = useState('');
  const [debouncedBoothSearch, setDebouncedBoothSearch] = useState('');
  const [boothPartyFilter, setBoothPartyFilter] = useState('ALL');
  const [boothYear, setBoothYear] = useState<number>(2024);
  const [boothLeadStatus, setBoothLeadStatus] = useState<string>('ALL');
  const [marginThreshold, setMarginThreshold] = useState<number>(50);
  const [transitionFilter, setTransitionFilter] = useState<string>('ALL');
  const [boothData, setBoothData] = useState<PollingStationsResponse | null>(null);
  const [boothLoading, setBoothLoading] = useState(false);
  const [selectedDrawerBoothPartNo, setSelectedDrawerBoothPartNo] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search);
    const b = p.get('booth');
    return b ? parseInt(b, 10) : null;
  });

  const handleOpenBoothDrawer = (partNo: number) => {
    setSelectedDrawerBoothPartNo(partNo);
    const url = new URL(window.location.href);
    url.searchParams.set('booth', String(partNo));
    window.history.pushState({ modal: 'booth-drawer', acNo, partNo }, '', url.toString());
  };

  const handleCloseBoothDrawer = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('booth')) {
      window.history.back();
    } else {
      setSelectedDrawerBoothPartNo(null);
    }
  };

  const [strategyClassification, setStrategyClassification] = useState<BoothClassificationResponse | null>(null);
  const [hqTracker, setHqTracker] = useState<HQProgressTrackerResponse | null>(null);

  useEffect(() => {
    if (!showBoothExplorer || !acNo) return;
    fetchHQProgressTracker(acNo)
      .then(res => setHqTracker(res))
      .catch(() => null);
  }, [showBoothExplorer, acNo]);
  const [activeStrategyFilter, setActiveStrategyFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!showBoothExplorer || !acNo) return;
    fetchBoothClassification(acNo)
      .then(res => setStrategyClassification(res))
      .catch(() => null);
  }, [showBoothExplorer, acNo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBoothSearch(boothSearch);
    }, 200);
    return () => clearTimeout(timer);
  }, [boothSearch]);

  useEffect(() => {
    if (!showBoothExplorer || !acNo) return;
    setBoothLoading(true);
    fetchACPollingStations(acNo, {
      page: boothPage,
      limit: 20,
      search: debouncedBoothSearch,
      party: boothPartyFilter !== 'ALL' ? boothPartyFilter : undefined,
      year: boothYear,
      lead_status: boothLeadStatus !== 'ALL' ? boothLeadStatus : undefined,
      margin_threshold: marginThreshold,
      transition_filter: transitionFilter !== 'ALL' ? transitionFilter : undefined
    })
      .then(res => {
        setBoothData(res);
        setBoothLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch booths:", err);
        setBoothLoading(false);
      });
  }, [showBoothExplorer, acNo, boothPage, debouncedBoothSearch, boothPartyFilter, boothYear, boothLeadStatus, marginThreshold, transitionFilter]);

  useEffect(() => {
    if (!acNo) return;
    setLoading(true);
    setError(null);
    setShowStoryEvidence(false);
    setShowPublicEvidence(false);
    setShowProvenanceDrawer(false);
    setShowBoothExplorer(false);
    setSelectedDrawerBoothPartNo(null);
    setBoothPage(1);
    setBoothSearch('');
    setBoothPartyFilter('ALL');
    setBoothData(null);
    fetchACDossier(acNo)
      .then(res => {
        setData(res);
        setSelectedTimelineYear(res.latest_assembly_election?.year || 2022);
        setLoading(false);
        if (res?.basic_info) {
          setContext({
            ac_no: res.basic_info.ac_no,
            ac_name: res.basic_info.name,
            district: res.basic_info.district,
            pc_no: res.basic_info.parent_pc?.pc_no,
            pc_name: res.basic_info.parent_pc?.pc_name
          });
        }
      })
      .catch(err => {
        console.error(err);
        setError(`Failed to load intelligence dossier for AC #${acNo}`);
        setLoading(false);
      });
  }, [acNo]);

    // Lock body scroll when modal is open and handle popstate & ESC
  useEffect(() => {
    if (!isOpen || !acNo) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-scroll-lock');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDrawerBoothPartNo !== null) {
          handleCloseBoothDrawer();
        } else if (isShareModalOpen) {
          setIsShareModalOpen(false);
        } else {
          onClose();
        }
      }
    };

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const boothParam = params.get('booth');

      if (!boothParam && selectedDrawerBoothPartNo !== null) {
        setSelectedDrawerBoothPartNo(null);
      } else if (boothParam) {
        const parsed = parseInt(boothParam, 10);
        if (!isNaN(parsed) && parsed !== selectedDrawerBoothPartNo) {
          setSelectedDrawerBoothPartNo(parsed);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('modal-scroll-lock');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, acNo, selectedDrawerBoothPartNo, isShareModalOpen, onClose]);

  if (!acNo || isOpen === false) return null;

  const getPartyColor = (party?: string) => {
    switch (party?.toUpperCase()) {
      case 'SP': return '#16a34a';
      case 'BJP': return '#ea580c';
      case 'BSP': return '#2563eb';
      case 'INC': return '#0284c7';
      case 'RLD': return '#15803d';
      case 'NINSHAD':
      case 'NISHAD': return '#d97706';
      case 'ADAL':
      case 'AD': return '#b45309';
      case 'JD': return '#059669';
      default: return '#64748b';
    }
  };

  const getPartyBadgeClass = (party?: string) => {
    switch (party?.toUpperCase()) {
      case 'SP': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'BJP': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
      case 'BSP': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'INC': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      case 'RLD': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800';
      case 'NINSHAD':
      case 'NISHAD': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const timelineElection = data?.historical_winner_timeline?.find(e => e.year === selectedTimelineYear) 
    || data?.historical_winner_timeline?.[data.historical_winner_timeline.length - 1];

  const tri = data?.tri_election_comparison;
  const vs22 = tri?.assembly_2022;
  const vs17 = tri?.assembly_2017;
  const ls24 = tri?.lok_sabha_segment_2024;
  const split = data?.split_voting_analysis;
  const sir = data?.sir_electoral_roll;
  const demo = data?.demographics;
  const m27 = data?.mission_2027;
  const poll = data?.polling_stations_summary;

  const handlePin = () => {
    if (!data || !onPinAC) return;
    const item: ACComparisonItem = {
      ac_no: data.basic_info.ac_no,
      name: data.basic_info.name,
      district: data.basic_info.district,
      category: data.basic_info.category,
      parent_pc: data.basic_info.parent_pc,
      winner_2022: vs22?.winner || 'N/A',
      party_2022: vs22?.party || 'N/A',
      votes_2022: vs22?.votes || 0,
      margin_2022: vs22?.margin_votes || 0,
      margin_pct_2022: vs22?.margin_percentage || 0,
      turnout_2022: vs22?.turnout_percentage || 0,
      electors_2022: vs22?.total_electors || 0,
      winner_2017: vs17?.winner || 'N/A',
      party_2017: vs17?.party || 'N/A',
      votes_2017: vs17?.votes || 0,
      margin_2017: vs17?.margin_votes || 0,
      margin_pct_2017: vs17?.margin_percentage || 0,
      turnout_2017: vs17?.turnout_percentage || 0,
      lead_2024: ls24?.winner || 'N/A',
      party_2024: ls24?.party || 'N/A',
      votes_2024: ls24?.votes || 0,
      margin_2024: ls24?.margin_votes || 0,
      margin_pct_2024: ls24?.margin_percentage || 0,
      turnout_2024: ls24?.turnout_percentage || 0,
      sir_net_change: sir?.net_change || 0,
      sir_pct_change: sir?.percentage_change || 0,
      sir_impact_label: sir?.impact_category || 'Stable',
      sc_pct: demo?.sc_pct || 0,
      literacy_pct: demo?.overall_literacy_pct || 0,
      rural_pct: demo?.rural_pct || 0,
      battleground_category: m27?.category || 'Competitive / Swing-like',
      split_pattern: split?.pattern_category || 'Stable'
    };
    onPinAC(item);
  };

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-modal-backdrop bg-slate-950/70 backdrop-blur-xs transition-opacity print:hidden" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-modal-container overflow-y-auto flex justify-center items-start p-2 sm:p-4 md:p-6 print:p-0 print:static print:bg-transparent pointer-events-none">
        <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden my-4 sm:my-8 transition-all animate-in fade-in duration-200 pointer-events-auto">
          
          {/* Top Modal Navigation Bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                AC #{acNo}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Official ECI Data Warehouse • Vidhan Sabha Intelligence
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {data && (
                <>
                  <InlineAskElectra
                    prompt={`Provide an intelligence briefing on AC #${acNo} ${data.basic_info.name} (${data.basic_info.district}). What changed between 2022 and 2024?`}
                    context={{ ac_no: acNo, ac_name: data.basic_info.name, district: data.basic_info.district }}
                    label={isHi ? "✨ आस्क इलेक्ट्रा" : "✨ Ask Electra"}
                  />

                  <button
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
                    title={isHi ? "सभी बूथों का वॉर डॉसियर (Excel/CSV) डाउनलोड करें" : "Download War Dossier (Excel/CSV)"}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isHi ? 'डाउनलोड हो रहा है...' : 'Downloading...'}</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{isHi ? '📥 एक्सपोर्ट Excel' : '📥 Export Excel'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isHi ? 'शेयर कार्ड' : 'Share Card'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    title={isHi ? "प्रिंट / PDF डॉसियर" : "Print / PDF Dossier"}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isHi ? 'प्रिंट डॉसियर (PDF)' : 'Print Dossier (PDF)'}</span>
                  </button>

                  {onPinAC && (
                    <button
                      onClick={handlePin}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isPinned 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' 
                          : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isPinned ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isPinned ? 'Pinned' : 'Pin to Compare'}</span>
                    </button>
                  )}
                </>
              )}

              <button 
                onClick={onClose}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs active:scale-95 mr-1"
                aria-label="Back"
                title={isHi ? 'पीछे जाएं' : 'Go back'}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">{isHi ? 'वापस (Back)' : 'Back'}</span>
              </button>

              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Close modal"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Loading Verified ECI Intelligence...
              </p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
              >
                Dismiss
              </button>
            </div>
          ) : data ? (
            <div className="p-6 sm:p-8 space-y-10">
              
              {/* ================= 1. HERO SECTION ================= */}
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        AC #{data.basic_info.ac_no}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                        {data.basic_info.category} Category
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium ml-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> ECI Certified
                      </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {data.basic_info.name}
                    </h1>

                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{data.basic_info.district} District</span>
                      <span>•</span>
                      <span>Parent PC:</span>
                      <button
                        onClick={() => onSelectPC && onSelectPC(data.basic_info.parent_pc.pc_no)}
                        className="font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 underline decoration-slate-300 underline-offset-2"
                      >
                        {data.basic_info.parent_pc.pc_name} (#{data.basic_info.parent_pc.pc_no})
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5 text-xs text-slate-500 font-mono">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Mission 2027 Classification</span>
                    <span className="px-2.5 py-1 rounded bg-slate-900 dark:bg-slate-800 text-white font-semibold uppercase tracking-wider text-[11px]">
                      {m27?.category || 'Competitive / Swing-like'}
                    </span>
                    <span className="text-[10px] text-slate-400 max-w-xs text-right">
                      {m27?.reason_metric}
                    </span>
                  </div>
                </div>
              </div>

              {/* ================= 2. CONSTITUENCY STORY ================= */}
              {data.constituency_story && (
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Constituency Story
                        </h2>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed pt-1">
                        {data.constituency_story.summary}
                      </p>
                    </div>
                    {data.constituency_story.evidence_payload?.length > 0 && (
                      <button
                        onClick={() => setShowStoryEvidence(!showStoryEvidence)}
                        className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                      >
                        {showStoryEvidence ? 'Hide Evidence' : 'View Evidence'}
                        {showStoryEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {showStoryEvidence && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        Verified Evidence Payload
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {data.constituency_story.evidence_payload.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                              {item.cycle} • {item.metric}
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                              {item.value}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 italic">
                              Source: {item.verified_source}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= 3. TRI-ELECTION CROSS-COMPARISON CARDS ================= */}
              {tri && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Tri-Election Cross-Tier Comparison
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Certified returns across 2017 Assembly, 2022 Assembly, and 2024 Parliamentary Assembly Segment.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Zero Tier Conflation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 2017 Assembly Result */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase">
                            Assembly Result — 2017
                          </span>
                          <div className="text-xs text-slate-400 mt-1">Vidhan Sabha Election</div>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${getPartyColor(vs17?.party)}15`, color: getPartyColor(vs17?.party) }}>
                          {vs17?.party}
                        </span>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Elected MLA</div>
                        <div className="font-bold text-slate-900 dark:text-white text-base truncate">{vs17?.winner}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">
                          {vs17?.votes?.toLocaleString()} votes ({vs17?.vote_share}%)
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Margin</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">+{vs17?.margin_votes?.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">({vs17?.margin_percentage}%)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Turnout</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{vs17?.turnout_percentage}%</span>
                          <span className="text-[10px] text-slate-400 block">{vs17?.valid_votes?.toLocaleString()} polled</span>
                        </div>
                      </div>

                      <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 truncate">
                        Runner-up: {vs17?.runner_up} ({vs17?.runner_up_party})
                      </div>
                    </div>

                    {/* 2022 Assembly Result */}
                    <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 uppercase">
                            Assembly Result — 2022
                          </span>
                          <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">Latest General Assembly</div>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${getPartyColor(vs22?.party)}20`, color: getPartyColor(vs22?.party) }}>
                          {vs22?.party}
                        </span>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Current MLA</div>
                        <div className="font-bold text-slate-900 dark:text-white text-base truncate">{vs22?.winner}</div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                          {vs22?.votes?.toLocaleString()} votes ({vs22?.vote_share}%)
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/40 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Margin</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">+{vs22?.margin_votes?.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">({vs22?.margin_percentage}%)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Turnout</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{vs22?.turnout_percentage}%</span>
                          <span className="text-[10px] text-slate-400 block">{vs22?.valid_votes?.toLocaleString()} polled</span>
                        </div>
                      </div>

                      <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 border-t border-emerald-100 dark:border-emerald-900/40 pt-2 truncate">
                        Runner-up: {vs22?.runner_up} ({vs22?.runner_up_party})
                      </div>
                    </div>

                    {/* 2024 Lok Sabha Segment Result */}
                    <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 uppercase">
                            Lok Sabha Segment Result — 2024
                          </span>
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">Parliamentary Lead (Form 20)</div>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${getPartyColor(ls24?.party)}20`, color: getPartyColor(ls24?.party) }}>
                          {ls24?.party}
                        </span>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Segment Lead Candidate</div>
                        <div className="font-bold text-slate-900 dark:text-white text-base truncate">{ls24?.winner}</div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                          {ls24?.votes?.toLocaleString()} votes ({ls24?.vote_share}%)
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/40 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Segment Lead</span>
                          <span className="font-bold text-indigo-700 dark:text-indigo-400">+{ls24?.margin_votes?.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">({ls24?.margin_percentage}%)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Segment Polled</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{ls24?.turnout_percentage}%</span>
                          <span className="text-[10px] text-slate-400 block">{ls24?.valid_votes?.toLocaleString()} votes</span>
                        </div>
                      </div>

                      <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 border-t border-indigo-100 dark:border-indigo-900/40 pt-2 truncate">
                        Runner-up: {ls24?.runner_up} ({ls24?.runner_up_party})
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= 4. HOW VOTING CHANGED & SPLIT-VOTING MODULE ================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* How Voting Changed Across Elections */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div>
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      How Voting Changed Across Elections
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sequential changes from 2017 Assembly to 2022 Assembly to 2024 Lok Sabha segment.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">2017 VS → 2022 VS</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Δ Margin: {(data.voting_change_flow?.flow_2017_to_2022.margin_change_votes || 0) > 0 ? '+' : ''}{data.voting_change_flow?.flow_2017_to_2022.margin_change_votes?.toLocaleString()} votes
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {data.voting_change_flow?.flow_2017_to_2022.observed_voting_difference}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">2022 VS → 2024 LS Segment</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Δ Margin: {(data.voting_change_flow?.flow_2022_to_2024.margin_change_votes || 0) > 0 ? '+' : ''}{data.voting_change_flow?.flow_2022_to_2024.margin_change_votes?.toLocaleString()} votes
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {data.voting_change_flow?.flow_2022_to_2024.observed_voting_difference}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Split-Voting / Result-Level Change */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div>
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Assembly vs Lok Sabha Voting Pattern
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Comparing 2022 Assembly result against 2024 Parliamentary segment lead.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Result-Level Classification:</span>
                      <span className="px-2.5 py-1 rounded bg-slate-900 dark:bg-slate-700 text-white font-mono text-xs font-bold">
                        {split?.pattern_category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div>
                        <div className="text-[10px] text-slate-400">2022 MLA Party</div>
                        <div className="font-bold text-slate-900 dark:text-white font-mono">{split?.assembly_2022_winner_party}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">2024 Segment Lead</div>
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{split?.lok_sabha_2024_lead_party}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {split?.result_level_statement}
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= 5. SIR & ELECTORAL ROLL CHANGE MODULE ================= */}
              {sir && (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          SIR & Electoral Roll Change (Special Summary Revision)
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Official registered electorate progression between 2017 Assembly and 2022 Assembly elections.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold font-mono border ${
                        sir.verification_status === 'Verified' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                        Status: {sir.verification_status || 'Not verified'}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold font-mono">
                        Impact: {sir.impact_category}
                      </span>
                    </div>
                  </div>

                  {/* Flow visualization */}
                  {sir.data_status === 'Verified' && sir.reported_additions !== null && sir.reported_deletions !== null ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">2017 Electors</div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                          {sir.previous_electors?.toLocaleString() ?? 'Unavailable'}
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800">
                        <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase">Reported Additions</div>
                        <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                          +{sir.reported_additions.toLocaleString()}
                        </div>
                      </div>

                      <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/60 dark:border-rose-800">
                        <div className="text-[10px] font-mono text-rose-700 dark:text-rose-400 uppercase">Reported Deletions</div>
                        <div className="text-sm font-bold font-mono text-rose-700 dark:text-rose-400 mt-1">
                          -{sir.reported_deletions.toLocaleString()}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">2022 Electors</div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                          {sir.current_electors?.toLocaleString() ?? 'Unavailable'}
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800">
                        <div className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 uppercase">Net Growth %</div>
                        <div className="text-sm font-bold font-mono text-indigo-700 dark:text-indigo-400 mt-1">
                          {sir.percentage_change !== null ? `${sir.percentage_change > 0 ? '+' : ''}${sir.percentage_change}%` : 'Not calculable'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">2017 Electors</div>
                          <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                            {sir.previous_electors?.toLocaleString() ?? 'Unavailable'}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">2022 Electors</div>
                          <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                            {sir.current_electors?.toLocaleString() ?? 'Unavailable'}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Net Change</div>
                          <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                            {sir.net_change !== null ? `${sir.net_change > 0 ? '+' : ''}${sir.net_change.toLocaleString()}` : 'Unavailable'}
                          </div>
                        </div>

                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800">
                          <div className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 uppercase">Electorate Change %</div>
                          <div className="text-sm font-bold font-mono text-indigo-700 dark:text-indigo-400 mt-1">
                            {sir.percentage_change !== null ? `${sir.percentage_change > 0 ? '+' : ''}${sir.percentage_change}%` : 'Not calculable'}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>Verified SIR data unavailable for this constituency.</strong>
                          <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                            Official assembly-level Form 6 additions and Form 7 deletions have not been published by CEO UP for this seat.
                            Missing data is preserved as unavailable (null) and not converted to 0.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advisory and Provenance */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-2 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>Neutral Interpretation: </strong>{sir.official_advisory}
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
                      <span>Source: {sir.source}</span>
                      <span>Level: {sir.geographic_level || 'Assembly Constituency'}</span>
                      {sir.source_date && <span>Published: {sir.source_date}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= 6. HISTORICAL WINNER TIMELINE (1991–2022) ================= */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Historical Winner Timeline (1991–2022)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click any general election cycle to examine certified results, runner-up margins, and boundary comparability.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {data.historical_winner_timeline?.length || 0} Cycles Documented
                  </span>
                </div>

                {/* Horizontal Scrollable Timeline Bar */}
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-center gap-2 min-w-max">
                    {data.historical_winner_timeline?.map((item) => {
                      const isSelected = item.year === selectedTimelineYear;
                      const pColor = getPartyColor(item.winner_party);
                      return (
                        <button
                          key={item.year}
                          onClick={() => setSelectedTimelineYear(item.year)}
                          className={`flex flex-col items-center p-2.5 rounded-xl border transition-all text-center min-w-[90px] ${
                            isSelected 
                              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-white shadow-md' 
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <span className={`text-xs font-mono font-bold ${isSelected ? 'text-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.year}
                          </span>
                          <span 
                            className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                            style={{
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${pColor}20`,
                              color: isSelected ? (document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff') : pColor
                            }}
                          >
                            {item.winner_party}
                          </span>
                          <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-slate-200 dark:text-slate-700' : 'text-slate-400'}`}>
                            +{item.margin_pct}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Timeline Card */}
                {timelineElection && (
                  <div className="mt-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 gap-2">
                      <div>
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {timelineElection.year} General Vidhan Sabha Election
                        </span>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Constitutional Designation: {timelineElection.chamber} • Era: {timelineElection.delimitation_era} • Historical AC #{timelineElection.historical_ac_number || timelineElection.historical_ac_no}
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getPartyBadgeClass(timelineElection.winner_party)}`}>
                        Winner: {timelineElection.winner_party}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Elected MLA</div>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">{timelineElection.winner}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{timelineElection.winner_votes?.toLocaleString()} votes</div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Runner-Up Candidate</div>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">{timelineElection.runner_up}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{timelineElection.runner_up_party} ({timelineElection.runner_up_votes?.toLocaleString()} votes)</div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Winning Margin</div>
                        <div className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">+{timelineElection.margin?.toLocaleString()} votes</div>
                        <div className="font-mono text-slate-500 text-[11px]">({timelineElection.margin_pct}% of valid votes)</div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Voter Turnout</div>
                        <div className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">{timelineElection.turnout_pct}%</div>
                        <div className="font-mono text-slate-500 text-[11px]">{timelineElection.valid_votes?.toLocaleString()} valid polled</div>
                      </div>
                    </div>

                    {/* Historical Boundary Notice per election cycle */}
                    {timelineElection.boundary_notice && timelineElection.delimitation_era !== '2008_CURRENT' && (
                      <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span><strong>Historical Boundary Note: </strong>{timelineElection.boundary_notice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ================= 7. DELIMITATION LINEAGE & BOUNDARY IDENTITY ================= */}
              {data.constituency_identity && (
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Delimitation Identity & Predecessor Seats
                    </h3>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Under the 2008 Delimitation Order, this constituency is designated as <strong>AC #{data.constituency_identity.current_ac_no} {data.constituency_identity.current_ac_name}</strong>.
                    Historical comparisons should note predecessor seat configurations:
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {data.constituency_identity.historical_numberings.map((h, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                        <span className="text-slate-500">{h.era}:</span>
                        <strong className="text-slate-900 dark:text-slate-200">AC #{h.ac_no} {h.name}</strong>
                      </span>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                    <strong>Boundary Comparability Advisory: </strong>
                    {data.constituency_identity.boundary_comparability_notice}
                  </div>
                </div>
              )}

              {/* ================= 8. DEMOGRAPHICS & EDUCATION BENCHMARKS ================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {demo && (
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Social & Demographic Context (Census 2011)
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {demo.geographic_level}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">SC Population</span>
                        <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">{demo.sc_pct}%</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">ST Population</span>
                        <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">{demo.st_pct}%</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Overall Literacy</span>
                        <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">{demo.overall_literacy_pct}%</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Sex Ratio</span>
                        <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">{demo.sex_ratio} / 1000</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Rural Share</span>
                        <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">{demo.rural_pct}%</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Urban Share</span>
                        <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">{demo.urban_pct}%</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 italic">
                      Verified constituency-level caste composition is not officially published. Data reflects district aggregate benchmarks.
                    </div>
                  </div>
                )}

                {/* Candidate Affidavits Provenance */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Candidate Profiles & Sworn Affidavits
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ECI Form 26 & ADR public affidavits for recent election leaders.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {data.candidate_profiles_detailed?.slice(0, 3).map((c, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{c.candidate_name}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-700 font-semibold">
                            {c.party} ({c.election_year})
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono mt-1">
                          <div>Edu: <span className="font-bold text-slate-800 dark:text-slate-100">{c.declared_education}</span></div>
                          <div>Assets: <span className="font-bold text-slate-800 dark:text-slate-100">{c.declared_assets}</span></div>
                          <div>Cases: <span className="font-bold text-slate-800 dark:text-slate-100">{c.declared_criminal_cases}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================= 9. POLLING STATIONS & BOOTH INFRASTRUCTURE ================= */}
              {poll && (
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Vote className="w-3.5 h-3.5 text-indigo-600" />
                        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Polling Station & Booth Infrastructure
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Constituency-level booth distribution and elector capacity standards.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                      ECI Form 20 Structure
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Polling Booths</span>
                      <span className="font-bold text-base font-mono text-slate-900 dark:text-white mt-0.5 block">
                        {poll.total_polling_stations?.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Avg Electors / Booth</span>
                      <span className="font-bold text-base font-mono text-slate-900 dark:text-white mt-0.5 block">
                        {poll.average_electors_per_station?.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Rural Booths</span>
                      <span className="font-bold text-base font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {poll.rural_polling_stations?.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Urban Booths</span>
                      <span className="font-bold text-base font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                        {poll.urban_polling_stations?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1 leading-relaxed">
                    <div><strong>ECI Norm: </strong>{poll.elector_capacity_standard}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{poll.turnout_distribution_notes}</div>
                  </div>

                  {/* Form 20 Booth-Level Explorer Toggle Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setShowBoothExplorer(!showBoothExplorer)}
                      className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>
                          {showBoothExplorer ? 'Hide Booth-Level Explorer' : `Explore Form 20 Polling Stations & Booth Results (${poll.total_polling_stations} Booths)`}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono">
                        {showBoothExplorer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                  </div>

                  {/* Expanded Form 20 Table */}
                  {showBoothExplorer && (
                    <div className="pt-2 space-y-4 font-sans">
                      {/* 1. Election Cycle Switcher & Verification-First Pipeline Strip */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1 shrink-0">
                            Election Cycle:
                          </span>
                          {[
                            { yr: 2024, label: '2024 Lok Sabha (Segment)' },
                            { yr: 2022, label: '2022 Vidhan Sabha' },
                            { yr: 2019, label: '2019 Lok Sabha (Segment)' },
                            { yr: 2017, label: '2017 Vidhan Sabha' },
                          ].map(({ yr, label }) => (
                            <button
                              key={yr}
                              onClick={() => { setBoothYear(yr); setBoothPage(1); }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                                boothYear === yr
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* Verification-First Data Coverage Pill */}
                        <div className="flex items-center gap-1.5 text-xs font-mono shrink-0">
                          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Data coverage: <strong className="text-emerald-600 dark:text-emerald-400">4/4 cycles</strong></span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span>Quality: <strong className="text-emerald-600 dark:text-emerald-400">Verified</strong></span>
                          </span>
                          <button
                            onClick={() => setShowProvenanceDrawer(true)}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium ml-0.5"
                          >
                            [View Evidence]
                          </button>
                        </div>
                      </div>

                      {/* 2. Constituency Tally & Margin Closeness Scorecard */}
                      {boothData?.summary && (() => {
                        const summary = boothData.summary;
                        return (
                          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-800/40 space-y-3 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-indigo-100/60 dark:border-slate-800">
                              <div>
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{boothYear} Polling Station Returns & Scorecard ({summary.total_polling_stations} Total Booths)</span>
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Kon party kitne booth se jeeta, kiska kitna lead tha, aur kahan kitna close mukabla tha.
                                </p>
                              </div>
                              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold shrink-0">
                                Avg Booth Turnout: {summary.avg_turnout_pct}%
                              </span>
                            </div>

                            {/* Stacked Proportional Bar */}
                            <div className="space-y-1">
                              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-inner">
                                {summary.party_tally.map((pt, idx) => (
                                  <div
                                    key={idx}
                                    style={{ width: `${pt.booths_won_pct}%`, backgroundColor: pt.color || '#64748b' }}
                                    title={`${pt.party} (${pt.candidate_name}): ${pt.booths_won} booths (${pt.booths_won_pct}%)`}
                                    className="h-full transition-all hover:opacity-90 cursor-pointer"
                                    onClick={() => { setBoothPartyFilter(pt.party); setBoothPage(1); }}
                                  />
                                ))}
                              </div>
                              <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                                <span>0%</span>
                                <span>Constituency Booth Share (Click bar to filter party)</span>
                                <span>100%</span>
                              </div>
                            </div>

                            {/* Party Tally Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              {summary.party_tally.map((pt, idx) => {
                                const isFilterActive = boothPartyFilter.toUpperCase() === pt.party.toUpperCase();
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setBoothPartyFilter(isFilterActive ? 'ALL' : pt.party);
                                      setBoothPage(1);
                                    }}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                                      isFilterActive 
                                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-md ring-2 ring-indigo-500/20'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start mb-1.5">
                                      <span 
                                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                                        style={{ backgroundColor: pt.color || '#64748b' }}
                                      >
                                        {pt.party}
                                      </span>
                                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 font-tabular-nums">
                                        {pt.booths_won_pct}% of booths
                                      </span>
                                    </div>

                                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                      {pt.candidate_name}
                                    </div>

                                    <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2 font-tabular-nums">
                                      <div>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Booths Won</span>
                                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                                          {pt.booths_won}
                                        </span>
                                        <span className="text-[10px] text-slate-400 ml-1">/ {summary.total_polling_stations}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Max Lead</span>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                                          +{pt.highest_margin.toLocaleString()} votes
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-mono truncate max-w-[110px] block" title={pt.highest_margin_station_name}>
                                          Booth #{pt.highest_margin_booth}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 2.5 Mission 2027 War Room Quick Action Bar */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Mission 2027 वॉर-रूम क्विक फिल्टर्स
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {strategyClassification && (
                              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 hidden sm:inline-block">
                                {strategyClassification.counts.FLIPPED_TO_SP} Flipped | {strategyClassification.counts.PDA_FORTRESS} PDA गढ़ | {strategyClassification.counts.BATTLEGROUND} मुकाबला
                              </span>
                            )}
                            {acNo && (
                              <div className="flex items-center gap-1.5">
                                {permissions.can_import && (
                                  <button
                                    onClick={openAuthModal}
                                    className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                                    title="Excel / XLSX / CSV से कार्यकर्ता सूची अपलोड करें"
                                  >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>📤 इम्पोर्ट सूची (Excel)</span>
                                  </button>
                                )}
                                 <button
                                  onClick={handleExportCSV}
                                  disabled={isExporting}
                                  className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                  title="Download Excel/CSV War Dossier with all booth targets and BLA contacts"
                                >
                                  {isExporting ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>{isHi ? 'डाउनलोड हो रहा है...' : 'Downloading...'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <FileSpreadsheet className="w-3.5 h-3.5" />
                                      <span>{isHi ? '📥 एक्सपोर्ट बैटल-प्लान (Excel)' : '📥 Export Battle-Plan (Excel)'}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              setActiveStrategyFilter('ALL');
                              setBoothPartyFilter('ALL');
                              setBoothLeadStatus('ALL');
                              setTransitionFilter('ALL');
                              setBoothPage(1);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              activeStrategyFilter === 'ALL'
                                ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            सभी बूथ ({strategyClassification?.counts.ALL || boothData?.total_stations || poll?.total_polling_stations || 350})
                          </button>

                          <button
                            onClick={() => {
                              setActiveStrategyFilter('FLIPPED_TO_SP');
                              setBoothPartyFilter('SP');
                              setTransitionFilter('WINNER_CHANGED');
                              setBoothLeadStatus('ALL');
                              setBoothPage(1);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                              activeStrategyFilter === 'FLIPPED_TO_SP'
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/30'
                            }`}
                          >
                            <span>🔄 Flipped to SP</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-teal-900/60 rounded font-mono">
                              {strategyClassification?.counts.FLIPPED_TO_SP ?? '40+'}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveStrategyFilter('PDA_FORTRESS');
                              setBoothPartyFilter('SP');
                              setBoothLeadStatus('STRONG_LEAD');
                              setTransitionFilter('ALL');
                              setBoothPage(1);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                              activeStrategyFilter === 'PDA_FORTRESS'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                            }`}
                          >
                            <span>🛡️ PDA गढ़ (A+)</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-900/60 rounded font-mono">
                              {strategyClassification?.counts.PDA_FORTRESS ?? '80+'}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveStrategyFilter('BATTLEGROUND');
                              setBoothPartyFilter('ALL');
                              setBoothLeadStatus('CLOSE_CONTEST');
                              setMarginThreshold(50);
                              setTransitionFilter('ALL');
                              setBoothPage(1);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                              activeStrategyFilter === 'BATTLEGROUND'
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30'
                            }`}
                          >
                            <span>⚔️ निर्णायक मुकाबला (&lt;50)</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-orange-900/60 rounded font-mono">
                              {strategyClassification?.counts.BATTLEGROUND ?? '30+'}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveStrategyFilter('DELETION_RISK');
                              setBoothPartyFilter('ALL');
                              setBoothLeadStatus('ALL');
                              setTransitionFilter('ALL');
                              setBoothSearch('Alert');
                              setBoothPage(1);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                              activeStrategyFilter === 'DELETION_RISK'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
                            }`}
                          >
                            <span>⚠️ वोटर लिस्ट अलर्ट</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-rose-900/60 rounded font-mono">
                              {strategyClassification?.counts.DELETION_RISK ?? '15+'}
                            </span>
                          </button>
                        </div>

                        {/* HQ Central War Room Ground Progress Bar */}
                        {hqTracker && (
                          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1.5 mt-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                लखनऊ मुख्यालय लाइव मॉनिटरिंग: <b className="text-white">{hqTracker.verified_booths} / {hqTracker.total_booths} बूथ सत्यापित ({hqTracker.verification_pct}%)</b>
                              </span>
                              <span className="text-emerald-400 font-mono text-[10px]">
                                {hqTracker.total_form6_submitted.toLocaleString()} Form-6 जमा • {hqTracker.chaupals_completed} चौपाल संपन्न
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                style={{ width: `${hqTracker.verification_pct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Search Bar & Objective Filter Toolbar */}
                      <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                        {/* Search Input & Party Filter */}
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <div className="relative flex-1 w-full">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                              type="text"
                              value={boothSearch}
                              onChange={(e) => {
                                setBoothSearch(e.target.value);
                                setBoothPage(1);
                              }}
                              placeholder="Search village (e.g. Padaraha), school, neta, or Part #..."
                              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {boothSearch && (
                              <button
                                onClick={() => { setBoothSearch(''); setBoothPage(1); }}
                                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Party Filter Pills */}
                          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                            {['ALL', 'SP', 'BJP', 'BSP', 'INC', 'SBSP', 'NINSHAD'].map(p => (
                              <button
                                key={p}
                                onClick={() => { setBoothPartyFilter(p); setBoothPage(1); }}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shrink-0 ${
                                  boothPartyFilter === p
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Objective Analytical Filters & Margin Threshold */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-1 overflow-x-auto text-xs">
                            <span className="text-[11px] font-semibold text-slate-500 mr-1 shrink-0">Status:</span>
                            {[
                              { id: 'ALL', label: 'All Booths' },
                              { id: 'CLOSE_CONTEST', label: `Close Contest (<${marginThreshold})` },
                              { id: 'NARROW_LEAD', label: `Narrow Lead (${marginThreshold}-99)` },
                              { id: 'STRONG_LEAD', label: 'Strong Lead (≥100)' },
                            ].map(f => (
                              <button
                                key={f.id}
                                onClick={() => { setBoothLeadStatus(f.id); setBoothPage(1); }}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all shrink-0 ${
                                  boothLeadStatus === f.id
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 text-xs shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400 font-mono">Margin Band:</span>
                              <select
                                value={marginThreshold}
                                onChange={(e) => { setMarginThreshold(Number(e.target.value)); setBoothPage(1); }}
                                className="px-2 py-0.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                              >
                                <option value={25}>&lt; 25 votes</option>
                                <option value={50}>&lt; 50 votes</option>
                                <option value={100}>&lt; 100 votes</option>
                                <option value={500}>&lt; 500 votes</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400 font-mono">Transition:</span>
                              <select
                                value={transitionFilter}
                                onChange={(e) => { setTransitionFilter(e.target.value); setBoothPage(1); }}
                                className="px-2 py-0.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                              >
                                <option value="ALL">All Transitions</option>
                                <option value="STABLE">Stable Winner</option>
                                <option value="WINNER_CHANGED">Winner Changed</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Search feedback banner */}
                        {boothSearch && boothData && (
                          <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-200/70 dark:border-indigo-800/70 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>
                                Relevance Match: <b>{boothData.total_stations} booths</b> matched for <i>"{boothSearch}"</i>
                              </span>
                            </div>
                            <button
                              onClick={() => { setBoothSearch(''); setBoothPage(1); }}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono ml-2 shrink-0"
                            >
                              Clear search
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 4. High-Density Polling Stations Table (Tabular Numerals) */}
                      {boothLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                          <span className="text-xs">Loading Form 20 Polling Stations for {boothYear}...</span>
                        </div>
                      ) : boothData && boothData.items && boothData.items.length > 0 ? (
                        <div className="space-y-2">
                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-mono text-[10px] uppercase">
                                  <th className="p-2.5 w-14 text-center">Part #</th>
                                  <th className="p-2.5">Polling Station & Location</th>
                                  <th className="p-2.5 text-right">Electors</th>
                                  <th className="p-2.5 text-right">Polled</th>
                                  <th className="p-2.5 text-right">Turnout</th>
                                  <th className="p-2.5">Winner ({boothYear})</th>
                                  <th className="p-2.5 text-right">Margin</th>
                                  <th className="p-2.5 text-center">4-Cycle Trend</th>
                                  <th className="p-2.5 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-tabular-nums">
                                {boothData.items.map((b) => (
                                  <tr 
                                    key={b.id}
                                    onClick={() => handleOpenBoothDrawer(b.part_no)}
                                    className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                                    title="Click to open 4-cycle historical intelligence drawer"
                                  >
                                    <td className="p-2.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                                      #{b.part_no}
                                    </td>
                                    <td className="p-2.5">
                                      <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                        {b.station_name}
                                      </div>
                                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                        {b.address || 'Sant Kabir Nagar'}
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-right text-slate-600 dark:text-slate-400">
                                      {b.total_electors?.toLocaleString()}
                                    </td>
                                    <td className="p-2.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                                      {b.votes_polled?.toLocaleString()}
                                    </td>
                                    <td className="p-2.5 text-right">
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {b.turnout_pct}%
                                      </span>
                                    </td>
                                    <td className="p-2.5">
                                      <div className="flex items-center gap-1.5">
                                        <span 
                                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0 shadow-2xs"
                                          style={{ backgroundColor: b.lead_party_color || '#64748b' }}
                                        >
                                          {b.lead_party}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                          {b.lead_candidate}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                      +{b.margin?.toLocaleString()}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {/* 4-Cycle Mini Timeline Sparkline */}
                                      <div className="inline-flex items-center gap-1 font-mono text-[9px]">
                                        {b.timeline && b.timeline.map((t) => (
                                          <span 
                                            key={t.year}
                                            title={`${t.year} ${t.election_type}: ${t.winner_party} (+${t.margin})`}
                                            className="w-4 h-4 rounded flex items-center justify-center font-bold text-white text-[8px] shadow-2xs"
                                            style={{ backgroundColor: t.winner_color || '#64748b' }}
                                          >
                                            {t.winner_party.slice(0, 2)}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-center">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenBoothDrawer(b.part_no);
                                        }}
                                        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 text-[10px] flex items-center gap-1 mx-auto transition-colors"
                                      >
                                        <Layers className="w-3 h-3" />
                                        <span>4-Cycle Form 20</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination Controls */}
                          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 font-mono">
                            <div>
                              Showing {((boothPage - 1) * boothData.limit) + 1}–{Math.min(boothPage * boothData.limit, boothData.total_stations)} of {boothData.total_stations} polling booths
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setBoothPage(p => Math.max(1, p - 1))}
                                disabled={boothPage <= 1}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                Prev
                              </button>
                              <span className="px-2 font-bold text-slate-700 dark:text-slate-200">
                                {boothPage} / {boothData.total_pages}
                              </span>
                              <button
                                onClick={() => setBoothPage(p => Math.min(boothData.total_pages, p + 1))}
                                disabled={boothPage >= boothData.total_pages}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-xs text-slate-500">
                          No polling stations found matching the current filters.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ================= 10. ASK ELECTRA AI INTERACTIVE DRAWER ================= */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900 text-white border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm tracking-wide">Ask Electra AI about this seat</h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Ask questions grounded strictly in official ECI returns, Census demographics, and SSR roll changes with 6-part evidence citations.
                  </p>
                </div>
                <button
                  onClick={() => onAskAI && onAskAI(`Explain electoral history, voting changes, and demographic context for ${data.basic_info.name} (AC #${data.basic_info.ac_no})`)}
                  className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Launch Grounded AI Analysis
                </button>
              </div>

              {/* ================= 10. DATA PROVENANCE & METHODOLOGY ================= */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified ECI Official Data Warehouse • 1991–2024 Records</span>
                </div>
                <button
                  onClick={() => setShowProvenanceDrawer(!showProvenanceDrawer)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:underline flex items-center gap-1 font-mono"
                >
                  {showProvenanceDrawer ? 'Hide Provenance Details' : 'View Data Provenance Sources'}
                </button>
              </div>

              {showProvenanceDrawer && data.provenance_sources && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Institutional Data Sources & Methodology
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {data.provenance_sources.map((p, i) => (
                      <div key={i} className="py-2 flex justify-between items-center text-[11px]">
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">{p.dataset}: </strong>
                          <span className="text-slate-600 dark:text-slate-400">{p.source} ({p.geographic_level})</span>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Confidence: {p.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}

        </div>
      </div>

      {/* 2-Page Vector Print View (Active on window.print()) */}
      {data && <DossierPrintView data={data} />}

      {/* Shareable Seat Card Modal */}
      {data && (
        <ShareSeatCardModal 
          data={data} 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
        />
      )}

      {/* Dedicated 4-Cycle Booth Detail Drawer */}
      <ErrorBoundary fallbackTitle="Unable to load polling booth details" onReset={() => setSelectedDrawerBoothPartNo(null)}>
        <BoothDetailDrawer
          acNo={acNo}
          partNo={selectedDrawerBoothPartNo}
          isOpen={selectedDrawerBoothPartNo !== null}
          onClose={handleCloseBoothDrawer}
          acName={data?.basic_info?.name}
          district={data?.basic_info?.district}
        />
      </ErrorBoundary>
    </>,
    document.body
  );
};
