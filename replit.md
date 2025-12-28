# Explain My Money

## Overview

A consumer-focused mobile web application for India that explains financial transactions from SMS and Gmail in simple, plain English. The app reads user-permitted transaction messages (UPI, bank transfers, credit/debit card transactions) and provides clear explanations without giving any financial advice.

**Key Principle**: This app only explains past transactions - it does NOT provide investment advice, suggest actions, or analyze portfolios.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite with custom plugins for Replit integration
- **UI Pattern**: Mobile-first design with a simulated phone frame for desktop viewing

**Key Frontend Pages**:
- Home: Transaction list with SMS/email scanning simulation
- Analytics: Spending charts and category breakdowns using Recharts
- Investments: Investment tracking (SIP, Mutual Funds, Stocks, PPF, NPS)
- Chat: Local "Small Language Model" for query processing (runs entirely on device)
- Permissions: SMS/Gmail access controls
- Disclaimer: Privacy policy and usage terms

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: REST endpoints under `/api/*`
- **File Upload**: Multer for bank statement parsing (PDF, CSV, Excel)
- **Build**: esbuild for production bundling with selective dependency bundling

**Key API Endpoints**:
- `GET/POST /api/transactions` - Transaction CRUD
- `DELETE /api/transactions/:id` - Remove transactions
- `POST /api/upload-statement` - Parse bank statements (PDF/CSV/XLSX)
- `GET /api/auth/user` - Get authenticated user details
- `PUT /api/user/settings` - Update user country/currency preferences
- `GET /api/login` - Initiate OAuth login via Replit Auth
- `GET /api/logout` - End user session

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Authentication Schema**: `shared/models/auth.ts` (Replit Auth integration)
- **Key Tables**:
  - `users`: User accounts with OAuth data (id, email, firstName, lastName, profileImageUrl, country, currency, currencySymbol)
  - `sessions`: Session storage for authentication
  - `transactions`: Financial transaction records with categorization

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Supported Login Methods**: Google, GitHub, Apple, X (Twitter), Email/Password
- **Session Storage**: PostgreSQL via connect-pg-simple
- **User Profile**: Displays avatar, name, and country/currency preferences in header

**Transaction Categories**: Food, Entertainment, EMI Home Loan, EMI Car Loan, Utilities, Shopping, Investment, Other

**Investment Types**: SIP, Mutual Fund, Stocks, PPF, NPS, Bonds, Other

### Statement Parser
The backend includes parsers for extracting transactions from:
- PDF bank statements (using pdf-parse)
- CSV exports
- Excel files (using xlsx library)

Automatic categorization based on transaction descriptions with merchant extraction.

## External Dependencies

### Database
- PostgreSQL (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations
- drizzle-kit for schema migrations (`npm run db:push`)

### UI Components
- Radix UI primitives (dialogs, dropdowns, tooltips, etc.)
- Recharts for data visualization
- Framer Motion for animations
- Lucide React for icons

### File Processing
- pdf-parse: PDF document parsing
- xlsx: Excel file parsing
- csv-parse: CSV parsing

### Session Management
- express-session with connect-pg-simple for PostgreSQL session storage

### Development Tools
- Vite dev server with HMR
- Custom Replit plugins (cartographer, dev-banner, runtime-error-modal)
- TypeScript with strict mode

## Android App (android-app/)

The Android native app mirrors the web app functionality with native performance.

### Architecture
- **Language**: Kotlin with Jetpack Compose
- **Architecture Pattern**: MVVM with ViewModel
- **Database**: Room for local storage
- **Navigation**: Jetpack Navigation Compose

### Key Features
- SMS transaction scanning with permission handling
- Gmail API integration for reading transaction emails (OAuth 2.0)
- Bank statement parsing (PDF, CSV, Excel)
- Small Language Model (SLM) for on-device AI conversations
- Country/currency preferences with auto-detection

### Gmail Integration
- **Authentication**: Google Sign-In with Gmail read-only scope
- **Query Filters**: Searches for bank keywords and common bank sender addresses
- **Email Parsing**: Regex-based extraction of amounts, merchants, and transaction types
- **Privacy**: Read-only access, all processing done locally on device
- **Classes**:
  - `GmailReader`: Handles OAuth and Gmail API communication
  - `EmailParser`: Extracts transaction data from email content

### Key Files
- `app/src/main/java/com/explainmymoney/ui/viewmodel/MainViewModel.kt` - Central ViewModel
- `app/src/main/java/com/explainmymoney/data/gmail/GmailReader.kt` - Gmail OAuth and API
- `app/src/main/java/com/explainmymoney/data/parser/` - SMS, Email, Statement parsers
- `app/src/main/java/com/explainmymoney/ui/screens/` - Compose UI screens

### Building
Download `android-app.zip`, extract, and open in Android Studio. Requires:
- Android Studio Hedgehog or newer
- JDK 17+
- Android SDK 34