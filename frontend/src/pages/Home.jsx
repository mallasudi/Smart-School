import { useState } from "react";
import { useNavigate } from "react-router-dom";
import About from "../components/About";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Elearning from "../components/Elearning";
import Faqs from "../components/Faqs";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";

import { api } from "../lib/api";

export default function Home() {
  const [openLogin, setOpenLogin] = useState(false);
  const navigate = useNavigate();

  // called by LoginModal -> onSubmit(email, password)
  const handleLogin = async (email, password) => {
    try {
      const { token, user } = await api("/auth/login", {
        method: "POST",
        body: { usernameOrEmail: email, password }
      });

      // store auth
      localStorage.setItem("token", token);
      localStorage.setItem("me", JSON.stringify(user));

      // role-based redirect
      const r = user.role;
      if (r === "admin") navigate("/admin");
      else if (r === "teacher") navigate("/teacher");
      else if (r === "parent") navigate("/parent");
      else navigate("/student");
    } catch (e) {
      alert(e.message);
    } finally {
      setOpenLogin(false);
    }
  };

  return (
    <>
      <Navbar onLogin={() => setOpenLogin(true)} />
      <Hero />
      <About />
      <Features />
      <Elearning />
      <Faqs />
      <Contact />
      <Footer />

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onSubmit={handleLogin}
      />
    </>
  );
}
