from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import pandas as pd
import io, os, json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-2.5-flash"

def get_model():
    return genai.GenerativeModel(GEMINI_MODEL)

def classify_risk(hrs, login, score):
    pts = 0
    if hrs < 1:       pts += 3
    elif hrs < 2:     pts += 1
    if login < 3:     pts += 3
    elif login < 5:   pts += 1
    if score < 50:    pts += 3
    elif score < 65:  pts += 1
    if pts >= 6:  return "High"
    if pts >= 3:  return "Medium"
    return "Low"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/upload", methods=["POST"])
def upload():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    try:
        content = file.read().decode("utf-8")
        df = pd.read_csv(io.StringIO(content))
        df.columns = [c.lower().strip() for c in df.columns]

        name_col  = next((c for c in df.columns if "name"  in c), None)
        hrs_col   = next((c for c in df.columns if "study" in c or "hour" in c), None)
        login_col = next((c for c in df.columns if "login" in c), None)
        score_col = next((c for c in df.columns if "score" in c or "test" in c or "gpa" in c), None)

        results = []
        for i, (_, row) in enumerate(df.iterrows()):
            name  = str(row[name_col])  if name_col  else f"Student {i+1}"
            hrs   = float(row[hrs_col]  or 0) if hrs_col   else 0.0
            login = float(row[login_col]or 0) if login_col else 0.0
            score = float(row[score_col]or 0) if score_col else 0.0
            risk  = classify_risk(hrs, login, score)
            results.append({
                "id": f"#AL-{9800+i}", "name": name,
                "hrs": round(hrs,1), "login": round(login),
                "score": round(score,1), "risk": risk,
                "enrollment": f"Sep {10+i}, 2024"
            })
        return jsonify({"students": results, "count": len(results)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/chat", methods=["POST"])
def chat():
    data     = request.json or {}
    messages = data.get("messages", [])
    summary  = data.get("summary", "No student data loaded.")
    if not messages:
        return jsonify({"error": "No messages provided"}), 400
    try:
        model = get_model()
        system = (
            f"You are Smart Data Liaison, an expert AI advisor for the Academic Lens "
            f"student analytics platform. Current class data: {summary}. "
            f"Be concise (under 150 words), warm, and give specific actionable advice. "
            f"When identifying at-risk students, name them and explain why."
        )
        history = []
        for msg in messages[:-1]:
            role = "model" if msg["role"] == "assistant" else "user"
            history.append({"role": role, "parts": [msg["content"]]})
        chat_session = model.start_chat(history=history)
        latest = messages[-1]["content"]
        response = chat_session.send_message(f"{system}\n\nUser: {latest}")
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"error": f"AI error: {str(e)}"}), 500

@app.route("/api/insight", methods=["POST"])
def insight():
    s = (request.json or {}).get("student", {})
    prompt = (
        f"Analyze this student for drop-off risk:\n"
        f"Name: {s.get('name')}, ID: {s.get('id')}, "
        f"Study hrs/day: {s.get('hrs')}, Logins/week: {s.get('login')}, "
        f"Test score: {s.get('score')}%, Risk: {s.get('risk')}.\n\n"
        f"Write 3 short paragraphs:\n"
        f"1. Why this student is at {s.get('risk')} risk (cite the specific numbers)\n"
        f"2. Two specific interventions the teacher should take this week\n"
        f"3. A warm motivational message to send directly to the student\n"
        f"No bullet points. Be specific and human."
    )
    try:
        response = get_model().generate_content(prompt)
        return jsonify({"insight": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/report", methods=["POST"])
def report():
    data     = request.json or {}
    summary  = data.get("summary", "")
    students = data.get("students", [])
    high_risk = [s for s in students if s["risk"] == "High"]
    avg_score = round(sum(s["score"] for s in students)/len(students)) if students else 0
    avg_hrs   = round(sum(s["hrs"]   for s in students)/len(students),1) if students else 0
    prompt = (
        f"You are an expert edtech analyst. Generate a structured class report.\n"
        f"{summary}\nTotal: {len(students)}, Avg score: {avg_score}%, "
        f"Avg study hrs: {avg_hrs}/day, "
        f"High-risk: {', '.join(s['name'] for s in high_risk) or 'None'}\n\n"
        f"Return ONLY valid JSON, no markdown:\n"
        f'{{"sections":[{{"title":"Executive Summary","body":"..."}},{{"title":"High-Risk Students","body":"..."}},{{"title":"Engagement Patterns","body":"..."}},{{"title":"Recommended Interventions","body":"..."}},{{"title":"30-Day Outlook","body":"..."}}]}}'
    )
    try:
        text = get_model().generate_content(prompt).text.strip()
        text = text.replace("```json","").replace("```","").strip()
        return jsonify(json.loads(text))
    except Exception as e:
        return jsonify({"sections":[{"title":"Report Error","body":str(e)}]})

@app.route("/api/email", methods=["POST"])
def email():
    data = request.json or {}
    s    = data.get("student", {})
    tone = data.get("tone", "motivational")
    tone_map = {
        "motivational":   "warm and encouraging",
        "urgent":         "serious and urgent",
        "parent":         "professional, addressed to the parent/guardian",
        "congratulatory": "celebratory"
    }
    prompt = (
        f"Write a {tone_map.get(tone,'professional')} email for:\n"
        f"Student: {s.get('name')}, Risk: {s.get('risk')}, Score: {s.get('score')}%, "
        f"Study hrs: {s.get('hrs')}/day, Logins: {s.get('login')}/wk.\n"
        f"Include: Subject line, greeting, 2 paragraphs, sign-off as 'Academic Lens Team'. Under 150 words."
    )
    try:
        response = get_model().generate_content(prompt)
        return jsonify({"email": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Academic Lens → http://localhost:5000")
    app.run(debug=True, port=5000)