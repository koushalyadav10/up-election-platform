import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  Building2, 
  Landmark, 
  ShieldCheck,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { 
  simulateSwing, 
  simulateStrategySwing, 
  SwingSimulationRequest, 
  SwingSimulationResult 
} from '../services/api';
import { SourceBadge } from '../components/common/SourceBadge';
import { ACDossierModal } from '../components/common/ACDossierModal';
import { useLanguage } from '../context/LanguageContext';

interface ScenarioLabPageProps {
  onSelectPC?: (pcId: number) => void;
}

export const ScenarioLabPage: React.FC<ScenarioLabPageProps> = ({ onSelectPC }) => {
  const { language } = useLanguage();
  
  // Simulator Mode: Assembly (403 ACs) vs Parliamentary (80 PCs)
  const [simulatorMode, setSimulatorMode] = useState<'Assembly' | 'Parliamentary'>('Assembly');
  
  // Parliamentary Swing State
  const [pcSwings, setPcSwings] = useState<Record<string, number>>({
    BJP: 0.0,
    SP: 0.0,
    INC: 0.0,
    BSP: 0.0,
    RLD: 0.0
  });
  const [pcResult, setPcResult] = useState<any | null>(null);

  // Assembly Swing State
  const [acParams, setAcParams] = useState<SwingSimulationRequest>({
    sp_swing_pct: 0.0,
    bjp_swing_pct: 0.0,
    bsp_transfer_to_sp_pct: 0.0,
    region_filter: undefined
  });
  const [acResult, setAcResult] = useState<SwingSimulationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [modalACNo, setModalACNo] = useState<number | null>(null);

  // Run simulation
  const handleRunSimulation = () => {
    setLoading(true);
    if (simulatorMode === 'Parliamentary') {
      simulateSwing(pcSwings).then(res => {
        setPcResult(res);
        setLoading(false);
      }).catch(err => {
        console.error("PC Simulation error:", err);
        setLoading(false);
      });
    } else {
      simulateStrategySwing(acParams).then(res => {
        setAcResult(res);
        setLoading(false);
      }).catch(err => {
        console.error("AC Simulation error:", err);
        setLoading(false);
      });
    }
  };

  const handleReset = () => {
    setPcSwings({ BJP: 0.0, SP: 0.0, INC: 0.0, BSP: 0.0, RLD: 0.0 });
    setAcParams({ sp_swing_pct: 0.0, bjp_swing_pct: 0.0, bsp_transfer_to_sp_pct: 0.0, region_filter: undefined });
    setPcResult(null);
    setAcResult(null);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Mandatory Scientific Non-Prediction Alert Banner */}
      <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 shadow-sm">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="uppercase tracking-wider font-extrabold text-amber-800 dark:text-amber-300">
            HYPOTHETICAL SCENARIO SIMULATOR — NOT AN ELECTION PREDICTION
          </strong>
          <p className="mt-0.5 text-amber-900/90 dark:text-amber-200">
            This module executes uniform mathematical sensitivity projections based on verified historical ECI election baselines. 
            It is an exploratory research laboratory designed for political science testing, not a future forecasting tool or political endorsement.
          </p>
        </div>
      </div>

      {/* 2. Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Hypothetical Scenario Simulator
            </h1>
            <SourceBadge type="SIMULATION" document="ECI Baseline Sensitivity Model" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test vote-swing hypotheses and vote-transfer scenarios across 403 Assembly seats or 80 Parliamentary seats.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => { setSimulatorMode('Assembly'); handleReset(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              simulatorMode === 'Assembly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Assembly (403 ACs)</span>
          </button>

          <button
            onClick={() => { setSimulatorMode('Parliamentary'); handleReset(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              simulatorMode === 'Parliamentary'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Parliamentary (80 PCs)</span>
          </button>
        </div>
      </div>

      {/* 3. Slider Controls Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            {simulatorMode === 'Assembly' ? 'Assembly Swing & Vote Transfer Sliders' : 'Parliamentary Vote Share Swing Sliders'}
          </span>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Parameters
          </button>
        </div>

        {simulatorMode === 'Assembly' ? (
          /* Assembly Simulation Parameters */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SP Swing Slider */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-red-600 dark:text-red-400">Samajwadi Party Swing</span>
                <span className="font-mono text-sm">
                  {acParams.sp_swing_pct > 0 ? `+${acParams.sp_swing_pct}%` : `${acParams.sp_swing_pct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-6.0"
                max="6.0"
                step="0.5"
                value={acParams.sp_swing_pct}
                onChange={(e) => setAcParams({ ...acParams, sp_swing_pct: parseFloat(e.target.value) })}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-6%</span>
                <span>0%</span>
                <span>+6%</span>
              </div>
            </div>

            {/* BJP Swing Slider */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-amber-600 dark:text-amber-400">BJP Swing</span>
                <span className="font-mono text-sm">
                  {acParams.bjp_swing_pct > 0 ? `+${acParams.bjp_swing_pct}%` : `${acParams.bjp_swing_pct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-6.0"
                max="6.0"
                step="0.5"
                value={acParams.bjp_swing_pct}
                onChange={(e) => setAcParams({ ...acParams, bjp_swing_pct: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-6%</span>
                <span>0%</span>
                <span>+6%</span>
              </div>
            </div>

            {/* BSP Transfer Slider */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-blue-600 dark:text-blue-400">BSP Vote Transfer to SP</span>
                <span className="font-mono text-sm">{acParams.bsp_transfer_to_sp_pct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="2.5"
                value={acParams.bsp_transfer_to_sp_pct}
                onChange={(e) => setAcParams({ ...acParams, bsp_transfer_to_sp_pct: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0%</span>
                <span>12.5%</span>
                <span>25%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Parliamentary Swing Sliders */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(pcSwings).map(([party, val]) => (
              <div key={party} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>{party}</span>
                  <span className={`font-mono text-sm ${val > 0 ? 'text-emerald-600' : val < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                    {val > 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10.0"
                  max="10.0"
                  step="0.5"
                  value={val}
                  onChange={(e) => setPcSwings({ ...pcSwings, [party]: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>-10%</span>
                  <span>0%</span>
                  <span>+10%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simulating...' : 'Execute Mathematical Simulation'}</span>
          </button>
        </div>
      </div>

      {/* 4. Results Canvas */}
      {simulatorMode === 'Assembly' && acResult && (
        <div className="space-y-6">
          {/* Tally & Majority Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Majority Threshold</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">202 Seats</div>
              <span className="text-xs text-slate-500 mt-1 block">Out of 403 Assembly Constituencies</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[11px] font-bold text-blue-600 uppercase">Simulated INDIA Total</span>
              <div className="text-3xl font-black text-blue-600 font-mono mt-1">{acResult.india_projected_total} Seats</div>
              <span className={`text-xs font-bold mt-1 block ${acResult.majority_reached ? 'text-emerald-600' : 'text-amber-600'}`}>
                {acResult.majority_reached ? `Above Majority (+${acResult.buffer_above_majority})` : 'Below 202 Mark'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[11px] font-bold text-amber-600 uppercase">Simulated NDA Total</span>
              <div className="text-3xl font-black text-amber-600 font-mono mt-1">{acResult.nda_projected_total} Seats</div>
              <span className="text-xs text-slate-500 mt-1 block">Net Flipped Seats: {acResult.flipped_seats_count}</span>
            </div>
          </div>

          {/* Flipped Seats List */}
          {acResult.flipped_seats.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Hypothetically Flipped Assembly Seats ({acResult.flipped_seats.length})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {acResult.flipped_seats.map(seat => (
                  <div
                    key={seat.ac_no}
                    onClick={() => setModalACNo(seat.ac_no)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">AC #{seat.ac_no} • {seat.district}</span>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{seat.ac_name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {seat.original_2024_lead} → <strong className="text-blue-600 dark:text-blue-400">{seat.simulated_winner}</strong>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {simulatorMode === 'Parliamentary' && pcResult && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Parliamentary Simulation Results ({pcResult.flipped_count} Seats Flipped)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {Object.entries(pcResult.new_tally || {}).map(([party, seats]: any) => (
              <div key={party} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500">{party}</span>
                <div className="text-2xl font-black font-mono mt-0.5">{seats}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded AC Dossier Modal */}
      <ACDossierModal
        acNo={modalACNo}
        isOpen={modalACNo !== null}
        onClose={() => setModalACNo(null)}
      />

    </div>
  );
};
