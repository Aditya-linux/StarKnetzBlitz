# 🕵️ Information Hunter Agents - Hackathon Blueprint

*A complete guide for a solo developer to build a decentralized marketplace for real-time information gathering using autonomous AI agents and Starknet.*

---

## 🚀 Problem Statement

**The Real-World Problem:**
Users constantly need highly specific, synthesized, and up-to-the-minute information. 
- **Search engines (Google, etc.):** Provide lists of links, requiring manual clicking, reading, and synthesizing to extract the exact answer.
- **Traditional LLMs (ChatGPT, Claude):** Suffer from knowledge cutoffs and struggle with *today's* news. They hallucinate when they lack real-time context.

**How Financial Incentives Improve Quality:**
By associating a crypto bounty with a query, we create an open marketplace. Instead of relying on a single underlying model, multiple autonomous agents (with different search tools, prompts, and APIs) compete to find the best answer. The financial reward incentivizes optimal data extraction and reduces latency—the fastest and most accurate agent wins the bounty.

**Why Blockchain for Trust and Transparency:**
- It provides a trustless escrow for the bounty. 
- It creates a transparent, immutable public ledger of agent performance and reputation.
- It enables instant, borderless micro-payments to machine agents.

---

## 🔮 Product Vision

**Long-Term Vision:**
To become the ultimate "Decentralized Oracle Network for Human Queries." 

**Evolution:**
- **Decentralized Information Markets:** Users can bet on outcomes of events predicted by the swarm of agents.
- **Autonomous Research Agents:** Specialized agents for niches (Biotech, GitHub code analysis, Blockchain security) that can perform deep-dive reports over days, funded by large bounties.
- **AI Data Bounty Networks:** Corporations could fund large data-scraping bounties, and a swarm of agents would clean, structure, and provide the data trustlessly.

---

## 🎯 Hackathon MVP Scope (3 Hours)

To deliver a working MVP as a solo developer within 180 minutes, you must heavily scope down:

**Essential Features (Build These):**
- **Smart Contract:** A simple escrow contract in Cairo that holds funds and distributes them to the winning agent.
- **Frontend / UI:** Next.js app using Starkzap for one-click login and gasless bounty posting.
- **The Agent:** A single Python script using LangChain and Tavily API that listens for questions, searches the web, and submits the answer back.

**Optional Features (Mock or Skip):**
- **Multiple competing agents:** Run the same Python script locally 2-3 times with slightly different prompts to simulate competition.
- **Complex UI:** Skip agent profile pages; focus just on the "Feed" and "Question Details" page.
- **Automated AI Judge:** For the MVP, the human who asks the question manually chooses the winner.

---

## 🏗️ System Architecture

The architecture is divided into 5 distinct layers communicating with each other:

1. **Frontend Layer (Next.js + Starkzap):** The user interface where users log in, post questions, and select winners. Communicates with Smart Contracts via Starknet RPC, and Backend via REST/Websockets.
2. **Backend Layer (Python/FastAPI or Node/Express):** Acts as an indexer and webhook router. It catches "New Question" events from the blockchain or frontend, and pings the Agent Layer.
3. **AI Agent Layer (Python + LangChain):** The off-chain worker. Receives the query, uses search APIs, processes context with LLMs, and formats the answer.
4. **Blockchain Layer (Starknet):** The Cairo smart contract acting as the decentralized database for bounties, and the bank holding the STRK/ETH tokens.
5. **Evaluation Layer:** The User (in the MVP) reading the submissions on the frontend and signing a transaction to trigger `select_winner`.

---

## 🔄 User Flow

1. **User logs in:** User arrives at the app and clicks "Login". Starkzap handles social login/passkeys and creates an embedded wallet.
2. **User posts a question:** User types "What GitHub repos are trending today in Python?"
3. **User attaches bounty:** User sets bounty to `5 STRK` and clicks "Ask". A Starkzap gasless transaction triggers the `create_question` smart contract function.
4. **Agents fetch info:** The Backend detects the new question, broadcasts it. The Python Agent catches it, pings Tavily API, and synthesizes the answer using OpenAI.
5. **Agents submit answers:** The Python Agent calls the backend API and/or Starknet directly to log their submission. 
6. **User selects best answer:** The user reads the submitted answers on the UI, clicks "Award Bounty" on the best one. 
7. **Smart contract releases reward:** The Starknet contract instantly transfers the `5 STRK` from escrow to the Agent's wallet address.

---

## 🤖 AI Agent Design

**The Pipeline:**
1. **Question Analysis:** Agent uses an LLM to extract keywords and determine the search intent.
2. **Web Search:** Agent uses Tavily API (specifically designed for AI) to crawl the latest news/pages.
3. **Information Extraction:** Skims the returned context for the exact answer.
4. **Summarization:** Formats the findings into a very concise, readable markdown format.
5. **Answer Submission:** Submits the data back via an HTTP POST request or on-chain transaction.

**Tools to Use:**
- **Language:** Python
- **Framework:** LangChain (or single OpenAI calls if you want to keep it simple).
- **LLM:** OpenAI `gpt-4o-mini` (fast and cheap).
- **Search Tool:** Tavily API (Much better than SerpAPI for agents as it returns clean text chunks, not raw HTML).

---

## 📝 Smart Contract Design on Starknet (Cairo)

**Why Starknet?**
Starknet's native Account Abstraction (AA) makes it incredibly easy for autonomous agents (which are just code) to manage keys and interact with contracts. Starkzap utilizes this AA for seamless human onboarding.

**Contract Responsibilities:**
- Store a mapping of Questions (ID -> Details).
- Hold bounty funds in escrow securely.
- Only allow the question creator to select the winner.

**Core Functions:**
- `create_question(ipfs_hash_or_string: ByteArray, amount: u256) -> u256`
- `submit_answer(question_id: u256, answer_hash: ByteArray)`
- `select_winner(question_id: u256, winning_agent: ContractAddress)` -> Distributes the tokens.
- `claim_refund(question_id: u256)` -> If no one answers in 24 hours.

---

## ⚡ Starkzap Integration

**How it improves onboarding:**
Hackathon judges hate downloading browser extensions (like Argent X/Braavos) and finding faucet tokens. 
Starkzap SDK enables:
- **Social Login / Passkeys:** Judges can log in using Google or FaceID.
- **Embedded Wallets:** A wallet is generated in the background.
- **Gasless Transactions:** Using Starknet Paymasters, you sponsor the gas fees for the users. 
**Result:** A Web2-like user experience with Web3 backend power.

---

## 🗄️ Data Structure Design

For the Backend Database (e.g., SQLite MVP) or IPFS:

- **Question Object:**
  - `id`: String (UUID or Starknet ID)
  - `creator_address`: String
  - `content`: String
  - `bounty_amount`: Number
  - `status`: Enum (OPEN, RESOLVED)
  - `created_at`: Timestamp
- **Answer Object:**
  - `id`: String
  - `question_id`: String
  - `agent_address`: String
  - `content`: String
  - `is_winner`: Boolean
- **Agent Profile:**
  - `agent_address`: String
  - `total_earned`: Number
  - `successful_answers`: Number

---

## 🖥️ Frontend Design (Next.js)

**UI Structure (Glassmorphism + Dark Mode recommended):**
1. **Landing Page:** Big hero text ("Real-Time Answers, Powered by AI Swarms"). Starkzap Login button.
2. **Feed Page:** A Pinterest/Twitter-like feed of open bounties.
3. **Ask Question Modal:** A clean text area + a slider to select the STRK bounty amount.
4. **Question Detail Page:** Shows the original question at the top, and a chat-like vertical list of Agent answers. Includes a "Crown/Select Winner" button on each answer (only visible to creator).

---

## ⚙️ Backend Design (FastAPI)

**Responsibilities:**
- Provide REST endpoints for the Next.js frontend to fetch questions/answers quickly without querying the blockchain every time.
- Provide a webhook endpoint for the AI python scripts to submit their answers.
- Indexer: Listen to Starknet `QuestionCreated` events.

**Recommended Stack:**
- **Python (FastAPI):** Because your AI agents will likely be written in Python, having a Python backend allows you to easily share code, models, and types. SQLite for rapid MVP prototyping.

---

## 🛠️ Technology Stack (Summary)

- **Frontend:** Next.js (React), Tailwind CSS, Framer Motion, Starkzap SDK.
- **Backend:** Python FastAPI, SQLite (or simple memory array for MVP).
- **AI / Agents:** Python, LangChain, OpenAI API, Tavily API.
- **Blockchain:** Cairo 2.0, Starknet Sepolia Testnet, Starknet.js.

---

## ⏱️ Hackathon Build Plan (180 Minutes)

*How a solo dev survives and wins:*

- **Minutes 0 - 30 (Environment & Contracts):** 
  - Scaffold Next.js app and FastAPI.
  - Write the Cairo smart contract (keep it extremely simple, ignore complex edge cases). Deploy to Starknet Sepolia.
- **Minutes 30 - 90 (The AI Agent):**
  - Write a standalone Python script.
  - Connect Tavily API + OpenAI. Give it a hardcoded question, ensure it spits out a good answer.
  - Wrap it in a `while True` loop that polls your FastAPI backend for new questions.
- **Minutes 90 - 150 (Frontend UI & Starkzap):**
  - Integrate Starkzap login.
  - Build the "Feed" and "Post Question" UI.
  - Wire up Starknet.js to call the `create_question` function.
- **Minutes 150 - 180 (Integration & Polish):**
  - Connect it all: Ask on UI -> Contract event -> Agent sees it -> Agent searches -> Agent posts answer -> UI updates.
  - Practice the demo!

---

## 🎬 Demo Scenario (For the Judges)

**The Setup:** "Judges, right now, traditional LLMs can't tell you what happened 10 minutes ago. Let's ask the swarm."
1. **Action:** Log in seamlessly with Starkzap using Google. (Judges go "Ooh, no metamask").
2. **Action:** Post the question: *"Which AI startups announced funding TODAY?"* and attach 5 Mock STRK.
3. **Live Action:** Open your terminal and show the Python Agent's logs. The terminal rapidly prints: `[Agent-1] Searching Tavily... [Agent-1] Extracting TechCrunch data... [Agent-1] Submitting transaction...`
4. **Action:** Tab back to the UI. The answer pops up: *"Glean announced a $200M round today at a $4.6B valuation..."*
5. **Action:** Click "Award Bounty". A Starkzap pop-up handles the gasless Starknet transaction. The Agent's terminal prints: `[Agent-1] Received 5 STRK! 🤑`.

---

## 🏆 Why This Project Wins Hackathons

1. **AI + Crypto Synergy:** It uses blockchain where it actually makes sense (trustless micro-bounties for machines).
2. **Live "Wow" Factor:** Doing live web searches for today's news proves the project is real and not hardcoded.
3. **UX Focus:** Using Starkzap eliminates the Web3 UX friction, proving this could be a mass-market consumer app.
4. **Visual Execution:** Terminal logs scrolling while the UI updates in real-time creates a great developer theater.

---

## 💻 Pseudocode Examples

### 1. AI Agent Workflow (Python)
```python
import time
import requests
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults

llm = ChatOpenAI(model="gpt-4o-mini")
search_tool = TavilySearchResults(max_results=3)

def process_question(question_id, content):
    print(f"Agent received question: {content}")
    
    # 1. Search Web
    search_results = search_tool.invoke(content)
    
    # 2. Extract & Summarize
    prompt = f"Answer the following question based ONLY on this fresh context: {search_results}\nQuestion: {content}"
    answer = llm.invoke(prompt).content
    print(f"Agent generated answer: {answer}")
    
    # 3. Submit Answer to Backend
    requests.post("http://localhost:8000/api/submit", json={
        "question_id": question_id,
        "agent_address": "0xABC...123", # Agent's Starknet Address
        "content": answer
    })

# Simple polling loop for MVP
while True:
    open_questions = requests.get("http://localhost:8000/api/questions?status=OPEN").json()
    for q in open_questions:
        process_question(q['id'], q['content'])
    time.sleep(5)
```

### 2. Smart Contract Logic (Cairo 2.x - Conceptual)
```cairo
#[starknet::interface]
trait IAgentBounty<TContractState> {
    fn create_question(ref self: TContractState, question_id: u256, amount: u256);
    fn select_winner(ref self: TContractState, question_id: u256, winner_agent: ContractAddress);
}

#[starknet::contract]
mod AgentBounty {
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage {
        // question_id -> (creator, amount, is_resolved)
        bounties: LegacyMap<u256, (ContractAddress, u256, bool)>,
    }

    #[abi(embed_v0)]
    impl BountyImpl of super::IAgentBounty<ContractState> {
        fn create_question(ref self: ContractState, question_id: u256, amount: u256) {
            let caller = get_caller_address();
            // In reality, use ERC20 transferFrom to hold funds in escrow here
            self.bounties.write(question_id, (caller, amount, false));
        }

        fn select_winner(ref self: ContractState, question_id: u256, winner_agent: ContractAddress) {
            let (creator, amount, is_resolved) = self.bounties.read(question_id);
            let caller = get_caller_address();
            
            assert(caller == creator, 'Only creator can pick winner');
            assert(!is_resolved, 'Bounty already resolved');

            // Mark resolved
            self.bounties.write(question_id, (creator, amount, true));

            // Transfer funds to the winning agent
            // ERC20(_token_address).transfer(winner_agent, amount);
        }
    }
}
```

### 3. Backend API Endpoints (Python FastAPI)
```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# In-memory mock DB for MVP
db = {
    "questions": [],
    "answers": []
}

class QuestionSub(BaseModel):
    creator: str
    content: str
    bounty: float

class AnswerSub(BaseModel):
    question_id: int
    agent_address: str
    content: str

@app.post("/api/ask")
def create_question(q: QuestionSub):
    new_id = len(db["questions"]) + 1
    new_q = {"id": new_id, "creator": q.creator, "content": q.content, "bounty": q.bounty, "status": "OPEN"}
    db["questions"].append(new_q)
    return {"status": "success", "question_id": new_id}

@app.post("/api/submit")
def submit_answer(a: AnswerSub):
    db["answers"].append(a.model_dump())
    return {"status": "success"}

@app.get("/api/questions")
def get_open_questions(status: str = "OPEN"):
    return [q for q in db["questions"] if q["status"] == status]

@app.get("/api/answers/{question_id}")
def get_answers(question_id: int):
    return [a for a in db["answers"] if a["question_id"] == question_id]
```
