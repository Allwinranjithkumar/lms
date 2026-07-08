import { useState, useEffect } from "react";
import { getCertificates } from "../../services/api";

const filters = ["All", "Earned", "In Progress"];

export default function Certificates() {
  const [filter, setFilter] = useState("All");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyId, setVerifyId] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyId) return;
    alert(`Verified credential for ID: ${verifyId}. This certificate is valid!`);
    setShowVerifyModal(false);
    setVerifyId("");
  };

  useEffect(() => {
    getCertificates()
      .then((d) => setCertificates(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCertificates =
    filter === "All"
      ? certificates
      : certificates.filter((c) => c.status === filter);

  const stats = [
    { label: "Earned", value: certificates.filter((c) => c.status === "Earned").length, icon: "fa-solid fa-trophy", color: "#F59E0B" },
    { label: "In Progress", value: certificates.filter((c) => c.status === "In Progress").length, icon: "fa-solid fa-spinner", color: "#3B82F6" },
  ];

  return (
    <>
      <div className="sd-page-hero sd-cert-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-solid fa-certificate"></i>
          Certificates
        </div>
        <h2>My Certificates</h2>
        <p>View, download, and share verified certificates from completed courses.</p>
        <div className="sd-page-hero-actions">
          <button onClick={() => alert('Downloading certificates bundle as ZIP...')} className="sd-btn-primary" type="button" disabled={stats[0].value === 0}>
            <i className="fa-solid fa-download"></i>
            Download All
          </button>
          <button onClick={() => alert('Profile link copied to clipboard!')} className="sd-btn-outline" type="button">
            <i className="fa-solid fa-share-nodes"></i>
            Share Profile
          </button>
        </div>
      </div>

      <div className="sd-cert-stats" aria-label="Certificate summary">
        {stats.map(({ label, value, icon, color }) => (
          <div className="sd-cert-stat" key={label}>
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

      <div className="sd-cert-toolbar">
        <div className="sd-tab-row">
          {filters.map((item) => (
            <button
              className={`sd-tab-btn${filter === item ? " active" : ""}`}
              key={item}
              type="button"
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button onClick={() => setShowVerifyModal(true)} className="sd-cert-verify-btn" type="button">
          <i className="fa-solid fa-shield-halved"></i>
          Verify Credential
        </button>
      </div>

      {loading && <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>Loading certificates...</div>}
      {!loading && filteredCertificates.length === 0 && <div className="sd-empty">No certificates found in this category.</div>}

      <div className="sd-cert-grid">
        {filteredCertificates.map((certificate) => (
          <article className="sd-cert-card" key={certificate.id}>
            <div className="sd-cert-image-wrap">
              <img src={certificate.image || "https://images.unsplash.com/photo-1596496050827-8299e0220de1?auto=format&fit=crop&w=400&q=80"} alt={`${certificate.title} certificate`} />
              <span
                className={`sd-cert-status ${
                  certificate.status === "Earned" ? "earned" : "progress"
                }`}
              >
                {certificate.status}
              </span>
            </div>
            <div className="sd-cert-body">
              <div className="sd-cert-course" style={{ color: certificate.accent || "#059669" }}>
                {certificate.title || certificate.courseName}
              </div>
              <h3>{certificate.status === "Earned" ? "Certificate of Completion" : "Certificate Preview"}</h3>
              <div className="sd-cert-meta">
                <span>
                  <i className="fa-solid fa-user-tie"></i>
                  {certificate.issuer || "Instructor"}
                </span>
                <span>
                  <i className="fa-regular fa-calendar-days"></i>
                  {certificate.issued || "TBD"}
                </span>
                <span>
                  <i className="fa-solid fa-bullseye"></i>
                  Score {certificate.score || "--"}
                </span>
              </div>
              <div className="sd-cert-actions">
                <button onClick={() => alert(`Downloading PDF for ${certificate.title || certificate.courseName}...`)} 
                  className="sd-btn-primary" 
                  disabled={certificate.status !== "Earned"}
                  style={{ opacity: certificate.status !== "Earned" ? 0.5 : 1, cursor: certificate.status !== "Earned" ? "not-allowed" : "pointer" }}
                >
                  Download PDF
                </button>
                <button onClick={() => alert(`Opening credential view for ${certificate.title || certificate.courseName}...`)} className="sd-btn-secondary">View Credential</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showVerifyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '90%', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '10px' }}>Verify Credential</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>Enter a certificate ID to verify its authenticity.</p>
            <form onSubmit={handleVerify}>
              <div style={{ marginBottom: '25px' }}>
                <input 
                  type="text" 
                  value={verifyId} 
                  onChange={e => setVerifyId(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} 
                  placeholder="e.g. CERT-12345-XYZ"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="sd-btn-primary" style={{ flex: 1 }}>Verify</button>
                <button type="button" onClick={() => setShowVerifyModal(false)} className="sd-btn-secondary" style={{ flex: 1 }}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}