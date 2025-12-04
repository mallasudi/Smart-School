// src/pages/StudentExamList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBookOpen, FiClock, FiUser, FiArrowRight } from "react-icons/fi";
import { api } from "../lib/api";

export default function StudentExamList() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api("/student/exams", { auth: true });
        setExams(data.exams || []);
      } catch (err) {
        console.error("Student exams error:", err);
        setError(err.message || "Failed to load exams");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FiBookOpen className="text-cyan-500" />
              Upcoming Exams
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View exams scheduled for your class and start when you are ready.
            </p>
          </div>
        </motion.div>

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-300">Loading exams...</p>
        )}

        {error && !loading && (
          <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && exams.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-300">
            No exams scheduled for your class yet.
          </p>
        )}

        {!loading && exams.length > 0 && (
          <div className="space-y-4">
            {exams.map((exam) => (
              <motion.div
                key={exam.exam_id}
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-100 dark:border-slate-700"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {exam.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {exam.subject && (
                      <span className="inline-flex items-center gap-1">
                        <FiBookOpen className="text-cyan-500" /> {exam.subject.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <FiClock className="text-blue-500" />
                      {new Date(exam.exam_date).toLocaleString()}
                    </span>
                    {exam.teacher && (
                      <span className="inline-flex items-center gap-1">
                        <FiUser className="text-emerald-500" />
                        {exam.teacher.first_name} {exam.teacher.last_name}
                      </span>
                    )}
                    {exam.total_marks != null && (
                      <span className="inline-flex items-center gap-1">
                        Total: {exam.total_marks} marks
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student/exams/${exam.exam_id}`)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium shadow hover:shadow-lg"
                >
                  Start Exam <FiArrowRight />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
