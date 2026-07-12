import { useState, useEffect, useRef } from "react";
import { getLiveClasses, markLiveClassAttendance } from "../../services/api";

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState(null);
  const [joiningClassId, setJoiningClassId] = useState("");
  const meetingTabRef = useRef(null);

  const fetchClasses = (silent = false) => {
    if (!silent) setLoading(true);
    return getLiveClasses()
      .then((d) => {
        const classList = d.data || d || [];
        setClasses(classList);
        return classList;
      })
      .catch(() => {})
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    fetchClasses();
    // Poll for active classes every 5 seconds for faster reaction
    const interval = setInterval(() => fetchClasses(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter classes. Active classes are sorted newest-first so "Join" always
  // targets the room the teacher is currently hosting, not a stale older one.
  // The LiveClass record has no createdAt column, so we order by scheduledAt and
  // fall back to the id — Prisma's cuid() is timestamp-prefixed, so a lexical
  // compare of ids is a reliable newest-first tiebreaker.
  const newestFirst = (a, b) => {
    const byTime = new Date(b.scheduledAt || 0) - new Date(a.scheduledAt || 0);
    if (byTime !== 0) return byTime;
    return String(b.id || "").localeCompare(String(a.id || ""));
  };
  const liveClasses = classes.filter((c) => c.status === "active").sort(newestFirst);
  const upcoming = classes.filter((c) => c.status === "scheduled");
  const past = classes.filter((c) => c.status === "completed");
  const nextClass = liveClasses[0] || upcoming[0] || null;

  // Watch for the active class ending
  useEffect(() => {
    if (activeClass) {
      const stillActive = liveClasses.find(c => c.id === activeClass.id);
      if (!stillActive) {
        // Teacher ended the class!
        alert("The instructor has ended this live class.");
        leaveClass();
      }
    }
  }, [liveClasses, activeClass]);

  const joinClass = async (cls) => {
    if (cls.status !== "active") {
      alert("This class hasn't started yet.");
      return;
    }

    try {
      setJoiningClassId(cls.id);
      const res = await markLiveClassAttendance(cls.id, { status: "present" });
      setActiveClass(res.class || cls);
      fetchClasses(true);
    } catch (err) {
      alert("Could not join class: " + (err.message || "Failed"));
    } finally {
      setJoiningClassId("");
    }
  };

  const leaveClass = () => {
    setActiveClass(null);
    if (meetingTabRef.current && !meetingTabRef.current.closed) {
      meetingTabRef.current.close();
      meetingTabRef.current = null;
    }
    fetchClasses();
  };

  // If a class is active, render the active class dashboard
  if (activeClass) {
    return (
      <StudentMeetingRoom
        activeClass={activeClass}
        leaveClass={leaveClass}
        openMeetingInTab={(meeting) => {
          const url = meetingUrlForClass(meeting);
          if (url) meetingTabRef.current = window.open(url, "_blank", "noopener,noreferrer");
        }}
      />
    );
  }

  const overviewCards = [
    { icon: "fa-solid fa-video", value: String(liveClasses.length), label: "Live Now", trend: "In session" },
    { icon: "fa-solid fa-calendar-days", value: String(upcoming.length), label: "Upcoming Classes", trend: "Scheduled" },
    { icon: "fa-solid fa-circle-play", value: String(past.length), label: "Past Sessions", trend: "Recordings" },
  ];

  return (
    <div className="slc-page">
      <section className="slc-header">
        <div>
          <span className="slc-eyebrow">AI virtual classroom</span>
          <h1>Live Classes</h1>
          <p>Attend live sessions, interact with instructors, and learn with AI assistance.</p>
        </div>
        <div className="slc-header-actions">
          <button 
            onClick={() => nextClass ? joinClass(nextClass) : alert("No classes available.")} 
            className="slc-btn slc-btn-primary" 
            type="button"
            disabled={!nextClass || nextClass.status !== "active" || joiningClassId === nextClass.id}
            style={{ opacity: (!nextClass || nextClass.status !== "active" || joiningClassId === nextClass.id) ? 0.6 : 1 }}
          >
            <i className="fa-solid fa-bolt"></i> {joiningClassId === nextClass?.id ? "Joining..." : "Join Next Class"}
          </button>
        </div>
      </section>

      <section className="slc-overview-grid">
        {overviewCards.map((card, index) => (
          <article key={card.label} className="slc-overview-card" style={{ animationDelay: `${index * 70}ms` }}>
            <div className="slc-card-top">
              <div className="slc-card-icon"><i className={card.icon}></i></div>
              <span>{card.trend}</span>
            </div>
            <strong>{card.value}</strong>
            <p>{card.label}</p>
          </article>
        ))}
      </section>

      {nextClass && (
        <section className="slc-next-card" style={{ border: nextClass.status === 'active' ? '2px solid var(--primary)' : '' }}>
          <div className="slc-next-content">
            <span className="slc-eyebrow">
              {nextClass.status === 'active' ? <span style={{ color: '#EF4444', fontWeight: 'bold' }}>🔴 LIVE NOW</span> : 'Next live class'}
            </span>
            <h2>{nextClass.title || nextClass.subject || "Upcoming Session"}</h2>
            <div className="slc-next-meta">
              <span><i className="fa-solid fa-user-tie"></i>{nextClass.teacher || nextClass.instructor || "Instructor"}</span>
              <span><i className="fa-regular fa-clock"></i>{nextClass.time || "TBD"}</span>
              <span><i className="fa-solid fa-hourglass-half"></i>{nextClass.duration || "—"}</span>
            </div>
            <div className="slc-next-actions">
              <button 
                onClick={() => joinClass(nextClass)} 
                className="slc-btn slc-btn-primary" 
                type="button"
                disabled={nextClass.status !== "active" || joiningClassId === nextClass.id}
                style={{
                  opacity: nextClass.status !== 'active' || joiningClassId === nextClass.id ? 0.5 : 1,
                  cursor: nextClass.status !== 'active' || joiningClassId === nextClass.id ? 'not-allowed' : 'pointer',
                }}
              >
                {joiningClassId === nextClass.id ? "Joining..." : nextClass.status === 'active' ? 'Join Class Now' : 'Not Started Yet'}
              </button>
            </div>
          </div>
          <div className="slc-countdown">
            <span>Class scheduled for</span>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "white", marginTop: "8px" }}>
              {nextClass.date ? new Date(nextClass.date).toLocaleDateString() : "TBD"}
            </div>
          </div>
        </section>
      )}

      <section className="slc-section">
        <div className="slc-section-head">
          <div>
            <span className="slc-eyebrow">Schedule</span>
            <h2>Upcoming Classes {loading && <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--muted)" }}>Loading...</span>}</h2>
          </div>
        </div>
        {!loading && upcoming.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: "13px", padding: "20px 0" }}>No live classes scheduled yet.</p>
        )}
        <div className="slc-class-grid">
          {upcoming.map((item) => (
            <article key={item.id} className="slc-class-card">
              <div className="slc-class-main">
                <div className="slc-class-icon"><i className="fa-solid fa-video"></i></div>
                <div>
                  <h3>{item.title || item.subject || "Session"}</h3>
                  <p>{item.teacher || item.instructor || "Instructor"}</p>
                </div>
              </div>
              <div className="slc-class-meta">
                <span><i className="fa-regular fa-clock"></i>{item.date} {item.time}</span>
                <span><i className="fa-solid fa-hourglass-half"></i>{item.duration || "—"}</span>
              </div>
              <div className="slc-class-actions">
                <span className={`slc-status ${(item.status || "upcoming").toLowerCase().replace(" ", "-")}`}>{item.status || "Upcoming"}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section className="slc-section">
          <div className="slc-section-head">
            <div><span className="slc-eyebrow">History</span><h2>Past Sessions</h2></div>
          </div>
          <div className="slc-recording-grid">
            {past.map((item) => (
              <article key={item.id} className="slc-recording-card" style={{ padding: '20px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <div className="slc-recording-thumb" style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{item.title || item.subject || "Session"}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>{item.teacher || item.instructor}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--muted)', marginTop: '15px' }}>
                  <span><i className="fa-regular fa-clock" style={{ marginRight: '5px' }}></i>{item.date || "TBD"}</span>
                  <span><i className="fa-solid fa-hourglass-half" style={{ marginRight: '5px' }}></i>{item.duration || "—"}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

function StudentMeetingRoom({
  activeClass,
  leaveClass,
  openMeetingInTab,
}) {
  const meetingUrl = meetingUrlForClass(activeClass);

  return (
    <div className="slc-page" style={{ minHeight: "calc(100vh - 73px)", background: "var(--surface)" }}>
      <section className="slc-section" style={{ display: "flex", flexDirection: "column", gap: "18px", minHeight: "calc(100vh - 110px)" }}>
        <div className="slc-section-head" style={{ alignItems: "flex-start", gap: "16px" }}>
          <div>
            <span className="slc-eyebrow">Live now</span>
            <h2>{activeClass.title || "Live Class"}</h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{activeClass.course || activeClass.teacher || "Instructor"}</p>
          </div>
          <div className="slc-header-actions">
            <button
              onClick={leaveClass}
              className="slc-btn"
              type="button"
              style={{ background: "var(--muted)", color: "white", border: "none" }}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Return
            </button>
          </div>
        </div>

        <div style={{ position: "relative", flex: 1, minHeight: "560px", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", background: "#0F172A", display: "grid", placeItems: "center", padding: "24px" }}>
          <div style={{ textAlign: "center", color: "white", maxWidth: "420px" }}>
            <i className="fa-solid fa-video" style={{ fontSize: "40px", marginBottom: "16px", color: "#34D399" }}></i>
            <h3 style={{ margin: "0 0 8px" }}>{activeClass.title || "Live Class"}</h3>
            {meetingUrl ? (
              <>
                <p style={{ color: "#CBD5E1", margin: "0 0 20px", fontSize: "14px" }}>
                  Your class is on Google Meet. Click below to open it in a new tab.
                </p>
                <button onClick={() => openMeetingInTab(activeClass)} className="slc-btn slc-btn-primary" type="button">
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  Join on Google Meet
                </button>
              </>
            ) : (
              <p style={{ color: "#FCA5A5", margin: 0, fontSize: "14px" }}>
                The instructor hasn't added a Google Meet link for this class yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function meetingUrlForClass(item) {
  return item?.meetingUrl || "";
}
