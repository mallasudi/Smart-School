import { useState } from "react"
import { motion } from "framer-motion"
import { FiUser, FiLock, FiMoon, FiBell } from "react-icons/fi"
import { useTheme } from "./ThemeContext";

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@smartschool.com",
    role: "Administrator",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
  });

  const handleProfileSave = () => {
    alert(`Profile updated: ${profile.name}, ${profile.email}`);
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      alert("Please fill all fields");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      alert("Passwords do not match");
      return;
    }
    alert("Password changed successfully!");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Settings
      </h1>

      {/* Profile Settings */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-slate-800 dark:text-gray-200 p-6 rounded-xl shadow-soft space-y-4"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiUser /> Profile
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Full Name"
            className="border px-3 py-2 rounded w-full dark:bg-slate-700 dark:border-slate-600"
          />
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Email"
            className="border px-3 py-2 rounded w-full dark:bg-slate-700 dark:border-slate-600"
          />
          <input
            type="text"
            value={profile.role}
            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            placeholder="Role"
            className="border px-3 py-2 rounded w-full dark:bg-slate-700 dark:border-slate-600"
          />
        </div>
        <button
          onClick={handleProfileSave}
          className="btn btn-primary"
        >
          Save Profile
        </button>
      </motion.div>

      {/* Password Change */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-slate-800 dark:text-gray-200 p-6 rounded-xl shadow-soft space-y-4"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiLock /> Change Password
        </h2>
        <div className="space-y-3">
          <input
            type="password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords({ ...passwords, current: e.target.value })
            }
            placeholder="Current Password"
            className="border px-3 py-2 rounded w-full dark:bg-slate-700 dark:border-slate-600"
          />
          <input
            type="password"
            value={passwords.newPass}
            onChange={(e) =>
              setPasswords({ ...passwords, newPass: e.target.value })
            }
            placeholder="New Password"
            className="border px-3 py-2 rounded w-full dark:bg-slate-700 dark:border-slate-600"
          />
          <input
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
            placeholder="Confirm New Password"
            className="border px-3 py-2 rounded w-full dark:bg-slate-700 dark:border-slate-600"
          />
        </div>
        <button
          onClick={handlePasswordChange}
          className="btn bg-gradient-to-r from-green-500 to-emerald-600 text-white"
        >
          Update Password
        </button>
      </motion.div>

      {/* Preferences */}
      <div className="p-6 space-y-6 bg-white dark:bg-slate-800 dark:text-gray-200 rounded-xl shadow-soft">
        <h2 className="text-xl font-semibold">Preferences</h2>

        {/* Dark Mode */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
            className="h-4 w-4 accent-blue-600"
          />
          <FiMoon /> Dark Mode
        </label>

        {/* Notifications */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.notifications}
            onChange={(e) =>
              setPreferences({ ...preferences, notifications: e.target.checked })
            }
            className="h-4 w-4 accent-blue-600"
          />
          <FiBell /> Notifications
        </label>
      </div>
    </div>
  );
}
