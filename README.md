# Tracks & Taps

Tracks & Taps is an interactive tour application built with Expo (React Native) and a serverless-style backend using Expo Router API routes and Prisma.

## 🚀 Getting Started

### Prerequisites
-   Node.js (LTS recommended)
-   npm or yarn
-   Git

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/JoeyPoel/Tracks-Taps.git
cd Tracks-Taps
npm install
```

### 2. Database Setup (Supabase)
This project uses **Supabase** (PostgreSQL) as the database provider.

1.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your Supabase credentials. You need two connection strings:
    -   **Transaction Pooler (Port 6543)**: Used for the application (Prisma Client).
    -   **Session Pooler (Port 5432)**: Used for migrations (Prisma Migrate).

    ```env
    # Transaction Pooler (Port 6543) - For App
    DATABASE_URL="postgres://[user]:[password]@[host]:6543/postgres?pgbouncer=true"

    # Session Pooler (Port 5432) - For Migrations
    DIRECT_URL="postgres://[user]:[password]@[host]:5432/postgres"

    # Supabase Client (For Auth/Storage)
    EXPO_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
    EXPO_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
    ```

2.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```

3.  **Push Schema to Database**:
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Seed Database**:
    Populate the database with initial data (users, tours, etc.):
    ```bash
    npx prisma db seed
    ```

5.  **View Database**:
    You can view and edit your data using Prisma Studio:
    ```bash
    npx prisma studio
    ```

### 3. Running the App
Since the backend logic is integrated via Expo Router API routes, starting the Expo app starts both the frontend and the backend.

```bash
npx expo start
```
-   Scan the QR code with your phone (Expo Go app) or press `a` for Android Emulator / `i` for iOS Simulator.
-   The API is available at `http://localhost:8081/api/...` (or your device's IP).

---

## 🏗️ Architecture

The project follows a strict **Separation of Concerns (SoC)** pattern, specifically **Controller-Service-Repository**, to ensure maintainability and scalability.

### Flow Structure
1.  **API Route** (`app/api/`):
    -   Entry point for HTTP requests.
    -   **Responsibility**: Thin adapter. Delegates request to the Controller.
    -   **Rule**: NEVER call Services or Repositories directly.

2.  **Controller** (`backend-mock/controllers/`):
    -   **Responsibility**: Handles HTTP logic.
        -   Parses request body/params.
        -   Validates input.
        -   Calls the Service.
        -   Formats the HTTP response (status codes, JSON).
    -   **Rule**: Contains NO business logic and NO database calls.

3.  **Service** (`backend-mock/services/`):
    -   **Responsibility**: Handles Business Logic.
        -   Coordinates multiple Repositories.
        -   Performs calculations, validations, and complex operations (e.g., conflict checks).
    -   **Rule**: Contains NO HTTP logic (req/res) and NO direct database calls (Prisma).

4.  **Repository** (`backend-mock/repositories/`):
    -   **Responsibility**: Handles Data Access.
        -   Encapsulates all direct Prisma Client calls (`findMany`, `create`, `update`, etc.).
    -   **Rule**: Contains NO business logic and NO HTTP logic.

### Frontend Layer
-   **API Client** (`src/api/client.ts`): Centralized Axios instance.
-   **Frontend Services** (`src/services/`): Functions to call the backend API.
-   **Hooks** (`src/hooks/`): React hooks to manage state and call frontend services.

---

## 🗺️ Backend Migration Plan

The current "backend" is hosted within the Expo app for ease of development. To move to a production-ready, standalone backend (e.g., NestJS, Express, Fastify), follow this plan:

### Phase 1: Preparation (Completed)
-   [x] Refactor logic into `backend-mock` folder.
-   [x] Implement Controller-Service-Repository pattern.
-   [x] Ensure strict separation of concerns.

### Phase 2: Extraction
1.  **Create New Repo**: Initialize a new Node.js project (e.g., `tracks-taps-backend`).
2.  **Copy Code**:
    -   Copy `backend-mock/repositories` -> `src/repositories`
    -   Copy `backend-mock/services` -> `src/services`
    -   Copy `backend-mock/controllers` -> `src/controllers`
    -   Copy `prisma/` folder (schema and migrations).
3.  **Setup Server**:
    -   Install a web framework (e.g., Express).
    -   Create routes that map to the Controllers.
    -   *Note*: You may need to slightly adapt the Controllers to match the new framework's request/response objects (e.g., `req.body` vs `request.json()`).

### Phase 3: Integration
1.  **Deploy Backend**: Deploy the new backend to a server (e.g., Vercel, AWS, Heroku).
2.  **Update Frontend**:
    -   Update `src/api/client.ts` to point `baseURL` to the new production URL.
    -   Remove `app/api/` routes and `backend-mock/` folder from the Expo project.

### Phase 4: Database
1.  **Provision DB**: Set up a managed PostgreSQL database (e.g., Supabase, Neon, AWS RDS).
2.  **Migrate Data**: Use `prisma migrate deploy` to set up the schema on the production DB.
