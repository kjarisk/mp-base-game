import { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getCurrentUser, login, register, loginAsGuest, logout } from '../api';
import { CONFIG } from '../config';

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER',
  SET_PAGE: 'SET_PAGE',
  SET_GAMES: 'SET_GAMES',
  SET_SOCKET: 'SET_SOCKET',
  SET_GAME_PARAMS: 'SET_GAME_PARAMS',
  SET_GAME_MODE: 'SET_GAME_MODE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT'
};

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
  currentPage: 'login',
  games: [],
  socket: null,
  gameParams: null,
  gameMode: null // 'single' or 'multi'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.SET_PAGE:
      return { ...state, currentPage: action.payload };
    case ACTIONS.SET_GAMES:
      return { ...state, games: action.payload };
    case ACTIONS.SET_SOCKET:
      return { ...state, socket: action.payload };
    case ACTIONS.SET_GAME_PARAMS:
      return { ...state, gameParams: action.payload };
    case ACTIONS.SET_GAME_MODE:
      return { ...state, gameMode: action.payload };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTIONS.LOGOUT:
      return { ...state, user: null, currentPage: 'login', gameMode: null };
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Initialize socket when user is authenticated and in multiplayer mode
  useEffect(() => {
    if (state.user && !state.socket && state.gameMode === 'multi') {
      const socketInstance = io(CONFIG.SOCKET_URL);
      dispatch({ type: ACTIONS.SET_SOCKET, payload: socketInstance });

      // Listen for games list updates
      socketInstance.on('gamesList', (gamesList) => {
        dispatch({ type: ACTIONS.SET_GAMES, payload: gamesList });
      });

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [state.user, state.socket, state.gameMode]);

  // App initialization
  const initializeApp = async () => {
    try {
      const user = await getCurrentUser();
      dispatch({ type: ACTIONS.SET_USER, payload: user });
      
      if (user) {
        handleRouting(user);
      } else {
        dispatch({ type: ACTIONS.SET_PAGE, payload: 'login' });
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_USER, payload: null });
      dispatch({ type: ACTIONS.SET_PAGE, payload: 'login' });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Handle routing logic
  const handleRouting = (user) => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (user) {
      if (path === '/mode-select') {
        dispatch({ type: ACTIONS.SET_PAGE, payload: 'mode-select' });
      } else if (path === '/lobby') {
        dispatch({ type: ACTIONS.SET_GAME_MODE, payload: 'multi' });
        dispatch({ type: ACTIONS.SET_PAGE, payload: 'lobby' });
      } else if (path === '/single-player') {
        dispatch({ type: ACTIONS.SET_GAME_MODE, payload: 'single' });
        dispatch({ type: ACTIONS.SET_PAGE, payload: 'single-player' });
      } else if (path === '/achievements') {
        dispatch({ type: ACTIONS.SET_PAGE, payload: 'achievements' });
      } else if (path === '/game') {
        const gameId = urlParams.get('gameId');
        const gameName = urlParams.get('gameName');
        
        if (gameId) {
          dispatch({ type: ACTIONS.SET_GAME_MODE, payload: 'multi' });
          dispatch({ type: ACTIONS.SET_GAME_PARAMS, payload: { gameId, gameName } });
          dispatch({ type: ACTIONS.SET_PAGE, payload: 'game' });
        } else {
          navigateTo('/mode-select');
        }
      } else {
        // Default: go to mode select
        navigateTo('/mode-select');
      }
    } else {
      dispatch({ type: ACTIONS.SET_PAGE, payload: 'login' });
      if (path !== '/') {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Navigation helper
  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    
    if (path === '/mode-select') {
      dispatch({ type: ACTIONS.SET_GAME_PARAMS, payload: null });
      dispatch({ type: ACTIONS.SET_PAGE, payload: 'mode-select' });
    } else if (path === '/lobby') {
      dispatch({ type: ACTIONS.SET_GAME_PARAMS, payload: null });
      dispatch({ type: ACTIONS.SET_PAGE, payload: 'lobby' });
    } else if (path === '/single-player') {
      dispatch({ type: ACTIONS.SET_GAME_PARAMS, payload: null });
      dispatch({ type: ACTIONS.SET_PAGE, payload: 'single-player' });
    } else if (path === '/achievements') {
      dispatch({ type: ACTIONS.SET_GAME_PARAMS, payload: null });
      dispatch({ type: ACTIONS.SET_PAGE, payload: 'achievements' });
    } else if (path === '/') {
      dispatch({ type: ACTIONS.SET_GAME_PARAMS, payload: null });
      dispatch({ type: ACTIONS.SET_PAGE, payload: 'login' });
    }
  };

  // Set game mode
  const setGameMode = (mode) => {
    dispatch({ type: ACTIONS.SET_GAME_MODE, payload: mode });
  };

  // Authentication actions
  const loginUser = async (username, password) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    
    try {
      await login(username, password);
      await initializeApp();
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const registerUser = async (username, password) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    
    try {
      await register(username, password);
      await login(username, password);
      await initializeApp();
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const loginAsGuestUser = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    
    try {
      await loginAsGuest();
      await initializeApp();
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const logoutUser = async () => {
    try {
      // Clear guest achievement data if user was a guest (no id means guest)
      if (!state.user?.id && window.AchievementManager) {
        window.AchievementManager.clearGuestData();
      }
      
      await logout();
      if (state.socket) {
        state.socket.disconnect();
      }
      dispatch({ type: ACTIONS.LOGOUT });
      dispatch({ type: ACTIONS.SET_SOCKET, payload: null });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Game actions
  const createGame = (gameName) => {
    if (!state.user || !gameName.trim()) return;
    
    const gameId = Math.random().toString(36).substring(2, 9);
    const gameParams = { gameId, gameName: gameName.trim(), createGame: true };
    
    // Set game params in context
    dispatch({ type: ACTIONS.SET_GAME_PARAMS, payload: gameParams });
    
    // Update URL and navigate to game
    const gameUrl = `/game?gameId=${gameId}&create=1&gameName=${encodeURIComponent(gameName.trim())}`;
    window.history.pushState(null, '', gameUrl);
    dispatch({ type: ACTIONS.SET_PAGE, payload: 'game' });
  };

  const joinGame = (gameId) => {
    const gameParams = { gameId };
    
    // Set game params in context
    dispatch({ type: ACTIONS.SET_GAME_PARAMS, payload: gameParams });
    
    // Update URL and navigate to game
    const gameUrl = `/game?gameId=${gameId}`;
    window.history.pushState(null, '', gameUrl);
    dispatch({ type: ACTIONS.SET_PAGE, payload: 'game' });
  };

  // Error handling
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    loginUser,
    registerUser,
    loginAsGuestUser,
    logoutUser,
    createGame,
    joinGame,
    navigateTo,
    setGameMode,
    clearError
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
