import axios from 'axios';

const pluginApi = axios.create({
  baseURL: '/api/v1/p/movie-request',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Retrieve auth token from the host ADMINCHAT Panel app.
 *
 * The panel stores its JWT in a Zustand persist store under the key
 * 'auth-storage'. We also check 'access_token' as a direct-storage
 * fallback so the plugin keeps working if the host app changes its
 * persistence strategy.
 *
 * TODO: Once the Plugin SDK ships a `getAuthToken()` helper, replace
 * this function with the SDK-provided solution.
 */
function getAuthToken(): string | null {
  try {
    // Primary: Zustand persist store (ADMINCHAT Panel pattern)
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = authData?.state?.token;
    if (token) return token;
  } catch {
    // ignore parse errors
  }

  try {
    // Fallback: direct token storage
    const token = localStorage.getItem('access_token');
    if (token) return token;
  } catch {
    // ignore errors
  }

  return null;
}

// Attach auth token from parent app's localStorage
pluginApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default pluginApi;
