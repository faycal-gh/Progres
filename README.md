# Progres - Algerian Student Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Contribution Guidelines](https://img.shields.io/badge/Contributor%20Guide-READ-blue?style=for-the-badge&logo=github)](docs/CONTRIBUTING.md)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/projects/jdk/17/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

An application for Algerian students to access and track their academic data from the Progres MESRS platform. Built with **Spring Boot** backend and **Next.js** frontend.

---

##  Quick Start

Choose your preferred setup method:

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/faycal-gh/Progres
cd Progres

# Set up environment
cp .env.example .env
# Edit .env and set your JWT_SECRET (generate with: openssl rand -base64 32)

# Start both frontend and backend
docker compose up --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger-ui/index.html

### Option 2: Local Development (Without Docker)

#### Prerequisites
- **Java 17** or higher
- **Node.js 18+** with **pnpm** (or npm)
- **Maven 3.9+** (optional — wrapper included)

#### Step 1: Set up environment

```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET (generate with: openssl rand -base64 32)
```

#### Step 2: Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend will be available at: **http://localhost:8080**

#### Step 3: Start the Frontend

Open a new terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend will be available at: **http://localhost:3000**

---

##  Project Structure

```
Progres/
├── .env.example                # Environment template (committed)
├── .env                        # Your local secrets (gitignored)
├── docker-compose.yml          # Docker orchestration
├── backend/                    # Spring Boot API
│   ├── src/main/java/          # Java source code
│   ├── src/main/resources/     # Configuration files
│   ├── Dockerfile              # Docker build
│   ├── pom.xml                 # Maven dependencies
│   └── README.md               # Backend documentation
├── frontend/                   # Next.js Frontend
│   ├── src/app/                # App router pages
│   ├── src/components/         # React components
│   ├── src/contexts/           # React contexts
│   └── Dockerfile              # Docker build
└── README.md                   # This file
```

---

## ️ Environment Configuration

All environment variables are managed via a single `.env` file in the project root. Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | **Yes** | — | Base64-encoded 256-bit secret for JWT signing |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed origins |
| `SPRING_PROFILES_ACTIVE` | No | `default` | Spring profile (`default` or `prod`) |
| `GROQ_API_KEY` | No | — | Groq API key for AI recommendations |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8080/api` | Backend API URL for the frontend |

Generate a secure JWT secret: `openssl rand -base64 32`

---

##  API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate with Progres credentials |
| `/api/auth/logout` | POST | Logout and invalidate token |
| `/api/student/data` | GET | Get student academic data |
| `/api/student/exams/{id}` | GET | Get exam results |
| `/api/recommendations` | POST | Get AI major recommendations |
| `/actuator/health` | GET | Health check |
| `/swagger-ui/index.html` | GET | Interactive API docs |

> **External Documentation**: For detailed information about the upstream MESRS API, see [Progres API Documentation](./progres_api_docs.md).

---

## ️ Architecture

```
┌─────────────────┐          ┌─────────────────┐
│   Next.js       │  HTTP    │  Spring Boot    │
│   Frontend      │ ───────► │  Backend        │
│   (Port 3000)   │          │  (Port 8080)    │
└─────────────────┘          └────────┬────────┘
                                      │
                                      │ HTTPS
                                      ▼
                             ┌─────────────────┐
                             │  Progres API    │
                             │ mesrs.dz        │
                             └─────────────────┘
```

### Key Features

-  **JWT Authentication** with token blacklisting
-  **Rate Limiting** (100 requests per 15 minutes)
-  **CORS Protection** with configurable origins
-  **Security Headers** (CSP, HSTS, XSS Protection)
-  **AI Recommendations** using Groq LLM
-  **API Documentation** with Swagger UI

---

##  Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up --build

# Remove all containers and volumes
docker compose down -v
```

---

##  Testing

### Backend Tests

```bash
cd backend
mvn test
```

### Frontend Tests

```bash
cd frontend
pnpm test
```

---

##  Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

---

##  License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

**Made with ️ for Algerian Students**
