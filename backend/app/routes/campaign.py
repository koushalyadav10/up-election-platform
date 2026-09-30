# -*- coding: utf-8 -*-
"""
E:/eci/backend/app/routes/campaign.py
"Chitragupta 3.0" — Universal Political Cartoon & CorelDraw (CDR) Studio.
Applies the 360° Samajwadi Party Strategic Re-framing Playbook
(Lohia - Ambedkar - Mulayam - Akhilesh Doctrine).
Integrates High-Impact Political Satirical Cartoons, 3D CorelDraw Typography,
Dynamic Issue Intelligence, and Spokesperson TV Debate Briefs.
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
# PRESET ATTACK SCENARIOS & TOPICS (8 KEY POLARIZING ISSUES)
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
        "id": "pda_const_02",
        "vector": "CONSTITUTION_PDA",
        "label": "संविधान रक्षा व जाति जनगणना (Constitution & PDA Justice)",
        "claim": "जाति जनगणना और पीडीए की मांग समाज को बांटने और वैमनस्य फैलाने का षड्यंत्र है।",
        "description": "बाबासाहेब के संविधान, 69000 शिक्षक भर्ती आरक्षण और 90% आबादी के प्रतिनिधित्व की मांग।",
        "artwork_url": "/assets/cartoons/constitution_pda.jpg"
    },
    {
        "id": "mehngai_03",
        "vector": "INFLATION_MEHNGAI",
        "label": "महंगाई, रसोई गैस ₹1100 व घरेलू संकट (LPG Cylinder ₹1100 & Inflation)",
        "claim": "विपक्ष महंगाई का झूठा रोना रो रहा है, देश की अर्थव्यवस्था दुनिया में सबसे तेज भाग रही है।",
        "description": "रसोई गैस, दाल, तेल, दूध पर जीएसटी और आम जनता की खाली जेब का वास्तविक सच।",
        "artwork_url": "/assets/cartoons/inflation_mehngai.jpg"
    },
    {
        "id": "kisan_cattle_04",
        "vector": "STRAY_CATTLE_FARMER",
        "label": "सांड का आतंक, आवारा पशु व किसान संकट (Stray Cattle & Farm Distress)",
        "claim": "भाजपा सरकार ने गौ संरक्षण और किसानों के लिए ऐतिहासिक कल्याणकारी योजनाएं बनाई हैं।",
        "description": "खेतों को बर्बाद करते सांड, रात भर जागते किसान और कागजी गौशालाओं के भ्रष्टाचार की पोल।",
        "artwork_url": "/assets/cartoons/stray_cattle_farmer.jpg"
    },
    {
        "id": "dev_exp_05",
        "vector": "DEVELOPMENT_EXPRESSWAY",
        "label": "विश्वस्तरीय विकास बनाम जुमले (Agra-Lucknow Expressway & Metro)",
        "claim": "सपा सरकार केवल मुफ्त की रेवड़ियां बांटती थी, कोई वास्तविक ढांचागत विकास नहीं किया।",
        "description": "22 महीने में बने आगरा-लखनऊ एक्सप्रेसवे, लखनऊ मेट्रो और विश्वस्तरीय अस्पतालों का प्रमाण।",
        "artwork_url": "/assets/cartoons/expressway_vikas.jpg"
    },
    {
        "id": "rel_sanatan_06",
        "vector": "RELIGIOUS_COMMUNAL",
        "label": "तुष्टिकरण व सांप्रदायिक आरोप (Sanatan, Unity & Faith)",
        "claim": "सपा केवल एक वर्ग विशेष और तुष्टिकरण की राजनीति करती है, सनातन का विरोध करती है।",
        "description": "प्रभु राम जन-जन के आराध्य हैं, किसी दल की जागीर नहीं; अयोध्या जनादेश और सद्भाव का संदेश।",
        "artwork_url": "/assets/cartoons/ram_sabke_harmony.jpg"
    },
    {
        "id": "bulldozer_law_07",
        "vector": "BULLDOZER_INJUSTICE",
        "label": "बुलडोजर न्याय बनाम संविधान (Bulldozer Raj vs Supreme Court)",
        "claim": "बुलडोजर से त्वरित न्याय और कानून व्यवस्था स्थापित की गई है, माफिया थर्रा रहे हैं।",
        "description": "सुप्रीम कोर्ट का ऐतिहासिक फैसला: कार्यपालिका जज नहीं बन सकती, बुलडोजर गैर-कानूनी है।",
        "artwork_url": "/assets/cartoons/bulldozer_justice.jpg"
    },
    {
        "id": "rally_2027_08",
        "vector": "SP_2027_RALLY",
        "label": "मिशन 2027 विशाल विजय संकल्प (SP 2027 People's Wave & Rally)",
        "claim": "सपा की जमीन खिसक चुकी है, 2027 में विपक्ष का कोई भविष्य नहीं है।",
        "description": "37 लोकसभा सीटों की प्रचंड शक्ति, 2027 में 202+ सीटों का संकल्प और अखिलेश यादव का विजन।",
        "artwork_url": "/assets/cartoons/sp_2027_rally.jpg"
    }
]

# ---------------------------------------------------------------------------
# INTELLIGENT ATTACK VECTOR CLASSIFIER
# ---------------------------------------------------------------------------
def detect_attack_vector(claim_text: str) -> str:
    txt = claim_text.lower()
    
    # 1. Religious & Communal attacks / Appeasement / Sanatan / Muslim
    if any(k in txt for k in [
        "मुस्लिम", "तुष्टिकरण", "सनातन", "राम", "मंदिर", "मस्जिद", "दंगा", "दंगे", "हिंदू", "धर्म", "अयोध्या", "मजहब", "धार्मिक", "सांप्रदायिक",
        "muslim", "appeasement", "tushtikaran", "sanatan", "ram", "mandir", "masjid", "dharma", "hindu", "communal", 
        "dange", "dharm", "ayodhya", "religion", "namaz", "waqf", "वक्फ"
    ]):
        return "RELIGIOUS_COMMUNAL"

    # 2. Bulldozer & Law & Order & Mafia
    if any(k in txt for k in [
        "बुलडोजर", "माफिया", "अपराध", "एनकाउंटर", "हथकड़ी", "हाथरस", "सुप्रीम कोर्ट", "गुंडा", "कानून", "थाना", "कोर्ट",
        "supreme court", "bulldozer", "crime", "gunda", "kanoon", "court", "encounter", "law and order", "mafia"
    ]):
        return "BULLDOZER_INJUSTICE"

    # 3. Stray Cattle & Farmers distress
    if any(k in txt for k in [
        "सांड", "आवारा", "पशु", "गाय", "बैल", "किसान", "फसल", "एमएसपी", "गौशाला", "खेत", "खाद", "यूरिया", "अन्नदाता",
        "cattle", "bull", "kisan", "farmer", "gaushala", "khet", "stray", "crop", "msp", "sand"
    ]):
        return "STRAY_CATTLE_FARMER"

    # 4. Inflation & LPG cylinder & Household expense
    if any(k in txt for k in [
        "महंगाई", "सिलेंडर", "गैस", "दाल", "तेल", "पेट्रोल", "डीजल", "खर्चा", "राशन", "टैक्स", "जीएसटी", "1100", "बजट",
        "lpg", "price", "pocket", "mehngai", "kharcha", "cylinder", "ration", "petrol", "diesel", "inflation", "tax", "gst"
    ]):
        return "INFLATION_MEHNGAI"

    # 5. Paper leak & youth unemployment & exams
    if any(k in txt for k in [
        "पेपर", "लीक", "युवा", "बेरोजगार", "नौकरी", "भर्ती", "सिपाही", "ro/aro", "छात्र", "परीक्षा", "लाठीचार्ज", "डिग्री",
        "paper", "leak", "exam", "student", "job", "degree", "lathicharge", "unemployment", "youth", "recruitment", "police bharti"
    ]):
        return "PAPER_LEAK"

    # 6. Constitution, Caste Census & PDA Social Justice
    if any(k in txt for k in [
        "संविधान", "आरक्षण", "जाति", "जनगणना", "दलित", "पिछड़ा", "अल्पसंख्यक", "पीडीए", "आंबेडकर", "लोहिया", "सामाजिक न्याय", "69000",
        "pda", "ambedkar", "caste", "census", "aarakshan", "samajik", "constitution", "dalit", "obc", "reservation", "lohia"
    ]):
        return "CONSTITUTION_PDA"

    # 7. Development, Expressways, Infrastructure & Hospitals
    if any(k in txt for k in [
        "एक्सप्रेसवे", "मेट्रो", "लैपटॉप", "सड़क", "अस्पताल", "विकास", "पुल", "रिवरफ्रंट", "मेदांता", "लोहिया संस्थान", "रेवड़ी", "डबल इंजन",
        "expressway", "metro", "freebie", "revadi", "laptop", "vikas", "double engine", "hospital", "infrastructure", "flyover"
    ]):
        return "DEVELOPMENT_EXPRESSWAY"

    # 8. Dynasty, General Political Attacks, Rallies -> SP Mission 2027 Wave
    if any(k in txt for k in [
        "परिवार", "कुनबा", "सैफई", "वंशवाद", "परिवारवाद", "रैली", "2027", "चुनाव", "सपा", "अखिलेश", "जीत", "हार", "जनादेश",
        "parivar", "dynasty", "nepotism", "kunba", "saifai", "pariwarwaad", "vanshwaad", "2027", "chunav", "rally", "wave"
    ]):
        return "SP_2027_RALLY"
        
    return "PAPER_LEAK"

# ---------------------------------------------------------------------------
# SAMAJWADI 360° STRATEGIC PLAYBOOK & CARTOON ARTWORK ENGINE
# ---------------------------------------------------------------------------
def get_strategic_counter(vector: str, claim: str, tone: str) -> Dict[str, Any]:
    playbook = {
        "PAPER_LEAK": {
            "vector_label": "पेपर लीक, युवा आक्रोश व बेरोजगारी का मुद्दा",
            "artwork_file": "youth_paper_leak.jpg",
            "artwork_url": "/assets/cartoons/youth_paper_leak.jpg",
            "cdr_headline_hi": "60 लाख युवाओं का हिसाब दो!",
            "headline_hi": "60 लाख नौजवानों का भविष्य बर्बाद: पेपर लीक का हिसाब 2027 में होगा!",
            "sub_headline_hi": "पुलिस भर्ती व RO/ARO रद्द, लाठीचार्ज और बेरोजगारी पर भाजपा मौन • PDA युवा शक्ति मांगे रोजगार",
            "body_hi": "उत्तर प्रदेश में भाजपा राज में 10 से अधिक महत्वपूर्ण प्रतियोगी परीक्षाओं के पेपर लीक हुए। 60 लाख से अधिक छात्र व नौजवान सड़कों पर रोने को मजबूर हैं और अपने हक की आवाज उठाने पर पुलिस की लाठियां झेल रहे हैं। अखिलेश यादव सरकार ने पुलिस एवं शिक्षा में रिकॉर्ड पारदर्शी भर्तियां की थीं और 18 लाख मेधावियों को लैपटॉप दिए थे। 2027 में युवा शक्ति इस तानाशाही का लोकतांत्रिक अंत करेगी।",
            "call_to_action_hi": "रोजी-रोटी और रोजगार पर बात करो • PDA युवा 2027 में हिसाब लेगा!",
            "hashtags": ["#PaperLeakMuktUP", "#RozgarDo_DharmNahi", "#YouthPower2027", "#AkhileshYadavWithYouth", "#PDAYuvaMorcha"],
            "talking_points": [
                "1. 60 लाख नौजवानों की यूपी पुलिस सिपाही भर्ती परीक्षा परीक्षा से चंद घंटे पहले लीक हुई। यह प्रशासनिक अपराध है।",
                "2. युवा जब लखनऊ और प्रयागराज में शांतिपूर्ण प्रदर्शन करते हैं, तो उन पर बर्बर लाठीचार्ज कराया जाता है।",
                "3. समाजवादी सरकार ने पारदर्शी प्रक्रिया से बिना किसी पेपर लीक के लाखों नौकरियां दी थीं और लैपटॉप बांटे थे।"
            ],
            "official_data_citations": [
                {"metric": "UP पुलिस सिपाही भर्ती परीक्षा", "sp_value": "पारदर्शी भर्ती एवं सम्मान", "bjp_value": "पेपर लीक रद्द (60 लाख छात्र प्रभावित)", "source": "UPPRPB 2024"},
                {"metric": "युवाओं को मुफ्त लैपटॉप वितरण", "sp_value": "18.2 लाख मेधावी छात्र लाभान्वित", "bjp_value": "शून्य लैपटॉप (योजना बंद कर दी)", "source": "UP Madhyamik Shiksha"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता से सीधे पूछें: '60 लाख अभ्यर्थियों के परीक्षा फॉर्म फीस के 1,000 करोड़ रुपये कहां गए और दोषी पेपर माफिया पर अब तक क्या कार्रवाई हुई?'"
        },
        "CONSTITUTION_PDA": {
            "vector_label": "संविधान रक्षा, आरक्षण व जाति जनगणना का संकल्प",
            "artwork_file": "constitution_pda.jpg",
            "artwork_url": "/assets/cartoons/constitution_pda.jpg",
            "cdr_headline_hi": "संविधान हमारा स्वाभिमान!",
            "headline_hi": "जिसकी जितनी संख्या भारी, उसकी उतनी हिस्सेदारी: जाति जनगणना राष्ट्र निर्माण का आधार है!",
            "sub_headline_hi": "बाबासाहेब डॉ. आंबेडकर व डॉ. लोहिया का सामाजिक न्याय ही PDA की आत्मा है",
            "body_hi": "जाति जनगणना समाज को बांटने के लिए नहीं, बल्कि 90% पिछड़े, दलित, आदिवासी और अल्पसंख्यकों के हक और विकास की सटीक नीतियां बनाने के लिए अनिवार्य है। जब पशुओं और पेड़ों की गिनती हो सकती है, तो देश के इंसानों की गिनती से भाजपा को डर क्यों लगता है? संविधान के अनुच्छेद 15 और 16 की रक्षा के लिए PDA चट्टान की तरह खड़ा है।",
            "call_to_action_hi": "PDA जीतेगा, सामाजिक न्याय आएगा • 2027 में 202+ सीटें!",
            "hashtags": ["#PDA_SocialJustice", "#JaatiJangananaZarooriHai", "#SamvidhanRaksha", "#LohiaAmbedkarVichar", "#AkhileshYadav2027"],
            "talking_points": [
                "1. जाति जनगणना विकास का एक्सरे है। जब तक बीमारी का सटीक पता नहीं चलेगा, इलाज कैसे होगा?",
                "2. 69,000 शिक्षक भर्ती में पिछड़ों और दलितों के आरक्षण पर डाका डाला गया—हाईकोर्ट के फैसले ने भाजपा सरकार के आरक्षण-विरोधी चेहरे को बेनकाब किया।",
                "3. PDA (पिछड़ा, दलित, अल्पसंख्यक) केवल चुनावी गठबंधन नहीं, बल्कि सामाजिक गैर-बराबरी को मिटाने का जन-आंदोलन है।"
            ],
            "official_data_citations": [
                {"metric": "69000 शिक्षक भर्ती आरक्षण घोटाला", "sp_value": "PDA छात्रों के हक में सड़क पर संघर्ष", "bjp_value": "इलाहाबाद HC द्वारा सूची रद्द", "source": "Allahabad HC Order 2024"},
                {"metric": "संसद में प्रतिनिधित्व मांग", "sp_value": "जातिगत जनगणना कानून अनिवार्य", "bjp_value": "गणना कराने से इंकार", "source": "Parliamentary Debates 2024"}
            ],
            "spokesperson_caution": "अति-पिछड़ी जातियों (निषाद, कश्यप, बिंद, राजभर, मौर्य, शाक्य) के संवैधानिक अधिकारों और सरकारी नौकरियों में प्रतिनिधित्व की बात पर जोर दें।"
        },
        "INFLATION_MEHNGAI": {
            "vector_label": "महंगाई की मार, ₹1100 का रसोई गैस सिलेंडर व लूट",
            "artwork_file": "inflation_mehngai.jpg",
            "artwork_url": "/assets/cartoons/inflation_mehngai.jpg",
            "cdr_headline_hi": "रसोई गैस ₹1100 क्यों?",
            "headline_hi": "रसोई गैस ₹1100, दाल-रोटी महंगी: आम जनता की जेब खाली, कॉर्पोरेट मित्रों की तिजोरी भरी!",
            "sub_headline_hi": "महंगाई पर चुप्पी साधने वाली सरकार को जनता का सीधा सवाल • जवाब दो भाजपा",
            "body_hi": "2014 में ₹400 का मिलने वाला रसोई गैस सिलेंडर आज ₹1100 पार कर चुका है। आटा, दाल, दूध, सरसों का तेल और बच्चों की पढ़ाई तक टैक्स के बोझ तले दब चुकी है। आम गरीब, किसान और माताएं-बहनें घर का बजट संभालने में लाचार हैं, जबकि सरकार चंद अरबपतियों के 16 लाख करोड़ रुपये के कर्ज माफ कर रही है।",
            "call_to_action_hi": "महंगाई से मुक्ति चाहिए • 2027 में समाजवादी सरकार लाइए!",
            "hashtags": ["#MehngaiMuktBharat", "#LPG1100Kyu", "#GharKaBudgetBigada", "#SamajwadiLadhai", "#AmAdmiKiAwaz"],
            "talking_points": [
                "1. घरेलू गैस सिलेंडर 400 से बढ़कर 1100 रुपये पार हो गया, उज्ज्वला के सिलेंडर आज गांवों में खाली पड़े हैं।",
                "2. खाद्य तेल, आटा, दाल पर टैक्स लगाकर गरीब की थाली से निवाला छीना गया है।",
                "3. समाजवादी सरकार ने समाजवादी पेंशन और राशन वितरण से 55 लाख कमजोर परिवारों को वास्तविक सुरक्षा दी थी।"
            ],
            "official_data_citations": [
                {"metric": "घरेलू गैस सिलेंडर दर", "sp_value": "₹410 (सपा शासन)", "bjp_value": "₹1100+ (असहनीय बोझ)", "source": "Ministry of Petroleum"},
                {"metric": "समाजवादी पेंशन योजना", "sp_value": "55 लाख गरीब परिवारों को सीधी मदद", "bjp_value": "योजना बंद कर दी गई", "source": "UP Social Welfare"}
            ],
            "spokesperson_caution": "भाजपा को केवल एक सवाल पूछें: '2014 में 400 के सिलेंडर पर छाती पीटने वाले आज 1100 के सिलेंडर पर मौन क्यों हैं?'"
        },
        "STRAY_CATTLE_FARMER": {
            "vector_label": "आवारा पशु, सांड का आतंक व किसान संकट",
            "artwork_file": "stray_cattle_farmer.jpg",
            "artwork_url": "/assets/cartoons/stray_cattle_farmer.jpg",
            "cdr_headline_hi": "अन्नदाता मांगे न्याय!",
            "headline_hi": "खेत बर्बाद, किसान लाचार: रात-रात भर जागने वाला अन्नदाता मांगे न्याय!",
            "sub_headline_hi": "सांडों के आतंक और कागजी गौशालाओं से त्रस्त यूपी का किसान • 2027 में होगा पूरा हिसाब",
            "body_hi": "उत्तर प्रदेश के 75 जिलों में लाखों आवारा पशु और सांड किसानों की खून-पसीने से सींची फसलें बर्बाद कर रहे हैं। किसान कड़ाके की ठंड और बरसात में रात भर लाठी और लालटेन लेकर खेतों की रखवाली करने को मजबूर हैं। गौशालाओं के नाम पर करोड़ों रुपये का भ्रष्टाचार हुआ और गायें भूख से तड़प रही हैं। सड़क हादसों में सैकड़ों निर्दोषों की जान जा चुकी है।",
            "call_to_action_hi": "किसान बचेगा तो देश बचेगा • 2027 में सांडों के आतंक से मुक्ति!",
            "hashtags": ["#KisanBachao", "#SandMuktiAbhiyan", "#AnnadataMangeyHaq", "#KhetKisanSamajwadi", "#GauShalaGhotala"],
            "talking_points": [
                "1. आवारा पशुओं के कारण हर गांव में किसान रात भर खेतों में जागने को विवश हैं, फसलें तबाह हो रही हैं।",
                "2. गौशालाओं के नाम पर सरकारी बजट की लूट हुई, सड़कों पर सांडों के हमलों में रोजाना जानें जा रही हैं।",
                "3. समाजवादी पार्टी किसानों को कानूनी एमएसपी गारंटी और आवारा पशु समस्या का स्थाई वैज्ञानिक समाधान देगी।"
            ],
            "official_data_citations": [
                {"metric": "गौशाला बजट खर्च (2017-24)", "sp_value": "सीधे किसान राहत व सिंचाई", "bjp_value": "₹2,000+ करोड़ खर्च पर सांड सड़कों पर", "source": "UP Animal Husbandry"},
                {"metric": "मुफ्त सिंचाई सुविधा", "sp_value": "नहरों व नलकूपों से मुफ्त पानी", "bjp_value": "बिजली दरों में भारी बढ़ोतरी", "source": "UP Irrigation Dept"}
            ],
            "spokesperson_caution": "भाजपा को चुनौती दें कि किसी भी एक गांव में जाकर किसानों से सांडों के आतंक और फसल नुकसान पर सीधे बात करके दिखाएं।"
        },
        "DEVELOPMENT_EXPRESSWAY": {
            "vector_label": "विश्वस्तरीय एक्सप्रेसवे व मेट्रो विकास बनाम जुमले",
            "artwork_file": "expressway_vikas.jpg",
            "artwork_url": "/assets/cartoons/expressway_vikas.jpg",
            "cdr_headline_hi": "काम बोलता है!",
            "headline_hi": "22 महीने में सुखोई लड़ाकू विमान उतारने वाला एक्सप्रेसवे बनाया • भाजपा ने केवल फीते काटे!",
            "sub_headline_hi": "लखनऊ-आगरा एक्सप्रेसवे, लखनऊ मेट्रो, मेदांता अस्पताल, कैंसर संस्थान: विकास की असली परिभाषा",
            "body_hi": "अखिलेश यादव जी ने 302 किमी लंबा आगरा-लखनऊ एक्सप्रेसवे रिकॉर्ड 22 महीनों में बनाकर विश्व कीर्तिमान स्थापित किया, जिस पर वायुसेना के मिराज और सुखोई उतरे। लखनऊ मेट्रो, गोमती रिवरफ्रंट, लोहिया आयुर्विज्ञान संस्थान और मेदांता अस्पताल सपा की देन हैं। भाजपा 8 साल में एक भी नया बिजली घर या विश्वस्तरीय अस्पताल नहीं बना पाई; केवल आवारा पशुओं से किसानों की फसलें बर्बाद कीं।",
            "call_to_action_hi": "काम बोलता है • 2027 में प्रगतिशील समाजवाद लौटेगा!",
            "hashtags": ["#KaamBoltaHai", "#AgraLucknowExpressway", "#VikasKiRaftaar", "#AkhileshYadavVision"],
            "talking_points": [
                "1. आगरा-लखनऊ एक्सप्रेसवे भारत का पहला एक्सप्रेसवे है जिस पर देश की सुरक्षा के लिए लड़ाकू विमान उतारे गए।",
                "2. लखनऊ मेट्रो, कानपुर मेट्रो की डीपीआर और पूर्वांचल एक्सप्रेसवे का अलाइनमेंट समाजवादी सरकार में तैयार हुआ।",
                "3. भाजपा के 'डबल इंजन' ने यूपी को 5 लाख करोड़ का कर्ज, आवारा पशुओं का आतंक और नौजवानों को बेरोजगारी के सिवा कुछ नहीं दिया।"
            ],
            "official_data_citations": [
                {"metric": "एक्सप्रेसवे निर्माण समय", "sp_value": "302 किमी (22 महीने में पूर्ण)", "bjp_value": "बुंदेलखंड एक्सप्रेसवे (उद्घाटन के 5 दिन बाद धंसा)", "source": "UPEIDA Official"},
                {"metric": "स्वास्थ्य अधोसंरचना", "sp_value": "मेदांता + कैंसर इंस्टिट्यूट + लोहिया", "bjp_value": "जिला अस्पतालों में डॉक्टरों का घोर अभाव", "source": "UP Health Dept 2024"}
            ],
            "spokesperson_caution": "भाजपा को केवल एक सवाल पूछें: 'अपने 8 साल के कार्यकाल में कोई एक ऐसा प्रोजेक्ट बताएं जो जमीन से शुरू होकर समय पर पूरा हुआ हो?'"
        },
        "RELIGIOUS_COMMUNAL": {
            "vector_label": "सांप्रदायिक ध्रुवीकरण व तुष्टिकरण का झूठा आरोप",
            "artwork_file": "ram_sabke_harmony.jpg",
            "artwork_url": "/assets/cartoons/ram_sabke_harmony.jpg",
            "cdr_headline_hi": "प्रभु राम सबके हैं!",
            "headline_hi": "सच्चा सनातनी वही जो सबका सम्मान करे: प्रभु राम सबके हैं, नफरत किसी की नहीं!",
            "sub_headline_hi": "धर्म आस्था का विषय है, चुनावी व्यापार का नहीं • सर्वधर्म समभाव ही असली राष्ट्रवाद",
            "body_hi": "अखिलेश यादव सरकार ने सैफई में भव्य भगवान हनुमान की 54 फीट की प्रतिमा स्थापित की, भगवान परशुराम जी का भव्य धाम बनवाया और महर्षि वाल्मीकि, रविदास जी की जयंती पर सम्मान दिया। भाजपा जब भी पेपर लीक, महंगाई और बेरोजगारी पर घिरती है, तो धर्म की आड़ लेती है। हमारा धर्म 'वसुधैव कुटुम्बकम्' और संविधान की रक्षा है।",
            "call_to_action_hi": "रोजी-रोटी, अस्पताल और शिक्षा पर बात करो • PDA 2027 में हिसाब लेगा!",
            "hashtags": ["#PDA_Ekta", "#SamajwadiKaam", "#RozgarDo_DharmNahi", "#AkhileshYadav2027", "#VasudhaivaKutumbakam"],
            "talking_points": [
                "1. प्रभु श्री राम जन-जन के आराध्य हैं, किसी एक राजनीतिक दल के चुनावी एजेंट नहीं। राम सबके हैं, शबरी के भी और निषादराज के भी।",
                "2. 60 लाख नौजवानों के पेपर लीक हुए, 2 करोड़ युवा बेरोजगार हैं—भाजपा के पास इसका कोई जवाब नहीं, इसलिए वह सांप्रदायिक ध्रुवीकरण करती है।",
                "3. नेताजी और अखिलेश यादव ने हमेशा संतों और सर्वसमाज का सम्मान किया। हमारा राष्ट्रवाद तिरंगे और संविधान से बंधा है।"
            ],
            "official_data_citations": [
                {"metric": "UP पुलिस सिपाही भर्ती परीक्षा", "sp_value": "पारदर्शी भर्ती", "bjp_value": "पेपर लीक रद्द (60 लाख प्रभावित)", "source": "UPPRPB Official 2024"},
                {"metric": "अयोध्या 2024 लोकसभा परिणाम", "sp_value": "अवधेश प्रसाद (विजेता - 54,567 वोट)", "bjp_value": "पराजित (जनता का जनादेश)", "source": "ECI Form 20"}
            ],
            "spokesperson_caution": "विपक्षी प्रवक्ता को किसी भी धार्मिक ग्रंथ या देवता पर उलझने न दें; तुरंत पलटकर पूछें कि 'अयोध्या के किसानों की जमीन के मुआवजे और पेपर लीक पर आपकी क्या नीति है?'"
        },
        "BULLDOZER_INJUSTICE": {
            "vector_label": "बुलडोजर न्याय बनाम संविधान व सुप्रीम कोर्ट का फैसला",
            "artwork_file": "bulldozer_justice.jpg",
            "artwork_url": "/assets/cartoons/bulldozer_justice.jpg",
            "cdr_headline_hi": "संविधान के आगे झुका बुलडोजर!",
            "headline_hi": "संविधान के आगे झुका बुलडोजर: सुप्रीम कोर्ट का फैसला, कानून का राज ही अंतिम सच!",
            "sub_headline_hi": "तानाशाही और गैर-संवैधानिक ध्वस्तीकरण पर संवैधानिक प्रहार • न्याय और समानता की जीत",
            "body_hi": "सुप्रीम कोर्ट ने ऐतिहासिक फैसला सुनाते हुए बुलडोजर कार्रवाई को असंवैधानिक और कानून के शासन पर सीधा हमला करार दिया है। किसी के आरोप मात्र पर घर गिरा देना न्याय नहीं, बल्कि तानाशाही और बदला लेने की राजनीति है। कानून की अदालतें फैसला करती हैं, सरकार या बुलडोजर नहीं। बाबासाहेब का संविधान हर नागरिक को सिर छुपाने और निष्पक्ष सुनवाई का मौलिक अधिकार देता है।",
            "call_to_action_hi": "देश संविधान से चलेगा, बुलडोजर से नहीं • न्याय की जीत!",
            "hashtags": ["#SupremeCourtJudgment", "#BulldozerRajExposed", "#RuleOfLaw", "#SamvidhanZindabad", "#AkhileshYadavStandsWithJustice"],
            "talking_points": [
                "1. सुप्रीम कोर्ट ने स्पष्ट कहा कि कार्यपालिका जज नहीं बन सकती; किसी का घर गिराना मनमाना और असंवैधानिक है।",
                "2. चुनिंदा और जातिवादी आधार पर बुलडोजर चलाकर भय का माहौल बनाया गया।",
                "3. देश बुलडोजर से नहीं, संविधान और कानून के शासन से चलेगा।"
            ],
            "official_data_citations": [
                {"metric": "सुप्रीम कोर्ट निर्देश (2024)", "sp_value": "संवैधानिक मर्यादा व प्रक्रिया की जीत", "bjp_value": "बुलडोजर कार्रवाई पर देशव्यापी रोक व फटकार", "source": "Supreme Court of India"},
                {"metric": "UP-100 आधुनिक पुलिसिंग", "sp_value": "3,200 GPS पुलिस गाड़ियां (15 मिनट रिस्पॉन्स)", "bjp_value": "केवल नाम बदलकर 112 किया", "source": "UP Police Tech Cell"}
            ],
            "spokesperson_caution": "भाजपा के 'बुलडोजर' जुमले पर तुरंत सुप्रीम कोर्ट की बुलडोजर न्याय पर कड़ी फटकार और संविधान के उल्लंघन का हवाला दें।"
        },
        "SP_2027_RALLY": {
            "vector_label": "मिशन 2027 विशाल विजय संकल्प व जन-आंदोलन",
            "artwork_file": "sp_2027_rally.jpg",
            "artwork_url": "/assets/cartoons/sp_2027_rally.jpg",
            "cdr_headline_hi": "युवा शक्ति, प्रदेश की प्रगति!",
            "headline_hi": "युवा शक्ति, प्रदेश की प्रगति: 2027 में 202+ सीटों के साथ जन-क्रांति!",
            "sub_headline_hi": "अखिलेश यादव के नेतृत्व में पीडीए का विशाल जनादेश • प्रगतिशील यूपी की वापसी",
            "body_hi": "2024 के लोकसभा चुनावों में उत्तर प्रदेश की जनता ने 37 सीटें देकर समाजवादी पार्टी को देश की तीसरी सबसे बड़ी राजनीतिक शक्ति बनाया है। अब 2027 के विधानसभा चुनाव में 25 करोड़ जनता बेरोजगारी, महंगाई, पेपर लीक और सांडों के आतंक से मुक्ति के लिए अखिलेश यादव के नेतृत्व में ऐतिहासिक बहुमत (202+ सीटें) देने जा रही है। यह चुनाव सत्ता का नहीं, जनता के हक और संविधान की रक्षा का है।",
            "call_to_action_hi": "PDA जीतेगा, यूपी बढ़ेगा • 2027 में अखिलेश यादव सरकार!",
            "hashtags": ["#Mission2027", "#AkhileshYadavNextCM", "#PDA_Sarkar", "#HamarNeta", "#UPVidhanSabha2027"],
            "talking_points": [
                "1. 2024 लोकसभा में यूपी की जनता ने भाजपा को नकार कर समाजवादी पार्टी को 37 सीटों का ऐतिहासिक जनादेश दिया।",
                "2. PDA (पिछड़ा, दलित, अल्पसंख्यक) और आधी आबादी एकजुट होकर 2027 में पूर्ण बहुमत की सरकार बनाएगी।",
                "3. किसान, नौजवान, शिक्षक और व्यापारी सभी अखिलेश यादव के विकासपरक और समावेशी विजन के साथ हैं।"
            ],
            "official_data_citations": [
                {"metric": "लोकसभा 2024 जनमत", "sp_value": "37 सांसद (देश की तीसरी बड़ी शक्ति)", "bjp_value": "33 सीटें (ऐतिहासिक गिरावट)", "source": "ECI 2024 Official"},
                {"metric": "लक्ष्य 2027 विधानसभा", "sp_value": "202+ सीटें (पूर्ण बहुमत की सरकार)", "bjp_value": "विपक्षी ध्रुवीकरण की विफलता", "source": "SP Strategic War Room"}
            ],
            "spokesperson_caution": "व्यक्तिगत पारिवारिक रिश्तों पर जाने के बजाय सीधे 2024 लोकसभा परिणाम (37 सीटें) और जन-समर्थन को जनता का सच्चा फैसला बताएं।"
        }
    }

    return playbook.get(vector, playbook["PAPER_LEAK"])

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
            draw.text((40 + dx, h_y + dy), headline_3d, fill="#000000", font=font_bold)
        # Golden Main Lettering
        draw.text((40, h_y), headline_3d, fill="#fde047", font=font_bold)

    # Subheadline in crisp white/cyan
    if font_sub:
        sub_text = strategy["sub_headline_hi"][:70]
        draw.text((40, 945), sub_text, fill="#e0f2fe", font=font_sub)

    # 4. Bottom Signature Bar (y: 1010 to 1080)
    draw.rectangle([(0, 1010), (width, 1014)], fill="#16a34a")
    draw.rectangle([(0, 1014), (width, height)], fill="#dc2626")
    
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
    """Returns the 8 major political attack & issue presets with cartoon artworks."""
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
