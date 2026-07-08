const stats = [
  {
    icon: "fa-solid fa-book-open-reader",
    color: "#0EA5E9",
    val: "4",
    label: "Enrolled Courses",
    trend: "Active",
    tc: "sd-trend-up",
    sp: (
      <polyline
        points="0,28 16,22 33,26 50,14 66,18 83,8 100,12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    ),
  },
  {
    icon: "fa-solid fa-list-check",
    color: "#F59E0B",
    val: "3",
    label: "Pending Tasks",
    trend: "Due soon",
    tc: "sd-trend-neutral",
    sp: (
      <polyline
        points="0,10 16,18 33,14 50,22 66,16 83,24 100,20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    ),
  },
  {
    icon: "fa-solid fa-bullseye",
    color: "#16A34A",
    val: "89%",
    label: "Avg Grade",
    trend: "+4%",
    tc: "sd-trend-up",
    sp: (
      <polyline
        points="0,26 16,22 33,20 50,16 66,18 83,14 100,10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    ),
  },
  {
    icon: "fa-solid fa-video",
    color: "#8B5CF6",
    val: "3",
    label: "Classes Today",
    trend: "Today",
    tc: "sd-trend-up",
    sp: (
      <polyline
        points="0,30 16,24 33,28 50,20 66,26 83,16 100,22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    ),
  },
];

export default function StatCards() {
  return (
    <div className="sd-kpi-grid">
      {stats.map(({ icon, color, val, label, trend, tc, sp }) => (
        <div key={label} className="sd-kpi-card" style={{ "--accent": color }}>
          <div className="sd-kpi-top">
            <div className="sd-kpi-icon">
              <i className={icon}></i>
            </div>
            <div className={`sd-kpi-trend ${tc}`}>{trend}</div>
          </div>
          <div className="sd-kpi-val">{val}</div>
          <div className="sd-kpi-label">{label}</div>
          <div className="sd-sparkline">
            <svg viewBox="0 0 100 36" preserveAspectRatio="none" width="100%" height="100%">
              {sp}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
