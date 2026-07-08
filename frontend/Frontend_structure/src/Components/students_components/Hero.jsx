import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <div className="sd-hero">
      <div className="sd-hero-copy">
        <div className="sd-hero-tag">
          <i className="fa-solid fa-bolt"></i>
          AI-Powered Learning Programme
        </div>
        <h2>Build your next advantage with JAWA EDTECH</h2>
        <p>
          Live classes, guided projects, performance insights, and AI study
          support in one premium student workspace.
        </p>
        <div className="sd-hero-btns">
          <button className="sd-btn-primary" onClick={() => navigate("/student/live-classes")}>
            <i className="fa-solid fa-play"></i>
            Join Live Class
          </button>
          <button className="sd-btn-outline" onClick={() => navigate("/student/assignments")}>
            <i className="fa-solid fa-list-check"></i>
            View Assignments
          </button>
        </div>
      </div>

      <div className="sd-hero-visual" aria-label="Student progress highlights">
        {[
          ["fa-solid fa-chart-line", "89%", "Avg Grade"],
          ["fa-solid fa-trophy", "#3", "Class Rank"],
          ["fa-solid fa-layer-group", "78%", "Course Progress"],
        ].map(([icon, val, label]) => (
          <div key={label} className="sd-float-card">
            <div className="sd-float-icon">
              <i className={icon}></i>
            </div>
            <div>
              <div className="sd-float-val">{val}</div>
              <div className="sd-float-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
