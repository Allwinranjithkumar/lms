import certificateAi from "../assets/certificate-ai.svg";
import certificateData from "../assets/certificate-data.svg";
import certificateDesign from "../assets/certificate-design.svg";

export const studentCertificates = [
  {
    id: "cert-ai",
    title: "Artificial Intelligence Foundations",
    issuer: "Prof. James Park",
    issued: "Jun 04, 2026",
    status: "Earned",
    credentialId: "JAWA-AI-2026-1048",
    score: "92%",
    hours: 42,
    image: certificateAi,
    accent: "#10B981",
  },
  {
    id: "cert-db",
    title: "Database Systems",
    issuer: "Prof. Mike Osei",
    issued: "May 29, 2026",
    status: "Earned",
    credentialId: "JAWA-DB-2026-0821",
    score: "97%",
    hours: 36,
    image: certificateData,
    accent: "#2563EB",
  },
  {
    id: "cert-ux",
    title: "UI/UX Design Fundamentals",
    issuer: "Dr. Sara Ali",
    issued: "Apr 18, 2026",
    status: "Earned",
    credentialId: "JAWA-UX-2026-0337",
    score: "A+",
    hours: 28,
    image: certificateDesign,
    accent: "#A855F7",
  },
  {
    id: "cert-ml",
    title: "Machine Learning",
    issuer: "Dr. Lisa Chen",
    issued: "87% complete",
    status: "In Progress",
    credentialId: "Unlocks at 95% course progress",
    score: "83%",
    hours: 30,
    image: certificateAi,
    accent: "#0EA5E9",
  },
];

export const studentCertificateProgress = [
  { label: "Earned Certificates", value: "3", icon: "fa-solid fa-award", color: "#D1FAE5" },
  { label: "Learning Hours", value: "136", icon: "fa-solid fa-clock", color: "#DBEAFE" },
  { label: "Best Score", value: "97%", icon: "fa-solid fa-ranking-star", color: "#FEF3C7" },
  { label: "Next Unlock", value: "87%", icon: "fa-solid fa-lock-open", color: "#F3E8FF" },
];

export const teacherCertificateStats = [
  { label: "Certificates Issued", value: "384", icon: "fa-solid fa-certificate", color: "#D1FAE5" },
  { label: "Pending Review", value: "18", icon: "fa-solid fa-hourglass-half", color: "#FEF3C7" },
  { label: "Templates", value: "3", icon: "fa-solid fa-file-signature", color: "#DBEAFE" },
  { label: "Completion Rate", value: "74%", icon: "fa-solid fa-chart-line", color: "#F3E8FF" },
];

export const teacherCertificateTemplates = [
  {
    id: "tpl-ai",
    name: "AI Achievement",
    course: "Artificial Intelligence Foundations",
    issued: 118,
    ready: 9,
    image: certificateAi,
    accent: "#10B981",
  },
  {
    id: "tpl-data",
    name: "Data Completion",
    course: "Database Systems",
    issued: 96,
    ready: 4,
    image: certificateData,
    accent: "#2563EB",
  },
  {
    id: "tpl-design",
    name: "Design Excellence",
    course: "UI/UX Design Fundamentals",
    issued: 72,
    ready: 5,
    image: certificateDesign,
    accent: "#A855F7",
  },
];

export const teacherCertificateBatches = [
  { id: 1, student: "Aisha Patel", course: "React Advanced Patterns", score: "98%", status: "Ready", date: "Jun 08" },
  { id: 2, student: "James Okafor", course: "React Advanced Patterns", score: "100%", status: "Issued", date: "Jun 07" },
  { id: 3, student: "David Kim", course: "Cloud Architecture AWS", score: "91%", status: "Ready", date: "Jun 06" },
  { id: 4, student: "Priya Sharma", course: "UI/UX Design Fundamentals", score: "88%", status: "Review", date: "Jun 05" },
];
