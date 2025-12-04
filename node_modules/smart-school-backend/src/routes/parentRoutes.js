import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleAuth.js";

import { parentGetResults } from "../controllers/parentResultController.js";
import { parentListNotices } from "../controllers/noticeController.js";
import { parentGetTermResult } from "../controllers/parentResultController.js";

import { parentSendFeedbackMessage } from "../controllers/feedbackMessageController.js";
import { parentSubmitSurveyFeedback } from "../controllers/surveyFeedbackController.js";

const router = express.Router();

router.use(verifyToken);
router.use(requireRole("parent"));

router.get("/results", parentGetResults);
router.get("/notices", parentListNotices);
router.get("/results/term/:term", parentGetTermResult);

// 🔹 Parent → send free-form feedback message
router.post("/feedback/message", parentSendFeedbackMessage);

// 🔹 Parent → submit survey feedback
router.post("/feedback/survey", parentSubmitSurveyFeedback);

export default router;
