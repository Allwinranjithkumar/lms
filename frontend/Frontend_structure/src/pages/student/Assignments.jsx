import { useEffect, useState } from "react";
import { getAssignments, submitAssignment } from "../../services/api";

const statusStyle = {
  pending: "sd-status-pending",
  upcoming: "sd-status-pending",
  active: "sd-status-pending",
  submitted: "sd-status-submitted",
  graded: "sd-status-graded",
  grading: "sd-status-submitted",
  overdue: "sd-status-overdue",
  closed: "sd-status-graded",
};

const summaryConfig = [
  { key: "pending", label: "Pending", bg: "#FEF3C7", color: "#D97706", icon: "fa-solid fa-hourglass-half" },
  { key: "submitted", label: "Submitted", bg: "#DBEAFE", color: "#2563EB", icon: "fa-solid fa-paper-plane" },
  { key: "graded", label: "Graded", bg: "#DCFCE7", color: "#16A34A", icon: "fa-solid fa-circle-check" },
  { key: "overdue", label: "Overdue", bg: "#FEE2E2", color: "#DC2626", icon: "fa-solid fa-triangle-exclamation" },
];

export default function Assignments() {
  const [filter, setFilter] = useState("All");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(null);
  const [toast, setToast] = useState("");
  const [uploadModal, setUploadModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    getAssignments()
      .then((res) => {
        setAssignments(res.data || res || []);
        setError("");
      })
      .catch((err) => setError(err.message || "Could not load assignments."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (id) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    setSubmitting(id);
    setUploadModal(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("submittedAt", new Date().toISOString());
      await submitAssignment(id, formData);
      setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, status: "submitted" } : a));
      setToast("Assignment submitted!");
    } catch (err) {
      setToast(err.message || "Submission failed.");
    } finally {
      setSubmitting(null);
      setSelectedFile(null);
      setTimeout(() => setToast(""), 3000);
    }
  };

  const filters = ["All", "Pending", "Submitted", "Graded", "Overdue"];
  const normalizedAssignments = assignments.map((assignment) => ({
    ...assignment,
    status: normalizeStudentStatus(assignment.status),
  }));
  const filtered = filter === "All"
    ? normalizedAssignments
    : normalizedAssignments.filter((assignment) => assignment.status === filter.toLowerCase());

  const counts = normalizedAssignments.reduce((acc, assignment) => {
    acc[assignment.status] = Number(acc[assignment.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {toast && (
        <div style={{ position: "fixed", top: "80px", right: "24px", background: "var(--g1)", color: "white", padding: "12px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
          {toast}
        </div>
      )}
      <div className="sd-page-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-solid fa-list-check"></i>
          Assignments
        </div>
        <h2>My Assignments</h2>
        <p>Stay on top of your coursework and deadlines.</p>
      </div>

      {error && (
        <div className="sd-section-card" style={{ marginBottom: "16px", borderColor: "#FCA5A5", color: "#991B1B" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
        {summaryConfig.map(({ key, label, bg, color, icon }) => (
          <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
            <div style={{ width: "36px", height: "36px", background: bg, color, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: "16px" }}>
              <i className={icon}></i>
            </div>
            <div style={{ fontFamily: "Outfit", fontSize: "22px", fontWeight: "800", color }}>{loading ? "..." : counts[key] || 0}</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="sd-tab-row" style={{ marginBottom: "16px" }}>
        {filters.map((item) => (
          <button key={item} className={`sd-tab-btn${filter === item ? " active" : ""}`} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>

      {loading && <div className="sd-section-card" style={{ color: "var(--muted)" }}>Loading assignments...</div>}
      {!loading && filtered.length === 0 && <div className="sd-section-card" style={{ color: "var(--muted)" }}>No assignments found.</div>}

      {filtered.map((assignment) => (
        <div key={assignment.id} className="sd-assign-item">
          <div className="sd-assign-top">
            <div>
              <div className="sd-assign-title">{assignment.title}</div>
              <div className="sd-assign-course">{assignment.course || "General"}</div>
            </div>
            <span className={`sd-assign-status ${statusStyle[assignment.status] || statusStyle.pending}`}>{toTitle(assignment.status)}</span>
          </div>
          <div className="sd-assign-meta">
            <span>
              <i className="fa-regular fa-calendar-days"></i>
              Due: <span className="sd-assign-due">{assignment.due || "TBD"}</span>
            </span>
            <span>
              <i className="fa-solid fa-bullseye"></i>
              {assignment.points || 100} pts
            </span>
          </div>
          {(assignment.status === "pending" || assignment.status === "active" || assignment.status === "upcoming" || assignment.status === "submitted") && (
            <button
              disabled={submitting === assignment.id}
              onClick={() => setUploadModal(assignment)}
              style={{ marginTop: "10px", background: submitting === assignment.id ? "var(--muted)" : "var(--g1)", color: "white", border: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: submitting === assignment.id ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {submitting === assignment.id ? "Submitting..." : (assignment.status === "submitted" ? <><i className="fa-solid fa-rotate-right"></i> Resubmit File</> : <><i className="fa-solid fa-paper-plane"></i> Submit Now</>)}
            </button>
          )}
        </div>
      ))}

      {uploadModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", padding: "30px", borderRadius: "16px", maxWidth: "400px", width: "90%", border: "1px solid var(--border)" }}>
            <h2 style={{ marginBottom: "10px" }}>Submit Assignment</h2>
            <p style={{ color: "var(--muted)", marginBottom: "20px", fontSize: "14px" }}>
              Upload your document (PDF, PPT, DOCX) for <strong>{uploadModal.title}</strong>.
            </p>
            <label style={{ display: "block", cursor: "pointer", marginBottom: "25px", border: "2px dashed var(--border)", padding: "30px", textAlign: "center", borderRadius: "10px", background: "var(--surface2)" }}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "32px", color: "var(--g1)", marginBottom: "12px" }}></i>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--dark)" }}>
                {selectedFile ? selectedFile.name : "Click to select a file"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                {selectedFile ? "Click to change file" : "Supports PDF, PPT, DOCX"}
              </div>
              <input 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
                style={{ display: "none" }}
              />
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => handleSubmit(uploadModal.id)} 
                className="sd-btn-primary" 
                style={{ flex: 1 }}
                disabled={!selectedFile}
              >
                Submit File
              </button>
              <button onClick={() => { setUploadModal(null); setSelectedFile(null); }} className="sd-btn-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function normalizeStudentStatus(status) {
  const normalized = String(status || "pending").toLowerCase();
  if (["active", "upcoming"].includes(normalized)) return "pending";
  if (normalized === "grading") return "submitted";
  if (normalized === "closed") return "graded";
  return normalized;
}

function toTitle(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
