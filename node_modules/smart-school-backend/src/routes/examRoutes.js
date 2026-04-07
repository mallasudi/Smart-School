import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleAuth.js";
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam
} from "../controllers/examController.js";

const router = express.Router();

router.use(verifyToken);
router.use(requireRole("admin"));

router.get("/", getAllExams);
router.post("/", createExam);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router;
