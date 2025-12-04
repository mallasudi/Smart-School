import { motion } from "framer-motion";
import { FiCreditCard, FiDownload, FiInfo } from "react-icons/fi";

const fees = [
  { month: "August 2025", amount: 2500, status: "Paid", mode: "Khalti" },
  { month: "September 2025", amount: 2500, status: "Unpaid", mode: "-" },
  { month: "October 2025", amount: 2500, status: "Unpaid", mode: "-" },
];

export default function StudentFees() {
  const totalDue = fees
    .filter(f => f.status === "Unpaid")
    .reduce((sum, f) => sum + f.amount, 0);

  const payNow = (month) => {
    alert(`Redirecting to payment gateway for ${month}...`);
  };

  const downloadReceipt = (month) => {
    alert(`Downloading receipt for ${month}...`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        💳 Fee Status & Payment
      </h2>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow"
        >
          <div className="text-sm text-gray-500">Outstanding Dues</div>
          <div className="text-3xl font-bold text-rose-600">Rs. {totalDue}</div>
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
            <FiInfo /> Tuition + Lab + Library
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow"
        >
          <div className="text-sm text-gray-500">Last Payment</div>
          <div className="text-3xl font-bold text-emerald-600">Rs. 2,500</div>
          <div className="mt-2 text-xs text-gray-400">Aug 10, 2025 • Khalti</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow"
        >
          <div className="text-sm text-gray-500">Scholarship / Concession</div>
          <div className="text-3xl font-bold text-blue-600">Rs. 500</div>
          <div className="mt-2 text-xs text-gray-400">Merit Scholarship</div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        whileHover={{ y: -1 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Monthly Fee Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="p-3">Month</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.month} className="border-t border-gray-200 dark:border-slate-700">
                  <td className="p-3">{f.month}</td>
                  <td className="p-3">Rs. {f.amount}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        f.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="p-3">{f.mode}</td>
                  <td className="p-3 flex gap-2">
                    {f.status === "Unpaid" ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => payNow(f.month)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow hover:shadow-md"
                      >
                        <FiCreditCard /> Pay Now
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadReceipt(f.month)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-gray-700 dark:text-gray-200"
                      >
                        <FiDownload /> Receipt
                      </motion.button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
