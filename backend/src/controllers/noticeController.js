// backend/src/controllers/noticeController.js
import { prisma } from "../utils/prisma.js";

/* ============================================================
   ADMIN – GET ALL NOTICES
============================================================ */
export const adminGetNotices = async (req, res) => {
  try {
    // Fetch all notices
    const notices = await prisma.notice.findMany({
      orderBy: { notice_id: "desc" },
    });

    const today = new Date();

    // Auto-update expired status
    const updatedNotices = await Promise.all(
      notices.map(async (n) => {
        let newStatus = n.status;

        if (n.notice_date) {
          const nDate = new Date(n.notice_date);
          if (nDate < today) newStatus = "Expired";
        }

        // Update DB only if changed
        if (newStatus !== n.status) {
          await prisma.notice.update({
            where: { notice_id: n.notice_id },
            data: { status: newStatus },
          });
          n.status = newStatus;
        }

        return n;
      })
    );

    return res.json({ notices: updatedNotices });
  } catch (err) {
    console.error("ADMIN GET NOTICES ERROR:", err);
    return res.status(500).json({ message: "Failed to load notices" });
  }
};

/* ============================================================
   ADMIN – CREATE NOTICE
============================================================ */
export const adminCreateNotice = async (req, res) => {
  try {
    const { title, message, target, class_id, exam_id } = req.body;

    const notice = await prisma.notice.create({
      data: {
        title,
        message,
        target,
        class_id: class_id ? Number(class_id) : null,
        exam_id: exam_id ? Number(exam_id) : null,
      },
    });

    return res.status(201).json({ notice });
  } catch (err) {
    console.error("ADMIN CREATE NOTICE ERROR:", err);
    return res.status(500).json({ message: "Failed to create notice" });
  }
};

/* ============================================================
   ADMIN – UPDATE NOTICE  (FIXED)
============================================================ */
export const adminUpdateNotice = async (req, res) => {
  try {
    const id = Number(req.params.id);

    let { title, message, target, class_id, exam_id, notice_date, status } =
      req.body;

    // If notice_date is empty "", convert to null
    if (!notice_date || notice_date === "") {
      notice_date = null;
    } else {
      notice_date = new Date(notice_date);
    }

    // Auto-update status based on date
    if (notice_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDate = new Date(notice_date);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        status = "Expired";
      } else {
        status = "Active";
      }
    }

    const updatedNotice = await prisma.notice.update({
      where: { notice_id: id },
      data: {
        title,
        message,
        target,
        status,
        notice_date,
        class_id: class_id ? Number(class_id) : null,
        exam_id: exam_id ? Number(exam_id) : null,
      },
    });

    return res.json({ notice: updatedNotice });
  } catch (err) {
    console.error("ADMIN UPDATE NOTICE ERROR:", err);
    return res.status(500).json({ message: "Failed to update notice" });
  }
};


/* ============================================================
   ADMIN – DELETE NOTICE
============================================================ */
export const adminDeleteNotice = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.notice.delete({
      where: { notice_id: id },
    });

    return res.json({ message: "Notice deleted" });
  } catch (err) {
    console.error("ADMIN DELETE NOTICE ERROR:", err);
    return res.status(500).json({ message: "Failed to delete notice" });
  }
};

/* ============================================================
   STUDENT NOTICES  
   target: "student", class-based
============================================================ */
export const studentListNotices = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
    });

    if (!student) return res.json({ notices: [] });

    const today = new Date();

    const notices = await prisma.notice.findMany({
      where: {
        target: "student",
        class_id: student.class_id,
        OR: [
          { notice_date: null },
          { notice_date: { gte: today } }
        ]
      },
      orderBy: { notice_id: "desc" },
    });

    return res.json({ notices });
  } catch (err) {
    console.error("STUDENT NOTICES ERROR:", err);
    res.status(500).json({ message: "Failed to load notices" });
  }
};


/* ============================================================
   PARENT NOTICES  
   All children’s classes
============================================================ */
export const parentListNotices = async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { user_id: req.user.id },
      include: { students: true },
    });

    if (!parent || parent.students.length === 0)
      return res.json({ notices: [] });

    const classIds = parent.students
      .map((s) => s.class_id)
      .filter((id) => id !== null);

    const today = new Date();

    const notices = await prisma.notice.findMany({
      where: {
        target: "parent",
        class_id: { in: classIds },
        OR: [
          { notice_date: null },
          { notice_date: { gte: today } }
        ]
      },
      orderBy: { notice_id: "desc" },
    });

    return res.json({ notices });
  } catch (err) {
    console.error("PARENT NOTICES ERROR:", err);
    res.status(500).json({ message: "Failed to load notices" });
  }
};


/* ============================================================
   TEACHER NOTICES  
   All classes teacher teaches
============================================================ */
export const teacherListNotices = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: req.user.id },
    });

    if (!teacher) return res.json({ notices: [] });

    const subjects = await prisma.subject.findMany({
      where: { teacher_id: teacher.teacher_id },
      select: { class_id: true },
    });

    const classIds = subjects.map((s) => s.class_id);
    const today = new Date();

    const notices = await prisma.notice.findMany({
      where: {
        target: "teacher",
        class_id: { in: classIds },
        OR: [
          { notice_date: null },
          { notice_date: { gte: today } }
        ]
      },
      orderBy: { notice_id: "desc" },
    });

    return res.json({ notices });
  } catch (err) {
    console.error("TEACHER NOTICES ERROR:", err);
    res.status(500).json({ message: "Failed to load notices" });
  }
};
