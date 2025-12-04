// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.svg";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Call global login()
    const result = await login(email, password);
    setLoading(false);

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
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <img src={logo} alt="Smart School" className="h-10 w-10" />
        <span className="font-bold text-white text-xl">Smart School</span>
      </Link>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/30 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Login to Smart School
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-transform transform hover:scale-105 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-orange-400 hover:to-blue-500"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-right mt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-white underline hover:text-cyan-300"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="text-center mt-6">
          <span className="text-white/80 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/register-parent"
              className="text-cyan-300 font-semibold underline hover:text-white"
            >
              Register as Parent
            </Link>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
