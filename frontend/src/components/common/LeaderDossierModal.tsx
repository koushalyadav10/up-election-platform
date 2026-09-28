import React, { useEffect, useState } from 'react';
import { PartySymbol } from './PartySymbol';
import { LeaderAvatar } from './LeaderAvatar';
import { 
  X, 
  Award, 
  Vote, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  GitCommit, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export interface LeaderDossierModalProps {
  candidateId?: number | null;
  candidateName?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ContestItem {
  year: number;
  election_type: string;
  election_name: string;
  seat_type: string;
  seat_no: number;
  seat_name: string;
  party_code: string;
  party_name: string;
  party_symbol: string;
  party_color: string;
  rank: number;
  is_winner: boolean;
  votes: number;
  general_votes: number;
  postal_votes: number;
  vote_pct: number;
  margin: number;
  turnout_pct: number;
  status_label: string;
  status_label_hi: string;
  opponent_name: string;
  opponent_party: string;
}

interface DossierData {
  candidate: {
    id: number;
    name: string;
    hindi_name: string;
    gender: string;
    age: number | null;
    category: string;
    current_role: string;
    current_role_hi: string;
    party: string;
    party_color: string;
    photo_url: string | null;
    bio_en: string;
    bio_hi: string;
  };
  career_stats: {
    total_contests: number;
    wins: number;
    losses: number;
    win_rate_pct: number;
    total_career_votes: number;
    has_switched_parties: boolean;
    party_loyalty_en: string;
    party_loyalty_hi: string;
    parties_contested: string[];
    first_year: number | null;
    latest_year: number | null;
  };
  contests: ContestItem[];
  party_timeline: Array<{
    code: string;
    name: string;
    color: string;
    symbol: string;
    first_year: number;
  }>;
}

export const LeaderDossierModal: React.FC<LeaderDossierModalProps> = ({
  candidateId,
  candidateName,
  isOpen,
  onClose
}) => {
  const [data, setData] = useState<DossierData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contests' | 'party_timeline' | 'bio'>('contests');

  useEffect(() => {
    if (!isOpen || (!candidateId && !candidateName)) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (candidateId) params.append('candidate_id', candidateId.toString());
    if (candidateName) params.append('name', candidateName);

    fetch(`/api/candidates/dossier?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}: Failed to load candidate dossier`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dossier:', err);
        setError('ECI historical record could not be loaded.');
        setLoading(false);
      });
  }, [isOpen, candidateId, candidateName]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              ECI NETAJI ELECTORAL DOSSIER
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">1991–2024 RECORD</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="बंद करें (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {loading && (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mb-3"></div>
              <div className="text-xs font-mono text-slate-500">ECI ऐतिहासिक चुनावी रिकॉर्ड लोड हो रहा है...</div>
            </div>
          )}

          {error && (
            <div className="py-12 text-center text-red-500 text-xs font-mono">
              {error}
            </div>
          )}

          {data && !loading && (
            <>
              {/* Leader Profile Hero Card */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/80 dark:to-blue-950/20 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Passport Photo */}
                  <LeaderAvatar
                    name={data.candidate.name}
                    candidateId={data.candidate.id}
                    party={data.candidate.party}
                    partyColor={data.candidate.party_color}
                    photoUrl={data.candidate.photo_url || undefined}
                    size="xl"
                    shape="passport"
                    showBadge={true}
                  />

                  {/* Bio & Details */}
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                        {data.candidate.hindi_name}
                      </h2>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        ({data.candidate.name})
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {data.candidate.current_role_hi}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {data.candidate.current_role}
                    </div>

                    {/* Party Tag & Category */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                      <PartySymbol party={data.candidate.party} size="sm" variant="pill" showName={true} />
                      {data.candidate.category && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {data.candidate.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lifetime KPI Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 text-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">कुल चुनाव (Contests)</span>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {data.career_stats.total_contests}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">जीत (Victories 🏆)</span>
                    <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {data.career_stats.wins}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider block">हार (Defeats ❌)</span>
                    <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                      {data.career_stats.losses}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider block">स्ट्राइक रेट (Win %)</span>
                    <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                      {data.career_stats.win_rate_pct}%
                    </span>
                  </div>
                </div>

                {/* Party Allegiance / Dal-Badal Badge */}
                <div className="mt-3 flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">दल-बदल स्थिति (Party Loyalty):</span>
                  <span className={`font-bold font-mono text-[11px] px-2 py-0.5 rounded-full ${
                    data.career_stats.has_switched_parties 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {data.career_stats.party_loyalty_hi}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto scrollbar-none pb-0.5 whitespace-nowrap">
                <button
                  onClick={() => setActiveTab('contests')}
                  className={`pb-2.5 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'contests'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>चुनाव इतिहास (Elections)</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                    {data.contests.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('party_timeline')}
                  className={`pb-2.5 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'party_timeline'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>दल-बदल इतिहास (Affiliation)</span>
                </button>

                <button
                  onClick={() => setActiveTab('bio')}
                  className={`pb-2.5 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'bio'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>परिचय (Biography)</span>
                </button>
              </div>

              {/* TAB 1: CONTESTS TIMELINE */}
              {activeTab === 'contests' && (
                <div className="space-y-3">
                  {data.contests.map((c, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        c.is_winner
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/15'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Year & Seat */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-xs">
                              {c.year}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              {c.election_type}
                            </span>
                            <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              c.is_winner
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                            }`}>
                              {c.is_winner ? <Award className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {c.status_label_hi}
                            </span>
                          </div>

                          <div className="font-bold text-slate-900 dark:text-white text-base">
                            {c.seat_name} {c.seat_type === 'PC' ? 'संसदीय क्षेत्र (Lok Sabha)' : 'विधानसभा क्षेत्र (Vidhan Sabha)'}
                          </div>
                        </div>

                        {/* Party Symbol Pill */}
                        <div className="self-start sm:self-auto">
                          <PartySymbol party={c.party_code} size="sm" variant="pill" showName={true} />
                        </div>
                      </div>

                      {/* Vote Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">प्राप्त मत (Votes)</span>
                          <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                            {c.votes.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">वोट शेयर (Vote Share)</span>
                          <span className="font-bold font-mono text-blue-600 dark:text-blue-400">
                            {c.vote_pct}%
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {c.is_winner ? 'जीत का अंतर (Margin)' : 'हार का अंतर (Defeat Margin)'}
                          </span>
                          <span className={`font-bold font-mono ${c.is_winner ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {c.is_winner ? '+' : '-'}{c.margin.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">स्थान (Rank)</span>
                          <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                            #{c.rank} {c.is_winner ? '(विजेता)' : '(प्रतिद्वंद्वी)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: PARTY TIMELINE & DAL-BADAL */}
              {activeTab === 'party_timeline' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                      राजनीतिक दल संबद्धता एवं दल-बदल कालक्रम (Political Affiliation Timeline)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {data.career_stats.has_switched_parties
                        ? 'इस प्रत्याशी ने अपने चुनावी करियर में विभिन्न दलों से चुनाव लड़ा है।'
                        : 'इस प्रत्याशी का चुनावी सफर एक ही दल के प्रति पूर्णतः निष्ठावान रहा है।'}
                    </p>

                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300 dark:before:bg-slate-700">
                      {data.contests.map((c, i) => (
                        <div key={i} className="relative">
                          {/* Timeline dot */}
                          <div 
                            className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900"
                            style={{ backgroundColor: c.party_color || '#3b82f6' }}
                          />
                          <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                              {c.year} — {c.election_type} ({c.seat_name})
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              c.is_winner ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {c.is_winner ? 'विजयी 🏆' : 'पराजित'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <PartySymbol party={c.party_code} size="xs" variant="pill" showName={true} />
                            <span className="text-[11px] text-slate-500">
                              ({c.votes.toLocaleString()} वोट, {c.vote_pct}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BIOGRAPHY */}
              {activeTab === 'bio' && (
                <div className="space-y-4 text-xs leading-relaxed">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      हिंदी विवरण (Hindi Profile)
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300">
                      {data.candidate.bio_hi}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      English Summary
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300">
                      {data.candidate.bio_en}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-mono">
            आधिकारिक स्रोत: ECI (1991–2024 प्रमाणित डेटाबेस)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
