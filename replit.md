# Overview

This is a full-stack web application built with React and Express, featuring a modern UI component library (shadcn/ui) and PostgreSQL database integration via Drizzle ORM. The application uses a monorepo structure with shared type definitions between client and server. The current implementation includes a profile page displaying user information with a "Club Dorado" themed design, though the backend routing and business logic are minimal stubs ready for implementation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Problem**: Need a modern, type-safe React application with a comprehensive UI component library.

**Solution**: React 18+ with TypeScript, using Vite as the build tool and bundler. The UI is built on shadcn/ui (Radix UI primitives) with Tailwind CSS for styling.

**Key Design Decisions**:
- **Component Library**: shadcn/ui provides 40+ pre-built, accessible components (accordion, dialog, form, toast, etc.) based on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, supporting a dark purple/blue color scheme ("Club Dorado" theme)
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management and API calls
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

**Pros**: 
- Type-safe across the entire frontend
- Accessible components out of the box
- Fast development with pre-built components
- Excellent developer experience with Vite HMR

**Cons**:
- Large number of dependencies for UI components
- CSS-in-JS alternatives might offer better performance for some use cases

## Backend Architecture

**Problem**: Need a Node.js server that can serve both API endpoints and the React application.

**Solution**: Express.js server with TypeScript, using a middleware-based architecture.

**Key Design Decisions**:
- **Framework**: Express.js for HTTP server and routing
- **Development Mode**: Vite middleware integration for HMR during development
- **Production Mode**: Pre-built static files served from dist/public
- **Request Logging**: Custom middleware that logs API requests with timing and response data
- **Build Process**: esbuild bundles the server code for production

**Pros**:
- Simple, well-understood Express patterns
- Clean separation between dev and production builds
- Efficient bundling with esbuild

**Cons**:
- Manual routing setup required (no auto-routing)
- Basic error handling needs enhancement

## Data Layer

**Problem**: Need type-safe database access with schema management and migrations.

**Solution**: Drizzle ORM with PostgreSQL (via Neon Database serverless driver).

**Key Design Decisions**:
- **ORM**: Drizzle ORM provides SQL-like TypeScript query builder
- **Schema Definition**: Centralized in `shared/schema.ts` for use by both client and server
- **Validation**: Drizzle-Zod integration generates Zod schemas from Drizzle tables
- **Migrations**: Drizzle Kit handles schema migrations (output to ./migrations)
- **Temporary Storage**: MemStorage class provides in-memory storage interface during development

**Database Schema**:
```typescript
users table:
  - id: varchar (primary key, auto-generated UUID)
  - username: text (unique, not null)
  - password: text (not null)
```

**Storage Interface Pattern**:
- Abstract `IStorage` interface defines CRUD operations
- `MemStorage` implements in-memory storage for development
- Ready to swap for `PgStorage` or similar PostgreSQL implementation

**Pros**:
- Full type safety from database to UI
- Shared types prevent client/server drift
- Lightweight and performant queries
- Schema-first approach

**Cons**:
- Less mature ecosystem than Prisma
- More manual query construction needed

## Shared Code

**Problem**: Avoid type duplication between client and server.

**Solution**: Shared TypeScript definitions in `shared/` directory.

**Key Design Decisions**:
- Database schemas and types accessible to both client and server
- Zod validation schemas derived from Drizzle schemas
- Path aliases (@shared/*) configured in both tsconfig.json and Vite

**Pros**:
- Single source of truth for data types
- Prevents API contract drift

**Cons**:
- Requires careful bundler configuration

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL via `@neondatabase/serverless` package
- Connection string required via `DATABASE_URL` environment variable
- Drizzle ORM configured for PostgreSQL dialect

## UI Component Libraries
- **Radix UI**: Headless accessible component primitives (40+ separate packages)
- **shadcn/ui**: Pre-styled component compositions built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library

## Development Tools
- **Vite**: Frontend build tool and dev server with HMR
- **Replit Plugins**: Runtime error modal, cartographer, and dev banner for Replit environment
- **TypeScript**: Type checking across entire codebase
- **esbuild**: Production server bundling

## State Management & Data Fetching
- **TanStack Query**: Server state management, caching, and data fetching
- **React Hook Form**: Form state and validation
- **Zod**: Runtime type validation and schema definition

## Styling & Animation
- **Tailwind CSS**: Configured with custom color scheme and design tokens
- **PostCSS**: CSS processing with autoprefixer
- **class-variance-authority**: Variant-based component styling
- **clsx & tailwind-merge**: Conditional class name utilities

## Additional Libraries
- **date-fns**: Date manipulation and formatting
- **embla-carousel-react**: Carousel/slider components
- **cmdk**: Command menu component
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing for React