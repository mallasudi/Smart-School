// src/pages/StudentTakeExam.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBookOpen, FiCheckCircle } from "react-icons/fi";
import { api } from "../lib/api";

export default function StudentTakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api(`/student/exams/${examId}`, { auth: true });
        setExam(data.exam);
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Get exam questions error:", err);
        setError(err.message || "Failed to load exam questions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  const handleSelect = (qid, opt) => {
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  const handleSubmit = async () => {
    if (!examId) return;
    try {
      setSubmitting(true);
      const payload = {
        answers: Object.entries(answers).map(([question_id, selected_option]) => ({
          question_id: Number(question_id),
          selected_option,
        })),
      };

      const data = await api(`/student/exams/${examId}/submit`, {
        method: "POST",
        body: payload,
        auth: true,
      });

      setSummary({
        correct: data.correctCount,
        total: data.totalQuestions,
        marks: data.marks,
      });
    } catch (err) {
      console.error("Submit exam error:", err);
      alert(err.message || "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">Loading exam...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
        <p className="text-sm text-rose-500 mb-3">{error || "Exam not found"}</p>
        <button
          onClick={() => navigate("/student/exams")}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FiBookOpen className="text-cyan-500" />
              {exam.title}
            </h1>
            <button
              onClick={() => navigate("/student/exams")}
              className="text-xs text-gray-500 hover:text-cyan-600"
            >
              Back to list
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Total Marks:{" "}
            <span className="font-semibold text-gray-800 dark:text-white">
              {exam.total_marks}
            </span>
          </p>
        </motion.div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <motion.div
              key={q.question_id}
              whileHover={{ y: -1 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow border border-slate-100 dark:border-slate-700"
            >
              <p className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                {idx + 1}. {q.question_text}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  ["A", q.option_a],
                  ["B", q.option_b],
                  ["C", q.option_c],
                  ["D", q.option_d],
                ].map(([opt, label]) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(q.question_id, opt)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition
                      ${
                        answers[q.question_id] === opt
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                          : "border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/40 dark:border-slate-700 dark:hover:border-cyan-500"
                      }`}
                  >
                    <span className="font-semibold mr-2">{opt}.</span>
                    <span className="flex-1">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}

          {questions.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-300">
              This exam has no questions yet.
            </p>
          )}
        </div>

        {/* Summary + Submit */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {summary ? (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow flex items-center gap-3 text-sm">
              <FiCheckCircle className="text-emerald-500 text-xl" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Exam submitted successfully
                </p>
                <p className="text-gray-500 dark:text-gray-300">
                  Correct: {summary.correct} / {summary.total} • Marks:{" "}
                  <span className="font-semibold">{summary.marks}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Make sure you have answered all questions before submitting.
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || questions.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium shadow disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Exam"}
            </button>
            <button
              onClick={() => navigate("/student/results")}
              className="text-xs text-gray-500 hover:text-cyan-600"
            >
              View My Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
