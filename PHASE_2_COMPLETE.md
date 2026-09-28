# DriveProfit - Car Income, Expense & Profit Management App

A production-quality React Native mobile application for managing income, expenses, profits, and car payment progress.

**Status**: Phase 2 ✅ Authentication & Firebase Setup Complete

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Phase Status](#phase-status)
- [Quick Start](#quick-start)
- [Firebase Setup](#firebase-setup)
- [Architecture](#architecture)
- [Development](#development)

---

## ✨ Features

### Completed (Phase 2)
- ✅ Firebase Authentication setup
- ✅ Email/Password login system
- ✅ Session persistence
- ✅ User role management (Father/Son)
- ✅ Firestore database integration
- ✅ TypeScript support
- ✅ Navigation structure
- ✅ Professional UI foundation

### In Progress
- 🔄 Phase 3: Role-based user profiles
- 🔄 Phase 4: Dashboard and navigation
- 🔄 Phase 5: Daily Income/Expense Module
- 🔄 Phase 6: Monthly Profit Module
- 🔄 Phase 7: Car Payment Tracker (Hidden)
- 🔄 Phase 8: Security Rules Deployment
- 🔄 Phase 9: Validation & Error Handling
- 🔄 Phase 10: UI Polishing
- 🔄 Phase 11: Testing
- 🔄 Phase 12: Production Build

---

## 🛠 Technology Stack

- **Frontend**: React Native 0.87.1
- **Language**: TypeScript 6.0.3
- **Backend**: Firebase
  - Authentication
  - Cloud Firestore
- **Navigation**: React Navigation 6
- **UI Framework**: React Native Paper
- **State Management**: React Hooks + Context
- **Date Handling**: date-fns
- **Validation**: zod
- **Storage**: AsyncStorage (session persistence)

---

## 📁 Project Structure

```
DriveProfit/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common components (Card, Modal, Loader)
│   │   ├── navigation/      # Navigation components
│   │   ├── entry/           # Entry form components
│   │   └── protected/       # Protected access components
│   ├── screens/
│   │   ├── auth/            # Authentication screens
│   │   │   └── LoginScreen.tsx
│   │   ├── app/             # App screens
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── DailyRecordsScreen.tsx
│   │   │   ├── MonthlyProfitScreen.tsx
│   │   │   └── CarTrackerScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── firebase/
│   │   ├── config.ts        # Firebase configuration
│   │   ├── auth.ts          # Authentication service
│   │   ├── firestore.ts     # Firestore service
│   │   └── rules.json       # Security rules
│   ├── services/            # Business logic services
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Auth context & hook
│   │   ├── useDailyRecords.ts
│   │   ├── useMonthlyRecords.ts
│   │   └── useCarData.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── records.ts
│   │   └── common.ts
│   ├── utils/               # Utility functions
│   │   ├── dateUtils.ts
│   │   ├── currencyUtils.ts
│   │   ├── validation.ts
│   │   └── calculations.ts
│   ├── constants/
│   │   ├── config.ts        # App configuration
│   │   └── theme.ts         # Theme & styling constants
│   └── App.tsx              # Root app component
├── android/                 # Android native code
├── ios/                     # iOS native code
├── FIREBASE_SETUP.md        # Firebase setup guide
├── package.json
└── tsconfig.json
```

---

## 📊 Phase Status

### ✅ Phase 1: Project Inspection & Architecture
- Analyzed existing project structure
- Planned technology stack
- Designed folder structure and database schema
- **Status**: COMPLETE

### ✅ Phase 2: Firebase Setup & Authentication
- Installed all dependencies
- Created complete folder structure
- Built authentication service
- Implemented auth context and hook
- Created login screen
- Set up navigation structure
- Wrote Firebase setup documentation
- **Status**: COMPLETE

### ⏳ Phase 3: Role-Based User Profiles
- User profile model and validation
- Role enforcement (Father/Son)
- Firestore user documents
- Profile management service
- **Status**: READY TO START

### ⏳ Phase 4: Navigation & Dashboard
- Bottom tab navigation
- Dashboard with module cards
- Navigation between screens
- Logout functionality
- **Status**: READY TO START

### ⏳ Phase 5: Module 1 - Daily Income/Expense
- Income entry management
- Expense entry management
- Daily calculations
- Date navigation
- Edit/Delete functionality
- **Status**: READY TO START

### ⏳ Phase 6: Module 2 - Monthly Profit
- Monthly record management
- Profit vs. Car Expense tracking
- Monthly calculations
- Month navigation
- Shared access control
- **Status**: READY TO START

### ⏳ Phase 7: Module 3 - Car Payment Tracker
- Hidden gesture detection (5 taps)
- PIN verification
- Car payment calculations
- Monthly history display
- **Status**: READY TO START

### ⏳ Phase 8: Security Rules
- Deploy Firestore security rules
- Test permission boundaries
- Data validation rules
- **Status**: READY TO START

### ⏳ Phase 9-12: Polish, Testing & Production
- Comprehensive error handling
- Input validation
- Edge case handling
- UI refinement
- Full app testing
- Production build preparation
- **Status**: READY TO START

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.11.0+
- npm or yarn
- Android Studio or Xcode (for running on device/emulator)
- Firebase account

### Installation

1. **Clone repository** (if applicable)
   ```bash
   cd DriveProfit
   ```

2. **Install dependencies** ✅ (Already done)
   ```bash
   npm install
   ```

3. **Configure Firebase** ⏳ (Next step)
   - Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Add `google-services.json` to `android/app/`
   - Add `GoogleService-Info.plist` to `ios/DriveProfit/`

4. **Update Firebase config** in `src/constants/config.ts`

5. **Run the app**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

6. **Login with test credentials**
   - Email: `father@driveprofit.com` or `son@driveprofit.com`
   - Password: `test123456` (after Firebase setup)

---

## 🔐 Firebase Setup

Complete Firebase configuration is required before running the app.

### Quick Setup Steps:
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Register Android and iOS apps
3. Download configuration files
4. Enable Authentication (Email/Password)
5. Create Firestore Database
6. Create test users
7. Create user profiles in Firestore
8. Deploy security rules

**Full details**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

## 🏗 Architecture

### Authentication Flow
```
App Start
    ↓
Check Authentication State (AsyncStorage)
    ↓
    ├─→ Session Found → Load User Profile → Dashboard
    │
    └─→ Session Not Found → Firebase Auth State Listener
            ↓
            ├─→ Authenticated → Load Profile → Dashboard
            └─→ Not Authenticated → Login Screen
```

### Database Schema

**users/{uid}**
- `name`: User's display name
- `email`: User's email
- `role`: "father" | "son"
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**dailyRecords/{recordId}**
- `userId`: Record owner
- `date`: Date timestamp
- `type`: "income" | "expense"
- `description`: Entry description
- `amount`: Amount in cents
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**monthlyRecords/{recordId}**
- `monthKey`: "YYYY-MM"
- `date`: Entry date timestamp
- `type`: "profit" | "carExpense"
- `description`: Entry description
- `amount`: Amount in cents
- `createdBy`: User UID
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**appSettings/car**
- `purchasePrice`: Purchase price in cents
- `lastUpdated`: Timestamp

### Security Rules
- Unauthenticated users: No access
- Father: Only sees own daily records
- Son: Only sees own daily records
- Both: Can access shared monthly records
- Immutable roles: Cannot be changed by users

---

## 💻 Development

### Key Utilities

#### Date Handling (`utils/dateUtils.ts`)
```typescript
getStartOfDayTimestamp(date)    // For daily record queries
getMonthKey(date)               // "2026-09" format
formatDateForDisplay(date)      // "31 Aug 2026"
formatMonthForDisplay(date)     // "September 2026"
```

#### Currency (`utils/currencyUtils.ts`)
```typescript
formatCurrency(amountInCents)   // "Rs. 1,234"
parseInputToCents(input)        // "1234.50" → 123450
isValidAmount(cents)            // Validation
```

#### Calculations (`utils/calculations.ts`)
```typescript
calculateDailyIncome(records)
calculateDailyExpenses(records)
calculateDailyProfit(records)
calculateMonthlyTotals(records)
calculateCarPaymentProgress(price, records)
```

### Key Hooks

#### useAuth
```typescript
const { state, login, logout, getUserRole } = useAuth();
// state: { user, userProfile, isLoading, error, isInitialized }
```

#### useDailyRecords
```typescript
const { records, totalIncome, totalExpenses, dailyProfit, ... } 
  = useDailyRecords(userId, dateTimestamp);
```

#### useMonthlyRecords
```typescript
const { records, calculations, ... } = useMonthlyRecords(monthKey);
// calculations: { grossProfit, carExpenses, netMonthlyProfit }
```

#### useCarData
```typescript
const { carData, ... } = useCarData();
// carData: { originalPrice, totalPaidThroughProfits, remainingAmount, monthlyHistory }
```

### Validation

All inputs validated with `utils/validation.ts`:
```typescript
validateLoginCredentials(email, password)
validateDailyEntry(description, amount)
validateMonthlyEntry(description, amount)
isValidEmail(email)
isValidPassword(password)
isValidPIN(pin)
```

### Error Handling

All Firebase operations include error handling:
```typescript
try {
  await operation();
} catch (error) {
  // User-friendly error message already provided
  // Technical errors logged to console
}
```

---

## 📱 Testing Checklist for Phase 2

- [ ] App launches without errors
- [ ] Splash screen appears while initializing
- [ ] Login screen is accessible
- [ ] Firebase config is correct
- [ ] Test user authentication works
- [ ] Dashboard appears after login
- [ ] User name and role display correctly
- [ ] Logout button works
- [ ] Session persists on app restart
- [ ] Navigation to module placeholders works
- [ ] Errors display user-friendly messages

---

## 🐛 Troubleshooting

### Firebase Not Initializing
- Verify `google-services.json` is in `android/app/`
- Verify `GoogleService-Info.plist` is in `ios/DriveProfit/`
- Rebuild: `npm run android` / `npm run ios`

### Login Not Working
- Ensure test user exists in Firebase Console
- Check Firebase config in `src/constants/config.ts`
- Verify Firestore user profile document exists
- Check console for detailed error logs

### TypeScript Errors
- Run `npm install` to ensure all types are installed
- Verify tsconfig.json includes all source files
- Check for circular imports

---

## 📚 Next Phase (Phase 3)

Phase 3 will focus on:
1. User profile endpoints
2. Role-based access control at component level
3. User profile UI screens
4. Profile editing (name, etc.)
5. Role enforcement tests

---

## 📝 License

[Add your license here]

---

## 👥 Contributors

- Haseeb (Project Lead)

---

## 📞 Support

For issues or questions:
1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Review the troubleshooting section
3. Check console logs for detailed errors

---

**Last Updated**: 2026-09-01
**Phase Status**: 2/12 Complete ✅
