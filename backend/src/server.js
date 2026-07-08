const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { authenticate, requireRole, signUserToken } = require("./utils/auth");
const { loadStore, prisma } = require("./utils/store");
const { asyncHandler, ApiError } = require("./utils/http");

const app = express();
const fs = require("fs");
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME || "smart-learning-platform-allwin",
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, "uploads/" + uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ 
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false,
  contentSecurityPolicy: false
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "smart-learning-platform-backend" });
});

app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, college, year, institution, experience } = req.body;
  if (!name || !email || !password || !["student", "teacher"].includes(role)) {
    throw new ApiError(400, "Name, email, password, and role are required.");
  }

  const bcrypt = require("bcryptjs");
  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new ApiError(409, "Email is already registered.");

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      phone: phone || "",
      role,
      avatarColor: role === "teacher" ? "#064E3B" : "#2563EB",
      passwordHash: await bcrypt.hash(password, 10),
      profile: role === "student"
        ? { college: college || "", year: year || "" }
        : { institution: institution || "", experience: experience || "" },
    },
  });

  res.status(201).json(authPayload(user));
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    throw new ApiError(400, "Email, password, and role are required.");
  }

  const bcrypt = require("bcryptjs");
  const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });

  if (!user || user.role !== role || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid credentials.");
  }

  res.json(authPayload(user));
}));

app.post("/api/auth/social", asyncHandler(async (req, res) => {
  const { provider, email: rawEmail, name: rawName, role, id_token } = req.body;
  let email = rawEmail;
  let name = rawName;

  if (!provider || !["student", "teacher"].includes(role)) {
    throw new ApiError(400, "Provider and role are required.");
  }

  if (provider === "google") {
    if (id_token) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = String(payload.email || "").trim().toLowerCase();
        name = name || payload.name || email.split("@")[0];
      } catch (err) {
        throw new ApiError(401, "Invalid Google ID token.");
      }
    }

    if (!email) {
      throw new ApiError(400, "Email is required from Google.");
    }
  } else {
    if (!email) {
      throw new ApiError(400, "Provider and email are required.");
    }
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (user && user.role !== role) {
    throw new ApiError(409, "This email is already registered with a different role.");
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        phone: "",
        role,
        avatarColor: role === "teacher" ? "#064E3B" : "#2563EB",
        passwordHash: "",
        profile: {},
        authProvider: provider,
      },
    });
  }

  res.json(authPayload(user));
}));

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// ─── Contacts (who can I message?) ─────────────────────────────────────────
app.get("/api/users/contacts", authenticate, asyncHandler(async (req, res) => {
  const store = await loadStore();
  const user = req.user;

  if (user.role === "student") {
    // Student → all teachers of courses they are enrolled in
    const enrolledCourseIds = store.enrollments
      .filter((e) => e.studentId === user.id)
      .map((e) => e.courseId);

    const contacts = [];
    const seenTeachers = new Set();
    enrolledCourseIds.forEach((courseId) => {
      const course = store.courses.find((c) => c.id === courseId);
      if (!course) return;
      const teacher = store.users.find((u) => u.id === course.teacherId);
      if (!teacher) return;
      if (!seenTeachers.has(teacher.id)) {
        seenTeachers.add(teacher.id);
      }
      contacts.push({
        userId: teacher.id,
        name: teacher.name,
        initials: initials(teacher.name),
        color: teacher.avatarColor || "#064E3B",
        role: "teacher",
        courseId: course.id,
        courseName: course.title || course.name,
      });
    });
    return res.json({ data: contacts });
  }

  if (user.role === "teacher") {
    // Teacher → all students enrolled in their courses, grouped by course
    const courses = store.courses.filter((c) => c.teacherId === user.id);
    const groups = courses.map((course) => {
      const enrolled = store.enrollments.filter((e) => e.courseId === course.id);
      const students = enrolled
        .map((e) => {
          const student = store.users.find((u) => u.id === e.studentId);
          if (!student) return null;
          return {
            userId: student.id,
            name: student.name,
            initials: initials(student.name),
            color: student.avatarColor || "#2563EB",
            role: "student",
          };
        })
        .filter(Boolean);
      return {
        courseId: course.id,
        courseName: course.title || course.name,
        students,
      };
    });
    return res.json({ data: groups });
  }

  res.json({ data: [] });
}));

// Shared profile-update logic for /auth/profile and /users/me
async function updateOwnProfile(req, res) {
  const current = await prisma.user.findUnique({ where: { id: req.user.id } });
  const profilePatch = profileUpdatesFromBody(req.body, current.role);
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name: req.body.name ?? current.name,
      phone: req.body.phone ?? current.phone,
      profile: { ...(current.profile || {}), ...profilePatch },
    },
  });
  res.json({ user: sanitizeUser(user) });
}

// Profile update alias (frontend uses /auth/profile)
app.patch("/api/auth/profile", authenticate, asyncHandler(updateOwnProfile));

app.patch("/api/users/me", authenticate, asyncHandler(updateOwnProfile));

app.get("/api/courses", asyncHandler(async (req, res) => {
  const store = await loadStore();
  const courses = store.courses
    .filter((course) => isPublicCourse(course))
    .map((course) => enrichCourse(course, store));
  res.json({ data: courses });
}));

// Public course catalog — no auth required
app.get("/api/courses/public", asyncHandler(async (req, res) => {
  const store = await loadStore();
  const { category, level, q } = req.query;
  let courses = store.courses
    .filter((course) => isPublicCourse(course))
    .map((course) => enrichCourse(course, store));
  if (category) courses = courses.filter((c) => c.category === category);
  if (level) courses = courses.filter((c) => c.level === level);
  if (q) {
    const search = String(q).toLowerCase();
    courses = courses.filter((c) =>
      String(c.title || c.name || "").toLowerCase().includes(search) ||
      String(c.category || "").toLowerCase().includes(search)
    );
  }
  res.json({ data: courses });
}));

app.get("/api/courses/:id", asyncHandler(async (req, res) => {
  const store = await loadStore();
  const course = store.courses.find((item) => item.id === req.params.id);
  if (!course || !isPublicCourse(course)) throw new ApiError(404, "Course not found.");
  res.json({ data: enrichCourse(course, store) });
}));

app.post("/api/courses", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const title = cleanString(req.body.title || req.body.name);
  const category = cleanString(req.body.category);
  const level = cleanString(req.body.level);

  if (!title || !category || !level) {
    throw new ApiError(400, "Course title, category, and level are required.");
  }

  const modules = normalizeModules(req.body.modules);
  const price = toNonNegativeNumber(req.body.price, 0);
  const status = normalizeCourseStatus(req.body.status || "draft");
  const accent = req.body.accent || "linear-gradient(135deg,#064E3B,#00C853)";
  const course = await prisma.course.create({
    data: {
      teacherId: req.user.id,
      title,
      name: title,
      category,
      level,
      description: req.body.description || "",
      summary: req.body.description || "",
      price,
      duration: req.body.duration || "Self-paced",
      lessons: countLessons(modules),
      modules,
      tags: normalizeTags(req.body.tags),
      icon: req.body.thumbnail || "fa-solid fa-graduation-cap",
      accent,
      bg: accent,
      status,
      isPublic: req.body.isPublic ?? true,
      hasCertificate: req.body.hasCertificate ?? true,
      rating: 0,
      students: 0,
      progress: 0,
      revenue: "$0",
    },
  });

  res.status(201).json({ data: course });
}));

app.patch("/api/courses/:id", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) throw new ApiError(404, "Course not found.");
  if (course.teacherId !== req.user.id) throw new ApiError(403, "You can only edit your own courses.");

  const data = {};
  const nextTitle = cleanString(req.body.title || req.body.name);
  if (nextTitle) {
    data.title = nextTitle;
    data.name = nextTitle;
  }
  if (req.body.category !== undefined) data.category = cleanString(req.body.category) || course.category;
  if (req.body.level !== undefined) data.level = cleanString(req.body.level) || course.level;
  if (req.body.description !== undefined) {
    data.description = cleanString(req.body.description);
    data.summary = data.description;
  }
  if (req.body.price !== undefined) data.price = toNonNegativeNumber(req.body.price, course.price);
  if (req.body.duration !== undefined) data.duration = cleanString(req.body.duration) || course.duration;
  if (req.body.modules !== undefined) {
    data.modules = normalizeModules(req.body.modules);
    data.lessons = countLessons(data.modules);
  }
  if (req.body.tags !== undefined) data.tags = normalizeTags(req.body.tags);
  if (req.body.thumbnail !== undefined) data.icon = cleanString(req.body.thumbnail) || course.icon;
  if (req.body.accent !== undefined) {
    data.accent = cleanString(req.body.accent) || course.accent;
    data.bg = data.accent;
  }
  if (req.body.status !== undefined) data.status = normalizeCourseStatus(req.body.status);
  if (req.body.isPublic !== undefined) data.isPublic = Boolean(req.body.isPublic);
  if (req.body.hasCertificate !== undefined) data.hasCertificate = Boolean(req.body.hasCertificate);
  data.updatedAt = new Date();

  const updated = await prisma.course.update({ where: { id: course.id }, data });
  res.json({ data: enrichCourse(updated, await loadStore()) });
}));

app.delete("/api/courses/:id", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) throw new ApiError(404, "Course not found.");
  if (course.teacherId !== req.user.id) throw new ApiError(403, "You can only delete your own courses.");
  await prisma.course.delete({ where: { id: course.id } });
  res.json({ success: true });
}));

app.post("/api/courses/:id/enroll", authenticate, requireRole("student"), asyncHandler(async (req, res) => {
  const course = await prisma.$transaction(async (tx) => {
    const target = await tx.course.findUnique({ where: { id: req.params.id } });
    if (!target) throw new ApiError(404, "Course not found.");
    if (!isPublicCourse(target)) throw new ApiError(403, "This course is not open for enrollment.");

    const existing = await tx.enrollment.findFirst({
      where: { studentId: req.user.id, courseId: target.id },
    });
    if (existing) return target;

    await tx.enrollment.create({
      data: { studentId: req.user.id, courseId: target.id, progress: 0, grade: "" },
    });
    return tx.course.update({
      where: { id: target.id },
      data: { students: { increment: 1 } },
    });
  });

  res.status(201).json({ data: course });
}));

app.get("/api/student/dashboard", authenticate, requireRole("student"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  const courses = studentCourses(req.user.id, store);
  const classes = store.liveClasses
    .filter((item) => item.studentIds.includes(req.user.id))
    .slice(0, 3)
    .map((item) => formatLiveClass(item, store));
  const assignments = store.assignments.filter((item) => item.studentIds.includes(req.user.id));
  const grades = store.grades.filter((item) => item.studentId === req.user.id);
  const resources = studentResources(req.user.id, store);
  res.json({
    stats: {
      activeCourses: courses.length,
      averageProgress: average(courses.map((course) => course.progress)),
      pendingAssignments: assignments.filter((item) => !["submitted", "graded"].includes(item.status)).length,
      earnedCertificates: store.certificates.filter((item) => item.studentId === req.user.id && item.status === "Earned").length,
    },
    courses,
    classes,
    assignments,
    grades,
    leaderboard: store.leaderboard,
    resources,
    messages: conversationsForUser(req.user.id, store),
    notifications: notificationsForUser(req.user.id, store),
    performance: studentPerformance(req.user.id, store),
  });
}));

app.get("/api/student/courses", authenticate, requireRole("student"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  res.json({ data: studentCourses(req.user.id, store) });
}));

app.get("/api/teacher/dashboard", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  const courses = teacherCourses(req.user.id, store);
  const enrollments = teacherEnrollments(req.user.id, store);
  const assignments = store.assignments.filter((item) => item.teacherId === req.user.id);
  const liveClasses = store.liveClasses.filter((item) => item.teacherId === req.user.id);
  const students = teacherStudents(req.user.id, store);

  res.json({
    stats: {
      totalCourses: courses.length,
      totalStudents: new Set(enrollments.map((item) => item.studentId)).size,
      liveClassesToday: liveClasses.filter((item) => isToday(item.date)).length,
      pendingGrading: assignments.reduce((total, item) => total + Math.max(0, Number(item.submitted || 0) - Number(item.graded || 0)), 0),
    },
    courses: courses.map((course) => enrichCourse(course, store)),
    classes: liveClasses.map((item) => formatLiveClass(item, store)),
    assignments,
    students,
    messages: conversationsForUser(req.user.id, store),
    notifications: notificationsForUser(req.user.id, store),
    analytics: teacherAnalytics(req.user.id, store),
  });
}));

app.get("/api/teacher/courses", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  res.json({ data: teacherCourses(req.user.id, store).map((course) => enrichCourse(course, store)) });
}));

app.get("/api/teacher/students", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  res.json({ data: teacherStudents(req.user.id, store) });
}));

app.get("/api/assignments", authenticate, asyncHandler(async (req, res) => {
  const store = await loadStore();
  if (req.user.role === "teacher") {
    const data = store.assignments.filter((item) => item.teacherId === req.user.id);
    res.json({ data });
  } else {
    const assignments = store.assignments.filter((item) => item.studentIds.includes(req.user.id));
    const data = assignments.map(a => {
      const sub = store.submissions.find(s => s.assignmentId === a.id && s.studentId === req.user.id);
      return sub ? { ...a, status: sub.status } : a;
    });
    res.json({ data });
  }
}));

app.post("/api/assignments", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  let course = null;
  let studentIds = [];
  if (req.body.courseId) {
    course = resolveTeacherCourse(req.user.id, req.body.courseId, store);
    if (course) {
      studentIds = store.enrollments.filter((item) => item.courseId === course.id).map((item) => item.studentId);
    }
  } else {
    studentIds = [...new Set(teacherStudents(req.user.id, store).filter(Boolean).map((s) => s.id))];
  }
  const assignment = await prisma.assignment.create({
    data: {
      title: cleanString(req.body.title) || "Untitled Assignment",
      courseId: course?.id || "",
      course: course?.title || cleanString(req.body.course) || "General",
      teacherId: req.user.id,
      due: cleanString(req.body.due) || new Date().toISOString().slice(0, 10),
      points: Number(req.body.points || 100),
      submitted: 0,
      total: studentIds.length,
      graded: 0,
      status: normalizeAssignmentStatus(req.body.status || "upcoming"),
      studentIds,
    },
  });
  res.status(201).json({ data: assignment });
}));

app.get("/api/assignments/:id/submissions", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  const assignment = store.assignments.find((item) => item.id === req.params.id);
  if (!assignment) throw new ApiError(404, "Assignment not found.");
  if (!teacherCanManageAssignment(req.user.id, assignment, store)) {
    throw new ApiError(403, "You can only view submissions for your own assignments.");
  }
  const submissions = store.submissions.filter((item) => item.assignmentId === assignment.id);
  const populated = submissions.map(sub => {
    const student = store.users.find(u => u.id === sub.studentId);
    return { ...sub, studentName: student ? student.name : "Unknown Student" };
  });
  res.json({ data: populated });
}));

app.post("/api/assignments/:id/submit", authenticate, requireRole("student"), upload.single("file"), asyncHandler(async (req, res) => {
  const submission = await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({ where: { id: req.params.id } });
    if (!assignment) throw new ApiError(404, "Assignment not found.");
    if (!assignment.studentIds.includes(req.user.id)) {
      throw new ApiError(403, "This assignment is not assigned to you.");
    }

    const existing = await tx.submission.findFirst({
      where: { assignmentId: assignment.id, studentId: req.user.id },
    });

    if (!existing) {
      const created = await tx.submission.create({
        data: {
          assignmentId: assignment.id,
          studentId: req.user.id,
          status: "submitted",
          text: req.body.text || "",
          fileName: req.file?.originalname || "",
          fileUrl: req.file ? req.file.location : "",
        },
      });
      await tx.assignment.update({
        where: { id: assignment.id },
        data: { submitted: { increment: 1 } },
      });
      return created;
    }

    return tx.submission.update({
      where: { id: existing.id },
      data: {
        status: "submitted",
        text: req.body.text || existing.text,
        ...(req.file
          ? { fileName: req.file.originalname, fileUrl: req.file.location }
          : {}),
        submittedAt: new Date(),
      },
    });
  });
  res.status(201).json({ data: submission });
}));

app.patch("/api/submissions/:id/grade", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const score = toNonNegativeNumber(req.body.score, NaN);
  if (Number.isNaN(score)) throw new ApiError(400, "A valid score is required.");

  const submission = await prisma.$transaction(async (tx) => {
    const target = await tx.submission.findUnique({ where: { id: req.params.id } });
    if (!target) throw new ApiError(404, "Submission not found.");
    const assignment = await tx.assignment.findUnique({ where: { id: target.assignmentId } });
    if (!assignment) throw new ApiError(404, "Assignment not found.");

    let canManage = assignment.teacherId === req.user.id;
    if (!canManage && assignment.courseId) {
      const course = await tx.course.findUnique({ where: { id: assignment.courseId } });
      canManage = course?.teacherId === req.user.id;
    }
    if (!canManage) {
      throw new ApiError(403, "You can only grade submissions for your own assignments.");
    }

    const wasGraded = target.status === "graded";
    const updated = await tx.submission.update({
      where: { id: target.id },
      data: {
        score,
        feedback: req.body.feedback || "",
        status: "graded",
        gradedAt: new Date(),
      },
    });
    if (!wasGraded) {
      await tx.assignment.update({
        where: { id: assignment.id },
        data: { graded: { increment: 1 } },
      });
    }
    return updated;
  });
  res.json({ data: submission });
}));

app.get("/api/live-classes", authenticate, asyncHandler(async (req, res) => {
  const store = await loadStore();
  const data = req.user.role === "teacher"
    ? store.liveClasses.filter((item) => item.teacherId === req.user.id)
    : store.liveClasses.filter((item) => item.studentIds.includes(req.user.id));
  res.json({ data: data.map((item) => formatLiveClass(item, store)) });
}));

app.post("/api/live-classes", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  const course = resolveTeacherCourse(req.user.id, req.body.courseId, store);
  const studentIds = course
    ? store.enrollments.filter((item) => item.courseId === course.id).map((item) => item.studentId)
    : [];
  const schedule = liveClassScheduleFromBody(req.body);
  // Generate a unique, hard-to-guess Jitsi room name
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const roomSlug = `${(course?.title || "Class").replace(/[^a-zA-Z0-9]/g, "")}-${randomSuffix}`;
  const roomName = `JawaEdtech-${roomSlug}`;

  const liveClass = await prisma.liveClass.create({
    data: {
      teacherId: req.user.id,
      courseId: course?.id || "",
      title: cleanString(req.body.title) || "Live Class",
      course: course?.title || cleanString(req.body.course) || "General",
      date: schedule.date,
      time: schedule.time,
      duration: normalizeDuration(req.body.duration),
      description: cleanString(req.body.description || req.body.desc),
      status: cleanString(req.body.status) || "active", // Default to active for instant classes
      roomName,
      meetingUrl: `https://meet.jit.si/${roomName}`,
      settings: req.body.settings || {},
      studentIds,
    },
  });
  res.status(201).json({ data: formatLiveClass(liveClass, await loadStore()) });
}));

app.patch("/api/live-classes/:id/end", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const liveClass = await prisma.liveClass.findUnique({ where: { id: req.params.id } });
  if (!liveClass) throw new ApiError(404, "Live class not found.");
  if (liveClass.teacherId !== req.user.id) {
    throw new ApiError(403, "You can only manage your own live classes.");
  }
  const updated = await prisma.liveClass.update({
    where: { id: liveClass.id },
    data: { status: "completed" },
  });
  res.json({ data: formatLiveClass(updated, await loadStore()) });
}));

app.post("/api/live-classes/:id/attendance", authenticate, asyncHandler(async (req, res) => {
  const liveClass = await prisma.liveClass.findUnique({ where: { id: req.params.id } });
  if (!liveClass) throw new ApiError(404, "Live class not found.");
  if (!canAccessLiveClass(req.user, liveClass)) {
    throw new ApiError(403, "You do not have access to this live class.");
  }

  const attendance = await prisma.attendance.create({
    data: {
      classId: req.params.id,
      userId: req.user.id,
      status: req.body.status || "present",
    },
  });
  res.status(201).json({ data: attendance });
}));

app.get("/api/resources", authenticate, asyncHandler(async (req, res) => {
  const store = await loadStore();
  const data = req.user.role === "teacher"
    ? store.resources.filter((item) => item.teacherId === req.user.id)
    : studentResources(req.user.id, store);
  res.json({ data });
}));

app.post("/api/resources", authenticate, requireRole("teacher"), upload.single("file"), asyncHandler(async (req, res) => {
  const resource = await prisma.resource.create({
    data: {
      teacherId: req.user.id,
      courseId: req.body.courseId || "",
      course: req.body.course || "Unassigned",
      name: req.file?.originalname || req.body.name || "Untitled Resource",
      type: (req.file?.originalname || req.body.name || "file").split(".").pop().toLowerCase(),
      size: req.file ? `${(req.file.size / 1024 / 1024).toFixed(1)} MB` : req.body.size || "0 MB",
      fileUrl: req.file ? req.file.location : "",
      downloads: 0,
      color: "#6366F1",
      date: "Just now",
    },
  });
  res.status(201).json({ data: resource });
}));

app.get("/api/resources/:id/download", authenticate, asyncHandler(async (req, res) => {
  const store = await loadStore();
  const target = store.resources.find((item) => item.id === req.params.id);
  if (!target) throw new ApiError(404, "Resource not found.");
  if (!canAccessResource(req.user, target, store)) {
    throw new ApiError(403, "You do not have access to this resource.");
  }
  const resource = await prisma.resource.update({
    where: { id: target.id },
    data: { downloads: { increment: 1 } },
  });
  res.json({ data: resource, downloadUrl: `/api/resources/${resource.id}/download` });
}));

app.delete("/api/resources/:id", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
  if (!resource) throw new ApiError(404, "Resource not found.");
  if (resource.teacherId !== req.user.id) {
    throw new ApiError(403, "You can only delete your own resources.");
  }
  await prisma.resource.delete({ where: { id: resource.id } });
  res.json({ success: true });
}));

app.get("/api/messages/conversations", authenticate, asyncHandler(async (req, res) => {
  const store = await loadStore();
  res.json({ data: conversationsForUser(req.user.id, store) });
}));

// Send a private message (student→teacher or teacher→student)
// ── Authorization: both parties MUST share a course via enrollment ────────────
app.post("/api/messages", authenticate, asyncHandler(async (req, res) => {
  const { conversationId, recipientId, courseId, text } = req.body;
  if (!text) throw new ApiError(400, "Message text is required.");

  const conversationId2 = await prisma.$transaction(async (tx) => {
    // ── If replying to an existing conversation, verify membership ──────────
    if (conversationId) {
      const existing = await tx.conversation.findUnique({ where: { id: conversationId } });
      if (!existing) throw new ApiError(404, "Conversation not found.");
      if (!existing.participantIds.includes(req.user.id)) {
        throw new ApiError(403, "You are not a participant in this conversation.");
      }
      await appendMessage(tx, existing, req.user.id, text);
      return existing.id;
    }

    // ── Starting a new conversation — validate enrollment ───────────────────
    if (!recipientId) throw new ApiError(400, "recipientId is required for new conversations.");
    if (!courseId)    throw new ApiError(400, "courseId is required for new conversations.");

    const course = await tx.course.findUnique({ where: { id: courseId } });
    if (!course) throw new ApiError(404, "Course not found.");

    const sender    = req.user;
    const recipient = await tx.user.findUnique({ where: { id: recipientId } });
    if (!recipient) throw new ApiError(404, "Recipient user not found.");

    // Determine student and teacher in this conversation
    let studentId, teacherId;
    if (sender.role === "student" && recipient.role === "teacher") {
      studentId = sender.id;
      teacherId = recipient.id;
    } else if (sender.role === "teacher" && recipient.role === "student") {
      teacherId = sender.id;
      studentId = recipient.id;
    } else {
      throw new ApiError(403, "Messages can only be exchanged between a student and a teacher.");
    }

    // Course must belong to the teacher
    if (course.teacherId !== teacherId) {
      throw new ApiError(403, "This course does not belong to the teacher in this conversation.");
    }

    // Student must be enrolled in this course
    const enrolled = await tx.enrollment.findFirst({
      where: { studentId, courseId },
    });
    if (!enrolled) {
      throw new ApiError(403, "The student is not enrolled in this course.");
    }

    // Find or create the private conversation between these two for this course
    let conversation = (await tx.conversation.findMany({
      where: { type: "private", courseId, participantIds: { hasEvery: [sender.id, recipientId] } },
    }))[0];

    if (!conversation) {
      conversation = await tx.conversation.create({
        data: {
          type: "private",
          courseId,
          courseName: course.title || course.name,
          participantIds: [sender.id, recipientId],
          unreadByUserId: {},
        },
      });
    }

    await appendMessage(tx, conversation, sender.id, text);
    return conversation.id;
  });

  const store = await loadStore();
  const conversation = store.conversations.find((c) => c.id === conversationId2);
  res.status(201).json({ data: formatConversation(conversation, req.user.id, store) });
}));

// Broadcast a message from teacher → all enrolled students in a course
app.post("/api/messages/broadcast", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const { courseId, text } = req.body;
  if (!text) throw new ApiError(400, "Message text is required.");
  if (!courseId) throw new ApiError(400, "courseId is required for broadcast.");

  const conversationId = await prisma.$transaction(async (tx) => {
    const course = await tx.course.findUnique({ where: { id: courseId } });
    if (!course) throw new ApiError(404, "Course not found.");
    if (course.teacherId !== req.user.id) throw new ApiError(403, "You can only broadcast to your own courses.");

    const enrollments = await tx.enrollment.findMany({ where: { courseId } });
    const studentIds = enrollments.map((e) => e.studentId);

    // Find or create the broadcast conversation for this course
    let conversation = (await tx.conversation.findMany({
      where: { type: "broadcast", courseId },
    }))[0];

    if (!conversation) {
      conversation = await tx.conversation.create({
        data: {
          type: "broadcast",
          courseId,
          courseName: course.title || course.name,
          teacherId: req.user.id,
          participantIds: [req.user.id, ...studentIds],
          unreadByUserId: {},
        },
      });
    } else {
      // Keep participant list in sync with current enrollments
      conversation = await tx.conversation.update({
        where: { id: conversation.id },
        data: { participantIds: [req.user.id, ...studentIds] },
      });
    }

    await appendMessage(tx, conversation, req.user.id, text);

    // Create notifications for all students
    const teacher = await tx.user.findUnique({ where: { id: req.user.id } });
    const recipients = conversation.participantIds.filter((id) => id !== req.user.id);
    if (recipients.length) {
      await tx.notification.createMany({
        data: recipients.map((studentId) => ({
          userId: studentId,
          type: "message",
          icon: "fa-solid fa-bullhorn",
          color: "#DBEAFE",
          title: `Announcement: ${conversation.courseName}`,
          body: `${teacher?.name || "Teacher"}: ${text.substring(0, 60)}${text.length > 60 ? "..." : ""}`,
          time: "Just now",
          read: false,
          category: "Messages",
        })),
      });
    }

    return conversation.id;
  });

  const store = await loadStore();
  const conversation = store.conversations.find((c) => c.id === conversationId);
  res.status(201).json({ data: formatConversation(conversation, req.user.id, store) });
}));

// Mark a conversation as read for the current user
app.patch("/api/messages/conversations/:id/read", authenticate, asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conversation) throw new ApiError(404, "Conversation not found.");
  if (!conversation.participantIds.includes(req.user.id)) throw new ApiError(403, "Not a participant.");
  const unread = { ...(conversation.unreadByUserId || {}), [req.user.id]: 0 };
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { unreadByUserId: unread },
  });
  res.json({ success: true });
}));

app.get("/api/notifications", authenticate, asyncHandler(async (req, res) => {
  const store = await loadStore();
  res.json({ data: notificationsForUser(req.user.id, store) });
}));

app.patch("/api/notifications/read-all", authenticate, asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id },
    data: { read: true },
  });
  res.json({ success: true });
}));

app.patch("/api/notifications/:id/read", authenticate, asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.user.id) throw new ApiError(404, "Notification not found.");
  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { read: true },
  });
  res.json({ data: updated });
}));

app.get("/api/certificates", authenticate, asyncHandler(async (req, res) => {
  const store = await loadStore();
  const data = req.user.role === "teacher"
    ? store.certificates
    : store.certificates.filter((item) => item.studentId === req.user.id);
  res.json({ data: data.map((item) => formatCertificate(item, store)) });
}));

app.post("/api/certificates/issue", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  if (req.body.certificateId) {
    const certificate = await prisma.$transaction(async (tx) => {
      const existing = await tx.certificate.findUnique({ where: { id: req.body.certificateId } });
      if (!existing) throw new ApiError(404, "Certificate not found.");
      if (existing.teacherId !== req.user.id) {
        throw new ApiError(403, "You can only issue certificates for your own courses.");
      }

      const course = await tx.course.findUnique({ where: { id: existing.courseId || "" } });
      if (!course) throw new ApiError(404, "Course not found.");

      const credentialId = existing.credentialId && !existing.credentialId.startsWith("Unlocks")
        ? existing.credentialId
        : `SLP-${Date.now()}`;

      return tx.certificate.update({
        where: { id: existing.id },
        data: {
          status: "Earned",
          issuer: req.user.name,
          issued: new Date().toISOString(),
          credentialId,
          title: existing.title || course.title || course.name || "Course Completion",
          ...(req.body.score !== undefined ? { score: req.body.score } : {}),
          ...(req.body.hours !== undefined ? { hours: Number(req.body.hours || 0) } : {}),
        },
      });
    });
    res.json({ data: formatCertificate(certificate, await loadStore()) });
    return;
  }

  const certificate = await prisma.$transaction(async (tx) => {
    const course = await tx.course.findUnique({ where: { id: req.body.courseId || "" } });
    const student = await tx.user.findUnique({ where: { id: req.body.studentId || "" } });
    const enrollment = await tx.enrollment.findFirst({
      where: { courseId: req.body.courseId, studentId: req.body.studentId },
    });

    if (!course) throw new ApiError(404, "Course not found.");
    if (course.teacherId !== req.user.id) throw new ApiError(403, "You can only issue certificates for your own courses.");
    if (!student || student.role !== "student") throw new ApiError(404, "Student not found.");
    if (!enrollment) throw new ApiError(400, "Student is not enrolled in this course.");

    return tx.certificate.create({
      data: {
        studentId: req.body.studentId,
        courseId: req.body.courseId,
        teacherId: req.user.id,
        title: req.body.title || "Course Completion",
        issuer: req.user.name,
        issued: new Date().toISOString(),
        status: "Earned",
        credentialId: `SLP-${Date.now()}`,
        score: req.body.score || "100%",
        hours: Number(req.body.hours || 0),
      },
    });
  });
  res.status(201).json({ data: formatCertificate(certificate, await loadStore()) });
}));

app.get("/api/certificates/verify/:credentialId", asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findFirst({ where: { credentialId: req.params.credentialId } });
  if (!certificate) throw new ApiError(404, "Credential not found.");
  res.json({ valid: true, data: certificate });
}));

app.get("/api/analytics/teacher", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const store = await loadStore();
  res.json(teacherAnalytics(req.user.id, store));
}));

app.post("/api/ai/teacher-tool", authenticate, requireRole("teacher"), asyncHandler(async (req, res) => {
  const { tool, prompt } = req.body;
  if (!prompt) throw new ApiError(400, "Prompt is required.");
  res.json({ output: await generateAiResponse(tool || "Teaching Tool", prompt) });
}));

app.post("/api/ai/student-assistant", authenticate, requireRole("student"), asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) throw new ApiError(400, "Prompt is required.");
  res.json({ output: await generateAiResponse("Student Study Assistant", prompt) });
}));

app.use((req, res) => {
  res.status(404).json({ detail: "Route not found." });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ detail: err.message || "Internal server error." });
});

const port = Number(process.env.PORT || 8000);
app.listen(port, () => {
  console.log(`Smart Learning Platform API running on http://localhost:${port}`);
});

// Adds a message to a conversation (within a Prisma transaction `tx`), updating
// the conversation timestamp and incrementing unread counts for other members.
async function appendMessage(tx, conversation, senderId, text) {
  const now = new Date();
  const unread = { ...(conversation.unreadByUserId || {}) };
  conversation.participantIds
    .filter((id) => id !== senderId)
    .forEach((id) => {
      unread[id] = Number(unread[id] || 0) + 1;
    });

  await tx.message.create({
    data: { conversationId: conversation.id, senderId, text, createdAt: now },
  });
  await tx.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: now, unreadByUserId: unread },
  });
}

function authPayload(user) {
  return {
    token: signUserToken(user),
    user: sanitizeUser(user),
  };
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function profileUpdatesFromBody(body, role) {
  const profile = { ...(body.profile || {}) };
  const directFields = ["college", "year", "institution", "experience"];

  directFields.forEach((field) => {
    if (body[field] !== undefined) profile[field] = body[field];
  });

  if (body.department !== undefined) {
    profile[role === "teacher" ? "institution" : "college"] = body.department;
  }

  return profile;
}

function cleanString(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function toNonNegativeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizeCourseStatus(value) {
  const status = cleanString(value).toLowerCase();
  return ["draft", "active", "published", "archived"].includes(status) ? status : "draft";
}

function normalizeAssignmentStatus(value) {
  const status = cleanString(value).toLowerCase();
  return ["upcoming", "active", "grading", "closed"].includes(status) ? status : "upcoming";
}

function liveClassScheduleFromBody(body) {
  const rawDateTime = cleanString(body.scheduledFor || body.scheduledAt);
  const rawDate = cleanString(body.date);
  const rawTime = cleanString(body.time);

  if (rawDateTime) {
    const localMatch = rawDateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if (localMatch) {
      return { date: localMatch[1], time: localMatch[2] };
    }

    const parsed = new Date(rawDateTime);
    if (!Number.isNaN(parsed.valueOf())) {
      return {
        date: parsed.toISOString().slice(0, 10),
        time: parsed.toISOString().slice(11, 16),
      };
    }
  }

  return {
    date: rawDate || new Date().toISOString().slice(0, 10),
    time: rawTime || "10:00",
  };
}

function normalizeDuration(value) {
  const cleaned = cleanString(value);
  if (!cleaned) return "60 min";
  return /^\d+$/.test(cleaned) ? `${cleaned} min` : cleaned;
}

function normalizeTags(tags) {
  const source = Array.isArray(tags) ? tags : cleanString(tags).split(",");
  return source.map(cleanString).filter(Boolean);
}

function normalizeModules(modules) {
  if (!Array.isArray(modules)) return [];
  return modules.map((module, index) => {
    const lessons = Array.isArray(module?.lessons)
      ? module.lessons.map(cleanString).filter(Boolean)
      : [];

    return {
      id: module?.id ?? index + 1,
      title: cleanString(module?.title) || `Module ${index + 1}`,
      lessons,
    };
  });
}

function countLessons(modules) {
  return modules.reduce((total, module) => total + (Array.isArray(module.lessons) ? module.lessons.length : 0), 0);
}

function isPublicCourse(course) {
  return Boolean(course) && course.isPublic !== false && !["draft", "archived"].includes(normalizeCourseStatus(course.status));
}

function enrichCourse(course, store) {
  if (!course) return null;
  const teacher = store.users.find((user) => user.id === course.teacherId);
  return {
    ...course,
    title: course.title || course.name,
    name: course.name || course.title,
    instructor: teacher?.name || "JAWA EDTECH",
    teacher: teacher?.name || "JAWA EDTECH",
  };
}

function formatLiveClass(liveClass, store) {
  const teacher = store.users.find((user) => user.id === liveClass.teacherId);
  const scheduledAt = liveClass.scheduledAt || liveClass.scheduledFor || scheduledAtFromParts(liveClass.date, liveClass.time);
  const attendeeCount = Array.isArray(liveClass.studentIds) ? liveClass.studentIds.length : 0;

  return {
    ...liveClass,
    scheduledAt,
    scheduledFor: scheduledAt,
    teacher: teacher?.name || "Instructor",
    instructor: teacher?.name || "Instructor",
    attendees: liveClass.attendees ?? attendeeCount,
    durationMinutes: durationMinutes(liveClass.duration),
  };
}

function scheduledAtFromParts(date, time) {
  const safeDate = cleanString(date);
  if (!safeDate) return "";

  const safeTime = to24HourTime(time) || "00:00";
  return `${safeDate}T${safeTime}:00`;
}

function to24HourTime(value) {
  const raw = cleanString(value);
  if (!raw) return "";

  const simple = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (simple) {
    return `${simple[1].padStart(2, "0")}:${simple[2]}`;
  }

  const meridian = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!meridian) return "";

  let hour = Number(meridian[1]);
  const minute = meridian[2] || "00";
  const period = meridian[3].toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function durationMinutes(value) {
  const match = cleanString(value).match(/\d+/);
  return match ? Number(match[0]) : 60;
}

function formatCertificate(certificate, store) {
  const student = store.users.find((user) => user.id === certificate.studentId);
  const course = store.courses.find((item) => item.id === certificate.courseId);
  const courseName = course?.title || course?.name || certificate.title || "Course";

  return {
    ...certificate,
    title: certificate.title || courseName,
    studentName: student?.name || "Unknown Student",
    student: student?.name || "Unknown Student",
    courseName,
    course: courseName,
    issuedAt: isDateValue(certificate.issued) ? certificate.issued : "",
    teacher: certificate.issuer || store.users.find((user) => user.id === certificate.teacherId)?.name || "Instructor",
  };
}

function isDateValue(value) {
  const date = new Date(value);
  return !Number.isNaN(date.valueOf());
}

function studentCourses(studentId, store) {
  return store.enrollments
    .filter((item) => item.studentId === studentId)
    .map((enrollment) => {
      const course = enrichCourse(store.courses.find((item) => item.id === enrollment.courseId), store);
      if (!course) return null;
      return {
        ...course,
        progress: enrollment.progress,
        grade: enrollment.grade,
      };
    })
    .filter(Boolean);
}

function studentPerformance(studentId, store) {
  const courses = studentCourses(studentId, store);
  const assignments = store.assignments.filter((item) => item.studentIds.includes(studentId));
  const submitted = store.submissions.filter((item) => item.studentId === studentId);
  const scores = store.grades.filter((item) => item.studentId === studentId).map((item) => item.score);

  return {
    averageProgress: average(courses.map((course) => course.progress)),
    averageScore: average(scores),
    assignmentCompletion: assignments.length ? Math.round((submitted.length / assignments.length) * 100) : 0,
  };
}

function studentResources(studentId, store) {
  const courseIds = store.enrollments.filter((item) => item.studentId === studentId).map((item) => item.courseId);
  return store.resources.filter((item) => !item.courseId || courseIds.includes(item.courseId));
}

function teacherCourses(teacherId, store) {
  return store.courses.filter((course) => course.teacherId === teacherId);
}

function teacherEnrollments(teacherId, store) {
  const courseIds = new Set(teacherCourses(teacherId, store).map((course) => course.id));
  return store.enrollments.filter((enrollment) => courseIds.has(enrollment.courseId));
}

function teacherStudents(teacherId, store) {
  const courseById = new Map(teacherCourses(teacherId, store).map((course) => [course.id, course]));

  return store.enrollments
    .filter((enrollment) => courseById.has(enrollment.courseId))
    .map((enrollment) => {
      const user = store.users.find((item) => item.id === enrollment.studentId);
      const course = courseById.get(enrollment.courseId);
      if (!user || !course) return null;

      return {
        id: user.id,
        name: user.name,
        initials: initials(user.name),
        color: user.avatarColor,
        course: course.title || course.name,
        courseId: course.id,
        progress: enrollment.progress,
        grade: enrollment.grade || "N/A",
        status: enrollment.progress >= 100 ? "completed" : enrollment.progress < 60 ? "at-risk" : "active",
        joined: formatDate(enrollment.createdAt),
        lastActive: "Today",
        score: enrollment.score || Math.max(50, Math.round(enrollment.progress + 10)),
      };
    })
    .filter(Boolean);
}

function teacherAnalytics(teacherId, store) {
  const courses = teacherCourses(teacherId, store);
  const enrollments = teacherEnrollments(teacherId, store);
  const monthlyRevenue = Array.from({ length: 12 }, () => 0);
  const weeklyEnrollments = Array.from({ length: 7 }, () => 0);
  const completionByDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({ day, completions: 0 }));

  const courseById = new Map(courses.map((course) => [course.id, course]));
  enrollments.forEach((enrollment) => {
    const createdAt = new Date(enrollment.createdAt);
    const course = courseById.get(enrollment.courseId);
    if (!Number.isNaN(createdAt.valueOf())) {
      monthlyRevenue[createdAt.getMonth()] += Number(course?.price || 0);
      weeklyEnrollments[createdAt.getDay()] += 1;
      if (Number(enrollment.progress || 0) >= 100) {
        completionByDay[createdAt.getDay()].completions += 1;
      }
    }
  });

  const totalRevenue = monthlyRevenue.reduce((sum, amount) => sum + amount, 0);

  return {
    overview: {
      totalRevenue: formatCurrency(totalRevenue),
      totalStudents: new Set(enrollments.map((item) => item.studentId)).size,
      avgCompletion: `${average(enrollments.map((item) => item.progress))}%`,
      avgRating: mean(courses.map((item) => item.rating)).toFixed(2),
    },
    weeklyEnrollments,
    monthlyRevenue,
    topCourses: courses
      .slice()
      .sort((a, b) => Number(b.students || 0) - Number(a.students || 0))
      .slice(0, 4)
      .map((course) => enrichCourse(course, store)),
    completionByDay,
  };
}

function teacherCanManageAssignment(teacherId, assignment, store) {
  if (assignment.teacherId === teacherId) return true;
  const course = store.courses.find((item) => item.id === assignment.courseId);
  return course?.teacherId === teacherId;
}

function resolveTeacherCourse(teacherId, courseId, store) {
  const cleanedCourseId = cleanString(courseId);
  if (!cleanedCourseId) return null;

  const course = store.courses.find((item) => item.id === cleanedCourseId);
  if (!course) throw new ApiError(404, "Course not found.");
  if (course.teacherId !== teacherId) throw new ApiError(403, "You can only use your own courses.");
  return course;
}

function canAccessLiveClass(user, liveClass) {
  if (user.role === "teacher") return liveClass.teacherId === user.id;
  return liveClass.studentIds.includes(user.id);
}

function canAccessResource(user, resource, store) {
  if (user.role === "teacher") return resource.teacherId === user.id;
  if (!resource.courseId) return true;
  return store.enrollments.some((item) => item.studentId === user.id && item.courseId === resource.courseId);
}

function isToday(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function average(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value));
  return numbers.length ? Math.round(mean(numbers)) : 0;
}

function mean(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value));
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
}

function formatCurrency(value) {
  return `$${Math.round(Number(value) || 0).toLocaleString("en-US")}`;
}

function notificationsForUser(userId, store) {
  return store.notifications.filter((item) => item.userId === userId);
}

function conversationsForUser(userId, store) {
  return store.conversations
    .filter((conversation) => conversation.participantIds.includes(userId))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((conversation) => formatConversation(conversation, userId, store));
}

function formatConversation(conversation, userId, store) {
  const type = conversation.type || "private";
  const last = conversation.messages[conversation.messages.length - 1] || {};

  if (type === "broadcast") {
    // For broadcast: show teacher name/info as the sender context
    const teacher = store.users.find((u) => u.id === conversation.teacherId) || { name: "Teacher", avatarColor: "#064E3B" };
    return {
      id: conversation.id,
      type: "broadcast",
      courseId: conversation.courseId || null,
      courseName: conversation.courseName || "Course",
      name: `📢 ${conversation.courseName || "Announcement"}`,
      initials: "📢",
      color: "#0F766E",
      teacherId: conversation.teacherId,
      teacherName: teacher.name,
      preview: last.text || "",
      time: last.createdAt ? formatDate(last.createdAt) : "",
      unread: conversation.unreadByUserId?.[userId] || 0,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        from: message.senderId === userId ? "me" : "them",
        text: message.text,
        time: formatTime(message.createdAt),
        createdAt: message.createdAt,
      })),
    };
  }

  // Private conversation
  const otherId = conversation.participantIds.find((id) => id !== userId);
  const other = store.users.find((user) => user.id === otherId) || { name: "Conversation", avatarColor: "#064E3B" };
  return {
    id: conversation.id,
    type: "private",
    courseId: conversation.courseId || null,
    courseName: conversation.courseName || null,
    name: other.name,
    otherUserId: otherId,
    otherUserName: other.name,
    initials: initials(other.name),
    color: other.avatarColor || "#064E3B",
    preview: last.text || "",
    time: last.createdAt ? formatDate(last.createdAt) : "",
    unread: conversation.unreadByUserId?.[userId] || 0,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      from: message.senderId === userId ? "me" : "them",
      text: message.text,
      time: formatTime(message.createdAt),
      createdAt: message.createdAt,
    })),
  };
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

async function generateAiResponse(tool, prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return [
      `${tool} response`,
      "",
      `Input: ${prompt}`,
      "",
      "Set ANTHROPIC_API_KEY in backend/.env to enable live AI generation. For now, this local backend returns a structured placeholder so the UI flow works without exposing secrets in the browser.",
    ].join("\n");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are an AI learning platform assistant. Task: ${tool}.\n\nInput: ${prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new ApiError(502, "AI provider request failed.");
  }

  const data = await response.json();
  return data.content?.map((block) => block.text || "").join("") || "No response generated.";
}
