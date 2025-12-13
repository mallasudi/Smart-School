import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiFileText,
  FiPlayCircle,
  FiDownload,
} from "react-icons/fi";
import axios from "axios";

export default function StudentMaterials() {
  const token = localStorage.getItem("token");
  const [materials, setMaterials] = useState([]);

  const loadMaterials = async () => {
    try {
      const res = await axios.get("/api/student/materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(res.data);
    } catch (err) {
      console.error("FAILED TO LOAD MATERIALS:", err);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <FiBookOpen className="text-cyan-500" /> Study Materials
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        Access lecture slides, notes, and recorded lessons uploaded by teachers.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {materials.map((m) => (
          <motion.div
            key={m.material_id}
            whileHover={{ y: -3, scale: 1.01 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                {new Date(m.uploaded_at).toISOString().split("T")[0]}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  m.file_url.endsWith(".pdf")
                    ? "bg-blue-100 text-blue-700"
                    : m.file_url.endsWith(".mp4")
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {m.file_url.endsWith(".pdf")
                  ? "PDF"
                  : m.file_url.endsWith(".mp4")
                  ? "Video"
                  : "File"}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              {m.title}
            </h3>

            <div className="text-sm text-gray-500 mb-4">
              Subject ID: {m.subject_id}
            </div>

            <div className="flex items-center gap-3">
              {m.file_url.endsWith(".mp4") ? (
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow hover:shadow-md"
                >
                  <FiPlayCircle /> Watch
                </motion.a>
              ) : (
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={m.file_url}
                  download
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow hover:shadow-md"
                >
                  <FiDownload /> Download
                </motion.a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
