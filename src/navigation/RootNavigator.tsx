/**
 * Root Navigation Navigator
 * Handles auth stack and app stack based on authentication state
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/theme';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { DailyRecordsScreen } from '../screens/app/DailyRecordsScreen';
import { MonthlyProfitScreen } from '../screens/app/MonthlyProfitScreen';
import { CarTrackerScreen } from '../screens/app/CarTrackerScreen';
import { Module3PinScreen } from '../screens/app/Module3PinScreen';
import { ChangePasswordScreen } from '../screens/app/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { state } = useAuth();

  // Still checking authentication state
  if (!state.isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <SplashScreen />
      </View>
    );
  }

  // User is logged in
  if (state.user && state.userProfile) {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.lightBg,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Dashboard',
              headerTitleAlign: 'center',
              headerLeft: () => null, // Prevent back navigation
            }}
          />
          <Stack.Screen
            name="DailyRecords"
            component={DailyRecordsScreen}
            options={{
              title: 'Daily Records',
            }}
          />
          <Stack.Screen
            name="MonthlyProfit"
            component={MonthlyProfitScreen}
            options={{
              title: 'Monthly Profit',
            }}
          />
          <Stack.Screen
            name="Module3Pin"
            component={Module3PinScreen}
            options={{
              title: 'Secure Access',
            }}
          />
          <Stack.Screen
            name="CarTracker"
            component={CarTrackerScreen}
            options={{
              title: 'Car Payment Tracker',
            }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{
              title: 'Change Password',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // User is not logged in
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
