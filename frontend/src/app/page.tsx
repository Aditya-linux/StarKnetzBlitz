"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Search, Plus, RefreshCw, Zap, User, Coins, LogOut } from "lucide-react";
import Feed from "@/components/Feed";
import QuestionModal from "@/components/QuestionModal";
import Leaderboard from "@/components/Leaderboard";
import { useStarkZap } from "@/components/StarkZapProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, any[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Real StarkZap SDK context
  const { isConnected, address, balance, loginWithExtension, logout, isLoading: isLoginLoading } = useStarkZap();

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/questions`);
      const data = await res.json();
      setQuestions(data.reverse());
      
      const answersMap: Record<number, any[]> = {};
      for (const q of data) {
        const aRes = await fetch(`${API_URL}/api/answers/${q.id}`);
        const aData = await aRes.json();
        answersMap[q.id] = aData;
      }
      setAnswers(answersMap);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#F5F0EB", minHeight: "100vh", color: "#1a1a2e" }}>
      <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "1.5rem" }}>
        
        {/* Header */}
        <header className="neo-card" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.625rem", borderRadius: "0.75rem", background: "#A29BFE", border: "2.5px solid #1a1a2e" }}>
              <BrainCircuit size={26} color="#1a1a2e" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }} className="accent-text">
                Information Hunter
              </h1>
              <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "#636E72", margin: 0 }}>Decentralized AI Swarm · Starknet</p>
            </div>
          </div>

          {isConnected ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="neo-badge" style={{ background: "#FFEAA7" }}>
                <Coins size={14} />
                {balance} STRK
              </span>
              <span className="neo-badge" style={{ background: "#DFE6E9" }}>
                <User size={14} />
                {address.substring(0,6)}...{address.substring(address.length-4)}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="neo-btn"
                style={{ background: "#FAB1A0", padding: "0.5rem", display: "flex", alignItems: "center" }}
                title="Disconnect"
              >
                <LogOut size={16} />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loginWithExtension}
              disabled={isLoginLoading}
              className="neo-btn-accent"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", fontSize: "0.875rem", opacity: isLoginLoading ? 0.7 : 1 }}
            >
              {isLoginLoading ? (
                <>
                  <div style={{ width: "1rem", height: "1rem", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Connect Starkzap
                </>
              )}
            </motion.button>
          )}
        </header>

        {/* Hero Section */}
        <section className="neo-card" style={{ padding: "3rem 2rem", textAlign: "center", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
          {/* Decorative elements */}
          <div className="deco-shape" style={{ top: "1rem", right: "1.5rem", width: "4rem", height: "4rem", borderRadius: "50%", background: "#FFEAA7" }} />
          <div className="deco-shape" style={{ bottom: "1.5rem", left: "2rem", width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", background: "#A29BFE", transform: "rotate(12deg)" }} />
          <div className="deco-shape" style={{ top: "3rem", left: "4rem", width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "#55EFC4" }} />
          
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.02em", position: "relative", zIndex: 10, marginBottom: "0.75rem" }}>
            Ask the <span className="accent-text">AI Swarm</span> Anything
          </h2>
          <p style={{ maxWidth: "36rem", margin: "0 auto 2rem", fontSize: "1.125rem", color: "#636E72", position: "relative", zIndex: 10 }}>
            Post a bounty. Autonomous agents compete to scour the live internet and extract the best answer.
          </p>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", position: "relative", zIndex: 10 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if(!isConnected) return alert("Please login with Starkzap first!");
                setIsModalOpen(true);
              }}
              className="neo-btn-accent"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", fontSize: "1rem" }}
            >
              <Plus size={20} />
              Post Bounty
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchQuestions}
              disabled={isLoading}
              className="neo-btn"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", fontSize: "1rem", background: "#DFE6E9" }}
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} style={{ color: "#636E72" }} />
              <span style={{ color: "#1a1a2e" }}>Refresh</span>
            </motion.button>
          </div>
        </section>

        {/* Main Feed */}
        <main>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", marginBottom: "1.5rem", borderBottom: "2.5px solid #1a1a2e" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
              <Search size={20} style={{ color: "#6C5CE7" }} />
              Live Bounties
            </h3>
            <span className="neo-badge" style={{ background: "#A29BFE", color: "white" }}>
              {questions.length} Active
            </span>
          </div>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <AnimatePresence>
              {questions.map((q) => (
                <Feed 
                  key={q.id} 
                  question={q} 
                  answers={answers[q.id] || []} 
                  userAddress={address}
                  refreshData={fetchQuestions}
                />
              ))}
            </AnimatePresence>
            
            {questions.length === 0 && !isLoading && (
              <div className="neo-card" style={{ textAlign: "center", padding: "4rem 1rem", color: "#636E72" }}>
                <BrainCircuit size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p style={{ fontWeight: 500 }}>No bounties posted yet. Be the first!</p>
              </div>
            )}
          </div>

          {/* Leaderboard Section */}
          <Leaderboard />
        </main>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "1.5rem 0", fontSize: "0.875rem", fontWeight: 500, color: "#636E72", marginTop: "2rem" }}>
          Built on <span className="accent-text" style={{ fontWeight: 700 }}>Starknet</span> · Powered by <span className="accent-text" style={{ fontWeight: 700 }}>Starkzap SDK</span>
        </footer>

        <QuestionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userAddress={address}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchQuestions();
          }}
        />
      </div>
    </div>
  );
}

