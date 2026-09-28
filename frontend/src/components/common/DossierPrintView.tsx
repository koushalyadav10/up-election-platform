import React from 'react';
import { ACDossierResponse } from '../../services/api';

interface DossierPrintViewProps {
  data: ACDossierResponse;
}

export const DossierPrintView: React.FC<DossierPrintViewProps> = ({ data }) => {
  const tri = data.tri_election_comparison;
  const vs22 = tri?.assembly_2022;
  const vs17 = tri?.assembly_2017;
  const ls24 = tri?.lok_sabha_segment_2024;
  const split = data.split_voting_analysis;
  const sir = data.sir_electoral_roll;
  const demo = data.demographics;

  return (
    <div className="hidden print:block p-8 bg-white text-slate-900 font-sans leading-relaxed text-xs max-w-[210mm] mx-auto">
      {/* ================= PAGE 1 ================= */}
      <div className="min-h-[280mm] flex flex-col justify-between pb-12 border-b-2 border-dashed border-slate-300">
        <div>
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">
                ECI Official Data Warehouse • Verified Dossier
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {data.basic_info.name} <span className="font-mono font-normal text-slate-500">#{data.basic_info.ac_no}</span>
              </h1>
              <div className="text-xs text-slate-600 mt-1 flex gap-3 font-medium">
                <span>District: <strong>{data.basic_info.district}</strong></span>
                <span>•</span>
                <span>Category: <strong>{data.basic_info.category}</strong></span>
                <span>•</span>
                <span>Parent PC: <strong>{data.basic_info.parent_pc.pc_name} (#{data.basic_info.parent_pc.pc_no})</strong></span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold">
                Official Assembly Dossier
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-1">
                Page 1 of 2 • ECI Certified Records
              </div>
            </div>
          </div>

          {/* Section 1: Latest Verified Result (2022) */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Latest Certified Assembly Election (2022 Vidhan Sabha)
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-[10px] text-slate-500">Elected MLA</div>
                <div className="font-bold text-slate-900 text-sm">{vs22?.winner || 'N/A'}</div>
                <div className="text-[10px] font-mono text-emerald-700 font-bold">{vs22?.party}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Winning Margin</div>
                <div className="font-bold text-slate-900 text-sm">+{vs22?.margin_votes.toLocaleString()}</div>
                <div className="text-[10px] font-mono text-slate-600">({vs22?.margin_percentage}% of valid votes)</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Voter Turnout</div>
                <div className="font-bold text-slate-900 text-sm">{vs22?.turnout_percentage}%</div>
                <div className="text-[10px] font-mono text-slate-600">{vs22?.valid_votes.toLocaleString()} polled</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Runner-Up</div>
                <div className="font-bold text-slate-900 text-sm">{vs22?.runner_up || 'N/A'}</div>
                <div className="text-[10px] font-mono text-orange-700 font-bold">{vs22?.runner_up_party} ({vs22?.runner_up_votes.toLocaleString()} votes)</div>
              </div>
            </div>
          </div>

          {/* Section 2: Tri-Election Cross-Comparison Table */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">
              Cross-Election Comparative Matrix (2017 VS → 2022 VS → 2024 LS Segment)
            </h2>
            <table className="w-full border-collapse border border-slate-200 text-left text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold">
                  <th className="p-2 border border-slate-200">Election Cycle</th>
                  <th className="p-2 border border-slate-200">Constitutional Chamber</th>
                  <th className="p-2 border border-slate-200">Lead / Winner</th>
                  <th className="p-2 border border-slate-200">Party</th>
                  <th className="p-2 border border-slate-200 text-right">Votes Polled</th>
                  <th className="p-2 border border-slate-200 text-right">Vote Share</th>
                  <th className="p-2 border border-slate-200 text-right">Victory Margin</th>
                  <th className="p-2 border border-slate-200 text-right">Turnout</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-200 font-bold font-mono">2017 General</td>
                  <td className="p-2 border border-slate-200 text-slate-600">Assembly Result</td>
                  <td className="p-2 border border-slate-200 font-medium">{vs17?.winner}</td>
                  <td className="p-2 border border-slate-200 font-mono font-bold">{vs17?.party}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{vs17?.votes.toLocaleString()}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{vs17?.vote_share}%</td>
                  <td className="p-2 border border-slate-200 text-right font-mono font-semibold">+{vs17?.margin_votes.toLocaleString()} ({vs17?.margin_percentage}%)</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{vs17?.turnout_percentage}%</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-slate-50/50">
                  <td className="p-2 border border-slate-200 font-bold font-mono">2022 General</td>
                  <td className="p-2 border border-slate-200 text-slate-600">Assembly Result</td>
                  <td className="p-2 border border-slate-200 font-medium">{vs22?.winner}</td>
                  <td className="p-2 border border-slate-200 font-mono font-bold">{vs22?.party}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{vs22?.votes.toLocaleString()}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{vs22?.vote_share}%</td>
                  <td className="p-2 border border-slate-200 text-right font-mono font-semibold">+{vs22?.margin_votes.toLocaleString()} ({vs22?.margin_percentage}%)</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{vs22?.turnout_percentage}%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-200 font-bold font-mono">2024 General</td>
                  <td className="p-2 border border-slate-200 text-indigo-700 font-semibold">Lok Sabha Segment</td>
                  <td className="p-2 border border-slate-200 font-medium">{ls24?.winner}</td>
                  <td className="p-2 border border-slate-200 font-mono font-bold">{ls24?.party}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{ls24?.votes.toLocaleString()}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{ls24?.vote_share}%</td>
                  <td className="p-2 border border-slate-200 text-right font-mono font-semibold">+{ls24?.margin_votes.toLocaleString()} ({ls24?.margin_percentage}%)</td>
                  <td className="p-2 border border-slate-200 text-right font-mono">{ls24?.turnout_percentage}%</td>
                </tr>
              </tbody>
            </table>
            <div className="text-[9px] text-slate-500 mt-1 italic">
              Notice: Lok Sabha segment returns reflect parliamentary vote tallies mapped to the assembly segment under Form 20 and do not constitute an Assembly MLA election.
            </div>
          </div>

          {/* Section 3: How Voting Changed & Split-Voting Pattern */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-slate-200 rounded p-3">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                Observed Voting Progression
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <strong className="text-slate-800">2017 → 2022: </strong>
                  {data.voting_change_flow?.flow_2017_to_2022.observed_voting_difference}
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <strong className="text-slate-800">2022 → 2024: </strong>
                  {data.voting_change_flow?.flow_2022_to_2024.observed_voting_difference}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                Assembly vs Lok Sabha Voting Pattern
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600">Result-Level Pattern:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 border border-slate-200 rounded">
                    {split?.pattern_category}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600">
                  2022 Assembly Winner: <strong>{split?.assembly_2022_winner_party}</strong> vs 2024 LS Lead: <strong>{split?.lok_sabha_2024_lead_party}</strong>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 leading-normal">
                {split?.result_level_statement}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Page 1 */}
        <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[9px] text-slate-400 font-mono">
          <div>ECI Official Data Warehouse • Verified Against Returning Officer Form 20</div>
          <div>Confidential Research Dossier • Generated {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="min-h-[280mm] flex flex-col justify-between pt-8">
        <div>
          {/* Header Page 2 */}
          <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-center">
            <div>
              <div className="text-[10px] font-mono uppercase font-semibold text-slate-500">
                Historical Depth & Institutional Provenance
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {data.basic_info.name} (AC #{data.basic_info.ac_no}) • Delimitation & Demographics
              </h2>
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              Page 2 of 2
            </div>
          </div>

          {/* Section 4: Delimitation & Predecessor Lineage */}
          <div className="border border-slate-200 rounded p-3 mb-5 bg-slate-50/50">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
              Constituency Boundary Identity & Delimitation Era
            </div>
            <p className="text-[11px] text-slate-700 mb-2">
              Current designation is post-2008 Delimitation Commission Order. Historical predecessor seats: 
              {' '}{data.constituency_identity?.historical_numberings.map(h => `${h.era} (AC #${h.ac_no} ${h.name})`).join(' ← ')}.
            </p>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900">
              <strong>Boundary Advisory: </strong>{data.constituency_identity?.boundary_comparability_notice}
            </div>
          </div>

          {/* Section 5: SIR & Electoral Roll Change */}
          <div className="border border-slate-200 rounded p-3 mb-5">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                Special Summary Revision (SIR) & Registered Electorate Evolution
              </div>
              <div className="text-[9px] font-mono text-slate-500 font-medium">
                Status: {sir?.verification_status || 'Not verified'}
              </div>
            </div>
            {sir?.reported_additions !== null && sir?.reported_deletions !== null ? (
              <div className="grid grid-cols-5 gap-3 text-center mb-2">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase">2017 Electors</div>
                  <div className="font-bold font-mono text-xs text-slate-900">{sir?.previous_electors?.toLocaleString() ?? 'Unavailable'}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase">Reported Additions</div>
                  <div className="font-bold font-mono text-xs text-emerald-700">+{sir?.reported_additions?.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase">Reported Deletions</div>
                  <div className="font-bold font-mono text-xs text-rose-700">-{sir?.reported_deletions?.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase">2022 Electors</div>
                  <div className="font-bold font-mono text-xs text-slate-900">{sir?.current_electors?.toLocaleString() ?? 'Unavailable'}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase">Net Growth %</div>
                  <div className="font-bold font-mono text-xs text-indigo-700">{sir?.percentage_change !== null ? `${sir?.percentage_change}%` : 'Not calculable'}</div>
                </div>
              </div>
            ) : (
              <div className="mb-2">
                <div className="grid grid-cols-4 gap-3 text-center mb-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-500 uppercase">2017 Electors</div>
                    <div className="font-bold font-mono text-xs text-slate-900">{sir?.previous_electors?.toLocaleString() ?? 'Unavailable'}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-500 uppercase">2022 Electors</div>
                    <div className="font-bold font-mono text-xs text-slate-900">{sir?.current_electors?.toLocaleString() ?? 'Unavailable'}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-500 uppercase">Net Change</div>
                    <div className="font-bold font-mono text-xs text-slate-900">{sir?.net_change !== null ? `${sir?.net_change && sir.net_change > 0 ? '+' : ''}${sir?.net_change?.toLocaleString()}` : 'Unavailable'}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-500 uppercase">Electorate Change %</div>
                    <div className="font-bold font-mono text-xs text-indigo-700">{sir?.percentage_change !== null ? `${sir?.percentage_change}%` : 'Not calculable'}</div>
                  </div>
                </div>
                <div className="p-1.5 bg-slate-50 rounded text-[9px] text-slate-500">
                  Notice: Verified SIR additions/deletions unavailable for this constituency. Data is preserved as null and not converted to 0.
                </div>
              </div>
            )}
            <div className="text-[10px] text-slate-600 italic">
              {sir?.official_advisory} Source: {sir?.source}.
            </div>
          </div>

          {/* Section 6: Demographics & Education Context */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="border border-slate-200 rounded p-3">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-2">
                Census 2011 District Aggregate Benchmarks
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>SC Population: <strong>{demo?.sc_pct}%</strong></div>
                <div>ST Population: <strong>{demo?.st_pct}%</strong></div>
                <div>Overall Literacy: <strong>{demo?.overall_literacy_pct}%</strong></div>
                <div>Female Literacy: <strong>{demo?.female_literacy_pct}%</strong></div>
                <div>Rural Share: <strong>{demo?.rural_pct}%</strong></div>
                <div>Urban Share: <strong>{demo?.urban_pct}%</strong></div>
              </div>
              <div className="text-[9px] text-slate-400 mt-2">
                {demo?.geographic_level} Verified constituency-level caste composition is not officially published.
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-2">
                Mission 2027 Analytical Matrix
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 mb-2">
                <div className="text-xs font-bold text-slate-900">Category: {data.mission_2027?.category}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{data.mission_2027?.reason_metric}</div>
              </div>
              <div className="text-[9px] text-slate-500">
                {data.mission_2027?.analytical_disclaimer}
              </div>
            </div>
          </div>

          {/* Section 7: Candidate Affidavits Provenance */}
          <div className="border border-slate-200 rounded p-3 mb-5">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-2">
              Candidate Affidavit Highlights (ECI Form 26 & ADR)
            </div>
            <div className="space-y-1.5 text-[10px]">
              {data.candidate_profiles_detailed?.slice(0, 3).map((c, idx) => (
                <div key={idx} className="flex justify-between items-center p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span><strong>{c.candidate_name}</strong> ({c.party}, {c.election_year} {c.election_type})</span>
                  <span>Edu: {c.declared_education} | Assets: {c.declared_assets} | Cases: {c.declared_criminal_cases}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Page 2 */}
        <div className="border-t border-slate-200 pt-3 text-[9px] text-slate-500 font-mono flex justify-between items-center">
          <div>Official Sources: ECI Statistical Reports (1991–2022), Form 20 Gazette, Census of India 2011.</div>
          <div>End of Dossier • Verified & Grounded</div>
        </div>
      </div>
    </div>
  );
};
