import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";

const gradeColor = {
  A: "#16A34A",
  B: "#0EA5E9",
  C: "#F59E0B",
  D: "#DC2626",
  F: "#DC2626",
};

export default function MyCourses() {
  const [filter, setFilter] = useState("All");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const filters = ["All", "Active", "Completed"];

  useEffect(() => {
    apiRequest("/student/courses")
      .then((d) => setCourses(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (filter === "All") return true;
    if (filter === "Active") return (c.progress || 0) < 100;
    if (filter === "Completed") return (c.progress || 0) === 100;
    return true;
  });

  return (
    <>
      <div className="sd-page-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-solid fa-book-open-reader"></i>
          Learning
        </div>
        <h2>My Courses</h2>
        <p>Track your enrolled courses and continue learning.</p>
        <div className="sd-page-hero-actions">
          <Link className="sd-btn-primary sd-link-btn" to="/student/courses/browse">
            Browse More Courses
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "8px" }}>
        {filters.map((f) => (
          <button
            key={f}
            className={`sd-tab-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading courses...</div>}
      {!loading && filteredCourses.length === 0 && <div style={{ color: "var(--muted)", fontSize: "13px" }}>No courses found in this category.</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "16px" }}>
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              transition: "all .2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                height: "100px",
                background: c.bg || c.accent || "#064E3B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                color: "#FFFFFF",
              }}
            >
              <i className={c.icon || "fa-solid fa-book-open-reader"}></i>
            </div>
            <div style={{ padding: "18px" }}>
              <div style={{ fontFamily: "Outfit", fontSize: "16px", fontWeight: "700", marginBottom: "6px" }}>
                {c.name || c.title}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>{c.teacher || c.instructor}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginBottom: "8px",
                }}
              >
                <span>{c.lessons || 0} lessons</span>
                <span style={{ color: gradeColor[c.grade || "A"] || "var(--g3)", fontWeight: "700" }}>Grade: {c.grade || "N/A"}</span>
              </div>
              <div className="sd-prog-bar">
                <div className="sd-prog-fill" style={{ width: `${c.progress || 0}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>{c.progress || 0}% complete</span>
                <button onClick={() => alert(`Resuming ${c.title}...`)}
                  style={{
                    background: "var(--g-light)",
                    color: "var(--g3)",
                    border: "none",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

