// src/pages/ParentChildren.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiBookOpen,
  FiBarChart2,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const dummyChildren = [
  {
    id: 1,
    name: "John Doe",
    class: "10A",
    gpa: 3.7,
    attendance: 92,
    fees: "Paid",
  },
  {
    id: 2,
    name: "Sophia Doe",
    class: "8B",
    gpa: 3.5,
    attendance: 88,
    fees: "Unpaid",
  },
];

export default function ParentChildren() {
  const [selectedChild, setSelectedChild] = useState(dummyChildren[0]);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <FiUser className="text-cyan-500" /> My Children
      </h2>

      {/* Switcher */}
      <div className="flex flex-wrap gap-3">
        {dummyChildren.map((child) => (
          <motion.button
            key={child.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedChild(child)}
            className={`px-5 py-2.5 rounded-lg font-semibold shadow transition-all duration-300 
              ${
                selectedChild.id === child.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-400/30"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600"
              }`}
          >
            {child.name}
          </motion.button>
        ))}
      </div>

      {/* Selected Child Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedChild.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {selectedChild.name} – Class {selectedChild.class}
            </h3>
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1 rounded-full text-sm bg-cyan-50 text-cyan-600 dark:bg-cyan-900/40"
            >
              Profile Active
            </motion.span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* GPA */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(6,182,212,0.25)" }}
              className="p-5 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-700/30 dark:to-blue-700/20 border border-cyan-200 dark:border-cyan-700"
            >
              <FiBarChart2 className="text-cyan-600 text-3xl mb-2" />
              <h4 className="font-semibold text-gray-700 dark:text-gray-100">
                GPA
              </h4>
              <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">
                {selectedChild.gpa}
              </p>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <motion.div
                  className="bg-cyan-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(selectedChild.gpa / 4) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>

            {/* Attendance */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(37,99,235,0.25)" }}
              className="p-5 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-700/30 dark:to-indigo-700/20 border border-blue-200 dark:border-blue-700"
            >
              <FiBookOpen className="text-blue-600 text-3xl mb-2" />
              <h4 className="font-semibold text-gray-700 dark:text-gray-100">
                Attendance
              </h4>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {selectedChild.attendance}%
              </p>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedChild.attendance}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>

            {/* Fees */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(16,185,129,0.25)" }}
              className="p-5 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-700/30 dark:to-emerald-700/20 border border-green-200 dark:border-green-700"
            >
              <FiDollarSign className="text-green-600 text-3xl mb-2" />
              <h4 className="font-semibold text-gray-700 dark:text-gray-100">
                Fees
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {selectedChild.fees === "Paid" ? (
                  <>
                    <FiCheckCircle className="text-emerald-500 text-2xl" />
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      Paid
                    </span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="text-red-500 text-2xl" />
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      Unpaid
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
