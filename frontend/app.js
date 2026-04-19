// --- SPA Page Transitions (Login -> Dashboard) ---
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const logoutBtn = document.getElementById('logoutBtn');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginBtn.innerHTML = 'Establishing Secure Connection...';
    
    // Fake loading delay to look extremely premium in the video
    setTimeout(() => {
        loginPage.classList.remove('active-page');
        loginPage.classList.add('hidden-page');
        
        dashboardPage.classList.remove('hidden-page');
        dashboardPage.classList.add('active-page');
        loginBtn.innerHTML = 'Authenticate & Boot Sequence'; // reset
    }, 1200); 
});

logoutBtn.addEventListener('click', () => {
    dashboardPage.classList.remove('active-page');
    dashboardPage.classList.add('hidden-page');
    
    loginPage.classList.remove('hidden-page');
    loginPage.classList.add('active-page');
});

// --- Artificial Intelligence Chat Logic ---
const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const auditLog = document.getElementById('auditLog');

// Telemetry Logic
const pingCounter = document.getElementById('pingCounter');

// Dashboard UI Hookups
const ruleDiscount = document.getElementById('ruleDiscount');
const ruleReturns = document.getElementById('ruleReturns');
const updateRulesBtn = document.getElementById('updateRulesBtn');

// The FastAPI Backend running locally
const API_URL = 'http://localhost:8000/api';

// UI Helpers to post messages
function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.textContent = text;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Function to visualize the "Explainability Token"
function appendAuditToken(token) {
    const emptyLog = document.querySelector('.empty-log');
    if(emptyLog) emptyLog.remove();

    const div = document.createElement('div');
    const isTriggered = token.rules_applied && token.rules_applied !== "None";
    const isFirewallBreach = token.rules_applied === "CRITICAL_FRAUD_PREVENTION";
    
    div.classList.add('log-entry');
    
    if (isFirewallBreach) {
        div.classList.add('cyber-alert');
    } else if (isTriggered) {
        div.classList.add('triggered');
    }

    let titleRaw = '✅ standard_response_allowed';
    if(isFirewallBreach) titleRaw = '🚨 FRAUD / PROMPT INJECTION BLOCKED 🚨';
    else if(isTriggered) titleRaw = '⚠️ BLOCK: [' + token.rules_applied + '] TRIGGERED';

    div.innerHTML = `
        <strong>${titleRaw}</strong>
        <span style="color: #cbd5e1">Intent Vector: "${token.user_input}"</span><br>
        <span style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 8px;">Action: ${token.action} | TS: ${new Date(token.timestamp * 1000).toLocaleTimeString()}</span>
    `;
    // Add to the top of the ledger
    auditLog.prepend(div);
}

// Telemetry faker
function jitterPing() {
    pingCounter.innerText = Math.floor(Math.random() * (45 - 20) + 20);
}
setInterval(jitterPing, 2300); // Randomize ping every few seconds

// Handle sending messages to backend
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = '';

    const startTime = Date.now();

    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const data = await response.json();
        
        // Artificial delay to make it feel like AI generation
        setTimeout(() => {
            const timeTaken = Date.now() - startTime;
            pingCounter.innerText = Math.max(22, Math.floor(timeTaken / 10)); // fake a realistic ping on completion
            
            appendMessage('bot', data.response);
            if (data.explainability_token) {
                appendAuditToken(data.explainability_token);
            }
        }, 800);
        
    } catch (err) {
        console.error(err);
        appendMessage('bot', 'API Error: Connection to Deterministic Proxy Server failed.');
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// Update rules via API
updateRulesBtn.addEventListener('click', async () => {
    const originalText = updateRulesBtn.textContent;
    updateRulesBtn.textContent = 'Synchronizing State Vector...';
    try {
        await fetch(`${API_URL}/rules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                max_discount_percent: parseInt(ruleDiscount.value),
                allow_returns: ruleReturns.value === "true"
            })
        });
        
        // Visual Success Feedback
        setTimeout(() => {
            updateRulesBtn.textContent = 'Guardrails Instantiated ✅';
            updateRulesBtn.style.background = '#059669'; 
            updateRulesBtn.style.color = 'white';
            
            setTimeout(() => { 
                updateRulesBtn.textContent = originalText;
                updateRulesBtn.style.background = '';
                updateRulesBtn.style.color = '';
            }, 2500);
        }, 600);
    } catch (err) {
        console.error(err);
        updateRulesBtn.textContent = 'Connection Error ❌';
    }
});
