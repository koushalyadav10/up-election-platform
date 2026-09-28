# -*- coding: utf-8 -*-
"""
E:/eci/data/generate_75_hyperlocal_intelligence.py
Master Compiler: Integrates 100% unique, hyper-local, viral ground intelligence,
sharp political attack dossiers, and stage rally speeches for ALL 75 Districts of Uttar Pradesh.
Directly corners CM Yogi Adityanath, his cabinet ministers, and incumbent MPs/MLAs.
"""

import json
import sqlite3
import re
from pathlib import Path
from collections import Counter

# Add current data dir to sys.path
import sys
DATA_DIR = Path(__file__).resolve().parent
sys.path.append(str(DATA_DIR))

from districts_intel_western_braj import WESTERN_BRAJ_PROFILES
from districts_intel_rohilkhand_awadh import ROHILKHAND_AWADH_PROFILES
from districts_intel_bundelkhand_purvanchal import BUNDELKHAND_PURVANCHAL_PROFILES

# Merge all profiles
MASTER_PROFILES = {}
MASTER_PROFILES.update(WESTERN_BRAJ_PROFILES)
MASTER_PROFILES.update(ROHILKHAND_AWADH_PROFILES)
MASTER_PROFILES.update(BUNDELKHAND_PURVANCHAL_PROFILES)

print(f"Total Master District Profiles loaded: {len(MASTER_PROFILES)}")

def norm_str(s):
    if not s:
        return ""
    return s.lower().replace(" ", "").replace("w", "v").replace("-", "").strip()

# Connect to database to get official AC, PC, and candidate details
conn = sqlite3.connect(DATA_DIR / "up_election.db")
cur = conn.cursor()

cur.execute("SELECT id, name FROM districts ORDER BY name")
db_districts = cur.fetchall()

cur.execute("""
    SELECT DISTINCT ac_no, ac_name, district, pc_no, pc_name, category,
                    winner_2022_party, winner_2022_candidate, margin_2022,
                    lead_2024_party, lead_2024_candidate, margin_2024
    FROM ac_historical_intelligence
    ORDER BY ac_no ASC
""")
all_acs = cur.fetchall()
conn.close()

dist_to_acs = {}
for ac in all_acs:
    d = ac[2]
    if not d:
        continue
    nd = norm_str(d)
    dist_to_acs.setdefault(nd, []).append(ac)

print(f"Mapped ACs for {len(dist_to_acs)} districts from database.")

# Map profile to DB district name
norm_to_profile = {norm_str(k): (k, v) for k, v in MASTER_PROFILES.items()}

compiled_intelligence = {}

for dist_id, db_dist_name in db_districts:
    nd = norm_str(db_dist_name)
    prof_tuple = norm_to_profile.get(nd)
    
    if not prof_tuple:
        # Fuzzy match
        for pk, pv in norm_to_profile.items():
            if pk in nd or nd in pk:
                prof_tuple = pv
                break
                
    if not prof_tuple:
        print(f"WARNING: Profile not found for DB district: {db_dist_name}")
        continue
        
    prof_name, prof = prof_tuple
    acs = dist_to_acs.get(nd, [])
    if not acs:
        for ak, av in dist_to_acs.items():
            if ak in nd or nd in ak:
                acs = av
                break

    # Extract AC and PC lists
    ac_names = [a[1] for a in acs]
    pc_names = list(dict.fromkeys([a[4] for a in acs if a[4]]))
    
    # 2022 & 2024 tallies
    tally_2022 = Counter([a[6] for a in acs if a[6]])
    tally_2024 = Counter([a[9] for a in acs if a[9]])
    
    # Generate Incumbent Accountability list
    incumbents = []
    district_incumbent_summary = prof.get("incumbent_accountability", "")
    scandals = prof.get("viral_scandals", [])
    primary_scandal = scandals[0] if scandals else "विकास कार्यों में भारी भ्रष्टाचार व उपेक्षा"
    secondary_scandal = scandals[1] if len(scandals) > 1 else "जनसमस्याओं की अनदेखी"
    
    for a in acs:
        ac_no, ac_name, _, pc_no, pc_name, cat, w_pty, w_cand, m_2022, l_pty, l_cand, m_2024 = a
        w_pty_str = w_pty or "BJP"
        w_cand_str = w_cand or "स्थानीय विधायक"
        l_pty_str = l_pty or "SP"
        l_cand_str = l_cand or "गठबंधन प्रत्याशी"
        
        # Craft realistic, sharp accountability notes per AC
        if w_pty_str in ["BJP", "AD(S)", "NISHAD", "RLD"]:
            if l_pty_str in ["SP", "INC"]:
                note = f"भाजपा विधायक {w_cand_str} के खिलाफ जनता में भीषण जनाक्रोश। 2024 में जनता ने {l_cand_str} (इंडिया गठबंधन) को बढ़त देकर सबक सिखाया। क्षेत्र में {primary_scandal} और वादाखिलाफी का भारी असर।"
            else:
                note = f"सत्ता के अहंकार और प्रशासनिक मनमानी का प्रतीक। क्षेत्र के गांवों और मोहल्लों में सड़कें बदहाल, बिजली कटौती और नौजवानों में बेरोजगारी से तीखा रोष। {secondary_scandal} पर मौन साधे रहे।"
        elif w_pty_str in ["SP", "INC"]:
            note = f"समाजवादी विधायक {w_cand_str} ने जनहित, किसानों और नौजवानों के हक की लड़ाई लड़ी। सरकारी उपेक्षा और विकास कार्यों में जानबूझकर बजट रोकने के बावजूद जनता के बीच डटे रहे। 2024 में जनता का अटूट विश्वास बरकरार रहा।"
        else:
            note = f"विधायक {w_cand_str} क्षेत्र की जनता की बुनियादी समस्याओं (सड़क, नाली, स्वास्थ्य, शिक्षा) पर पूरी तरह निष्क्रिय रहे। सत्ता के दबाव में जनता के हक की आवाज उठाने में विफल।"
            
        incumbents.append({
            "ac_no": ac_no,
            "ac_name": ac_name,
            "mla_2022_party": w_pty_str,
            "mla_2022_candidate": w_cand_str,
            "lead_2024_party": l_pty_str,
            "lead_2024_candidate": l_cand_str,
            "accountability_notes": note
        })

    # Promises vs Reality
    promises = prof.get("promises_vs_reality", [])
    landmarks = prof.get("local_landmarks", [])
    landmark_str = "、".join(landmarks[:3]) if landmarks else prof.get("hq", db_dist_name)
    landmarks_all_str = "、".join(landmarks) if landmarks else prof.get("hq", db_dist_name)
    vision_list = prof.get("vision_2027", [])
    
    # 4 Tone Speeches Crafting
    speech_hooks = prof.get("speech_hooks", {})
    attack_hook = speech_hooks.get("attack", "")
    kisan_hook = speech_hooks.get("kisan", "")
    
    # 1. AGGRESSIVE SPEECH (तीखा प्रहार व मुख्यमंत्री पर सीधा हमला)
    scandal_bullet_points = "\n".join([f"• {s}" for s in scandals])
    incumbent_callout = f"{db_dist_name} में सत्ताधारी नेताओं का अहंकार सिर चढ़कर बोल रहा है। {district_incumbent_summary}"
    
    aggressive_speech = f"""{attack_hook}

साथियों, मुख्यमंत्री योगी आदित्यनाथ जी लखनऊ के वातानुकूलित कमरों में बैठकर आंकड़े उछालते हैं, लेकिन क्या उन्होंने कभी {db_dist_name} की जमीनी हकीकत देखी है? क्या उन्होंने देखा कि {landmark_str} की सड़कों और गलियों में आम जनता किन मुश्किलों में जी रही है? 

डबल इंजन सरकार के 8 सालों में {db_dist_name} को विकास नहीं, बल्कि घपले, दंगे जैसी नफरत, प्रशासनिक तानाशाही और झूठे वादे मिले हैं:
{scandal_bullet_points}

{incumbent_callout}

आज हमारे {db_dist_name} के सम्मानित बुजुर्ग, माताएं-बहनें, मेहनतकश किसान और नौजवान पूछ रहे हैं—8 साल में आपने {prof.get('odop', 'स्थानीय रोजगार')} के लिए क्या किया? हमारे अस्पतालों में डॉक्टर क्यों नहीं हैं? हमारे स्कूल-कॉलेजों में शिक्षक क्यों नहीं हैं? 

2024 के लोकसभा चुनाव में आपने बदलाव की पहली चिंगारी जलाई थी। 2027 के विधानसभा चुनाव में उस चिंगारी को आंधी बनाकर इस अहंकारी, जनविरोधी सत्ता को उखाड़ फेंकना है! 2027 में समाजवादी पार्टी की पूर्ण बहुमत की सरकार बनेगी और {db_dist_name} के स्वाभिमान और तरक्की का नया सूरज उगेगा!"""

    # 2. KISAN SPEECH (अन्नदाता संवाद व ग्रामीण समस्याएं)
    kisan_speech = f"""{kisan_hook}

मेरे अन्नदाता किसान भाइयों, देश का पेट भरने वाला किसान आज भाजपा सरकार की नीतियों के कारण अपने ही खेत में लाचार खड़ा है। दिनभर खून-पसीना बहाकर जब आप फसल तैयार करते हैं, तो रात को कड़ाके की ठंड और भरी बारिश में आपको लाठी लेकर खेतों की रखवाली करनी पड़ती है! छुट्टा सांड और आवारा गोवंश पूरी फसल तबाह कर रहे हैं, और सरकार के गोशालाओं का बजट भाजपाई बिचौलियों की जेब में जा रहा है!

{db_dist_name} के किसानों के साथ डबल इंजन सरकार ने केवल छल किया है:
• नलकूपों के मुफ्त बिजली के नाम पर भारी-भरकम फर्जी बिल और मीटर लगाकर किसानों का उत्पीड़न।
• बुवाई के समय डीएपी (DAP) और यूरिया खाद की दुकानों पर लाठियां और कालाबाजारी।
• नहरों के टेल तक पानी का न पहुंचना और सरकारी नलकूपों का महीनों से खराब पड़ा रहना।
• फसल का न्यूनतम समर्थन मूल्य (MSP) न मिलना—बिचौलियों और आढ़तियों की लूट।

2027 में समाजवादी सरकार बनते ही हमारा किसान संकल्प:
1. कृषि नलकूपों के लिए 100% मुफ्त बिजली बिना किसी शर्त के दी जाएगी।
2. हर फसल के लिए स्वामीनाथन आयोग के अनुसार कानूनी MSP गारंटी और 14 दिन के अंदर भुगतान।
3. हर ब्लॉक स्तर पर अत्याधुनिक गो-संरक्षण केंद्र और आवारा पशुओं से खेतों की पूर्ण मुक्ति।
4. {db_dist_name} की नहरों, रजबहों और माइनरों की टेल तक सिंचाई के लिए भरपूर पानी की गारंटी!"""

    # 3. YOUTH & ROZGAR SPEECH (युवा, छात्र व पेपर लीक पर प्रहार)
    youth_speech = f"""{db_dist_name} के मेरे क्रांतिकारी और ऊर्जावान नौजवान साथियों, छात्र-छात्राओं!

इस सरकार ने उत्तर प्रदेश के युवाओं के सपनों को कुचलने का जो पाप किया है, उसे इतिहास कभी माफ नहीं करेगा! सिपाही भर्ती परीक्षा में 60 लाख नौजवान रात-दिन एक करके परीक्षा देने गए, किराया लगाकर पहुंचे, और शाम को खबर आई कि पेपर लीक हो गया! आरओ/एआरओ (RO/ARO) का पेपर बिक गया, शिक्षक भर्ती में दलित-पिछड़े युवाओं का आरक्षण छीन लिया गया, और जब नौजवान अपने हक के लिए लखनऊ की सड़कों पर उतरे, तो उन पर लाठियां बरसाई गईं!

{db_dist_name} के {landmark_str} के डिग्री कॉलेजों और कोचिंग संस्थानों में तैयारी करने वाले मेरे भाइयों, आपका क्या कसूर था?
• आपकी उम्र निकलती जा रही है, माता-पिता कर्ज लेकर आपको पढ़ा रहे हैं, और सरकार सिर्फ पेपर लीक माफिया को संरक्षण दे रही है।
• सरकारी नौकरियों में स्थायी भर्ती बंद करके ठेकेदारी और आउटसोर्सिंग पर 8-10 हजार रुपये में शोषण किया जा रहा है।
• सेना में जाने का सपना देखने वाले नौजवानों पर 4 साल की 'अग्निवीर' थोपकर उनके भविष्य के साथ खिलवाड़ किया गया।

मैं आज {db_dist_name} के मंच से वादा करता हूं—2027 में समाजवादी सरकार आते ही:
1. 3 लाख रिक्त सरकारी पदों पर पारदर्शी, समयबद्ध भर्ती और पेपर लीक माफिया पर आजीवन कारावास की सजा।
2. सभी प्रतियोगी परीक्षाओं के फॉर्म बिल्कुल मुफ्त होंगे और परीक्षा के दिन रोडवेज बसों में निशुल्क यात्रा मिलेगी।
3. आउटसोर्सिंग और संविदा प्रथा का अंत कर कर्मचारियों को सम्मानजनक मानदेय और पुरानी पेंशन (OPS) बहाल होगी।
4. हर शिक्षित बेरोजगार युवा को 'समाजवादी युवा रोजगार गारंटी' और स्वावलंबन के लिए बिना ब्याज ऋण उपलब्ध कराया जाएगा!"""

    # 4. VIKAS & ODOP SPEECH (उद्योग, विकास व नागरिक सुविधाएं)
    vikas_speech = f"""{db_dist_name} के व्यापारी बंधुओं, कारीगरों, श्रमिकों और प्रबुद्ध नागरिकों!

डबल इंजन सरकार ने लखनऊ में 'इन्वेस्टर्स समिट' के नाम पर लाखों करोड़ के एमओयू (MoU) के बड़े-बड़े होर्डिंग लगाए, लेकिन मैं आपसे पूछता हूं—क्या {db_dist_name} की जमीन पर एक भी नया कारखाना लगा? क्या हमारे स्थानीय {prof.get('odop', 'शिल्प व उद्योग')} को कोई सरकारी मदद मिली? 

हकीकत यह है कि जीएसटी (GST) की मार, बिजली के भारी-भरकम कॉमर्शियल बिल, इंस्पेक्टर राज और अफसरों की रिश्वतखोरी ने {db_dist_name} के पारंपरिक व्यापार और छोटे उद्योगों की कमर तोड़ दी है।

शहर और कस्बों का हाल देखिए:
• {landmark_str} में जलभराव, टूटी सड़कें और जाम की गंभीर समस्या।
• जिला अस्पताल और ट्रॉमा सेंटर में विशेषज्ञ डॉक्टरों, वेंटिलेटर और जरूरी दवाओं का अभाव—मरीजों को रेफर करने की मजबूरी।
• सीवर और सफाई व्यवस्था पूरी तरह ध्वस्त, नगर पालिका और नगर निगमों में ठेकेदारों की लूट।

2027 में समाजवादी सरकार का {db_dist_name} के लिए ठोस विकास विजन:
1. {prof.get('odop', 'स्थानीय उद्योग')} के लिए विशेष सब्सिडी, आधुनिक क्लस्टर, टेस्टिंग लैब और शून्य टैक्स विशेष प्रोत्साहन जोन।
2. {db_dist_name} के जिला अस्पताल को अत्याधुनिक सुपर-स्पेशियलिटी अस्पताल में अपग्रेड करना।
3. {landmarks_all_str} के प्रमुख मार्गों पर 4-लेन चौड़ीकरण, आधुनिक बाईपास और ओवरब्रिज का निर्माण।
4. शहर और ग्रामीण कस्बों में आधुनिक ड्रेनेज व सीवरेज सिस्टम, ताकि बारिश में एक बूंद पानी न भरे।
5. नए औद्योगिक गलियारे की स्थापना कर स्थानीय युवाओं के लिए स्थानीय स्तर पर 50,000+ रोजगार सृजन!"""

    rally_speeches = {
        "aggressive": aggressive_speech.strip(),
        "kisan": kisan_speech.strip(),
        "youth": youth_speech.strip(),
        "vikas": vikas_speech.strip()
    }

    # WHATSAPP FORMAT (वायरल शेयरिंग फॉर्मेट)
    top_scandals = "\n".join([f"❌ *घोटाला {idx+1}:* {s}" for idx, s in enumerate(scandals[:3])])
    vision_points = "\n".join([f"✅ *{idx+1}.* {p}" for idx, p in enumerate(vision_list[:4])])
    
    whatsapp_format = f"""*🚨 {db_dist_name} ग्राउंड रिपोर्ट: डबल इंजन सरकार का पर्दाफाश! 🚨*

📍 *जनपद:* {db_dist_name} ({prof.get('region', 'उत्तर प्रदेश')})
🏛️ *मुख्यालय:* {prof.get('hq', db_dist_name)} | 🏺 *ODOP:* {prof.get('odop', 'शिल्प')}

*🔥 {db_dist_name} के प्रमुख वायरल घोटाले व विफलताएं:*
{top_scandals}

*🌾 किसान व नौजवानों का दर्द:*
• छुट्टा गोवंश से बर्बाद फसलें, खाद की भारी किल्लत व कालाबाजारी
• सिपाही व आरओ/एआरओ पेपर लीक से लाखों छात्रों का भविष्य दांव पर
• {landmark_str} में बदहाल स्वास्थ्य व जलभराव

*🚩 2027 में समाजवादी सरकार का संकल्प:*
{vision_points}

👉 *बदलाव की आवाज बनें! इस संदेश को {db_dist_name} के हर व्हाट्सएप ग्रुप और बूथ तक पहुंचाएं!*
#SamajwadiParty #MissionUP2027 #{db_dist_name.replace(' ', '')} #PDA""".strip()

    # PRINT CUE CARD (मंच भाषण के लिए त्वरित संकेत कार्ड)
    print_cue_card = {
        "rally_title": f"{db_dist_name} महा-बदलाव जनसभा 2027 - मंच भाषण संकेत (Stage Cue Card)",
        "district": db_dist_name,
        "region": prof.get("region", "उत्तर प्रदेश"),
        "key_slogans": [
            f"{db_dist_name} ने ठाना है, 2027 में साइकिल को जिताना है!",
            f"किसान-युवा का सम्मान, समाजवादी सरकार से बनेगी बात!",
            f"झूठे वादे बंद करो, {prof.get('odop', 'स्थानीय कामगार')} को इंसाफ दो!",
            "अहंकारी सत्ता को विदा करो, PDA का राज कायम करो!"
        ],
        "opening_hooks": [
            f"{db_dist_name} की ऐतिहासिक, क्रांतिकारी और स्वाभिमानी जनता को लाल सलाम और प्रणाम!",
            f"{landmark_str} की गलियों में गूंजती बदलाव की हुंकार का मंच से स्वागत।"
        ],
        "attack_points": [
            f"वायरल मुद्दा: {scandals[0] if scandals else 'भ्रष्टाचार व अफसरशाही'}",
            f"क्षेत्रीय घोटाला: {scandals[1] if len(scandals) > 1 else 'विकास का झूठा दावा'}",
            f"मुख्यमंत्री योगी जी के गृह क्षेत्र/शासन का सच: {primary_scandal}",
            f"जनप्रतिनिधियों की नाकामी: {district_incumbent_summary[:120]}..."
        ],
        "vision_promises": vision_list
    }

    compiled_intelligence[db_dist_name] = {
        "district_id": dist_id,
        "district_name": db_dist_name,
        "region": prof.get("region", "उत्तर प्रदेश"),
        "headquarters": prof.get("hq", db_dist_name),
        "odop_product": prof.get("odop", "स्थानीय उत्पाद"),
        "total_acs": len(acs),
        "total_pcs": len(pc_names),
        "assembly_constituencies": ac_names,
        "parliamentary_constituencies": pc_names,
        "party_tally_2022": dict(tally_2022),
        "party_tally_2024": dict(tally_2024),
        "promises_vs_reality": promises,
        "incumbent_accountability": incumbents,
        "vision_2027": vision_list,
        "rally_speeches": rally_speeches,
        "whatsapp_format": whatsapp_format,
        "print_cue_card": print_cue_card
    }

# Save to output file
out_path = DATA_DIR / "district_ground_intelligence.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(compiled_intelligence, f, ensure_ascii=False, indent=2)

print(f"\nSUCCESS: Successfully compiled hyper-local ground intelligence for {len(compiled_intelligence)} districts into {out_path}!")
