import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './Achievements.css';

const ACHIEVEMENT_ICONS = {
  rocket: '🚀',
  compass: '🧭',
  star: '⭐',
  bolt: '⚡',
  shield: '🛡️',
  explosion: '💥',
  gem: '💎',
  diamond: '💠',
  target: '🎯',
  bomb: '💣',
  zap: '✨',
  shield_check: '🔰',
  timer: '⏱️',
  award: '🏆',
  crown: '👑',
  crosshair: '🎯',
  skull: '💀',
  heart: '❤️',
  calendar: '📅'
};

const CATEGORY_LABELS = {
  navigation: 'Navigation',
  combat: 'Combat & Mining',
  mastery: 'Mastery'
};

function Achievements() {
  const { navigateTo } = useAppContext();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    // Load from AchievementManager if available
    if (window.AchievementManager) {
      const manager = new window.AchievementManager();
      setAchievements(manager.getAllAchievements());
      setStats(manager.stats);
    } else {
      // Fallback: load from localStorage directly
      const savedAchievements = localStorage.getItem('sp_achievements');
      const savedStats = localStorage.getItem('sp_achievement_stats');
      
      const unlocked = savedAchievements ? JSON.parse(savedAchievements) : {};
      const statsData = savedStats ? JSON.parse(savedStats) : {};
      
      setStats(statsData);
      
      // Build achievements list from static data
      const achievementsList = [
        // Navigation
        { id: 'first_flight', name: 'First Flight', description: 'Complete Level 1', icon: 'rocket', category: 'navigation', requirement: { type: 'level_complete', value: 1 } },
        { id: 'navigator', name: 'Navigator', description: 'Complete 5 levels', icon: 'compass', category: 'navigation', requirement: { type: 'levels_completed', value: 5 } },
        { id: 'asteroid_ace', name: 'Asteroid Ace', description: 'Complete 10 levels', icon: 'star', category: 'navigation', requirement: { type: 'levels_completed', value: 10 } },
        { id: 'speed_demon', name: 'Speed Demon', description: 'Complete any level under par time', icon: 'bolt', category: 'navigation', requirement: { type: 'under_par', value: 1 } },
        { id: 'untouchable', name: 'Untouchable', description: 'Complete a level without taking damage', icon: 'shield', category: 'navigation', requirement: { type: 'no_damage', value: 1 } },
        // Combat
        { id: 'first_blood', name: 'First Blood', description: 'Destroy your first mineable asteroid', icon: 'explosion', category: 'combat', requirement: { type: 'asteroids_destroyed', value: 1 } },
        { id: 'crystal_hunter', name: 'Crystal Hunter', description: 'Collect 100 crystals total', icon: 'gem', category: 'combat', requirement: { type: 'total_crystals', value: 100 } },
        { id: 'mining_expert', name: 'Mining Expert', description: 'Collect 500 crystals total', icon: 'diamond', category: 'combat', requirement: { type: 'total_crystals', value: 500 } },
        { id: 'sharpshooter', name: 'Sharpshooter', description: 'Hit 50 mineable asteroids in a row', icon: 'target', category: 'combat', requirement: { type: 'hit_streak', value: 50 } },
        { id: 'demolition_expert', name: 'Demolition Expert', description: 'Destroy 100 mineable asteroids', icon: 'bomb', category: 'combat', requirement: { type: 'asteroids_destroyed', value: 100 } },
        // Mastery
        { id: 'powerup_pro', name: 'Powerup Pro', description: 'Collect 25 powerups', icon: 'zap', category: 'mastery', requirement: { type: 'powerups_collected', value: 25 } },
        { id: 'shield_master', name: 'Shield Master', description: 'Block 10 hits with shields', icon: 'shield_check', category: 'mastery', requirement: { type: 'shield_blocks', value: 10 } },
        { id: 'speed_runner', name: 'Speed Runner', description: 'Complete 5 levels under par time', icon: 'timer', category: 'mastery', requirement: { type: 'under_par', value: 5 } },
        { id: 'perfectionist', name: 'Perfectionist', description: 'Complete 3 levels with no damage', icon: 'award', category: 'mastery', requirement: { type: 'no_damage', value: 3 } },
        { id: 'stellar_master', name: 'Stellar Master', description: 'Unlock all other achievements', icon: 'crown', category: 'mastery', requirement: { type: 'all_achievements', value: 14 } }
      ];

      // Add unlocked status and progress
      setAchievements(achievementsList.map(a => ({
        ...a,
        unlocked: !!unlocked[a.id],
        progress: calculateProgress(a.requirement, statsData, unlocked),
        unlockedAt: unlocked[a.id]?.unlockedAt
      })));
    }
  };

  const calculateProgress = (requirement, statsData, unlocked) => {
    const { type, value } = requirement;
    let current = 0;

    switch (type) {
      case 'level_complete':
        current = statsData.highest_level || 0;
        break;
      case 'levels_completed':
        current = statsData.levels_completed || 0;
        break;
      case 'total_crystals':
        current = statsData.total_crystals || 0;
        break;
      case 'asteroids_destroyed':
        current = statsData.asteroids_destroyed || 0;
        break;
      case 'powerups_collected':
        current = statsData.powerups_collected || 0;
        break;
      case 'shield_blocks':
        current = statsData.shield_blocks || 0;
        break;
      case 'under_par':
        current = statsData.under_par_completions || 0;
        break;
      case 'no_damage':
        current = statsData.no_damage_completions || 0;
        break;
      case 'hit_streak':
        current = statsData.best_hit_streak || 0;
        break;
      case 'all_achievements':
        current = Object.keys(unlocked).length;
        break;
      default:
        current = 0;
    }

    return Math.min(100, (current / value) * 100);
  };

  const handleBack = () => {
    navigateTo('/mode-select');
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const categories = ['all', 'navigation', 'combat', 'mastery'];

  return (
    <div className="achievements-page">
      <header className="achievements-header">
        <button onClick={handleBack} className="back-btn">
          ← Back
        </button>
        <h1>Achievements</h1>
        <div className="achievements-summary">
          <span className="unlocked-count">{unlockedCount}</span>
          <span className="total-count">/ {totalCount}</span>
        </div>
      </header>

      <div className="achievements-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.levels_completed || 0}</span>
          <span className="stat-label">Levels Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.total_crystals || 0}</span>
          <span className="stat-label">Crystals Collected</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.asteroids_destroyed || 0}</span>
          <span className="stat-label">Asteroids Destroyed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.powerups_collected || 0}</span>
          <span className="stat-label">Powerups Collected</span>
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="achievements-grid">
        {filteredAchievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-card-icon">
              {ACHIEVEMENT_ICONS[achievement.icon] || '🏅'}
            </div>
            <div className="achievement-card-content">
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
              {!achievement.unlocked && (
                <div className="achievement-card-progress">
                  <div 
                    className="achievement-card-progress-fill"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                  <span className="achievement-card-progress-text">
                    {Math.floor(achievement.progress)}%
                  </span>
                </div>
              )}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="achievement-unlocked-date">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
