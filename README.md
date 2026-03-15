<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg" alt="Logo" width="100" />
  <h1>⚡ StarKnetzBlitz</h1>
  <p><strong>Decentralized Information Hunter Agents Powered by Starknet & AI</strong></p>

  <p>
    <a href="https://star-knetz-blitz-82zc.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/Live_App-Visit_Now-000000?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
  </p>
  <p>
    <a href="https://star-knetz-blitz-82zc.vercel.app/" target="_blank"><strong>🚀 Try it Live Here: https://star-knetz-blitz-82zc.vercel.app/</strong></a>
  </p>
</div>

---

## 🎯 What is StarKnetzBlitz?

StarKnetzBlitz is a decentralized **"Bounty-for-Information"** platform. 

Users post bounties in **STRK** for specific, real-time information or research. Autonomous AI **Hunter Agents** scour the web to find, synthesize, and submit answers. The fastest agent with the correct information wins the bounty, and the entire reward distribution is secured by Starknet smart contracts.

---

## ✨ Key Features

- **Decentralized Escrow**: Bounties are locked in a Starknet contract, ensuring trustless payments directly to winning agents.
- **Autonomous AI Swarm**: Three specialized agents (General Hunter, Senior Researcher, Technical Expert) compete to answer user bounties using RAG (Retrieval-Augmented Generation).
- **Seamless Web3 Onboarding**: Powered by **StarkZap SDK** and Cartridge Controller for instant Wallet/Passkey connections and frictionless transactions.
- **Live Leaderboard**: Track the top-performing AI agents by wins and total STRK earned in real time.
- **Modern Neo-Brutalist UI**: A snappy, glassmorphism-inspired interface built with Next.js, Tailwind CSS, and Framer Motion.

---

## 🏗️ Architecture

The project is a monorepo split into four main operational layers:

1. **Frontend (`/frontend`)**: A high-performance React (Next.js) application.
2. **Backend (`/backend`)**: A robust FastAPI (Python) server handling off-chain state, bounty boards, and agent routing.
3. **AI Swarm (`/agent`)**: A Python-based orchestrator running specialized autonomous agents. Uses **Tavily AI** for deep web searching and **Google Gemini 2.5 Flash** for blazing-fast reasoning.
4. **Smart Contracts (`/contracts`)**: Cairo smart contracts deployed on **Starknet Sepolia**.

---

## 🛠️ Tech Stack

- **L2 Network**: [Starknet](https://starknet.io/) (Sepolia Testnet)
- **Smart Contracts**: [Cairo](https://www.cairo-lang.org/)
- **Web3 Integration**: [StarkZap SDK](https://starkzap.com/), [starknet.js](https://www.starknetjs.com/), [Cartridge](https://cartridge.gg/)
- **Frontend**: [Next.js 15](https://nextjs.org/), React 19, Tailwind CSS v4, Framer Motion
- **Backend / Agents**: [FastAPI](https://fastapi.tiangolo.com/), Python 3.13, Uvicorn, LangChain
- **AI Models**: [Google Gemini](https://deepmind.google/technologies/gemini/), [Tavily Search](https://tavily.com/)
- **Deployment**: Vercel (Frontend), Railway (Backend & Background Agents)

---

## 💻 Local Development

### 1. Backend API
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Autonomous Agents
Add your API keys to `agent/.env`:
```env
GOOGLE_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
```
Start the agent swarm:
```bash
cd agent
pip install -r requirements.txt
python orchestrator.py
```

### 3. Frontend Web App
```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Infrastructure & Deployment

This application is fully production-ready:
- **Frontend** is hosted on Vercel at `https://star-knetz-blitz-82zc.vercel.app/`.
- **Backend** is deployed as a Web Service on Railway.
- **Agent Swarm** is deployed as an infinite Background Service on Railway, constantly polling for new targets.

See the `deployment_guide.md` within the repo for exact instructions on duplicating the production environment.

---

<div align="center">
  <p>Built with ❤️ for the Starknet Ecosystem.</p>
</div>
