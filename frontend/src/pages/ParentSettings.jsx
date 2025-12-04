// frontend/src/pages/ParentSettings.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSave,
  FiUser,
  FiMail,
  FiLock,
  FiCamera,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function ParentSettings() {
  const { token, user } = useAuth();

  // -------- PROFILE STATE (matches DB) --------
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: user?.email || "",
    phone: "",
    address: "",
    photo: null, // local-only (not sent to backend)
  });

  // -------- PASSWORD STATE --------
  const [pwd, setPwd] = useState({ current: "", newp: "", confirm: "" });

  const [saved, setSaved] = useState(false);
  const [pwdChanged, setPwdChanged] = useState(false);

  // ============================================
  // LOAD PARENT PROFILE FROM BACKEND
  // ============================================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:4000/api/parent/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to load parent profile:", data.message);
          return;
        }

        const p = data.profile || {};
        setProfile((prev) => ({
          ...prev,
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          email: p.email || user?.email || "",
          phone: p.phone || "",
          address: p.address || "",
        }));
      } catch (err) {
        console.error("Parent profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [token, user]);

  // ============================================
  // SAVE PROFILE TO BACKEND
  // ============================================
  const saveProfile = async () => {
    if (!token) {
      alert("Not authenticated");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/parent/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update profile");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      console.error("Parent profile update error:", err);
      alert("Something went wrong while saving.");
    }
  };

  // ============================================
  // CHANGE PASSWORD VIA BACKEND
  // ============================================
  const changePass = async () => {
    if (!pwd.current || !pwd.newp || !pwd.confirm) {
      alert("Please fill in all password fields.");
      return;
    }
    if (pwd.newp !== pwd.confirm) {
      alert("New passwords do not match. Try again.");
      return;
    }

    if (!token) {
      alert("Not authenticated");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:4000/api/parent/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: pwd.current,
            newPassword: pwd.newp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update password");
        return;
      }

      setPwdChanged(true);
      setTimeout(() => setPwdChanged(false), 1800);
      setPwd({ current: "", newp: "", confirm: "" });
    } catch (err) {
      console.error("Parent change password error:", err);
      alert("Something went wrong while changing password.");
    }
  };

  // ============================================
  // LOCAL PHOTO PREVIEW (NOT STORED IN DB)
  // ============================================
  const updatePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, photo: preview }));
    }
  };

  return (
    <div className="grid xl:grid-cols-2 gap-6">
      {/* Profile Section */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-5 ring-1 ring-slate-100 dark:ring-slate-700"
      >
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <FiUser className="text-cyan-500" /> Profile Settings
        </h3>

        {/* Profile Photo */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-500">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <FiUser size={32} />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1 rounded-full cursor-pointer hover:bg-cyan-600">
              <FiCamera size={14} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={updatePhoto}
              />
            </label>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Upload or change your profile picture
          </div>
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          {/* First & Last Name */}
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-slate-500 dark:text-slate-300">
                First Name
              </span>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <FiUser />
                </span>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, first_name: e.target.value }))
                  }
                  className="w-full border rounded-lg pl-9 pr-3 py-2 mt-1 dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-500 dark:text-slate-300">
                Last Name
              </span>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <FiUser />
                </span>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, last_name: e.target.value }))
                  }
                  className="w-full border rounded-lg pl-9 pr-3 py-2 mt-1 dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            </label>
          </div>

          {/* Email (read-only) */}
          <label className="block">
            <span className="text-sm text-slate-500 dark:text-slate-300">
              Email
            </span>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <FiMail />
              </span>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full border rounded-lg pl-9 pr-3 py-2 mt-1 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 cursor-not-allowed"
              />
            </div>
          </label>

          {/* Phone */}
          <label className="block">
            <span className="text-sm text-slate-500 dark:text-slate-300">
              Phone
            </span>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <FiLock />
              </span>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full border rounded-lg pl-9 pr-3 py-2 mt-1 dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
          </label>

          {/* Address */}
          <label className="block">
            <span className="text-sm text-slate-500 dark:text-slate-300">
              Address
            </span>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <FiUser />
              </span>
              <input
                type="text"
                value={profile.address}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, address: e.target.value }))
                }
                className="w-full border rounded-lg pl-9 pr-3 py-2 mt-1 dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
          </label>
        </div>

        <button
          onClick={saveProfile}
          className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition"
        >
          <FiSave /> Save Changes
        </button>

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-600/15 dark:text-emerald-300 dark:border-emerald-700/50"
            >
              <FiCheckCircle /> Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Password Section */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-5 ring-1 ring-slate-100 dark:ring-slate-700"
      >
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <FiLock className="text-blue-500" /> Change Password
        </h3>

        <div className="space-y-4">
          {[
            { key: "current", label: "Current Password" },
            { key: "newp", label: "New Password" },
            { key: "confirm", label: "Confirm New Password" },
          ].map((f) => (
            <label key={f.key} className="block">
              <span className="text-sm text-slate-500 dark:text-slate-300">
                {f.label}
              </span>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={pwd[f.key]}
                  onChange={(e) =>
                    setPwd((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className="w-full border rounded-lg pl-9 pr-3 py-2 mt-1 dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            </label>
          ))}

          <button
            onClick={changePass}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90 transition"
          >
            <FiSave /> Update Password
          </button>

          <AnimatePresence>
            {pwdChanged && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-600/15 dark:text-emerald-300 dark:border-emerald-700/50"
              >
                <FiCheckCircle /> Password updated successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
