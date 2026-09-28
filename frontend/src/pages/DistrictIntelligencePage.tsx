import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Landmark, 
  MapPin, 
  Search, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Vote, 
  Activity, 
  Award, 
  BarChart3,
  Layers
} from 'lucide-react';
import { 
  fetchDistricts, 
  fetchDistrictDossier, 
  fetchDistrictGroundIntelligence,
  DistrictSummaryItem, 
  DistrictDossierResponse,
  DistrictGroundIntelligence 
} from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { ACDossierModal } from '../components/common/ACDossierModal';
import { DistrictRallyDossierModal } from '../components/districts/DistrictRallyDossierModal';
import { useLanguage } from '../context/LanguageContext';

interface DistrictIntelligencePageProps {
  onSelectPC?: (pcId: number) => void;
}

export const DistrictIntelligencePage: React.FC<DistrictIntelligencePageProps> = ({ onSelectPC }) => {
  const { language } = useLanguage();
  const [districts, setDistricts] = useState<DistrictSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'acs' | 'competitiveness'>('name');

  // Modal State for District Dossier & AC Dossier
  const [selectedDistrictName, setSelectedDistrictName] = useState<string | null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [districtDossier, setDistrictDossier] = useState<DistrictDossierResponse | null>(null);
  const [selectedACNo, setSelectedACNo] = useState<number | null>(null);

  // Rally Speech & Ground Report Modal State
  const [selectedRallyDistrict, setSelectedRallyDistrict] = useState<DistrictGroundIntelligence | null>(null);
  const [rallyModalLoading, setRallyModalLoading] = useState(false);
  const [isRallyModalOpen, setIsRallyModalOpen] = useState(false);

  const handleOpenRallyDossier = (name: string) => {
    setRallyModalLoading(true);
    setIsRallyModalOpen(true);
    fetchDistrictGroundIntelligence(name)
      .then(res => {
        setSelectedRallyDistrict(res);
        setRallyModalLoading(false);
      })
      .catch(err => {
        console.error("Failed to load district ground intel:", err);
        setRallyModalLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchDistricts()
      .then(res => {
        setDistricts(res.districts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load districts:", err);
        setLoading(false);
      });
  }, []);

  const handleOpenDistrict = (name: string) => {
    setSelectedDistrictName(name);
    setDossierLoading(true);
    fetchDistrictDossier(name)
      .then(res => {
        setDistrictDossier(res);
        setDossierLoading(false);
      })
      .catch(err => {
        console.error("Failed to load district dossier:", err);
        setDossierLoading(false);
      });
  };

  const getTopParty = (tally?: Record<string, number>) => {
    if (!tally) return 'N/A';
    const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return entries.length > 0 ? entries[0][0] : 'N/A';
  };

  const filteredDistricts = districts.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return d.name.toLowerCase().includes(q) ||
           d.pcs.some(p => p.toLowerCase().includes(q));
  }).sort((a, b) => {
    if (sortBy === 'acs') return b.ac_count - a.ac_count;
    if (sortBy === 'competitiveness') return b.avg_competitiveness - a.avg_competitiveness;
    return a.name.localeCompare(b.name);
  });

  const getPartyColor = (party: string) => {
    if (party === 'BJP') return '#FF9933';
    if (party === 'SP') return '#E53935';
    if (party === 'INC') return '#1976D2';
    if (party === 'BSP') return '#1E40AF';
    if (party === 'RLD') return '#10B981';
    return '#64748B';
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header & Source Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              District Intelligence Center
            </h1>
            <SourceBadge type="OFFICIAL" document="ECI Delimitation Order & AC Mapping" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete administrative and electoral intelligence layer across all 75 districts of Uttar Pradesh.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-xl text-center">
            <span className="block text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Districts</span>
            <span className="font-mono font-extrabold text-lg text-blue-900 dark:text-blue-200">75</span>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
            <span className="block text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Assembly Seats</span>
            <span className="font-mono font-extrabold text-lg text-slate-900 dark:text-white">403</span>
          </div>
          <div className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 rounded-xl text-center">
            <span className="block text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Parliamentary</span>
            <span className="font-mono font-extrabold text-lg text-indigo-900 dark:text-indigo-200">80</span>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search district or constituent PC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="name">Sort: A to Z</option>
            <option value="acs">Sort: Most Assembly Seats</option>
            <option value="competitiveness">Sort: Highest Competitiveness</option>
          </select>
        </div>
      </div>

      {/* 3. District Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-mono text-sm animate-pulse">
          Loading 75 UP District Intelligence Records...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDistricts.map(dist => {
            const top2022 = getTopParty(dist.party_tally_2022);
            const top2024 = getTopParty(dist.party_tally_2024);

            return (
              <div
                key={dist.name}
                onClick={() => handleOpenDistrict(dist.name)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {dist.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        PCs: {dist.pcs.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {dist.ac_count} ACs
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {dist.pc_count} PCs
                      </span>
                    </div>
                  </div>

                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">2022 vs 2024 Shift:</span>
                      <span className="flex items-center gap-1 font-bold">
                        <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${getPartyColor(top2022)}20`, color: getPartyColor(top2022) }}>
                          {top2022} (2022)
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${getPartyColor(top2024)}20`, color: getPartyColor(top2024) }}>
                          {top2024} (2024 Leads)
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Competitiveness Score:</span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                          {dist.avg_competitiveness}/100
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          dist.avg_competitiveness > 70 ? 'bg-red-500' :
                          dist.avg_competitiveness > 55 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Battleground ACs:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {dist.battlegrounds_count} ACs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>View Full District Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRallyDossier(dist.name);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-xs shadow-red-600/20 transition-all cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>🎙️ भाषण व ग्राउंड रिपोर्ट</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Comprehensive District Dossier Modal */}
      {selectedDistrictName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    {selectedDistrictName} District Intelligence Dossier
                  </h2>
                  <SourceBadge type="OFFICIAL" document="ECI Delimitation Archive" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Administrative district profile, parliamentary linkages, assembly segments, and competitiveness breakdown.
                </p>
              </div>

              <button
                onClick={() => setSelectedDistrictName(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {dossierLoading || !districtDossier ? (
                <div className="py-20 text-center text-slate-400 font-mono animate-pulse">
                  Loading {selectedDistrictName} electoral dossier...
                </div>
              ) : (
                <>
                  {/* Ground Report & Rally Speech Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-600/10 via-rose-500/10 to-amber-500/10 border border-red-300 dark:border-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-600 animate-pulse" />
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {selectedDistrictName} चुनावी रैली भाषण &amp; ग्राउंड रिपोर्ट वॉर रूम
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        4-टोन AI मंच भाषण, वादे बनाम हकीकत, MP/MLA रिपोर्ट कार्ड और 1-क्लिक WhatsApp शेयर फॉर्मेट।
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenRallyDossier(selectedDistrictName)}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl font-extrabold text-xs shadow-md shadow-red-600/25 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>रैली भाषण व रिपोर्ट खोलें →</span>
                    </button>
                  </div>

                  {/* Overview Metric Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[11px] text-slate-500 font-bold uppercase">Assembly Segments</span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                        {districtDossier.total_acs} ACs
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[11px] text-slate-500 font-bold uppercase">Parent PCs</span>
                      <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                        {districtDossier.total_pcs} PCs
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[11px] text-slate-500 font-bold uppercase">Competitiveness</span>
                      <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                        {districtDossier.average_competitiveness}/100
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[11px] text-slate-500 font-bold uppercase">Significant Flips</span>
                      <span className="text-xl font-extrabold text-red-600 dark:text-red-400 font-mono">
                        {districtDossier.significant_flips_count} Flips
                      </span>
                    </div>
                  </div>

                  {/* Significant Flips */}
                  {districtDossier.significant_flips && districtDossier.significant_flips.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                        Cycle Flips (2022 vs 2024 Leads)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {districtDossier.significant_flips.map((flip, idx) => (
                          <div key={idx} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">AC #{flip.ac_no} {flip.ac_name}</span>
                              <div className="text-[10px] text-slate-500">{flip.from_party} → {flip.to_party}</div>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              +{flip.margin_2024.toLocaleString()} margin
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constituent Parliamentary Constituencies */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-blue-600" />
                      Constituent Parliamentary Seats ({districtDossier.pcs.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {districtDossier.pcs.map(pc => (
                        <div 
                          key={pc.pc_no}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono text-[10px] text-slate-500 font-bold">PC #{pc.pc_no}</span>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{pc.pc_name}</div>
                          </div>
                          {onSelectPC && (
                            <button
                              onClick={() => {
                                onSelectPC(pc.pc_no);
                                setSelectedDistrictName(null);
                              }}
                              className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-colors"
                            >
                              View PC →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Constituent Assembly Constituencies */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      Constituent Assembly Constituencies ({districtDossier.assembly_constituencies.length})
                    </h4>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                            <th className="p-2.5">AC #</th>
                            <th className="p-2.5">Assembly Name</th>
                            <th className="p-2.5">Category</th>
                            <th className="p-2.5">2022 Winner</th>
                            <th className="p-2.5">2024 LS Lead</th>
                            <th className="p-2.5">Lead Margin</th>
                            <th className="p-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                          {districtDossier.assembly_constituencies.map(ac => (
                            <tr key={ac.ac_no} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-2.5 font-mono font-bold">{ac.ac_no}</td>
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">{ac.ac_name}</td>
                              <td className="p-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  ac.category === 'SC' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                  {ac.category}
                                </span>
                              </td>
                              <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">
                                {ac.winner_2022?.party} ({ac.winner_2022?.candidate})
                              </td>
                              <td className="p-2.5 font-bold" style={{ color: getPartyColor(ac.lead_2024?.party) }}>
                                {ac.lead_2024?.party} ({ac.lead_2024?.candidate})
                              </td>
                              <td className="p-2.5 font-mono font-semibold">
                                {ac.lead_2024?.margin?.toLocaleString()}
                              </td>
                              <td className="p-2.5 text-right">
                                <button
                                  onClick={() => setSelectedACNo(ac.ac_no)}
                                  className="px-2 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded font-bold hover:bg-blue-100 transition-colors"
                                >
                                  Dossier →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. Embedded AC Dossier Modal */}
      <ACDossierModal
        acNo={selectedACNo}
        isOpen={selectedACNo !== null}
        onClose={() => setSelectedACNo(null)}
      />

      {/* 6. Embedded Ground Intelligence & Rally Speech Modal */}
      <DistrictRallyDossierModal
        isOpen={isRallyModalOpen}
        onClose={() => setIsRallyModalOpen(false)}
        data={selectedRallyDistrict}
        loading={rallyModalLoading}
      />

    </div>
  );
};
