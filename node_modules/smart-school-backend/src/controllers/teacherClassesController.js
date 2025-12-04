// backend/src/controllers/teacherClassesController.js
import { prisma } from "../utils/prisma.js";

/* =========================================================
   1. GET CLASSES FOR LOGGED-IN TEACHER
   - Uses exam.teacher_id to find classes this teacher handles
========================================================= */
export const getTeacherClasses = async (req, res) => {
  console.log("🔥 getTeacherClasses CALLED");

  try {
    const teacherUserId = req.user.id;
    console.log("Teacher user ID =", teacherUserId);

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: teacherUserId },
    });

    console.log("Teacher found =", teacher);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const classes = await prisma.class.findMany({
      where: {
        subjects: {
          some: { teacher_id: teacher.teacher_id },
        },
      },
      select: { class_id: true, class_name: true, section: true },
      orderBy: { class_id: "asc" },
    });

    console.log("Classes returned =", classes);

    return res.json(classes);
  } catch (error) {
    console.error("❌ ERROR GETTING TEACHER CLASSES:", error);
    res.status(500).json({ message: "Failed to load classes" });
  }
};


/* =========================================================
   2. TERM-WISE RESULTS FOR A CLASS (TEACHER VIEW)
   Route: GET /teacher/results/class/:classId/term/:term

   IMPORTANT CHANGE:
   ❌ Do NOT filter by teacher_id anymore.
   ✅ Just show the full class + term result (same as admin),
      so the page ALWAYS works.
========================================================= */
export const teacherGetTermResults = async (req, res) => {
  try {
    const classId = Number(req.params.classId);
    const term = decodeURIComponent(req.params.term);

    if (!classId) {
      return res.status(400).json({ message: "Invalid class id" });
    }

    // Load ALL exams for this class + term (same as admin)
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

    if (exams.length === 0) {
      return res.json({
        classId,
        term,
        students: [],
        subjects: [],
        message: "No exams found for this class & term.",
      });
    }

    // Build student result summary (same as admin)
    const studentMap = {};

    for (const exam of exams) {
      const subjectName = exam.subject?.name || "Unknown";

      for (const r of exam.results) {
        const st = r.student;

        if (!studentMap[st.student_id]) {
          studentMap[st.student_id] = {
            student_id: st.student_id,
            name: `${st.first_name || ""} ${st.last_name || ""}`.trim(),
            subjects: {},
            totalMarks: 0,
            totalFullMarks: 0,
          };
        }

        studentMap[st.student_id].subjects[subjectName] = {
          marks: r.marks,
          total: exam.total_marks,
          grade: r.grade,
        };

        studentMap[st.student_id].totalMarks += r.marks;
        studentMap[st.student_id].totalFullMarks += exam.total_marks;
      }
    }

    const gradescale = await prisma.gradescale.findMany();
    const calcGrade = (p) => {
      const row = gradescale.find((g) => p >= g.min && p <= g.max);
      return row ? row.grade : "-";
    };

    const students = Object.values(studentMap).map((s) => {
      const percent = s.totalFullMarks
        ? Number(((s.totalMarks / s.totalFullMarks) * 100).toFixed(1))
        : 0;

      return {
        ...s,
        percent,
        finalGrade: calcGrade(percent),
      };
    });

    students.sort((a, b) => b.percent - a.percent);

    const subjects = [
      ...new Set(exams.map((e) => e.subject?.name).filter(Boolean)),
    ];

    return res.json({
      classId,
      term,
      students,
      subjects,
    });
  } catch (err) {
    console.error("TEACHER TERM RESULT ERROR:", err);
    res.status(500).json({ message: "Failed to load term results" });
  }
};
