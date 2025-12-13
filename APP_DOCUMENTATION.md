# Tracks & Taps - Application Documentation

## 1. Project Overview
**Tracks & Taps** is a sophisticated mobile application built for interactive city exploration, combining walking tours with gamified challenges and social features (e.g., Teams, Pub Golf). Note that while the codebase contains references to "mock" backend structures, the application uses a fully functional serverless architecture integrated directly into the Expo framework.

## 2. Technology Stack

### Core Framework
*   **Runtime**: React Native `0.81.5`
*   **Framework**: Expo `~54.0.29` (SDK 54)
*   **Navigation**: Expo Router `~6.0.19` (File-based routing)
*   **Language**: TypeScript `~5.9.2`

### Backend & Database
*   **API Layer**: Expo Router API Routes (`app/api/`)
    *   Acts as a serverless backend.
*   **ORM**: Prisma `^5.22.0`
*   **Database**: PostgreSQL (hosted on **Supabase**)
*   **Authentication**: Supabase Auth (`@supabase/supabase-js`)

### State Management & Utilities
*   **Global State**: `zustand`
*   **Networking**: `axios` (with custom interceptors for auth)
*   **Maps**: `react-native-maps`

---

## 3. Project Structure

The project follows a standard Expo Router structure with a unique backend integration.

### Directory Breakdown
*   **`app/`**: The core application logic.
    *   `_layout.tsx`: Main entry point, providers (Auth, Theme), and navigation stack configuration.
    *   `(tabs)/`: Main tab-based navigation (Explore, Map, Profile, etc.).
    *   `api/`: **The Backend**. Contains the API endpoints (e.g., `user+api.ts`) that the frontend calls.
*   **`src/`**: Source code for UI and client-side logic.
    *   `api/`: Client-side API wrappers (`client.ts` configures Axios).
    *   `components/`: Reusable UI components.
    *   `context/`: React Contexts (Auth, Location, Theme).
    *   `hooks/`: Custom React hooks (e.g., `useCatalog`).
*   **`backend-mock/`**: **CRITICAL**. Despite the name "mock", this directory contains the **actual production business logic**.
    *   `controllers/`: Handles request/response logic.
    *   `services/`: interacting with the database via Prisma.
    *   `repositories/`: Data access layer.
*   **`prisma/`**: Database configuration.
    *   `schema.prisma`: The source of truth for the database schema.
    *   `seed.ts` / `seed_new.ts`: Scripts to populate the database with initial data.
*   **`utils/`**: Helper functions (e.g., Supabase client initialization).

---

## 4. Authentication Flow

Authentication is a hybrid of Client-side Supabase and Server-side Verification.

1.  **Client-Side (Login)**:
    *   User logs in via the UI.
    *   `AuthContext.tsx` uses `supabase.auth.signInWith...`.
    *   Supabase returns a JWT (Access Token).
    *   Token is stored in the application state.

2.  **API Requests**:
    *   The `client.ts` (Axios) interceptor automatically attaches the token to every request:
        ```typescript
        config.headers.Authorization = `Bearer ${session.access_token}`;
        ```

3.  **Server-Side (Verification)**:
    *   API routes (e.g., `app/api/user+api.ts`) call `verifyAuth(request)`.
    *   `verifyAuth` (in `app/api/utils.ts`) extracts the token and validates it with Supabase:
        ```typescript
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        ```
    *   If valid, the request proceeds. If not, a `401 Unauthorized` is returned.

---

## 5. Database & Data Model

The database is robust and relational, designed for complex interactions.

### Key Models (`prisma/schema.prisma`)
*   **User**: Handles player stats (`xp`, `tokens`, `level`) and auth data (`email`).
*   **Tour**: The main product. Contains `activeTours` (sessions), `stops`, and `challenges`.
*   **ActiveTour**: A "session" of a tour. It tracks the status (`WAITING`, `IN_PROGRESS`) and links to `Teams`.
*   **Team**: Groups of users playing a tour together. Tracks `score`, `streak`, and `currentStop`.
*   **Challenge**: Tasks (Trivia, Location, Picture) linked to a `Tour` or a specific `Stop`.
*   **PubGolfStop**: Specialized join table for the Pub Golf game mode, tracking drinks/sips.
*   **Review**: User feedback for tours.

### Relationships
*   Users join Teams.
*   Teams join ActiveTours.
*   ActiveTours instantiate Tours.

---

## 6. How to Launch on iOS

To deploy this application to the Apple App Store, follow these steps.

### Prerequisites
1.  **Apple Developer Account**: Required ($99/year).
2.  **EAS Account**: You are already configured (`projectId: 8ff732e5-...`).

### Configuration Check
Ensure `app.json` has the correct iOS configuration:
*   **Bundle Identifier**: `com.joeypoel.trackstaps` (Must differ from any existing app).
*   **Permissions**: `NSLocationWhenInUseUsageDescription` is currently set. If you add Camera features (for Picture challenges), you **MUST** add `NSCameraUsageDescription` to `app.json` or Apple will reject the binary.

### Build Steps
1.  **Configure Build Profiles**:
    Ensure `eas.json` exists. If not, run:
    ```bash
    eas build:configure
    ```
2.  **Build for Production (App Store)**:
    ```bash
    eas build --platform ios --profile production
    ```
    *   This will handle signing credentials automatically if you log in with your Apple ID.
3.  **Submit**:
    ```bash
    eas submit --platform ios
    ```
    *   Or upload the `.ipa` file via Transporter app.
4.  **TestFlight**:
    *   Use the `preview` profile or internal distribution to test on real devices before submitting for review.

---

## 7. Workflow for Adding New Features

1.  **Database**:
    *   Modify `prisma/schema.prisma`.
    *   Run `npx prisma migrate dev` to update the local DB and generate the client.
2.  **Backend Logic**:
    *   Add a Repository method in `backend-mock/repositories/`.
    *   Add a Service method in `backend-mock/services/`.
    *   Add a Controller method in `backend-mock/controllers/`.
3.  **API Endpoint**:
    *   Create or update a file in `app/api/...`.
    *   Ensure `verifyAuth` is called if the route is protected.
4.  **Frontend**:
    *   Add the API call to `client.ts` or a specific hook.
    *   Build the UI components in `src/components`.

## 8. Known Issues / Oddities
*   **"Backend-Mock"**: Do not be confused by the folder `backend-mock`. It is NOT a mock. It is the real backend code.
*   **API URL**: In `src/api/client.ts`, the base URL logic tries to detect the Expo host URI. When deploying, ensure the `EXPO_PUBLIC_API_URL` environment variable is set or the fallback is correct for production (likely the domain of the deployed web/API server).

