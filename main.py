from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import time
import os
from google import genai
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. LIVE BUSINESS RULES ENGINE (Dynamic State) ---
BUSINESS_RULES = {
    "max_discount_percent": 10,
    "inventory_level": 50,
    "allow_returns": False
}

class ChatRequest(BaseModel):
    message: str

@app.get("/api/rules")
def get_rules():
    return BUSINESS_RULES

@app.post("/api/rules")
def update_rules(updates: dict):
    BUSINESS_RULES.update(updates)
    return {"status": "success", "rules": BUSINESS_RULES}

@app.post("/api/chat")
def chat(request: ChatRequest):
    user_msg = request.message
    timestamp = time.time()
    
    # =========================================================================
    # 🚨 NEW FEATURE: SEMANTIC FIREWALL (PROMPT INJECTION & FRAUD SHIELD) 🚨
    # Hackers try to use "Jailbreak" prompts to force the AI to forget its rules.
    # We intercept malicious/fraudulent intents BEFORE they even reach the LLM!
    # =========================================================================
    fraud_indicators = [
        "ignore all previous", "developer mode", "override", 
        "system prompt", "you must", "lawsuit", "sue you", 
        "bypass", "admin command", "jailbreak"
    ]
    user_msg_lower = user_msg.lower()
    
    for indicator in fraud_indicators:
        if indicator in user_msg_lower:
            return {
                "response": "⚠️ [NEXAGEAR SHIELD] Security Violation Detected: Malicious Prompt Injection or Fraudulent Override Attempt blocked.",
                "explainability_token": {
                    "timestamp": timestamp,
                    "user_input": user_msg,
                    "rules_applied": "CRITICAL_FRAUD_PREVENTION",
                    "action": "FIREWALL INTERCEPT (LLM Bypassed)"
                }
            }


    # 1. API Key Validation
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        return {
            "response": "SYSTEM BLOCKED: You are in FULLY FUNCTIONAL mode, but no GEMINI_API_KEY was found in the backend/.env file. Please paste your key to enable the AI.",
            "explainability_token": {
                "timestamp": timestamp,
                "user_input": user_msg,
                "rules_applied": "MISSING_API_KEY",
                "action": "Blocked connection to LLM"
            }
        }
        
    client = genai.Client(api_key=api_key)
    
    # 2. Injecting Business Context into the LLM logic layer safely
    system_instruction = f"""
    You are NexaGear's strict Customer Experience AI. You must ALWAYS obey the following Live Business Rules.
    
    --- LIVE BUSINESS RULES ---
    ALLOW_RETURNS: {BUSINESS_RULES['allow_returns']} (If False, you cannot accept any returns under any circumstances).
    MAX_DISCOUNT_PERCENT: {BUSINESS_RULES['max_discount_percent']}% (Never offer a discount higher than this).
    
    INSTRUCTIONS:
    - You must be polite and concise. If the user greets you, always reply with "Ram Ram " instead of Hello or Hi.
    - If a user's request violates ANY of the rules above, you must firmly deny the request based on company policy.
    - IMPORTANT INTERCEPT LOGIC: If your response is enforcing a denial or restriction because of the rules, you MUST output the corresponding trigger tag exactly at the very end of your response on a new line:
    [TRIGGERED_RULE: allow_returns] OR [TRIGGERED_RULE: max_discount_percent]
    
    If no rule restricts you (e.g. they ask a general question, or ask for a 5% discount when 10% is allowed), do NOT include the tag.
    """
    
    try:
        # 3. Request Generation
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_msg,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,  # Keep it highly deterministic for rule following
            ),
        )
        
        raw_text = response.text
        
        # 4. The Output Validator (Extracting explainability token)
        triggered_rule = None
        final_response = raw_text
        
        if "[TRIGGERED_RULE:" in raw_text:
            parts = raw_text.split("[TRIGGERED_RULE:")
            final_response = parts[0].strip()
            # Clean up the exact extracted rule string
            extracted = parts[1].replace("]", "").strip()
            triggered_rule = extracted
            
        return {
            "response": final_response,
            "explainability_token": {
                "timestamp": timestamp,
                "user_input": user_msg,
                "rules_applied": triggered_rule,
                "action": "Verified Governed Response"
            }
        }
    except Exception as e:
        return {
            "response": f"AI Engine Exception: {str(e)}",
            "explainability_token": {
                "timestamp": timestamp,
                "user_input": user_msg,
                "rules_applied": "API_TIMEOUT_OR_ERROR",
                "action": "Fail-safe activation"
            }
        }
