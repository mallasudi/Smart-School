// src/pages/TeacherGrades.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { FiBook, FiCheckCircle, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function TeacherGrades() {
  const { token } = useAuth();

  const [terms] = useState([
    "First Term Exam",
    "Second Term Exam",
    "Final Exam",
  ]);

  const [selectedTerm, setSelectedTerm] = useState("First Term Exam");

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1️⃣ Load classes for teacher
const loadClasses = async () => {
  try {
    const res = await axios.get("/api/teacher/classes", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const fetched = Array.isArray(res.data) ? res.data : [];
    setClasses(fetched);

    if (fetched.length > 0) {
      setSelectedClass(fetched[0].class_id);
    }
  } catch (err) {
    console.error("Error loading teacher classes:", err);
  }
};

const fetchResults = async () => {
  if (!selectedClass) return;

  try {
    setLoading(true);

    const res = await axios.get(
      `/api/teacher/results/class/${selectedClass}/term/${selectedTerm}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setResults(res.data.students || []);
  } catch (err) {
    console.error("Error loading results:", err);
    setResults([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedTerm]);

  // Derived
  const topper =
    results.length > 0
      ? [...results].sort((a, b) => b.percent - a.percent)[0]
      : null;

  const average =
    results.length > 0
      ? Math.round(
          results.reduce((a, b) => a + b.percent, 0) / results.length
        )
      : 0;

  const gradeData = [
    { name: "A (80-100)", value: results.filter((s) => s.percent >= 80).length },
    {
      name: "B (60-79)",
      value: results.filter((s) => s.percent >= 60 && s.percent < 80).length,
    },
    {
      name: "C (40-59)",
      value: results.filter((s) => s.percent >= 40 && s.percent < 60).length,
    },
    { name: "D (<40)", value: results.filter((s) => s.percent < 40).length },
  ];

  const colors = ["#22c55e", "#3b82f6", "#facc15", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">📊 Grade Management</h2>

        <div className="flex gap-4">
          {/* Class Dropdown */}
          <select
            value={selectedClass || ""}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
            className="px-4 py-2 text-black rounded-lg"
          >
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                Class {c.class_name} ({c.section})
              </option>
            ))}
          </select>

          {/* Term Dropdown */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-4 py-2 text-black rounded-lg"
          >
            {terms.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="text-center text-gray-600">Loading results…</p>}

      {/* No Results */}
      {!loading && results.length === 0 && (
        <p className="text-center text-gray-500">
          No results found for this class & term.
        </p>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          {/* Topper */}
          <div className="p-5 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl shadow flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">🏆 Topper of the Term</p>
              <h3 className="text-2xl font-bold mt-1">{topper?.name}</h3>
            </div>
            <div className="bg-white text-black px-6 py-3 rounded-xl shadow text-center">
              <p className="text-sm">Percent</p>
              <p className="text-3xl font-bold">{topper?.percent}%</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            <div className="flex items-center gap-3 bg-green-100 p-4 rounded-xl shadow">
              <FiUser className="text-green-600 text-3xl" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-xl font-bold">{results.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-yellow-100 p-4 rounded-xl shadow">
              <FiBook className="text-yellow-600 text-3xl" />
              <div>
                <p className="text-sm text-gray-600">Average Percent</p>
                <p className="text-xl font-bold">{average}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-blue-100 p-4 rounded-xl shadow">
              <FiCheckCircle className="text-blue-600 text-3xl" />
              <div>
                <p className="text-sm text-gray-600">Pass</p>
                <p className="text-xl font-bold">
                  {results.filter((s) => s.percent >= 40).length}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4">
                Overall Performance
              </h3>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percent" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4">
                Grade Distribution
              </h3>

              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={gradeData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {gradeData.map((_, i) => (
                      <Cell key={i} fill={colors[i]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Results Table */}
          <div className="bg-white p-6 rounded-xl shadow mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Student Results – Class {selectedClass} ({selectedTerm})
            </h3>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3">Student</th>
                  <th className="p-3">Total Marks</th>
                  <th className="p-3">Full Marks</th>
                  <th className="p-3">Percent</th>
                  <th className="p-3">Final Grade</th>
                </tr>
              </thead>

              <tbody>
                {results.map((s, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3">{s.totalMarks}</td>
                    <td className="p-3">{s.totalFullMarks}</td>
                    <td className="p-3">{s.percent}%</td>
                    <td className="p-3 font-bold">{s.finalGrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subject Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow mt-6">
            <h3 className="text-lg font-semibold mb-3">
              Subject-wise Breakdown
            </h3>

            {results.map((s, i) => (
              <div key={i} className="mb-6">
                <p className="font-bold text-blue-600">{s.name}</p>

                <table className="w-full mt-2 border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Subject</th>
                      <th className="p-2">Marks</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Grade</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.keys(s.subjects).map((sub, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{sub}</td>
                        <td className="p-2">{s.subjects[sub].marks}</td>
                        <td className="p-2">{s.subjects[sub].total}</td>
                        <td className="p-2">{s.subjects[sub].grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
