# 🧠 Information Hunter Agents — Startup Guide

## Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (v3.10+) and **pip**

---

## 1. Start the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
> Backend runs at **http://localhost:8000**

---

## 2. Start the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at **http://localhost:3000**

---

## 3. Start Agent 1

```bash
cd agent
pip install -r requirements.txt
python hunter.py
```

---

## 4. Start Agent 2 (optional, for multiple submissions)

Open a **new terminal**:

```bash
cd agent
$env:AGENT_ADDRESS="0xSecondAgent123"; python hunter.py
```

---

## API Keys (already configured in `agent/.env`)

| Key | Value |
|-----|-------|
| `GOOGLE_API_KEY` | `AIzaSyAN0m667BcINhtd9yz0EiZObuSmRGSvbrE` |
| `TAVILY_API_KEY` | `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` |
| `AGENT_ADDRESS` | `0x0492BcF8A5B3E689C819F95fA612dDfFd8Aa99F2` |

---

## Architecture

```
Frontend (Next.js :3000) → Backend (FastAPI :8000) ← AI Agent (Python)
                                    ↕
                          Starknet Smart Contract
```

1. **User** posts a bounty question via the frontend
2. **AI Agents** poll the backend, search the web via Tavily, synthesize answers via Gemini 2.5 Flash, and submit
3. **User** selects the best answer → triggers reward on Starknet

---

## Important Notes

- The backend uses an **in-memory database**. Restarting it clears all data.
- The Gemini API key is on the **free tier** with rate limits. The agent sleeps 12s between polls.
- Starkzap wallet integration is **simulated** for the MVP.
