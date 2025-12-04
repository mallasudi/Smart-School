// src/pages/ParentDashboard.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  FiUsers, FiBarChart2, FiCalendar, FiBell, FiChevronDown, FiLogOut, FiDollarSign, FiBookOpen
} from "react-icons/fi";
import ParentChildren from "./ParentChildren";
import ParentAttendance from "./ParentAttendance";
import ParentResults from "./ParentResults";
import ParentFees from "./ParentFees";
import ParentNotices from "./ParentNotices";
import ParentFeedback from "./ParentFeedback";
import ParentSettings from "./ParentSettings";


import ParentSurveyFeedback from "./ParentSurveyFeedback";

const attendanceData = [
  { week: "Week 1", percent: 94 },
  { week: "Week 2", percent: 88 },
  { week: "Week 3", percent: 92 },
  { week: "Week 4", percent: 96 },
];

const COLORS = ["#06b6d4", "#3b82f6", "#10b981"];

const feeData = [
  { name: "Paid", value: 80 },
  { name: "Due", value: 20 },
];

const notices = [
  { title: "Parent-Teacher Meeting", date: "2025-10-20" },
  { title: "Exam Schedule Released", date: "2025-10-15" },
  { title: "Annual Function", date: "2025-10-25" },
];

export default function ParentDashboard() {
  const [active, setActive] = useState("dashboard");
  const [openProfile, setOpenProfile] = useState(false);

  const logout = () => {
    window.location.href = "/";
  };

  const renderPage = () => {
    switch (active) {
      case "children": return <ParentChildren />;
      case "attendance": return <ParentAttendance />;
      case "results": return <ParentResults />;
      case "fees": return <ParentFees />;
      case "notices": return <ParentNotices />;
      case "feedback": return <ParentFeedback />;
      case "survey": return <ParentSurveyFeedback />;
      case "settings": return <ParentSettings />;
      default: return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <FiUsers />, label: "Children", value: 2, color: "cyan" },
              { icon: <FiBookOpen />, label: "Attendance Avg", value: "92%", color: "blue" },
              { icon: <FiDollarSign />, label: "Pending Fees", value: "Rs. 5000", color: "rose" },
              { icon: <FiBarChart2 />, label: "Overall GPA", value: "3.8", color: "emerald" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 p-6 rounded-2xl shadow-lg border border-${item.color}-200`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-${item.color}-600 text-3xl`}>{item.icon}</div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold"
                  >
                    {item.value}
                  </motion.div>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-600">{item.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Attendance */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <h3 className="font-semibold mb-3">Attendance Overview</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="percent"
                    stroke="#3b82f6"
                    fill="url(#colorBlue)"
                  />
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Fees */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <h3 className="font-semibold mb-3">Fee Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={feeData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {feeData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Notices */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h3 className="font-semibold mb-4">Recent Notices</h3>
            <ul className="divide-y">
              {notices.map((n, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="py-3 flex justify-between items-center"
                >
                  <span>{n.title}</span>
                  <span className="text-sm text-gray-500">{n.date}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-64 bg-gradient-to-b from-cyan-600 to-blue-700 text-white p-6 space-y-6"
      >
        <h2 className="text-2xl font-bold mb-4">Parent Panel</h2>
        <nav className="space-y-3">
          {[
            ["dashboard", "Dashboard"],
            ["children", "Children"],
            ["attendance", "Attendance"],
            ["results", "Results"],
            ["fees", "Fees"],
            ["notices", "Notices"],
            ["feedback", "Feedback"],
            ["survey", "Survey Feedback"],
            ["settings", "Settings"],
          ].map(([key, label]) => (
            <div
              key={key}
              onClick={() => setActive(key)}
              className={`px-4 py-2 rounded-lg cursor-pointer transition ${
                active === key ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              {label}
            </div>
          ))}
        </nav>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white p-4 rounded-2xl shadow">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Welcome, Parent 👋</h1>
            <p className="text-sm text-gray-500">Here’s what’s happening this week.</p>
          </div>

          <div className="flex items-center gap-6 relative">
            {/* Notifications */}
            <motion.div
              whileHover={{ rotate: 15 }}
              className="relative cursor-pointer"
            >
              <FiBell className="text-2xl text-gray-600" />
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">3</span>
            </motion.div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenProfile(!openProfile)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Parent <FiChevronDown />
              </button>

              <AnimatePresence>
                {openProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-44 overflow-hidden border"
                  >
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Render selected page */}
        <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
      </div>
    </div>
  );
}
