// src/pages/AdminFeedback.jsx
import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:4000/api";

export default function AdminFeedback() {
  const [tab, setTab] = useState("survey"); // "messages" | "survey"
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [messages, setMessages] = useState([]);
  const [surveyItems, setSurveyItems] = useState([]);

  const token = localStorage.getItem("token");

  /* ---------------------------
     LOAD PARENT → SCHOOL MESSAGES
  ---------------------------- */
  const loadMessages = async () => {
    try {
      setLoadingMessages(true);

      const res = await fetch(`${API_BASE}/admin/feedback/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      // Controller returns: { success, data: [...] }
      setMessages(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("ADMIN FEEDBACK messages error:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  /* ---------------------------
     LOAD SURVEY FEEDBACK
  ---------------------------- */
  const loadSurveyFeedback = async () => {
    try {
      setLoadingSurvey(true);

      const res = await fetch(`${API_BASE}/admin/feedback/surveys`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      //controller returns { success, feedbacks: [...] }
      const list = Array.isArray(json.feedbacks) ? json.feedbacks : [];

      setSurveyItems(list);
    } catch (err) {
      console.error("ADMIN FEEDBACK survey error:", err);
    } finally {
      setLoadingSurvey(false);
    }
  };

  useEffect(() => {
    loadMessages();
    loadSurveyFeedback();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Feedback Center</h2>

      {/* Tabs */}
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setTab("messages")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition
            ${
              tab === "messages"
                ? "bg-white shadow text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
        >
          Parent Messages
        </button>

        <button
          onClick={() => setTab("survey")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition
            ${
              tab === "survey"
                ? "bg-white shadow text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
        >
          Survey Feedback
        </button>
      </div>

      {/* -------------------
          Parent Messages
      -------------------- */}
      {tab === "messages" && (
        <section className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100 space-y-3">
          <h3 className="font-semibold text-slate-800">Parent Messages</h3>

          {loadingMessages ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-500">
              No feedback messages submitted yet.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="border border-slate-200 rounded-xl p-3"
                >
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">
                      [{m.receiver}] {m.subject}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>

                  {m.child_label && (
                    <div className="text-xs text-slate-500">
                      Child: {m.child_label}
                    </div>
                  )}

                  <p className="text-slate-700 whitespace-pre-line">
                    {m.message}
                  </p>

                  {m.sender && (
                    <div className="mt-2 text-xs text-slate-500">
                      From: {m.sender.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* -------------------
          Survey Feedback
      -------------------- */}
      {tab === "survey" && (
        <section className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100 space-y-3">
          <h3 className="font-semibold text-slate-800">Parent Survey Feedback</h3>

          {loadingSurvey ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : surveyItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              No survey feedback submitted yet.
            </p>
          ) : (
            <div className="space-y-4 text-sm">
              {surveyItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                >
                  <div className="flex justify-between mb-2">
                    <div className="text-xs text-slate-500">
                      Parent ID: {item.parent_id}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : ""}
                    </div>
                  </div>

                  {/* BASIC FIELDS */}
                  <div className="grid md:grid-cols-2 gap-2">
                    <p><strong>Quality of Education:</strong> {item.quality_education}</p>
                    <p><strong>Extracurricular:</strong> {item.extracurricular}</p>
                    <p><strong>Teaching Methods:</strong> {item.teaching_methods}</p>
                    <p><strong>Campus Safety:</strong> {item.campus_safety}</p>
                    <p><strong>Homework Load:</strong> {item.homework_load}</p>
                    <p><strong>Teacher Attention:</strong> {item.teacher_attention}</p>
                    <p><strong>Social Support:</strong> {item.social_support}</p>
                    <p><strong>Child Safety:</strong> {item.child_safety}</p>
                    <p><strong>Extracurricular Level:</strong> {item.extracurricular_level}</p>
                    <p><strong>Teaching Effective:</strong> {item.teaching_effective}</p>
                  </div>

                  {item.suggestions && (
                    <p className="mt-2">
                      <strong>Suggestions:</strong> {item.suggestions}
                    </p>
                  )}

                  {item.additional_feedback && (
                    <p className="mt-1">
                      <strong>Additional Feedback:</strong> {item.additional_feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
