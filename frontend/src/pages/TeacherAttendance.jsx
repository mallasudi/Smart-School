// src/pages/TeacherAttendance.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

export default function TeacherAttendance() {
  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [students, setStudents] = useState([]);

  const [subjectName, setSubjectName] = useState(""); // just for display

  /* 
       LOAD TEACHER PROFILE → SUBJECT NAME
  */
  useEffect(() => {
    const loadTeacherProfile = async () => {
      try {
        const res = await axios.get("/api/teacher/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.profile?.subject) {
          setSubjectName(res.data.profile.subject);
        }
      } catch (err) {
        console.error("FAILED TO LOAD TEACHER PROFILE:", err);
      }
    };

    loadTeacherProfile();
  }, [token]);

  /* 
       LOAD TEACHER CLASSES
  */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/api/teacher/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("CLASSES =", res.data);
        setClasses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("FAILED TO LOAD CLASSES:", err);
        setClasses([]);
      }
    };

    fetchClasses();
  }, [token]);

  /* 
       LOAD STUDENTS + TODAY ATTENDANCE
  */
  const loadStudents = async (classId, date = selectedDate) => {
    if (!classId) return;

    console.log("Loading students for class:", classId);
    setSelectedClass(classId);

    try {
      // 1) Students of this class
      const studentsRes = await axios.get(
        `/api/teacher/class/${classId}/students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const studentList = studentsRes.data || [];

      // 2) Saved attendance for this class + date + this teacher
      const attendanceRes = await axios.get(
        `/api/attendance/today?class_id=${classId}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const saved = attendanceRes.data || [];

      // 3) Merge
      const merged = studentList.map((s) => {
        const found = saved.find((r) => r.student_id === s.student_id);
        return {
          id: s.student_id,
          name: `${s.first_name} ${s.last_name}`,
          status: found ? found.status : "Present",
        };
      });

      setStudents(merged);
    } catch (err) {
      console.error("LOAD STUDENTS ERROR:", err);
      setStudents([]);
    }
  };

  /* 
       DATE CHANGE
  */
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);

    if (selectedClass) {
      loadStudents(selectedClass, newDate);
    }
  };

  /* 
       STATUS CHANGE
  */
  const handleStatusChange = (id, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  /* 
       SAVE ATTENDANCE
  */
  const handleSave = async () => {
    if (!selectedClass) {
      alert("Please select a class first.");
      return;
    }

    if (!students.length) {
      alert("No students to mark attendance.");
      return;
    }

    const payload = {
      date: selectedDate,
      class_id: Number(selectedClass),
      students: students.map((s) => ({
        student_id: Number(s.id),
        status: s.status,
      })),
    };

    console.log("SAVE PAYLOAD =", payload);

    try {
      await axios.post("/api/attendance/mark", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Attendance saved successfully!");
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err);
      alert("Failed to save attendance.");
    }
  };

  /* 
       SUMMARY COUNTS
  */
  const presentCount = students.filter((s) => s.status === "Present").length;
  const absentCount = students.filter((s) => s.status === "Absent").length;
  const lateCount = students.filter((s) => s.status === "Late").length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">
          📋 Attendance Management
          {subjectName && (
            <span className="text-sm ml-3 bg-white/20 px-2 py-1 rounded">
              Subject: {subjectName}
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          {/* DATE PICKER */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border px-3 py-2 rounded-lg text-black shadow"
          />

          {/* CLASS SELECT */}
          <select
            value={selectedClass}
            onChange={(e) => loadStudents(e.target.value)}
            className="border px-3 py-2 rounded-lg text-black shadow"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_name} ({c.section})
              </option>
            ))}
          </select>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-white text-blue-600 rounded-lg font-semibold shadow hover:bg-gray-100"
          >
            Save Attendance
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard
          icon={<FiCheckCircle />}
          label="Present"
          value={presentCount}
          color="green"
        />
        <SummaryCard
          icon={<FiXCircle />}
          label="Absent"
          value={absentCount}
          color="red"
        />
        <SummaryCard
          icon={<FiClock />}
          label="Late"
          value={lateCount}
          color="yellow"
        />
      </div>

      {/* TABLE */}
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
                    onChange={(e) =>
                      handleStatusChange(s.id, e.target.value)
                    }
                    className="border px-3 py-1 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
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

function SummaryCard({ icon, label, value, color }) {
  const bg = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
  }[color];

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl shadow ${bg}`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
