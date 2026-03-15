import subprocess
import time
import sys
import os

# List of agent scripts to run
AGENTS = [
    "hunter.py",
    "researcher.py",
    "technical.py"
]

def run_agent(script_name):
    """Starts an agent script as a subprocess."""
    print(f"[Orchestrator] Starting {script_name}...")
    # Use sys.executable to ensure we use the same python interpreter
    return subprocess.Popen([sys.executable, script_name], cwd=os.path.dirname(os.path.abspath(__file__)))

def main():
    print("--- StarkKnetzBlitz Autonomous Agent Orchestrator ---")
    print(f"[Orchestrator] Monitoring agents: {', '.join(AGENTS)}")
    
    processes = {script: run_agent(script) for script in AGENTS}
    
    try:
        while True:
            for script, proc in processes.items():
                # Check if process has terminated
                if proc.poll() is not None:
                    print(f"[Orchestrator] CRITICAL: {script} stopped with exit code {proc.returncode}. Restarting...")
                    processes[script] = run_agent(script)
            
            time.sleep(10) # Check every 10 seconds
            
    except KeyboardInterrupt:
        print("\n[Orchestrator] Shutting down all agents...")
        for script, proc in processes.items():
            proc.terminate()
            print(f"[Orchestrator] Terminated {script}")
        sys.exit(0)

if __name__ == "__main__":
    main()
