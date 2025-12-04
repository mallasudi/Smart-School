// src/pages/ParentFeedback.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiCheckCircle,
  FiPaperclip,
  FiTrash2,
  FiAlertTriangle,
  FiUser,
} from "react-icons/fi";
import axios from "axios";

const MAX_LEN = 600;
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export default function ParentFeedback() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendCopy, setSendCopy] = useState(true);
  const [recipient, setRecipient] = useState("Class Teacher");
  const [priority, setPriority] = useState("Normal");
  const [child, setChild] = useState("John Doe (10A)");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const charsLeft = useMemo(() => MAX_LEN - message.length, [message]);

  const pickFiles = (e) => {
    const list = Array.from(e.target.files || []);
    const next = list.map((f) => ({ name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in. Please log in again.");
      return;
    }

    try {
      setSending(true);

      await axios.post(
        `${API_BASE}/parent/feedback/message`,
        {
          childLabel: child,
          recipient,
          subject,
          message,
          priority,
          sendCopy,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSending(false);
      setSent(true);
      setSubject("");
      setMessage("");
      setFiles([]);
      setPriority("Normal");
      setRecipient("Class Teacher");
      setTimeout(() => setSent(false), 1800);
    } catch (err) {
      console.error("Send feedback error:", err);
      setSending(false);
      setError(
        err.response?.data?.message || "Failed to send message. Please try again."
      );
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Feedback / Message to School
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Send concerns, appreciations, or requests. We’ll route it to the right
          team.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Form Card */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-white/90 dark:bg-slate-800 p-6 shadow ring-1 ring-slate-100 dark:ring-slate-700 space-y-5"
      >
        {/* Row: child + recipient */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">
              Child
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3.5 text-slate-400" />
              <select
                value={child}
                onChange={(e) => setChild(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                {/* TODO: replace with real children fetched from API */}
                <option>John Doe (10A)</option>
                <option>Sophia Doe (8B)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">
              Send To
            </label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-700 dark:border-slate-600"
            >
              <option>Class Teacher</option>
              <option>Admin Office</option>
              <option>Accounts</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600"
            placeholder="e.g., Concern about homework load"
            required
          />
        </div>

        {/* Priority */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Priority:
          </span>
          {["Low", "Normal", "High"].map((p) => (
            <motion.button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              whileTap={{ scale: 0.96 }}
              className={`px-3 py-1.5 rounded-full text-sm border transition
                ${
                  priority === p
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent"
                    : "bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                }`}
            >
              {p}
            </motion.button>
          ))}
          {priority === "High" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <FiAlertTriangle /> Marked as urgent
            </span>
          )}
        </div>

        {/* Message + Counter */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">
              Message
            </label>
            <span
              className={`text-xs ${
                charsLeft < 0
                  ? "text-rose-600"
                  : charsLeft < 60
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {Math.max(charsLeft, 0)} characters left
            </span>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
            rows={6}
            className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600"
            placeholder={`Write your message to ${recipient.toLowerCase()}…`}
            required
          />
        </div>

        {/* Attachments (mock only – not sent to backend) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Attachments (optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer bg-white dark:bg-slate-700 dark:border-slate-600">
              <FiPaperclip /> Add files
              <input type="file" multiple className="hidden" onChange={pickFiles} />
            </label>
            <span className="text-xs text-slate-500">PDF / Images</span>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="space-y-2"
              >
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-700/60"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="inline-flex items-center gap-1 text-rose-600 hover:underline"
                    >
                      <FiTrash2 /> remove
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between pt-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={sendCopy}
              onChange={(e) => setSendCopy(e.target.checked)}
              className="h-4 w-4"
            />
            Send a copy to my email
          </label>

          <motion.button
            type="submit"
            disabled={sending}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white shadow
              ${
                sending
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95"
              }`}
          >
            <FiSend />
            {sending ? "Sending…" : "Send Message"}
          </motion.button>
        </div>
      </motion.form>

      {/* Success toast */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-600/15 dark:text-emerald-300 dark:border-emerald-700/50"
          >
            <FiCheckCircle /> Message sent!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
