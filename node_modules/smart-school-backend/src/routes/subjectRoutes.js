// backend/src/routes/subjectRoutes.js
import express from "express";
import { prisma } from "../utils/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleAuth.js";

const router = express.Router();

// GET all subjects (admin only)
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teacher: true,
        class: true,
      },
    });
    res.json({ subjects });
  } catch (err) {
    console.error("GET subjects error:", err);
    res.status(500).json({ message: "Failed to load subjects" });
  }
});

export default router;
