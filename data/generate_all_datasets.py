# -*- coding: utf-8 -*-
"""
E:/eci/data/generate_all_datasets.py
Generates two authoritative, comprehensive files for all 75 Districts of Uttar Pradesh:
1. E:/eci/data/district_ground_intelligence.json
2. E:/eci/data/up_caste_demographics.json
"""

import json
import sqlite3
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent

conn = sqlite3.connect(DATA_DIR / "up_election.db")
cur = conn.cursor()

# Get official 75 districts
cur.execute("SELECT id, name FROM districts ORDER BY name")
db_districts = cur.fetchall()

# Map historical intel
cur.execute("""
    SELECT DISTINCT district, pc_no, pc_name, ac_no, ac_name, 
                    winner_2022_party, winner_2022_candidate, 
                    lead_2024_party, lead_2024_candidate, category
    FROM ac_historical_intelligence
""")
raw_intel = cur.fetchall()
conn.close()

def norm_name(n):
    return n.lower().replace(" ", "").replace("w", "v").replace("-", "")

intel_by_dist = {}
for row in raw_intel:
    d = row[0]
    if not d:
        continue
    nd = norm_name(d)
    intel_by_dist.setdefault(nd, []).append(row)

# Region mapping for all 75 districts
DISTRICT_REGION = {
    # Western UP (14)
    "Agra": "Western UP", "Aligarh": "Western UP", "Baghpat": "Western UP", "Bulandshahr": "Western UP",
    "Firozabad": "Western UP", "Gautam Buddha Nagar": "Western UP", "Ghaziabad": "Western UP", "Hapur": "Western UP",
    "Hathras": "Western UP", "Mathura": "Western UP", "Meerut": "Western UP", "Muzaffarnagar": "Western UP",
    "Saharanpur": "Western UP", "Shamli": "Western UP",
    
    # Rohilkhand (9)
    "Amroha": "Rohilkhand", "Bareilly": "Rohilkhand", "Bijnor": "Rohilkhand", "Budaun": "Rohilkhand",
    "Moradabad": "Rohilkhand", "Pilibhit": "Rohilkhand", "Rampur": "Rohilkhand", "Sambhal": "Rohilkhand",
    "Shahjahanpur": "Rohilkhand",
    
    # Braj & Lower Doab (7)
    "Auraiya": "Braj", "Etah": "Braj", "Etawah": "Braj", "Farrukhabad": "Braj",
    "Kannauj": "Braj", "Kasganj": "Braj", "Mainpuri": "Braj",
    
    # Awadh (Central UP) (14)
    "Amethi": "Awadh", "Ayodhya": "Awadh", "Barabanki": "Awadh", "Fatehpur": "Awadh",
    "Hardoi": "Awadh", "Kanpur Dehat": "Awadh", "Kanpur Nagar": "Awadh", "Lakhimpur Kheri": "Awadh",
    "Lucknow": "Awadh", "Pratapgarh": "Awadh", "Raebareli": "Awadh", "Sitapur": "Awadh",
    "Sultanpur": "Awadh", "Unnao": "Awadh",
    
    # Bundelkhand (7)
    "Banda": "Bundelkhand", "Chitrakoot": "Bundelkhand", "Hamirpur": "Bundelkhand", "Jalaun": "Bundelkhand",
    "Jhansi": "Bundelkhand", "Lalitpur": "Bundelkhand", "Mahoba": "Bundelkhand",
    
    # Purvanchal (Eastern UP & Terai) (24)
    "Ambedkar Nagar": "Purvanchal", "Azamgarh": "Purvanchal", "Bahraich": "Purvanchal", "Ballia": "Purvanchal",
    "Balrampur": "Purvanchal", "Basti": "Purvanchal", "Bhadohi": "Purvanchal", "Chandauli": "Purvanchal",
    "Deoria": "Purvanchal", "Ghazipur": "Purvanchal", "Gonda": "Purvanchal", "Gorakhpur": "Purvanchal",
    "Jaunpur": "Purvanchal", "Kaushambi": "Purvanchal", "Kushinagar": "Purvanchal", "Maharajganj": "Purvanchal",
    "Mau": "Purvanchal", "Mirzapur": "Purvanchal", "Prayagraj": "Purvanchal", "Sant Kabir Nagar": "Purvanchal",
    "Shravasti": "Purvanchal", "Siddharthnagar": "Purvanchal", "Sonbhadra": "Purvanchal", "Varanasi": "Purvanchal"
}

# District headquarters
DISTRICT_HQ = {
    "Ambedkar Nagar": "Akbarpur", "Amethi": "Gauriganj", "Gautam Buddha Nagar": "Noida",
    "Jalaun": "Orai", "Kanpur Dehat": "Akbarpur-Mati", "Kushinagar": "Padrauna",
    "Lakhimpur Kheri": "Kheri", "Sant Kabir Nagar": "Khalilabad", "Siddharthnagar": "Navgarh",
    "Sonbhadra": "Robertsganj"
}

# Distinctive local product / key economic pillar
DISTRICT_ODOP = {
    "Saharanpur": "काष्ठ कला (लकड़ी नक्काशी हस्तशिल्प)", "Muzaffarnagar": "गुड़ एवं जैविक शक्कर उद्योग",
    "Shamli": "लौह कला व चीनी मिलें", "Baghpat": "होम फर्निशिंग व हैंडलूम",
    "Meerut": "खेल का सामान (Sports Goods) व कैंची उद्योग", "Ghaziabad": "इंजीनियरिंग गुड्स व इलेक्ट्रॉनिक्स",
    "Gautam Buddha Nagar": "आईटी, ऑटोमोबाइल व गारमेंट्स", "Bulandshahr": "खुर्जा की सिरेमिक पॉटरी व दुग्ध उद्योग",
    "Aligarh": "ताला एवं हार्डवेयर निर्माण", "Hathras": "हींग (Asafoetida) प्रसंस्करण व गुलाल",
    "Mathura": "ठाकुर जी की पोशाक, पेड़ा व कांसा मूर्ति", "Agra": "चमड़ा जूता उद्योग व पेठा",
    "Firozabad": "कांच की चूड़ियां व ग्लासवेयर", "Bijnor": "काष्ठ कला व ब्रश उद्योग",
    "Moradabad": "पीतल हस्तशिल्प (Brassware Handicrafts)", "Sambhal": "हॉर्न-बोन क्राफ्ट व मेंथा ऑयल",
    "Rampur": "जरी-पैचवर्क, वायलिन व चाकू उद्योग", "Amroha": "ढोलक व संगीत वाद्ययंत्र",
    "Budaun": "जरी-जरदोजी व मेंथा प्रसंस्करण", "Bareilly": "जरी-जरदोजी, सुरमा व बांस-बेंत फर्नीचर",
    "Pilibhit": "विश्व प्रसिद्ध बांसुरी उद्योग", "Shahjahanpur": "जरी-जरदोजी व कृषि उपकरण",
    "Mainpuri": "तारकशी कला, लहसुन व तंबाकू", "Etah": "घंटी-घुंघरू (पीतल ढलाई)",
    "Kasganj": "जरी-जरदोजी व मक्का-सरसों", "Farrukhabad": "आलू उत्पादन व ब्लॉक प्रिंटिंग (जरदोजी)",
    "Kannauj": "प्राकृतिक इत्र व सुगंधित तेल", "Etawah": "वस्त्र बुनाई (टेलरिंग) व आलू प्रसंस्करण",
    "Auraiya": "देशी घी व प्लास्टिक प्रसंस्करण", "Kanpur Dehat": "एल्युमिनियम बर्तन व कृषि उत्पाद",
    "Kanpur Nagar": "चमड़ा उत्पाद, कपड़ा व होजरी", "Fatehpur": "बेडशीट व आयरन फेब्रिकेशन",
    "Unnao": "चमड़ा उत्पाद व जरी-जरदोजी", "Lucknow": "चिकनकारी एवं जरदोजी हस्तशिल्प",
    "Rae Bareli": "काष्ठ कला, रेल कोच व आंवला", "Sitapur": "दरी (Durrie) निर्माण व प्लाइवुड",
    "Hardoi": "सैंडिला हथकरघा व कृषि उत्पाद", "Lakhimpur Kheri": "जनजातीय शिल्प व गन्ना उत्पादन",
    "Barabanki": "हथकरघा वस्त्र व मेंथा तेल", "Ayodhya": "गुड़, धार्मिक काष्ठ कला व पर्यटन",
    "Amethi": "मूंज उत्पाद व स्टील फेब्रिकेशन", "Sultanpur": "मूंज क्राफ्ट व कृषि उपकरण",
    "Pratapgarh": "आंवला प्रसंस्करण एवं मुरब्बा उद्योग", "Jalaun": "हस्तनिर्मित कागज (Handmade Paper)",
    "Jhansi": "सॉफ्ट टॉयज व कृषि मशीनरी", "Lalitpur": "जरी रेशम साड़ी व ग्रेनाइट खनन",
    "Hamirpur": "जूती (चमड़ा हस्तशिल्प) व दालें", "Mahoba": "गौरा पत्थर (सोपस्टोन) शिल्प व पान",
    "Banda": "शजर पत्थर (Shajar Stone) शिल्प", "Chitrakoot": "लकड़ी के खिलौने व हर्बल उत्पाद",
    "Bahraich": "गेहूं डंठल हस्तकला व डेयरी", "Shravasti": "जनजातीय हस्तशिल्प व एग्रो उत्पाद",
    "Balrampur": "खाद्य प्रसंस्करण व दाल मिलें", "Gonda": "खाद्य तेल, दालें व मक्का",
    "Siddharthnagar": "कालानमक चावल (बुद्ध चावल)", "Basti": "काष्ठ शिल्प व सिरका उद्योग",
    "Sant Kabir Nagar": "बखिरा पीतल-कांसा बर्तन उद्योग", "Maharajganj": "फर्नीचर उद्योग व कृषि उत्पाद",
    "Gorakhpur": "टेराकोटा मिट्टी शिल्प व हथकरघा", "Kushinagar": "केला फाइबर उत्पाद व बौद्ध पर्यटन",
    "Deoria": "सजावटी कशीदाकारी व गुड़", "Azamgarh": "मुबारकपुर रेशमी साड़ी व काली मिट्टी बर्तन (Nizamabad)",
    "Mau": "पावरलूम कपड़ा बुनाई", "Ballia": "बिंदी उद्योग व प्राकृतिक परफ्यूम",
    "Jaunpur": "ऊनी कालीन, बेना व इमरती", "Ghazipur": "जूट वाल हैंगिंग व अफीम उत्पाद",
    "Chandauli": "जरी-जरदोजी व धान (चावल का कटोरा)", "Varanasi": "बनारसी सिल्क साड़ी, गुलाबी मीनाकारी व लकड़ी खिलौने",
    "Bhadohi": "हस्तनिर्मित कालीन (Carpet Capital of India)", "Mirzapur": "हाथ से बनी दरी, कालीन व पीतल बर्तन",
    "Sonbhadra": "काष्ठ कला, खनिज व ऊर्जा", "Prayagraj": "मूंज उत्पाद व अमरूद प्रसंस्करण",
    "Kaushambi": "इलाहाबादी सुरखा अमरूद व केला"
}

print("Base setup loaded.")
