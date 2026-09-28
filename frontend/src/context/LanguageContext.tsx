import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Brand & General
  'platform.title': {
    en: 'UP ELECTION INTELLIGENCE',
    hi: 'उत्तर प्रदेश चुनावी मंच'
  },
  'platform.subtitle': {
    en: 'ECI Official Data Warehouse • 1991–2024',
    hi: 'भारत निर्वाचन आयोग आधिकारिक डेटा • 1991–2024'
  },
  'certified.badge': {
    en: 'CERTIFIED ECI REPOSITORY',
    hi: 'प्रमाणित ECI आधिकारिक डेटा'
  },
  
  // Navigation Tabs
  'nav.overview': {
    en: 'Overview',
    hi: 'अवलोकन'
  },
  'nav.road2027': {
    en: 'Road to 2027',
    hi: 'मिशन 2027'
  },
  'nav.road2027.badge': {
    en: 'Mission 202',
    hi: '202 बहुमत'
  },
  'nav.loksabha': {
    en: 'Lok Sabha (80)',
    hi: 'लोकसभा (80)'
  },
  'nav.vidhansabha': {
    en: 'Vidhan Sabha (403)',
    hi: 'विधानसभा (403)'
  },
  'nav.map': {
    en: 'Interactive Map',
    hi: 'इंटरैक्टिव मैप'
  },
  'nav.parties': {
    en: 'Parties',
    hi: 'राजनीतिक दल'
  },
  'nav.closeContests': {
    en: 'Close Contests',
    hi: 'करीबी मुकाबले'
  },
  'nav.delimitation': {
    en: 'Delimitation (1991–2024)',
    hi: 'परिसीमन इतिहास'
  },
  'nav.sources': {
    en: 'Data Sources',
    hi: 'ECI डेटा स्रोत'
  },
  'nav.scenario': {
    en: 'Scenario Lab',
    hi: 'सिनेरियो लैब'
  },
  'nav.askAI': {
    en: 'Ask Election AI',
    hi: 'चुनावी AI से पूछें'
  },
  'nav.more': {
    en: 'More Research',
    hi: 'अन्य शोध'
  },

  // Electoral Metrics
  'metric.winner': {
    en: 'Winner',
    hi: 'विजेता'
  },
  'metric.runnerUp': {
    en: 'Runner-Up',
    hi: 'निकटतम प्रतिद्वंद्वी'
  },
  'metric.margin': {
    en: 'Winning Margin',
    hi: 'जीत का अंतर'
  },
  'metric.turnout': {
    en: 'Turnout',
    hi: 'मतदान %'
  },
  'metric.totalElectors': {
    en: 'Total Electors',
    hi: 'कुल मतदाता'
  },
  'metric.validVotes': {
    en: 'Valid Votes',
    hi: 'वैध मत'
  },
  'metric.votesPolled': {
    en: 'Votes Polled',
    hi: 'डाले गए वोट'
  },
  'metric.seats': {
    en: 'Seats Won',
    hi: 'जीती गई सीटें'
  },
  'metric.voteShare': {
    en: 'Vote Share',
    hi: 'वोट शेयर'
  },

  // Controls & Actions
  'btn.back': {
    en: 'Back to Constituencies',
    hi: 'वापस सूची पर जाएँ'
  },
  'btn.download': {
    en: 'Download Official File',
    hi: 'ECI फाइल डाउनलोड करें'
  },
  'btn.search': {
    en: 'Search constituency or district...',
    hi: 'संसदीय क्षेत्र या ज़िला खोजें...'
  },
  'btn.selectYear': {
    en: 'Select Election Year',
    hi: 'चुनाव का वर्ष चुनें'
  },
  'btn.print': {
    en: 'Print Dossier',
    hi: 'रिपोर्ट प्रिंट करें'
  },

  // Road to 2027
  'strat.majorityMark': {
    en: 'Majority Mark: 202 Seats',
    hi: 'बहुमत का जादुई आंकड़ा: 202 सीटें'
  },
  'strat.spSoloNeeded': {
    en: 'SP Solo: Needs +19 Seats',
    hi: 'सपा अकेले: +19 सीटों की आवश्यकता'
  },
  'strat.battlegrounds': {
    en: 'Battleground Seats (<5K margin)',
    hi: 'कड़े मुकाबले वाली सीटें (<5 हजार अंतर)'
  },
  'strat.primeFlips': {
    en: 'Prime Flips (SP/INDIA gained in 2024)',
    hi: 'प्राइम फ्लिप (2024 में सपा/इंडिया द्वारा छीनी सीटें)'
  },
  'strat.fortresses': {
    en: 'Fortresses (3+ consecutive wins)',
    hi: 'अभेद्य किले (लगातार 3+ जीत)'
  },
  'strat.defensiveAlert': {
    en: 'Defensive Alert (Won 2022, Trailed 2024)',
    hi: 'सुरक्षा अलर्ट (2022 जीते, 2024 में पिछड़े)'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('up_election_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('up_election_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
