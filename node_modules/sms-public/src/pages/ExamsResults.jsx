// src/pages/ExamResults.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CalendarDays,
  CheckCircle2,
  PlusCircle,
  Edit,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "../context/AuthContext";

export default function ExamsAdmin() {
  const { token } = useAuth();

  const [openModal, setOpenModal] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= FETCH EXAMS =================
  const loadExams = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:4000/api/admin/exams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.message || "Failed to load exams");
        return;
      }
      setExams(data.exams || []);
    } catch (err) {
      console.error("Load exams error:", err);
    }
  };

  // ================= FETCH SUBJECTS =================
  const loadSubjects = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:4000/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error("Load subjects error:", err);
    }
  };

  // Load exams on mount / when token changes
  useEffect(() => {
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Whenever modal opens, load subjects and preselect for edit
  useEffect(() => {
    if (openModal) {
      loadSubjects();
      if (editExam?.subject_id) {
        setSelectedSubjectId(String(editExam.subject_id));
      } else {
        setSelectedSubjectId("");
      }
    }
  }, [openModal, editExam]);

  // Helper: currently selected subject object
  const selectedSubject = subjects.find(
    (s) => String(s.subject_id) === selectedSubjectId
  );

  // ================= STATS =================
  const stats = [
    {
      label: "Total Exams",
      value: exams.length,
      color: "text-blue-600",
      icon: FileText,
    },
    {
      label: "Upcoming",
      value: exams.filter((e) => e.status === "Upcoming").length,
      color: "text-yellow-600",
      icon: CalendarDays,
    },
    {
      label: "Published",
      value: exams.filter((e) => e.status === "Published").length,
      color: "text-green-600",
      icon: CheckCircle2,
    },
  ];

  const chartData = [
    { class: "Class 1", average: 65 },
    { class: "Class 2", average: 72 },
    { class: "Class 3", average: 80 },
    { class: "Class 4", average: 85 },
  ];

  // ================= SAVE (CREATE / UPDATE) =================
  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Not authenticated");
      return;
    }

    const form = e.target;
    const title = form.name.value.trim();
    const exam_date = form.date.value;
    const total_marks = form.total_marks.value || 100;
    const term = form.term.value || "First Term Exam";
    const subject_id = Number(selectedSubjectId || form.subject_id.value);
    const chosenSubject = subjects.find((s) => s.subject_id === subject_id);

    if (!chosenSubject) {
      alert("Please select a valid subject.");
      return;
    }

    const class_id = chosenSubject.class_id; // 👈 class comes from subject

    const payload = {
      title,
      exam_date,
      total_marks,
      class_id,
      subject_id,
      term, 
    };

    const isEditing = !!editExam;
    const url = isEditing
      ? `http://localhost:4000/api/admin/exams/${editExam.exam_id}`
      : "http://localhost:4000/api/admin/exams";
    const method = isEditing ? "PUT" : "POST";

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to save exam");
        return;
      }

      await loadExams();
      setOpenModal(false);
      setEditExam(null);
      setSelectedSubjectId("");
    } catch (err) {
      console.error("Save exam error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/exams/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete exam");
        return;
      }
      setExams((prev) => prev.filter((e) => e.exam_id !== id));
    } catch (err) {
      console.error("Delete exam error:", err);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          Exams & Results (Admin)
        </h1>
        <button
          onClick={() => {
            setEditExam(null);
            setSelectedSubjectId("");
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-orange-400 hover:to-blue-500 transition-transform transform hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {/* Stats cards */}
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

     
      {/* Exams Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow overflow-hidden"
      >
        <h2 className="text-lg font-semibold p-4">Exam List</h2>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Exam Name</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Term</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total Marks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam, idx) => (
              <tr
                key={exam.exam_id}
                className={`border-t ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {exam.title}
                </td>
                <td className="px-4 py-3">
                  {exam.class?.class_name || exam.class_label || "-"}
                </td>
                <td className="px-4 py-3">
                  {exam.subject?.name || "-"}
                </td>
                <td className="px-4 py-3">
                  {exam.term || "First Term Exam"}
                </td>
                <td className="px-4 py-3">{formatDate(exam.exam_date)}</td>
                <td className="px-4 py-3">{exam.total_marks}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      exam.status === "Published"
                        ? "bg-green-100 text-green-600"
                        : exam.status === "Upcoming"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {exam.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setEditExam(exam);
                      setSelectedSubjectId(
                        exam.subject_id ? String(exam.subject_id) : ""
                      );
                      setOpenModal(true);
                    }}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.exam_id)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal Form */}
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
                setEditExam(null);
                setSelectedSubjectId("");
              }}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative z-10 w-full max-w-md rounded-2xl shadow-xl p-[2px] bg-gradient-to-r from-orange-400 via-blue-400 to-cyan-500"
            >
              <div className="bg-white rounded-2xl p-6 relative">
                <button
                  onClick={() => {
                    setOpenModal(false);
                    setEditExam(null);
                    setSelectedSubjectId("");
                  }}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>

                <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-orange-500 to-blue-600 text-transparent bg-clip-text">
                  {editExam ? "Edit Exam" : "Create Exam"}
                </h2>

                <form className="space-y-4" onSubmit={handleSave}>
                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Exam Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editExam?.title || ""}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                      required
                    />
                  </div>

                  {/* SUBJECT DROPDOWN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <select
                      name="subject_id"
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.map((s) => (
                        <option key={s.subject_id} value={s.subject_id}>
                       {s.name}
                      </option>

                      ))}
                    </select>
                  </div>

                  {/* CLASS DISPLAY (DERIVED FROM SUBJECT) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Class (auto from subject)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        selectedSubject?.class?.class_name
                          ? selectedSubject.class.class_name
                          : ""
                      }
                      placeholder="Select a subject to see class"
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                 {/* TERM SELECT */}
<div>
  <label className="block text-sm font-medium text-gray-700">
    Term
  </label>
  <select
    name="term"
    value={editExam ? editExam.term : undefined}
    onChange={(e) => {
      if (editExam) {
        setEditExam({ ...editExam, term: e.target.value });
      }
    }}
    className="w-full px-4 py-2 border rounded-lg"
    required
  >
    <option value="First Term Exam">First Term Exam</option>
    <option value="Mid Term Exam">Mid Term Exam</option>
    <option value="Final Term Exam">Final Term Exam</option>
  </select>
</div>


                  {/* DATE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={
                        editExam?.exam_date
                          ? String(editExam.exam_date).split("T")[0]
                          : ""
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                      required
                    />
                  </div>

                  {/* TOTAL MARKS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      name="total_marks"
                      defaultValue={editExam?.total_marks ?? 100}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-orange-400 hover:to-blue-500 transition-transform transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
