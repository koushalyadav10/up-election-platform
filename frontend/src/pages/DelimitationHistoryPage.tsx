import React, { useState } from 'react';
import { SourceBadge } from '../components/common/SourceBadge';
import { 
  GitBranch, 
  Layers, 
  FileText, 
  Download, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  History, 
  CheckCircle,
  HelpCircle,
  Info,
  Archive
} from 'lucide-react';

export const DelimitationHistoryPage: React.FC = () => {
  const [selectedEra, setSelectedEra] = useState<'2008_CURRENT' | '2000_2008' | '1976_2000'>('2008_CURRENT');

  const electionsCatalog = [
    { year: 2024, type: "Lok Sabha", seats: 80, era: "2008_CURRENT", winner: "SP (37) / INDIA (43)", turnout: "56.92%", doc: "ECI Detailed Result 33 & 34", format: "Excel / PDF", status: "Certified" },
    { year: 2022, type: "Vidhan Sabha", seats: 403, era: "2008_CURRENT", winner: "BJP (255) / NDA (273)", turnout: "60.8%", doc: "ECI Detailed Results 10", format: "Excel / PDF", status: "Certified" },
    { year: 2019, type: "Lok Sabha", seats: 80, era: "2008_CURRENT", winner: "BJP (62) / NDA (64)", turnout: "59.21%", doc: "ECI Detailed Result 33 & 34", format: "Excel / PDF", status: "Certified" },
    { year: 2017, type: "Vidhan Sabha", seats: 403, era: "2008_CURRENT", winner: "BJP (312) / NDA (325)", turnout: "61.11%", doc: "ECI Detailed Results", format: "Excel / PDF", status: "Certified" },
    { year: 2014, type: "Lok Sabha", seats: 80, era: "2008_CURRENT", winner: "BJP (71) / NDA (73)", turnout: "58.44%", doc: "ECI Detailed Results & Assembly Segments", format: "Excel / PDF", status: "Certified" },
    { year: 2012, type: "Vidhan Sabha", seats: 403, era: "2008_CURRENT", winner: "SP (224) - Absolute Majority", turnout: "59.40%", doc: "ECI Statistical Report 2012", format: "Official PDF", status: "Archived" },
    { year: 2009, type: "Lok Sabha", seats: 80, era: "2008_CURRENT", winner: "SP (23), INC (21), BSP (20), BJP (10)", turnout: "47.78%", doc: "ECI Statistical Report 2009", format: "Official PDF", status: "Archived" },
    { year: 2007, type: "Vidhan Sabha", seats: 403, era: "2000_2008", winner: "BSP (206) - Absolute Majority", turnout: "45.96%", doc: "ECI Statistical Report 2007", format: "Official PDF", status: "Archived" },
    { year: 2004, type: "Lok Sabha", seats: 80, era: "2000_2008", winner: "SP (35), BSP (19), BJP (10), INC (9)", turnout: "48.16%", doc: "ECI Statistical Report 2004 (Vol I-III)", format: "Official PDF", status: "Archived" },
    { year: 2002, type: "Vidhan Sabha", seats: 403, era: "2000_2008", winner: "SP (143), BSP (98), BJP (88)", turnout: "53.80%", doc: "ECI Statistical Report 2002", format: "Official PDF", status: "Archived" },
    { year: 1999, type: "Lok Sabha", seats: 85, era: "1976_2000", winner: "BJP (29), SP (26), BSP (14), INC (10)", turnout: "53.51%", doc: "ECI Statistical Report 1999 (Vol I-III)", format: "Official PDF", status: "Archived" },
    { year: 1998, type: "Lok Sabha", seats: 85, era: "1976_2000", winner: "BJP (57), SP (20), BSP (4)", turnout: "55.48%", doc: "ECI Statistical Report 1998 (Vol I-II)", format: "Official PDF", status: "Archived" },
    { year: 1996, type: "Lok Sabha", seats: 85, era: "1976_2000", winner: "BJP (52), SP (16), BSP (6), INC (5)", turnout: "46.52%", doc: "ECI Statistical Report 1996 (Vol I-II)", format: "Official PDF", status: "Archived" },
    { year: 1996, type: "Vidhan Sabha", seats: 425, era: "1976_2000", winner: "BJP (174), SP (110), BSP (67), INC (33)", turnout: "55.57%", doc: "ECI Statistical Report 1996", format: "Official PDF", status: "Archived" },
    { year: 1993, type: "Vidhan Sabha", seats: 425, era: "1976_2000", winner: "BJP (177), SP-BSP Alliance (176: SP 109, BSP 67)", turnout: "57.44%", doc: "ECI Statistical Report 1993", format: "Official PDF", status: "Archived" },
    { year: 1991, type: "Lok Sabha", seats: 85, era: "1976_2000", winner: "BJP (51), JD (22), JP (4), INC (5)", turnout: "49.19%", doc: "ECI Statistical Report 1991 (Vol I-II)", format: "Official PDF", status: "Archived" },
    { year: 1991, type: "Vidhan Sabha", seats: 425, era: "1976_2000", winner: "BJP (221) - Kalyan Singh Government", turnout: "48.58%", doc: "ECI Statistical Report 1991", format: "Official PDF", status: "Archived" }
  ];

  const seatChanges2008 = [
    { type: "ABOLISHED", pc: "Balrampur", details: "Dissolved into newly created Shrawasti and Gonda assembly segments." },
    { type: "ABOLISHED", pc: "Bilgram", details: "Reconstituted into Misrikh (SC) and Hardoi parliamentary constituencies." },
    { type: "ABOLISHED", pc: "Jalesar", details: "Segments distributed between Firozabad, Etah, and Agra." },
    { type: "ABOLISHED", pc: "Ghatampur", details: "Replaced by Akbarpur Lok Sabha seat in Kanpur Dehat." },
    { type: "ABOLISHED", pc: "Saidpur", details: "Abolished as PC; became an assembly segment under Machhlishahr / Ghazipur." },
    { type: "ABOLISHED", pc: "Chail", details: "Restructured into Kaushambi (SC) parliamentary constituency." },
    { type: "ABOLISHED", pc: "Hapur (LS)", details: "Segments divided between Meerut and Ghaziabad." },
    { type: "ABOLISHED", pc: "Padrauna (LS)", details: "Renamed and restructured as Kushi Nagar." },
    { type: "ABOLISHED", pc: "Khalilabad", details: "Renamed and restructured as Sant Kabir Nagar." },
    { type: "NEW", pc: "Gautam Buddha Nagar", details: "Created out of parts of Khurja and Bulandshahr to cover Noida/Greater Noida." },
    { type: "NEW", pc: "Fatehpur Sikri", details: "Carved out from Agra rural and Mathura borders." },
    { type: "NEW", pc: "Nagina (SC)", details: "Created in Bijnor district as a reserved SC constituency." },
    { type: "NEW", pc: "Kaushambi (SC)", details: "Formed from erstwhile Chail and Allahabad rural segments." },
    { type: "NEW", pc: "Shrawasti", details: "Created combining parts of Balrampur and Bahraich." },
    { type: "NEW", pc: "Akbarpur", details: "Created replacing Ghatampur, encompassing Kanpur Dehat & Kanpur Nagar." }
  ];

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. Header */}
      <div className="border-b border-[#E2DFD6] dark:border-[#2A302B] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded bg-[#B85C38]/10 text-[#B85C38] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5" /> DELIMITATION &amp; HISTORICAL ARCHIVE (1991–2024)
          </span>
          <SourceBadge type="OFFICIAL" document="ECI Delimitation Orders (1976 &amp; 2008)" />
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#171918] dark:text-[#F1EFE8] tracking-tight">
          Uttar Pradesh Electoral Evolution &amp; Delimitation Tracker
        </h1>
        <p className="text-sm text-[#626762] dark:text-[#A8ADA7] mt-1.5 max-w-3xl leading-relaxed">
          Full tracking of constituency boundary reorganizations across three historical eras: <strong>1976–2000 Undivided UP</strong> (85 PCs / 425 ACs), <strong>2000–2008 Post-Uttarakhand</strong> (80 PCs / 403 ACs), and <strong>2008–Present Justice Kuldip Singh Delimitation</strong>.
        </p>
      </div>

      {/* 2. Three Delimitation Eras Interactive Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Era 1: 2008 to Current */}
        <div 
          onClick={() => setSelectedEra('2008_CURRENT')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            selectedEra === '2008_CURRENT'
              ? 'border-[#B85C38] bg-white dark:bg-[#181B19] shadow-md ring-1 ring-[#B85C38]'
              : 'border-[#E2DFD6] dark:border-[#2A302B] bg-[#F7F5EF] dark:bg-[#202421] hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">
              CURRENT ERA
            </span>
            <span className="text-xs text-gray-500 font-mono">2008 – Present</span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#171918] dark:text-[#F1EFE8] mt-2">
            2008 Delimitation Commission
          </h3>
          <div className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-1">
            Justice Kuldip Singh Commission (2001 Census)
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between text-xs font-mono">
            <span>80 Lok Sabha PCs</span>
            <span className="font-bold text-[#B85C38]">403 Vidhan Sabha ACs</span>
          </div>
        </div>

        {/* Era 2: 2000 to 2008 */}
        <div 
          onClick={() => setSelectedEra('2000_2008')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            selectedEra === '2000_2008'
              ? 'border-[#B85C38] bg-white dark:bg-[#181B19] shadow-md ring-1 ring-[#B85C38]'
              : 'border-[#E2DFD6] dark:border-[#2A302B] bg-[#F7F5EF] dark:bg-[#202421] hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
              TRANSITION ERA
            </span>
            <span className="text-xs text-gray-500 font-mono">2000 – 2008</span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#171918] dark:text-[#F1EFE8] mt-2">
            Post-Uttarakhand Bifurcation
          </h3>
          <div className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-1">
            5 PCs &amp; 22 ACs separated to form Uttarakhand
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between text-xs font-mono">
            <span>80 Lok Sabha PCs</span>
            <span className="font-bold text-[#B85C38]">403 Vidhan Sabha ACs</span>
          </div>
        </div>

        {/* Era 3: 1976 to 2000 */}
        <div 
          onClick={() => setSelectedEra('1976_2000')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            selectedEra === '1976_2000'
              ? 'border-[#B85C38] bg-white dark:bg-[#181B19] shadow-md ring-1 ring-[#B85C38]'
              : 'border-[#E2DFD6] dark:border-[#2A302B] bg-[#F7F5EF] dark:bg-[#202421] hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
              HISTORIC ERA
            </span>
            <span className="text-xs text-gray-500 font-mono">1976 – 2000</span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#171918] dark:text-[#F1EFE8] mt-2">
            Undivided Uttar Pradesh
          </h3>
          <div className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-1">
            Original 1976 Delimitation based on 1971 Census
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between text-xs font-mono">
            <span>85 Lok Sabha PCs</span>
            <span className="font-bold text-[#B85C38]">425 Vidhan Sabha ACs</span>
          </div>
        </div>

      </div>

      {/* 3. Era Deep-Dive Information Card */}
      <div className="bg-white dark:bg-[#181B19] rounded-xl border border-[#D5D1C8] dark:border-[#2A302B] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-[#B85C38]" />
          <h2 className="font-display font-bold text-xl text-[#171918] dark:text-[#F1EFE8]">
            {selectedEra === '2008_CURRENT' && "2008 Delimitation Commission Details (Current Order)"}
            {selectedEra === '2000_2008' && "2000–2008 Post-Bifurcation Era Architecture"}
            {selectedEra === '1976_2000' && "1976–2000 Undivided Uttar Pradesh Architecture"}
          </h2>
        </div>

        {selectedEra === '2008_CURRENT' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#626762] dark:text-[#A8ADA7] leading-relaxed">
            <p>
              The <strong>Delimitation Order 2008</strong> was notified on 19 February 2008 by the Delimitation Commission headed by retired Supreme Court Justice Kuldip Singh. It came into force for the 2009 Lok Sabha General Election and the 2012 Uttar Pradesh Vidhan Sabha Election.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-3.5 rounded-lg bg-[#F7F5EF] dark:bg-[#202421] border border-[#E2DFD6] dark:border-[#2A302B]">
                <div className="font-bold text-[#171918] dark:text-[#F1EFE8] mb-1">Key Structural Changes:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>80 Lok Sabha PCs retained, but 9 old PCs abolished and 7 new PCs created.</li>
                  <li>403 Vidhan Sabha ACs completely redrawn according to 2001 census population quotas.</li>
                  <li>17 Lok Sabha PCs reserved for Scheduled Castes (SC). Zero ST PCs.</li>
                  <li>84 Assembly constituencies reserved for SC; 2 for ST (Obra and Duddhi in Sonbhadra).</li>
                </ul>
              </div>
              <div className="p-3.5 rounded-lg bg-[#F7F5EF] dark:bg-[#202421] border border-[#E2DFD6] dark:border-[#2A302B]">
                <div className="font-bold text-[#171918] dark:text-[#F1EFE8] mb-1">Impact on Political Calculations:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Rapidly urbanizing segments (Noida, Ghaziabad, Sahibabad, Lucknow) received proportional weightage.</li>
                  <li>Created heavy battleground seats in Paschim UP and Rohilkhand with altered demographic mixes.</li>
                  <li>Assembly segment mappings to PCs were made strictly contiguous within district lines.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {selectedEra === '2000_2008' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#626762] dark:text-[#A8ADA7] leading-relaxed">
            <p>
              On 9 November 2000, the <strong>Uttar Pradesh Reorganisation Act, 2000</strong> created the state of Uttaranchal (now Uttarakhand). This severed 13 hill districts from Uttar Pradesh.
            </p>
            <div className="p-4 rounded-lg bg-[#F7F5EF] dark:bg-[#202421] border border-[#E2DFD6] dark:border-[#2A302B] text-xs">
              <div className="font-bold text-[#171918] dark:text-[#F1EFE8] mb-1">Seats Transferred to Uttarakhand:</div>
              <div>5 Parliamentary Seats: <strong>Tehri Garhwal, Garhwal, Almora, Nainital, Haridwar</strong>.</div>
              <div className="mt-1">22 Assembly Constituencies across the Garhwal and Kumaon divisions.</div>
              <div className="mt-2 text-[#B85C38] font-bold">Residual UP Strength: Exactly 80 Lok Sabha and 403 Vidhan Sabha seats (1976 boundaries remained frozen).</div>
            </div>
          </div>
        )}

        {selectedEra === '1976_2000' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#626762] dark:text-[#A8ADA7] leading-relaxed">
            <p>
              The <strong>1976 Delimitation</strong> governed all elections from 1977 to 1999. Uttar Pradesh was undivided and had the largest contingent in Indian parliamentary history: <strong>85 Lok Sabha MPs and 425 Vidhan Sabha MLAs</strong>.
            </p>
            <div className="p-4 rounded-lg bg-[#F7F5EF] dark:bg-[#202421] border border-[#E2DFD6] dark:border-[#2A302B] text-xs">
              <div className="font-bold text-[#171918] dark:text-[#F1EFE8] mb-1">Historic Significance in UP Politics:</div>
              <div>Covered landmark political milestones: the 1991 Ram Janmabhoomi wave election, the 1993 SP-BSP coalition emergence, the 1996 united front era, and the 1998–1999 Vajpayee elections.</div>
            </div>
          </div>
        )}

      </div>

      {/* 4. 2008 Seat Alteration Catalog (Abolished vs Created) */}
      <div className="bg-white dark:bg-[#181B19] rounded-xl border border-[#D5D1C8] dark:border-[#2A302B] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#B85C38]" />
            <h3 className="font-display font-bold text-lg text-[#171918] dark:text-[#F1EFE8]">
              Delimitation 2008: Abolished vs Newly Created Constituencies
            </h3>
          </div>
          <span className="text-xs text-[#626762] dark:text-[#A8ADA7]">
            Official ECI Redrawing Registry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {seatChanges2008.map((seat, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                seat.type === 'ABOLISHED' 
                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30' 
                  : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30'
              }`}
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                seat.type === 'ABOLISHED' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {seat.type}
              </span>
              <div>
                <div className="font-bold text-[#171918] dark:text-[#F1EFE8] text-sm">
                  {seat.pc}
                </div>
                <div className="text-[#626762] dark:text-[#A8ADA7] mt-0.5">
                  {seat.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Complete 1991–2024 ECI Certified Historical Election Archive Table */}
      <div className="bg-white dark:bg-[#181B19] rounded-xl border border-[#D5D1C8] dark:border-[#2A302B] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E2DFD6] dark:border-[#2A302B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-[#B85C38]" />
              <h3 className="font-display font-bold text-lg text-[#171918] dark:text-[#F1EFE8]">
                Official ECI Historical Election Repository (1991–2024)
              </h3>
            </div>
            <p className="text-xs text-[#626762] dark:text-[#A8ADA7] mt-1">
              Every Lok Sabha and Vidhan Sabha election in Uttar Pradesh with official ECI source documents and Delimitation tags.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-[#ECEAE3] dark:bg-[#202421] px-2.5 py-1 rounded">
            17 Elections Documented
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F5EF] dark:bg-[#202421] border-b border-[#E2DFD6] dark:border-[#2A302B] text-[#626762] dark:text-[#A8ADA7] font-mono uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Election Type</th>
                <th className="py-2.5 px-3">Seats</th>
                <th className="py-2.5 px-3">Delimitation Era</th>
                <th className="py-2.5 px-3">Leading / Winning Party</th>
                <th className="py-2.5 px-3">Voter Turnout</th>
                <th className="py-2.5 px-3">ECI Official Document</th>
                <th className="py-2.5 px-3 text-center">Format</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD6] dark:divide-[#2A302B]">
              {electionsCatalog.map((e, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-[#202421]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#B85C38]">
                    {e.year}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#171918] dark:text-[#F1EFE8]">
                    {e.type}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    {e.seats}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      e.era === '2008_CURRENT' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' 
                        : e.era === '2000_2008'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {e.era.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#171918] dark:text-[#F1EFE8]">
                    {e.winner}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    {e.turnout}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#626762] dark:text-[#A8ADA7]">
                    {e.doc}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-mono font-bold">
                      {e.format}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                      {e.status}
                    </span>
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
