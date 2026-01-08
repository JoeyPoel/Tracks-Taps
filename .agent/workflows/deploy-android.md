---
description: Deploy the Android application to the Google Play Store
---

# Android Deployment Workflow

This workflow guides you through deploying the Tracks & Taps Android application using EAS Build.

## Prerequisites

1.  **Google Services File**: Ensure `google-services.json` is present in the project root.
    -   Download from [Firebase Console](https://console.firebase.google.com/).
2.  **EAS CLI**: Ensure you are logged in.
    ```powershell
    eas login
    ```

## 1. Prepare for Production Build

Ensure your `app.json` versions are correct.
-   `version`: The visible version string (e.g., "1.3.0").
-   `android.buildNumber`: The unique integer for the store (e.g., "4"). Increment this for every upload.

## 2. Build the Android App Bundle (AAB)

Run the following command to build the production bundle for the Play Store.

```powershell
eas build --platform android --profile production
```

-   If prompted, choose to generate a new Keystore (or provide your existing one if you have released before).
-   This process sends the build to Expo's cloud servers. It determines the build queue priority based on your plan.

## 3. Submit to Google Play Store (First Time)

For the **very first deployment**, you must manually upload the `.aab` file.

1.  Go to the [Google Play Console](https://play.google.com/console).
2.  Create your App if needed.
3.  Navigate to **Production** or **Internal Testing**.
4.  Create a new release.
5.  Download the `.aab` file from the EAS Build dashboard (link provided in terminal after build completes).
6.  Upload the `.aab` to the Play Console.

## 4. Future Deployments (Automated)

After the first manual upload, you can configure `eas.json` to submit automatically.

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json"
      }
    }
  }
}
```

Then run:
```powershell
eas submit -p android
```
