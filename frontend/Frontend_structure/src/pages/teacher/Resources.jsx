import { useState, useEffect, useRef } from "react";
import { getResources, uploadResource, deleteResource, getResourceDownloadUrl } from "../../services/api";

const typeIcons = {
  pdf: "fa-regular fa-file-pdf",
  xlsx: "fa-regular fa-file-excel",
  pptx: "fa-regular fa-file-powerpoint",
  zip: "fa-regular fa-file-zipper",
  mp4: "fa-regular fa-file-video",
  docx: "fa-regular fa-file-word",
};

export default function Resources() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [dragging, setDragging] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const fetchResources = () => {
    setLoading(true);
    getResources()
      .then(res => setResources(res.data || res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filtered = resources.filter((r) => {
    const matchSearch = (r.name || r.title || "").toLowerCase().includes(search.toLowerCase()) || (r.course || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || (r.type || r.fileType || "").toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const totalSize = "33.3 MB";
  const totalDownloads = resources.reduce((a, r) => a + (r.downloads || 0), 0);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    try {
      for (const f of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", f);
        await uploadResource(formData);
      }
      fetchResources();
    } catch (err) {
      alert("Error uploading file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteResource(id);
      fetchResources();
    } catch (err) {
      alert("Error deleting resource.");
    }
  };

  return (
    <div className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "22px", fontWeight: "800", color: "var(--dark)", marginBottom: "4px" }}>
            Resources
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Upload and manage teaching materials for your courses
          </p>
        </div>
        <button className="sd-btn-primary" onClick={() => fileInputRef.current?.click()}><i className="fa-solid fa-upload"></i> Upload File</button>
        <input type="file" ref={fileInputRef} style={{ display: "none" }} multiple onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Files", val: resources.length, icon: "fa-solid fa-folder-open", color: "#D1FAE5" },
          { label: "Total Size", val: totalSize, icon: "fa-solid fa-hard-drive", color: "#DBEAFE" },
          { label: "Total Downloads", val: totalDownloads, icon: "fa-solid fa-download", color: "#FEF3C7" },
          { label: "Courses Covered", val: new Set(resources.map(r => r.course)).size, icon: "fa-solid fa-book-open", color: "#FCE7F3" },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon" style={{ background: k.color }}><i className={k.icon}></i></div>
            </div>
            <div className="kpi-val" style={{ fontSize: "24px" }}>{k.val}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        style={{
          border: `2px dashed ${dragging ? "var(--g1)" : "var(--border)"}`,
          borderRadius: "16px", padding: "32px", textAlign: "center",
          background: dragging ? "var(--g-light)" : "var(--surface2)",
          marginBottom: "24px", transition: "all .2s", cursor: "pointer",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div style={{ fontSize: "32px", marginBottom: "8px" }}><i className="fa-solid fa-folder-open"></i></div>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--dark)", marginBottom: "4px" }}>
          Drag & drop files here
        </div>
        <div style={{ fontSize: "12px", color: "var(--muted)" }}>
          Supports PDF, PPTX, XLSX, MP4, ZIP and more
        </div>
      </div>

      {/* Filter + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["All", "PDF", "PPTX", "XLSX", "ZIP"].map((f) => (
            <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="search-bar" style={{ minWidth: "220px" }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* File List */}
      <div className="section-card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Course</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        background: (r.color || "#6366F1") + "22", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "18px", flexShrink: 0,
                      }}
                    >
                      <i className={typeIcons[r.type || r.fileType || "pdf"]} style={{ color: r.color || "#6366F1" }}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--dark)" }}>{r.name || r.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", fontWeight: "600" }}>{r.type || r.fileType || "FILE"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: "12px", color: "var(--muted)", padding: "12px 16px" }}>{r.course || "General"}</td>
                <td style={{ fontSize: "12px", color: "var(--muted)", padding: "12px 16px" }}>{r.size || "Unknown"}</td>
                <td style={{ fontSize: "12px", color: "var(--muted)", padding: "12px 16px" }}>{r.date ? new Date(r.date).toLocaleDateString() : "Just now"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: "600", color: "var(--g3)" }}>
                    <i className="fa-solid fa-download"></i> {r.downloads || 0}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => window.open(getResourceDownloadUrl(r.id), "_blank")} className="sd-btn-outline" style={{ padding: "5px 12px", fontSize: "11px", border: "1px solid var(--border)", borderRadius: "8px" }}><i className="fa-solid fa-download"></i> Download</button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{
                        background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px",
                        padding: "5px 10px", fontSize: "11px", cursor: "pointer", color: "#991B1B"
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            <div style={{ fontSize: "30px", marginBottom: "10px" }}><i className="fa-solid fa-magnifying-glass"></i></div>
            <div style={{ fontWeight: "600" }}>No files found</div>
          </div>
        )}
      </div>
    </div>
  );
}
