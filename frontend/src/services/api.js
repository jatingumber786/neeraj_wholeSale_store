import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wholesale_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  googleLogin: (data) => api.post('/auth/google', data),
  phoneLogin: (data) => api.post('/auth/phone', data),
  dealerLogin: (data) => api.post('/auth/dealer-login', data),
  getMe: () => api.get('/auth/me'),
  addAddress: (addressData) => api.post('/auth/address', addressData)
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.patch(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

export const orderService = {
  placeOrder: (orderData) => api.post('/orders', orderData),
  getTodayOrders: () => api.get('/orders/today'),
  getMyOrders: (phone) => api.get('/orders/my-orders', { params: { phone } }),
  getStats: () => api.get('/orders/stats')
};

export const sheetService = {
  getInfo: () => api.get('/sheets/info'),
  testConnection: () => api.post('/sheets/test')
};

export default api;
