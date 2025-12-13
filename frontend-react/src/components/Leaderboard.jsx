import { useGameContext } from '../context/GameContext';
import './Leaderboard.css';

function Leaderboard() {
  const { leaderboardData, playerCount } = useGameContext();

  // Sort players by score descending
  const sortedPlayers = [...leaderboardData].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3>Leaderboard</h3>
        <span className="player-count">{playerCount} online</span>
      </div>
      
      <div className="leaderboard-list">
        {sortedPlayers.length === 0 ? (
          <div className="no-players">
            <p>Waiting for players...</p>
          </div>
        ) : (
          sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`leaderboard-item ${index === 0 && sortedPlayers.length > 1 ? 'leader' : ''} ${index < 3 ? 'top-three' : ''}`}
            >
              <span className={`rank rank-${index + 1}`}>
                {index === 0 && sortedPlayers.length > 1 ? (
                  <span className="crown">1</span>
                ) : (
                  `#${index + 1}`
                )}
              </span>
              <span 
                className="player-color" 
                style={{ backgroundColor: player.color || '#20B2AA' }}
              ></span>
              <span className="username" title={player.username}>
                {player.username}
              </span>
              <span className="score">{player.score || 0}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
