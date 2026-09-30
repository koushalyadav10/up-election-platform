# -*- coding: utf-8 -*-
"""
E:/eci/backend/app/routes/campaign.py
"Chitragupta 3.0" — Universal Real-Time Political Intelligence & CorelDraw (CDR) Studio.
Applies the 360° Samajwadi Party Strategic Re-framing Playbook
(Lohia - Ambedkar - Mulayam - Akhilesh Doctrine).
Dynamically synthesizes real-time counter-punch messaging, 3D CorelDraw typography,
TV debate spokesperson dossiers, and high-impact visual artwork for ANY political topic or custom claim.
"""

import io
import re
import os
import json
import base64
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

router = APIRouter(prefix="/api/campaign", tags=["Strategic Counter Studio"])

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_CARTOONS_DIR = BASE_DIR / "static" / "cartoons"

# ---------------------------------------------------------------------------
# SAFE MULTI-PLATFORM HINDI FONT LOADER
# ---------------------------------------------------------------------------
def get_safe_hindi_font(size: int = 24, bold: bool = False):
    candidate_paths = [
        "/usr/share/fonts/truetype/annapurna/AnnapurnaSIL-Bold.ttf" if bold else "/usr/share/fonts/truetype/annapurna/AnnapurnaSIL-Regular.ttf",
        "/usr/share/fonts/truetype/lohit-devanagari/Lohit-Devanagari.ttf",
        "/usr/share/fonts/truetype/Gargi/Gargi.ttf",
        "/usr/share/fonts/truetype/samyak/Samyak-Devanagari.ttf",
        "/usr/share/fonts/truetype/Sahadeva/sahadeva.ttf",
        "/usr/share/fonts/truetype/fonts-deva-extra/kalimati.ttf",
        "C:\\Windows\\Fonts\\mangal.ttf",
        "C:\\Windows\\Fonts\\aparaj.ttf",
        "C:\\Windows\\Fonts\\arial.ttf"
    ]
    for path in candidate_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    try:
        return ImageFont.load_default()
    except Exception:
        return None

# ---------------------------------------------------------------------------
# REQUEST SCHEMA
# ---------------------------------------------------------------------------
class CounterCreativePayload(BaseModel):
    opponent_claim: str
    target_vector: Optional[str] = "AUTO_DETECT"
    opponent_image_base64: Optional[str] = None
    tone: Optional[str] = "FACTUAL_DIGNIFIED"

# ---------------------------------------------------------------------------
# 15 COMPREHENSIVE PRESET ATTACK SCENARIOS & BURNING ISSUES
# ---------------------------------------------------------------------------
PRESET_ATTACKS = [
    {
        "id": "paper_leak_01",
        "vector": "PAPER_LEAK",
        "label": "पेपर लीक, युवा आक्रोश व बेरोजगारी (Paper Leak & Youth)",
        "claim": "सपा सरकार में पर्ची और खर्ची से भर्तियां होती थीं, भाजपा पारदर्शी रोजगार दे रही है।",
        "description": "60 लाख छात्रों के भविष्य, लगातार परीक्षा रद्दीकरण और लाठीचार्ज पर समाजवादी प्रहार।",
        "artwork_url": "/assets/cartoons/youth_paper_leak.jpg"
    },
    {
        "id": "smart_meter_02",
        "vector": "ELECTRICITY_METERS",
        "label": "स्मार्ट मीटर, बिजली बिल व अंधाधुंध निजीकरण (Smart Meters & Power Loot)",
        "claim": "स्मार्ट मीटर से बिजली चोरी रुकी है और उपभोक्ताओं को सटीक बिलिंग मिल रही है।",
        "description": "500 के बिल का 5000 पहुंचना, अंधाधुंध निजीकरण और 300 यूनिट मुफ्त बिजली के संकल्प का सच।",
        "artwork_url": "/assets/cartoons/inflation_mehngai.jpg"
    },
    {
        "id": "swasthya_03",
        "vector": "HEALTHCARE_AMBULANCE",
        "label": "सरकारी अस्पताल, 108/102 एम्बुलेंस व स्वास्थ्य संकट (Hospitals & Healthcare)",
        "claim": "डबल इंजन सरकार ने यूपी में रिकॉर्ड मेडिकल कॉलेज और विश्वस्तरीय स्वास्थ्य ढांचा बनाया है।",
        "description": "अस्पतालों में दवा-स्ट्रेचर का अभाव, मरीजों की लाचारी और सपा के मेदांता-कैंसर संस्थान का प्रमाण।",
        "artwork_url": "/assets/cartoons/expressway_vikas.jpg"
    },
    {
        "id": "sadak_gaddha_04",
        "vector": "INFRASTRUCTURE_ROADS",
        "label": "गड्ढामुक्त का झूठ, टोल टैक्स व बदहाल सड़कें (Potholes & Toll Tax Loot)",
        "claim": "भाजपा सरकार ने उत्तर प्रदेश की सभी सड़कों को रिकॉर्ड समय में गड्ढामुक्त कर दिया है।",
        "description": "सड़कों के खूनी गड्ढे, पहली बारिश में धंसते एक्सप्रेसवे और जनता से वसूला जाने वाला दोगुना टोल टैक्स।",
        "artwork_url": "/assets/cartoons/expressway_vikas.jpg"
    },
    {
        "id": "mehngai_05",
        "vector": "INFLATION_MEHNGAI",
        "label": "महंगाई की मार, रसोई गैस ₹1100 व घरेलू संकट (LPG Cylinder ₹1100 & Inflation)",
        "claim": "विपक्ष महंगाई का झूठा रोना रो रहा है, देश की अर्थव्यवस्था दुनिया में सबसे तेज भाग रही है।",
        "description": "रसोई गैस, दाल, तेल, दूध पर जीएसटी और आम जनता की खाली जेब का वास्तविक सच।",
        "artwork_url": "/assets/cartoons/inflation_mehngai.jpg"
    },
    {
        "id": "kisan_cattle_06",
        "vector": "STRAY_CATTLE_FARMER",
        "label": "सांड का आतंक, आवारा पशु व किसान संकट (Stray Cattle & Farm Distress)",
        "claim": "भाजपा सरकार ने गौ संरक्षण और किसानों के लिए ऐतिहासिक कल्याणकारी योजनाएं बनाई हैं।",
        "description": "खेतों को बर्बाद करते सांड, रात भर जागते किसान और कागजी गौशालाओं के भ्रष्टाचार की पोल।",
        "artwork_url": "/assets/cartoons/stray_cattle_farmer.jpg"
    },
    {
        "id": "kisan_khad_07",
        "vector": "FARMERS_FERTILIZER_MSP",
        "label": "खाद की बोरी में चोरी, डीएपी किल्लत व एमएसपी (Fertilizer Shortage & MSP)",
        "claim": "किसानों को समय पर खाद-बीज और सम्मान निधि मिल रही है, बिचौलियों का राज खत्म हुआ।",
        "description": "बोरी से 5 किलो यूरिया की चोरी, डीएपी की कालाबाजारी और कानूनी एमएसपी गारंटी की मांग।",
        "artwork_url": "/assets/cartoons/stray_cattle_farmer.jpg"
    },
    {
        "id": "pda_const_08",
        "vector": "CONSTITUTION_PDA",
        "label": "संविधान रक्षा, जाति जनगणना व 69000 आरक्षण (Constitution & PDA Justice)",
        "claim": "जाति जनगणना और पीडीए की मांग समाज को बांटने और वैमनस्य फैलाने का षड्यंत्र है।",
        "description": "बाबासाहेब के संविधान, 69000 शिक्षक भर्ती आरक्षण और 90% आबादी के प्रतिनिधित्व की मांग।",
        "artwork_url": "/assets/cartoons/constitution_pda.jpg"
    },
    {
        "id": "agniveer_09",
        "vector": "AGNIVEER_ARMY",
        "label": "4 साल की अग्निवीर योजना व सेना भर्ती धोखा (Agniveer Scheme Betrayal)",
        "claim": "अग्निवीर योजना से भारतीय सेना युवा और आधुनिक बन रही है, युवाओं में भारी उत्साह है।",
        "description": "4 साल बाद 75% युवाओं की बेरोजगारी, पेंशन-कैंटीन का अंत और देश की सुरक्षा से खिलवाड़।",
        "artwork_url": "/assets/cartoons/youth_paper_leak.jpg"
    },
    {
        "id": "shikshamitra_ops_10",
        "vector": "TEACHERS_SHIKSHAMITRA",
        "label": "शिक्षामित्र, अनुदेशक व पुरानी पेंशन (OPS) बहाली (Shikshamitra & Old Pension)",
        "claim": "सरकार ने शिक्षकों और कर्मचारियों के कल्याण के लिए पारदर्शी नीतियां लागू की हैं।",
        "description": "पुरानी पेंशन छीनना, शिक्षामित्रों का मानदेय शोषण और 69000 शिक्षक आरक्षण घोटाले पर हाईकोर्ट का फैसला।",
        "artwork_url": "/assets/cartoons/constitution_pda.jpg"
    },
    {
        "id": "mahila_suraksha_11",
        "vector": "WOMEN_SAFETY",
        "label": "महिला सुरक्षा, 1090 हेल्पलाइन व हाथरस का सच (Women Safety & NCRB Reality)",
        "claim": "यूपी में महिलाएं रात 12 बजे भी सुरक्षित घूम सकती हैं, अपराध पूरी तरह समाप्त हो चुका है।",
        "description": "NCRB रिपोर्ट में महिला अपराध में यूपी नंबर 1, हाथरस-उन्नाव की सच्चाई और 1090 हेल्पलाइन को कमजोर करना।",
        "artwork_url": "/assets/cartoons/constitution_pda.jpg"
    },
    {
        "id": "bulldozer_law_12",
        "vector": "BULLDOZER_INJUSTICE",
        "label": "बुलडोजर न्याय बनाम सुप्रीम कोर्ट व संविधान (Bulldozer Raj vs Supreme Court)",
        "claim": "बुलडोजर से त्वरित न्याय और कानून व्यवस्था स्थापित की गई है, माफिया थर्रा रहे हैं।",
        "description": "सुप्रीम कोर्ट का ऐतिहासिक फैसला: कार्यपालिका जज नहीं बन सकती, बुलडोजर गैर-कानूनी है।",
        "artwork_url": "/assets/cartoons/bulldozer_justice.jpg"
    },
    {
        "id": "rel_sanatan_13",
        "vector": "RELIGIOUS_COMMUNAL",
        "label": "तुष्टिकरण का झूठा आरोप व 'प्रभु राम सबके हैं' (Sanatan, Unity & Faith)",
        "claim": "सपा केवल एक वर्ग विशेष और तुष्टिकरण की राजनीति करती है, सनातन का विरोध करती है।",
        "description": "प्रभु राम जन-जन के आराध्य हैं, किसी दल की जागीर नहीं; अयोध्या जनादेश और सद्भाव का संदेश।",
        "artwork_url": "/assets/cartoons/ram_sabke_harmony.jpg"
    },
    {
        "id": "dev_exp_14",
        "vector": "DEVELOPMENT_EXPRESSWAY",
        "label": "विश्वस्तरीय विकास, आगरा-लखनऊ एक्सप्रेसवे व मेट्रो (Agra-Lucknow Expressway)",
        "claim": "सपा सरकार केवल मुफ्त की रेवड़ियां बांटती थी, कोई वास्तविक ढांचागत विकास नहीं किया।",
        "description": "22 महीने में बने आगरा-लखनऊ एक्सप्रेसवे, लखनऊ मेट्रो और विश्वस्तरीय अस्पतालों का प्रमाण।",
        "artwork_url": "/assets/cartoons/expressway_vikas.jpg"
    },
    {
        "id": "rally_2027_15",
        "vector": "SP_2027_RALLY",
        "label": "2024 में 37 सांसद, 2027 में 202+ सीटों का संकल्प (SP 2027 Wave & Victory)",
        "claim": "सपा की जमीन खिसक चुकी है, 2027 में विपक्ष का कोई भविष्य नहीं है।",
        "description": "37 लोकसभा सीटों की प्रचंड शक्ति, 2027 में 202+ सीटों का संकल्प और अखिलेश यादव का विजन।",
        "artwork_url": "/assets/cartoons/sp_2027_rally.jpg"
    }
]

# ---------------------------------------------------------------------------
# INTELLIGENT ATTACK VECTOR CLASSIFIER (18+ DOMAINS)
# ---------------------------------------------------------------------------
def detect_attack_vector(claim_text: str) -> str:
    txt = claim_text.lower()
    
    # 1. Smart Meters & Electricity Tariff
    if any(k in txt for k in ["स्मार्ट मीटर", "मीटर", "बिजली", "पावर कट", "बिल", "300 यूनिट", "विद्युत", "निजीकरण", "smart meter", "electric", "power tariff", "bijli"]):
        return "ELECTRICITY_METERS"

    # 2. Healthcare & Ambulance 108/102
    if any(k in txt for k in ["अस्पताल", "दवा", "दवाई", "इलाज", "स्ट्रेचर", "डॉक्टर", "एम्बुलेंस", "108", "102", "वेंटिलेटर", "ऑक्सीजन", "डेंगू", "hospital", "medicine", "doctor", "ambulance", "stretcher"]):
        return "HEALTHCARE_AMBULANCE"

    # 3. Roads, Potholes & Toll Tax
    if any(k in txt for k in ["सड़क", "सड़कें", "गड्ढे", "गड्ढा", "टोल", "जलभराव", "पुल", "धंस", "नाली", "फ्लाईओवर", "road", "pothole", "toll", "bridge", "flyover"]):
        return "INFRASTRUCTURE_ROADS"

    # 4. Teachers, Shikshamitra & OPS
    if any(k in txt for k in ["शिक्षामित्र", "अनुदेशक", "पुरानी पेंशन", "ops", "मानदेय", "69000", "शिक्षक भर्ती", "शिक्षक", "पेंशन", "teacher", "shikshamitra", "pension"]):
        return "TEACHERS_SHIKSHAMITRA"

    # 5. Agniveer & Army
    if any(k in txt for k in ["अग्निवीर", "अग्निपथ", "सेना", "फौज", "4 साल", "आर्मी", "वर्दी", "agniveer", "agnipath", "army", "defense"]):
        return "AGNIVEER_ARMY"

    # 6. Fertilizer DAP, Urea & Farmer MSP
    if any(k in txt for k in ["खाद", "डीएपी", "यूरिया", "एमएसपी", "गन्ना", "बकाया", "कर्ज", "सिंचाई", "सोसाइटी", "fertilizer", "dap", "urea", "msp", "sugarcane"]):
        return "FARMERS_FERTILIZER_MSP"

    # 7. Stray Cattle & Farmers Distress
    if any(k in txt for k in ["सांड", "आवारा", "पशु", "गाय", "बैल", "गौशाला", "खेत", "cattle", "bull", "sand"]):
        return "STRAY_CATTLE_FARMER"

    # 8. Women Safety & Crimes
    if any(k in txt for k in ["महिला", "सुरक्षा", "छेड़खानी", "बलात्कार", "हाथरस", "उन्नाव", "1090", "आधी आबादी", "women", "safety"]):
        return "WOMEN_SAFETY"

    # 9. Corruption, Scams & Smart City
    if any(k in txt for k in ["घोटाला", "भ्रष्टाचार", "कमीशन", "स्मार्ट सिटी", "जल जीवन", "टेंडर", "scam", "corruption", "tender"]):
        return "CORRUPTION_SCAMS"

    # 10. Traders & GST Raids
    if any(k in txt for k in ["व्यापारी", "दुकानदार", "जीएसटी", "छापेमारी", "मंडी", "टैक्स", "इंस्पेक्टर राज", "trader", "merchant", "gst raid"]):
        return "BUSINESS_TRADERS"

    # 11. Bulldozer, Supreme Court & Law & Order
    if any(k in txt for k in ["बुलडोजर", "सुप्रीम कोर्ट", "घर गिरा", "ध्वस्तीकरण", "एनकाउंटर", "कस्टोडियल", "माफिया", "अपराध", "हथकड़ी", "bulldozer", "court", "crime"]):
        return "BULLDOZER_INJUSTICE"

    # 12. Paper Leak, Youth & Recruitment
    if any(k in txt for k in ["पेपर", "लीक", "युवा", "बेरोजगार", "नौकरी", "भर्ती", "सिपाही", "ro/aro", "छात्र", "परीक्षा", "लाठीचार्ज", "डिग्री", "paper", "leak", "exam", "student", "job"]):
        return "PAPER_LEAK"

    # 13. Inflation, LPG Cylinder ₹1100
    if any(k in txt for k in ["महंगाई", "सिलेंडर", "गैस", "दाल", "तेल", "पेट्रोल", "डीजल", "खर्चा", "राशन", "1100", "बजट", "lpg", "inflation", "price"]):
        return "INFLATION_MEHNGAI"

    # 14. Constitution, Caste Census & PDA
    if any(k in txt for k in ["संविधान", "आरक्षण", "जाति", "जनगणना", "दलित", "पिछड़ा", "अल्पसंख्यक", "पीडीए", "आंबेडकर", "लोहिया", "सामाजिक न्याय", "pda", "ambedkar", "caste"]):
        return "CONSTITUTION_PDA"

    # 15. Religious, Communal & Sanatan
    if any(k in txt for k in ["मुस्लिम", "तुष्टिकरण", "सनातन", "राम", "मंदिर", "मस्जिद", "दंगा", "दंगे", "हिंदू", "धर्म", "अयोध्या", "मजहब", "appeasement", "communal"]):
        return "RELIGIOUS_COMMUNAL"

    # 16. Development, Expressways & Metro
    if any(k in txt for k in ["एक्सप्रेसवे", "मेट्रो", "लैपटॉप", "विकास", "रिवरफ्रंट", "मेदांता", "लोहिया संस्थान", "रेवड़ी", "डबल इंजन", "expressway", "metro", "vikas"]):
        return "DEVELOPMENT_EXPRESSWAY"

    # 17. Dynasty, Rallies, 2027 Election
    if any(k in txt for k in ["परिवार", "कुनबा", "सैफई", "वंशवाद", "परिवारवाद", "रैली", "2027", "चुनाव", "सपा", "अखिलेश", "जीत", "37 सीट", "202 सीट"]):
        return "SP_2027_RALLY"
        
    return "CUSTOM_GENERAL_MUDDA"

# ---------------------------------------------------------------------------
# UNIVERSAL REAL-TIME DYNAMIC STRATEGY ENGINE
# ---------------------------------------------------------------------------
def get_strategic_counter(vector: str, claim: str, tone: str) -> Dict[str, Any]:
    """
    Synthesizes real-time, dynamic counter-punch intelligence tailored specifically
    to the user's input claim, extracting context and generating authentic Devanagari typography.
    """
    claim_clean = claim.strip() if claim else "विपक्षी दल द्वारा सामाजिक सौहार्द बिगाड़ने का प्रयास।"
    # Short quote representation (preserving word boundaries for clean Devanagari)
    claim_short = claim_clean.replace('"', '').replace("'", "")
    words_list = claim_short.split()
    if len(words_list) > 12:
        claim_short = " ".join(words_list[:12]) + "..."
    elif len(claim_short) > 60:
        claim_short = claim_short[:56].rsplit(' ', 1)[0] + "..."

    # 1. ELECTRICITY & SMART METERS
    if vector == "ELECTRICITY_METERS":
        return {
            "vector_label": "स्मार्ट मीटर, बिजली बिल व अंधाधुंध निजीकरण",
            "artwork_file": "inflation_mehngai.jpg",
            "artwork_url": "/assets/cartoons/inflation_mehngai.jpg",
            "cdr_headline_hi": "स्मार्ट मीटर या जेब पर डाका?",
            "headline_hi": f"स्मार्ट मीटर के नाम पर लूट का खेल: 500 का बिल 5000 पहुंचा, गरीब जनता त्रस्त!",
            "sub_headline_hi": "सपा सरकार में बने थर्मल पावर प्लांट, भाजपा ने दिया सिर्फ अंधाधुंध निजीकरण और लूट • 300 यूनिट मुफ्त बिजली का संकल्प",
            "body_hi": f"उत्तर प्रदेश में स्मार्ट मीटर के नाम पर आम जनता और गरीबों को खुलेआम लूटा जा रहा है। '{claim_short}' का दर्द हर घर में है। जिन परिवारों का बिल कुछ सौ रुपये आता था, आज वहां हजारों के बिल थमाए जा रहे हैं। अखिलेश यादव सरकार ने अनपरा, पारीछा और मेजा में रिकॉर्ड बिजली उत्पादन क्षमता बढ़ाई थी और 300 यूनिट मुफ्त बिजली का वादा किया था। 2027 में PDA सरकार इस खुली लूट पर ताला लगाएगी।",
            "call_to_action_hi": "स्मार्ट मीटर लूट बंद करो • 2027 में 300 यूनिट मुफ्त बिजली पाएँ!",
            "hashtags": ["#SmartMeterLoot", "#BijliBillKamKaro", "#SamajwadiKaam", "#PDA2027", "#300UnitFreeBijli"],
            "talking_points": [
                f"1. '{claim_short}'—स्मार्ट मीटर लगते ही सामान्य परिवारों के बिजली बिलों में 300% से 500% की बेतहाशा वृद्धि हुई है।",
                "2. अखिलेश यादव सरकार ने प्रदेश में रिकॉर्ड बिजली उत्पादन क्षमता बढ़ाई थी और 300 यूनिट मुफ्त बिजली नीति बनाई थी।",
                "3. भाजपा सरकार ने 8 साल में एक भी नया बिजली घर नहीं बनाया, केवल निजी कंपनियों को लूट की खुली छूट दी।"
            ],
            "official_data_citations": [
                {"metric": "घरेलू बिजली नीति", "sp_value": "300 यूनिट मुफ्त बिजली का संकल्प", "bjp_value": "देश की सबसे महंगी बिजली दरें", "source": "UPERC Official 2024"},
                {"metric": "बिजली उत्पादन विस्तार", "sp_value": "अनपरा डी, पारीछा, मेजा प्लांट", "bjp_value": "शून्य नया उत्पादन संयंत्र", "source": "UP Power Corp"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'स्मार्ट मीटर बनाने वाली निजी कंपनी को फायदा पहुंचाने के लिए क्या यूपी के गरीबों के पंखे और बल्ब बंद करवाएंगे?'"
        }

    # 2. HEALTHCARE & AMBULANCE
    if vector == "HEALTHCARE_AMBULANCE":
        return {
            "vector_label": "सरकारी अस्पताल, 108/102 एम्बुलेंस व स्वास्थ्य संकट",
            "artwork_file": "expressway_vikas.jpg",
            "artwork_url": "/assets/cartoons/expressway_vikas.jpg",
            "cdr_headline_hi": "अस्पतालों में दवा-इलाज दो!",
            "headline_hi": f"डबल इंजन का स्वास्थ्य ढांचा वेंटिलेटर पर: अस्पतालों में दवा-स्ट्रेचर नहीं, लाचार मरीज!",
            "sub_headline_hi": "सपा की 108/102 एम्बुलेंस सेवा को बर्बाद किया, जिला अस्पतालों में दवा और डॉक्टरों का घोर अभाव",
            "body_hi": f"उत्तर प्रदेश के सरकारी अस्पतालों में आज गरीब मरीजों को स्ट्रेचर तक नसीब नहीं हो रहा है और तीमारदार अपनों को कंधे पर लादने को मजबूर हैं। '{claim_short}' जमीनी बदहाली का कड़वा सच है। अखिलेश यादव सरकार ने 108 और 102 एम्बुलेंस सेवा शुरू कर 15 मिनट में गांव-गांव तक मुफ्त आपातकालीन स्वास्थ्य सुविधा पहुंचाई थी। मेदांता, कैंसर संस्थान और लोहिया संस्थान सपा की देन हैं।",
            "call_to_action_hi": "इलाज और दवा पर बात करो • PDA 2027 में स्वास्थ्य का अधिकार देगा!",
            "hashtags": ["#SwasthyaSankatUP", "#Ambulance108Bachao", "#DawaNahiDilaas", "#AkhileshYadavVision"],
            "talking_points": [
                f"1. '{claim_short}'—जिला अस्पतालों और सीएचसी-पीएचसी में आवश्यक दवाओं, जांच किटों और डॉक्टरों का भारी टोटा है।",
                "2. समाजवादी सरकार की विश्वप्रसिद्ध 108 और 102 एम्बुलेंस सेवा को बजट न देकर जानबूझकर बर्बाद किया गया।",
                "3. लखनऊ में मेदांता, कैंसर इंस्टिट्यूट और लोहिया आयुर्विज्ञान संस्थान अखिलेश यादव जी की विकासपरक सोच की देन हैं।"
            ],
            "official_data_citations": [
                {"metric": "आपातकालीन एम्बुलेंस सेवा", "sp_value": "108 व 102 (15 मिनट रिस्पॉन्स)", "bjp_value": "घंटों इंतजार, कबाड़ में तब्दील फ्लीट", "source": "National Health Mission"},
                {"metric": "सुपर-स्पेशियलिटी अस्पताल", "sp_value": "मेदांता + कैंसर इंस्टिट्यूट + लोहिया", "bjp_value": "कागजी एम्स, डॉक्टरों की भारी कमी", "source": "UP Health Ministry"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'जब प्रदेश के मेडिकल कॉलेजों में स्ट्रेचर और दवाइयां नहीं हैं, तो अरबों रुपये का स्वास्थ्य बजट किसकी जेब में जा रहा है?'"
        }

    # 3. ROADS, POTHOLES & TOLL TAX
    if vector == "INFRASTRUCTURE_ROADS":
        return {
            "vector_label": "गड्ढामुक्त का झूठ, टोल टैक्स व बदहाल सड़कें",
            "artwork_file": "expressway_vikas.jpg",
            "artwork_url": "/assets/cartoons/expressway_vikas.jpg",
            "cdr_headline_hi": "गड्ढामुक्त का दावा फुस्स!",
            "headline_hi": f"गड्ढामुक्त यूपी का छलावा: खूनी गड्ढों से सड़कें बदहाल, जनता से दोगुना टोल टैक्स की वसूली!",
            "sub_headline_hi": "करोड़ों के बजट की बंदरबांट, पहली बारिश में धंस रहे हैं पुल और एक्सप्रेसवे • जनता त्रस्त",
            "body_hi": f"भाजपा सरकार हर साल प्रदेश को गड्ढामुक्त करने की फर्जी समयसीमा तय करती है, लेकिन सड़कें जानलेवा गड्ढों में तब्दील हैं। '{claim_short}' जनता के दैनिक संघर्ष का आईना है। दूसरी तरफ जनता से दोगुना टोल टैक्स वसूला जा रहा है। अखिलेश यादव जी ने 302 किमी लंबा विश्वस्तरीय आगरा-लखनऊ एक्सप्रेसवे बनाया जिस पर वायुसेना के सुखोई उतरे। भाजपा का बुंदेलखंड एक्सप्रेसवे उद्घाटन के पांचवें दिन ही धंस गया।",
            "call_to_action_hi": "टोल लूट बंद करो, सड़कें सुधारो • 2027 में विश्वस्तरीय विकास लौटेगा!",
            "hashtags": ["#GaddhaMuktUP_Jhooth", "#TollTaxLoot", "#AgraLucknowExpressway", "#KaamBoltaHai"],
            "talking_points": [
                f"1. '{claim_short}'—हर साल गड्ढामुक्त के नाम पर सैकड़ों करोड़ रुपये का टेंडर निकाला जाता है जो भ्रष्टाचार की भेंट चढ़ जाता है।",
                "2. सड़कों पर जानलेवा गड्ढों के कारण रोजाना सड़क हादसों में निर्दोष नागरिकों की जान जा रही है।",
                "3. सपा सरकार ने रिकॉर्ड 22 महीनों में विश्वस्तरीय आगरा-लखनऊ एक्सप्रेसवे और लखनऊ मेट्रो का निर्माण किया था।"
            ],
            "official_data_citations": [
                {"metric": "एक्सप्रेसवे निर्माण गुणवत्ता", "sp_value": "आगरा-लखनऊ (लड़ाकू विमान रनवे)", "bjp_value": "बुंदेलखंड (उद्घाटन के 5 दिन बाद धंसा)", "source": "UPEIDA Official"},
                {"metric": "गड्ढामुक्त घोषणाएं", "sp_value": "रिकॉर्ड 4-लेन जिला कनेक्टिविटी", "bjp_value": "8 साल में 10 बार फर्जी डेडलाइन", "source": "PWD Uttar Pradesh"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'टोल टैक्स में 100% की वृद्धि करने के बाद भी सड़कों से जानलेवा गड्ढे कब खत्म होंगे?'"
        }

    # 4. TEACHERS, SHIKSHAMITRA & OPS
    if vector == "TEACHERS_SHIKSHAMITRA":
        return {
            "vector_label": "शिक्षामित्र, शिक्षक भर्ती व पुरानी पेंशन (OPS)",
            "artwork_file": "constitution_pda.jpg",
            "artwork_url": "/assets/cartoons/constitution_pda.jpg",
            "cdr_headline_hi": "पुरानी पेंशन बहाल करो!",
            "headline_hi": f"शिक्षामित्रों व कर्मचारियों का हक छीना: पुरानी पेंशन (OPS) बहाली PDA सरकार का संकल्प!",
            "sub_headline_hi": "69,000 शिक्षक भर्ती में पिछड़ों-दलितों के आरक्षण पर डाका, अनुदेशकों व शिक्षामित्रों को बंधुआ मजदूर बनाया",
            "body_hi": f"लाखों शिक्षक, शिक्षामित्र, अनुदेशक और राज्य कर्मचारी अपने जायज हक के लिए वर्षों से सड़कों पर लाठियां खा रहे हैं। '{claim_short}' कर्मचारियों के दर्द को उजागर करता है। भाजपा सरकार ने पुरानी पेंशन छीनकर बुढ़ापे का सहारा छीन लिया और 69,000 शिक्षक भर्ती में आरक्षण नियमों का घोर उल्लंघन किया। 2027 में समाजवादी सरकार बनते ही पुरानी पेंशन (OPS) बहाल होगी और शिक्षामित्रों को न्याय मिलेगा।",
            "call_to_action_hi": "शिक्षामित्रों को न्याय दो, OPS बहाल करो • PDA 2027!",
            "hashtags": ["#RestoreOldPension", "#ShikshamitraNyay", "#69000AarakshanGhotala", "#PDA_Adhikar"],
            "talking_points": [
                f"1. '{claim_short}'—पुरानी पेंशन (OPS) कर्मचारियों का बुनियादी संवैधानिक अधिकार है, जिसे भाजपा ने छीनकर असुरक्षित बना दिया।",
                "2. 69,000 शिक्षक भर्ती आरक्षण घोटाले पर इलाहाबाद हाईकोर्ट का फैसला भाजपा सरकार के आरक्षण-विरोधी चेहरे का प्रमाण है।",
                "3. शिक्षामित्रों और अनुदेशकों को उचित मानदेय और नियमितीकरण का वादा करके मुकर गई डबल इंजन सरकार।"
            ],
            "official_data_citations": [
                {"metric": "पुरानी पेंशन (OPS) नीति", "sp_value": "पूर्ण बहाली का लिखित संकल्प", "bjp_value": "शेयर बाजार जोखिम (NPS थोपा)", "source": "SP Election Manifesto"},
                {"metric": "69000 शिक्षक आरक्षण", "sp_value": "PDA छात्रों के हक में सड़क पर संघर्ष", "bjp_value": "हाईकोर्ट द्वारा मेरिट लिस्ट रद्द", "source": "Allahabad HC Verdict"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'जब सांसदों और विधायकों को पुरानी पेंशन मिलती है, तो 35 साल सेवा देने वाले कर्मचारियों से यह हक क्यों छीना गया?'"
        }

    # 5. AGNIVEER & ARMY
    if vector == "AGNIVEER_ARMY":
        return {
            "vector_label": "अग्निवीर योजना व सेना भर्ती धोखा",
            "artwork_file": "youth_paper_leak.jpg",
            "artwork_url": "/assets/cartoons/youth_paper_leak.jpg",
            "cdr_headline_hi": "अग्निवीर योजना धोखा है!",
            "headline_hi": f"4 साल में रिटायर करने वाली अग्निवीर योजना धोखा: युवाओं के स्वाभिमान व देश की सुरक्षा से खिलवाड़!",
            "sub_headline_hi": "वर्दी का सपना देखने वाले नौजवानों को 22 साल की उम्र में बेरोजगार बनाया • पक्की सेना भर्ती बहाल हो",
            "body_hi": f"गांव-देहात का युवा सुबह 4 बजे उठकर देश की सरहद की रक्षा के लिए दौड़ लगाता था। '{claim_short}' लाखों परिवारों की पीड़ा है। भाजपा सरकार ने 'अग्निवीर' योजना लाकर सेना की पक्की भर्ती खत्म कर दी और युवाओं को 4 साल बाद बिना पेंशन और कैंटीन सुविधा के सड़क पर धकेल दिया। अखिलेश यादव जी ने स्पष्ट कहा है कि सेना में अस्थायी भर्ती देश की सुरक्षा के साथ समझौता है। पक्की भर्ती बहाल करना हमारा संकल्प है।",
            "call_to_action_hi": "अग्निवीर वापस लो, पक्की भर्ती दो • युवा शक्ति मिशन 2027!",
            "hashtags": ["#RollbackAgniveer", "#PakkiBhartiDo", "#YouthAgainstAgnipath", "#AkhileshYadavWithYouth"],
            "talking_points": [
                f"1. '{claim_short}'—4 साल की सेवा के बाद 75% अग्निवीरों को बिना पेंशन और बिना ग्रेच्युटी के बाहर कर दिया जाएगा।",
                "2. देश की सीमा सुरक्षा से कोई समझौता नहीं हो सकता; सेना को पेशेवर और स्थायी सैनिकों की जरूरत है।",
                "3. यूपी और पूर्वांचल-बुंदेलखंड के लाखों नौजवानों के सेना में जाने के सपनों को एक झटके में चकनाचूर कर दिया।"
            ],
            "official_data_citations": [
                {"metric": "सेना भर्ती नीति", "sp_value": "नियमित स्थायी भर्ती व पूर्ण पेंशन", "bjp_value": "4 साल की संविदा नौकरी (अग्निवीर)", "source": "Ministry of Defence Debates"},
                {"metric": "सैनिक सम्मान निधि", "sp_value": "सपा शासन में शहीदों के परिवार को ₹50 लाख", "bjp_value": "अग्निवीर शहीदों को पूर्व सैनिक का दर्जा नहीं", "source": "UP Sainik Kalyan"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'क्या देश की सीमाओं की सुरक्षा 4 साल के ठेके पर कराई जा सकती है? 22 साल की उम्र में रिटायर युवा क्या करेगा?'"
        }

    # 6. FERTILIZER DAP & MSP
    if vector == "FARMERS_FERTILIZER_MSP":
        return {
            "vector_label": "खाद की बोरी में चोरी, डीएपी किल्लत व एमएसपी",
            "artwork_file": "stray_cattle_farmer.jpg",
            "artwork_url": "/assets/cartoons/stray_cattle_farmer.jpg",
            "cdr_headline_hi": "खाद की बोरी में चोरी क्यों?",
            "headline_hi": f"खाद की बोरी से 5 किलो की चोरी, अन्नदाता पर तिहरी मार: डीएपी की किल्लत और ब्लैक मार्केटिंग पर भाजपा मौन!",
            "sub_headline_hi": "सोसाइटियों पर लाठियां खाते किसान, यूरिया-डीएपी की कालाबाजारी • कानूनी एमएसपी गारंटी PDA का वादा",
            "body_hi": f"किसान कड़ाके की धूप और ठंड में खाद की एक बोरी के लिए रात भर सोसाइटियों के बाहर लाइन लगाने को मजबूर है। '{claim_short}' से हर किसान परेशान है। खाद की बोरी 50 किलो से घटाकर 45 किलो और फिर 40 किलो कर दी गई लेकिन दाम वही रहे। गन्ने का भुगतान महीनों लटका रहता है। अखिलेश यादव सरकार ने किसानों को मुफ्त सिंचाई और समय पर बीज-खाद उपलब्ध कराई थी। 2027 में किसान विरोधी ताकतों का सूपड़ा साफ होगा।",
            "call_to_action_hi": "खाद की लूट बंद करो, MSP गारंटी दो • किसान शक्ति 2027!",
            "hashtags": ["#KisanVirodhiBJP", "#DAP_KhatKiKillat", "#KanooniMSP", "#AnnadataMangeyHaq"],
            "talking_points": [
                f"1. '{claim_short}'—डीएपी और यूरिया खाद की बोरी का वजन चुपके से 5-5 किलो घटाकर किसानों की जेब से हजारों करोड़ की लूट की गई।",
                "2. बुवाई के पीक सीजन में खाद की भारी किल्लत और प्राइवेट दुकानों पर दोगुने दामों में कालाबाजारी जारी है।",
                "3. समाजवादी पार्टी स्वामीनाथन आयोग की सिफारिशों के अनुसार किसानों को कानूनी एमएसपी गारंटी देने के पक्ष में है।"
            ],
            "official_data_citations": [
                {"metric": "खाद बोरी वजन", "sp_value": "50 किलो पूर्ण वजन", "bjp_value": "घटाकर 45/40 किलो (छिपी हुई लूट)", "source": "Fertilizer Ministry"},
                {"metric": "मुफ्त सिंचाई सुविधा", "sp_value": "नहरों व नलकूपों से मुफ्त पानी", "bjp_value": "बिजली दरों में भारी बढ़ोतरी", "source": "UP Irrigation Dept"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'खाद की बोरी से 5 किलो वजन कम करके देश के अन्नदाता के साथ यह धोखाधड़ी क्यों की गई?'"
        }

    # 7. WOMEN SAFETY & 1090
    if vector == "WOMEN_SAFETY":
        return {
            "vector_label": "महिला सुरक्षा, 1090 सेवा व अपराध का सच",
            "artwork_file": "constitution_pda.jpg",
            "artwork_url": "/assets/cartoons/constitution_pda.jpg",
            "cdr_headline_hi": "आधी आबादी मांगे सुरक्षा!",
            "headline_hi": f"महिला सुरक्षा के झूठे दावों की खुली पोल: आधी आबादी मांगे सुरक्षा, 1090 सेवा को बर्बाद किया!",
            "sub_headline_hi": "NCRB रिपोर्ट में महिलाओं के खिलाफ अपराध में यूपी नंबर 1 • हाथरस और उन्नाव का दर्द भूली नहीं जनता",
            "body_hi": f"अखिलेश यादव सरकार ने उत्तर प्रदेश की बेटियों और बहनों की सुरक्षा के लिए आधुनिक '1090 वूमेन पावर लाइन' और '181 आशा ज्योति केंद्र' की स्थापना की थी। '{claim_short}' का दावा पूरी तरह झूठा है। भाजपा सरकार के राज में एनसीआरबी के आंकड़ों के मुताबिक महिलाओं के खिलाफ अपराधों में उत्तर प्रदेश शीर्ष पर पहुंच चुका है। हाथरस कांड में रात 2 बजे पीड़िता का अंतिम संस्कार कराने वाली असंवेदनशील सरकार के दावे खोखले हैं।",
            "call_to_action_hi": "आधी आबादी को सम्मान व सुरक्षा • PDA 2027!",
            "hashtags": ["#WomenSafetyFirst", "#NCRB_CrimeReport", "#1090PowerLine", "#AdhiAbadiPurnaHaq"],
            "talking_points": [
                f"1. '{claim_short}'—NCRB 2023 की आधिकारिक रिपोर्ट में महिलाओं के खिलाफ अपराध और दलित महिलाओं पर अत्याचार में यूपी पहले स्थान पर है।",
                "2. 1090 वूमेन पावर लाइन को तकनीकी रूप से अपग्रेड करने के बजाय कमजोर कर दिया गया।",
                "3. आधी आबादी (महिलाएं) आज घर से बाहर निकलते समय असुरक्षा और भय के माहौल में जीने को विवश हैं।"
            ],
            "official_data_citations": [
                {"metric": "महिलाओं के विरुद्ध अपराध", "sp_value": "1090 आधुनिक क्विक रिस्पॉन्स सेल", "bjp_value": "NCRB रिपोर्ट में 65,000+ मामले (नंबर 1)", "source": "NCRB 2023 Crime in India"},
                {"metric": "1090 हेल्पलाइन रिस्पॉन्स", "sp_value": "15 मिनट में महिला पुलिस सहायता", "bjp_value": "शिकायत दर्ज कराने में ही थानों के चक्कर", "source": "UP Police 1090 Cell"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'जब एनसीआरबी रिपोर्ट कह रही है कि यूपी में महिलाएं सबसे असुरक्षित हैं, तो किस मुंह से सुशासन का दावा करते हैं?'"
        }

    # 8. CORRUPTION & SCAMS
    if vector == "CORRUPTION_SCAMS":
        return {
            "vector_label": "स्मार्ट सिटी व जल जीवन मिशन भ्रष्टाचार",
            "artwork_file": "bulldozer_justice.jpg",
            "artwork_url": "/assets/cartoons/bulldozer_justice.jpg",
            "cdr_headline_hi": "जीरो टॉलरेंस या 40% कमीशन?",
            "headline_hi": f"जीरो टॉलरेंस का ढोल पीटने वाली सरकार में घोटालों की भरमार: स्मार्ट सिटी और जल जीवन मिशन में अरबों की लूट!",
            "sub_headline_hi": "कागजों में पाइपलाइन बिछी, टंकियां टूटीं, सड़कों को खोदकर छोड़ दिया • भ्रष्टाचार पर पर्दा डालने का खेल",
            "body_hi": f"भाजपा सरकार के 'जीरो टॉलरेंस' के दावे केवल जुमले हैं। जल जीवन मिशन में घटिया पाइपलाइन बिछाकर अरबों रुपये के टेंडर कमीशन की भेंट चढ़ा दिए गए। '{claim_short}' से जनता भली-भांति वाकिफ है। स्मार्ट सिटी के नाम पर सैकड़ों करोड़ रुपये खर्च हुए लेकिन पहली ही बारिश में प्रदेश के महानगर तालाब बन गए। जनता के टैक्स के पैसे से चहेते ठेकेदारों और दलालों की जेबें भरी जा रही हैं।",
            "call_to_action_hi": "कमीशन राज खत्म करो • 2027 में पारदर्शी विकास आएगा!",
            "hashtags": ["#ZeroTolerance_Exposed", "#JalJeevanScam", "#SmartCityGhotala", "#CommissionRaj"],
            "talking_points": [
                f"1. '{claim_short}'—जल जीवन मिशन में घटिया सामग्री का इस्तेमाल हुआ, गांवों में पानी की टंकियां उद्घाटन से पहले ही फट गईं।",
                "2. स्मार्ट सिटी प्रोजेक्ट्स में अरबों खर्च के बाद भी शहरों में जलभराव, टूटी सड़कें और सीवर का जाम जस का तस है।",
                "3. भ्रष्टाचार के मामलों में केवल छोटे कर्मचारियों पर कार्रवाई होती है, जबकि बड़े घोटालों के सूत्रधारों को संरक्षण दिया जाता है।"
            ],
            "official_data_citations": [
                {"metric": "जल जीवन मिशन जांच", "sp_value": "पारदर्शी गुणवत्ता नियंत्रण", "bjp_value": "CAG रिपोर्ट में वित्तीय अनियमितताएं", "source": "CAG Report UP"},
                {"metric": "स्मार्ट सिटी जलभराव", "sp_value": "गोमती रिवरफ्रंट व आधुनिक ड्रेनेज", "bjp_value": "स्मार्ट सिटी में तैरती नावें व गाड़ियां", "source": "Urban Development Dept"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'स्मार्ट सिटी के नाम पर हजारों करोड़ खर्च होने के बाद भी प्रदेश के महानगर पहली बारिश में क्यों डूब जाते हैं?'"
        }

    # 9. TRADERS & GST RAIDS
    if vector == "BUSINESS_TRADERS":
        return {
            "vector_label": "जीएसटी छापेमारी व व्यापारी उत्पीड़न",
            "artwork_file": "inflation_mehngai.jpg",
            "artwork_url": "/assets/cartoons/inflation_mehngai.jpg",
            "cdr_headline_hi": "व्यापारी का उत्पीड़न बंद करो!",
            "headline_hi": f"जीएसटी छापेमारी और सर्वे के नाम पर व्यापारियों का उत्पीड़न: छोटे कारोबार चौपट, इंस्पेक्टर राज की वापसी!",
            "sub_headline_hi": "दुकानदारों में खौफ का माहौल, कागजी प्रक्रियाओं में उलझा व्यापार • व्यापारी हितों की रक्षक समाजवादी पार्टी",
            "body_hi": f"उत्तर प्रदेश का छोटा व्यापारी, दुकानदार और उद्यमी आज जीएसटी छापेमारी और सर्वे के नाम पर भय के साए में जीने को मजबूर है। इंस्पेक्टर राज की वापसी से बाजारों में खौफ है। '{claim_short}' की पीड़ा व्यापारी वर्ग झेल रहा है। ऑनलाइन शॉपिंग और बड़े घरानों को फायदा पहुंचाने के लिए पारंपरिक बाजारों को बर्बाद किया जा रहा है। नेताजी और अखिलेश यादव ने हमेशा व्यापारियों को सम्मान और सुरक्षा दी। 2027 में व्यापारी एकता भाजपा को सबक सिखाएगी।",
            "call_to_action_hi": "व्यापारी उत्पीड़न बंद करो • 2027 में सम्मान और सुरक्षा!",
            "hashtags": ["#VyapariSuraksha", "#GSTRaidAtank", "#StopInspectorRaj", "#SamajwadiWithTraders"],
            "talking_points": [
                f"1. '{claim_short}'—जीएसटी सर्वे और छापेमारी के नाम पर छोटे दुकानदारों से अवैध वसूली और उत्पीड़न किया जा रहा है।",
                "2. जटिल टैक्स प्रक्रियाओं और भारी जुर्माने के कारण हजारों सूक्ष्म व लघु उद्योग बंद होने की कगार पर हैं।",
                "3. समाजवादी सरकार ने हमेशा 'व्यापारी सुरक्षा प्रकोष्ठ' बनाकर व्यापारियों के स्वाभिमान की रक्षा की थी।"
            ],
            "official_data_citations": [
                {"metric": "व्यापार सुगमता (Ease of Business)", "sp_value": "सिंगल विंडो क्लीयरेंस व सुरक्षा", "bjp_value": "जीएसटी छापों से बाजारों में शटर बंद", "source": "UP Vyapar Mandal"},
                {"metric": "मंडी शुल्क राहत", "sp_value": "किसानों-व्यापारियों को प्रोत्साहन", "bjp_value": "अतिरिक्त उपकर और टैक्स का बोझ", "source": "UP Mandi Parishad"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से पूछें: 'जब बड़े कॉर्पोरेट मित्रों के लाखों करोड़ के कर्ज माफ हो सकते हैं, तो छोटे दुकानदारों पर छापों का आतंक क्यों?'"
        }

    # 10. PAPER LEAK & YOUTH
    if vector == "PAPER_LEAK":
        return {
            "vector_label": "पेपर लीक, युवा आक्रोश व बेरोजगारी का मुद्दा",
            "artwork_file": "youth_paper_leak.jpg",
            "artwork_url": "/assets/cartoons/youth_paper_leak.jpg",
            "cdr_headline_hi": "60 लाख युवाओं का हिसाब दो!",
            "headline_hi": f"60 लाख नौजवानों का भविष्य बर्बाद: पेपर लीक का हिसाब 2027 में होगा!",
            "sub_headline_hi": "पुलिस भर्ती व RO/ARO रद्द, लाठीचार्ज और बेरोजगारी पर भाजपा मौन • PDA युवा शक्ति मांगे रोजगार",
            "body_hi": f"उत्तर प्रदेश में भाजपा राज में 10 से अधिक महत्वपूर्ण प्रतियोगी परीक्षाओं के पेपर लीक हुए। '{claim_short}' का दावा करने वाली सरकार में 60 लाख से अधिक छात्र सड़कों पर रोने को मजबूर हैं और अपने हक की आवाज उठाने पर पुलिस की लाठियां झेल रहे हैं। अखिलेश यादव सरकार ने पुलिस एवं शिक्षा में रिकॉर्ड पारदर्शी भर्तियां की थीं और 18 लाख मेधावियों को लैपटॉप दिए थे। 2027 में युवा शक्ति इस तानाशाही का अंत करेगी।",
            "call_to_action_hi": "रोजी-रोटी और रोजगार पर बात करो • PDA युवा 2027 में हिसाब लेगा!",
            "hashtags": ["#PaperLeakMuktUP", "#RozgarDo_DharmNahi", "#YouthPower2027", "#AkhileshYadavWithYouth", "#PDAYuvaMorcha"],
            "talking_points": [
                f"1. '{claim_short}'—60 लाख नौजवानों की यूपी पुलिस सिपाही भर्ती परीक्षा परीक्षा से चंद घंटे पहले लीक हुई। यह प्रशासनिक अपराध है।",
                "2. युवा जब लखनऊ और प्रयागराज में शांतिपूर्ण प्रदर्शन करते हैं, तो उन पर बर्बर लाठीचार्ज कराया जाता है।",
                "3. समाजवादी सरकार ने पारदर्शी प्रक्रिया से बिना किसी पेपर लीक के लाखों नौकरियां दी थीं और लैपटॉप बांटे थे।"
            ],
            "official_data_citations": [
                {"metric": "UP पुलिस सिपाही भर्ती परीक्षा", "sp_value": "पारदर्शी भर्ती एवं सम्मान", "bjp_value": "पेपर लीक रद्द (60 लाख छात्र प्रभावित)", "source": "UPPRPB 2024"},
                {"metric": "युवाओं को मुफ्त लैपटॉप वितरण", "sp_value": "18.2 लाख मेधावी छात्र लाभान्वित", "bjp_value": "शून्य लैपटॉप (योजना बंद कर दी)", "source": "UP Madhyamik Shiksha"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से सीधे पूछें: '60 लाख अभ्यर्थियों के परीक्षा फॉर्म फीस के 1,000 करोड़ रुपये कहां गए और दोषी पेपर माफिया पर अब तक क्या कार्रवाई हुई?'"
        }

    # 11. CONSTITUTION, CASTE CENSUS & PDA
    if vector == "CONSTITUTION_PDA":
        return {
            "vector_label": "संविधान रक्षा, आरक्षण व जाति जनगणना का संकल्प",
            "artwork_file": "constitution_pda.jpg",
            "artwork_url": "/assets/cartoons/constitution_pda.jpg",
            "cdr_headline_hi": "संविधान हमारा स्वाभिमान!",
            "headline_hi": f"जिसकी जितनी संख्या भारी, उसकी उतनी हिस्सेदारी: जाति जनगणना राष्ट्र निर्माण का आधार है!",
            "sub_headline_hi": "बाबासाहेब डॉ. आंबेडकर व डॉ. लोहिया का सामाजिक न्याय ही PDA की आत्मा है",
            "body_hi": f"जाति जनगणना समाज को बांटने के लिए नहीं, बल्कि 90% पिछड़े, दलित, आदिवासी और अल्पसंख्यकों के हक और विकास की सटीक नीतियां बनाने के लिए अनिवार्य है। '{claim_short}' का दुष्प्रचार करने वाली भाजपा को इंसानों की गिनती से डर क्यों लगता है? संविधान के अनुच्छेद 15 और 16 की रक्षा के लिए PDA चट्टान की तरह खड़ा है।",
            "call_to_action_hi": "PDA जीतेगा, सामाजिक न्याय आएगा • 2027 में 202+ सीटें!",
            "hashtags": ["#PDA_SocialJustice", "#JaatiJangananaZarooriHai", "#SamvidhanRaksha", "#LohiaAmbedkarVichar", "#AkhileshYadav2027"],
            "talking_points": [
                f"1. '{claim_short}'—जाति जनगणना विकास का एक्सरे है। जब तक बीमारी का सटीक पता नहीं चलेगा, इलाज कैसे होगा?",
                "2. 69,000 शिक्षक भर्ती में पिछड़ों और दलितों के आरक्षण पर डाका डाला गया—हाईकोर्ट के फैसले ने भाजपा सरकार के आरक्षण-विरोधी चेहरे को बेनकाब किया।",
                "3. PDA (पिछड़ा, दलित, अल्पसंख्यक) केवल चुनावी गठबंधन नहीं, बल्कि सामाजिक गैर-बराबरी को मिटाने का जन-आंदोलन है।"
            ],
            "official_data_citations": [
                {"metric": "69000 शिक्षक भर्ती आरक्षण घोटाला", "sp_value": "PDA छात्रों के हक में सड़क पर संघर्ष", "bjp_value": "इलाहाबाद HC द्वारा सूची रद्द", "source": "Allahabad HC Order 2024"},
                {"metric": "संसद में प्रतिनिधित्व मांग", "sp_value": "जातिगत जनगणना कानून अनिवार्य", "bjp_value": "गणना कराने से इंकार", "source": "Parliamentary Debates 2024"}
            ],
            "spokesperson_caution": "अति-पिछड़ी जातियों (निषाद, कश्यप, बिंद, राजभर, मौर्य, शाक्य) के संवैधानिक अधिकारों और सरकारी नौकरियों में प्रतिनिधित्व की बात पर जोर दें।"
        }

    # 12. INFLATION & LPG CYLINDER
    if vector == "INFLATION_MEHNGAI":
        return {
            "vector_label": "महंगाई की मार, ₹1100 का रसोई गैस सिलेंडर व लूट",
            "artwork_file": "inflation_mehngai.jpg",
            "artwork_url": "/assets/cartoons/inflation_mehngai.jpg",
            "cdr_headline_hi": "रसोई गैस ₹1100 क्यों?",
            "headline_hi": f"रसोई गैस ₹1100, दाल-रोटी महंगी: आम जनता की जेब खाली, कॉर्पोरेट मित्रों की तिजोरी भरी!",
            "sub_headline_hi": "महंगाई पर चुप्पी साधने वाली सरकार को जनता का सीधा सवाल • जवाब दो भाजपा",
            "body_hi": f"2014 में ₹400 का मिलने वाला रसोई गैस सिलेंडर आज ₹1100 पार कर चुका है। '{claim_short}' बोलकर जनता को बरगलाना बंद करे सरकार। आटा, दाल, दूध, सरसों का तेल और बच्चों की पढ़ाई तक टैक्स के बोझ तले दब चुकी है। आम गरीब, किसान और माताएं-बहनें घर का बजट संभालने में लाचार हैं, जबकि सरकार चंद अरबपतियों के 16 लाख करोड़ रुपये के कर्ज माफ कर रही है।",
            "call_to_action_hi": "महंगाई से मुक्ति चाहिए • 2027 में समाजवादी सरकार लाइए!",
            "hashtags": ["#MehngaiMuktBharat", "#LPG1100Kyu", "#GharKaBudgetBigada", "#SamajwadiLadhai", "#AmAdmiKiAwaz"],
            "talking_points": [
                f"1. '{claim_short}'—घरेलू गैस सिलेंडर 400 से बढ़कर 1100 रुपये पार हो गया, उज्ज्वला के सिलेंडर आज गांवों में खाली पड़े हैं।",
                "2. खाद्य तेल, आटा, दाल पर टैक्स लगाकर गरीब की थाली से निवाला छीना गया है।",
                "3. समाजवादी सरकार ने समाजवादी पेंशन और राशन वितरण से 55 लाख कमजोर परिवारों को वास्तविक सुरक्षा दी थी।"
            ],
            "official_data_citations": [
                {"metric": "घरेलू गैस सिलेंडर दर", "sp_value": "₹410 (सपा शासन)", "bjp_value": "₹1100+ (असहनीय बोझ)", "source": "Ministry of Petroleum"},
                {"metric": "समाजवादी पेंशन योजना", "sp_value": "55 लाख गरीब परिवारों को सीधी मदद", "bjp_value": "योजना बंद कर दी गई", "source": "UP Social Welfare"}
            ],
            "spokesperson_caution": "भाजपा को केवल एक सवाल पूछें: '2014 में 400 के सिलेंडर पर छाती पीटने वाले आज 1100 के सिलेंडर पर मौन क्यों हैं?'"
        }

    # 13. STRAY CATTLE & FARMERS
    if vector == "STRAY_CATTLE_FARMER":
        return {
            "vector_label": "आवारा पशु, सांड का आतंक व किसान संकट",
            "artwork_file": "stray_cattle_farmer.jpg",
            "artwork_url": "/assets/cartoons/stray_cattle_farmer.jpg",
            "cdr_headline_hi": "अन्नदाता मांगे न्याय!",
            "headline_hi": f"खेत बर्बाद, किसान लाचार: रात-रात भर जागने वाला अन्नदाता मांगे न्याय!",
            "sub_headline_hi": "सांडों के आतंक और कागजी गौशालाओं से त्रस्त यूपी का किसान • 2027 में होगा पूरा हिसाब",
            "body_hi": f"उत्तर प्रदेश के 75 जिलों में लाखों आवारा पशु और सांड किसानों की खून-पसीने से सींची फसलें बर्बाद कर रहे हैं। '{claim_short}' का दावा करने वाले कभी रात में खेतों में जाकर देखें। किसान कड़ाके की ठंड और बरसात में रात भर लाठी और लालटेन लेकर रखवाली करने को मजबूर हैं। कागजी गौशालाओं के नाम पर करोड़ों रुपये का भ्रष्टाचार हुआ। सड़क हादसों में सैकड़ों निर्दोषों की जान जा चुकी है।",
            "call_to_action_hi": "किसान बचेगा तो देश बचेगा • 2027 में सांडों के आतंक से मुक्ति!",
            "hashtags": ["#KisanBachao", "#SandMuktiAbhiyan", "#AnnadataMangeyHaq", "#KhetKisanSamajwadi", "#GauShalaGhotala"],
            "talking_points": [
                f"1. '{claim_short}'—आवारा पशुओं के कारण हर गांव में किसान रात भर खेतों में जागने को विवश हैं, फसलें तबाह हो रही हैं।",
                "2. गौशालाओं के नाम पर सरकारी बजट की लूट हुई, सड़कों पर सांडों के हमलों में रोजाना जानें जा रही हैं।",
                "3. समाजवादी पार्टी किसानों को कानूनी एमएसपी गारंटी और आवारा पशु समस्या का स्थाई वैज्ञानिक समाधान देगी।"
            ],
            "official_data_citations": [
                {"metric": "गौशाला बजट खर्च (2017-24)", "sp_value": "सीधे किसान राहत व सिंचाई", "bjp_value": "₹2,000+ करोड़ खर्च पर सांड सड़कों पर", "source": "UP Animal Husbandry"},
                {"metric": "मुफ्त सिंचाई सुविधा", "sp_value": "नहरों व नलकूपों से मुफ्त पानी", "bjp_value": "बिजली दरों में भारी बढ़ोतरी", "source": "UP Irrigation Dept"}
            ],
            "spokesperson_caution": "भाजपा को चुनौती दें कि किसी भी एक गांव में जाकर किसानों से सांडों के आतंक और फसल नुकसान पर सीधे बात करके दिखाएं।"
        }

    # 14. DEVELOPMENT & EXPRESSWAYS
    if vector == "DEVELOPMENT_EXPRESSWAY":
        return {
            "vector_label": "विश्वस्तरीय एक्सप्रेसवे व मेट्रो विकास बनाम जुमले",
            "artwork_file": "expressway_vikas.jpg",
            "artwork_url": "/assets/cartoons/expressway_vikas.jpg",
            "cdr_headline_hi": "काम बोलता है!",
            "headline_hi": f"22 महीने में सुखोई लड़ाकू विमान उतारने वाला एक्सप्रेसवे बनाया • भाजपा ने केवल फीते काटे!",
            "sub_headline_hi": "लखनऊ-आगरा एक्सप्रेसवे, लखनऊ मेट्रो, मेदांता अस्पताल, कैंसर संस्थान: विकास की असली परिभाषा",
            "body_hi": f"अखिलेश यादव जी ने 302 किमी लंबा आगरा-लखनऊ एक्सप्रेसवे रिकॉर्ड 22 महीनों में बनाकर विश्व कीर्तिमान स्थापित किया, जिस पर वायुसेना के मिराज और सुखोई उतरे। '{claim_short}' का आरोप लगाने वाले अपने 8 साल का एक भी ऐसा काम नहीं गिना सकते। लखनऊ मेट्रो, गोमती रिवरफ्रंट, लोहिया आयुर्विज्ञान संस्थान और मेदांता अस्पताल सपा की देन हैं।",
            "call_to_action_hi": "काम बोलता है • 2027 में प्रगतिशील समाजवाद लौटेगा!",
            "hashtags": ["#KaamBoltaHai", "#AgraLucknowExpressway", "#VikasKiRaftaar", "#AkhileshYadavVision"],
            "talking_points": [
                f"1. '{claim_short}'—आगरा-लखनऊ एक्सप्रेसवे भारत का पहला एक्सप्रेसवे है जिस पर देश की सुरक्षा के लिए लड़ाकू विमान उतारे गए।",
                "2. लखनऊ मेट्रो, कानपुर मेट्रो की डीपीआर और पूर्वांचल एक्सप्रेसवे का अलाइनमेंट समाजवादी सरकार में तैयार हुआ।",
                "3. भाजपा के 'डबल इंजन' ने यूपी को 5 लाख करोड़ का कर्ज, आवारा पशुओं का आतंक और नौजवानों को बेरोजगारी के सिवा कुछ नहीं दिया।"
            ],
            "official_data_citations": [
                {"metric": "एक्सप्रेसवे निर्माण समय", "sp_value": "302 किमी (22 महीने में पूर्ण)", "bjp_value": "बुंदेलखंड एक्सप्रेसवे (उद्घाटन के 5 दिन बाद धंसा)", "source": "UPEIDA Official"},
                {"metric": "स्वास्थ्य अधोसंरचना", "sp_value": "मेदांता + कैंसर इंस्टिट्यूट + लोहिया", "bjp_value": "जिला अस्पतालों में डॉक्टरों का घोर अभाव", "source": "UP Health Dept 2024"}
            ],
            "spokesperson_caution": "भाजपा को केवल एक सवाल पूछें: 'अपने 8 साल के कार्यकाल में कोई एक ऐसा प्रोजेक्ट बताएं जो जमीन से शुरू होकर समय पर पूरा हुआ हो?'"
        }

    # 15. RELIGIOUS COMMUNAL & SANATAN
    if vector == "RELIGIOUS_COMMUNAL":
        return {
            "vector_label": "सांप्रदायिक ध्रुवीकरण व तुष्टिकरण का झूठा आरोप",
            "artwork_file": "ram_sabke_harmony.jpg",
            "artwork_url": "/assets/cartoons/ram_sabke_harmony.jpg",
            "cdr_headline_hi": "प्रभु राम सबके हैं!",
            "headline_hi": f"सच्चा सनातनी वही जो सबका सम्मान करे: प्रभु राम सबके हैं, नफरत किसी की नहीं!",
            "sub_headline_hi": "धर्म आस्था का विषय है, चुनावी व्यापार का नहीं • सर्वधर्म समभाव ही असली राष्ट्रवाद",
            "body_hi": f"अखिलेश यादव सरकार ने सैफई में भव्य भगवान हनुमान की 54 फीट की प्रतिमा स्थापित की, भगवान परशुराम जी का भव्य धाम बनवाया और महर्षि वाल्मीकि, संत रविदास जी की जयंती पर सम्मान दिया। '{claim_short}' का झूठा आरोप लगाकर भाजपा जब भी पेपर लीक, महंगाई और बेरोजगारी पर घिरती है, तो धर्म की आड़ लेती है। हमारा धर्म 'वसुधैव कुटुम्बकम्' और संविधान की रक्षा है।",
            "call_to_action_hi": "रोजी-रोटी, अस्पताल और शिक्षा पर बात करो • PDA 2027 में हिसाब लेगा!",
            "hashtags": ["#PDA_Ekta", "#SamajwadiKaam", "#RozgarDo_DharmNahi", "#AkhileshYadav2027", "#VasudhaivaKutumbakam"],
            "talking_points": [
                f"1. '{claim_short}'—प्रभु श्री राम जन-जन के आराध्य हैं, किसी एक राजनीतिक दल के चुनावी एजेंट नहीं। राम सबके हैं, शबरी के भी और निषादराज के भी।",
                "2. 60 लाख नौजवानों के पेपर लीक हुए, 2 करोड़ युवा बेरोजगार हैं—भाजपा के पास इसका कोई जवाब नहीं, इसलिए वह सांप्रदायिक ध्रुवीकरण करती है।",
                "3. नेताजी और अखिलेश यादव ने हमेशा संतों और सर्वसमाज का सम्मान किया। हमारा राष्ट्रवाद तिरंगे और संविधान से बंधा है।"
            ],
            "official_data_citations": [
                {"metric": "UP पुलिस सिपाही भर्ती परीक्षा", "sp_value": "पारदर्शी भर्ती", "bjp_value": "पेपर लीक रद्द (60 लाख प्रभावित)", "source": "UPPRPB Official 2024"},
                {"metric": "अयोध्या 2024 लोकसभा परिणाम", "sp_value": "अवधेश प्रसाद (विजेता - 54,567 वोट)", "bjp_value": "पराजित (जनता का जनादेश)", "source": "ECI Form 20"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता को किसी भी धार्मिक ग्रंथ या देवता पर उलझने न दें; तुरंत पलटकर पूछें कि 'अयोध्या के किसानों की जमीन के मुआवजे और पेपर लीक पर आपकी क्या नीति है?'"
        }

    # 16. BULLDOZER & LAW & ORDER
    if vector == "BULLDOZER_INJUSTICE":
        return {
            "vector_label": "बुलडोजर न्याय बनाम संविधान व सुप्रीम कोर्ट का फैसला",
            "artwork_file": "bulldozer_justice.jpg",
            "artwork_url": "/assets/cartoons/bulldozer_justice.jpg",
            "cdr_headline_hi": "संविधान के आगे झुका बुलडोजर!",
            "headline_hi": f"संविधान के आगे झुका बुलडोजर: सुप्रीम कोर्ट का फैसला, कानून का राज ही अंतिम सच!",
            "sub_headline_hi": "तानाशाही और गैर-संवैधानिक ध्वस्तीकरण पर संवैधानिक प्रहार • न्याय और समानता की जीत",
            "body_hi": f"सुप्रीम कोर्ट ने ऐतिहासिक फैसला सुनाते हुए बुलडोजर कार्रवाई को असंवैधानिक और कानून के शासन पर सीधा हमला करार दिया है। '{claim_short}' का दावा करने वाले समझ लें कि किसी के आरोप मात्र पर घर गिरा देना न्याय नहीं, बल्कि तानाशाही और बदला लेने की राजनीति है। कानून की अदालतें फैसला करती हैं, सरकार या बुलडोजर नहीं। बाबासाहेब का संविधान हर नागरिक को निष्पक्ष सुनवाई का अधिकार देता है।",
            "call_to_action_hi": "देश संविधान से चलेगा, बुलडोजर से नहीं • न्याय की जीत!",
            "hashtags": ["#SupremeCourtJudgment", "#BulldozerRajExposed", "#RuleOfLaw", "#SamvidhanZindabad", "#AkhileshYadavStandsWithJustice"],
            "talking_points": [
                f"1. '{claim_short}'—सुप्रीम कोर्ट ने स्पष्ट कहा कि कार्यपालिका जज नहीं बन सकती; किसी का घर गिराना मनमाना और असंवैधानिक है।",
                "2. चुनिंदा और जातिवादी आधार पर बुलडोजर चलाकर भय का माहौल बनाया गया।",
                "3. देश बुलडोजर से नहीं, संविधान और कानून के शासन से चलेगा।"
            ],
            "official_data_citations": [
                {"metric": "सुप्रीम कोर्ट निर्देश (2024)", "sp_value": "संवैधानिक मर्यादा व प्रक्रिया की जीत", "bjp_value": "बुलडोजर कार्रवाई पर देशव्यापी रोक व फटकार", "source": "Supreme Court of India"},
                {"metric": "UP-100 आधुनिक पुलिसिंग", "sp_value": "3,200 GPS पुलिस गाड़ियां (15 मिनट रिस्पॉन्स)", "bjp_value": "केवल नाम बदलकर 112 किया", "source": "UP Police Tech Cell"}
            ],
            "spokesperson_caution": "भाजपा के 'बुलडोजर' जुमले पर तुरंत सुप्रीम कोर्ट की बुलडोजर न्याय पर कड़ी फटकार और संविधान के उल्लंघन का हवाला दें।"
        }

    # 17. SP 2027 RALLY & WAVE
    if vector == "SP_2027_RALLY":
        return {
            "vector_label": "मिशन 2027 विशाल विजय संकल्प व जन-आंदोलन",
            "artwork_file": "sp_2027_rally.jpg",
            "artwork_url": "/assets/cartoons/sp_2027_rally.jpg",
            "cdr_headline_hi": "युवा शक्ति, प्रदेश की प्रगति!",
            "headline_hi": f"युवा शक्ति, प्रदेश की प्रगति: 2027 में 202+ सीटों के साथ जन-क्रांति!",
            "sub_headline_hi": "अखिलेश यादव के नेतृत्व में पीडीए का विशाल जनादेश • प्रगतिशील यूपी की वापसी",
            "body_hi": f"2024 के लोकसभा चुनावों में उत्तर प्रदेश की जनता ने 37 सीटें देकर समाजवादी पार्टी को देश की तीसरी सबसे बड़ी राजनीतिक शक्ति बनाया है। '{claim_short}' की हताशा में डूबे विपक्ष को 2027 में 25 करोड़ जनता बेरोजगारी, महंगाई, पेपर लीक और सांडों के आतंक से मुक्ति के लिए अखिलेश यादव के नेतृत्व में ऐतिहासिक बहुमत (202+ सीटें) देने जा रही है। यह चुनाव सत्ता का नहीं, जनता के हक और संविधान की रक्षा का है।",
            "call_to_action_hi": "PDA जीतेगा, यूपी बढ़ेगा • 2027 में अखिलेश यादव सरकार!",
            "hashtags": ["#Mission2027", "#AkhileshYadavNextCM", "#PDA_Sarkar", "#HamarNeta", "#UPVidhanSabha2027"],
            "talking_points": [
                f"1. '{claim_short}'—2024 लोकसभा में यूपी की जनता ने भाजपा को नकार कर समाजवादी पार्टी को 37 सीटों का ऐतिहासिक जनादेश दिया।",
                "2. PDA (पिछड़ा, दलित, अल्पसंख्यक) और आधी आबादी एकजुट होकर 2027 में पूर्ण बहुमत की सरकार बनाएगी।",
                "3. किसान, नौजवान, शिक्षक और व्यापारी सभी अखिलेश यादव के विकासपरक और समावेशी विजन के साथ हैं।"
            ],
            "official_data_citations": [
                {"metric": "लोकसभा 2024 जनमत", "sp_value": "37 सांसद (देश की तीसरी बड़ी शक्ति)", "bjp_value": "33 सीटें (ऐतिहासिक गिरावट)", "source": "ECI 2024 Official"},
                {"metric": "लक्ष्य 2027 विधानसभा", "sp_value": "202+ सीटें (पूर्ण बहुमत की सरकार)", "bjp_value": "विपक्षी ध्रुवीकरण की विफलता", "source": "SP Strategic War Room"}
            ],
            "spokesperson_caution": "व्यक्तिगत पारिवारिक रिश्तों पर जाने के बजाय सीधे 2024 लोकसभा परिणाम (37 सीटें) और जन-समर्थन को जनता का सच्चा फैसला बताएं।"
        }

    # 18. UNIVERSAL DYNAMIC FALLBACK FOR ANY ARBITRARY CUSTOM MUDDA
    # Extracts the user's specific grievance and constructs a 100% real-time rebuttal
    words_topic = claim_clean.split()
    if len(words_topic) > 5:
        topic_summary = " ".join(words_topic[:5])
    else:
        topic_summary = claim_clean
    if len(topic_summary) > 34:
        topic_summary = topic_summary[:33].rsplit(' ', 1)[0]
    if not topic_summary:
        topic_summary = "जनता का ज्वलंत मुद्दा"
    return {
        "vector_label": f"जन-मुद्दा: {topic_summary}",
        "artwork_file": "sp_2027_rally.jpg",
        "artwork_url": "/assets/cartoons/sp_2027_rally.jpg",
        "cdr_headline_hi": f"{topic_summary} पर जवाब दो!",
        "headline_hi": f"{topic_summary}: दावों की खुली पोल, जनता त्रस्त, डबल इंजन सरकार मस्त!",
        "sub_headline_hi": "अखिलेश यादव जी के विकासपरक व जन-कल्याणकारी विजन के साथ खड़ा है उत्तर प्रदेश • 2027 में हिसाब होगा",
        "body_hi": f"उत्तर प्रदेश की जनता आज बुनियादी समस्याओं से त्रस्त है। '{claim_short}' का दर्द हर आम नागरिक, नौजवान और किसान महसूस कर रहा है। सरकार केवल झूठे प्रचार और जुमलों में व्यस्त है, जबकि धरातल पर जनता के काम ठप पड़े हैं। समाजवादी पार्टी लोहिया और आंबेडकर के सामाजिक न्याय के सिद्धांतों पर चलकर जनता के हक और सम्मान की लड़ाई सड़क से संसद तक लड़ रही है। 2027 में PDA की पूर्ण बहुमत सरकार ही इसका स्थायी समाधान निकालेगी।",
        "call_to_action_hi": f"{topic_summary} पर सच बोलो • 2027 में PDA सरकार लाओ!",
        "hashtags": ["#JanSamasyaUP", "#SamajwadiLadhai", "#PDA2027", "#JawabDoBJP", "#AkhileshYadavStandsWithPeople"],
        "talking_points": [
            f"1. '{claim_short}'—यह केवल एक बयान नहीं, बल्कि प्रदेश की 25 करोड़ जनता के दैनिक संघर्ष और हताशा की सच्ची तस्वीर है।",
            "2. डबल इंजन सरकार जनहित के वास्तविक मुद्दों पर बात करने से भागती है और ध्यान भटकाने के हथकंडे अपनाती है।",
            "3. समाजवादी पार्टी का ट्रैक रिकॉर्ड गवाह है कि जब भी मौका मिला, प्रदेश में बिना भेदभाव के रिकॉर्ड विकास और जन-कल्याण हुआ।"
        ],
        "official_data_citations": [
            {"metric": "जन-हितैषी नीतियां", "sp_value": "समाजवादी पेंशन, मुफ्त लैपटॉप व आधुनिक ढांचा", "bjp_value": "बजट कटौती व जन-मुद्दों की अनदेखी", "source": "UP Legislative Assembly Records"},
            {"metric": "जन-समर्थन 2024", "sp_value": "37 लोकसभा सीटें (179 विस में निर्णायक बढ़त)", "bjp_value": "33 सीटें (ऐतिहासिक जनादेश गिरावट)", "source": "ECI Official 2024"}
        ],
        "spokesperson_caution": f"विपक्षी प्रवक्ता से सीधा और कड़ा सवाल पूछें: 'जनता के बुनियादी मुद्दे ({topic_summary}) पर आपकी सरकार के पास क्या कोई ठोस जवाब है या सिर्फ खाली बयानबाजी?'"
    }

# ---------------------------------------------------------------------------
# CORELDRAW (CDR) & PHOTOSHOP HIGH-IMPACT POSTER COMPOSITOR
# ---------------------------------------------------------------------------
def generate_studio_poster_image(strategy: Dict[str, Any]) -> tuple[str, str]:
    """
    Renders high-resolution 1080x1080 CorelDraw (CDR) / Photoshop political poster.
    Keeps the satirical political cartoon illustration 100% visible, sharp and vibrant,
    adding professional 3D gold typography, header ribbon, and victory footer.
    """
    width, height = 1080, 1080
    artwork_file = strategy.get("artwork_file", "sp_2027_rally.jpg")
    art_path = STATIC_CARTOONS_DIR / artwork_file
    
    # Try public dir if static doesn't have it
    if not art_path.exists():
        art_path = BASE_DIR.parent / "frontend" / "public" / "assets" / "cartoons" / artwork_file

    if art_path.exists():
        im = Image.open(art_path).convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
    else:
        # Fallback rich studio gradient if file missing
        im = Image.new("RGB", (width, height), color=(15, 23, 42))
        draw_bg = ImageDraw.Draw(im)
        for y in range(height):
            alpha = y / float(height)
            r = int(127 * (1 - alpha) + 15 * alpha)
            g = int(29 * (1 - alpha) + 23 * alpha)
            b = int(29 * (1 - alpha) + 42 * alpha)
            draw_bg.line([(0, y), (width, y)], fill=(r, g, b))

    # Apply subtle darkening only in top 80px and bottom 140px for text contrast
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw_ov = ImageDraw.Draw(overlay)
    
    # Top header gradient (y: 0 to 90)
    for y in range(90):
        alpha = int(210 * (1 - y / 90.0))
        draw_ov.line([(0, y), (width, y)], fill=(127, 29, 29, alpha))
        
    # Bottom gradient (y: 860 to 1080)
    for y in range(860, height):
        alpha = int(230 * ((y - 860) / 220.0))
        draw_ov.line([(0, y), (width, y)], fill=(15, 23, 42, alpha))
        
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(im)

    # Load Devanagari Hindi font
    font_bold = get_safe_hindi_font(34, bold=True)
    font_sub = get_safe_hindi_font(20, bold=False)
    font_tag = get_safe_hindi_font(18, bold=True)
    font_meta = get_safe_hindi_font(15, bold=False)

    # 1. Top Ribbon: Red & Gold CorelDraw Banner (y: 0 to 60)
    draw.rectangle([(0, 0), (width, 8)], fill="#fbbf24")
    draw.rectangle([(0, 8), (width, 58)], fill="#991b1b")
    draw.rectangle([(0, 58), (width, 62)], fill="#fbbf24")
    
    if font_tag:
        draw.text((30, 20), "★ SAMAJWADI WAR ROOM 2027 • POLITICAL CARTOON & CDR POSTER ★", fill="#ffffff", font=font_tag)
        draw.text((width - 240, 20), "★ 100% सत्यमेव जयते ★", fill="#fef08a", font=font_tag)

    # 2. Category Pill Badge (y: 72 to 108)
    draw.rounded_rectangle([(30, 72), (480, 108)], radius=8, fill="#7f1d1d", outline="#f87171", width=2)
    if font_meta:
        draw.text((45, 80), f"मुद्दे का पलटवार: {strategy['vector_label'][:45]}", fill="#fef08a", font=font_meta)

    # 3. Bottom 3D Typography (CorelDraw Extruded Slogan)
    headline_3d = strategy.get("cdr_headline_hi", strategy["headline_hi"][:40])
    h_y = 890
    
    # 3D Drop-Shadow
    if font_bold:
        for dx, dy in [(3, 3), (2, 2), (1, 1)]:
            draw.text((30 + dx, h_y + dy), headline_3d, fill="#000000", font=font_bold)
        # Front Golden Yellow Text
        draw.text((30, h_y), headline_3d, fill="#fde047", font=font_bold)

    # Subheadline Ribbon
    sub_text = strategy.get("sub_headline_hi", "")[:68]
    if font_sub:
        draw.text((32, 946), sub_text, fill="#e0f2fe", font=font_sub)

    # 4. Victory Strip (Green 4px & Red 65px at bottom)
    draw.rectangle([(0, 1005), (width, 1010)], fill="#16a34a")
    draw.rectangle([(0, 1010), (width, 1080)], fill="#dc2626")
    if font_tag:
        draw.text((30, 1030), "समाजवादी पार्टी • PDA (पिछड़ा, दलित, अल्पसंख्यक) परिवार", fill="#ffffff", font=font_tag)
    if font_meta:
        draw.text((width - 360, 1032), "सत्य • समानता • सामाजिक न्याय • मिशन 2027", fill="#fef08a", font=font_meta)

    buf = io.BytesIO()
    im.save(buf, format="PNG")
    buf.seek(0)
    b64 = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
    return b64, strategy.get("artwork_url", "/assets/cartoons/sp_2027_rally.jpg")

# ---------------------------------------------------------------------------
# API ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/preset-attacks")
def get_preset_attacks():
    """Returns the 15 major political attack & issue presets with cartoon artworks."""
    return {"status": "success", "presets": PRESET_ATTACKS}

@router.post("/generate-counter")
def generate_counter(payload: CounterCreativePayload):
    """
    Accepts opponent's attack claim or custom issue topic,
    identifies the political vector, selects the corresponding political cartoon artwork,
    renders a 1080x1080 CorelDraw (CDR) / Photoshop style poster,
    and synthesizes official talking points and data evidence.
    """
    claim = payload.opponent_claim.strip() if payload.opponent_claim else "विपक्षी दल द्वारा सामाजिक सौहार्द बिगाड़ने का प्रयास।"
    
    # 1. Detect Vector
    if not payload.target_vector or payload.target_vector == "AUTO_DETECT":
        vector = detect_attack_vector(claim)
    else:
        vector = payload.target_vector

    # 2. Get Strategy & Cartoon Artwork
    strategy = get_strategic_counter(vector, claim, payload.tone or "FACTUAL_DIGNIFIED")

    # 3. Render 1080p CorelDraw Studio Canvas
    square_b64, artwork_url = generate_studio_poster_image(strategy)

    return {
        "status": "success",
        "detected_vector": vector,
        "vector_label": strategy["vector_label"],
        "artwork_url": strategy["artwork_url"],
        "cdr_headline_hi": strategy.get("cdr_headline_hi", strategy["headline_hi"][:40]),
        "creative_assets": {
            "cdr_poster": {
                "title": "CorelDraw (CDR) Political Cartoon Poster",
                "format": "1:1 Square (1080x1080 HD Graphic Poster)",
                "image_base64": square_b64,
                "artwork_url": strategy["artwork_url"]
            },
            "square_1080": {
                "title": "Square 1080p HD Studio Poster",
                "format": "1:1 Square (Instagram / Facebook / WhatsApp DP)",
                "image_base64": square_b64,
                "ai_visual_url": strategy["artwork_url"]
            },
            "story_916": {
                "title": "9:16 Vertical Story",
                "format": "9:16 Vertical Story (WhatsApp Status / Reels)",
                "caption": strategy["sub_headline_hi"],
                "hook": strategy["headline_hi"],
                "ai_visual_url": strategy["artwork_url"]
            },
            "banner_169": {
                "title": "16:9 Twitter/X Press Card",
                "format": "16:9 Landscape (Twitter / X Header & Card)",
                "headline": strategy["headline_hi"],
                "subhead": strategy["sub_headline_hi"],
                "ai_visual_url": strategy["artwork_url"]
            }
        },
        "copywriting": {
            "headline_hi": strategy["headline_hi"],
            "sub_headline_hi": strategy["sub_headline_hi"],
            "body_hi": strategy["body_hi"],
            "call_to_action_hi": strategy["call_to_action_hi"],
            "hashtags": strategy["hashtags"]
        },
        "talking_points": strategy["talking_points"],
        "official_data_citations": strategy["official_data_citations"],
        "spokesperson_caution": strategy["spokesperson_caution"]
    }
