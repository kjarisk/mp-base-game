// API utilities
import { CONFIG, ENDPOINTS } from './config';

export async function apiRequest(endpoint, options = {}) {
  const url = CONFIG.API_BASE_URL + endpoint;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for session cookies
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = await response.text() || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export async function login(username, password) {
  return apiRequest(ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username, password) {
  return apiRequest(ENDPOINTS.REGISTER, {
    method: 'POST', 
    body: JSON.stringify({ username, password }),
  });
}

export async function loginAsGuest() {
  // Get available guest name from server
  const data = await apiRequest(ENDPOINTS.GUEST_NAME);
  
  if (data.success) {
    return apiRequest(ENDPOINTS.GUEST, {
      method: 'POST',
      body: JSON.stringify({ username: data.guestName }),
    });
  } else {
    throw new Error('Unable to get guest name');
  }
}

export async function getCurrentUser() {
  try {
    return await apiRequest(ENDPOINTS.ME);
  } catch (error) {
    return null; // User not logged in
  }
}

export async function logout() {
  return apiRequest(ENDPOINTS.LOGOUT, {
    method: 'POST',
  });
}
