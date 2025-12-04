// backend/src/controllers/parentResultController.js
import { prisma } from "../utils/prisma.js";

/* ===========================================================
   HELPER: CALCULATE GRADE FROM PERCENT USING gradeScale TABLE
=========================================================== */
const loadGradeScaleAndMakeCalc = async () => {
  const gradescale = await prisma.gradescale.findMany();

  const calcGrade = (percent) => {
    if (!gradescale || gradescale.length === 0) return "-";
    const row = gradescale.find(
      (g) => percent >= g.min && percent <= g.max
    );
    return row ? row.grade : "-";
  };

  return calcGrade;
};

/* ===========================================================
   1. PARENT: ALL RESULTS (NO TERM FILTER)
   GET /parent/results
   -> Used by ParentResults.jsx
=========================================================== */
export const parentGetResults = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) Load parent + linked students + their results
    const parent = await prisma.parent.findUnique({
      where: { user_id: userId },
      include: {
        students: {
          include: {
            class: true,
            results: {
              include: {
                exam: {
                  include: {
                    subject: true,
                    class: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({ message: "Parent profile not found" });
    }

    const calcGrade = await loadGradeScaleAndMakeCalc();

    // 2) Build payload per child
    const studentsPayload = parent.students.map((student) => {
      const results = student.results || [];

      // Group by subject (all exams)
      const subjectsMap = {};

      results.forEach((r) => {
        if (!r.exam || !r.exam.subject) return;

        const subjectName = r.exam.subject.name;
        if (!subjectsMap[subjectName]) {
          subjectsMap[subjectName] = {
            subject: subjectName,
            totalMarks: 0,
            totalFull: 0,
            exams: [],
          };
        }

        subjectsMap[subjectName].totalMarks += r.marks ?? 0;
        subjectsMap[subjectName].totalFull += r.exam.total_marks ?? 0;
        subjectsMap[subjectName].exams.push({
          exam_id: r.exam.exam_id,
          exam: {
            title: r.exam.title,
            total_marks: r.exam.total_marks,
            term: r.exam.term,
          },
          marks: r.marks,
        });
      });

      const subjects = Object.values(subjectsMap).map((s) => {
        const percent = s.totalFull
          ? (s.totalMarks / s.totalFull) * 100
          : 0;
        const finalGrade = calcGrade(percent);

        return {
          subject: s.subject,
          totalMarks: s.totalMarks,
          totalFull: s.totalFull,
          percent: Number(percent.toFixed(1)),
          finalGrade,
          exams: s.exams,
        };
      });

      // Overall totals
      let totalMarks = 0;
      let totalFull = 0;
      subjects.forEach((s) => {
        totalMarks += s.totalMarks;
        totalFull += s.totalFull;
      });

      const overallPercent =
        totalFull > 0 ? (totalMarks / totalFull) * 100 : 0;
      const overallGrade = calcGrade(overallPercent);

      return {
        student_id: student.student_id,
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        class_name: student.class?.class_name || "",
        overallPercent: Number(overallPercent.toFixed(1)),
        overallGrade,
        subjects,
      };
    });

    // Filter out children with no subjects/results if you want
    const filtered = studentsPayload.filter((s) => s.subjects.length > 0);

    return res.json({
      students: filtered,
    });
  } catch (err) {
    console.error("PARENT GET RESULTS ERROR:", err);
    return res.status(500).json({ message: "Failed to load results" });
  }
};

/* ===========================================================
   2. PARENT: TERM-WISE RESULTS
   GET /parent/results/term/:term
   -> Used by ParentTermResults.jsx (new)
=========================================================== */
export const parentGetTermResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const termRaw = req.params.term || "";
    const term = decodeURIComponent(termRaw); // e.g. "First Term Exam"

    // 1) Load parent + linked students + all their results
    const parent = await prisma.parent.findUnique({
      where: { user_id: userId },
      include: {
        students: {
          include: {
            class: true,
            results: {
              include: {
                exam: {
                  include: {
                    subject: true,
                    class: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({ message: "Parent profile not found" });
    }

    const calcGrade = await loadGradeScaleAndMakeCalc();

    // 2) Build term-wise payload per child
    const studentsPayload = parent.students.map((student) => {
      const results = student.results || [];

      // Filter only exams of this term
      const termResults = results.filter(
        (r) => r.exam && r.exam.term === term
      );

      // Group by subject inside this term
      const subjectsMap = {};

      termResults.forEach((r) => {
        if (!r.exam || !r.exam.subject) return;

        const subjectName = r.exam.subject.name;

        if (!subjectsMap[subjectName]) {
          subjectsMap[subjectName] = {
            subject: subjectName,
            totalMarks: 0,
            totalFull: 0,
            exams: [],
          };
        }

        subjectsMap[subjectName].totalMarks += r.marks ?? 0;
        subjectsMap[subjectName].totalFull += r.exam.total_marks ?? 0;
        subjectsMap[subjectName].exams.push({
          exam_id: r.exam.exam_id,
          exam: {
            title: r.exam.title,
            total_marks: r.exam.total_marks,
            term: r.exam.term,
          },
          marks: r.marks,
        });
      });

      const subjects = Object.values(subjectsMap).map((s) => {
        const percent = s.totalFull
          ? (s.totalMarks / s.totalFull) * 100
          : 0;
        const finalGrade = calcGrade(percent);

        return {
          subject: s.subject,
          totalMarks: s.totalMarks,
          totalFull: s.totalFull,
          percent: Number(percent.toFixed(1)),
          finalGrade,
          exams: s.exams,
        };
      });

      let totalMarks = 0;
      let totalFull = 0;
      subjects.forEach((s) => {
        totalMarks += s.totalMarks;
        totalFull += s.totalFull;
      });

      const overallPercent =
        totalFull > 0 ? (totalMarks / totalFull) * 100 : 0;
      const overallGrade = calcGrade(overallPercent);

      return {
        student_id: student.student_id,
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        class_name: student.class?.class_name || "",
        overallPercent: Number(overallPercent.toFixed(1)),
        overallGrade,
        subjects,
      };
    });

    const filtered = studentsPayload.filter((s) => s.subjects.length > 0);

    return res.json({
      term,
      students: filtered,
    });
  } catch (err) {
    console.error("PARENT TERM RESULT ERROR:", err);
    return res.status(500).json({ message: "Failed to load term result" });
  }
};
