import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setMessage("Passwords do not match.")
    }

    try {
      const res = await fetch(`http://localhost:4000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()
      if (!res.ok) {
        return setMessage(data.message || "Reset failed.")
      }

      alert("Password reset successful! You can now login.")
      navigate("/")
    } catch (err) {
      console.error("Reset error:", err)
      setMessage("Something went wrong.")
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/src/assets/background-school.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-0"></div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 card z-10"
      >
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h1>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-accent focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-accent focus:outline-none"
              required
            />
          </div>

          <button type="submit" className="w-full btn btn-primary">Reset Password</button>

          {message && (
            <p className="text-sm text-white mt-4 text-center">{message}</p>
          )}
        </form>
      </motion.div>
    </div>
  )
}
