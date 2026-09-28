/**
 * Splash/Loading Screen
 * Shown while authentication state is being checked
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>DriveProfit</Text>
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{ marginTop: SPACING.lg }}
      />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightBg,
  },
  appTitle: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.mediumText,
  },
});
