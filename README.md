# Tracks & Taps 🍻🗺️

**Gamified Urban Exploration Platform**

> This repository contains the source code for the Tracks & Taps mobile application. 
> For detailed documentation relevant to university admissions, please refer to:
> -   📘 **[Engineering Architecture (UPC)](./README_TECHNICAL.md)** - Deep dive into stack, patterns, and infrastructure.
> -   📙 **[Product Vision (UPF)](./README_BUSINESS.md)** - Analysis of user journey, loop, and business logic.

---

## 🚀 Deployment & Launch

### 🌐 Web & API (Vercel)
The project is configured for serverless deployment on Vercel. 
- **The Monolith**: To bypass Vercel serverless function limits, the build executes `scripts/vercel-build.js` which bundles all API routes into a single master function.
- **How to Deploy**: Push to the `main` branch or use `vercel --prod` via CLI.

### 🍎 iOS App Store
We use **EAS Build** for native distribution.
1. **Build for Production**:
   ```bash
   eas build --platform ios --profile production
   ```
2. **Submit to App Store**:
   ```bash
   eas build --platform ios --profile production --auto-submit
   ```
*Ensure `eas.json` and `app.json` are correctly configured with your developer credentials.*

---

## ⚡ Quick Start Guide

Follow these steps to get the development environment running locally.

### 1. Prerequisites
-   **Node.js**: v18.0.0 or higher.
-   **Expo Go**: Installed on your physical iOS/Android device.
-   **Git**: For version control.
-   **PostgreSQL**: Local or remote instance (Supabase recommended).

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/JoeyPoel/Tracks-Taps.git
cd Tracks-Taps
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory. You need a PostgreSQL connection string (Supabase Transaction Pooler recommended).

```env
# Database Connection
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# JWT Secrets (if using custom Auth)
JWT_SECRET="super-secret-key"
```

### 4. Database Setup

We use **Prisma ORM**. You need to push the schema and seed the database with initial tours/users.

```bash
# Generate Prisma Client
npx prisma generate

# Push Schema to DB
npx prisma db push

# Seed Initial Data
npx tsx prisma/seed_new.ts
```

### 5. Run the Application

Start the Expo Development Server:

```bash
npx expo start -c
```
*Flag `-c` clears the bundler cache to ensure a clean start.*

Once running:
-   Scan the QR code with **Expo Go** (Android) or **Camera App** (iOS).
-   Press `w` to run in Web Browser.

---

## 🛠️ Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Start the dev server. |
| `npx prisma studio` | Open the Database GUI to inspect records. |
| `npm run build` | Build the project for Vercel/Web deployment. |

---

*Verified Jan 2026*
