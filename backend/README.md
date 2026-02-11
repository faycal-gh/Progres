# Progres API - Backend for Algerian Student Data Access

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/faycal-gh/Progres)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen.svg)](https://spring.io/projects/spring-boot)

A secure, production-ready Spring Boot backend API that serves as an authenticated proxy to Algeria's **Progres** student management system (`progres.mesrs.dz`). Built with modern security practices, JWT authentication, rate limiting, and comprehensive API documentation.

## What is This?

This backend provides a **secure REST API layer** for accessing the Algerian Ministry of Higher Education's Progres system. It handles:

- **JWT Authentication** with token blacklisting for secure logout
- **Rate Limiting** to prevent abuse (100 requests per 15 minutes)
- **CORS Management** for cross-origin requests
- **API Proxying** to the Progres external API
- **Security Headers** (CSP, HSTS, XSS Protection)
- **Health Monitoring** via Spring Actuator
- **API Documentation** with OpenAPI/Swagger

> **Note:** This backend is specifically designed for the Algerian Progres system. To adapt it for other student management systems, you'll need to modify the external API integration in the service layer.

## Quick Start

### Prerequisites

- **Java 17** or higher
- **Maven 3.9+** (or use the included Maven wrapper)
- **Redis** (required for external token storage)
- **Docker** (optional, for containerized deployment)

> **Redis** is used to securely store external API tokens server-side. See the [root README](../README.md#installing-redis) for platform-specific installation instructions.

### Running Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/faycal-gh/Progres
   cd Progres
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env
   # Edit .env and set your JWT_SECRET (generate with: openssl rand -base64 32)
   ```

3. **Start Redis (if running locally):**

   ```bash
   # Windows (WSL)
   wsl redis-server --daemonize yes

   # macOS / Linux
   redis-server --daemonize yes
   ```

4. **Run the application:**

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

5. **Access the application:**
   - API Base URL: `http://localhost:8080`
   - Health Check: `http://localhost:8080/actuator/health`
   - API Documentation: `http://localhost:8080/swagger-ui/index.html`

### Running with Docker

From the project root:

```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET
docker compose up --build
```

## API Documentation

### Authentication Endpoints

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "student_id",
  "password": "student_password"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "uuid": "student-uuid",
  "message": "Authentication successful"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "message": "Logged out successfully",
  "success": true
}
```

### Student Data Endpoints (Authenticated)

#### Get Student Information

```http
GET /api/student/data
Authorization: Bearer <your-jwt-token>
```

Returns the authenticated student's academic information from the Progres system.

#### Get Exam Results

```http
GET /api/student/exams/{id}
Authorization: Bearer <your-jwt-token>
```

Returns exam results for a specific academic period.

### Health & Monitoring

#### Health Check

```http
GET /actuator/health
```

**Response:**

```json
{
  "status": "UP"
}
```

### Interactive API Documentation

Visit `http://localhost:8080/swagger-ui/index.html` for interactive API documentation where you can test all endpoints.

## ️ Configuration

### Environment Variables

All environment variables are managed via a single `.env` file in the project root. See `.env.example` for the template.

| Variable                    | Required | Default                                       | Description                                            |
| --------------------------- | -------- | --------------------------------------------- | ------------------------------------------------------ |
| `JWT_SECRET`                | **Yes**  | —                                             | Base64-encoded 256-bit secret for JWT signing          |
| `CORS_ALLOWED_ORIGINS`      | No       | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed origins                        |
| `SPRING_PROFILES_ACTIVE`    | No       | `default`                                     | Spring profile (`default` or `prod`)                   |
| `GROQ_API_KEY`              | No       | —                                             | Groq API key for AI recommendations                    |
| `EXTERNAL_TOKEN_STORE_TYPE` | No       | `redis`                                       | Token store type (`redis` or `in-memory`)              |
| `REDIS_HOST`                | No       | `localhost`                                   | Redis host (`localhost` for local, `redis` for Docker) |
| `REDIS_PORT`                | No       | `6379`                                        | Redis port                                             |
| `REDIS_PASSWORD`            | No       | —                                             | Redis password (leave empty for local dev)             |

Generate a secure JWT secret: `openssl rand -base64 32`

### Application Profiles

#### Development Profile (default)

- Detailed error messages
- DEBUG logging for application code
- Relaxed CORS settings
- Uses `application.yml`

#### Production Profile

- Minimal error exposure
- WARN/ERROR logging only
- Strict CORS validation
- Requires `JWT_SECRET` to be set
- Uses `application-prod.yml`

Activate with: `export SPRING_PROFILES_ACTIVE=prod`

## ️ Architecture

```
┌─────────────┐
│  Frontend   │
│ (React/Vue) │
└──────┬──────┘
       │ HTTP + JWT
       │
┌──────▼──────────────────────────────────┐
│          Progres API Backend             │
│  ┌────────────────────────────────┐    │
│  │   Security Layer               │    │
│  │  - JWT Authentication          │    │
│  │  - Token Blacklist             │    │
│  │  - Rate Limiting               │    │
│  │  - CORS                        │    │
│  └────────────┬───────────────────┘    │
│               │                         │
│  ┌────────────▼───────────────────┐    │
│  │   Controllers                  │    │
│  │  - AuthController              │    │
│  │  - StudentController           │    │
│  └────────────┬───────────────────┘    │
│               │                         │
│  ┌────────────▼───────────────────┐    │
│  │   Services                     │    │
│  │  - AuthService                 │    │
│  │  - StudentService              │    │
│  │  - TokenBlacklistService       │    │
│  └────────────┬───────────────────┘    │
│               │                         │
│  ┌────────────▼───────────────────┐    │
│  │   Redis (Token Store)          │    │
│  │  - External API tokens         │    │
│  │  - Allowed card cache          │    │
│  └────────────────────────────────┘    │
│                                         │
└───────────────┼─────────────────────────┘
                │ WebClient (HTTP)
                │
┌───────────────▼───────────────────┐
│   External Progres API            │
│   progres.mesrs.dz/api            │
└───────────────────────────────────┘
```

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and external API integration
- **Security**: JWT authentication, token management, CORS
- **Filters**: Rate limiting, authentication filter
- **Exception Handlers**: Global error handling
- **Configuration**: Security config, OpenAPI, WebClient
- **Redis**: Server-side external token storage (via `RedisExternalTokenStore`)

## Security Features

### Authentication & Authorization

- JWT-based stateless authentication
- Token blacklisting for secure logout
- 15-minute access token expiration
- 7-day refresh token support
- Secure token validation

### Protection Mechanisms

- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection with configurable origins
- XSS protection headers
- CSRF protection (disabled for stateless API)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- Frame options (deny)
- Input validation with Bean Validation

### Docker Security

- Non-root user execution
- Multi-stage build (minimal attack surface)
- Alpine-based images (smaller size)
- Health check configured

### Dependency Security

- OWASP Dependency Check in CI/CD
- Regular dependency updates
- Vulnerability scanning

## Testing

### Run All Tests

```bash
./mvnw test
```

### Run with Coverage Report

```bash
./mvnw clean test jacoco:report
```

Coverage report will be available at: `target/site/jacoco/index.html`

### Test Structure

- **Unit Tests**: Service and component testing
- **Integration Tests**: Full application context testing
- **Security Tests**: Authentication and authorization testing
- **Controller Tests**: API endpoint testing with MockMvc

### Test Dependencies

- JUnit 5
- Spring Boot Test
- Spring Security Test
- Testcontainers
- WireMock (for external API mocking)
- MockWebServer

## Building & Packaging

### Build JAR

```bash
./mvnw clean package
```

Output: `target/progres-api-1.0.0.jar`

### Build Docker Image

```bash
docker build -t progres-api:1.0.0 .
```

### Skip Tests (if needed)

```bash
./mvnw clean package -DskipTests
```

## Deployment

### Docker Deployment

1. **Build the image:**

   ```bash
   docker build -t progres-api .
   ```

2. **Run with environment variables:**
   ```bash
   docker run -d \
     --name progres-api \
     -p 8080:8080 \
     -e JWT_SECRET=your-secret-key \
     -e CORS_ALLOWED_ORIGINS=https://your-frontend.com \
     -e SPRING_PROFILES_ACTIVE=prod \
     progres-api
   ```

### Cloud Deployment

The provided Dockerfile works with any container platform:

- **Railway**, **Render**, **Fly.io**: Connect your GitHub repository for automatic deploys
- **AWS ECS** / **Google Cloud Run** / **Azure Container Apps**: Push the Docker image to your registry
- **Koyeb**, **DigitalOcean App Platform**: Use container deployment

Set the required environment variables (`JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `SPRING_PROFILES_ACTIVE=prod`) on your chosen platform.

### CI/CD

GitHub Actions workflows are included for:

- Continuous Integration (build, test, security scan)
- Continuous Deployment (via Render — configurable via GitHub secrets/variables)
- OWASP dependency checking
- Code coverage reporting

All deployment-specific values are parameterized through GitHub repository variables and secrets.

## Development

### Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/progress/api/
│   │   │   ├── config/     # Configuration classes
│   │   │   ├── controller/ # REST controllers
│   │   │   ├── dto/        # Data transfer objects
│   │   │   ├── exception/  # Exception handling
│   │   │   ├── security/   # Security components
│   │   │   └── service/    # Business logic
│   │   └── resources/
│   │       ├── application.yml      # Dev config
│   │       └── application-prod.yml # Prod config
│   └── test/               # Test cases
├── Dockerfile              # Container definition
├── pom.xml                 # Maven dependencies
└── README.md               # This file
```

### Code Style

- Follow standard Java conventions
- Use Lombok for boilerplate reduction
- Keep controllers thin, services rich
- Write tests for new features
- Document public APIs

### Adding New Endpoints

1. Create DTO classes if needed
2. Add service method with business logic
3. Create controller endpoint
4. Add tests
5. Update OpenAPI annotations
6. Update this README

## Monitoring & Observability

### Health Checks

```bash
curl http://localhost:8080/actuator/health
```

### Actuator Endpoints

- `/actuator/health` - Application health status
- `/actuator/info` - Application information

Additional endpoints can be enabled in `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

### Logging

Logs are output to console in JSON-friendly format.

**Production logging** (WARN level and above):

```yaml
logging:
  level:
    root: WARN
    com.progress: INFO
```

**Development logging** (DEBUG level for app):

```yaml
logging:
  level:
    root: INFO
    com.progress: DEBUG
```

## ️ Known Limitations

### In-Memory Token Blacklist

The token blacklist is stored in-memory using `ConcurrentHashMap`. This means:

- Won't work across multiple instances (load balancing)
- Blacklist is lost on application restart
- Not suitable for distributed deployments

**Solution for Production**: Implement Redis-based token blacklist for distributed systems.

### In-Memory Rate Limiting

Rate limiting uses in-memory buckets:

- Doesn't work across multiple instances
- Rate limits reset on restart

**Solution for Production**: Use Redis-based distributed rate limiting (e.g., with Spring Cloud Gateway or standalone Redis).

### Redis Dependency

Redis is **required** for local development (unless you switch to `EXTERNAL_TOKEN_STORE_TYPE=in-memory` in `.env`):

- ✅ Docker Compose includes Redis automatically
- ⚠️ Local development requires manual Redis installation (see [Installing Redis](../README.md#installing-redis))
- ⚠️ On Windows, Redis must run inside WSL2

### No Data Persistence

All data is proxied from the external Progres API:

- No local database
- No caching layer
- Performance depends on external API

**Optional Enhancement**: Add Redis or Caffeine caching for frequently accessed data.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for:

- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## Related Projects

- **Frontend Repository**: [Progres Frontend](../frontend/)
- **Progres API Documentation**: Contact Algerian Ministry of Higher Education

## Acknowledgments

- Built with [Spring Boot](https://spring.io/projects/spring-boot)
- JWT handling by [JJWT](https://github.com/jwtk/jjwt)
- Rate limiting by [Bucket4j](https://github.com/bucket4j/bucket4j)
- API documentation by [SpringDoc OpenAPI](https://springdoc.org/)

---

**Made with ️ for Algerian Students**
