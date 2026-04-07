// src/pages/TeacherExamResults.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBarChart2, FiBookOpen, FiUsers } from "react-icons/fi";
import { api } from "../lib/api";

export default function TeacherExamResults() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api(`/teacher/exams/${examId}/results`, {
          auth: true,
        });

        setExam(data.exam);
        setResults(data.results || []);
      } catch (err) {
        console.error("Teacher exam results error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  const getPercent = (marks, total) =>
    total ? ((marks / total) * 100).toFixed(1) : "-";

  const getGrade = (p) => {
    if (p === "-") return "-";
    p = Number(p);
    if (p >= 90) return "A";
    if (p >= 80) return "B";
    if (p >= 70) return "C";
    if (p >= 60) return "D";
    return "F";
  };

  // Summary calculations
  const percentages = results.map((r) =>
    Number(getPercent(r.marks, exam?.total_marks))
  ).filter((p) => !isNaN(p));

  const avg = percentages.length
    ? (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1)
    : "-";

  const highest = percentages.length ? Math.max(...percentages) : "-";
  const lowest = percentages.length ? Math.min(...percentages) : "-";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FiBarChart2 className="text-cyan-500" />
            Exam Results
          </h2>

          {exam && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1">
                <FiBookOpen className="text-cyan-500" /> {exam.title}
              </span>
              <span className="inline-flex items-center gap-1">
                <FiUsers className="text-emerald-500" />
                {exam.class?.class_name}
              </span>
              <span>Subject: {exam.subject?.name}</span>
              <span>Total Marks: {exam.total_marks}</span>
            </p>
          )}
        </div>

        <span className="text-xs text-gray-400">
          Students: {results.length}
        </span>
      </motion.div>

      {/* SUMMARY BOX */}
      {!loading && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Class Average</p>
            <p className="text-xl font-bold text-cyan-600">{avg}%</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Highest Score</p>
            <p className="text-xl font-bold text-green-600">{highest}%</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Lowest Score</p>
            <p className="text-xl font-bold text-red-500">{lowest}%</p>
          </div>
        </motion.div>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Loading exam results...
        </p>
      )}

      {/* EMPTY */}
      {!loading && results.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No results available for this exam yet.
        </p>
      )}

      {/* RESULTS TABLE */}
      {!loading && results.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Student ID</th>
                <th className="px-4 py-2 text-left">Marks</th>
                <th className="px-4 py-2 text-left">Percent</th>
                <th className="px-4 py-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const p = getPercent(r.marks, exam?.total_marks);
                const g = getGrade(p);

                return (
                  <tr
                    key={r.result_id}
                    className="border-t border-slate-100 dark:border-slate-700"
                  >
                    <td className="px-4 py-2">
                      {r.student?.first_name} {r.student?.last_name}
                    </td>

                    <td className="px-4 py-2">{r.student?.student_id}</td>

                    <td className="px-4 py-2 font-semibold">
                      {r.marks} / {exam?.total_marks}
                    </td>

                    <td className="px-4 py-2">{p}%</td>

                    <td className="px-4 py-2">
                      <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-semibold">
                        {g}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
