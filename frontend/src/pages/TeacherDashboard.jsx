import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line
} from "recharts";
import {
  FiUsers, FiBookOpen, FiClipboard, FiCalendar, FiPlus, FiLogOut, FiTrendingUp, FiBell
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// 🔹 Import subpages
import TeacherAttendance from "./TeacherAttendance";
import TeacherGrades from "./TeacherGrades";
import TeacherAssignments from "./TeacherAssignments";
import TeacherPerformance from "./TeacherPerformance";
import TeacherNotices from "./TeacherNotices";
import TeacherSettings from "./TeacherSettings";
import TeacherMaterials from "./TeacherMaterials";
import TeacherExamMarks from "./TeacherExamMarks";

import TeacherFeedbackInbox from "./TeacherFeedbackInbox";


export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Demo Data
  const attendanceData = [
    { day: "Mon", attendance: 90 },
    { day: "Tue", attendance: 80 },
    { day: "Wed", attendance: 95 },
    { day: "Thu", attendance: 85 },
    { day: "Fri", attendance: 92 },
  ];

  const gpaTrend = [
    { term: "T1", avg: 3.2 },
    { term: "T2", avg: 3.4 },
    { term: "T3", avg: 3.6 },
    { term: "T4", avg: 3.8 },
  ];

  const studentPerformance = [
    { range: "A", count: 30 },
    { range: "B", count: 45 },
    { range: "C", count: 25 },
    { range: "D", count: 10 },
  ];

  const recentNotices = [
    { title: "Exam Schedule Released", date: "Oct 5" },
    { title: "Holiday on Oct 10", date: "Oct 10" },
    { title: "Science Fair Announced", date: "Oct 12" },
  ];

  const assignments = [
    { title: "Math Homework", class: "10A", due: "2025-09-30", status: "Pending" },
    { title: "Science Project", class: "9B", due: "2025-10-02", status: "Submitted" },
    { title: "English Essay", class: "10C", due: "2025-10-05", status: "Pending" },
  ];

  const handleLogout = () => navigate("/");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-cyan-500 to-blue-600 text-white p-6 space-y-6 shadow-lg">
        <h2 className="text-2xl font-bold">Teacher Panel</h2>
        <ul className="space-y-4">
          {[
            ["Dashboard", "dashboard"],
            ["Attendance", "attendance"],
            ["Grades", "grades"],
            ["Assignments", "assignments"],
            ["Performance", "performance"],
            ["Materials", "materials"],
            ["Exam Marks", "examMarks"],
            ["Notices", "notices"],
            ["Feedback", "feedback"],
            ["Settings", "settings"],
          ].map(([label, key]) => (
            <motion.li
              key={key}
              whileHover={{ x: 5 }}
              onClick={() => setActiveTab(key)}
              className={`cursor-pointer transition font-medium ${
                activeTab === key ? "text-yellow-300" : "hover:text-yellow-200 text-white/90"
              }`}
            >
              {label}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8">
        {/* ===== Topbar ===== */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 shadow rounded-lg">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            Welcome, Teacher <motion.span whileHover={{ rotate: 15 }}>👋</motion.span>
          </h1>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ rotate: 20 }} className="relative cursor-pointer">
              <FiBell className="text-2xl text-gray-500 hover:text-cyan-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1 rounded-full">
                3
              </span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 text-white shadow hover:shadow-lg"
            >
              <FiLogOut /> Logout
            </motion.button>
          </div>
        </div>

        {/* ===== Dashboard Overview ===== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard icon={<FiUsers />} color="text-cyan-500" label="My Students" value="120" />
              <StatCard icon={<FiBookOpen />} color="text-blue-500" label="My Classes" value="5" />
              <StatCard icon={<FiClipboard />} color="text-green-500" label="Assignments" value="15" />
              <StatCard icon={<FiCalendar />} color="text-orange-500" label="Upcoming Exams" value="3" />
            </div>

            {/* Charts Row */}
            <div className="grid xl:grid-cols-2 gap-6">
              <ChartCard title="Attendance Overview">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="attendance" stroke="#06b6d4" fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Class Average Trend (GPA)">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={gpaTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="term" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Performance & Notices */}
            <div className="grid xl:grid-cols-2 gap-6">
              <ChartCard title="Student Performance (Grade Wise)">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={studentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <motion.div whileHover={{ y: -3 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Notices</h3>
                <ul className="space-y-3">
                  {recentNotices.map((n, i) => (
                    <li key={i} className="flex justify-between border-b pb-2 text-sm">
                      <span>{n.title}</span>
                      <span className="text-gray-500">{n.date}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Assignments Table */}
            <motion.div whileHover={{ y: -3 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4">Recent Assignments</h3>
              <table className="w-full text-left border">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700">
                    <th className="p-2">Title</th>
                    <th className="p-2">Class</th>
                    <th className="p-2">Due Date</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{a.title}</td>
                      <td className="p-2">{a.class}</td>
                      <td className="p-2">{a.due}</td>
                      <td className="p-2">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <QuickButton label="Add Attendance" gradient="from-cyan-500 to-blue-600" />
              <QuickButton label="Add Grades" gradient="from-green-500 to-emerald-600" />
              <QuickButton label="Post Assignment" gradient="from-orange-500 to-pink-500" />
            </div>
          </div>
        )}

        {/* ===== Other Tabs ===== */}
        {activeTab === "attendance" && <TeacherAttendance />}
        {activeTab === "grades" && <TeacherGrades />}
        {activeTab === "assignments" && <TeacherAssignments />}
        {activeTab === "performance" && <TeacherPerformance />}
        {activeTab === "materials" && <TeacherMaterials />}
        {activeTab === "examMarks" && <TeacherExamMarks />}
        {activeTab === "notices" && <TeacherNotices />}
        {activeTab === "feedback" && <TeacherFeedbackInbox />}
        {activeTab === "settings" && <TeacherSettings />}
      </div>
    </div>
  );
}

/* ---------------- Reusable Subcomponents ---------------- */
function StatCard({ icon, color, label, value }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
      <div className={`${color} text-3xl mb-2`}>{icon}</div>
      <h3 className="font-semibold text-gray-700 dark:text-gray-200">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

function QuickButton({ label, gradient }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r ${gradient} shadow hover:shadow-lg`}
    >
      <FiPlus /> {label}
    </motion.button>
  );
}
