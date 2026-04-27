import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskly_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerUser = (userData) => API.post("/auth/register", userData);

export const loginUser = (userData) => API.post("/auth/login", userData);

export const getMe = () => API.get("/auth/me");

export const getTasks = () => API.get("/tasks");

export const createTask = (taskData) => API.post("/tasks", taskData);

export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData);

export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export const toggleTaskStatus = (id) => API.patch(`/tasks/${id}/status`,{});