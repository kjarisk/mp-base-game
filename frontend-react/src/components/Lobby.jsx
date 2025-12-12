import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import './Lobby.css';

function Lobby() {
  const { user, games, createGame, joinGame, logoutUser } = useAppContext();
  const [gameName, setGameName] = useState('');

  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!gameName.trim()) return;
    createGame(gameName);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="lobby-container">
      <header className="lobby-header">
        <div className="header-content">
          <img src="/img/spaceship-logo.svg" alt="Game Logo" className="logo" />
          <h1>Stellar Combat - Game Lobby</h1>
          <div className="user-info">
            <span>Welcome, {user?.username || 'Player'}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="lobby-main">
        <div className="game-section">
          <div className="create-game-section">
            <h2>Create New Game</h2>
            <form onSubmit={handleCreateGame} className="create-game-form">
              <input
                type="text"
                placeholder="Enter game name..."
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                maxLength={50}
                required
              />
              <button type="submit">Create Game</button>
            </form>
          </div>

          <div className="games-list-section">
            <h2>Available Games</h2>
            {games.length === 0 ? (
              <div className="no-games">
                <p>No active games found</p>
                <p>Create a new game to get started!</p>
              </div>
            ) : (
              <div className="games-grid">
                {games.map((game) => (
                  <div key={game.id} className="game-card">
                    <div className="game-info">
                      <h3>{game.name}</h3>
                      <p>Players: {game.playerCount || 0}/{game.maxPlayers || 8}</p>
                      <p>Status: {game.status || 'Waiting'}</p>
                    </div>
                    <button 
                      onClick={() => joinGame(game.id)}
                      className="join-btn"
                      disabled={game.playerCount >= (game.maxPlayers || 8)}
                    >
                      {game.playerCount >= (game.maxPlayers || 8) ? 'Full' : 'Join Game'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Lobby;
