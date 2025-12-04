import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo-source.png";

export default function Navbar({ onLogin }) {
  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 🔥 smooth scrolling
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-animated text-white border-b border-secondary/40">
      <div className="container-max h-16 flex items-center justify-between">
        
        {/* Logo + Title */}
        <button onClick={scrollToTop} className="flex items-center gap-2">
          <motion.img
            src={logo}
            alt="Smart School"
            className="h-12 w-12"   // logo size
            initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
          />
          <span className="font-semibold tracking-tight text-white">
            Smart School
          </span>
        </button>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            ["About", "#about"],
            ["Features", "#features"],
            ["E-Learning", "#elearn"],
            ["FAQs", "#faqs"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="transition hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-emerald-300"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Login Button */}
        <button onClick={onLogin} className="btn btn-primary">
          Login
        </button>
      </div>
    </header>
  );
}
