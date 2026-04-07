// src/pages/TeacherAssignments.jsx
import { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);

  const [form, setForm] = useState({
    title: "",
    subject_id: "",
    instructions: "",
    due_date: "",
  });

  const loadAssignments = async () => {
    try {
      const res = await axios.get("/teacher/assignments");
      setAssignments(res.data || []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/teacher/assignments", form);
      alert("Assignment created!");
      setForm({ title: "", subject_id: "", instructions: "", due_date: "" });
      loadAssignments();
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📘 Manage Assignments</h2>

      {/* CREATE FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <input
          type="text"
          placeholder="Assignment Title"
          className="w-full border p-2 rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Subject ID"
          className="w-full border p-2 rounded"
          value={form.subject_id}
          onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
          required
        />

        <textarea
          placeholder="Instructions (optional)"
          className="w-full border p-2 rounded"
          value={form.instructions}
          onChange={(e) =>
            setForm({ ...form, instructions: e.target.value })
          }
        />

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          required
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>

      {/* ASSIGNMENT LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Assignment List</h3>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Title</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Due</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.assignment_id} className="border-t">
                <td className="p-3">{a.title}</td>
                <td className="p-3">{a.subject_id}</td>
                <td className="p-3">
                  {new Date(a.due_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

