import { useAppContext } from '../context/AppContext';
import { GameProvider } from '../context/GameContext';
import Leaderboard from './Leaderboard';
import GameCanvas from './GameCanvas';
import './Game.css';

function GameContent() {
  const { navigateTo } = useAppContext();

  return (
    <div className="game-page">
      <div className="game-container">
        <button 
          className="back-to-lobby-btn"
          onClick={() => navigateTo('/lobby')}
        >
          ← Back to Lobby
        </button>
        <Leaderboard />
        <GameCanvas />
      </div>
    </div>
  );
}

function Game() {
  const { gameParams } = useAppContext();

  // Validate gameId exists
  if (!gameParams?.gameId) {
    return (
      <div className="game-error">
        <h2>Invalid Game</h2>
        <p>No game ID found. Please return to the lobby.</p>
        <button onClick={() => window.location.href = '/lobby'}>
          Go to Lobby
        </button>
      </div>
    );
  }

  return (
    <GameProvider 
      gameId={gameParams.gameId} 
      gameName={gameParams.gameName}
      createGame={gameParams.createGame}
    >
      <GameContent />
    </GameProvider>
  );
}

export default Game;
