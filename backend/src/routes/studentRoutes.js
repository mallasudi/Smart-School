// backend/src/routes/studentRoutes.js
import express from "express";
import { prisma } from "../utils/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleAuth.js";

import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentController.js";

import { studentGetResults } from "../controllers/studentResultController.js";
import { studentGetTermResult } from "../controllers/studentResultController.js";

const router = express.Router();

/* ==========================================
   PUBLIC: Used by ParentRegister
========================================== */
router.get("/check/:id", async (req, res) => {
  const studentId = Number(req.params.id);

  if (!studentId) {
    return res.status(400).json({ message: "Invalid student id" });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
      select: {
        student_id: true,
        first_name: true,
        last_name: true,
        dob: true,
        gender: true,
        phone: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({
      ...student,
      dob: student.dob ? student.dob.toISOString().split("T")[0] : null,
    });
  } catch (err) {
    console.error("STUDENT CHECK ERROR:", err);
    return res.status(500).json({ message: "Student check failed" });
  }
});

/* ==========================================
   PROTECTED ROUTES: Student only
========================================== */
router.use(verifyToken);
router.use(requireRole("student"));

router.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome Student", user: req.user });
});

router.get("/profile", getStudentProfile);

router.put("/profile", updateStudentProfile);

router.get("/results", studentGetResults);
router.get("/results/term/:term", studentGetTermResult);

export default router;
