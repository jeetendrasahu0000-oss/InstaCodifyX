import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Request Interceptor (Attach Token Safely)
API.interceptors.request.use(
  (req) => {
    try {
      const info = JSON.parse(localStorage.getItem("adminInfo"));

      if (info?.token) {
        req.headers.Authorization = `Bearer ${info.token}`;
      }
    } catch (err) {
      console.log("❌ Error parsing adminInfo:", err);
      localStorage.removeItem("adminInfo");
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response Interceptor (Handle 401 Properly)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.log("❌ Unauthorized - Token expired or invalid");

      // 🔥 Clear invalid token
      localStorage.removeItem("adminInfo");

      // 🔥 Prevent infinite redirect loop
      const currentPath = window.location.pathname;

      if (!currentPath.includes("/login")) {
        if (currentPath.startsWith("/admin")) {
          window.location.replace("/admin/login");
        } else {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────
export const loginAdminAPI = (data) =>
  API.post("/admin/login", data);

export const registerAdminAPI = (data) =>
  API.post("/admin/register", data);

// ── Problems ─────────────────────────────────────
export const getAllProblemsAPI = () =>
  API.get("/problems");

export const createProblemAPI = (data) =>
  API.post("/problems", data);

export const updateProblemAPI = (id, data) =>
  API.put(`/problems/${id}`, data);

export const deleteProblemAPI = (id) =>
  API.delete(`/problems/${id}`);

export const togglePublishAPI = (id) =>
  API.patch(`/problems/${id}/publish`);

// ── Setter Requests ──────────────────────────────
export const submitSetterRequestAPI = (data) =>
  API.post("/setter-requests", data);

export const getAllSetterRequestsAPI = () =>
  API.get("/setter-requests");

export const approveSetterRequestAPI = (id) =>
  API.patch(`/setter-requests/${id}/approve`);

export const rejectSetterRequestAPI = (id) =>
  API.patch(`/setter-requests/${id}/reject`);

export const getAllSettersAPI = () =>
  API.get("/admin/setters");

export const deleteSetterAPI = (id) =>
  API.delete(`/admin/setters/${id}`);

// ── HR Interview (IMPORTANT - tumhara issue yahi tha) ─────────
export const getHrQuestionsAPI = (experience) =>
  API.get(`/hr/questions?experience=${experience}`);

export const addHrQuestionAPI = (data) =>
  API.post("/hr/add-question", data);

export default API;