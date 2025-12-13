import { useAppContext } from '../context/AppContext';
import './ModeSelect.css';

function ModeSelect() {
  const { user, logoutUser, navigateTo, setGameMode } = useAppContext();

  const handleSinglePlayer = () => {
    setGameMode('single');
    navigateTo('/single-player');
  };

  const handleMultiplayer = () => {
    setGameMode('multi');
    navigateTo('/lobby');
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleAchievements = () => {
    navigateTo('/achievements');
  };

  return (
    <div className="mode-select-container">
      <header className="mode-header">
        <img src="/img/spaceship-logo.svg" alt="Game Logo" className="logo" />
        <h1>Stellar Combat</h1>
        <div className="user-info">
          <span>Welcome, {user?.username || 'Pilot'}!</span>
          <button onClick={handleAchievements} className="achievements-btn">
            Achievements
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="mode-content">
        <h2>Select Game Mode</h2>
        
        <div className="mode-cards">
          <div className="mode-card single-player" onClick={handleSinglePlayer}>
            <div className="mode-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3>Single Player</h3>
            <p>Navigate through asteroid fields, collect crystals, and complete levels</p>
            <ul className="mode-features">
              <li>5+ Unique Levels</li>
              <li>Powerups & Upgrades</li>
              <li>Achievements</li>
              <li>Leaderboards</li>
            </ul>
            <button className="mode-btn primary">Play Solo</button>
          </div>

          <div className="mode-card multiplayer" onClick={handleMultiplayer}>
            <div className="mode-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="7" r="4"/>
                <circle cx="15" cy="7" r="4"/>
                <path d="M3 21v-2a4 4 0 0 1 4-4h4"/>
                <path d="M21 21v-2a4 4 0 0 0-4-4h-4"/>
              </svg>
            </div>
            <h3>Multiplayer</h3>
            <p>Battle against other players in real-time space combat</p>
            <ul className="mode-features">
              <li>Real-time PvP</li>
              <li>Create/Join Rooms</li>
              <li>Team Battles</li>
              <li>Global Rankings</li>
            </ul>
            <button className="mode-btn secondary">Play Online</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ModeSelect;

