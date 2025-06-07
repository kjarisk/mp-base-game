const express = require('express');
const session = require('express-session');
const { createServer } = require('node:http');
const { join } = require('node:path');

// socket io
const { Server } = require('socket.io');

// simple JSON persistence for players
const db = require('./db');

// load existing player data before setting up routes or sockets
db.loadPlayers();
const authRoutes = require('./routes/auth');
const questRoutes = require('./routes/quests');

const app = express();
const server = createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.static('public'));
app.use(authRoutes);
app.use(questRoutes);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/lobby.html', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'lobby.html'));
});

// register socket handlers in separate module
require('./socketHandlers')(io);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

console.log('server load');
