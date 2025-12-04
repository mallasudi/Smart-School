import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, CheckCircle2, XCircle, PlusCircle, Edit, Trash2 } from "lucide-react"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts"

export default function Fees() {
  const [openModal, setOpenModal] = useState(false)
  const [editFee, setEditFee] = useState(null)

  // Dummy data
  const [students, setStudents] = useState([
    { id: 1, name: "Sita Sharma", class: "Grade 1", total: 50000, paid: 50000, status: "Paid" },
    { id: 2, name: "Ram Thapa", class: "Grade 2", total: 50000, paid: 30000, status: "Partial" },
    { id: 3, name: "Gita Koirala", class: "Grade 3", total: 50000, paid: 0, status: "Unpaid" },
  ])

  const stats = [
    { label: "Total Fees", value: "₨ " + students.reduce((a, s) => a + s.total, 0), color: "text-blue-600", icon: Wallet },
    { label: "Paid", value: "₨ " + students.reduce((a, s) => a + s.paid, 0), color: "text-green-600", icon: CheckCircle2 },
    { label: "Unpaid", value: "₨ " + students.reduce((a, s) => a + (s.total - s.paid), 0), color: "text-red-600", icon: XCircle },
  ]

  const feeStatus = [
    { name: "Paid", value: students.reduce((a, s) => a + s.paid, 0) },
    { name: "Unpaid", value: students.reduce((a, s) => a + (s.total - s.paid), 0) },
  ]
  const COLORS = ["#22c55e", "#ef4444"]

  const handleSave = (e) => {
    e.preventDefault()
    const form = e.target
    const newFee = {
      id: editFee ? editFee.id : Date.now(),
      name: form.name.value,
      class: form.class.value,
      total: parseInt(form.total.value),
      paid: parseInt(form.paid.value),
    }
    newFee.status =
      newFee.paid === 0
        ? "Unpaid"
        : newFee.paid < newFee.total
        ? "Partial"
        : "Paid"

    if (editFee) {
      setStudents(students.map(s => (s.id === editFee.id ? newFee : s)))
    } else {
      setStudents([...students, newFee])
    }

    setOpenModal(false)
    setEditFee(null)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setStudents(students.filter(s => s.id !== id))
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-blue-500" />
          Fees Management
        </h1>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-orange-400 hover:to-blue-500 transition-transform transform hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" /> Add Payment
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, color, icon: Icon }, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="p-5 bg-white rounded-xl shadow flex items-center justify-between"
          >
            <div>
              <p className="text-gray-500 text-sm">{label}</p>
              <h3 className={`text-2xl font-semibold ${color}`}>{value}</h3>
            </div>
            <Icon className={`w-10 h-10 ${color}`} />
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Fee Collection Status</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={feeStatus}
              cx="50%" cy="50%"
              outerRadius={80}
              label
              dataKey="value"
            >
              {feeStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Fees Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow overflow-hidden"
      >
        <h2 className="text-lg font-semibold p-4">Student Fees</h2>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Total Fee</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.id} className={`border-t ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                <td className="px-4 py-3">{s.class}</td>
                <td className="px-4 py-3">₨ {s.total}</td>
                <td className="px-4 py-3">₨ {s.paid}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    s.status === "Paid"
                      ? "bg-green-100 text-green-600"
                      : s.status === "Partial"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => { setEditFee(s); setOpenModal(true) }}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal Form */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setOpenModal(false); setEditFee(null) }}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative z-10 w-full max-w-md rounded-2xl shadow-xl p-[2px] bg-gradient-to-r from-orange-400 via-blue-400 to-cyan-500"
            >
              <div className="bg-white rounded-2xl p-6 relative">
                <button
                  onClick={() => { setOpenModal(false); setEditFee(null) }}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
                <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-orange-500 to-blue-600 text-transparent bg-clip-text">
                  {editFee ? "Edit Payment" : "Add Payment"}
                </h2>

                <form className="space-y-4" onSubmit={handleSave}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editFee?.name || ""}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <input
                      type="text"
                      name="class"
                      defaultValue={editFee?.class || ""}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Fee</label>
                    <input
                      type="number"
                      name="total"
                      defaultValue={editFee?.total || ""}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paid</label>
                    <input
                      type="number"
                      name="paid"
                      defaultValue={editFee?.paid || ""}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-orange-400 hover:to-blue-500 transition-transform transform hover:scale-[1.02]"
                  >
                    Save
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
