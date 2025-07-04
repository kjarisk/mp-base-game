// UI management for player labels and leaderboard
class UIManager {
  constructor() {
    this.playerLabelsContainer = document.querySelector('#playerLabels');
  }

  addPlayerLabel(id, playerData) {
    const label = document.createElement('div');
    label.dataset.id = id;
    label.dataset.score = playerData.score;
    label.textContent = `${playerData.username} : ${playerData.score}`;
    this.playerLabelsContainer.appendChild(label);
  }

  updatePlayerLabel(id, playerData) {
    const label = document.querySelector(`div[data-id="${id}"]`);
    if (label) {
      label.dataset.score = playerData.score;
      label.textContent = `${playerData.username} : ${playerData.score}`;
    }
  }

  removePlayerLabel(id) {
    const label = document.querySelector(`div[data-id="${id}"]`);
    if (label) {
      label.remove();
    }
  }

  sortPlayerLabels() {
    const childDivs = Array.from(this.playerLabelsContainer.querySelectorAll('div'));
    
    childDivs.sort((a, b) => {
      const scoreA = Number(a.getAttribute('data-score'));
      const scoreB = Number(b.getAttribute('data-score'));
      return scoreB - scoreA;
    });

    // Clear and re-append in sorted order
    childDivs.forEach((div) => {
      this.playerLabelsContainer.removeChild(div);
    });

    childDivs.forEach((div) => {
      this.playerLabelsContainer.appendChild(div);
    });
  }
}

window.UIManager = UIManager;
