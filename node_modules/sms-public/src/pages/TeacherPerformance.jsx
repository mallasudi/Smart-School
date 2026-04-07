// src/pages/TeacherPerformance.jsx
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { FiBarChart2, FiAward, FiUsers, FiBookOpen } from "react-icons/fi";
import { api } from "../lib/api";

export default function TeacherPerformance() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all exams for teacher
  useEffect(() => {
    async function load() {
      try {
        const data = await api("/teacher/exams", { auth: true });
        setExams(data.exams || []);
      } catch (err) {
        console.error("Teacher Exams Load Error:", err);
      }
    }
    load();
  }, []);

  // Load results when exam selected
  useEffect(() => {
    async function loadResults() {
      if (!selectedExamId) return;
      try {
        setLoading(true);
        const data = await api(`/teacher/exams/${selectedExamId}/results`, {
          auth: true,
        });
        setResults(data.results || []);
      } catch (err) {
        console.error("Performance load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [selectedExamId]);

  const examInfo = useMemo(
    () => exams.find((e) => e.exam_id == selectedExamId),
    [selectedExamId, exams]
  );

  // ------------ ANALYTICS ------------
  const total = results.length;
  const marks = results.map((r) => r.marks);
  const totalMarks = examInfo?.total_marks || 1;

  const avg =
    total > 0 ? marks.reduce((a, b) => a + b, 0) / total : 0;

  const highest = Math.max(...marks, 0);
  const lowest = Math.min(...marks, 0);

  // Convert grade
  const getGrade = (percent) => {
    if (percent >= 90) return "A";
    if (percent >= 80) return "B";
    if (percent >= 70) return "C";
    if (percent >= 60) return "D";
    return "F";
  };

  // Grade distribution
  const gradeDist = results.reduce(
    (acc, r) => {
      const p = (r.marks / totalMarks) * 100;
      const g = getGrade(p);
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0, F: 0 }
  );

  const gradeData = Object.keys(gradeDist).map((g) => ({
    grade: g,
    count: gradeDist[g],
  }));

  const topper = results.reduce(
    (best, r) => (r.marks > (best?.marks || 0) ? r : best),
    null
  );

  const weak = results.reduce(
    (worst, r) => (r.marks < (worst?.marks ?? 9999) ? r : worst),
    null
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow flex justify-between items-center"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <FiBarChart2 className="text-cyan-500" /> Performance Analytics
        </h2>
      </motion.div>

      {/* Exam selector */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow space-y-4">
        <label className="text-sm text-gray-500">Select Exam:</label>
        <select
          className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
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

      {/* If no exam selected */}
      {!selectedExamId && (
        <p className="text-gray-500 dark:text-gray-300">
          Select an exam to view performance.
        </p>
      )}

      {/* ANALYTICS SECTION */}
      {selectedExamId && results.length > 0 && (
        <div className="space-y-6">

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              icon={<FiUsers />}
              label="Total Students"
              value={total}
              color="text-blue-500"
            />
            <StatCard
              icon={<FiAward />}
              label="Class Average"
              value={`${avg.toFixed(1)}%`}
              color="text-green-500"
            />
            <StatCard
              icon={<FiBookOpen />}
              label="Highest Marks"
              value={highest}
              color="text-cyan-500"
            />
            <StatCard
              icon={<FiBookOpen />}
              label="Lowest Marks"
              value={lowest}
              color="text-rose-500"
            />
          </div>

          {/* Grade Distribution Chart */}
          <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Topper & Weak Student */}
          <div className="grid sm:grid-cols-2 gap-6">
            <InfoCard title="Topper" student={topper} exam={examInfo} type="top" />
            <InfoCard title="Needs Improvement" student={weak} exam={examInfo} type="weak" />
          </div>
        </div>
      )}

      {selectedExamId && !loading && results.length === 0 && (
        <p className="text-gray-500 dark:text-gray-300">
          No results found for this exam.
        </p>
      )}
    </div>
  );
}

/* ------------------------------- REUSABLE COMPONENTS ------------------------------- */
function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow"
    >
      <div className={`${color} text-3xl mb-2`}>{icon}</div>
      <h3 className="font-semibold text-gray-700 dark:text-gray-200">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

function InfoCard({ title, student, exam, type }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
      <h3 className="font-semibold mb-3">{title}</h3>
      {!student ? (
        <p className="text-sm text-gray-500">No data available</p>
      ) : (
        <div className="text-sm">
          <p className="font-semibold">
            {student.student.first_name} {student.student.last_name}
          </p>
          <p className="text-gray-500">
            Marks: {student.marks} / {exam.total_marks}
          </p>
        </div>
      )}
    </motion.div>
  );
}
