import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { getMe, updateProfile } from "../../services/api";

export default function Settings() {
  const { isDark, toggleDark: globalToggleDark } = useOutletContext();
  const [profile, setProfile] = useState({ name: "", email: "", college: "", year: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const [toggles, setToggles] = useState({
    emailNotifs: true,
    pushNotifs: true,
    classReminders: true,
    darkMode: false,
    twoFA: false,
    shareProgress: true,
  });

  useEffect(() => {
    getMe()
      .then((d) => {
        const user = d.user || d.data?.user || d.data || d || {};
        setProfile({
          name: user.name || "",
          email: user.email || "",
          college: user.profile?.college || user.college || "",
          year: user.profile?.year || user.year || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => setToggles((t) => ({ ...t, [key]: !t[key] }));

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: profile.name,
        profile: {
          college: profile.college,
          year: profile.year,
        },
      });
      setToast("Profile saved successfully!");
    } catch (err) {
      setToast(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  return (
    <>
      {toast && (
        <div style={{ position: "fixed", top: "80px", right: "24px", background: "var(--g1)", color: "white", padding: "12px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
          {toast}
        </div>
      )}
      <div className="sd-page-hero">
        <div className="sd-page-hero-tag">
          <i className="fa-solid fa-gear"></i>
          Account
        </div>
        <h2>Settings</h2>
        <p>Manage your profile, preferences, and security settings.</p>
      </div>

      <div className="sd-settings-grid">
        <div className="sd-settings-group">
          <h3>
            <i className="fa-solid fa-user"></i>
            Profile
          </h3>
          {loading ? (
            <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading profile...</div>
          ) : (
            <>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", marginBottom: "4px" }}>Full Name</div>
                <input className="sd-input-field" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ marginBottom: "12px" }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", marginBottom: "4px" }}>Email</div>
                <input className="sd-input-field" value={profile.email || ""} disabled style={{ marginBottom: "12px", opacity: 0.6, cursor: "not-allowed" }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", marginBottom: "4px" }}>College/Department</div>
                <input className="sd-input-field" value={profile.college || ""} onChange={(e) => setProfile({ ...profile, college: e.target.value })} style={{ marginBottom: "12px" }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", marginBottom: "4px" }}>Year</div>
                <input className="sd-input-field" value={profile.year || ""} onChange={(e) => setProfile({ ...profile, year: e.target.value })} style={{ marginBottom: "12px" }} />
              </div>
              <button className="sd-save-btn" onClick={handleSaveProfile} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>

        <div className="sd-settings-group">
          <h3>
            <i className="fa-regular fa-bell"></i>
            Notifications
          </h3>
          {[
            ["emailNotifs", "Email Notifications", "Receive course updates by email"],
            ["pushNotifs", "Push Notifications", "Browser push notifications"],
            ["classReminders", "Class Reminders", "15 min before class starts"],
            ["shareProgress", "Share Progress", "Show progress on leaderboard"],
          ].map(([key, label, sub]) => (
            <div key={key} className="sd-setting-row">
              <div><div className="sd-setting-label">{label}</div><div className="sd-setting-sub">{sub}</div></div>
              <button className={`sd-toggle${toggles[key] ? " on" : ""}`} onClick={() => toggle(key)}></button>
            </div>
          ))}
        </div>

        <div className="sd-settings-group">
          <h3>
            <i className="fa-solid fa-lock"></i>
            Security
          </h3>
          {[
            ["twoFA", "Two-Factor Authentication", "Extra layer of account security"],
            ["darkMode", "Dark Mode", "Use dark theme"],
          ].map(([key, label, sub]) => {
            const isActive = key === "darkMode" ? isDark : toggles[key];
            const onToggle = key === "darkMode" ? globalToggleDark : () => toggle(key);
            return (
              <div key={key} className="sd-setting-row">
                <div><div className="sd-setting-label">{label}</div><div className="sd-setting-sub">{sub}</div></div>
                <button className={`sd-toggle${isActive ? " on" : ""}`} onClick={onToggle}></button>
              </div>
            );
          })}
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", marginBottom: "4px" }}>Current Password</div>
            <input className="sd-input-field" type="password" placeholder="********" style={{ marginBottom: "10px" }} />
            <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", marginBottom: "4px" }}>New Password</div>
            <input className="sd-input-field" type="password" placeholder="New password" />
          </div>
          <button onClick={() => alert('Password updated successfully!')} className="sd-save-btn">Update Password</button>
        </div>

        <div className="sd-settings-group">
          <h3>
            <i className="fa-solid fa-graduation-cap"></i>
            Academic
          </h3>
          <div style={{ background: "var(--surface2)", borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "8px", fontWeight: "600" }}>Current GPA</div>
            <div style={{ fontFamily: "Outfit", fontSize: "28px", fontWeight: "900", color: "var(--g3)" }}>4.0</div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>Top 5% of cohort</div>
          </div>
        </div>
      </div>
    </>
  );
}
