const quests = [
  { id: 'practice', description: 'Play a game', goal: 1 },
  { id: 'horn', description: 'Honk your horn 5 times', goal: 5 },
  { id: 'winner', description: 'Reach 5 points', goal: 5 }
];

function getQuests() {
  return quests;
}

module.exports = {
  getQuests
};
