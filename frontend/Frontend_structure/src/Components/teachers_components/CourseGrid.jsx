import React from 'react';

const coursesData = [
  {
    id: 1,
    name: "Artificial Intelligence",
    icon: "fa-solid fa-robot",
    students: 48,
    tasks: 8,
    rating: 4.9,
    progress: 78,
    gradient: "linear-gradient(135deg,#064E3B,#10B981)"
  },
  {
    id: 2,
    name: "Machine Learning",
    icon: "fa-solid fa-brain",
    students: 52,
    tasks: 11,
    rating: 4.8,
    progress: 65,
    gradient: "linear-gradient(135deg,#1E40AF,#3B82F6)"
  },
  {
    id: 3,
    name: "Database Systems",
    icon: "fa-solid fa-database",
    students: 36,
    tasks: 6,
    rating: 4.7,
    progress: 91,
    gradient: "linear-gradient(135deg,#7C3AED,#A78BFA)"
  },
  {
    id: 4,
    name: "Data Structures",
    icon: "fa-solid fa-code-branch",
    students: 41,
    tasks: 9,
    rating: 4.9,
    progress: 54,
    gradient: "linear-gradient(135deg,#B45309,#F59E0B)"
  }
];

export default function CourseGrid() {
  return (
    <div className="section-card">
      <div className="sec-header">
        <div className="sec-title">
          <i className="fa-solid fa-book-open"></i> My Courses <span className="sec-badge">18 Active</span>
        </div>
        <button className="sec-action">Manage All →</button>
      </div>

      <div className="courses-grid">
        {coursesData.map((course) => (
          <div className="course-card" key={course.id}>
            {/* Inline style for the gradient background */}
            <div 
              className="course-thumb" 
              style={{ background: course.gradient }}
            >
              <i className={course.icon}></i>
            </div>
            
            <div className="course-body">
              <div className="course-name">{course.name}</div>
              
              <div className="course-meta">
                <span><i className="fa-solid fa-user-graduate"></i> {course.students}</span> 
                <span><i className="fa-solid fa-list-check"></i> {course.tasks} tasks</span> 
                <span className="rating"><i className="fa-solid fa-star"></i> {course.rating}</span>
              </div>

              {/* Progress Bar */}
              <div className="prog-bar">
                <div 
                  className="prog-fill" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
                {course.progress}% completion
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
