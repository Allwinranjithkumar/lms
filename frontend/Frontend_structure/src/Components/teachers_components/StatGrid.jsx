export default function StatGrid() {
  return (
    <div className="kpi-grid">
      <StatCard icon="fa-solid fa-user-graduate" color="#D1FAE5" val="1,254" label="Total Students" trend="▲ 12%" trendClass="trend-up" 
        sparkline={<polyline points="0,28 16,22 33,26 50,14 66,18 83,8 100,12" fill="none" stroke="#00C853" strokeWidth="2"/>} />
      <StatCard icon="fa-solid fa-book-open" color="#DBEAFE" val="18" label="Active Courses" trend="▲ 3" trendClass="trend-up"
        sparkline={<polyline points="0,26 16,22 33,20 50,16 66,18 83,14 100,12" fill="none" stroke="#3B82F6" strokeWidth="2"/>} />
      <StatCard icon="fa-solid fa-clipboard-check" color="#FEF3C7" val="47" label="Pending Reviews" trend="▲ 8" trendClass="trend-neutral"
        sparkline={<polyline points="0,10 16,18 33,14 50,22 66,16 83,24 100,20" fill="none" stroke="#F59E0B" strokeWidth="2"/>} />
      <StatCard icon="fa-solid fa-video" color="#FCE7F3" val="6" label="Live Classes Today" trend="Today" trendClass="trend-up"
        sparkline={<polyline points="0,30 16,24 33,28 50,20 66,26 83,16 100,22" fill="none" stroke="#EC4899" strokeWidth="2"/>} />
    </div>
  );
}

function StatCard({ icon, color, val, label, trend, trendClass, sparkline }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: color }}><i className={icon}></i></div>
        <div className={`kpi-trend ${trendClass}`}>{trend}</div>
      </div>
      <div className="kpi-val">{val}</div>
      <div className="kpi-label">{label}</div>
      <div className="sparkline">
        <svg viewBox="0 0 100 36" preserveAspectRatio="none" width="100%" height="100%">
          {sparkline}
        </svg>
      </div>
    </div>
  );
}
