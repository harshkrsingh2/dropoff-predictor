# Academic Lens — Complete Beginner Deployment Guide

## What You Are Building
A professional AI-powered student analytics dashboard that looks exactly like
the Academic Lens screenshots. It has:
- A sidebar with navigation
- A data upload page with drag & drop
- A dashboard with charts and student tables  
- An AI chat panel on the right
- A Flask Python backend powering all AI features

---

## STEP 1 — Install Python (if you don't have it)

1. Go to https://www.python.org/downloads/
2. Click "Download Python 3.11" (the big yellow button)
3. Run the installer
4. IMPORTANT: Check the box "Add Python to PATH" before clicking Install
5. Verify it worked: open Terminal (Mac) or Command Prompt (Windows) and type:
   python --version
   You should see: Python 3.11.x

---

## STEP 2 — Install VS Code (your code editor)

1. Go to https://code.visualstudio.com/
2. Download and install for your operating system
3. This is where you will write and run your code

---

## STEP 3 — Set Up Your Project

Open Terminal (Mac) or Command Prompt (Windows) and run these commands
one by one. Press Enter after each line:

   mkdir academic-lens
   cd academic-lens

Now copy all the project files into this folder:
   - app.py
   - requirements.txt
   - Procfile
   - .env.example
   - templates/index.html
   - static/css/style.css
   - static/js/app.js

---

## STEP 4 — Create a Virtual Environment

A virtual environment keeps your project's packages separate from other Python
projects on your computer. Think of it as a clean room just for this project.

Run these commands:

On Mac/Linux:
   python -m venv venv
   source venv/bin/activate

On Windows:
   python -m venv venv
   venv\Scripts\activate

You will see (venv) appear at the start of your terminal line.
This means the virtual environment is active. Good!

---

## STEP 5 — Install All Packages

With your virtual environment active, run:
   pip install -r requirements.txt

This installs Flask, Anthropic AI, Pandas and everything else.
It may take 1-2 minutes. You will see a lot of text scrolling — that is normal.

---

## STEP 6 — Get Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up for a free account
3. Click "API Keys" in the left menu
4. Click "Create Key"
5. Copy the key — it starts with sk-ant-...
6. IMPORTANT: Never share this key publicly or commit it to GitHub

---

## STEP 7 — Create Your .env File

In your project folder, create a file called exactly: .env
(Note: no .example at the end — just .env)

Open it and type:
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

Replace "sk-ant-your-actual-key-here" with your real key from Step 6.
Save the file.

---

## STEP 8 — Run the App Locally

Make sure your virtual environment is active (you see (venv) in terminal).
Then run:
   python app.py

You will see:
   Starting Academic Lens on http://localhost:5000

Open your web browser and go to:
   http://localhost:5000

Your dashboard is now running! Try clicking "View Templates" to load sample data.

---

## STEP 9 — Test All Features

1. Click "View Templates" to load 12 sample students
2. Watch the validation progress bar animate
3. See the data preview table appear
4. Click "Dashboard" in the sidebar to see charts
5. Click "Students" to see student cards
6. Type a question in the AI chat on the right
7. Click "Generate Report" to get an AI report on the Insights page

---

## STEP 10 — Deploy to the Internet (Render — Free)

### 10a. Create a GitHub Account
Go to https://github.com/ and sign up for free.

### 10b. Install Git
Go to https://git-scm.com/downloads and install Git for your OS.

### 10c. Push Your Code to GitHub

In your terminal (with virtual environment active):
   git init
   git add .
   git commit -m "Initial commit - Academic Lens"

Go to GitHub.com → New Repository → Name it "academic-lens" → Create
Then run the commands GitHub shows you (they look like):
   git remote add origin https://github.com/YOURNAME/academic-lens.git
   git push -u origin main

### 10d. Deploy on Render

1. Go to https://render.com and sign up (free)
2. Click "New" → "Web Service"
3. Click "Connect a repository" → select "academic-lens"
4. Fill in the form:
   - Name: academic-lens
   - Runtime: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn app:app
5. Scroll down to "Environment Variables"
6. Click "Add Environment Variable"
   - Key:   ANTHROPIC_API_KEY
   - Value: sk-ant-your-actual-key-here
7. Click "Create Web Service"
8. Wait 3-5 minutes for deployment
9. Your live URL will appear at the top: https://academic-lens.onrender.com

---

## FOLDER STRUCTURE (What Each File Does)

academic-lens/
├── app.py                  ← Python Flask backend (the brain)
├── requirements.txt        ← List of packages to install
├── Procfile                ← Tells Render how to start the app
├── .env                    ← Your secret API key (never share this)
├── .env.example            ← Template for the .env file
├── templates/
│   └── index.html          ← The main HTML page (the face)
└── static/
    ├── css/
    │   └── style.css       ← All the styling and design
    └── js/
        └── app.js          ← Frontend JavaScript (interactivity)

---

## TROUBLESHOOTING

Problem: "python is not recognized"
Solution: Restart your terminal after installing Python.
          On Windows, try "py" instead of "python".

Problem: "No module named flask"  
Solution: Make sure your virtual environment is active (you see (venv)).
          Run: pip install flask

Problem: AI chat shows "Could not reach server"
Solution: Check your .env file has the correct API key.
          Restart the server with: python app.py

Problem: Page shows "Internal Server Error"
Solution: Look at the terminal running app.py for the error message.
          Usually it is a missing package — run: pip install -r requirements.txt

Problem: Render deployment fails
Solution: Check the Render "Logs" tab for errors.
          Most common fix: make sure all files are committed to GitHub.

---

## API ENDPOINTS REFERENCE

GET  /                      Returns the dashboard HTML page
POST /api/upload            Upload CSV, returns student JSON array
POST /api/chat              Send a message, returns AI reply
POST /api/insight           Get AI insight for one student
POST /api/report            Generate full class AI report
POST /api/email             Generate a personalized student email

---

## NEXT STEPS (After It Works)

1. Add a login system with Flask-Login
2. Store data in SQLite database with Flask-SQLAlchemy
3. Add export to PDF with ReportLab
4. Add email sending with Flask-Mail
5. Add user accounts for multiple teachers

Happy building!
