# System Architecture
This document explains how the application connects the frontend to the backend database.


## Components

### 1. Frontend (Screens & Hooks)

**Screens (`src/screens/*.tsx`)**  
These are the visual pages the user interacts with. They never fetch data themselves.  
When a screen needs data (for example, details of tour **#1**), it calls a Hook.

**Specific Hooks (`useTourDetails.ts`)**  
These Hooks decide *what* data is needed.  
Example: “Give me the details for tour **#1**.”  
They create the correct API URL, such as `/api/tour/1`, and pass it to the generic fetch hook.

**Generic Hook (`useFetch.ts`)**  
This is the shared communication layer for all data requests.  
It performs the actual `fetch` call to the server, shows loading indicators, and handles errors.  
This keeps other hooks simple and focused on **what** they need, not **how** to request it.

---

### 2. Backend (API & Services)

**API Routes (`app/api/.../+api.ts`)**  
These are the entry points into the backend. The phone sends an HTTP request here.

- `app/api/tours/+api.ts`: Returns a list of all tours.  
- `app/api/tour/[id]/+api.ts`: Returns details for a specific tour.

API routes do not contain business logic; they only receive the request and forward it to a service.

**Services (`src/services/*.ts`)**  
This is where the logic lives. Services don’t know anything about HTTP or JSON—they simply operate on data.  
They receive requests from API routes and ask Prisma for what they need.

**Prisma (`src/lib/prisma.ts`)**  
Prisma translates TypeScript instructions into SQL queries.  
It allows the service layer to work with JavaScript/TypeScript objects instead of writing SQL manually.

---

### 3. Database

**PostgreSQL**  
This is where all real data is stored. Prisma communicates with it directly.

---

## Why this structure?

**Separation of Concerns**  
- Screens handle UI.  
- Hooks request data.  
- API routes handle network requests.  
- Services contain logic.  
- Prisma handles database access.  
Each layer focuses on one responsibility.

**Reusability**  
- `tourService` can be used by multiple API routes.  
- `useFetch` can be reused by any Hook that needs data.

**Security**  
The database is never exposed to the frontend.  
Only the API layer can communicate with it, preventing unauthorized access.
