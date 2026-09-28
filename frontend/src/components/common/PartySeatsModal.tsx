import React, { useEffect, useState } from 'react';
import { fetchPartySeats, PartySeatsResponse, PartySeatItem } from '../../services/api';
import { X, Search, Trophy, ExternalLink, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { SourceBadge } from './SourceBadge';

interface PartySeatsModalProps {
  partyCode: string | null;
  partyName?: string;
  partyColor?: string;
  year?: number;
  electionType?: string;
  onClose: () => void;
  onSelectConstituency?: (pcId: number) => void;
}

export const PartySeatsModal: React.FC<PartySeatsModalProps> = ({
  partyCode,
  partyName,
  partyColor = '#B85C38',
  year = 2024,
  electionType = 'Lok Sabha',
  onClose,
  onSelectConstituency
}) => {
  const [data, setData] = useState<PartySeatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'WON' | 'RUNNER_UP'>('WON');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!partyCode) return;
    setLoading(true);
    setError(null);
    fetchPartySeats(partyCode, year, electionType)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load party winning seats data.');
        setLoading(false);
      });
  }, [partyCode, year, electionType]);

  if (!partyCode) return null;

  const currentList: PartySeatItem[] = tab === 'WON' 
    ? (data?.won_seats || []) 
    : (data?.runner_up_seats || []);

  const filtered = currentList.filter(item => 
    item.pc_name.toLowerCase().includes(search.toLowerCase()) ||
    item.candidate.toLowerCase().includes(search.toLowerCase()) ||
    item.opponent_candidate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#181B19] border border-[#E2DFD6] dark:border-[#2A302B] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DFD6] dark:border-[#2A302B] bg-[#F7F5EF] dark:bg-[#202421]">
          <div className="flex items-center gap-3">
            <span 
              className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" 
              style={{ backgroundColor: partyColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl text-[#171918] dark:text-[#F1EFE8]">
                  {partyCode} — {partyName || data?.party_name || partyCode}
                </h2>
                <SourceBadge type="OFFICIAL" document={`ECI Detailed Results ${year}`} />
              </div>
              <p className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-0.5">
                {year} {electionType} • Uttar Pradesh ({data ? `${data.total_won} Won, ${data.total_runner_up} Runner-up` : 'Loading...'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#626762] hover:text-[#171918] dark:hover:text-white hover:bg-[#ECEAE3] dark:hover:bg-[#2A302B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader: Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19]">
          <div className="flex items-center gap-2 bg-[#ECEAE3] dark:bg-[#202421] p-1 rounded-lg">
            <button
              onClick={() => setTab('WON')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                tab === 'WON'
                  ? 'bg-white dark:bg-[#181B19] text-[#171918] dark:text-[#F1EFE8] shadow-sm'
                  : 'text-[#626762] dark:text-[#A8ADA7] hover:text-[#171918]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#B85C38]" />
              Seats Won ({data?.total_won ?? 0})
            </button>
            <button
              onClick={() => setTab('RUNNER_UP')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                tab === 'RUNNER_UP'
                  ? 'bg-white dark:bg-[#181B19] text-[#171918] dark:text-[#F1EFE8] shadow-sm'
                  : 'text-[#626762] dark:text-[#A8ADA7] hover:text-[#171918]'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-[#626762]" />
              Runner-Up ({data?.total_runner_up ?? 0})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#626762]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search constituency or candidate..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E2DFD6] dark:border-[#2A302B] bg-[#F7F5EF] dark:bg-[#202421] text-[#171918] dark:text-[#F1EFE8] placeholder-[#626762] focus:outline-none focus:border-[#B85C38]"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-[#626762]">
              <div className="animate-spin w-8 h-8 border-2 border-[#B85C38] border-t-transparent rounded-full mx-auto mb-3" />
              Loading verified official MP records...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500 text-sm">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[#626762] text-sm">
              No constituencies match your search or filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((item, idx) => (
                <div
                  key={`${item.pc_id}-${idx}`}
                  className="p-4 rounded-xl border border-[#E2DFD6] dark:border-[#2A302B] bg-[#FDFCFB] dark:bg-[#202421]/60 hover:border-[#B85C38] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#B85C38]">
                          PC #{item.pc_id}
                        </span>
                        <h4 className="font-bold text-sm text-[#171918] dark:text-[#F1EFE8]">
                          {item.pc_name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECEAE3] dark:bg-[#2A302B] text-[#626762]">
                        {item.category}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start justify-between">
                        <span className="text-[#626762] text-[11px]">
                          {tab === 'WON' ? 'Elected MP:' : 'Candidate:'}
                        </span>
                        <span className="font-bold text-[#171918] dark:text-[#F1EFE8] text-right">
                          {item.candidate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#626762] text-[11px]">Votes & Share:</span>
                        <span className="font-mono font-semibold text-[#171918] dark:text-[#F1EFE8]">
                          {item.votes.toLocaleString()} ({item.vote_pct}%)
                        </span>
                      </div>

                      <div className="flex items-start justify-between border-t border-[#E2DFD6]/60 dark:border-[#2A302B]/60 pt-1.5">
                        <span className="text-[#626762] text-[11px]">
                          {tab === 'WON' ? 'Defeated Opponent:' : 'Winner:'}
                        </span>
                        <span className="text-[11px] text-[#626762] dark:text-[#A8ADA7] text-right">
                          {item.opponent_candidate} ({item.opponent_party})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#626762] text-[11px]">Margin:</span>
                        <span className={`font-mono font-bold ${tab === 'WON' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          {tab === 'WON' ? `+${item.margin.toLocaleString()}` : `-${item.margin.toLocaleString()}`} votes ({item.margin_pct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {onSelectConstituency && (
                    <div className="mt-3 pt-2 border-t border-[#E2DFD6] dark:border-[#2A302B] flex justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectConstituency(item.pc_id);
                        }}
                        className="text-xs font-semibold text-[#B85C38] hover:text-[#9E4E2E] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Open PC Intelligence Dossier
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2DFD6] dark:border-[#2A302B] bg-[#F7F5EF] dark:bg-[#202421] flex items-center justify-between text-xs text-[#626762] dark:text-[#A8ADA7]">
          <span>
            Verified ECI Constituency Returns • Strict PC MP Isolation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#ECEAE3] dark:bg-[#2A302B] hover:bg-[#E2DFD6] dark:hover:bg-[#323833] text-[#171918] dark:text-[#F1EFE8] font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
