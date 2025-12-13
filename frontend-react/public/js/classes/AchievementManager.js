// Achievement Manager for Single Player Mode
class AchievementManager {
  static ACHIEVEMENTS = {
    // ============ NAVIGATION ACHIEVEMENTS ============
    first_flight: {
      id: 'first_flight',
      name: 'First Flight',
      description: 'Complete Level 1',
      icon: 'rocket',
      category: 'navigation',
      requirement: { type: 'level_complete', value: 1 }
    },
    navigator: {
      id: 'navigator',
      name: 'Navigator',
      description: 'Complete 5 levels',
      icon: 'compass',
      category: 'navigation',
      requirement: { type: 'levels_completed', value: 5 }
    },
    asteroid_ace: {
      id: 'asteroid_ace',
      name: 'Asteroid Ace',
      description: 'Complete 10 levels',
      icon: 'star',
      category: 'navigation',
      requirement: { type: 'levels_completed', value: 10 }
    },
    explorer: {
      id: 'explorer',
      name: 'Explorer',
      description: 'Complete 25 levels',
      icon: 'compass',
      category: 'navigation',
      requirement: { type: 'levels_completed', value: 25 }
    },
    veteran_pilot: {
      id: 'veteran_pilot',
      name: 'Veteran Pilot',
      description: 'Complete 50 levels',
      icon: 'star',
      category: 'navigation',
      requirement: { type: 'levels_completed', value: 50 }
    },
    legend: {
      id: 'legend',
      name: 'Legend',
      description: 'Complete 100 levels',
      icon: 'crown',
      category: 'navigation',
      requirement: { type: 'levels_completed', value: 100 }
    },
    speed_demon: {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete any level under par time',
      icon: 'bolt',
      category: 'navigation',
      requirement: { type: 'under_par', value: 1 }
    },
    untouchable: {
      id: 'untouchable',
      name: 'Untouchable',
      description: 'Complete a level without taking damage',
      icon: 'shield',
      category: 'navigation',
      requirement: { type: 'no_damage', value: 1 }
    },
    marathon: {
      id: 'marathon',
      name: 'Marathon Runner',
      description: 'Play for 1 hour total',
      icon: 'timer',
      category: 'navigation',
      requirement: { type: 'playtime', value: 3600 }
    },
    dedicated: {
      id: 'dedicated',
      name: 'Dedicated Pilot',
      description: 'Play on 5 different days',
      icon: 'calendar',
      category: 'navigation',
      requirement: { type: 'play_days', value: 5 }
    },
    
    // ============ COMBAT ACHIEVEMENTS ============
    first_blood: {
      id: 'first_blood',
      name: 'First Blood',
      description: 'Destroy your first asteroid',
      icon: 'explosion',
      category: 'combat',
      requirement: { type: 'asteroids_destroyed', value: 1 }
    },
    asteroid_buster: {
      id: 'asteroid_buster',
      name: 'Asteroid Buster',
      description: 'Destroy 250 asteroids',
      icon: 'explosion',
      category: 'combat',
      requirement: { type: 'asteroids_destroyed', value: 250 }
    },
    space_miner: {
      id: 'space_miner',
      name: 'Space Miner',
      description: 'Destroy 500 asteroids',
      icon: 'bomb',
      category: 'combat',
      requirement: { type: 'asteroids_destroyed', value: 500 }
    },
    demolition_expert: {
      id: 'demolition_expert',
      name: 'Demolition Expert',
      description: 'Destroy 1000 asteroids',
      icon: 'bomb',
      category: 'combat',
      requirement: { type: 'asteroids_destroyed', value: 1000 }
    },
    crystal_hunter: {
      id: 'crystal_hunter',
      name: 'Crystal Hunter',
      description: 'Collect 100 crystals total',
      icon: 'gem',
      category: 'combat',
      requirement: { type: 'total_crystals', value: 100 }
    },
    mining_expert: {
      id: 'mining_expert',
      name: 'Mining Expert',
      description: 'Collect 500 crystals total',
      icon: 'diamond',
      category: 'combat',
      requirement: { type: 'total_crystals', value: 500 }
    },
    crystal_millionaire: {
      id: 'crystal_millionaire',
      name: 'Crystal Millionaire',
      description: 'Collect 2000 crystals total',
      icon: 'diamond',
      category: 'combat',
      requirement: { type: 'total_crystals', value: 2000 }
    },
    crystal_billionaire: {
      id: 'crystal_billionaire',
      name: 'Crystal Billionaire',
      description: 'Collect 10000 crystals total',
      icon: 'crown',
      category: 'combat',
      requirement: { type: 'total_crystals', value: 10000 }
    },
    sharpshooter: {
      id: 'sharpshooter',
      name: 'Sharpshooter',
      description: 'Hit 50 targets in a row',
      icon: 'target',
      category: 'combat',
      requirement: { type: 'hit_streak', value: 50 }
    },
    enemy_hunter: {
      id: 'enemy_hunter',
      name: 'Enemy Hunter',
      description: 'Defeat 50 enemies',
      icon: 'crosshair',
      category: 'combat',
      requirement: { type: 'enemies_killed', value: 50 }
    },
    enemy_slayer: {
      id: 'enemy_slayer',
      name: 'Enemy Slayer',
      description: 'Defeat 200 enemies',
      icon: 'crosshair',
      category: 'combat',
      requirement: { type: 'enemies_killed', value: 200 }
    },
    boss_hunter: {
      id: 'boss_hunter',
      name: 'Boss Hunter',
      description: 'Defeat 10 bosses',
      icon: 'skull',
      category: 'combat',
      requirement: { type: 'bosses_defeated', value: 10 }
    },
    boss_slayer: {
      id: 'boss_slayer',
      name: 'Boss Slayer',
      description: 'Defeat 25 bosses',
      icon: 'skull',
      category: 'combat',
      requirement: { type: 'bosses_defeated', value: 25 }
    },
    
    // ============ MASTERY ACHIEVEMENTS ============
    powerup_pro: {
      id: 'powerup_pro',
      name: 'Powerup Pro',
      description: 'Collect 25 powerups',
      icon: 'zap',
      category: 'mastery',
      requirement: { type: 'powerups_collected', value: 25 }
    },
    powerup_addict: {
      id: 'powerup_addict',
      name: 'Powerup Addict',
      description: 'Collect 100 powerups',
      icon: 'zap',
      category: 'mastery',
      requirement: { type: 'powerups_collected', value: 100 }
    },
    powerup_master: {
      id: 'powerup_master',
      name: 'Powerup Master',
      description: 'Collect 500 powerups',
      icon: 'zap',
      category: 'mastery',
      requirement: { type: 'powerups_collected', value: 500 }
    },
    shield_master: {
      id: 'shield_master',
      name: 'Shield Master',
      description: 'Block 10 hits with shields',
      icon: 'shield_check',
      category: 'mastery',
      requirement: { type: 'shield_blocks', value: 10 }
    },
    shield_wall: {
      id: 'shield_wall',
      name: 'Shield Wall',
      description: 'Block 50 hits with shields',
      icon: 'shield_check',
      category: 'mastery',
      requirement: { type: 'shield_blocks', value: 50 }
    },
    speed_runner: {
      id: 'speed_runner',
      name: 'Speed Runner',
      description: 'Complete 5 levels under par time',
      icon: 'timer',
      category: 'mastery',
      requirement: { type: 'under_par', value: 5 }
    },
    perfectionist: {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Complete 3 levels with no damage',
      icon: 'award',
      category: 'mastery',
      requirement: { type: 'no_damage', value: 3 }
    },
    flawless: {
      id: 'flawless',
      name: 'Flawless',
      description: 'Complete 10 levels with no damage',
      icon: 'award',
      category: 'mastery',
      requirement: { type: 'no_damage', value: 10 }
    },
    homing_expert: {
      id: 'homing_expert',
      name: 'Homing Expert',
      description: 'Defeat 50 enemies with homing missiles',
      icon: 'target',
      category: 'mastery',
      requirement: { type: 'homing_kills', value: 50 }
    },
    survivor: {
      id: 'survivor',
      name: 'Survivor',
      description: 'Complete 10 levels without dying',
      icon: 'heart',
      category: 'mastery',
      requirement: { type: 'levels_no_death', value: 10 }
    },
    stellar_master: {
      id: 'stellar_master',
      name: 'Stellar Master',
      description: 'Unlock all other achievements',
      icon: 'crown',
      category: 'mastery',
      requirement: { type: 'all_achievements', value: 34 }
    }
  };

  constructor(onAchievementUnlock = null) {
    this.onAchievementUnlock = onAchievementUnlock;
    this.stats = this.loadStats();
    this.unlockedAchievements = this.loadUnlocked();
    this.pendingNotifications = [];
  }

  // Update stats and check for new achievements
  updateStats(statUpdates) {
    // Merge updates into stats
    for (const [key, value] of Object.entries(statUpdates)) {
      if (typeof value === 'number') {
        this.stats[key] = (this.stats[key] || 0) + value;
      } else {
        this.stats[key] = value;
      }
    }
    
    this.saveStats();
    this.checkAchievements();
  }

  // Set a stat directly (for high scores, etc)
  setStat(key, value) {
    if (this.stats[key] === undefined || value > this.stats[key]) {
      this.stats[key] = value;
      this.saveStats();
      this.checkAchievements();
    }
  }

  // Check all achievements for newly unlocked ones
  checkAchievements() {
    const newUnlocks = [];
    
    for (const [id, achievement] of Object.entries(AchievementManager.ACHIEVEMENTS)) {
      if (this.unlockedAchievements[id]) continue;
      
      if (this.checkRequirement(achievement.requirement)) {
        this.unlock(id);
        newUnlocks.push(achievement);
      }
    }
    
    return newUnlocks;
  }

  checkRequirement(requirement) {
    const { type, value } = requirement;
    
    switch (type) {
      case 'level_complete':
        return (this.stats.highest_level || 0) >= value;
        
      case 'levels_completed':
        return (this.stats.levels_completed || 0) >= value;
        
      case 'total_crystals':
        return (this.stats.total_crystals || 0) >= value;
        
      case 'asteroids_destroyed':
        return (this.stats.asteroids_destroyed || 0) >= value;
        
      case 'powerups_collected':
        return (this.stats.powerups_collected || 0) >= value;
        
      case 'shield_blocks':
        return (this.stats.shield_blocks || 0) >= value;
        
      case 'under_par':
        return (this.stats.under_par_completions || 0) >= value;
        
      case 'no_damage':
        return (this.stats.no_damage_completions || 0) >= value;
        
      case 'hit_streak':
        return (this.stats.best_hit_streak || 0) >= value;
        
      case 'enemies_killed':
        return (this.stats.enemies_killed || 0) >= value;
        
      case 'bosses_defeated':
        return (this.stats.bosses_defeated || 0) >= value;
        
      case 'homing_kills':
        return (this.stats.homing_kills || 0) >= value;
        
      case 'playtime':
        return (this.stats.total_playtime || 0) >= value;
        
      case 'play_days':
        return (this.stats.unique_days || 0) >= value;
        
      case 'levels_no_death':
        return (this.stats.levels_no_death || 0) >= value;
        
      case 'all_achievements':
        // -1 because stellar_master itself doesn't count
        return Object.keys(this.unlockedAchievements).length >= value;
        
      default:
        return false;
    }
  }

  unlock(achievementId) {
    if (this.unlockedAchievements[achievementId]) return false;
    
    const achievement = AchievementManager.ACHIEVEMENTS[achievementId];
    if (!achievement) return false;
    
    this.unlockedAchievements[achievementId] = {
      unlockedAt: Date.now()
    };
    
    this.saveUnlocked();
    
    // Notify
    if (this.onAchievementUnlock) {
      this.onAchievementUnlock(achievement);
    }
    
    this.pendingNotifications.push(achievement);
    
    // Check for stellar master
    if (achievementId !== 'stellar_master') {
      this.checkAchievements();
    }
    
    return true;
  }

  isUnlocked(achievementId) {
    return !!this.unlockedAchievements[achievementId];
  }

  getProgress(achievementId) {
    const achievement = AchievementManager.ACHIEVEMENTS[achievementId];
    if (!achievement || this.isUnlocked(achievementId)) return 100;
    
    const { type, value } = achievement.requirement;
    let current = 0;
    
    switch (type) {
      case 'level_complete':
        current = this.stats.highest_level || 0;
        break;
      case 'levels_completed':
        current = this.stats.levels_completed || 0;
        break;
      case 'total_crystals':
        current = this.stats.total_crystals || 0;
        break;
      case 'asteroids_destroyed':
        current = this.stats.asteroids_destroyed || 0;
        break;
      case 'powerups_collected':
        current = this.stats.powerups_collected || 0;
        break;
      case 'shield_blocks':
        current = this.stats.shield_blocks || 0;
        break;
      case 'under_par':
        current = this.stats.under_par_completions || 0;
        break;
      case 'no_damage':
        current = this.stats.no_damage_completions || 0;
        break;
      case 'hit_streak':
        current = this.stats.best_hit_streak || 0;
        break;
      case 'enemies_killed':
        current = this.stats.enemies_killed || 0;
        break;
      case 'bosses_defeated':
        current = this.stats.bosses_defeated || 0;
        break;
      case 'homing_kills':
        current = this.stats.homing_kills || 0;
        break;
      case 'playtime':
        current = this.stats.total_playtime || 0;
        break;
      case 'play_days':
        current = this.stats.unique_days || 0;
        break;
      case 'levels_no_death':
        current = this.stats.levels_no_death || 0;
        break;
      case 'all_achievements':
        current = Object.keys(this.unlockedAchievements).length;
        break;
    }
    
    return Math.min(100, (current / value) * 100);
  }

  getAllAchievements() {
    return Object.values(AchievementManager.ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: this.isUnlocked(achievement.id),
      progress: this.getProgress(achievement.id),
      unlockedAt: this.unlockedAchievements[achievement.id]?.unlockedAt
    }));
  }

  getByCategory(category) {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  getUnlockedCount() {
    return Object.keys(this.unlockedAchievements).length;
  }

  getTotalCount() {
    return Object.keys(AchievementManager.ACHIEVEMENTS).length;
  }

  getNextPendingNotification() {
    return this.pendingNotifications.shift();
  }

  hasPendingNotifications() {
    return this.pendingNotifications.length > 0;
  }

  loadStats() {
    try {
      const saved = localStorage.getItem('sp_achievement_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveStats() {
    try {
      localStorage.setItem('sp_achievement_stats', JSON.stringify(this.stats));
    } catch (e) {
      console.warn('Could not save achievement stats:', e);
    }
  }

  loadUnlocked() {
    try {
      const saved = localStorage.getItem('sp_achievements');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveUnlocked() {
    try {
      localStorage.setItem('sp_achievements', JSON.stringify(this.unlockedAchievements));
    } catch (e) {
      console.warn('Could not save achievements:', e);
    }
  }

  resetAll() {
    this.stats = {};
    this.unlockedAchievements = {};
    this.saveStats();
    this.saveUnlocked();
  }

  // Track a level completion
  trackLevelComplete(level, time, parTime, crystals, noDamage, asteroidsDestroyed, enemiesKilled = 0, powerupsCollected = 0, bossDefeated = false) {
    const updates = {
      levels_completed: 1,
      total_crystals: crystals,
      asteroids_destroyed: asteroidsDestroyed,
      enemies_killed: enemiesKilled,
      powerups_collected: powerupsCollected
    };
    
    // Update highest level
    if (level > (this.stats.highest_level || 0)) {
      this.stats.highest_level = level;
    }
    
    // Track under par completions
    if (time < parTime) {
      updates.under_par_completions = 1;
    }
    
    // Track no damage completions
    if (noDamage) {
      updates.no_damage_completions = 1;
    }
    
    // Track boss defeats
    if (bossDefeated) {
      updates.bosses_defeated = 1;
    }
    
    // Track consecutive levels without dying (simplified - just increment)
    updates.levels_no_death = 1;
    
    // Track unique play days
    const today = new Date().toDateString();
    const lastPlayDate = this.stats.last_play_date;
    if (lastPlayDate !== today) {
      this.stats.last_play_date = today;
      updates.unique_days = 1;
    }
    
    this.updateStats(updates);
  }

  // Track playtime
  trackPlaytime(seconds) {
    this.updateStats({ total_playtime: seconds });
  }

  // Track a hit streak
  trackHitStreak(streak) {
    if (streak > (this.stats.best_hit_streak || 0)) {
      this.stats.best_hit_streak = streak;
      this.saveStats();
      this.checkAchievements();
    }
  }

  // Track powerup collection
  trackPowerup() {
    this.updateStats({ powerups_collected: 1 });
  }

  // Track shield block
  trackShieldBlock() {
    this.updateStats({ shield_blocks: 1 });
  }

  // Track homing missile kills
  trackHomingKill() {
    this.updateStats({ homing_kills: 1 });
  }

  // Track enemy kill
  trackEnemyKill() {
    this.updateStats({ enemies_killed: 1 });
  }

  // Track boss defeat
  trackBossDefeat() {
    this.updateStats({ bosses_defeated: 1 });
  }
}

window.AchievementManager = AchievementManager;

