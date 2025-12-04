import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Users from "./Users"
import Attendance from "./Attendance"
import ExamsResults from "./ExamsResults"
import Fees from "./Fees"
import Notices from "./Notices"
import Reports from "./Reports"
import EventCalendar from "./EventCalendar"
import Settings from "./Settings"
import AdminClassResults from "./AdminClassResults";


import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from "recharts"
import Calendar from "react-calendar"
import 'react-calendar/dist/Calendar.css'
import {
  FiUsers, FiUserCheck, FiLayers, FiDollarSign,
  FiBell, FiPlus, FiTrendingUp, FiLogOut, FiFileText, FiCalendar
} from "react-icons/fi"
import AdminFeedback from "./AdminFeedback";


// ---------- tiny helpers ----------
const fadeUp = (d=0) => ({
  initial: { y: 24, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: .55, delay: d, ease: "easeOut" }
})

const Card = ({ className = "", children }) => (
  <motion.div
    {...fadeUp()}
    className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100
      hover:shadow-xl transition-all duration-300
      hover:-translate-y-[2px] hover:ring-2 hover:ring-cyan-400/50 ${className}`}
  >
    {children}
  </motion.div>
)

const StatCard = ({ icon: Icon, label, value, accent="from-cyan-500 to-blue-600" }) => (
  <Card>
    <div className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${accent} text-white
        flex items-center justify-center shadow-md`}>
        <Icon size={22}/>
      </div>
      <div>
        <p className="text-slate-500 text-sm">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  </Card>
)


// ---------- dummy data ----------
const feesTrend = [
  { month: "Jan", collected: 10.5 }, { month: "Feb", collected: 12.1 },
  { month: "Mar", collected: 11.2 }, { month: "Apr", collected: 13.6 },
  { month: "May", collected: 14.3 }, { month: "Jun", collected: 15.1 },
  { month: "Jul", collected: 13.8 }, { month: "Aug", collected: 16.2 },
  { month: "Sep", collected: 17.0 }, { month: "Oct", collected: 18.1 },
  { month: "Nov", collected: 17.4 }, { month: "Dec", collected: 19.2 },
]

const attendanceByClass = [
  { cls: "1", att: 94 }, { cls: "2", att: 93 }, { cls: "3", att: 95 },
  { cls: "4", att: 91 }, { cls: "5", att: 96 }, { cls: "6", att: 92 },
  { cls: "7", att: 94 }, { cls: "8", att: 90 }, { cls: "9", att: 89 }, { cls: "10", att: 92 }
]

const examSplit = [
  { name: "Pass", value: 86 },
  { name: "Fail", value: 14 },
]

const upcomingEvents = [
  { date: "Sep 25", title: "Parent–Teacher Meeting" },
  { date: "Oct 10", title: "Sports Day" },
  { date: "Nov 05", title: "Science Exhibition" },
]

const activityFeed = [
  { icon: <FiFileText/>, text: "Grade 9 Midterm results published", time: "2h ago" },
  { icon: <FiCalendar/>, text: "Event created: Parent–Teacher Meeting", time: "Yesterday" },
  { icon: <FiUsers/>, text: "12 new students registered", time: "2 days ago" },
]


// ---------- main component ----------
export default function AdminDashboard() {
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()
  const [active, setActive] = useState("dashboard")
  const [date, setDate] = useState(new Date())
  const COLORS = useMemo(() => ["#10b981", "#ef4444"], [])

  const logout = () => navigate("/")

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="h-14 sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
          <div className="font-semibold text-slate-800">Admin Panel</div>
          <div className="flex items-center gap-3">
            <button className="px-3 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm flex items-center gap-2 shadow-sm hover:opacity-95">
              <FiBell/> Notifications
            </button>

            {/* profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white flex items-center gap-2"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600"/>
                <span className="text-sm text-slate-700">Admin</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-slate-100 shadow-lg p-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50"
                  >
                    <FiLogOut/> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* main */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="rounded-2xl bg-gradient-to-b from-cyan-600 to-blue-700 p-2 text-white shadow-sm">
            {[
              ["dashboard","Dashboard"],
              ["users","Users"],
              ["attendance","Attendance"],
              ["exams","Exams"],
              ["class-results","Class Results"], 
              ["fees","Fees"],
              ["notices","Notices"],
              ["feedback", "Feedback Center"],
              //["reports","Reports"],
              //["calendar","Event Calendar"],
              ["settings","Settings"],
            ].map(([key,label])=>(
              <button
                key={key}
                onClick={()=>setActive(key)}
                className={`w-full text-left px-4 py-3 rounded-xl transition
                  ${active===key ? "bg-white/15" : "hover:bg-white/10"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <section className="col-span-12 md:col-span-9 lg:col-span-10">
          {active === "dashboard" && (
            <DashboardScreen date={date} setDate={setDate} COLORS={COLORS} setActive={setActive}/>
          )}
          {active === "users" && <Users/>}
          {active === "attendance" && <Attendance/>}
          {active === "exams" && <ExamsResults/>}
          {active === "class-results" && <AdminClassResults />}
          {active === "fees" && <Fees/>}
          {active === "notices" && <Notices/>}
          {active === "feedback" && <AdminFeedback />}
          {active === "settings" && (
  <Settings />
)}





          {active !== "dashboard" && active !== "users" && active !== "attendance" && (
            <Card className="min-h-[50vh] flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold">“{active}” page</p>
                <p className="text-slate-500 mt-1">Static placeholder — build next modules here.</p>
              </div>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}


// ---------- Dashboard Screen ----------
function DashboardScreen({ date, setDate, COLORS, setActive }) {
  return (
    <div className="space-y-6">
      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Students" value="2,450+" />
        <StatCard icon={FiUserCheck} label="Teachers" value="120" accent="from-blue-500 to-indigo-600" />
        <StatCard icon={FiLayers} label="Classes" value="32" accent="from-emerald-500 to-teal-600" />
        <StatCard icon={FiDollarSign} label="Fees Collected" value="NPR 1.8Cr" accent="from-amber-500 to-orange-600" />
      </div>

      {/* Quick Actions */}
      <motion.div {...fadeUp(.05)} className="flex flex-wrap gap-3">
        <button onClick={() => setActive("users")} className="px-4 py-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-lg hover:-translate-y-[1px] transition flex items-center gap-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50">
          <FiPlus/> <span className="text-sm font-medium">Add Student</span>
        </button>
        <button onClick={() => setActive("exams")} className="px-4 py-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-lg hover:-translate-y-[1px] transition flex items-center gap-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50">
          <FiFileText/> <span className="text-sm font-medium">Create Exam</span>
        </button>
        <button onClick={() => setActive("notices")} className="px-4 py-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-lg hover:-translate-y-[1px] transition flex items-center gap-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50">
          <FiBell/> <span className="text-sm font-medium">Post Notice</span>
        </button>
        <button onClick={() => setActive("calendar")} className="px-4 py-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-lg hover:-translate-y-[1px] transition flex items-center gap-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50">
          <FiCalendar/> <span className="text-sm font-medium">New Event</span>
        </button>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-800">Fees Trend</p>
            <span className="text-xs text-slate-500 flex items-center gap-1"><FiTrendingUp/> last 12 months</span>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feesTrend}>
                <defs>
                  <linearGradient id="col" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7"/>
                <XAxis dataKey="month" stroke="#94a3b8"/>
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="collected" stroke="#0ea5e9" fill="url(#col)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="font-semibold text-slate-800">Exam Performance</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={examSplit} innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {examSplit.map((e, i)=> <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend/>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Attendance + Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <p className="font-semibold text-slate-800">Attendance by Class (%)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByClass}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7"/>
                <XAxis dataKey="cls" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="att" fill="#06b6d4" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="font-semibold text-slate-800 mb-2">Event Calendar</p>
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <Calendar value={date} onChange={setDate}/>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Upcoming</p>
            <ul className="space-y-2">
              {upcomingEvents.map((e, i)=>(
                <li key={i} className="flex items-center justify-between rounded-lg p-2 ring-1 ring-slate-200">
                  <span className="text-sm">{e.title}</span>
                  <span className="text-xs text-slate-500">{e.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Recent Activity + Top Performers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <p className="font-semibold text-slate-800 mb-3">Recent Activity</p>
          <ul className="space-y-2">
            {activityFeed.map((a, i)=>(
              <li key={i} className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-slate-200 hover:bg-slate-50 transition">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center">
                  {a.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800">{a.text}</p>
                  <p className="text-xs text-slate-500">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="font-semibold text-slate-800 mb-3">Top Performers</p>
          <ul className="space-y-2">
            {[
              ["Aarav KC", "98%"], ["Sujal Thapa", "96%"], ["Riya Shrestha", "95%"], ["Prakash Rai", "94%"], ["Anisha Gurung", "93%"],
            ].map(([name, score], i)=>(
              <li key={i} className="flex items-center justify-between p-2 rounded-lg ring-1 ring-slate-200">
                <span className="text-sm">{name}</span>
                <span className="text-xs text-slate-600">{score}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
//admin@smartschool.com--admin123//