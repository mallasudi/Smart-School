// src/pages/TeacherExamQuestions.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBookOpen, FiPlus, FiTrash2, FiSave, FiArrowLeft } from "react-icons/fi";
import { api } from "../lib/api";

const emptyQuestion = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
};

export default function TeacherExamQuestions() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyQuestion);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api(`/teacher/exams/${examId}/questions`, {
          auth: true,
        });
        setExam(data.exam);
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Teacher questions error:", err);
        alert(err.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  const startEdit = (q) => {
    setEditingId(q.question_id);
    setForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyQuestion);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveQuestion = async () => {
    try {
      setSaving(true);
      if (editingId) {
        const updated = await api(`/teacher/questions/${editingId}`, {
          method: "PUT",
          body: form,
          auth: true,
        });
        setQuestions((prev) =>
          prev.map((q) => (q.question_id === editingId ? updated.question : q))
        );
      } else {
        const created = await api(`/teacher/exams/${examId}/questions`, {
          method: "POST",
          body: form,
          auth: true,
        });
        setQuestions((prev) => [...prev, created.question]);
      }
      resetForm();
    } catch (err) {
      console.error("Save question error:", err);
      alert(err.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (qid) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await api(`/teacher/questions/${qid}`, {
        method: "DELETE",
        auth: true,
      });
      setQuestions((prev) => prev.filter((q) => q.question_id !== qid));
    } catch (err) {
      console.error("Delete question error:", err);
      alert(err.message || "Failed to delete question");
    }
  };

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Loading exam questions...</p>;
  }

  if (!exam) {
    return (
      <div className="p-6">
        <p className="text-sm text-rose-500 mb-3">Exam not found.</p>
        <button
          onClick={() => navigate("/teacher/exams")}
          className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
        >
          Back to My Exams
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow flex items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FiBookOpen className="text-cyan-500" />
            Manage Questions – {exam.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total marks: {exam.total_marks}
          </p>
        </div>
        <button
          onClick={() => navigate("/teacher/exams")}
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-cyan-600"
        >
          <FiArrowLeft /> Back
        </button>
      </motion.div>

      {/* Question form */}
      <motion.div
        whileHover={{ y: -1 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            {editingId ? "Edit Question" : "Add New Question"}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-cyan-600"
            >
              Cancel edit
            </button>
          )}
        </div>

        <textarea
          value={form.question_text}
          onChange={(e) => handleChange("question_text", e.target.value)}
          placeholder="Enter question text..."
          rows={3}
          className="w-full text-sm border rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["a", "b", "c", "d"].map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct_option"
                checked={form.correct_option === opt.toUpperCase()}
                onChange={() =>
                  handleChange("correct_option", opt.toUpperCase())
                }
                className="mt-0.5"
              />
              <input
                type="text"
                value={form[`option_${opt}`]}
                onChange={(e) =>
                  handleChange(`option_${opt}`, e.target.value)
                }
                placeholder={`Option ${opt.toUpperCase()}`}
                className="flex-1 text-sm border rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          ))}
        </div>

        <button
          onClick={saveQuestion}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm shadow disabled:opacity-60"
        >
          <FiSave />
          {saving ? "Saving..." : editingId ? "Update Question" : "Add Question"}
        </button>
      </motion.div>

      {/* Question list */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <motion.div
            key={q.question_id}
            whileHover={{ y: -1 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {idx + 1}. {q.question_text}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                A. {q.option_a} • B. {q.option_b} • C. {q.option_c} • D. {q.option_d}{" "}
                <span className="font-semibold text-cyan-600 ml-2">
                  (Correct: {q.correct_option})
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(q)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-600 text-gray-700 dark:text-gray-200"
              >
                Edit
              </button>
              <button
                onClick={() => deleteQuestion(q.question_id)}
                className="px-3 py-1.5 text-xs rounded-xl bg-rose-500 text-white inline-flex items-center gap-1"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </motion.div>
        ))}

        {questions.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No questions added yet.
          </p>
        )}
      </div>
    </div>
  );
}
