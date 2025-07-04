// Modern class-based game initialization
let gameController;

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  gameController = new GameController();
  gameController.initialize();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
  if (gameController) {
    gameController.destroy();
  }
});
