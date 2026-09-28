import json
import random
import string
from datetime import datetime

UP_DISTRICTS = [
    'Lucknow', 'Varanasi', 'Kanpur Nagar', 'Agra', 'Prayagraj', 'Meerut', 'Gorakhpur', 
    'Mathura', 'Aligarh', 'Bareilly', 'Ayodhya', 'Azamgarh', 'Saharanpur', 'Moradabad', 
    'Ghaziabad', 'Gautam Buddha Nagar', 'Muzaffarnagar', 'Jhansi', 'Banda', 'Mirzapur',
    'Ballia', 'Deoria', 'Ghazipur', 'Jaunpur', 'Basti', 'Gonda', 'Bahraich', 'Sitapur',
    'Lakhimpur Kheri', 'Hardoi', 'Unnao', 'Raebareli', 'Amethi', 'Sultanpur', 'Pratapgarh',
    'Fatehpur', 'Kaushambi', 'Chitrakoot', 'Hamirpur', 'Mahoba', 'Jalaun', 'Lalitpur',
    'Etawah', 'Mainpuri', 'Kannauj', 'Farrukhabad', 'Auraiya', 'Kanpur Dehat', 'Firozabad',
    'Etah', 'Kasganj', 'Hathras', 'Bulandshahr', 'Hapur', 'Baghpat', 'Shamli', 'Bijnor',
    'Amroha', 'Sambhal', 'Rampur', 'Budaun', 'Shahjahanpur', 'Pilibhit', 'Shravasti',
    'Balrampur', 'Siddharthnagar', 'Sant Kabir Nagar', 'Maharajganj', 'Kushinagar', 'Chandauli',
    'Sonbhadra', 'Bhadohi', 'Ambedkar Nagar', 'Barabanki', 'Mau'
]

ADMIN_NAMES = [
    ("Rajesh Kumar Tiwari", "Super Administrator", "9876543201"),
    ("Priya Sharma Singh", "State Operations Chief", "9876543202"),
    ("Anil Verma Gupta", "Electoral Strategy Director", "9876543203"),
    ("Dr. Sanjay Yadav", "Data Intelligence Head", "9876543204"),
    ("Kavita Maurya", "Field Operations Director", "9876543205"),
    ("Mohd. Tariq Siddiqui", "Alliance & Booth Oversight", "9876543206"),
    ("Sunil Kumar Paswan", "War Room Coordinator", "9876543207"),
    ("Neelam Chauhan", "Demographics & Analytics Chief", "9876543208"),
    ("Devendra Pal", "Western UP Zonal Admin", "9876543209"),
    ("Rakesh Nishad", "Purvanchal Zonal Admin", "9876543210"),
]

EDITOR_NAMES = [
    "Ramesh Pal Yadav", "Santosh Kumar Bind", "Meena Devi Kushwaha", "Mohd. Azhar Khan",
    "Dinesh Pratap Singh", "Sunita Rani Maurya", "Arun Kumar Jatav", "Pooja Sharma",
    "Virendra Singh Yadav", "Geeta Devi Nishad", "Alok Kumar Tiwari", "Farzana Begum",
    "Mahesh Chandra Verma", "Reena Kumari Patel", "Satish Kumar Prajapati", "Anuradha Pandey",
    "Gopal Krishna Lodhi", "Sarita Devi Rajbhar", "Vijay Kumar Shakya", "Suman Lata Gautam",
    "Brijesh Kumar Saini", "Kiran Devi Yadav", "Harendra Singh Tomar", "Zeenat Fatima",
    "Naresh Kumar Kashyap", "Poonam Devi Paswan", "Ajay Kumar Dixit", "Shabana Parveen",
    "Manoj Kumar Baghel", "Pushpa Devi Chauhan", "Sudhir Kumar Kurmi", "Ritu Singh",
    "Kamlesh Kumar Balmiki", "Shabnam Bano", "Pankaj Kumar Rawat", "Rekha Devi Jaiswal",
    "Surendra Singh Gurjar", "Archana Kumari", "Dharmendra Kumar Yadav", "Seema Devi Kori",
    "Ashok Kumar Mishra", "Nasreen Akhtar", "Mukesh Kumar Dhobi", "Kusum Lata Verma",
    "Rajendra Prasad Pal", "Babita Devi Yadav", "Jitendra Singh Raghuvanshi", "Shahina Bano",
    "Harish Chandra Sonkar", "Mamta Devi Bind"
]

DESIGNATIONS = [
    "Field Coordinator", "Booth Analyst", "District Supervisor", 
    "Data Entry Operator", "Campaign Manager", "Research Analyst"
]

def generate_strong_password(prefix="Sp@2027#"):
    chars = string.ascii_letters + string.digits
    random_part = ''.join(random.choice(chars) for _ in range(4))
    return f"{prefix}{random_part}"

users = []

# Generate 10 Admins
for i, (name, desig, mobile) in enumerate(ADMIN_NAMES, 1):
    uid = f"2027SP_ADM{str(i).zfill(2)}"
    pw = generate_strong_password(prefix=f"Sp@2027#A{i}")
    users.append({
        "user_id": uid,
        "name": name,
        "mobile": mobile,
        "role": "admin",
        "password": pw,
        "designation": desig,
        "district": UP_DISTRICTS[i - 1],
        "created_at": "2027-01-01T00:00:00",
        "created_by": "system",
        "is_active": True
    })

# Generate 50 Editors
for i, name in enumerate(EDITOR_NAMES, 1):
    uid = f"2027SP_EDT{str(i).zfill(2)}"
    pw = generate_strong_password(prefix=f"Ed@2027#E{str(i).zfill(2)}")
    mobile = f"987654{3200 + 10 + i}"
    district = UP_DISTRICTS[(i + 9) % len(UP_DISTRICTS)]
    desig = DESIGNATIONS[i % len(DESIGNATIONS)]
    users.append({
        "user_id": uid,
        "name": name,
        "mobile": mobile,
        "role": "editor",
        "password": pw,
        "designation": desig,
        "district": district,
        "created_at": "2027-01-01T00:00:00",
        "created_by": "system",
        "is_active": True
    })

with open("E:/eci/data/rbac_users.json", "w", encoding="utf-8") as f:
    json.dump({"users": users}, f, indent=2, ensure_ascii=False)

print(f"Generated {len(users)} users successfully:")
print(f"- Admins: {len([u for u in users if u['role'] == 'admin'])} (IDs: 2027SP_ADM01 to 2027SP_ADM10)")
print(f"- Editors: {len([u for u in users if u['role'] == 'editor'])} (IDs: 2027SP_EDT01 to 2027SP_EDT50)")
