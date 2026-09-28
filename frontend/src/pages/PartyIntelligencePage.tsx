import React, { useEffect, useState } from 'react';
import { fetchParties, PartyStat } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { PartySeatsModal } from '../components/common/PartySeatsModal';
import { ShieldCheck, Award, Percent, TrendingUp, BarChart2, Search, Trophy, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PartyIntelligencePageProps {
  onSelectPC?: (pcId: number) => void;
}

export const PartyIntelligencePage: React.FC<PartyIntelligencePageProps> = ({ onSelectPC }) => {
  const { language } = useLanguage();
  const [parties, setParties] = useState<PartyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'WINNERS' | 'RECOGNIZED'>('ALL');
  const [selectedPartyModal, setSelectedPartyModal] = useState<{
    code: string;
    name: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    fetchParties().then(data => {
      setParties(data.parties);
      setLoading(false);
    });
  }, []);

  const filteredParties = parties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.code.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'WINNERS') return p.seats_won > 0;
    if (filterType === 'RECOGNIZED') return ['BJP', 'SP', 'INC', 'BSP', 'RLD', 'ADAL', 'ASPKR', 'SBSP', 'NINSHAD', 'AAP', 'CPI(M)'].includes(p.code);
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#171918] dark:text-[#F1EFE8]">
              {language === 'hi' ? 'राजनीतिक दल विश्लेषण एवं प्रदर्शन' : 'Party Intelligence & Electoral Performance'}
            </h1>
            <SourceBadge type="OFFICIAL" document="ECI Datasets 21, 27 & 33" />
          </div>
          <p className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-1">
            {language === 'hi' 
              ? 'उत्तर प्रदेश के सभी प्रमुख दलों का आधिकारिक डेटा। जीते हुए सांसदों की सूची देखने के लिए किसी भी दल पर क्लिक करें।' 
              : 'Objective, non-partisan analytical assessment of UP parties. Click any party to inspect its complete list of elected MPs.'}
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#626762]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={language === 'hi' ? 'पार्टी खोजें...' : 'Filter party...'}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] text-[#171918] dark:text-[#F1EFE8] placeholder-[#626762] focus:outline-none focus:border-[#B85C38]"
            />
          </div>

          <div className="flex items-center bg-[#ECEAE3] dark:bg-[#202421] p-1 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-[#181B19] text-[#171918] dark:text-[#F1EFE8] shadow-sm'
                  : 'text-[#626762] hover:text-[#171918]'
              }`}
            >
              {language === 'hi' ? 'सभी दल' : 'All Parties'}
            </button>
            <button
              onClick={() => setFilterType('WINNERS')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'WINNERS'
                  ? 'bg-white dark:bg-[#181B19] text-[#171918] dark:text-[#F1EFE8] shadow-sm'
                  : 'text-[#626762] hover:text-[#171918]'
              }`}
            >
              {language === 'hi' ? 'विजेता दल (Seats > 0)' : 'Winners (Seats > 0)'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Party Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-[#626762]">
            <div className="animate-spin w-8 h-8 border-2 border-[#B85C38] border-t-transparent rounded-full mx-auto mb-3" />
            Loading party intelligence metrics...
          </div>
        ) : filteredParties.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-[#626762]">
            No parties match your criteria.
          </div>
        ) : (
          filteredParties.map(p => (
            <div 
              key={p.code}
              className="p-6 rounded-2xl border border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] shadow-sm space-y-4 hover:border-[#B85C38] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2DFD6] dark:border-[#2A302B]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: p.color }} />
                      <h3 className="font-display font-bold text-xl text-[#171918] dark:text-[#F1EFE8]">
                        {p.code}
                      </h3>
                    </div>
                    <div className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-0.5 truncate max-w-[220px]">
                      {p.name}
                    </div>
                  </div>
                  <span className="font-mono text-xs px-2 py-1 bg-[#ECEAE3] dark:bg-[#202421] rounded text-[#626762]">
                    {p.party_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mt-4">
                  <div 
                    onClick={() => {
                      if (p.seats_won > 0) {
                        setSelectedPartyModal({ code: p.code, name: p.name, color: p.color });
                      }
                    }}
                    className={`p-3 rounded-lg bg-[#F7F5EF] dark:bg-[#202421] ${p.seats_won > 0 ? 'cursor-pointer hover:bg-[#ECEAE3] dark:hover:bg-[#2A302B] transition-colors border border-transparent hover:border-[#B85C38]' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#626762]">Seats Won</span>
                      {p.seats_won > 0 && <Trophy className="w-3.5 h-3.5 text-[#B85C38]" />}
                    </div>
                    <div className="font-data font-bold text-2xl text-[#171918] dark:text-[#F1EFE8] mt-1">
                      {p.seats_won} <span className="text-xs text-[#626762] font-normal">/ {p.seats_contested}</span>
                    </div>
                    {p.seats_won > 0 && (
                      <span className="text-[10px] text-[#B85C38] font-semibold flex items-center gap-0.5 mt-1">
                        Click to view MPs →
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F5EF] dark:bg-[#202421]">
                    <span className="text-[#626762]">Vote Share</span>
                    <div className="font-data font-bold text-2xl text-[#B85C38] mt-1">
                      {p.vote_share_pct}%
                    </div>
                    <span className="text-[10px] text-[#626762] mt-1 block">
                      Across UP
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F5EF] dark:bg-[#202421]">
                    <span className="text-[#626762]">Strike Rate</span>
                    <div className="font-data font-bold text-lg text-[#171918] dark:text-[#F1EFE8] mt-1">
                      {p.strike_rate_pct}%
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F5EF] dark:bg-[#202421]">
                    <span className="text-[#626762]">Total Votes</span>
                    <div className="font-data font-bold text-lg text-[#171918] dark:text-[#F1EFE8] mt-1">
                      {(p.total_votes / 100000).toFixed(1)} Lakh
                    </div>
                  </div>
                </div>

                {p.seats_won > 0 && (
                  <div className="pt-3 text-xs flex justify-between text-[#626762]">
                    <span>Avg Winning Margin:</span>
                    <span className="font-mono font-bold text-[#171918] dark:text-[#F1EFE8]">
                      {p.avg_winning_margin.toLocaleString()} votes
                    </span>
                  </div>
                )}

                {p.closest_loss.constituency && (
                  <div className="text-[11px] text-[#626762] pt-2 mt-2 border-t border-[#E2DFD6] dark:border-[#2A302B]">
                    Narrowest contest: <strong className="text-[#9A4038]">{p.closest_loss.constituency}</strong> ({p.closest_loss.margin?.toLocaleString()} votes)
                  </div>
                )}
              </div>

              {/* Action Button to Open Winning MPs Modal */}
              <div className="pt-3 border-t border-[#E2DFD6] dark:border-[#2A302B]">
                <button
                  onClick={() => setSelectedPartyModal({ code: p.code, name: p.name, color: p.color })}
                  className="w-full py-2 px-3 rounded-lg bg-[#ECEAE3] dark:bg-[#202421] hover:bg-[#B85C38] hover:text-white dark:hover:bg-[#B85C38] dark:hover:text-white text-xs font-semibold text-[#171918] dark:text-[#F1EFE8] transition-all flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  {p.seats_won > 0 
                    ? `View All ${p.seats_won} Elected MPs & Performance`
                    : 'View Contested Seats & Runners-Up'}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Winning MPs & Seats Modal */}
      {selectedPartyModal && (
        <PartySeatsModal
          partyCode={selectedPartyModal.code}
          partyName={selectedPartyModal.name}
          partyColor={selectedPartyModal.color}
          year={2024}
          electionType="Lok Sabha"
          onClose={() => setSelectedPartyModal(null)}
          onSelectConstituency={onSelectPC}
        />
      )}
    </div>
  );
};
