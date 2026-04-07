import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Filter, Download } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function Reports() {
  const [filter, setFilter] = useState({
    type: "Attendance",
    class: "All",
    from: "",
    to: ""
  })

  // Dummy report data
  const data = [
    { id: 1, name: "Sita Sharma", class: "10", attendance: "95%", score: "89", fees: "Paid" },
    { id: 2, name: "Ram Thapa", class: "9", attendance: "92%", score: "76", fees: "Pending" },
    { id: 3, name: "Gita Koirala", class: "10", attendance: "88%", score: "66", fees: "Paid" },
  ]

  // Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Report")
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "report.xlsx")
  }

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("Smart School Report", 14, 15)
    doc.autoTable({
      startY: 25,
      head: [["Name", "Class", "Attendance", "Score", "Fees"]],
      body: data.map(r => [r.name, r.class, r.attendance, r.score, r.fees])
    })
    doc.save("report.pdf")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
        <FileText className="text-blue-500" /> Reports & Analytics
      </h1>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-center"
      >
        <Filter className="text-gray-500" />
        <select
          value={filter.type}
          onChange={e => setFilter({ ...filter, type: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option>Attendance</option>
          <option>Exams</option>
          <option>Fees</option>
          <option>Notices</option>
        </select>
        <select
          value={filter.class}
          onChange={e => setFilter({ ...filter, class: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option>All</option>
          <option>9</option>
          <option>10</option>
        </select>
        <input
          type="date"
          value={filter.from}
          onChange={e => setFilter({ ...filter, from: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={filter.to}
          onChange={e => setFilter({ ...filter, to: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg">
          Apply
        </button>
      </motion.div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button onClick={exportExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 flex items-center gap-2">
          <Download size={16}/> Export Excel
        </button>
        <button onClick={exportPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 flex items-center gap-2">
          <Download size={16}/> Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Attendance</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Fees</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.class}</td>
                <td className="px-4 py-3">{r.attendance}</td>
                <td className="px-4 py-3">{r.score}</td>
                <td className="px-4 py-3">{r.fees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
