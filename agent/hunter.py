import time
import requests
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools.tavily_search import TavilySearchResults

# Load environment variables (TAVILY_API_KEY, OPENAI_API_KEY)
load_dotenv()

# Check if keys are available, but don't crash if they aren't, 
# you'll need them at runtime
if not os.getenv("GOOGLE_API_KEY"):
    print("WARNING: GOOGLE_API_KEY (for Gemini) is not set.")
if not os.getenv("TAVILY_API_KEY"):
    print("WARNING: TAVILY_API_KEY is not set.")

# Initialize the LLM and Search Tool
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", max_retries=2)
search_tool = TavilySearchResults(max_results=3)

# Configuration
BACKEND_URL = "http://localhost:8000"
# Replace this with a real Starknet address generated later, or hardcode a fake one
AGENT_ADDRESS = os.getenv("AGENT_ADDRESS", "0x0123...AGENT")

def process_question(question_id, content):
    print(f"[{AGENT_ADDRESS}] Received new bounty: {content}")
    
    try:
        # 1. Search Web
        print(f"[{AGENT_ADDRESS}] Searching web via Tavily...")
        search_results = search_tool.invoke(content)
        
        # 2. Extract & Summarize
        print(f"[{AGENT_ADDRESS}] Synthesizing answer with GPT...")
        prompt = (
            f"Answer the following question based ONLY on this fresh search context.\n"
            f"Be concise, direct, and well-formatted using markdown.\n\n"
            f"Context: {search_results}\n\n"
            f"Question: {content}"
        )
        answer = llm.invoke(prompt).content
        
        # 3. Submit Answer to Backend
        print(f"[{AGENT_ADDRESS}] Submitting answer to backend...")
        response = requests.post(f"{BACKEND_URL}/api/submit", json={
            "question_id": question_id,
            "agent_address": AGENT_ADDRESS,
            "content": answer
        })
        
        if response.status_code == 200:
            print(f"[{AGENT_ADDRESS}] Successfully submitted answer!")
            return True
        else:
            print(f"[{AGENT_ADDRESS}] Failed to submit: {response.text}")
            return False
            
    except Exception as e:
        print(f"[{AGENT_ADDRESS}] Error processing question: {e}")
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            print(f"[{AGENT_ADDRESS}] Rate limit hit! Sleeping for 60 seconds...")
            time.sleep(60)
        return False

if __name__ == "__main__":
    print(f"[{AGENT_ADDRESS}] Starting Information Hunter Agent...")
    print(f"[{AGENT_ADDRESS}] Polling {BACKEND_URL} for OPEN questions...")
    
    # Store processed IDs to avoid answering the same question multiple times
    processed_questions = set()
    
    while True:
        try:
            # Fetch open questions
            response = requests.get(f"{BACKEND_URL}/api/questions?status=OPEN")
            
            if response.status_code == 200:
                open_questions = response.json()
                
                for q in open_questions:
                    if q['id'] not in processed_questions:
                        success = process_question(q['id'], q['content'])
                        if success:
                            processed_questions.add(q['id'])
                        else:
                            # Break out to avoid spamming the API on failure
                            break
            
        except requests.exceptions.ConnectionError:
            print(f"[{AGENT_ADDRESS}] Cannot connect to backend. Retrying in 5 seconds...")
            
        # VERY IMPORTANT: Slow down the loop significantly to respect Free Tier Limits
        # 15 RPM means ~1 request every 4 seconds max. A 12-second sleep gives plenty of safety buffer.
        time.sleep(12)
