/**
 * Car Tracker Screen (Module 3)
 * Hidden Module 3 car payment tracker
 */

import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useCarData } from '../../hooks/useCarData';
import { useWorkspaceScope } from '../../hooks/useWorkspaceScope';
import { formatRupees } from '../../utils/currencyUtils';

export const CarTrackerScreen: React.FC = () => {
  const workspaceScope = useWorkspaceScope();
  const { carData, isLoading, error, refreshCarData } = useCarData(workspaceScope.workspaceId);
  const { originalPrice, totalPaidThroughProfits, remainingAmount, monthlyHistory } = carData;
  const progressIsAvailable = Number.isFinite(originalPrice)
    && originalPrice > 0
    && Number.isFinite(totalPaidThroughProfits);
  const appliedPercentage = progressIsAvailable
    ? Math.round(Math.min(100, Math.max(0, (totalPaidThroughProfits / originalPrice) * 100)))
    : 0;

  const handleRetry = async () => {
    await refreshCarData().catch(() => undefined);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screenContent}>
        <Text style={styles.description}>
          Remaining balance from cumulative monthly net profit.
        </Text>

        {isLoading ? (
          <View style={styles.loadingState} accessibilityRole="progressbar" accessibilityLabel="Loading car payment data">
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading car payment data…</Text>
          </View>
        ) : (
          <>
            <View style={styles.summary}>
              <View style={styles.remainingBlock}>
                <Text style={styles.remainingLabel}>REMAINING AMOUNT</Text>
                <Text
                  accessibilityLabel={`Remaining car amount: ${formatAmount(remainingAmount)}`}
                  style={styles.remainingValue}
                >
                  {formatAmount(remainingAmount)}
                </Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeading}>
                  <Text style={styles.progressLabel}>Payment progress</Text>
                  <Text style={styles.progressValue}>
                    {progressIsAvailable ? `${appliedPercentage}% applied` : 'Progress unavailable'}
                  </Text>
                </View>
                {progressIsAvailable ? (
                  <View
                    accessibilityRole="progressbar"
                    accessibilityLabel={`Car amount paid through profits: ${appliedPercentage}%`}
                    accessibilityValue={{ min: 0, max: 100, now: appliedPercentage }}
                    style={styles.progressTrack}
                  >
                    <View style={[styles.progressFill, { width: `${appliedPercentage}%` }]} />
                  </View>
                ) : (
                  <View style={styles.progressTrack} />
                )}
                <Text style={styles.progressCaption}>Based on total profit applied against the original price</Text>
              </View>

              <View style={styles.summaryDetails}>
                <SummaryItem label="Original price" value={originalPrice} />
                <SummaryItem label="Total profit applied" value={totalPaidThroughProfits} />
              </View>
            </View>

            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Monthly history</Text>
              {monthlyHistory.length > 0 ? (
                <View style={styles.historyList}>
                  {monthlyHistory.map(item => (
                    <View key={item.monthKey} style={styles.historyRow}>
                      <Text
                        accessibilityLabel={`Month: ${item.displayMonth}`}
                        style={styles.historyMonth}
                      >
                        {item.displayMonth}
                      </Text>
                      <Text
                        accessibilityLabel={`Net profit applied: ${formatAmount(item.netProfit)}`}
                        style={styles.historyAmount}
                      >
                        {formatAmount(item.netProfit)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No monthly history yet</Text>
                  <Text style={styles.emptyText}>Monthly net profit entries will appear here.</Text>
                </View>
              )}
            </View>
          </>
        )}

        {error ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isLoading ? 'Retrying car payment data' : 'Retry loading car payment data'}
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
              disabled={isLoading}
              onPress={handleRetry}
              style={styles.retryButton}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.lightBg} />
              ) : (
                <Text style={styles.retryButtonText}>Retry</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const SummaryItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text accessibilityLabel={`${label}: ${formatAmount(value)}`} style={styles.summaryValue}>
      {formatAmount(value)}
    </Text>
  </View>
);

const formatAmount = (value: number): string => (
  Number.isFinite(value) ? formatRupees(value) : 'Not available'
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  screenContent: {
    width: '100%',
    maxWidth: 640,
  },
  description: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
    marginBottom: SPACING.lg,
    textAlign: 'left',
  },
  summary: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  remainingBlock: {
    borderBottomColor: COLORS.dividerColor,
    borderBottomWidth: 1,
    paddingBottom: SPACING.md,
  },
  summaryItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
    flex: 1,
    minWidth: 0,
  },
  summaryValue: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    flexShrink: 0,
    marginLeft: SPACING.sm,
    textAlign: 'right',
  },
  remainingLabel: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  remainingValue: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.sm,
    flexShrink: 1,
  },
  progressSection: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  progressHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    color: COLORS.darkText,
    flexShrink: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  progressValue: {
    color: COLORS.primary,
    flexShrink: 0,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  progressTrack: {
    backgroundColor: COLORS.lightBg,
    borderRadius: BORDER_RADIUS.full,
    height: 12,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    height: '100%',
  },
  progressCaption: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.caption,
    marginTop: SPACING.sm,
  },
  summaryDetails: {
    borderTopColor: COLORS.dividerColor,
    borderTopWidth: 1,
    paddingTop: SPACING.xs,
  },
  historySection: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  historyList: {
    backgroundColor: COLORS.lightBg,
    borderColor: COLORS.dividerColor,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  historyRow: {
    alignItems: 'center',
    borderBottomColor: COLORS.dividerColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  historyMonth: {
    color: COLORS.darkText,
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    minWidth: 0,
  },
  historyAmount: {
    color: COLORS.primary,
    flexShrink: 0,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  emptyText: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.caption,
    marginTop: SPACING.xs,
  },
  loadingState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
  },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 76,
    paddingHorizontal: SPACING.md,
  },
  retryButtonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
