import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
  FiBookOpen, FiClipboard, FiCalendar, FiDollarSign, FiFileText,
  FiBell, FiLogOut, FiCheckCircle, FiArrowRight, FiTrendingUp
} from "react-icons/fi";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';

// Subpages
import StudentAttendance from "./StudentAttendance";
import StudentGrades from "./StudentGrades";
import StudentAssignments from "./StudentAssignments";
import StudentNotices from "./StudentNotices";
import StudentSettings from "./StudentSettings";
import StudentFees from "./StudentFees";
import StudentMaterials from "./StudentMaterials";

/* ------------------------------ Demo Data ------------------------------ */
const attendanceData = [
  { day: "Mon", percent: 95 },
  { day: "Tue", percent: 88 },
  { day: "Wed", percent: 92 },
  { day: "Thu", percent: 85 },
  { day: "Fri", percent: 96 },
];

const gpaTrend = [
  { term: "T1", gpa: 3.1 },
  { term: "T2", gpa: 3.3 },
  { term: "T3", gpa: 3.6 },
  { term: "T4", gpa: 3.7 },
];

const gradeData = [
  { name: "A", value: 6 },
  { name: "B", value: 4 },
  { name: "C", value: 2 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

const activityFeed = [
  { when: "Today 10:15", text: "Submitted English Essay", tone: "ok" },
  { when: "Yesterday", text: "Notice: Parent Meeting on Oct 10", tone: "info" },
  { when: "Sep 25", text: "Science Quiz scored 18/20", tone: "ok" },
  { when: "Sep 24", text: "Late in Attendance", tone: "warn" },
];

const feeSummary = { outstanding: 2500, lastPaid: "Aug 10 • Rs 2,500", nextDue: "Oct 10" };
const pendingAssignments = 2;
const upcomingExams = 2;

/* ------------------------------ Component ------------------------------ */
export default function StudentDashboard() {
  const [active, setActive] = useState("dashboard");

  // 🔥 NEW: Notice state
  const [notices, setNotices] = useState([]);

  // 🔥 NEW: Fetch student notices
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/student/notices", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setNotices(data.notices || []))
      .catch((err) => console.error("Failed to load notices:", err));
  }, []);

  const logout = () => (window.location.href = "/");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-cyan-500 to-blue-600 text-white p-6 space-y-6 shadow-lg">
        <h2 className="text-2xl font-bold tracking-tight">Student Panel</h2>
        <ul className="space-y-4">
          {[
            ["Dashboard", "dashboard"],
            ["Attendance", "attendance"],
            ["Grades", "grades"],
            ["Assignments", "assignments"],
            ["Materials", "materials"],
            ["Fees", "fees"],
            ["Notices", "notices"],
            ["Settings", "settings"],
          ].map(([label, key]) => (
            <motion.li
              key={key}
              whileHover={{ x: 4 }}
              onClick={() => setActive(key)}
              className={`cursor-pointer transition font-medium ${
                active === key ? "text-yellow-300" : "hover:text-yellow-200 text-white/90"
              }`}
            >
              {label}
            </motion.li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6 space-y-6">

        {/* Topbar */}
        <header className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-gray-800 dark:text-gray-100"
          >
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Welcome, Student
            </span>{" "}
            <motion.span whileHover={{ rotate: 15 }}>👋</motion.span>
          </motion.h1>

          <div className="flex items-center gap-4">

            {/* 🔥 Notification Bell */}
            <motion.div whileHover={{ rotate: 20 }} className="relative cursor-pointer">
              <FiBell className="text-2xl text-gray-500 hover:text-cyan-500" />
              
              {/* 🔥 Dynamic notice count */}
              {notices.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1 rounded-full">
                  {notices.length}
                </span>
              )}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 text-white shadow hover:shadow-lg"
            >
              <FiLogOut /> Logout
            </motion.button>
          </div>
        </header>

        {/* Dashboard */}
        {active === "dashboard" && (
          <div className="space-y-6 animate-fadeIn">

            {/* Row 1: Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <StatCircular
                label="Attendance"
                value={92}
                sub="This week"
                color="#06b6d4"
                icon={<FiBookOpen />}
              />
              <StatSparkline
                label="GPA"
                value="3.7"
                sub="Term trend"
                data={gpaTrend}
              />
              <StatChip
                icon={<FiClipboard />}
                label="Assignments"
                value={`${pendingAssignments} Pending`}
                gradient="from-green-500 to-emerald-600"
              />
              <StatChip
                icon={<FiCalendar />}
                label="Upcoming Exams"
                value={upcomingExams}
                gradient="from-orange-500 to-pink-500"
              />
            </div>

            {/* Row 2 Charts */}
            <div className="grid xl:grid-cols-2 gap-6">
              <motion.div whileHover={{ y: -3 }} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="percent" stroke="#06b6d4" fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <DonutChartCard
                title="Grade Distribution"
                data={gradeData}
                colors={COLORS}
              />
            </div>

            {/* Row 3 Cards */}
            <div className="grid xl:grid-cols-3 gap-6">
              <SummaryCard
                icon={<FiDollarSign />}
                title="Fees"
                rows={[
                  ["Outstanding", `Rs ${feeSummary.outstanding}`, "text-rose-600"],
                  ["Last Paid", feeSummary.lastPaid, "text-emerald-600"],
                  ["Next Due", feeSummary.nextDue, "text-sky-600"],
                ]}
                cta={{ text: "View & Pay", onClickKey: "fees" }}
                onJump={(key) => setActive(key)}
              />

              <SummaryCard
                icon={<FiFileText />}
                title="Study Materials"
                rows={[
                  ["Latest", "Physics Unit 3 Notes", "text-blue-600"],
                  ["Video", "Algebra Prep – 12 mins", "text-emerald-600"],
                  ["Slide", "History: World Wars", "text-cyan-600"],
                ]}
                cta={{ text: "Open Materials", onClickKey: "materials" }}
                onJump={(key) => setActive(key)}
              />

              <SummaryCard
                icon={<FiClipboard />}
                title="Assignments"
                rows={[
                  ["Math HW", "Due Oct 01", "text-amber-600"],
                  ["Science Project", "Due Oct 05", "text-amber-600"],
                  ["English Essay", "Due Oct 08", "text-amber-600"],
                ]}
                cta={{ text: "Go to Assignments", onClickKey: "assignments" }}
                onJump={(key) => setActive(key)}
              />
            </div>

            {/* Row 4 Timeline */}
            <div className="grid xl:grid-cols-3 gap-6">
              <ActivityTimeline items={activityFeed} />
              <QuickLink
                title="Open Materials"
                desc="Access notes, slides and videos"
                onClick={() => setActive("materials")}
              />
              <QuickLink
                title="Pay Fees"
                desc="Check dues & download receipts"
                onClick={() => setActive("fees")}
                accent="from-rose-500 to-red-500"
              />
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {active === "attendance" && <StudentAttendance />}
        {active === "grades" && <StudentGrades />}
        {active === "assignments" && <StudentAssignments />}
        {active === "materials" && <StudentMaterials />}
        {active === "fees" && <StudentFees />}
        {active === "notices" && <StudentNotices />}
        {active === "settings" && <StudentSettings />}
      </div>
    </div>
  );
}

/* --------------------------- Reusable Blocks --------------------------- */

function StatCircular({ label, value, sub, color, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md flex items-center gap-5"
    >
      <div className="w-20">
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          styles={buildStyles({
            pathColor: color,
            textColor: "currentColor",
            trailColor: "#E5E7EB",
          })}
        />
      </div>
      <div className="flex-1">
        <div className="text-gray-500 dark:text-gray-400 text-sm">{label}</div>
        <div className="text-xs text-gray-400">{sub}</div>
      </div>
      <div className="text-3xl text-cyan-500">{icon}</div>
    </motion.div>
  );
}

function StatSparkline({ label, value, sub, data }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md flex items-center gap-5"
    >
      <div className="flex-1">
        <div className="text-gray-500 dark:text-gray-400 text-sm">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-gray-400">{sub}</div>
      </div>
      <div className="w-28 h-14">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="gpa" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-2xl text-sky-500"><FiTrendingUp /></div>
    </motion.div>
  );
}

function StatChip({ icon, label, value, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 180 }}
      className={`p-6 rounded-2xl shadow-lg text-white bg-gradient-to-r ${gradient} relative overflow-hidden`}
    >
      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.2 }}
        transition={{ duration: 0.3 }}
      ></motion.div>

      <div className="relative flex flex-col">
        <div className="flex items-center gap-3 text-lg font-semibold">
          {icon}
          <span>{label}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-1 text-3xl font-bold tracking-tight"
        >
          {value}
        </motion.div>
      </div>
    </motion.div>
  );
}

function DonutChartCard({ title, data, colors }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={50}
              outerRadius={75}
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-3 text-sm text-gray-500 dark:text-gray-300">
          Total Subjects: <span className="font-semibold text-gray-800 dark:text-white">{total}</span>
        </div>

        <div className="flex gap-4 mt-3">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              ></span>
              <span>{d.name} ({d.value})</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SummaryCard({ icon, title, rows, cta, onJump }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
      <div className="flex items-center gap-3 text-cyan-500 text-2xl mb-1">{icon}</div>
      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</h4>
      <div className="space-y-2">
        {rows.map(([k, v, tone]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">{k}</span>
            <span className={`font-medium ${tone ?? ""}`}>{v}</span>
          </div>
        ))}
      </div>
      {cta && (
        <button
          onClick={() => onJump?.(cta.onClickKey)}
          className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow"
        >
          {cta.text} <FiArrowRight />
        </button>
      )}
    </motion.div>
  );
}

function ActivityTimeline({ items }) {
  const dotColor = (tone) =>
    tone === "ok" ? "bg-emerald-500" :
    tone === "warn" ? "bg-amber-500" :
    "bg-cyan-500";

  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md xl:col-span-2">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {items.map((it, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3"
          >
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotColor(it.tone)}`} />
            <div>
              <div className="text-sm font-medium">{it.text}</div>
              <div className="text-xs text-gray-400">{it.when}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function QuickLink({ title, desc, onClick, accent = "from-cyan-500 to-blue-600" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`w-full h-full p-6 rounded-2xl shadow-md text-left text-white bg-gradient-to-r ${accent}`}
    >
      <div className="text-xl font-semibold">{title}</div>
      <div className="opacity-90">{desc}</div>
      <div className="mt-3 inline-flex items-center gap-2 opacity-90">
        Open <FiArrowRight />
      </div>
    </motion.button>
  );
}
