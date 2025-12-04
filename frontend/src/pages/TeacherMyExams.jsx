// src/pages/TeacherMyExams.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBookOpen, FiUsers, FiBarChart2, FiEdit3 } from "react-icons/fi";
import { api } from "../lib/api";

export default function TeacherMyExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api("/teacher/exams", { auth: true });
        setExams(data.exams || []);
      } catch (err) {
        console.error("Teacher exams error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow flex items-center justify-between"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FiBookOpen className="text-cyan-500" />
          My Exams
        </h2>
        <span className="text-xs text-gray-400">
          Total: {exams.length}
        </span>
      </motion.div>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-300">Loading exams...</p>
      )}

      {!loading && exams.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No exams created for your classes yet.
        </p>
      )}

      {!loading && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((exam) => (
            <motion.div
              key={exam.exam_id}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  {exam.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <FiBookOpen className="text-cyan-500" />
                    {exam.subject?.name || "Subject"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FiUsers className="text-emerald-500" />
                    {exam.class?.class_name || "Class"}
                  </span>
                  <span>
                    {new Date(exam.exam_date).toLocaleString()}
                  </span>
                  <span>Total: {exam.total_marks} marks</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/teacher/exams/${exam.exam_id}/questions`)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white inline-flex items-center gap-1"
                >
                  <FiEdit3 /> Manage Questions
                </button>
                <button
                  onClick={() => navigate(`/teacher/exams/${exam.exam_id}/marks`)}
                  className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-600 text-gray-700 dark:text-gray-200"
                >
                  Enter Marks
                </button>
                <button
                  onClick={() => navigate(`/teacher/exams/${exam.exam_id}/results`)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-900 text-white inline-flex items-center gap-1"
                >
                  <FiBarChart2 /> View Results
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
