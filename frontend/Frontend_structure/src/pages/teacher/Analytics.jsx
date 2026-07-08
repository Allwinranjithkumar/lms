import { useState, useEffect } from "react";
import { getTeacherAnalytics } from "../../services/api";

const weeklyDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Analytics() {
  const [revenueTab, setRevenueTab] = useState("Monthly");
  const [enrollTab, setEnrollTab] = useState("Weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherAnalytics()
      .then(res => setData(res.data || res || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="content"><p style={{textAlign:"center", padding:"40px", color:"var(--muted)"}}>Loading analytics...</p></div>;

  const maxRevenue = Math.max(...(data.monthlyRevenue || [0]), 1);
  const maxEnroll = Math.max(...(data.weeklyEnrollments || [0]), 1);
  const maxCompletion = Math.max(...(data.completionByDay || []).map((d) => d.completions || 0), 1);

  return (
    <div className="content">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "22px", fontWeight: "800", color: "var(--dark)", marginBottom: "4px" }}>
          Analytics
        </h2>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>
          Track your performance and student engagement
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Revenue", val: data.overview?.totalRevenue || "$0", trend: "+24%", icon: "fa-solid fa-dollar-sign", color: "#D1FAE5" },
          { label: "Total Students", val: data.overview?.totalStudents || "0", trend: "+18%", icon: "fa-solid fa-user-graduate", color: "#DBEAFE" },
          { label: "Avg Completion", val: data.overview?.avgCompletion || "0%", trend: "+6%", icon: "fa-solid fa-circle-check", color: "#FEF3C7" },
          { label: "Avg Rating", val: data.overview?.avgRating || "0.0", trend: "+0.2", icon: "fa-solid fa-trophy", color: "#FCE7F3" },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon" style={{ background: k.color }}><i className={k.icon}></i></div>
              <span className="kpi-trend trend-up">↑ {k.trend}</span>
            </div>
            <div className="kpi-val" style={{ fontSize: "24px" }}>{k.val}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Revenue Chart */}
        <div className="section-card">
          <div className="sec-header">
            <div className="sec-title"><i className="fa-solid fa-dollar-sign"></i> Revenue</div>
            <div className="tab-row" style={{ margin: 0 }}>
              {["Monthly", "Weekly"].map((t) => (
                <button key={t} className={`tab-btn ${revenueTab === t ? "active" : ""}`} onClick={() => setRevenueTab(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            {(data.monthlyRevenue || []).map((val, i) => (
              <div
                key={i}
                className="bar"
                style={{
                  height: `${(val / maxRevenue) * 100}%`,
                  background: `linear-gradient(180deg, var(--g1), var(--g2))`,
                  opacity: i === 11 ? 1 : 0.55 + (i / 12) * 0.45,
                }}
                title={`${months[i]}: $${val}`}
              >
                <span className="bar-label">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollments */}
        <div className="section-card">
          <div className="sec-header">
            <div className="sec-title"><i className="fa-solid fa-user-graduate"></i> Enrollments</div>
            <div className="tab-row" style={{ margin: 0 }}>
              {["Weekly", "Monthly"].map((t) => (
                <button key={t} className={`tab-btn ${enrollTab === t ? "active" : ""}`} onClick={() => setEnrollTab(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            {(data.weeklyEnrollments || []).map((val, i) => (
              <div
                key={i}
                className="bar"
                style={{
                  height: `${(val / maxEnroll) * 100}%`,
                  background: `linear-gradient(180deg, #7C3AED, #A855F7)`,
                  opacity: 0.6 + (i / 7) * 0.4,
                }}
                title={`${weeklyDays[i]}: ${val} students`}
              >
                <span className="bar-label">{weeklyDays[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Top Courses Table */}
        <div className="section-card">
          <div className="sec-header">
            <div className="sec-title"><i className="fa-solid fa-book-open"></i> Top Courses</div>
          </div>
          {(data.topCourses || []).map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 0", borderBottom: i < (data.topCourses || []).length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: c.color || "#00C853", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "white", fontWeight: "700",
                  fontSize: "14px", flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--dark)" }}>{c.title || c.name}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                  {c.students || 0} students · <i className="fa-solid fa-star"></i> {c.rating || 0}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--g3)" }}>{c.revenue || "$0"}</div>
                <div style={{ fontSize: "11px", color: "#00C853", fontWeight: "600" }}>{c.growth || "+0%"}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Completions */}
        <div className="section-card">
          <div className="sec-header">
            <div className="sec-title"><i className="fa-solid fa-circle-check"></i> Daily Completions</div>
            <span className="sec-badge">This Week</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(data.completionByDay || []).map((d) => (
              <div key={d.day} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)", width: "30px", fontWeight: "600" }}>{d.day}</span>
                <div style={{ flex: 1, height: "10px", background: "var(--surface2)", borderRadius: "5px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(d.completions / maxCompletion) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg,var(--g1),var(--g2))",
                      borderRadius: "5px",
                    }}
                  />
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--g3)", width: "28px", textAlign: "right" }}>
                  {d.completions}
                </span>
              </div>
            ))}
          </div>

          {/* Engagement Score */}
          <div
            style={{
              marginTop: "20px", background: "linear-gradient(135deg,var(--g3),#0a6640)",
              borderRadius: "14px", padding: "16px 20px", display: "flex",
              alignItems: "center", gap: "16px",
            }}
          >
            <div style={{ fontSize: "30px", color: "white" }}><i className="fa-solid fa-fire"></i></div>
            <div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,.7)", marginBottom: "2px" }}>
                Engagement Score
              </div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "28px", fontWeight: "800", color: "white" }}>
                87<span style={{ fontSize: "14px", opacity: .7 }}>/100</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: "12px", color: "rgba(255,255,255,.7)", textAlign: "right" }}>
              ↑ +4 pts<br />this week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
