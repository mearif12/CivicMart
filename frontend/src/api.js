import axios from "axios";

// Reads the backend URL from the environment (see .env.example).
// Falls back to localhost for local development.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_URL });

// Attach the saved JWT (if any) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("civicmart_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
