// src/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// axios instance that includes Authorization header automatically if token present
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
}, (error) => Promise.reject(error));

export const summarizeText = async (text) => {
  try {
    const response = await api.post("/summarize/text", { text });
    return response.data.summary;
  } catch (err) {
    console.error("summarizeText error:", err);
    throw err;
  }
};

export const summarizePDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/summarize/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.summary;
  } catch (err) {
    console.error("summarizePDF error:", err);
    throw err;
  }
};

export default api;
