import { useState, useEffect } from "react";
import { getResources, getResourceDownloadUrl } from "../../services/api";

export default function Resources() {
  const [search, setSearch] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResources()
      .then((d) => setResources(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter((r) => 
    (r.name || r.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="sd-page-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-solid fa-folder-open"></i>
          Study Materials
        </div>
        <h2>Resources</h2>
        <p>Access lecture notes, slides, and study materials from your professors.</p>
      </div>

      <div className="sd-section-card">
        <div className="sd-sec-header">
          <div className="sd-sec-title">
            <i className="fa-solid fa-folder-open"></i>
            All Resources <span className="sd-sec-badge">{resources.length} Files</span>
          </div>
          <div className="sd-search-bar" style={{ minWidth: "200px" }}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading && <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>Loading resources...</div>}
        
        {!loading && filtered.map((r, i) => (
          <div key={r.id || i} className="sd-resource-item">
            <div className="sd-resource-icon" style={{ background: `${r.color || "#38BDF8"}18`, color: r.color || "#38BDF8" }}>
              <i className={r.icon || "fa-regular fa-file-lines"}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div className="sd-resource-name">{r.name || r.title}</div>
              <div className="sd-resource-meta">{r.course || "General"} - {r.size || "Unknown Size"} - {r.date || "Just now"}</div>
            </div>
            <button onClick={() => window.open(getResourceDownloadUrl(r.id), "_blank")} className="sd-resource-dl">
              <i className="fa-solid fa-download"></i>
              Download
            </button>
          </div>
        ))}

        {!loading && filtered.length === 0 && <div className="sd-empty">No resources found for "{search}"</div>}
      </div>
    </>
  );
}

