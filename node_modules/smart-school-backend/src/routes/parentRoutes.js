import express from "express";
import { prisma } from "../utils/prisma.js"; 
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleAuth.js";

import { parentGetResults } from "../controllers/parentResultController.js";
import { parentListNotices } from "../controllers/noticeController.js";
import { parentGetTermResult } from "../controllers/parentResultController.js";

import { parentSendFeedbackMessage } from "../controllers/feedbackMessageController.js";
import { parentSubmitSurveyFeedback } from "../controllers/surveyFeedbackController.js";
import { getParentChildAttendanceSummary } from "../controllers/attendanceController.js";
import {
  getParentProfile,
  updateParentProfile,
  changeParentPassword
} from "../controllers/parentController.js";

import { parentListFees, parentPayFee } from "../controllers/feeController.js";


const router = express.Router();

router.use(verifyToken);
router.use(requireRole("parent"));
// PROFILE ROUTES
router.get("/profile", getParentProfile);
router.put("/profile", updateParentProfile);

// PASSWORD
router.put("/change-password", changeParentPassword);

router.get("/results", parentGetResults);
router.get("/notices", parentListNotices);
router.get("/results/term/:term", parentGetTermResult);

// 🔹 Parent → send free-form feedback message
router.post("/feedback/message", parentSendFeedbackMessage);

// 🔹 Parent → submit survey feedback
router.post("/feedback/survey", parentSubmitSurveyFeedback);
router.get("/attendance/summary", getParentChildAttendanceSummary);

router.get("/fees", parentListFees);
router.post("/fees/pay/:fee_id", parentPayFee);

router.get("/fees", async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { user_id: req.user.id },
    });

    if (!parent) return res.status(404).json({ message: "Parent not found" });

    const fees = await prisma.fee.findMany({
      where: { student_id: parent.student_id },
      orderBy: { due_date: "asc" }
    });

    res.json(fees);
  } catch (err) {
    console.error("PARENT FEE ERROR:", err);
    res.status(500).json({ message: "Failed to load fees" });
  }
});


export default router;
