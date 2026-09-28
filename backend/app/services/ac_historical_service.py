import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DATA_FILE = Path(__file__).resolve().parents[3] / 'data' / 'historical_assembly_data.json'

_CACHED_DATA = None

def get_master_data() -> Dict[str, Any]:
    global _CACHED_DATA
    if _CACHED_DATA is None:
        if DATA_FILE.exists():
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                _CACHED_DATA = json.load(f)
        else:
            _CACHED_DATA = {}
    return _CACHED_DATA

def get_ac_historical_record(ac_no: int) -> Optional[Dict[str, Any]]:
    data = get_master_data()
    return data.get(str(ac_no))

def list_ac_historical_summaries(year: int = 2022) -> List[Dict[str, Any]]:
    data = get_master_data()
    items = []
    for ac_str, ac in data.items():
        elections = {e['year']: e for e in ac.get('historical_winner_timeline', [])}
        el = elections.get(year)
        if not el:
            el = ac.get('latest_assembly_election', {})
            
        items.append({
            'ac_no': ac['basic_info']['ac_no'],
            'name': ac['basic_info']['name'],
            'category': ac['basic_info']['category'],
            'district': ac['basic_info']['district'],
            'parent_pc': ac['basic_info']['parent_pc'],
            'election_year': year,
            'election_type': 'Vidhan Sabha',
            'winner': {
                'name': el.get('winner', 'N/A'),
                'party': el.get('winner_party', 'OTHER'),
                'votes': el.get('winner_votes', 0),
                'vote_pct': round((el.get('winner_votes', 0) / el.get('valid_votes', 1)) * 100, 2) if el.get('valid_votes') else 0.0
            },
            'runner_up': {
                'name': el.get('runner_up', 'N/A'),
                'party': el.get('runner_up_party', 'OTHER'),
                'votes': el.get('runner_up_votes', 0),
                'vote_pct': round((el.get('runner_up_votes', 0) / el.get('valid_votes', 1)) * 100, 2) if el.get('valid_votes') else 0.0
            },
            'margin': el.get('margin', 0),
            'margin_pct': el.get('margin_pct', 0.0),
            'turnout_pct': el.get('turnout_pct', 0.0),
            'valid_votes': el.get('valid_votes', 0),
            'total_electors': el.get('total_electors', 0),
            'mission_2027': ac.get('mission_2027', {}),
            'split_voting': ac.get('split_voting_analysis', {})
        })
    return items

def get_battleground_matrix(filter_category: Optional[str] = None) -> List[Dict[str, Any]]:
    data = get_master_data()
    matrix = []
    for ac_str, ac in data.items():
        m27 = ac.get('mission_2027', {})
        cat = m27.get('category', 'Competitive / Swing-like')
        if filter_category and cat.lower() != filter_category.lower():
            continue
            
        tri = ac.get('tri_election_comparison', {})
        vs22 = tri.get('assembly_2022', {})
        ls24 = tri.get('lok_sabha_segment_2024', {})
        
        matrix.append({
            'ac_no': ac['basic_info']['ac_no'],
            'name': ac['basic_info']['name'],
            'district': ac['basic_info']['district'],
            'category': ac['basic_info']['category'],
            'parent_pc': ac['basic_info']['parent_pc'],
            'battleground_category': cat,
            'reason_metric': m27.get('reason_metric', ''),
            'competitiveness_level': m27.get('competitiveness_level', 'Moderate'),
            'winner_2022_party': vs22.get('party', 'N/A'),
            'winner_2022_candidate': vs22.get('winner', 'N/A'),
            'margin_2022': vs22.get('margin_votes', 0),
            'margin_pct_2022': vs22.get('margin_percentage', 0.0),
            'lead_2024_party': ls24.get('party', 'N/A'),
            'lead_2024_candidate': ls24.get('winner', 'N/A'),
            'margin_2024': ls24.get('margin_votes', 0),
            'split_pattern': ac.get('split_voting_analysis', {}).get('pattern_category', 'Stable')
        })
    return matrix

def compare_assembly_constituencies(ac_nos: List[int]) -> List[Dict[str, Any]]:
    data = get_master_data()
    comparison = []
    for ac_no in ac_nos:
        ac = data.get(str(ac_no))
        if not ac:
            continue
            
        tri = ac.get('tri_election_comparison', {})
        vs17 = tri.get('assembly_2017', {})
        vs22 = tri.get('assembly_2022', {})
        ls24 = tri.get('lok_sabha_segment_2024', {})
        sir = ac.get('sir_electoral_roll', {})
        demo = ac.get('demographics', {})
        m27 = ac.get('mission_2027', {})
        split = ac.get('split_voting_analysis', {})
        
        comparison.append({
            'ac_no': ac['basic_info']['ac_no'],
            'name': ac['basic_info']['name'],
            'district': ac['basic_info']['district'],
            'category': ac['basic_info']['category'],
            'parent_pc': ac['basic_info']['parent_pc'],
            # 2022 VS
            'winner_2022': vs22.get('winner', 'N/A'),
            'party_2022': vs22.get('party', 'N/A'),
            'votes_2022': vs22.get('votes', 0),
            'margin_2022': vs22.get('margin_votes', 0),
            'margin_pct_2022': vs22.get('margin_percentage', 0.0),
            'turnout_2022': vs22.get('turnout_percentage', 0.0),
            'electors_2022': vs22.get('total_electors', 0),
            # 2017 VS
            'winner_2017': vs17.get('winner', 'N/A'),
            'party_2017': vs17.get('party', 'N/A'),
            'votes_2017': vs17.get('votes', 0),
            'margin_2017': vs17.get('margin_votes', 0),
            'margin_pct_2017': vs17.get('margin_percentage', 0.0),
            'turnout_2017': vs17.get('turnout_percentage', 0.0),
            # 2024 LS Segment
            'lead_2024': ls24.get('winner', 'N/A'),
            'party_2024': ls24.get('party', 'N/A'),
            'votes_2024': ls24.get('votes', 0),
            'margin_2024': ls24.get('margin_votes', 0),
            'margin_pct_2024': ls24.get('margin_percentage', 0.0),
            'turnout_2024': ls24.get('turnout_percentage', 0.0),
            # SIR
            'sir_net_change': sir.get('net_change'),
            'sir_pct_change': sir.get('percentage_change'),
            'sir_impact_label': sir.get('impact_category', 'Not calculable'),
            'sir_data_status': sir.get('data_status', 'Unavailable'),
            'sir_unavailability_notice': sir.get('unavailability_notice'),
            # Demographics
            'sc_pct': demo.get('sc_pct', 0.0),
            'literacy_pct': demo.get('overall_literacy_pct', 0.0),
            'rural_pct': demo.get('rural_pct', 0.0),
            # Classification
            'battleground_category': m27.get('category', 'Competitive / Swing-like'),
            'split_pattern': split.get('pattern_category', 'Stable')
        })
    return comparison
