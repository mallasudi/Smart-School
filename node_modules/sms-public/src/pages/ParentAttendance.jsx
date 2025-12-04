// src/pages/ParentAttendance.jsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { FiCalendar, FiSearch, FiDownload } from "react-icons/fi";

const rawDaily = [
  { date: "2025-09-22", status: "Present" },
  { date: "2025-09-23", status: "Late" },
  { date: "2025-09-24", status: "Absent" },
  { date: "2025-09-25", status: "Present" },
  { date: "2025-09-26", status: "Present" },
];

const weekly = [
  { wk: "Wk1", percent: 92 },
  { wk: "Wk2", percent: 88 },
  { wk: "Wk3", percent: 95 },
  { wk: "Wk4", percent: 90 },
];

export default function ParentAttendance() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rawDaily;
    return rawDaily.filter(
      (r) => r.date.includes(q) || r.status.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FiCalendar className="text-cyan-500" />
          Attendance Overview
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search date or status…"
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow hover:shadow-lg transition"
          >
            <FiDownload /> Export
          </motion.button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700"
        >
          <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
            Weekly Attendance %
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weekly}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="wk" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="percent"
                stroke="#06b6d4"
                fill="url(#colorAttendance)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700"
        >
          <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
            Status Distribution (This Month)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Present", value: 18 },
                { name: "Late", value: 2 },
                { name: "Absent", value: 1 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700"
      >
        <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Daily Records
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <motion.tr
                  key={r.date}
                  className="border-t border-gray-200 dark:border-slate-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    {r.date}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        r.status === "Present"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
                          : r.status === "Late"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
