// axiosInstance.js
import axios from "axios";
import { adminToken } from "./localStorageKeys";
const baseUrlExport = "http://localhost:5001/api/v1/web";
const ngrokurl = "https://4fc1-103-211-15-65.ngrok-free.app/api/v1/web";

const instance = axios.create({
  baseURL: baseUrlExport,
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    IDENTIFIER: "A2hG9tE4rB6kY1sN",
    "ngrok-skip-browser-warning": "123",
    // You can add more default headers here if needed
  },
  withCredentials: true,
});

// Add an interceptor to set the Authorization header before each request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(adminToken);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

export default instance;
