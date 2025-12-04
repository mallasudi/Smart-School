// backend/src/controllers/authController.js
import { prisma } from "../utils/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* ========================================================
   LOGIN  (admin / teacher / student / parent)
======================================================== */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If you ever set status = "Inactive", this will block login.
    // For now all new users are "Active" by default.
    if (user.status && user.status !== "Active") {
      return res.status(403).json({ message: "Your account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Always lowercase role for API usage
    const apiRole = (user.role || "").toLowerCase();

    const token = jwt.sign(
      { id: user.user_id, role: apiRole },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token,
      role: apiRole,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: apiRole,
        status: user.status || "Active",
      },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ========================================================
   FORGOT PASSWORD
======================================================== */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    return res.status(200).json({
      message: "Password reset link generated successfully.",
      resetLink,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Error generating reset link" });
  }
};

/* ========================================================
   RESET PASSWORD
======================================================== */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { user_id: decoded.id },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }
};

/* ========================================================
   CHANGE PASSWORD (LOGGED-IN USER)
======================================================== */
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // from verifyToken

  try {
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Error changing password" });
  }
};

