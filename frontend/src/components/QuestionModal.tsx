"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Coins, Wallet, AlertTriangle } from "lucide-react";
import { useStarkZap } from "./StarkZapProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const OWNER_ADDRESS = "0x022f5A1244c8FFC30f00260bCC6ed0D6eD8343DA4065592970A7D2BE4e811F60";

export default function QuestionModal({ isOpen, onClose, userAddress, onSuccess }: any) {
  const [content, setContent] = useState("");
  const [bounty, setBounty] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const { transferSTRK, refreshBalance, balance } = useStarkZap();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (balance < bounty) {
      alert(`Insufficient balance! You have ${balance} STRK but need ${bounty} STRK.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Transfer STRK to owner via real wallet signing
      setTxStatus("⏳ Opening wallet for signing...");
      const txHash = await transferSTRK(OWNER_ADDRESS, bounty);
      
      if (!txHash) {
        setTxStatus("❌ Transaction cancelled");
        setIsSubmitting(false);
        return;
      }

      setTxStatus(`✅ Tx signed! Hash: ${txHash.substring(0, 10)}...`);

      // Step 2: Register the bounty in backend
      setTxStatus("📡 Registering bounty on backend...");
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator: userAddress,
          content,
          bounty,
          tx_hash: txHash
        })
      });

      if (res.ok) {
        setTxStatus("🎉 Bounty posted!");
        await refreshBalance();
        setContent("");
        setBounty(5);
        setTimeout(() => {
          setTxStatus("");
          onSuccess();
        }, 1000);
      } else {
        setTxStatus("❌ Backend error");
        alert("Failed to register bounty on backend.");
      }
    } catch (err: any) {
      console.error(err);
      setTxStatus(`❌ Error: ${err.message || "Transaction failed"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ 
        position: "fixed", inset: 0, zIndex: 50, 
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        background: "rgba(26, 26, 46, 0.6)" 
      }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="neo-card"
          style={{ width: "100%", maxWidth: "32rem", overflow: "hidden", background: "#FFFFFF" }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "2.5px solid #1a1a2e" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }} className="accent-text">
              🎯 New Bounty
            </h3>
            <button 
              onClick={onClose} 
              className="neo-btn"
              style={{ background: "#DFE6E9", padding: "0.5rem" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 700, display: "block", marginBottom: "0.75rem", color: "#1a1a2e" }}>
                What do you want to know?
              </label>
              <textarea 
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g. Which Github repositories are trending today in Rust?"
                style={{ 
                  width: "100%", borderRadius: "0.75rem", padding: "1rem",
                  background: "#F5F0EB", border: "2.5px solid #1a1a2e",
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.875rem",
                  outline: "none", resize: "none", color: "#1a1a2e"
                }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1a2e" }}>Bounty Reward</label>
                <span className="neo-badge" style={{ background: "#FFEAA7" }}>
                  <Coins size={14} />
                  {bounty} STRK
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1"
                value={bounty}
                onChange={(e) => setBounty(Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, color: "#636E72", marginTop: "0.5rem" }}>
                <span>1 STRK</span>
                <span>⚡ Fastest Agent Wins</span>
                <span>50 STRK</span>
              </div>
            </div>

            {/* Balance Warning */}
            {balance < bounty && (
              <div style={{ 
                padding: "0.75rem", borderRadius: "0.5rem", 
                background: "#FFEAA7", border: "2px solid #E2BC3F",
                display: "flex", alignItems: "center", gap: "0.5rem",
                fontSize: "0.8rem", fontWeight: 600, color: "#1a1a2e"
              }}>
                <AlertTriangle size={16} />
                Insufficient balance ({balance} STRK). You need {bounty} STRK.
              </div>
            )}

            {/* Transaction Status */}
            {txStatus && (
              <div style={{ 
                padding: "0.75rem", borderRadius: "0.5rem", 
                background: txStatus.includes("❌") ? "#FAB1A0" : "#55EFC4",
                border: "2px solid #1a1a2e",
                fontSize: "0.8rem", fontWeight: 600, color: "#1a1a2e",
                textAlign: "center"
              }}>
                {txStatus}
              </div>
            )}

            <div style={{ paddingTop: "1rem", borderTop: "2.5px dashed #DFE6E9" }}>
              <button 
                type="submit"
                disabled={isSubmitting || !content.trim() || balance < bounty}
                className="neo-btn-accent"
                style={{ 
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem", padding: "1rem", fontSize: "1rem",
                  opacity: (isSubmitting || !content.trim() || balance < bounty) ? 0.5 : 1,
                  cursor: (isSubmitting || !content.trim() || balance < bounty) ? "not-allowed" : "pointer"
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ width: "1.25rem", height: "1.25rem", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} className="animate-spin" />
                    {txStatus.includes("wallet") ? "Waiting for Wallet..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <Wallet size={18} />
                    Sign & Post Bounty ({bounty} STRK)
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
