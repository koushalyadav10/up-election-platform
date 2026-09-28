import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  Search, 
  TrendingUp, 
  Sliders, 
  Sparkles, 
  Award, 
  Check, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Filter, 
  ArrowUpDown, 
  Flame, 
  Table, 
  LayoutGrid, 
  ChevronRight,
  Info,
  HelpCircle,
  Vote,
  Target
} from 'lucide-react';
import { 
  fetchCasteMatrix, 
  fetchDistrictGroundIntelligence, 
  CasteMatrixResponse, 
  DistrictCasteProfile, 
  DistrictGroundIntelligence 
} from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { DistrictRallyDossierModal } from '../components/districts/DistrictRallyDossierModal';
import { useLanguage } from '../context/LanguageContext';

export const CasteEquationsPage: React.FC = () => {
  const { language } = useLanguage();
  const [data, setData] = useState<CasteMatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Interactive Coalition Simulator State
  const [coalition, setCoalition] = useState<Record<string, boolean>>({
    yadav: true,
    muslim: true,
    jatav: true,
    kurmi: false,
    maurya: false,
    nishad: false,
    rajbhar: false,
    jat: false,
    gujjar: false,
    pasi: false,
    brahmin: false,
    rajput: false,
    other_obc: true,
    other_sc: true
  });

  // Rally Modal State
  const [selectedGroundDistrict, setSelectedGroundDistrict] = useState<DistrictGroundIntelligence | null>(null);
  const [groundModalLoading, setGroundModalLoading] = useState(false);
  const [isGroundModalOpen, setIsGroundModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCasteMatrix()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load caste matrix:", err);
        setLoading(false);
      });
  }, []);

  const handleOpenGroundIntel = (districtName: string) => {
    setGroundModalLoading(true);
    setIsGroundModalOpen(true);
    fetchDistrictGroundIntelligence(districtName)
      .then(res => {
        setSelectedGroundDistrict(res);
        setGroundModalLoading(false);
      })
      .catch(err => {
        console.error("Failed to load district ground intel:", err);
        setGroundModalLoading(false);
      });
  };

  // Coalition presets
  const applyPreset = (preset: 'pda' | 'farmer' | '2012' | 'reset') => {
    if (preset === 'pda') {
      setCoalition({
        yadav: true,
        muslim: true,
        jatav: true,
        kurmi: true,
        maurya: true,
        nishad: true,
        rajbhar: true,
        jat: true,
        gujjar: true,
        pasi: true,
        brahmin: false,
        rajput: false,
        other_obc: true,
        other_sc: true
      });
    } else if (preset === 'farmer') {
      setCoalition({
        yadav: true,
        jat: true,
        muslim: true,
        kurmi: true,
        gujjar: true,
        jatav: true,
        maurya: false,
        nishad: false,
        rajbhar: false,
        pasi: false,
        brahmin: false,
        rajput: false,
        other_obc: true,
        other_sc: false
      });
    } else if (preset === '2012') {
      setCoalition({
        yadav: true,
        muslim: true,
        kurmi: true,
        maurya: true,
        pasi: true,
        other_obc: true,
        jatav: false,
        jat: false,
        gujjar: false,
        nishad: true,
        rajbhar: true,
        brahmin: true,
        rajput: false,
        other_sc: true
      });
    } else {
      setCoalition({
        yadav: false,
        muslim: false,
        jatav: false,
        kurmi: false,
        maurya: false,
        nishad: false,
        rajbhar: false,
        jat: false,
        gujjar: false,
        pasi: false,
        brahmin: false,
        rajput: false,
        other_obc: false,
        other_sc: false
      });
    }
  };

  // Calculate simulated vote share
  const macro = data?.statewide_baseline?.macro_subcastes || {};
  let simulatedVoteShare = 0;
  if (coalition.yadav) simulatedVoteShare += macro['yadav'] || 9.5;
  if (coalition.muslim) simulatedVoteShare += macro['muslim_total'] || 19.3;
  if (coalition.jatav) simulatedVoteShare += macro['jatav_dalit'] || 11.8;
  if (coalition.kurmi) simulatedVoteShare += macro['kurmi_patel'] || 7.5;
  if (coalition.maurya) simulatedVoteShare += macro['maurya_kushwaha_shakya_saini'] || 6.8;
  if (coalition.nishad) simulatedVoteShare += macro['nishad_kashyap_mallah'] || 4.5;
  if (coalition.rajbhar) simulatedVoteShare += macro['rajbhar'] || 2.4;
  if (coalition.jat) simulatedVoteShare += macro['jat'] || 3.6;
  if (coalition.gujjar) simulatedVoteShare += macro['gujjar'] || 2.2;
  if (coalition.pasi) simulatedVoteShare += macro['pasi'] || 3.8;
  if (coalition.brahmin) simulatedVoteShare += macro['brahmin'] || 9.5;
  if (coalition.rajput) simulatedVoteShare += macro['thakur_rajput'] || 7.2;
  if (coalition.other_obc) simulatedVoteShare += macro['other_obc_mbc'] || 8.5;
  if (coalition.other_sc) simulatedVoteShare += macro['dhobi_kori_balmiki_other_sc'] || 5.5;

  simulatedVoteShare = Math.min(100, Math.round(simulatedVoteShare * 10) / 10);

  // Filter districts
  const districts = data?.districts || [];
  const filteredDistricts = districts.filter(d => {
    if (selectedRegion !== 'All' && d.region !== selectedRegion) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return d.district_name.toLowerCase().includes(q) ||
           d.region.toLowerCase().includes(q) ||
           d.dominant_communities.some(c => c.toLowerCase().includes(q));
  }).sort((a, b) => {
    if (sortBy === 'pda') return b.pda_potential - a.pda_potential;
    if (sortBy === 'muslim') return b.sub_castes.muslim_total - a.sub_castes.muslim_total;
    if (sortBy === 'yadav') return b.sub_castes.yadav - a.sub_castes.yadav;
    if (sortBy === 'dalit') return b.sc_total - a.sc_total;
    if (sortBy === 'kurmi') return b.sub_castes.kurmi_patel - a.sub_castes.kurmi_patel;
    if (sortBy === 'brahmin') return b.sub_castes.brahmin - a.sub_castes.brahmin;
    return a.district_name.localeCompare(b.district_name);
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header & Source Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              उत्तर प्रदेश जातिगत व सामाजिक समीकरण
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              75 ज़िले • 403 विधानसभाएं
            </span>
            <SourceBadge type="OFFICIAL" document="UP Caste Demographics & Field Survey Matrix" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            उत्तर प्रदेश के सभी 75 जनपदों का प्रामाणिक जातिगत अनुपात, सामाजिक धुरी, पीडीए (PDA) जनाधार और 2027 का विजय समीकरण सिम्युलेटर।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500/10 to-blue-500/10 border border-slate-200 dark:border-slate-800 text-right">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">बहुमत पैमाना (Target)</span>
            <span className="text-base font-extrabold text-red-600 dark:text-red-400 font-mono">38.5% — 42.0%</span>
          </div>
        </div>
      </div>

      {/* 2. Statewide Macro Demographic Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">OBC (अन्य पिछड़ा वर्ग)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">~52.0%</div>
          <span className="text-[10px] text-slate-500 truncate block mt-0.5">यादव, कुर्मी, मौर्या, निषाद, जाट, लोध</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">SC (अनुसूचित जाति/दलित)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">~21.1%</div>
          <span className="text-[10px] text-slate-500 truncate block mt-0.5">जाटव (दलित), पासी, धोबी, कोरी, वाल्मीकि</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">अल्पसंख्यक (Muslim Total)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">~19.3%</div>
          <span className="text-[10px] text-slate-500 truncate block mt-0.5">पसमांदा (~12.5%) + अशराफ (~6.8%)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">सामान्य वर्ग (General)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">~18.0%</div>
          <span className="text-[10px] text-slate-500 truncate block mt-0.5">ब्राह्मण (9.5%), ठाकुर (7.2%), वैश्य</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-rose-900/30 border border-red-200 dark:border-red-900 shadow-xs">
          <span className="text-[11px] font-extrabold text-red-700 dark:text-red-300 uppercase tracking-wider">संयुक्त PDA जनाधार</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 font-mono mt-0.5">~85.0%</div>
          <span className="text-[10px] text-red-800/80 dark:text-red-300 truncate block mt-0.5">पिछड़ा + दलित + अल्पसंख्यक</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950/40 dark:to-blue-900/30 border border-indigo-200 dark:border-indigo-900 shadow-xs">
          <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">कुल विधानसभा सीटें</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">403</div>
          <span className="text-[10px] text-indigo-800/80 dark:text-indigo-300 truncate block mt-0.5">बहुमत का जादुई आंकड़ा: 202</span>
        </div>
      </div>

      {/* 3. Interactive Social Coalition Builder (Winning Equation Simulator) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-600" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                सामाजिक गठबंधन सिम्युलेटर (Winning Equation Simulator)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              विभिन्न सामाजिक समूहों को जोड़कर देखें कि किस गठबंधन से 38.5% - 42% का विजय लक्ष्य प्राप्त होता है।
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">रेडीमेड फॉर्मूले:</span>
            <button
              onClick={() => applyPreset('pda')}
              className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
            >
              🚩 पूर्ण PDA फॉर्मूला
            </button>
            <button
              onClick={() => applyPreset('farmer')}
              className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
            >
              🌾 किसान-सामाजिक मोर्चा
            </button>
            <button
              onClick={() => applyPreset('2012')}
              className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              🎯 2012 बहुमत मॉडल
            </button>
            <button
              onClick={() => applyPreset('reset')}
              className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              रीसेट
            </button>
          </div>
        </div>

        {/* Community Toggles */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { key: 'muslim', label: 'मुस्लिम (Muslims)', pct: '19.3%', color: 'border-blue-400 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200' },
            { key: 'jatav', label: 'जाटव / दलित (Jatav / Dalit)', pct: '11.8%', color: 'border-purple-400 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-200' },
            { key: 'yadav', label: 'यादव (Yadav)', pct: '9.5%', color: 'border-red-400 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200' },
            { key: 'brahmin', label: 'ब्राह्मण (Brahmin)', pct: '9.5%', color: 'border-indigo-400 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' },
            { key: 'kurmi', label: 'कुर्मी / पटेल (Kurmi)', pct: '7.5%', color: 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' },
            { key: 'rajput', label: 'ठाकुर / राजपूत (Thakur)', pct: '7.2%', color: 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200' },
            { key: 'maurya', label: 'मौर्या / कुशवाहा / शाक्य', pct: '6.8%', color: 'border-teal-400 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200' },
            { key: 'nishad', label: 'निषाद / कश्यप / मल्लाह', pct: '4.5%', color: 'border-cyan-400 bg-cyan-50 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200' },
            { key: 'pasi', label: 'पासी (Pasi)', pct: '3.8%', color: 'border-purple-400 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-200' },
            { key: 'jat', label: 'जाट (Jat)', pct: '3.6%', color: 'border-green-400 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' },
            { key: 'rajbhar', label: 'राजभर (Rajbhar)', pct: '2.4%', color: 'border-orange-400 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200' },
            { key: 'gujjar', label: 'गुर्जर (Gujjar)', pct: '2.2%', color: 'border-lime-400 bg-lime-50 text-lime-800 dark:bg-lime-950 dark:text-lime-200' },
            { key: 'other_obc', label: 'अन्य MBC / अति पिछड़ा', pct: '8.5%', color: 'border-yellow-400 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' },
            { key: 'other_sc', label: 'धोबी, कोरी, बाल्मीकि SC', pct: '5.5%', color: 'border-purple-400 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-200' }
          ].map(c => {
            const active = coalition[c.key];
            return (
              <button
                key={c.key}
                onClick={() => setCoalition(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  active 
                    ? `${c.color} ring-2 ring-red-500/40 shadow-xs font-extrabold` 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[10px] ${active ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'}`}>
                  ✓
                </span>
                <span>{c.label}</span>
                <span className="font-mono text-[10px] opacity-75">({c.pct})</span>
              </button>
            );
          })}
        </div>

        {/* Live Probability Result Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
                चयनित सामाजिक आधार (Simulated Coalition Vote Base):
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {simulatedVoteShare}%
              </span>
            </div>

            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                simulatedVoteShare >= 45 ? 'bg-purple-600 text-white' :
                simulatedVoteShare >= 38.5 ? 'bg-emerald-600 text-white' :
                simulatedVoteShare >= 34 ? 'bg-amber-600 text-white' :
                'bg-rose-600 text-white'
              }`}>
                {simulatedVoteShare >= 45 ? '🟣 ऐतिहासिक लहर (300+ सीटें)' :
                 simulatedVoteShare >= 38.5 ? '🟢 स्पष्ट पूर्ण बहुमत (240-280 सीटें)' :
                 simulatedVoteShare >= 34 ? '🟡 कड़ा मुकाबला (180-210 सीटें)' :
                 '🔴 गठबंधन विस्तार की आवश्यकता'}
              </span>
            </div>
          </div>

          {/* Visual Progress Bar with Threshold Marker */}
          <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                simulatedVoteShare >= 38.5 ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-amber-500 to-red-500'
              }`}
              style={{ width: `${Math.min(100, simulatedVoteShare)}%` }}
            />
            {/* 40% Target marker line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-black dark:bg-white z-10"
              style={{ left: '40%' }}
              title="बहुमत थ्रेशोल्ड (40%)"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>0%</span>
            <span>20%</span>
            <span className="font-bold text-red-600 dark:text-red-400">↑ 40% (जीत का पैमाना)</span>
            <span>60%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 4. Controls, Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
          {['All', 'Western UP', 'Rohilkhand', 'Braj', 'Awadh', 'Bundelkhand', 'Purvanchal'].map(reg => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {reg === 'All' ? 'सभी 75 ज़िले' : reg}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="खोजें: ज़िला या जाति..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="name">क्रम: अ से ज्ञ (A to Z)</option>
            <option value="pda">सर्वाधिक PDA जनाधार %</option>
            <option value="muslim">सर्वाधिक मुस्लिम %</option>
            <option value="yadav">सर्वाधिक यादव %</option>
            <option value="dalit">सर्वाधिक दलित (SC) %</option>
            <option value="kurmi">सर्वाधिक कुर्मी %</option>
            <option value="brahmin">सर्वाधिक ब्राह्मण %</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="कार्ड व्यू"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="तालिका व्यू"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Content Presentation: Cards or Spreadsheet Table */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 font-mono text-sm animate-pulse">
          उत्तर प्रदेश के 75 जनपदों का जातिगत समीकरण लोड हो रहा है...
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDistricts.map(dist => (
            <div
              key={dist.district_name}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {dist.district_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-bold text-slate-500">
                        {dist.region}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {dist.total_acs} ACs
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {dist.total_pcs} PCs
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase">
                      PDA जनाधार
                    </span>
                    <span className="text-lg font-black text-red-600 dark:text-red-400 font-mono">
                      {dist.pda_potential}%
                    </span>
                  </div>
                </div>

                {/* 4-Color Group Breakdown Bar */}
                <div className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold">
                    <span className="text-emerald-700 dark:text-emerald-400">OBC: {dist.obc_total}%</span>
                    <span className="text-purple-700 dark:text-purple-400">SC: {dist.sc_total}%</span>
                    <span className="text-blue-700 dark:text-blue-400">अल्पसंख्यक: {dist.minority_total}%</span>
                    <span className="text-amber-700 dark:text-amber-400">सामान्य: {dist.general_total}%</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                    <div style={{ width: `${dist.obc_total}%` }} className="bg-emerald-500" title={`OBC: ${dist.obc_total}%`} />
                    <div style={{ width: `${dist.sc_total}%` }} className="bg-purple-500" title={`SC: ${dist.sc_total}%`} />
                    <div style={{ width: `${dist.minority_total}%` }} className="bg-blue-500" title={`अल्पसंख्यक: ${dist.minority_total}%`} />
                    <div style={{ width: `${dist.general_total}%` }} className="bg-amber-500" title={`सामान्य: ${dist.general_total}%`} />
                  </div>
                </div>

                {/* Dominant Communities Tags */}
                <div className="space-y-1 py-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    प्रमुख निर्णायक जातियां (Dominant Blocs):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dist.dominant_communities.map((comm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {comm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tactical Strategic Note */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 block mb-0.5">चुनावी सामाजिक धुरी:</span>
                  {dist.strategic_summary}
                </div>
              </div>

              {/* Action Button: Trigger Rally Speech Modal */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenGroundIntel(dist.district_name)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-red-600/20 transition-all cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>🎙️ {dist.district_name} भाषण व ग्राउंड रिपोर्ट</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* FULL SPREADSHEET TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-300">
                  <th className="p-3">ज़िला</th>
                  <th className="p-3">प्रमंडल</th>
                  <th className="p-3 text-center">ACs</th>
                  <th className="p-3 text-center text-red-600">PDA %</th>
                  <th className="p-3 text-center text-emerald-600">OBC %</th>
                  <th className="p-3 text-center text-purple-600">SC %</th>
                  <th className="p-3 text-center text-blue-600">मुस्लिम %</th>
                  <th className="p-3 text-center text-amber-600">सामान्य %</th>
                  <th className="p-3">प्रमुख समुदाय</th>
                  <th className="p-3 text-right">मंच भाषण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDistricts.map(dist => (
                  <tr key={dist.district_name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                      {dist.district_name}
                    </td>
                    <td className="p-3 text-slate-500 font-semibold">{dist.region}</td>
                    <td className="p-3 text-center font-mono font-bold">{dist.total_acs}</td>
                    <td className="p-3 text-center font-mono font-black text-red-600 dark:text-red-400 bg-red-50/40 dark:bg-red-950/20">
                      {dist.pda_potential}%
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {dist.obc_total}%
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-purple-700 dark:text-purple-400">
                      {dist.sc_total}%
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-blue-700 dark:text-blue-400">
                      {dist.minority_total}%
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-700 dark:text-amber-400">
                      {dist.general_total}%
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 dark:text-slate-300">
                      {dist.dominant_communities.slice(0, 3).join(', ')}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenGroundIntel(dist.district_name)}
                        className="px-2.5 py-1 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-lg font-bold hover:bg-red-100 transition-colors text-xs"
                      >
                        भाषण →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Embedded Ground Intelligence & Rally Speech Modal */}
      <DistrictRallyDossierModal
        isOpen={isGroundModalOpen}
        onClose={() => setIsGroundModalOpen(false)}
        data={selectedGroundDistrict}
        loading={groundModalLoading}
      />

    </div>
  );
};
