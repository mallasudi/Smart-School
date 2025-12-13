import { prisma } from "../utils/prisma.js";

/* ======================================================
   ADMIN: Monthly Attendance Summary (for Charts)
====================================================== */
export const adminMonthlyAttendance = async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      orderBy: { date: "asc" },
    });

    const monthly = {};

    for (const r of records) {
      const month = new Date(r.date).toISOString().slice(0, 7); // 2025-12

      if (!monthly[month]) {
        monthly[month] = { present: 0, absent: 0, late: 0 };
      }

      if (r.status === "Present") monthly[month].present++;
      if (r.status === "Absent") monthly[month].absent++;
      if (r.status === "Late") monthly[month].late++;
    }

    const final = Object.keys(monthly).map((m) => ({
      month: m,
      present: monthly[m].present,
      absent: monthly[m].absent,
      late: monthly[m].late,
    }));

    return res.json(final);
  } catch (err) {
    console.error("ADMIN MONTHLY ERROR:", err);
    return res.status(500).json({ message: "Failed to load monthly summary" });
  }
};

/* ======================================================
   ADMIN: Class-wise Attendance %
====================================================== */
export const adminClassAttendance = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: { students: true },
    });

    const response = [];

    for (const cls of classes) {
      const studentIds = cls.students.map((s) => s.student_id);

      if (studentIds.length === 0) continue;

      const attendance = await prisma.attendance.findMany({
        where: { student_id: { in: studentIds } },
      });

      const present = attendance.filter((r) => r.status === "Present").length;
      const total = attendance.length;

      response.push({
        class_name: `${cls.class_name} (${cls.section})`,
        percentage: total ? Math.round((present / total) * 100) : 0,
      });
    }

    return res.json(response);
  } catch (err) {
    console.error("ADMIN CLASS ATTENDANCE ERROR:", err);
    return res.status(500).json({ message: "Failed to load class report" });
  }
};

/* ======================================================
   ADMIN: Latest Attendance Table
====================================================== */
export const adminLatestAttendance = async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      orderBy: { attendance_id: "desc" },
      take: 20,
      include: {
        student: true,
        student: {
          include: {
            class: true,
          },
        },
      },
    });

    const formatted = records.map((r) => ({
      name: `${r.student.first_name} ${r.student.last_name}`,
      class: r.student.class?.class_name || "N/A",
      date: new Date(r.date).toISOString().slice(0, 10),
      status: r.status,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("ADMIN LATEST ERROR:", err);
    return res.status(500).json({ message: "Failed to load recent attendance" });
  }
};
