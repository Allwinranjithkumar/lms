const { PrismaClient } = require("@prisma/client");

// Single shared Prisma client for the whole backend. Reused across requests so
// the connection pool is not re-created on every query.
const prisma = global.__jawaPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__jawaPrisma = prisma;
}

module.exports = prisma;
