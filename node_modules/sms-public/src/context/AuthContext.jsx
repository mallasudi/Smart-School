// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  /* ======================================
     LOAD TOKEN + USER FROM LOCALSTORAGE 
     (ENSURE THEY NEVER BECOME EMPTY)
  ======================================= */
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem("token");
    return saved && saved !== "undefined" ? saved : null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });

  /* ---------------------------------------
      KEEP LOCALSTORAGE IN SYNC ALWAYS
  ---------------------------------------- */
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  /* ======================================
     LOGIN (works for all roles)
  ======================================= */
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Login failed" };
      }

      // Save token + user correctly
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return {
        success: true,
        role: (data.role || data.user.role).toLowerCase(),
        user: data.user,
      };
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      return { success: false, message: "Something went wrong" };
    }
  };

  /* ======================================
     LOGOUT
  ======================================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
