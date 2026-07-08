export default function ClassList() {
  const classes = [
    { time: '10:00 AM', name: 'Artificial Intelligence', meta: '48 students • Room 301', status: 'LIVE' },
    { time: '11:30 AM', name: 'Database Systems', meta: '36 students • Room 204', status: 'Upcoming' },
    { time: '2:00 PM', name: 'Machine Learning', meta: '52 students • Lab A', status: 'Upcoming' },
  ];

  return (
    <div className="section-card">
      <div className="sec-header">
        <div className="sec-title"><i className="fa-regular fa-calendar-days"></i> Today's Classes</div>
        <button className="sec-action">View All →</button>
      </div>
      {classes.map((cls, idx) => (
        <div className="class-item" key={idx}>
          <div className="class-time">{cls.time}</div>
          <div className="class-info">
            <div className="class-name">{cls.name}</div>
            <div className="class-meta">{cls.meta}</div>
          </div>
          <span className={`status-badge ${cls.status === 'LIVE' ? 'status-live' : 'status-upcoming'}`}>
            {cls.status === 'LIVE' ? '● LIVE' : cls.status}
          </span>
          <button className="join-btn">Join</button>
        </div>
      ))}
    </div>
  );
}
