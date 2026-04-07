// backend/src/middleware/roleAuth.js

// roleOrRoles: "admin" OR ["admin", "teacher"]
export const requireRole = (roleOrRoles) => {
  const allowedRoles = Array.isArray(roleOrRoles)
    ? roleOrRoles.map((r) => r.toLowerCase())
    : [roleOrRoles.toLowerCase()];

  return (req, res, next) => {
    const currentRole = (req.user?.role || "").toLowerCase();

    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
