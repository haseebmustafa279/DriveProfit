/**
 * DriveProfit - Car Income, Expense & Profit Management App
 * 
 * Main application entry point
 * Sets up Firebase, Authentication, and Navigation
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';
import { initializeFirebase } from './src/firebase/config';

// Initialize Firebase
initializeFirebase();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        {...({
          barStyle: 'light-content',
          backgroundColor: COLORS.primary,
          translucent: false,
        } as {
          barStyle: 'light-content';
          backgroundColor: string;
          translucent: boolean;
        })}
      />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
