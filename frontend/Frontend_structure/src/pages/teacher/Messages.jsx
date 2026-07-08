import { useState, useEffect, useRef, useCallback } from "react";
import {
  getConversations,
  sendMessage,
  broadcastMessage,
  markConversationRead,
  getContacts,
  getSession,
} from "../../services/api";

function myId() {
  return getSession()?.user?.id || "";
}

function groupByCourse(conversations) {
  const courseMap = {};
  conversations.forEach((conv) => {
    const key = conv.courseId || "__general__";
    const label = conv.courseName || "General";
    if (!courseMap[key]) {
      courseMap[key] = { courseId: key, courseName: label, broadcast: null, threads: [] };
    }
    if (conv.type === "broadcast") {
      courseMap[key].broadcast = conv;
    } else {
      courseMap[key].threads.push(conv);
    }
  });
  return Object.values(courseMap);
}

export default function TeacherMessages() {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts]           = useState([]);
  const [active, setActive]               = useState(null);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const [search, setSearch]               = useState("");
  const [showCompose, setShowCompose]     = useState(false);
  const messagesEndRef                    = useRef(null);
  const pollRef                           = useRef(null);
  const me                                = myId();

  const isBroadcast = active?.type === "broadcast";

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
    } catch (_) {}
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    getContacts().then((res) => setContacts(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchConversations();
    pollRef.current = setInterval(() => fetchConversations(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length]);

  const selectConversation = (conv) => {
    setActive(conv);
    setInput("");
    if (conv.unread > 0) markConversationRead(conv.id).catch(() => {});
    setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)));
  };

  const startConversation = (student, courseId, courseName) => {
    setShowCompose(false);
    const existing = conversations.find(
      (c) => c.type === "private" && c.courseId === courseId && c.otherUserId === student.userId
    );
    if (existing) { selectConversation(existing); return; }
    const placeholder = {
      id: `__new__${student.userId}_${courseId}`,
      type: "private", courseId, courseName,
      name: student.name, otherUserId: student.userId, otherUserName: student.name,
      initials: student.initials, color: student.color,
      preview: "", unread: 0, messages: [],
    };
    setConversations((prev) => [placeholder, ...prev]);
    setActive(placeholder);
  };

  const openBroadcast = (courseId, courseName, existingBroadcast) => {
    setShowCompose(false);
    setInput("");
    if (existingBroadcast) {
      selectConversation(existingBroadcast);
    } else {
      const placeholder = {
        id: `__bc__${courseId}`, type: "broadcast", courseId, courseName,
        name: `📢 ${courseName}`, initials: "📢", color: "#D97706",
        preview: "", unread: 0, messages: [],
      };
      setActive(placeholder);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !active) return;
    setSending(true);
    try {
      if (isBroadcast) {
        await broadcastMessage({ courseId: active.courseId, text: input.trim() });
      } else {
        await sendMessage({
          conversationId: active.id.startsWith("__new__") ? undefined : active.id,
          recipientId: active.otherUserId,
          courseId: active.courseId,
          text: input.trim(),
        });
      }
      setInput("");
      await fetchConversations(true);
    } catch (e) {
      alert("Failed to send: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const courseGroups = groupByCourse(conversations);
  const totalUnread  = conversations.reduce((s, c) => s + (c.unread || 0), 0);
  const filteredGroups = search.trim()
    ? courseGroups.map((g) => ({
        ...g,
        threads: g.threads.filter((t) => (t.name || "").toLowerCase().includes(search.toLowerCase())),
      })).filter((g) => g.threads.length > 0 || g.broadcast)
    : courseGroups;

  // ── Theme based on chat type ──────────────────────────────────────────────
  const theme = isBroadcast
    ? {
        headerBg:   "linear-gradient(135deg,#92400E,#D97706)",
        headerText: "white",
        areaBg:     "#FFFBEB",
        bubbleMeBg: "linear-gradient(135deg,#D97706,#F59E0B)",
        bubbleMeText: "white",
        bubbleThemBg:  "#FEF3C7",
        bubbleThemText: "#78350F",
        bubbleThemBorder: "#FDE68A",
        inputBorder: "#F59E0B",
        inputFocus:  "#D97706",
        btnBg:       "linear-gradient(135deg,#D97706,#F59E0B)",
        icon:        "fa-solid fa-bullhorn",
        badgeBg:     "#FEF3C7",
        badgeText:   "#92400E",
        badgeLabel:  "📢 Broadcast",
      }
    : {
        headerBg:   "linear-gradient(135deg,#1E40AF,#3B82F6)",
        headerText: "white",
        areaBg:     "#F0F9FF",
        bubbleMeBg: "linear-gradient(135deg,#1E40AF,#3B82F6)",
        bubbleMeText: "white",
        bubbleThemBg:  "#FFFFFF",
        bubbleThemText: "var(--dark)",
        bubbleThemBorder: "#E5E7EB",
        inputBorder: "#3B82F6",
        inputFocus:  "#1E40AF",
        btnBg:       "linear-gradient(135deg,#1E40AF,#3B82F6)",
        icon:        "fa-solid fa-lock",
        badgeBg:     "#DBEAFE",
        badgeText:   "#1E3A8A",
        badgeLabel:  "🔒 Private",
      };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 73px)", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <div style={{ width: "300px", flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--dark)", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fa-regular fa-message" style={{ color: "var(--g2)" }} />
              Messages
              {totalUnread > 0 && <span className="nav-badge">{totalUnread}</span>}
            </h3>
            <button onClick={() => setShowCompose(!showCompose)} className="icon-btn" title="Compose">
              <i className="fa-solid fa-pen-to-square" />
            </button>
          </div>
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--muted)", fontSize: "13px" }} />
            <input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Legend */}
        <div style={{ padding: "8px 14px", background: "var(--surface2)", borderBottom: "1px solid var(--border)", display: "flex", gap: "10px" }}>
          <span style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: "#1E40AF", fontWeight: 600 }}>
            <i className="fa-solid fa-lock" style={{ fontSize: "10px" }} /> Private
          </span>
          <span style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: "#92400E", fontWeight: 600 }}>
            <i className="fa-solid fa-bullhorn" style={{ fontSize: "10px" }} /> Broadcast
          </span>
        </div>

        {/* Compose panel */}
        {showCompose && (
          <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)", maxHeight: "260px", overflowY: "auto" }}>
            <div style={{ padding: "8px 14px 4px", fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Start a conversation
            </div>
            {contacts.map((group) => (
              <div key={group.courseId}>
                <div style={{ padding: "5px 14px 2px", fontSize: "11px", fontWeight: 700, color: "var(--g3)", background: "var(--g-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{group.courseName}</span>
                  <button
                    onClick={() => openBroadcast(group.courseId, group.courseName, conversations.find((c) => c.type === "broadcast" && c.courseId === group.courseId) || null)}
                    style={{ fontSize: "10px", background: "linear-gradient(135deg,#D97706,#F59E0B)", color: "white", border: "none", borderRadius: "6px", padding: "2px 7px", cursor: "pointer", fontWeight: 600 }}
                  >
                    📢 Broadcast All
                  </button>
                </div>
                {group.students.map((s) => (
                  <div key={s.userId} onClick={() => startConversation(s, group.courseId, group.courseName)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 14px", cursor: "pointer" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#DBEAFE"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white", flexShrink: 0 }}>{s.initials}</div>
                    <span style={{ fontSize: "13px", color: "var(--dark)" }}>{s.name}</span>
                    <span style={{ fontSize: "10px", color: "#1E40AF", marginLeft: "auto", fontWeight: 600 }}>🔒 Private</span>
                  </div>
                ))}
              </div>
            ))}
            {contacts.length === 0 && <div style={{ padding: "12px 14px", color: "var(--muted)", fontSize: "13px" }}>No students found.</div>}
          </div>
        )}

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {loading && <p style={{ textAlign: "center", color: "var(--muted)", padding: "20px", fontSize: "13px" }}>Loading...</p>}
          {!loading && filteredGroups.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: "20px", fontSize: "13px" }}>No conversations yet.<br />Click ✏️ to start one.</p>
          )}

          {filteredGroups.map((group) => (
            <div key={group.courseId} style={{ marginBottom: "8px" }}>
              <div style={{ padding: "5px 10px 2px", fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {group.courseName}
              </div>

              {/* Broadcast item — amber styling */}
              {group.broadcast && (
                <SidebarItem
                  conv={group.broadcast}
                  isActive={active?.id === group.broadcast.id}
                  onClick={() => selectConversation(group.broadcast)}
                  accentColor="#D97706"
                  activeBg="linear-gradient(135deg,#92400E,#D97706)"
                  icon="fa-solid fa-bullhorn"
                  tagLabel="Broadcast"
                  tagBg="#FEF3C7" tagText="#92400E"
                />
              )}

              {/* Private threads — blue styling */}
              {group.threads.map((conv) => (
                <SidebarItem
                  key={conv.id}
                  conv={conv}
                  isActive={active?.id === conv.id}
                  onClick={() => selectConversation(conv)}
                  accentColor="#3B82F6"
                  activeBg="linear-gradient(135deg,#1E40AF,#3B82F6)"
                  icon={null}
                  tagLabel="Private"
                  tagBg="#DBEAFE" tagText="#1E3A8A"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── CHAT PANEL ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {active ? (
          <>
            {/* Header — colored by type */}
            <div style={{
              padding: "14px 24px", background: theme.headerBg,
              display: "flex", alignItems: "center", gap: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,.15)",
            }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: "rgba(255,255,255,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isBroadcast ? "20px" : "14px", fontWeight: 700, color: "white", flexShrink: 0,
              }}>
                {isBroadcast ? "📢" : (active.initials || "?")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "white" }}>
                  {isBroadcast ? `${active.courseName} — All Students` : (active.otherUserName || active.name)}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,.8)", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <i className={theme.icon} style={{ fontSize: "10px" }} />
                  {isBroadcast ? "Broadcast · all enrolled students will see this" : `Private · ${active.courseName || "Direct message"}`}
                </div>
              </div>
              <div style={{
                padding: "5px 14px", borderRadius: "20px",
                background: theme.badgeBg, color: theme.badgeText,
                fontSize: "12px", fontWeight: 700,
              }}>
                {theme.badgeLabel}
              </div>
            </div>

            {/* Broadcast info bar */}
            {isBroadcast && (
              <div style={{
                background: "#FEF9C3", borderBottom: "1px solid #FDE68A",
                padding: "8px 24px", fontSize: "12px", color: "#78350F", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <i className="fa-solid fa-circle-info" />
                This message will be delivered to ALL students enrolled in <strong>{active.courseName}</strong>.
              </div>
            )}

            {/* Messages area */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: isBroadcast ? "24px" : "18px 24px",
              background: theme.areaBg,
              display: "flex", flexDirection: "column",
              gap: isBroadcast ? "16px" : "12px",
            }}>
              {(active.messages || []).length === 0 && (
                <div style={{ margin: "auto", textAlign: "center", color: "var(--muted)" }}>
                  <i className={`${theme.icon}`} style={{ fontSize: "40px", marginBottom: "14px", display: "block", opacity: 0.25, color: isBroadcast ? "#D97706" : "#3B82F6" }} />
                  <p style={{ fontSize: "14px", color: isBroadcast ? "#92400E" : "#1E40AF", fontWeight: 600 }}>
                    {isBroadcast ? "No announcements posted yet." : "No messages yet."}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                    {isBroadcast ? "Type below to post an announcement to all students." : "Start the conversation below."}
                  </p>
                </div>
              )}

              {(active.messages || []).map((msg, i) => {
                const isMe = msg.senderId === me || msg.from === "me";

                // Broadcast messages — announcement card style
                if (isBroadcast) {
                  return (
                    <div key={msg.id || i} style={{
                      background: "white",
                      border: "1.5px solid #FDE68A",
                      borderLeft: "4px solid #D97706",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      boxShadow: "0 2px 8px rgba(217,119,6,.1)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#D97706,#F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>📢</div>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E" }}>Course Announcement</div>
                          <div style={{ fontSize: "10px", color: "#B45309" }}>{msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")}</div>
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: "10px", background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>To All Students</div>
                      </div>
                      <p style={{ fontSize: "13px", color: "#1C1917", lineHeight: "1.6", margin: 0 }}>{msg.text}</p>
                    </div>
                  );
                }

                // Private messages — chat bubble style
                return (
                  <div key={msg.id || i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                    {!isMe && (
                      <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: active.color || "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white", flexShrink: 0 }}>
                        {active.initials || "?"}
                      </div>
                    )}
                    <div style={{ maxWidth: "65%" }}>
                      <div style={{
                        padding: "10px 15px",
                        borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: isMe ? theme.bubbleMeBg : theme.bubbleThemBg,
                        color: isMe ? theme.bubbleMeText : theme.bubbleThemText,
                        fontSize: "13px", lineHeight: "1.55",
                        border: !isMe ? `1px solid ${theme.bubbleThemBorder}` : "none",
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

            {/* Input bar — styled by type */}
            <div style={{
              padding: "14px 24px",
              background: isBroadcast ? "#FFFBEB" : "var(--surface)",
              borderTop: `2px solid ${isBroadcast ? "#FDE68A" : "#DBEAFE"}`,
              display: "flex", gap: "10px", alignItems: "center",
            }}>
              <input
                style={{
                  flex: 1, border: `1.5px solid ${isBroadcast ? "#FDE68A" : "#BFDBFE"}`,
                  borderRadius: "12px", padding: "11px 16px", fontSize: "13px",
                  fontFamily: "'DM Sans',sans-serif", outline: "none",
                  background: isBroadcast ? "#FFFDE7" : "#EFF6FF",
                  color: isBroadcast ? "#78350F" : "#1E3A8A",
                  transition: "border-color .2s",
                }}
                placeholder={isBroadcast ? "Type an announcement for all students..." : `Message ${active.otherUserName || active.name || ""}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                onFocus={(e) => e.target.style.borderColor = isBroadcast ? "#D97706" : "#3B82F6"}
                onBlur={(e) => e.target.style.borderColor = isBroadcast ? "#FDE68A" : "#BFDBFE"}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{
                  background: theme.btnBg, color: "white", border: "none",
                  padding: "11px 20px", borderRadius: "12px", fontWeight: 700,
                  cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "7px",
                  opacity: (!input.trim() || sending) ? 0.6 : 1,
                  whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(0,0,0,.15)",
                  transition: "opacity .2s, transform .15s",
                }}
                onMouseEnter={(e) => { if (input.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                {sending ? "Sending..." : (isBroadcast ? "📢 Broadcast" : "Send")}
                {!sending && <i className={isBroadcast ? "fa-solid fa-bullhorn" : "fa-solid fa-paper-plane"} />}
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--muted)", gap: "20px", background: "var(--surface2)" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg,#1E40AF,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", boxShadow: "0 4px 16px rgba(30,64,175,.3)" }}>
                  <i className="fa-solid fa-lock" style={{ color: "white", fontSize: "22px" }} />
                </div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#1E40AF" }}>Private Chat</p>
                <p style={{ fontSize: "11px", color: "var(--muted)" }}>1-to-1 with a student</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg,#92400E,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", boxShadow: "0 4px 16px rgba(217,119,6,.3)" }}>
                  <i className="fa-solid fa-bullhorn" style={{ color: "white", fontSize: "22px" }} />
                </div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#92400E" }}>Broadcast</p>
                <p style={{ fontSize: "11px", color: "var(--muted)" }}>Post to all students</p>
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>Select a conversation or click ✏️ to compose</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarItem({ conv, isActive, onClick, accentColor, activeBg, icon, tagLabel, tagBg, tagText }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 10px", borderRadius: "12px", cursor: "pointer",
        background: isActive ? activeBg : "transparent",
        transition: "all .15s", marginBottom: "2px",
        borderLeft: isActive ? "none" : `3px solid transparent`,
      }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = accentColor === "#D97706" ? "#FEF9C3" : "#DBEAFE"; e.currentTarget.style.borderLeftColor = accentColor; } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; } }}
    >
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
        background: isActive ? "rgba(255,255,255,.25)" : (conv.color || accentColor),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: icon ? "14px" : "12px", fontWeight: 700, color: "white",
      }}>
        {icon ? <i className={icon} /> : (conv.initials || "?")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: isActive ? "white" : "var(--dark)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "120px" }}>
            {conv.otherUserName || conv.name || "Unknown"}
          </span>
          <span style={{ fontSize: "10px", color: isActive ? "rgba(255,255,255,.7)" : "var(--muted)", flexShrink: 0 }}>{conv.time}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "4px", background: isActive ? "rgba(255,255,255,.2)" : tagBg, color: isActive ? "white" : tagText, flexShrink: 0 }}>
            {tagLabel}
          </span>
          <span style={{ fontSize: "11px", color: isActive ? "rgba(255,255,255,.7)" : "var(--muted)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {conv.preview || "No messages yet"}
          </span>
        </div>
      </div>
      {conv.unread > 0 && (
        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: isActive ? "rgba(255,255,255,.9)" : accentColor, color: isActive ? (accentColor === "#D97706" ? "#92400E" : "#1E3A8A") : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, flexShrink: 0 }}>
          {conv.unread}
        </div>
      )}
    </div>
  );
}
