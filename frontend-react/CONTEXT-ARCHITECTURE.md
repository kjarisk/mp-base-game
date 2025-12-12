# React State Management Architecture

This project uses a clean context-based state management system to handle all data flow from backend → React → game.

## Context Structure

### `AppContext.jsx`
**Main application state management**
- User authentication (login, register, guest, logout)
- Page routing (login, lobby, game)
- Games list management
- Socket.io connection management
- Error handling

**Available throughout the app:**
- `user` - Current authenticated user
- `loading` - Global loading state
- `error` - Global error messages
- `currentPage` - Current page state
- `games` - List of available games
- `gameParams` - Current game parameters (gameId, gameName)

**Actions:**
- `loginUser(username, password)`
- `registerUser(username, password)`
- `loginAsGuestUser()`
- `logoutUser()`
- `createGame(gameName)`
- `joinGame(gameId)`
- `navigateTo(path)`
- `clearError()`

### `GameContext.jsx`
**Game-specific state management**
- Game script loading and initialization
- Game state monitoring
- Leaderboard data
- Communication bridge between React and vanilla JS

**Available in game components:**
- `gameLoaded` - Whether game scripts are loaded
- `gameInitialized` - Whether game is initialized
- `gameError` - Game-specific errors
- `leaderboardData` - Real-time leaderboard data
- `playerCount` - Current player count

**Actions:**
- `updateLeaderboard(data)` - Called from vanilla JS
- `updatePlayerCount(count)` - Called from vanilla JS
- `cleanupGame()` - Cleanup when leaving game

## Component Structure

### Clean Components (No Business Logic)

**`App.jsx`**
```jsx
// Simple component that just renders based on context state
function AppContent() {
  const { currentPage, loading } = useAppContext();
  // Just rendering logic, no business logic
}
```

**`Login.jsx`**
```jsx
// Pure form component, delegates all logic to context
const { loginUser, registerUser, loginAsGuestUser, loading, error } = useAppContext();
```

**`Lobby.jsx`**
```jsx
// Pure lobby component, delegates all logic to context
const { user, games, createGame, joinGame, logoutUser } = useAppContext();
```

**`Game.jsx`**
```jsx
// Game wrapper that validates and delegates to GameContext
const { gameParams } = useAppContext();
// GameProvider handles all game logic
```

**`Leaderboard.jsx`**
```jsx
// Pure display component, gets data from GameContext
const { leaderboardData, playerCount } = useGameContext();
```

## Data Flow

```
Backend API ←→ AppContext ←→ React Components
                    ↓
                GameContext ←→ Vanilla JS Game
                    ↓
            React Game Components (Leaderboard, etc.)
```

## Benefits

1. **Clean separation**: JSX files only contain rendering logic
2. **Centralized state**: All business logic in context providers
3. **Easy testing**: Context can be mocked independently
4. **Type safety**: Context provides clear interfaces
5. **Reusability**: Components are pure and reusable
6. **Debugging**: All state changes go through reducers

## Usage Pattern

```jsx
// Instead of this in components:
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const handleLogin = async () => { /* complex logic */ };

// Do this:
const { loading, error, loginUser } = useAppContext();
const handleLogin = () => loginUser(username, password);
```

This keeps components clean and focused on presentation while centralizing all business logic in the context providers.
