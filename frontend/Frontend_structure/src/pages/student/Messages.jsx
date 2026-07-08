import { useState, useEffect, useRef, useCallback } from "react";
import {
  getConversations,
  sendMessage,
  markConversationRead,
  getContacts,
  getSession,
} from "../../services/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
function myId() {
  return getSession()?.user?.id || "";
}

// Group conversations by course; separate announcements from private threads
function groupByCourse(conversations) {
  const courseMap = {};

  conversations.forEach((conv) => {
    const key = conv.courseId || "__general__";
    const label = conv.courseName || "General";
    if (!courseMap[key]) {
      courseMap[key] = { courseId: key, courseName: label, broadcast: null, privateThread: null };
    }
    if (conv.type === "broadcast") {
      courseMap[key].broadcast = conv;
    } else {
      courseMap[key].privateThread = conv;
    }
  });

  return Object.values(courseMap);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudentMessages() {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts]           = useState([]); // teacher contacts per course
  const [active, setActive]               = useState(null);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const [error, setError]                 = useState("");
  const messagesEndRef                    = useRef(null);
  const pollRef                           = useRef(null);
  const me                                = myId();

  // ── fetch conversations ──────────────────────────────────────────────────────
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getConversations();
      const data = res.data || res || [];
      setConversations(data);
      setActive((prev) => {
        if (!prev) return null;
        return data.find((c) => c.id === prev.id) || prev;
      });
      setError("");
    } catch (err) {
      if (!silent) setError(err.message || "Could not load conversations.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ── fetch contacts (teachers per course) ────────────────────────────────────
  useEffect(() => {
    getContacts()
      .then((res) => setContacts(res.data || []))
      .catch(() => {});
  }, []);

  // ── initial load + 5s poll ──────────────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
    pollRef.current = setInterval(() => fetchConversations(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchConversations]);

  // ── scroll to bottom on new messages ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length]);

  // ── select a conversation ────────────────────────────────────────────────────
  const selectConversation = (conv) => {
    setActive(conv);
    if (conv.unread > 0) markConversationRead(conv.id).catch(() => {});
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    );
  };

  // ── open teacher private thread (create placeholder if doesn't exist) ────────
  const openPrivateThread = (contact) => {
    const existing = conversations.find(
      (c) =>
        c.type === "private" &&
        c.courseId === contact.courseId &&
        c.otherUserId === contact.userId
    );
    if (existing) {
      selectConversation(existing);
      return;
    }
    // Placeholder — real conversation created on first send
    const placeholder = {
      id: `__new__${contact.userId}_${contact.courseId}`,
      type: "private",
      courseId: contact.courseId,
      courseName: contact.courseName,
      name: contact.name,
      otherUserId: contact.userId,
      otherUserName: contact.name,
      initials: contact.initials,
      color: contact.color,
      preview: "",
      unread: 0,
      messages: [],
    };
    setConversations((prev) => [placeholder, ...prev]);
    setActive(placeholder);
  };

  // ── send a message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !active) return;
    if (active.type === "broadcast") return; // students can't post to broadcast
    setSending(true);
    setError("");
    try {
      await sendMessage({
        conversationId: active.id.startsWith("__new__") ? undefined : active.id,
        recipientId: active.otherUserId,
        courseId: active.courseId,
        text: input.trim(),
      });
      setInput("");
      await fetchConversations(true);
    } catch (err) {
      setError(err.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  // ── derived data ─────────────────────────────────────────────────────────────
  const courseGroups = groupByCourse(conversations);
  const totalUnread  = conversations.reduce((s, c) => s + (c.unread || 0), 0);

  // Build sidebar entries from contacts (courses student is enrolled in)
  // Merge with actual conversations
  const sidebarCourses = contacts.map((contact) => {
    const key = contact.courseId;
    const found = courseGroups.find((g) => g.courseId === key);
    return {
      courseId: key,
      courseName: contact.courseName,
      teacherName: contact.name,
      teacherInitials: contact.initials,
      teacherColor: contact.color,
      teacherUserId: contact.userId,
      broadcast: found?.broadcast || null,
      privateThread: found?.privateThread || null,
    };
  });

  // Also include any courses found in conversations but not in contacts
  courseGroups.forEach((g) => {
    if (!sidebarCourses.find((s) => s.courseId === g.courseId)) {
      sidebarCourses.push({
        courseId: g.courseId,
        courseName: g.courseName,
        teacherName: g.privateThread?.otherUserName || "Teacher",
        teacherInitials: g.privateThread?.initials || "T",
        teacherColor: g.privateThread?.color || "#064E3B",
        teacherUserId: g.privateThread?.otherUserId || null,
        broadcast: g.broadcast || null,
        privateThread: g.privateThread || null,
      });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page hero */}
      <div className="sd-page-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-regular fa-message" />
          Communication
        </div>
        <h2>Messages</h2>
        <p>Ask your teachers doubts, and read course announcements.</p>
      </div>

      {error && (
        <div className="sd-section-card" style={{ marginBottom: "16px", borderColor: "#FCA5A5", color: "#991B1B" }}>
          {error}
        </div>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: "300px 1fr",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)", overflow: "hidden",
        height: "calc(100vh - 260px)", minHeight: "480px",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────────── */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--dark)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <i className="fa-regular fa-comments" style={{ color: "var(--g2)" }} />
              My Conversations
              {totalUnread > 0 && (
                <span className="sd-nav-badge">{totalUnread}</span>
              )}
            </div>
            <p style={{ fontSize: "11px", color: "var(--muted)" }}>Select a thread to start chatting</p>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {loading && (
              <p style={{ textAlign: "center", color: "var(--muted)", padding: "20px", fontSize: "13px" }}>Loading...</p>
            )}

            {!loading && sidebarCourses.length === 0 && (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)" }}>
                <i className="fa-regular fa-comment-slash" style={{ fontSize: "28px", marginBottom: "10px", display: "block", opacity: 0.4 }} />
                <p style={{ fontSize: "13px" }}>Enroll in a course to start messaging your teacher.</p>
              </div>
            )}

            {sidebarCourses.map((sc) => (
              <div key={sc.courseId} style={{ marginBottom: "8px" }}>
                {/* Course label */}
                <div style={{ padding: "5px 10px 3px", fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {sc.courseName}
                </div>

                {/* Announcements thread (read-only) */}
                {sc.broadcast && (
                  <SidebarItem
                    label="Announcements"
                    sublabel={sc.broadcast.preview || "No announcements yet"}
                    time={sc.broadcast.time}
                    unread={sc.broadcast.unread}
                    isActive={active?.id === sc.broadcast.id}
                    icon="fa-solid fa-bullhorn"
                    iconBg="linear-gradient(135deg,#0F766E,#14B8A6)"
                    onClick={() => selectConversation(sc.broadcast)}
                    tag="Read-only"
                  />
                )}

                {/* Private thread with teacher */}
                <SidebarItem
                  label={`Ask ${sc.teacherName}`}
                  sublabel={sc.privateThread?.preview || "Send your first doubt"}
                  time={sc.privateThread?.time}
                  unread={sc.privateThread?.unread || 0}
                  isActive={active && (
                    active.id === sc.privateThread?.id ||
                    (active.id === `__new__${sc.teacherUserId}_${sc.courseId}`)
                  )}
                  avatarInitials={sc.teacherInitials}
                  avatarColor={sc.teacherColor}
                  onClick={() => openPrivateThread({
                    userId: sc.teacherUserId,
                    name: sc.teacherName,
                    initials: sc.teacherInitials,
                    color: sc.teacherColor,
                    courseId: sc.courseId,
                    courseName: sc.courseName,
                  })}
                  tag="Private"
                  tagColor="#D1FAE5"
                  tagTextColor="#065F46"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT CHAT PANEL ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {active ? (
            <>
              {/* Chat header */}
              <div style={{
                padding: "14px 20px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: "12px",
                background: "var(--surface)",
              }}>
                {active.type === "broadcast" ? (
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: "linear-gradient(135deg,#0F766E,#14B8A6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", flexShrink: 0,
                  }}>📢</div>
                ) : (
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: active.color || "#064E3B",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0,
                  }}>
                    {active.initials || "T"}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--dark)" }}>
                    {active.type === "broadcast"
                      ? `${active.courseName} Announcements`
                      : (active.otherUserName || active.name)}
                  </div>
                  <div style={{ fontSize: "11px", color: active.type === "broadcast" ? "#0F766E" : "var(--g2)", fontWeight: 600 }}>
                    {active.type === "broadcast"
                      ? "📢 Course announcements from your teacher"
                      : `💬 Private · ${active.courseName}`}
                  </div>
                </div>
              </div>

              {/* Read-only banner for broadcast */}
              {active.type === "broadcast" && (
                <div style={{
                  background: "linear-gradient(135deg,#EEF2FF,#E0F2FE)",
                  borderBottom: "1px solid #BFDBFE",
                  padding: "8px 20px",
                  display: "flex", alignItems: "center", gap: "8px",
                  fontSize: "12px", color: "#1E40AF", fontWeight: 600,
                }}>
                  <i className="fa-solid fa-circle-info" />
                  This is a read-only channel. Only your teacher can post here.
                </div>
              )}

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "18px 20px",
                display: "flex", flexDirection: "column", gap: "12px",
                background: "var(--surface2)",
              }}>
                {(active.messages || []).length === 0 && (
                  <div style={{ margin: "auto", textAlign: "center", color: "var(--muted)" }}>
                    <i className="fa-regular fa-comment-dots" style={{ fontSize: "36px", marginBottom: "12px", display: "block", opacity: 0.4 }} />
                    <p style={{ fontSize: "14px" }}>
                      {active.type === "broadcast"
                        ? "No announcements yet from your teacher."
                        : "No messages yet. Ask your first doubt!"}
                    </p>
                  </div>
                )}
                {(active.messages || []).map((msg, i) => {
                  const isMe = msg.senderId === me || msg.from === "me";
                  return (
                    <div key={msg.id || i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                      {!isMe && (
                        <div style={{
                          width: "26px", height: "26px", borderRadius: "8px",
                          background: active.color || "#064E3B",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", fontWeight: 700, color: "white", flexShrink: 0,
                        }}>
                          {active.initials || "T"}
                        </div>
                      )}
                      <div style={{ maxWidth: "70%" }}>
                        <div style={{
                          padding: "10px 15px",
                          borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isMe
                            ? "linear-gradient(135deg,var(--g1),var(--g2))"
                            : "var(--surface)",
                          color: isMe ? "white" : "var(--dark)",
                          fontSize: "13px", lineHeight: "1.55",
                          border: !isMe ? "1px solid var(--border)" : "none",
                          boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                        }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "3px", textAlign: isMe ? "right" : "left" }}>
                          {msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input — hidden for broadcast */}
              {active.type !== "broadcast" && (
                <div style={{
                  padding: "12px 16px", borderTop: "1px solid var(--border)",
                  display: "flex", gap: "10px", alignItems: "center",
                  background: "var(--surface)",
                }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder={`Ask ${active.otherUserName || "your teacher"} a question...`}
                    style={{
                      flex: 1, border: "1px solid var(--border)", borderRadius: "12px",
                      padding: "10px 16px", fontSize: "13px", fontFamily: "'DM Sans',sans-serif",
                      outline: "none", background: "var(--surface2)", color: "var(--dark)",
                      transition: "border-color .2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--g2)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                  />
                  <button
                    disabled={sending || !input.trim()}
                    onClick={handleSend}
                    style={{
                      background: "linear-gradient(135deg,var(--g1),var(--g2))",
                      color: "white", border: "none",
                      padding: "10px 18px", borderRadius: "12px",
                      fontWeight: 700, cursor: "pointer", fontSize: "13px",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      opacity: (!input.trim() || sending) ? 0.6 : 1,
                      transition: "opacity .2s",
                    }}
                  >
                    {sending ? "Sending..." : "Send"}
                    {!sending && <i className="fa-solid fa-paper-plane" />}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--muted)", gap: "14px" }}>
              <i className="fa-regular fa-comments" style={{ fontSize: "48px", opacity: 0.3 }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--dark)", marginBottom: "6px" }}>Select a conversation</p>
                <p style={{ fontSize: "13px" }}>Choose "Ask [Teacher]" to send a private doubt,<br />or open Announcements to read course updates.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Sidebar item sub-component ───────────────────────────────────────────────
function SidebarItem({
  label, sublabel, time, unread, isActive, onClick,
  icon, iconBg, avatarInitials, avatarColor,
  tag, tagColor, tagTextColor,
}) {
  return (
    <div
      onClick={onClick}
      className={`sd-msg-item${isActive ? " active" : ""}`}
      style={{ cursor: "pointer", borderRadius: "12px", padding: "9px 10px", marginBottom: "2px", display: "flex", alignItems: "center", gap: "10px" }}
    >
      {/* Icon or avatar */}
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px",
        background: isActive
          ? "rgba(255,255,255,.25)"
          : (iconBg || avatarColor || "#064E3B"),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: icon ? "14px" : "12px", fontWeight: 700, color: "white", flexShrink: 0,
      }}>
        {icon ? <i className={icon} style={{ color: isActive ? "white" : "white" }} /> : (avatarInitials || "T")}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "140px" }}>
            {label}
          </span>
          {time && <span style={{ fontSize: "10px", opacity: 0.7, flexShrink: 0 }}>{time}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
          {tag && (
            <span style={{
              fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "4px",
              background: isActive ? "rgba(255,255,255,.2)" : (tagColor || "#D1FAE5"),
              color: isActive ? "white" : (tagTextColor || "#065F46"),
              flexShrink: 0,
            }}>
              {tag}
            </span>
          )}
          <span style={{ fontSize: "11px", opacity: 0.7, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {sublabel}
          </span>
        </div>
      </div>

      {unread > 0 && (
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%",
          background: isActive ? "rgba(255,255,255,.9)" : "var(--g1)",
          color: isActive ? "var(--g3)" : "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "9px", fontWeight: 700, flexShrink: 0,
        }}>
          {unread}
        </div>
      )}
    </div>
  );
}
