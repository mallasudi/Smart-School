// src/pages/ParentFees.jsx
import { motion } from "framer-motion";
import {
  FiCreditCard,
  FiDownload,
  FiInfo,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";

const dues = [
  { month: "Aug 2025", amount: 2500, status: "Paid", mode: "Khalti" },
  { month: "Sep 2025", amount: 2500, status: "Unpaid", mode: "-" },
  { month: "Oct 2025", amount: 2500, status: "Unpaid", mode: "-" },
];

export default function ParentFees() {
  const pay = (m) =>
    alert(`💳 Mock: Redirecting to eSewa/Khalti gateway for ${m} ✅`);
  const receipt = (m) => alert(`📄 Mock: Downloading receipt for ${m} ✅`);

  const totalDue = dues
    .filter((d) => d.status === "Unpaid")
    .reduce((s, d) => s + d.amount, 0);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FiDollarSign className="text-cyan-500" />
          Fee Payment Overview
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Academic Year: <strong>2025–2026</strong>
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-900/10 border border-rose-100 dark:border-rose-800 shadow"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Outstanding Balance
          </div>
          <div className="text-4xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            Rs. {totalDue}
          </div>
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
            <FiInfo /> Tuition + Lab + Library
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800 shadow"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last Payment
          </div>
          <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Rs. 2,500
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Aug 10, 2025 • via Khalti
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-100 dark:border-indigo-800 shadow"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Concessions
          </div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            Rs. 500
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Merit-based Scholarship
          </div>
        </motion.div>
      </div>

      {/* Fee Table */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
            Monthly Fee Status
            <FiTrendingUp className="text-cyan-500" />
          </h3>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Updated: Oct 2025
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-700/60">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Month
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Amount
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Mode
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {dues.map((d, index) => (
                <motion.tr
                  key={d.month}
                  whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                  transition={{ duration: 0.2 }}
                  className={`border-t dark:border-slate-700 ${
                    index % 2 ? "bg-gray-50/30 dark:bg-slate-900/20" : ""
                  }`}
                >
                  <td className="p-3">{d.month}</td>
                  <td className="p-3 font-semibold text-gray-800 dark:text-gray-200">
                    Rs. {d.amount}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        d.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">
                    {d.mode}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    {d.status === "Unpaid" ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => pay(d.month)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium shadow hover:shadow-md"
                      >
                        <FiCreditCard /> Pay Now
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => receipt(d.month)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/40"
                      >
                        <FiDownload /> Receipt
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
