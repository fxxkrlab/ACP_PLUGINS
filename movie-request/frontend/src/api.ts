import axios from 'axios';

const pluginApi = axios.create({
  baseURL: '/api/v1/p/movie-request',
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token from parent app's localStorage
pluginApi.interceptors.request.use((config) => {
  try {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = authData?.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

export default pluginApi;
