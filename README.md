# Tracks & Taps 🍻

Tracks & Taps is an interactive, gamified tour application built with **Expo (React Native)** for the frontend and a **serverless-style backend** fully integrated via Expo Router API routes.

We combine GPS-based navigation, trivia challenges, and social features to create unique city experiences—from historical walking tours to competitive "Pub Golf" crawls.

## 🌟 Key Features

### 🎮 Interactive Tours
-   **GPS Check-ins**: Validates user location to unlock stops.
-   **Challenges**: Trivia questions, location verification, and photo tasks.
-   **Progress Tracking**: Persists current stop and score.

### ⛳ Pub Golf Mode
-   **Specialized Scoring**: Compete against a "Par" (number of sips/drinks).
-   **Scorecard**: Track specific drink requirements and penalties.

### 🤝 Team Play
-   **Real-time Logic**: Supports teams joining an Active Tour.
-   **Live Updates**: Scores and current stops are synced to the database.

---

## 🏗️ Architecture & How It Works

This project implements a **Serverless Monolith** architecture. While it looks like a standard React Native app, it contains a full backend API within the `app/api` directory.

### The Stack
-   **Frontend**: React Native, Expo Router, NativeWind (Tailwind), React Query.
-   **Backend**: Expo Router API Routes (`request` -> `response`).
-   **Database**: Supabase (PostgreSQL), accessed via Prisma ORM.

### 🔄 Data Flow (The "Backend Mock" Pattern)

We follow a strict **Controller-Service-Repository** pattern to ensure the code is clean, testable, and ready to be extracted to a separate server if needed.

> **Note**: The folder is named `backend-mock` for historical reasons, but it contains the **ACTUAL** production business logic used by the API routes.

#### 1. API Route (`app/api/...`)
*The Entry Point.*
Receives the HTTP request from the frontend and passes it to the Controller.
*Example*: `GET /api/tours` calls `tourController.getAllTours()`.

#### 2. Controller (`backend-mock/controllers`)
*The HTTP Handler.*
-   Parses the request (body, params).
-   Validates inputs.
-   Calls the appropriate Service.
-   Sends the HTTP response (JSON, Status Codes).
-   **Rule**: No direct DB access.

#### 3. Service (`backend-mock/services`)
*The Brain.*
-   Contains all business logic (e.g., "Is the user close enough to the stop?", "Calculate points based on challenge difficulty").
-   Orchestrates one or more Repositories.
-   **Rule**: No knowledge of HTTP (req/res).

#### 4. Repository (`backend-mock/repositories`)
*The Data Access Layer.*
-   Executes raw Prisma queries (`prisma.tour.findMany()`).
-   **Rule**: Pure data fetch/store. No complex logic.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (LTS)
-   Git
-   Supabase Account

### 1. Installation
```bash
git clone https://github.com/JoeyPoel/Tracks-Taps.git
cd Tracks-Taps
npm install
```

### 2. Database Setup (Supabase)
1.  **Environment Variables**: Create a `.env` file with your Supabase credentials:
    ```env
    # Transaction Pooler (Port 6543) - For App Usage
    DATABASE_URL="postgres://[user]:[password]@[host]:6543/postgres?pgbouncer=true"

    # Session Pooler (Port 5432) - For Migrations/Seed
    DIRECT_URL="postgres://[user]:[password]@[host]:5432/postgres"

    # Supabase Client (Auth/Storage)
    EXPO_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
    EXPO_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
    ```

2.  **Initialize DB**:
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Push Schema
    npx prisma db push

    # Seed Initial Data (Tours, Stops, Challenges)
    npx prisma db seed
    ```

### 3. Running the App
Start the development server. This runs **both** the React Native app and the API routes.

```bash
npx expo start
```
-   **Mobile**: Scan the QR code with Expo Go.
-   **Web**: Press `w` to open in browser (Good for testing API responses).
-   **Simulator**: Press `i` (iOS) or `a` (Android).

---

## 🗺️ Migration Path (Future Proofing)

The rigid **Controller-Service-Repository** pattern is designed for scalability.
If the API needs to be moved to a standalone server (Node.js/Express/NestJS) in the future:

1.  **Extract**: Move `backend-mock` folder to a new repo.
2.  **Lift**: Copy `prisma` schema.
3.  **Route**: Create standard Express/Nest routes that call the existing Controllers.
4.  **Connect**: Update the Frontend `api/client.ts` to point to the new server URL.
