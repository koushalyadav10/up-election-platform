import React, { useState } from 'react';
import { 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Vote, 
  Sparkles, 
  CheckCircle2, 
  BarChart3,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CycleData {
  id: string;
  cycleLabel: string;
  vsYear: number;
  vsWinner: string;
  vsWinnerSeats: number;
  vsWinnerAlliance?: string;
  lsYear: number;
  lsResults: {
    party: string;
    seats: number;
    voteShare?: string;
    isLead?: boolean;
    color: string;
  }[];
  verdict: string;
  trendBadge: string;
  trendColor: string;
}

const HISTORICAL_CYCLES: CycleData[] = [
  {
    id: 'cycle-2007-2009',
    cycleLabel: 'चक्र 1 (Cycle 1)',
    vsYear: 2007,
    vsWinner: 'BSP (बसपा)',
    vsWinnerSeats: 206,
    vsWinnerAlliance: 'पूर्ण बहुमत (Mayawati)',
    lsYear: 2009,
    lsResults: [
      { party: 'SP', seats: 23, voteShare: '23.3%', isLead: true, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
      { party: 'INC', seats: 21, voteShare: '18.3%', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
      { party: 'BSP', seats: 20, voteShare: '27.4%', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
      { party: 'BJP', seats: 10, voteShare: '17.5%', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' }
    ],
    verdict: 'सत्तारूढ़ बसपा को लोकसभा में नुकसान हुआ। विपक्ष (सपा 23 + कांग्रेस 21) ने 44 सीटें जीतकर बढ़त बनाई।',
    trendBadge: 'सत्तारूढ़ दल को लोकसभा में झटका',
    trendColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/60'
  },
  {
    id: 'cycle-2012-2014',
    cycleLabel: 'चक्र 2 (Cycle 2)',
    vsYear: 2012,
    vsWinner: 'SP (सपा)',
    vsWinnerSeats: 224,
    vsWinnerAlliance: 'पूर्ण बहुमत (Akhilesh Yadav)',
    lsYear: 2014,
    lsResults: [
      { party: 'BJP+', seats: 73, voteShare: '43.6%', isLead: true, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
      { party: 'SP', seats: 5, voteShare: '22.4%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
      { party: 'INC', seats: 2, voteShare: '7.5%', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
      { party: 'BSP', seats: 0, voteShare: '19.8%', color: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400' }
    ],
    verdict: '2014 की मोदी लहर में पूर्ण बहुमत वाली सपा सरकार सिर्फ 5 पारिवारिक सीटों पर सिमट गई। बसपा शून्य पर रही।',
    trendBadge: 'सत्ताधारी सपा सिर्फ 5 सीटों पर सिमटी',
    trendColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300/60'
  },
  {
    id: 'cycle-2017-2019',
    cycleLabel: 'चक्र 3 (Cycle 3)',
    vsYear: 2017,
    vsWinner: 'BJP+ (भाजपा)',
    vsWinnerSeats: 325,
    vsWinnerAlliance: 'प्रचंड बहुमत (Yogi Adityanath)',
    lsYear: 2019,
    lsResults: [
      { party: 'BJP+', seats: 64, voteShare: '50.7%', isLead: true, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
      { party: 'BSP', seats: 10, voteShare: '19.4%', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
      { party: 'SP', seats: 5, voteShare: '18.1%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
      { party: 'INC', seats: 1, voteShare: '6.4%', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' }
    ],
    verdict: 'सपा-बसपा महागठबंधन के बावजूद भाजपा ने 64 सीटें जीतकर वर्चस्व रखा। गठबंधन ने 15 सीटें जीतीं।',
    trendBadge: 'भाजपा ने 64 सीटें बरकरार रखीं',
    trendColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/60'
  },
  {
    id: 'cycle-2022-2024',
    cycleLabel: 'चक्र 4 (Cycle 4)',
    vsYear: 2022,
    vsWinner: 'BJP+ (भाजपा)',
    vsWinnerSeats: 273,
    vsWinnerAlliance: 'BJP 255 + AD 12 + NISHAD 6',
    lsYear: 2024,
    lsResults: [
      { party: 'SP', seats: 37, voteShare: '33.6%', isLead: true, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
      { party: 'BJP+', seats: 36, voteShare: '44.3%', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
      { party: 'INC', seats: 6, voteShare: '9.5%', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
      { party: 'ASP', seats: 1, voteShare: '1.2%', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' }
    ],
    verdict: 'बड़ा राजनीतिक उलटफेर! सत्ताधारी भाजपा को पछाड़कर सपा (37) + कांग्रेस (6) = INDIA गठबंधन कुल 43 सीटें जीतकर नंबर-1 बना।',
    trendBadge: 'बड़ा उलटफेर: INDIA गठबंधन 43 सीटें',
    trendColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/60'
  }
];

export const AssemblyToLokSabhaTrendCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="bg-white dark:bg-[#181B19] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      
      {/* Top Bar Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 dark:from-slate-900/90 dark:via-[#181B19] dark:to-indigo-950/30 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-rose-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                विधानसभा बनाम आगामी लोकसभा चक्र और 2027 अनुमान
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                HISTORICAL POWER SHIFT
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              2007 से 2024 तक का राजनीतिक चक्र: राज्य में किसकी सरकार बनी और 2 साल बाद लोकसभा में क्या हुआ?
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isExpanded ? "कार्ड छोटा करें" : "कार्ड पूरा देखें"}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Content Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          
          {/* 4 Historical Cycles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {HISTORICAL_CYCLES.map(cycle => (
              <div 
                key={cycle.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 flex flex-col justify-between hover:shadow-xs transition-all"
              >
                <div>
                  {/* Cycle Header */}
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/70 dark:border-slate-800 text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {cycle.cycleLabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cycle.trendColor}`}>
                      {cycle.trendBadge}
                    </span>
                  </div>

                  {/* Vidhan Sabha Winner */}
                  <div className="mb-3 p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {cycle.vsYear} विधानसभा विजेता (403 सीटें)
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {cycle.vsWinner}
                      </span>
                      <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {cycle.vsWinnerSeats} सीटें
                      </span>
                    </div>
                    {cycle.vsWinnerAlliance && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        {cycle.vsWinnerAlliance}
                      </span>
                    )}
                  </div>

                  {/* Lok Sabha Performance (UP 80 Seats) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {cycle.lsYear} लोकसभा नतीजा (UP कुल 80 सीटें)
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {cycle.lsResults.map(r => (
                        <div 
                          key={r.party}
                          className={`p-1.5 rounded-md border flex items-center justify-between text-xs ${r.color} ${r.isLead ? 'ring-1 ring-emerald-500/50 font-bold' : ''}`}
                        >
                          <span>{r.party}</span>
                          <span className="font-mono font-extrabold text-[11px]">
                            {r.seats} {r.voteShare && <span className="font-normal text-[9px] opacity-75">({r.voteShare})</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verdict Note */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {cycle.verdict}
                </div>
              </div>
            ))}
          </div>

          {/* 2027 Projection & Expected Scenario Highlight Box */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden">
            
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              {/* Left Info Column */}
              <div className="space-y-2 lg:max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white border border-rose-400/30 flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    MISSION UP 2027
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    डेटा व ऐतिहासिक चक्र आधारित अनुमान
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  2027 विधानसभा चुनाव का अनुमान (Data-Driven Forecast)
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-300 font-semibold">2024 लोकसभा में 403 विधानसभाओं की बढ़त (AC Leads):</strong> 
                  {' '}सपा + कांग्रेस (INDIA गठबंधन) यूपी की <strong className="text-emerald-400 font-extrabold">238+ विधानसभा क्षेत्रों</strong> में आगे रहा, जबकि भाजपा गठबंधन 162 विधानसभा क्षेत्रों में रहा।
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    सपा + कांग्रेस AC लीड: 238 / 403
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold">
                    भाजपा + NDA AC लीड: 162 / 403
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400">
                    बसपा AC लीड: 0
                  </span>
                </div>
              </div>

              {/* Right Projection Metrics Column */}
              <div className="lg:w-80 shrink-0 bg-slate-900/90 rounded-xl p-3.5 border border-indigo-500/30 space-y-2.5 shadow-md">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                  2027 अनुमानित सीट संभावना (Projected Range)
                </span>

                {/* SP / INDIA */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/60 border border-emerald-600/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-xs text-emerald-200">सपा + INDIA गठबंधन</span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-emerald-300">
                    225 – 245 सीटें
                  </span>
                </div>

                {/* BJP / NDA */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/60 border border-amber-600/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="font-bold text-xs text-amber-200">भाजपा + NDA गठबंधन</span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-amber-300">
                    150 – 170 सीटें
                  </span>
                </div>

                {/* BSP / Others */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    <span className="font-bold text-xs text-slate-300">बसपा व अन्य दल</span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-slate-300">
                    2 – 6 सीटें
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 text-center">
                  ✨ यूपी में बहुमत का आंकड़ा: <strong className="text-white">202 सीटें</strong> (Total: 403)
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
