import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { getMe, updateProfile } from "../../services/api";

const preferences = [
  ["gradingAssist", "AI Grading Suggestions", "Show rubric-based AI suggestions while reviewing"],
  ["autoPublish", "Auto-Publish Materials", "Publish uploaded resources to enrolled students"],
  ["studentInsights", "Student Risk Insights", "Highlight students who may need attention"],
  ["weeklyDigest", "Weekly Teaching Digest", "Send a weekly course performance summary"],
];

const notifications = [
  ["emailNotifs", "Email Notifications", "Course, submission, and platform updates"],
  ["messageAlerts", "Message Alerts", "Notify when students send direct messages"],
  ["reviewReminders", "Review Reminders", "Remind me about pending assignment reviews"],
  ["liveClassAlerts", "Live Class Alerts", "Alert before scheduled classes begin"],
];

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useOutletContext();
  const [profile, setProfile] = useState({ name: "", email: "", department: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const [toggles, setToggles] = useState({
    gradingAssist: true,
    autoPublish: false,
    studentInsights: true,
    weeklyDigest: true,
    emailNotifs: true,
    messageAlerts: true,
    reviewReminders: true,
    liveClassAlerts: true,
    twoFA: false,
    darkMode: false,
  });

  useEffect(() => {
    getMe()
      .then((d) => {
        const u = d.user || d.data?.user || d.data || d;
        setProfile({
          name: u.name || "",
          email: u.email || "",
          department: u.profile?.institution || u.profile?.college || u.department || u.college || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => setToggles((c) => ({ ...c, [key]: !c[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: profile.name, profile: { institution: profile.department } });
      setToast("Profile saved!");
    } catch (err) {
      setToast(err.message || "Save failed.");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "JP";

  return (
    <div className="content">
      {toast && (
        <div style={{ position: "fixed", top: "80px", right: "24px", background: "var(--g1)", color: "white", padding: "12px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
          {toast}
        </div>
      )}

      <div className="hero" style={{ marginBottom: "24px" }}>
        <div>
          <div className="hero-tag">Settings</div>
          <h2>Manage Your Teaching Workspace</h2>
          <p>Update your profile, notification preferences, security controls, and course defaults from one place.</p>
        </div>
        <div className="hero-visual">
          <div className="float-card">
            <div className="float-icon" style={{ background: "rgba(0,200,83,.25)" }}>{initials}</div>
            <div className="float-info">
              <div className="val">4.9</div>
              <div className="lbl">Instructor Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2-eq">
        {/* Profile */}
        <section className="section-card">
          <div className="sec-header">
            <div className="sec-title">Profile</div>
            <span className="sec-badge">Instructor</span>
          </div>
          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: "13px" }}>Loading profile...</p>
          ) : (
            <>
              <label className="settings-field">
                <span>Full Name</span>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </label>
              <label className="settings-field">
                <span>Email</span>
                <input value={profile.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
              </label>
              <label className="settings-field">
                <span>Department / College</span>
                <input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
              </label>
              <button className="btn-primary" type="button" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </section>

        {/* Notifications */}
        <section className="section-card">
          <div className="sec-header">
            <div className="sec-title">Notifications</div>
            <span className="sec-badge">{Object.values(toggles).filter(Boolean).length} enabled</span>
          </div>
          {notifications.map(([key, label, sub]) => (
            <div key={key} className="teacher-setting-row">
              <div>
                <div className="teacher-setting-label">{label}</div>
                <div className="teacher-setting-sub">{sub}</div>
              </div>
              <button
                className={`teacher-toggle${toggles[key] ? " on" : ""}`}
                type="button"
                onClick={() => toggle(key)}
                aria-label={`Toggle ${label}`}
              />
            </div>
          ))}
        </section>

        {/* Security */}
        <section className="section-card">
          <div className="sec-header">
            <div className="sec-title">Security</div>
            <span className="sec-badge">Account</span>
          </div>
          {[
            ["twoFA", "Two-Factor Authentication", "Require a verification code when signing in"],
            ["darkMode", "Dark Mode Preference", "Remember dark mode for this device"],
          ].map(([key, label, sub]) => {
            const isActive = key === "darkMode" ? isDarkMode : toggles[key];
            const onToggle = key === "darkMode" ? toggleDarkMode : () => toggle(key);
            return (
              <div key={key} className="teacher-setting-row">
                <div>
                  <div className="teacher-setting-label">{label}</div>
                  <div className="teacher-setting-sub">{sub}</div>
                </div>
                <button
                  className={`teacher-toggle${isActive ? " on" : ""}`}
                  type="button"
                  onClick={onToggle}
                  aria-label={`Toggle ${label}`}
                />
              </div>
            );
          })}
          <label className="settings-field">
            <span>Current Password</span>
            <input type="password" placeholder="Current password" />
          </label>
          <label className="settings-field">
            <span>New Password</span>
            <input type="password" placeholder="New password" />
          </label>
          <button onClick={() => alert("Password updated successfully!")} className="btn-primary" type="button">Update Password</button>
        </section>

        {/* Teaching Preferences */}
        <section className="section-card">
          <div className="sec-header">
            <div className="sec-title">Teaching Preferences</div>
            <span className="sec-badge">AI ready</span>
          </div>
          {preferences.map(([key, label, sub]) => (
            <div key={key} className="teacher-setting-row">
              <div>
                <div className="teacher-setting-label">{label}</div>
                <div className="teacher-setting-sub">{sub}</div>
              </div>
              <button
                className={`teacher-toggle${toggles[key] ? " on" : ""}`}
                type="button"
                onClick={() => toggle(key)}
                aria-label={`Toggle ${label}`}
              />
            </div>
          ))}
        </section>

        {/* Account Summary */}
        <section className="section-card">
          <div className="sec-header">
            <div className="sec-title">Account Summary</div>
            <button onClick={() => alert("Exporting data as CSV...")} className="sec-action" type="button">Export</button>
          </div>
          <div className="settings-summary">
            <div><span>Account Type</span><strong>Instructor</strong></div>
            <div><span>Email</span><strong style={{ fontSize: "12px" }}>{profile.email || "—"}</strong></div>
            <div><span>Name</span><strong>{profile.name || "—"}</strong></div>
          </div>
        </section>
      </div>
    </div>
  );
}
