const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    const existing = await db.getPlayer(username);
    if (existing && existing.password_hash) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.createPlayer(username, passwordHash);
    res.json({ message: 'Registered' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const player = await db.getPlayer(username);
    if (!player || !player.password_hash) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const match = await bcrypt.compare(password, player.password_hash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // set session
    req.session.user = { username };
    res.json({ message: 'Logged in' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/guest', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Name required' });
  }
  
  try {
    // Check if username already exists (registered or guest)
    const existing = await db.getPlayer(username);
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    await db.createPlayer(username);
    req.session.user = { username, guest: true };
    res.json({ message: 'Guest' });
  } catch (error) {
    console.error('Guest creation error:', error);
    res.status(500).json({ message: 'Failed to create guest' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  res.json({ username: req.session.user.username });
});

module.exports = router;
