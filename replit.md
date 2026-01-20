# 平安守護 (SafeCheck)

## Overview

SafeCheck is an elderly safety check-in application designed for Taiwan. The app enables elderly users to regularly confirm their well-being by pressing a "check-in" button, while family members can monitor their status via a public shareable link. If a user hasn't checked in within a configurable timeout period (default 30 seconds for testing), their status changes from "safe" to "alert," prompting family members to follow up.

The application is built as a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for smooth status transitions
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript (ESM modules)
- **Authentication**: Passport.js with Local Strategy, using scrypt for password hashing
- **Session Management**: Express-session with cookie-based sessions
- **API Pattern**: REST endpoints defined in shared/routes.ts with Zod schemas for validation

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: Drizzle Kit with `db:push` command
- **Key Tables**: `users` table with fields for authentication, display name, emergency contacts, and check-in timestamps

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod schemas
- `routes.ts`: API route definitions with paths, methods, and response schemas

This enables type-safe API calls and consistent validation across the stack.

### Key Features
1. **User Authentication**: Registration and login with hashed passwords
2. **Check-In System**: Single-button check-in that updates `lastCheckInAt` timestamp
3. **Public Status Page**: Shareable URL (`/status/:username`) for family members to view safety status
4. **Real-time Status**: Client-side polling (every 5 seconds) plus local timer (every 100ms) for responsive status updates
5. **PWA Support**: Manifest file for mobile installation

### Development vs Production
- Development: Vite dev server with HMR, served through Express middleware
- Production: Static files served from `dist/public`, bundled with esbuild

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication & Sessions
- **Passport.js**: Authentication middleware
- **passport-local**: Username/password authentication strategy
- **express-session**: Session management (MemoryStore for development)
- **connect-pg-simple**: PostgreSQL session store (available for production)

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives (via shadcn/ui)
- **framer-motion**: Animation library
- **date-fns**: Date formatting with Chinese locale support (zhTW)
- **lucide-react**: Icon library
- **wouter**: Client-side routing

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **TypeScript**: Full-stack type safety
- **Tailwind CSS**: Utility-first styling

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: (Optional) Secret for session signing, has default fallback