// src/pages/ParentRegister.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/background-school.png";

export default function ParentRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    linkedStudentId: "",
    dob: "", // YYYY-MM-DD from date input
  });

  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentError, setStudentError] = useState("");

  // --------------------------------------------
  // HANDLE CHANGE
  // --------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "linkedStudentId") {
      fetchStudent(value);
    }
  };

  // --------------------------------------------
  // LIVE STUDENT LOOKUP
  // --------------------------------------------
  const fetchStudent = async (id) => {
    if (!id) {
      setStudentInfo(null);
      setStudentError("");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/student/check/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setStudentInfo(null);
        setStudentError("Student not found");
      } else {
        setStudentInfo(data.student);
        setStudentError("");
      }
    } catch (err) {
      console.error("Fetch student error:", err);
      setStudentError("Error fetching student");
      setStudentInfo(null);
    }
  };

  // --------------------------------------------
  // SUBMIT REGISTRATION
  // --------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // convert DOB to YYYY-MM-DD (matches DB)
      const dobISO =
        form.dob && !isNaN(Date.parse(form.dob))
          ? new Date(form.dob).toISOString().split("T")[0]
          : "";

      const payload = {
        ...form,
        dob: dobISO,
      };

      const res = await fetch(
        "http://localhost:4000/api/auth/register-parent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Parent registered successfully!");
      navigate("/");
    } catch (err) {
      console.error("Parent register error:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      {/* FORM */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl text-white">
        <h1 className="text-2xl font-bold text-center mb-6">
          Parent Registration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student ID + DOB (for linking) */}
          <input
            name="linkedStudentId"
            type="number"
            placeholder="Student ID to Link"
            value={form.linkedStudentId}
            onChange={handleChange}
            className="w-full p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
            required
          />

          <input
            name="dob"
            type="date"
            placeholder="Student Date of Birth"
            value={form.dob}
            onChange={handleChange}
            className="w-full p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
            required
          />

          {/* Lookup status */}
          {studentError && (
            <p className="text-red-300 text-sm">{studentError}</p>
          )}

          {studentInfo && (
            <div className="p-3 bg-white/15 rounded-lg text-white text-sm">
              <p>
                <b>Name:</b> {studentInfo.first_name} {studentInfo.last_name}
              </p>
              {studentInfo.gender && (
                <p>
                  <b>Gender:</b> {studentInfo.gender}
                </p>
              )}
              <p>
                <b>Phone:</b> {studentInfo.phone || "N/A"}
              </p>
            </div>
          )}

          {/* Account fields */}
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
            required
          />

          <div className="flex gap-3">
            <input
              name="first_name"
              type="text"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="w-1/2 p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
              required
            />

            <input
              name="last_name"
              type="text"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="w-1/2 p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
              required
            />
          </div>

          <input
            name="phone"
            type="text"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
            required
          />

          <input
            name="address"
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="w-full p-3 bg-white/20 rounded-lg placeholder-white/70 text-white"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-white/80 mt-4 text-sm">
          Already have an account?
          <Link to="/" className="underline ml-1">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
