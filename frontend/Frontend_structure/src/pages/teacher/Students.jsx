import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherStudents } from "../../services/api";

const statusConfig = {
  active: { label: "Active", bg: "#D1FAE5", color: "#065F46" },
  "at-risk": { label: "At Risk", bg: "#FEE2E2", color: "#991B1B" },
  completed: { label: "Completed", bg: "#DBEAFE", color: "#1E40AF" },
};

export default function Students() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherStudents()
      .then((res) => {
        setStudents(res.data || res || []);
        setError("");
      })
      .catch((err) => setError(err.message || "Could not load students."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch =
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.course || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || s.status === statusFilter.toLowerCase().replace(" ", "-");
    return matchSearch && matchStatus;
  });

  const atRisk = students.filter((s) => s.status === "at-risk").length;
  const completed = students.filter((s) => s.status === "completed").length;
  const avgProgress = students.length ? Math.round(students.reduce((a, s) => a + (s.progress || 0), 0) / students.length) : 0;

  return (
    <div className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "22px", fontWeight: "800", color: "var(--dark)", marginBottom: "4px" }}>
            Students
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            {students.length} enrolled students across all courses
          </p>
        </div>
        <button onClick={() => navigate('/teacher/messages')} className="sd-btn-primary"><i className="fa-regular fa-paper-plane"></i> Message All</button>
      </div>

      {error && (
        <div className="section-card" style={{ marginBottom: "20px", borderColor: "#FCA5A5", color: "#991B1B" }}>
          {error}
        </div>
      )}

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Students", val: students.length, icon: "fa-solid fa-user-graduate", color: "#D1FAE5" },
          { label: "At Risk", val: atRisk, icon: "fa-solid fa-triangle-exclamation", color: "#FEE2E2" },
          { label: "Completed", val: completed, icon: "fa-solid fa-trophy", color: "#DBEAFE" },
          { label: "Avg Progress", val: `${avgProgress}%`, icon: "fa-solid fa-chart-line", color: "#FEF3C7" },
        ].map((k) => (
          <div key={k.label} className="section-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: k.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "var(--dark)" }}>
                <i className={k.icon}></i>
              </div>
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "24px", fontWeight: "800", color: "var(--dark)" }}>{k.val}</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: "20px", alignItems: "start" }}>
        <div className="section-card" style={{ padding: 0, overflowX: "auto" }}>
          {/* Toolbar */}
          <div style={{ padding: "16px 20px", display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", alignItems: "center", flexWrap: "wrap" }}>
            <div className="sd-search-bar" style={{ flex: 1, minWidth: "180px" }}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {["All", "Active", "At Risk", "Completed"].map((f) => (
              <button
                key={f}
                className={`sd-tab-btn ${statusFilter === f ? "active" : ""}`}
                onClick={() => setStatusFilter(f)}
                style={{ padding: "6px 12px" }}
              >
                {f}
              </button>
            ))}
          </div>

          {loading && <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>Loading students...</div>}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
                  <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Student</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Course</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Progress</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Grade</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Last Active</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const sc = statusConfig[s.status || "active"] || statusConfig.active;
                  const initials = s.initials || s.name?.slice(0,2).toUpperCase() || "ST";
                  const color = s.color || "#E0E7FF";
                  return (
                    <tr
                      key={s.id}
                      style={{ cursor: "pointer", background: selected?.id === s.id ? "var(--g-light)" : "", borderBottom: "1px solid var(--border)" }}
                      onClick={() => setSelected(selected?.id === s.id ? null : s)}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: color, color: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>{initials}</div>
                          <div>
                            <div style={{ fontWeight: "600", fontSize: "13px" }}>{s.name}</div>
                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>Joined {s.joined || "Recently"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--muted)", maxWidth: "160px", padding: "12px 16px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.course}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div className="sd-prog-bar" style={{ width: "70px", marginBottom: 0 }}>
                            <div className="sd-prog-fill" style={{ width: `${s.progress || 0}%` }} />
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--muted)" }}>{s.progress || 0}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}><span style={{ padding: "4px 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>{s.grade || "N/A"}</span></td>
                      <td style={{ fontSize: "12px", color: "var(--muted)", padding: "12px 16px" }}>{s.lastActive || "Recently"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: "600" }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          className="sd-btn-outline"
                          style={{ padding: "5px 12px", fontSize: "11px", border: "1px solid var(--border)", borderRadius: "8px" }}
                          onClick={(e) => { e.stopPropagation(); setSelected(s); }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}><i className="fa-solid fa-magnifying-glass"></i></div>
              <div style={{ fontWeight: "600" }}>No students found</div>
            </div>
          )}
        </div>

        {/* Student Detail Panel */}
        {selected && (
          <div className="section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div className="sec-title">Student Detail</div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--muted)" }}
              >
                ×
              </button>
            </div>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "64px", height: "64px", borderRadius: "16px",
                  background: selected.color || "#E0E7FF", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "22px", fontWeight: "700",
                  color: "var(--dark)", margin: "0 auto 10px",
                }}
              >
                {selected.initials || selected.name?.slice(0,2).toUpperCase() || "ST"}
              </div>
              <div style={{ fontWeight: "700", fontSize: "16px", color: "var(--dark)" }}>{selected.name}</div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>Joined {selected.joined || "Recently"}</div>
            </div>

            {[
              { label: "Course", val: selected.course },
              { label: "Progress", val: `${selected.progress || 0}%` },
              { label: "Grade", val: selected.grade || "N/A" },
              { label: "Score", val: `${selected.score || 0}/100` },
              { label: "Last Active", val: selected.lastActive || "Recently" },
              { label: "Status", val: (statusConfig[selected.status || "active"] || statusConfig.active).label },
            ].map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: "13px" }}
              >
                <span style={{ color: "var(--muted)" }}>{item.label}</span>
                <span style={{ fontWeight: "600", color: "var(--dark)", textAlign: "right", maxWidth: "60%" }}>{item.val}</span>
              </div>
            ))}

            <div style={{ marginTop: "16px", marginBottom: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px" }}>Progress</div>
              <div className="sd-prog-bar" style={{ height: "8px" }}>
                <div className="sd-prog-fill" style={{ width: `${selected.progress || 0}%` }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={() => navigate('/teacher/messages')} className="sd-btn-primary" style={{ flex: 1, fontSize: "12px" }}><i className="fa-regular fa-message"></i> Message</button>
              <button onClick={() => alert(`Viewing profile for ${selected.name}...`)}
                style={{
                  flex: 1, background: "var(--surface2)", border: "1px solid var(--border)",
                  color: "var(--foreground)", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px"
                }}>
                <i className="fa-regular fa-user"></i> Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

