// src/pages/ParentTermResults.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiUsers,
  FiBookOpen,
  FiArrowLeft,
} from "react-icons/fi";
import { api } from "../lib/api";

export default function ParentTermResults() {
  const { term } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const prettyTerm = term ? decodeURIComponent(term) : "";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const safeTerm = encodeURIComponent(prettyTerm);
        const res = await api(`/parent/results/term/${safeTerm}`, {
          auth: true,
        });
        setData(res);
      } catch (err) {
        console.error("Parent term result error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (prettyTerm) load();
  }, [prettyTerm]);

  const students = data?.students || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/parent/results")}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <FiArrowLeft />
            Back
          </button>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <FiBarChart2 className="text-cyan-500" />
              Term Result – {prettyTerm || "Term"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              View overall performance of each child for this term.
            </p>
          </div>
        </div>

        <span className="text-xs text-gray-400">
          Children: {students.length}
        </span>
      </motion.div>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Loading term results...
        </p>
      )}

      {!loading && students.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No results available for this term yet.
        </p>
      )}

      {/* EACH CHILD BLOCK */}
      {!loading &&
        students.map((child, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow border border-slate-100 dark:border-slate-700 space-y-4"
          >
            {/* CHILD HEADER */}
            <div className="flex items-center justify-between">
              <div className="text-sm flex items-center gap-2">
                <FiUsers className="text-cyan-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {child.first_name} {child.last_name}
                </span>
                <span className="text-gray-400 text-xs">
                  ID: {child.student_id}
                </span>
                {child.class_name && (
                  <span className="text-gray-400 text-xs">
                    • {child.class_name}
                  </span>
                )}
              </div>

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

            {/* SUBJECT TABLE */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                <FiBookOpen className="text-cyan-500" />
                Subject-wise Term Summary
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-3 py-2 text-left">Subject</th>
                      <th className="px-3 py-2 text-left">Obtained</th>
                      <th className="px-3 py-2 text-left">Full Marks</th>
                      <th className="px-3 py-2 text-left">Percent</th>
                      <th className="px-3 py-2 text-left">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {child.subjects.map((subj, sIdx) => (
                      <tr
                        key={sIdx}
                        className="border-t border-slate-200 dark:border-slate-700"
                      >
                        <td className="px-3 py-2 font-medium flex items-center gap-2">
                          <FiBookOpen className="text-cyan-500" />
                          {subj.subject}
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {subj.totalMarks}
                        </td>
                        <td className="px-3 py-2">{subj.totalFull}</td>
                        <td className="px-3 py-2">{subj.percent}%</td>
                        <td className="px-3 py-2">
                          <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 font-semibold">
                            {subj.finalGrade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ))}
    </div>
  );
}
