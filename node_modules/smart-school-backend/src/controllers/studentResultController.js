// backend/src/controllers/studentResultController.js
import { prisma } from "../utils/prisma.js";

/* ===========================================================
   STUDENT: TERM-WISE RESULT
   GET /student/results/term/:term
=========================================================== */
export const studentGetTermResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const term = decodeURIComponent(req.params.term); 
    // e.g. "First Term Exam"

    // 1) Load student
    const student = await prisma.student.findUnique({
      where: { user_id: userId },
      include: { class: true },
    });

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    // 2) Fetch only exams matching CLASS + TERM
    const exams = await prisma.exam.findMany({
      where: {
        class_id: student.class_id,
        term: term,
      },
      include: {
        subject: true,
        results: {
          where: { student_id: student.student_id }
        }
      },
      orderBy: { exam_date: "asc" }
    });

    // 3) Build subject list
    const subjects = exams.map((exam) => {
      const result = exam.results[0]; // only this student's result
      const marks = result ? result.marks : null;
      const total = exam.total_marks;
      const percent =
        marks !== null && total > 0
          ? Number(((marks / total) * 100).toFixed(1))
          : null;

      return {
        subject: exam.subject?.name || "",
        exam_id: exam.exam_id,
        title: exam.title,
        marks,
        total_marks: total,
        percent,
        grade: result?.grade || "-",
      };
    });

    // 4) TOTAL TERM CALCULATION
    let totalMarks = 0;
    let totalFullMarks = 0;

    subjects.forEach((s) => {
      if (s.marks !== null) {
        totalMarks += s.marks;
        totalFullMarks += s.total_marks;
      }
    });

    const overallPercent =
      totalFullMarks > 0
        ? Number(((totalMarks / totalFullMarks) * 100).toFixed(1))
        : 0;

    // grade scale
    const gradescale = await prisma.gradescale.findMany();
    const calcGrade = (p) => {
      const row = gradescale.find(
        (g) => p >= g.min && p <= g.max
      );
      return row ? row.grade : "-";
    };

    const overallGrade = calcGrade(overallPercent);

    // 5) Return final response
    return res.json({
      student: {
        student_id: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        class_name: student.class?.class_name,
      },
      term,
      subjects,
      totalMarks,
      totalFullMarks,
      overallPercent,
      overallGrade,
    });

  } catch (err) {
    console.error("STUDENT TERM RESULT ERROR:", err);
    return res.status(500).json({ message: "Failed to load term result" });
  }
};

/* =======================================================
   STUDENT: VIEW RESULTS (FLAT + FINAL GRADE)
   GET /student/results
======================================================= */
export const studentGetResults = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find student by user_id
    const student = await prisma.student.findUnique({
      where: { user_id: userId },
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Fetch exam results
    const results = await prisma.result.findMany({
      where: { student_id: student.student_id },
      include: {
        exam: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
      orderBy: { result_id: "asc" }
    });

    // Preserve FLAT ARRAY for your UI
    const flatResults = results.map((r) => ({
      result_id: r.result_id,
      marks: r.marks,
      exam: r.exam,
    }));

    // SUBJECT-WISE grouping for final grade
    const subjects = {};
    results.forEach((r) => {
      const subjectName = r.exam.subject.name;

      if (!subjects[subjectName]) {
        subjects[subjectName] = {
          subject: subjectName,
          totalMarks: 0,
          totalFull: 0,
          exams: [],
        };
      }

      subjects[subjectName].totalMarks += r.marks;
      subjects[subjectName].totalFull += r.exam.total_marks;
      subjects[subjectName].exams.push(r);
    });

    // Grade scale for final grade
    const gradescale = await prisma.gradescale.findMany();

    const finalSubjects = Object.values(subjects).map((s) => {
      const percent = s.totalFull
        ? (s.totalMarks / s.totalFull) * 100
        : 0;

      const gradeRow = gradescale.find(
        (g) => percent >= g.min && percent <= g.max
      );

      return {
        subject: s.subject,
        totalMarks: s.totalMarks,
        totalFull: s.totalFull,
        percent: Number(percent.toFixed(1)),
        finalGrade: gradeRow ? gradeRow.grade : "-",
        exams: s.exams,
      };
    });
    

    // 🔥 Return both: for UI + for grade page
    res.json({
      student_id: student.student_id,
      results: flatResults,     // ← YOUR UI WILL USE THIS
      subjects: finalSubjects,  // ← Subject-wise breakdown
    });

  } catch (err) {
    console.error("STUDENT RESULT ERROR:", err);
    res.status(500).json({ message: "Failed to load student results" });
  }
};
