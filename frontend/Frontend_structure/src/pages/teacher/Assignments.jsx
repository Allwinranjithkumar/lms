import { useEffect, useState } from "react";
import { createAssignment, getAssignments, getTeacherCourses, getAssignmentSubmissions, gradeSubmission } from "../../services/api";

const statusConfig = {
  active: { label: "Active", bg: "#D1FAE5", color: "#065F46" },
  grading: { label: "Grading", bg: "#FEF3C7", color: "#92400E" },
  closed: { label: "Closed", bg: "#F1F5F9", color: "#64748B" },
  upcoming: { label: "Upcoming", bg: "#DBEAFE", color: "#1E40AF" },
};

export default function Assignments() {
  const [tab, setTab] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [gradingAssignment, setGradingAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [gradeInput, setGradeInput] = useState({});
  const [form, setForm] = useState({
    title: "",
    courseId: "",
    due: "",
    points: "100",
    status: "active",
  });

  const loadAssignments = () => {
    setLoading(true);
    Promise.all([getAssignments(), getTeacherCourses()])
      .then(([assignmentRes, courseRes]) => {
        const assignmentRows = assignmentRes.data || assignmentRes || [];
        const courseRows = courseRes.data || courseRes || [];
        setAssignments(assignmentRows);
        setCourses(courseRows);
        setForm((current) => ({ ...current, courseId: current.courseId || courseRows[0]?.id || "" }));
        setError("");
      })
      .catch((err) => setError(err.message || "Could not load assignments."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const filtered = tab === "All"
    ? assignments
    : assignments.filter((assignment) => (assignment.status || "active").toLowerCase() === tab.toLowerCase());

  const totalSubmissions = assignments.reduce((sum, assignment) => sum + Number(assignment.submitted || 0), 0);
  const totalPending = assignments.reduce((sum, assignment) => sum + Math.max(0, Number(assignment.submitted || 0) - Number(assignment.graded || 0)), 0);
  const totalExpected = assignments.reduce((sum, assignment) => sum + Number(assignment.total || 0), 0);
  const avgCompletion = totalExpected ? Math.round((totalSubmissions / totalExpected) * 100) : 0;
  const pendingGrades = assignments
    .filter((assignment) => Number(assignment.submitted || 0) > Number(assignment.graded || 0))
    .slice(0, 5);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      setError("Assignment title is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createAssignment({
        ...form,
        points: Number(form.points || 100),
      });
      setForm((current) => ({ ...current, title: "", due: "", points: "100" }));
      setShowCreate(false);
      loadAssignments();
    } catch (err) {
      setError(err.message || "Could not create assignment.");
    } finally {
      setSaving(false);
    }
  };

  const openGrading = async (assignment) => {
    setGradingAssignment(assignment);
    try {
      const res = await getAssignmentSubmissions(assignment.id);
      setSubmissions(res.data || res || []);
    } catch (err) {
      alert("Failed to load submissions.");
    }
  };

  const handleGradeSubmit = async (subId) => {
    const grade = gradeInput[subId];
    if (!grade) {
      alert("Please enter a grade.");
      return;
    }
    try {
      await gradeSubmission(subId, { score: grade });
      setSubmissions((prev) => prev.map(s => s.id === subId ? { ...s, status: "graded", score: grade } : s));
      setGradeInput(prev => ({ ...prev, [subId]: "" }));
      loadAssignments();
    } catch (err) {
      alert("Failed to save grade.");
    }
  };

  return (
    <div className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "22px", fontWeight: "800", color: "var(--dark)", marginBottom: "4px" }}>
            Assignments
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Create, manage and grade student submissions
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate((value) => !value)}>
          <i className="fa-solid fa-plus"></i> New Assignment
        </button>
      </div>

      {error && (
        <div className="section-card" style={{ marginBottom: "20px", borderColor: "#FCA5A5", color: "#991B1B" }}>
          {error}
        </div>
      )}

      {showCreate && (
        <div className="section-card" style={{ marginBottom: "24px", borderColor: "var(--g-mid)" }}>
          <div className="sec-title" style={{ marginBottom: "16px" }}><i className="fa-solid fa-pen-to-square"></i> Quick Create Assignment</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px 140px auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Assignment Title</label>
              <input style={inputStyle} value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="e.g. Final Project Submission" />
            </div>
            <div>
              <label style={labelStyle}>Course</label>
              <select style={inputStyle} value={form.courseId} onChange={(event) => updateField("courseId", event.target.value)}>
                <option value="">General</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title || course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" style={inputStyle} value={form.due} onChange={(event) => updateField("due", event.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Points</label>
              <input type="number" min="0" style={inputStyle} value={form.points} onChange={(event) => updateField("points", event.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Assignments", val: assignments.length, icon: "fa-solid fa-clipboard-list", color: "#D1FAE5" },
          { label: "Total Submissions", val: totalSubmissions, icon: "fa-solid fa-paper-plane", color: "#DBEAFE" },
          { label: "Pending Grading", val: totalPending, icon: "fa-solid fa-hourglass-half", color: "#FEF3C7" },
          { label: "Avg Completion", val: `${avgCompletion}%`, icon: "fa-solid fa-circle-check", color: "#D1FAE5" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon" style={{ background: kpi.color }}><i className={kpi.icon}></i></div>
            </div>
            <div className="kpi-val" style={{ fontSize: "24px" }}>{loading ? "..." : kpi.val}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {["All", "Active", "Grading", "Upcoming", "Closed"].map((item) => (
              <button key={item} className={`tab-btn ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>
                {item}
              </button>
            ))}
          </div>

          {loading && <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>Loading assignments...</div>}
          {!loading && filtered.length === 0 && <div className="section-card" style={{ color: "var(--muted)" }}>No assignments found.</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {!loading && filtered.map((assignment) => {
              const config = statusConfig[(assignment.status || "active").toLowerCase()] || statusConfig.active;
              const submitted = Number(assignment.submitted || 0);
              const graded = Number(assignment.graded || 0);
              const total = Math.max(Number(assignment.total || 0), submitted);
              const submissionRate = total ? Math.round((submitted / total) * 100) : 0;
              const gradingRate = submitted ? Math.round((graded / submitted) * 100) : 0;

              return (
                <div key={assignment.id} className="section-card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--dark)", marginBottom: "4px" }}>{assignment.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        <i className="fa-solid fa-book-open"></i> {assignment.course || "General"} / <i className="fa-regular fa-calendar-days"></i> Due {assignment.due || "TBD"} / <i className="fa-solid fa-bullseye"></i> {assignment.points || 100} pts
                      </div>
                    </div>
                    <span className="status-pill" style={{ background: config.bg, color: config.color, flexShrink: 0 }}>
                      {config.label}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <Progress label={`Submissions (${submitted}/${total})`} value={submissionRate} />
                    <Progress label={`Graded (${graded}/${submitted})`} value={gradingRate} color="linear-gradient(90deg,#F59E0B,#D97706)" />
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => openGrading(assignment)} className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                      <i className="fa-solid fa-check-to-slot"></i> View Submissions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="section-card">
          <div className="sec-header">
            <div className="sec-title">
              <i className="fa-solid fa-hourglass-half"></i> Pending Grades
              <span className="sec-badge">{totalPending}</span>
            </div>
          </div>
          {pendingGrades.length === 0 && <div style={{ color: "var(--muted)", fontSize: "13px" }}>No pending grading.</div>}
          {pendingGrades.map((assignment) => (
            <div key={assignment.id} className="msg-item">
              <div style={{ flex: 1 }}>
                <div className="msg-name">{assignment.title}</div>
                <div className="msg-preview" style={{ maxWidth: "none" }}>{assignment.course || "General"}</div>
                <div className="notif-time">{Number(assignment.submitted || 0) - Number(assignment.graded || 0)} pending</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {gradingAssignment && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", padding: "30px", borderRadius: "16px", maxWidth: "600px", width: "90%", border: "1px solid var(--border)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Submissions: {gradingAssignment.title}</h2>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Max Points: {gradingAssignment.points || 100}</div>
              </div>
              <button onClick={() => setGradingAssignment(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--muted)" }}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "10px" }}>
              {submissions.length === 0 && <div style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>No submissions yet.</div>}
              {submissions.map(sub => (
                <div key={sub.id} style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", background: "var(--surface2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontWeight: "600", color: "var(--dark)" }}>{sub.studentName}</div>
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>Submitted: {new Date(sub.submittedAt).toLocaleString()}</div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "600", padding: "4px 8px", borderRadius: "6px", background: sub.status === "graded" ? "#DCFCE7" : "#FEF3C7", color: sub.status === "graded" ? "#16A34A" : "#D97706" }}>
                      {sub.status === "graded" ? "Graded" : "Pending"}
                    </span>
                  </div>
                  
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                      <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                        <button onClick={() => setPreviewUrl(`http://localhost:8000${sub.fileUrl}`)} style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "1px solid var(--border)", color: "var(--dark)", borderRadius: "6px", cursor: sub.fileUrl ? "pointer" : "default", opacity: sub.fileUrl ? 1 : 0.5 }} disabled={!sub.fileUrl}>
                          <i className="fa-regular fa-eye"></i> View
                        </button>
                        <a href={`http://localhost:8000${sub.fileUrl}`} download style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", background: "transparent", border: "1px solid var(--border)", color: "var(--dark)", borderRadius: "6px", pointerEvents: sub.fileUrl ? "auto" : "none", opacity: sub.fileUrl ? 1 : 0.5 }}>
                          <i className="fa-solid fa-download"></i> {sub.fileName || "Download"}
                        </a>
                      </div>
                    
                    {sub.status === "graded" ? (
                      <div style={{ fontWeight: "700", color: "var(--primary)", flexShrink: 0 }}>Score: {sub.score}</div>
                    ) : (
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        <input 
                          type="number" 
                          max={gradingAssignment.points || 100} 
                          placeholder="Pts"
                          value={gradeInput[sub.id] || ""}
                          onChange={(e) => setGradeInput({ ...gradeInput, [sub.id]: e.target.value })}
                          style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "12px", textAlign: "center" }}
                        />
                        <button onClick={() => handleGradeSubmit(sub.id)} className="btn-primary" style={{ padding: "6px 12px", fontSize: "11px" }}>Save</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1100, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", display: "flex", justifyContent: "flex-end", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <button onClick={() => setPreviewUrl("")} className="btn-outline">Close Preview</button>
          </div>
          <iframe src={previewUrl} style={{ width: "100%", flex: 1, border: "none", background: "white" }} title="Document Preview" />
        </div>
      )}
    </div>
  );
}

function Progress({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>{label}</div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${value}%`, ...(color ? { background: color } : {}) }} />
      </div>
      <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>{value}%</div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--muted)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: ".04em",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "13px",
  fontFamily: "'DM Sans',sans-serif",
  color: "var(--dark)",
  background: "var(--surface2)",
  outline: "none",
};
