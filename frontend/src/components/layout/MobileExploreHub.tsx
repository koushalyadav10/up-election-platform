import React from 'react';
import { PartySymbol } from '../common/PartySymbol';
import { LeaderAvatar } from '../common/LeaderAvatar';
import { 
  Compass, 
  MapPin, 
  Scale, 
  Flame, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  Vote
} from 'lucide-react';

interface MobileExploreHubProps {
  onNavigateTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenLeaderDossier: (name: string, candidateId?: number) => void;
}

const SPOTLIGHT_LEADERS = [
  { name: 'AKHILESH YADAV', hindi: 'अखिलेश यादव', party: 'SP', role: 'सांसद कन्नौज | सपा अध्यक्ष', photo: '/assets/leaders/akhilesh_yadav.jpg' },
  { name: 'ADITYANATH', hindi: 'योगी आदित्यनाथ', party: 'BJP', role: 'मुख्यमंत्री उप्र | विधायक', photo: '/assets/leaders/yogi_adityanath.jpg' },
  { name: 'RAHUL GANDHI', hindi: 'राहुल गांधी', party: 'INC', role: 'सांसद रायबरेली | नेता प्रतिपक्ष', photo: '/assets/leaders/rahul_gandhi.jpg' },
  { name: 'DIMPLE YADAV', hindi: 'डिंपल यादव', party: 'SP', role: 'सांसद मैनपुरी', photo: '/assets/leaders/dimple_yadav.jpg' },
  { name: 'CHANDRASHEKHAR', hindi: 'चंद्रशेखर आज़ाद', party: 'ASPKR', role: 'सांसद नगीना | आसपा अध्यक्ष', photo: '/assets/leaders/chandrashekhar_azad.jpg' },
  { name: 'NARENDRA MODI', hindi: 'नरेंद्र मोदी', party: 'BJP', role: 'सांसद वाराणसी | प्रधानमंत्री', photo: '/assets/leaders/narendra_modi.jpg' },
  { name: 'AFZAL ANSARI', hindi: 'अफजाल अंसारी', party: 'SP', role: 'सांसद गाज़ीपुर', photo: '/assets/leaders/afzal_ansari.jpg' },
  { name: 'MAYAWATI', hindi: 'सुश्री मायावती', party: 'BSP', role: 'राष्ट्रीय अध्यक्ष, बसपा', photo: '/assets/leaders/mayawati.jpg' },
  { name: 'JAYANT CHAUDHARY', hindi: 'जयंत चौधरी', party: 'RLD', role: 'केंद्रीय मंत्री | रालोद अध्यक्ष', photo: '/assets/leaders/jayant_chaudhary.jpg' },
  { name: 'SHIVPAL SINGH YADAV', hindi: 'शिवपाल यादव', party: 'SP', role: 'विधायक जसवंतनगर', photo: '/assets/leaders/shivpal_yadav.jpg' }
];

export const MobileExploreHub: React.FC<MobileExploreHubProps> = ({
  onNavigateTab,
  onOpenSearch,
  onOpenLeaderDossier
}) => {
  return (
    <div className="block lg:hidden space-y-6">
      
      {/* 1. SPOTLIGHT: Prominent Leaders Dossier Quick-Tap Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 rounded-2xl border border-blue-900/50 shadow-md text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="text-xs font-bold tracking-tight uppercase font-mono text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              शीर्ष नेताजी चुनावी प्रोफाइल (Netaji Dossiers)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">फोटो पर क्लिक करें</span>
        </div>

        {/* Horizontal Scroll of Passport Photos */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
          {SPOTLIGHT_LEADERS.map((leader, i) => (
            <div
              key={i}
              onClick={() => onOpenLeaderDossier(leader.name)}
              className="shrink-0 flex flex-col items-center text-center cursor-pointer group active:scale-95 transition-transform snap-start w-[84px] px-1"
            >
              <LeaderAvatar
                name={leader.name}
                party={leader.party}
                photoUrl={leader.photo}
                size="md"
                shape="passport"
                showBadge={true}
                className="ring-2 ring-white/20 group-hover:ring-blue-400 transition-all shadow-sm"
              />
              <span className="font-bold text-[11px] text-slate-100 group-hover:text-blue-300 transition-colors mt-1.5 truncate max-w-full leading-tight">
                {leader.hindi}
              </span>
              <span className="text-[9px] font-mono text-blue-300 font-bold uppercase block mt-0.5">
                {leader.party}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. THE MAIN MOBILE EXPLORATION CARD HUB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              चुनावी विश्लेषण केंद्र (Explore Modules)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              सभी 80 लोकसभा व 403 विधानसभाओं की संपूर्ण जानकारी
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Touch Cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          
          {/* Card 1: Lok Sabha (80 PCs) */}
          <div
            onClick={() => onNavigateTab('lok-sabha')}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-500 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Vote className="w-4 h-4" />
                </div>
                <div className="flex items-center -space-x-1">
                  <PartySymbol party="SP" size="xs" variant="icon" />
                  <PartySymbol party="BJP" size="xs" variant="icon" />
                  <PartySymbol party="INC" size="xs" variant="icon" />
                </div>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                80 लोकसभा सीटें
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                1991–2024 सांसद परिणाम, मार्जिन व वोट शेयर
              </p>
            </div>
            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <span>80 PCs खोलें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Vidhan Sabha (403 ACs) */}
          <div
            onClick={() => onNavigateTab('vidhan-sabha')}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-500 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  403 ACs
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                403 विधानसभा सीटें
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                2022 विधायक परिणाम व 2024 लोकसभा लीड्स
              </p>
            </div>
            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>403 सीटें देखें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Interactive UP Map */}
          <div
            onClick={() => onNavigateTab('map')}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-500 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <MapIcon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 font-mono">
                  Live GIS
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                इंटरैक्टिव नक्शा
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                80 PC व 403 AC का लाइव क्लोरोप्लेथ बाउंड्री मैप
              </p>
            </div>
            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>नक्शा खोलें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: 75 Districts Intelligence */}
          <div
            onClick={() => onNavigateTab('districts')}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-amber-500 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  75 ज़िले
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                75 जिला प्रोफाइल
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                सभी 75 जिलों की संपूर्ण राजनीतिक व बूथ रिपोर्ट
              </p>
            </div>
            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span>जिले देखें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: Road to 2027 War Room */}
          <div
            onClick={() => onNavigateTab('road-to-2027')}
            className="p-3.5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-gradient-to-br from-red-50/50 to-orange-50/30 dark:from-red-950/30 dark:to-slate-900 shadow-xs hover:border-red-500 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <PartySymbol party="SP" size="xs" variant="icon" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-red-900 dark:text-red-200 leading-tight">
                मिशन 2027 वॉर रूम
              </h3>
              <p className="text-[10px] text-red-700/80 dark:text-red-300/80 mt-1 leading-normal line-clamp-2">
                202+ बहुमत रणनीति, बूथ प्रबंधन व सीट विश्लेषण
              </p>
            </div>
            <div className="pt-2.5 mt-2 border-t border-red-200/60 dark:border-red-900/60 flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-red-400">
              <span>वॉर रूम खोलें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: AC Comparison Lab */}
          <div
            onClick={() => onNavigateTab('ac-comparison')}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-purple-500 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-500 font-mono">
                  Lab
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                AC तुलना लैब
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                2 से 4 विधानसभा सीटों की आमने-सामने तुलना
              </p>
            </div>
            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
              <span>तुलना करें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 7: Closest Contests */}
          <div
            onClick={() => onNavigateTab('close-contests')}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-amber-500 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-red-600">
                  &lt; 10k
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                कांटे की टक्कर
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                कम मार्जिन से हारी/जीती गई महत्वपूर्ण सीटें
              </p>
            </div>
            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span>सीटें देखें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 8: Electra AI Intelligence */}
          <div
            onClick={() => onNavigateTab('ask-ai')}
            className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/30 dark:to-slate-900 shadow-xs hover:border-indigo-500 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  AI Agent
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-tight">
                इलेक्ट्रा AI विश्लेषक
              </h3>
              <p className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80 mt-1 leading-normal line-clamp-2">
                ECI डेटा पर आधारित तत्काल राजनीतिक विश्लेषण
              </p>
            </div>
            <div className="pt-2.5 mt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>सवाल पूछें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
