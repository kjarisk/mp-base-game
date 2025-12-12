# 📁 Project Structure Guide

This document explains the organized structure of your multiplayer game project.

## 🏗️ Root Directory Structure

```
multiplayer-game-starter/
├── 📂 backend/                 # Server-side application
├── 📂 frontend/                # Client-side application
├── 📂 config/                  # Configuration files
├── 📂 docs/                    # Documentation
├── 📂 scripts/                 # Deployment & utility scripts
├── 📂 shared/                  # Code shared between frontend/backend
├── 📂 test/                    # Test files
├── 📂 .github/workflows/       # GitHub Actions CI/CD
├── 📄 package.json             # Dependencies and scripts
├── 📄 readme.md                # Main project documentation
├── 📄 LICENSE                  # License file
└── 📄 .gitignore               # Git ignore rules
```

## 🔧 Backend Structure (`/backend/`)

```
backend/
├── 📂 config/          # Environment configuration
├── 📂 database/        # Database abstraction layer
├── 📂 middleware/      # Express middleware
├── 📂 models/          # Data models
├── 📂 routes/          # API endpoints
├── 📂 services/        # Business logic
├── 📂 socket/          # WebSocket handlers
├── 📂 utils/           # Utilities and helpers
└── 📄 server.js        # Main server entry point
```

### Key Backend Files:
- **`server.js`**: Main application entry point
- **`database/index.js`**: Database abstraction (PostgreSQL + in-memory)
- **`socket/SocketHandler.js`**: Real-time game communication
- **`services/GameService.js`**: Core game logic
- **`config/index.js`**: Environment configuration

## 🎮 Frontend Structure (Hybrid React + Vanilla JS)

```
frontend-react/
├── 📂 src/                  # React application
│   ├── 📂 components/       # React UI components
│   │   ├── 📄 Login.jsx     # Login/Register page
│   │   ├── 📄 Lobby.jsx     # Game lobby
│   │   ├── 📄 Game.jsx      # Game wrapper
│   │   └── 📄 Leaderboard.jsx # Score display
│   ├── 📂 context/          # React context/state management
│   │   ├── � AppContext.jsx # Auth & app state
│   │   └── 📄 GameContext.jsx # Game state & vanilla JS integration
│   └── 📄 App.jsx           # Main React app
└── public/
    ├── 📂 js/
    │   ├── 📂 classes/      # Game object classes (vanilla JS)
    │   ├── 📄 dev-config.js # Development configuration
    │   ├── 📄 frontend.js   # Game initialization
    │   ├── 📄 eventListeners.js # Input handling
    │   └── 📄 sanitizeHtml.js # Security utilities
    ├── � styles/
    │   └── 📄 style.css     # Game styling
    └── � img/              # Game assets
```

### Key Frontend Files:
- **React Components**: All UI (Login, Lobby, Game wrapper, Leaderboard)
- **Context**: Clean state management and vanilla JS integration
- **`js/classes/`**: Game logic (Player, Enemy, Projectile, GameController)
- **`js/frontend.js`**: Game initialization and core game loop

## ⚙️ Configuration (`/config/`)

```
config/
├── 📄 .env                     # Local development
├── 📄 .env.example             # Environment template
├── 📄 .env.test                # Test environment
├── 📄 .env.production          # Production environment
├── 📄 ecosystem.test.json      # PM2 test configuration
└── 📄 ecosystem.production.json # PM2 production configuration
```

### Environment Variables:
- **NODE_ENV**: Environment (development/test/production)
- **PORT**: Server port
- **DATABASE_URL**: PostgreSQL connection (optional)
- **SESSION_SECRET**: Session encryption key

## 📚 Documentation (`/docs/`)

```
docs/
├── 📄 QUICK-START.md      # Essential setup and usage guide
├── 📄 TROUBLESHOOTING.md  # Common issues and fixes
├── 📄 PROJECT-STRUCTURE.md # This file - project organization
└── 📄 CONFIGURATION.md    # Environment vs Game configuration
```

## 🚀 Scripts & Automation (`/scripts/`)

```
scripts/
├── 📄 deploy.sh           # Deployment automation
└── 📄 migrate.sh          # Database migration
```

## 🔀 Shared Code (`/shared/`)

```
shared/
└── 📄 constants.js        # Constants used by both frontend/backend
```

## 🧪 Testing (`/test/`)

```
test/
└── 📄 server.test.js      # Server startup tests
```

## 🤖 CI/CD (`/.github/workflows/`)

```
.github/workflows/
├── 📄 deploy-test.yml     # Auto-deploy to test on main push
├── 📄 promote-to-prod.yml # Manual production deployment
└── 📄 test.yml            # Continuous testing
```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **Backend**: API, database, game logic
- **Frontend**: UI, client-side game rendering
- **Config**: Environment-specific settings
- **Docs**: All documentation in one place

### 2. **Environment Isolation**
- **Development**: Local with in-memory database
- **Test**: Server environment for testing
- **Production**: Live environment with PostgreSQL

### 3. **Scalability**
- **Service Layer**: Business logic separated from routes
- **Database Abstraction**: Easy to switch storage backends
- **Process Management**: PM2 for production clustering

### 4. **Maintainability**
- **Clear folder structure**: Easy to find files
- **Consistent naming**: Predictable file locations
- **Documentation**: Everything documented

## 📋 File Naming Conventions

- **Folders**: lowercase with hyphens (`kebab-case`)
- **Config files**: descriptive names (`ecosystem.test.json`)
- **JavaScript**: PascalCase for classes (`Player.js`)
- **HTML/CSS**: lowercase (`game.html`, `style.css`)
- **Documentation**: UPPERCASE (`.md` files)

## 🔄 Development Workflow

1. **Local Development**: Work in `/backend/` and `/frontend/`
2. **Configuration**: Manage in `/config/`
3. **Documentation**: Update in `/docs/`
4. **Testing**: Run from `/test/`
5. **Deployment**: Automated via GitHub Actions

This structure supports both **rapid game development** and **production scalability**! 🎮✨
