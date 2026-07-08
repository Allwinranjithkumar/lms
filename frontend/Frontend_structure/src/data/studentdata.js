export const enrolledCourses = [
  { id: 1, icon: "fa-solid fa-robot", bg: "linear-gradient(135deg,#064E3B,#10B981)", name: "Artificial Intelligence", teacher: "Prof. James Park", lessons: 24, progress: 78, grade: "A", rating: 4.9 },
  { id: 2, icon: "fa-solid fa-brain", bg: "linear-gradient(135deg,#1E40AF,#3B82F6)", name: "Machine Learning", teacher: "Dr. Lisa Chen", lessons: 18, progress: 52, grade: "B+", rating: 4.8 },
  { id: 3, icon: "fa-solid fa-database", bg: "linear-gradient(135deg,#7C3AED,#A78BFA)", name: "Database Systems", teacher: "Prof. Mike Osei", lessons: 15, progress: 91, grade: "A+", rating: 4.7 },
  { id: 4, icon: "fa-solid fa-code-branch", bg: "linear-gradient(135deg,#B45309,#F59E0B)", name: "Data Structures", teacher: "Dr. Sara Ali", lessons: 20, progress: 34, grade: "B", rating: 4.6 },
];

export const todayClasses = [
  { time: "10:00 AM", name: "Artificial Intelligence", teacher: "Prof. James Park", room: "Room 301", status: "live" },
  { time: "11:30 AM", name: "Database Systems", teacher: "Prof. Mike Osei", room: "Room 204", status: "upcoming" },
  { time: "02:00 PM", name: "Machine Learning", teacher: "Dr. Lisa Chen", room: "Lab A", status: "upcoming" },
];

export const assignments = [
  { id: 1, title: "AI Ethics Report", course: "Artificial Intelligence", due: "Jun 10, 2026", points: 100, status: "pending" },
  { id: 2, title: "SQL Normalization Lab", course: "Database Systems", due: "Jun 8, 2026", points: 80, status: "submitted" },
  { id: 3, title: "Linear Regression Exercise", course: "Machine Learning", due: "Jun 5, 2026", points: 60, status: "graded", gradeReceived: "56/60" },
  { id: 4, title: "Binary Trees Implementation", course: "Data Structures", due: "Jun 15, 2026", points: 120, status: "pending" },
  { id: 5, title: "Neural Network Diagram", course: "Artificial Intelligence", due: "May 28, 2026", points: 90, status: "overdue" },
  { id: 6, title: "ER Diagram Design", course: "Database Systems", due: "Jun 20, 2026", points: 70, status: "pending" },
];

export const grades = [
  { course: "Artificial Intelligence", teacher: "Prof. James Park", progress: 78, grade: "A", score: 92, color: "#D1FAE5" },
  { course: "Machine Learning", teacher: "Dr. Lisa Chen", progress: 52, grade: "B+", score: 83, color: "#DBEAFE" },
  { course: "Database Systems", teacher: "Prof. Mike Osei", progress: 91, grade: "A+", score: 97, color: "#EDE9FE" },
  { course: "Data Structures", teacher: "Dr. Sara Ali", progress: 34, grade: "B", score: 76, color: "#FEF3C7" },
];

export const gradeColor = { "A+": "#16A34A", A: "#16A34A", "B+": "#2563EB", B: "#2563EB", "C+": "#D97706", C: "#D97706" };

export const leaderboard = [
  { name: "Aisha Patel", initials: "AP", color: "#7C3AED", score: 98, you: false },
  { name: "David Kim", initials: "DK", color: "#0891B2", score: 95, you: false },
  { name: "You (Alex)", initials: "AJ", color: "#059669", score: 89, you: true },
  { name: "Marcus Chen", initials: "MC", color: "#2563EB", score: 83, you: false },
  { name: "Sara Williams", initials: "SW", color: "#D97706", score: 79, you: false },
];

export const resources = [
  { name: "AI Lecture Slides Week 8.pdf", type: "PDF", icon: "fa-regular fa-file-pdf", course: "Artificial Intelligence", size: "3.2 MB", date: "Jun 1", color: "#EF4444" },
  { name: "SQL Cheatsheet.pdf", type: "PDF", icon: "fa-regular fa-file-pdf", course: "Database Systems", size: "1.1 MB", date: "May 28", color: "#EF4444" },
  { name: "ML Algorithms Guide.xlsx", type: "XLS", icon: "fa-regular fa-file-excel", course: "Machine Learning", size: "2.4 MB", date: "May 25", color: "#16A34A" },
  { name: "Data Structures Reference.pptx", type: "PPT", icon: "fa-regular fa-file-powerpoint", course: "Data Structures", size: "5.7 MB", date: "May 20", color: "#F59E0B" },
  { name: "ER Diagram Templates.zip", type: "ZIP", icon: "fa-solid fa-file-zipper", course: "Database Systems", size: "8.3 MB", date: "May 18", color: "#6366F1" },
];

export const messages = [
  { id: 1, name: "Prof. James Park", initials: "JP", color: "#064E3B", preview: "Great work on the last assignment!", time: "2m", unread: 1 },
  { id: 2, name: "Dr. Lisa Chen", initials: "LC", color: "#2563EB", preview: "Don't forget tomorrow's quiz at 10 AM", time: "1h", unread: 2 },
  { id: 3, name: "Prof. Mike Osei", initials: "MO", color: "#7C3AED", preview: "I've posted the ER diagram feedback", time: "3h", unread: 0 },
  { id: 4, name: "Study Group #4", initials: "SG", color: "#D97706", preview: "Marcus: Anyone solved problem 3?", time: "5h", unread: 3 },
];

export const notifications = [
  { id: 1, icon: "fa-solid fa-circle-check", color: "#D1FAE5", title: "Assignment Graded", body: "Your SQL Normalization Lab received 78/80 - Dr. Lisa Chen", time: "30m ago", read: false },
  { id: 2, icon: "fa-solid fa-video", color: "#DBEAFE", title: "Live Class Starting", body: "AI Ethics Lecture starts in 15 minutes - Room 301", time: "1h ago", read: false },
  { id: 3, icon: "fa-solid fa-list-check", color: "#FEF3C7", title: "New Assignment Posted", body: "Binary Trees Implementation due Jun 15 - Data Structures", time: "3h ago", read: false },
  { id: 4, icon: "fa-solid fa-book-open-reader", color: "#FCE7F3", title: "Course Update", body: "Prof. Park uploaded new lecture notes for Week 9", time: "Yesterday", read: true },
  { id: 5, icon: "fa-solid fa-ranking-star", color: "#D1FAE5", title: "Leaderboard Update", body: "You moved up to rank #3 in Artificial Intelligence!", time: "Yesterday", read: true },
  { id: 6, icon: "fa-solid fa-wand-magic-sparkles", color: "#F1F5F9", title: "Platform Update", body: "New study tools available in your dashboard", time: "2 days ago", read: true },
];

export const chartData = {
  attendance: { vals: [85, 78, 92, 88, 95, 82, 90, 87, 93, 89, 96, 91], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], color: "linear-gradient(180deg,#22C55E,#0F766E)", metric: "89.3%", label: "Avg Attendance" },
  grades: { vals: [70, 74, 78, 80, 76, 83, 85, 82, 88, 87, 91, 89], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], color: "linear-gradient(180deg,#38BDF8,#2563EB)", metric: "87.2%", label: "Avg Grade" },
};

export const statusStyle = {
  pending: "sd-status-pending",
  submitted: "sd-status-submitted",
  graded: "sd-status-graded",
  overdue: "sd-status-overdue",
};
