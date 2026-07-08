import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { section: "Main", items: [
    { icon: "fa-solid fa-table-columns", label: "Dashboard", path: "/teacher/dashboard" },
    { icon: "fa-solid fa-book-open", label: "My Courses", path: "/teacher/courses" },
    { icon: "fa-solid fa-plus", label: "Create Course", path: "/teacher/create-course" },
    { icon: "fa-solid fa-video", label: "Live Classes", path: "/teacher/live-classes" },
    { icon: "fa-solid fa-clipboard-check", label: "Assignments", badge: "47", path: "/teacher/assignments" },
    { icon: "fa-solid fa-certificate", label: "Certificates", path: "/teacher/certificates" },
  ]},
  { section: "People", items: [
    { icon: "fa-solid fa-user-graduate", label: "Students", path: "/teacher/students" },
    { icon: "fa-regular fa-message", label: "Messages", badge: "5", path: "/teacher/messages" },
  ]},
  { section: "Tools", items: [
    { icon: "fa-solid fa-chart-line", label: "Analytics", path: "/teacher/analytics" },
    { icon: "fa-solid fa-wand-magic-sparkles", label: "AI Tools", path: "/teacher/ai-tools" },
    { icon: "fa-solid fa-folder-open", label: "Resources", path: "/teacher/resources" },
  ]},
  { section: "Account", items: [
    { icon: "fa-regular fa-bell", label: "Notifications", path: "/teacher/notifications" },
    { icon: "fa-solid fa-gear", label: "Settings", path: "/teacher/settings" },
    { icon: "fa-solid fa-right-from-bracket", label: "Logout", path: "/login" },
  ]},
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-mark">
          <i className="fa-solid fa-graduation-cap"></i>
        </div>

        {!isCollapsed && (
          <div className="logo-text">
            JAWA <span>EDTECH</span>
          </div>
        )}

        <button
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span
            style={{
              transform: isCollapsed ? "rotate(180deg)" : "none",
              display: "block",
              transition: "transform .3s",
            }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </span>
        </button>
      </div>

      {/* Navigation */}
      <div className="nav-section">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-label">{section}</div>
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.label}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <div className="icon"><i className={item.icon}></i></div>
                  {!isCollapsed && (
                    <>
                      <span className="label">{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Profile */}
      <div className="profile-card">
        <div className="profile-inner">
          <div className="avatar">JP</div>
          {!isCollapsed && (
            <div className="profile-info">
              <div className="profile-name">Prof. James Parker</div>
              <div className="profile-role">Senior Instructor</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
