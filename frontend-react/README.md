# React + Vite Frontend

This is the React frontend for the multiplayer game project. It provides the UI components (Login, Lobby, Game wrapper, Leaderboard) while the game logic is handled by vanilla JavaScript.

## Development

- `npm run dev` - Start the development server on port 8000
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Architecture

This frontend uses a hybrid approach:
- **React components** for all UI and navigation
- **Vanilla JavaScript** for game logic and canvas rendering
- **Vite proxy** for API communication with the backend
