// src/pages/student/AIAssistant.jsx
import { useState } from "react";
import { apiRequest } from "../../services/api";

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    {
      text: "Hi Alex! I am your AI study assistant. I can help you understand concepts, quiz you, summarize content, or help with your assignments. What would you like to work on today?",
      isUser: false,
    },
  ]);
  const prompts = ["Explain neural networks simply", "Quiz me on SQL joins", "Summarize AI Ethics", "Help with my assignment"];

  const send = async (text) => {
    const t = text || input;
    if (!t.trim()) return;
    const newMsgs = [...msgs, { text: t, isUser: true }];
    setMsgs(newMsgs);
    setInput("");
    try {
      const data = await apiRequest("/ai/student-assistant", {
        method: "POST",
        body: { prompt: t },
      });
      setMsgs([
        ...newMsgs,
        {
          text: data.output || "No response generated.",
          isUser: false,
        },
      ]);
    } catch (error) {
      setMsgs([
        ...newMsgs,
        {
          text: error.message || "Could not connect to AI. Please check your connection.",
          isUser: false,
        },
      ]);
    }
  };

  return (
    <>
      <div className="sd-page-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
          AI Learning
        </div>
        <h2>AI Study Assistant</h2>
        <p>Your personal AI tutor, available 24/7 to help you learn faster and smarter.</p>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg,var(--g1),var(--g3))", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "white" }}>
            <i className="fa-solid fa-robot"></i>
          </div>
          <div>
            <div style={{ fontFamily: "Outfit", fontWeight: "700", fontSize: "14px" }}>JAWA AI Tutor</div>
            <div style={{ fontSize: "11px", color: "var(--g2)", display: "flex", alignItems: "center", gap: "5px" }}>
              <i className="fa-solid fa-circle" style={{ fontSize: "6px" }}></i>
              Online
            </div>
          </div>
        </div>
        <div style={{ height: "380px", overflowY: "auto", padding: "16px", background: "var(--surface2)", display: "flex", flexDirection: "column", gap: "10px" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.isUser ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "75%",
                background: m.isUser ? "linear-gradient(135deg,var(--g1),var(--g2))" : "var(--surface)",
                color: m.isUser ? "white" : "var(--dark)",
                borderRadius: m.isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "12px 16px",
                fontSize: "13px",
                lineHeight: "1.5",
                border: m.isUser ? "none" : "1px solid var(--border)",
                boxShadow: "0 2px 8px rgba(0,0,0,.06)",
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: "6px", borderBottom: "1px solid var(--border)" }}>
          {prompts.map((p) => (
            <button key={p} onClick={() => send(p)} style={{ background: "var(--g-light)", color: "var(--g3)", border: "1px solid var(--g-mid)", padding: "5px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>{p}</button>
          ))}
        </div>
        <div style={{ padding: "14px 16px", display: "flex", gap: "10px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask me anything about your studies..."
            style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "12px", padding: "10px 16px", fontSize: "13px", fontFamily: "DM Sans", outline: "none", background: "var(--surface2)", color: "var(--dark)" }}
          />
          <button onClick={() => send()} style={{ background: "linear-gradient(135deg,var(--g1),var(--g2))", color: "white", border: "none", width: "44px", height: "44px", borderRadius: "12px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Send message">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </>
  );
}
