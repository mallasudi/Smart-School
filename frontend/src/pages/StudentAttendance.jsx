import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

const raw = [
  { date: "2025-09-22", status: "Present" },
  { date: "2025-09-23", status: "Late" },
  { date: "2025-09-24", status: "Absent" },
  { date: "2025-09-25", status: "Present" },
  { date: "2025-09-26", status: "Present" },
];

export default function StudentAttendance() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const monthData = useMemo(() => {
    // filter by month
    const m = month.getMonth(), y = month.getFullYear();
    const list = raw.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    const present = list.filter(l => l.status === "Present").length;
    const late = list.filter(l => l.status === "Late").length;
    const absent = list.filter(l => l.status === "Absent").length;
    // dummy week trend
    const trend = [
      { day: "Mon", p: 95 }, { day: "Tue", p: 88 }, { day: "Wed", p: 92 }, { day: "Thu", p: 85 }, { day: "Fri", p: 96 },
    ];
    return { list, present, late, absent, trend };
  }, [month]);

  // calendar tile content / color
  const getClass = (date) => {
    const iso = date.toISOString().slice(0,10);
    const match = raw.find(r => r.date === iso);
    if (!match) return "";
    if (match.status === "Present") return "bg-emerald-100 text-emerald-700 rounded-md";
    if (match.status === "Late")    return "bg-yellow-100 text-yellow-700 rounded-md";
    if (match.status === "Absent")  return "bg-rose-100 text-rose-700 rounded-md";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat icon={<FiCheckCircle />} label="Present" value={monthData.present} accent="from-emerald-500 to-teal-500" />
        <Stat icon={<FiClock />} label="Late" value={monthData.late} accent="from-amber-500 to-yellow-500" />
        <Stat icon={<FiXCircle />} label="Absent" value={monthData.absent} accent="from-rose-500 to-pink-500" />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {/* Calendar card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiCalendar className="text-cyan-500" />
            <h3 className="font-semibold">Monthly Attendance</h3>
          </div>
          <Calendar
            value={selected}
            onChange={setSelected}
            onActiveStartDateChange={({ activeStartDate }) => setMonth(activeStartDate)}
            tileClassName={({ date, view }) => (view === "month" ? getClass(date) : null)}
            className="!border-0 !bg-transparent [&_.react-calendar__tile]:!h-12 [&_.react-calendar__tile--now]:!bg-cyan-50 dark:[&_.react-calendar__tile--now]:!bg-slate-700 rounded-xl"
          />

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="mr-3"><span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-1" /> Present</span>
            <span className="mr-3"><span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-1" /> Late</span>
            <span><span className="inline-block w-3 h-3 bg-rose-500 rounded-full mr-1" /> Absent</span>
          </div>
        </motion.div>

        {/* Weekly trend */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .05 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow p-5"
        >
          <h3 className="font-semibold mb-3">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthData.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="p" stroke="#06b6d4" fill="#3b82f6" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent days table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .1 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow p-5"
      >
        <h3 className="font-semibold mb-3">Recent Records</h3>
        <table className="w-full text-left">
          <thead className="text-sm text-gray-500">
            <tr><th className="py-2">Date</th><th className="py-2">Status</th></tr>
          </thead>
          <tbody>
            {monthData.list.map((r,i)=>(
              <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-2">{r.date}</td>
                <td className="py-2">
                  <Badge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

function Stat({ icon, label, value, accent }) {
  return (
    <motion.div whileHover={{ y:-2 }} className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${accent} text-white mr-3`}>
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

function Badge({ status }) {
  const map = {
    Present: "bg-emerald-100 text-emerald-700",
    Late: "bg-amber-100 text-amber-700",
    Absent: "bg-rose-100 text-rose-700",
  };
  return <span className={`px-2 py-1 rounded-md text-sm ${map[status]}`}>{status}</span>;
}
