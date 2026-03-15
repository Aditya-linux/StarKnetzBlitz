"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, User, CheckCircle2, ChevronDown, ChevronUp, Lock, Coins, Sparkles, Trophy, Crown } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useStarkZap } from "./StarkZapProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const AGENT_REWARD = 0.05; // STRK per agent

export default function Feed({ question, answers, userAddress, refreshData }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const { transferSTRK, refreshBalance } = useStarkZap();
  const bestAnswer = answers.find((a: any) => a.is_winner);

  const handleSelectWinner = async (answerId: number, agentName: string, agentAddress: string) => {
    setIsSelecting(true);
    setSelectedAgentName(agentName);
    try {
      // Step 1: Transfer reward to agent via real wallet signing
      setTxStatus(`⏳ Signing ${AGENT_REWARD} STRK → ${agentName}...`);
      const txHash = await transferSTRK(agentAddress, AGENT_REWARD);
      
      if (!txHash) {
        setTxStatus("❌ Transaction cancelled");
        setTimeout(() => setTxStatus(""), 2000);
        setIsSelecting(false);
        return;
      }

      setTxStatus(`✅ Tx: ${txHash.substring(0, 10)}... Registering winner...`);

      // Step 2: Register on backend
      const res = await fetch(`${API_URL}/api/select_winner?question_id=${question.id}&answer_id=${answerId}&creator_address=${userAddress}`, {
        method: "POST"
      });
      if(res.ok) {
        setTxStatus("🎉 Reward sent!");
        await refreshBalance();
        refreshData();
        setTimeout(() => setTxStatus(""), 3000);
      } else {
        const body = await res.json();
        setTxStatus("❌ " + body.message);
      }
    } catch (err: any) {
      console.error(err);
      setTxStatus(`❌ ${err.message || "Transaction failed"}`);
    } finally {
      setIsSelecting(false);
      setSelectedAgentName("");
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
          padding: "1.25rem 1.5rem", 
          cursor: "pointer", 
          background: isExpanded ? "#F8F4EF" : "transparent",
          borderRadius: isExpanded ? "16px 16px 0 0" : "16px",
          transition: "background 0.2s ease"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            {/* Status + Creator + Bounty — single row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span 
                className="neo-badge"
                style={{ background: question.status === 'OPEN' ? "#FFEAA7" : "#55EFC4" }}
              >
                {question.status === 'OPEN' ? <Lock size={12}/> : <CheckCircle2 size={12}/>}
                {question.status}
              </span>
              <span className="neo-badge" style={{ background: "#A29BFE", color: "white" }}>
                <Coins size={12} /> 
                {question.bounty} STRK
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "#636E72" }}>
                <User size={12} />
                {question.creator.substring(0,6)}...{question.creator.substring(question.creator.length-4)}
              </span>
              <span style={{ fontSize: "0.8rem", color: "#636E72", marginLeft: "auto" }}>
                {answers.length} {answers.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>
            
            {/* Question title */}
            <h4 style={{ fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.4, margin: 0, color: "#1a1a2e" }}>
              {question.content}
            </h4>
          </div>
          
          <button 
            className="neo-btn" 
            style={{ background: "#DFE6E9", padding: "0.4rem", flexShrink: 0 }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Answers Section — Horizontal Card Grid */}
      {isExpanded && (
        <div style={{ padding: "1rem 1.25rem", borderTop: "2.5px solid #1a1a2e", background: "#FAF6F1", borderRadius: "0 0 14px 14px" }}>
          {answers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#636E72" }}>
              <Bot size={28} style={{ margin: "0 auto 0.5rem", opacity: 0.3 }} className="animate-pulse" />
              <p style={{ fontWeight: 500, margin: 0, fontSize: "0.875rem" }}>Agents are scouring the web...</p>
            </div>
          ) : (
            <>
              {/* Winning Answer — full width */}
              {bestAnswer && (
                <div style={{ 
                  padding: "1rem", 
                  borderRadius: "0.75rem",
                  background: "#55EFC4", 
                  border: "2.5px solid #1a1a2e",
                  boxShadow: "3px 3px 0px #1a1a2e",
                  marginBottom: "0.75rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.9rem", color: "#1a1a2e" }}>
                      <Trophy size={16} /> 🏆 Winner: {bestAnswer.agent_name || "Agent"}
                    </span>
                    <span className="neo-badge" style={{ background: "#FFEAA7", fontSize: "0.7rem" }}>💰 0.05 STRK Paid</span>
                  </div>
                  <div className="prose-neo" style={{ fontSize: "0.85rem", color: "#2D3436", maxHeight: "200px", overflow: "auto" }}>
                    <ReactMarkdown>{bestAnswer.content}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Reward Breakdown — compact inline */}
              {bestAnswer && question.payouts && (
                <div style={{ 
                  padding: "0.5rem 0.75rem", 
                  borderRadius: "0.5rem",
                  background: "#FFF9E6", 
                  border: "1.5px solid #FFEAA7",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  fontSize: "0.75rem"
                }}>
                  <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Coins size={12} /> Breakdown:
                  </span>
                  {question.payouts.map((p: any, idx: number) => (
                    <span key={idx} className="neo-badge" style={{ 
                      background: p.agent_name === "Platform Owner" ? "#A29BFE" : "#55EFC4", 
                      color: p.agent_name === "Platform Owner" ? "white" : "#1a1a2e", 
                      fontSize: "0.7rem",
                      padding: "0.2rem 0.5rem"
                    }}>
                      {p.agent_name === "Platform Owner" ? "👑" : "🤖"} {p.agent_name}: {p.amount} STRK
                    </span>
                  ))}
                </div>
              )}

              {/* Other Submissions heading */}
              {bestAnswer && answers.filter((a: any) => !a.is_winner).length > 0 && (
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#636E72", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Sparkles size={12} /> Other Submissions
                </div>
              )}

              {/* Answer Cards — horizontal grid */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: answers.filter((a: any) => !a.is_winner).length > 1 ? "repeat(auto-fit, minmax(280px, 1fr))" : "1fr", 
                gap: "0.75rem" 
              }}>
                {answers.filter((a: any) => !a.is_winner).map((a: any) => (
                  <div 
                    key={a.id} 
                    style={{ 
                      padding: "0.75rem", 
                      borderRadius: "0.75rem",
                      background: "white", 
                      border: "2px solid #1a1a2e",
                      boxShadow: "2px 2px 0px #1a1a2e",
                      opacity: bestAnswer ? 0.65 : 1,
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    {/* Agent header + Reward button */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1.5px dashed #DFE6E9" }}>
                      <span className="neo-badge" style={{ background: "#DFE6E9", fontSize: "0.7rem", padding: "0.2rem 0.4rem" }}>
                        <Bot size={12} style={{ color: "#6C5CE7" }} />
                        {a.agent_name || "Agent"}
                      </span>
                      {question.status === 'OPEN' && question.creator === userAddress && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSelectWinner(a.id, a.agent_name || "Agent", a.agent_address); }}
                          disabled={isSelecting}
                          className="neo-btn"
                          style={{ 
                            background: "#55EFC4", 
                            padding: "0.2rem 0.5rem", 
                            fontSize: "0.65rem", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.25rem" 
                          }}
                        >
                          {isSelecting && selectedAgentName === (a.agent_name || "Agent") 
                            ? "⏳ Signing..." 
                            : <><Sparkles size={10} /> Reward</>
                          }
                        </button>
                      )}
                    </div>
                    
                    {/* Answer content — constrained height */}
                    <div className="prose-neo" style={{ fontSize: "0.8rem", color: "#2D3436", maxHeight: "150px", overflow: "auto", flex: 1 }}>
                      <ReactMarkdown>{a.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transaction Status Banner */}
              {txStatus && (
                <div style={{ 
                  padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
                  background: txStatus.includes("❌") ? "#FAB1A0" : txStatus.includes("✅") || txStatus.includes("🎉") ? "#55EFC4" : "#FFEAA7",
                  border: "2px solid #1a1a2e", fontSize: "0.75rem", fontWeight: 600,
                  textAlign: "center", color: "#1a1a2e"
                }}>
                  {txStatus}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
