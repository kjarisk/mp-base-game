import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import AchievementPopup from './AchievementPopup';
import './SinglePlayerGame.css';

function SinglePlayerGame() {
  const { user, navigateTo } = useAppContext();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const achievementManagerRef = useRef(null);
  
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]);
  
  const [gameState, setGameState] = useState({
    level: 1,
    score: 0,
    crystals: 0,
    health: 100,
    progress: 0,
    isPaused: false,
    isGameOver: false,
    isLevelComplete: false,
    activePowerups: [],
    objectives: {
      primary: 'Reach the finish zone',
      secondary: 'Collect 10 crystals',
      bonus: 'Finish with 30+ seconds remaining'
    },
    timeElapsed: 0,
    timeRemaining: 90,
    timeLimit: 90,
    specialCharge: 0,
    inSafeZone: false,
    isBossLevel: false,
    bossHealth: 0,
    bossDefeated: false,
    objectivesComplete: false
  });
  
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [levelResults, setLevelResults] = useState(null);

  useEffect(() => {
    const initGame = async () => {
      await loadGameScripts();
      
      const canvas = canvasRef.current;
      if (canvas && window.SinglePlayerEngine) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 1229 * dpr;
        canvas.height = 749 * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Initialize achievement manager with callback
        if (window.AchievementManager) {
          achievementManagerRef.current = new window.AchievementManager(handleAchievement);
        }
        
        engineRef.current = new window.SinglePlayerEngine(canvas, ctx, {
          username: user?.username || 'Pilot',
          onStateUpdate: handleGameStateUpdate,
          onLevelComplete: handleLevelCompleteWithAchievements,
          onGameOver: handleGameOver,
          onAchievement: handleAchievement
        });
        
        engineRef.current.start();
      }
    };
    
    initGame();
    
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [user]);

  const loadGameScripts = async () => {
    const scripts = [
      '/js/classes/Player.js',
      '/js/classes/Projectile.js',
      '/js/classes/Asteroid.js',
      '/js/classes/Powerup.js',
      '/js/classes/Crystal.js',
      '/js/classes/LevelManager.js',
      '/js/classes/PowerupManager.js',
      '/js/classes/AchievementManager.js',
      '/js/classes/SinglePlayerEngine.js'
    ];

    for (const src of scripts) {
      await loadScript(src);
    }
  };

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
      script.onerror = () => {
        console.warn(`Failed to load ${src}, continuing...`);
        resolve();
      };
      document.head.appendChild(script);
    });
  };

  const handleGameStateUpdate = (newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const handleLevelComplete = (results) => {
    setLevelResults(results);
    setShowLevelComplete(true);
  };

  const handleLevelCompleteWithAchievements = (results) => {
    // Track achievements with all stats from the level
    if (achievementManagerRef.current) {
      const parTime = gameState.timeLimit - 30; // Par time is 30 seconds before limit
      achievementManagerRef.current.trackLevelComplete(
        results.level,
        results.time,
        parTime,
        results.crystals,
        results.noDamageBonus > 0,
        results.asteroidsDestroyed || 0,
        results.enemiesKilled || 0,
        results.powerupsCollected || 0,
        gameState.isBossLevel && gameState.bossDefeated
      );
    }
    
    handleLevelComplete(results);
  };

  const handleGameOver = () => {
    setGameState(prev => ({ ...prev, isGameOver: true }));
  };

  const handleAchievement = (achievement) => {
    setAchievementQueue(prev => [...prev, achievement]);
  };

  // Process achievement queue
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [currentAchievement, achievementQueue]);

  const handleAchievementClose = () => {
    setCurrentAchievement(null);
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartLevel();
      setGameState(prev => ({ 
        ...prev, 
        isGameOver: false, 
        health: 100,
        progress: 0,
        timeElapsed: 0
      }));
    }
  };

  const handleNextLevel = () => {
    setShowLevelComplete(false);
    if (engineRef.current) {
      engineRef.current.nextLevel();
    }
  };

  const handleBackToMenu = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    navigateTo('/mode-select');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeRemaining = gameState.timeRemaining;
  const timerPercent = Math.max(0, (timeRemaining / gameState.timeLimit) * 100);
  const isTimeWarning = timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className="sp-game-page">
      {/* Left sidebar - Stats & Objectives */}
      <div className="sp-sidebar left">
        <div className="sp-stats-panel">
          <h3>
            Level {gameState.level}
            {gameState.isBossLevel && <span className="boss-badge">BOSS</span>}
          </h3>
          <div className="sp-stat">
            <span className="label">Score</span>
            <span className="value">{gameState.score.toLocaleString()}</span>
          </div>
          <div className="sp-stat">
            <span className="label">Crystals</span>
            <span className="value crystals">{gameState.crystals}</span>
          </div>
          {gameState.inSafeZone && (
            <div className="safe-zone-indicator">
              SAFE ZONE - Time Paused
            </div>
          )}
          {gameState.isBossLevel && !gameState.bossDefeated && gameState.bossHealth > 0 && (
            <div className="boss-health-panel">
              <span className="label">Boss Health</span>
              <div className="boss-health-bar">
                <div 
                  className="boss-health-fill" 
                  style={{ width: `${gameState.bossHealth}%` }}
                ></div>
              </div>
            </div>
          )}
          {gameState.isBossLevel && gameState.bossDefeated && (
            <div className="boss-defeated-indicator">
              BOSS DEFEATED!
            </div>
          )}
        </div>
        
        <div className="sp-objectives-panel">
          <h4>Objectives</h4>
          <ul className="objectives-list">
            <li className={gameState.progress >= 100 ? 'complete' : ''}>
              {gameState.objectives.primary}
            </li>
            <li className={gameState.crystals >= 10 ? 'complete' : ''}>
              {gameState.objectives.secondary}
            </li>
            <li className={timeRemaining >= 30 && gameState.progress >= 100 ? 'complete' : ''}>
              {gameState.objectives.bonus}
            </li>
          </ul>
        </div>

        {gameState.activePowerups.length > 0 && (
          <div className="sp-powerups-panel">
            <h4>Active Powerups</h4>
            <div className="active-powerups">
              {gameState.activePowerups.map((powerup, i) => (
                <div key={i} className={`powerup-indicator ${powerup.type}`}>
                  <span className="powerup-name">{powerup.name}</span>
                  <div className="powerup-timer" style={{ width: `${powerup.remaining}%` }}></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Weapon Charge */}
        <div className="sp-special-panel">
          <h4>Nova Blast [E]</h4>
          <div className="special-charge-bar">
            <div 
              className={`special-charge-fill ${gameState.specialCharge >= 100 ? 'ready' : ''}`}
              style={{ width: `${gameState.specialCharge}%` }}
            ></div>
            <span className="special-text">
              {gameState.specialCharge >= 100 ? 'READY!' : `${Math.floor(gameState.specialCharge)}%`}
            </span>
          </div>
        </div>
      </div>
      
      {/* Main game area */}
      <div className="sp-main">
        {/* Progress bar */}
        <div className="sp-progress-bar">
          <div className="progress-fill" style={{ width: `${gameState.progress}%` }}></div>
          <span className="progress-text">Progress: {Math.floor(gameState.progress)}%</span>
        </div>
        
        {/* Timer bar - NEW! */}
        <div className={`sp-timer-bar ${isTimeWarning ? 'warning' : ''}`}>
          <div 
            className={`timer-fill ${isTimeWarning ? 'warning' : ''}`}
            style={{ width: `${timerPercent}%` }}
          ></div>
          <span className={`timer-text ${isTimeWarning ? 'warning' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        
        {/* Health bar */}
        <div className="sp-health-bar">
          <div 
            className={`health-fill ${gameState.health <= 30 ? 'critical' : ''}`} 
            style={{ width: `${gameState.health}%` }}
          ></div>
          <span className="health-text">HP: {gameState.health}%</span>
        </div>
        
        {/* Canvas */}
        <canvas 
          ref={canvasRef} 
          id="spGameCanvas"
          style={{ cursor: 'crosshair' }}
        ></canvas>
        
        {/* Pause overlay */}
        {gameState.isPaused && (
          <div className="sp-overlay pause-overlay">
            <h2>Paused</h2>
            <button onClick={handlePause}>Resume</button>
            <button onClick={handleRestart}>Restart Level</button>
            <button onClick={handleBackToMenu}>Back to Menu</button>
          </div>
        )}
        
        {/* Game over overlay */}
        {gameState.isGameOver && (
          <div className="sp-overlay gameover-overlay">
            <h2>Game Over</h2>
            <p>{timeRemaining <= 0 ? 'Time ran out!' : 'Your ship was destroyed!'}</p>
            <div className="gameover-stats">
              <p>Score: {gameState.score.toLocaleString()}</p>
              <p>Crystals Collected: {gameState.crystals}</p>
            </div>
            <button onClick={handleRestart}>Try Again</button>
            <button onClick={handleBackToMenu}>Back to Menu</button>
          </div>
        )}
        
        {/* Level complete overlay */}
        {showLevelComplete && levelResults && (
          <div className="sp-overlay levelcomplete-overlay">
            <h2>Level Complete!</h2>
            <div className="level-results">
              <div className="result-row">
                <span>Level Score</span>
                <span>{levelResults.levelScore}</span>
              </div>
              <div className="result-row">
                <span>Crystals Bonus</span>
                <span>+{levelResults.crystalBonus}</span>
              </div>
              {levelResults.timeBonus > 0 && (
                <div className="result-row bonus">
                  <span>Time Bonus</span>
                  <span>+{levelResults.timeBonus}</span>
                </div>
              )}
              {levelResults.noDamageBonus > 0 && (
                <div className="result-row bonus">
                  <span>No Damage Bonus</span>
                  <span>+{levelResults.noDamageBonus}</span>
                </div>
              )}
              <div className="result-row total">
                <span>Total Score</span>
                <span>{levelResults.totalScore}</span>
              </div>
            </div>
            <button onClick={handleNextLevel} className="primary">Next Level</button>
            <button onClick={handleBackToMenu}>Back to Menu</button>
          </div>
        )}
      </div>
      
      {/* Right sidebar - Controls */}
      <div className="sp-sidebar right">
        <button onClick={handlePause} className="sp-control-btn">
          {gameState.isPaused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={handleBackToMenu} className="sp-control-btn back">
          Back to Menu
        </button>
        
        <div className="sp-controls-info">
          <h4>Controls</h4>
          <p><kbd>A</kbd> / <kbd>D</kbd> Rotate</p>
          <p><kbd>W</kbd> Thrust Forward</p>
          <p><kbd>S</kbd> Brake</p>
          <p><kbd>Space</kbd> Shoot</p>
          <p><kbd>E</kbd> Nova Blast</p>
          <p><kbd>ESC</kbd> Pause</p>
        </div>

        <div className="sp-legend">
          <h4>Legend</h4>
          <div className="legend-item">
            <span className="dot gold"></span> Mineable Asteroid
          </div>
          <div className="legend-item">
            <span className="dot red"></span> Collision Asteroid
          </div>
          <div className="legend-item">
            <span className="dot teal"></span> Safe Zone
          </div>
          <div className="legend-item">
            <span className="dot orange"></span> Enemy
          </div>
        </div>
      </div>

      {/* Achievement Popup */}
      <AchievementPopup 
        achievement={currentAchievement} 
        onClose={handleAchievementClose} 
      />
    </div>
  );
}

export default SinglePlayerGame;
