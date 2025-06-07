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

router.post('/guest', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Name required' });
  }
  db.createPlayer(username);
  req.session.user = { username, guest: true };
  res.json({ message: 'Guest' });
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  res.json({ username: req.session.user.username });
});

module.exports = router;
