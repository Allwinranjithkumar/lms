import { NavLink } from "react-router-dom";

const nav = [
  {
    section: "Main",
    items: [
      { icon: "fa-solid fa-table-columns", label: "Dashboard", page: "dashboard" },
      { icon: "fa-solid fa-book-open-reader", label: "My Courses", page: "courses" },
      { icon: "fa-solid fa-video", label: "Live Classes", page: "live", badge: "1" },
      { icon: "fa-solid fa-list-check", label: "Assignments", page: "assignments", badge: "3" },
      { icon: "fa-solid fa-chart-line", label: "Grades", page: "grades" },
      { icon: "fa-solid fa-certificate", label: "Certificates", page: "certificates" },
    ],
  },
  {
    section: "Learning",
    items: [
      { icon: "fa-solid fa-folder-open", label: "Resources", page: "resources" },
      { icon: "fa-solid fa-wand-magic-sparkles", label: "AI Assistant", page: "ai" },
    ],
  },
  {
    section: "Social",
    items: [
      { icon: "fa-regular fa-message", label: "Messages", page: "messages", badge: "6" },
      { icon: "fa-regular fa-bell", label: "Notifications", page: "notifications", badge: "3" },
    ],
  },
  {
    section: "Account",
    items: [
      { icon: "fa-solid fa-gear", label: "Settings", page: "settings" },
      { icon: "fa-solid fa-right-from-bracket", label: "Logout", page: "logout" },
    ],
  },
];

const routes = {
  dashboard: "/student/dashboard",
  courses: "/student/courses",
  live: "/student/live-classes",
  assignments: "/student/assignments",
  grades: "/student/grades",
  certificates: "/student/certificates",
  resources: "/student/resources",
  ai: "/student/ai-assistant",
  messages: "/student/messages",
  notifications: "/student/notifications",
  settings: "/student/settings",
  logout: "/student/dashboard",
};

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <nav className={`sd-sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sd-sidebar-header">
        <div className="sd-logo-mark">
          <i className="fa-solid fa-graduation-cap"></i>
        </div>
        {!collapsed && (
          <div className="sd-logo-text">
            JAWA <span>EDTECH</span>
          </div>
        )}
        <button className="sd-toggle-btn" type="button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          <i className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
        </button>
      </div>

      <div className="sd-nav-section">
        {nav.map(({ section, items }) => (
          <div key={section}>
            <div className="sd-nav-group-label">{section}</div>
            {items.map(({ icon, label, page, badge }) => (
              <NavLink
                key={page}
                to={routes[page]}
                className={({ isActive }) => `sd-nav-item${isActive ? " active" : ""}`}
                title={collapsed ? label : undefined}
              >
                <span className="sd-nav-icon">
                  <i className={icon}></i>
                </span>
                <span className="sd-nav-lbl">{label}</span>
                {badge && <span className="sd-nav-badge">{badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="sd-profile-card">
        <div className="sd-profile-inner">
          <div className="sd-avatar">AJ</div>
          <div className="sd-profile-info">
            <div className="sd-profile-name">Alex Johnson</div>
            <div className="sd-profile-role">CS Year 3 / Student</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
