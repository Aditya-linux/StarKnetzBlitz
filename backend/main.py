from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import time

app = FastAPI(title="Information Hunter Agents Backend")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory mock Database for MVP
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

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Information Hunter Agents API"}

@app.post("/api/ask")
def create_question(q: QuestionSub):
    new_id = len(db["questions"]) + 1
    new_q = {
        "id": new_id, 
        "creator": q.creator, 
        "content": q.content, 
        "bounty": q.bounty, 
        "status": "OPEN",
        "created_at": datetime.now().isoformat()
    }
    db["questions"].append(new_q)
    return {"status": "success", "question_id": new_id}

@app.post("/api/submit")
def submit_answer(a: AnswerSub):
    new_id = len(db["answers"]) + 1
    new_a = {
        "id": new_id,
        "question_id": a.question_id,
        "agent_address": a.agent_address,
        "content": a.content,
        "created_at": datetime.now().isoformat(),
        "is_winner": False
    }
    db["answers"].append(new_a)
    return {"status": "success", "answer_id": new_id}

@app.get("/api/questions")
def get_open_questions(status: Optional[str] = None):
    if status:
        return [q for q in db["questions"] if q["status"] == status]
    return db["questions"]

@app.get("/api/answers/{question_id}")
def get_answers(question_id: int):
    return [a for a in db["answers"] if a["question_id"] == question_id]

@app.post("/api/select_winner")
def select_winner(question_id: int, answer_id: int, creator_address: str):
    # Find the question
    question = next((q for q in db["questions"] if q["id"] == question_id), None)
    if not question:
        return {"status": "error", "message": "Question not found"}
    
    if question["creator"] != creator_address:
        return {"status": "error", "message": "Only creator can select winner"}
        
    if question["status"] != "OPEN":
        return {"status": "error", "message": "Question is not OPEN"}

    # Find the answer
    answer = next((a for a in db["answers"] if a["id"] == answer_id and a["question_id"] == question_id), None)
    if not answer:
        return {"status": "error", "message": "Answer not found"}

    # Mark question as RESOLVED
    question["status"] = "RESOLVED"
    
    # Mark answer as winner
    answer["is_winner"] = True

    return {"status": "success", "message": "Winner selected"}

@app.get("/api/leaderboard")
def get_leaderboard():
    """Aggregate winning answers per agent with total bounty earned."""
    agent_stats: dict = {}
    for a in db["answers"]:
        if a["is_winner"]:
            addr = a["agent_address"]
            if addr not in agent_stats:
                agent_stats[addr] = {"agent_address": addr, "wins": 0, "total_earned": 0.0}
            agent_stats[addr]["wins"] += 1
            # Find the question to get bounty amount
            question = next((q for q in db["questions"] if q["id"] == a["question_id"]), None)
            if question:
                agent_stats[addr]["total_earned"] += question["bounty"]
    # Sort by wins descending, then by total_earned descending
    leaderboard = sorted(agent_stats.values(), key=lambda x: (x["wins"], x["total_earned"]), reverse=True)
    return leaderboard
