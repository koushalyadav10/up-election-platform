#!/bin/bash
# ==============================================================================
# UP ELECTION INTELLIGENCE & WAR ROOM PLATFORM — AWS EC2 UBUNTU SETUP SCRIPT
# Runs on AWS Free Tier (t2.micro / t3.micro Ubuntu 24.04 in Mumbai)
# ==============================================================================

set -e

echo ">>> [1/6] Updating Ubuntu Packages..."
sudo apt update && sudo apt upgrade -y

echo ">>> [2/6] Installing Python 3, Node.js, Nginx, and Git..."
sudo apt install -y python3-pip python3-venv python3-dev build-essential nginx git curl certbot python3-certbot-nginx

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo ">>> [3/6] Setting up Python Virtual Environment..."
cd /home/ubuntu/eci
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

echo ">>> [4/6] Building Production React Frontend..."
cd /home/ubuntu/eci/frontend
npm install
npm run build
cd /home/ubuntu/eci

echo ">>> [5/6] Configuring Nginx Reverse Proxy..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/election-platform
sudo ln -sf /etc/nginx/sites-available/election-platform /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ">>> [6/6] Configuring Systemd 24/7 Background Service..."
sudo cp deploy/election-platform.service /etc/systemd/system/election-platform.service
sudo systemctl daemon-reload
sudo systemctl enable election-platform
sudo systemctl restart election-platform

echo "=============================================================================="
echo ">>> SUCCESS! The UP Election Platform is now LIVE 24x7 on this AWS Server!"
echo ">>> Check status: sudo systemctl status election-platform"
echo "=============================================================================="
