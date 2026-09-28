/**
 * Dashboard Screen (App Stack)
 * Main entry point after login
 * Placeholder for Phase 4
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, logout } = useAuth();
  const carTapCount = React.useRef(0);
  const carTapTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (carTapTimeout.current) clearTimeout(carTapTimeout.current);
  }, []);

  const handleCarIconPress = () => {
    carTapCount.current += 1;
    if (carTapTimeout.current) clearTimeout(carTapTimeout.current);

    if (carTapCount.current === 5) {
      carTapCount.current = 0;
      navigation.navigate('Module3Pin');
      return;
    }

    carTapTimeout.current = setTimeout(() => {
      carTapCount.current = 0;
    }, 1500);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const userName = state.userProfile?.name;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {userName}</Text>
      </View>

      <View style={styles.modulesContainer}>
        {/* Daily Records Module */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('DailyRecords')}
        >
          <Text style={styles.moduleTitle}>Daily Records</Text>
          <Text style={styles.moduleSubtitle}>Income & Expenses</Text>
          <Text style={styles.modulePlaceholder}>→</Text>
        </TouchableOpacity>

        {/* Monthly Profit Module */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('MonthlyProfit')}
        >
          <Text style={styles.moduleTitle}>Monthly Profit</Text>
          <Text style={styles.moduleSubtitle}>Shared Income Tracking</Text>
          <Text style={styles.modulePlaceholder}>→</Text>
        </TouchableOpacity>

        {/* Car Tracker (Hidden) */}
        <TouchableOpacity
          accessibilityLabel="Car icon"
          onPress={handleCarIconPress}
          style={[styles.moduleCard, styles.moduleCardDisabled]}
        >
          <Text style={styles.moduleTitle}>🚗 (Hidden)</Text>
          <Text style={styles.moduleSubtitle}>Gesture detection enabled</Text>
          <Text style={styles.modulePlaceholder}>🔒</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.changePasswordButton}
        onPress={() => navigation.navigate('ChangePassword')}
      >
        <Text style={styles.changePasswordButtonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xxl,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.darkText,
  },
  modulesContainer: {
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  moduleCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleCardDisabled: {
    opacity: 0.6,
    borderLeftColor: COLORS.lightText,
  },
  moduleTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.darkText,
  },
  moduleSubtitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.mediumText,
  },
  modulePlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    color: COLORS.primary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  changePasswordButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  changePasswordButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  logoutButtonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
