// src/pages/ParentFeedback.jsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const MAX_LEN = 600;

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:4000/api";

const RECIPIENTS = [
  { label: "Class Teacher", value: "Class Teacher" },
  { label: "School Office (Fees)", value: "School Office (Fees)" },
  { label: "School Administration", value: "School Administration" },
];

// 🔹 Map frontend selection to backend codes
function mapRecipient(r) {
  if (r === "Class Teacher") return "CLASS_TEACHER";
  if (r === "School Office (Fees)") return "ACCOUNTS";
  if (r === "School Administration") return "ADMIN";
  return "CLASS_TEACHER";
}

export default function ParentFeedback() {
  const [child, setChild] = useState("John Doe (10A)");
  const [recipient, setRecipient] = useState(RECIPIENTS[0].value);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [message, setMessage] = useState("");
  const [sendCopy, setSendCopy] = useState(true);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const charsLeft = useMemo(() => MAX_LEN - message.length, [message]);

  // ============================
  // HANDLE SUBMIT
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject.trim() || !message.trim()) {
      setError("Please enter both subject and message.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in. Please log in again.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`${API_BASE}/parent/feedback/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          childLabel: child,
          receiver: mapRecipient(recipient),
          subject,
          message,
          priority,
          sendCopy,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to send message.");
      }

      setSuccess("Your message has been sent successfully.");
      setSubject("");
      setMessage("");
      setPriority("Normal");
      setRecipient(RECIPIENTS[0].value);
      setSendCopy(true);
    } catch (err) {
      console.error("PARENT FEEDBACK SEND ERROR:", err);
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Feedback / Message to School
        </h2>
        <p className="text-sm text-slate-500">
          Classroom issues → Class Teacher.  
          Fee & office issues → School Office.  
          School-wide concerns → Administration.
        </p>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 flex items-center gap-2"
          >
            <FiCheckCircle /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM */}
      <motion.form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-6 shadow ring-1 ring-slate-100 space-y-6"
      >
        {/* Child + Recipient */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Child
            </label>
            <select
              value={child}
              onChange={(e) => setChild(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option>John Doe (10A)</option>
              <option>Sophia Doe (8B)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Send To
            </label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {RECIPIENTS.map((r) => (
                <option key={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g., Concern about homework load"
          />
        </div>

        {/* Priority */}
        <div className="flex gap-3 items-center">
          <span className="text-sm font-medium">Priority:</span>
          {["Low", "Normal", "High"].map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPriority(p)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                priority === p
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  : "text-slate-600 border-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Message */}
        <div>
          <div className="flex justify-between">
            <label className="block text-sm mb-1">Message</label>
            <span className="text-xs text-slate-400">
              {Math.max(charsLeft, 0)} chars left
            </span>
          </div>

          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Write your message…"
          />
        </div>

        {/* Send copy */}
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sendCopy}
              onChange={(e) => setSendCopy(e.target.checked)}
            />
            Send a copy to my email
          </label>

          <motion.button
            type="submit"
            disabled={sending}
            className={`px-5 py-2.5 rounded-lg text-white shadow ${
              sending
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600"
            }`}
          >
            <FiSend /> {sending ? "Sending…" : "Send Message"}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
