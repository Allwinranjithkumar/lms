import { NavLink } from "react-router-dom";
import { clearSession, getSession } from "../../services/api";

const navGroups = [
  {
    label: "Home",
    icon: "fa-solid fa-house",
    items: [
      { icon: "fa-solid fa-table-columns", label: "Dashboard", to: "/teacher/dashboard" },
    ],
  },
  {
    label: "Courses",
    icon: "fa-solid fa-book-open",
    items: [
      { icon: "fa-solid fa-book-open", label: "My Courses", to: "/teacher/courses" },
      { icon: "fa-solid fa-plus", label: "Create Course", to: "/teacher/create-course" },
      { icon: "fa-solid fa-video", label: "Live Classes", to: "/teacher/live-classes" },
      { icon: "fa-solid fa-clipboard-check", label: "Assignments", to: "/teacher/assignments", badge: "47" },
    ],
  },
  {
    label: "People",
    icon: "fa-solid fa-users",
    items: [
      { icon: "fa-solid fa-user-graduate", label: "Students", to: "/teacher/students" },
      { icon: "fa-regular fa-message", label: "Messages", to: "/teacher/messages", badge: "5" },
    ],
  },
  {
    label: "Tools",
    icon: "fa-solid fa-chart-simple",
    items: [
      { icon: "fa-solid fa-chart-line", label: "Analytics", to: "/teacher/analytics" },
      { icon: "fa-solid fa-folder-open", label: "Resources", to: "/teacher/resources" },
    ],
  },
  {
    label: "Account",
    icon: "fa-solid fa-user-gear",
    items: [
      { icon: "fa-regular fa-bell", label: "Notifications", to: "/teacher/notifications" },
      { icon: "fa-solid fa-gear", label: "Settings", to: "/teacher/settings" },
      { icon: "fa-solid fa-right-from-bracket", label: "Logout", to: "/login" },
    ],
  },
];

export default function Navbar({ toggleDark, isDarkMode }) {
  const session = getSession();
  const user = session?.user || {};
  const displayName = user.name || "Professor";
  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "TC";
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", year: "numeric" });
  return (
    <header className="navbar teacher-topnav">
      <div className="teacher-topnav-main">
        <div className="teacher-brand-block">
          <div className="logo-mark">
            <i className="fa-solid fa-graduation-cap" aria-hidden="true"></i>
          </div>
          <div className="greeting">
            <span className="teacher-topline">Teacher command center</span>
            <h1>JAWA EDTECH</h1>
            <p>{greeting}, {displayName} / {dateStr}</p>
          </div>
        </div>

        <nav className="teacher-feature-nav" aria-label="Teacher features">
          {navGroups.map(({ label, icon, items }) => (
            <div key={label} className="teacher-nav-dropdown">
              <button className="teacher-feature-link teacher-dropdown-trigger" type="button">
                <i className={icon}></i>
                <span>{label}</span>
                <i className="fa-solid fa-chevron-down teacher-dropdown-caret"></i>
              </button>
              <div className="teacher-dropdown-menu">
                {items.map(({ icon: itemIcon, label: itemLabel, to, badge }) => (
                  <NavLink
                    key={`${itemLabel}-${to}`}
                    to={to}
                    onClick={itemLabel === "Logout" ? clearSession : undefined}
                    className={({ isActive }) => `teacher-dropdown-item${isActive ? " active" : ""}`}
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

        <div className="nav-actions">
          <label className="search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input placeholder="Search courses, students..." />
          </label>
          <button className="icon-btn" type="button" aria-label="Notifications">
            <i className="fa-regular fa-bell"></i>
            <span className="notif-dot"></span>
          </button>
          <button className="icon-btn" type="button" aria-label="Messages">
            <i className="fa-regular fa-message"></i>
          </button>
          <button className="icon-btn" type="button" onClick={toggleDark} title="Toggle theme" aria-label="Toggle theme">
            <i className={`fa-solid ${isDarkMode ? "fa-sun" : "fa-moon"}`}></i>
          </button>
          <div className="avatar-sm">{initials}</div>
        </div>
      </div>
    </header>
  );
}
