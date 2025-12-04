import { motion } from "framer-motion";
import { FiBookOpen, FiFileText, FiPlayCircle, FiDownload } from "react-icons/fi";

const materials = [
  {
    id: 1,
    subject: "Mathematics",
    type: "PDF Notes",
    title: "Algebra & Linear Equations",
    uploaded: "2025-09-20",
    link: "#",
  },
  {
    id: 2,
    subject: "Science",
    type: "Slide Deck",
    title: "Introduction to Chemical Reactions",
    uploaded: "2025-09-23",
    link: "#",
  },
  {
    id: 3,
    subject: "English",
    type: "Video Lecture",
    title: "Poetic Devices Explained",
    uploaded: "2025-09-25",
    link: "#",
  },
];

export default function StudentMaterials() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <FiBookOpen className="text-cyan-500" /> Study Materials
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        Access lecture slides, notes, and recorded lessons uploaded by teachers.
      </p>

      {/* Grid View */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {materials.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ y: -3, scale: 1.01 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700"
          >
            {/* Header Info */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{m.uploaded}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  m.type.includes("PDF")
                    ? "bg-blue-100 text-blue-700"
                    : m.type.includes("Slide")
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {m.type}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              {m.title}
            </h3>
            <div className="text-sm text-gray-500 mb-4">{m.subject}</div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {m.type === "Video Lecture" ? (
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow hover:shadow-md"
                >
                  <FiPlayCircle /> Watch
                </motion.a>
              ) : (
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
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
