import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { motion } from "framer-motion";
import { FiBell } from "react-icons/fi";

export default function TeacherNotices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await axios.get("/notices");
      setNotices(res.data.notices || []);
    } catch (err) {
      console.error("Failed to load notices", err);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
          <FiBell />
        </span>
        <div>
          <h2 className="font-semibold text-lg">Notices for You</h2>
          <p className="text-sm text-gray-500">
            Includes exam notices and admin announcements.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {notices.length === 0 ? (
          <p className="text-gray-500 text-sm">No notices available.</p>
        ) : (
          <ul className="space-y-4">
            {notices.map((n) => {
              const displayDate = n.notice_date || n.created_at;
              return (
                <motion.li
                  key={n.notice_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg px-4 py-3"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold">{n.title}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(displayDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  {n.status && (
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        n.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {n.status}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
