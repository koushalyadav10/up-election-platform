import json

with open('E:/eci/data/rbac_users.json', 'r', encoding='utf-8') as f:
    users = json.load(f)['users']

admins = [u for u in users if u['role'] == 'admin']
print("=== 10 SUPER ADMIN ACCOUNTS ===")
for a in admins:
    print(a['user_id'] + " | Pass: " + a['password'] + " | " + a['name'] + " | Mobile: " + a['mobile'] + " | " + a['district'])

print("\n=== 50 EDITOR ACCOUNTS (SHOWING FIRST 15) ===")
editors = [u for u in users if u['role'] == 'editor']
for e in editors[:15]:
    print(e['user_id'] + " | Pass: " + e['password'] + " | " + e['name'] + " | Mobile: " + e['mobile'] + " | " + e['district'])
