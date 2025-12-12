import { useGameContext } from '../context/GameContext';

function GameCanvas() {
  const { gameLoaded, gameInitialized, gameError } = useGameContext();

  if (gameError) {
    return (
      <div className="game-canvas-error">
        <h3>Game Error</h3>
        <p>{gameError}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="game-canvas-container">
      {!gameLoaded && (
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p>Loading game...</p>
        </div>
      )}
      {gameLoaded && !gameInitialized && (
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p>Initializing game...</p>
        </div>
      )}
      <canvas style={{ display: gameInitialized ? 'block' : 'none' }}></canvas>
    </div>
  );
}

export default GameCanvas;
