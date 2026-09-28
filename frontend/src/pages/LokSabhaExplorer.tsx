import React, { useEffect, useState } from 'react';
import { fetchConstituencies, ConstituencyListItem } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { LeaderAvatar } from '../components/common/LeaderAvatar';
import { LeaderDossierModal } from '../components/common/LeaderDossierModal';
import { PartySymbol } from '../components/common/PartySymbol';
import { Search, ArrowUpDown, Filter, Download, ChevronRight, Calendar, Award, Users, Vote } from 'lucide-react';

interface LokSabhaExplorerProps {
  onSelectPC: (pcId: number) => void;
}

export const LokSabhaExplorer: React.FC<LokSabhaExplorerProps> = ({ onSelectPC }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [items, setItems] = useState<ConstituencyListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [partyFilter, setPartyFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'pc_no' | 'margin' | 'turnout_pct' | 'name'>('pc_no');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedLeader, setSelectedLeader] = useState<{ name: string; candidateId?: number } | null>(null);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);

  useEffect(() => {
    loadData(selectedYear);
  }, [selectedYear]);

  const loadData = async (yr: number) => {
    setLoading(true);
    try {
      const data = await fetchConstituencies(yr);
      setItems(data.items);
    } catch (err) {
      console.error("Error loading constituencies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (col: 'pc_no' | 'margin' | 'turnout_pct' | 'name') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder(col === 'margin' || col === 'turnout_pct' ? 'desc' : 'asc');
    }
  };

  // Compute party tally for this year
  const partyTally: Record<string, number> = {};
  items.forEach(pc => {
    const p = pc.winner.party || 'OTHER';
    partyTally[p] = (partyTally[p] || 0) + 1;
  });

  const filtered = items.filter(pc => {
    if (partyFilter && pc.winner.party !== partyFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        pc.name.toLowerCase().includes(q) ||
        pc.pc_no.toString().includes(q) ||
        (pc.winner.name && pc.winner.name.toLowerCase().includes(q)) ||
        (pc.runner_up.name && pc.runner_up.name.toLowerCase().includes(q))
      );
    }
    return true;
  }).sort((a, b) => {
    let diff = 0;
    if (sortBy === 'pc_no') diff = a.pc_no - b.pc_no;
    else if (sortBy === 'name') diff = a.name.localeCompare(b.name);
    else if (sortBy === 'margin') diff = a.margin - b.margin;
    else if (sortBy === 'turnout_pct') diff = a.turnout_pct - b.turnout_pct;
    return sortOrder === 'asc' ? diff : -diff;
  });

  const getPartyBadgeColor = (party: string) => {
    switch (party?.toUpperCase()) {
      case 'SP': return 'bg-[#16a34a]/15 text-[#15803d] border-[#16a34a]/30';
      case 'BJP': return 'bg-[#F37021]/15 text-[#c2410c] border-[#F37021]/30';
      case 'INC': return 'bg-[#0099FF]/15 text-[#0369a1] border-[#0099FF]/30';
      case 'RLD': return 'bg-[#006600]/15 text-[#166534] border-[#006600]/30';
      case 'ADAL': 
      case 'AD': return 'bg-[#d97706]/15 text-[#b45309] border-[#d97706]/30';
      case 'BSP': return 'bg-[#2563eb]/15 text-[#1d4ed8] border-[#2563eb]/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header & Year Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DFD6] dark:border-[#2A302B] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded bg-[#B85C38]/10 text-[#B85C38] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> LOK SABHA GENERAL ELECTIONS
            </span>
            <SourceBadge type="OFFICIAL" document={`ECI Official Detailed Results (${selectedYear})`} />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#171918] dark:text-[#F1EFE8]">
            Uttar Pradesh Lok Sabha Constituencies ({selectedYear})
          </h1>
          <p className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-1">
            Complete certified result data across all 80 Parliamentary Constituencies with candidates, margins, and turnout.
          </p>
        </div>

        {/* Election Year Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-[#ECEAE3] dark:bg-[#202421] p-1 rounded-lg">
          {[2024, 2019, 2014].map(yr => (
            <button
              key={yr}
              onClick={() => { setSelectedYear(yr); setPartyFilter(''); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedYear === yr
                  ? 'bg-white dark:bg-[#181B19] text-[#B85C38] shadow-sm'
                  : 'text-[#626762] dark:text-[#A8ADA7] hover:text-[#171918]'
              }`}
            >
              {yr} Lok Sabha
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Summary Tally Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#181B19] p-4 rounded-lg border border-[#E2DFD6] dark:border-[#2A302B] shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#626762] dark:text-[#A8ADA7]">
            Total Seats
          </div>
          <div className="font-display font-bold text-2xl text-[#171918] dark:text-[#F1EFE8] mt-1">
            80 / 80
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            Delimitation 2008 Order
          </div>
        </div>

        <div className="bg-white dark:bg-[#181B19] p-4 rounded-lg border border-[#E2DFD6] dark:border-[#2A302B] shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
            Leading Party
          </div>
          <div className="font-display font-bold text-2xl text-green-700 dark:text-green-400 mt-1">
            {selectedYear === 2024 ? "SP (37)" : selectedYear === 2019 ? "BJP (62)" : "BJP (71)"}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            Single Largest Party
          </div>
        </div>

        <div className="bg-white dark:bg-[#181B19] p-4 rounded-lg border border-[#E2DFD6] dark:border-[#2A302B] shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#626762] dark:text-[#A8ADA7]">
            UP Average Turnout
          </div>
          <div className="font-display font-bold text-2xl text-[#171918] dark:text-[#F1EFE8] mt-1">
            {selectedYear === 2024 ? "56.92%" : selectedYear === 2019 ? "59.21%" : "58.44%"}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            Certified ECI Voter Turnout
          </div>
        </div>

        <div className="bg-white dark:bg-[#181B19] p-4 rounded-lg border border-[#E2DFD6] dark:border-[#2A302B] shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#626762] dark:text-[#A8ADA7]">
            Party Breakdown ({selectedYear})
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(partyTally).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([p, count]) => (
              <span key={p} className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getPartyBadgeColor(p)}`}>
                {p}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#181B19] p-4 rounded-xl border border-[#E2DFD6] dark:border-[#2A302B] shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${selectedYear} constituency name, candidate, PC number...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F5EF] dark:bg-[#202421] border border-[#D5D1C8] dark:border-[#353C37] rounded-md outline-none focus:border-[#B85C38]"
          />
        </div>

        {/* Party Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setPartyFilter('')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              partyFilter === '' 
                ? 'bg-[#171918] text-white dark:bg-[#F1EFE8] dark:text-[#171918] font-bold' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            All Parties
          </button>
          {Object.keys(partyTally).map(p => (
            <button
              key={p}
              onClick={() => setPartyFilter(p)}
              className={`px-2.5 py-1.5 rounded-md font-bold whitespace-nowrap transition-colors border ${getPartyBadgeColor(p)} ${
                partyFilter === p ? 'ring-2 ring-[#B85C38]' : ''
              }`}
            >
              {p} ({partyTally[p]})
            </button>
          ))}
        </div>

      </div>

      {/* 4. Constituencies Table */}
      <div className="bg-white dark:bg-[#181B19] rounded-xl border border-[#D5D1C8] dark:border-[#2A302B] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-500 font-mono">
            Loading {selectedYear} Lok Sabha constituency results...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F5EF] dark:bg-[#202421] border-b border-[#E2DFD6] dark:border-[#2A302B] text-[#626762] dark:text-[#A8ADA7] font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('pc_no')}>
                    <span className="flex items-center gap-1">PC # <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('name')}>
                    <span className="flex items-center gap-1">Constituency <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-2.5 px-3">Winner Candidate &amp; Party</th>
                  <th className="py-2.5 px-3 text-right">Winner Votes</th>
                  <th className="py-2.5 px-3">Runner-Up Candidate &amp; Party</th>
                  <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('margin')}>
                    <span className="flex items-center justify-end gap-1">Margin <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('turnout_pct')}>
                    <span className="flex items-center justify-end gap-1">Turnout <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DFD6] dark:divide-[#2A302B]">
                {filtered.map(pc => (
                  <tr 
                    key={pc.id}
                    onClick={() => onSelectPC(pc.id)}
                    className="hover:bg-gray-50/80 dark:hover:bg-[#202421]/60 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#626762] dark:text-[#A8ADA7]">
                      {pc.pc_no}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-[#171918] dark:text-[#F1EFE8]">
                      {pc.name}
                      {pc.category === 'SC' && (
                        <span className="ml-1 px-1 py-0.2 text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded font-mono font-bold">
                          SC
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <LeaderAvatar
                          name={pc.winner.name}
                          party={pc.winner.party}
                          size="xs"
                          shape="passport"
                          showBadge={true}
                          onClick={() => {
                            setSelectedLeader({ name: pc.winner.name });
                            setIsLeaderModalOpen(true);
                          }}
                        />
                        <div className="flex flex-col">
                          <button
                            onClick={() => {
                              setSelectedLeader({ name: pc.winner.name });
                              setIsLeaderModalOpen(true);
                            }}
                            className="font-bold text-[#171918] dark:text-[#F1EFE8] hover:text-[#B85C38] text-left transition-colors truncate max-w-[150px]"
                            title="नेताजी प्रोफाइल देखें"
                          >
                            {pc.winner.name}
                          </button>
                          <div className="mt-0.5">
                            <PartySymbol party={pc.winner.party} size="xs" variant="pill" showName={false} />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono">
                      <div className="font-bold">{pc.winner.votes.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">({pc.winner.vote_pct.toFixed(1)}%)</div>
                    </td>

                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <LeaderAvatar
                          name={pc.runner_up.name}
                          party={pc.runner_up.party}
                          size="xs"
                          shape="passport"
                          showBadge={true}
                          onClick={() => {
                            setSelectedLeader({ name: pc.runner_up.name });
                            setIsLeaderModalOpen(true);
                          }}
                        />
                        <div className="flex flex-col">
                          <button
                            onClick={() => {
                              setSelectedLeader({ name: pc.runner_up.name });
                              setIsLeaderModalOpen(true);
                            }}
                            className="text-gray-600 dark:text-gray-400 hover:text-[#B85C38] text-left transition-colors text-xs truncate max-w-[140px]"
                            title="नेताजी प्रोफाइल देखें"
                          >
                            {pc.runner_up.name}
                          </button>
                          <div className="mt-0.5">
                            <PartySymbol party={pc.runner_up.party} size="xs" variant="pill" showName={false} />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-green-700 dark:text-green-400">
                      +{pc.margin.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {pc.turnout_pct.toFixed(2)}%
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button className="px-2.5 py-1 rounded bg-white dark:bg-[#1C201D] border border-gray-300 dark:border-gray-700 hover:border-[#B85C38] text-[#B85C38] text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto">
                        Details <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-500">
                No constituencies match the search or party filter criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Leader & Netaji Dossier Modal */}
      <LeaderDossierModal
        candidateId={selectedLeader?.candidateId}
        candidateName={selectedLeader?.name}
        isOpen={isLeaderModalOpen}
        onClose={() => {
          setIsLeaderModalOpen(false);
          setSelectedLeader(null);
        }}
      />
    </div>
  );
};
