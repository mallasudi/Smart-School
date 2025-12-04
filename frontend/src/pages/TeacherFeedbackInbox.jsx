import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function TeacherFeedbackInbox() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/teacher/feedback/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const json = await res.json();
        setMessages(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("LOAD TEACHER FEEDBACK MESSAGES ERROR:", err);
      }
    };

    loadMessages();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Parent Messages</h2>

      <div className="p-4 bg-white rounded-xl shadow">
        {messages.length === 0 ? (
          <p>No messages.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="border rounded-lg p-3">
              <div className="flex justify-between">
                <div className="font-medium">{m.subject}</div>
                <div className="text-xs">{new Date(m.created_at).toLocaleString()}</div>
              </div>

              {m.child_label && <div className="text-xs">Child: {m.child_label}</div>}
              <p className="mt-1">{m.message}</p>

              {m.sender && (
                <div className="mt-2 text-xs">From: {m.sender.email}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
