import { useGameContext } from '../context/GameContext';
import './Leaderboard.css';

function Leaderboard() {
  const { leaderboardData, playerCount } = useGameContext();

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3>Leaderboard</h3>
        <span className="player-count">Players: {playerCount}</span>
      </div>
      
      <div className="leaderboard-list">
        {leaderboardData.length === 0 ? (
          <div className="no-players">
            <p>Waiting for players...</p>
          </div>
        ) : (
          leaderboardData.map((player, index) => (
            <div 
              key={player.id} 
              className={`leaderboard-item ${index === 0 ? 'leader' : ''}`}
            >
              <span className="rank">#{index + 1}</span>
              <span className="username">{player.username}</span>
              <span className="score">{player.score || 0}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
