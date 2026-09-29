import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1/',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        'http://localhost:8000/api/v1/auth/refresh/',
        { refresh }
      );
      localStorage.setItem('access', data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default api;
