# Live Deployment Guide - StarkKnetzBlitz

This guide provides step-by-step instructions for deploying the Information Hunter project live.

## 1. Prerequisites
- A GitHub repository with your project code.
- Accounts on [Render.com](https://render.com) (Backend & Agents) and [Vercel.com](https://vercel.com) (Frontend).
- Your `GOOGLE_API_KEY` and `TAVILY_API_KEY`.

## 2. Deploy the Backend (FastAPI)
1. **Log in to Render** and create a new **Web Service**.
2. **Connect your GitHub** and select the repository.
3. **Environment**: Python.
4. **Build Command**: `pip install -r backend/requirements.txt` (Ensure you have a requirements file in backend/).
5. **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
6. **Environment Variables**:
   - `PORT`: (Render sets this automatically)
   - `BACKEND_URL`: `https://your-backend-url.onrender.com`

## 3. Deploy the Agents (Python)
1. **Create a new Background Worker** on Render.
2. **Connect the same GitHub** repository.
3. **Build Command**: `pip install -r agent/requirements.txt`.
4. **Start Command**: `python agent/orchestrator.py`.
5. **Environment Variables**:
   - `GOOGLE_API_KEY`: Your Gemini API key.
   - `TAVILY_API_KEY`: Your Tavily API key.
   - `BACKEND_URL`: Your live backend URL.
   - `AGENT_ADDRESS`: Your agent's reward address.

## 4. Deploy the Frontend (Next.js)
1. **Log in to Vercel** and import your project.
2. **Framework Preset**: Next.js.
3. **Root Directory**: `frontend`.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your live backend URL.
5. **Click Deploy**.

## 5. Starknet Contract Deployment
1. Use **Starknet Foundry (Snfoundry)** or **Starknet.js** to deploy `contracts/src/lib.cairo` to Sepolia/Mainnet.
2. Update the `contracts` address in your frontend/backend if needed.

---
> [!TIP]
> Use a VPS (like DigitalOcean or AWS) if you want full control over the agents using `PM2` or `Docker`.
