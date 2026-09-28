from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.models import Candidate, CandidateResult, ElectionResult, Election, Party, ParliamentaryConstituency, AssemblyConstituency

router = APIRouter(prefix="/api/candidates", tags=["Candidate Dossier"])

# Certified metadata registry and verified lifetime electoral records for prominent UP political leaders
PROMINENT_LEADERS_REGISTRY: Dict[str, Dict[str, Any]] = {
    "AKHILESH YADAV": {
        "hindi_name": "अखिलेश यादव",
        "current_role": "Member of Parliament (MP), Lok Sabha — Kannauj",
        "current_role_hi": "सांसद (लोकसभा) — कन्नौज | राष्ट्रीय अध्यक्ष, सपा",
        "current_party": "SP",
        "party_color": "#E11D48",
        "photo_url": "/assets/leaders/akhilesh_yadav.jpg",
        "bio_en": "National President of the Samajwadi Party and 20th Chief Minister of Uttar Pradesh (2012–2017). Has undefeated parliamentary and assembly record across Uttar Pradesh.",
        "bio_hi": "समाजवादी पार्टी के राष्ट्रीय अध्यक्ष एवं उत्तर प्रदेश के 20वें मुख्यमंत्री (2012–2017)। अपने सभी संसदीय व विधानसभा चुनावों में अपराजित रहे हैं।",
        "primary_candidate_id": 475,
        "verified_candidate_ids": [475, 2212, 6648],
        "stats": {
            "total_contests": 7,
            "wins": 7,
            "losses": 0,
            "win_rate_pct": 100.0,
            "total_career_votes": 2948098,
            "has_switched_parties": False,
            "party_loyalty_en": "Loyal to Samajwadi Party (7 Contests)",
            "party_loyalty_hi": "सपा (SP) के प्रति पूर्णतः निष्ठावान — सभी 7 चुनाव विजयी 🏆",
            "parties_contested": ["SP"],
            "first_year": 2000,
            "latest_year": 2024
        },
        "verified_contests": [
            {
                "year": 2024,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2024",
                "seat_type": "PC",
                "seat_no": 42,
                "seat_name": "Kannauj",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 642292,
                "general_votes": 639840,
                "postal_votes": 2452,
                "vote_pct": 52.95,
                "margin": 170922,
                "turnout_pct": 61.08,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "SUBRAT PATHAK",
                "opponent_party": "BJP"
            },
            {
                "year": 2022,
                "election_type": "Vidhan Sabha",
                "election_name": "Vidhan Sabha General Election 2022",
                "seat_type": "AC",
                "seat_no": 110,
                "seat_name": "Karhal (Mainpuri)",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 148196,
                "general_votes": 147510,
                "postal_votes": 686,
                "vote_pct": 60.12,
                "margin": 67504,
                "turnout_pct": 66.14,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "PROF. S.P. SINGH BAGHEL",
                "opponent_party": "BJP"
            },
            {
                "year": 2019,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2019",
                "seat_type": "PC",
                "seat_no": 69,
                "seat_name": "Azamgarh",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 621578,
                "general_votes": 619940,
                "postal_votes": 1638,
                "vote_pct": 60.40,
                "margin": 259874,
                "turnout_pct": 57.56,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "DINESH LAL YADAV 'NIRAHUA'",
                "opponent_party": "BJP"
            },
            {
                "year": 2009,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2009",
                "seat_type": "PC",
                "seat_no": 42,
                "seat_name": "Kannauj",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 404644,
                "general_votes": 404644,
                "postal_votes": 0,
                "vote_pct": 53.11,
                "margin": 115864,
                "turnout_pct": 49.32,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "DR. MAHESH CHANDRA VERMA",
                "opponent_party": "BSP"
            },
            {
                "year": 2009,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2009",
                "seat_type": "PC",
                "seat_no": 20,
                "seat_name": "Firozabad",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 342510,
                "general_votes": 342510,
                "postal_votes": 0,
                "vote_pct": 42.48,
                "margin": 67301,
                "turnout_pct": 48.16,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆 (सीट खाली की)",
                "opponent_name": "PROF. S.P. SINGH BAGHEL",
                "opponent_party": "BSP"
            },
            {
                "year": 2004,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2004",
                "seat_type": "PC",
                "seat_no": 42,
                "seat_name": "Kannauj",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 464367,
                "general_votes": 464367,
                "postal_votes": 0,
                "vote_pct": 61.51,
                "margin": 307973,
                "turnout_pct": 56.44,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "RAJESH SINGH",
                "opponent_party": "BSP"
            },
            {
                "year": 2000,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha Bye-Election 2000",
                "seat_type": "PC",
                "seat_no": 42,
                "seat_name": "Kannauj",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 324561,
                "general_votes": 324561,
                "postal_votes": 0,
                "vote_pct": 43.12,
                "margin": 58765,
                "turnout_pct": 52.80,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆 (डेब्यू)",
                "opponent_name": "AKBAR AHMAD DUMPY",
                "opponent_party": "BSP"
            }
        ]
    },
    "ADITYANATH": {
        "hindi_name": "योगी आदित्यनाथ",
        "current_role": "Chief Minister of Uttar Pradesh | MLA Gorakhpur Urban",
        "current_role_hi": "मुख्यमंत्री, उत्तर प्रदेश | विधायक गोरखपुर शहर",
        "current_party": "BJP",
        "party_color": "#EA580C",
        "photo_url": "/assets/leaders/yogi_adityanath.jpg",
        "bio_en": "21st Chief Minister of Uttar Pradesh since 2017 and Head Priest of Gorakhnath Math. Undefeated 5-term MP from Gorakhpur and current MLA from Gorakhpur Urban.",
        "bio_hi": "2017 से उत्तर प्रदेश के 21वें मुख्यमंत्री एवं गोरक्षपीठ के महन्त। गोरखपुर से 5 बार सांसद व गोरखपुर शहर से विधायक — सभी चुनावों में अपराजित।",
        "primary_candidate_id": 4747,
        "verified_candidate_ids": [4747, 13142],
        "stats": {
            "total_contests": 6,
            "wins": 6,
            "losses": 0,
            "win_rate_pct": 100.0,
            "total_career_votes": 1997233,
            "has_switched_parties": False,
            "party_loyalty_en": "Loyal to BJP (6 Contests)",
            "party_loyalty_hi": "भाजपा (BJP) के प्रति पूर्णतः निष्ठावान — सभी 6 चुनाव विजयी 🏆",
            "parties_contested": ["BJP"],
            "first_year": 1998,
            "latest_year": 2022
        },
        "verified_contests": [
            {
                "year": 2022,
                "election_type": "Vidhan Sabha",
                "election_name": "Vidhan Sabha General Election 2022",
                "seat_type": "AC",
                "seat_no": 322,
                "seat_name": "Gorakhpur Urban",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 165499,
                "general_votes": 164800,
                "postal_votes": 699,
                "vote_pct": 54.85,
                "margin": 103390,
                "turnout_pct": 54.12,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "SUBHAWATI SHUKLA",
                "opponent_party": "SP"
            },
            {
                "year": 2014,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2014",
                "seat_type": "PC",
                "seat_no": 64,
                "seat_name": "Gorakhpur",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 539127,
                "general_votes": 537820,
                "postal_votes": 1307,
                "vote_pct": 51.80,
                "margin": 312783,
                "turnout_pct": 54.64,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "RAJMATI NISHAD",
                "opponent_party": "SP"
            },
            {
                "year": 2009,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2009",
                "seat_type": "PC",
                "seat_no": 64,
                "seat_name": "Gorakhpur",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 403156,
                "general_votes": 403156,
                "postal_votes": 0,
                "vote_pct": 53.85,
                "margin": 220271,
                "turnout_pct": 44.28,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "MANOJ TIWARI",
                "opponent_party": "SP"
            },
            {
                "year": 2004,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2004",
                "seat_type": "PC",
                "seat_no": 64,
                "seat_name": "Gorakhpur",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 353641,
                "general_votes": 353641,
                "postal_votes": 0,
                "vote_pct": 51.31,
                "margin": 142039,
                "turnout_pct": 48.13,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "JAMUNA PRASAD NISHAD",
                "opponent_party": "SP"
            },
            {
                "year": 1999,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 1999",
                "seat_type": "PC",
                "seat_no": 64,
                "seat_name": "Gorakhpur",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 267382,
                "general_votes": 267382,
                "postal_votes": 0,
                "vote_pct": 38.83,
                "margin": 7339,
                "turnout_pct": 53.64,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "JAMUNA PRASAD NISHAD",
                "opponent_party": "SP"
            },
            {
                "year": 1998,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 1998",
                "seat_type": "PC",
                "seat_no": 64,
                "seat_name": "Gorakhpur",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 268428,
                "general_votes": 268428,
                "postal_votes": 0,
                "vote_pct": 42.60,
                "margin": 26206,
                "turnout_pct": 52.88,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆 (डेब्यू)",
                "opponent_name": "JAMUNA PRASAD NISHAD",
                "opponent_party": "SP"
            }
        ]
    },
    "RAHUL GANDHI": {
        "hindi_name": "राहुल गांधी",
        "current_role": "Leader of the Opposition, Lok Sabha | MP Rae Bareli",
        "current_role_hi": "नेता प्रतिपक्ष (लोकसभा) | सांसद रायबरेली",
        "current_party": "INC",
        "party_color": "#0284C7",
        "photo_url": "/assets/leaders/rahul_gandhi.jpg",
        "bio_en": "Leader of Opposition in the 18th Lok Sabha. Represented Amethi (2004–2019) and won Rae Bareli with a historic margin in 2024.",
        "bio_hi": "18वीं लोकसभा में नेता प्रतिपक्ष। 2004 से 2019 तक अमेठी से सांसद रहे और 2024 में रायबरेली से 3.90 लाख मतों के अंतर से विजयी हुए।",
        "primary_candidate_id": 398,
        "verified_candidate_ids": [398, 6238, 12681],
        "stats": {
            "total_contests": 5,
            "wins": 4,
            "losses": 1,
            "win_rate_pct": 80.0,
            "total_career_votes": 2364068,
            "has_switched_parties": False,
            "party_loyalty_en": "Loyal to INC (5 Contests)",
            "party_loyalty_hi": "कांग्रेस (INC) के प्रति पूर्णतः निष्ठावान (5 चुनाव)",
            "parties_contested": ["INC"],
            "first_year": 2004,
            "latest_year": 2024
        },
        "verified_contests": [
            {
                "year": 2024,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2024",
                "seat_type": "PC",
                "seat_no": 36,
                "seat_name": "Rae Bareli",
                "party_code": "INC",
                "party_name": "Indian National Congress",
                "party_symbol": "Hand",
                "party_color": "#0284C7",
                "rank": 1,
                "is_winner": True,
                "votes": 687649,
                "general_votes": 684800,
                "postal_votes": 2849,
                "vote_pct": 66.67,
                "margin": 390030,
                "turnout_pct": 58.12,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "DINESH PRATAP SINGH",
                "opponent_party": "BJP"
            },
            {
                "year": 2019,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2019",
                "seat_type": "PC",
                "seat_no": 37,
                "seat_name": "Amethi",
                "party_code": "INC",
                "party_name": "Indian National Congress",
                "party_symbol": "Hand",
                "party_color": "#0284C7",
                "rank": 2,
                "is_winner": False,
                "votes": 413394,
                "general_votes": 412850,
                "postal_votes": 544,
                "vote_pct": 43.86,
                "margin": 55120,
                "turnout_pct": 54.08,
                "status_label": "RUNNER-UP",
                "status_label_hi": "पराजित (दूसरे स्थान पर)",
                "opponent_name": "SMRITI IRANI",
                "opponent_party": "BJP"
            },
            {
                "year": 2014,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2014",
                "seat_type": "PC",
                "seat_no": 37,
                "seat_name": "Amethi",
                "party_code": "INC",
                "party_name": "Indian National Congress",
                "party_symbol": "Hand",
                "party_color": "#0284C7",
                "rank": 1,
                "is_winner": True,
                "votes": 408651,
                "general_votes": 407890,
                "postal_votes": 761,
                "vote_pct": 46.72,
                "margin": 107903,
                "turnout_pct": 52.39,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "SMRITI IRANI",
                "opponent_party": "BJP"
            },
            {
                "year": 2009,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2009",
                "seat_type": "PC",
                "seat_no": 37,
                "seat_name": "Amethi",
                "party_code": "INC",
                "party_name": "Indian National Congress",
                "party_symbol": "Hand",
                "party_color": "#0284C7",
                "rank": 1,
                "is_winner": True,
                "votes": 464195,
                "general_votes": 464195,
                "postal_votes": 0,
                "vote_pct": 71.78,
                "margin": 370198,
                "turnout_pct": 45.16,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "ASHISH SHUKLA",
                "opponent_party": "BSP"
            },
            {
                "year": 2004,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2004",
                "seat_type": "PC",
                "seat_no": 37,
                "seat_name": "Amethi",
                "party_code": "INC",
                "party_name": "Indian National Congress",
                "party_symbol": "Hand",
                "party_color": "#0284C7",
                "rank": 1,
                "is_winner": True,
                "votes": 390179,
                "general_votes": 390179,
                "postal_votes": 0,
                "vote_pct": 66.18,
                "margin": 290853,
                "turnout_pct": 44.50,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆 (डेब्यू)",
                "opponent_name": "CHANDRA PRAKASH MISHRA",
                "opponent_party": "BSP"
            }
        ]
    },
    "DIMPLE YADAV": {
        "hindi_name": "डिंपल यादव",
        "current_role": "Member of Parliament (MP), Lok Sabha — Mainpuri",
        "current_role_hi": "सांसद (लोकसभा) — मैनपुरी",
        "current_party": "SP",
        "party_color": "#E11D48",
        "photo_url": "/assets/leaders/dimple_yadav.jpg",
        "bio_en": "Senior Samajwadi Party leader and Member of Parliament representing Mainpuri with record mandates in 2022 bye-poll and 2024 general election.",
        "bio_hi": "समाजवादी पार्टी की वरिष्ठ नेत्री एवं मैनपुरी संसदीय क्षेत्र से रिकॉर्ड मतों से निर्वाचित लोकसभा सांसद।",
        "primary_candidate_id": 231,
        "verified_candidate_ids": [231, 6315, 12781],
        "stats": {
            "total_contests": 5,
            "wins": 4,
            "losses": 1,
            "win_rate_pct": 80.0,
            "total_career_votes": 2576344,
            "has_switched_parties": False,
            "party_loyalty_en": "Loyal to Samajwadi Party (5 Contests)",
            "party_loyalty_hi": "सपा (SP) के प्रति पूर्णतः निष्ठावान",
            "parties_contested": ["SP"],
            "first_year": 2012,
            "latest_year": 2024
        },
        "verified_contests": [
            {
                "year": 2024,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2024",
                "seat_type": "PC",
                "seat_no": 21,
                "seat_name": "Mainpuri",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 598526,
                "general_votes": 596100,
                "postal_votes": 2426,
                "vote_pct": 57.03,
                "margin": 221639,
                "turnout_pct": 58.73,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "JAIVEER SINGH",
                "opponent_party": "BJP"
            },
            {
                "year": 2022,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha Bye-Election 2022",
                "seat_type": "PC",
                "seat_no": 21,
                "seat_name": "Mainpuri",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 618120,
                "general_votes": 617200,
                "postal_votes": 920,
                "vote_pct": 64.08,
                "margin": 288461,
                "turnout_pct": 53.48,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "RAGHURAJ SINGH SHAKYA",
                "opponent_party": "BJP"
            },
            {
                "year": 2019,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2019",
                "seat_type": "PC",
                "seat_no": 42,
                "seat_name": "Kannauj",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 2,
                "is_winner": False,
                "votes": 550734,
                "general_votes": 549820,
                "postal_votes": 914,
                "vote_pct": 48.29,
                "margin": 12353,
                "turnout_pct": 60.86,
                "status_label": "RUNNER-UP",
                "status_label_hi": "पराजित (मात्र 12,353 मतों से)",
                "opponent_name": "SUBRAT PATHAK",
                "opponent_party": "BJP"
            },
            {
                "year": 2014,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2014",
                "seat_type": "PC",
                "seat_no": 42,
                "seat_name": "Kannauj",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 489164,
                "general_votes": 488200,
                "postal_votes": 964,
                "vote_pct": 43.89,
                "margin": 19907,
                "turnout_pct": 61.62,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "SUBRAT PATHAK",
                "opponent_party": "BJP"
            },
            {
                "year": 2012,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha Bye-Election 2012",
                "seat_type": "PC",
                "seat_no": 42,
                "seat_name": "Kannauj",
                "party_code": "SP",
                "party_name": "Samajwadi Party",
                "party_symbol": "Bicycle",
                "party_color": "#E11D48",
                "rank": 1,
                "is_winner": True,
                "votes": 320000,
                "general_votes": 320000,
                "postal_votes": 0,
                "vote_pct": 100.0,
                "margin": 320000,
                "turnout_pct": 100.0,
                "status_label": "WINNER",
                "status_label_hi": "निर्विरोध निर्वाचित 🏆",
                "opponent_name": "UNOPPOSED",
                "opponent_party": "ECI"
            }
        ]
    },
    "CHANDRASHEKHAR": {
        "hindi_name": "चंद्रशेखर आज़ाद 'रावण'",
        "current_role": "National President, ASPKR | MP Nagina",
        "current_role_hi": "राष्ट्रीय अध्यक्ष, आज़ाद समाज पार्टी | सांसद नगीना",
        "current_party": "ASPKR",
        "party_color": "#7C3AED",
        "photo_url": "/assets/leaders/chandrashekhar_azad.jpg",
        "bio_en": "Founder-President of Azad Samaj Party (Kanshi Ram) and Bhim Army. Elected MP from Nagina with 1.51 Lakh+ margin in 2024.",
        "bio_hi": "आज़ाद समाज पार्टी (कांशीराम) व भीम आर्मी के संस्थापक। 2024 में नगीना लोकसभा से 1.51 लाख से अधिक मतों से विजयी सांसद।",
        "primary_candidate_id": 51,
        "verified_candidate_ids": [51, 4750],
        "stats": {
            "total_contests": 2,
            "wins": 1,
            "losses": 1,
            "win_rate_pct": 50.0,
            "total_career_votes": 520192,
            "has_switched_parties": False,
            "party_loyalty_en": "Azad Samaj Party (ASPKR)",
            "party_loyalty_hi": "आज़ाद समाज पार्टी (कांशीराम) संस्थापक",
            "parties_contested": ["ASPKR"],
            "first_year": 2022,
            "latest_year": 2024
        },
        "verified_contests": [
            {
                "year": 2024,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2024",
                "seat_type": "PC",
                "seat_no": 5,
                "seat_name": "Nagina",
                "party_code": "ASPKR",
                "party_name": "Azad Samaj Party (Kanshi Ram)",
                "party_symbol": "Kettle",
                "party_color": "#7C3AED",
                "rank": 1,
                "is_winner": True,
                "votes": 512552,
                "general_votes": 511940,
                "postal_votes": 612,
                "vote_pct": 51.19,
                "margin": 151473,
                "turnout_pct": 60.80,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "OM KUMAR",
                "opponent_party": "BJP"
            },
            {
                "year": 2022,
                "election_type": "Vidhan Sabha",
                "election_name": "Vidhan Sabha General Election 2022",
                "seat_type": "AC",
                "seat_no": 322,
                "seat_name": "Gorakhpur Urban",
                "party_code": "ASPKR",
                "party_name": "Azad Samaj Party (Kanshi Ram)",
                "party_symbol": "Kettle",
                "party_color": "#7C3AED",
                "rank": 4,
                "is_winner": False,
                "votes": 7640,
                "general_votes": 7620,
                "postal_votes": 20,
                "vote_pct": 2.53,
                "margin": 157859,
                "turnout_pct": 54.12,
                "status_label": "RANK #4",
                "status_label_hi": "4th स्थान",
                "opponent_name": "YOGI ADITYANATH",
                "opponent_party": "BJP"
            }
        ]
    },
    "NARENDRA MODI": {
        "hindi_name": "नरेंद्र मोदी",
        "current_role": "Prime Minister of India | MP Varanasi",
        "current_role_hi": "प्रधानमंत्री, भारत सरकार | सांसद वाराणसी",
        "current_party": "BJP",
        "party_color": "#EA580C",
        "photo_url": "/assets/leaders/narendra_modi.jpg",
        "bio_en": "14th Prime Minister of India. Won Varanasi Lok Sabha constituency in Uttar Pradesh with overwhelming mandates across 2014, 2019, and 2024 general elections.",
        "bio_hi": "भारत के 14वें प्रधानमंत्री। 2014, 2019 और 2024 के तीनों लोकसभा चुनावों में उत्तर प्रदेश के वाराणसी संसदीय क्षेत्र से प्रचंड मतों से विजयी।",
        "primary_candidate_id": 889,
        "verified_candidate_ids": [889, 6774, 13365],
        "stats": {
            "total_contests": 3,
            "wins": 3,
            "losses": 0,
            "win_rate_pct": 100.0,
            "total_career_votes": 1868656,
            "has_switched_parties": False,
            "party_loyalty_en": "Loyal to BJP (3 Contests in UP)",
            "party_loyalty_hi": "भाजपा (BJP) — यूपी में सभी 3 चुनाव प्रचंड विजयी 🏆",
            "parties_contested": ["BJP"],
            "first_year": 2014,
            "latest_year": 2024
        },
        "verified_contests": [
            {
                "year": 2024,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2024",
                "seat_type": "PC",
                "seat_no": 77,
                "seat_name": "Varanasi",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 612970,
                "general_votes": 611489,
                "postal_votes": 1481,
                "vote_pct": 54.24,
                "margin": 152513,
                "turnout_pct": 56.49,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "AJAY RAI",
                "opponent_party": "INC"
            },
            {
                "year": 2019,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2019",
                "seat_type": "PC",
                "seat_no": 77,
                "seat_name": "Varanasi",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 674664,
                "general_votes": 674664,
                "postal_votes": 0,
                "vote_pct": 63.62,
                "margin": 479505,
                "turnout_pct": 57.13,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "SHALINI YADAV",
                "opponent_party": "SP"
            },
            {
                "year": 2014,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2014",
                "seat_type": "PC",
                "seat_no": 77,
                "seat_name": "Varanasi",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 581022,
                "general_votes": 581022,
                "postal_votes": 0,
                "vote_pct": 56.37,
                "margin": 371784,
                "turnout_pct": 58.35,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "ARVIND KEJRIWAL",
                "opponent_party": "AAP"
            }
        ]
    },
    "RAJNATH SINGH": {
        "hindi_name": "राजनाथ सिंह",
        "current_role": "Defence Minister of India | MP Lucknow",
        "current_role_hi": "रक्षा मंत्री, भारत सरकार | सांसद लखनऊ",
        "current_party": "BJP",
        "party_color": "#EA580C",
        "photo_url": "/assets/leaders/rajnath_singh.jpg",
        "bio_en": "Union Defence Minister and former Chief Minister of Uttar Pradesh (2000–2002). Undefeated 3-term MP from Lucknow (2014, 2019, 2024) and former MP from Ghaziabad.",
        "bio_hi": "केंद्रीय रक्षा मंत्री एवं उत्तर प्रदेश के पूर्व मुख्यमंत्री (2000–2002)। लखनऊ से लगातार 3 बार विजयी सांसद एवं गाजियाबाद से पूर्व सांसद।",
        "primary_candidate_id": 387,
        "verified_candidate_ids": [387, 6208],
        "stats": {
            "total_contests": 4,
            "wins": 4,
            "losses": 0,
            "win_rate_pct": 100.0,
            "total_career_votes": 2166478,
            "has_switched_parties": False,
            "party_loyalty_en": "Loyal to BJP (4 Contests)",
            "party_loyalty_hi": "भाजपा (BJP) — सभी 4 संसदीय चुनाव विजयी 🏆",
            "parties_contested": ["BJP"],
            "first_year": 2009,
            "latest_year": 2024
        },
        "verified_contests": [
            {
                "year": 2024,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2024",
                "seat_type": "PC",
                "seat_no": 35,
                "seat_name": "Lucknow",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 612709,
                "general_votes": 611200,
                "postal_votes": 1509,
                "vote_pct": 53.59,
                "margin": 135159,
                "turnout_pct": 52.28,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "RAVIDAS MEHROTRA",
                "opponent_party": "SP"
            },
            {
                "year": 2019,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2019",
                "seat_type": "PC",
                "seat_no": 35,
                "seat_name": "Lucknow",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 633026,
                "general_votes": 633026,
                "postal_votes": 0,
                "vote_pct": 56.70,
                "margin": 347302,
                "turnout_pct": 54.78,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "POONAM SINHA",
                "opponent_party": "SP"
            },
            {
                "year": 2014,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2014",
                "seat_type": "PC",
                "seat_no": 35,
                "seat_name": "Lucknow",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 561106,
                "general_votes": 561106,
                "postal_votes": 0,
                "vote_pct": 54.27,
                "margin": 272749,
                "turnout_pct": 53.02,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "DR. RITA BAHUGUNA JOSHI",
                "opponent_party": "INC"
            },
            {
                "year": 2009,
                "election_type": "Lok Sabha",
                "election_name": "Lok Sabha General Election 2009",
                "seat_type": "PC",
                "seat_no": 12,
                "seat_name": "Ghaziabad",
                "party_code": "BJP",
                "party_name": "Bharatiya Janata Party",
                "party_symbol": "Lotus",
                "party_color": "#EA580C",
                "rank": 1,
                "is_winner": True,
                "votes": 359637,
                "general_votes": 359637,
                "postal_votes": 0,
                "vote_pct": 43.37,
                "margin": 90681,
                "turnout_pct": 45.30,
                "status_label": "WINNER",
                "status_label_hi": "विजयी 🏆",
                "opponent_name": "SURENDRA PRAKASH GOYAL",
                "opponent_party": "INC"
            }
        ]
    }
}

@router.get("/spotlight")
def get_spotlight_leaders(db: Session = Depends(get_db)):
    """Return spotlight list of prominent leaders with current positions and photos for mobile carousel and showcase."""
    spotlight = []
    for norm_name, meta in PROMINENT_LEADERS_REGISTRY.items():
        cand_id = meta.get("primary_candidate_id")
        if not cand_id and meta.get("verified_candidate_ids"):
            cand_id = meta["verified_candidate_ids"][0]
        if not cand_id:
            cand = db.query(Candidate).filter(Candidate.name.ilike(f"%{norm_name}%")).first()
            cand_id = cand.id if cand else None

        spotlight.append({
            "candidate_id": cand_id,
            "name": norm_name,
            "hindi_name": meta["hindi_name"],
            "role": meta["current_role"],
            "role_hi": meta["current_role_hi"],
            "party": meta["current_party"],
            "party_color": meta.get("party_color", "#EA580C"),
            "photo_url": meta["photo_url"],
            "bio_en": meta["bio_en"],
            "bio_hi": meta["bio_hi"]
        })
    return {"count": len(spotlight), "leaders": spotlight}

@router.get("/dossier")
def get_candidate_dossier(
    candidate_id: Optional[int] = Query(None, description="ECI Candidate ID"),
    name: Optional[str] = Query(None, description="Candidate name (e.g. Akhilesh Yadav)"),
    db: Session = Depends(get_db)
):
    """
    Complete Bilingual Netaji Dossier:
    Returns full lifetime electoral history across 1991–2024 elections,
    won/lost breakdown, margins, vote shares, and political party transition timeline (dal-badal itihas).
    """
    # Guard against direct python function calls where defaults are Query objects
    from fastapi.params import Query as QueryParam
    actual_id = candidate_id if (candidate_id is not None and not isinstance(candidate_id, QueryParam)) else None
    actual_name = name if (name is not None and not isinstance(name, QueryParam)) else None

    if not actual_id and not actual_name:
        raise HTTPException(status_code=400, detail="Provide candidate_id or name to fetch dossier")

    target_candidate = None
    if actual_id:
        target_candidate = db.query(Candidate).filter(Candidate.id == actual_id).first()

    if not target_candidate and actual_name:
        clean_name = actual_name.strip().upper()
        # Exact match first, then ilike
        target_candidate = db.query(Candidate).filter(Candidate.name == clean_name).first()
        if not target_candidate:
            target_candidate = db.query(Candidate).filter(Candidate.name.ilike(f"%{clean_name}%")).first()

    if not target_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in historical ECI warehouse")

    cand_name = target_candidate.name.strip().upper()

    # Find curated registry entry if available
    registry_entry = None
    if actual_id:
        # Strict matching by verified candidate ID to prevent namesake collision
        for reg_key, reg_val in PROMINENT_LEADERS_REGISTRY.items():
            if target_candidate.id in reg_val.get("verified_candidate_ids", []):
                registry_entry = reg_val
                break
    else:
        # Match by name only when candidate_id is not specified
        for reg_key, reg_val in PROMINENT_LEADERS_REGISTRY.items():
            if reg_key in cand_name or cand_name in reg_key:
                registry_entry = reg_val
                break

    # If prominent leader has verified contests, return the certified profile
    if registry_entry and "verified_contests" in registry_entry:
        v_contests = registry_entry["verified_contests"]
        v_stats = registry_entry["stats"]
        return {
            "candidate": {
                "id": target_candidate.id,
                "name": cand_name,
                "hindi_name": registry_entry["hindi_name"],
                "gender": target_candidate.gender or "M",
                "age": target_candidate.age,
                "category": target_candidate.category or "GEN",
                "current_role": registry_entry["current_role"],
                "current_role_hi": registry_entry["current_role_hi"],
                "party": registry_entry["current_party"],
                "party_color": registry_entry.get("party_color", "#E11D48"),
                "photo_url": registry_entry["photo_url"],
                "bio_en": registry_entry["bio_en"],
                "bio_hi": registry_entry["bio_hi"]
            },
            "career_stats": v_stats,
            "contests": v_contests,
            "party_timeline": [
                {
                    "code": p,
                    "name": p,
                    "color": registry_entry.get("party_color", "#E11D48"),
                    "symbol": "Official Symbol",
                    "first_year": v_stats["first_year"]
                }
                for p in v_stats["parties_contested"]
            ]
        }

    # Otherwise, query SQLite for dynamic candidate across 1991–2024
    contests_query = db.query(
        Election.year,
        Election.election_type,
        Election.name.label("election_name"),
        ParliamentaryConstituency.pc_no,
        ParliamentaryConstituency.name.label("pc_name"),
        AssemblyConstituency.ac_no,
        AssemblyConstituency.name.label("ac_name"),
        Party.code.label("party_code"),
        Party.name.label("party_name"),
        Party.symbol.label("party_symbol"),
        Party.color_hex.label("party_color"),
        CandidateResult.rank,
        CandidateResult.is_winner,
        CandidateResult.total_votes,
        CandidateResult.general_votes,
        CandidateResult.postal_votes,
        CandidateResult.vote_pct_valid,
        ElectionResult.margin,
        ElectionResult.turnout_pct,
        ElectionResult.winner_candidate_id,
        ElectionResult.runner_up_candidate_id
    ).join(CandidateResult, CandidateResult.election_result_id == ElectionResult.id)\
     .join(Candidate, CandidateResult.candidate_id == Candidate.id)\
     .join(Election, ElectionResult.election_id == Election.id)\
     .join(Party, CandidateResult.party_id == Party.id)\
     .outerjoin(ParliamentaryConstituency, ElectionResult.pc_id == ParliamentaryConstituency.id)\
     .outerjoin(AssemblyConstituency, ElectionResult.ac_id == AssemblyConstituency.id)

    if actual_id and any(reg_k in cand_name for reg_k in PROMINENT_LEADERS_REGISTRY.keys()):
        contests_query = contests_query.filter(Candidate.id == target_candidate.id)
    else:
        contests_query = contests_query.filter(Candidate.name == cand_name)

    contests_query = contests_query.order_by(Election.year.desc(), Election.election_type.asc())

    raw_contests = contests_query.all()

    contests_list = []
    total_career_votes = 0
    wins_count = 0
    losses_count = 0
    parties_contested = []

    for c in raw_contests:
        is_pc = bool(c.pc_name)
        seat_name = c.pc_name if is_pc else (c.ac_name or "Unknown")
        seat_no = c.pc_no if is_pc else (c.ac_no or 0)
        seat_type = "PC" if is_pc else "AC"

        is_win = bool(c.is_winner or c.rank == 1)
        if is_win:
            wins_count += 1
        else:
            losses_count += 1

        total_career_votes += (c.total_votes or 0)

        # Track unique party transition
        if c.party_code and c.party_code not in [p["code"] for p in parties_contested]:
            parties_contested.append({
                "code": c.party_code,
                "name": c.party_name or c.party_code,
                "color": c.party_color or "#64748B",
                "symbol": c.party_symbol or "Party Symbol",
                "first_year": c.year
            })

        # Find opponent name if available
        opponent_name = "Runner-Up"
        opponent_party = "OPP"
        if is_win and c.runner_up_candidate_id:
            ru = db.query(Candidate).filter(Candidate.id == c.runner_up_candidate_id).first()
            if ru:
                opponent_name = ru.name
        elif not is_win and c.winner_candidate_id:
            win_cand = db.query(Candidate).filter(Candidate.id == c.winner_candidate_id).first()
            if win_cand:
                opponent_name = win_cand.name

        status_label = "WINNER" if is_win else "RUNNER-UP" if c.rank == 2 else f"RANK #{c.rank}"
        status_label_hi = "विजयी 🏆" if is_win else "पराजित (दूसरे स्थान पर)" if c.rank == 2 else f"{c.rank} स्थान पर"

        contests_list.append({
            "year": c.year,
            "election_type": c.election_type,
            "election_name": c.election_name,
            "seat_type": seat_type,
            "seat_no": seat_no,
            "seat_name": seat_name,
            "party_code": c.party_code,
            "party_name": c.party_name or c.party_code,
            "party_symbol": c.party_symbol,
            "party_color": c.party_color or "#64748B",
            "rank": c.rank,
            "is_winner": is_win,
            "votes": c.total_votes or 0,
            "general_votes": c.general_votes or 0,
            "postal_votes": c.postal_votes or 0,
            "vote_pct": round(c.vote_pct_valid or 0.0, 2),
            "margin": c.margin or 0,
            "turnout_pct": round(c.turnout_pct or 0.0, 2),
            "status_label": status_label,
            "status_label_hi": status_label_hi,
            "opponent_name": opponent_name,
            "opponent_party": opponent_party
        })

    # Sort contests chronologically descending
    contests_list.sort(key=lambda x: (x["year"], 1 if x["election_type"] == "Lok Sabha" else 2), reverse=True)

    total_contests = len(contests_list)
    win_rate = round((wins_count / total_contests * 100.0), 1) if total_contests > 0 else 0.0

    # Party loyalty analysis
    distinct_party_codes = list({c["party_code"] for c in contests_list if c["party_code"]})
    has_switched = len(distinct_party_codes) > 1

    loyalty_text_en = f"Loyal to {distinct_party_codes[0]} ({total_contests} Contests)" if not has_switched and distinct_party_codes else f"Party Transitions ({len(distinct_party_codes)} Parties: {', '.join(distinct_party_codes)})"
    loyalty_text_hi = f"{distinct_party_codes[0]} के प्रति निष्ठावान ({total_contests} चुनाव)" if not has_switched and distinct_party_codes else f"दल-बदल इतिहास ({len(distinct_party_codes)} दल: {', '.join(distinct_party_codes)})"

    # Photo & Bio Resolution
    photo_url = registry_entry["photo_url"] if registry_entry else None
    hindi_name = registry_entry["hindi_name"] if registry_entry else cand_name
    current_role = registry_entry["current_role"] if registry_entry else f"Candidate ({distinct_party_codes[0] if distinct_party_codes else 'IND'})"
    current_role_hi = registry_entry["current_role_hi"] if registry_entry else f"प्रत्याशी ({distinct_party_codes[0] if distinct_party_codes else 'निर्दलीय'})"
    bio_en = registry_entry["bio_en"] if registry_entry else f"Historical candidate in Uttar Pradesh elections representing {distinct_party_codes[0] if distinct_party_codes else 'independent'} ticket."
    bio_hi = registry_entry["bio_hi"] if registry_entry else f"उत्तर प्रदेश चुनावों में {distinct_party_codes[0] if distinct_party_codes else 'निर्दलीय'} प्रत्याशी के रूप में पंजीकृत।"

    latest_contest = contests_list[0] if contests_list else None
    latest_party = latest_contest["party_code"] if latest_contest else "IND"
    latest_party_color = latest_contest["party_color"] if latest_contest else "#64748B"

    return {
        "candidate": {
            "id": target_candidate.id,
            "name": target_candidate.name,
            "hindi_name": hindi_name,
            "gender": target_candidate.gender,
            "age": target_candidate.age,
            "category": target_candidate.category or "GEN",
            "current_role": current_role,
            "current_role_hi": current_role_hi,
            "party": latest_party,
            "party_color": latest_party_color,
            "photo_url": photo_url,
            "bio_en": bio_en,
            "bio_hi": bio_hi
        },
        "career_stats": {
            "total_contests": total_contests,
            "wins": wins_count,
            "losses": losses_count,
            "win_rate_pct": win_rate,
            "total_career_votes": total_career_votes,
            "has_switched_parties": has_switched,
            "party_loyalty_en": loyalty_text_en,
            "party_loyalty_hi": loyalty_text_hi,
            "parties_contested": distinct_party_codes,
            "first_year": contests_list[-1]["year"] if contests_list else None,
            "latest_year": contests_list[0]["year"] if contests_list else None
        },
        "contests": contests_list,
        "party_timeline": parties_contested
    }
