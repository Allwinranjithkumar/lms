import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublicCourses, enrollCourse } from "../../services/api";

const categories = ["All", "AI", "Development", "Data", "Cloud", "Security", "Design", "Business"];

export default function BrowseCourses() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [previewCourse, setPreviewCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPublicCourses()
      .then((res) => setCatalogCourses(res.data || res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (id) => {
    setEnrolling(id);
    try {
      await enrollCourse(id);
      navigate("/student/courses");
    } catch (err) {
      alert(err.message || "Enrollment failed. You might already be enrolled.");
    } finally {
      setEnrolling(null);
    }
  };

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return catalogCourses.filter((course) => {
      const courseCategory = course.category || "Uncategorized";
      const matchesCategory = category === "All" || courseCategory === category;
      const title = course.title || course.name || "";
      const instructor = course.instructor || course.teacher || "";
      const summary = course.summary || course.description || "";
      
      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        instructor.toLowerCase().includes(query) ||
        summary.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [category, search, catalogCourses]);

  return (
    <>
      <div className="sd-page-hero sd-browse-hero">
        <div className="sd-page-hero-tag">Course Catalog</div>
        <h2>Browse More Courses</h2>
        <p>Discover premium JAWA EDTECH courses and add the right skills to your learning path.</p>
        <div className="sd-page-hero-actions">
          <Link className="sd-btn-primary sd-link-btn" to="/student/courses">
            Back to My Courses
          </Link>
        </div>
      </div>

      <div className="sd-browse-toolbar">
        <div className="sd-search-bar sd-browse-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, instructors, skills..."
          />
        </div>
        <div className="sd-browse-filters">
          {categories.map((item) => (
            <button
              key={item}
              className={`sd-tab-btn${category === item ? " active" : ""}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="sd-browse-stats">
        <div>
          <strong>{catalogCourses.length}</strong>
          <span>Courses</span>
        </div>
        <div>
          <strong>12k+</strong>
          <span>Learners</span>
        </div>
        <div>
          <strong>4.8</strong>
          <span>Avg. Rating</span>
        </div>
      </div>

      {loading && <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>Loading courses...</div>}

      <div className="sd-browse-grid">
        {filteredCourses.map((course) => (
          <article className="sd-browse-card" key={course.id}>
            <div className="sd-browse-card-top" style={{ background: course.accent || "linear-gradient(135deg,#064E3B,#00C853)" }}>
              <span>{course.category || "Uncategorized"}</span>
              <b>{course.tag || "New"}</b>
            </div>
            <div className="sd-browse-card-body">
              <div className="sd-browse-card-meta">
                <span>{course.level || "Beginner"}</span>
                <span>{course.duration || "Self-paced"}</span>
              </div>
              <h3>{course.title || course.name}</h3>
              <p>{course.summary || course.description}</p>
              <div className="sd-browse-instructor">
                <i className="fa-solid fa-user-graduate" />
                <span>{course.instructor || course.teacher || "TBA"}</span>
              </div>
              <div className="sd-browse-details">
                <span>
                  <i className="fa-solid fa-book-open" /> {course.lessons || 0} lessons
                </span>
                <span>
                  <i className="fa-solid fa-users" /> {course.students || 0}
                </span>
                <span>
                  <i className="fa-solid fa-star" /> {course.rating || "4.5"}
                </span>
              </div>
              <div className="sd-browse-actions">
                <button 
                  className="sd-btn-primary" 
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolling === course.id}
                  style={{ opacity: enrolling === course.id ? 0.7 : 1, cursor: enrolling === course.id ? "not-allowed" : "pointer" }}
                >
                  {enrolling === course.id ? "Enrolling..." : "Enroll Now"}
                </button>
                <button onClick={() => setPreviewCourse(course)} className="sd-btn-secondary">Preview</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && filteredCourses.length === 0 && <div className="sd-empty">No courses found.</div>}
    </>
  );
}

