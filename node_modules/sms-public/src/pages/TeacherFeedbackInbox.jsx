// src/pages/TeacherFeedbackInbox.jsx
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function TeacherFeedbackInbox() {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);

  const token = localStorage.getItem("token");

  // Load inbox
  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/teacher/feedback/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      const arr = json.data || json.messages || [];
      setMessages(arr);
    } catch (err) {
      console.error("LOAD TEACHER FEEDBACK MESSAGES ERROR:", err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // ----------------------
  // Send Reply
  // ----------------------
  const sendReply = async (id) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(
        `${API_BASE}/teacher/feedback/messages/${id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ replyText }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setReplyText("");
        setActiveReplyId(null);
        loadMessages();
      }
    } catch (err) {
      console.error("SEND REPLY ERROR:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Parent Messages</h2>

      <div className="p-4 bg-white rounded-xl shadow">
        {messages.length === 0 ? (
          <p>No messages.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <div className="font-medium">{m.subject}</div>
                <div className="text-xs">
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>

              {m.child_label && (
                <div className="text-xs text-gray-500">
                  Child: {m.child_label}
                </div>
              )}

              <p className="mt-1">{m.message}</p>

              {m.sender && (
                <div className="mt-2 text-xs text-gray-600">
                  From: {m.sender.email}
                </div>
              )}

              {/* Existing reply (if any) */}
              {m.teacher_reply && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
                  <p className="text-sm">
                    <strong>Your Reply:</strong> {m.teacher_reply}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(m.reply_at).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Reply box */}
              {!m.teacher_reply && (
                <div className="mt-3">
                  {activeReplyId === m.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Write your reply…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-1.5 rounded-lg bg-green-600 text-white"
                          onClick={() => sendReply(m.id)}
                        >
                          Send Reply
                        </button>
                        <button
                          className="px-4 py-1.5 rounded-lg bg-gray-300"
                          onClick={() => setActiveReplyId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                      onClick={() => setActiveReplyId(m.id)}
                    >
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
