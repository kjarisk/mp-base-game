const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const existing = db.getPlayer(username);
  if (existing && existing.passwordHash) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.createPlayer(username, passwordHash);
  res.json({ message: 'Registered' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const player = db.getPlayer(username);
  if (!player || !player.passwordHash) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, player.passwordHash);
  if (!match) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // set session
  req.session.user = { username };
  res.json({ message: 'Logged in' });
});

module.exports = router;
