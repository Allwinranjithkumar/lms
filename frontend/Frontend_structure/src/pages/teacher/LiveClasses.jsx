import { useState, useEffect, useRef } from "react";
import { getLiveClasses, createLiveClass, startLiveClass, endLiveClass, getTeacherCourses } from "../../services/api";

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState(null); // The class currently being hosted
  const meetingTabRef = useRef(null);

  // Default course selection will be the first one once loaded
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    duration: 60,
    desc: "",
    meetingUrl: "",
  });

  const fetchClasses = (silent = false) => {
    if (!silent) setLoading(true);
    return getLiveClasses()
      .then(res => {
        const classList = res.data || res || [];
        setClasses(classList);
        return classList;
      })
      .catch(() => [])
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  const fetchCourses = () => {
    getTeacherCourses().then(res => {
      const courseList = res.data || [];
      setCourses(courseList);
      if (courseList.length > 0 && !formData.courseId) {
        setFormData(prev => ({ ...prev, courseId: courseList[0].id }));
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!activeClass?.id) return undefined;

    const interval = setInterval(() => {
      fetchClasses(true).then((classList) => {
        const latest = classList.find((item) => item.id === activeClass.id);
        if (!latest || latest.status === "completed") {
          setActiveClass(null);
          return;
        }
        setActiveClass(latest);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeClass?.id]);

  const handleSchedule = async (e, instant = false) => {
    if (e) e.preventDefault();
    if (!formData.courseId && courses.length > 0) {
      formData.courseId = courses[0].id;
    }
    
    try {
      const payload = {
        title: formData.title || (instant ? "Instant Class" : "Untitled"),
        courseId: formData.courseId,
        date: instant ? new Date().toISOString().split('T')[0] : formData.date,
        time: instant ? new Date().toTimeString().slice(0, 5) : formData.time,
        duration: `${formData.duration} min`,
        description: formData.desc,
        status: instant ? "active" : "scheduled",
        meetingUrl: instant ? "" : formData.meetingUrl,
      };

      const res = await createLiveClass(payload);
      
      if (instant) {
        setActiveClass(res.data);
      } else {
        alert("Class scheduled successfully!");
      }
      fetchClasses();
    } catch (err) {
      alert("Error creating class: " + (err.message || "Failed"));
    }
  };

  const startInstantClass = () => {
    handleSchedule(null, true);
  };

  const startScheduledClass = async (cls) => {
    try {
      const res = cls.status === "active" ? { data: cls } : await startLiveClass(cls.id);
      setActiveClass(res.data || cls);
      fetchClasses(true);
    } catch (err) {
      alert("Failed to start class: " + (err.message || "Failed"));
    }
  };

  const handleEndClass = async (id) => {
    try {
      await endLiveClass(id);
      setActiveClass(null);
      if (meetingTabRef.current && !meetingTabRef.current.closed) {
        meetingTabRef.current.close();
        meetingTabRef.current = null;
      }
      fetchClasses();
    } catch (err) {
      alert("Failed to end class: " + err.message);
    }
  };

  const returnToMeetingList = () => {
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
      <TeacherMeetingRoom
        activeClass={activeClass}
        fetchClasses={fetchClasses}
        onEndClass={handleEndClass}
        onReturn={returnToMeetingList}
        openMeetingInTab={(meeting) => {
          const url = meetingUrlForClass(meeting);
          if (url) meetingTabRef.current = window.open(url, "_blank", "noopener,noreferrer");
        }}
      />
    );
  }

  // Normal Dashboard View
  const todayClasses = classes.filter((item) => {
    if (item.status === "completed") return false;
    const date = getClassDate(item);
    return date && date.toDateString() === new Date().toDateString();
  });
  
  const upcomingClasses = classes.filter((item) => {
    if (item.status === "completed" || item.status === "active") return false;
    const date = getClassDate(item);
    return date && date > new Date();
  });
  
  const activeCount = classes.filter(c => c.status === "active").length;
  const completedCount = classes.filter(c => c.status === "completed").length;
  const totalStudents = classes.reduce((sum, c) => sum + (c.enrolledCount ?? c.studentIds?.length ?? 0), 0);

  return (
    <div className="lc-page">
      <section className="lc-header">
        <div>
          <span className="lc-eyebrow">Virtual live classroom</span>
          <h1>Live Classes</h1>
          <p>Schedule, manage, and host virtual classrooms with Google Meet.</p>
        </div>
        <div className="lc-header-actions">
          <button onClick={startInstantClass} className="lc-btn lc-btn-primary" type="button" disabled={courses.length === 0}>
            <i className="fa-solid fa-bolt"></i>
            Start Instant Class
          </button>
        </div>
      </section>

      <section className="lc-overview-grid">
        {[
          { icon: "fa-solid fa-video", value: todayClasses.length + activeCount, label: "Today's Classes", trend: "Scheduled" },
          { icon: "fa-solid fa-calendar-days", value: upcomingClasses.length, label: "Upcoming Classes", trend: "Next 7 days" },
          { icon: "fa-solid fa-users", value: totalStudents, label: "Total Enrollments", trend: "Across classes" },
          { icon: "fa-solid fa-calendar-check", value: completedCount, label: "Completed Sessions", trend: "Historical" },
        ].map((card) => (
          <article key={card.label} className="lc-overview-card">
            <div className="lc-card-top">
              <div className="lc-card-icon">
                <i className={card.icon}></i>
              </div>
              <span>{card.trend}</span>
            </div>
            <strong>{card.value}</strong>
            <p>{card.label}</p>
          </article>
        ))}
      </section>

      <section className="lc-section">
        <div className="lc-section-head">
          <div>
            <span className="lc-eyebrow">Today</span>
            <h2>Today's Live Classes</h2>
          </div>
        </div>
        <div className="lc-class-grid">
          {!loading && todayClasses.length === 0 && <p className="sd-empty">No classes scheduled for today.</p>}
          {todayClasses.map((item) => (
            <article key={item.id} className="lc-class-card" style={{ border: item.status === 'active' ? '2px solid var(--primary)' : '' }}>
              <div className="lc-class-main">
                <div className="lc-class-badge" style={{ background: item.status === 'active' ? '#FEE2E2' : '', color: item.status === 'active' ? '#EF4444' : '' }}>
                  <i className="fa-solid fa-video"></i>
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.course}</p>
                </div>
              </div>
              <div className="lc-class-meta">
                <span><i className="fa-regular fa-clock"></i>{formatClassTime(item)}</span>
                <span><i className="fa-solid fa-hourglass-half"></i>{formatClassDuration(item)}</span>
                <span><i className="fa-solid fa-users"></i>{item.enrolledCount ?? item.studentIds?.length ?? 0} enrolled</span>
                <span><i className="fa-solid fa-user-check"></i>{item.attendeeCount ?? 0} joined</span>
              </div>
              <div className="lc-class-actions">
                <span className={`lc-status ${(item.status || 'scheduled').toLowerCase()}`}>
                  {item.status === 'active' ? '🔴 LIVE NOW' : (item.status || "Scheduled")}
                </span>
                <button onClick={() => startScheduledClass(item)} className="lc-btn lc-btn-primary" type="button">
                  {item.status === 'active' ? 'Join Class' : 'Start Class'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lc-split-grid">
        <form className="lc-section lc-schedule-card" onSubmit={handleSchedule}>
          <div className="lc-section-head">
            <div>
              <span className="lc-eyebrow">Planner</span>
              <h2>Schedule Class</h2>
            </div>
          </div>
          <div className="lc-form-grid">
            <label>
              <span>Class Title</span>
              <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Advanced AI Revision Session" required />
            </label>
            <label>
              <span>Select Course</span>
              <select value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} required>
                {courses.length === 0 && <option value="">No courses available</option>}
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </label>
            <label>
              <span>Start Time</span>
              <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
            </label>
            <label>
              <span>Duration (min)</span>
              <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
            </label>
            <label className="lc-full">
              <span>Description</span>
              <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Review concepts..." />
            </label>
            <div className="lc-full" style={{ display: "grid", gap: "10px" }}>
              <button
                type="button"
                className="lc-btn"
                onClick={() => window.open(googleCalendarUrl(formData), "_blank", "noopener,noreferrer")}
              >
                <i className="fa-solid fa-calendar-plus"></i>
                Create Google Meet in Calendar
              </button>
              <label>
                <span>Google Meet or Calendar link</span>
                <input
                  value={formData.meetingUrl}
                  onChange={e => setFormData({ ...formData, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
              </label>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                Click the button, add “Google Meet” to the event in Google Calendar and save, then paste the link back into the field above — either the meet.google.com link or the Google Calendar event link works.
              </p>
            </div>
          </div>
          <button className="lc-btn lc-btn-primary lc-create-btn" type="submit" disabled={courses.length === 0}>
            Create Schedule
          </button>
        </form>

        <section className="lc-section">
          <div className="lc-section-head">
            <div>
              <span className="lc-eyebrow">Next up</span>
              <h2>Upcoming Classes</h2>
            </div>
          </div>
          <div className="lc-upcoming-list">
            {!loading && upcomingClasses.length === 0 && <p className="sd-empty">No upcoming classes.</p>}
            {upcomingClasses.map((item) => (
              <article key={item.id} className="lc-upcoming-item">
                <div className="lc-date-pill">
                  <strong>{formatClassDate(item)}</strong>
                  <span>{formatClassTime(item)}</span>
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.enrolledCount ?? item.studentIds?.length ?? 0} students enrolled</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="lc-section">
          <div className="lc-section-head">
            <div>
              <span className="lc-eyebrow">History</span>
              <h2>Past Sessions</h2>
            </div>
          </div>
          <div className="lc-recording-grid">
            {classes.filter(c => c.status === "completed").length === 0 && <p className="sd-empty">No past sessions.</p>}
            {classes.filter(c => c.status === "completed").map((item) => (
              <article key={item.id} className="lc-recording-card" style={{ padding: '20px', background: 'var(--surface)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <div className="lc-recording-thumb" style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{item.title}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>{item.course}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--muted)', marginTop: '15px' }}>
                  <span><i className="fa-regular fa-clock" style={{ marginRight: '5px' }}></i>{formatClassDate(item)}</span>
                  <span><i className="fa-solid fa-users" style={{ marginRight: '5px' }}></i>{item.attendeeCount ?? item.joinedStudents?.length ?? 0} attended</span>
                </div>
              </article>
            ))}
          </div>
        </section>
    </div>
  );
}

function TeacherMeetingRoom({
  activeClass,
  onEndClass,
  onReturn,
  openMeetingInTab,
}) {
  const joinedStudents = activeClass.joinedStudents || [];
  const enrolledCount = activeClass.enrolledCount ?? activeClass.studentIds?.length ?? 0;
  const meetingUrl = meetingUrlForClass(activeClass);

  return (
    <div className="lc-page" style={{ minHeight: "calc(100vh - 73px)", background: "var(--surface)" }}>
      <section className="lc-section" style={{ display: "flex", flexDirection: "column", gap: "18px", minHeight: "calc(100vh - 110px)" }}>
        <div className="lc-section-head" style={{ alignItems: "flex-start", gap: "16px" }}>
          <div>
            <span className="lc-eyebrow">Live now</span>
            <h2>{activeClass.title}</h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{activeClass.course}</p>
          </div>
          <div className="lc-header-actions">
            <button onClick={() => openMeetingInTab(activeClass)} className="lc-btn" type="button">
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              Open in Tab
            </button>
            <button
              onClick={onReturn}
              className="lc-btn"
              type="button"
              style={{ background: "var(--muted)", color: "white", border: "none" }}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Return
            </button>
            <button
              onClick={() => onEndClass(activeClass.id)}
              className="lc-btn"
              type="button"
              style={{ background: "#EF4444", color: "white", border: "none" }}
            >
              <i className="fa-solid fa-phone-slash"></i>
              End Class
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: "18px", flex: 1, minHeight: 0 }}>
          <div style={{ position: "relative", minHeight: "560px", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", background: "#0F172A", display: "grid", placeItems: "center", padding: "24px" }}>
            <div style={{ textAlign: "center", color: "white", maxWidth: "420px" }}>
              <i className="fa-solid fa-video" style={{ fontSize: "40px", marginBottom: "16px", color: "#34D399" }}></i>
              <h3 style={{ margin: "0 0 8px" }}>{activeClass.title}</h3>
              {meetingUrl ? (
                <>
                  <p style={{ color: "#CBD5E1", margin: "0 0 20px", fontSize: "14px" }}>
                    Google Meet opens in a new tab. Students who join see the same link.
                  </p>
                  <button onClick={() => openMeetingInTab(activeClass)} className="lc-btn lc-btn-primary" type="button">
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    Join on Google Meet
                  </button>
                </>
              ) : (
                <p style={{ color: "#FCA5A5", margin: 0, fontSize: "14px" }}>
                  No Google Meet link was set for this class. Edit the class and add a meet.google.com link.
                </p>
              )}
            </div>
          </div>

          <aside style={{ border: "1px solid var(--border)", borderRadius: "14px", background: "var(--background)", padding: "18px", overflow: "auto" }}>
            <span className="lc-eyebrow">Attendance</span>
            <h3 style={{ margin: "8px 0 6px", color: "var(--dark)" }}>Joined Students</h3>
            <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: "13px" }}>
              {joinedStudents.length} joined of {enrolledCount} enrolled
            </p>
            {joinedStudents.length === 0 ? (
              <p className="sd-empty" style={{ margin: 0 }}>No students have joined yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {joinedStudents.map((student) => (
                  <div key={student.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid var(--border)", borderRadius: "10px", background: "var(--surface)" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#DCFCE7", color: "#166534", fontWeight: 800 }}>
                      {initialsForName(student.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ display: "block", color: "var(--dark)", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.name}</strong>
                      <span style={{ color: "var(--muted)", fontSize: "12px" }}>Present</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

// Builds a Google Calendar "create event" link pre-filled from the schedule
// form. Opening it lets the teacher add a Google Meet to the event and save;
// they then paste the resulting meet.google.com link back into the form.
function googleCalendarUrl({ title, date, time, duration, desc } = {}) {
  const params = new URLSearchParams({ action: "TEMPLATE" });
  if (title) params.set("text", title);
  if (desc) params.set("details", desc);
  const start = date && time ? new Date(`${date}T${time}`) : null;
  if (start && !Number.isNaN(start.valueOf())) {
    const minutes = Number(duration) || 60;
    const end = new Date(start.getTime() + minutes * 60000);
    params.set("dates", `${toCalendarStamp(start)}/${toCalendarStamp(end)}`);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toCalendarStamp(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function meetingUrlForClass(item) {
  return item?.meetingUrl || "";
}

function initialsForName(name) {
  return String(name || "Student")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "ST";
}

function getClassDate(item) {
  const raw = item.scheduledAt || item.scheduledFor || (item.date && `${item.date}T${to24HourTime(item.time) || "00:00"}:00`);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function formatClassDate(item) {
  const date = getClassDate(item);
  return date ? date.toLocaleDateString([], { month: "short", day: "numeric" }) : "TBD";
}

function formatClassTime(item) {
  const date = getClassDate(item);
  if (date) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return item.time || "TBD";
}

function formatClassDuration(item) {
  const duration = String(item.duration || item.durationMinutes || "60 min");
  return /\bmin\b/i.test(duration) ? duration : `${duration} min`;
}

function to24HourTime(value) {
  const raw = String(value || "").trim();
  const simple = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (simple) return `${simple[1].padStart(2, "0")}:${simple[2]}`;

  const meridian = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!meridian) return "";

  let hour = Number(meridian[1]);
  const minute = meridian[2] || "00";
  const period = meridian[3].toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}
