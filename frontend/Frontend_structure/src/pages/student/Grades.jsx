import { useState, useEffect } from "react";
import { getStudentDashboard } from "../../services/api";

const gradeColor = {
  A: "#16A34A",
  B: "#0EA5E9",
  C: "#F59E0B",
  D: "#DC2626",
  F: "#DC2626",
};

// Fallback leaderboard since backend doesn't have it yet
const leaderboard = [
  { rank: 1, initials: "AK", name: "Aarav Kumar", score: 980, color: "#FEF3C7" },
  { rank: 2, initials: "SJ", name: "Sarah Jones", score: 945, color: "#F1F5F9" },
  { rank: 3, initials: "MP", name: "Mina Patel", score: 910, color: "#FFEDD5" },
  { rank: 4, initials: "JD", name: "John Doe", score: 890, color: "#DBEAFE", you: true },
  { rank: 5, initials: "EC", name: "Emily Chen", score: 860, color: "#FCE7F3" },
];

export default function Grades() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboard()
      .then((d) => setCourses(d.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="sd-page-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-solid fa-chart-line"></i>
          Academic Progress
        </div>
        <h2>My Grades</h2>
        <p>Review your performance across all enrolled courses.</p>
      </div>

      {loading && <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>Loading grades...</div>}

      {!loading && courses.length === 0 && (
        <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>No enrolled courses found.</div>
      )}

      {!loading && courses.length > 0 && (
        <>
          <div className="sd-grid-2" style={{ marginBottom: "24px" }}>
            <div className="sd-section-card">
              <div className="sd-sec-header">
                <div className="sd-sec-title">
                  <i className="fa-solid fa-chart-line"></i>
                  Course Grades
                </div>
              </div>
              {courses.map((c, i) => (
                <div key={i} className="sd-grade-row">
                  <div style={{ width: "36px", height: "36px", background: c.bg || "#E0E7FF", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                    <i className={c.icon || "fa-solid fa-book-open-reader"} style={{ color: "#3730A3" }}></i>
                  </div>
                  <div className="sd-grade-course">
                    <div className="sd-grade-name">{c.name || c.title}</div>
                    <div className="sd-grade-teacher">
                      <i className="fa-solid fa-user-tie"></i>
                      {c.teacher || c.instructor}
                    </div>
                  </div>
                  <div className="sd-grade-prog">
                    <div className="sd-prog-bar"><div className="sd-prog-fill" style={{ width: `${c.progress || 0}%` }}></div></div>
                    <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "3px" }}>{c.progress || 0}%</div>
                  </div>
                  <div className="sd-grade-badge" style={{ color: gradeColor[c.grade || "A"] || "var(--g3)" }}>{c.grade || "N/A"}</div>
                </div>
              ))}
            </div>
            <div className="sd-section-card">
              <div className="sd-sec-header">
                <div className="sd-sec-title">
                  <i className="fa-solid fa-ranking-star"></i>
                  Leaderboard
                </div>
              </div>
              {leaderboard.map((s, i) => (
                <div key={i} className="sd-leader-item">
                  <div className={`sd-rank${i === 0 ? " gold" : i === 1 ? " silver" : i === 2 ? " bronze" : ""}`}>{i + 1}</div>
                  <div className="sd-leader-av" style={{ background: s.color, color: "#333" }}>{s.initials}</div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="sd-leader-name">{s.name}</span>
                    {s.you && <span className="sd-you-badge">You</span>}
                  </div>
                  <div className="sd-leader-score">{s.score}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="sd-section-card">
            <div className="sd-sec-header">
              <div className="sd-sec-title">
                <i className="fa-solid fa-chart-simple"></i>
                Score Breakdown
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px" }}>
              {courses.map((c, i) => (
                <div key={i} style={{ background: "var(--surface2)", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", marginBottom: "8px", color: "#3730A3" }}>
                    <i className={c.icon || "fa-solid fa-book-open-reader"}></i>
                  </div>
                  <div style={{ fontFamily: "Outfit", fontSize: "24px", fontWeight: "800", color: gradeColor[c.grade || "A"] || "var(--g3)" }}>{c.grade || "N/A"}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{(c.progress || 0) * 0.95}/100</div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(c.name || c.title).split(" ")[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

