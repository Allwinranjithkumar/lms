import { useEffect, useState } from "react";
import { getTeacherDashboard } from "../../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherDashboard()
      .then((dashboard) => {
        setData(dashboard);
        setError("");
      })
      .catch((err) => setError(err.message || "Could not load teacher dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const analytics = data?.analytics?.overview || {};
  const courses = data?.courses || [];
  const assignments = data?.assignments || [];
  const classes = data?.classes || [];

  const kpis = [
    { icon: "fa-solid fa-book-open", color: "#0EA5E9", val: stats.totalCourses ?? 0, label: "Total Courses" },
    { icon: "fa-solid fa-users", color: "#16A34A", val: stats.totalStudents ?? 0, label: "Total Students" },
    { icon: "fa-solid fa-clipboard-check", color: "#F59E0B", val: stats.pendingGrading ?? 0, label: "Pending Grading" },
    { icon: "fa-solid fa-dollar-sign", color: "#8B5CF6", val: analytics.totalRevenue || "$0", label: "Revenue" },
  ];

  return (
    <div className="content">
      <div className="hero" style={{ marginBottom: "24px" }}>
        <div>
          <div className="hero-tag">Teacher Dashboard</div>
          <h2>Welcome Back!</h2>
          <p>Your teaching workspace is ready. Here is what is happening today.</p>
        </div>
      </div>

      {error && (
        <div className="section-card" style={{ marginBottom: "20px", borderColor: "#FCA5A5", color: "#991B1B" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
        {kpis.map(({ icon, color, val, label }) => (
          <div key={label} className="section-card" style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ width: "44px", height: "44px", background: color + "22", color, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "18px" }}>
              <i className={icon}></i>
            </div>
            <div style={{ fontFamily: "Outfit", fontSize: "26px", fontWeight: "800", color: "var(--dark)" }}>
              {loading ? "..." : val}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div className="section-card">
          <div className="sec-title" style={{ marginBottom: "16px" }}>
            <i className="fa-solid fa-book-open"></i> My Courses
          </div>
          {loading && <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading...</div>}
          {!loading && courses.length === 0 && <div style={{ color: "var(--muted)", fontSize: "13px" }}>No courses yet. Create your first course.</div>}
          {courses.slice(0, 5).map((course) => (
            <div key={course.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--dark)" }}>{course.title || course.name}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>{course.students || 0} students / {course.status}</div>
              </div>
              <span style={{ fontSize: "11px", background: "var(--g-light)", color: "var(--g2)", padding: "3px 10px", borderRadius: "100px", fontWeight: "600" }}>{course.category}</span>
            </div>
          ))}
        </div>

        <div className="section-card">
          <div className="sec-title" style={{ marginBottom: "16px" }}>
            <i className="fa-solid fa-list-check"></i> Assignments
          </div>
          {loading && <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading...</div>}
          {!loading && assignments.length === 0 && <div style={{ color: "var(--muted)", fontSize: "13px" }}>No assignments yet.</div>}
          {assignments.slice(0, 5).map((assignment) => (
            <div key={assignment.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--dark)" }}>{assignment.title}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>Due: {assignment.due || assignment.dueDate || "TBD"}</div>
              </div>
              <span style={{ fontSize: "11px", background: assignment.status === "active" ? "#D1FAE5" : "#FEF3C7", color: assignment.status === "active" ? "#065F46" : "#92400E", padding: "3px 10px", borderRadius: "100px", fontWeight: "600" }}>{assignment.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="sec-title" style={{ marginBottom: "16px" }}>
          <i className="fa-solid fa-video"></i> Live Classes
        </div>
        {loading && <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading...</div>}
        {!loading && classes.length === 0 && <div style={{ color: "var(--muted)", fontSize: "13px" }}>No live classes scheduled.</div>}
        {classes.slice(0, 4).map((liveClass) => (
          <div key={liveClass.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--dark)" }}>{liveClass.title}</div>
              <div style={{ fontSize: "11px", color: "var(--muted)" }}>{liveClass.course} / {liveClass.date} / {liveClass.time}</div>
            </div>
            <span style={{ fontSize: "11px", background: "#DBEAFE", color: "#1E40AF", padding: "3px 10px", borderRadius: "100px", fontWeight: "600" }}>{liveClass.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
