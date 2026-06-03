import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data: object) => api.put("/auth/profile", data),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productApi = {
  getAll: (params?: object) => api.get("/products", { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: object) => api.post("/products", data),
  update: (id: string, data: object) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getCategories: () => api.get("/products/categories"),
};

// ── Quotations ────────────────────────────────────────────────────────────────
export const quotationApi = {
  getAll: (params?: object) => api.get("/quotations", { params }),
  create: (data: object) => api.post("/quotations", data),
  update: (id: string, data: object) => api.patch(`/quotations/${id}`, data),
  convert: (id: string) => api.post(`/quotations/${id}/convert`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  getAll: (params?: object) => api.get("/orders", { params }),
  create: (data: object) => api.post("/orders", data),
  updateStatus: (id: string, data: object) => api.patch(`/orders/${id}/status`, data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers: () => api.get("/admin/users"),
  updateUser: (id: string, data: object) => api.patch(`/admin/users/${id}`, data),
  getAnalytics: () => api.get("/admin/analytics"),
  getInventory: () => api.get("/admin/inventory"),
};
