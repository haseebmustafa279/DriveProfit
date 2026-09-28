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
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

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

  const userName = state.userProfile?.name?.trim() || 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>

      <View style={styles.modulesContainer}>
        {/* Daily Records Module */}
        <TouchableOpacity
          style={styles.moduleCard}
          accessibilityRole="button"
          accessibilityLabel="Open Daily Records, income and expenses"
          activeOpacity={0.78}
          onPress={() => navigation.navigate('DailyRecords')}
        >
          <View style={styles.moduleMark} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text style={styles.moduleMarkText} allowFontScaling={false}>DR</Text>
          </View>
          <View style={styles.moduleCopy}>
            <Text style={styles.moduleTitle}>Daily Records</Text>
            <Text style={styles.moduleSubtitle}>Income &amp; Expenses</Text>
          </View>
          <View style={styles.cardChevron} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.chevronShape} />
          </View>
        </TouchableOpacity>

        {/* Monthly Profit Module */}
        <TouchableOpacity
          style={styles.moduleCard}
          accessibilityRole="button"
          accessibilityLabel="Open Monthly Profit, shared income tracking"
          activeOpacity={0.78}
          onPress={() => navigation.navigate('MonthlyProfit')}
        >
          <View style={styles.moduleMark} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text style={styles.moduleMarkText} allowFontScaling={false}>MP</Text>
          </View>
          <View style={styles.moduleCopy}>
            <Text style={styles.moduleTitle}>Monthly Profit</Text>
            <Text style={styles.moduleSubtitle}>Shared income tracking</Text>
          </View>
          <View style={styles.cardChevron} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.chevronShape} />
          </View>
        </TouchableOpacity>

        {/* Car Tracker (Hidden) */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Car module, hidden"
          activeOpacity={0.78}
          onPress={handleCarIconPress}
          style={[styles.moduleCard, styles.moduleCardHidden]}
        >
          <View style={[styles.moduleMark, styles.moduleMarkHidden]} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text style={[styles.moduleMarkText, styles.moduleMarkTextHidden]} allowFontScaling={false}>CT</Text>
          </View>
          <View style={styles.moduleCopy}>
            <Text style={styles.moduleTitle}>Car Tracker (Hidden)</Text>
            <Text style={styles.moduleSubtitle}>Gesture detection enabled</Text>
          </View>
          <View style={[styles.cardChevron, styles.cardChevronHidden]} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={[styles.chevronShape, styles.chevronShapeHidden]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.accountActions}>
        <TouchableOpacity
          style={styles.changePasswordButton}
          accessibilityRole="button"
          accessibilityLabel="Change password"
          activeOpacity={0.78}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.changePasswordButtonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          activeOpacity={0.78}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    width: '100%',
    maxWidth: 640,
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.h4,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.mediumText,
  },
  userName: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.darkText,
  },
  modulesContainer: {
    width: '100%',
    maxWidth: 640,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  moduleCard: {
    minHeight: 88,
    backgroundColor: COLORS.lightBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.dividerColor,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  moduleCardHidden: {
    borderLeftColor: COLORS.lightText,
  },
  moduleMark: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleMarkText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  moduleMarkHidden: {
    backgroundColor: COLORS.cardBg,
  },
  moduleMarkTextHidden: {
    color: COLORS.mediumText,
  },
  moduleCopy: {
    flex: 1,
    minWidth: 0,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize.h4,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.darkText,
  },
  moduleSubtitle: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.mediumText,
  },
  cardChevron: {
    width: 24,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronShape: {
    width: 9,
    height: 9,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
  cardChevronHidden: {
    opacity: 0.65,
  },
  chevronShapeHidden: {
    borderColor: COLORS.mediumText,
  },
  accountActions: {
    width: '100%',
    maxWidth: 640,
    gap: SPACING.md,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePasswordButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
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
