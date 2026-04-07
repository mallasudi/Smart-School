// backend/src/controllers/adminResultController.js
import { prisma } from "../utils/prisma.js";

/* ===========================================================
   ADMIN: LIST CLASSES (for dropdown)
   GET /api/admin/results/classes
=========================================================== */
export const adminListResultClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { class_name: "asc" },
      select: {
        class_id: true,
        class_name: true,
        section: true,
      },
    });

    return res.json({ classes });
  } catch (err) {
    console.error("ADMIN LIST RESULT CLASSES ERROR:", err);
    return res.status(500).json({ message: "Failed to load classes" });
  }
};

/* ===========================================================
   ADMIN: CLASS + TERM RESULTS (overall + each student)
   GET /api/admin/results/class?classId=1&term=First%20Term%20Exam
=========================================================== */
export const adminGetClassTermResults = async (req, res) => {
  try {
    const classId = Number(req.query.classId);
    const term = decodeURIComponent(req.query.term || "").trim();

    if (!classId || !term) {
      return res
        .status(400)
        .json({ message: "classId and term query params are required" });
    }

    // 1) Class info
    const cls = await prisma.class.findUnique({
      where: { class_id: classId },
    });

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 2) Load all exams for this CLASS + TERM, with results + student
    const exams = await prisma.exam.findMany({
      where: {
        class_id: classId,
        term,
      },
      include: {
        subject: true,
        results: {
          include: { student: true },
        },
      },
      orderBy: { exam_date: "asc" },
    });

    if (!exams || exams.length === 0) {
      return res.json({
        class: {
          class_id: cls.class_id,
          class_name: cls.class_name,
          section: cls.section,
        },
        term,
        students: [],
        summary: {
          totalStudents: 0,
          averagePercent: 0,
          highestPercent: 0,
          lowestPercent: 0,
          passCount: 0,
          failCount: 0,
        },
      });
    }

    // 3) Build per-student aggregates
    const studentsMap = new Map();

    exams.forEach((exam) => {
      const total = exam.total_marks;

      exam.results.forEach((r) => {
        const s = r.student;
        if (!s) return;

        if (!studentsMap.has(s.student_id)) {
          studentsMap.set(s.student_id, {
            student_id: s.student_id,
            first_name: s.first_name || "",
            last_name: s.last_name || "",
            subjects: [],
            totalMarks: 0,
            totalFullMarks: 0,
            overallPercent: 0,
            overallGrade: "-",
          });
        }

        const entry = studentsMap.get(s.student_id);
        const marks = r.marks ?? 0;
        const percent =
          total > 0 ? Number(((marks / total) * 100).toFixed(1)) : 0;

        entry.subjects.push({
          exam_id: exam.exam_id,
          exam_title: exam.title,
          subject: exam.subject?.name || "",
          marks,
          total_marks: total,
          percent,
          grade: r.grade || "-",
        });

        entry.totalMarks += marks;
        entry.totalFullMarks += total;
      });
    });

    // 4) Apply grade scale for overall grade
    const gradescale = await prisma.gradescale.findMany();
    const calcGrade = (p) => {
      const row = gradescale.find((g) => p >= g.min && p <= g.max);
      return row ? row.grade : "-";
    };

    const students = Array.from(studentsMap.values()).map((st) => {
      const overallPercent =
        st.totalFullMarks > 0
          ? Number(((st.totalMarks / st.totalFullMarks) * 100).toFixed(1))
          : 0;

      return {
        ...st,
        overallPercent,
        overallGrade: calcGrade(overallPercent),
      };
    });

    // 5) Summary for class
    const percents = students.map((s) => s.overallPercent);
    const totalStudents = students.length;
    const averagePercent =
      totalStudents > 0
        ? Number(
            (
              percents.reduce((sum, p) => sum + p, 0) / totalStudents
            ).toFixed(1)
          )
        : 0;
    const highestPercent = percents.length ? Math.max(...percents) : 0;
    const lowestPercent = percents.length ? Math.min(...percents) : 0;

    const passCount = students.filter(
      (s) => s.overallGrade && s.overallGrade.toUpperCase() !== "F"
    ).length;
    const failCount = totalStudents - passCount;

    return res.json({
      class: {
        class_id: cls.class_id,
        class_name: cls.class_name,
        section: cls.section,
      },
      term,
      students,
      summary: {
        totalStudents,
        averagePercent,
        highestPercent,
        lowestPercent,
        passCount,
        failCount,
      },
    });
  } catch (err) {
    console.error("ADMIN CLASS TERM RESULTS ERROR:", err);
    return res
      .status(500)
      .json({ message: "Failed to load class term results" });
  }
};
