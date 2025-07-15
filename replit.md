# GreenScape Pro - Landscaping Quote Management System

## Overview

GreenScape Pro is a full-stack web application designed for landscaping businesses to manage quotes, customers, and generate reports. The system provides a comprehensive dashboard for tracking business performance and streamlining the quote generation process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and build processes
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Pattern**: RESTful API endpoints under `/api` namespace

### Project Structure
- `client/`: Frontend React application
- `server/`: Backend Express.js application
- `shared/`: Shared TypeScript types and database schemas
- `migrations/`: Database migration files (Drizzle)

## Key Components

### Database Schema
The application uses three main entities:
- **Customers**: Store customer information (name, email, phone, address)
- **Quotes**: Manage quote requests with project details and status tracking
- **Quote Items**: Line items for detailed quote breakdowns

### Frontend Pages
- **Dashboard**: Overview with stats and performance metrics
- **Quote Request**: Form for customers to submit new quote requests
- **Quote Management**: Admin interface for managing quotes and their status
- **Customers**: Customer management and relationship tracking
- **Reports**: Business analytics and reporting

### API Endpoints
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/customers` - Customer listing
- `POST /api/customers` - Create new customer
- `GET /api/quotes` - Quote management
- `POST /api/quotes/request` - Submit quote request

### Storage Layer
The application uses a storage abstraction (`IStorage` interface) with a memory-based implementation (`MemStorage`), designed to be easily replaceable with a database-backed implementation.

## Data Flow

1. **Quote Request Flow**: Customer submits quote request → System creates customer record (if new) → Quote record created with "pending" status
2. **Quote Management Flow**: Admin views quotes → Updates status and pricing → Generates PDF quotes for customers
3. **Dashboard Flow**: System aggregates data from quotes and customers → Displays real-time statistics and trends

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library

### Data and State Management
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Drizzle ORM**: TypeScript ORM for database operations

### PDF Generation
- **jsPDF**: Client-side PDF generation for quotes

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundler

## Deployment Strategy

### Development
- Frontend served by Vite dev server with HMR
- Backend runs on Express with tsx for TypeScript execution
- Database migrations managed through Drizzle Kit

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with ESBuild for Node.js execution
- Static assets served from Express server
- Database connection via connection string (DATABASE_URL)

### Key Features
- **Accessibility**: ARIA compliance, keyboard navigation, screen reader support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Validation**: Zod schemas for type-safe validation
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized with React Query caching and Vite bundling

The application is designed to be deployment-ready on platforms like Replit, with environment-specific configurations and proper error handling for production environments.