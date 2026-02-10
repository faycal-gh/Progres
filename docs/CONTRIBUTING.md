# Contributing Guidelines

Thank you for your interest in contributing to the **Webetu** project. We are dedicated to maintaining a high standard of code quality, security, and architectural integrity. This document outlines the standards and workflows required for collaboration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Architecture](#project-architecture)
3. [Development Workflow](#development-workflow)
4. [Branching Strategy](#branching-strategy)
5. [Code Standards](#code-standards)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Issues](#reporting-issues)

---

##  Prerequisites

Before contributing, ensure your development environment meets the following requirements:

### Backend

- **Java Development Kit (JDK)**: Version 17 (LTS) or higher.
- **Maven**: Version 3.8+.
- **Docker**: For containerization testing.

### Frontend

- **Node.js**: Version 18.17.0 (LTS) or higher.
- **Package Manager**: `pnpm` (Corepack enabled) or `npm`.
---

##  Project Architecture

Please familiarize yourself with the project structure before making changes:

- **`backend/`**: Spring Boot 3.x application following a layered architecture (Controller -> Service -> Repository).
- **`frontend/`**: Next.js 14+ application using the App Router and TypeScript.
- **`infrastructure/`**: (If applicable) Docker Compose and deployment configurations.

Refer to the main `README.md` for detailed architectural diagrams.

###  Specialties & Universities

The recommendation engine relies on community-contributed data. To add or update universities and specialties, please refer to the [Specialties Contribution Guide](CONTRIBUTING_SPECIALTIES.md).

---

##  Development Workflow

1. **Clone the Repository**

   ```bash
   git clone https://github.com/faycal-gh/Webetu.git
   cd Webetu
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env and set your JWT_SECRET (generate with: openssl rand -base64 32)
   ```
   See the main [README.md](../README.md) for all available environment variables.

3. **Install Dependencies**

   ```bash
   # Backend
   cd backend
   mvn clean install

   # Frontend
   cd ../frontend
   pnpm install
   ```

---

##  Branching Strategy

We follow a strict **Git Flow** variant:

- **`main`**: Production-ready code. Locked.
- **`develop`**: Integration branch for the next release.
- **Feature Branches**: `feature/ticket-ID-description` (e.g., `feature/AUTH-01-login-page`)
- **Bugfix Branches**: `fix/ticket-ID-description`
- **Hotfix Branches**: `hotfix/critical-issue`

**Naming Convention:**

- Use lowercase with hyphens.
- Include the Jira/Issue ID if applicable.

---

##  Code Standards

### Backend (Java/Spring Boot)

- **Style**: Follow Google Java Style Guide.
- **Architecture**:
  - DTOs for all API inputs/outputs (Never expose Entities directly).
  - Constructor Injection for dependencies (`@RequiredArgsConstructor`).
  - Validation annotations (`@Valid`, `@NotNull`) on DTOs.
- **Testing**:
  - Integration tests for Controllers.
  - Unit tests for Services.
  - Minimum 80% code coverage.

### Frontend (Next.js/TypeScript)

- **Style**: Prettier + ESLint configuration must pass.
- **Components**:
  - Use Functional Components with Typed Props.
  - Separate logic into custom hooks (`useAuth`).
  - Use `clsx` or `tailwind-merge` for class manipulation.
- **State Management**: Prefer Server Components for data fetching; use Context only when necessary.
- **Types**: No `any`. Define interfaces for all data structures.

---

##  Pull Request Process

1. **Self-Review**: Ensure your code builds locally and all tests pass.
2. **Sync**: Rebase your branch onto `develop` to resolve conflicts (`git pull --rebase origin develop`).
3. **Open PR**: Target the `develop` branch.
4. **Description**:
   - Link the related issue.
   - Describe the changes and the _why_ behind them.
   - Attach screenshots/videos for UI changes.
5. **CI Checks**: Wait for CI pipelines (Build, Test, OWASP Scan) to pass.
6. **Review**: Address comments from reviewers. Two approvals are required for merge.

---

##  Reporting Issues

- **Bugs**: Use the Bug Report template. Include reproduction steps, expected vs. actual behavior, and logs.
- **Features**: Use the Feature Request template to propose new functionality.

---

_Thank you for helping us build a robust and secure modern platform!_
