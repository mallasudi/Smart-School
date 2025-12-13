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
  getTeacherSubjectForClass,
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
  getTeacherClassStudents,
} from "../controllers/teacherClassesController.js";


import { teacherGetFeedbackInbox } from "../controllers/feedbackMessageController.js";
// ======= TEACHER REPLY TO FEEDBACK =======
import { teacherReplyFeedbackMessage } from "../controllers/feedbackMessageController.js";

import upload from "../utils/upload.js";
import {
  uploadMaterial,
  getTeacherMaterials,
  deleteMaterial
} from "../controllers/materialController.js";

import {
  createAssignment,
  teacherListAssignments,
  teacherViewSubmissions,
  deleteAssignment,
} from "../controllers/assignmentController.js";


const router = express.Router();

//  All teacher routes protected & teacher-only
router.use(verifyToken);

// ASSIGNMENTS
router.post("/assignments", createAssignment);
router.get("/assignments", teacherListAssignments);
router.get("/assignments/:id/submissions", teacherViewSubmissions);
router.delete("/assignments/:id", deleteAssignment);


router.use(requireRole("teacher"));

// ======= CLASSES & TERM RESULTS =======
router.get("/classes", getTeacherClasses);
router.get("/results/class/:classId/term/:term", teacherGetTermResults);
router.get(
  "/class/:classId/students",
  getTeacherClassStudents
);

router.get("/subject/:classId", getTeacherSubjectForClass);


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

router.post("/feedback/messages/:messageId/reply", teacherReplyFeedbackMessage);

// MATERIAL ROUTES
router.post("/materials/upload", upload.single("file"), uploadMaterial);
router.get("/materials", getTeacherMaterials);
router.delete("/materials/:id", deleteMaterial);


export default router;
