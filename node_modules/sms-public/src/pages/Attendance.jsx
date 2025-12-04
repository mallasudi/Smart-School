import { useState } from "react"
import { motion } from "framer-motion"
import { FileDown } from "lucide-react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export default function Attendance() {
  // Dummy chart data
  const monthlyData = [
    { month: "Jan", Present: 95, Absent: 5 },
    { month: "Feb", Present: 97, Absent: 3 },
    { month: "Mar", Present: 90, Absent: 10 },
    { month: "Apr", Present: 92, Absent: 8 },
    { month: "May", Present: 88, Absent: 12 },
    { month: "Jun", Present: 93, Absent: 7 },
  ]

  const classData = [
    { class: "10", Attendance: 95 },
    { class: "11", Attendance: 92 },
    { class: "12", Attendance: 90 },
  ]

  const [records] = useState([
    { id: 1, name: "Sita Sharma", class: "10", date: "2025-01-10", status: "Present" },
    { id: 2, name: "Ram Thapa", class: "10", date: "2025-01-10", status: "Absent" },
    { id: 3, name: "Gita Koirala", class: "12", date: "2025-01-10", status: "Present" },
  ])

  // ✅ Export attendance table
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(records)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Attendance")
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "attendance_report.xlsx")
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header + Export */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📅 Attendance Reports
        </h1>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-orange-400 hover:to-blue-500 transition-transform transform hover:scale-[1.02]"
        >
          <FileDown className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow p-4"
        >
          <h2 className="text-lg font-semibold mb-4">Monthly Attendance (%)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" fill="#22c55e" />
              <Bar dataKey="Absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Attendance by Class */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow p-4"
        >
          <h2 className="text-lg font-semibold mb-4">Attendance by Class</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Attendance" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white rounded-xl shadow overflow-hidden"
      >
        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec.id} className={`border-t ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <td className="px-4 py-3 font-medium text-gray-800">{rec.name}</td>
                <td className="px-4 py-3">{rec.class}</td>
                <td className="px-4 py-3">{rec.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      rec.status === "Present"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {rec.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
