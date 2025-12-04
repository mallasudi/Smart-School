// src/pages/StudentSettings.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSettings, FiBell, FiMoon, FiLock } from "react-icons/fi";
import { useTheme } from "./ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function StudentSettings() {
  const { darkMode, toggleDarkMode } =
    useTheme?.() ?? {
      darkMode: false,
      toggleDarkMode: () =>
        document.documentElement.classList.toggle("dark"),
    };

  const { token, user } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: user?.email || "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
  });

  const [notif, setNotif] = useState(true);

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/student/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) return;

        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || user?.email || "",
          dob: data.dob || "",
          gender: data.gender || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [token]);

  /* ---------------- SAVE PROFILE ---------------- */
  const save = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          dob: form.dob,
          gender: form.gender,
          phone: form.phone,
          address: form.address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update");
        return;
      }

      alert("Profile updated successfully!");
    } catch {
      alert("Something went wrong");
    }
  };

  /* ======================================================
      🔐 PASSWORD CHANGE SECTION
  ====================================================== */
  const [pw, setPw] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const changePassword = async (e) => {
    e.preventDefault();

    if (!pw.oldPassword || !pw.newPassword || !pw.confirmPassword) {
      alert("All password fields are required");
      return;
    }

    if (pw.newPassword !== pw.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: pw.oldPassword,
          newPassword: pw.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Password change failed");
        return;
      }

      alert("Password changed successfully!");
      setPw({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert("Something went wrong changing password");
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------------- PROFILE ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center">
            <FiSettings />
          </span>
          <h3 className="font-semibold">Settings</h3>
        </div>

        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">First Name</label>
            <input
              className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Last Name</label>
            <input
              className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
              value={form.email}
              readOnly
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-500">DOB</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm text-gray-500">Gender</label>
              <select
                className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <input
              className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-500">Address</label>
            <input
              className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button className="px-4 py-2 rounded bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>

      {/* ---------------- PASSWORD CHANGE ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow p-5"
      >
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <FiLock /> Change Password
        </h4>

        <form onSubmit={changePassword} className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
              value={pw.oldPassword}
              onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Confirm Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
              value={pw.confirmPassword}
              onChange={(e) =>
                setPw({ ...pw, confirmPassword: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button className="px-4 py-2 rounded bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              Update Password
            </button>
          </div>
        </form>
      </motion.div>

      {/* ---------------- PREFERENCES ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow p-5"
      >
        <h4 className="font-semibold mb-3">Preferences</h4>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <FiMoon /> Dark mode
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notif}
              onChange={(e) => setNotif(e.target.checked)}
            />
            <FiBell /> Notifications
          </label>
        </div>
      </motion.div>
    </div>
  );
}
