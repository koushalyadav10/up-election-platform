import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  User, 
  Flag, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Landmark, 
  Activity,
  Layers
} from 'lucide-react';
import { executeAdvancedSearch, AdvancedSearchResponse } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPC: (pcId: number) => void;
  onSelectAC?: (acNo: number) => void;
  onSelectDistrict?: (name: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPC,
  onSelectAC,
  onSelectDistrict
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdvancedSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      executeAdvancedSearch(query)
        .then(res => {
          setSearchResults(res);
          setLoading(false);
        })
        .catch(err => {
          console.error("Advanced search error:", err);
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PC, AC (e.g. Saharanpur, Behat), District, or queries like 'margin below 5000'..."
            className="w-full text-sm font-semibold bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose} 
            className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
          >
            ESC
          </button>
        </div>

        {/* Search Results Area */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono animate-pulse">
              Parsing natural-language analytical intent and indexing ECI database...
            </div>
          ) : !searchResults ? (
            <div className="py-8 text-center space-y-3">
              <div className="text-xs text-slate-400">Type at least 2 characters or try sample searches:</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["Saharanpur", "Lucknow", "Varanasi", "margin below 5000", "Amethi"].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Analytical Intent Interpretation Banner */}
              {searchResults.is_analytical && searchResults.analytical_interpretation && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[10px]">Analytical Query Interpreted:</span>
                    <div className="font-semibold mt-0.5">{searchResults.analytical_interpretation}</div>
                  </div>
                </div>
              )}

              {/* Analytical Matches */}
              {searchResults.analytical_matches && searchResults.analytical_matches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Analytical Matches ({searchResults.analytical_matches.length})
                  </div>
                  {searchResults.analytical_matches.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (item.ac_no && onSelectAC) onSelectAC(item.ac_no);
                        else if (item.pc_id) onSelectPC(item.pc_id);
                        onClose();
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.ac_name ? `AC #${item.ac_no} ${item.ac_name}` : `PC #${item.pc_no} ${item.pc_name}`}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Winner: <strong>{item.winner || item.lead}</strong> • Margin: <span className="font-mono text-amber-600 font-bold">{item.margin?.toLocaleString()} votes</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                </div>
              )}

              {/* Parliamentary Constituencies (PCs) */}
              {searchResults.pcs && searchResults.pcs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Landmark className="w-3 h-3 text-blue-600" />
                    Parliamentary Constituencies ({searchResults.pcs.length})
                  </div>
                  {searchResults.pcs.map(pc => (
                    <div
                      key={pc.id}
                      onClick={() => {
                        onSelectPC(pc.id);
                        onClose();
                      }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded">
                          PC {pc.pc_no}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{pc.name}</span>
                        <span className="text-[10px] text-slate-400">({pc.category})</span>
                      </div>
                      <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                        View PC <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Assembly Constituencies (ACs) */}
              {searchResults.acs && searchResults.acs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-600" />
                    Assembly Constituencies ({searchResults.acs.length})
                  </div>
                  {searchResults.acs.map(ac => (
                    <div
                      key={ac.ac_no}
                      onClick={() => {
                        if (onSelectAC) onSelectAC(ac.ac_no);
                        onClose();
                      }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded">
                          AC {ac.ac_no}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{ac.name}</span>
                        <span className="text-[10px] text-slate-400">District: {ac.district}</span>
                      </div>
                      <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                        Open AC Dossier <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Districts */}
              {searchResults.districts && searchResults.districts.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    Districts ({searchResults.districts.length})
                  </div>
                  {searchResults.districts.map(d => (
                    <div
                      key={d.name}
                      onClick={() => {
                        if (onSelectDistrict) onSelectDistrict(d.name);
                        onClose();
                      }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{d.name} District</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{d.region} Region</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        View District Dossier <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {searchResults.pcs.length === 0 && searchResults.acs.length === 0 && searchResults.districts.length === 0 && searchResults.analytical_matches.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching election records found for "{query}".
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
