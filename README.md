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
You can deploy manually or via Git integration (recommended).

#### **Option 1: Git Integration**
Simply push to your `main` branch. Vercel will automatically detect the commit, run `npm run build`, and deploy the result.

#### **Option 2: Manual CLI**
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

To launch the native iOS application, we use **EAS Build** and **EAS Submit**.

### **1. Prerequisites**
- **Apple Developer Account**: Required to publish to the App Store ($99/year).
- **EAS CLI**: Install via `npm install -g eas-cli`.
- **Expo Account**: Log in via `eas login`.

### **2. Configuration**
The project is configured via `eas.json`. Ensure your `production` profile is set up:

```json
{
  "build": {
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

*Note: App versioning is managed remotely via EAS (see `appVersionSource: "remote"` in `eas.json`).*

### **3. App Icons and Splash Screens**
Ensure all assets in `assets/` are correctly sized and linked in `app.json`:
- **icon**: 1024x1024px
- **splash**: 1242x2436px (resizeMode: contain)

### **4. Build for Production**
Run the build command for iOS:
```bash
eas build --platform ios --profile production
```
This will queue a build on Expo's servers. Once complete, you will have an `.ipa` file ready for submission.

### **5. Submit to TestFlight / App Store**
You can automatically submit the built binary to App Store Connect:
```bash
eas build --platform ios --profile production --auto-submit
```
Follow the interactive prompts to select the build you just created.

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
npx tsx prisma/seed_new.ts
```
