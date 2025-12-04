import { useState } from "react";
import { motion } from "framer-motion";
import { FiUploadCloud, FiFileText, FiVideo, FiTrash2, FiBook } from "react-icons/fi";

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState([
    { title: "Physics - Chapter 5 Notes", type: "PDF", subject: "Physics", date: "2025-10-01" },
    { title: "English Poem Explanation", type: "Video", subject: "English", date: "2025-09-30" },
  ]);

  const [newMat, setNewMat] = useState({ title: "", subject: "", type: "PDF", file: null });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newMat.title || !newMat.subject) {
      alert("Please fill all fields");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const updated = [
      ...materials,
      { title: newMat.title, type: newMat.type, subject: newMat.subject, date: today },
    ];
    setMaterials(updated);
    setNewMat({ title: "", subject: "", type: "PDF", file: null });
  };

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <FiBook className="text-cyan-500" /> Upload & Manage Study Materials
      </h2>

      {/* Upload Form */}
      <motion.form
        whileHover={{ y: -2 }}
        onSubmit={handleUpload}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow space-y-4"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500">Title</label>
            <input
              type="text"
              value={newMat.title}
              onChange={(e) => setNewMat({ ...newMat, title: e.target.value })}
              placeholder="e.g. Algebra Slides or Grammar Video"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Subject</label>
            <input
              type="text"
              value={newMat.subject}
              onChange={(e) => setNewMat({ ...newMat, subject: e.target.value })}
              placeholder="e.g. Science"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Material Type</label>
            <select
              value={newMat.type}
              onChange={(e) => setNewMat({ ...newMat, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option>PDF</option>
              <option>Slides</option>
              <option>Video</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow hover:shadow-lg"
          >
            <FiUploadCloud /> Upload Material
          </motion.button>
        </div>
      </motion.form>

      {/* Uploaded List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow">
        <h3 className="text-lg font-semibold mb-4">Uploaded Materials</h3>
        {materials.length > 0 ? (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700 text-sm">
                <th className="p-2">Title</th>
                <th className="p-2">Type</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Uploaded</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="border-t text-sm"
                >
                  <td className="p-2">{m.title}</td>
                  <td className="p-2 flex items-center gap-2">
                    {m.type === "PDF" && <FiFileText className="text-rose-500" />}
                    {m.type === "Slides" && <FiUploadCloud className="text-cyan-500" />}
                    {m.type === "Video" && <FiVideo className="text-green-500" />}
                    {m.type}
                  </td>
                  <td className="p-2">{m.subject}</td>
                  <td className="p-2">{m.date}</td>
                  <td className="p-2 text-center">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      onClick={() => removeMaterial(i)}
                      className="text-rose-500 hover:text-rose-600"
                    >
                      <FiTrash2 />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No materials uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
