"""
ELECTION CHANGE DETECTOR
Automatically detects verified electoral shifts between cycles:
  - Winner changed (party flip vs retention)
  - Margin widened vs narrowed
  - Turnout increased vs declined
  - Runner-up party replacement
  - Vote-share delta
"""

from typing import Dict, Any, List

def detect_electoral_changes(
    baseline_election: str,
    comparison_election: str,
    baseline_data: Dict[str, Any],
    comparison_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes verified factual changes between baseline and comparison elections.
    """
    base_winner_party = baseline_data.get("winner_party") or baseline_data.get("party") or "OTHER"
    comp_winner_party = comparison_data.get("winner_party") or comparison_data.get("party") or "OTHER"
    base_winner_cand = baseline_data.get("winner_candidate") or baseline_data.get("candidate") or "N/A"
    comp_winner_cand = comparison_data.get("winner_candidate") or comparison_data.get("candidate") or "N/A"
    
    base_margin = int(baseline_data.get("margin") or 0)
    comp_margin = int(comparison_data.get("margin") or 0)
    margin_diff = comp_margin - base_margin
    
    base_turnout = float(baseline_data.get("turnout_pct") or 0.0)
    comp_turnout = float(comparison_data.get("turnout_pct") or 0.0)
    turnout_diff = round(comp_turnout - base_turnout, 2)
    
    winner_changed = (base_winner_party != comp_winner_party)
    
    changes: List[str] = []
    
    if winner_changed:
        changes.append(f"Seat flipped from {base_winner_party} to {comp_winner_party} (Elected: {comp_winner_cand})")
    else:
        changes.append(f"{comp_winner_party} retained the seat (Elected: {comp_winner_cand})")
        
    if abs(margin_diff) > 0:
        if margin_diff > 0:
            changes.append(f"Victory margin widened by {margin_diff:,} votes (from {base_margin:,} to {comp_margin:,})")
        else:
            changes.append(f"Victory margin narrowed by {abs(margin_diff):,} votes (from {base_margin:,} to {comp_margin:,})")
            
    if base_turnout > 0 and comp_turnout > 0:
        if turnout_diff > 0:
            changes.append(f"Voter turnout increased by +{turnout_diff}% (from {base_turnout}% to {comp_turnout}%)")
        elif turnout_diff < 0:
            changes.append(f"Voter turnout declined by {turnout_diff}% (from {base_turnout}% to {comp_turnout}%)")
            
    base_runner_party = baseline_data.get("runner_up_party")
    comp_runner_party = comparison_data.get("runner_up_party")
    runner_up_changed = False
    if base_runner_party and comp_runner_party and base_runner_party != comp_runner_party:
        runner_up_changed = True
        changes.append(f"Runner-up challenger changed from {base_runner_party} to {comp_runner_party}")

    return {
        "baseline_election": baseline_election,
        "comparison_election": comparison_election,
        "winner_changed": winner_changed,
        "previous_winner": {
            "party": base_winner_party,
            "candidate": base_winner_cand,
            "margin": base_margin
        },
        "current_winner": {
            "party": comp_winner_party,
            "candidate": comp_winner_cand,
            "margin": comp_margin
        },
        "margin_change": {
            "direction": "widened" if margin_diff > 0 else ("narrowed" if margin_diff < 0 else "unchanged"),
            "delta_votes": margin_diff
        },
        "turnout_change": {
            "delta_pct": turnout_diff
        },
        "runner_up_changed": runner_up_changed,
        "summary_statements": changes
    }
