// backend/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded: { id, role }
    req.user = {
      id: decoded.id,
      role: (decoded.role || "").toLowerCase(),
    };
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
