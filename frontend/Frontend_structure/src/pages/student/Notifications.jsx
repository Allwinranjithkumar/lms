import { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsRead } from "../../services/api";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = () => {
    getNotifications()
      .then((res) => {
        setNotifs(res.data || res || []);
        setError("");
      })
      .catch((err) => setError(err.message || "Could not load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAll = async () => {
    setError("");
    try {
      await markAllNotificationsRead();
      setNotifs((current) => current.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setError(err.message || "Could not mark notifications as read.");
    }
  };

  return (
    <>
      <div className="sd-page-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-regular fa-bell"></i>
          Alerts
        </div>
        <h2>Notifications</h2>
        <p>Stay up to date with your assignments, classes, and updates.</p>
      </div>

      {error && (
        <div className="sd-section-card" style={{ marginBottom: "16px", borderColor: "#FCA5A5", color: "#991B1B" }}>
          {error}
        </div>
      )}

      <div className="sd-section-card">
        <div className="sd-sec-header">
          <div className="sd-sec-title">
            <i className="fa-regular fa-bell"></i>
            All Notifications <span className="sd-sec-badge">{notifs.filter((item) => !item.read).length} New</span>
          </div>
          <button className="sd-sec-action" onClick={markAll} disabled={loading}>Mark all read</button>
        </div>

        {loading && <div style={{ color: "var(--muted)" }}>Loading notifications...</div>}
        {!loading && notifs.length === 0 && <div style={{ color: "var(--muted)" }}>No notifications.</div>}

        {notifs.map((notification) => (
          <div
            key={notification.id}
            className="sd-notif-item"
            style={{ background: !notification.read ? "rgba(0,200,83,.04)" : "transparent", borderRadius: "12px" }}
          >
            {!notification.read && <div className="sd-notif-unread-dot"></div>}
            <div className="sd-notif-icon-wrap" style={{ background: notification.color }}>
              <i className={notification.icon}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div className="sd-notif-text" style={{ fontWeight: notification.read ? 500 : 700 }}>{notification.title}</div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>{notification.body}</div>
              <div className="sd-notif-time">{notification.time}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
