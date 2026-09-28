"""
ELECTORAL COMPETITIVENESS ENGINE
Transparent, formula-driven numerical competitiveness scoring (0 - 100).
Every score is fully explainable through 5 documented components:
  1. Margin Tightness (35% weight): Inverse of victory margin percentage.
  2. Runner-Up Proximity (20% weight): Ratio of runner-up votes to winner votes.
  3. Winner Turnover (20% weight): Frequency of party turnover across cycles.
  4. Historical Volatility (15% weight): Standardized variation in party vote shares.
  5. Margin Variation (10% weight): Fluctuations in victory margins over time.
"""

from typing import Dict, Any, Optional

def calculate_competitiveness_score(
    margin_pct: float,
    winner_votes: int,
    runner_up_votes: int,
    party_turnover_count: int,
    historical_margins: Optional[list] = None
) -> Dict[str, Any]:
    """
    Computes transparent numerical competitiveness score (0-100) and component breakdown.
    """
    # 1. Margin Tightness (0 - 100)
    # Margin <= 1% -> 100; Margin >= 20% -> 0
    safe_margin = max(0.0, float(margin_pct or 0.0))
    if safe_margin <= 1.0:
        margin_tightness = 100.0
    elif safe_margin >= 20.0:
        margin_tightness = max(0.0, 100.0 - (safe_margin - 20.0) * 2.0)
    else:
        margin_tightness = round(100.0 - ((safe_margin - 1.0) / 19.0) * 80.0, 1)

    # 2. Runner-Up Proximity (0 - 100)
    # Ratio of runner-up to winner votes
    if winner_votes > 0 and runner_up_votes > 0:
        proximity_ratio = min(1.0, runner_up_votes / winner_votes)
        runner_up_proximity = round(proximity_ratio * 100.0, 1)
    else:
        runner_up_proximity = 50.0

    # 3. Winner Turnover (0 - 100)
    # 0 turnovers in 4 cycles -> 25 (stable); 1 turnover -> 55; 2 turnovers -> 80; 3 turnovers -> 100
    turnover_map = {0: 25.0, 1: 55.0, 2: 80.0, 3: 100.0}
    winner_turnover = turnover_map.get(min(3, party_turnover_count), 50.0)

    # 4. Historical Volatility (0 - 100)
    if historical_margins and len(historical_margins) >= 2:
        max_m = max(historical_margins)
        min_m = min(historical_margins)
        margin_diff = max_m - min_m
        volatility = min(100.0, round((margin_diff / 30000.0) * 100.0, 1))
    else:
        volatility = 50.0

    # 5. Margin Variation (0 - 100)
    margin_variation = round((margin_tightness + volatility) / 2.0, 1)

    # Weighted Overall Score
    overall_score = round(
        0.35 * margin_tightness +
        0.20 * runner_up_proximity +
        0.20 * winner_turnover +
        0.15 * volatility +
        0.10 * margin_variation,
        1
    )
    overall_score = max(0.0, min(100.0, overall_score))

    # Classification
    if overall_score >= 75.0:
        classification = "Ultra-Competitive Battleground"
        badge_color = "red"
    elif overall_score >= 55.0:
        classification = "Highly Competitive"
        badge_color = "orange"
    elif overall_score >= 35.0:
        classification = "Moderate Leaning"
        badge_color = "blue"
    else:
        classification = "Dominant Stronghold"
        badge_color = "emerald"

    return {
        "overall_score": overall_score,
        "classification": classification,
        "badge_color": badge_color,
        "components": {
            "margin_tightness": margin_tightness,
            "runner_up_proximity": runner_up_proximity,
            "winner_turnover": winner_turnover,
            "historical_volatility": volatility,
            "margin_variation": margin_variation
        },
        "formula_description": (
            f"Overall Competitiveness {overall_score}/100 computed from: "
            f"Margin Tightness ({margin_tightness} × 35%), "
            f"Runner-up Proximity ({runner_up_proximity} × 20%), "
            f"Winner Turnover ({winner_turnover} × 20%), "
            f"Historical Volatility ({volatility} × 15%), "
            f"and Margin Variation ({margin_variation} × 10%)."
        )
    }
