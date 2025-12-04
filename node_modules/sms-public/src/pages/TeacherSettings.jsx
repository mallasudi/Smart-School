// FIXED TeacherSettings.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiMoon, FiBell } from "react-icons/fi";
import { useTheme } from "./ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function TeacherSettings() {
  const { token, user } = useAuth();

  const { darkMode, toggleDarkMode } =
    (typeof useTheme === "function" && useTheme()) || {
      darkMode: false,
      toggleDarkMode: () =>
        document.documentElement.classList.toggle("dark"),
    };

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
    phone: "",
    address: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirm: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch("http://localhost:4000/api/teacher/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) return;

      setProfile(data.profile);
    };

    loadProfile();
  }, [token]);

  const saveProfile = async () => {
    const res = await fetch("http://localhost:4000/api/teacher/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profile)
    });

    const data = await res.json();
    alert(data.message);
  };

  const updatePassword = async () => {
    if (passwords.newPassword !== passwords.confirm)
      return alert("New passwords do not match");

    const res = await fetch("http://localhost:4000/api/teacher/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      })
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="space-y-8">
      {/* PROFILE */}
      <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiUser /> Profile
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="First Name"
            value={profile.first_name}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            placeholder="Last Name"
            value={profile.last_name}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            value={profile.email}
            readOnly
            className="border p-2 rounded bg-gray-100"
          />

          <input
            placeholder="Subject"
            value={profile.subject}
            onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            placeholder="Phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            placeholder="Address"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="border p-2 rounded md:col-span-2"
          />
        </div>

        <button
          onClick={saveProfile}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Profile
        </button>
      </motion.div>

      {/* PASSWORD */}
      <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiLock /> Change Password
        </h2>

        <div className="space-y-3">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Current Password"
            value={passwords.oldPassword}
            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            type="password"
            autoComplete="new-password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm New Password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            className="border p-2 rounded"
          />

          <button
            onClick={updatePassword}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
          >
            Update Password
          </button>
        </div>
      </motion.div>
    </div>
  );
}
