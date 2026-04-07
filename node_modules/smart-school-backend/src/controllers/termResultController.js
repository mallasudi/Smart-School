// backend/src/controllers/termResultController.js
import { prisma } from "../utils/prisma.js";

/* ==========================================================
   ADMIN: CLASS TERM RESULT  (with ranking)
   GET /api/admin/results/term/:classId/:term
========================================================== */
export const adminGetClassTermResult = async (req, res) => {
  try {
    const classId = Number(req.params.classId);
    const term = decodeURIComponent(req.params.term);

    // 1) Load students of the class
    const students = await prisma.student.findMany({
      where: { class_id: classId },
      include: {
        user: true,
      },
      orderBy: { student_id: "asc" },
    });

    if (students.length === 0)
      return res.json({ message: "No students found", students: [] });

    // 2) Load all exams for this class + term
    const exams = await prisma.exam.findMany({
      where: { class_id: classId, term },
      include: {
        subject: true,
        results: true, // all results for these exams
      },
      orderBy: { exam_date: "asc" },
    });

    // 3) Build each student's total marks
    const gradeScale = await prisma.gradeScale.findMany();

    const calcGrade = (p) => {
      const row = gradeScale.find(g => p >= g.min && p <= g.max);
      return row ? row.grade : "-";
    };

    const studentRows = students.map((s) => {
      let totalMarks = 0;
      let totalFull = 0;

      exams.forEach((exam) => {
        const r = exam.results.find(r => r.student_id === s.student_id);
        if (r) {
          totalMarks += r.marks;
          totalFull += exam.total_marks;
        }
      });

      const percent = totalFull > 0 ? Number(((totalMarks / totalFull) * 100).toFixed(1)) : 0;
      const grade = calcGrade(percent);

      return {
        student_id: s.student_id,
        name: `${s.first_name || ""} ${s.last_name || ""}`,
        totalMarks,
        totalFull,
        percent,
        grade,
      };
    });

    // 4) RANKING
    const ranked = [...studentRows]
      .sort((a, b) => b.percent - a.percent)
      .map((s, index) => ({
        ...s,
        rank: index + 1,
      }));

    return res.json({
      class_id: classId,
      term,
      students: ranked,
      exams,
    });

  } catch (err) {
    console.error("ADMIN CLASS TERM RESULT ERROR:", err);
    return res.status(500).json({ message: "Failed to load class term result" });
  }
};


/* ==========================================================
   ADMIN: PUBLISH TERM RESULT
   POST /api/admin/results/term/:classId/:term/publish
========================================================== */
export const adminPublishTermResult = async (req, res) => {
  try {
    const classId = Number(req.params.classId);
    const term = decodeURIComponent(req.params.term);

    // 1) Get all exams of this term
    const exams = await prisma.exam.findMany({
      where: { class_id: classId, term },
      include: {
        results: {
          include: {
            student: {
              include: {
                parent: {
                  include: { user: true }
                }
              }
            }
          }
        },
        subject: true,
        class: true
      }
    });

    if (exams.length === 0)
      return res.status(404).json({ message: "No exams found for this term." });

    // 2) Mark all exams as Published
    await prisma.exam.updateMany({
      where: { class_id: classId, term },
      data: { status: "Published" }
    });

    // 3) Create notices
    const notices = [];

    for (const exam of exams) {
      const subjectName = exam.subject?.name || "";
      const examTitle = exam.title;

      for (const r of exam.results) {
        const s = r.student;
        const studentName = `${s.first_name || ""} ${s.last_name || ""}`;

        // notice to student
        notices.push({
          title: `Term Result Published`,
          message: `Your ${term} result is published. Subject: ${subjectName}. Marks: ${r.marks}/${exam.total_marks}.`,
          target: "student",
          class_id: classId,
          exam_id: exam.exam_id,
        });

        // notice to parent
        if (s.parent && s.parent.user) {
          notices.push({
            title: `Result Published for ${studentName}`,
            message: `${term} result published. Subject: ${subjectName}. Marks: ${r.marks}/${exam.total_marks}.`,
            target: "parent",
            class_id: classId,
            exam_id: exam.exam_id,
          });
        }
      }
    }

    // Save notices
    await prisma.notice.createMany({ data: notices });

    return res.json({ message: "Term results published successfully!" });

  } catch (err) {
    console.error("PUBLISH TERM RESULT ERROR:", err);
    return res.status(500).json({ message: "Failed to publish term results" });
  }
};
