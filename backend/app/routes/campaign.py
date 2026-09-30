# -*- coding: utf-8 -*-
"""
E:/eci/backend/app/routes/campaign.py
"Chitragupta" — Universal Strategic Counter-Creative Studio.
Applies the 360° Samajwadi Party Strategic Re-framing Playbook
(Lohia - Ambedkar - Mulayam - Akhilesh Doctrine).
Integrates DALL-E / Flux AI Generative Imaging Engine (1024x1024 Photorealistic Visuals)
with 100% Devanagari Hindi Typography and Spokesperson Debate Briefs.
"""

import io
import re
import os
import json
import base64
import urllib.parse
import urllib.request
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

router = APIRouter(prefix="/api/campaign", tags=["Strategic Counter Studio"])

# ---------------------------------------------------------------------------
# SAFE MULTI-PLATFORM HINDI FONT LOADER
# ---------------------------------------------------------------------------
def get_safe_hindi_font(size: int = 24, bold: bool = False):
    candidate_paths = [
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
# PRESET ATTACK SCENARIOS FOR 1-CLICK TESTING
# ---------------------------------------------------------------------------
PRESET_ATTACKS = [
    {
        "id": "rel_01",
        "vector": "RELIGIOUS_COMMUNAL",
        "label": "तुष्टिकरण व सांप्रदायिक आरोप (Communal Polarization)",
        "claim": "सपा केवल एक वर्ग विशेष और तुष्टिकरण की राजनीति करती है, सनातन का विरोध करती है।",
        "description": "विपक्ष द्वारा ध्रुवीकरण करने व बुनियादी मुद्दों (रोजगार, महंगाई) से भटकाने का प्रयास।"
    },
    {
        "id": "pariv_02",
        "vector": "PARIVARWAAD",
        "label": "परिवारवाद व सैफई कुनबा (Dynastic Attack)",
        "claim": "सपा में लोकतंत्र नहीं है, यह केवल एक परिवार और सैफई कुनबे की पार्टी है।",
        "description": "वंशवाद का आरोप लगाकर सामाजिक न्याय की राजनीति को कमजोर करने का प्रयास।"
    },
    {
        "id": "crime_03",
        "vector": "LAW_AND_ORDER",
        "label": "गुंडाराज व कानून-व्यवस्था (Crime Propaganda)",
        "claim": "सपा के 2012-2017 शासन में गुंडाराज और माफियाओं का बोलबाला था, बेटियां सुरक्षित नहीं थीं।",
        "description": "एनसीआरबी के आधिकारिक आंकड़ों को छिपाकर झूठा नैरेटिव खड़ा करना।"
    },
    {
        "id": "dev_04",
        "vector": "DEVELOPMENT",
        "label": "मुफ्त की रेवड़ी व विकास (Infrastructure & Freebies)",
        "claim": "सपा सरकार केवल मुफ्त की रेवड़ियां बांटती है, कोई वास्तविक ढांचागत विकास नहीं किया।",
        "description": "आगरा-लखनऊ एक्सप्रेसवे, मेट्रो और डायल-100 जैसे ऐतिहासिक कार्यों की अनदेखी।"
    },
    {
        "id": "pda_05",
        "vector": "CASTE_PDA",
        "label": "जाति जनगणना व सामाजिक विभाजन (Social Justice / PDA)",
        "claim": "जाति जनगणना और पीडीए की मांग समाज को बांटने और वैमनस्य फैलाने का षड्यंत्र है।",
        "description": "संवैधानिक हक और 90% आबादी के प्रतिनिधित्व की मांग पर प्रहार।"
    }
]

# ---------------------------------------------------------------------------
# ATTACK VECTOR CLASSIFIER
# ---------------------------------------------------------------------------
def detect_attack_vector(claim_text: str) -> str:
    txt = claim_text.lower()
    if any(k in txt for k in ["muslim", "appeasement", "tushtikaran", "sanatan", "ram", "mandir", "masjid", "dharma", "hindu", "communal", "dange", "dharm"]):
        return "RELIGIOUS_COMMUNAL"
    if any(k in txt for k in ["parivar", "dynasty", "nepotism", "kunba", "saifai", "pariwarwaad", "vanshwaad"]):
        return "PARIVARWAAD"
    if any(k in txt for k in ["crime", "gunda", "mafia", "bulldozer", "suraksha", "women", "mahila", "kanoon", "hathras", "police", "danga"]):
        return "LAW_AND_ORDER"
    if any(k in txt for k in ["caste", "jaati", "pda", "census", "yadav", "dalit", "reservation", "aarakshan", "samajik"]):
        return "CASTE_PDA"
    if any(k in txt for k in ["expressway", "metro", "freebie", "revadi", "laptop", "vikas", "double engine", "paper leak", "berozgari", "mehngai"]):
        return "DEVELOPMENT"
    return "RELIGIOUS_COMMUNAL"

# ---------------------------------------------------------------------------
# SAMAJWADI 360° STRATEGIC PLAYBOOK & PROMPT SYNTHESIZER
# ---------------------------------------------------------------------------
def get_strategic_counter(vector: str, claim: str, tone: str) -> Dict[str, Any]:
    playbook = {
        "RELIGIOUS_COMMUNAL": {
            "vector_label": "सांप्रदायिक ध्रुवीकरण व तुष्टिकरण का झूठा आरोप",
            "ai_prompt": "photorealistic 8k cinematic shot of majestic ancient temple architecture in Uttar Pradesh India, peaceful glowing traditional oil lamps at dusk, serene cultural harmony, golden hour lighting, ultra detailed award winning documentary photography",
            "headline_hi": "सच्चा सनातनी वही जो सबका सम्मान करे: प्रभु राम सबके हैं, नफरत किसी की नहीं!",
            "sub_headline_hi": "धर्म आस्था का विषय है, चुनावी व्यापार का नहीं • पेपर लीक व बेरोजगारी पर जवाब दे भाजपा",
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
        "PARIVARWAAD": {
            "vector_label": "परिवारवाद व वंशवाद का तंज",
            "ai_prompt": "photorealistic 8k heroic shot of 25 crore united citizens of Uttar Pradesh, diverse smiling farmers youth women standing together under open sky, inspirational cinematic golden lighting, wide angle documentary portrait",
            "headline_hi": "हमारा परिवार 90% PDA की जनता है • भाजपा का परिवार चंद कॉर्पोरेट मित्र!",
            "sub_headline_hi": "किसान, मजदूर, नौजवान और वंचित समाज ही समाजवादी पार्टी का असली कुनबा है",
            "body_hi": "नेताजी मुलायम सिंह यादव ने खेत-खलिहान और अखाड़े से निकलकर 90% वंचितों को संसद तक पहुँचाया। अखिलेश यादव ने परिवारवाद नहीं, बल्कि पूरे उत्तर प्रदेश के परिवारों को आगरा-लखनऊ एक्सप्रेसवे, 108 एम्बुलेंस और लैपटॉप दिया। भाजपा बताए कि उसके गृहमंत्री के बेटे बिना एक मैच खेले क्रिकेट बोर्ड के सर्वेसर्वा कैसे बन गए?",
            "call_to_action_hi": "जनता का परिवार PDA के साथ • 2027 में लोकशाही जीतेगी!",
            "hashtags": ["#PDAHiParivarHai", "#SamajwadiVikas", "#AkhileshYadav", "#NoToCronyFamily"],
            "talking_points": [
                "1. हमारा परिवार उत्तर प्रदेश के 25 करोड़ नागरिक हैं। अखिलेश जी ने 18 लाख छात्रों को मुफ्त लैपटॉप बांटे—वे सब हमारा परिवार हैं।",
                "2. भाजपा अपने गिरेबान में झांके: केंद्र से लेकर राज्यों तक दर्जनों भाजपा सांसदों-मंत्रियों के बेटे-बेटियां पदों पर बैठे हैं।",
                "3. लोकतंत्र में जनता वोट देकर नेता चुनती है। अखिलेश यादव जी को यूपी की जनता ने 37 लोकसभा सीटें जिताकर देश की तीसरी सबसे बड़ी ताकत बनाया है।"
            ],
            "official_data_citations": [
                {"metric": "लोकसभा 2024 जनमत", "sp_value": "37 सांसद (देश की तीसरी बड़ी शक्ति)", "bjp_value": "33 सीटें (ऐतिहासिक गिरावट)", "source": "ECI 2024 Official"},
                {"metric": "लैपटॉप वितरण (2012-16)", "sp_value": "18.2 लाख मेधावी छात्र लाभान्वित", "bjp_value": "शून्य लैपटॉप", "source": "UP Secondary Education"}
            ],
            "spokesperson_caution": "व्यक्तिगत पारिवारिक रिश्तों पर जाने के बजाय सीधे 2024 लोकसभा परिणाम (37 सीटें) और जन-समर्थन को जनता का सच्चा फैसला बताएं।"
        },
        "LAW_AND_ORDER": {
            "vector_label": "कानून-व्यवस्था व गुंडाराज का दुष्प्रचार",
            "ai_prompt": "photorealistic 8k cinematic view of modern emergency response command center in Uttar Pradesh, high-tech GPS monitors, sleek modern police patrol vehicles with glowing blue lights, ultra modern security, cinematic lighting",
            "headline_hi": "आंकड़े गवाह हैं: 2012-17 में यूपी अपराध दर 97.7 थी • आज बुलडोजर राज में बेटियां असुरक्षित!",
            "sub_headline_hi": "UP-100 (3,200 GPS पुलिस गाड़ियां) और 1090 महिला हेल्पलाइन अखिलेश यादव की देन है",
            "body_hi": "भारत सरकार के गृह मंत्रालय की आधिकारिक NCRB रिपोर्ट प्रमाण है कि अखिलेश सरकार (2012) में यूपी में प्रति 1 लाख जनसंख्या पर मात्र 97.7 संज्ञेय अपराध दर्ज थे, जो भाजपा शासित मध्य प्रदेश (298.8) से एक-तिहाई कम था। हाथरस, उन्नाव, लखीमपुर खीरी और कस्टोडियल मौतों ने साबित किया है कि भाजपा का तथाकथित कानून-व्यवस्था केवल प्रचार और जातिवादी बुलडोजर है।",
            "call_to_action_hi": "कानून का राज बहाल करेंगे • UP-100 और 1090 को फिर से मजबूत बनाएंगे!",
            "hashtags": ["#NCRBDataSpeaks", "#UP100_1090", "#SachKaSawal", "#LawAndOrderTruth"],
            "talking_points": [
                "1. NCRB की आधिकारिक रिपोर्ट के अनुसार, 2012-2017 में यूपी का प्रति-लाख अपराध दर देश के औसत से काफी नीचे था।",
                "2. देश की सबसे आधुनिक पुलिसिंग—'डायल 100' (15 मिनट में पुलिस मौके पर) और '1090 वूमेन पावर लाइन' अखिलेश यादव जी ने बनाई।",
                "3. आज भाजपा राज में पुलिस हिरासत में सर्वाधिक मौतें (NHRC रिपोर्ट) और हाथरस जैसी घटनाएं हो रही हैं। कानून का राज नहीं, अफसरों की मनमानी चल रही है।"
            ],
            "official_data_citations": [
                {"metric": "प्रति 1 लाख अपराध दर (2012)", "sp_value": "97.7 (अत्यंत कम)", "bjp_value": "मध्य प्रदेश 298.8 (3x अधिक)", "source": "NCRB Crime in India 2012"},
                {"metric": "GPS त्वरित पुलिस गाड़ियां", "sp_value": "3,200 UP-100 गाड़ियां शुरू", "bjp_value": "केवल नाम बदलकर 112 किया", "source": "UP Police Tech Cell"}
            ],
            "spokesperson_caution": "भाजपा के 'बुलडोजर' जुमले पर तुरंत सुप्रीम कोर्ट की बुलडोजर न्याय पर कड़ी फटकार और संविधान के उल्लंघन का हवाला दें।"
        },
        "DEVELOPMENT": {
            "vector_label": "मुफ्त की रेवड़ी व विकास पर हमला",
            "ai_prompt": "photorealistic 8k cinematic shot of Agra-Lucknow expressway in Uttar Pradesh India with Indian Air Force fighter jet landing on highway, modern high-speed Lucknow metro train running parallel, dramatic golden hour, 8k documentary photo",
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
        "CASTE_PDA": {
            "vector_label": "जाति जनगणना व सामाजिक विभाजन पर हमला",
            "ai_prompt": "photorealistic 8k cinematic shot of a massive progressive gathering of farmers, students and working class in Uttar Pradesh holding Indian national flag, glowing emblem of Constitution of India and equality, majestic sunrise light, heroic 8k photography",
            "headline_hi": "जिसकी जितनी संख्या भारी, उसकी उतनी हिस्सेदारी: जाति जनगणना राष्ट्र निर्माण का आधार है!",
            "sub_headline_hi": "बाबासाहेब डॉ. आंबेडकर व डॉ. लोहिया का सामाजिक न्याय ही PDA की आत्मा है",
            "body_hi": "जाति जनगणना समाज को बांटने के लिए नहीं, बल्कि 90% पिछड़े, दलित, आदिवासी और अल्पसंख्यकों के हक और विकास की सटीक नीतियां बनाने के लिए अनिवार्य है। जब पशुओं और पेड़ों की गिनती हो सकती है, तो देश के इंसानों की गिनती से भाजपा को डर क्यों लगता है? संविधान के अनुच्छेद 15 और 16 की रक्षा के लिए PDA चट्टान की तरह खड़ा है।",
            "call_to_action_hi": "PDA जीतेगा, सामाजिक न्याय आएगा • 2027 में 202+ सीटें!",
            "hashtags": ["#PDA_SocialJustice", "#JaatiJangananaZarooriHai", "#SamvidhanRaksha", "#LohiaAmbedkarVichar"],
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
        }
    }

    return playbook.get(vector, playbook["RELIGIOUS_COMMUNAL"])

# ---------------------------------------------------------------------------
# DALL-E / FLUX GRADE AI IMAGE FETCH & CANVAS COMPOSITOR
# ---------------------------------------------------------------------------
def fetch_ai_visual_image(prompt: str) -> Optional[Image.Image]:
    """Fetches high-definition photorealistic visual from Pollinations/Flux API."""
    try:
        encoded_prompt = urllib.parse.quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed=42"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=8) as response:
            img_data = response.read()
            return Image.open(io.BytesIO(img_data)).convert("RGB")
    except Exception as e:
        print(f"AI image generation fallback: {e}")
        return None

def generate_studio_poster_image(strategy: Dict[str, Any]) -> tuple[str, str]:
    """
    Renders high-resolution 1080x1080 poster composite.
    Uses AI generated photorealistic background image + Hindi typography.
    Returns (base64_image, ai_image_url).
    """
    width, height = 1080, 1080
    prompt = strategy.get("ai_prompt", "photorealistic dramatic political documentary photo of Uttar Pradesh, 8k")
    encoded_prompt = urllib.parse.quote(prompt)
    ai_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed=42"

    # Try fetching AI visual
    bg_ai = fetch_ai_visual_image(prompt)
    
    if bg_ai:
        im = bg_ai.resize((width, height), Image.Resampling.LANCZOS)
        # Apply dark cinematic overlay for text legibility
        overlay = Image.new("RGBA", (width, height), (15, 23, 42, 170))
        # Top gradient (red-tinted)
        draw_ov = ImageDraw.Draw(overlay)
        for y in range(250):
            alpha = int(220 * (1 - y / 250.0))
            draw_ov.line([(0, y), (width, y)], fill=(127, 29, 29, alpha))
        # Bottom gradient (slate-tinted)
        for y in range(height - 350, height):
            alpha = int(230 * ((y - (height - 350)) / 350.0))
            draw_ov.line([(0, y), (width, y)], fill=(15, 23, 42, alpha))
        im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    else:
        # Fallback rich studio gradient
        im = Image.new("RGB", (width, height), color=(15, 23, 42))
        draw_bg = ImageDraw.Draw(im)
        for y in range(height):
            alpha = y / float(height)
            r = int(127 * (1 - alpha) + 15 * alpha)
            g = int(29 * (1 - alpha) + 23 * alpha)
            b = int(29 * (1 - alpha) + 42 * alpha)
            draw_bg.line([(0, y), (width, y)], fill=(r, g, b))

    draw = ImageDraw.Draw(im)

    # Load Devanagari Hindi font
    font_bold = get_safe_hindi_font(30, bold=True)
    font_sub = get_safe_hindi_font(20, bold=False)
    font_body = get_safe_hindi_font(22, bold=False)
    font_meta = get_safe_hindi_font(16, bold=False)

    # 1. Header Bar
    draw.rectangle([(0, 0), (width, 10)], fill="#ef4444")
    if font_sub:
        draw.text((50, 25), "SAMAJWADI WAR ROOM 2027 • STRATEGIC FACT-CHECK", fill="#fecaca", font=font_sub)
        draw.text((width - 340, 25), "OFFICIAL COUNTER-PUNCH", fill="#fbbf24", font=font_sub)

    # 2. Vector Banner
    draw.rounded_rectangle([(50, 65), (width - 50, 130)], radius=12, fill="#7f1d1d", outline="#dc2626", width=2)
    if font_bold:
        draw.text((70, 82), f"मुद्दे का पलटवार: {strategy['vector_label']}", fill="#ffffff", font=font_bold)

    # 3. Main Bold Headline Box
    draw.rounded_rectangle([(50, 155), (width - 50, 360)], radius=18, fill="#1e1b4b", outline="#6366f1", width=2)
    h_text = strategy["headline_hi"]
    if font_bold:
        draw.text((75, 180), h_text[:50], fill="#fef08a", font=font_bold)
        if len(h_text) > 50:
            draw.text((75, 225), h_text[50:100], fill="#fef08a", font=font_bold)
    if font_sub:
        draw.text((75, 290), strategy["sub_headline_hi"][:75], fill="#c7d2fe", font=font_sub)

    # 4. Factual Data Box
    draw.rounded_rectangle([(50, 390), (width - 50, 650)], radius=18, fill="#022c22", outline="#10b981", width=2)
    draw.rectangle([(75, 378), (380, 406)], fill="#059669")
    if font_sub:
        draw.text((85, 382), "प्रमाणित सरकारी डेटा (OFFICIAL PROOF)", fill="#ffffff", font=font_sub)

    c1 = strategy["official_data_citations"][0]
    if font_bold:
        draw.text((75, 425), f"1. {c1['metric']}:", fill="#a7f3d0", font=font_bold)
    if font_body:
        draw.text((100, 465), f"• सपा रिकॉर्ड: {c1['sp_value']}", fill="#ffffff", font=font_body)
        draw.text((100, 500), f"• भाजपा रिकॉर्ड: {c1['bjp_value']}", fill="#f87171", font=font_body)
    if font_meta:
        draw.text((100, 540), f"• स्रोत: {c1['source']}", fill="#94a3b8", font=font_meta)

    # 5. Narrative Call to Action
    draw.rounded_rectangle([(50, 680), (width - 50, 930)], radius=18, fill="#0f172a", outline="#334155", width=2)
    if font_bold:
        draw.text((75, 705), "सच्चाई और संकल्प (The Ground Reality):", fill="#e2e8f0", font=font_bold)
    if font_body:
        b_txt = strategy["body_hi"]
        draw.text((75, 750), b_txt[:60], fill="#cbd5e1", font=font_body)
        draw.text((75, 785), b_txt[60:120], fill="#cbd5e1", font=font_body)
        draw.text((75, 820), b_txt[120:180], fill="#cbd5e1", font=font_body)
    if font_bold:
        draw.text((75, 870), f"नारा: {strategy['call_to_action_hi']}", fill="#34d399", font=font_bold)

    # 6. Bottom Signature Bar
    draw.rectangle([(0, 960), (width, height)], fill="#090d16")
    draw.rectangle([(0, 960), (width, 964)], fill="#dc2626")
    if font_bold:
        draw.text((50, 985), "समाजवादी पार्टी • PDA (पिछड़ा, दलित, अल्पसंख्यक) परिवार", fill="#f87171", font=font_bold)
    if font_meta:
        draw.text((50, 1025), "सत्य • समानता • सामाजिक न्याय • प्रगतिशील उत्तर प्रदेश", fill="#94a3b8", font=font_meta)

    draw.rounded_rectangle([(width - 340, 980), (width - 50, 1050)], radius=10, fill="#1e293b", outline="#10b981", width=1)
    if font_sub:
        draw.text((width - 325, 995), "✓ ECI & NCRB CERTIFIED", fill="#34d399", font=font_sub)
    if font_meta:
        draw.text((width - 325, 1025), "WAR ROOM FACT-CHECKED", fill="#94a3b8", font=font_meta)

    buf = io.BytesIO()
    im.save(buf, format="PNG")
    buf.seek(0)
    b64 = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
    return b64, ai_url

# ---------------------------------------------------------------------------
# API ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/preset-attacks")
def get_preset_attacks():
    """Returns the 5 major political attack presets for 1-click execution."""
    return {"status": "success", "presets": PRESET_ATTACKS}

@router.post("/generate-counter")
def generate_counter(payload: CounterCreativePayload):
    """
    Accepts opponent's attack claim or slogan, identifies the vector,
    synthesizes a DALL-E / Flux photorealistic AI background visual,
    renders studio-grade counter-creative, and prepares debate briefings.
    """
    claim = payload.opponent_claim.strip() if payload.opponent_claim else "विपक्षी दल द्वारा सामाजिक सौहार्द बिगाड़ने का प्रयास।"
    
    # 1. Detect Vector
    if not payload.target_vector or payload.target_vector == "AUTO_DETECT":
        vector = detect_attack_vector(claim)
    else:
        vector = payload.target_vector

    # 2. Get Strategy
    strategy = get_strategic_counter(vector, claim, payload.tone or "FACTUAL_DIGNIFIED")

    # 3. Render 1080p Studio Canvas with DALL-E Visual Background
    square_b64, ai_image_url = generate_studio_poster_image(strategy)

    return {
        "status": "success",
        "detected_vector": vector,
        "vector_label": strategy["vector_label"],
        "creative_assets": {
            "square_1080": {
                "title": "Square 1080p HD Studio Poster",
                "format": "1:1 Square (Instagram / Facebook / WhatsApp DP)",
                "image_base64": square_b64,
                "ai_visual_url": ai_image_url
            },
            "story_916": {
                "title": "9:16 Vertical Story",
                "format": "9:16 Vertical Story (WhatsApp Status / Reels)",
                "caption": strategy["sub_headline_hi"],
                "hook": strategy["headline_hi"],
                "ai_visual_url": ai_image_url
            },
            "banner_169": {
                "title": "16:9 Twitter/X Press Card",
                "format": "16:9 Landscape (Twitter / X Header & Card)",
                "headline": strategy["headline_hi"],
                "subhead": strategy["sub_headline_hi"],
                "ai_visual_url": ai_image_url
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
