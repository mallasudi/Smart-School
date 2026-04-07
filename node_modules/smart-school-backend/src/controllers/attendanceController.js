// backend/src/controllers/attendanceController.js
import { prisma } from "../utils/prisma.js";

/* ============================================================
   TEACHER: Mark / Update Attendance
   - Teacher = req.user.id बाट
   - class_id body बाट
   - subject_id = SUBJECT table बाट (teacher_id + class_id)
   - attendance unique = (student_id, subject_id, date)
============================================================ */
export const markAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, students, class_id } = req.body;

    if (!date || !students || !class_id) {
      return res
        .status(400)
        .json({ message: "date, class_id and students required" });
    }

    // Logged-in teacher
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res
        .status(404)
        .json({ message: "Teacher profile not found" });
    }

    // Subject for THIS teacher and THIS class
    const subject = await prisma.subject.findFirst({
      where: {
        class_id: Number(class_id),
        teacher_id: teacher.teacher_id,
      },
    });

    if (!subject) {
      return res.status(400).json({
        message: "No subject mapped for this teacher and class",
      });
    }

    const subjectId = subject.subject_id;
    const targetDate = new Date(date + "T00:00:00.000Z");

    const records = [];

    for (const s of students) {
      const record = await prisma.attendance.upsert({
        where: {
          // composite unique key from @@unique([student_id, subject_id, date])
          student_id_subject_id_date: {
            student_id: Number(s.student_id),
            subject_id: subjectId,
            date: targetDate,
          },
        },
        update: {
          status: s.status,
        },
        create: {
          student_id: Number(s.student_id),
          subject_id: subjectId,
          date: targetDate,
          status: s.status,
        },
      });

      records.push(record);
    }

    return res.json({
      message: "Attendance saved/updated",
      records,
    });
  } catch (err) {
    console.error("MARK ATTENDANCE ERROR:", err);
    return res.status(500).json({ message: "Failed to save attendance" });
  }
};

/* ============================================================
   TEACHER: Get Today’s Attendance by Class
   - Teacher = req.user.id
   - Filters: student.class_id + subject.teacher_id + date range
============================================================ */
export const getTodayAttendanceByClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { class_id, date } = req.query;

    if (!class_id) {
      return res.status(400).json({ message: "class_id is required" });
    }

    if (!date) {
      return res
        .status(400)
        .json({ message: "date is required (YYYY-MM-DD)" });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res
        .status(404)
        .json({ message: "Teacher profile not found" });
    }

    const start = new Date(date + "T00:00:00.000Z");
    const end = new Date(date + "T23:59:59.999Z");

    const records = await prisma.attendance.findMany({
      where: {
        date: { gte: start, lte: end },
        // student of this class
        student: { class_id: Number(class_id) },
        // subject taught by THIS teacher
        subject: { teacher_id: teacher.teacher_id },
      },
      include: {
        student: { include: { class: true } },
      },
      orderBy: { student_id: "asc" },
    });

    const formatted = records.map((r) => ({
      attendance_id: r.attendance_id,
      student_id: r.student.student_id,
      first_name: r.student.first_name,
      last_name: r.student.last_name,
      status: r.status,
      date: r.date,
      class_name: r.student.class?.class_name || "",
      section: r.student.class?.section || "",
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("GET TODAY ATTEND ERROR:", err);
    return res.status(500).json({ message: "Failed to load attendance" });
  }
};

/* ============================================================
   STUDENT: Attendance Summary (overall)
============================================================ */
export const getStudentAttendanceSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await prisma.student.findUnique({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const records = await prisma.attendance.findMany({
      where: { student_id: student.student_id },
      orderBy: { date: "asc" },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const late = records.filter((r) => r.status === "Late").length;

    const percentage = total ? Math.round((present / total) * 100) : 0;

    return res.json({
      student_id: student.student_id,
      total,
      present,
      absent,
      late,
      percentage,
      records, // ✔ FULL RECORDS FOR CALENDAR & TABLE
    });
  } catch (err) {
    console.error("STUDENT SUMMARY ERROR:", err);
    return res.status(500).json({ message: "Failed to load summary" });
  }
};

/* ============================================================
   PARENT: Child Attendance Summary
============================================================ */
export const getParentChildAttendanceSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const parent = await prisma.parent.findUnique({
      where: { user_id: userId },
      include: { students: true },
    });

    if (!parent || !parent.students.length) {
      return res.status(404).json({ message: "No linked students found" });
    }

    const result = [];

    for (const s of parent.students) {
      const records = await prisma.attendance.findMany({
        where: { student_id: s.student_id },
        orderBy: { date: "asc" },
      });

      const total = records.length;
      const present = records.filter((r) => r.status === "Present").length;
      const absent = records.filter((r) => r.status === "Absent").length;
      const late = records.filter((r) => r.status === "Late").length;

      result.push({
        student_id: s.student_id,
        first_name: s.first_name,
        last_name: s.last_name,
        total,
        present,
        absent,
        late,
        percentage: total ? Math.round((present / total) * 100) : 0,
        records, // ✔ CRUCIAL FIX – SEND FULL RECORD LIST FOR PARENT UI
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("PARENT SUMMARY ERROR:", err);
    return res.status(500).json({ message: "Failed to load summary" });
  }
};

/* ============================================================
   ADMIN: Attendance Overview
============================================================ */
export const getAdminAttendanceOverview = async (req, res) => {
  try {
    const { class_id, student_id } = req.query;

    const whereStudent = {};
    if (class_id) whereStudent.class_id = Number(class_id);
    if (student_id) whereStudent.student_id = Number(student_id);

    const students = await prisma.student.findMany({
      where: whereStudent,
      include: { class: true },
    });

    const overview = [];

    for (const s of students) {
      const records = await prisma.attendance.findMany({
        where: { student_id: s.student_id },
      });

      const total = records.length;
      const present = records.filter((r) => r.status === "Present").length;
      const absent = records.filter((r) => r.status === "Absent").length;
      const late = records.filter((r) => r.status === "Late").length;

      overview.push({
        student_id: s.student_id,
        first_name: s.first_name,
        last_name: s.last_name,
        class_name: s.class?.class_name || "",
        section: s.class?.section || "",
        total,
        present,
        absent,
        late,
        percentage: total ? Math.round((present / total) * 100) : 0,
      });
    }

    return res.json(overview);
  } catch (err) {
    console.error("ADMIN OVERVIEW ERROR:", err);
    return res.status(500).json({ message: "Failed to load overview" });
  }
};

/* ============================================================
   STUDENT: Subject-wise Attendance Summary
============================================================ */
export const getStudentSubjectWiseSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        class: { include: { subjects: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const subjects = student.class.subjects;
    const result = [];

    for (const sub of subjects) {
      const logs = await prisma.attendance.findMany({
        where: {
          student_id: student.student_id,
          subject_id: sub.subject_id,
        },
      });

      const total = logs.length;
      const present = logs.filter((x) => x.status === "Present").length;
      const absent = logs.filter((x) => x.status === "Absent").length;
      const late = logs.filter((x) => x.status === "Late").length;
      const percentage = total ? Math.round((present / total) * 100) : 0;

      result.push({
        subject_id: sub.subject_id,
        subject_name: sub.name,
        total_classes: total,
        present,
        absent,
        late,
        percentage,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("SUBJECT WISE SUMMARY ERROR:", err);
    return res.status(500).json({ message: "Failed to load summary" });
  }
};

