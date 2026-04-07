import { prisma } from "../utils/prisma.js";

/* ============================================================
   TEACHER: CREATE ASSIGNMENT
============================================================ */
export const createAssignment = async (req, res) => {
  try {
    // 1️⃣ Get teacher row using user_id
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: req.user.id },
    });

    if (!teacher) {
      return res.status(400).json({ message: "Teacher not found" });
    }

    const teacherId = teacher.teacher_id;  // REAL FK

    const { subject_id, title, instructions, due_date } = req.body;

    if (!subject_id || !title || !due_date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 2️⃣ Create assignment properly
    const assignment = await prisma.assignment.create({
      data: {
        subject_id: Number(subject_id),
        teacher_id: teacherId,
        title,
        instructions,
        due_date: new Date(due_date),
      },
    });

    res.json({ message: "Assignment created", assignment });

  } catch (err) {
    console.error("CREATE ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Failed to create assignment" });
  }
};

/* ============================================================
   TEACHER: LIST ALL ASSIGNMENTS
============================================================ */
export const teacherListAssignments = async (req, res) => {
  try {
    // FIX #2 → find teacher_id
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: req.user.id },
    });

    if (!teacher) return res.json([]);

    const assignments = await prisma.assignment.findMany({
      where: { teacher_id: teacher.teacher_id },
      orderBy: { created_at: "desc" },
    });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load assignments" });
  }
};

/* ============================================================
   TEACHER: VIEW SUBMISSIONS FOR ONE ASSIGNMENT
============================================================ */
export const teacherViewSubmissions = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);

    const subs = await prisma.submission.findMany({
      where: { assignment_id: assignmentId },
      include: { student: true },
      orderBy: { submitted_at: "desc" },
    });

    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load submissions" });
  }
};

/* ============================================================
   STUDENT: LIST ASSIGNMENTS (their subject only)
============================================================ */
export const studentListAssignments = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const assignments = await prisma.assignment.findMany({
      where: { subject_id: student.subject_id },
      orderBy: { created_at: "desc" },
    });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load assignments" });
  }
};

/* ============================================================
   STUDENT: SUBMIT ASSIGNMENT
============================================================ */
export const submitAssignment = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);

    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Submission file required" });
    }

    const file_url = `/uploads/${req.file.filename}`;

    const submission = await prisma.submission.upsert({
      where: {
        assignment_id_student_id: {
          assignment_id: assignmentId,
          student_id: student.student_id,
        },
      },
      update: { file_url, submitted_at: new Date() },
      create: {
        assignment_id: assignmentId,
        student_id: student.student_id,
        file_url,
      },
    });

    res.json({ message: "Assignment submitted", submission });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ message: "Failed to submit assignment" });
  }
};

/* ============================================================
   STUDENT: VIEW OWN SUBMISSION
============================================================ */
export const studentMySubmission = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);

    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
    });

    const sub = await prisma.submission.findUnique({
      where: {
        assignment_id_student_id: {
          assignment_id: assignmentId,
          student_id: student.student_id,
        },
      },
    });

    res.json(sub || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to load submission" });
  }
};

/* ============================================================
   TEACHER: DELETE ASSIGNMENT
============================================================ */
export const deleteAssignment = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const teacherId = req.user.id;

    // Ensure assignment belongs to the logged-in teacher
    const assignment = await prisma.assignment.findFirst({
      where: { assignment_id: assignmentId, teacher_id: teacherId },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Delete assignment (submissions will auto-delete due to cascade)
    await prisma.assignment.delete({
      where: { assignment_id: assignmentId },
    });

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error("DELETE ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Failed to delete assignment" });
  }
};
