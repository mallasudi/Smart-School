// frontend/src/components/LoginModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const navigate = useNavigate();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(email, password);

    if (!result.success) {
      alert(result.message);
      return;
    }

    const role = (result.role || "").toLowerCase();

    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "teacher") navigate("/teacher/dashboard");
    else if (role === "student") navigate("/student/dashboard");
    else if (role === "parent") navigate("/parent/dashboard");
    else alert("Unknown role!");

    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 w-full max-w-md rounded-2xl shadow-xl p-[2px] bg-gradient-to-r from-orange-400 via-blue-400 to-cyan-500"
          >
            <div className="bg-white rounded-2xl p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-orange-500 to-blue-600 text-transparent bg-clip-text">
                Login to Smart School
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-orange-400 hover:to-blue-500 transition-transform transform hover:scale-[1.02]"
                >
                  Login
                </button>
              </form>

              <div className="text-right text-sm mt-2">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 underline hover:text-blue-800"
                  onClick={onClose}
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="text-center text-sm mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register-parent"
                  className="text-orange-600 underline hover:text-orange-800"
                  onClick={onClose}
                >
                  Register as Parent
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
