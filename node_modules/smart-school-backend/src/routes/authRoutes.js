// backend/src/routes/authRoutes.js
import express from "express";
import {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";

import { registerParent } from "../controllers/parentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔓 Public auth endpoints
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Parent self-registration (Student ID + DOB)
router.post("/register-parent", registerParent);

// 🔐 Protected auth endpoint
router.post("/change-password", verifyToken, changePassword);

export default router;
