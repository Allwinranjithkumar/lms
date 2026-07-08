// Prisma-based seed. Reuses the original seed data literal from
// src/data/seedData.js so demo content is unchanged, converting the embedded
// conversation messages into rows of the new Message table.
//
// Run with: npm run seed   (or: node prisma/seed.js)

require("dotenv").config();
const prisma = require("../src/db/prisma");
const { createSeedStore } = require("../src/data/seedData");

const d = (value) => (value ? new Date(value) : undefined);

async function main() {
  const store = createSeedStore();

  // Wipe in FK-safe order (Message -> Conversation; the rest are independent).
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.course.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.liveClass.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.resource.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.certificate.deleteMany(),
  ]);

  await prisma.user.createMany({
    data: store.users.map((u) => ({ ...u, createdAt: d(u.createdAt) })),
  });

  await prisma.course.createMany({
    data: store.courses.map((c) => ({
      ...c,
      createdAt: d(c.createdAt),
      updatedAt: d(c.updatedAt),
    })),
  });

  await prisma.enrollment.createMany({
    data: store.enrollments.map((e) => ({ ...e, createdAt: d(e.createdAt) })),
  });

  await prisma.assignment.createMany({ data: store.assignments });

  await prisma.submission.createMany({
    data: store.submissions.map((s) => ({
      ...s,
      submittedAt: d(s.submittedAt),
      gradedAt: d(s.gradedAt),
    })),
  });

  await prisma.liveClass.createMany({ data: store.liveClasses });

  await prisma.resource.createMany({
    data: store.resources.map((r) => ({ ...r, createdAt: d(r.createdAt) })),
  });

  await prisma.grade.createMany({ data: store.grades });
  await prisma.notification.createMany({ data: store.notifications });
  await prisma.certificate.createMany({ data: store.certificates });

  // Conversations carry embedded messages -> create each with nested rows.
  for (const conv of store.conversations) {
    const { messages = [], ...rest } = conv;
    await prisma.conversation.create({
      data: {
        ...rest,
        updatedAt: d(conv.updatedAt),
        messages: {
          create: messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            text: m.text,
            createdAt: d(m.createdAt),
          })),
        },
      },
    });
  }

  const counts = {
    users: store.users.length,
    courses: store.courses.length,
    conversations: store.conversations.length,
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
