// Configuration for React frontend
export const CONFIG = {
  API_BASE_URL: import.meta.env.DEV ? '' : '', // Use Vite proxy for dev mode
  SOCKET_URL: import.meta.env.DEV ? '' : '', // Use Vite proxy for dev mode
  GAME_URL: '/game', // React-based game route
  REACT_GAME_URL: '/game', // React-based game route
  DEBUG: import.meta.env.DEV,
};

export const ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register', 
  GUEST: '/guest',
  ME: '/me',
  LOGOUT: '/logout',
  GUEST_NAME: '/api/guest-name',
  QUESTS: '/quests',
  QUESTS_UPDATE: '/quests/update',
};
