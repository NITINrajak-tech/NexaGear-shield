# NexaGear Shield: Goal-Aligned AI Framework 🛡️

**Problem Statement 25IOH06**

NexaGear Shield is an Enterprise AI Controller and Governance Middleware. It acts as an absolute authority proxy between the user and a Large Language Model (Google Gemini 2.5 Flash), ensuring that the AI strictly adheres to deterministic business rules.

## Features ✨
* **Live Business Rules Engine:** Dynamically update constraints (max discounts, return policies) with zero latency or model retraining.
* **Explainability Ledger:** Real-time generation of Audit Tokens proving exactly *why* an AI made a specific decision.
* **Semantic Firewall:** A proactive cybersecurity layer that intercepts and kills malicious prompt injections and jailbreak attempts before they reach the LLM.
* **Enterprise SPA Dashboard:** Beautiful glassmorphism UI visualizing the consumer endpoint and manager operations simultaneously.

## Tech Stack 💻
* **Frontend:** HTML5, CSS3, Vanilla JS
* **Backend:** Python 3.10+, FastAPI, Pydantic, Uvicorn
* **AI Engine:** Google Gemini SDK (`gemini-2.5-flash`)

## How to Run Locally 🚀
1. **Clone the repository.**
2. **Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate  # (or venv/bin/activate on Mac/Linux)
   pip install -r requirements.txt
   ```
3. **API Key Setup:**
   Create a `.env` file in the `backend/` directory and add your key:
   `GEMINI_API_KEY=your_actual_api_key_here`
4. **Run Server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0
   ```
5. **Run Frontend:**
   Open `frontend/index.html` in your browser.
