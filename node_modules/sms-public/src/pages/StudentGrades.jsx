// src/pages/StudentGrades.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiBook, FiBarChart2 } from "react-icons/fi";
import { api } from "../lib/api";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function StudentGrades() {
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]); // NEW
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrades();
    loadTermResults();
  }, []);

  /* ===============================
      LOAD SUBJECT-WISE FINAL GRADE 
  =============================== */
  const loadGrades = async () => {
    try {
      setLoading(true);
      const data = await api("/student/results", { auth: true });
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error("Student grades load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      LOAD TERM-WISE OVERALL RESULTS
  =============================== */
  const loadTermResults = async () => {
    try {
      const termNames = [
        "First Term Exam",
        "Mid Term Exam",
        "Final Term Exam",
      ];

      const results = [];

      for (const t of termNames) {
        try {
          const res = await api(`/student/results/term/${encodeURIComponent(t)}`, { auth: true });
          results.push({
            term: res.term,
            total: res.totalMarks,
            full: res.totalFullMarks,
            percent: res.overallPercent,
            grade: res.overallGrade,
          });
        } catch (e) {
          // Term not found = skip (normal)
        }
      }

      setTerms(results);
    } catch (err) {
      console.error("Term result error:", err);
    }
  };

  // Prepare bar chart data
  const barData = subjects.map((s) => ({
    subject: s.subject,
    percent: s.percent,
  }));

  // Prepare GPA trend (dummy → can improve later)
  const trend = subjects.map((s, i) => ({
    idx: "Exam " + (i + 1),
    percent: s.percent,
  }));

  return (
    <div className="space-y-8">
      {/* HEADER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex items-center justify-between"
      >
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FiTrendingUp className="text-cyan-500" /> My Subject Grades
        </h1>
        <span className="text-xs text-gray-400">Total Subjects: {subjects.length}</span>
      </motion.div>

      {/* LOADING */}
      {loading && <p className="text-sm text-gray-500 dark:text-gray-300">Loading...</p>}

      {/* NO DATA */}
      {!loading && subjects.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-300">No grades available.</p>
      )}

      {/* ACTUAL CONTENT */}
      {!loading && subjects.length > 0 && (
        <>
          {/* CHARTS */}
          <div className="grid xl:grid-cols-2 gap-6">
            {/* BAR CHART */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FiBarChart2 className="text-cyan-500" /> Subject Performance (%)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percent" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* LINE CHART */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FiTrendingUp className="text-green-500" /> Grade Trend (By Subject)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="idx" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="percent"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* SUBJECT-WISE TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow"
          >
            <h3 className="font-semibold mb-4">Subject-wise Grade Details</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Total Marks</th>
                  <th className="px-4 py-2 text-left">Obtained</th>
                  <th className="px-4 py-2 text-left">Percent</th>
                  <th className="px-4 py-2 text-left">Final Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-2 font-medium flex items-center gap-2">
                      <FiBook className="text-cyan-500" />
                      {s.subject}
                    </td>
                    <td className="px-4 py-2">{s.totalFull}</td>
                    <td className="px-4 py-2 font-semibold">{s.totalMarks}</td>
                    <td className="px-4 py-2">{s.percent}%</td>
                    <td className="px-4 py-2">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 font-semibold">
                        {s.finalGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* ==================================================
                ⭐ NEW TERM-WISE OVERALL RESULT SUMMARY ⭐
          ================================================== */}
          {terms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow"
            >
              <h3 className="font-semibold mb-4">Term-wise Final Results</h3>

              <div className="space-y-3">
                {terms.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-xl bg-gray-50 dark:bg-slate-700/40"
                  >
                    <div className="font-medium">{t.term}</div>
                    <div className="text-sm">
                      <span className="font-semibold">{t.total}</span> / {t.full}
                    </div>
                    <div className="font-semibold">{t.percent}%</div>
                    <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-600 font-semibold">
                      {t.grade}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
