import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AdminRoleModalProps {
  currentACNo?: number | null;
  onImportSuccess?: () => void;
}

export const AdminRoleModal: React.FC<AdminRoleModalProps> = ({ currentACNo = 314, onImportSuccess }) => {
  const { role, passcode, permissions, isAuthModalOpen, closeAuthModal, login, setViewerMode } = useAuth();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'role' | 'import'>('role');
  const [inputPasscode, setInputPasscode] = useState('');
  const [authStatus, setAuthStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  // Import states
  const [selectedAC, setSelectedAC] = useState<number>(currentACNo || 314);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPasscode.trim()) return;

    const res = await login(inputPasscode);
    if (res.success) {
      setAuthStatus({
        type: 'success',
        message: isHi 
          ? `${res.role === 'admin' ? '👑 सुपर एडमिन' : '✍️ कार्यकर्ता प्रभारी'} मोड सक्रिय किया गया!` 
          : `${res.role === 'admin' ? 'Super Admin' : 'Editor'} mode activated!`
      });
      setInputPasscode('');
    } else {
      setAuthStatus({
        type: 'error',
        message: res.message
      });
    }
  };

  const handleSwitchToViewer = () => {
    setViewerMode();
    setAuthStatus({
      type: 'success',
      message: isHi ? '👁️ सुरक्षित दर्शक मोड (Read-Only) लागू किया गया।' : 'Switched to Read-Only Viewer Mode.'
    });
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
        headers: {
          'x-role-key': passcode
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setImportResult({
          success: true,
          message: data.message,
          total: data.total_rows_imported,
          updated: data.updated,
          created: data.created
        });
        if (onImportSuccess) onImportSuccess();
      } else {
        setImportResult({
          success: false,
          message: data.detail || 'इंपोर्ट में त्रुटि हुई'
        });
      }
    } catch (e: any) {
      setImportResult({
        success: false,
        message: e.message || 'सर्वर से संपर्क नहीं हो सका'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`/api/strategy/assembly/${selectedAC}/worker-template-excel`);
      if (!res.ok) throw new Error('Template download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `AC_${selectedAC}_Worker_Import_Template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.location.href = `/api/strategy/assembly/${selectedAC}/worker-template-excel`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              role === 'admin' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : role === 'editor' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {role === 'admin' ? <ShieldAlert className="w-5 h-5" /> : role === 'editor' ? <UserCheck className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {isHi ? 'प्रशासनिक नियंत्रण एवं भूमिका प्रबंधन' : 'RBAC & Access Control Panel'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 font-mono">
                  {isHi ? 'सक्रिय मोड:' : 'Active Role:'}
                </span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  role === 'admin' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : role === 'editor' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {role === 'admin' ? '👑 SUPER ADMIN' : role === 'editor' ? '✍️ EDITOR (कार्यकर्ता प्रभारी)' : '👁️ VIEWER (दर्शक)'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6">
          <button
            onClick={() => setActiveTab('role')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'role'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isHi ? 'मोड व पासकोड' : 'Role & Passcode'}</span>
          </button>

          {permissions.can_import && (
            <button
              onClick={() => setActiveTab('import')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'import'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isHi ? 'एक्सेल बल्क-इंपोर्ट (.xlsx)' : 'Bulk Excel Import'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {activeTab === 'role' && (
            <div className="space-y-5">
              {/* Role Permissions Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  {isHi ? 'वर्तमान अनुमतियाँ (Current Privileges)' : 'Current Privileges'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    permissions.can_edit ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{isHi ? 'वेबसाइट से डेटा एडिट' : 'Direct Web Edit'}</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    permissions.can_import ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{isHi ? 'Excel बल्क सिंक' : 'Bulk Excel Import'}</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    permissions.is_admin ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{isHi ? 'पूर्ण प्रशासनिक नियंत्रण' : 'Full Admin Control'}</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {authStatus.type !== 'idle' && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                  authStatus.type === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}>
                  {authStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{authStatus.message}</span>
                </div>
              )}

              {/* Passcode Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isHi ? 'एडमिन या एडिटर पासकोड दर्ज करें:' : 'Enter Admin or Editor Passcode:'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={inputPasscode}
                      onChange={e => setInputPasscode(e.target.value)}
                      placeholder={isHi ? 'पासकोड यहाँ लिखें (उदा. sp2027admin या spworker)' : 'Enter passcode...'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{isHi ? '🔓 एक्सेस अनलॉक करें' : 'Unlock Privileges'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {role !== 'viewer' && (
                    <button
                      type="button"
                      onClick={handleSwitchToViewer}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isHi ? 'दर्शक मोड में जाएं' : 'Switch to Viewer'}</span>
                    </button>
                  )}
                </div>
              </form>

              {/* Quick Info Credentials Box */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold">{isHi ? 'त्वरित डेमो पासकोड:' : 'Quick Demo Passcodes:'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>👑 Super Admin Key:</span>
                  <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">sp2027admin</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>✍️ Editor (प्रभारी) Key:</span>
                  <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300">spworker</code>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && permissions.can_import && (
            <div className="space-y-5">
              {/* Info Card */}
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/50 text-blue-300 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isHi ? 'स्मार्ट एक्सेल ऑटो-डिटेक्ट इंजन' : 'Smart Excel Auto-Detect Engine'}</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  {isHi 
                    ? 'अपनी एक्सेल/सीएसवी फाइल को सीधे अपलोड करें। सिस्टम स्वतः बूथ नंबर, अध्यक्ष का नाम, मोबाइल और BLA-2 का डेटा पहचान कर सुरक्षित कर लेगा।' 
                    : 'Upload any standard Excel or CSV file. The engine matches headers across English, Hindi and regional conventions.'}
                </p>
              </div>

              {/* Constituency Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isHi ? 'विधानसभा चुनें (AC Number):' : 'Assembly Constituency No:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={selectedAC}
                    onChange={e => setSelectedAC(Number(e.target.value))}
                    className="w-32 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isHi ? 'खाली एक्सेल टेम्पलेट डाउनलोड करें' : 'Download Blank Template'}</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/40 text-center space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto" />
                <div>
                  <div className="font-bold text-white text-xs">
                    {importFile ? importFile.name : (isHi ? 'एक्सेल फाइल चुनें (.xlsx, .xls, .csv)' : 'Select spreadsheet file (.xlsx, .xls, .csv)')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {isHi ? 'अधिकतम 5 MB • सभी 400+ बूथ एक बार में सिंक' : 'Max 5 MB • Instant sync across all booths'}
                  </div>
                </div>

                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e => e.target.files && setImportFile(e.target.files[0])}
                  className="text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700 cursor-pointer"
                />

                {importFile && (
                  <div className="pt-2">
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 mx-auto"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{isUploading ? (isHi ? 'सिंक हो रहा है...' : 'Syncing Data...') : (isHi ? 'डेटाबेस में सिंक करें (Bulk Sync)' : 'Upload & Sync Everywhere')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Result Summary */}
              {importResult && (
                <div className={`p-4 rounded-xl border space-y-1.5 ${
                  importResult.success 
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {importResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{importResult.message}</span>
                  </div>
                  {importResult.success && (
                    <div className="text-[11px] font-mono text-slate-300">
                      कुल रिकॉर्ड: <strong>{importResult.total}</strong> (अपडेटेड: {importResult.updated} • नए: {importResult.created})
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>{isHi ? 'सुरक्षित एन्क्रिप्टेड एक्सेस • ECI 2027' : 'Secure Encrypted Access • ECI 2027'}</span>
          <button
            onClick={closeAuthModal}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
