// UI management for player labels and leaderboard
class UIManager {
  constructor() {
    // Store players for leaderboard
    this.players = new Map();
  }

  addPlayerLabel(id, playerData) {
    this.players.set(id, {
      id,
      username: playerData.username,
      color: playerData.color,
      score: playerData.score || 0
    });
    this.updateReactLeaderboard();
  }

  updatePlayerLabel(id, playerData) {
    const existing = this.players.get(id) || {};
    this.players.set(id, {
      ...existing,
      id,
      username: playerData.username,
      color: playerData.color,
      score: playerData.score || 0
    });
    this.updateReactLeaderboard();
  }

  removePlayerLabel(id) {
    this.players.delete(id);
    this.updateReactLeaderboard();
  }

  sortPlayerLabels() {
    // React component handles sorting automatically
    this.updateReactLeaderboard();
  }

  updateReactLeaderboard() {
    // Update React leaderboard component
    if (window.updateLeaderboard) {
      const playersArray = Array.from(this.players.values());
      window.updateLeaderboard(playersArray);
    }
    
    // Update player count
    if (window.updatePlayerCount) {
      window.updatePlayerCount(this.players.size);
    }
  }
}

window.UIManager = UIManager;
