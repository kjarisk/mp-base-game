const express = require('express');
const db = require('../db');
const quests = require('../models/quest');

const router = express.Router();

router.get('/quests', (req, res) => {
  const username = req.session.user?.username;
  const questState = username ? db.getQuestState(username) : {};
  res.json({ quests: quests.getQuests(), questState });
});

router.post('/quests/update', (req, res) => {
  const username = req.session.user?.username;
  if (!username) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const questState = req.body.questState;
  if (typeof questState !== 'object') {
    return res.status(400).json({ message: 'Invalid quest state' });
  }
  db.updateQuestState(username, questState);
  res.json({ message: 'Updated' });
});

module.exports = router;
