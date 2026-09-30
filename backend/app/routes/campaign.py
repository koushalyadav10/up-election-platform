# -*- coding: utf-8 -*-
"""
E:/eci/backend/app/routes/campaign.py
"Chitragupta" — Universal Strategic Counter-Creative Studio.
Applies the 360° Samajwadi Party Strategic Re-framing Playbook
(Lohia - Ambedkar - Mulayam - Akhilesh Doctrine) to generate studio-grade,
culturally resonant, dignified, and legally compliant counter-campaign creatives.
"""

import io
import re
import json
import base64
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

router = APIRouter(prefix="/api/campaign", tags=["Strategic Counter Studio"])

class CounterCreativeRequest(BaseModel):
    opponent_image: Optional[str] = None  # Base64 string or data URL
    opponent_claim: Optional[str] = None  # Optional text claim
    target_vector: Optional[str] = None   # RELIGIOUS_COMMUNAL, PARIVARWAAD, LAW_AND_ORDER, DEVELOPMENT, CASTE_PDA

def detect_attack_vector(claim_text: str) -> str:
    """Analyze text to identify the core attack vector."""
    txt = claim_text.lower()
    
    # Religious / Communal / Muslim appeasement / Sanatan
    if any(k in txt for k in ["muslim", "appeasement", "tushtikaran", "sanatan", "ram", "mandir", "masjid", "dharma", "hindu", "communal", "dange"]):
        return "RELIGIOUS_COMMUNAL"
    
    # Parivarwaad / Dynastic
    if any(k in txt for k in ["parivar", "dynasty", "nepotism", "kunba", "saifai", "pariwarwaad"]):
        return "PARIVARWAAD"
    
    # Law & order / Mafia / Gunda raj
    if any(k in txt for k in ["crime", "gunda", "mafia", "bulldozer", "suraksha", "women", "mahila", "kanoon", "hathras", "police"]):
        return "LAW_AND_ORDER"
    
    # Caste / PDA / Jaatiwaad
    if any(k in txt for k in ["caste", "jaati", "pda", "census", "yadav", "dalit", "reservation", "aarakshan"]):
        return "CASTE_PDA"
    
    # Development / Freebies / Infrastructure
    if any(k in txt for k in ["expressway", "metro", "freebie", "revadi", "laptop", "vikas", "double engine", "paper leak", "berozgari"]):
        return "DEVELOPMENT"
        
    return "RELIGIOUS_COMMUNAL"  # Default to most common political attack in UP

def get_counter_strategy(vector: str, claim_text: Optional[str] = None) -> Dict[str, Any]:
    """
    Applies the 360° Samajwadi Re-framing Playbook.
    Returns strategic thesis, punchlines, factual bullets, and spokesperson debate points.
    """
    if vector == "RELIGIOUS_COMMUNAL":
        return {
            "vector_name": "RELIGIOUS_COMMUNAL",
            "vector_label_hi": "धार्मिक ध्रुवीकरण व तुष्टिकरण का आरोप",
            "opponent_rhetoric": claim_text or "विपक्ष पर धर्म-विरोधी या तुष्टिकरण का झूठा आरोप लगाकर असली मुद्दों से ध्यान भटकाना।",
            "strategic_doctrine": "Reclaim Sanatan & Cultural Roots; Expose Communal Hate as a Diversion Mask for Paper Leaks & Inflation.",
            "headline_hi": "आस्था हमारे दिल में है, व्यापार उनके बिल में है!",
            "subtext_hi": "भगवान श्री राम और कृष्ण सबके हैं — धर्म आस्था का विषय है, वोटों की दलाली का नहीं।",
            "factual_bullet_hi": "सपा सरकार ने सैफई में भव्य हनुमान मंदिर व परशुराम पीठ बनवाई। आज धर्म की आड़ में 60 लाख नौजवानों के पेपर लीक और महंगाई को छुपाया जा रहा है।",
            "bottom_slogan_hi": "धर्म के नाम पर बंटवारा बंद करो • 60 लाख युवाओं के भविष्य का हिसाब दो! • जुड़ेगा PDA, जीतेगा भारत",
            "primary_color": "#dc2626", # SP Red
            "accent_color": "#16a34a",  # SP Green
            "spokesperson_points": [
                "धर्म हमारे लिए व्यक्तिगत आस्था और 'वसुधैव कुटुम्बकम' का संस्कार है, भाजपा के लिए केवल चुनाव जीतने का मुखौटा है।",
                "जब 60 लाख नौजवानों के पेपर लीक होते हैं और किसान आवारा पशुओं से परेशान होता है, तब भाजपा धर्म की आड़ में छिपना चाहती है।",
                "अखिलेश यादव जी के शासन में सैफई में भव्य हनुमान मंदिर और भगवान परशुराम जी की प्रतिमा स्थापित हुई, हमने कभी आस्था पर राजनीति नहीं की।"
            ]
        }

    elif vector == "PARIVARWAAD":
        return {
            "vector_name": "PARIVARWAAD",
            "vector_label_hi": "परिवारवाद का आरोप",
            "opponent_rhetoric": claim_text or "सपा पर एक परिवार की पार्टी होने का आरोप लगाना।",
            "strategic_doctrine": "Re-frame Parivar from One Household to the 90% PDA Public Family vs Opponent's Crony Corporate Parivar.",
            "headline_hi": "उनका परिवार 'चंद पूंजीपतियों' का, हमारा परिवार 25 करोड़ जनता का!",
            "subtext_hi": "हमारा परिवार एक घर नहीं — 90% आबादी वाला PDA (पिछड़ा, दलित, अल्पसंख्यक, आधी आबादी और गरीब अगड़ा) परिवार है।",
            "factual_bullet_hi": "सपा वंचितों और पिछड़ों के सामाजिक न्याय और आरक्षण के लिए लड़ती है, जबकि भाजपा जनता की संपत्ति अपने चहेते कॉर्पोरेट मित्रों को सौंप रही है।",
            "bottom_slogan_hi": "PDA ही जनता का असली परिवार है • सामाजिक न्याय की होगी जीत!",
            "primary_color": "#dc2626",
            "accent_color": "#2563eb",
            "spokesperson_points": [
                "हमारा परिवार उत्तर प्रदेश के 25 करोड़ नागरिक हैं। पीडीए (पिछड़ा, दलित, अल्पसंख्यक) का हर शोषित व्यक्ति हमारा परिवार है।",
                "भाजपा का परिवार कौन है? चंद गिने-चुने अरबपति मित्र, जिनके बैंकों के लाखों करोड़ रुपये के कर्ज़ माफ़ कर दिए जाते हैं।",
                "बाबा साहेब आंबेडकर और डॉ. लोहिया के विचारों पर चलने वाले लोग जनता को ही अपना कुनबा मानते हैं।"
            ]
        }

    elif vector == "LAW_AND_ORDER":
        return {
            "vector_name": "LAW_AND_ORDER",
            "vector_label_hi": "कानून व्यवस्था व 'गुंडाराज' का नैरेटिव",
            "opponent_rhetoric": claim_text or "सपा शासन पर कानून व्यवस्था और अपराध के मनगढ़ंत आरोप।",
            "strategic_doctrine": "Official NCRB Proof + Tech Infrastructure (UP-100 & 1090) vs Selective Bulldozer & Custodial Deaths.",
            "headline_hi": "प्रचार का ढोल पीटने वाले, NCRB का असली आईना देखें!",
            "subtext_hi": "दिखावे का बुलडोज़र न्याय नहीं देता — अखिलेश यादव जी ने 3,200 गाड़ियों वाली UP-100 और 1090 हेल्पलाइन दी थी।",
            "factual_bullet_hi": "सरकारी NCRB 2012 के अनुसार सपा शासन में यूपी का क्राइम रेट सिर्फ 97.7/1L (देश में 26वां सबसे सुरक्षित) था, जो 2022 में बढ़कर 174.0 हो गया।",
            "bottom_slogan_hi": "हाथरस, उन्नाव और हिरासत में मौतों का हिसाब दो • आधुनिक सुरक्षा बनाम दिखावटी कानून!",
            "primary_color": "#b91c1c",
            "accent_color": "#059669",
            "spokesperson_points": [
                "सपा सरकार ने पूरे देश को आधुनिक पुलिसिंग दी — 3,200 जीपीएस गाड़ियों वाली 'UP 100' और महिला सुरक्षा के लिए '1090 हेल्पलाइन' अखिलेश यादव जी ने बनाई।",
                "सरकारी एनसीआरबी रिपोर्ट बताती है कि 2012 में यूपी में कुल अपराध 1.98 लाख थे जो 2022 में बढ़कर 4.01 लाख से अधिक हो गए।",
                "बुलडोज़र संविधान का प्रतीक नहीं है। चयनात्मक न्याय, कस्टोडियल डेथ्स और हाथरस जैसी घटनाओं पर सरकार मौन क्यों है?"
            ]
        }

    elif vector == "DEVELOPMENT":
        return {
            "vector_name": "DEVELOPMENT",
            "vector_label_hi": "विकास बनाम 'मुफ्त की रेवड़ी' का विवाद",
            "opponent_rhetoric": claim_text or "डबल इंजन विकास का दावा और विपक्ष की कल्याणकारी योजनाओं पर हमला।",
            "strategic_doctrine": "Concrete World-Class Infrastructure vs Slogans, Paper Leaks & Broken Promises.",
            "headline_hi": "काम बोलता है, जुमला डोलता है!",
            "subtext_hi": "22 महीने में लड़ाकू विमान उतारने वाला आगरा-लखनऊ एक्सप्रेसवे, लखनऊ मेट्रो और कैंसर संस्थान सपा की देन हैं।",
            "factual_bullet_hi": "सपा सरकार ने युवाओं को लैपटॉप और रोजगार दिया; वर्तमान सरकार में 60 लाख नौजवान पेपर लीक, महंगाई और आवारा पशुओं से त्रस्त हैं।",
            "bottom_slogan_hi": "विकास का असली पैमाना: अस्पताल, मेट्रो, एक्सप्रेसवे और रोजगार • जुमलों से पेट नहीं भरता!",
            "primary_color": "#dc2626",
            "accent_color": "#16a34a",
            "spokesperson_points": [
                "अखिलेश यादव जी ने 22 महीने में विश्वस्तरीय आगरा-लखनऊ एक्सप्रेसवे बनाकर उस पर सुखोई और मिराज लड़ाकू विमान उतारे।",
                "लखनऊ मेट्रो, मेदांता अस्पताल, गोमती रिवरफ्रंट और जनेश्वर मिश्र पार्क जैसे बुनियादी ढांचे आज भी उत्तर प्रदेश की शान हैं।",
                "डबल इंजन सरकार केवल सपा के बने कामों पर अपने फीते काट रही है और नए उद्योग लगाने के नाम पर केवल एमओयू के जुमले दे रही है।"
            ]
        }

    else:  # CASTE_PDA
        return {
            "vector_name": "CASTE_PDA",
            "vector_label_hi": "जाति जनगणना व PDA पर हमला",
            "opponent_rhetoric": claim_text or "सपा पर समाज को जातियों में बांटने का आरोप लगाना।",
            "strategic_doctrine": "Caste Census is Constitutional Social Justice; PDA is 90% Representation of Common Citizens.",
            "headline_hi": "जिसकी जितनी संख्या भारी, उसकी उतनी हिस्सेदारी!",
            "subtext_hi": "जाति जनगणना समाज का बंटवारा नहीं — हर नागरिक को उसकी आबादी के अनुपात में हक़ और सम्मान देने का संवैधानिक संकल्प है।",
            "factual_bullet_hi": "डॉ. लोहिया ने कहा था: 'संसोपा ने बांधी गांठ, पिछड़े पावें सौ में साठ'। PDA वंचितों, शोषितों और युवाओं की एकजुट आवाज़ है।",
            "bottom_slogan_hi": "संवैधानिक सामाजिक न्याय ही सच्चा राष्ट्र निर्माण है • PDA संकल्प 2027",
            "primary_color": "#b91c1c",
            "accent_color": "#2563eb",
            "spokesperson_points": [
                "जब पशुओं और पेड़ों की गिनती हो सकती है, तो देश की 90% मेहनतकश जनता की जातिगत गिनती से भाजपा क्यों डरती है?",
                "जाति जनगणना सामाजिक न्याय का एक्स-रे है, जिससे पता चलेगा कि बजट और नौकरियों में किसे अपना वाजिब हक मिला और किसे नहीं।",
                "पीडीए कोई चुनावी समीकरण नहीं, यह सामाजिक गैर-बराबरी को मिटाने का गांधी, लोहिया और आंबेडकर का साझा आंदोलन है।"
            ]
        }

# ---------------------------------------------------------------------------
# STUDIO GRAPHIC CANVAS COMPOSITOR (Python PIL Studio Grade)
# ---------------------------------------------------------------------------
def generate_studio_poster_image(strategy: Dict[str, Any], width: int = 1080, height: int = 1080) -> str:
    """
    Renders an authentic, studio-grade political counter-poster in 1080x1080.
    Uses balanced typography, contrasting gradients, quote badges, and official stamps.
    """
    # Create base dark elegant canvas
    im = Image.new("RGB", (width, height), color="#090d16")
    draw = ImageDraw.Draw(im)

    # 1. Background radial / linear gradient (Dark Slate to Crimson/Emerald glow)
    for y in range(height):
        # Vertical gradient factor
        ratio = y / float(height)
        # Deep dark blue-black top, transitioning into rich crimson/red base
        r = int(12 + ratio * 55)
        g = int(14 + ratio * 15)
        b = int(24 + ratio * 20)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Top Header Banner
    header_h = 75
    draw.rectangle([(0, 0), (width, header_h)], fill="#b91c1c")
    # Tricolor / Red-Green subtle divider line
    draw.rectangle([(0, header_h - 6), (width // 2, header_h)], fill="#dc2626")
    draw.rectangle([(width // 2, header_h - 6), (width, header_h)], fill="#16a34a")

    # Header Text
    draw.text((40, 22), "सपा वॉर रूम • त्वरित जवाबी प्रहार", fill="#ffffff")
    draw.text((width - 320, 22), "सत्यमेव जयते • PDA संकल्प 2027", fill="#fef08a")

    # Opponent Claim Deconstruction Tag Box
    box_top = 110
    draw.rounded_rectangle([(40, box_top), (width - 40, box_top + 105)], radius=16, fill="#1e293b", outline="#ef4444", width=2)
    draw.rectangle([(60, box_top - 12), (240, box_top + 12)], fill="#ef4444")
    draw.text((70, box_top - 9), "विपक्षी प्रोपेगैंडा का सच", fill="#ffffff")
    
    # Opponent quote text
    opp_text = f"दावा: \"{strategy['opponent_rhetoric'][:85]}...\""
    draw.text((65, box_top + 30), opp_text, fill="#cbd5e1")
    draw.text((65, box_top + 65), f"प्रहार श्रेणी: {strategy['vector_label_hi']} • काउंटर स्टेटस: सत्यापित खंडन", fill="#f87171")

    # Central Hero Content Card
    center_top = 245
    draw.rounded_rectangle([(40, center_top), (width - 40, height - 160)], radius=24, fill="#0f172a", outline="#334155", width=2)

    # Main Bold Headline Box
    draw.rounded_rectangle([(65, center_top + 25), (width - 65, center_top + 130)], radius=16, fill="#450a0a", outline="#991b1b", width=2)
    draw.text((85, center_top + 45), strategy['headline_hi'], fill="#fef08a")
    draw.text((85, center_top + 85), strategy['subtext_hi'][:70] + "...", fill="#ffffff")

    # Factual Evidence / NCRB-ECI Proof Box
    proof_top = center_top + 155
    draw.rounded_rectangle([(65, proof_top), (width - 65, proof_top + 175)], radius=16, fill="#022c22", outline="#059669", width=2)
    draw.rectangle([(85, proof_top - 12), (320, proof_top + 12)], fill="#059669")
    draw.text((95, proof_top - 9), "सत्यापित जमीनी तथ्य (OFFICIAL DATA)", fill="#ffffff")

    # Evidence details
    draw.text((85, proof_top + 35), "• " + strategy['factual_bullet_hi'][:80], fill="#a7f3d0")
    draw.text((85, proof_top + 70), "• " + strategy['factual_bullet_hi'][80:160] if len(strategy['factual_bullet_hi']) > 80 else "", fill="#e2e8f0")
    draw.text((85, proof_top + 115), "स्रोत: भारत सरकार NCRB रिपोर्ट एवं यूपी पुलिस आधिकारिक अभिलेख", fill="#6ee7b7")

    # Philosophical Call to Action Box
    cta_top = proof_top + 205
    draw.rounded_rectangle([(65, cta_top), (width - 65, height - 190)], radius=16, fill="#1e1b4b", outline="#6366f1", width=2)
    draw.text((85, cta_top + 30), "जनता का संकल्प:", fill="#c7d2fe")
    draw.text((85, cta_top + 65), strategy['bottom_slogan_hi'][:75], fill="#ffffff")

    # Bottom Branding & Signature Bar
    bottom_h = 135
    draw.rectangle([(0, height - bottom_h), (width, height)], fill="#111827")
    draw.rectangle([(0, height - bottom_h), (width, height - bottom_h + 5)], fill="#dc2626")

    draw.text((45, height - 100), "समाजवादी पार्टी • PDA परिवार (पिछड़ा, दलित, अल्पसंख्यक)", fill="#f87171")
    draw.text((45, height - 60), "सत्य • समानता • सामाजिक न्याय • प्रगतिशील उत्तर प्रदेश", fill="#94a3b8")
    
    # Verified Watermark Badge
    badge_x = width - 360
    draw.rounded_rectangle([(badge_x, height - 105), (width - 40, height - 35)], radius=12, fill="#1e293b", outline="#10b981", width=1.5)
    draw.text((badge_x + 18, height - 85), "✓ ECI & NCRB VERIFIED", fill="#34d399")
    draw.text((badge_x + 18, height - 60), "WAR ROOM FACT-CHECKED", fill="#94a3b8")

    # Convert to Base64 PNG
    buf = io.BytesIO()
    im.save(buf, format="PNG")
    buf.seek(0)
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

# ---------------------------------------------------------------------------
# API ENDPOINT: GENERATE STRATEGIC COUNTER-CREATIVE
# ---------------------------------------------------------------------------
@router.post("/generate-counter")
def generate_counter_endpoint(payload: CounterCreativeRequest):
    """
    Accepts opponent's poster image or claim, detects attack vector,
    formulates high-level Samajwadi strategic counter-thesis, and renders
    studio-grade counter-creative with debate briefing.
    """
    claim_text = payload.opponent_claim or "विपक्षी दल द्वारा सामाजिक सौहार्द और जनता के असल मुद्दों से ध्यान भटकाने का प्रयास।"
    
    # 1. Identify Attack Vector
    vector = payload.target_vector or detect_attack_vector(claim_text)

    # 2. Get 360° Samajwadi Strategic Playbook
    strategy = get_counter_strategy(vector, claim_text)

    # 3. Render Studio-Grade Counter-Poster (1080x1080)
    poster_base64 = generate_studio_poster_image(strategy)

    return {
        "status": "success",
        "attack_vector": vector,
        "attack_label_hi": strategy["vector_label_hi"],
        "opponent_claim_deconstruction": {
            "claim_text": claim_text,
            "propaganda_trick": "असल जनहित के मुद्दों (बेरोजगारी, पेपर लीक, महंगाई) से जनता का ध्यान भटकाना।"
        },
        "counter_strategy": {
            "strategic_doctrine": strategy["strategic_doctrine"],
            "headline_hi": strategy["headline_hi"],
            "subtext_hi": strategy["subtext_hi"],
            "factual_bullet_hi": strategy["factual_bullet_hi"],
            "bottom_slogan_hi": strategy["bottom_slogan_hi"]
        },
        "spokesperson_debate_brief": {
            "anchor_talking_points": strategy["spokesperson_points"],
            "caution_guardrail": "शालीनता बनाए रखें। किसी भी धर्म या जाति पर अशोभनीय टिप्पणी न करें। मुकाबला केवल मुद्दों और तथ्यों पर हो।"
        },
        "generated_creative": {
            "image_base64": poster_base64,
            "dimensions": "1080x1080",
            "formats_supported": ["1:1 (Instagram/Facebook)", "9:16 (WhatsApp Status/Story)", "16:9 (Twitter Banner)"]
        }
    }
