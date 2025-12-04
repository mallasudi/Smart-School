// src/pages/ParentResults.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiBarChart2, FiBookOpen } from "react-icons/fi";
import { api } from "../lib/api";

export default function ParentResults() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api("/parent/results", { auth: true });
        setStudents(data.students || []);
      } catch (err) {
        console.error("Parent results error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const goTerm = (term) => {
    const encoded = encodeURIComponent(term);
    navigate(`/parent/results/term/${encoded}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <FiBarChart2 className="text-cyan-500" />
            Children Final Results
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            View subject-wise performance and overall grades.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => goTerm("First Term Exam")}
            className="px-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
          >
            First Term
          </button>
          <button
            onClick={() => goTerm("Mid Term Exam")}
            className="px-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
          >
            Mid Term
          </button>
          <button
            onClick={() => goTerm("Final Term Exam")}
            className="px-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
          >
            Final Term
          </button>
        </div>

        <span className="text-xs text-gray-400 md:text-right">
          Total Children: {students.length}
        </span>
      </motion.div>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Loading results...
        </p>
      )}

      {!loading && students.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No results available yet.
        </p>
      )}

      {/* Loop each student */}
      {!loading &&
        students.map((child, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -1 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow border border-slate-100 dark:border-slate-700 space-y-4"
          >
            {/* Student Info */}
            <div className="flex items-center justify-between">
              <div className="text-sm flex items-center gap-2">
                <FiUsers className="text-cyan-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {child.first_name} {child.last_name}
                </span>
                <span className="text-gray-400 text-xs">
                  ID: {child.student_id}
                </span>
              </div>

              {/* Overall percent summary */}
              <div className="text-right text-xs">
                <p className="text-gray-500 dark:text-gray-300">
                  Overall Percentage:
                </p>
                <p className="font-semibold text-cyan-500 text-sm">
                  {child.overallPercent}%
                </p>
                <p className="font-semibold text-emerald-500">
                  Final Grade: {child.overallGrade}
                </p>
              </div>
            </div>

            {/* Subject Blocks */}
            <div className="space-y-6">
              {child.subjects.map((subj, si) => (
                <div
                  key={si}
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    {subj.subject}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="px-3 py-2 text-left">Exam</th>
                          <th className="px-3 py-2 text-left">Marks</th>
                          <th className="px-3 py-2 text-left">Percent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subj.exams.map((ex) => (
                          <tr
                            key={ex.exam_id}
                            className="border-t border-slate-200 dark:border-slate-700"
                          >
                            <td className="px-3 py-2 flex items-center gap-2">
                              <FiBookOpen className="text-cyan-500" />
                              {ex.exam.title}{" "}
                              {ex.exam.term && (
                                <span className="text-[10px] text-gray-400 ml-1">
                                  ({ex.exam.term})
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-semibold">
                              {ex.marks} / {ex.exam.total_marks}
                            </td>
                            <td className="px-3 py-2">
                              {(
                                (ex.marks / ex.exam.total_marks) *
                                100
                              ).toFixed(1)}
                              %
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Subject Summary */}
                  <div className="mt-3 text-xs">
                    <p>Total Marks: {subj.totalMarks}</p>
                    <p>Total Full Marks: {subj.totalFull}</p>
                    <p className="font-semibold text-cyan-500">
                      Final Percent: {subj.percent}%
                    </p>
                    <p className="font-semibold text-emerald-500">
                      Final Grade: {subj.finalGrade}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
    </div>
  );
}
