# Tracks & Taps - Technical Architecture

> **Engineering Overview for UPC Admissions Board**

This document outlines the technical reality of the Tracks & Taps codebase. It describes the architecture, type systems, and data flow patterns currently implemented in the production-grade Beta.

## 🏗️ Architecture Pattern

The project operates as a **Full-Stack Expo Router Monorepo**, treating the backend and frontend as a unified codebase while maintaining strict separation of concerns via a Layered Architecture.

### 1. Backend Layer (Serverless Monolith)
The backend is built on **Expo Router API Routes** (`app/api/*`) but structured using a classic enterprise pattern to ensure scalability and testability:
-   **Controllers** (`backend/controllers/`): Handle HTTP request/response, validation, and status codes.
-   **Services** (`backend/services/`): Contain pure business logic and cross-resource orchestration.
-   **Repositories** (`backend/repositories/`): Manage direct database access via **Prisma ORM**, ensuring all SQL/Query logic is isolated.

*Deployment Strategy*: To overcome serverless limits (cold starts, function counts), the build system runs a custom script (`scripts/vercel-build.js`) that bundles all API routes into a single optimized Vercel Serverless Function ("The Monolith").

### 2. Frontend Layer (Component-Service)
The React Native application follows a **Hooks-Service-Component** pattern:
-   **Screens** (`src/screens/`): Responsible only for layout and composition.
-   **Custom Hooks** (`src/hooks/`): Encapsulate local logic (e.g., `useMapScreenLogic`, `useActiveTour`) to keep UI components pure.
-   **Services** (`src/services/`): Frontend singletons that wrap `fetch` calls to the backend API.
-   **Global State**: Managed via **Zustand** (`src/store/`), chosen for its reduced boilerplate compared to Redux, specifically for tracking "Active Tour" persistence and User Session state.

---

## 🛡️ Type System & Data Integrity

We utilize **TypeScript** to enforce a contract between the Frontend and Backend.

**The Challenge:**
Prisma Client types are server-side only. Importing them directly into React Native would bloat the bundle and break the runtime.

**The Solution:**
We implement a **Shared Model Pattern** in `src/types/models.ts`.
-   These interfaces mirror the Prisma Schema but are pure TypeScript types safe for the client.
-   **Strict Typing**: All Backend Controllers must return data matching these interfaces.
-   **Client Safety**: All Frontend Services return these typed objects, ensuring autocomplete and compile-time error checking across the full stack.

---

## 🔄 Data Flow Strategy

The application deliberately avoids heavy caching libraries like TanStack Query in favor of **Explicit State Control** to handle the specific needs of a real-time location-based game.

1.  **On-Demand Fetching**: 
    -   Heavy data (e.g., Map geometry, Route paths) is fetched *lazily*.
    -   The Map Screen loads lightweight "Pin" data initially and fetches full Tour Details (Stops, Segments) only upon user selection to minimize Data Egress.
    
2.  **Optimistic UI**:
    -   Actions like "Completing a Challenge" or "Updating a Score" update the local Zustand store immediately while the API request processes in the background, providing a snappy experience on mobile networks.

3.  **Authentication Flow**:
    -   Managed via `UserContext` which persists session tokens.
    -   Auth state dictates the Navigation Stack root (effectively switching between `(auth)` and `(tabs)` groups).

---

## ☁️ Infrastructure & Integrations

The infrastructure is defined in code (`prisma/schema.prisma`, `vercel.json`, `eas.json`).

| Component | Technology | Implementation |
| :--- | :--- | :--- |
| **Database** | **PostgreSQL** | Managed via Supabase, accessed via Prisma ORM. |
| **Auth** | **Supabase Auth** | Handles JWT generation; Backend verifies tokens via middleware. |
| **Storage** | **Supabase Storage** | Stores user avatars and tour assets. Optimized via dynamic resizing parameters. |
| **Maps** | **Expo/Google Maps** | Native map rendering with custom overlays/markers. |
| **Location** | **Expo Location** | High-accuracy foreground tracking for gameplay validation ("Check-In" mechanic). |

---

*Verified from codebase analysis - Jan 2026*
