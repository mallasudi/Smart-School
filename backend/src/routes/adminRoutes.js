// backend/src/routes/adminRoutes.js
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


/* -------------------- NOTICES -------------------- */
import {
  adminGetNotices,
  adminCreateNotice,
  adminUpdateNotice,
  adminDeleteNotice
} from "../controllers/noticeController.js";


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

export default router;
