import { createContext, useContext, useReducer, useEffect } from 'react';

// Action types
const GAME_ACTIONS = {
  SET_GAME_LOADED: 'SET_GAME_LOADED',
  SET_GAME_INITIALIZED: 'SET_GAME_INITIALIZED',
  SET_GAME_ERROR: 'SET_GAME_ERROR',
  SET_LEADERBOARD_DATA: 'SET_LEADERBOARD_DATA',
  UPDATE_PLAYER_COUNT: 'UPDATE_PLAYER_COUNT',
  CLEANUP_GAME: 'CLEANUP_GAME'
};

// Initial state
const initialGameState = {
  gameLoaded: false,
  gameInitialized: false,
  gameError: null,
  leaderboardData: [],
  playerCount: 0
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.SET_GAME_LOADED:
      return { ...state, gameLoaded: action.payload };
    case GAME_ACTIONS.SET_GAME_INITIALIZED:
      return { ...state, gameInitialized: action.payload };
    case GAME_ACTIONS.SET_GAME_ERROR:
      return { ...state, gameError: action.payload };
    case GAME_ACTIONS.SET_LEADERBOARD_DATA:
      return { ...state, leaderboardData: action.payload };
    case GAME_ACTIONS.UPDATE_PLAYER_COUNT:
      return { ...state, playerCount: action.payload };
    case GAME_ACTIONS.CLEANUP_GAME:
      return { ...initialGameState };
    default:
      return state;
  }
}

// Context
const GameContext = createContext();

// Provider component
export function GameProvider({ children, gameId, gameName, createGame = false }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    // Prevent duplicate initialization in React Strict Mode
    if (gameId && !state.gameInitialized && !window.gameInitializing) {
      console.log(`🎮 GameContext useEffect triggered for gameId: ${gameId}`);
      window.gameInitializing = true; // Set flag to prevent duplicates
      initializeGame(gameId, gameName, createGame);
    }

    return () => {
      console.log(`🎮 GameContext cleanup called for gameId: ${gameId}`);
      cleanupGame();
      window.gameInitializing = false; // Reset flag on cleanup
    };
  }, [gameId, gameName, createGame]);

  // Game initialization
  const initializeGame = async (gameId, gameName, shouldCreateGame = false) => {
    try {
      console.log(`🎮 Starting game initialization for gameId: ${gameId}, gameName: ${gameName}, createGame: ${shouldCreateGame}`);
      
      // Double-check to prevent duplicate initialization
      if (window.gameController) {
        console.log('🎮 GameController already exists, skipping initialization');
        return;
      }
      
      dispatch({ type: GAME_ACTIONS.SET_GAME_ERROR, payload: null });
      
      // Load all game scripts
      await loadGameScripts();
      dispatch({ type: GAME_ACTIONS.SET_GAME_LOADED, payload: true });

      // Initialize game with parameters
      setTimeout(() => {
        // Triple-check to prevent race conditions
        if (window.gameController) {
          console.log('🎮 GameController already exists during setTimeout, skipping');
          return;
        }
        
        if (window.GameController) {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            // Store game parameters globally for vanilla JS to access
            window.gameParams = {
              gameId: gameId,
              gameName: gameName || 'Game',
              createGame: shouldCreateGame
            };
            
            console.log(`🎮 Game params set:`, window.gameParams);
            
            // Initialize game controller
            window.gameController = new window.GameController();
            window.gameController.initialize();
            dispatch({ type: GAME_ACTIONS.SET_GAME_INITIALIZED, payload: true });
            
            // Clear the initializing flag
            window.gameInitializing = false;
            
            console.log(`🎮 Game controller initialized for game: ${gameId} (${gameName})`);
          } else {
            throw new Error('Canvas element not found');
          }
        } else {
          throw new Error('GameController not loaded');
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      dispatch({ type: GAME_ACTIONS.SET_GAME_ERROR, payload: error.message });
      window.gameInitializing = false; // Reset flag on error
    }
  };

  // Load game scripts
  const loadGameScripts = async () => {
    const scripts = [
      '/js/dev-config.js',
      'https://cdn.socket.io/4.6.1/socket.io.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.2/gsap.min.js',
      '/js/classes/Enemy.js',
      '/js/classes/Player.js',
      '/js/classes/Particle.js',
      '/js/classes/Projectile.js',
      '/js/classes/Asteroid.js',
      '/js/classes/GameState.js',
      '/js/classes/UIManager.js',
      '/js/classes/SocketManager.js',
      '/js/classes/InputManager.js',
      '/js/classes/GameRenderer.js',
      '/js/classes/GameController.js',
      '/js/sanitizeHtml.js',
      '/js/frontend.js',
      '/js/eventListeners.js'
    ];

    for (const src of scripts) {
      await loadScript(src);
    }
  };

  // Helper to load individual script
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Game cleanup
  const cleanupGame = () => {
    console.log('🧹 Cleaning up game from GameContext');
    if (window.gameController) {
      window.gameController.cleanup();
    }
    delete window.gameParams;
    window.gameInitializing = false; // Reset flag
    dispatch({ type: GAME_ACTIONS.CLEANUP_GAME });
  };

  // Leaderboard update (called from vanilla JS)
  const updateLeaderboard = (data) => {
    dispatch({ type: GAME_ACTIONS.SET_LEADERBOARD_DATA, payload: data });
  };

  // Player count update
  const updatePlayerCount = (count) => {
    dispatch({ type: GAME_ACTIONS.UPDATE_PLAYER_COUNT, payload: count });
  };

  // Make functions globally available for vanilla JS to call
  useEffect(() => {
    window.updateLeaderboard = updateLeaderboard;
    window.updatePlayerCount = updatePlayerCount;

    return () => {
      delete window.updateLeaderboard;
      delete window.updatePlayerCount;
    };
  }, []);

  const value = {
    ...state,
    updateLeaderboard,
    updatePlayerCount,
    cleanupGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
