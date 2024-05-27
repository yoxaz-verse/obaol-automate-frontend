import axios from "axios";
import { currentUserToken } from "./localStorageKeys";
import Cookies from "js-cookie";

export const baseUrlExport = "http://localhost:5000/api/v1";

const instance = axios.create({
  baseURL: baseUrlExport,
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // "IDENTIFIER": "A2hG9tE4rB6kY1sN"
    // You can add more default headers here if needed
  },
});

// Add an interceptor to set the Authorization header before each request
instance.interceptors.request.use(
  (config) => {
    const currentUser = localStorage.getItem("currentUserToken");
    const token = currentUser;
    // token = localStorage.getItem(currentUser as string)
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

// axiosInstance.js
// import axios from "axios";
// import { currentUserToken } from "./localStorageKeys";
// const instance = axios.create({
//   baseURL: `http://localhost:5000`, // Replace this with your API base URL
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     "Sec-Fetch-Mode": "cors",
//   },
// });

// // Add an interceptor to set the Authorization header before each request
// instance.interceptors.request.use(
//   (config) => {
//     const currentUser = localStorage.getItem(currentUserToken);
//     const token = localStorage.getItem(currentUser as string)
//     if (token) {
//       config.headers["Authorization"] = `${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default instance;
