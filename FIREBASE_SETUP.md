# Firebase Setup Guide for DriveProfit

This guide walks you through setting up Firebase for the DriveProfit application.

## Prerequisites

- Google account
- Firebase project (new or existing)
- Android Studio and Xcode configured (for React Native development)

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a project**
3. Enter project name: `DriveProfit` (or your preferred name)
4. Continue through the setup
5. Enable Google Analytics (optional)
6. Click **Create project**

---

## Step 2: Register Android App

1. In Firebase Console, click **Add app** → **Android**
2. Fill in app details:
   - **Android package name**: `com.driveprofit`
   - **App nickname**: `DriveProfit Android`
   - **SHA-1 certificate**: Get from Android Studio or run:
     ```bash
     cd android
     ./gradlew signingReport
     ```
     Look for the `SHA1` value in the `debugKey` output.

3. Download `google-services.json`
4. Place it at: `android/app/google-services.json`
5. Android setup is complete

---

## Step 3: Register iOS App

1. In Firebase Console, click **Add app** → **iOS**
2. Fill in app details:
   - **iOS bundle ID**: `com.driveprofit`
   - **App nickname**: `DriveProfit iOS`
   - **App Store ID**: Leave blank for development

3. Download `GoogleService-Info.plist`
4. Open `ios/DriveProfit.xcodeproj` in Xcode
5. Right-click on the project and select **Add Files to "DriveProfit"**
6. Select the downloaded `GoogleService-Info.plist`
7. Ensure it's added to all targets

---

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Select **Email/Password** provider
4. Enable it and click **Save**
5. Go to **Users** tab (currently empty)

---

## Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose location (preferably close to your users)
4. Select **Start in test mode** (for development)
   - ⚠️ **Important**: For production, use the security rules in `src/firebase/rules.json`
5. Click **Create**

---

## Step 6: Update Firebase Config in App

1. Open `src/constants/config.ts`
2. Update the `FIREBASE_CONFIG` object with credentials from Firebase Console:
   - Go to **Project Settings** (gear icon)
   - Select your Android app
   - Copy the config values

Example:
```typescript
export const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'yourproject.firebaseapp.com',
  projectId: 'yourproject',
  storageBucket: 'yourproject.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:android:abcdef123456',
};
```

⚠️ **Note**: For React Native Firebase, the config is typically handled through native configuration files. The above is a backup configuration.

---

## Step 7: Create Test Users

### Method 1: Via Firebase Console

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Create two users:

**User 1 (Father)**
- Email: `father@driveprofit.com`
- Password: `test123456` (minimum 6 characters)

**User 2 (Son)**
- Email: `son@driveprofit.com`
- Password: `test123456`

### Method 2: Via App (Optional)

After running the app, you can create test users through the login screen:
- The error messages will indicate when an email is not registered
- You can add sign-up functionality later

---

## Step 8: Create User Profiles in Firestore

After creating test users, create their Firestore profiles:

1. Go to **Firestore Database**
2. Create a new collection: `users`
3. Create two documents with user IDs as document names:

**Get User UID from Firebase Console:**
- Go to **Authentication** → **Users**
- Click on a user to see their **User UID**

**Document 1 (Father) - Replace `FATHER_UID` with actual UID**

Collection: `users`
Document ID: `FATHER_UID`
Fields:
```
name: "Father" (string)
email: "father@driveprofit.com" (string)
role: "father" (string)
createdAt: <current timestamp>
updatedAt: <current timestamp>
```

**Document 2 (Son) - Replace `SON_UID` with actual UID**

Collection: `users`
Document ID: `SON_UID`
Fields:
```
name: "Son" (string)
email: "son@driveprofit.com" (string)
role: "son" (string)
createdAt: <current timestamp>
updatedAt: <current timestamp>
```

---

## Step 9: Create App Settings

1. In Firestore Database, create collection: `appSettings`
2. Create document `car`:

Collection: `appSettings`
Document ID: `car`
Fields:
```
purchasePrice: 3500000 (number - Rs. 3,500,000 in integer rupees)
lastUpdated: <current timestamp>
```

## Module 3 PIN Verification

Module 3 is available only to authenticated users whose profile role is `father` or `son`.
From the Dashboard, tap the car icon five times within 1.5 seconds between the first and
last tap. The app reads `MODULE3_PIN` from the root `.env` file through
`react-native-config`. The `.env` file is ignored by Git, while `.env.example` documents
the required variable name.

This is a client-side configuration value and is not a backend secret. It is suitable for
the current no-Blaze requirement, but a value packaged into a mobile app can ultimately be
extracted from the application binary. Firebase Secret Manager, Cloud Functions, and
Firestore are not used for Module 3 PIN verification.

---

## Step 10: Deploy Firestore Security Rules After Migration

⚠️ **Do not deploy the final rules until the migration in Step 11 is complete and validated.**

**To enforce proper security rules:**

After completing and validating Step 11, go to **Firestore Database** →
**Rules**, copy the rules from `src/firebase/rules.json`, paste them into the
Firebase Console Rules editor, and click **Publish**. Do not publish before
the Admin SDK migration and direct validation are complete.

These rules ensure:
- Users can only access their own daily records
- Monthly records belong to a private or explicitly provisioned workspace
- Only Father and Son workspace members can access shared records
- Car trackers are isolated by workspace
- Users cannot modify ownership or workspace membership
- All operations require authentication

---

## Step 11: Provision and Migrate the Father-Son Workspace

The repository does not contain the real Father or Son UIDs. Do not guess them.

1. Back up Firestore first and retain the backup before making any changes.
2. Copy the real Firebase Authentication UIDs from the Firebase Console and
   verify each UID against the intended Father and Son accounts. Never guess or
   derive these values.
3. Using the Firebase Console or Admin SDK, create:

   Collection: `workspaces`
   Document: `father-son`

   ```text
   memberUids: ["FATHER_UID", "SON_UID"]
   type: "fatherSon"
   ```

4. Run the controlled Admin SDK migration script from
   `scripts/migrate-monthly-workspace.js` in dry-run mode first. Supply the
   intended workspace ID explicitly as `father-son`. The script must be run
   with Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS`
   supplied by the operator; credentials must never be committed.

   From the project root:

   ```bash
   npm run migrate:monthly-workspace -- --workspace-id father-son --dry-run
   ```

   The script fails without valid Admin SDK Application Default Credentials,
   an existing `workspaces/father-son` document, and exactly two workspace
   member UIDs.
5. Review the dry-run report. Then run the script with the explicit confirmation
   token shown by its `--help` output. This is the first command that writes;
   do not run it until the dry-run and backup have been reviewed:

   ```bash
   npm run migrate:monthly-workspace -- --workspace-id father-son --confirm ASSIGN_WORKSPACE:father-son
   ```

   It changes only legacy monthly documents
   that do not have `workspaceId`:

   ```text
   workspaceId: "father-son"
   ```

   This assigns the existing shared data to the explicitly authorized workspace;
   it does not change amounts, dates, descriptions, or creator metadata.
   The script preserves document IDs and every existing financial, date, creator,
   and updater field. It skips records already assigned to `father-son`, reports
   conflicting workspace IDs without overwriting them, and reports successes and
   errors.
6. Validate migrated records directly with the Admin SDK or Firebase Console,
   including document IDs, financial values, and `workspaceId`.
7. Create `carTrackers/father-son` with the existing purchase price:

   ```text
   purchasePrice: 3500000
   lastUpdated: <current timestamp>
   workspaceId: "father-son"
   ```

8. Confirm every monthly record has `workspaceId`, resolve any reported
   conflicts manually through a reviewed Admin SDK operation, and verify the
   migrated records directly. Then complete Step 10 to publish the final rules.
   After publishing, verify both authorized accounts can read and edit the
   migrated records, an unrelated third account is denied, and a legacy monthly
   document without `workspaceId` is denied.

The final rules intentionally deny all monthly records that still lack
`workspaceId`; they do not provide a transitional production bypass.

This migration has not been completed by this project. No live records should
be changed until the backup, UID verification, dry-run report, and direct
validation steps above have been reviewed by the operator.

Existing users created before this change may not have `privateWorkspaceId` in
their profile. The app derives `private-<uid>` for them, so no profile migration
is required for private workspace access.

## Step 12: Test the Setup

1. Build and run the app:
   ```bash
   npm run android
   # or
   npm run ios
   ```

2. You should see the Login screen
3. Try logging in with:
   - Email: `father@driveprofit.com`
   - Password: `test123456`

4. If successful, you'll see the Dashboard

---

## Troubleshooting

### Issue: "google-services.json not found"
- Ensure `android/app/google-services.json` exists
- Run: `npm run android` again

### Issue: "Firebase not initialized"
- Check that `google-services.json` and `GoogleService-Info.plist` are in the correct locations
- Rebuild the app

### Issue: Authentication fails
- Verify test user exists in Firebase Console
- Check that the password is exactly `test123456`
- Ensure email is spelled correctly

### Issue: Firestore permission denied
- Switch to **test mode** in Firestore to allow unauthenticated reads
- Or deploy the proper security rules from `src/firebase/rules.json`

---

## Next Steps

After Phase 2 (Authentication) is working:

1. **Phase 3**: Add role-based profiles and validation
2. **Phase 4**: Build Dashboard and Navigation
3. **Phase 5**: Implement Daily Records Module
4. **Phase 6**: Implement Monthly Profit Module
5. **Phase 7**: Implement Car Payment Tracker (Module 3)
6. **Phase 8**: Deploy production security rules

---

## Production Checklist

Before deploying to production:

- [ ] Update `FIREBASE_CONFIG` with production credentials
- [ ] Deploy security rules from `src/firebase/rules.json`
- [ ] Remove test users from Firebase Console
- [ ] Enable email verification
- [ ] Enable reCAPTCHA (optional, for enhanced security)
- [ ] Set up backup schedules
- [ ] Configure error logging (e.g., Crashlytics)
- [ ] Set up Firebase monitoring

---

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
