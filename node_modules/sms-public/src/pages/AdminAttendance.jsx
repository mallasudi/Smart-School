import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { motion } from "framer-motion";

export default function AdminAttendance() {
  const token = localStorage.getItem("token");

  const [monthly, setMonthly] = useState([]);
  const [classReport, setClassReport] = useState([]);
  const [latest, setLatest] = useState([]);

  /* 
        LOAD DATA
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, c, l] = await Promise.all([
          axios.get("/api/admin/attendance/monthly", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/attendance/classes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/attendance/latest", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMonthly(m.data);
        setClassReport(c.data);
        setLatest(l.data);
      } catch (err) {
        console.error("ADMIN LOAD FAILED:", err);
      }
    };

    loadData();
  }, [token]);

  return (
    <div className="space-y-10">

      {/* PAGE TITLE */}
      <h2 className="text-2xl font-bold text-gray-800">📊 Attendance Reports</h2>

      {/* ================= MONTHLY CHART ================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow"
      >
        <h3 className="font-semibold mb-3">Monthly Attendance (%)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="present" fill="#10b981" name="Present" />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            <Bar dataKey="late" fill="#f59e0b" name="Late" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ================= CLASS REPORT ================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow"
      >
        <h3 className="font-semibold mb-3">Attendance by Class</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={classReport}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class_name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ================= LATEST TABLE ================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow"
      >
        <h3 className="font-semibold mb-3">Recent Attendance Records</h3>
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {latest.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.class}</td>
                <td className="p-3">{r.date}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      r.status === "Present"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "Late"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
