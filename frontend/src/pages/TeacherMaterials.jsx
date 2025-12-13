import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiFileText,
  FiVideo,
  FiTrash2,
  FiBook,
} from "react-icons/fi";
import axios from "axios";

export default function TeacherMaterials() {
  const token = localStorage.getItem("token");

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newMat, setNewMat] = useState({
    title: "",
    subject_id: "",
    file: null,
  });

  // Load teacher materials from backend
  const loadMaterials = async () => {
    try {
      const res = await axios.get("/api/teacher/materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(res.data);
    } catch (err) {
      console.error("LOAD MATERIAL ERROR:", err);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newMat.title || !newMat.subject_id || !newMat.file) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", newMat.title);
      form.append("subject_id", newMat.subject_id);
      form.append("file", newMat.file);

      await axios.post("/api/teacher/materials/upload", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setNewMat({
        title: "",
        subject_id: "",
        file: null,
      });

      loadMaterials();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    }

    setLoading(false);
  };

  const removeMaterial = async (id) => {
    if (!confirm("Delete this material?")) return;
    try {
      await axios.delete(`/api/teacher/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadMaterials();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
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
              placeholder="e.g. Algebra Slides"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Subject ID</label>
            <input
              type="number"
              value={newMat.subject_id}
              onChange={(e) =>
                setNewMat({ ...newMat, subject_id: e.target.value })
              }
              placeholder="Enter subject_id"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Choose File</label>
            <input
              type="file"
              accept=".pdf,.mp4,.ppt,.pptx"
              onChange={(e) =>
                setNewMat({ ...newMat, file: e.target.files[0] })
              }
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow hover:shadow-lg"
          >
            <FiUploadCloud /> {loading ? "Uploading..." : "Upload Material"}
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
                <th className="p-2">Subject</th>
                <th className="p-2">File</th>
                <th className="p-2">Uploaded</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <motion.tr
                  key={m.material_id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="border-t text-sm"
                >
                  <td className="p-2">{m.title}</td>
                  <td className="p-2">{m.subject_id}</td>
                  <td className="p-2 flex items-center gap-2">
                    {m.file_url.endsWith(".pdf") && (
                      <FiFileText className="text-rose-500" />
                    )}
                    {m.file_url.endsWith(".mp4") && (
                      <FiVideo className="text-green-500" />
                    )}
                    <a
                      href={m.file_url}
                      className="text-blue-600 underline"
                      target="_blank"
                    >
                      View
                    </a>
                  </td>
                  <td className="p-2">
                    {new Date(m.uploaded_at).toISOString().split("T")[0]}
                  </td>
                  <td className="p-2 text-center">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      onClick={() => removeMaterial(m.material_id)}
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
