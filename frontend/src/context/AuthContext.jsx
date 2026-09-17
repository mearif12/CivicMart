import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("civicmart_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("civicmart_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const res = await api.post("/api/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    localStorage.setItem("civicmart_token", res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(payload) {
    await api.post("/api/auth/register", payload);
    return login(payload.email, payload.password);
  }

  function logout() {
    localStorage.removeItem("civicmart_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
