const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const { ApiError } = require("./http");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function signUserToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    next(new ApiError(401, "Authentication required."));
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      next(new ApiError(401, "User no longer exists."));
      return;
    }
    req.user = user;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token."));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      next(new ApiError(403, "You do not have access to this resource."));
      return;
    }
    next();
  };
}

module.exports = { authenticate, requireRole, signUserToken };
