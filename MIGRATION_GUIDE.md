# Complete Project Account Migration Guide

This guide details the exact steps to migrate **Tracks & Taps** to completely new accounts for **Expo**, **Supabase**, and **Vercel**.

> **⚠️ CRITICAL WARNING**: For Android, you **MUST** save your **Keystore** from the old Expo account. If you lose this, you can NEVER update your existing app on the Play Store again. You would have to create a new app with a new package name.

---

### Ste -1: Firebase (Authentication) Migration
This is the "Auth Passport". You have two choices:
1.  **Keep existing Firebase Project**: Easier. Just keep using the old `google-services.json` and `GoogleService-Info.plist` files.
2.  **Create NEW Firebase Project**:
    *   Create project at [console.firebase.google.com](https://console.firebase.google.com).
    *   Register Android app (`com.joeypoel.trackstaps`).
    *   **CRITICAL**: You must add the **SHA-1 Fingerprint** from your specific Keystore (see Expo Step A below) to this new Firebase project.
    *   Download the **NEW** `google-services.json`.
    *   Enable "Google Sign-In" in Authentication settings.

---

## 1. 📱 Expo (Mobile App) Migration

The most sensitive part is the **Android Keystore**.

### Step A: Export Credentials (OLD Account)
Before switching, export your credentials from the current Expo account.
1. Run: `eas credentials --platform android`
2. Select **"Production"** -> **"Keystore: Manage everything..."** -> **"Download existing keystore"**.
3. **SAVE THIS FILE (`.jks`) SECURELY.**
4. Write down the **Keystore Password**, **Key Alias**, and **Key Password** shown in the terminal.

### Step B: Switch Accounts
1. Log out: `eas logout`
2. Log in to new account: `eas login`

### Step C: Update Configuration
1. Open `app.json`.
2. Change `"owner": "joey_poel"` to the new account username (or remove it if personal).
3. Delete the `extra.eas.projectId` field (it will be auto-generated).
4. Run: `eas build:configure` to generate a new Project ID for the new account.

### Step D: Import Credentials (NEW Account)
1. Run: `eas build --platform android --profile production`
2. It will ask about the Keystore. Select **"I want to upload my own keystore"**.
3. Upload the `.jks` file you saved in Step A.
4. Enter the passwords and alias you wrote down.
    *   *Why?* This ensures the new APK/AAB signature matches the old one, so the Play Store accepts the update.

---

## 2. ⚡ Supabase (Database & Backend) Migration

### Step A: Create New Project
1. Create a new project on the new Supabase account.
2. Go to **Settings > API**.
3. Copy the new:
    *   `Project URL`
    *   `anon public` key
    *   `service_role` key (for backend)

### Step B: Migrate Database Structure (Schema)
1. Update your local `.env` with the **NEW** Supabase credentials.
2. Run migration:
    ```bash
    npx prisma migrate deploy
    # or if using raw SQL
    npx supabase db push
    ```

### Step C: Transfer Data (Optional)
If you need to keep existing user data:
1. On OLD project: **Database > Backups > Download**.
2. On NEW project: Use `psql` or Supabase CLI to restore the dump.
   ```bash
   psql -h aws-0-region.pooler.supabase.com -U postgres -f backup.sql
   ```

### Step D: Re-configure Auth Providers
1. Go to **Authentication > Providers > Google**.
2. **IMPORTANT**: You can re-use the same Client ID/Secret from Google Cloud **UNLESS** you are also changing the Google Cloud project.
    *   If staying on same Google Cloud project: Just copy-paste the Client ID/Secret to the new Supabase project.
    *   **CRITICAL**: You must update the **"Authorized Redirect URIs"** in Google Cloud Console.
        *   Old: `https://[OLD-PROJECT-ID].supabase.co/auth/v1/callback`
        *   New: `https://[NEW-PROJECT-ID].supabase.co/auth/v1/callback`

---

## 3. ▲ Vercel (Web Hosting) Migration

### Step A: Import Project
1. Log into new Vercel account.
2. "Add New..." -> "Project".
3. Import the Git repository (you may need to re-link GitHub if that changed too).

### Step B: Environment Variables
You MUST manually copy these over. Vercel does not do this for you.
Go to **Settings > Environment Variables** and add:

| Variable | Source | Note |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | New Supabase | |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | New Supabase | |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`| Google Cloud | Can stay same if Google Cloud project didn't change |
| `EXPO_PUBLIC_API_URL` | Vercel | The URL of your deployed Vercel instance (e.g. `https://tracks-taps.vercel.app/api`) |
| `DIRECT_URL` | New Supabase | Connection string for migrations (Session mode) |
| `DATABASE_URL` | New Supabase | Connection string for app (Transaction mode) |

### Step C: Update DNS
1. If using a custom domain (e.g., `trackstaps.com`), remove it from the OLD Vercel project.
2. Add it to the NEW Vercel project.
3. Update nameservers/records if prompted.

---

## 📝 Post-Migration Checklist

1.  [ ] **Update Codebase**: Commit the changes to `app.json` and `eas.json` (new `projectId`).
2.  [ ] **Rebuild Mobile App**: Run `eas build --platform all --profile production`.
3.  [ ] **Test Login**: Verify Google Login works on the built app (checks SHA-1 keystore match).
4.  [ ] **Test Database**: Verify app creates data in the NEW Supabase project.
