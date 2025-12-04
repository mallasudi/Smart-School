import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { motion } from "framer-motion";
import { FiSearch, FiBell } from "react-icons/fi";

export default function StudentNotices() {
  const [q, setQ] = useState("");
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

  const filtered = notices.filter((n) =>
    (n.title + n.message).toLowerCase().includes(q.toLowerCase())
  );

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
        <FiSearch />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notices..."
          className="flex-1 bg-transparent outline-none"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
            <FiBell />
          </span>
          <h3 className="font-semibold">Notices Board</h3>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No notices available.</p>
        ) : (
          <ul className="space-y-6 relative pl-6">
            {filtered.map((n) => {
              const displayDate = n.notice_date || n.created_at;
              return (
                <motion.li
                  key={n.notice_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600" />

                  <div className="flex justify-between">
                    <div className="font-medium">{n.title}</div>
                    <span className="text-sm text-gray-500">
                      {formatDate(displayDate)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">{n.message}</div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
