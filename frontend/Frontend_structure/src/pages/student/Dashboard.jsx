// Force Vite reload
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../../Components/students_components/Hero";
import { getStudentDashboard, getSession } from "../../services/api";
import { chartData } from "../../data/studentdata";

export default function Dashboard() {
  const navigate = useNavigate();
  const [chartTab, setChartTab] = useState("attendance");
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const data = chartData[chartTab];
  const maxVal = Math.max(...data.vals);

  const session = getSession();
  const userName = session?.user?.name?.split(" ")[0] || "Student";

  useEffect(() => {
    getStudentDashboard()
      .then((d) => setDashData(d))
      .catch(() => setDashData(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = dashData
    ? [
        { icon: "fa-solid fa-book-open-reader", color: "#0EA5E9", val: String(dashData.stats?.activeCourses ?? 0), label: "Enrolled Courses", trend: "Active" },
        { icon: "fa-solid fa-list-check", color: "#F59E0B", val: String(dashData.stats?.pendingAssignments ?? 0), label: "Pending Tasks", trend: "Due soon" },
        { icon: "fa-solid fa-bullseye", color: "#16A34A", val: `${dashData.stats?.averageProgress ?? 0}%`, label: "Avg Progress", trend: "+4%" },
        { icon: "fa-solid fa-certificate", color: "#8B5CF6", val: String(dashData.stats?.earnedCertificates ?? 0), label: "Certificates", trend: "Earned" },
      ]
    : [
        { icon: "fa-solid fa-book-open-reader", color: "#0EA5E9", val: "—", label: "Enrolled Courses", trend: "Loading" },
        { icon: "fa-solid fa-list-check", color: "#F59E0B", val: "—", label: "Pending Tasks", trend: "Loading" },
        { icon: "fa-solid fa-bullseye", color: "#16A34A", val: "—", label: "Avg Progress", trend: "" },
        { icon: "fa-solid fa-certificate", color: "#8B5CF6", val: "—", label: "Certificates", trend: "" },
      ];

  const courses = dashData?.courses ?? [];
  const todayClasses = dashData?.classes ?? [];
  const leaderboard = dashData?.leaderboard ?? [];

  return (
    <>
      <Hero userName={userName} />

      {/* KPI stat cards */}
      <div className="sd-kpi-grid">
        {stats.map(({ icon, color, val, label, trend }) => (
          <div key={label} className="sd-kpi-card" style={{ "--accent": color }}>
            <div className="sd-kpi-top">
              <div className="sd-kpi-icon"><i className={icon}></i></div>
              <div className="sd-kpi-trend sd-trend-up">{trend}</div>
            </div>
            <div className="sd-kpi-val">{val}</div>
            <div className="sd-kpi-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="sd-grid-2">
        <section className="sd-section-card sd-performance-card">
          <div className="sd-sec-header">
            <div>
              <div className="sd-sec-eyebrow">Learning analytics</div>
              <div className="sd-sec-title">
                <i className="fa-solid fa-chart-simple"></i>
                My Performance
              </div>
            </div>
            <div className="sd-tab-row">
              {Object.keys(chartData).map((key) => (
                <button
                  key={key}
                  className={`sd-tab-btn${chartTab === key ? " active" : ""}`}
                  onClick={() => setChartTab(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="sd-metric-row">
            <div>
              <div className="sd-metric-value">{data.metric}</div>
              <div className="sd-metric-label">{data.label}</div>
            </div>
            <span className="sd-metric-chip">Top momentum this month</span>
          </div>
          <div className="sd-chart-container">
            {data.vals.map((value, index) => (
              <div key={data.labels[index]} className="sd-chart-col">
                <div
                  className="sd-bar"
                  style={{
                    height: `${(value / maxVal) * 100}%`,
                    background: data.color,
                    opacity: index === data.vals.length - 1 ? 1 : 0.58,
                  }}
                >
                  <span className="sd-bar-label">{data.labels[index]}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sd-section-card">
          <div className="sd-sec-header">
            <div>
              <div className="sd-sec-eyebrow">Live schedule</div>
              <div className="sd-sec-title">
                <i className="fa-solid fa-calendar-day"></i>
                Today's Classes
              </div>
            </div>
            <button onClick={() => navigate('/student/live-classes')} className="sd-sec-action">View All</button>
          </div>
          {loading ? (
            <div style={{ color: "var(--muted)", fontSize: "13px", padding: "20px 0" }}>Loading...</div>
          ) : todayClasses.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: "13px", padding: "20px 0" }}>No classes today.</div>
          ) : (
            todayClasses.map((cls) => (
              <div key={`${cls.time}-${cls.name || cls.subject}`} className="sd-class-item">
                <div className="sd-class-time">{cls.time}</div>
                <div className="sd-class-info">
                  <div className="sd-class-name">{cls.name || cls.subject}</div>
                  <div className="sd-class-meta">{cls.teacher} / {cls.room || "Online"}</div>
                </div>
                <span className={`sd-status-badge ${cls.status === "live" ? "sd-status-live" : "sd-status-upcoming"}`}>
                  {cls.status === "live" ? "LIVE" : "Upcoming"}
                </span>
                <button onClick={() => navigate('/student/live-classes')} className="sd-join-btn">Join</button>
              </div>
            ))
          )}
        </section>
      </div>

      <div className="sd-grid-2">
        <section className="sd-section-card">
          <div className="sd-sec-header">
            <div>
              <div className="sd-sec-eyebrow">Current programme</div>
              <div className="sd-sec-title">
                <i className="fa-solid fa-graduation-cap"></i>
                My Courses <span className="sd-sec-badge">{courses.length} Active</span>
              </div>
            </div>
            <button onClick={() => navigate('/student/courses')} className="sd-sec-action">View All</button>
          </div>
          <div className="sd-courses-grid">
            {courses.length === 0 && !loading && (
              <div style={{ color: "var(--muted)", fontSize: "13px" }}>No courses enrolled yet.</div>
            )}
            {courses.map((course) => (
              <div key={course.id} className="sd-course-card">
                <div className="sd-course-thumb" style={{ background: course.bg || course.accent || "#064E3B" }}>
                  <i className={course.icon || "fa-solid fa-book-open-reader"}></i>
                </div>
                <div className="sd-course-body">
                  <div className="sd-course-name">{course.title || course.name}</div>
                  <div className="sd-course-meta">
                    <span>{course.instructor || course.teacher}</span>
                    <span className="rating">
                      <i className="fa-solid fa-star"></i> {course.rating || "N/A"}
                    </span>
                  </div>
                  <div className="sd-prog-bar">
                    <div className="sd-prog-fill" style={{ width: `${course.progress || 0}%` }}></div>
                  </div>
                  <div className="sd-progress-foot">
                    <span>{course.progress || 0}% complete</span>
                    <span>{course.lessons || 0} lessons</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sd-section-card sd-leader-card">
          <div className="sd-sec-header">
            <div>
              <div className="sd-sec-eyebrow">Class energy</div>
              <div className="sd-sec-title">
                <i className="fa-solid fa-ranking-star"></i>
                Class Leaderboard
              </div>
            </div>
            <button onClick={() => navigate('/student/performance')} className="sd-sec-action">Full Board</button>
          </div>
          {leaderboard.map((student, index) => (
            <div key={student.name} className={`sd-leader-item${student.you ? " is-you" : ""}`}>
              <div className={`sd-rank${index === 0 ? " gold" : index === 1 ? " silver" : index === 2 ? " bronze" : ""}`}>
                {index + 1}
              </div>
              <div className="sd-leader-av" style={{ background: student.color || "#16A34A" }}>{student.initials}</div>
              <div className="sd-leader-main">
                <div className="sd-leader-name-row">
                  <span className="sd-leader-name">{student.name}</span>
                  {student.you && <span className="sd-you-badge">You</span>}
                </div>
                <div className="sd-leader-track">
                  <span style={{ width: `${Math.min(student.score, 100)}%` }}></span>
                </div>
              </div>
              <div className="sd-leader-score">{student.score} pts</div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
