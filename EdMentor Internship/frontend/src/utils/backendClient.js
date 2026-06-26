const BASE_URL = ''; // Proxied via Vite devServer proxy configuration

export const backendClient = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body }),
  put: (url, body) => request(url, { method: 'PUT', body }),
  delete: (url) => request(url, { method: 'DELETE' })
};

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine if body is FormData (which shouldn't get Content-Type: application/json)
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  options.headers = {
    ...headers,
    ...options.headers
  };

  try {
    const response = await fetch(url, options);
    
    // Auto logout on token expiry / invalid token
    if (response.status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      return Promise.reject(new Error(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
}
