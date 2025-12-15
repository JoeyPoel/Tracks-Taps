# Vercel Deployment Guide

This guide explains how to deploy the **Tracks Taps** Expo Router application to Vercel using the custom build process we established.

## 1. Prerequisites (Environment Variables)

Before deploying, ensure your Vercel project has the following **Environment Variables** set in the dashboard (Settings -> Environment Variables). These allow the serverless functions to connect to your database:

*   `DATABASE_URL`: Your Supabase connection string (Transaction mode).
*   `DIRECT_URL`: Your Supabase connection string (Session mode).
*   `EXPO_PUBLIC_SUPABASE_URL`: Supabase API URL.
*   `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key.
*   `EXPO_PUBLIC_API_URL`: (Optional) The full URL of your Vercel deployment (e.g., `https://tracks-taps-web.vercel.app/api`). If omitted, the app defaults to relative paths `/api` on the web, which is recommended.

## 2. The Build Process

We use a custom build command because Vercel's default behavior doesn't natively understand Expo's "server" output structure (which splits `client` and `server` folders).

Command: `npm run build`

This command runs two steps:
1.  **Expo Export**: `expo export -p web` generates the static and serverless files into `dist/client` and `dist/server`.
2.  **Custom Script**: `node scripts/vercel-build.js` executes to make the output Vercel-compatible.

### What `scripts/vercel-build.js` does:
*   **Flattens Output**: Moves everything from `dist/client` and `dist/server` into the root of `dist`. This ensures `index.html` is at the top level where Vercel expects it.
*   **Generates `vercel.json`**: It reads Expo's `routes.json` manifest and automatically creates a `vercel.json` file with:
    *   **Rewrites**: Maps every API route (e.g., `/api/user/xp`) to its corresponding serverless function file (e.g., `_expo/functions/api/user/xp+api.js`).
    *   **SPA Fallback**: Routes all other traffic to `index.html` so the React Native web app handles navigation.
*   **Generates API Adapters**: It creates a lightweight Node.js-to-Web adapter (`dist/_adapter.js`) and wraps every API route in `dist/api/` (e.g., `dist/api/tours.js`). This ensures Vercel's Node.js runtime can execute Expo's Web-standard API functions.

## 3. How to Deploy

Because we are creating a pre-built artifact (`dist` folder) that is ready to serve, we deploy using the `vercel dist` command. This bypasses Vercel's cloud build step (which often misconfigures the root directory for Expo monorepos).

### Command:
```bash
vercel dist
```

### First Time Setup Prompt Answers:
If you are setting this up on a new machine or new Vercel project, use these settings:
*   Set up and deploy `.../dist`? **Yes**
*   Link to existing project? **No** (Create a new one to avoid "src" folder conflicts if previous settings were broken)
*   Project Name? `tracks-taps-web` (or your preferred name)
*   Code Location? **./** (Root)

## 4. Troubleshooting

**Error: "The provided path dist/src does not exist"**
*   **Cause**: Your Vercel Project Settings have "Root Directory" set to `src`.
*   **Fix**: Go to Vercel Dashboard -> Settings -> General -> Root Directory. Clear it (set to root). Or, deploy to a new project name using `vercel dist` and selecting "No" for linking.

**Error: "connection to database failed" (500 Error)**
*   **Cause**: Missing Environment Variables.
*   **Fix**: Add the Supabase keys listed in Section 1 to the Vercel Dashboard and redeploy.

## Summary of File Changes for Deployment
*   `package.json`: Updated build script to include `node scripts/vercel-build.js`.
*   `app/_layout.tsx`: Added redirect to `/auth/login` for unauthenticated users.
*   `src/store/store.ts`: Hardened data validation to prevent crashes if API returns errors (HTML/404/500).
*   `src/api/client.ts`: Configured to use relative `/api` path when running on web.
