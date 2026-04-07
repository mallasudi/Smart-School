// src/pages/StudentResults.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiBarChart2, FiBookOpen, FiChevronDown } from "react-icons/fi";
import { api } from "../lib/api";

export default function StudentResults() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSubject, setOpenSubject] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api("/student/results", { auth: true });
        setData(res);
      } catch (err) {
        console.error("Student results error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggle = (subject) =>
    setOpenSubject((prev) => (prev === subject ? null : subject));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex items-center justify-between"
        >
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FiBarChart2 className="text-cyan-500" />
            My Final Results
          </h1>

          <span className="text-xs text-gray-400">
            Subjects: {data?.subjects?.length || 0}
          </span>
        </motion.div>

        {loading && <p className="text-sm text-gray-500">Loading results...</p>}

        {!loading && (!data || data.subjects.length === 0) && (
          <p className="text-sm text-gray-500">No results available yet.</p>
        )}

        {/* SUBJECT-WISE RESULTS */}
        {!loading && data?.subjects?.length > 0 && (
          <div className="space-y-4">
            {data.subjects.map((subj, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700 p-5"
              >
                {/* MAIN SUMMARY ROW */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggle(subj.subject)}
                >
                  <div className="flex items-center gap-3">
                    <FiBookOpen className="text-cyan-500" />
                    <span className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                      {subj.subject}
                    </span>
                  </div>

                  <motion.div
                    animate={{ rotate: openSubject === subj.subject ? 180 : 0 }}
                  >
                    <FiChevronDown className="text-gray-500 text-xl" />
                  </motion.div>
                </div>

                {/* SUMMARY STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-center">
                    <p className="text-gray-500 text-xs">Total Marks</p>
                    <p className="font-semibold">
                      {subj.totalMarks} / {subj.totalFull}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-center">
                    <p className="text-gray-500 text-xs">Percent</p>
                    <p className="font-semibold text-cyan-600">
                      {subj.percent}%
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-center">
                    <p className="text-gray-500 text-xs">Final Grade</p>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-300">
                      {subj.finalGrade}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-center">
                    <p className="text-gray-500 text-xs">Exams</p>
                    <p className="font-semibold">{subj.totalExams}</p>
                  </div>
                </div>

                {/* EXPANDED EXAM DETAILS */}
                {openSubject === subj.subject && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 overflow-x-auto"
                  >
                    <table className="w-full text-sm border rounded-xl">
                      <thead className="bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-3 py-2">Exam</th>
                          <th className="px-3 py-2">Marks</th>
                          <th className="px-3 py-2">Percent</th>
                        </tr>
                      </thead>

                      <tbody>
                        {subj.exams.map((exam, idx2) => (
                          <tr
                            key={idx2}
                            className="border-t dark:border-slate-700"
                          >
                            <td className="px-3 py-2">{exam.exam.title}</td>
                            <td className="px-3 py-2 font-semibold">
                              {exam.marks} / {exam.exam.total_marks}
                            </td>
                            <td className="px-3 py-2">
                              {((exam.marks / exam.exam.total_marks) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
