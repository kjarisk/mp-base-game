// UI management for player labels and leaderboard
class UIManager {
  constructor() {
    // No need for DOM container, we'll use React events
    this.players = new Map();
  }

  addPlayerLabel(id, playerData) {
    this.players.set(id, playerData);
    this.dispatchPlayerUpdate(id, playerData);
  }

  updatePlayerLabel(id, playerData) {
    this.players.set(id, playerData);
    this.dispatchPlayerUpdate(id, playerData);
  }

  removePlayerLabel(id) {
    this.players.delete(id);
    this.dispatchPlayerRemove(id);
  }

  sortPlayerLabels() {
    // React component handles sorting automatically
  }

  dispatchPlayerUpdate(id, playerData) {
    const event = new CustomEvent('playerUpdate', {
      detail: { id, ...playerData }
    });
    window.dispatchEvent(event);
  }

  dispatchPlayerRemove(id) {
    const event = new CustomEvent('playerRemove', {
      detail: id
    });
    window.dispatchEvent(event);
  }
}

window.UIManager = UIManager;
