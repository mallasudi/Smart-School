// backend/src/controllers/examController.js
import { prisma } from "../utils/prisma.js";

/* Small helper to shape exam data for frontend
   and auto-calculate status based on exam_date */
const mapExam = (exam) => {
  const today = new Date();
  const examDate = new Date(exam.exam_date);

  // Compare only YYYY-MM-DD (ignore time/timezone issues)
  const todayYMD = today.toISOString().slice(0, 10);     // "2025-11-27"
  const examYMD  = examDate.toISOString().slice(0, 10);  // e.g. "2025-11-26"

  const autoStatus = examYMD <= todayYMD ? "Published" : "Upcoming";

  return {
    exam_id: exam.exam_id,
    title: exam.title,
    exam_date: exam.exam_date,
    total_marks: exam.total_marks,
    status: autoStatus,   
    class_id: exam.class_id,
    subject_id: exam.subject_id,
    teacher_id: exam.teacher_id,
    class: exam.class
      ? {
          class_id: exam.class.class_id,
          class_name: exam.class.class_name,
          section: exam.class.section,
        }
      : null,
    subject: exam.subject
      ? {
          subject_id: exam.subject.subject_id,
          name: exam.subject.name,
        }
      : null,
    teacher: exam.teacher
      ? {
          teacher_id: exam.teacher.teacher_id,
          first_name: exam.teacher.first_name,
          last_name: exam.teacher.last_name,
        }
      : null,
  };
};

/* =======================================================
   ADMIN: GET ALL EXAMS
   GET /api/admin/exams
======================================================= */
export const getAllExams = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { exam_date: "desc" },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });

    // Auto status calculation without breaking your normalized format
    const todayYMD = new Date().toISOString().slice(0, 10);

    const normalized = exams.map((e) => {
      const examDateYMD = new Date(e.exam_date)
        .toISOString()
        .slice(0, 10);

      const autoStatus =
        examDateYMD <= todayYMD ? "Completed" : "Upcoming";

      return {
        exam_id: e.exam_id,
        title: e.title,
        term: e.term,          
        exam_date: e.exam_date,
        total_marks: e.total_marks,
        status: autoStatus,    
        class: e.class,
        subject: e.subject,
        teacher: e.teacher,
        subject_id: e.subject_id,
        class_id: e.class_id,
      };
    });

    res.json({ exams: normalized });
  } catch (err) {
    console.error("getAllExams error:", err);
    res.status(500).json({ message: "Failed to load exams" });
  }
};


/* =======================================================
   ADMIN: CREATE EXAM (NEW LOGIC)
   UI can send:
   - NEW WAY (recommended): { title, exam_date, total_marks, subject_id }
   - OLD WAY (fallback):   { title, classLabel, exam_date, total_marks }
======================================================= */
export const createExam = async (req, res) => {
  try {
    const {
      title,
      exam_date,
      total_marks,
      subject_id, // preferred
      subjectId,  // older frontends might send this
      classLabel, 
      term,
    } = req.body;

    // Basic validation
    if (!title || !exam_date || !total_marks) {
      return res
        .status(400)
        .json({ message: "title, exam_date, total_marks are required" });
    }

    // unify subject id from possible keys
    const finalSubjectId = subject_id || subjectId;

    let cls;
    let subject;

    /* =======================
       CASE 1: SUBJECT SELECTED
       ======================= */
    if (finalSubjectId) {
      subject = await prisma.subject.findUnique({
        where: { subject_id: Number(finalSubjectId) },
        include: { class: true, teacher: true },
      });

      if (!subject) {
        return res.status(400).json({ message: "Selected subject not found" });
      }

      if (!subject.class) {
        return res
          .status(400)
          .json({ message: "Selected subject is not linked to any class" });
      }

      if (!subject.teacher_id) {
        return res
          .status(400)
          .json({ message: "Selected subject has no teacher assigned" });
      }

      cls = subject.class;
    }

    /* ============================
       CASE 2: NO SUBJECT, USE CLASS
       (for old UI still using classLabel)
       ============================ */
    if (!finalSubjectId) {
      if (!classLabel) {
        return res.status(400).json({
          message:
            "Either subject_id must be provided, or classLabel for old UI.",
        });
      }

      // 1) Resolve class
      cls = await resolveClassFromLabel(classLabel);
      if (!cls) {
        return res.status(400).json({
          message: `Class not found for "${classLabel}". Make sure it matches an existing class_name in the database.`,
        });
      }

      // 2) Pick a subject for that class
      subject = await prisma.subject.findFirst({
        where: { class_id: cls.class_id },
        include: { teacher: true },
      });

      if (!subject) {
        return res.status(400).json({
          message: `No subject found for class "${cls.class_name}". Please create a subject first.`,
        });
      }

      if (!subject.teacher_id) {
        return res.status(400).json({
          message: `No teacher assigned to subject "${subject.name}" for class "${cls.class_name}".`,
        });
      }
    }

    // At this point, cls + subject are guaranteed
    const exam = await prisma.exam.create({
      data: {
        title,
        exam_date: new Date(exam_date),
        total_marks: Number(total_marks),
        term: req.body.term ? String(req.body.term) : null,
        class_id: cls.class_id,
        subject_id: subject.subject_id,
        teacher_id: subject.teacher_id,
        status: "Upcoming",
      },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });

// =========================
// Create related notices
// =========================
const friendlyDate = exam.exam_date.toISOString().split("T")[0];
const noticeTitle = `New Exam: ${exam.title}`;
const noticeMessage = `Exam "${exam.title}" for ${cls.class_name} on ${friendlyDate} has been created.`;

// Create Teacher, Student, Parent notice correctly linked with exam_id
await prisma.notice.createMany({
  data: [
    // Teacher notice (filtered by teacher_id using exam_id)
    {
      title: noticeTitle,
      message: noticeMessage,
      target: "teacher",
      class_id: cls.class_id,
      exam_id: exam.exam_id,    // ⭐ IMPORTANT
    },
    // Student notice (class-based)
    {
      title: noticeTitle,
      message: noticeMessage,
      target: "student",
      class_id: cls.class_id,
      exam_id: exam.exam_id,    // ⭐ IMPORTANT
    },
    // Parent notice (linked to student via class_id)
    {
      title: noticeTitle,
      message: noticeMessage,
      target: "parent",
      class_id: cls.class_id,
      exam_id: exam.exam_id,    // ⭐ IMPORTANT
    },
  ],
});

    return res.status(201).json({
      message: "Exam created",
      exam: mapExam(exam),
    });
  } catch (err) {
    console.error("createExam error:", err);
    res.status(500).json({ message: "Failed to create exam" });
  }
};

/* =======================================================
   ADMIN: UPDATE EXAM
======================================================= */
export const updateExam = async (req, res) => {
  try {
    const examId = Number(req.params.id);
    const { title, exam_date, total_marks, subject_id, subjectId, term } = req.body;

    const existing = await prisma.exam.findUnique({
      where: { exam_id: examId },
      include: { class: true, subject: true, teacher: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // PREPARE UPDATE DATA
    let updateData = {
      title: title ?? existing.title,
      exam_date: exam_date ? new Date(exam_date) : existing.exam_date,
      total_marks: total_marks ? Number(total_marks) : existing.total_marks,
      term: term ?? existing.term,
    };

    const finalSubjectId = subject_id || subjectId;

    // IF SUBJECT IS CHANGED
    if (finalSubjectId) {
      const subject = await prisma.subject.findUnique({
        where: { subject_id: Number(finalSubjectId) },
        include: { class: true, teacher: true },
      });

      if (!subject || !subject.class || !subject.teacher_id) {
        return res.status(400).json({
          message: "Invalid subject: must be linked to a class and have a teacher.",
        });
      }

      updateData = {
        ...updateData,
        subject_id: subject.subject_id,
        class_id: subject.class_id,
        teacher_id: subject.teacher_id,
      };
    }

    // ⭐ UPDATE EXAM
    const updated = await prisma.exam.update({
      where: { exam_id: examId },
      data: updateData,
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });

    // ⭐ UPDATE NOTICES (teacher + student + parent)
    const newDate = updated.exam_date.toISOString().split("T")[0];

    await prisma.notice.updateMany({
      where: { exam_id: examId },
      data: {
        title: `Exam updated: ${updated.title}`,
        message: `Exam "${updated.title}" has been updated. New Date: ${newDate}`,
      },
    });

    // SEND RESPONSE
    res.json({
      message: "Exam updated successfully!",
      exam: mapExam(updated), // ⭐ auto-status applied here
    });

  } catch (err) {
    console.error("updateExam error:", err);
    res.status(500).json({ message: "Failed to update exam" });
  }
};


/* =======================================================
   ADMIN: DELETE EXAM
   DELETE /api/admin/exams/:id
======================================================= */
export const deleteExam = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Step 1: delete all related notices
    await prisma.notice.deleteMany({
      where: { exam_id: id }
    });

    // Step 2: delete exam itself
    await prisma.exam.delete({
      where: { exam_id: id }
    });

    res.json({ message: "Exam and related notices deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete exam" });
  }
};

/* =======================================================
   TEACHER: LIST OWN EXAMS  (used by /teacher/exams)
======================================================= */
export const teacherListExams = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: req.user.id },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const exams = await prisma.exam.findMany({
      where: { teacher_id: teacher.teacher_id },
      include: {
        subject: true,
        class: true,
      },
      orderBy: { exam_date: "asc" },
    });

    res.json({ exams });
  } catch (err) {
    console.error("TEACHER LIST EXAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load exams" });
  }
};

/* =======================================================
   STUDENT: LIST EXAMS FOR THEIR CLASS
   GET /student/exams
======================================================= */
export const studentListExams = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const exams = await prisma.exam.findMany({
      where: { class_id: student.class_id },
      include: {
        subject: true,
        teacher: true,
        class: true,
      },
      orderBy: { exam_date: "asc" },
    });

    res.json({ exams });
  } catch (err) {
    console.error("STUDENT LIST EXAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load exams" });
  }
};

/* =======================================================
   STUDENT: GET QUESTIONS FOR AN EXAM  (Step 2)
   GET /student/exams/:examId/questions
======================================================= */
export const studentGetExamQuestions = async (req, res) => {
  try {
    const examId = Number(req.params.examId);

    const exam = await prisma.exam.findUnique({
      where: { exam_id: examId },
      include: {
        questions: {
          select: {
            question_id: true,
            question_text: true,
            option_a: true,
            option_b: true,
            option_c: true,
            option_d: true,
          },
        },
        subject: true,
      },
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({ exam });
  } catch (err) {
    console.error("STUDENT GET QUESTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to load questions" });
  }
};

/* =======================================================
   STUDENT: SUBMIT EXAM ANSWERS (Step 2)
   POST /student/exams/:examId/submit
======================================================= */
export const studentSubmitExam = async (req, res) => {
  try {
    const examId = Number(req.params.examId);
    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    const { answers } = req.body; // [{ question_id, selected_option }]

    let score = 0;

    for (const ans of answers) {
      const q = await prisma.question.findUnique({
        where: { question_id: ans.question_id },
      });

      if (q && q.correct_option === ans.selected_option) {
        score++;
      }
    }

    const result = await prisma.result.upsert({
      where: {
        exam_id_student_id: {
          exam_id: examId,
          student_id: student.student_id,
        },
      },
      update: { marks: score },
      create: { exam_id: examId, student_id: student.student_id, marks: score },
    });

    res.json({ message: "Exam submitted", result });
  } catch (err) {
    console.error("STUDENT SUBMIT ERROR:", err);
    res.status(500).json({ message: "Failed to submit exam" });
  }
};

/* =======================================================
   STUDENT: LIST EXAM RESULTS (Step 3-4)
   GET /student/results
======================================================= */
export const studentListResults = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
      include: {
        results: {
          include: {
            exam: {
              include: { subject: true, class: true },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ results: student.results });
  } catch (err) {
    console.error("STUDENT RESULT ERROR:", err);
    res.status(500).json({ message: "Failed to load results" });
  }
};

/* =======================================================
   TEACHER: QUESTIONS MANAGEMENT (Step 2)
   /teacher/exams/:examId/questions, /teacher/questions/:id
======================================================= */
export const teacherGetQuestions = async (req, res) => {
  try {
    const examId = Number(req.params.examId);

    const exam = await prisma.exam.findUnique({
      where: { exam_id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({ exam, questions: exam.questions });
  } catch (err) {
    console.error("TEACHER GET QUESTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to load questions" });
  }
};

export const teacherCreateQuestion = async (req, res) => {
  try {
    const examId = Number(req.params.examId);
    const { question_text, option_a, option_b, option_c, option_d, correct_option } =
      req.body;

    const question = await prisma.question.create({
      data: {
        exam_id: examId,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
      },
    });

    res.json({ message: "Question created", question });
  } catch (err) {
    console.error("TEACHER CREATE QUESTION ERROR:", err);
    res.status(500).json({ message: "Failed to add question" });
  }
};

export const teacherUpdateQuestion = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);
    const { question_text, option_a, option_b, option_c, option_d, correct_option } =
      req.body;

    const updated = await prisma.question.update({
      where: { question_id: questionId },
      data: {
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
      },
    });

    res.json({ message: "Question updated", question: updated });
  } catch (err) {
    console.error("TEACHER UPDATE QUESTION ERROR:", err);
    res.status(500).json({ message: "Failed to update question" });
  }
};

export const teacherDeleteQuestion = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);

    await prisma.question.delete({
      where: { question_id: questionId },
    });

    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error("TEACHER DELETE QUESTION ERROR:", err);
    res.status(500).json({ message: "Failed to delete question" });
  }
};

/* =======================================================
   TEACHER: GET MARKS ENTRY DATA (unchanged logic OK)
======================================================= */
export const teacherGetExamMarks = async (req, res) => {
  try {
    const examId = Number(req.params.examId);

    const exam = await prisma.exam.findUnique({
      where: { exam_id: examId },
      include: { class: true },
    });

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const students = await prisma.student.findMany({
      where: { class_id: exam.class_id },
      include: { results: true },
    });

    const formatted = students.map((s) => {
      const existing = s.results.find((r) => r.exam_id === examId);
      return {
        student_id: s.student_id,
        name: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
        marks: existing ? existing.marks : null,
        grade: existing ? existing.grade : null,
      };
    });

    res.json({ exam, students: formatted });
  } catch (err) {
    console.error("TEACHER GET MARKS ERROR:", err);
    res.status(500).json({ message: "Failed to load marks" });
  }
};

/* =======================================================
   TEACHER: SAVE MARKS + GRADE
======================================================= */
export const teacherSaveExamMarks = async (req, res) => {
  try {
    const examId = Number(req.params.examId);
    const teacherUserId = req.user.id; // from JWT
    const { marks } = req.body; // [{ student_id, marks }]

    const exam = await prisma.exam.findUnique({
      where: { exam_id: examId },
      include: {
        class: true,
        subject: true,
        teacher: {
          include: { user: true },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Make sure only the correct teacher can update this exam
    if (exam.teacher.user_id !== teacherUserId) {
      return res.status(403).json({ message: "Unauthorized exam access" });
    }

    // Load grade scale (90+ A, etc.)
    const gradescale = await prisma.gradescale.findMany();
    if (!gradescale || gradescale.length === 0) {
      return res.status(500).json({ message: "Grade scale not configured" });
    }

    const calcGrade = (percent) => {
      const row = gradescale.find(
        (g) => percent >= g.min && percent <= g.max
      );
      return row ? row.grade : null;
    };

    for (const m of marks || []) {
      const raw = Number(m.marks);
      const safeMarks = isNaN(raw) ? 0 : raw;

      const percent =
        exam.total_marks > 0 ? (safeMarks / exam.total_marks) * 100 : 0;
      const grade = calcGrade(percent);

      await prisma.result.upsert({
        where: {
          exam_id_student_id: {
            exam_id: examId,
            student_id: m.student_id,
          },
        },
        update: {
          marks: safeMarks,
          grade,
        },
        create: {
          exam_id: examId,
          student_id: m.student_id,
          marks: safeMarks,
          grade,
        },
      });
    }

    // Mark exam as "Completed" (still not Published)
    await prisma.exam.update({
      where: { exam_id: examId },
      data: { status: "Completed" },
    });

    // Notify admin that results were added/updated for this exam
    const examTitle = exam.title || `${exam.subject?.name || "Subject"} Exam`;
    const classLabel = exam.class?.class_name || "Class";

    // Remove older “results added” notices for same exam to avoid duplicates
    await prisma.notice.deleteMany({
      where: {
        exam_id: examId,
        target: "admin",
        title: { contains: "Results added" },
      },
    });

    await prisma.notice.create({
      data: {
        title: `Results added for ${examTitle}`,
        message: `Teacher ${exam.teacher.first_name || ""} ${
          exam.teacher.last_name || ""
        } has added/updated marks for ${classLabel}.`,
        target: "admin",
        class_id: exam.class_id,
        exam_id: examId,
      },
    });

    res.json({ message: "Marks & grades saved. Admin notified." });
  } catch (err) {
    console.error("TEACHER SAVE MARKS ERROR:", err);
    res.status(500).json({ message: "Failed to save marks" });
  }
};

/* =======================================================
   TEACHER: VIEW RESULTS FOR AN EXAM
======================================================= */
export const teacherListResults = async (req, res) => {
  try {
    const examId = Number(req.params.examId);
    const teacherUserId = req.user.id;

    const exam = await prisma.exam.findUnique({
      where: { exam_id: examId },
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
        results: {
          include: { student: true },
          orderBy: { student_id: "asc" },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.teacher.user_id !== teacherUserId) {
      return res.status(403).json({ message: "Unauthorized exam access" });
    }

    const rows = exam.results.map((r) => {
      const fullName = `${r.student.first_name || ""} ${
        r.student.last_name || ""
      }`.trim();
      const percent =
        exam.total_marks > 0 ? (r.marks / exam.total_marks) * 100 : 0;

      return {
        result_id: r.result_id,
        student_id: r.student_id,
        name: fullName || `Student #${r.student_id}`,
        marks: r.marks,
        grade: r.grade,
        percent: Number(percent.toFixed(1)),
      };
    });

    const totalStudents = rows.length;
    const totalMarksSum = rows.reduce((sum, r) => sum + (r.marks || 0), 0);
    const avgMarks =
      totalStudents > 0 ? Number((totalMarksSum / totalStudents).toFixed(1)) : 0;
    const highest = rows.reduce(
      (max, r) => (r.marks > max ? r.marks : max),
      0
    );

    res.json({
      exam: {
        exam_id: exam.exam_id,
        title: exam.title,
        status: exam.status,
        total_marks: exam.total_marks,
        subject_name: exam.subject?.name || "",
        class_name: exam.class?.class_name || "",
      },
      results: rows,
      stats: {
        total_students: totalStudents,
        avg_marks: avgMarks,
        highest_marks: highest,
      },
    });
  } catch (err) {
    console.error("TEACHER LIST RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to load exam results" });
  }
};

/* =======================================================
   ADMIN: PUBLISH EXAM RESULTS (SEND NOTICES)
   POST /api/admin/exams/:examId/publish-results
======================================================= */
export const adminPublishExamResults = async (req, res) => {
  try {
    const examId = Number(req.params.examId);

    const exam = await prisma.exam.findUnique({
      where: { exam_id: examId },
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
        results: {
          include: {
            student: {
              include: {
                parent: {
                  include: { user: true },
                },
                user: true,
              },
            },
          },
        },
      },
    });

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (exam.results.length === 0) {
      return res
        .status(400)
        .json({ message: "No results found for this exam to publish." });
    }

    const examTitle = exam.title;
    const classLabel = exam.class?.class_name || "Class";
    const subjectName = exam.subject?.name || "Subject";

    // Update exam status to "Published" (results published)
    await prisma.exam.update({
      where: { exam_id: examId },
      data: { status: "Published" },
    });

    const noticesToCreate = [];

    // --- Notice for teacher (single)
    if (exam.teacher?.user) {
      noticesToCreate.push({
        title: `Results published for ${subjectName} (${examTitle})`,
        message: `Results for ${subjectName} exam (${examTitle}) of ${classLabel} have been published.`,
        target: "teacher",
        class_id: exam.class_id,
        exam_id: examId,
      });
    }

    // --- Notices for each student + parent
    for (const r of exam.results) {
      const s = r.student;
      if (!s) continue;

      const studentName = `${s.first_name || ""} ${s.last_name || ""}`.trim();

      // student notice
      noticesToCreate.push({
        title: `Your result is published`,
        message: `Your result for ${subjectName} (${examTitle}) has been published. Marks: ${r.marks}/${exam.total_marks}, Grade: ${
          r.grade || "-"
        }.`,
        target: "student",
        class_id: exam.class_id,
        exam_id: examId,
      });

      // parent notice (if parent exists)
      if (s.parent && s.parent.user) {
        noticesToCreate.push({
          title: `Result published for ${studentName}`,
          message: `Result for ${studentName} in ${subjectName} (${examTitle}) has been published. Marks: ${r.marks}/${exam.total_marks}, Grade: ${
            r.grade || "-"
          }.`,
          target: "parent",
          class_id: exam.class_id,
          exam_id: examId,
        });
      }
    }

    // --- Admin already knows (they are triggering publish),
    // but if you want log, you can also add an admin notice here.

    await prisma.notice.createMany({
      data: noticesToCreate,
    });

    res.json({ message: "Exam results published and notices sent." });
  } catch (err) {
    console.error("ADMIN PUBLISH RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to publish exam results" });
  }
};/* =======================================================
   TEACHER: CLASS TERM RESULT
   GET /api/teacher/class/:classId/term/:term
======================================================= */
export const teacherGetTermResults = async (req, res) => {
  try {
    const teacherUserId = req.user.id;
    const classId = Number(req.params.classId);
    const term = decodeURIComponent(req.params.term);

    if (!classId) {
      return res.status(400).json({ message: "Invalid class id" });
    }

    // 1) Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: teacherUserId }
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 2) Get all subjects taught by this teacher
    const subjects = await prisma.subject.findMany({
      where: { teacher_id: teacher.teacher_id },
      select: { subject_id: true }
    });

    const subjectIds = subjects.map(s => s.subject_id);

    // 3) Load exams for this class & term & subjects taught by teacher
    const exams = await prisma.exam.findMany({
      where: {
        class_id: classId,
        term,
        subject_id: { in: subjectIds }
      },
      include: {
        subject: true,
        results: {
          include: { student: true }
        }
      },
      orderBy: { exam_date: "asc" }
    });

    if (exams.length === 0) {
      return res.json({
        classId,
        term,
        students: [],
        subjects: [],
        message: "No results found."
      });
    }

    // 4) Build student result summary
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
            totalFullMarks: 0
          };
        }

        studentMap[st.student_id].subjects[subjectName] = {
          marks: r.marks,
          total: exam.total_marks,
          grade: r.grade
        };

        studentMap[st.student_id].totalMarks += r.marks;
        studentMap[st.student_id].totalFullMarks += exam.total_marks;
      }
    }

    // 5) Apply grade scale
    const gradescale = await prisma.gradescale.findMany();
    const calcGrade = (p) => {
      const row = gradescale.find(g => p >= g.min && p <= g.max);
      return row ? row.grade : "-";
    };

    const students = Object.values(studentMap).map(s => {
      const percent = s.totalFullMarks
        ? Number(((s.totalMarks / s.totalFullMarks) * 100).toFixed(1))
        : 0;

      return {
        ...s,
        percent,
        finalGrade: calcGrade(percent)
      };
    });

    students.sort((a, b) => b.percent - a.percent);

    return res.json({
      classId,
      term,
      students,
      subjects: [...new Set(exams.map(e => e.subject?.name))]
    });
  } catch (err) {
    console.error("TEACHER TERM RESULT ERROR:", err);
    res.status(500).json({ message: "Failed to load results" });
  }
};
