# Progres - Algerian Student Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Contribution Guidelines](https://img.shields.io/badge/Contributor%20Guide-READ-blue?style=for-the-badge&logo=github)](docs/CONTRIBUTING.md)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/projects/jdk/17/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

An application for Algerian students to access and track their academic data from the Progres MESRS platform. Built with **Spring Boot** backend and **Next.js** frontend.

---

## Quick Start

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
- **Redis** (required for session/token storage)

#### Installing Redis

Redis is required for storing external authentication tokens. Choose your platform:

<details>
<summary><strong>Windows (via WSL2 — Recommended)</strong></summary>

Redis does not run natively on Windows. Use WSL2 (Windows Subsystem for Linux):

```bash
# Open WSL terminal
wsl

# Install Redis
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis -y

# Start Redis
redis-server --daemonize yes

# Verify it's running
redis-cli ping
# Should return: PONG
```

> See the [official Redis on Windows guide](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-windows/) for more details.

</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
brew install redis
brew services start redis
```

</details>

<details>
<summary><strong>Linux (Ubuntu/Debian)</strong></summary>

```bash
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis -y
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

</details>

> **Tip:** If you're using **Docker**, Redis is included automatically — no manual installation needed.

#### Step 1: Set up environment

```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET (generate with: openssl rand -base64 32)
```

#### Step 2: Start Redis (if not already running)

```bash
# Windows (in WSL terminal)
wsl redis-server --daemonize yes

# macOS / Linux
redis-server --daemonize yes
```

#### Step 3: Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend will be available at: **http://localhost:8080**

#### Step 4: Start the Frontend

Open a new terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend will be available at: **http://localhost:3000**

---

## Project Structure

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

| Variable                    | Required | Default                                       | Description                                            |
| --------------------------- | -------- | --------------------------------------------- | ------------------------------------------------------ |
| `JWT_SECRET`                | **Yes**  | —                                             | Base64-encoded 256-bit secret for JWT signing          |
| `CORS_ALLOWED_ORIGINS`      | No       | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed origins                        |
| `SPRING_PROFILES_ACTIVE`    | No       | `default`                                     | Spring profile (`default` or `prod`)                   |
| `GROQ_API_KEY`              | No       | —                                             | Groq API key for AI recommendations                    |
| `NEXT_PUBLIC_API_URL`       | No       | `http://localhost:8080/api`                   | Backend API URL for the frontend                       |
| `EXTERNAL_TOKEN_STORE_TYPE` | No       | `redis`                                       | Token store type (`redis` or `in-memory`)              |
| `REDIS_HOST`                | No       | `localhost`                                   | Redis host (`localhost` for local, `redis` for Docker) |
| `REDIS_PORT`                | No       | `6379`                                        | Redis port                                             |
| `REDIS_PASSWORD`            | No       | —                                             | Redis password (leave empty for local dev)             |

Generate a secure JWT secret: `openssl rand -base64 32`

---

## API Endpoints

| Endpoint                  | Method | Description                           |
| ------------------------- | ------ | ------------------------------------- |
| `/api/auth/login`         | POST   | Authenticate with Progres credentials |
| `/api/auth/logout`        | POST   | Logout and invalidate token           |
| `/api/student/data`       | GET    | Get student academic data             |
| `/api/student/exams/{id}` | GET    | Get exam results                      |
| `/api/recommendations`    | POST   | Get AI major recommendations          |
| `/actuator/health`        | GET    | Health check                          |
| `/swagger-ui/index.html`  | GET    | Interactive API docs                  |

> **External Documentation**: For detailed information about the upstream MESRS API, see [Progres API Documentation](./progres_api_docs.md).

---

## ️ Architecture

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│   Next.js       │  HTTP    │  Spring Boot    │          │     Redis       │
│   Frontend      │ ───────► │  Backend        │ ───────► │  Token Store    │
│   (Port 3000)   │          │  (Port 8080)    │          │  (Port 6379)    │
└─────────────────┘          └────────┬────────┘          └─────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
                             ┌─────────────────┐
                             │  Progres API    │
                             │ mesrs.dz        │
                             └─────────────────┘
```

### Key Features

- **JWT Authentication** with token blacklisting
- **Rate Limiting** (100 requests per 15 minutes)
- **CORS Protection** with configurable origins
- **Security Headers** (CSP, HSTS, XSS Protection)
- **AI Recommendations** using Groq LLM
- **API Documentation** with Swagger UI

---

## Docker Commands

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

## Testing

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

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

**Made with ️ for Algerian Students**
