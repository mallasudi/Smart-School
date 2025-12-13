// src/pages/ParentFees.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiCreditCard, FiDownload, FiInfo } from "react-icons/fi";

export default function ParentFees() {
  const [fees, setFees] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch fees for linked student
  const loadFees = async () => {
    try {
      const res = await axios.get("/api/parent/fees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFees(res.data);
    } catch (err) {
      console.error("LOAD FEES ERROR:", err);
    }
  };

  // Mock payment (no real gateway)
  const payNow = async (fee_id) => {
    try {
      await axios.post(
        `/api/parent/fees/pay/${fee_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Mock payment successful!");
      loadFees();
    } catch (err) {
      console.error("PAY ERROR:", err);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  // Summary Calculations
  const totalDue = fees
    .filter((f) => f.status === "Unpaid")
    .reduce((sum, f) => sum + f.amount, 0);

  const lastPaid = fees
    .filter((f) => f.status === "Paid")
    .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))[0];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* PAGE TITLE */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        💳 Student Fee Overview
      </h2>

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* TOTAL DUE */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border shadow"
        >
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Outstanding Balance
          </p>
          <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">
            Rs. {totalDue}
          </h3>
          <p className="text-xs flex items-center gap-2 text-gray-500 mt-2">
            <FiInfo /> Tuition + Transportation + Library
          </p>
        </motion.div>

        {/* LAST PAYMENT */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border shadow"
        >
          <p className="text-gray-600 text-sm dark:text-gray-400">
            Last Payment
          </p>
          <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
            Rs. {lastPaid?.amount || 0}
          </h3>
          <p className="text-xs text-gray-500 mt-2">
            {lastPaid?.paid_at
              ? new Date(lastPaid.paid_at).toLocaleDateString()
              : "No payment yet"}
          </p>
        </motion.div>

        {/* TOTAL FEES */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border shadow"
        >
          <p className="text-gray-600 text-sm dark:text-gray-300">
            Total Assigned Fees
          </p>
          <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            Rs. {fees.reduce((sum, f) => sum + f.amount, 0)}
          </h3>
        </motion.div>
      </div>

      {/* TABLE */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Monthly Fee Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-slate-700/70">
              <tr>
                <th className="p-3">Due Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr
                  key={f.fee_id}
                  className="border-t border-gray-200 dark:border-slate-700"
                >
                  <td className="p-3">
                    {new Date(f.due_date).toLocaleDateString()}
                  </td>

                  <td className="p-3 font-semibold">Rs. {f.amount}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        f.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>

                  <td className="p-3 flex gap-3">
                    {f.status === "Unpaid" ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => payNow(f.fee_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow"
                      >
                        <FiCreditCard /> Pay Now
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg dark:border-gray-500"
                      >
                        <FiDownload /> Receipt
                      </motion.button>
                    )}
                  </td>
                </tr>
              ))}

              {fees.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan="4">
                    No fee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
