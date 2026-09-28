from typing import Dict, Any, List

class DataValidationEngine:
    @staticmethod
    def validate_candidate_votes(general_votes: int, postal_votes: int, total_votes: int) -> bool:
        return (general_votes + postal_votes) == total_votes

    @staticmethod
    def validate_margin(winner_votes: int, runner_up_votes: int, margin: int) -> bool:
        return (winner_votes - runner_up_votes) == margin

    @staticmethod
    def calculate_vote_share(votes: int, valid_votes: int) -> float:
        if valid_votes <= 0:
            return 0.0
        return round((votes / valid_votes) * 100.0, 2)

    @staticmethod
    def calculate_turnout(votes_polled: int, total_electors: int) -> float:
        if total_electors <= 0:
            return 0.0
        return round((votes_polled / total_electors) * 100.0, 2)

    @staticmethod
    def get_data_quality_badge(source_type: str = "ECI_OFFICIAL") -> Dict[str, str]:
        badges = {
            "ECI_OFFICIAL": {
                "label": "OFFICIAL ECI",
                "class": "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300",
                "description": "Certified primary data from Election Commission of India official publications."
            },
            "DERIVED": {
                "label": "DERIVED (OFFICIAL)",
                "class": "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-300",
                "description": "Mathematically derived directly from official ECI figures using validated formulas."
            },
            "SECONDARY": {
                "label": "SECONDARY SOURCE",
                "class": "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300",
                "description": "Compiled from credible secondary research documents."
            },
            "SURVEY": {
                "label": "OPINION POLL / SURVEY",
                "class": "bg-yellow-100 text-yellow-900 border-yellow-400 dark:bg-yellow-950 dark:text-yellow-300",
                "description": "Pre-election or exit poll sample data. NOT an official election result."
            },
            "SIMULATION": {
                "label": "SIMULATION / SCENARIO",
                "class": "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300",
                "description": "Hypothetical mathematical model. NOT an election prediction or result."
            },
            "UNVERIFIED": {
                "label": "UNVERIFIED",
                "class": "bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300",
                "description": "Data awaiting administrative validation against primary gazettes."
            }
        }
        return badges.get(source_type, badges["UNVERIFIED"])
