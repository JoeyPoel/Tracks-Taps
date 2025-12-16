# Tracks & Taps

Tracks & Taps is a mobile-first **Gamified Bar Crawl Application** that combines location-based exploration with interactive challenges. Users join tours, complete challenges at various stops (pubs, landmarks, etc.), and compete on leaderboards.

The project is built with **Expo (React Native)** for the frontend and a **Monolithic Vercel Serverless Function** backend using Prisma and PostgreSQL.

---

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React Native (Expo), TypeScript, TailwindCSS (for styling via wrappers), React Navigation.
- **Backend**: Node.js (Expo Router API Routes), consolidated into a single Vercel Serverless Function.
- **Database**: PostgreSQL (Supabase), managed via Prisma ORM.
- **Auth**: Supabase Auth (or custom implementation using Prisma).
- **Deployment**: Vercel (Web/API) & Expo EAS (iOS/Android).

### **Repository Structure**
```
Tracks-Taps/
├── app/                  # Expo Router file-based routing
│   ├── (tabs)/           # Main tab navigation
│   ├── api/              # API Route Handlers (Original Source)
│   └── ...models/screens # App screens
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # Global state (Theme, Auth, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   └── theme/            # Design tokens
├── prisma/               # Database schema and seed scripts
├── scripts/              # Build & Utility scripts
│   └── vercel-build.js   # Custom build script for Vercel deployment
├── dist/                 # Exported static assets (not committed)
└── api/                  # GENERATED Monolithic API for Vercel (not committed)
```

---

## 🚀 Deployment (Web & API)

We deploy to **Vercel** to host both the Web SPA and the API.

### **The "Monolith" Strategy**
Vercel has a limit of 12 serverless functions per deployment on hobby plans. To bypass this and ensure reliable cold starts, we consolidate all Expo API routes (`app/api/*`) into a **single monolithic function** during the build process.

**Key File:** `scripts/vercel-build.js`
1.  **Generates** `api/index.js`: A master router that handles all requests to `/api/*`.
2.  **Bundles Prisma**: Copies the correct Linux Prisma Query Engine (`libquery_engine-rhel-openssl-3.0.x.so.node`) so it's available at runtime.
3.  **Configures Vercel**: Generates a `vercel.json` that routes all API traffic to this single function.

### **How to Deploy**
1.  **Install Vercel CLI**: `npm install -g vercel`
2.  **Run Deploy Command**:
    ```bash
    vercel --prod
    ```
    *The build script (`npm run build`) will automatically execute `node scripts/vercel-build.js` to prepare the artifacts.*

### **Environment Variables**
Ensure these are set in your Vercel Project Settings:
- `DATABASE_URL`: Connection string for PostgreSQL (Transaction pooler recommended).
- `DIRECT_URL`: Direct connection string for migrations (Session mode).

---

## 🍎 Launching on iOS App Store

To launch the native iOS application, follow these steps:

### **1. Prerequisites**
- **Apple Developer Account**: Required to publish to the App Store ($99/year).
- **EAS CLI**: Install via `npm install -g eas-cli`.
- **Expo Account**: Log in via `eas login`.

### **2. Configure EAS Build**
1.  Initialize EAS in your project:
    ```bash
    eas build:configure
    ```
2.  This generates an `eas.json` file. Ensure it has a production profile:
    ```json
    {
      "build": {
        "production": {
          "ios": {
            "resourceClass": "large" // Recommended for Prisma builds
          }
        }
      }
    }
    ```

### **3. App Icons and Splash Screens**
Ensure all assets in `assets/` are correctly sized and linked in `app.json`:
- **icon**: 1024x1024px
- **splash**: 1242x2436px (resizeMode: contain)

### **4. Build for Production**
Run the build command for iOS:
```bash
eas build --platform ios --profile production
```
*This will generate an `.ipa` file that is automatically uploaded to TestFlight if you have configured your credentials.*

### **5. Submission**
1.  Go to **App Store Connect**.
2.  Create a new App entry.
3.  Select the build uploaded via EAS.
4.  Fill out the required metadata (Screenshots, Description, Privacy Policy).
5.  Submit for Review!

---

## 🛠️ Development

### **Running Locally**
```bash
# Start the Expo development server
npm start
```
- Press `w` for Web
- Press `i` for iOS Simulator
- Press `a` for Android Emulator

### **Database Management**
```bash
# Run Migrations
npx prisma migrate dev

# Access Database GUI
npx prisma studio

# Seed Database
npx ts-node prisma/seed.ts
```
