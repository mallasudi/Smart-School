import { prisma } from "../utils/prisma.js";
import bcrypt from "bcrypt";

/* =======================
   1. GET TEACHER PROFILE
======================= */
export const getTeacherProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });

    if (!teacher)
      return res.status(404).json({ message: "Teacher profile not found" });

    return res.json({
      profile: {
        first_name: teacher.first_name || "",
        last_name: teacher.last_name || "",
        email: teacher.user.email,
        subject: teacher.subject || "",
        phone: teacher.phone || "",
        address: teacher.address || "",
      }
    });
  } catch (err) {
    console.error("GET TEACHER PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to load teacher profile" });
  }
};

/* =======================
   2. UPDATE TEACHER PROFILE
======================= */
export const updateTeacherProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, subject, phone, address } = req.body;

    // Update teacher table
    await prisma.teacher.update({
      where: { user_id: userId },
      data: { first_name, last_name, subject, phone, address },
    });

    return res.json({ message: "Teacher profile updated successfully" });
  } catch (err) {
    console.error("UPDATE TEACHER PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to update teacher profile" });
  }
};

/* =======================
   3. CHANGE PASSWORD
======================= */
export const changeTeacherPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Current password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashed },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
};
/* =====================================================
   4. ASSIGN SUBJECT TO TEACHER (REAL FIX)
===================================================== */
export const assignSubjectToTeacher = async (req, res) => {
  try {
    const teacherUserId = req.user.id;
    const { subject_id } = req.body;

    if (!subject_id)
      return res.status(400).json({ message: "Subject ID is required" });

    // find teacher_id by logged-in user
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: teacherUserId },
    });

    if (!teacher)
      return res.status(404).json({ message: "Teacher not found" });

    // Update Subject table (REAL LINKING)
    await prisma.subject.update({
      where: { subject_id: Number(subject_id) },
      data: { teacher_id: teacher.teacher_id },
    });

    return res.json({ message: "Subject assigned successfully" });
  } catch (err) {
    console.error("ASSIGN SUBJECT ERROR:", err);
    res.status(500).json({ message: "Failed to assign subject" });
  }
};
