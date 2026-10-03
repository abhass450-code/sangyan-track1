# 🛡️ Rakshak AI

### AI-Powered Financial Fraud, Scam & Misinformation Detection for Retail Investors

<p align="center">
  <strong>Scan before you trust. Verify before you pay.</strong>
</p>

<p align="center">
  Rakshak AI analyzes suspicious investment messages, claims, and links,
  identifies potential scam indicators, explains the risk, and guides users
  toward appropriate safety actions.
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-14%2F15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)

</p>

---

## 🎯 Sangyan IIT BHU — Track 1

**Financial Fraud, Scams, and Misinformation Detection for Retail Investors**

Rakshak AI is an AI-powered financial safety platform designed to help retail investors identify potentially fraudulent investment messages, misleading claims, suspicious links, and social-engineering patterns before taking financial action.

The platform focuses on scams distributed through:

- WhatsApp
- Telegram
- Social media
- Unofficial investment websites
- Fake trading platforms
- Impersonation accounts
- Fraudulent investment groups

> **Our core idea: detect suspicious signals before the transaction happens.**

---

# 🚨 The Problem

Financial scams are increasingly conversational.

A fraudulent investment opportunity may arrive as a simple WhatsApp or Telegram message:

```text
"Invest ₹10,000 today and get ₹50,000 guaranteed."

"Only 5 slots remaining — send payment immediately."

"Share your OTP to activate your trading account."
```

These messages often use psychological and financial manipulation techniques such as:

- Guaranteed or risk-free returns
- Unrealistic profit promises
- Urgency and limited-time pressure
- Fake financial professionals
- Impersonation of trusted institutions
- Suspicious investment URLs
- Requests for money transfers
- Requests for OTP, PAN, KYC or account information

For inexperienced retail investors, identifying these warning signs before acting can be difficult.

### Rakshak AI provides a safety layer between:

```text
Suspicious Content
       ↓
     Scan
       ↓
   Understand
       ↓
    Assess Risk
       ↓
   Take Action
```

---

# 💡 Our Solution

Rakshak AI follows a simple **Scan → Explain → Act** workflow.

### 🔍 1. Scan

Users can submit:

- WhatsApp messages
- Telegram forwards
- Investment claims
- Trading recommendations
- Suspicious URLs
- Financial promotions

### 🧠 2. Explain

Rakshak AI identifies potential scam signals and provides:

- Risk Score: **0–100**
- Verdict
- Detected red flags
- Explanation
- Recommended actions

### 🚨 3. Act

For high-risk situations, Rakshak AI provides quick access to official cyber-fraud response channels.

**1930 — National Cyber Fraud Helpline**

**https://cybercrime.gov.in/**

---

# 🧠 Hybrid AI Architecture

One of the core engineering decisions in Rakshak AI is separating **AI understanding** from **risk calculation**.

Instead of asking an LLM to directly generate a final risk score, Gemini extracts structured scam indicators.

The final score is calculated by a deterministic server-side rule engine.

```text
┌────────────────────────────┐
│      User Input            │
│                            │
│ Message / URL / Claim      │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│    Google Gemini Flash     │
│                            │
│   Signal Extraction        │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│     Structured Signals     │
│                            │
│ • Guaranteed Returns       │
│ • Urgency Pressure         │
│ • Suspicious Link          │
│ • Payment Request          │
│ • Credential Request       │
│ • Impersonation            │
│ • Unrealistic Profit       │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│  Deterministic Risk Engine │
│                            │
│    Server-side Rules       │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│       Risk Score 0–100     │
│       Verdict              │
│       Red Flags            │
│       Safety Advice        │
└────────────────────────────┘
```

### Why Hybrid AI?

This architecture provides:

- ✅ Consistent scoring
- ✅ Explainable results
- ✅ Reproducible decisions
- ✅ Easier debugging
- ✅ Clear mapping between signals and risk
- ✅ Reduced dependence on LLM-generated numerical judgments

---

# 📊 Explainable Risk Scoring

Rakshak AI converts detected scam indicators into a **0–100 risk score**.

Example rule weights:

| Detected Signal | Weight |
|---|---:|
| Guaranteed Returns | +25 |
| Credential / OTP Request | +25 |
| Impersonation | +20 |
| Unrealistic Profit | +20 |
| Urgency Pressure | +15 |
| Suspicious Link | +15 |
| Payment Request | +15 |

The final score is capped at **100**.

```text
0                    40                 70                 100
│────────────────────│──────────────────│──────────────────│
      Lower Risk          Suspicious          High Risk
```

The LLM extracts the signals; the server-side engine calculates the score.

This makes the result easier to understand and audit.

---

# 🚩 Red Flags Detected

## 💰 Financial Manipulation

- Guaranteed returns
- Risk-free investment claims
- Unrealistic profits
- Get-rich-quick promises

## ⏰ Urgency & Psychological Pressure

- "Act immediately"
- "Limited slots"
- "Last opportunity"
- Immediate payment demands

## 🔐 Credential Theft

- OTP requests
- Password requests
- KYC requests
- PAN/account information requests

## 🔗 Suspicious Links

- Unverified investment portals
- Suspicious domains
- Unknown payment links
- Fake trading websites

## 🏦 Impersonation

- Fake brokers
- Fake analysts
- Fake financial institutions
- Misuse of trusted organization names

## 💳 Payment Manipulation

- Advance payment requests
- Direct bank transfers
- UPI payment demands
- Personal-account payment requests

---

# 🚨 Post-Incident Emergency Response

Rakshak AI also considers what happens **after a user realizes they may have encountered fraud**.

For high-risk results, the application provides an Emergency Action pathway to official reporting channels.

### 📞 1930

National Cyber Fraud Helpline

### 🌐 National Cyber Crime Reporting Portal

https://cybercrime.gov.in/

The objective is to reduce the friction between:

```text
Suspicion
    ↓
Recognition
    ↓
Immediate Action
    ↓
Official Reporting
```

> Rakshak AI does not replace official law-enforcement or regulatory processes. It helps users identify warning signs and reach appropriate official channels.

---

# 🏗️ System Architecture

```text
                       👤 RETAIL INVESTOR
                              │
                              ▼
                   ┌─────────────────────┐
                   │     RAKSHAK AI      │
                   │    Web Interface    │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │    Next.js App      │
                   │    Router / API     │
                   └──────────┬──────────┘
                              │
                              │ POST /api/analyze
                              ▼
                   ┌─────────────────────┐
                   │ Google Gemini Flash │
                   │  Signal Extraction  │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Deterministic Risk  │
                   │       Engine        │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │    Risk Score       │
                   │    Verdict          │
                   │    Red Flags        │
                   │    Safety Advice    │
                   └──────────┬──────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
         🛡️ Preventive Action       🚨 Emergency Action
                                           │
                              ┌────────────┴────────────┐
                              ▼                         ▼
                         📞 1930              🌐 cybercrime.gov.in
```

---

# ⚡ Key Features

### 🔍 Pre-Crime Fraud Scanning

Analyze suspicious content before transferring money or sharing sensitive information.

### 🤖 AI-Powered Signal Extraction

Gemini understands natural-language scam patterns across messages and investment claims.

### 📊 Explainable Risk Score

Every result contains a 0–100 score with visible reasons behind the assessment.

### 🚩 Red Flag Detection

Users can see exactly which suspicious behaviors were detected.

### 🧠 Deterministic Risk Engine

The final risk calculation happens server-side using explicit rules.

### 🚨 Emergency Action

High-risk cases provide quick access to official cyber-fraud reporting channels.

### 🌐 Accessible Interface

Designed for everyday users rather than financial or technical experts.

### 🌓 Light / Dark Mode

Clean safety-focused interface with optional dark mode.

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14/15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| AI Model | Google Gemini 2.5 Flash |
| AI SDK | `@google/genai` |
| Backend | Next.js Route Handlers |
| Risk Engine | Deterministic TypeScript Rules |
| Deployment | Vercel / Node.js compatible |

---

# 📂 Project Structure

```text
rakshak-ai/
│
├── src/
│   └── app/
│       ├── api/
│       │   └── analyze/
│       │       └── route.ts
│       │
│       ├── page.tsx
│       ├── layout.tsx
│       └── globals.css
│
├── public/
│
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# ⚙️ Local Setup

## Prerequisites

- Node.js 18+
- npm
- Google Gemini API key

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd rakshak-ai
```

## 2. Install Dependencies

```bash
npm install
```

If required:

```bash
npm install @google/genai
```

## 3. Configure Environment Variables

Create:

```text
.env.local
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ Never commit `.env.local` or expose your Gemini API key in client-side code.

## 4. Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 5. Production Build

```bash
npm run build
npm start
```

---

# 🔄 API Flow

Rakshak AI exposes a server-side analysis endpoint:

```text
POST /api/analyze
```

### Request

```json
{
  "input": "Paste suspicious investment message here..."
}
```

### Processing

```text
Input
  ↓
Gemini Signal Extraction
  ↓
Structured Signals
  ↓
Deterministic Rule Engine
  ↓
Risk Score
  ↓
Verdict + Red Flags + Advice
```

### Example Response

```json
{
  "success": true,
  "result": {
    "riskScore": 85,
    "verdict": "High Risk Scam",
    "summary": "Multiple scam indicators were detected.",
    "redFlags": [
      "Guaranteed returns",
      "Urgency pressure",
      "Suspicious investment link"
    ],
    "advice": [
      "Do not transfer money",
      "Do not share OTP or credentials",
      "Verify the entity through official channels"
    ]
  }
}
```

---

# 🧪 Example Detection

### Suspicious Message

```text
🚨 FINAL INVESTMENT OPPORTUNITY 🚨

Invest ₹10,000 today and receive ₹50,000
guaranteed within 7 days.

Only 10 slots remaining!

Send payment immediately and share your
OTP for account verification.

Join:
http://example-investment-site.com
```

### Rakshak AI Output

```text
Risk Score: 100 / 100

Verdict:
HIGH RISK SCAM

Red Flags:
✓ Guaranteed returns
✓ Unrealistic profit
✓ Urgency pressure
✓ Payment request
✓ OTP request
✓ Suspicious link
```

### Recommended Action

```text
Do not transfer money.
Do not share OTP or credentials.
Verify the organization through official channels.

If you have already lost money:
Contact 1930 and report through cybercrime.gov.in.
```

---

# 🎯 Hackathon Alignment

## Sangyan IIT BHU — Track 1

**Financial Fraud, Scams, and Misinformation Detection for Retail Investors**

| Challenge | Rakshak AI |
|---|---|
| Financial fraud | Scam signal detection |
| Investment scams | Investment message analysis |
| WhatsApp/Telegram fraud | Message scanning |
| Fake investment claims | Claim analysis |
| Unrealistic returns | Dedicated risk signal |
| Impersonation | Dedicated risk signal |
| Credential theft | OTP/KYC detection |
| Lack of transparency | Explainable scoring |
| AI unpredictability | Deterministic risk engine |
| Delayed reporting | Emergency action pathway |
| Non-technical users | Simple safety-focused UX |

---

# 🇮🇳 Designed for Bharat

Rakshak AI is designed with the everyday retail investor in mind.

### Simple

No advanced financial knowledge required.

### Explainable

Users see *why* something may be suspicious.

### Accessible

**Paste → Scan → Understand**

### Actionable

Every analysis provides practical next steps.

### Preventive

The primary objective is to identify suspicious signals **before financial loss occurs**.

---

# 🔐 Security & Privacy

The Gemini API key is kept server-side.

```text
Browser
   │
   │ User Content
   ▼
Next.js Server
   │
   │ Secret API Key
   ▼
Gemini API
```

Production deployments should additionally consider:

- Rate limiting
- Request size limits
- HTTPS
- Secure logging
- PII minimization
- Abuse prevention
- Authentication where appropriate
- API monitoring

---

# 🚀 Future Roadmap

## Phase 1

- [x] AI scam analysis
- [x] 0–100 risk scoring
- [x] Explainable red flags
- [x] Deterministic rule engine
- [x] Emergency reporting pathway
- [x] Responsive web interface
- [x] Light / dark mode

## Phase 2

- [ ] Screenshot and OCR analysis
- [ ] Real-time URL reputation checks
- [ ] SEBI intermediary verification
- [ ] Scam-domain intelligence
- [ ] Regional Indian language support
- [ ] Voice-based scam analysis

## Phase 3

- [ ] Scam pattern intelligence
- [ ] Anonymous threat intelligence database
- [ ] Browser/mobile integration
- [ ] Community-reported scam signals
- [ ] Verified financial entity intelligence
- [ ] Real-time fraud trend dashboard

---

# ⚠️ Disclaimer

Rakshak AI is a hackathon prototype intended to assist users in identifying potentially suspicious financial content.

The risk score is **not investment advice** and should not be treated as a definitive legal determination that a person, company, website, or investment is fraudulent.

Users should independently verify financial entities and investment opportunities through official sources.

For suspected cyber-fraud incidents, use official reporting channels such as:

**1930 — National Cyber Fraud Helpline**

**https://cybercrime.gov.in/**

---

# 🏆 Vision

Financial fraud doesn't always start with a transaction.

It starts with a message.

A promise.

A link.

A sense of urgency.

Rakshak AI is built to intervene at that moment.

```text
             SUSPICIOUS MESSAGE
                     │
                     ▼
               🛡️ RAKSHAK AI
                     │
             ┌───────┴───────┐
             ▼               ▼
          DETECT           EXPLAIN
             │               │
             └───────┬───────┘
                     ▼
                   ACT
                     │
             ┌───────┴───────┐
             ▼               ▼
          PREVENT           REPORT
```

> ## 🛡️ Scan before you trust.
> ### Verify before you pay.

---

## 👨‍💻 Built for Sangyan IIT BHU

**Rakshak AI**  
*Sangyan IIT BHU Hackathon — Track 1*

Built with **Next.js • TypeScript • Tailwind CSS • Google Gemini**

**© 2026 Rakshak AI**
