/**
 * Car Tracker Screen (Module 3)
 * Hidden Module 3 car payment tracker
 */

import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { useCarData } from '../../hooks/useCarData';
import { useWorkspaceScope } from '../../hooks/useWorkspaceScope';
import { formatRupees } from '../../utils/currencyUtils';

export const CarTrackerScreen: React.FC = () => {
  const workspaceScope = useWorkspaceScope();
  const { carData, isLoading, error } = useCarData(workspaceScope.workspaceId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>CAR PAYMENT TRACKER</Text>
      <Text style={styles.description}>
        This balance is calculated from cumulative Module 2 net monthly profits only.
      </Text>

      <View style={styles.summary}>
        <SummaryItem label="Original Car Price" value={carData.originalPrice} />
        <SummaryItem label="Total Net Profit Applied" value={carData.totalPaidThroughProfits} />
      </View>

      <View style={styles.remainingCard}>
        <Text style={styles.remainingLabel}>REMAINING CAR AMOUNT</Text>
        <Text style={styles.remainingValue}>{formatRupees(carData.remainingAmount)}</Text>
      </View>

      {isLoading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </ScrollView>
  );
};

const SummaryItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{formatRupees(value)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  title: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  summaryLabel: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
  },
  summaryValue: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  remainingCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  remainingLabel: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  remainingValue: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  loader: {
    marginVertical: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.caption,
    marginTop: SPACING.md,
  },
});
