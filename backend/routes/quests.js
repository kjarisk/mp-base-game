const express = require('express');
const db = require('../database');
const quests = require('../models/quest');

const router = express.Router();

router.get('/quests', async (req, res) => {
  const username = req.session.user?.username;
  try {
    const questState = username ? await db.getQuestState(username) : {};
    res.json({ quests: quests.getQuests(), questState });
  } catch (error) {
    console.error('Quest fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch quests' });
  }
});

router.post('/quests/update', async (req, res) => {
  const username = req.session.user?.username;
  if (!username) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const questState = req.body.questState;
  if (typeof questState !== 'object') {
    return res.status(400).json({ message: 'Invalid quest state' });
  }
  
  try {
    await db.updateQuestState(username, questState);
    res.json({ message: 'Updated' });
  } catch (error) {
    console.error('Quest update error:', error);
    res.status(500).json({ message: 'Failed to update quests' });
  }
});

module.exports = router;
