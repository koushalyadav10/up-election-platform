import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Eye,
  Lock,
  KeyRound,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Sparkles,
  ArrowRight,
  Users,
  UserPlus,
  Crown,
  Pencil,
  Trash2,
  RefreshCw,
  Building2,
  Phone,
  BadgeCheck,
  ChevronRight,
  Server,
  Copy,
  Check,
  EyeOff
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AdminRoleModalProps {
  currentACNo?: number | null;
  onImportSuccess?: () => void;
}

interface RBACUser {
  user_id: string;
  name: string;
  mobile: string;
  role: 'admin' | 'editor';
  password?: string;
  district?: string;
  designation?: string;
  created_at: string;
  is_active: boolean;
}

// UP Districts list
const UP_DISTRICTS = [
  'Agra','Aligarh','Prayagraj','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya',
  'Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki','Bareilly',
  'Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli','Chitrakoot','Deoria',
  'Etah','Etawah','Farrukhabad','Fatehpur','Firozabad','Gautam Buddha Nagar',
  'Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur','Hapur','Hardoi','Hathras',
  'Jalaun','Jaunpur','Jhansi','Kannauj','Kanpur Dehat','Kanpur Nagar','Kasganj',
  'Kaushambi','Kushinagar','Lakhimpur Kheri','Lalitpur','Lucknow','Maharajganj',
  'Mahoba','Mainpuri','Mathura','Mau','Meerut','Mirzapur','Moradabad','Muzaffarnagar',
  'Pilibhit','Pratapgarh','Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar',
  'Shahjahanpur','Shamli','Shravasti','Siddharthnagar','Sitapur','Sonbhadra',
  'Sultanpur','Unnao','Varanasi'
];

export const AdminRoleModal: React.FC<AdminRoleModalProps> = ({ currentACNo = 314, onImportSuccess }) => {
  const { role, passcode, permissions, isAuthModalOpen, closeAuthModal, login, setViewerMode } = useAuth();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'login' | 'users' | 'create' | 'import'>('login');
  const [inputUserId, setInputUserId] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showAccountsList, setShowAccountsList] = useState(false);
  const [authStatus, setAuthStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Users list state
  const [users, setUsers] = useState<RBACUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'editor'>('all');
  const [showPasswords, setShowPasswords] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create user state
  const [newUser, setNewUser] = useState({
    name: '',
    mobile: '',
    district: UP_DISTRICTS[0],
    designation: 'Field Coordinator'
  });
  const [createStatus, setCreateStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [createdCredentials, setCreatedCredentials] = useState<{
    user_id: string;
    password?: string;
    name: string;
    mobile: string;
    district?: string;
    designation?: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Import states
  const [selectedAC, setSelectedAC] = useState<number>(currentACNo || 314);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const loadUsers = useCallback(async () => {
    if (!permissions.is_admin || !passcode) return;
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetch(`/api/strategy/assembly/auth/users?admin_key=${encodeURIComponent(passcode)}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setUsersError(data.detail || 'Failed to load users');
      }
    } catch (e) {
      setUsersError('Network error loading users');
    } finally {
      setUsersLoading(false);
    }
  }, [permissions.is_admin, passcode]);

  useEffect(() => {
    if (isAuthModalOpen && permissions.is_admin && activeTab === 'users') {
      loadUsers();
    }
  }, [isAuthModalOpen, permissions.is_admin, activeTab, loadUsers]);

  useEffect(() => {
    if (permissions.is_admin && isAuthModalOpen) {
      setActiveTab('users');
    } else if (!permissions.is_admin) {
      setActiveTab('login');
    }
  }, [permissions.is_admin, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = async (uid: string, pwd?: string) => {
    setInputUserId(uid);
    setInputPassword(pwd || '');
    setAuthStatus({ type: 'idle', message: '' });
    const res = await login(uid, pwd);
    if (res.success) {
      setAuthStatus({ type: 'success', message: `${res.role === 'admin' ? '👑 Super Admin' : '✍️ Editor'} (${uid}) प्रमाणीकरण सफल!` });
      if (res.role === 'admin') setActiveTab('users');
    } else {
      setAuthStatus({ type: 'error', message: res.message });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = inputUserId.trim();
    const pwd = inputPassword.trim();
    if (!uid && !pwd) return;

    setAuthStatus({ type: 'idle', message: '' });
    // If password provided, pass both; otherwise pass uid as single code
    const res = pwd ? await login(uid || pwd, pwd) : await login(uid);
    if (res.success) {
      setAuthStatus({ type: 'success', message: `${res.role === 'admin' ? '👑 Super Admin' : '✍️ Editor'} प्रमाणीकरण सफल!` });
      if (res.role === 'admin') setActiveTab('users');
    } else {
      setAuthStatus({ type: 'error', message: res.message });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.mobile) {
      setCreateStatus({ type: 'error', message: 'Name and mobile are required' });
      return;
    }
    setIsCreating(true);
    setCreateStatus({ type: 'idle', message: '' });

    // Generate user ID with 2027SP_ prefix
    const existingEditors = users.filter(u => u.role === 'editor').length;
    const newId = `2027SP_EDT${String(existingEditors + 1).padStart(2, '0')}`;

    try {
      const res = await fetch('/api/strategy/assembly/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_key: passcode,
          user_id: newId,
          name: newUser.name,
          mobile: newUser.mobile,
          role: 'editor',
          district: newUser.district,
          designation: newUser.designation
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCreatedCredentials({
          user_id: data.user.user_id,
          password: data.user.password,
          name: data.user.name,
          mobile: data.user.mobile,
          district: data.user.district,
          designation: data.user.designation
        });
        setCreateStatus({ type: 'success', message: `कार्यकर्ता खाता ${data.user.user_id} सफलतापूर्वक तैयार किया गया!` });
        setNewUser({ name: '', mobile: '', district: UP_DISTRICTS[0], designation: 'Field Coordinator' });
        loadUsers();
      } else {
        setCreateStatus({ type: 'error', message: data.detail || 'Failed to create user' });
      }
    } catch (e) {
      setCreateStatus({ type: 'error', message: 'Network error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm(`Deactivate user ${userId}?`)) return;
    try {
      const res = await fetch(`/api/strategy/assembly/auth/users/${userId}?admin_key=${encodeURIComponent(passcode)}`, {
        method: 'DELETE'
      });
      if (res.ok) loadUsers();
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async () => {
    if (!importFile) return;
    setIsUploading(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const res = await fetch(`/api/strategy/assembly/${selectedAC}/bulk-import-workers`, {
        method: 'POST',
        headers: { 'x-role-key': passcode },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({ success: true, message: data.message, total: data.total_rows_imported, updated: data.updated, created: data.created });
        onImportSuccess?.();
      } else {
        setImportResult({ success: false, message: data.detail || 'Upload failed' });
      }
    } catch (e) {
      setImportResult({ success: false, message: 'Network error during upload' });
    } finally {
      setIsUploading(false);
    }
  };

  const adminCount = users.filter(u => u.role === 'admin' && u.is_active).length;
  const editorCount = users.filter(u => u.role === 'editor' && u.is_active).length;
  const filteredUsers = userFilter === 'all' ? users : users.filter(u => u.role === userFilter);

  const tabs = [
    { id: 'login' as const, label: isHi ? 'लॉगिन' : 'Login', icon: KeyRound },
    ...(permissions.is_admin ? [
      { id: 'users' as const, label: isHi ? 'उपयोगकर्ता' : 'Users', icon: Users },
      { id: 'create' as const, label: isHi ? 'नया यूज़र' : 'New User', icon: UserPlus },
      { id: 'import' as const, label: isHi ? 'डेटा इम्पोर्ट' : 'Import', icon: FileSpreadsheet },
    ] : []),
    ...(permissions.can_edit && !permissions.is_admin ? [
      { id: 'import' as const, label: isHi ? 'डेटा इम्पोर्ट' : 'Import', icon: FileSpreadsheet },
    ] : []),
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeAuthModal} />

      {/* Panel */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/60 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {isHi ? 'RBAC एक्सेस कंट्रोल पैनल' : 'RBAC & Access Control Panel'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">UP Electoral Intelligence Platform • AWS Deployed</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {role !== 'viewer' && (
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border ${
                role === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>
                {role === 'admin' ? '👑 SUPER ADMIN' : '✍️ EDITOR'}
              </span>
            )}
            <button onClick={closeAuthModal} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row (admin only) */}
        {permissions.is_admin && users.length > 0 && (
          <div className="grid grid-cols-3 gap-3 px-5 py-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-lg font-black text-amber-300 leading-none">{adminCount}</div>
                <div className="text-[10px] text-slate-400 font-mono">Admins</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-black text-blue-300 leading-none">{editorCount}</div>
                <div className="text-[10px] text-slate-400 font-mono">Editors</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg font-black text-emerald-300 leading-none">{users.length}</div>
                <div className="text-[10px] text-slate-400 font-mono">Total Users</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-slate-800 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <div className="max-w-md mx-auto space-y-5">
              {role === 'viewer' ? (
                <>
                  <div className="text-center space-y-1.5 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center mx-auto shadow-md ring-1 ring-blue-400/30">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-bold text-base sm:text-lg">
                      {isHi ? 'RBAC अधिकृत लॉगिन' : 'RBAC Authorized Login'}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {isHi ? 'यूजर आईडी व पासवर्ड दर्ज करें, या नीचे 1-Click से त्वरित लॉगिन करें' : 'Enter User ID & Password, or click below for instant 1-Click login'}
                    </div>
                  </div>

                  {/* 1-Click Instant Test Access */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-700/80 space-y-2">
                    <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHi ? '⚡ 1-Click त्वरित टेस्ट लॉगिन:' : '⚡ 1-Click Quick Test Logins:'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('2027SP_ADM01', 'Sp@2027#A1LjGe')}
                        className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-200 text-xs font-bold transition-all text-left flex items-center gap-2 group cursor-pointer active:scale-95 shadow-sm"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="truncate">
                          <div className="leading-tight text-[11px] font-bold">Super Admin</div>
                          <div className="text-[9px] font-mono text-amber-300/80">2027SP_ADM01</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickLogin('2027SP_EDT01', 'Ed@2027#E01upnh')}
                        className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400 text-blue-200 text-xs font-bold transition-all text-left flex items-center gap-2 group cursor-pointer active:scale-95 shadow-sm"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Pencil className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="truncate">
                          <div className="leading-tight text-[11px] font-bold">Editor / कार्यकर्ता</div>
                          <div className="text-[9px] font-mono text-blue-300/80">2027SP_EDT01</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Standard Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'यूजर आईडी (User ID) या मास्टर पासकोड' : 'User ID or Master Passcode'}
                      </label>
                      <input
                        type="text"
                        value={inputUserId}
                        onChange={e => setInputUserId(e.target.value)}
                        placeholder="e.g. 2027SP_ADM01 या sp2027admin"
                        className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-600 text-white placeholder-slate-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
                        autoFocus
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          {isHi ? 'पासवर्ड (Password)' : 'Password'}
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isHi ? '(मास्टर पासकोड हेतु वैकल्पिक)' : '(Optional for Master Passcode)'}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={inputPassword}
                          onChange={e => setInputPassword(e.target.value)}
                          placeholder="e.g. Sp@2027#A1LjGe"
                          className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-600 text-white placeholder-slate-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!inputUserId.trim() && !inputPassword.trim()}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isHi ? 'प्रमाणित करें (Login)' : 'Authenticate & Login'}
                    </button>
                  </form>

                  {authStatus.type !== 'idle' && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-xs sm:text-sm border ${
                      authStatus.type === 'success'
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : 'bg-red-950/40 border-red-800/60 text-red-300'
                    }`}>
                      {authStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{authStatus.message}</span>
                    </div>
                  )}

                  {/* Credentials Directory Drawer */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setShowAccountsList(!showAccountsList)}
                      className="w-full py-1 text-center text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{showAccountsList ? (isHi ? 'खाता सूची छुपाएं' : 'Hide Accounts Directory') : (isHi ? '📋 10 Admin और 50 Editor खातों की सूची देखें' : '📋 View 10 Admin & 50 Editor Accounts Directory')}</span>
                    </button>

                    {showAccountsList && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
                        <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Super Admins (10):</div>
                        <div className="space-y-1.5">
                          {[
                            ['2027SP_ADM01', 'Sp@2027#A1LjGe', 'Rajesh Tiwari (Lucknow)'],
                            ['2027SP_ADM02', 'Sp@2027#A20ykG', 'Priya Sharma (Varanasi)'],
                            ['2027SP_ADM03', 'Sp@2027#A3jH7T', 'Anil Verma (Kanpur)'],
                            ['2027SP_ADM04', 'Sp@2027#A4nCpc', 'Dr. Sanjay Yadav (Agra)'],
                            ['2027SP_ADM05', 'Sp@2027#A5Y6xx', 'Kavita Maurya (Prayagraj)'],
                          ].map(([id, pw, label]) => (
                            <div key={id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                              <div>
                                <span className="text-white font-bold">{id}</span>
                                <span className="text-slate-400 text-[10px] ml-1.5">({label})</span>
                                <div className="text-amber-300 text-[10px]">{pw}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleQuickLogin(id, pw)}
                                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Login
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-700/60">
                          * Master Passcodes: <code className="text-white bg-slate-900 px-1 py-0.5 rounded">sp2027admin</code> (Super Admin) | <code className="text-white bg-slate-900 px-1 py-0.5 rounded">spworker</code> (Editor)
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className={`p-4 rounded-2xl border text-center space-y-2 ${
                    role === 'admin'
                      ? 'bg-amber-950/30 border-amber-700/40'
                      : 'bg-blue-950/30 border-blue-700/40'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
                      role === 'admin' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                    }`}>
                      {role === 'admin' ? <Crown className="w-6 h-6 text-amber-400" /> : <UserCheck className="w-6 h-6 text-blue-400" />}
                    </div>
                    <div className={`font-bold ${ role === 'admin' ? 'text-amber-300' : 'text-blue-300'}`}>
                      {role === 'admin' ? '👑 Super Admin Active' : '✍️ Editor Mode Active'}
                    </div>
                    <div className="text-xs text-slate-400">{isHi ? 'आप वर्तमान में प्रमाणित हैं' : 'You are currently authenticated'}</div>
                  </div>
                  <button
                    onClick={() => { setViewerMode(); setAuthStatus({ type: 'idle', message: '' }); }}
                    className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {isHi ? 'व्यूअर मोड में वापस जाएं' : 'Switch to Viewer Mode'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && permissions.is_admin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(['all', 'admin', 'editor'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setUserFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                        userFilter === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f === 'all'
                        ? `All (${users.length})`
                        : f === 'admin'
                          ? `Admins (${users.filter(u => u.role === 'admin').length})`
                          : `Editors (${users.filter(u => u.role === 'editor').length})`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      showPasswords
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title="Toggle password visibility"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPasswords ? 'Hide Keys' : 'Show Keys'}</span>
                  </button>
                  <button onClick={loadUsers} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {usersError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm">{usersError}</div>
              )}

              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(u => (
                    <div key={u.user_id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      !u.is_active ? 'opacity-50 bg-slate-800/20 border-slate-700/20' :
                      u.role === 'admin' ? 'bg-amber-950/20 border-amber-800/30 hover:border-amber-700/50' :
                      'bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60'
                    }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        u.role === 'admin' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                      }`}>
                        {u.role === 'admin'
                          ? <Crown className="w-4 h-4 text-amber-400" />
                          : <Pencil className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-white">{u.user_id}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-600/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-600/40'
                          }`}>{u.role}</span>
                          {!u.is_active && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-900/40 text-red-300 border border-red-800/40">INACTIVE</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 font-semibold truncate mt-0.5">{u.name}</div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {u.mobile ? u.mobile.replace(/(.{3})(.+)(.{2})/, '$1•••••$3') : '—'}
                          </span>
                          {u.district && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5" />{u.district}
                            </span>
                          )}
                          {u.designation && <span>{u.designation}</span>}
                        </div>
                        {u.password && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-mono text-slate-500">Passcode:</span>
                            <span className="text-[10px] font-mono font-bold text-amber-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                              {showPasswords ? u.password : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(u.password || '');
                                setCopiedId(u.user_id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                              title="Copy Passcode"
                            >
                              {copiedId === u.user_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                      {u.role !== 'admin' && u.is_active && (
                        <button
                          onClick={() => handleDeactivate(u.user_id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0"
                          title="Deactivate editor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">No users found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CREATE USER TAB */}
          {activeTab === 'create' && permissions.is_admin && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40">
                <div className="text-sm font-bold text-blue-300 mb-1 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> {isHi ? 'नया कार्यकर्ता / एडिटर बनाएं' : 'Create New Editor Account'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isHi ? 'यूज़र आईडी 2027SP_EDT## प्रारूप में बनेगी। एडमिन नए एडिटर्स को पंजीकृत कर पासवर्ड सौंप सकते हैं।' : 'User ID will be auto-generated in 2027SP_EDT## format with secure mixed password. One admin cannot delete another admin.'}
                </div>
              </div>

              {createdCredentials && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isHi ? 'खाता तैयार! क्रेडेंशियल साझा करें:' : 'Account Created! Credentials Ready:'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `*UP Electoral Intelligence Platform*\n• User ID: ${createdCredentials.user_id}\n• Password: ${createdCredentials.password}\n• Name: ${createdCredentials.name}\n• Designation: ${createdCredentials.designation || 'Field Coordinator'}\n• District: ${createdCredentials.district || 'Uttar Pradesh'}\n• Portal: http://15.207.14.41`;
                        navigator.clipboard.writeText(text);
                        setCopiedId('created_card');
                        setTimeout(() => setCopiedId(null), 2500);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                    >
                      {copiedId === 'created_card' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'created_card' ? (isHi ? 'कॉपी हुआ!' : 'Copied!') : (isHi ? 'WhatsApp कार्ड कॉपी' : 'Copy Card')}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div><span className="text-slate-500 block text-[10px]">User ID:</span><span className="text-white font-bold">{createdCredentials.user_id}</span></div>
                    <div><span className="text-slate-500 block text-[10px]">Password:</span><span className="text-amber-300 font-bold">{createdCredentials.password}</span></div>
                    <div><span className="text-slate-500 block text-[10px]">Name:</span><span className="text-slate-300 truncate block">{createdCredentials.name}</span></div>
                    <div><span className="text-slate-500 block text-[10px]">Mobile:</span><span className="text-slate-300">{createdCredentials.mobile}</span></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{isHi ? 'पूरा नाम *' : 'Full Name *'}</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                      placeholder={isHi ? 'नाम दर्ज करें' : 'Enter full name'}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{isHi ? 'मोबाइल नंबर *' : 'Mobile Number *'}</label>
                    <input
                      type="tel"
                      value={newUser.mobile}
                      onChange={e => setNewUser(p => ({ ...p, mobile: e.target.value }))}
                      placeholder={isHi ? '10-अंकीय मोबाइल' : '10-digit mobile'}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{isHi ? 'जिला' : 'District'}</label>
                    <select
                      value={newUser.district}
                      onChange={e => setNewUser(p => ({ ...p, district: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    >
                      {UP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{isHi ? 'पद / दायित्व' : 'Designation'}</label>
                    <select
                      value={newUser.designation}
                      onChange={e => setNewUser(p => ({ ...p, designation: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    >
                      {[
                        'Field Coordinator',
                        'Booth Analyst',
                        'District Supervisor',
                        'Data Entry Operator',
                        'Campaign Manager',
                        'Research Analyst'
                      ].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isCreating || !newUser.name || !newUser.mobile}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {isCreating ? (isHi ? 'खाता बनाया जा रहा है...' : 'Creating...') : (isHi ? 'एडिटर खाता बनाएं' : 'Create Editor Account')}
                </button>
              </form>
              {createStatus.type !== 'idle' && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
                  createStatus.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/40 border-red-800/60 text-red-300'
                }`}>
                  {createStatus.type === 'success'
                    ? <CheckCircle className="w-4 h-4 shrink-0" />
                    : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {createStatus.message}
                </div>
              )}
            </div>
          )}

          {/* IMPORT TAB */}
          {activeTab === 'import' && permissions.can_edit && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
                <div className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Bulk Import Booth Workers
                </div>
                <div className="text-[11px] text-slate-400">
                  Upload an Excel/CSV file with booth worker data for a specific AC.
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assembly Constituency No.</label>
                <input
                  type="number"
                  value={selectedAC}
                  onChange={e => setSelectedAC(Number(e.target.value))}
                  min={1}
                  max={403}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Upload File (Excel/CSV)</label>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={e => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-300 rounded-xl text-sm file:mr-3 file:px-3 file:py-1 file:rounded-lg file:bg-slate-700 file:text-slate-300 file:border-0 file:text-xs"
                />
              </div>
              <button
                onClick={handleFileUpload}
                disabled={isUploading || !importFile}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {isUploading ? 'Uploading...' : 'Upload & Import'}
              </button>
              {importResult && (
                <div className={`p-3 rounded-xl border text-sm ${
                  importResult.success
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/40 border-red-800/60 text-red-300'
                }`}>
                  <div className="font-semibold">{importResult.message}</div>
                  {importResult.success && (
                    <div className="text-xs mt-1">
                      Total: {importResult.total} | Created: {importResult.created} | Updated: {importResult.updated}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
