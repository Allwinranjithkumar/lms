const prisma = require("../db/prisma");

// Static demo leaderboard — presentation-only data with no writes, kept in code
// rather than a table (matches the original seed store).
const LEADERBOARD = [
  { name: "Aisha Patel", initials: "AP", color: "#7C3AED", score: 98, you: false },
  { name: "You (Alex)", initials: "AJ", color: "#059669", score: 92, you: true },
  { name: "Marcus Chen", initials: "MC", color: "#2563EB", score: 82, you: false },
];

// Loads a consistent point-in-time snapshot of every collection from Postgres,
// shaped exactly like the former JSON store so the pure read/format helpers in
// server.js keep working unchanged. Reads are always DB-fresh and durable.
async function loadStore() {
  const [
    users,
    courses,
    enrollments,
    assignments,
    submissions,
    liveClasses,
    attendance,
    resources,
    grades,
    notifications,
    certificates,
    conversations,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.course.findMany(),
    prisma.enrollment.findMany(),
    prisma.assignment.findMany(),
    prisma.submission.findMany(),
    prisma.liveClass.findMany(),
    prisma.attendance.findMany(),
    prisma.resource.findMany(),
    prisma.grade.findMany(),
    prisma.notification.findMany(),
    prisma.certificate.findMany(),
    prisma.conversation.findMany({
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  return {
    users,
    courses,
    enrollments,
    assignments,
    submissions,
    liveClasses,
    attendance,
    resources,
    grades,
    notifications,
    certificates,
    conversations,
    leaderboard: LEADERBOARD,
  };
}

module.exports = { loadStore, prisma };
