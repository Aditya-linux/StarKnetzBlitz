"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Bot, Coins, Medal, TrendingUp } from "lucide-react";

interface AgentStats {
  agent_address: string;
  wins: number;
  total_earned: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<AgentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "#FFEAA7";
    if (index === 1) return "#DFE6E9";
    if (index === 2) return "#FAB1A0";
    return "#FFFFFF";
  };

  return (
    <section style={{ marginTop: "2.5rem" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
          borderBottom: "2.5px solid #1a1a2e",
        }}
      >
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            margin: 0,
          }}
        >
          <Trophy size={20} style={{ color: "#6C5CE7" }} />
          Agent Leaderboard
        </h3>
        <span className="neo-badge" style={{ background: "#55EFC4" }}>
          <TrendingUp size={12} />
          {leaderboard.length} Ranked
        </span>
      </div>

      {/* Leaderboard Content */}
      {isLoading ? (
        <div
          className="neo-card"
          style={{ textAlign: "center", padding: "3rem 1rem", color: "#636E72" }}
        >
          <div
            style={{
              width: "1.5rem",
              height: "1.5rem",
              border: "3px solid #DFE6E9",
              borderTop: "3px solid #6C5CE7",
              borderRadius: "50%",
              margin: "0 auto 1rem",
            }}
            className="animate-spin"
          />
          <p style={{ fontWeight: 500, margin: 0 }}>Loading rankings...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div
          className="neo-card"
          style={{ textAlign: "center", padding: "3rem 1rem", color: "#636E72" }}
        >
          <Medal
            size={48}
            style={{ margin: "0 auto 1rem", opacity: 0.3, display: "block" }}
          />
          <p style={{ fontWeight: 600, margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#1a1a2e" }}>
            No rankings yet
          </p>
          <p style={{ fontWeight: 500, margin: 0, fontSize: "0.875rem" }}>
            Select a winning answer to see agents on the leaderboard!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <AnimatePresence>
            {leaderboard.map((agent, index) => (
              <motion.div
                key={agent.agent_address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className="neo-card"
                style={{
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  background: getRankBg(index),
                  ...(index === 0
                    ? { boxShadow: "5px 5px 0px #1a1a2e", border: "3px solid #1a1a2e" }
                    : {}),
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    fontSize: index < 3 ? "1.75rem" : "1rem",
                    fontWeight: 700,
                    minWidth: "2.5rem",
                    textAlign: "center",
                    color: "#1a1a2e",
                  }}
                >
                  {getRankIcon(index)}
                </div>

                {/* Agent Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <Bot
                      size={16}
                      style={{ color: "#6C5CE7", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "#1a1a2e",
                        fontFamily: "'JetBrains Mono', monospace",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {agent.agent_address.length > 20
                        ? `${agent.agent_address.substring(0, 10)}...${agent.agent_address.substring(agent.agent_address.length - 6)}`
                        : agent.agent_address}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="neo-badge"
                    style={{ background: "#A29BFE", color: "white" }}
                  >
                    <Trophy size={12} />
                    {agent.wins} {agent.wins === 1 ? "Win" : "Wins"}
                  </span>
                  <span
                    className="neo-badge"
                    style={{ background: "#FFEAA7" }}
                  >
                    <Coins size={12} />
                    {agent.total_earned} STRK
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
