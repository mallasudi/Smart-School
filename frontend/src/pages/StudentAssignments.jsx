// src/pages/StudentAssignments.jsx
import { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [uploading, setUploading] = useState(null);

  const loadAssignments = async () => {
    try {
      const res = await axios.get("/student/assignments");
      setAssignments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleSubmit = async (assignment_id, file) => {
    if (!file) return alert("Choose a file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(assignment_id);
      await axios.post(`/student/assignments/${assignment_id}/submit`, formData);
      alert("Submitted!");
      loadAssignments();
    } catch (err) {
      console.error(err);
      alert("Submit failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📘 Assignments</h2>

      {assignments.map((a) => (
        <div key={a.assignment_id} className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold text-lg">{a.title}</h3>
          <p className="text-sm text-gray-600">
            Due: {new Date(a.due_date).toLocaleDateString()}
          </p>

          <input
            type="file"
            className="mt-2"
            onChange={(e) =>
              handleSubmit(a.assignment_id, e.target.files[0])
            }
          />

          {uploading === a.assignment_id && <p>Uploading...</p>}
        </div>
      ))}
    </div>
  );
}
