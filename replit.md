# Overview

This is an automated football prediction system that generates daily betting tips without user interaction. The application fetches live football matches from an external Football API, analyzes them, generates two types of betting combinations ("sure" and "risky"), and saves the results to a JSON file accessible via HTTP endpoints.

The system is built as a full-stack web application with a minimal React frontend that simply explains how the system works, while the core functionality runs automatically on the Express backend at server startup.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React 18 with TypeScript and Vite

**UI Framework**: Shadcn/ui components with Radix UI primitives and Tailwind CSS

**Build System**: Vite with custom plugins for runtime error overlays, meta image injection, and Replit-specific development tools

**Key Design Decisions**:
- Minimal user interface - the frontend serves primarily as documentation rather than an interactive application
- No state management library needed as there's no complex user interaction
- Static information display only, explaining the automated backend process

## Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**Server Configuration**:
- HTTP server created with Node's native `createServer`
- Custom logging middleware that tracks request duration and responses
- Raw body parsing enabled for webhook compatibility
- Static file serving for both built client assets and generated JSON files

**Routing Strategy**:
- `/static/*` - Serves static files including the generated `pronostics.json`
- `/api/pronostics` - API endpoint that reads and returns the JSON predictions file
- `*` - Fallback to serve the React SPA for all other routes

**Storage Architecture**:
- In-memory storage implementation (`MemStorage`) with interface (`IStorage`) for future database migration
- User management system with username/password support (appears to be prepared for authentication but not actively used)
- UUID-based user identification

**Build Process**:
- Client built with Vite to `dist/public`
- Server bundled with esbuild to `dist/index.cjs` with selective dependency bundling for improved cold start performance
- Allowlist approach for bundling frequently-used dependencies to reduce filesystem syscalls

## Data Storage Solutions

**Current Implementation**: In-memory storage using JavaScript Map structures

**Database Preparation**: 
- Drizzle ORM configured for PostgreSQL migration
- Neon Database serverless driver integrated
- Schema defined in `shared/schema.ts` with a `users` table
- Database credentials expected via `DATABASE_URL` environment variable

**Schema Design**:
- Users table with UUID primary keys, unique usernames, and password fields
- Zod validation schemas generated from Drizzle schemas for runtime validation

**Migration Strategy**: Ready to migrate from in-memory to PostgreSQL by swapping storage implementation

## Authentication and Authorization

**Current State**: Authentication infrastructure prepared but not actively enforced

**Prepared Components**:
- User schema with username/password fields
- Storage interface with user lookup methods (`getUser`, `getUserByUsername`, `createUser`)
- Session management dependencies installed (`express-session`, `connect-pg-simple`, `passport`, `passport-local`)

**Design Approach**: Session-based authentication ready to be implemented with PostgreSQL session store

## External Dependencies

**Football Data API**: 
- System designed to fetch daily football matches from an external Football API at server startup
- Match data analyzed to generate betting predictions
- API implementation details not present in provided code (likely to be added)

**Database Service**:
- Neon Database (PostgreSQL-compatible serverless database)
- Connection via `@neondatabase/serverless` driver
- URL-based configuration via environment variables

**Development Services**:
- Replit-specific tooling for development environment
  - Runtime error modal plugin
  - Cartographer for code navigation  
  - Development banner for Replit IDE integration
  - Meta image plugin for OpenGraph/Twitter card image URL generation

**UI Component Libraries**:
- Radix UI for accessible, unstyled component primitives
- Lucide React for icons
- Shadcn/ui configuration for styled component variants

**Form and Validation**:
- React Hook Form with Zod resolvers for form validation
- Drizzle-Zod for automatic schema validation from database models

**Utility Libraries**:
- date-fns for date manipulation
- nanoid and uuid for ID generation
- clsx and class-variance-authority for className utilities

**Potential Future Integrations** (dependencies installed but not used in provided code):
- Stripe for payment processing
- OpenAI/Google Generative AI for AI-powered features
- Nodemailer for email notifications
- Multer for file uploads
- WebSocket (ws) for real-time updates
- Excel processing (xlsx)
- Rate limiting (express-rate-limit)