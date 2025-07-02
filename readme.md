# Multiplayer Game Starter

A modern, scalable multiplayer game starter with robust backend architecture, PostgreSQL support, and automated CI/CD deployment.

## Features

- **Modern Backend Architecture**: Organized service layers, middleware, and database abstraction
- **Dual Database Support**: PostgreSQL for production with in-memory fallback for development
- **Real-time Multiplayer**: Socket.IO-based game rooms and player interactions
- **Authentication System**: Session-based auth with guest mode support
- **Automated CI/CD**: GitHub Actions workflows for test and production deployment
- **Production Ready**: PM2 process management, health checks, and environment separation

## Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server (uses in-memory storage by default)
npm run dev

# Or start with PostgreSQL (requires DATABASE_URL in .env)
npm start
```

Visit `http://localhost:3000` to access the game lobby.

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

frontend/
├── public/         # Static HTML pages
├── js/             # Client-side JavaScript
│   ├── classes/    # Game object classes
│   └── *.js        # Page-specific scripts
└── styles/         # CSS stylesheets

config/             # Configuration files
docs/               # Documentation
scripts/            # Deployment scripts
shared/             # Shared constants
test/               # Test suite
```

For detailed structure explanation, see [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md).

## Documentation

- **[Getting Started](./readme.md)** - This file
- **[Project Structure](./docs/PROJECT-STRUCTURE.md)** - Detailed structure guide
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Complete deployment instructions
- **[Linode Setup](./docs/LINODE-SETUP.md)** - Server setup steps
- **[CI/CD Setup](./docs/CI-CD-SETUP.md)** - GitHub Actions configuration
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[PM2 & Nginx Troubleshooting](./docs/PM2-NGINX-TROUBLESHOOTING.md)** - Server configuration fixes

## Management Scripts

### Server Management
```bash
# Complete server reset and setup
./scripts/server-fix.sh full-fix

# Check current status
./scripts/server-fix.sh status

# Clean PM2 processes
./scripts/server-fix.sh clean

# Start applications
./scripts/server-fix.sh start
```

### Backup Management
```bash
# Initialize backup system
./scripts/backup-manager.sh init

# Create database backup
./scripts/backup-manager.sh backup test
./scripts/backup-manager.sh backup production

# List available backups
./scripts/backup-manager.sh list

# Clean old backups
./scripts/backup-manager.sh cleanup
```

### Common Fixes
- **502 Bad Gateway**: Run `./scripts/server-fix.sh full-fix`
- **PM2 Process Errors**: Run `./scripts/server-fix.sh clean && ./scripts/server-fix.sh start`
- **Port Conflicts**: Run `./scripts/server-fix.sh ports`
- **Backup Organization**: Run `./scripts/backup-manager.sh organize`

## Environment Configuration

Create environment files for different deployments:

**Development (.env)**
```bash
NODE_ENV=development
PORT=3000
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
