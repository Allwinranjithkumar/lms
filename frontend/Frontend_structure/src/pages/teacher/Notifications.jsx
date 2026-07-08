import { useState } from "react";

const notifications = [
  { id: 1, type: "submission", icon: "fa-solid fa-paper-plane", color: "#D1FAE5", title: "New Assignment Submission", body: "Aisha Patel submitted 'React Hooks Deep Dive' — 2h ago", time: "2h ago", read: false, category: "Assignments" },
  { id: 2, type: "message", icon: "fa-regular fa-message", color: "#DBEAFE", title: "New Message", body: "Marcus Chen: 'Can we schedule a 1:1 session?'", time: "3h ago", read: false, category: "Messages" },
  { id: 3, type: "enroll", icon: "fa-solid fa-user-graduate", color: "#FEF3C7", title: "New Enrollment", body: "5 new students enrolled in Machine Learning Basics", time: "5h ago", read: false, category: "Courses" },
  { id: 4, type: "review", icon: "fa-solid fa-star", color: "#FCE7F3", title: "New Course Review", body: "David Kim left a 5-star review on Cloud Architecture AWS", time: "Yesterday", read: true, category: "Courses" },
  { id: 5, type: "submission", icon: "fa-solid fa-paper-plane", color: "#D1FAE5", title: "Assignment Due Soon", body: "'AWS S3 Bucket Setup' is due in 2 days — 38 students pending", time: "Yesterday", read: true, category: "Assignments" },
  { id: 6, type: "system", icon: "fa-regular fa-bell", color: "#F1F5F9", title: "Platform Update", body: "New AI grading features are now available in AI Tools.", time: "2 days ago", read: true, category: "System" },
  { id: 7, type: "message", icon: "fa-regular fa-message", color: "#DBEAFE", title: "New Message", body: "Sara Williams: 'I submitted my late assignment'", time: "2 days ago", read: true, category: "Messages" },
  { id: 8, type: "enroll", icon: "fa-solid fa-user-graduate", color: "#FEF3C7", title: "Course Milestone", body: "React Advanced Patterns reached 140 students!", time: "3 days ago", read: true, category: "Courses" },
];

const categories = ["All", "Assignments", "Messages", "Courses", "System"];

export default function Notifications() {
  const [filter, setFilter] = useState("All");
  const [notifs, setNotifs] = useState(notifications);

  const filtered = notifs.filter(
    (n) => filter === "All" || n.category === filter
  );

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));

  const markRead = (id) =>
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const remove = (id) => setNotifs(notifs.filter((n) => n.id !== id));

  return (
    <div className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "22px", fontWeight: "800", color: "var(--dark)", marginBottom: "4px" }}>
            Notifications
            {unread > 0 && (
              <span className="nav-badge" style={{ marginLeft: "10px", fontSize: "12px" }}>
                {unread} new
              </span>
            )}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Stay updated on your students and courses
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px",
              padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", color: "var(--dark)",
            }}
          >
            <i className="fa-solid fa-check"></i> Mark all as read
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Unread", val: unread, icon: "fa-regular fa-bell", color: "#FEF3C7" },
          { label: "Submissions", val: notifs.filter((n) => n.type === "submission").length, icon: "fa-solid fa-paper-plane", color: "#D1FAE5" },
          { label: "Messages", val: notifs.filter((n) => n.type === "message").length, icon: "fa-regular fa-message", color: "#DBEAFE" },
          { label: "Enrollments", val: notifs.filter((n) => n.type === "enroll").length, icon: "fa-solid fa-user-graduate", color: "#FCE7F3" },
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

      {/* Category Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {categories.map((c) => (
          <button key={c} className={`tab-btn ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Notification Feed */}
      <div className="section-card" style={{ padding: "12px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--muted)" }}>
            <div style={{ fontSize: "42px", marginBottom: "12px" }}><i className="fa-solid fa-circle-check"></i></div>
            <div style={{ fontWeight: "600", fontSize: "15px" }}>All caught up!</div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>No notifications in this category</div>
          </div>
        )}

        {filtered.map((n) => (
          <div
            key={n.id}
            className={`teacher-notif-row${!n.read ? " unread" : ""}`}
            style={{
              display: "flex", gap: "12px", padding: "14px 12px",
              borderRadius: "14px", marginBottom: "6px",
              transition: "all .2s", cursor: "pointer",
            }}
            onClick={() => markRead(n.id)}
          >
            <div
              className="notif-dot-icon"
              style={{ background: n.color, width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0 }}
            >
              <i className={n.icon}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                <div>
                  <div
                    style={{
                      fontSize: "13px", fontWeight: n.read ? "500" : "700",
                      color: "var(--dark)", marginBottom: "3px",
                    }}
                  >
                    {n.title}
                    {!n.read && (
                      <span
                        style={{
                          width: "7px", height: "7px", background: "var(--g1)", borderRadius: "50%",
                          display: "inline-block", marginLeft: "7px", verticalAlign: "middle",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.5" }}>{n.body}</div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{n.time}</div>
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <span
                    style={{
                      background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "6px",
                      padding: "2px 8px", fontSize: "10px", fontWeight: "600", color: "var(--muted)",
                    }}
                  >
                    {n.category}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "14px", color: "var(--muted)", padding: "2px 4px", borderRadius: "6px",
                    }}
                    title="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
