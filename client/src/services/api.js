import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ascii_studio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Normalizes backend error responses into a single readable message
 * so components don't need to know the API's error shape.
 */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message
    || error?.message
    || 'Something went wrong. Please try again.'
  );
}

export default api;
