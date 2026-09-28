import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ElectraQueryResponse, 
  ElectraEvidencePackage, 
  ElectraNotificationItem, 
  askElectraIntelligence,
  fetchElectraNotifications,
  markElectraNotificationRead
} from '../services/api';

export interface ElectraContextState {
  activeDistrict: string | null;
  activeAC: number | null;
  activeACName: string | null;
  activePC: number | null;
  activePCName: string | null;
  activeBooth: number | null;
  activeYear: number | null;
  activeContextString: string;
  setContext: (ctx: Partial<{
    district: string | null;
    ac_no: number | null;
    ac_name: string | null;
    pc_no: number | null;
    pc_name: string | null;
    booth_no: number | null;
    year: number | null;
  }>) => void;
  clearContext: () => void;
  isPanelOpen: boolean;
  openElectra: (initialPrompt?: string, contextOverride?: Record<string, any>) => void;
  closeElectra: () => void;
  toggleElectra: () => void;
  activeEvidence: ElectraEvidencePackage | null;
  openEvidenceModal: (evidence: ElectraEvidencePackage) => void;
  closeEvidenceModal: () => void;
  isDigestOpen: boolean;
  openDigest: () => void;
  closeDigest: () => void;
  isObservabilityOpen: boolean;
  openObservability: () => void;
  closeObservability: () => void;
  notifications: ElectraNotificationItem[];
  unreadCount: number;
  refreshNotifications: () => void;
  dismissNotification: (id: number) => void;
}

const ElectraContext = createContext<ElectraContextState | undefined>(undefined);

export const ElectraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [activeAC, setActiveAC] = useState<number | null>(null);
  const [activeACName, setActiveACName] = useState<string | null>(null);
  const [activePC, setActivePC] = useState<number | null>(null);
  const [activePCName, setActivePCName] = useState<string | null>(null);
  const [activeBooth, setActiveBooth] = useState<number | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [activeEvidence, setActiveEvidence] = useState<ElectraEvidencePackage | null>(null);
  const [isDigestOpen, setIsDigestOpen] = useState<boolean>(false);
  const [isObservabilityOpen, setIsObservabilityOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<ElectraNotificationItem[]>([]);

  const loadNotifications = () => {
    fetchElectraNotifications()
      .then(res => setNotifications(res))
      .catch(() => null);
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const dismissNotification = (id: number) => {
    markElectraNotificationRead(id).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    });
  };

  const setContext = (ctx: Partial<{
    district: string | null;
    ac_no: number | null;
    ac_name: string | null;
    pc_no: number | null;
    pc_name: string | null;
    booth_no: number | null;
    year: number | null;
  }>) => {
    if (ctx.district !== undefined) setActiveDistrict(ctx.district);
    if (ctx.ac_no !== undefined) setActiveAC(ctx.ac_no);
    if (ctx.ac_name !== undefined) setActiveACName(ctx.ac_name);
    if (ctx.pc_no !== undefined) setActivePC(ctx.pc_no);
    if (ctx.pc_name !== undefined) setActivePCName(ctx.pc_name);
    if (ctx.booth_no !== undefined) setActiveBooth(ctx.booth_no);
    if (ctx.year !== undefined) setActiveYear(ctx.year);
  };

  const clearContext = () => {
    setActiveDistrict(null);
    setActiveAC(null);
    setActiveACName(null);
    setActivePC(null);
    setActivePCName(null);
    setActiveBooth(null);
    setActiveYear(null);
  };

  // Build active context string
  const parts = [];
  if (activeDistrict) parts.push(activeDistrict);
  if (activeAC) parts.push(activeACName ? `AC #${activeAC} ${activeACName}` : `AC #${activeAC}`);
  if (activeBooth) parts.push(`Booth #${activeBooth}`);
  if (activeYear) parts.push(`Year ${activeYear}`);
  const activeContextString = parts.length > 0 ? parts.join(' • ') : 'Statewide Uttar Pradesh (All 403 ACs / 80 PCs)';

  const openElectra = (initialPrompt?: string, contextOverride?: Record<string, any>) => {
    if (contextOverride) {
      setContext(contextOverride);
    }
    setIsPanelOpen(true);
  };

  return (
    <ElectraContext.Provider value={{
      activeDistrict,
      activeAC,
      activeACName,
      activePC,
      activePCName,
      activeBooth,
      activeYear,
      activeContextString,
      setContext,
      clearContext,
      isPanelOpen,
      openElectra,
      closeElectra: () => setIsPanelOpen(false),
      toggleElectra: () => setIsPanelOpen(prev => !prev),
      activeEvidence,
      openEvidenceModal: (evidence) => setActiveEvidence(evidence),
      closeEvidenceModal: () => setActiveEvidence(null),
      isDigestOpen,
      openDigest: () => setIsDigestOpen(true),
      closeDigest: () => setIsDigestOpen(false),
      isObservabilityOpen,
      openObservability: () => setIsObservabilityOpen(true),
      closeObservability: () => setIsObservabilityOpen(false),
      notifications,
      unreadCount,
      refreshNotifications: loadNotifications,
      dismissNotification
    }}>
      {children}
    </ElectraContext.Provider>
  );
};

export const useElectra = (): ElectraContextState => {
  const ctx = useContext(ElectraContext);
  if (!ctx) throw new Error('useElectra must be used within ElectraProvider');
  return ctx;
};
