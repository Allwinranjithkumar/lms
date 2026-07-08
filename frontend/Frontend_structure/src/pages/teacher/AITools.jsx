import { useState } from "react";
import { apiRequest } from "../../services/api";

const tools = [
  {
    id: "quiz",
    icon: "fa-solid fa-brain",
    title: "AI Quiz Generator",
    desc: "Generate quizzes and assessments from your course content automatically.",
    bg: "linear-gradient(135deg,#064E3B,#00C853)",
    tag: "Assessment",
  },
  {
    id: "content",
    icon: "fa-solid fa-pen-nib",
    title: "Content Writer",
    desc: "Generate lesson scripts, explanations, and study materials with AI.",
    bg: "linear-gradient(135deg,#1e3a5f,#2563EB)",
    tag: "Content",
  },
  {
    id: "feedback",
    icon: "fa-regular fa-message",
    title: "Assignment Feedback",
    desc: "Get AI-powered feedback suggestions for student submissions.",
    bg: "linear-gradient(135deg,#7c2d92,#A855F7)",
    tag: "Grading",
  },
  {
    id: "rubric",
    icon: "fa-solid fa-clipboard-list",
    title: "Rubric Builder",
    desc: "Create detailed grading rubrics for any assignment type.",
    bg: "linear-gradient(135deg,#92400e,#F59E0B)",
    tag: "Grading",
  },
  {
    id: "syllabus",
    icon: "fa-solid fa-book-open",
    title: "Syllabus Generator",
    desc: "Generate a complete course syllabus from a topic description.",
    bg: "linear-gradient(135deg,#0f172a,#334155)",
    tag: "Planning",
  },
  {
    id: "translate",
    icon: "fa-solid fa-globe",
    title: "Content Translator",
    desc: "Translate your course materials into multiple languages instantly.",
    bg: "linear-gradient(135deg,#134e4a,#0D9488)",
    tag: "Localization",
  },
];

const recentActivity = [
  { icon: "fa-solid fa-brain", text: "Generated 20-question quiz for React Hooks", time: "2h ago" },
  { icon: "fa-solid fa-pen-nib", text: "Wrote lesson intro for Python Functions", time: "Yesterday" },
  { icon: "fa-solid fa-clipboard-list", text: "Created rubric for UI Design project", time: "2 days ago" },
];

export default function AITools() {
  const [activeTool, setActiveTool] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runTool = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");

    try {
      const data = await apiRequest("/ai/teacher-tool", {
        method: "POST",
        body: {
          tool: activeTool?.title,
          prompt,
        },
      });
      setOutput(data.output || "No response generated.");
    } catch (error) {
      setOutput(error.message || "Could not connect to AI. Please check your connection.");
    }
    setLoading(false);
  };

  if (activeTool) {
    return (
      <div className="content">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => { setActiveTool(null); setOutput(""); setPrompt(""); }}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px",
              padding: "8px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", color: "var(--dark)",
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
          <div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "20px", fontWeight: "800", color: "var(--dark)" }}>
              <i className={activeTool.icon}></i> {activeTool.title}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>{activeTool.desc}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Input */}
          <div className="section-card">
            <div className="sec-title" style={{ marginBottom: "16px" }}><i className="fa-solid fa-pen-to-square"></i> Your Input</div>
            <textarea
              style={{
                width: "100%", height: "240px", padding: "14px", border: "1px solid var(--border)",
                borderRadius: "12px", fontSize: "13px", fontFamily: "'DM Sans',sans-serif",
                color: "var(--dark)", background: "var(--surface2)", outline: "none",
                resize: "vertical", lineHeight: "1.6",
              }}
              placeholder={
                activeTool.id === "quiz"
                  ? "Paste your lesson content or topic (e.g. 'React useEffect hook and its dependency array')..."
                  : activeTool.id === "content"
                  ? "Describe what you want written (e.g. 'Introduction lesson for Python lists for beginners')..."
                  : activeTool.id === "syllabus"
                  ? "Describe your course (e.g. 'Full-stack web development with React and Node.js, 12 weeks')..."
                  : "Describe what you need..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{ marginTop: "14px", width: "100%", justifyContent: "center", padding: "12px" }}
              onClick={runTool}
              disabled={loading || !prompt.trim()}
            >
              {loading ? <><i className="fa-solid fa-hourglass-half"></i> Generating...</> : <><i className="fa-solid fa-rocket"></i> Generate with AI</>}
            </button>
          </div>

          {/* Output */}
          <div className="section-card">
            <div className="sec-header" style={{ marginBottom: "14px" }}>
              <div className="sec-title"><i className="fa-solid fa-wand-magic-sparkles"></i> AI Output</div>
              {output && (
                <button
                  className="sec-action"
                  onClick={() => navigator.clipboard.writeText(output)}
                >
                  <i className="fa-regular fa-copy"></i> Copy
                </button>
              )}
            </div>
            <div
              style={{
                minHeight: "240px", background: "var(--surface2)", borderRadius: "12px",
                padding: "16px", fontSize: "13px", color: "var(--dark)", lineHeight: "1.7",
                whiteSpace: "pre-wrap", border: "1px solid var(--border)", fontFamily: "'DM Sans',sans-serif",
                overflowY: "auto", maxHeight: "400px",
              }}
            >
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--muted)" }}>
                  <div
                    style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      border: "2px solid var(--g1)", borderTopColor: "transparent",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  AI is thinking...
                </div>
              )}
              {!loading && !output && (
                <div style={{ color: "var(--muted)", textAlign: "center", paddingTop: "60px" }}>
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                  Your AI-generated content will appear here
                </div>
              )}
              {output}
            </div>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div className="content">
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "22px", fontWeight: "800", color: "var(--dark)", marginBottom: "4px" }}>
          AI Tools
        </h2>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>
          Supercharge your teaching with AI-powered tools
        </p>
      </div>

      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg,var(--g3) 0%,#0a6640 60%)",
          borderRadius: "18px", padding: "28px 32px", marginBottom: "28px",
          display: "flex", alignItems: "center", gap: "24px",
        }}
      >
        <div style={{ fontSize: "48px", color: "white" }}><i className="fa-solid fa-robot"></i></div>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "22px", fontWeight: "800", color: "white", marginBottom: "6px" }}>
            AI Teaching Assistant
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,.7)", lineHeight: "1.6", maxWidth: "500px" }}>
            Leverage the power of AI to create course content, generate quizzes,
            provide feedback, and save hours of manual work every week.
          </div>
        </div>
        <div style={{ marginLeft: "auto", flexShrink: 0 }}>
          <div style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", borderRadius: "14px", padding: "14px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "28px", fontWeight: "800", color: "white" }}>6</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,.7)" }}>AI Tools Available</div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="ai-grid" style={{ marginBottom: "28px" }}>
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="ai-card"
            style={{ background: tool.bg }}
            onClick={() => setActiveTool(tool)}
          >
            <div
              style={{
                fontSize: "9px", fontWeight: "700", letterSpacing: ".08em",
                textTransform: "uppercase", color: "rgba(255,255,255,.7)",
                marginBottom: "10px",
              }}
            >
              {tool.tag}
            </div>
            <div className="ai-icon-wrap"><i className={tool.icon}></i></div>
            <h4>{tool.title}</h4>
            <p>{tool.desc}</p>
            <button onClick={() => alert('Feature coming soon!')} className="ai-launch">
              Launch Tool →
            </button>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="section-card">
        <div className="sec-header">
          <div className="sec-title"><i className="fa-regular fa-clock"></i> Recent AI Activity</div>
          <button onClick={() => alert('Feature coming soon!')} className="sec-action">View All →</button>
        </div>
        {recentActivity.map((a, i) => (
          <div key={i} className="notif-item">
            <div className="notif-dot-icon" style={{ background: "var(--g-light)" }}><i className={a.icon}></i></div>
            <div>
              <div className="notif-text">{a.text}</div>
              <div className="notif-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
