import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle2, XCircle, PlusCircle, Edit, Trash2 } from "lucide-react";

export default function Fees() {
  const token = localStorage.getItem("token");

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editFee, setEditFee] = useState(null);

  /* --------------------------------------------
      LOAD FEES FROM BACKEND
  -------------------------------------------- */
  const loadFees = async () => {
    try {
      const res = await axios.get("/api/admin/fees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFees(res.data);
    } catch (err) {
      console.error("LOAD FEES ERROR:", err);
    }
  };

  /* --------------------------------------------
      LOAD STUDENTS (for dropdown)
  -------------------------------------------- */
  const loadStudents = async () => {
    try {
      const res = await axios.get("/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.error("LOAD STUDENTS ERROR:", err);
    }
  };

  useEffect(() => {
    loadFees();
    loadStudents();
  }, []);

  /* --------------------------------------------
      SAVE / UPDATE FEE
  -------------------------------------------- */
  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;

    const payload = {
      student_id: Number(form.student_id.value),
      amount: Number(form.amount.value),
      due_date: form.due_date.value,
    };

    try {
      if (editFee) {
        // update not implemented yet (optional)
      } else {
        await axios.post("/api/admin/fees", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setOpenModal(false);
      setEditFee(null);
      loadFees();
    } catch (err) {
      console.error("SAVE FEE ERROR:", err);
      alert("Failed to save fee");
    }
  };

  /* --------------------------------------------
      DELETE FEE
  -------------------------------------------- */
  const handleDelete = async (fee_id) => {
    alert("Delete API optional — skipping for now.");
  };

  /* --------------------------------------------
      SUMMARY CARDS
  -------------------------------------------- */
  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalUnpaid = totalAmount - totalPaid;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6 text-blue-500" />
          Fees Management
        </h1>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <PlusCircle className="w-5 h-5" /> Assign Fee
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div className="p-5 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Fees</p>
          <h3 className="text-2xl font-semibold text-blue-600">Rs. {totalAmount}</h3>
        </motion.div>

        <motion.div className="p-5 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">Paid</p>
          <h3 className="text-2xl font-semibold text-green-600">Rs. {totalPaid}</h3>
        </motion.div>

        <motion.div className="p-5 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">Unpaid</p>
          <h3 className="text-2xl font-semibold text-red-600">Rs. {totalUnpaid}</h3>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div className="bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold p-4">Student Fee Records</h2>
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.fee_id} className="border-t">
                <td className="p-3">{f.student.first_name} {f.student.last_name}</td>
                <td className="p-3">Rs. {f.amount}</td>
                <td className="p-3">{new Date(f.due_date).toISOString().split("T")[0]}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      f.status === "Paid"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {openModal && (
          <motion.div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <motion.div className="bg-white p-6 rounded-xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Assign Fee</h2>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Student Select */}
                <select name="student_id" className="w-full border px-3 py-2 rounded" required>
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>

                {/* Amount */}
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  className="w-full border px-3 py-2 rounded"
                  required
                />

                {/* Due Date */}
                <input
                  type="date"
                  name="due_date"
                  className="w-full border px-3 py-2 rounded"
                  required
                />

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
