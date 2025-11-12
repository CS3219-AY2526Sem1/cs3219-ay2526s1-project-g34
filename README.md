[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)
# CS3219 Project (PeerPrep) - AY2526S1
## Group: G34

## 📖 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Application Architecture](#application-architecture)
- [Accessing the Application](#accessing-the-application)
- [Using PeerPrep](#using-peerprep)
- [Managing Docker Containers](#managing-docker-containers)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## 🎯 Overview

PeerPrep is a collaborative coding platform built with microservices architecture. It allows users to:
- Create and join coding sessions
- Collaborate in real-time with other developers
- Work on coding problems together
- Manage questions and matches

## ✅ Prerequisites

Before running the application, ensure you have the following installed:

1. **Docker Desktop** (version 20.10 or higher)
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify installation: `docker --version`

2. **Docker Compose** (usually included with Docker Desktop)
   - Verify installation: `docker compose version`

3. **Git** (to clone the repository)
   - Verify installation: `git --version`

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cs3219-ay2526s1-project-g34-master
```

### 2. Start the Application
```bash
docker compose up -d
```

This command will:
- Build all Docker images (first time only)
- Create and start all containers in the background
- Set up the database with required tables

**First-time build may take 2-5 minutes. Subsequent starts are much faster.**

### 3. Verify Services are Running
```bash
docker compose ps
```

You should see 6 containers running:
- `frontend` - React web application
- `user_service` - User authentication and management
- `question_service` - Question management
- `collaboration_service` - Real-time collaboration with WebSocket
- `gateway` - API gateway
- `db` - PostgreSQL database

### 4. Access the Application
Open your web browser and navigate to:
```
http://localhost
```

## 🏗️ Application Architecture

The application consists of 6 microservices:

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 80 | React application (Vite + nginx) |
| **User Service** | 3001 | Authentication and user management |
| **Question Service** | 3002 | CRUD operations for coding questions |
| **Collaboration Service** | 3003 | Real-time code collaboration via WebSocket |
| **Gateway** | 3000 | API gateway for routing requests |
| **Database** | 5432 | PostgreSQL database |

### Technology Stack
- **Frontend**: React 18, Vite, React Router, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: PostgreSQL 15
- **Authentication**: JWT with RSA keys
- **Containerization**: Docker & Docker Compose

## 🌐 Accessing the Application

Once all services are running, you can access:

- **Web Application**: http://localhost
- **User Service API**: http://localhost:3001
- **Question Service API**: http://localhost:3002
- **Collaboration Service**: http://localhost:3003
- **Gateway API**: http://localhost:3000
- **Database**: localhost:5432 (credentials in docker-compose.yml)

## 👥 Using PeerPrep

### First Time Setup

1. **Create an Account**
   - Navigate to http://localhost
   - Click "Don't have an account? Sign up"
   - Enter username, email, and password
   - Click "Sign Up"

2. **Login**
   - Enter your username and password
   - Click "Sign In"
   - You'll be redirected to the home page

### Creating a Match

1. From the home page, click "Create Match"
2. Select a difficulty level (Easy, Medium, Hard)
3. Click "Create Match"
4. You'll be redirected to the match room

### Joining a Match

1. From the home page, click "View Matches"
2. Browse available matches
3. Click "Join" on a match with "waiting" status
4. You'll enter the collaborative coding room

### Collaborative Coding

- **Real-time Sync**: Your code changes are automatically synced with other participants
- **Connection Status**: Check the status badge (Connected/Disconnected)
- **Session Info**: View session details in the right sidebar
- **End Session**: Click "End Session" when done

## 🐳 Managing Docker Containers

### Docker Compose Files

The project has two Docker Compose configurations:

1. **`docker-compose.yml`** - **Main file (use this)** ✅
   - Complete application stack with all 6 services
   - Production-ready configuration
   - **This is what you should use for normal operation**
   
2. **`dev.docker-compose.yml`** - Database-only configuration
   - Only runs PostgreSQL database
   - For developers who want to run services locally (npm start) with containerized DB
   - Usage: `docker compose -f dev.docker-compose.yml up -d`

**For most use cases, use the main `docker-compose.yml` file.**

### Start the Application
```bash
docker compose up -d
```
- `-d` flag runs containers in detached mode (background)

### Stop the Application
```bash
docker compose down
```
- Stops and removes all containers
- Preserves data in the database volume

### View Running Containers
```bash
docker compose ps
```

### View Logs
```bash
# View all service logs
docker compose logs

# View logs for a specific service
docker compose logs frontend
docker compose logs user_service
docker compose logs collaboration_service

# Follow logs in real-time
docker compose logs -f

# View last 50 lines
docker compose logs --tail=50
```

### Rebuild Services
```bash
# Rebuild all services
docker compose build

# Rebuild without cache (clean build)
docker compose build --no-cache

# Rebuild specific service
docker compose build frontend
```

### Restart a Service
```bash
# Restart specific service
docker compose restart frontend

# Rebuild and restart
docker compose up -d --build frontend
```

### Stop and Remove Everything (including volumes)
```bash
docker compose down -v
```
⚠️ **Warning**: This will delete all database data!

## 🔧 Troubleshooting

### Issue: Port Already in Use
**Error**: `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution**:
```bash
# Stop the conflicting service
docker compose down

# Or change the port in docker-compose.yml
```

### Issue: Services Not Starting
**Solution**:
```bash
# Check service status
docker compose ps

# View error logs
docker compose logs

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Issue: Frontend Shows Old Version
**Solution**:
```bash
# Clear browser cache
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R

# Or rebuild frontend
docker compose build frontend --no-cache
docker compose up -d frontend
```

### Issue: Database Connection Error
**Solution**:
```bash
# Wait for database to be healthy
docker compose ps

# Check database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Issue: WebSocket Connection Failed
**Solution**:
- Verify collaboration_service is running: `docker compose ps`
- Check logs: `docker compose logs collaboration_service`
- Ensure port 3003 is accessible

## 🛠️ Development

### Project Structure
```
cs3219-ay2526s1-project-g34-master/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   └── utils/           # Utility functions
│   ├── Dockerfile
│   └── nginx.conf
├── user_service/            # User authentication service
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── question_service/        # Question management service
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── collaboration_service/   # Real-time collaboration service
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── gateway/                 # API gateway
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Docker orchestration
└── README.md
```

### Making Changes

1. **Edit Source Code**: Make changes to files in the respective service folder
2. **Rebuild Service**: `docker compose build <service-name>`
3. **Restart Service**: `docker compose up -d <service-name>`
4. **Test Changes**: Access the application and verify

### Environment Variables

Environment variables are configured in `docker-compose.yml`:
- Database credentials
- Service URLs
- Port configurations

### Database Access

To access PostgreSQL database directly:
```bash
docker compose exec db psql -U peerprep -d peerprep
```

Common SQL commands:
```sql
-- List all tables
\dt

-- View users
SELECT * FROM "Users";

-- View questions
SELECT * FROM "Questions";

-- Exit
\q
```

## 📝 API Endpoints

### User Service (port 3001)
- `POST /auth/signup` - Create new user
- `POST /auth/login` - User login
- `GET /users` - Get all users (admin)
- `PATCH /users/:id` - Update user

### Question Service (port 3002)
- `GET /questions` - Get all questions
- `POST /questions` - Create question
- `GET /questions/:id` - Get question by ID
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

### Collaboration Service (port 3003)
- WebSocket connection for real-time collaboration
- Events: `join-match`, `code-update`, `end-match`
# AI Usage Disclosure 

## Overview
This segment provides complete transparency regarding AI assistance used in this project's development.
---

## AI Tools Used

**Primary Tool:** GitHub Copilot Chat
- **Model:** Claude Sonnet 4.5 
- **Usage Date:** 7, 12 November 2024 
- **Purpose:** Code generation, debugging, refactoring, documentation

---

## Prohibited Phases (NOT Used)

AI was explicitly **NOT** used for:
- Requirements elicitation
- System architecture design decisions
- Project features ideas and functionalities
- High-level design choices
- Security policy decisions
- Deployment strategy planning

These critical decisions were made entirely by the development team.

---

## Allowed Uses (Where AI Was Applied)

### 1. Feature Implementation 
**Task:** Enhanced Code Editor with Syntax Highlighting
- **AI Contribution:** 
  - Generated CodeEditor component with react-syntax-highlighter
  - Created language selection UI
  - Implemented Socket.IO integration for language sync
- **Developer Actions:**
  - Reviewed all generated code for correctness
  - Tested with 14+ programming languages
  - Verified backward compatibility
  - Validated performance with large files
- **Files:** 
  - `frontend/src/components/CodeEditor.jsx`
  - `frontend/package.json`, `frontend/src/pages/MatchRoom.jsx`, `collaboration_service/server.js`

### 2. UI Refinement 
**Task:** Simplify status display messages
- **AI Contribution:** Made precise text changes per specifications
- **Developer Actions:** Visual verification and approval
- **Files:** `frontend/src/pages/MatchRoom.jsx`

---

## Verification Process

### All AI-Generated Code Was:
1. **Reviewed** - Line-by-line code review by developers
2. **Understood** - Developers comprehended all logic and patterns
3. **Tested** - Comprehensive manual and integration testing
4. **Modified** - Adjusted where necessary for project requirements

### Testing Performed:
- **Functional Testing:** All features tested with real user scenarios
- **Integration Testing:** Socket.IO events between frontend and backend
- **Edge Case Testing:** Network failures, reconnections, concurrent edits
- **Cross-Browser Testing:** Chrome, Firefox, Safari
- **Performance Testing:** Large code files (1000+ lines), multiple users
- **Security Review:** Validated all changes don't introduce vulnerabilities



## Developer Contributions

### Beyond AI Assistance:
1. **Requirement Definition** - All feature requirements defined by team
2. **Architecture Understanding** - Deep understanding of microservices setup
3. **Security Decisions** - Made informed choices about SSL bypass for dev environment
4. **Testing Strategy** - Designed comprehensive test scenarios
5. **Code Review** - Reviewed every AI suggestion critically
6. **UI/UX Decisions** - Final approval on visual design
7. **Integration** - Ensured AI-generated code worked with existing system
8. **Quality Assurance** - Validated correctness, performance, and security

## Detailed Prompt Log

See `/ai/usage-log.md` for:
- Exact prompts given to AI
- AI responses and suggestions
- Actions taken (accepted/modified/rejected)
- Developer notes on each interaction

## 🤝 Contributing

This project is developed by Team G34 for CS3219 AY2526S1.

### Note: 
- Individual microservices are developed within separate folders
- The teaching team has access to view repository history 
