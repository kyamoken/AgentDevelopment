# Real-time Chat Application

A comprehensive real-time chat application built with React Native for mobile and Node.js for the backend, following the technical specifications outlined in this repository.

## 🏗️ Architecture Overview

```
[React Native App (Frontend)]
        │ HTTPS/WebSocket (wss://)
        ▼
     [Nginx Reverse Proxy]
        │ ──── API/WS ────▶ [Node.js + Express + Socket.IO (Backend)]
                                     │
                                     └───▶ [PostgreSQL Database]
```

## 📁 Project Structure

```
AgentDevelopment/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── services/           # Business logic
│   │   ├── models/             # TypeORM entities
│   │   ├── routes/             # API routes
│   │   ├── middlewares/        # Express middlewares
│   │   ├── config/             # Configuration files
│   │   └── utils/              # Utility functions
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # React Native frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── screens/            # App screens
│   │   ├── store/              # Redux store
│   │   ├── services/           # API and socket services
│   │   ├── utils/              # Utility functions
│   │   └── assets/             # Images, fonts, etc.
│   ├── App.tsx
│   └── package.json
├── nginx/                      # Nginx configuration
├── .github/workflows/          # CI/CD workflows
├── docker-compose.dev.yml      # Development environment
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (>=18.x)
- npm or yarn
- Docker & Docker Compose (for development environment)
- PostgreSQL (if running without Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/kyamoken/AgentDevelopment.git
cd AgentDevelopment
```

### 2. Setup Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

#### Frontend
```bash
cd frontend
# Update API URLs in src/services/api.ts and src/services/socket.ts
```

### 3. Development with Docker (Recommended)

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Check service status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

### 4. Manual Development Setup

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Database
```bash
# Using Docker
docker run --name chatapp-postgres -e POSTGRES_DB=realtime_chat -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Or install PostgreSQL locally and create database
createdb realtime_chat
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
```

### End-to-End Testing
```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Run E2E tests (when implemented)
npm run test:e2e
```

## 📱 Features

### Current Implementation
- ✅ Backend API foundation with Express.js
- ✅ WebSocket server with Socket.IO
- ✅ TypeORM database models
- ✅ React Native app foundation
- ✅ Redux state management
- ✅ Navigation setup
- ✅ Docker development environment
- ✅ CI/CD pipeline with GitHub Actions

### Planned Features
- [ ] User authentication (JWT)
- [ ] Real-time messaging
- [ ] Conversation management
- [ ] Typing indicators
- [ ] Message history
- [ ] Push notifications
- [ ] File/image sharing
- [ ] Group chats
- [ ] Online status

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js (>=18.x)
- **Framework:** Express.js
- **WebSocket:** Socket.IO
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT
- **Logging:** Winston
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **Navigation:** React Navigation
- **UI Components:** React Native Paper
- **API Client:** Axios
- **WebSocket:** Socket.IO Client

### Infrastructure
- **Reverse Proxy:** Nginx
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Environment:** Development, Staging, Production

## 🚦 API Endpoints

### Health Check
- `GET /health` - Service health status

### Authentication (Planned)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Conversations (Planned)
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id/messages` - Get conversation messages

### WebSocket Events
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a new message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

## 🔧 Development

### Code Quality
```bash
# Backend
cd backend
npm run typecheck       # TypeScript type checking
npm run lint           # Code linting
npm run build          # Build for production

# Frontend
cd frontend
npm run typecheck      # TypeScript type checking
npm run lint          # Code linting
```

### Database Migrations
```bash
cd backend
npm run migration:generate -- -n CreateInitialTables
npm run migration:run
npm run migration:revert
```

## 📦 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend (for web)
cd frontend
npm run build
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Issues & Support

Please use the GitHub Issues tab to report bugs or request features.

---

**Note:** This is the initial project foundation. Many features are planned but not yet implemented. Check the GitHub Issues and Projects tabs for the current development roadmap.