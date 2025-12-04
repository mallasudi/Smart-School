import { useState } from "react";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

export default function TeacherAttendance() {
  const [students, setStudents] = useState([
    { id: 1, name: "John Doe", status: "Present" },
    { id: 2, name: "Jane Smith", status: "Absent" },
    { id: 3, name: "Michael Lee", status: "Present" },
    { id: 4, name: "Sophia Brown", status: "Present" },
  ]);

  const handleStatusChange = (id, status) => {
    setStudents(students.map(s => (s.id === id ? { ...s, status } : s)));
  };

  const handleSave = () => {
    alert("✅ Attendance saved successfully!");
    console.log("Attendance Data:", students);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">📋 Attendance Management</h2>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-white text-blue-600 rounded-lg font-semibold shadow hover:bg-gray-100"
        >
          Save Attendance
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-3 bg-green-100 p-4 rounded-xl shadow">
          <FiCheckCircle className="text-green-600 text-3xl" />
          <div>
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-xl font-bold">
              {students.filter(s => s.status === "Present").length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-red-100 p-4 rounded-xl shadow">
          <FiXCircle className="text-red-600 text-3xl" />
          <div>
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-xl font-bold">
              {students.filter(s => s.status === "Absent").length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-yellow-100 p-4 rounded-xl shadow">
          <FiClock className="text-yellow-600 text-3xl" />
          <div>
            <p className="text-sm text-gray-600">Late</p>
            <p className="text-xl font-bold">
              {students.filter(s => s.status === "Late").length}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3">{s.id}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">
                  <select
                    value={s.status}
                    onChange={(e) => handleStatusChange(s.id, e.target.value)}
                    className="border px-3 py-1 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                  >
                    <option value="Present">✅ Present</option>
                    <option value="Absent">❌ Absent</option>
                    <option value="Late">⏰ Late</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
