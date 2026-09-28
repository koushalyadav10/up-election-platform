from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.models import Candidate, CandidateResult, ElectionResult, Election, Party, ParliamentaryConstituency, AssemblyConstituency

router = APIRouter(prefix="/api/candidates", tags=["Candidate Dossier"])

# Curated metadata registry for prominent UP political leaders
PROMINENT_LEADERS_REGISTRY: Dict[str, Dict[str, Any]] = {
    "AKHILESH YADAV": {
        "hindi_name": "अखिलेश यादव",
        "current_role": "Member of Parliament (MP), Lok Sabha — Kannauj",
        "current_role_hi": "सांसद (लोकसभा) — कन्नौज | राष्ट्रीय अध्यक्ष, सपा",
        "current_party": "SP",
        "photo_url": "/assets/leaders/akhilesh_yadav.jpg",
        "bio_en": "National President of the Samajwadi Party and 20th Chief Minister of Uttar Pradesh (2012–2017). Member of Parliament representing Kannauj.",
        "bio_hi": "समाजवादी पार्टी के राष्ट्रीय अध्यक्ष एवं उत्तर प्रदेश के 20वें मुख्यमंत्री (2012–2017)। वर्तमान में कन्नौज से लोकसभा सांसद।"
    },
    "ADITYANATH": {
        "hindi_name": "योगी आदित्यनाथ",
        "current_role": "Chief Minister of Uttar Pradesh | MLA Gorakhpur Urban",
        "current_role_hi": "मुख्यमंत्री, उत्तर प्रदेश | विधायक गोरखपुर शहर",
        "current_party": "BJP",
        "photo_url": "/assets/leaders/yogi_adityanath.jpg",
        "bio_en": "21st Chief Minister of Uttar Pradesh since 2017 and Head Priest of the Gorakhnath Math. Former 5-term MP from Gorakhpur.",
        "bio_hi": "2017 से उत्तर प्रदेश के 21वें मुख्यमंत्री एवं गोरक्षपीठ के महन्त। गोरखपुर से 5 बार लोकसभा सांसद रह चुके हैं।"
    },
    "RAHUL GANDHI": {
        "hindi_name": "राहुल गांधी",
        "current_role": "Leader of the Opposition, Lok Sabha | MP Rae Bareli",
        "current_role_hi": "नेता प्रतिपक्ष (लोकसभा) | सांसद रायबरेली",
        "current_party": "INC",
        "photo_url": "/assets/leaders/rahul_gandhi.jpg",
        "bio_en": "Leader of Opposition in the 18th Lok Sabha. Represented Amethi (2004–2019) and won Rae Bareli with a historic margin in 2024.",
        "bio_hi": "18वीं लोकसभा में नेता प्रतिपक्ष। 2004 से 2019 तक अमेठी से सांसद रहे और 2024 में रायबरेली से ऐतिहासिक अंतर से विजयी हुए।"
    },
    "DIMPLE YADAV": {
        "hindi_name": "डिंपल यादव",
        "current_role": "Member of Parliament (MP), Lok Sabha — Mainpuri",
        "current_role_hi": "सांसद (लोकसभा) — मैनपुरी",
        "current_party": "SP",
        "photo_url": "/assets/leaders/dimple_yadav.jpg",
        "bio_en": "Senior Samajwadi Party leader and Member of Parliament representing Mainpuri with a record mandate in 2024.",
        "bio_hi": "समाजवादी पार्टी की वरिष्ठ नेत्री एवं मैनपुरी संसदीय क्षेत्र से रिकॉर्ड मतों से निर्वाचित लोकसभा सांसद।"
    },
    "NARENDRA MODI": {
        "hindi_name": "नरेंद्र मोदी",
        "current_role": "Prime Minister of India | MP Varanasi",
        "current_role_hi": "प्रधानमंत्री, भारत सरकार | सांसद वाराणसी",
        "current_party": "BJP",
        "photo_url": "/assets/leaders/narendra_modi.jpg",
        "bio_en": "14th Prime Minister of India since 2014 and 3-time Member of Parliament representing Varanasi, Uttar Pradesh.",
        "bio_hi": "2014 से भारत के 14वें प्रधानमंत्री एवं उत्तर प्रदेश के वाराणसी संसदीय क्षेत्र से लगातार 3 बार सांसद।"
    },
    "RAJNATH SINGH": {
        "hindi_name": "राजनाथ सिंह",
        "current_role": "Defence Minister of India | MP Lucknow",
        "current_role_hi": "रक्षा मंत्री, भारत सरकार | सांसद लखनऊ",
        "current_party": "BJP",
        "photo_url": "/assets/leaders/rajnath_singh.jpg",
        "bio_en": "Union Minister of Defence and former Chief Minister of Uttar Pradesh. 3-time Member of Parliament from Lucknow.",
        "bio_hi": "भारत के रक्षा मंत्री एवं उत्तर प्रदेश के पूर्व मुख्यमंत्री। लखनऊ से लगातार तीसरी बार सांसद।"
    },
    "MAYAWATI": {
        "hindi_name": "सुश्री मायावती",
        "current_role": "National President, Bahujan Samaj Party (BSP)",
        "current_role_hi": "राष्ट्रीय अध्यक्ष, बहुजन समाज पार्टी (बसपा)",
        "current_party": "BSP",
        "photo_url": "/assets/leaders/mayawati.jpg",
        "bio_en": "National President of the Bahujan Samaj Party and 4-time Chief Minister of Uttar Pradesh.",
        "bio_hi": "बहुजन समाज पार्टी की राष्ट्रीय अध्यक्ष एवं उत्तर प्रदेश की चार बार मुख्यमंत्री।"
    },
    "CHANDRASHEKHAR": {
        "hindi_name": "चंद्रशेखर आज़ाद 'रावण'",
        "current_role": "National President, ASPKR | MP Nagina",
        "current_role_hi": "राष्ट्रीय अध्यक्ष, आज़ाद समाज पार्टी | सांसद नगीना",
        "current_party": "ASPKR",
        "photo_url": "/assets/leaders/chandrashekhar_azad.jpg",
        "bio_en": "Founder-President of Azad Samaj Party (Kanshi Ram) and Bhim Army. Elected MP from Nagina with 1.51 Lakh+ margin in 2024.",
        "bio_hi": "आज़ाद समाज पार्टी (कांशीराम) व भीम आर्मी के संस्थापक। 2024 में नगीना से 1.51 लाख से अधिक मतों से विजयी सांसद।"
    },
    "JAYANT CHAUDHARY": {
        "hindi_name": "जयंत चौधरी",
        "current_role": "Union Minister of State (I/C) | National President, RLD",
        "current_role_hi": "केंद्रीय राज्य मंत्री (स्वतंत्र प्रभार) | राष्ट्रीय अध्यक्ष, रालोद",
        "current_party": "RLD",
        "photo_url": "/assets/leaders/jayant_chaudhary.jpg",
        "bio_en": "National President of the Rashtriya Lok Dal and Union Minister of State. Key political figure of Western UP.",
        "bio_hi": "राष्ट्रीय लोक दल के राष्ट्रीय अध्यक्ष एवं केंद्रीय राज्य मंत्री। पश्चिमी उत्तर प्रदेश के प्रमुख किसान नेता।"
    },
    "AFZAL ANSARI": {
        "hindi_name": "अफजाल अंसारी",
        "current_role": "Member of Parliament (MP), Lok Sabha — Ghazipur",
        "current_role_hi": "सांसद (लोकसभा) — गाज़ीपुर",
        "current_party": "SP",
        "photo_url": "/assets/leaders/afzal_ansari.jpg",
        "bio_en": "Veteran Purvanchal political leader. Won Ghazipur in 2019 (BSP) and 2024 (SP). 5-time MLA and 2-time MP.",
        "bio_hi": "पूर्वांचल के कद्दावर नेता। 2019 (बसपा) और 2024 (सपा) में गाज़ीपुर से सांसद। 5 बार विधायक व 2 बार सांसद।"
    },
    "SHIVPAL SINGH YADAV": {
        "hindi_name": "शिवपाल सिंह यादव",
        "current_role": "National General Secretary, SP | MLA Jaswantnagar",
        "current_role_hi": "राष्ट्रीय महासचिव, सपा | विधायक जसवंतनगर",
        "current_party": "SP",
        "photo_url": "/assets/leaders/shivpal_yadav.jpg",
        "bio_en": "Senior Samajwadi Party stalwart and 6-term MLA representing Jaswantnagar constituency.",
        "bio_hi": "समाजवादी पार्टी के वरिष्ठ नेता एवं जसवंतनगर विधानसभा से लगातार 6 बार निर्वाचित विधायक।"
    },
    "ANUPRIYA PATEL": {
        "hindi_name": "अनुप्रिया पटेल",
        "current_role": "Union Minister of State | National President, Apna Dal (S)",
        "current_role_hi": "केंद्रीय राज्य मंत्री | राष्ट्रीय अध्यक्ष, अपना दल (सो)",
        "current_party": "ADAL",
        "photo_url": "/assets/leaders/anupriya_patel.jpg",
        "bio_en": "President of Apna Dal (Sonelal) and Union Minister of State. 3-term Member of Parliament representing Mirzapur.",
        "bio_hi": "अपना दल (सोनेलाल) की राष्ट्रीय अध्यक्ष एवं केंद्रीय राज्य मंत्री। मिर्जापुर से लगातार तीसरी बार सांसद।"
    },
    "KESHAV PRASAD MAURYA": {
        "hindi_name": "केशव प्रसाद मौर्य",
        "current_role": "Deputy Chief Minister of Uttar Pradesh",
        "current_role_hi": "उप मुख्यमंत्री, उत्तर प्रदेश",
        "current_party": "BJP",
        "photo_url": "/assets/leaders/keshav_maurya.jpg",
        "bio_en": "Deputy Chief Minister of Uttar Pradesh. Former state BJP President and former MP from Phulpur.",
        "bio_hi": "उत्तर प्रदेश के उप मुख्यमंत्री। पूर्व प्रदेश भाजपा अध्यक्ष एवं फूलपुर से पूर्व सांसद।"
    },
    "BRAJESH PATHAK": {
        "hindi_name": "ब्रजेश पाठक",
        "current_role": "Deputy Chief Minister of Uttar Pradesh | MLA Lucknow Cantt",
        "current_role_hi": "उप मुख्यमंत्री, उत्तर प्रदेश | विधायक लखनऊ कैंट",
        "current_party": "BJP",
        "photo_url": "/assets/leaders/brajesh_pathak.jpg",
        "bio_en": "Deputy Chief Minister of Uttar Pradesh and cabinet minister holding Health and Family Welfare portfolios.",
        "bio_hi": "उत्तर प्रदेश के उप मुख्यमंत्री एवं स्वास्थ्य व परिवार कल्याण मंत्री। लखनऊ कैंट से विधायक।"
    },
    "OM PRAKASH RAJBHAR": {
        "hindi_name": "ओम प्रकाश राजभर",
        "current_role": "Cabinet Minister, UP | National President, SBSP",
        "current_role_hi": "कैबिनेट मंत्री, उप्र | राष्ट्रीय अध्यक्ष, सुभासपा",
        "current_party": "SBSP",
        "photo_url": "/assets/leaders/op_rajbhar.jpg",
        "bio_en": "National President of Suheldev Bharatiya Samaj Party (SBSP) and Cabinet Minister in Government of UP.",
        "bio_hi": "सुहेलदेव भारतीय समाज पार्टी के राष्ट्रीय अध्यक्ष एवं उत्तर प्रदेश सरकार में कैबिनेट मंत्री।"
    },
    "SMRITI IRANI": {
        "hindi_name": "स्मृति ईरानी",
        "current_role": "Senior BJP Leader | Former MP Amethi",
        "current_role_hi": "वरिष्ठ भाजपा नेत्री | पूर्व सांसद अमेठी",
        "current_party": "BJP",
        "photo_url": "/assets/leaders/smriti_irani.jpg",
        "bio_en": "Senior BJP leader and former Union Cabinet Minister. Represented Amethi parliamentary seat in the 17th Lok Sabha.",
        "bio_hi": "भाजपा की वरिष्ठ नेता एवं पूर्व केंद्रीय मंत्री। 17वीं लोकसभा में अमेठी से निर्वाचित सांसद थीं।"
    },
    "HEMA MALINI": {
        "hindi_name": "हेमा मालिनी",
        "current_role": "Member of Parliament (MP), Lok Sabha — Mathura",
        "current_role_hi": "सांसद (लोकसभा) — मथुरा",
        "current_party": "BJP",
        "photo_url": "/assets/leaders/hema_malini.jpg",
        "bio_en": "Renowned artist and politician. 3-time Member of Parliament representing Mathura constituency (2014, 2019, 2024).",
        "bio_hi": "प्रख्यात अभिनेत्री एवं राजनीतिज्ञ। मथुरा से लगातार तीसरी बार (2014, 2019, 2024) निर्वाचित सांसद।"
    },
    "RAVINDRA SHUKLA ALIAS RAVI KISHAN": {
        "hindi_name": "रवि किशन (रवींद्र शुक्ल)",
        "current_role": "Member of Parliament (MP), Lok Sabha — Gorakhpur",
        "current_role_hi": "सांसद (लोकसभा) — गोरखपुर",
        "current_party": "BJP",
        "photo_url": "/assets/leaders/ravi_kishan.jpg",
        "bio_en": "Popular Bhojpuri film icon and 2-time Member of Parliament representing Gorakhpur (2019, 2024).",
        "bio_hi": "प्रसिद्ध अभिनेता एवं गोरखपुर संसदीय क्षेत्र से लगातार दूसरी बार निर्वाचित लोकसभा सांसद।"
    }
}

@router.get("/spotlight")
def get_spotlight_leaders(db: Session = Depends(get_db)):
    """Return spotlight list of prominent leaders with current positions and photos for mobile carousel and showcase."""
    spotlight = []
    for norm_name, meta in PROMINENT_LEADERS_REGISTRY.items():
        cand = db.query(Candidate).filter(Candidate.name.ilike(f"%{norm_name}%")).first()
        spotlight.append({
            "candidate_id": cand.id if cand else None,
            "name": norm_name,
            "hindi_name": meta["hindi_name"],
            "role": meta["current_role"],
            "role_hi": meta["current_role_hi"],
            "party": meta["current_party"],
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
    for reg_key, reg_val in PROMINENT_LEADERS_REGISTRY.items():
        if reg_key in cand_name or cand_name in reg_key:
            registry_entry = reg_val
            break

    # Query all candidate contest records across all elections matching the candidate name
    # We join election_results, elections, parties, constituencies, and opponent candidates
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
     .outerjoin(AssemblyConstituency, ElectionResult.ac_id == AssemblyConstituency.id)\
     .filter(Candidate.name.ilike(f"%{cand_name}%"))\
     .order_by(Election.year.desc(), Election.election_type.asc())

    raw_contests = contests_query.all()

    # If prominent leader, prune false matches with unrelated independent names
    if registry_entry:
        primary_party = registry_entry["current_party"]
        # Retain contests for this party or major historic contests
        filtered_contests = []
        for rc in raw_contests:
            # Keep if party matches or votes > 10,000 (serious contest)
            if rc.party_code == primary_party or (rc.total_votes and rc.total_votes > 15000):
                filtered_contests.append(rc)
        if filtered_contests:
            raw_contests = filtered_contests

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
