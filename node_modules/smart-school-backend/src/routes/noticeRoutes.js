// backend/src/routes/noticeRoutes.js
import express from "express";
import { prisma } from "../utils/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   GET NOTICES (ROLE-BASED)
   - Student: exam notices + admin notices
   - Parent:  linked-student class notices + admin notices
   - Teacher: classes they teach + admin notices
   - Admin:   only admin-created notices (exam_id = null)
========================================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    // ========== STUDENT ==========
    if (role === "student") {
      const student = await prisma.student.findUnique({
        where: { user_id: userId },
      });

      if (!student) return res.json({ notices: [] });

      const notices = await prisma.notice.findMany({
        where: {
          OR: [
            // ✅ existing exam/class based student notices
            { target: "student", class_id: student.class_id },

            // ✅ admin: global notice to everyone
            { target: "all" },

            // ✅ admin: student-only global (no class filter)
            { target: "student", class_id: null },

            // ✅ admin: class-based broadcast (target: "class")
            { target: "class", class_id: student.class_id },
          ],
        },
        orderBy: { created_at: "desc" },
      });

      return res.json({ notices });
    }

    // ========== PARENT ==========
    if (role === "parent") {
      const parent = await prisma.parent.findUnique({
        where: { user_id: userId },
        include: { students: true }, // parent can have multiple students
      });

      if (!parent || parent.students.length === 0) {
        return res.json({ notices: [] });
      }

      const classIds = parent.students
        .map((s) => s.class_id)
        .filter((c) => c !== null);

      if (classIds.length === 0) {
        return res.json({ notices: [] });
      }

      const notices = await prisma.notice.findMany({
        where: {
          OR: [
            // ✅ existing behaviour: only classes of linked students
            { target: "parent", class_id: { in: classIds } },

            // ✅ admin: global
            { target: "all" },

            // ✅ admin: parent-only global
            { target: "parent", class_id: null },

            // ✅ admin: class-based broadcast for those classes
            { target: "class", class_id: { in: classIds } },
          ],
        },
        orderBy: { created_at: "desc" },
      });

      return res.json({ notices });
    }

    // ========== TEACHER ==========
    if (role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { user_id: userId },
      });

      if (!teacher) return res.json({ notices: [] });

      // which classes this teacher teaches
      const subjects = await prisma.subject.findMany({
        where: { teacher_id: teacher.teacher_id },
        select: { class_id: true },
      });

      const classIds = subjects
        .map((s) => s.class_id)
        .filter((c) => c !== null);

      const notices = await prisma.notice.findMany({
        where: {
          OR: [
            // ✅ exam / existing teacher notices tied to class
            { target: "teacher", class_id: { in: classIds } },

            // ✅ admin: teacher-only global
            { target: "teacher", class_id: null },

            // ✅ admin: global
            { target: "all" },

            // ✅ admin: class broadcast
            { target: "class", class_id: { in: classIds } },
          ],
        },
        orderBy: { created_at: "desc" },
      });

      return res.json({ notices });
    }

    // ========== ADMIN ==========
    if (role === "admin") {
      // Only admin-created notices (NO exam notices)
      const notices = await prisma.notice.findMany({
        where: { exam_id: null },
        orderBy: { created_at: "desc" },
      });

      return res.json({ notices });
    }

    console.log("ROLE FROM TOKEN =", role);
    return res.json({ notices: [] });
  } catch (err) {
    console.error("GET notices error:", err);
    res.status(500).json({ message: "Failed to load notices" });
  }
});

/* =========================================
   CREATE NOTICE (ADMIN ONLY)
========================================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create notices" });
    }

    const { title, message, status, target, notice_date, class_id } = req.body;

    if (!title || !message || !target) {
      return res
        .status(400)
        .json({ message: "Title, message and target are required" });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        message,
        status: status || "Active",
        target,
        class_id: class_id ? Number(class_id) : null,
        notice_date: notice_date ? new Date(notice_date) : null,
        exam_id: null, // ✅ mark as admin notice, not exam
      },
    });

    return res.status(201).json({ notice });
  } catch (err) {
    console.error("CREATE notice error:", err);
    res.status(500).json({ message: "Failed to create notice" });
  }
});

/* =========================================
   UPDATE NOTICE (ADMIN ONLY)
========================================= */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update notices" });
    }

    const noticeId = Number(req.params.id);
    if (!noticeId) {
      return res.status(400).json({ message: "Invalid notice id" });
    }

    const { title, message, status, target, notice_date, class_id } = req.body;

    const notice = await prisma.notice.update({
      where: { notice_id: noticeId },
      data: {
        title,
        message,
        status,
        target,
        class_id: class_id ? Number(class_id) : null,
        notice_date: notice_date ? new Date(notice_date) : null,
      },
    });

    return res.json({ notice });
  } catch (err) {
    console.error("UPDATE notice error:", err);
    res.status(500).json({ message: "Failed to update notice" });
  }
});

/* =========================================
   DELETE NOTICE (ADMIN ONLY)
========================================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete notices" });
    }

    const noticeId = Number(req.params.id);
    if (!noticeId) {
      return res.status(400).json({ message: "Invalid notice id" });
    }

    await prisma.notice.delete({
      where: { notice_id: noticeId },
    });

    return res.json({ message: "Notice deleted" });
  } catch (err) {
    console.error("DELETE notice error:", err);
    res.status(500).json({ message: "Failed to delete notice" });
  }
});

export default router;
