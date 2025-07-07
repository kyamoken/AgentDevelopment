# Development Setup Instructions

## Quick Development Start

This document provides step-by-step instructions for setting up the development environment for the real-time chat application.

## Option 1: Docker Development (Recommended)

### Prerequisites
- Docker
- Docker Compose

### Steps
1. **Clone and Setup**
   ```bash
   git clone https://github.com/kyamoken/AgentDevelopment.git
   cd AgentDevelopment
   ```

2. **Start Development Environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Verify Services**
   ```bash
   # Check if all services are running
   docker-compose -f docker-compose.dev.yml ps
   
   # Test backend API
   curl http://localhost/health
   
   # View logs
   docker-compose -f docker-compose.dev.yml logs -f backend
   ```

## Option 2: Manual Local Development

### Prerequisites
- Node.js (>=18.x)
- PostgreSQL
- npm

### Backend Setup
1. **Database Setup**
   ```bash
   # Install PostgreSQL and create database
   createdb realtime_chat
   ```

2. **Backend Configuration**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env file with your database credentials
   npm install
   npm run dev
   ```

### Frontend Setup
1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

## Testing the Setup

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test -- --watchAll=false
```

### API Health Check
```bash
curl http://localhost:3000/health
# Expected response: {"status":"OK","timestamp":"...","service":"realtime-chat-backend"}
```

## Development Commands

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run typecheck` - TypeScript type checking

### Frontend
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run web version
- `npm test` - Run tests
- `npm run typecheck` - TypeScript type checking

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process or change the port in .env
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   # Verify credentials in .env file
   ```

3. **Node Modules Issues**
   ```bash
   # Clear and reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Docker Issues**
   ```bash
   # Rebuild containers
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml build --no-cache
   docker-compose -f docker-compose.dev.yml up -d
   ```

### Development Tips

1. **Hot Reload**: Both backend and frontend support hot reload during development
2. **Database Reset**: Use `docker-compose down -v` to reset database data
3. **Logs**: Use `docker-compose logs -f [service-name]` to follow logs
4. **Shell Access**: Use `docker-compose exec [service-name] sh` to access container shell

## Next Steps

After setup:
1. Review the technical specification in README.md
2. Check the planned features in PROJECT_README.md
3. Look at the GitHub Issues for current development tasks
4. Start with implementing authentication or basic messaging features