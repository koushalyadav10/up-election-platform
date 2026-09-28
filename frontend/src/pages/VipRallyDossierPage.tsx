import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Share2, 
  Check, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Flame, 
  Award, 
  ShieldAlert, 
  Sparkles, 
  Building, 
  Wheat, 
  ChevronDown, 
  RefreshCw,
  FileText,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  fetchAllGroundIntelligence, 
  fetchDistrictGroundIntelligence, 
  fetchCasteMatrix,
  DistrictGroundIntelligence, 
  DistrictCasteProfile,
  PromiseVsReality,
  IncumbentAccountability
} from '../services/api';

export const VipRallyDossierPage: React.FC = () => {
  const [districtsMap, setDistrictsMap] = useState<Record<string, DistrictGroundIntelligence>>({});
  const [districtNames, setDistrictNames] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Gorakhpur');
  const [currentIntel, setCurrentIntel] = useState<DistrictGroundIntelligence | null>(null);
  const [casteProfile, setCasteProfile] = useState<DistrictCasteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchAllGroundIntelligence(),
      fetchCasteMatrix()
    ]).then(([intelData, casteData]: [Record<string, DistrictGroundIntelligence>, any]) => {
      setDistrictsMap(intelData);
      const names = Object.keys(intelData).sort();
      setDistrictNames(names);
      
      const defaultDist = names.includes('Gorakhpur') ? 'Gorakhpur' : names[0];
      setSelectedDistrict(defaultDist);
      setCurrentIntel(intelData[defaultDist] || null);

      if (casteData && casteData.districts) {
        const matched = casteData.districts.find(
          (d: DistrictCasteProfile) => d.district_name.toLowerCase() === defaultDist.toLowerCase()
        );
        setCasteProfile(matched || null);
      }
    }).catch((err: any) => {
      console.error("Error loading dossier data:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleSelectDistrict = (distName: string) => {
    setSelectedDistrict(distName);
    const intel = districtsMap[distName] || null;
    setCurrentIntel(intel);

    // Also fetch individual ground intel to ensure caste_profile is attached
    fetchDistrictGroundIntelligence(distName)
      .then((res: DistrictGroundIntelligence) => {
        setCurrentIntel(res);
        if (res.caste_profile) {
          setCasteProfile(res.caste_profile);
        }
      })
      .catch(() => {});
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    if (!currentIntel) return;
    navigator.clipboard.writeText(currentIntel.whatsapp_format);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading || !currentIntel) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            वीआईपी रैली ब्रीफिंग बुकलेट लोड हो रही है...
          </p>
        </div>
      </div>
    );
  }

  const pdaPct = casteProfile?.pda_potential || 78.5;
  const subCastes = casteProfile?.sub_castes;
  const cueCard = currentIntel.print_cue_card;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-2 sm:p-6 print:p-0 print:bg-white animate-fade-in text-slate-900">
      
      {/* Top Action Ribbon (Hidden when printing) */}
      <div className="max-w-5xl mx-auto mb-6 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-600/30 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                1-क्लिक "रैली वीआईपी ब्रीफिंग बुकलेट"
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
                4-PAGE PDF
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              मंच पर बोलने से पहले वरिष्ठ नेताओं और समन्वयकों के लिए तैयार गोपनीय रणनीतिक दस्तावेज।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* District Dropdown */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => handleSelectDistrict(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer shadow-xs"
            >
              {districtNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
            title="WhatsApp ब्रीफिंग कॉपी करें"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'कॉपी हुआ!' : 'WhatsApp शेयर'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/30 transition-all cursor-pointer"
            title="4-पेज A4 बुकलेट प्रिंट या PDF सेव करें"
          >
            <Printer className="w-4 h-4" />
            <span>PDF / प्रिंट बुकलेट</span>
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        4-PAGE PRINTABLE EXECUTIVE BOOKLET CONTAINER
        ========================================================================
      */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:max-w-none print:w-full">
        
        {/* 
          ----------------------------------------------------------------------
          PAGE 1: जिला परिचय, निर्वाचन क्षेत्र व जातिगत समीकरण (PDA Matrix)
          ----------------------------------------------------------------------
        */}
        <div className="bg-white p-5 sm:p-10 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-8 print:rounded-none min-h-auto print:min-h-[1050px] flex flex-col justify-between" style={{ pageBreakAfter: 'always', breakAfter: 'page' }}>
          <div>
            {/* Header Banner */}
            <div className="border-b-2 border-red-600 pb-4 mb-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  गोपनीय • वीआईपी चुनावी रैली डॉसियर (2027)
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-1">
                  जनपद: {currentIntel.district_name}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  क्षेत्र: <strong>{currentIntel.region}</strong> • मुख्यालय: <strong>{currentIntel.headquarters}</strong> • ODOP: <strong>{currentIntel.odop_product}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-400 block">दस्तावेज संख्या: SP-UP27-{currentIntel.district_id}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block mt-1 border border-emerald-200">
                  पेज 1 / 4 • सामाजिक समीकरण
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">विधानसभा सीटें</span>
                <strong className="text-lg font-black text-slate-900">{currentIntel.total_acs}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">लोकसभा सीटें</span>
                <strong className="text-lg font-black text-slate-900">{currentIntel.total_pcs}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">2022 विधानसभा</span>
                <strong className="text-xs font-black text-slate-800 block mt-1">
                  {Object.entries(currentIntel.party_tally_2022).map(([k, v]) => `${k}:${v}`).join(' ')}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">2024 लोकसभा लीड</span>
                <strong className="text-xs font-black text-blue-700 block mt-1">
                  {Object.entries(currentIntel.party_tally_2024).map(([k, v]) => `${k}:${v}`).join(' ')}
                </strong>
              </div>
            </div>

            {/* Caste Equations & PDA Composition */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-600" />
                  सामाजिक व जातिगत समीकरण (PDA Matrix)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-600 text-white">
                  संयुक्त PDA सामाजिक आधार: {pdaPct}%
                </span>
              </div>

              {/* Caste Breakdown Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">अन्य पिछड़ा वर्ग (OBC)</span>
                  <span className="text-xl font-black text-amber-900">{casteProfile?.obc_total || 42.0}%</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">अनुसूचित जाति (SC)</span>
                  <span className="text-xl font-black text-blue-900">{casteProfile?.sc_total || 22.0}%</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">अल्पसंख्यक (Muslim)</span>
                  <span className="text-xl font-black text-emerald-900">{casteProfile?.minority_total || 14.5}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 uppercase block">सामान्य वर्ग (General)</span>
                  <span className="text-xl font-black text-slate-800">{casteProfile?.general_total || 21.5}%</span>
                </div>
              </div>

              {/* Sub-Castes Table if available */}
              {subCastes && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    प्रमुख उप-जातियों की अनुमानित आबादी (Sub-Caste Breakdown):
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                    {subCastes.yadav !== undefined && (
                      <div className="p-1.5 rounded bg-white border border-slate-200">
                        यादव: <strong>{subCastes.yadav}%</strong>
                      </div>
                    )}
                    {subCastes.kurmi_patel !== undefined && (
                      <div className="p-1.5 rounded bg-white border border-slate-200">
                        कुर्मी / पटेल: <strong>{subCastes.kurmi_patel}%</strong>
                      </div>
                    )}
                    {subCastes.maurya_kushwaha_saini !== undefined && (
                      <div className="p-1.5 rounded bg-white border border-slate-200">
                        मौर्या / कुशवाहा: <strong>{subCastes.maurya_kushwaha_saini}%</strong>
                      </div>
                    )}
                    {subCastes.jatav !== undefined && (
                      <div className="p-1.5 rounded bg-white border border-slate-200">
                        जाटव: <strong>{subCastes.jatav}%</strong>
                      </div>
                    )}
                    {subCastes.pasi !== undefined && (
                      <div className="p-1.5 rounded bg-white border border-slate-200">
                        पासी: <strong>{subCastes.pasi}%</strong>
                      </div>
                    )}
                    {subCastes.nishad_kashyap_bind !== undefined && (
                      <div className="p-1.5 rounded bg-white border border-slate-200">
                        निषाद / बिंद: <strong>{subCastes.nishad_kashyap_bind}%</strong>
                      </div>
                    )}
                    {subCastes.muslim_total !== undefined && (
                      <div className="p-1.5 rounded bg-white border border-slate-200">
                        मुस्लिम समाज: <strong>{subCastes.muslim_total}%</strong>
                      </div>
                    )}
                    {subCastes.brahmin !== undefined && (
                      <div className="p-1.5 rounded bg-white border border-slate-200">
                        ब्राह्मण: <strong>{subCastes.brahmin}%</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Strategic Sociological Gameplan */}
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 text-xs text-slate-800 leading-relaxed">
                <strong className="text-red-700 block mb-1">🎯 जीत का सामाजिक गणित:</strong>
                {casteProfile?.strategic_summary || `${currentIntel.district_name} में पीडीए का संयुक्त आधार लगभग ${pdaPct}% है। यदि पिछड़े, दलित और अल्पसंख्यक मतदाताओं का अटूट गठजोड़ जमीन पर कायम रहता है, तो 38-42% का जीत का पैमाना सभी विधानसभा क्षेत्रों में सरलता से प्राप्त किया जा सकता है।`}
              </div>
            </div>

            {/* Assembly Constituencies List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                विधानसभा क्षेत्रों की सूची ({currentIntel.assembly_constituencies.length} सीटें):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentIntel.assembly_constituencies.map((ac: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-800">
                    {ac}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
            <span>सपा वॉर रूम • मिशन यूपी 2027</span>
            <span>पेज 1 / 4 (पलटें 👉)</span>
          </div>
        </div>

        {/* 
          ----------------------------------------------------------------------
          PAGE 2: जमीनी हकीकत, टॉप 5 वायरल घोटाले व वादाखिलाफी
          ----------------------------------------------------------------------
        */}
        <div className="bg-white p-5 sm:p-10 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-8 print:rounded-none min-h-auto print:min-h-[1050px] flex flex-col justify-between" style={{ pageBreakAfter: 'always', breakAfter: 'page' }}>
          <div>
            {/* Header Banner */}
            <div className="border-b-2 border-red-600 pb-3 mb-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  गोपनीय • वीआईपी चुनावी रैली डॉसियर (2027)
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 mt-1">
                  {currentIntel.district_name}: टॉप 5 वायरल घोटाले व जमीनी हकीकत
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded inline-block border border-red-200">
                  पेज 2 / 4 • सरकार की विफलताएं
                </span>
              </div>
            </div>

            {/* Top 5 Viral Scandals */}
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                मंच से उठाने योग्य टॉप स्थानीय आक्रोश के मुद्दे (Viral Attack Points):
              </h3>
              
              <div className="space-y-2">
                {cueCard.attack_points.map((pt: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-red-50/60 border border-red-200 flex items-start gap-2.5 text-xs text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed font-medium">
                      {pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Promises vs Reality Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                सरकारी वादे बनाम जमीनी हकीकत (ऑडिट रिपोर्ट):
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-1/4">मुद्दा / टैग</th>
                      <th className="p-2.5 w-1/3">सरकार का चुनावी दावा</th>
                      <th className="p-2.5">धरातल पर वास्तविक सच</th>
                      <th className="p-2.5 w-20 text-center">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentIntel.promises_vs_reality.map((p: PromiseVsReality, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900">{p.tag}</td>
                        <td className="p-2.5 text-slate-600 italic">"{p.promise}"</td>
                        <td className="p-2.5 text-slate-800 font-medium">{p.reality}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'विफल' ? 'bg-red-100 text-red-800' :
                            p.status === 'जुमला' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
            <span>सपा वॉर रूम • मिशन यूपी 2027</span>
            <span>पेज 2 / 4 (पलटें 👉)</span>
          </div>
        </div>

        {/* 
          ----------------------------------------------------------------------
          PAGE 3: मंच भाषण सूत्र व स्थानीय जोशीले नारे
          ----------------------------------------------------------------------
        */}
        <div className="bg-white p-5 sm:p-10 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-8 print:rounded-none min-h-auto print:min-h-[1050px] flex flex-col justify-between" style={{ pageBreakAfter: 'always', breakAfter: 'page' }}>
          <div>
            {/* Header Banner */}
            <div className="border-b-2 border-red-600 pb-3 mb-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  गोपनीय • वीआईपी चुनावी रैली डॉसियर (2027)
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 mt-1">
                  {currentIntel.district_name}: मंच भाषण सूत्र &amp; नारे
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded inline-block border border-amber-200">
                  पेज 3 / 4 • मंच वक्तव्य
                </span>
              </div>
            </div>

            {/* Slogans for Audience Chanting */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 via-slate-50 to-emerald-50 border border-slate-200">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-700 block mb-2">
                🚩 मंच से जनता के साथ लगवाए जाने वाले नारे (Crowd Chants):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-900">
                {cueCard.key_slogans.map((slogan: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
                    <span className="text-red-600">⚡</span>
                    <span>"{slogan}"</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aggressive Speech Excerpt */}
            <div className="mb-5 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                1. आक्रामक मंच प्रहार (मुख्यमंत्री व स्थानीय नेताओं पर हमला):
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-[13px] leading-relaxed text-slate-800 whitespace-pre-line font-medium">
                {currentIntel.rally_speeches.aggressive}
              </div>
            </div>

            {/* Kisan Speech Excerpt */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-emerald-600" />
                2. किसान व ग्रामीण संवाद सूत्र:
              </span>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-[13px] leading-relaxed text-slate-800 whitespace-pre-line font-medium">
                {currentIntel.rally_speeches.kisan}
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
            <span>सपा वॉर रूम • मिशन यूपी 2027</span>
            <span>पेज 3 / 4 (पलटें 👉)</span>
          </div>
        </div>

        {/* 
          ----------------------------------------------------------------------
          PAGE 4: 2027 के 5 क्रांतिकारी संकल्प व ग्राउंड समन्वय
          ----------------------------------------------------------------------
        */}
        <div className="bg-white p-5 sm:p-10 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-8 print:rounded-none min-h-auto print:min-h-[1050px] flex flex-col justify-between">
          <div>
            {/* Header Banner */}
            <div className="border-b-2 border-red-600 pb-3 mb-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  गोपनीय • वीआईपी चुनावी रैली डॉसियर (2027)
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 mt-1">
                  {currentIntel.district_name}: 2027 समाजवादी संकल्प व ग्राउंड एक्शन
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                  पेज 4 / 4 • विजन व रणनीति
                </span>
              </div>
            </div>

            {/* 5 Vision Guarantees for District */}
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                2027 में हमारी सरकार आएगी तो {currentIntel.district_name} के लिए क्या करेंगे:
              </h3>

              <div className="space-y-2.5">
                {currentIntel.vision_2027.map((promise: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50/70 to-slate-50 border border-emerald-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {promise}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Incumbent Accountability / AC Checklist */}
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-blue-600" />
                विधानसभा वार स्थिति व जनआक्रोश रिपोर्ट:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentIntel.incumbent_accountability.slice(0, 6).map((item: IncumbentAccountability, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900">AC #{item.ac_no} {item.ac_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {item.mla_2022_party}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {item.accountability_notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Rally Instructions */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1.5 text-xs">
              <span className="font-extrabold uppercase text-amber-400 block tracking-wider">
                📌 रैली मंच व समन्वय दिशा-निर्देश:
              </span>
              <p className="text-slate-300 leading-relaxed">
                • मंच पर स्थानीय जिला अध्यक्ष, पूर्व सांसद व सभी विधानसभा प्रभारियों को साथ बैठाएं।
                <br />
                • भाषण में स्थानीय किसानों की खाद-बिजली किल्लत और स्थानीय युवाओं के पेपर लीक दर्द को प्राथमिकता दें।
                <br />
                • भाषण समाप्त करते समय PDA संकल्प और 2027 में समाजवादी पार्टी की पूर्ण बहुमत सरकार का नारा बुलंद करें।
              </p>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
            <span>सपा वॉर रूम • मिशन यूपी 2027 • प्रमाणित ECI एवं ग्राउंड इंटेलिजेंस</span>
            <span className="font-bold text-slate-700">समाप्त (बुकलेट पूर्ण)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
