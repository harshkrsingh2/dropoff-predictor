# 🎯 Academic Lens — Student Drop-off Predictor

<div align="center">

**An AI-powered analytics dashboard that helps educators spot struggling students before it's too late.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-4f8ef7?style=for-the-badge&logo=vercel)](https://dropoff-predictor.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-View%20Repo-24292e?style=for-the-badge&logo=github)](https://github.com/harshkrsingh2/dropoff-predictor)
[![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python)](https://flask.palletsprojects.com/)
[![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## The Problem This Solves

Most edtech platforms collect a ton of student data — login frequency, study hours, assessment scores — but that data just sits in spreadsheets. Teachers don't have time to manually scan hundreds of rows looking for warning signs. By the time a student's struggle becomes obvious, they've often already mentally checked out.

Academic Lens was built to close that gap. Upload your class data, and within seconds you get a clear picture of who's slipping, why, and what to do about it — with AI-generated interventions tailored to each student's specific situation.

---

## What It Does

Academic Lens is a full-stack web application with five core capabilities:

**1. Smart Risk Classification**
Upload any CSV with student data and the app automatically maps your columns (flexible naming — it finds `study_hours`, `hrs_per_day`, `daily_study`, etc.) and classifies every student into High, Medium, or Low risk based on a weighted scoring model across three dimensions: study time, platform engagement, and academic performance.

**2. Live Dashboard with Charts**
After upload, the dashboard populates instantly with summary metrics and two interactive Chart.js visualizations — a scatter plot of study hours vs. test scores (color-coded by risk level) and a bar chart showing risk distribution across the class. You can filter the student table by risk level.

**3. AI-Powered Student Insights**
Click "Insight" on any student and Gemini generates a three-paragraph analysis: what the specific numbers mean for that student's risk, two concrete actions the teacher should take this week, and a personalized motivational message ready to send directly to the student.

**4. Multi-turn AI Chat Advisor**
The Smart Data Liaison panel on the right is a full conversational AI that knows your class data. Ask it "who's most at risk?" or "what should I focus on this week?" and it responds with specific names and actionable recommendations — not generic advice.

**5. Personalized Email Generator**
Select a student, pick a tone (motivational, urgent, parent-facing, or congratulatory), and the app drafts a ready-to-send email in seconds. Great for bulk outreach during intervention weeks.

---

## How the Risk Scoring Works

The classification engine assigns points across three signals:

| Signal | Threshold | Points |
|---|---|---|
| Study hours/day | < 1 hour | +3 |
| Study hours/day | 1–2 hours | +1 |
| Logins per week | < 3 | +3 |
| Logins per week | 3–4 | +1 |
| Test score | < 50% | +3 |
| Test score | 50–65% | +1 |

**Total score ≥ 6 → High Risk · Score 3–5 → Medium Risk · Score < 3 → Low Risk**

The logic is intentionally transparent — no black-box ML, just a clear weighted system that educators can understand and trust.

---

## What You Can Observe in the Dashboard

Once you upload a CSV, here's what's worth paying attention to:

- **Scatter plot clusters** — students bunched in the bottom-left (low hours, low scores) are your highest priority. The top-right cluster shows who's doing well.
- **The gap between Medium and High** — sometimes the Medium-risk group is larger than High. That's actually the more dangerous segment because they're close to tipping over but not yet flagged as urgent.
- **Login frequency vs. score mismatch** — a student logging in often but still scoring poorly suggests engagement without comprehension. That's a different intervention than a student who just isn't showing up.
- **The AI insight text** — pay attention to the specific numbers it references. If a student has 0.5 study hours and 1 login, the AI will call that out explicitly, which makes teacher-parent conversations much easier.

---

## Getting Started

### Prerequisites

- Python 3.9+
- A Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/harshkrsingh2/dropoff-predictor.git
cd dropoff-predictor

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# 4. Run the app
python app.py
```

Open `http://localhost:5000` in your browser.

### Environment Variables

```env
GEMINI_API_KEY=your-key-here
FLASK_ENV=development
FLASK_DEBUG=1
```

### CSV Format

Your upload file needs at minimum these columns (exact naming is flexible):

```
student_name, study_hours_per_day, logins_per_week, test_score
```

A sample file (`student_data.csv`) is included in the repo to get you started immediately.

---

## Project Structure

```
dropoff-predictor/
├── app.py                  # Flask backend — all API routes
├── requirements.txt        # Python dependencies
├── student_data.csv        # Sample data for testing
├── templates/
│   └── index.html          # Main dashboard UI
├── static/
│   ├── css/
│   │   └── style.css       # Dark theme, responsive layout
│   └── js/
│       └── app.js          # All frontend logic, charts, chat
└── .env                    # API keys (not committed)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python + Flask |
| AI | Google Gemini 2.5 Flash |
| Frontend | Vanilla HTML/CSS/JavaScript |
| Charts | Chart.js |
| Data Processing | Pandas |
| Deployment | Vercel |
| Fonts | DM Sans + DM Mono |

---

## API Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/api/upload` | Parses CSV, returns risk-classified student list |
| `POST` | `/api/chat` | Multi-turn AI chat with class context |
| `POST` | `/api/insight` | Detailed AI analysis for a single student |
| `POST` | `/api/report` | Full class report in structured JSON |
| `POST` | `/api/email` | Personalized email draft for a student |

---

## Future Work

There's a lot of room to grow this. Here's what's on the roadmap:

**Short term**
- [ ] Export reports as PDF with one click
- [ ] Bulk email sending via SendGrid or Mailgun
- [ ] Persistent storage so teachers don't have to re-upload every session
- [ ] CSV template builder — let teachers map their own column names

**Medium term**
- [ ] Time-series tracking — watch a student's trajectory over weeks, not just a snapshot
- [ ] LMS integrations (Google Classroom, Canvas, Moodle) to pull data automatically
- [ ] Role-based access — separate teacher and admin views
- [ ] Notification system that flags new high-risk students without requiring a manual re-upload

**Longer term**
- [ ] Replace the rule-based scoring with an actual ML model trained on historical drop-off data
- [ ] Cohort comparison — see how your class compares to previous batches
- [ ] Student-facing portal where learners can see their own engagement stats and set goals
- [ ] Multi-language support for the AI responses

---

## Why I Built This

I kept noticing the same pattern in edtech tools — great at collecting data, terrible at surfacing it to the people who could actually act on it. A teacher with 40 students doesn't have time to audit a spreadsheet every week. The data exists; it just needs to talk.

The goal with Academic Lens was to build something where the default output is an action, not a chart. Every screen is designed around the question: *what should this teacher do today?*

---

## Contributing

If you want to extend this, the codebase is intentionally simple. The risk classifier in `app.py` is a single function — easy to swap out. The frontend has no framework dependencies, so any JavaScript developer can jump in without a build setup.

Open an issue or submit a PR. All contributions welcome.

---

<div align="center">

Built with curiosity and a lot of conversations with AI · [@harshkrsingh2](https://github.com/harshkrsingh2)

</div>
