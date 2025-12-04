import { useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:4000/api/auth/forgot-password", { email })
      setMessage(res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.")
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
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Forgot Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Enter your email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-accent focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
          <button type="submit" className="w-full btn btn-primary">Send Reset Link</button>
        </form>

        {message && (
          <p className="text-sm text-white mt-4 text-center">{message}</p>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-white underline text-sm hover:text-accent">Back to Login</Link>
        </div>
      </motion.div>
    </div>
  )
}
