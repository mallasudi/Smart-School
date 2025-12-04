// src/pages/AdminClassResults.jsx
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiUsers,
  FiCheckCircle,
  FiAlertTriangle,
  FiChevronDown,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { api } from "../lib/api";

const TERMS = [
  "First Term Exam",
  "Mid Term Exam",
  "Final Term Exam",
];

export default function AdminClassResults() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [term, setTerm] = useState(TERMS[0]);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  const [data, setData] = useState(null);
  const [openStudentId, setOpenStudentId] = useState(null);

  // ---------- load class list ----------
  useEffect(() => {
    async function load() {
      try {
        setLoadingClasses(true);
        const res = await api("/admin/results/classes", { auth: true });
        setClasses(res.classes || []);
        if (res.classes && res.classes.length > 0) {
          setSelectedClassId(String(res.classes[0].class_id));
        }
      } catch (err) {
        console.error("Admin class list error:", err);
      } finally {
        setLoadingClasses(false);
      }
    }
    load();
  }, []);

  // ---------- fetch results ----------
  const fetchResults = async () => {
    if (!selectedClassId || !term) return;
    try {
      setLoadingResults(true);
      setData(null);
      const res = await api(
        `/admin/results/class?classId=${selectedClassId}&term=${encodeURIComponent(
          term
        )}`,
        { auth: true }
      );
      setData(res);
      setOpenStudentId(null);
    } catch (err) {
      console.error("Admin class term results error:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  // Auto-load once we have classes
  useEffect(() => {
    if (selectedClassId && term) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, term]);

  const chartData = useMemo(() => {
    if (!data?.students) return [];
    return data.students.map((s) => ({
      name: `${s.first_name} ${s.last_name}`.trim() || `ID ${s.student_id}`,
      percent: s.overallPercent,
    }));
  }, [data]);

  const toggleStudent = (id) =>
    setOpenStudentId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
            <FiBarChart2 className="text-cyan-500" />
            Class Results (Admin)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View overall term performance for each class and student.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={loadingClasses}
          >
            {loadingClasses && <option>Loading classes...</option>}
            {!loadingClasses && classes.length === 0 && (
              <option>No classes found</option>
            )}
            {!loadingClasses &&
              classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_name}
                  {c.section ? ` (${c.section})` : ""}
                </option>
              ))}
          </select>

          <select
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* SUMMARY CARDS */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <SummaryCard
            icon={FiUsers}
            label="Total Students"
            value={data.summary?.totalStudents ?? 0}
          />
          <SummaryCard
            icon={FiBarChart2}
            label="Average Percent"
            value={`${data.summary?.averagePercent ?? 0}%`}
          />
          <SummaryCard
            icon={FiCheckCircle}
            label="Pass"
            value={data.summary?.passCount ?? 0}
            accent="from-emerald-500 to-teal-500"
          />
          <SummaryCard
            icon={FiAlertTriangle}
            label="Fail"
            value={data.summary?.failCount ?? 0}
            accent="from-rose-500 to-orange-500"
          />
        </motion.div>
      )}

      {/* LOADING / EMPTY */}
      {loadingResults && (
        <p className="text-sm text-slate-500">Loading term results...</p>
      )}

      {!loadingResults && data && data.students.length === 0 && (
        <p className="text-sm text-slate-500">
          No results found for this class &amp; term yet.
        </p>
      )}

      {/* CHART */}
      {!loadingResults && data && data.students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <h2 className="font-semibold text-slate-800 mb-3">
            Overall Percent by Student
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percent" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Hover on bars to see each student&apos;s overall percent.
          </p>
        </motion.div>
      )}

      {/* TABLE + EXPAND PER STUDENT */}
      {!loadingResults && data && data.students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              Student Term Summary –{" "}
              <span className="text-cyan-600">
                {data.class?.class_name}
                {data.class?.section ? ` (${data.class.section})` : ""} •{" "}
                {data.term}
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              {data.students.length} students
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Total Marks</th>
                <th className="px-4 py-2 text-left">Full Marks</th>
                <th className="px-4 py-2 text-left">Percent</th>
                <th className="px-4 py-2 text-left">Final Grade</th>
                <th className="px-4 py-2 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s, idx) => {
                const name =
                  `${s.first_name} ${s.last_name}`.trim() ||
                  `Student #${s.student_id}`;
                const isOpen = openStudentId === s.student_id;

                return (
                  <FragmentRow
                    key={s.student_id}
                    idx={idx}
                    student={s}
                    name={name}
                    isOpen={isOpen}
                    toggleStudent={toggleStudent}
                  />
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, accent = "from-cyan-500 to-blue-600" }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)" }}
      className="bg-white rounded-2xl shadow p-4 flex items-center justify-between"
    >
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-semibold text-slate-800 mt-1">{value}</p>
      </div>
      <div
        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accent} text-white flex items-center justify-center`}
      >
        <Icon size={20} />
      </div>
    </motion.div>
  );
}

function FragmentRow({ student, name, isOpen, toggleStudent, idx }) {
  return (
    <>
      <tr
        className={`border-t ${
          idx % 2 === 0 ? "bg-white" : "bg-slate-50"
        } transition`}
      >
        <td className="px-4 py-3 font-medium text-slate-800">{name}</td>
        <td className="px-4 py-3">{student.totalMarks}</td>
        <td className="px-4 py-3">{student.totalFullMarks}</td>
        <td className="px-4 py-3">{student.overallPercent}%</td>
        <td className="px-4 py-3">
          <span className="px-3 py-1 rounded-full bg-slate-100 font-semibold">
            {student.overallGrade}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => toggleStudent(student.student_id)}
            className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700"
          >
            {isOpen ? "Hide details" : "View details"}
            <FiChevronDown
              className={`transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </td>
      </tr>

      <AnimatePresence>
        {isOpen && (
          <tr className="bg-slate-50/60">
            <td colSpan={6} className="px-4 pb-4">
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-2 rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Subject-wise Breakdown
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 text-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left">Subject</th>
                        <th className="px-3 py-2 text-left">Exam</th>
                        <th className="px-3 py-2 text-left">Marks</th>
                        <th className="px-3 py-2 text-left">Percent</th>
                        <th className="px-3 py-2 text-left">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.subjects.map((sub, i) => (
                        <tr
                          key={i}
                          className="border-t border-slate-100 last:border-b-0"
                        >
                          <td className="px-3 py-2">{sub.subject}</td>
                          <td className="px-3 py-2">{sub.exam_title}</td>
                          <td className="px-3 py-2">
                            {sub.marks} / {sub.total_marks}
                          </td>
                          <td className="px-3 py-2">{sub.percent}%</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-1 rounded-full bg-slate-100 font-semibold">
                              {sub.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
