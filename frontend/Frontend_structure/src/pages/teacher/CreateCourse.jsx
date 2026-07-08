import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createCourse, updateCourse } from "../../services/api";
const steps = ["Basic Info", "Curriculum", "Settings", "Publish"];

const categories = [
  "Frontend", "Backend", "Data Science", "AI/ML", "Design",
  "Security", "Cloud", "Mobile", "DevOps", "Other",
];

const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

export default function CreateCourse() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const editCourse = location.state?.editCourse;
  
  const [form, setForm] = useState(editCourse ? {
    title: editCourse.title || editCourse.name || "",
    category: editCourse.category || "",
    level: editCourse.level || "",
    description: editCourse.description || "",
    price: editCourse.price || "",
    thumbnail: editCourse.thumbnail || "fa-solid fa-graduation-cap",
    modules: editCourse.modules || [],
    tags: editCourse.tags || [],
    isPublic: editCourse.isPublic || false,
    hasCertificate: editCourse.hasCertificate || false,
  } : {
    title: "",
    category: "",
    level: "",
    description: "",
    price: "",
    thumbnail: "fa-solid fa-graduation-cap",
    modules: [
      { id: 1, title: "Introduction", lessons: ["Welcome", "Setup"] },
    ],
    tags: [],
    tagInput: "",
    isPublic: true,
    hasCertificate: true,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (status) => {
    setLoading(true);
    try {
      const payload = {
        title: form.title || "Untitled Course",
        category: form.category || "Other",
        level: form.level || "Beginner",
        description: form.description || "",
        price: form.price ? Number(form.price) : 0,
        thumbnail: form.thumbnail,
        modules: form.modules,
        tags: form.tags,
        isPublic: form.isPublic,
        hasCertificate: form.hasCertificate,
        status: status,
      };

      if (editCourse) {
        await updateCourse(editCourse.id, payload);
        alert(`Course ${status === 'published' ? 'published' : 'saved'} successfully!`);
      } else {
        await createCourse(payload);
        alert(`Course ${status === 'published' ? 'published' : 'saved'} successfully!`);
      }
      navigate("/teacher/courses");
    } catch (err) {
      alert("Error: " + (err.message || "Failed to save course."));
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    const newMod = { id: Date.now(), title: `Module ${form.modules.length + 1}`, lessons: [] };
    set("modules", [...form.modules, newMod]);
  };

  const addLesson = (modId) => {
    set(
      "modules",
      form.modules.map((m) =>
        m.id === modId ? { ...m, lessons: [...m.lessons, "New Lesson"] } : m
      )
    );
  };

  const addTag = () => {
    if (form.tagInput.trim() && !form.tags.includes(form.tagInput.trim())) {
      set("tags", [...form.tags, form.tagInput.trim()]);
      set("tagInput", "");
    }
  };

  const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));

  const thumbnailIcons = [
    "fa-solid fa-graduation-cap",
    "fa-brands fa-react",
    "fa-brands fa-python",
    "fa-solid fa-palette",
    "fa-solid fa-shield-halved",
    "fa-solid fa-cloud",
    "fa-solid fa-robot",
    "fa-solid fa-mobile-screen",
    "fa-solid fa-screwdriver-wrench",
    "fa-solid fa-chart-simple",
  ];

  return (
    <div className="content">
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "22px",
              fontWeight: "800",
              color: "var(--dark)",
              marginBottom: "4px",
            }}
          >
            {editCourse ? "Edit Course" : "Create New Course"}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            {editCourse ? "Update your course details and curriculum" : "Build and publish your course in a few steps"}
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "32px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px 28px",
          gap: "0",
        }}
      >
        {steps.map((s, i) => (
          <div
            key={s}
            style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              onClick={() => setStep(i)}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "13px",
                  background:
                    i < step
                      ? "linear-gradient(135deg,var(--g1),var(--g2))"
                      : i === step
                      ? "linear-gradient(135deg,var(--g1),var(--g2))"
                      : "var(--surface2)",
                  color: i <= step ? "white" : "var(--muted)",
                  border: i <= step ? "none" : "2px solid var(--border)",
                  flexShrink: 0,
                }}
              >
                {i < step ? <i className="fa-solid fa-check"></i> : i + 1}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: i <= step ? "var(--dark)" : "var(--muted)",
                  }}
                >
                  {s}
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background: i < step ? "var(--g1)" : "var(--border)",
                  margin: "0 16px",
                  borderRadius: "2px",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="section-card">
              <div className="sec-header">
                <div className="sec-title"><i className="fa-solid fa-clipboard-list"></i> Basic Information</div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Course Title *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Complete React Developer Course"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    style={inputStyle}
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Level *</label>
                  <select
                    style={inputStyle}
                    value={form.level}
                    onChange={(e) => set("level", e.target.value)}
                  >
                    <option value="">Select level</option>
                    {levels.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Description *</label>
                <textarea
                  style={{ ...inputStyle, height: "120px", resize: "vertical" }}
                  placeholder="Describe what students will learn..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Price (USD)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: "14px" }}>
                    $
                  </span>
                  <input
                    style={{ ...inputStyle, paddingLeft: "30px" }}
                    placeholder="0.00"
                    type="number"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Tags</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    placeholder="Add a tag..."
                    value={form.tagInput}
                    onChange={(e) => set("tagInput", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                  />
                  <button className="btn-primary" onClick={addTag} style={{ padding: "10px 16px" }}>
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        background: "var(--g-light)",
                        color: "var(--g3)",
                        padding: "4px 10px",
                        borderRadius: "100px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      {t}
                      <span
                        onClick={() => removeTag(t)}
                        style={{ cursor: "pointer", opacity: 0.6 }}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Curriculum */}
          {step === 1 && (
            <div className="section-card">
              <div className="sec-header">
                <div className="sec-title"><i className="fa-solid fa-book-open"></i> Curriculum Builder</div>
                <button className="btn-primary" onClick={addModule} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  <i className="fa-solid fa-plus"></i> Add Module
                </button>
              </div>

              {form.modules.map((mod, mi) => (
                <div
                  key={mod.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    marginBottom: "16px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "var(--surface2)",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg,var(--g1),var(--g2))",
                        color: "white",
                        width: "26px",
                        height: "26px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}
                    >
                      {mi + 1}
                    </span>
                    <input
                      value={mod.title}
                      onChange={(e) =>
                        set(
                          "modules",
                          form.modules.map((m) =>
                            m.id === mod.id ? { ...m, title: e.target.value } : m
                          )
                        )
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "var(--dark)",
                        outline: "none",
                        flex: 1,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {mod.lessons.length} lessons
                    </span>
                  </div>
                  <div style={{ padding: "12px 18px" }}>
                    {mod.lessons.map((lesson, li) => (
                      <div
                        key={li}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 0",
                          borderBottom: li < mod.lessons.length - 1 ? "1px solid var(--border)" : "none",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}><i className="fa-solid fa-circle-play"></i></span>
                        <input
                          value={lesson}
                          onChange={(e) =>
                            set(
                              "modules",
                              form.modules.map((m) =>
                                m.id === mod.id
                                  ? {
                                      ...m,
                                      lessons: m.lessons.map((l, i) =>
                                        i === li ? e.target.value : l
                                      ),
                                    }
                                  : m
                              )
                            )
                          }
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "13px",
                            color: "var(--dark)",
                            outline: "none",
                            flex: 1,
                          }}
                        />
                      </div>
                    ))}
                    <button
                      style={{
                        background: "none",
                        border: "1px dashed var(--border)",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        color: "var(--g2)",
                        cursor: "pointer",
                        width: "100%",
                        marginTop: "10px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: "600",
                      }}
                      onClick={() => addLesson(mod.id)}
                    >
                      <i className="fa-solid fa-plus"></i> Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="section-card">
              <div className="sec-header">
                <div className="sec-title"><i className="fa-solid fa-gear"></i> Course Settings</div>
              </div>

              {[
                {
                  label: "Public Course",
                  desc: "Anyone can find and enroll in your course",
                  key: "isPublic",
                },
                {
                  label: "Certificate on Completion",
                  desc: "Students receive a certificate after finishing",
                  key: "hasCertificate",
                },
              ].map((s) => (
                <div
                  key={s.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--dark)" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                      {s.desc}
                    </div>
                  </div>
                  <div
                    onClick={() => set(s.key, !form[s.key])}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "100px",
                      background: form[s.key]
                        ? "linear-gradient(135deg,var(--g1),var(--g2))"
                        : "var(--border)",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background .2s",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "white",
                        position: "absolute",
                        top: "3px",
                        left: form[s.key] ? "23px" : "3px",
                        transition: "left .2s",
                        boxShadow: "0 2px 4px rgba(0,0,0,.2)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Publish */}
          {step === 3 && (
            <div className="section-card" style={{ textAlign: "center", padding: "48px 32px" }}>
              <div style={{ fontSize: "56px", marginBottom: "20px" }}><i className="fa-solid fa-rocket"></i></div>
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "var(--dark)",
                  marginBottom: "10px",
                }}
              >
                Ready to Publish?
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "28px", lineHeight: "1.6" }}>
                Review your course details and publish when you're ready.
                Your course will be live to students immediately.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: "12px 28px", fontSize: "14px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                  onClick={() => handleSubmit("published")}
                  disabled={loading}
                >
                  <i className="fa-solid fa-rocket"></i> {loading ? "Publishing..." : "Publish Course"}
                </button>
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  style={{
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "var(--muted)",
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  Save as Draft
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            {step > 0 && (
              <button
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "var(--dark)",
                }}
                onClick={() => setStep(step - 1)}
              >
                <i className="fa-solid fa-arrow-left"></i> Previous
              </button>
            )}
            {step < steps.length - 1 && (
              <button
                className="btn-primary"
                style={{ marginLeft: "auto" }}
                onClick={() => setStep(step + 1)}
              >
                Next <i className="fa-solid fa-arrow-right"></i>
              </button>
            )}
          </div>
        </div>

        {/* Preview Sidebar */}
        <div>
          <div className="section-card" style={{ marginBottom: "16px" }}>
            <div className="sec-title" style={{ marginBottom: "16px" }}><i className="fa-regular fa-image"></i> Thumbnail</div>
            <div
              style={{
                height: "140px",
                borderRadius: "12px",
                background: "linear-gradient(135deg,var(--g3),#0a6640)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                marginBottom: "12px",
              }}
            >
              <i className={form.thumbnail}></i>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {thumbnailIcons.map((e) => (
                <span
                  key={e}
                  onClick={() => set("thumbnail", e)}
                  style={{
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "8px",
                    background: form.thumbnail === e ? "var(--g-light)" : "transparent",
                    border: form.thumbnail === e ? "1px solid var(--g-mid)" : "1px solid transparent",
                  }}
                >
                  <i className={e}></i>
                </span>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="sec-title" style={{ marginBottom: "16px" }}><i className="fa-solid fa-chart-simple"></i> Course Preview</div>
            {[
              { label: "Title", val: form.title || "—" },
              { label: "Category", val: form.category || "—" },
              { label: "Level", val: form.level || "—" },
              { label: "Price", val: form.price ? `$${form.price}` : "Free" },
              { label: "Modules", val: form.modules.length },
              {
                label: "Lessons",
                val: form.modules.reduce((a, m) => a + m.lessons.length, 0),
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "var(--muted)" }}>{item.label}</span>
                <span style={{ fontWeight: "600", color: "var(--dark)" }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--muted)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: ".04em",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "13px",
  fontFamily: "'DM Sans', sans-serif",
  color: "var(--dark)",
  background: "var(--surface2)",
  outline: "none",
  marginBottom: "4px",
};
