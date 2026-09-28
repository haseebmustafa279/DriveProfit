/**
 * Application configuration constants
 */

// Firebase configuration
// TODO: Replace these with your actual Firebase project credentials
export const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'drive-profit-c8b2d',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: '64453928430',
  appId: '1:64453928430:android:c22a54e5a7b7904c01daff',
};

// Car configuration
export const CAR_CONFIG = {
  model: 'Suzuki Alto ABS AGS 2026',
  purchasePrice: 3500000, // integer Pakistani rupees
};

// App-specific constants
export const APP_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 6,
  PIN_LENGTH: 4,
  MAX_PIN_LENGTH: 6,
};

// Firestore collection names
export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  dailyRecords: 'dailyRecords',
  monthlyRecords: 'monthlyRecords',
  workspaces: 'workspaces',
  carTrackers: 'carTrackers',
  appSettings: 'appSettings',
};

export const WORKSPACE_CONFIG = {
  fatherSonId: 'father-son',
  privatePrefix: 'private-',
};

// Error messages
export const ERROR_MESSAGES = {
  auth: {
    invalidEmail: 'Invalid email format',
    invalidPassword: 'Password must be at least 6 characters',
    userNotFound: 'User not found. Please check your credentials.',
    wrongPassword: 'Incorrect password',
    emailAlreadyInUse: 'Email is already registered',
    networkError: 'Network error. Please check your internet connection.',
    unknownError: 'An error occurred. Please try again.',
  },
  entry: {
    invalidDescription: 'Description cannot be empty',
    invalidAmount: 'Amount must be greater than zero',
    saveFailed: 'Failed to save entry. Please try again.',
    deleteFailed: 'Failed to delete entry. Please try again.',
    loadFailed: 'Failed to load records. Please try again.',
  },
  general: {
    unauthorized: 'You do not have permission to access this resource',
    offlineMode: 'You are offline. Some features may not work.',
    genericError: 'Something went wrong. Please try again.',
  },
};

// Success messages
export const SUCCESS_MESSAGES = {
  entryAdded: 'Entry added successfully',
  entryUpdated: 'Entry updated successfully',
  entryDeleted: 'Entry deleted successfully',
  loggedOut: 'Logged out successfully',
};
