import { useState, useEffect } from 'react';
import './AchievementPopup.css';

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

function AchievementPopup({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setIsExiting(false);

      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!achievement || !isVisible) return null;

  const icon = ACHIEVEMENT_ICONS[achievement.icon] || '🏅';

  return (
    <div 
      className={`achievement-popup ${isExiting ? 'exiting' : ''}`}
      onClick={handleClose}
    >
      <div className="achievement-popup-content">
        <div className="achievement-icon">{icon}</div>
        <div className="achievement-info">
          <div className="achievement-label">Achievement Unlocked!</div>
          <div className="achievement-name">{achievement.name}</div>
          <div className="achievement-description">{achievement.description}</div>
        </div>
      </div>
      <div className="achievement-progress-bar">
        <div className="achievement-progress-fill"></div>
      </div>
    </div>
  );
}

export default AchievementPopup;
