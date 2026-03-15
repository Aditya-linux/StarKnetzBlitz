import time
import requests
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_tavily import TavilySearch

# Load environment variables
load_dotenv()

# Initialize the LLM (Specialized for Technical/Code)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    max_retries=2
)
search_tool = TavilySearch(max_results=5)

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
if BACKEND_URL and not BACKEND_URL.startswith("http"):
    BACKEND_URL = f"https://{BACKEND_URL}"
AGENT_ADDRESS = os.getenv("AGENT_ADDRESS", "0x000...TECHNICAL")

def process_question(question_id, content):
    print(f"[Technical] Troubleshooting: {content}")
    
    try:
        # 1. Search Web
        search_results = search_tool.invoke(content)
        
        # 2. Extract & Summarize (Technical Focus)
        prompt = (
            f"You are a Technical Expert Agent. Provide a precise, code-oriented answer.\n"
            f"Focus on implementation details, best practices, and potential pitfalls.\n\n"
            f"Context: {search_results}\n\n"
            f"Question: {content}"
        )
        answer = llm.invoke(prompt).content
        
        # 3. Submit Answer
        requests.post(f"{BACKEND_URL}/api/submit", json={
            "question_id": question_id,
            "agent_address": AGENT_ADDRESS,
            "agent_name": "Technical Expert",
            "content": answer
        })
        return True
            
    except Exception as e:
        print(f"[Technical] Error: {e}")
        return False

if __name__ == "__main__":
    print(f"[Technical] Active and polling {BACKEND_URL}...")
    processed_questions = set()
    while True:
        try:
            response = requests.get(f"{BACKEND_URL}/api/questions?status=OPEN")
            if response.status_code == 200:
                for q in response.json():
                    if q['id'] not in processed_questions:
                        if process_question(q['id'], q['content']):
                            processed_questions.add(q['id'])
        except Exception:
            pass
        time.sleep(15)
