# Multiplayer Game Starter

A modern, scalable multiplayer game starter with robust backend architecture, PostgreSQL support, and automated CI/CD deployment.

## Features

- **Modern Backend Architecture**: Organized service layers, middleware, and database abstraction
- **Dual Database Support**: PostgreSQL for production with in-memory fallback for development
- **Real-time Multiplayer**: Socket.IO-based game rooms and player interactions
- **Authentication System**: Session-based auth with guest mode support
- **Hybrid Architecture**: React UI components for pages (Login, Lobby) + vanilla JS game logic for canvas/gameplay
- **Automated CI/CD**: GitHub Actions workflows for test and production deployment
- **Production Ready**: PM2 process management, health checks, and environment separation

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start React hybrid frontend (ONLY option now)
npm run dev:react
# Backend: http://localhost:3005
# React UI: http://localhost:8000
```

### About the Hybrid Architecture

This project uses a hybrid architecture:
- **React Components**: Handle UI pages (Login, Lobby, Game wrapper)  
- **Vanilla JS Game Logic**: Handles canvas rendering and game mechanics
- **Single Frontend**: All assets consolidated in `frontend-react/`

Benefits:
- Modern component-based UI
- Hot reloading for UI development  
- Game logic remains vanilla JS for performance
- Single source of truth for all frontend code

### Production
```bash
# Start production mode
npm start
```

### Production Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## Architecture

```
backend/
├── config/          # Environment configuration
├── database/        # Database abstraction layer (PostgreSQL + in-memory)
├── middleware/      # Express middleware
├── models/          # Data models and schemas
├── routes/          # API route handlers
├── services/        # Business logic layer
├── socket/          # Socket.IO event handlers
└── utils/          # Logging and utilities

frontend-react/     # Single React frontend
├── public/         # Static assets (js, img, styles from game)
├── src/
│   ├── components/ # React components (Login, Lobby, Game)
│   ├── api.js      # API integration
│   └── config.js   # Frontend configuration
└── vite.config.js  # Vite build configuration

config/             # Configuration files
docs/               # Documentation
scripts/            # Deployment scripts
shared/             # Shared constants
test/               # Test suite
```

For detailed structure explanation, see [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md).

## Documentation

- **[Quick Start Guide](./docs/QUICK-START.md)** - Get up and running fast
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Fix common issues
- **[Project Structure](./docs/PROJECT-STRUCTURE.md)** - Understand the codebase
- **[Configuration Guide](./docs/CONFIGURATION.md)** - Environment vs Game config

## Environment Configuration

Create environment files for different deployments:

**Development (.env)**
```bash
NODE_ENV=development
PORT=3005
SESSION_SECRET=dev-secret-key
# Leave DATABASE_URL empty for in-memory storage
```

**Production (config/.env.production)**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/gamedb
SESSION_SECRET=strong-production-secret
```

## Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run test suite
npm run migrate    # Run database migrations
npm run health     # Check server health
npm run logs       # View PM2 logs
```

## Database

The application supports both PostgreSQL and in-memory storage:

- **PostgreSQL**: Set `DATABASE_URL` environment variable
- **In-Memory**: Leave `DATABASE_URL` empty (default for development)

Data automatically migrates between storage types without code changes.

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
```

## Deployment

The project includes automated GitHub Actions workflows:

- **Test Deployment**: Automatic on push to `main`
- **Production Deployment**: Manual trigger with confirmation
- **Continuous Testing**: On pull requests and pushes

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed setup instructions.

## Game Features

- **Player Authentication**: Login system with guest mode
- **Real-time Lobbies**: Create and join game rooms
- **Multiplayer Gameplay**: Socket.IO-powered real-time interactions
- **Quest System**: Configurable game objectives
- **Responsive UI**: Modern web interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.
