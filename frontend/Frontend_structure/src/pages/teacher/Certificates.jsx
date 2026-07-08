import { useState, useEffect } from "react";
import { getCertificates, issueCertificate } from "../../services/api";
import {
  teacherCertificateStats,
  teacherCertificateTemplates,
} from "../../data/certificateData";

const statusClass = {
  Ready: "ready",
  Issued: "issued",
  Earned: "issued",
  Review: "review",
  "In Progress": "review",
};

export default function Certificates() {
  const [selectedTemplate, setSelectedTemplate] = useState(teacherCertificateTemplates[0].id);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ student: "", course: "" });

  const fetchCertificates = () => {
    setLoading(true);
    getCertificates()
      .then(res => setCertificates(res.data || res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleIssue = async (certId) => {
    try {
      await issueCertificate({ certificateId: certId });
      alert("Certificate issued successfully.");
      fetchCertificates();
    } catch (e) {
      alert("Error issuing certificate.");
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.student || !issueForm.course) {
      alert("Please enter student name and course.");
      return;
    }
    // Mock the backend API call for issuing a certificate
    alert(`Successfully issued certificate to ${issueForm.student} for ${issueForm.course}!`);
    setShowIssueModal(false);
    setIssueForm({ student: "", course: "" });
  };

  return (
    <div className="teacher-cert-page">
      <div className="teacher-cert-header">
        <div>
          <span className="teacher-cert-eyebrow">
            <i className="fa-solid fa-certificate"></i>
            Certificate Center
          </span>
          <h2>Certificates</h2>
          <p>Create, preview, and issue course completion certificates for students.</p>
        </div>
        <div className="teacher-cert-header-actions">
          <button onClick={() => setShowIssueModal(true)} className="btn-primary" type="button">
            <i className="fa-solid fa-paper-plane"></i>
            Issue Certificates
          </button>
          <button onClick={() => alert('Downloading all generated certificates...')} className="teacher-cert-soft-btn" type="button">
            <i className="fa-solid fa-file-arrow-down"></i>
            Export PDF
          </button>
        </div>
      </div>

      <div className="teacher-cert-stats" aria-label="Certificate summary">
        {teacherCertificateStats.map(({ label, value, icon, color }) => (
          <div className="teacher-cert-stat" key={label}>
            <span style={{ background: color }}>
              <i className={icon}></i>
            </span>
            <div>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="teacher-cert-section">
        <div className="teacher-cert-section-head">
          <div>
            <h3>Certificate Templates</h3>
            <p>Use these real certificate previews when approving course completions.</p>
          </div>
          <button onClick={() => alert('Feature coming soon!')} className="teacher-cert-soft-btn" type="button">
            <i className="fa-solid fa-plus"></i>
            New Template
          </button>
        </div>

        <div className="teacher-cert-template-grid">
          {teacherCertificateTemplates.map((template) => (
            <article
              className={`teacher-cert-template${
                selectedTemplate === template.id ? " selected" : ""
              }`}
              key={template.id}
            >
              <button
                className="teacher-cert-preview"
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
              >
                <img src={template.image} alt={`${template.name} certificate template`} />
              </button>
              <div className="teacher-cert-template-body">
                <span style={{ color: template.accent }}>{template.course}</span>
                <h4>{template.name}</h4>
                <div className="teacher-cert-template-meta">
                  <p>
                    <strong>{template.issued}</strong>
                    Issued
                  </p>
                  <p>
                    <strong>{template.ready}</strong>
                    Ready
                  </p>
                </div>
                <div className="teacher-cert-preview-actions">
                  <button onClick={() => alert('Opening template customizer...')} className="teacher-cert-soft-btn" type="button">
                    <i className="fa-solid fa-pen"></i> Customize
                  </button>
                  <button onClick={() => alert('Feature coming soon!')} className="join-btn" type="button">
                    <i className="fa-solid fa-stamp"></i>
                    Issue
                  </button>
                  <button onClick={() => alert('Feature coming soon!')} className="teacher-cert-ghost-btn" type="button">
                    <i className="fa-regular fa-pen-to-square"></i>
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="teacher-cert-section teacher-cert-queue">
        <div className="teacher-cert-section-head">
          <div>
            <h3>Student Certificate Queue</h3>
            <p>Review learners who are ready for certificates or already issued.</p>
          </div>
          <button onClick={() => alert('Loading more past records...')} className="teacher-cert-soft-btn" type="button" style={{ width: "100%", justifyContent: "center" }}>
            Load More History
          </button>
        </div>

        <div className="teacher-cert-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Score</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && certificates.length === 0 && (
                <tr><td colSpan="6" style={{textAlign:"center", padding:"20px", color:"var(--muted)"}}>No certificates found.</td></tr>
              )}
              {certificates.map((item) => (
                <tr key={item.id}>
                  <td>{item.studentName || item.student || "Unknown Student"}</td>
                  <td>{item.courseName || item.course || "General"}</td>
                  <td>{item.score || 100}</td>
                  <td>{formatCertificateDate(item)}</td>
                  <td>
                    <span className={`teacher-cert-status ${statusClass[item.status || "Ready"]}`}>
                      {item.status || "Ready"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="teacher-cert-row-btn"
                      type="button"
                      onClick={() => item.status === "Earned" || item.status === "Issued"
                        ? alert(`Credential: ${item.credentialId || "Pending"}`)
                        : handleIssue(item.id)}
                    >
                      {item.status === "Earned" || item.status === "Issued" ? "View" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showIssueModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '90%', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '10px' }}>Issue Certificate</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>Fill in the details to manually issue a certificate.</p>
            <form onSubmit={handleIssueSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Student Name</label>
                <input 
                  type="text" 
                  value={issueForm.student} 
                  onChange={e => setIssueForm({...issueForm, student: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} 
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Course</label>
                <input 
                  type="text" 
                  value={issueForm.course} 
                  onChange={e => setIssueForm({...issueForm, course: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} 
                  placeholder="e.g. Advanced AI"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="sd-btn-primary" style={{ flex: 1 }}>Issue Now</button>
                <button type="button" onClick={() => setShowIssueModal(false)} className="sd-btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCertificateDate(item) {
  if (item.issuedAt) {
    const date = new Date(item.issuedAt);
    if (!Number.isNaN(date.valueOf())) return date.toLocaleDateString();
  }

  return item.issued || item.date || "Pending";
}
