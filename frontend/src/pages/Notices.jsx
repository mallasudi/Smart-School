// src/pages/Notices.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import axios from "../utils/axios";

export default function Notices() {
  const [openModal, setOpenModal] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [notices, setNotices] = useState([]);

  const [currentTarget, setCurrentTarget] = useState("all");

  const loadNotices = async () => {
    try {
      const res = await axios.get("/admin/notices");
      setNotices(res.data.notices || []);
    } catch (err) {
      console.error("Failed to load notices", err);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const stats = [
    {
      label: "Total Notices",
      value: notices.length,
      color: "text-blue-600",
      icon: Bell,
    },
    {
      label: "Active",
      value: notices.filter((n) => n.status === "Active").length,
      color: "text-green-600",
      icon: CheckCircle2,
    },
    {
      label: "Expired",
      value: notices.filter((n) => n.status === "Expired").length,
      color: "text-red-600",
      icon: XCircle,
    },
  ];

  /* =====================================================
      FIXED VERSION — NO MORE CRASHES
  ===================================================== */
  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.currentTarget; // 🔥 FIXED — NEVER use e.target

    const payload = {
      title: form.title.value.trim(),
      message: form.message.value.trim(),
      status: form.status.value,
      target: form.target.value,
      notice_date: form.notice_date.value || null,
      class_id: form.class_id?.value ? Number(form.class_id.value) : null,
    };

    try {
      if (editNotice) {
        await axios.put(`/admin/notices/${editNotice.notice_id}`, payload);
      } else {
        await axios.post("/admin/notices", payload);
      }

      await loadNotices();
      setOpenModal(false);
      setEditNotice(null);
    } catch (err) {
      console.error("Failed to save notice", err);
      alert("Failed to save notice");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await axios.delete(`/admin/notices/${id}`);
      setNotices((prev) => prev.filter((n) => n.notice_id !== id));
    } catch (err) {
      console.error("Failed to delete notice", err);
      alert("Failed to delete notice");
    }
  };

  const openNewModal = () => {
    setEditNotice(null);
    setCurrentTarget("all");
    setOpenModal(true);
  };

  const openEditModal = (n) => {
    setEditNotice(n);
    setCurrentTarget(n.target || "all");
    setOpenModal(true);
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return isNaN(date) ? "-" : date.toLocaleDateString();
  };

  const formatAudience = (target) => {
    switch (target) {
      case "all":
        return "Everyone";
      case "student":
        return "Students";
      case "parent":
        return "Parents";
      case "teacher":
        return "Teachers";
      case "class":
        return "Specific Class";
      default:
        return target;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-500" />
          Notices
        </h1>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition"
        >
          <PlusCircle className="w-4 h-4" /> Post Notice
        </button>
      </div>

      {/* Stats */}
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

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow overflow-hidden"
      >
        <h2 className="text-lg font-semibold p-4">Recent Notices</h2>

        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Audience</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {notices.map((n, idx) => (
              <tr
                key={n.notice_id}
                className={`border-t ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">{n.title}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                    {formatAudience(n.target)}
                    {n.target === "class" && n.class_id ? ` (Class ${n.class_id})` : ""}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(n.notice_date || n.created_at)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      n.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {n.status}
                  </span>
                </td>

                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => openEditModal(n)}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(n.notice_id)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {notices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No notices posted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Modal */}
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
              onClick={() => {
                setOpenModal(false);
                setEditNotice(null);
              }}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-bold text-center mb-4">
                {editNotice ? "Edit Notice" : "Post Notice"}
              </h2>

              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editNotice?.title || ""}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notice Date
                  </label>
                  <input
                    type="date"
                    name="notice_date"
                    defaultValue={
                      editNotice?.notice_date
                        ? editNotice.notice_date.slice(0, 10)
                        : ""
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select
                      name="status"
                      defaultValue={editNotice?.status || "Active"}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Target</label>
                    <select
                      name="target"
                      defaultValue={editNotice?.target || "all"}
                      onChange={(e) => setCurrentTarget(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="all">Everyone</option>
                      <option value="student">Students</option>
                      <option value="parent">Parents</option>
                      <option value="teacher">Teachers</option>
                      <option value="class">Specific Class</option>
                    </select>
                  </div>
                </div>

                {currentTarget === "class" && (
                  <div>
                    <label className="block text-sm font-medium">
                      Class ID
                    </label>
                    <input
                      type="number"
                      name="class_id"
                      defaultValue={editNotice?.class_id || ""}
                      placeholder="e.g. 3"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    defaultValue={editNotice?.message || ""}
                    required
                    className="w-full px-4 py-2 border rounded-lg resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-[1.02] transition"
                >
                  Save Notice
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
