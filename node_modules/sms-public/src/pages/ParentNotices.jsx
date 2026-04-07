import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiBell } from "react-icons/fi";
import axios from "../utils/axios";

export default function ParentNotices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
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
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FiBell /> Notices & Announcements
      </h2>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {notices.map((n) => {
          const displayDate = n.notice_date || n.created_at;
          return (
            <motion.div
              key={n.notice_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow relative border"
            >
              <div className="text-sm text-gray-500">
                {formatDate(displayDate)}
              </div>

              <h3 className="text-lg font-bold mt-3">{n.title}</h3>
              <p className="text-gray-600 mt-2">{n.message}</p>
            </motion.div>
          );
        })}

        {notices.length === 0 && (
          <p className="text-gray-500">No notices available.</p>
        )}
      </div>
    </motion.div>
  );
}
