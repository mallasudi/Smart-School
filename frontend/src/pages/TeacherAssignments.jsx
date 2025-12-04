import { useState } from "react";
import { FiPlusCircle, FiEdit, FiTrash2, FiClipboard } from "react-icons/fi";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([
    { id: 1, title: "Math Homework", class: "10A", due: "2025-09-30", status: "Pending" },
    { id: 2, title: "Science Project", class: "9B", due: "2025-10-02", status: "Submitted" },
    { id: 3, title: "English Essay", class: "10C", due: "2025-10-05", status: "Pending" },
  ]);

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    class: "",
    due: "",
    status: "Pending",
  });

  const handleChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };

  const addAssignment = () => {
    if (!newAssignment.title || !newAssignment.class || !newAssignment.due) {
      alert("⚠️ Please fill all fields");
      return;
    }
    setAssignments([
      ...assignments,
      { id: assignments.length + 1, ...newAssignment },
    ]);
    setNewAssignment({ title: "", class: "", due: "", status: "Pending" });
  };

  const deleteAssignment = (id) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FiClipboard /> Manage Assignments
        </h2>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-lg font-semibold mb-2">➕ Post New Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Assignment Title"
            value={newAssignment.title}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
          />
          <input
            type="text"
            name="class"
            placeholder="Class (e.g. 10A)"
            value={newAssignment.class}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
          />
          <input
            type="date"
            name="due"
            value={newAssignment.due}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
          />
          <button
            onClick={addAssignment}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105"
          >
            <FiPlusCircle /> Add
          </button>
        </div>
      </div>

      {/* Assignment List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">📋 Assignment List</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Class</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{a.id}</td>
                <td className="p-3 font-medium">{a.title}</td>
                <td className="p-3">{a.class}</td>
                <td className="p-3">{a.due}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      a.status === "Submitted"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="p-3 flex gap-3">
                  <button className="text-blue-500 hover:text-blue-700">
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteAssignment(a.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
