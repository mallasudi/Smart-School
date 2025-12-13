import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { FiCalendar, FiSearch, FiDownload } from "react-icons/fi";

export default function ParentAttendance() {
  const token = localStorage.getItem("token");

  const [child, setChild] = useState(null); // linked student
  const [records, setRecords] = useState([]); // daily attendance
  const [query, setQuery] = useState("");

  /* ============================================================
      LOAD ATTENDANCE FOR LINKED CHILD
  ============================================================ */
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get("/api/parent/attendance/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // We use the FIRST linked child (your system has 1 child per parent)
        const s = res.data[0];

        if (s) {
          setChild(s);
          setRecords(
            s.records.map((r) => ({
              date: r.date.split("T")[0],
              status: r.status,
            }))
          );
        }
      } catch (err) {
        console.error("FAILED TO LOAD PARENT ATTENDANCE:", err);
      }
    };

    loadData();
  }, [token]);

  /* ============================================================
      FILTER SEARCH (Date or Status)
  ============================================================ */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.date.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [query, records]);

  /* ============================================================
      STATUS DISTRIBUTION
  ============================================================ */
  const statusCount = useMemo(() => {
    return {
      Present: records.filter((r) => r.status === "Present").length,
      Late: records.filter((r) => r.status === "Late").length,
      Absent: records.filter((r) => r.status === "Absent").length,
    };
  }, [records]);

  /* ============================================================
      WEEKLY TREND - Simple example
  ============================================================ */
  const weeklyTrend = [
    { wk: "Wk1", percent: 1 },
    { wk: "Wk2", percent: 1 },
    { wk: "Wk3", percent: 1 },
    { wk: "Wk4", percent: 1 },
  ];

  if (!child) {
    return (
      <div className="text-center text-gray-500 p-8">
        Loading attendance…
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
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
              className="pl-9 pr-3 py-2 rounded-lg border bg-white shadow-sm"
            />
          </div>
          <button className="px-4 py-2 rounded bg-blue-600 text-white flex items-center gap-2">
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* CHILD SUMMARY */}
      <div className="bg-white shadow p-4 rounded-xl">
        <h3 className="font-semibold text-lg">
          {child.first_name} {child.last_name}
        </h3>
        <p className="text-gray-500 text-sm">
          Total: {child.total} | Present: {child.present} | Late:{" "}
          {child.late} | Absent: {child.absent}
        </p>
      </div>

      {/* CHARTS */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* WEEKLY TREND */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Weekly Attendance %</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="wk" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="percent"
                stroke="#06b6d4"
                fill="url(#colorAttendance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* STATUS DISTRIBUTION */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Present", value: statusCount.Present },
                { name: "Late", value: statusCount.Late },
                { name: "Absent", value: statusCount.Absent },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DAILY RECORDS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Daily Records</h3>

        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center text-gray-500 p-4">
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{r.date}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        r.status === "Present"
                          ? "bg-green-100 text-green-700"
                          : r.status === "Late"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
