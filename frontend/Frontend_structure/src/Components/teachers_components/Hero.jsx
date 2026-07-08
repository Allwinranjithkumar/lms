export default function Hero() {
  return (
    <div className="hero">
      <div>
        <div className="hero-tag"><i className="fa-solid fa-wand-magic-sparkles"></i> AI-Powered LMS Platform</div>
        <h2>Empowering Future Minds<br/>Through <span>Artificial Intelligence</span></h2>
        <p>Manage courses, engage students, and leverage AI-powered teaching tools to transform the classroom experience.</p>
        <div className="hero-btns">
          <button className="btn-primary"><i className="fa-solid fa-plus"></i> Create Course</button>
          <button className="btn-outline"><i className="fa-solid fa-play"></i> Start Live Class</button>
        </div>
      </div>
      <div className="hero-visual">
        <FloatCard icon="fa-solid fa-user-graduate" val="1,254" lbl="Active Students" bg="rgba(0,200,83,.25)" />
        <FloatCard icon="fa-solid fa-star" val="4.9 / 5" lbl="Avg. Rating" bg="rgba(255,193,7,.2)" />
        <FloatCard icon="fa-solid fa-graduation-cap" val="892" lbl="Completions" bg="rgba(16,185,129,.25)" />
      </div>
    </div>
  );
}

function FloatCard({ icon, val, lbl, bg }) {
  return (
    <div className="float-card">
      <div className="float-icon" style={{ background: bg }}><i className={icon}></i></div>
      <div className="float-info">
        <div className="val">{val}</div>
        <div className="lbl">{lbl}</div>
      </div>
    </div>
  );
}
