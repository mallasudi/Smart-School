import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleAuth.js";

import {
  markAttendance,
  getTodayAttendanceByClass,
  getStudentAttendanceSummary,
  getParentChildAttendanceSummary,
  getAdminAttendanceOverview,
  getStudentSubjectWiseSummary,
} from "../controllers/attendanceController.js";

const router = express.Router();

// TEACHER 
router.post("/mark", verifyToken, requireRole("teacher"), markAttendance);

router.get(
  "/today",
  verifyToken,
  requireRole("teacher"),
  getTodayAttendanceByClass
);

// STUDENT 
router.get(
  "/student/summary",
  verifyToken,
  requireRole("student"),
  getStudentAttendanceSummary
);

router.get(
  "/student/summary/subjects",
  verifyToken,
  requireRole("student"),
  getStudentSubjectWiseSummary
);

//  PARENT 
router.get(
  "/parent/summary",
  verifyToken,
  requireRole("parent"),
  getParentChildAttendanceSummary
);

// ADMIN 
router.get(
  "/admin/overview",
  verifyToken,
  requireRole("admin"),
  getAdminAttendanceOverview
);

export default router;
