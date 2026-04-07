// backend/src/routes/adminRoutes.js
import { prisma } from "../utils/prisma.js";
import express from "express";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getUserDetails,
  listClasses,
} from "../controllers/adminController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleAuth.js";

// EXAM controller
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
} from "../controllers/examController.js";

import {
  adminGetClassTermResult,
  adminPublishTermResult,
} from "../controllers/termResultController.js";
import {
  adminListResultClasses,
  adminGetClassTermResults,
} from "../controllers/adminResultController.js";

import {
  adminListFeedbackMessages,
} from "../controllers/feedbackMessageController.js";
import {
  adminListSurveyFeedback,
} from "../controllers/surveyFeedbackController.js";

import {
  adminMonthlyAttendance,
  adminClassAttendance,
  adminLatestAttendance
} from "../controllers/adminAttendanceController.js";


/* -------------------- NOTICES -------------------- */
import {
  adminGetNotices,
  adminCreateNotice,
  adminUpdateNotice,
  adminDeleteNotice
} from "../controllers/noticeController.js";

import { createFee, adminListFees } from "../controllers/feeController.js";


const router = express.Router();

// All admin routes protected
router.use(verifyToken);
router.use(requireRole("admin"));

/* -------------------- USERS -------------------- */
router.get("/users", getUsers);
router.get("/users/:id/details", getUserDetails);
router.post("/users", addUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

/* -------------------- CLASSES (for dropdown) --- */
router.get("/classes", listClasses);

/* -------------------- EXAMS -------------------- */
router.get("/exams", getAllExams);
router.post("/exams", createExam);
router.put("/exams/:id", updateExam);
router.delete("/exams/:id", deleteExam);

router.get("/results/term/:classId/:term", adminGetClassTermResult);
router.post("/results/term/:classId/:term/publish", adminPublishTermResult);
// ====================== RESULTS (CLASS TERM) =====================
router.get("/results/classes", adminListResultClasses);
router.get("/results/class", adminGetClassTermResults);

// Admin → get all notices
router.get("/notices", adminGetNotices);

// Admin → create notice
router.post("/notices", adminCreateNotice);

// Admin → update notice
router.put("/notices/:id", adminUpdateNotice);

// Admin → delete notice
router.delete("/notices/:id", adminDeleteNotice);

/* -------------------- FEEDBACK -------------------- */
// Admin → view all message feedback
router.get("/feedback/messages", adminListFeedbackMessages);

// Admin → view all survey feedback
router.get("/feedback/surveys", adminListSurveyFeedback);

// ADMIN ATTENDANCE API
router.get("/attendance/monthly", adminMonthlyAttendance);
router.get("/attendance/classes", adminClassAttendance);
router.get("/attendance/latest", adminLatestAttendance);

// FEES
router.post("/fees", createFee);
router.get("/fees", adminListFees);

// GET ALL STUDENTS (for fee assignment)
router.get("/students", async (req, res) => {
  try {
    const list = await prisma.student.findMany({
      include: { user: true },
    });

    res.json(
      list.map((s) => ({
        student_id: s.student_id,
        first_name: s.first_name,
        last_name: s.last_name,
        class: s.class,
      }))
    );
  } catch (err) {
    console.error("LOAD STUDENTS ERROR:", err);
    res.status(500).json({ message: "Failed to load students" });
  }
});


export default router;
