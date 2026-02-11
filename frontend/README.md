# Progres - Frontend

A modern student portal for accessing PROGRES academic data, built with Next.js, React, and TypeScript.

## Overview

This frontend application provides an intuitive interface for Algerian university students to:
- View their academic records and progress
- Access exam results and grades
- Get AI-powered major/specialty recommendations
- Track their academic journey across years

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React Context + Server Components
- **API Client**: Fetch API with JWT authentication

## Prerequisites

- Node.js 18.17.0 or higher
- pnpm (recommended) or npm
- Backend API running on `http://localhost:8080`

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Protected dashboard routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                  # Utilities and helpers
└── public/              # Static assets
```

## Features

- **Secure Authentication**: JWT-based login with token refresh
- **Responsive Design**: Mobile-first UI using Tailwind CSS
- **AI Recommendations**: Personalized academic path suggestions
- **Real-time Data**: Live academic records from PROGRES
- **Dark Mode**: System-aware theme support

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080/api` |

## Contributing

See the main [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for contribution guidelines.

---

**Built with ️ for Algerian Students**
