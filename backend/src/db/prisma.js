const { PrismaClient } = require("@prisma/client");

function runtimeDatabaseUrl() {
  if (!process.env.DATABASE_URL) return undefined;

  try {
    const url = new URL(process.env.DATABASE_URL);
    if (url.protocol === "postgresql:" || url.protocol === "postgres:") {
      url.searchParams.delete("channel_binding");
    }
    return url.toString();
  } catch {
    return process.env.DATABASE_URL;
  }
}

// Single shared Prisma client for the whole backend. Reused across requests so
// the connection pool is not re-created on every query.
const datasourceUrl = runtimeDatabaseUrl();
const prisma = global.__jawaPrisma || new PrismaClient(
  datasourceUrl
    ? {
        datasources: {
          db: {
            url: datasourceUrl,
          },
        },
      }
    : undefined
);

if (process.env.NODE_ENV !== "production") {
  global.__jawaPrisma = prisma;
}

module.exports = prisma;
