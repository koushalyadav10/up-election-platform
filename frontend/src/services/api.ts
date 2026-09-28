// UP Election Intelligence Platform Type-Safe API Client

export interface StateOverview {
  state_name: string;
  election: string;
  election_year?: number;
  election_type?: string;
  delimitation_era?: string;
  data_version: string;
  is_official: boolean;
  data_quality_badge: string;
  summary: {
    total_pcs: number;
    total_acs: number;
    total_districts: number;
    total_electors: number;
    total_votes_polled: number;
    total_valid_votes: number;
    turnout_pct: number;
  };
  party_tally: Array<{
    code: string;
    name: string;
    seats: number;
    color: string;
    seat_share_pct: number;
  }>;
  demographics: {
    male_electors?: number;
    female_electors?: number;
    third_gender_electors?: number;
    male_voters?: number;
    female_voters?: number;
    postal_voters?: number;
    evm_rejected?: number;
    rejected_postal?: number;
    nota_votes?: number;
  };
  source: {
    authority: string;
    document: string;
    published_status: string;
  };
}

export interface AvailableElection {
  id: number;
  name: string;
  year: number;
  election_type: string;
  delimitation_era: string;
  total_seats: number;
  is_official: boolean;
  data_version: string;
}

export interface ConstituencyListItem {
  id: number;
  pc_no: number;
  name: string;
  category: string;
  assembly_segments_count: number;
  winner: {
    name: string;
    party: string;
    party_name?: string;
    color: string;
    votes: number;
    vote_pct: number;
  };
  runner_up: {
    name: string;
    party: string;
    votes: number;
    vote_pct: number;
  };
  margin: number;
  turnout_pct: number;
  total_electors: number;
  total_votes_polled: number;
  valid_votes: number;
  data_quality: string;
}

export interface CandidatePerformance {
  rank: number;
  name: string;
  candidate_id?: number;
  party: string;
  party_name: string;
  symbol?: string;
  color: string;
  gender?: string;
  age?: number;
  category?: string;
  general_votes: number;
  postal_votes: number;
  total_votes: number;
  vote_pct_valid: number;
  vote_pct_electors: number;
  is_winner: boolean;
}

export interface ConstituencyDetail {
  pc: {
    id: number;
    pc_no: number;
    name: string;
    category: string;
    state: string;
    delimitation_era?: string;
  };
  summary: {
    election_year?: number;
    election_type?: string;
    winner_name: string;
    winner_party: string;
    winner_votes: number;
    winner_vote_pct: number;
    runner_up_name: string;
    runner_up_party: string;
    runner_up_votes: number;
    margin: number;
    turnout_pct: number;
    total_electors: number;
    total_votes_polled: number;
    valid_votes: number;
  };
  dna: {
    vote_concentration_hhi: number;
    competition_index: string;
    margin_buffer_pct: number;
    turnout_category: string;
    methodology: string;
  };
  assembly_segments: Array<{
    ac_id: number;
    ac_no: number;
    name: string;
    category: string;
    district: string;
    winner_2022?: string;
    winner_2022_candidate?: string;
    margin_2022?: number;
    lead_2024?: string;
    lead_2024_candidate?: string;
    margin_2024?: number;
    strategic_category?: string;
  }>;
  candidates: CandidatePerformance[];
  historical: Array<{
    year: number;
    election: string;
    winner_party: string;
    winner_name?: string;
    runner_up_party?: string;
    runner_up_name?: string;
    margin?: number;
    margin_estimate?: number;
    turnout: number;
    is_current?: boolean;
  }>;
  source: {
    authority: string;
    document: string;
    data_version: string;
    status: string;
  };
}

export interface AssemblyConstituencyItem {
  id: number;
  ac_no: number;
  name: string;
  ac_name?: string;
  category: string;
  district: string;
  region?: string;
  parent_pc?: {
    pc_id?: number;
    pc_no: number;
    pc_name: string;
  };
  election_year?: number;
  election_type?: string;
  winner?: {
    name: string;
    party: string;
    party_name?: string;
    color: string;
    votes: number;
    vote_pct?: number;
  };
  runner_up?: {
    name: string;
    party: string;
    party_name?: string;
    color: string;
    votes: number;
    vote_pct?: number;
  };
  margin?: number;
  margin_pct?: number;
  turnout_pct?: number;
  total_electors?: number;
  valid_votes?: number;
  strategic_category?: string;
  mission_2027?: any;
  split_voting?: any;
  is_battleground?: boolean;
  is_prime_flip?: boolean;
  is_fortress?: boolean;
  lead_2024_party?: string;
  lead_2024_candidate?: string;
  lead_2024_votes?: number;
  runner_2024_party?: string;
  runner_2024_candidate?: string;
  runner_2024_votes?: number;
  margin_2024?: number;
  margin_pct_2024?: number;
  total_votes_2024?: number;
  winner_2022_party?: string;
  winner_2022_candidate?: string;
  margin_2022?: number;
  winner_2017_party?: string;
  winner_2017_candidate?: string;
  margin_2017?: number;
  lead_party?: string;
  lead_candidate?: string;
}

export interface PartyStat {
  id: number;
  code: string;
  name: string;
  party_type: string;
  color: string;
  seats_contested: number;
  seats_won: number;
  strike_rate_pct: number;
  total_votes: number;
  vote_share_pct: number;
  avg_winning_margin: number;
  closest_loss: {
    constituency?: string;
    margin?: number;
  };
}

export interface CloseContestItem {
  pc_id: number;
  pc_no: number;
  pc_name: string;
  winner_name: string;
  winner_candidate_id?: number;
  winner_party: string;
  winner_party_color: string;
  runner_up_name: string;
  runner_up_candidate_id?: number;
  runner_up_party: string;
  runner_up_party_color: string;
  margin: number;
  turnout_pct: number;
  total_votes_polled: number;
}

export interface AIResponse {
  question: string;
  intent: string;
  answer: string;
  data: any[];
  calculation: string;
  source: string;
  data_quality: string;
  status_badge: string;
}

// 2027 Strategy Interfaces
export interface StrategyCategoryMeta {
  key: string;
  label: string;
  count: number;
  color: string;
  description: string;
}

export interface RegionStrategySummary {
  region: string;
  total_seats: number;
  sp_2022: number;
  bjp_2022: number;
  sp_2024_leads: number;
  inc_2024_leads: number;
  bjp_2024_leads: number;
  battlegrounds: number;
  prime_flips: number;
}

export interface StrategySummary {
  title: string;
  total_acs: number;
  majority_mark: number;
  india_leads_2024: number;
  nda_leads_2024: number;
  sp_leads_2024: number;
  inc_leads_2024: number;
  bjp_leads_2024: number;
  sp_actuals_2022: number;
  bjp_actuals_2022: number;
  expansion_delta: number;
  leads_2024_breakdown: Record<string, number>;
  actuals_2022_breakdown: Record<string, number>;
  actuals_2017_breakdown: Record<string, number>;
  categories: StrategyCategoryMeta[];
  regions: RegionStrategySummary[];
  source: string;
}

export interface StrategyMatrixItem {
  id: number;
  ac_no: number;
  ac_name: string;
  category: string;
  district: string;
  region: string;
  pc_no: number;
  pc_name: string;
  winner_2017_party: string;
  winner_2017_candidate: string;
  margin_2017: number;
  lead_2019_party: string;
  lead_2019_candidate: string;
  margin_2019: number;
  winner_2022_party: string;
  winner_2022_candidate: string;
  margin_2022: number;
  runner_2022_party: string;
  lead_2024_party: string;
  lead_2024_candidate: string;
  lead_2024_votes: number;
  runner_2024_party: string;
  runner_2024_candidate: string;
  runner_2024_votes: number;
  margin_2024: number;
  margin_pct_2024: number;
  total_votes_2024: number;
  strategic_category: string;
  is_battleground: boolean;
  is_prime_flip: boolean;
  is_fortress: boolean;
  is_defensive_alert: boolean;
  is_near_miss: boolean;
  target_priority: string;
  swing_needed_pct: number;
  recommendation_note: string;
}

export interface SwingSimulationRequest {
  sp_swing_pct: number;
  bjp_swing_pct: number;
  bsp_transfer_to_sp_pct: number;
  region_filter?: string;
}

export interface SwingSimulationResult {
  simulation_parameters: {
    sp_swing_pct: number;
    bjp_swing_pct: number;
    bsp_transfer_to_sp_pct: number;
    region_filter?: string;
  };
  majority_mark: number;
  india_projected_total: number;
  nda_projected_total: number;
  majority_reached: boolean;
  buffer_above_majority: number;
  projected_tallies: Record<string, number>;
  flipped_seats_count: number;
  flipped_seats: Array<{
    ac_no: number;
    ac_name: string;
    district: string;
    region: string;
    original_2024_lead: string;
    original_margin: number;
    simulated_winner: string;
    simulated_margin: number;
  }>;
  vulnerable_seats_count: number;
  vulnerable_seats: Array<{
    ac_no: number;
    ac_name: string;
    district: string;
    projected_winner: string;
    projected_margin: number;
  }>;
}

export interface ACStrategyDetail {
  ac_no: number;
  ac_name: string;
  category: string;
  district: string;
  region: string;
  pc_no: number;
  pc_name: string;
  timeline: Array<{
    election: string;
    winner_party: string;
    winner_candidate: string;
    winner_votes?: number;
    runner_up_party?: string;
    runner_up_candidate?: string;
    runner_up_votes?: number;
    margin: number;
    margin_pct?: number;
    valid_votes?: number;
    total_votes?: number;
  }>;
  vote_distribution_2024: Record<string, number>;
  strategic_profile: {
    category: string;
    is_battleground: boolean;
    is_prime_flip: boolean;
    is_fortress: boolean;
    is_defensive_alert: boolean;
    is_near_miss: boolean;
    target_priority: string;
    swing_needed_pct: number;
    recommendation: string;
  };
  pda_caste_intelligence?: {
    pda_coalition: {
      obc_profile: string;
      dalit_profile: string;
      minority_profile: string;
      synergy_score: string;
      pda_status: string;
    };
    candidate_caste_recommendation: string;
    strategic_summary: string;
  };
}

export interface PartySeatItem {
  type: string;
  pc_id: number;
  pc_name: string;
  category: string;
  candidate: string;
  party: string;
  votes: number;
  vote_pct: number;
  opponent_candidate: string;
  opponent_party: string;
  opponent_votes: number;
  margin: number;
  margin_pct: number;
}

export interface PartySeatsResponse {
  party_code: string;
  party_name: string;
  year: number;
  election_type: string;
  total_won: number;
  total_runner_up: number;
  won_seats: PartySeatItem[];
  runner_up_seats: PartySeatItem[];
}

const API_BASE = '/api';

export async function fetchAvailableElections(): Promise<{ total: number; elections: AvailableElection[] }> {
  const res = await fetch(`${API_BASE}/overview/elections`);
  if (!res.ok) throw new Error('Failed to fetch elections');
  return res.json();
}

export async function fetchStateOverview(year?: number, electionType?: string): Promise<StateOverview> {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (electionType) params.append('election_type', electionType);
  const url = params.toString() ? `${API_BASE}/overview?${params.toString()}` : `${API_BASE}/overview`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch state overview');
  return res.json();
}

export async function fetchConstituencies(year: number = 2024, party?: string, search?: string): Promise<{ total: number; election_year: number; election_type: string; items: ConstituencyListItem[] }> {
  const params = new URLSearchParams();
  params.append('year', year.toString());
  if (party) params.append('party', party);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/constituencies?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch constituencies');
  return res.json();
}

export async function fetchConstituencyDetail(pcId: number, year?: number): Promise<ConstituencyDetail> {
  const url = year ? `${API_BASE}/constituencies/${pcId}?year=${year}` : `${API_BASE}/constituencies/${pcId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch constituency detail');
  return res.json();
}

export async function fetchAssemblyConstituencies(year: number = 2022, electionType: string = 'Vidhan Sabha', pcId?: number, party?: string, search?: string): Promise<{ total: number; election_year: number; election_type: string; items: AssemblyConstituencyItem[] }> {
  const params = new URLSearchParams();
  params.append('year', year.toString());
  params.append('election_type', electionType);
  if (pcId) params.append('pc_id', pcId.toString());
  if (party) params.append('party', party);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/assembly-constituencies?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch assembly constituencies');
  return res.json();
}

export async function fetchParties(): Promise<{ total: number; parties: PartyStat[] }> {
  const res = await fetch(`${API_BASE}/parties`);
  if (!res.ok) throw new Error('Failed to fetch party intelligence');
  return res.json();
}

export async function fetchCloseContests(maxMargin: number = 25000): Promise<{ threshold: number; count: number; contests: CloseContestItem[] }> {
  const res = await fetch(`${API_BASE}/analytics/close-contests?max_margin=${maxMargin}`);
  if (!res.ok) throw new Error('Failed to fetch close contests');
  return res.json();
}

export async function fetchLargestVictories(limit: number = 10): Promise<{ count: number; victories: any[] }> {
  const res = await fetch(`${API_BASE}/analytics/largest-victories?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch largest victories');
  return res.json();
}

export async function fetchTurnoutDistribution(): Promise<{ count: number; distribution: any[] }> {
  const res = await fetch(`${API_BASE}/analytics/turnout-distribution`);
  if (!res.ok) throw new Error('Failed to fetch turnout distribution');
  return res.json();
}

export async function queryAI(prompt: string): Promise<AIResponse> {
  const res = await fetch(`${API_BASE}/ai/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: prompt })
  });
  if (!res.ok) throw new Error('Failed to execute AI query');
  return res.json();
}

export async function simulateSwing(swings: Record<string, number>): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/simulate-swing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(swings)
  });
  if (!res.ok) throw new Error('Failed to simulate swing');
  return res.json();
}

export async function fetchSourcesVault(): Promise<any> {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error('Failed to fetch sources vault');
  return res.json();
}

export async function generateConstituencyDossier(pcId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/reports/constituency-dossier/${pcId}`);
  if (!res.ok) throw new Error('Failed to generate dossier');
  return res.json();
}

// 2027 Strategy API Calls
export async function fetchStrategySummary(): Promise<StrategySummary> {
  const res = await fetch(`${API_BASE}/strategy/summary`);
  if (!res.ok) throw new Error('Failed to fetch strategy summary');
  return res.json();
}

export async function fetchStrategyMatrix(filters: {
  category?: string;
  region?: string;
  district?: string;
  lead_party?: string;
  winner_2022?: string;
  is_battleground?: boolean;
  is_near_miss?: boolean;
  search?: string;
}): Promise<{ total: number; items: StrategyMatrixItem[] }> {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.region) params.append('region', filters.region);
  if (filters.district) params.append('district', filters.district);
  if (filters.lead_party) params.append('lead_party', filters.lead_party);
  if (filters.winner_2022) params.append('winner_2022', filters.winner_2022);
  if (filters.is_battleground !== undefined) params.append('is_battleground', String(filters.is_battleground));
  if (filters.is_near_miss !== undefined) params.append('is_near_miss', String(filters.is_near_miss));
  if (filters.search) params.append('search', filters.search);
  
  const res = await fetch(`${API_BASE}/strategy/matrix?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch strategy matrix');
  return res.json();
}

export async function simulateStrategySwing(req: SwingSimulationRequest): Promise<SwingSimulationResult> {
  const res = await fetch(`${API_BASE}/strategy/simulate-swing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error('Failed to simulate strategy swing');
  return res.json();
}

export async function fetchACStrategyDetail(acNo: number): Promise<ACStrategyDetail> {
  const res = await fetch(`${API_BASE}/strategy/ac/${acNo}`);
  if (!res.ok) throw new Error('Failed to fetch AC strategy detail');
  return res.json();
}

export async function fetchPartySeats(
  partyCode: string,
  year: number = 2024,
  electionType: string = 'Lok Sabha'
): Promise<PartySeatsResponse> {
  const res = await fetch(`${API_BASE}/parties/${partyCode}/seats?year=${year}&election_type=${encodeURIComponent(electionType)}`);
  if (!res.ok) throw new Error('Failed to fetch party seats');
  return res.json();
}

// ==================== NEW ELECTORAL INTELLIGENCE INTERFACES ====================

export interface CompetitivenessScore {
  overall_score: number;
  classification: string;
  badge_color: string;
  components: {
    margin_tightness: number;
    runner_up_proximity: number;
    winner_turnover: number;
    historical_volatility: number;
    margin_variation: number;
  };
  formula_description: string;
}

export interface ACDossierResponse {
  basic_info: {
    ac_no: number;
    name: string;
    district: string;
    region?: string;
    category: string;
    parent_pc: {
      pc_no: number;
      pc_name: string;
    };
  };
  constituency_identity?: {
    current_ac_no: number;
    current_ac_name: string;
    current_era: string;
    current_period: string;
    historical_numberings: Array<{
      era: string;
      period: string;
      ac_no: number;
      name: string;
      status: string;
    }>;
    boundary_comparability_notice: string;
  };
  constituency_story?: {
    summary: string;
    evidence_payload: Array<{
      cycle: string;
      metric: string;
      value: string;
      verified_source: string;
    }>;
  };
  latest_assembly_election: {
    year?: number;
    election_year?: number;
    election_type?: string;
    chamber?: string;
    label?: string;
    type_label?: string;
    winner: string | { party: string; candidate: string };
    winner_party?: string;
    winner_votes?: number;
    runner_up: string | { party: string; candidate: string };
    runner_up_party?: string;
    runner_up_votes?: number;
    margin: number;
    margin_pct?: number;
    valid_votes?: number;
    total_electors?: number;
    turnout_pct: number;
    delimitation_era?: string;
    historical_ac_no?: number;
    by_election?: any;
  };
  historical_winner_timeline: Array<{
    year: number;
    chamber: string;
    type_label: string;
    winner: string;
    winner_party: string;
    winner_votes: number;
    runner_up: string;
    runner_up_party: string;
    runner_up_votes: number;
    margin: number;
    margin_pct: number;
    turnout_pct: number;
    valid_votes: number;
    total_electors: number;
    delimitation_era: string;
    historical_ac_no: number;
    historical_ac_number?: number;
    current_ac_number?: number;
    election_year?: number;
    boundary_comparability?: string;
    boundary_notice?: string;
    mapping_confidence?: string;
    by_election?: any;
  }>;
  trajectory?: Array<{
    cycle: string;
    year: number;
    winner_party: string;
    margin_pct: number;
    turnout_pct: number;
  }>;
  historical_assembly_elections?: Array<{
    election_year: number;
    election_type: string;
    label: string;
    winner: {
      party: string;
      candidate: string;
    };
    margin: number;
    turnout_pct: number;
  }>;
  demographics?: {
    district: string;
    population: number;
    sex_ratio: number;
    sc_pct: number;
    st_pct: number;
    rural_pct: number;
    urban_pct: number;
    overall_literacy_pct: number;
    male_literacy_pct: number;
    female_literacy_pct: number;
    source: string;
    geographic_level: string;
    notice?: string;
  };
  education_profile?: {
    overall_literacy: number;
    male_literacy: number;
    female_literacy: number;
    institutions_count: number;
    higher_education_colleges: number;
    source: string;
    year: number;
    coverage: string;
    geographic_level: string;
  };
  public_issues?: Array<{
    sector: string;
    indicator: string;
    value: string;
    year: number;
    source: string;
    evidence_notes: string;
  }>;
  candidate_history?: Array<{
    election_year: number;
    candidate: string;
    party: string;
    result: string;
    votes: number;
    margin: number;
    declared_profession?: string;
    declared_education?: string;
  }>;
  parliamentary_segment_performance: {
    election_year: number;
    election_type: string;
    chamber?: string;
    label: string;
    parent_pc_no?: number;
    parent_pc_name?: string;
    lead_party: string;
    lead_candidate: string;
    lead_votes?: number;
    runner_up_party?: string;
    runner_up_candidate?: string;
    runner_up_votes?: number;
    margin: number;
    margin_pct?: number;
    total_votes?: number;
    notice?: string;
    party_vote_distribution?: Record<string, number>;
  };
  four_election_timeline?: Array<{
    cycle: string;
    chamber: string;
    type_label: string;
    winner_party: string;
    winner_candidate: string;
    winner_votes?: number;
    runner_up_party?: string;
    runner_up_candidate?: string;
    runner_up_votes?: number;
    margin: number;
    margin_pct?: number;
    valid_votes?: number;
    total_votes?: number;
    turnout_pct?: number;
  }>;
  tri_election_comparison?: {
    assembly_2017: {
      election_year: number;
      election_type: string;
      chamber_label: string;
      state: string;
      district: string;
      parliamentary_constituency: string;
      assembly_constituency: string;
      historical_ac_number?: number;
      candidate_name: string;
      party: string;
      votes: number;
      vote_share: number;
      rank: number;
      winner: string;
      runner_up: string;
      runner_up_party: string;
      runner_up_votes: number;
      runner_up_vote_share: number;
      margin_votes: number;
      margin_percentage: number;
      total_electors: number;
      total_votes_polled: number;
      turnout_percentage: number;
      nota_votes?: number;
      postal_votes?: number;
      valid_votes: number;
      source: string;
      source_url: string;
      source_year: number;
      data_confidence: string;
    };
    assembly_2022: {
      election_year: number;
      election_type: string;
      chamber_label: string;
      state: string;
      district: string;
      parliamentary_constituency: string;
      assembly_constituency: string;
      historical_ac_number?: number;
      candidate_name: string;
      party: string;
      votes: number;
      vote_share: number;
      rank: number;
      winner: string;
      runner_up: string;
      runner_up_party: string;
      runner_up_votes: number;
      runner_up_vote_share: number;
      margin_votes: number;
      margin_percentage: number;
      total_electors: number;
      total_votes_polled: number;
      turnout_percentage: number;
      nota_votes?: number;
      postal_votes?: number;
      valid_votes: number;
      source: string;
      source_url: string;
      source_year: number;
      data_confidence: string;
    };
    lok_sabha_segment_2024: {
      election_year: number;
      election_type: string;
      chamber_label: string;
      notice: string;
      state: string;
      district: string;
      parliamentary_constituency: string;
      assembly_constituency: string;
      historical_ac_number?: number;
      candidate_name: string;
      party: string;
      votes: number;
      vote_share: number;
      rank: number;
      winner: string;
      runner_up: string;
      runner_up_party: string;
      runner_up_votes: number;
      runner_up_vote_share: number;
      margin_votes: number;
      margin_percentage: number;
      total_electors: number;
      total_votes_polled: number;
      turnout_percentage: number;
      nota_votes?: number;
      postal_votes?: number;
      valid_votes: number;
      party_breakdown?: Record<string, number>;
      source: string;
      source_url: string;
      source_year: number;
      data_confidence: string;
      short_ui_label?: string;
      role?: string;
    };
    lok_sabha_2024_segment_result?: any;
  };
  voting_change_flow?: {
    flow_2017_to_2022: {
      winner_change: boolean;
      winner_transition: string;
      vote_share_change: number;
      margin_change_votes: number;
      margin_change_pct: number;
      turnout_change_pct: number;
      observed_voting_difference: string;
    };
    flow_2022_to_2024: {
      winner_change: boolean;
      lead_transition: string;
      vote_share_change: number;
      margin_change_votes: number;
      margin_change_pct: number;
      turnout_change_pct: number;
      observed_voting_difference: string;
    };
  };
  split_voting_analysis?: {
    assembly_2022_winner_party: string;
    assembly_2022_winner_candidate: string;
    lok_sabha_2024_lead_party: string;
    lok_sabha_2024_lead_candidate: string;
    is_same_winner: boolean;
    pattern_category: "Same winner" | "Different winner" | "Close reversal" | "Large reversal" | "Stable";
    vote_share_difference: number;
    margin_difference: number;
    turnout_difference: number;
    result_level_statement: string;
  };
  sir_electoral_roll?: {
    previous_electors: number | null;
    current_electors: number | null;
    draft_2024_electors: number | null;
    reported_additions: number | null;
    reported_deletions: number | null;
    net_change: number | null;
    percentage_change: number | null;
    impact_category: "Significant Increase" | "Moderate Increase" | "Stable" | "Moderate Decrease" | "Significant Decrease" | "Not calculable";
    official_advisory: string;
    claims_and_objections?: {
      accepted_claims: number;
      rejected_claims: number;
      objections_filed: number;
      status: string;
    } | null;
    source: string;
    source_url?: string;
    source_date?: string | null;
    revision_year?: number;
    geographic_level?: string;
    data_status?: "Verified" | "Unavailable" | "Not verified";
    verification_status?: "Verified" | "Not verified";
    unavailability_notice?: string | null;
  };
  candidate_profiles_detailed?: Array<{
    candidate_name: string;
    party: string;
    election_year: number;
    election_type: string;
    votes: number;
    vote_share: number;
    rank: number;
    margin: number;
    declared_education: string;
    age: number;
    declared_profession: string;
    declared_assets: string;
    declared_liabilities: string;
    declared_criminal_cases: number;
    affidavit_source: string;
    affidavit_year: number;
  }>;
  polling_stations_summary?: {
    total_polling_stations: number;
    average_electors_per_station: number;
    urban_polling_stations: number;
    rural_polling_stations: number;
    elector_capacity_standard: string;
    turnout_distribution_notes: string;
    data_provenance: string;
  };
  mission_2027?: {
    category: "Ultra-Close" | "High Turnover" | "Long-Term Stable" | "Competitive / Swing-like";
    reason_metric: string;
    competitiveness_level: string;
    analytical_disclaimer: string;
  };
  provenance_sources?: Array<{
    dataset: string;
    source: string;
    source_url: string;
    publication_date: string;
    data_year: number;
    retrieval_date: string;
    geographic_level: string;
    methodology: string;
    confidence: string;
  }>;
  competitiveness: CompetitivenessScore;
  electoral_changes: string[];
  data_provenance: {
    source: string;
    census_source?: string;
    isolation_status: string;
    quality_status: string;
  };
}

export interface BattlegroundSeatItem {
  ac_no: number;
  name: string;
  district: string;
  category: string;
  parent_pc: { pc_no: number; pc_name: string };
  battleground_category: "Ultra-Close" | "High Turnover" | "Long-Term Stable" | "Competitive / Swing-like";
  reason_metric: string;
  competitiveness_level: string;
  winner_2022_party: string;
  winner_2022_candidate: string;
  margin_2022: number;
  margin_pct_2022: number;
  lead_2024_party: string;
  lead_2024_candidate: string;
  margin_2024: number;
  split_pattern: string;
}

export interface ACComparisonItem {
  ac_no: number;
  name: string;
  district: string;
  category: string;
  parent_pc: { pc_no: number; pc_name: string };
  winner_2022: string;
  party_2022: string;
  votes_2022: number;
  margin_2022: number;
  margin_pct_2022: number;
  turnout_2022: number;
  electors_2022: number;
  winner_2017: string;
  party_2017: string;
  votes_2017: number;
  margin_2017: number;
  margin_pct_2017: number;
  turnout_2017: number;
  lead_2024: string;
  party_2024: string;
  votes_2024: number;
  margin_2024: number;
  margin_pct_2024: number;
  turnout_2024: number;
  sir_net_change?: number | null;
  sir_pct_change?: number | null;
  sir_impact_label?: string;
  sir_data_status?: string;
  sir_unavailability_notice?: string | null;
  sc_pct: number;
  literacy_pct: number;
  rural_pct: number;
  battleground_category: string;
  split_pattern: string;
}

export interface DistrictSummaryItem {
  id: number;
  name: string;
  ac_count: number;
  pc_count: number;
  pcs: string[];
  party_tally_2022: Record<string, number>;
  party_tally_2024: Record<string, number>;
  avg_competitiveness: number;
  battlegrounds_count: number;
}

export interface DistrictDossierResponse {
  district_name: string;
  state: string;
  total_acs: number;
  total_pcs: number;
  pcs: Array<{ pc_no: number; pc_name: string }>;
  party_performance_2022: Record<string, number>;
  party_performance_2024: Record<string, number>;
  average_competitiveness: number;
  significant_flips_count: number;
  significant_flips: Array<{
    ac_no: number;
    ac_name: string;
    from_party: string;
    to_party: string;
    margin_2024: number;
  }>;
  assembly_constituencies: Array<{
    ac_no: number;
    ac_name: string;
    category: string;
    parent_pc: { pc_no: number; pc_name: string };
    winner_2022: { party: string; candidate: string; margin: number };
    lead_2024: { party: string; candidate: string; margin: number; margin_pct: number };
    competitiveness: CompetitivenessScore;
    electoral_changes: string[];
  }>;
}

export interface ElectionComparisonResponse {
  baseline_election: string;
  comparison_election: string;
  total_seats_compared: number;
  flipped_seats_count: number;
  retained_seats_count: number;
  flip_rate_pct: number;
  party_deltas: Record<string, { baseline_seats: number; comparison_seats: number; net_change: number }>;
  what_changed_takeaways: string[];
  flipped_seats: any[];
  all_seats: any[];
}

export interface ConstituencyComparisonResponse {
  chamber: string;
  constituencies_count: number;
  comparison_items: any[];
}

export interface PartyPerformanceResponse {
  party_code: string;
  party_name: string;
  party_type: string;
  color: string;
  lok_sabha_timeline: Array<{
    year: number;
    election: string;
    seats_contested: number;
    seats_won: number;
    runner_up_count: number;
    third_place_count: number;
    total_votes: number;
    vote_share_pct: number;
    avg_winning_margin: number;
  }>;
  vidhan_sabha_timeline: Array<{
    year: number;
    election: string;
    seats_contested: number;
    seats_won: number;
    runner_up_count: number;
    third_place_count: number;
    total_votes: number;
    vote_share_pct: number;
    avg_winning_margin: number;
  }>;
  constituency_performance_2024: {
    total_won: number;
    total_runner_up: number;
    won_seats: PartySeatItem[];
    runner_up_seats: PartySeatItem[];
  };
}

export interface DataQualityReport {
  overall_status: "HEALTHY" | "WARNINGS" | "CRITICAL";
  health_score_pct: number;
  total_checks_count: number;
  passed_checks_count: number;
  audit_timestamp: string;
  health_dimensions: Array<{
    id: string;
    title: string;
    category: string;
    status: "HEALTHY" | "WARNING" | "CRITICAL";
    details: string;
    passed: boolean;
  }>;
  dataset_provenance_ledger: Array<{
    dataset_code: string;
    name: string;
    election: string;
    source_authority: string;
    records_count: number;
    candidate_records: number;
    validation_status: string;
    import_timestamp: string;
    checksum: string;
  }>;
  anomalies: any[];
}

export interface AdvancedSearchResponse {
  query: string;
  is_analytical: boolean;
  analytical_interpretation: string | null;
  pcs: any[];
  acs: any[];
  districts: any[];
  candidates: any[];
  parties: any[];
  analytical_matches: any[];
}

export interface AskElectraResponse {
  question: string;
  intent: string;
  answer: string;
  insufficient_data: boolean;
  evidence_payload: {
    dataset: string;
    election_year: string;
    metrics: Record<string, any>;
    records: Array<{ Metric: string; Value: string }>;
  };
  source: string;
  data_quality: string;
}

// ==================== NEW API FUNCTIONS ====================

export async function fetchACDossier(acNo: number): Promise<ACDossierResponse> {
  const res = await fetch(`${API_BASE}/assembly-constituencies/${acNo}/dossier`);
  if (!res.ok) throw new Error(`Failed to fetch dossier for AC #${acNo}`);
  return res.json();
}

export async function fetchDistricts(): Promise<{ total_districts: number; districts: DistrictSummaryItem[] }> {
  const res = await fetch(`${API_BASE}/districts`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  return res.json();
}

export async function fetchDistrictDossier(name: string): Promise<DistrictDossierResponse> {
  const res = await fetch(`${API_BASE}/districts/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`Failed to fetch dossier for district ${name}`);
  return res.json();
}

export async function compareElections(
  year1: number, 
  type1: string, 
  year2: number, 
  type2: string
): Promise<ElectionComparisonResponse> {
  const params = new URLSearchParams({
    year1: String(year1),
    type1,
    year2: String(year2),
    type2
  });
  const res = await fetch(`${API_BASE}/elections/compare?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to compare elections');
  return res.json();
}

export async function compareConstituencies(
  chamber: "Assembly" | "Parliamentary", 
  ids: number[]
): Promise<ConstituencyComparisonResponse> {
  const res = await fetch(`${API_BASE}/constituencies/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chamber, ids })
  });
  if (!res.ok) throw new Error('Failed to compare constituencies');
  return res.json();
}

export async function fetchPartyPerformance(partyCode: string): Promise<PartyPerformanceResponse> {
  const res = await fetch(`${API_BASE}/parties/${encodeURIComponent(partyCode)}/performance`);
  if (!res.ok) throw new Error(`Failed to fetch performance for party ${partyCode}`);
  return res.json();
}

export async function fetchDataQualityReport(): Promise<DataQualityReport> {
  const res = await fetch(`${API_BASE}/data-quality`);
  if (!res.ok) throw new Error('Failed to fetch data quality report');
  return res.json();
}

export async function executeAdvancedSearch(query: string): Promise<AdvancedSearchResponse> {
  const res = await fetch(`${API_BASE}/search/advanced`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to execute search');
  return res.json();
}

export async function askElectra(question: string): Promise<AskElectraResponse> {
  const res = await fetch(`${API_BASE}/ai/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: question })
  });
  if (!res.ok) throw new Error('Failed to query Electra');
  return res.json();
}

export async function fetchBattlegroundMatrix(category?: string): Promise<{ total: number; filter_category?: string; items: BattlegroundSeatItem[] }> {
  const url = category 
    ? `${API_BASE}/assembly-constituencies/battleground-matrix?category=${encodeURIComponent(category)}`
    : `${API_BASE}/assembly-constituencies/battleground-matrix`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch battleground matrix');
  return res.json();
}

export async function compareACs(acNos: number[]): Promise<{ count: number; items: ACComparisonItem[] }> {
  const res = await fetch(`${API_BASE}/assembly-constituencies/compare?ac_nos=${acNos.join(',')}`);
  if (!res.ok) throw new Error('Failed to compare assembly constituencies');
  return res.json();
}

export interface StationCandidateResult {
  rank: number;
  candidate_name: string;
  party: string;
  color: string;
  votes: number;
  vote_share: number;
  deficit_vs_winner: number;
}

export interface PollingStationItem {
  id: number;
  part_no: number;
  station_name: string;
  address: string;
  total_electors: number;
  votes_polled: number;
  turnout_pct: number;
  latitude: number | null;
  longitude: number | null;
  election_year?: number;
  election_type?: string;
  lead_party: string;
  lead_party_color: string;
  lead_candidate: string;
  lead_votes?: number;
  lead_share?: number;
  runner_up_party?: string;
  runner_up_color?: string;
  runner_up_candidate?: string;
  runner_up_votes?: number;
  runner_up_share?: number;
  margin: number;
  lead_status_code?: string;
  lead_status_label?: string;
  transition_tag?: string;
  booth_grade_code?: string;
  booth_grade_label?: string;
  data_quality?: string;
  source_document?: string;
  results: StationCandidateResult[];
  timeline?: BoothTimelineItem[];
}

export interface BoothTimelineItem {
  year: number;
  election_type: string;
  winner_party: string;
  winner_color: string;
  winner_candidate: string;
  winner_votes: number;
  winner_share: number;
  runner_up_party: string;
  runner_up_color: string;
  runner_up_candidate: string;
  runner_up_votes: number;
  runner_up_share: number;
  margin: number;
}

export interface BoothPartyTallyItem {
  party: string;
  candidate_name: string;
  color: string;
  booths_won: number;
  booths_won_pct: number;
  total_votes: number;
  highest_margin: number;
  highest_margin_booth: number;
  highest_margin_station_name: string;
}

export interface PollingStationsSummary {
  year?: number;
  election_type?: string;
  total_polling_stations: number;
  total_electors: number;
  total_votes_polled: number;
  avg_turnout_pct: number;
  highest_turnout_station: { part_no: number; station_name: string; turnout_pct: number } | null;
  lowest_turnout_station: { part_no: number; station_name: string; turnout_pct: number } | null;
  party_tally: BoothPartyTallyItem[];
  margin_buckets: {
    under_25: number;
    between_25_50: number;
    between_50_100: number;
    over_100: number;
  };
}

export interface PollingStationsResponse {
  ac_no: number;
  ac_name: string;
  district: string;
  year?: number;
  election_type?: string;
  total_stations: number;
  page: number;
  limit: number;
  total_pages: number;
  summary?: PollingStationsSummary | null;
  data_quality?: {
    pipeline: string;
    status: string;
    cycles: Record<string, { type: string; status: string; source: string; reconciled: boolean }>;
  };
  items: PollingStationItem[];
}

export interface GeoPollingStation {
  id: number;
  ac_no: number;
  ac_name: string;
  part_no: number;
  station_name: string;
  address: string;
  lat: number;
  lng: number;
  total_electors: number;
  votes_polled: number;
  turnout_pct: number;
  lead_party: string;
  lead_party_color: string;
  lead_candidate: string;
  margin: number;
  year?: number;
}

export interface DistrictPollingStationsResponse {
  district: string;
  year?: number;
  total_stations: number;
  stations: GeoPollingStation[];
}

export interface BoothCandidateDetail {
  rank: number;
  name: string;
  party: string;
  color: string;
  party_color?: string;
  votes: number;
  share: number;
  vote_share?: number;
  is_winner: boolean;
  raw_candidate_name?: string;
  raw_party_name?: string;
  raw_votes?: number;
}

export interface BoothTrendPoint {
  year: number;
  election_type: string;
  winner_party: string;
  winner_name: string;
  runner_up_party?: string;
  runner_up_name?: string;
  margin: number;
  total_votes: number;
  sp_votes: number;
  sp_share: number;
  bjp_votes: number;
  bjp_share: number;
  bsp_votes: number;
  bsp_share: number;
  inc_votes?: number;
  inc_share?: number;
  mapping_confidence?: string;
}

export interface ComparisonDelta {
  period: string;
  from_year: number;
  to_year: number;
  winner_transition: string;
  winner_changed: boolean;
  margin_delta: number;
  sp_vote_share_delta_pp: number;
  bjp_vote_share_delta_pp: number;
  bsp_vote_share_delta_pp: number;
  mapping_confidence: string;
}

export interface AuditRecord {
  year: number;
  election_type: string;
  candidate_name: string;
  party: string;
  raw_candidate_name: string;
  raw_party_name: string;
  raw_votes: number;
  source_document: string;
  source_url: string;
  source_page: string;
  validation_status: string;
  timestamp: string | null;
}

export interface BoothDetailResponse {
  ac_no: number;
  ac_name: string;
  part_no: number;
  station_name: string;
  address: string;
  total_electors: number;
  votes_polled: number;
  turnout_pct: number;
  latitude: number | null;
  longitude: number | null;
  cycles: Record<string, {
    year: number;
    election_type: string;
    source_document: string;
    source_url?: string;
    source_page?: string;
    validation_status?: string;
    mapping_confidence?: string;
    candidates: BoothCandidateDetail[];
  }>;
  trends: BoothTrendPoint[];
  comparison_deltas: ComparisonDelta[] | null;
  mapping_verified: boolean;
  mapping_status_notice: string | null;
  audit_trail: AuditRecord[];
  reconciliation: {
    status: string;
    message: string;
    verified_at: string;
  };
  sir_audit: {
    previous_electors: number | null;
    current_electors: number;
    net_change: number | null;
    change_pct: number | null;
    formula_applied: string;
    calculable: boolean;
    data_confidence: string;
    statutory_notice: string;
  };
  electra_evidence: {
    evidence_metadata: any;
    FACT: string[];
    OBSERVATION: string[];
    DOCUMENTED_FACTOR: string[];
    POSSIBLE_FACTOR: string[];
    HYPOTHESIS: string[];
    CAUSATION_POLICY: string;
  };
}

export async function fetchACPollingStations(
  acNo: number,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    party?: string;
    year?: number;
    lead_status?: string;
    margin_threshold?: number;
    transition_filter?: string;
    booth_grade?: string;
  }
): Promise<PollingStationsResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.search) query.set('search', params.search);
  if (params?.party) query.set('party', params.party);
  if (params?.year) query.set('year', params.year.toString());
  if (params?.lead_status) query.set('lead_status', params.lead_status);
  if (params?.margin_threshold) query.set('margin_threshold', params.margin_threshold.toString());
  if (params?.transition_filter) query.set('transition_filter', params.transition_filter);
  if (params?.booth_grade) query.set('booth_grade', params.booth_grade);

  const qs = query.toString();
  const url = `${API_BASE}/assembly-constituencies/${acNo}/polling-stations${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch polling stations for AC #${acNo}`);
  return res.json();
}

export async function fetchDistrictPollingStations(
  districtName: string,
  acNo?: number,
  year?: number
): Promise<DistrictPollingStationsResponse> {
  const query = new URLSearchParams();
  if (acNo) query.set('ac_no', acNo.toString());
  if (year) query.set('year', year.toString());
  const qs = query.toString();
  const url = `${API_BASE}/assembly-constituencies/district/${encodeURIComponent(districtName)}/polling-stations${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch polling stations for district ${districtName}`);
  return res.json();
}

export async function fetchBoothDetail(
  acNo: number,
  partNo: number
): Promise<BoothDetailResponse> {
  const url = `${API_BASE}/assembly-constituencies/${acNo}/booths/${partNo}/details`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch booth details for AC #${acNo} Part #${partNo}`);
  return res.json();
}



// ==========================================
// MISSION 2027: WAR ROOM STRATEGY API TYPES
// ==========================================

export interface BoothClassificationItem {
  part_no: number;
  station_name: string;
  address: string;
  total_electors: number;
  votes_polled_2024: number;
  turnout_pct_2024: number;
  winner_2024_party: string;
  winner_2024_name: string;
  winner_2024_votes: number;
  runner_up_2024_party: string;
  runner_up_2024_votes: number;
  margin_2024: number;
  winner_2022_party: string;
  winner_2022_name: string;
  winner_2022_votes: number;
  margin_2022: number;
  sp_votes_2024: number;
  bjp_votes_2024: number;
  sp_votes_2022: number;
  bjp_votes_2022: number;
  elector_drop_pct: number;
  category_code: 'PDA_FORTRESS' | 'FLIPPED_TO_SP' | 'BATTLEGROUND' | 'OPPORTUNITY' | 'DEFENSIVE_ALERT' | 'SP_LEAD' | 'UPHILL';
  category_label: string;
  category_color: string;
  category_badge: string;
  priority_task: string;
  is_flipped: boolean;
  is_fortress: boolean;
  is_battleground: boolean;
  is_opportunity: boolean;
  is_defensive_alert: boolean;
  is_deletion_risk: boolean;
  target_votes_2027: number;
  deficit_to_win: number;
  alliance_timeline?: Array<{
    year: number;
    alliance: string;
    winner: string;
    margin: number;
  }>;
}

export interface BoothClassificationResponse {
  ac_no: number;
  ac_name: string;
  district: string;
  counts: {
    ALL: number;
    PDA_FORTRESS: number;
    FLIPPED_TO_SP: number;
    BATTLEGROUND: number;
    OPPORTUNITY: number;
    DEFENSIVE_ALERT: number;
    UPHILL: number;
    DELETION_RISK: number;
    SP_LEAD_2024: number;
    BJP_LEAD_2024: number;
  };
  total_filtered: number;
  page: number;
  limit: number;
  total_pages: number;
  booths: BoothClassificationItem[];
}

export interface BLATaskCardResponse {
  ac_no: number;
  ac_name: string;
  part_no: number;
  station_name: string;
  status_tag: string;
  sp_votes_2024: number;
  bjp_votes_2024: number;
  margin_2024: number;
  is_sp_lead_2024: boolean;
  target_votes_2027: number;
  electors: number;
  turnout_pct: number;
  deletion_alert: boolean;
  whatsapp_text: string;
  share_url: string;
}

export interface TurnoutSimulationResponse {
  part_no: number;
  station_name: string;
  total_electors: number;
  baseline: {
    turnout_pct: number;
    votes_polled: number;
    sp_votes: number;
    bjp_votes: number;
    sp_margin: number;
    sp_won: boolean;
  };
  simulation: {
    target_turnout_pct: number;
    incremental_votes: number;
    additional_sp_votes: number;
    simulated_sp_votes: number;
    simulated_bjp_votes: number;
    simulated_margin: number;
    sp_won: boolean;
    flipped_to_sp: boolean;
    message: string;
  };
}

export async function fetchBoothClassification(
  acNo: number,
  params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<BoothClassificationResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());

  const qs = query.toString();
  const url = `${API_BASE}/strategy/assembly/${acNo}/booth-classification${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch booth classification for AC #${acNo}`);
  return res.json();
}

export async function fetchBLATaskCard(
  acNo: number,
  partNo: number
): Promise<BLATaskCardResponse> {
  const url = `${API_BASE}/strategy/assembly/${acNo}/booth/${partNo}/bla-card`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch BLA task card for AC #${acNo} Part #${partNo}`);
  return res.json();
}

export async function simulateBoothTurnout(
  acNo: number,
  partNo: number,
  targetTurnoutPct: number,
  pdaFavorPct: number = 65.0
): Promise<TurnoutSimulationResponse> {
  const url = `${API_BASE}/strategy/assembly/${acNo}/booth/${partNo}/simulate-turnout`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_turnout_pct: targetTurnoutPct,
      pda_favor_pct: pdaFavorPct
    })
  });
  if (!res.ok) throw new Error(`Failed to simulate turnout for AC #${acNo} Part #${partNo}`);
  return res.json();
}

export interface BoothWorkerInfo {
  ac_no: number;
  part_no: number;
  adhyaksh_name: string;
  adhyaksh_mobile: string;
  bla2_name: string;
  bla2_mobile: string;
  status: string;
  form6_count?: number;
  target_met?: boolean;
  last_activity?: string;
}

export interface HQProgressTrackerResponse {
  ac_no: number;
  ac_name: string;
  total_booths: number;
  verified_booths: number;
  verification_pct: number;
  total_form6_submitted: number;
  youth_voters_enrolled: number;
  chaupals_completed: number;
  target_chaupals: number;
  last_sync: string;
  hq_status: string;
  sectors: Array<{
    sector_no: number;
    sector_name: string;
    booths: number;
    verified: number;
    pct: number;
  }>;
}

export interface PDASocialEstimatorResponse {
  ac_no: number;
  ac_name: string;
  total_electors: number;
  estimated_pda_electors: number;
  estimated_pda_share_pct: number;
  current_pda_sp_share_pct: number;
  mobilized_sp_votes: number;
  untapped_pda_non_voters: number;
  untapped_split_pda_votes: number;
  total_opportunity_votes: number;
  target_2027_margin_potential: string;
  key_action: string;
}

export async function fetchBoothWorker(acNo: number, partNo: number): Promise<BoothWorkerInfo> {
  const res = await fetch(`${API_BASE}/strategy/assembly/${acNo}/booth/${partNo}/worker`);
  if (!res.ok) throw new Error(`Failed to fetch worker for AC #${acNo} Part #${partNo}`);
  return res.json();
}

export async function saveBoothWorker(acNo: number, partNo: number, data: Partial<BoothWorkerInfo>, roleKey?: string): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (roleKey) headers['x-role-key'] = roleKey;
  const res = await fetch(`${API_BASE}/strategy/assembly/${acNo}/booth/${partNo}/worker`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Failed to save worker for AC #${acNo} Part #${partNo}`);
  return res.json();
}

export async function fetchHQProgressTracker(acNo: number): Promise<HQProgressTrackerResponse> {
  const res = await fetch(`${API_BASE}/strategy/assembly/${acNo}/progress-tracker`);
  if (!res.ok) throw new Error(`Failed to fetch progress tracker for AC #${acNo}`);
  return res.json();
}

export async function fetchPDASocialEstimator(acNo: number): Promise<PDASocialEstimatorResponse> {
  const res = await fetch(`${API_BASE}/strategy/assembly/${acNo}/pda-estimator`);
  if (!res.ok) throw new Error(`Failed to fetch PDA estimator for AC #${acNo}`);
  return res.json();
}

export function getACDossierExportUrl(acNo: number): string {
  return `${API_BASE}/strategy/assembly/${acNo}/export-dossier`;
}

// ==========================================
// ELECTRA AI INTELLIGENCE ENGINE CLIENT TYPES
// ==========================================

export interface ElectraFactorItem {
  type: 'FACT' | 'OBSERVATION' | 'DOCUMENTED FACTOR' | 'POSSIBLE FACTOR' | 'UNKNOWN';
  label: string;
  text: string;
}

export interface ElectraSections {
  quick_answer: string;
  what_data_shows: string;
  what_changed: string;
  current_context: string;
  factors: ElectraFactorItem[];
  limitations: string;
}

export interface ElectraCalculationItem {
  id: string;
  label: string;
  formula: string;
  inputs: Record<string, any>;
  result: string;
  verification: string;
}

export interface ElectraEvidenceItem {
  id: string;
  title: string;
  category: string;
  authority: string;
  year?: string | number;
  verification_status: string;
  confidence_grade: string;
  source_url?: string;
  publication_date?: string;
  metrics?: Record<string, any>;
}

export interface ElectraEvidencePackage {
  evidence_id: string;
  confidence_overall: string;
  calculations: ElectraCalculationItem[];
  evidence_items: ElectraEvidenceItem[];
  statutory_documents?: any[];
}

export interface ElectraQueryResponse {
  question: string;
  intent: string;
  quick_answer: string;
  sections: ElectraSections;
  evidence: ElectraEvidencePackage;
  latency_ms: number;
}

export interface ElectraNewsSource {
  name: string;
  url: string;
  quality: string;
}

export interface ElectraNewsItem {
  id: string;
  headline: string;
  summary: string;
  district?: string;
  ac_no?: number;
  ac_name?: string;
  source_name: string;
  source_url: string;
  source_quality: string;
  publication_date: string;
  retrieved_at: string;
  cluster_count: number;
  sources: ElectraNewsSource[];
  category: string;
  claims: string[];
}

export interface ElectraNotificationItem {
  id: number;
  title: string;
  summary: string;
  alert_type: string;
  category: string;
  target_type: string;
  target_id: string;
  source_name?: string;
  source_url?: string;
  source_quality?: string;
  publication_date?: string;
  cluster_count: number;
  is_read: boolean;
  created_at: string;
}

export interface ElectraDailyDigest {
  title: string;
  date: string;
  status: string;
  executive_summary: string;
  bulletin_items: Array<{
    headline: string;
    summary: string;
    source: string;
    date: string;
    badge: string;
  }>;
}

export interface ElectraSubscriptionItem {
  id: number;
  target_type: string;
  target_id: string;
  target_name?: string;
  alert_frequency: string;
  created_at: string;
}

export interface ElectraTraceLogItem {
  id: number;
  query: string;
  intent: string;
  latency_ms: number;
  internal_records: number;
  external_sources: number;
  numerical_checks_passed: boolean;
  hallucination_flag: boolean;
  timestamp: string;
}

export async function askElectraIntelligence(payload: {
  query: string;
  context?: Record<string, any>;
  session_id?: string;
}): Promise<ElectraQueryResponse> {
  const res = await fetch(`${API_BASE}/electra/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Electra query failed with HTTP ${res.status}`);
  return res.json();
}

export async function fetchElectraNews(district?: string, acNo?: number): Promise<ElectraNewsItem[]> {
  const params = new URLSearchParams();
  if (district) params.append('district', district);
  if (acNo) params.append('ac_no', acNo.toString());
  const res = await fetch(`${API_BASE}/electra/news?${params.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchElectraNotifications(): Promise<ElectraNotificationItem[]> {
  const res = await fetch(`${API_BASE}/electra/notifications`);
  if (!res.ok) return [];
  return res.json();
}

export async function markElectraNotificationRead(id: number): Promise<void> {
  await fetch(`${API_BASE}/electra/notifications/${id}/read`, { method: 'POST' });
}

export async function fetchElectraDigest(): Promise<ElectraDailyDigest> {
  const res = await fetch(`${API_BASE}/electra/digest`);
  if (!res.ok) throw new Error('Failed to fetch digest');
  return res.json();
}

export async function fetchElectraSubscriptions(): Promise<ElectraSubscriptionItem[]> {
  const res = await fetch(`${API_BASE}/electra/subscriptions`);
  if (!res.ok) return [];
  return res.json();
}

export async function createElectraSubscription(sub: {
  target_type: string;
  target_id: string;
  target_name?: string;
  alert_frequency?: string;
}): Promise<void> {
  await fetch(`${API_BASE}/electra/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub)
  });
}

export async function deleteElectraSubscription(id: number): Promise<void> {
  await fetch(`${API_BASE}/electra/subscriptions/${id}`, { method: 'DELETE' });
}

export async function fetchElectraTraceLogs(): Promise<ElectraTraceLogItem[]> {
  const res = await fetch(`${API_BASE}/electra/debug-trace`);
  if (!res.ok) return [];
  return res.json();
}
