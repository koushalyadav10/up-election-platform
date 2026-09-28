import React, { useState } from 'react';
import { useElectra } from '../../context/ElectraContext';
import { 
  Bell, 
  X, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Layers, 
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import { createElectraSubscription } from '../../services/api';

export const NotificationCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, dismissNotification, openDigest } = useElectra();
  const [showSubModal, setShowSubModal] = useState(false);
  const [subTarget, setSubTarget] = useState('313');
  const [subName, setSubName] = useState('AC #313 Khalilabad');
  const [subSaved, setSubSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await createElectraSubscription({
      target_type: 'AC',
      target_id: subTarget,
      target_name: subName,
      alert_frequency: 'instant'
    });
    setSubSaved(true);
    setTimeout(() => {
      setSubSaved(false);
      setShowSubModal(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Electoral Intelligence Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => { onClose(); openDigest(); }}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Open Daily Brief</span>
          </button>
          <button
            onClick={() => setShowSubModal(!showSubModal)}
            className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 font-medium"
          >
            <Sliders className="w-3 h-3" />
            <span>Manage Subscriptions</span>
          </button>
        </div>

        {/* Subscription Modal Form */}
        {showSubModal && (
          <form onSubmit={handleSubscribe} className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-900 space-y-2 text-xs">
            <div className="font-bold text-indigo-900 dark:text-indigo-200">
              Subscribe to Constituency Alerts
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={subTarget}
                onChange={e => setSubTarget(e.target.value)}
                placeholder="AC No (e.g. 314)"
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
              <input
                type="text"
                value={subName}
                onChange={e => setSubName(e.target.value)}
                placeholder="Constituency Name"
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-colors"
            >
              {subSaved ? '✓ Saved Successfully' : 'Save Alert Subscription'}
            </button>
          </form>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No new notifications. All electoral datasets are up to date.
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id}
                className={`p-3 rounded-xl border transition-all space-y-1.5 ${
                  n.is_read 
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-80' 
                    : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {n.alert_type}
                  </span>
                  {n.cluster_count > 1 && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {n.cluster_count} sources reporting
                    </span>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 ml-auto"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                  {n.title}
                </h4>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.summary}
                </p>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                  <span>{n.source_name || 'Official Notification'}</span>
                  <span>{n.publication_date || n.created_at}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
