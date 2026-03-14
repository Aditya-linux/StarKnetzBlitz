"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, User, CheckCircle2, ChevronDown, ChevronUp, Lock, Coins, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function Feed({ question, answers, userAddress, refreshData }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const bestAnswer = answers.find((a: any) => a.is_winner);

  const handleSelectWinner = async (answerId: number) => {
    setIsSelecting(true);
    try {
      await new Promise(res => setTimeout(res, 1500)); 
      const res = await fetch(`http://localhost:8000/api/select_winner?question_id=${question.id}&answer_id=${answerId}&creator_address=${userAddress}`, {
        method: "POST"
      });
      if(res.ok) {
        refreshData();
      } else {
        const body = await res.json();
        alert("Failed: " + body.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="neo-card"
      style={question.status === 'RESOLVED' ? { borderColor: "#00B894" } : {}}
    >
      {/* Question Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          padding: "1.5rem", 
          cursor: "pointer", 
          background: isExpanded ? "#F8F4EF" : "transparent",
          borderRadius: isExpanded ? "16px 16px 0 0" : "16px",
          transition: "background 0.2s ease"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            {/* Status + Creator row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span 
                className="neo-badge"
                style={{ background: question.status === 'OPEN' ? "#FFEAA7" : "#55EFC4" }}
              >
                {question.status === 'OPEN' ? <Lock size={12}/> : <CheckCircle2 size={12}/>}
                {question.status}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#636E72" }}>
                <User size={14} />
                {question.creator.substring(0,6)}...{question.creator.substring(question.creator.length-4)}
              </span>
            </div>
            
            {/* Question title */}
            <h4 style={{ fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4, margin: "0 0 0.75rem 0", color: "#1a1a2e" }}>
              {question.content}
            </h4>
            
            {/* Bounty + Submissions row */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span className="neo-badge" style={{ background: "#A29BFE", color: "white" }}>
                <Coins size={14} /> 
                {question.bounty} STRK
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#636E72" }}>
                {answers.length} {answers.length === 1 ? 'Submission' : 'Submissions'}
              </span>
            </div>
          </div>
          
          <button 
            className="neo-btn" 
            style={{ background: "#DFE6E9", padding: "0.5rem", flexShrink: 0 }}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Answers Section */}
      {isExpanded && (
        <div style={{ padding: "1.5rem", borderTop: "2.5px solid #1a1a2e", background: "#FAF6F1", borderRadius: "0 0 14px 14px" }}>
          {answers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "#636E72" }}>
              <Bot size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} className="animate-pulse" />
              <p style={{ fontWeight: 500, margin: 0 }}>Agents are currently scouring the web...</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Winning answer */}
              {bestAnswer && (
                <div style={{ 
                  padding: "1.25rem", 
                  borderRadius: "0.75rem",
                  background: "#55EFC4", 
                  border: "2.5px solid #1a1a2e",
                  boxShadow: "4px 4px 0px #1a1a2e"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontWeight: 700, fontSize: "1.125rem", color: "#1a1a2e" }}>
                    <CheckCircle2 size={20} /> 🏆 Winning Answer
                  </div>
                  <div className="prose-neo" style={{ fontSize: "0.875rem", color: "#2D3436" }}>
                     <ReactMarkdown>{bestAnswer.content}</ReactMarkdown>
                  </div>
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 500, borderTop: "2px dashed #1a1a2e" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#1a1a2e" }}><Bot size={14}/> Agent: {bestAnswer.agent_address}</span>
                    <span className="neo-badge" style={{ background: "#FFEAA7" }}>💰 Reward Paid via Starknet</span>
                  </div>
                </div>
              )}
              
              {/* Non-winning answers */}
              {!bestAnswer && answers.map((a: any) => (
                <div 
                  key={a.id} 
                  style={{ 
                    padding: "1.25rem", 
                    borderRadius: "0.75rem",
                    background: "white", 
                    border: "2.5px solid #1a1a2e",
                    boxShadow: "3px 3px 0px #1a1a2e"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "2px dashed #DFE6E9" }}>
                    <span className="neo-badge" style={{ background: "#DFE6E9" }}>
                      <Bot size={14} style={{ color: "#6C5CE7" }} />
                      Agent: {a.agent_address.substring(0,10)}...
                    </span>
                    {question.status === 'OPEN' && question.creator === userAddress && (
                      <button 
                        onClick={() => handleSelectWinner(a.id)}
                        disabled={isSelecting}
                        className="neo-btn"
                        style={{ background: "#55EFC4", padding: "0.375rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
                      >
                        {isSelecting ? "Processing Tx..." : <><Sparkles size={14} /> Reward Agent</>}
                      </button>
                    )}
                  </div>
                  
                  <div className="prose-neo" style={{ fontSize: "0.875rem", color: "#2D3436" }}>
                    <ReactMarkdown>{a.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
