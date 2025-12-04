// backend/src/routes/teacherRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleAuth.js";
import { teacherListNotices } from "../controllers/noticeController.js";

import {
  getTeacherProfile,
  updateTeacherProfile,
  changeTeacherPassword,
  assignSubjectToTeacher,
} from "../controllers/teacherController.js";

import {
  teacherListExams,
  teacherGetExamMarks,
  teacherSaveExamMarks,
  teacherGetQuestions,
  teacherCreateQuestion,
  teacherUpdateQuestion,
  teacherDeleteQuestion,
  teacherListResults,
} from "../controllers/examController.js";

import {
  getTeacherClasses,
  teacherGetTermResults,
} from "../controllers/teacherClassesController.js";

import { teacherListFeedbackMessages } from "../controllers/feedbackMessageController.js";
import { teacherGetFeedbackInbox } from "../controllers/feedbackMessageController.js";

const router = express.Router();

// 🔐 All teacher routes protected & teacher-only
router.use(verifyToken);
router.use(requireRole("teacher"));

// ======= CLASSES & TERM RESULTS =======
router.get("/classes", getTeacherClasses);
router.get("/results/class/:classId/term/:term", teacherGetTermResults);

// ======= PROFILE =======
router.get("/profile", getTeacherProfile);
router.put("/profile", updateTeacherProfile);
router.put("/change-password", changeTeacherPassword);

// ======= EXAMS =======
router.get("/exams", teacherListExams);
router.get("/notices", teacherListNotices);

// ======= MARKS =======
router.get("/exams/:examId/marks", teacherGetExamMarks);
router.post("/exams/:examId/marks", teacherSaveExamMarks);

// ======= QUESTIONS =======
router.get("/exams/:examId/questions", teacherGetQuestions);
router.post("/exams/:examId/questions", teacherCreateQuestion);
router.put("/questions/:questionId", teacherUpdateQuestion);
router.delete("/questions/:questionId", teacherDeleteQuestion);

// ======= PER-EXAM RESULTS =======
router.get("/exams/:examId/results", teacherListResults);

// ======= SUBJECT ASSIGN =======
router.put("/assign-subject", assignSubjectToTeacher);

// ======= FEEDBACK INBOX =======
router.get("/feedback/messages", teacherGetFeedbackInbox);
router.get("/feedback/messages", teacherListFeedbackMessages);


export default router;
