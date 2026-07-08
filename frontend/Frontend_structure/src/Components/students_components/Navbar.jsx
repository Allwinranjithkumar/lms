import { NavLink } from "react-router-dom";
import { clearSession, getSession } from "../../services/api";

const navGroups = [
  {
    label: "Home",
    icon: "fa-solid fa-house",
    items: [
      { icon: "fa-solid fa-table-columns", label: "Dashboard", to: "/student/dashboard" },
    ],
  },
  {
    label: "Learning",
    icon: "fa-solid fa-book-open-reader",
    items: [
      { icon: "fa-solid fa-book-open-reader", label: "Courses", to: "/student/courses" },
      { icon: "fa-solid fa-video", label: "Live Classes", to: "/student/live-classes", badge: "1" },
      { icon: "fa-solid fa-list-check", label: "Assignments", to: "/student/assignments", badge: "3" },
      { icon: "fa-solid fa-chart-line", label: "Grades", to: "/student/grades" },
      { icon: "fa-solid fa-folder-open", label: "Resources", to: "/student/resources" },
    ],
  },
  {
    label: "Social",
    icon: "fa-regular fa-message",
    items: [
      { icon: "fa-regular fa-message", label: "Messages", to: "/student/messages", badge: "6" },
      { icon: "fa-regular fa-bell", label: "Notifications", to: "/student/notifications", badge: "3" },
    ],
  },
  {
    label: "Account",
    icon: "fa-solid fa-user-gear",
    items: [
      { icon: "fa-solid fa-gear", label: "Settings", to: "/student/settings" },
      { icon: "fa-solid fa-right-from-bracket", label: "Logout", to: "/login" },
    ],
  },
];

export default function Navbar({ toggleDark, isDark }) {
  const session = getSession();
  const user = session?.user || {};
  const displayName = user.name || "Student";
  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "ST";
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", year: "numeric" });
  return (
    <header className="sd-navbar sd-topnav">
      <div className="sd-topnav-main">
        <div className="sd-brand-block">
          <div className="sd-logo-mark">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div className="sd-greeting">
            <span className="sd-topline">Student command center</span>
            <h1>JAWA EDTECH</h1>
            <p>{greeting}, {displayName} / {dateStr}</p>
          </div>
        </div>

        <div className="sd-nav-actions">
          <label className="sd-search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input placeholder="Search courses, assignments..." />
          </label>
          <button className="sd-icon-btn" type="button" onClick={toggleDark} title="Toggle theme" aria-label="Toggle theme">
            <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`}></i>
          </button>
          <div className="sd-avatar-sm">{initials}</div>
        </div>
      </div>

      <nav className="sd-feature-nav" aria-label="Student features">
        {navGroups.map(({ label, icon, items }) => (
          <div key={label} className="sd-nav-dropdown">
            <button className="sd-feature-link sd-dropdown-trigger" type="button">
              <i className={icon}></i>
              <span>{label}</span>
              <i className="fa-solid fa-chevron-down sd-dropdown-caret"></i>
            </button>
            <div className="sd-dropdown-menu">
              {items.map(({ icon: itemIcon, label: itemLabel, to, badge }) => (
                <NavLink
                  key={`${itemLabel}-${to}`}
                  to={to}
                  onClick={itemLabel === "Logout" ? clearSession : undefined}
                  className={({ isActive }) => `sd-dropdown-item${isActive ? " active" : ""}`}
                >
                  <i className={itemIcon}></i>
                  <span>{itemLabel}</span>
                  {badge && <strong>{badge}</strong>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </header>
  );
}
