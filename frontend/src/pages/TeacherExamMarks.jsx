// src/pages/TeacherExamMarks.jsx
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FiCheckSquare, FiBookOpen } from "react-icons/fi";
import { api } from "../lib/api";

export default function TeacherExamMarks() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examInfo, setExamInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hardcoded same as GradeScale in backend
  const computeGrade = (marks, total) => {
    if (!total || total <= 0 || marks == null) return "-";
    const percent = (marks / total) * 100;

    if (percent >= 90) return "A";
    if (percent >= 80) return "B";
    if (percent >= 70) return "C";
    if (percent >= 60) return "D";
    return "F";
  };

  // Load teacher exams
  useEffect(() => {
    async function load() {
      try {
        const data = await api("/teacher/exams", { auth: true });
        setExams(data.exams || []);
      } catch (err) {
        console.error("Teacher exams error:", err);
      }
    }
    load();
  }, []);

  // Load marks for selected exam
  useEffect(() => {
    async function loadMarks() {
      if (!selectedExamId) return;
      try {
        setLoading(true);
        const data = await api(`/teacher/exams/${selectedExamId}/marks`, {
          auth: true,
        });
        setExamInfo(data.exam);
        // ensure marks are numeric or empty string for input
        const withLocal = (data.students || []).map((s) => ({
          ...s,
          marks: s.marks == null ? "" : s.marks,
        }));
        setStudents(withLocal);
      } catch (err) {
        console.error("Teacher exam marks error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMarks();
  }, [selectedExamId]);

  const updateMark = (student_id, value) => {
    const raw = value === "" ? "" : Number(value);
    if (raw !== "" && (isNaN(raw) || raw < 0)) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === student_id ? { ...s, marks: raw } : s
      )
    );
  };

  const totalStudents = students.length;

  const stats = useMemo(() => {
    if (!examInfo || students.length === 0) {
      return { avg: 0, highest: 0 };
    }
    const numericMarks = students
      .map((s) => (s.marks === "" || s.marks == null ? 0 : Number(s.marks)))
      .filter((x) => !isNaN(x));
    if (numericMarks.length === 0) return { avg: 0, highest: 0 };

    const sum = numericMarks.reduce((a, b) => a + b, 0);
    const highest = Math.max(...numericMarks);
    return {
      avg: sum / numericMarks.length,
      highest,
    };
  }, [students, examInfo]);

  const saveMarks = async () => {
    if (!selectedExamId) {
      alert("Select an exam first");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        marks: students.map((s) => ({
          student_id: s.student_id,
          marks:
            s.marks === "" || s.marks == null
              ? 0
              : Number(s.marks),
        })),
      };

      await api(`/teacher/exams/${selectedExamId}/marks`, {
        method: "POST",
        body: payload,
        auth: true,
      });

      alert("Marks & grades saved successfully ✅");
    } catch (err) {
      console.error("Save marks error:", err);
      alert(err.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <FiBookOpen className="text-cyan-500" /> Exam Marks Entry
      </h2>

      <motion.div
        whileHover={{ y: -1 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow space-y-4"
      >
        {/* Exam selector */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm text-gray-500">Select Exam:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
          >
            <option value="">-- Choose Exam --</option>
            {exams.map((exam) => (
              <option key={exam.exam_id} value={exam.exam_id}>
                {exam.title} ({exam.class?.class_name}) –{" "}
                {new Date(exam.exam_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {examInfo && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            <span className="font-semibold">Exam:</span> {examInfo.title} •{" "}
            <span className="font-semibold">Total Marks:</span>{" "}
            {examInfo.total_marks}
          </p>
        )}

        {loading && selectedExamId && (
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-4">
            Loading students...
          </p>
        )}

        {/* Marks table */}
        {selectedExamId && !loading && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border">
              <thead className="bg-gray-100 dark:bg-slate-700 text-sm">
                <tr>
                  <th className="p-2">Student ID</th>
                  <th className="p-2">Student Name</th>
                  <th className="p-2">Marks</th>
                  <th className="p-2">Percent</th>
                  <th className="p-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const marksVal =
                    s.marks === "" || s.marks == null
                      ? null
                      : Number(s.marks);
                  const percent =
                    examInfo && marksVal != null && !isNaN(marksVal)
                      ? ((marksVal / examInfo.total_marks) * 100).toFixed(1)
                      : "-";
                  const grade = computeGrade(
                    marksVal,
                    examInfo?.total_marks || 0
                  );

                  return (
                    <motion.tr
                      key={s.student_id}
                      whileHover={{ scale: 1.01 }}
                      className="border-t text-sm"
                    >
                      <td className="p-2">{s.student_id}</td>
                      <td className="p-2 font-medium">{s.name}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={s.marks}
                          onChange={(e) =>
                            updateMark(s.student_id, e.target.value)
                          }
                          className="border rounded-md px-2 py-1 w-20 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
                          min="0"
                        />
                      </td>
                      <td className="p-2">{percent}%</td>
                      <td className="p-2 font-semibold">{grade}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {selectedExamId && !loading && examInfo && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-500 dark:text-gray-300 text-sm">
              Total Students:{" "}
              <span className="font-semibold text-gray-800 dark:text-white">
                {totalStudents}
              </span>{" "}
              • Average Marks:{" "}
              <span className="font-semibold text-cyan-600">
                {stats.avg.toFixed(1)}
              </span>{" "}
              • Highest:{" "}
              <span className="font-semibold text-emerald-600">
                {stats.highest}
              </span>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={saveMarks}
              disabled={saving || !selectedExamId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-60"
            >
              <FiCheckSquare /> {saving ? "Saving..." : "Save Marks & Grades"}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
