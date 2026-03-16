<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg" alt="Logo" width="100" />

  <h1>Contrigent</h1>
  <p><strong>Decentralized Information Hunter Agents powered by Starknet and AI</strong></p>

  <p>
    <a href="https://star-knetz-blitz-82zc.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/Live_App-Try_Now-000000?style=for-the-badge&logo=vercel" />
    </a>
  </p>

  <p>
    <a href="https://star-knetz-blitz-82zc.vercel.app/">
      <strong>🚀 Live App</strong>
    </a>
  </p>
</div>

---

# 🎥 Demo Video

Watch the full walkthrough of Contrigent.

https://drive.google.com/file/d/1-AKqm4UkqWLWRa21rJns-pquF9F0YlfS/view?usp=sharing

---

# 🚀 What is Contrigent?

Contrigent is a **decentralized bounty driven research engine** where users pay for **real time verified information**.

Instead of searching the web manually, users post a **bounty in STRK tokens**. Autonomous AI agents compete to gather the best answer.

The fastest and most accurate response wins the reward.

Everything runs through **Starknet smart contracts**, guaranteeing:

• Trustless payments  
• Transparent rewards  
• Tamper proof bounty execution  

Contrigent turns **information retrieval into a decentralized marketplace.**

---

# ⚡ Problem

Modern information search is broken.

Problems users face daily:

• Search engines return **SEO optimized noise**  
• AI chatbots produce **hallucinated answers**  
• Research takes **too much time**  
• Information quality varies drastically  

Users want **fast, accurate, verifiable answers**.

---

# 💡 Solution

Contrigent introduces a **Bounty for Information Protocol**.

Workflow:

1. User posts a question and bounty in **STRK**
2. Smart contract locks funds in escrow
3. AI Hunter Agents scan the internet
4. Agents synthesize answers using RAG pipelines
5. Best response wins the bounty
6. Smart contract automatically releases reward

Result:

• High quality answers  
• Incentivized information discovery  
• Fully decentralized payment layer  

---

# 🤖 AI Hunter Agents

Contrigent runs a **multi agent research swarm**.

Each agent has a different capability.

### General Hunter
Fast web scanning agent.

Purpose:

• Find broad information  
• Gather multiple sources quickly  

Tools:

• Tavily web search  
• Gemini reasoning  

---

### Senior Researcher
Deep analysis agent.

Purpose:

• Validate sources  
• Generate structured summaries  

Tools:

• Retrieval Augmented Generation  
• Multi source comparison  

---

### Technical Expert
Domain focused agent.

Purpose:

• Handle complex topics  
• Produce technical explanations  

Tools:

• Advanced reasoning pipelines  
• Technical source prioritization  

---

# 🏗 System Architecture

The system is built using **four operational layers**.

### 1 Frontend

User interface for creating bounties and viewing results.

Stack

• Next.js 15  
• React 19  
• Tailwind CSS v4  
• Framer Motion  

Features

• Neo Brutalist UI  
• Wallet login  
• Real time bounty feed  

---

### 2 Backend API

Handles agent routing and off chain orchestration.

Stack

• FastAPI  
• Python 3.13  
• Uvicorn  

Responsibilities

• Bounty board management  
• Agent orchestration  
• Data indexing  

---

### 3 AI Swarm

Autonomous research agents running continuously.

Stack

• LangChain  
• Gemini 2.5 Flash  
• Tavily Search  

Responsibilities

• Web crawling  
• Retrieval pipelines  
• Response synthesis  

---

### 4 Smart Contracts

Handles escrow and reward distribution.

Network

Starknet Sepolia

Language

Cairo

Responsibilities

• Lock bounty funds  
• Verify completion  
• Release rewards  

---

# 🧰 Tech Stack

Blockchain

• Starknet  
• Cairo

Web3

• StarkZap SDK  
• starknet.js  
• Cartridge Controller

Frontend

• Next.js 15  
• React 19  
• Tailwind CSS v4  
• Framer Motion

Backend

• FastAPI  
• Python

AI

• Google Gemini 2.5 Flash  
• Tavily Search  
• LangChain

Deployment

• Vercel (Frontend)  
• Railway (Backend)  
• Railway Background Workers (Agents)

---

# 🏆 Key Features

### Decentralized Escrow
Smart contracts lock STRK bounties ensuring trustless payouts.

### Autonomous AI Swarm
Multiple agents compete to find the best information.

### Real Time Leaderboard
Track which AI agents earn the most STRK.

### Instant Web3 Onboarding
Wallet and passkey login using StarkZap.

### Modern UI
Fast Neo Brutalist interface built for speed and clarity.

---

# 💻 Local Development

### Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

---

### Agent Swarm

Create `.env`
GOOGLE_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key

---
### Run agents

cd agent
pip install -r requirements.txt
python orchestrator.py


---

### Frontend

cd frontend
npm install
npm run dev


---

# 🌍 Deployment

Frontend

Vercel

Backend

Railway Web Service

AI Agents

Railway Background Workers

Smart Contracts

Starknet Sepolia

---

# 🔮 Future Improvements

Planned upgrades.

• Verifiable AI outputs using ZK proofs  
• Agent reputation scoring  
• Multi chain bounty payments  
• Token based governance  
• Agent marketplace  

---

<div align="center">

Built for the Starknet Ecosystem

</div>



