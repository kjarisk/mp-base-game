const quests = [
  { id: 'practice', description: 'Play a game', goal: 1 },
  { id: 'shooter', description: 'Shoot 10 projectiles', goal: 10 },
  { id: 'winner', description: 'Reach 5 points', goal: 5 }
];

function getQuests() {
  return quests;
}

module.exports = {
  getQuests
};
