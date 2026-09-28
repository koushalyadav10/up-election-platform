import React, { useEffect, useState } from 'react';
import { fetchCloseContests, fetchLargestVictories, CloseContestItem } from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { Flame, Trophy, ArrowUpDown, ChevronRight } from 'lucide-react';

interface CloseContestsPageProps {
  onSelectPC: (pcId: number) => void;
}

export const CloseContestsPage: React.FC<CloseContestsPageProps> = ({ onSelectPC }) => {
  const [threshold, setThreshold] = useState<number>(10000);
  const [closeContests, setCloseContests] = useState<CloseContestItem[]>([]);
  const [largestWins, setLargestWins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCloseContests(threshold),
      fetchLargestVictories(8)
    ]).then(([closeRes, winRes]) => {
      setCloseContests(closeRes.contests);
      setLargestWins(winRes.victories);
      setLoading(false);
    });
  }, [threshold]);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#171918] dark:text-[#F1EFE8]">
            Close Contest & Margin Intelligence
          </h1>
          <SourceBadge type="OFFICIAL" document="ECI Dataset 33" />
        </div>
        <p className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-1">
          Identifying razor-thin contests and landslide victories across Uttar Pradesh's 80 Lok Sabha seats.
        </p>
      </div>

      {/* Threshold Selector Toolbar */}
      <div className="p-4 rounded-xl border border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#626762]">Margin Filter Threshold:</span>
          {[1000, 5000, 10000, 25000, 50000].map(m => (
            <button
              key={m}
              onClick={() => setThreshold(m)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                threshold === m
                  ? 'bg-[#B85C38] text-white shadow-sm'
                  : 'bg-[#ECEAE3] dark:bg-[#202421] text-[#626762] hover:bg-[#E2DFD6]'
              }`}
            >
              &lt; {m.toLocaleString()} votes
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-[#626762]">
          Found <strong>{closeContests.length}</strong> contests within threshold
        </div>
      </div>

      {/* Close Contests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-[#626762]">Loading margin analytics...</div>
        ) : closeContests.map(c => (
          <div
            key={c.pc_id}
            onClick={() => onSelectPC(c.pc_id)}
            className="p-5 rounded-xl border border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] shadow-sm hover:border-[#B85C38] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#ECEAE3] dark:bg-[#202421] text-[#626762]">
                PC {c.pc_no}
              </span>
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-red-50 text-[#9A4038] border border-red-200">
                Margin: {c.margin.toLocaleString()} votes
              </span>
            </div>

            <h3 className="font-display font-bold text-lg text-[#171918] dark:text-[#F1EFE8] mt-3">
              {c.pc_name}
            </h3>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#626762]">Winner:</span>
                <span className="font-semibold text-[#171918] dark:text-[#F1EFE8]">
                  {c.winner_name} <strong style={{ color: c.winner_party_color }}>({c.winner_party})</strong>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#626762]">Runner-Up:</span>
                <span className="text-[#626762]">
                  {c.runner_up_name} ({c.runner_up_party})
                </span>
              </div>

              <div className="pt-2 border-t border-[#E2DFD6] dark:border-[#2A302B] flex justify-between text-[#626762]">
                <span>Turnout:</span>
                <span className="font-mono font-semibold">{c.turnout_pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Largest Victories Section */}
      <div className="p-6 rounded-2xl border border-[#E2DFD6] dark:border-[#2A302B] bg-white dark:bg-[#181B19] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#C9A45C]" />
          <h3 className="font-display font-bold text-xl text-[#171918] dark:text-[#F1EFE8]">
            Largest Victory Margins in Uttar Pradesh (Landslides)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ECEAE3] dark:bg-[#202421] text-[#626762] dark:text-[#A8ADA7] font-mono uppercase tracking-wider border-b border-[#E2DFD6] dark:border-[#2A302B]">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Constituency</th>
                <th className="py-2.5 px-3">Winner</th>
                <th className="py-2.5 px-3">Party</th>
                <th className="py-2.5 px-3 text-right">Winning Margin</th>
                <th className="py-2.5 px-3 text-right">Vote Share</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD6]/60 dark:divide-[#2A302B]">
              {largestWins.map((w, idx) => (
                <tr key={w.pc_id} className="hover:bg-[#F7F5EF] dark:hover:bg-[#202421] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold">{w.pc_name} (PC {w.pc_no})</td>
                  <td className="py-2.5 px-3">{w.winner_name}</td>
                  <td className="py-2.5 px-3 font-bold">{w.winner_party}</td>
                  <td className="py-2.5 px-3 font-data font-bold text-right text-[#2F6848]">{w.margin.toLocaleString()} votes</td>
                  <td className="py-2.5 px-3 font-data text-right">{w.vote_share_pct}%</td>
                  <td className="py-2.5 px-3 text-center">
                    <button onClick={() => onSelectPC(w.pc_id)} className="text-[#B85C38] hover:underline font-semibold">
                      Dossier →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
