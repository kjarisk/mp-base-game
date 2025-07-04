const express = require('express');
const session = require('express-session');
const { createServer } = require('node:http');
const { join } = require('node:path');

// Configuration and utilities
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');

// Socket IO
const { Server } = require('socket.io');
const SocketHandler = require('./socket/SocketHandler');

// Database and routes
const db = require('./database');
const authRoutes = require('./routes/auth');
const questRoutes = require('./routes/quests');

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    ...config.socket,
    cors: {
      origin: process.env.NODE_ENV === 'development' ? ['http://localhost:8080', 'http://localhost:3000'] : false,
      credentials: true
    }
  });

  // Initialize database
  try {
    await db.initializeDatabase();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    process.exit(1);
  }

  const port = config.server.port;

  // CORS middleware for development
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: config.server.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );

  app.use(express.static(join(__dirname, '../frontend/public')));
  app.use(authRoutes);
  app.use(questRoutes);
  app.use('/api/game', require('./routes/game'));
  app.use('/api', require('./routes/game')); // Also mount game routes under /api for guest-name endpoint

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: db.usePostgres ? 'PostgreSQL' : 'In-Memory'
    });
  });

  // Stats endpoint for monitoring
  app.get('/stats', (req, res) => {
    try {
      const stats = socketHandler.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/public', 'index.html'));
  });

  app.get('/lobby.html', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/public', 'lobby.html'));
  });

  // register socket handlers in separate module
  const socketHandler = new SocketHandler(io);

  // Add error handling middleware
  app.use(errorHandler);

  server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Development mode: ${process.env.NODE_ENV === 'development'}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'production'}`);
  });

// Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(async () => {
      await db.close();
      logger.info('Process terminated');
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(async () => {
      await db.close();
      logger.info('Process terminated');
    });
  });
}

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});
