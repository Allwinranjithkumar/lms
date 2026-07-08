import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherDashboard, deleteCourse } from "../../services/api";

const statusColors = {
  active: { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  published: { bg: "#DBEAFE", color: "#1E40AF", label: "Published" },
  draft: { bg: "#FEF3C7", color: "#92400E", label: "Draft" },
};

const filters = ["All", "Active", "Published", "Draft"];

export default function MyCourses() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    getTeacherDashboard()
      .then((d) => setCourses(d.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setDeleting(id);
    try {
      await deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete course: " + (err.message || "Unknown error"));
    } finally {
      setDeleting(null);
    }
  };

  const filtered = courses.filter((c) => {
    const matchFilter =
      filter === "All" || (c.status || "draft").toLowerCase() === filter.toLowerCase();
    const matchSearch = (c.name || c.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalStudents = courses.reduce((a, b) => a + (b.students || 0), 0);
  const totalRevenue = "$0";

  return (
    <div className="content">
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "22px",
              fontWeight: "800",
              color: "var(--dark)",
              marginBottom: "4px",
            }}
          >
            My Courses
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Manage and track all your courses
          </p>
        </div>
        <button
          className="sd-btn-primary"
          onClick={() => (window.location.href = "/teacher/create-course")}
        >
          <i className="fa-solid fa-plus"></i> New Course
        </button>
      </div>

      {/* Summary KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total Courses", val: courses.length, icon: "fa-solid fa-book-open", color: "#D1FAE5" },
          { label: "Total Students", val: totalStudents, icon: "fa-solid fa-user-graduate", color: "#DBEAFE" },
          { label: "Total Revenue", val: totalRevenue, icon: "fa-solid fa-dollar-sign", color: "#FEF3C7" },
          {
            label: "Avg. Rating",
            val: "4.8",
            icon: "fa-solid fa-trophy",
            color: "#FCE7F3",
          },
        ].map((k) => (
          <div key={k.label} className="section-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div
                style={{ width: "36px", height: "36px", borderRadius: "10px", background: k.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "var(--dark)" }}
              >
                <i className={k.icon}></i>
              </div>
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "24px", fontWeight: "800", color: "var(--dark)" }}>
              {k.val}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search + View Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {filters.map((f) => (
            <button
              key={f}
              className={`sd-tab-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="sd-search-bar" style={{ minWidth: "200px" }}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            style={{ background: "var(--surface)", border: "1px solid var(--border)", width: "38px", height: "38px", borderRadius: "10px", cursor: "pointer" }}
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            title="Toggle view"
          >
            <i className={`fa-solid ${view === "grid" ? "fa-list" : "fa-border-all"}`}></i>
          </button>
        </div>
      </div>

      {loading && <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>Loading courses...</div>}

      {/* Course Grid */}
      {!loading && view === "grid" && filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "18px",
          }}
        >
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onDelete={() => handleDelete(course.id)} deleting={deleting === course.id} />
          ))}
        </div>
      )}
      
      {!loading && view === "list" && filtered.length > 0 && (
        <div className="section-card" style={{ padding: "0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Course</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Students</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Progress</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const s = statusColors[c.status || "draft"] || statusColors.draft;
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: c.bg || "#E0E7FF",
                            color: "var(--dark)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                          }}
                        >
                          <i className={c.icon || "fa-solid fa-book-open-reader"}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "13px" }}>{c.name || c.title}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{c.category || "Uncategorized"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{c.students || 0}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="sd-prog-bar" style={{ width: "80px", marginBottom: 0 }}>
                          <div className="sd-prog-fill" style={{ width: `${c.progress || 0}%` }} />
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>{c.progress || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: "600" }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => navigate('/teacher/create-course', { state: { editCourse: c } })} className="sd-btn-primary" style={{ padding: "5px 10px", fontSize: "11px" }}>Edit</button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          style={{
                            background: "var(--surface2)",
                            border: "1px solid var(--border)",
                            color: "var(--danger, #DC2626)",
                            borderRadius: "8px",
                            padding: "5px 10px",
                            fontSize: "11px",
                            cursor: deleting === c.id ? "not-allowed" : "pointer",
                            opacity: deleting === c.id ? 0.6 : 1
                          }}
                        >
                          {deleting === c.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--muted)",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "12px" }}><i className="fa-regular fa-folder-open"></i></div>
          <div style={{ fontSize: "16px", fontWeight: "600" }}>No courses found</div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            Try a different filter or search term
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, onDelete, deleting }) {
  const s = statusColors[course.status || "draft"] || statusColors.draft;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ background: course.bg || "#E0E7FF", height: "110px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ fontSize: "36px", color: "var(--dark)" }}><i className={course.icon || "fa-solid fa-book-open"}></i></span>
        <span
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: s.bg,
            color: s.color,
            padding: "3px 10px",
            borderRadius: "100px",
            fontSize: "11px",
            fontWeight: "600"
          }}
        >
          {s.label}
        </span>
      </div>
      <div style={{ padding: "16px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: "600",
            color: "var(--g2)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: "4px",
          }}
        >
          {course.category || "Uncategorized"}
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "16px", fontWeight: "700", color: "var(--dark)", marginBottom: "10px" }}>{course.name || course.title}</div>
        <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--muted)", marginBottom: "14px" }}>
          <span><i className="fa-solid fa-user-graduate"></i> {course.students || 0}</span>
          <span><i className="fa-solid fa-book-open"></i> {course.lessons || 0}</span>
          <span><i className="fa-solid fa-star"></i> {course.rating || "4.5"}</span>
        </div>
        <div className="sd-prog-bar" style={{ marginBottom: "8px" }}>
          <div className="sd-prog-fill" style={{ width: `${course.progress || 0}%` }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            Updated {course.lastUpdated || "Recently"}
          </span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--g3)" }}>
            {course.revenue || "$0"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <button onClick={() => navigate('/teacher/create-course', { state: { editCourse: course } })} className="sd-btn-primary" style={{ flex: 1, padding: "8px" }}>
            <i className="fa-solid fa-pen"></i> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{
              flex: 1,
              background: "var(--surface2)",
              border: "1px solid var(--danger, #DC2626)",
              color: "var(--danger, #DC2626)",
              borderRadius: "10px",
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              opacity: deleting ? 0.6 : 1
            }}
          >
            <i className="fa-solid fa-trash"></i> {deleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}


