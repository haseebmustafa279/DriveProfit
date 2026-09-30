/**
 * Monthly Profit Screen (Module 2)
 */

import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useMonthlyRecords } from '../../hooks/useMonthlyRecords';
import { useWorkspaceScope } from '../../hooks/useWorkspaceScope';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { MonthlyEntryType, MonthlyRecord } from '../../types/records';
import {
  endOfMonth,
  format,
  startOfMonth,
  addDays,
} from 'date-fns';
import { formatRupees } from '../../utils/currencyUtils';
import { getMonthKey, formatMonthForDisplay, getPreviousMonth, getNextMonth } from '../../utils/dateUtils';
import { validateMonthlyEntry } from '../../utils/validation';

const getMonthBoundaryDate = (date: Date, selectedMonth: Date): Date => {
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  if (date < monthStart) return monthStart;
  if (date > monthEnd) return monthEnd;
  return date;
};

export const MonthlyProfitScreen: React.FC = () => {
  const { state: authState } = useAuth();
  const userId = authState.user?.uid ?? '';
  const workspaceScope = useWorkspaceScope();
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(startOfMonth(today));
  const [formType, setFormType] = React.useState<MonthlyEntryType | null>(null);
  const [editingRecord, setEditingRecord] = React.useState<MonthlyRecord | null>(null);
  const [entryDate, setEntryDate] = React.useState<Date>(getMonthBoundaryDate(today, selectedMonth));
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const monthKey = getMonthKey(selectedMonth);
  const currentMonthKey = getMonthKey(new Date());
  const isCurrentMonth = monthKey === currentMonthKey;

  React.useEffect(() => {
    setEntryDate(prev => getMonthBoundaryDate(prev, selectedMonth));
  }, [selectedMonth]);

  const {
    records,
    calculations,
    isLoading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
  } = useMonthlyRecords(monthKey, workspaceScope.workspaceId);

  const sortedRecords = [...records].sort((a, b) => a.date - b.date);
  const profitRecords = sortedRecords.filter(record => record.type === 'profit');
  const expenseRecords = sortedRecords.filter(record => record.type === 'carExpense');

  const openAddForm = (type: MonthlyEntryType) => {
    setFormType(type);
    setEditingRecord(null);
    setDescription(type === 'profit' ? 'Daily Profit' : 'Car Expense');
    setAmount('');
    setFormError(null);
    setEntryDate(getMonthBoundaryDate(new Date(selectedMonth), selectedMonth));
  };

  const openEditForm = (record: MonthlyRecord) => {
    setFormType(record.type);
    setEditingRecord(record);
    setDescription(record.description);
    setAmount(String(record.amount));
    setEntryDate(new Date(record.date));
    setFormError(null);
  };

  const closeForm = () => {
    setFormType(null);
    setEditingRecord(null);
    setFormError(null);
  };

  const handleSave = async () => {
    const amountValue = Number(amount);

    if (!Number.isInteger(amountValue) || amountValue <= 0) {
      setFormError('Amount must be a positive whole rupee value');
      return;
    }

    const validation = validateMonthlyEntry(description, amountValue);

    if (!validation.isValid || !formType || !userId) {
      setFormError(validation.error || 'You must be signed in to save a record');
      return;
    }

    const entryTimestamp = getMonthBoundaryDate(entryDate, selectedMonth).getTime();
    const safeDescription = description.trim();

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingRecord?.id) {
        await updateRecord(editingRecord.id, {
          type: formType,
          description: safeDescription,
          amount: amountValue,
          date: entryTimestamp,
          monthKey,
          updatedBy: userId,
        });
      } else {
        await addRecord({
          monthKey,
          date: entryTimestamp,
          type: formType,
          description: safeDescription,
          amount: amountValue,
          createdBy: userId,
          updatedBy: userId,
        });
      }
      closeForm();
    } catch {
      setFormError('Failed to save the monthly record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (record: MonthlyRecord) => {
    if (!record.id) return;

    Alert.alert('Delete record', `Delete "${record.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(record.id!);
          } catch {
            setFormError('Failed to delete the record. Please try again.');
          }
        },
      },
    ]);
  };

  const changeMonth = (nextDate: Date) => {
    const monthStart = startOfMonth(nextDate);
    const nowStart = startOfMonth(new Date());
    if (monthStart > nowStart) {
      return;
    }
    setSelectedMonth(monthStart);
    closeForm();
  };

  const navigateToPreviousMonth = () => {
    changeMonth(getPreviousMonth(selectedMonth));
  };

  const navigateToNextMonth = () => {
    if (isCurrentMonth) return;
    changeMonth(getNextMonth(selectedMonth));
  };

  const moveEntryDate = (delta: number) => {
    const nextDate = addDays(getMonthBoundaryDate(entryDate, selectedMonth), delta);
    setEntryDate(getMonthBoundaryDate(nextDate, selectedMonth));
  };

  const renderRecord = (record: MonthlyRecord) => (
    <View
      key={record.id}
      style={[styles.recordRow, record.type === 'profit' ? styles.profitRecord : styles.expenseRecord]}
    >
      <View style={styles.recordDetails}>
        <Text style={styles.recordDate}>{format(new Date(record.date), 'd MMM yyyy')}</Text>
        <Text style={styles.recordDescription} numberOfLines={2}>{record.description}</Text>
        <Text style={[styles.recordAmount, record.type === 'profit' ? styles.profitAmount : styles.expenseAmount]}>
          {formatRupees(record.amount)}
        </Text>
      </View>
      <View style={styles.recordActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Edit ${record.type === 'profit' ? 'profit' : 'car expense'} record: ${record.description}`}
          onPress={() => openEditForm(record)}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Delete ${record.type === 'profit' ? 'profit' : 'car expense'} record: ${record.description}`}
          onPress={() => handleDelete(record)}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title: string, type: MonthlyEntryType, sectionRecords: MonthlyRecord[]) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeading}>
          <View style={[styles.sectionMark, type === 'profit' ? styles.profitMark : styles.expenseMark]} />
          <Text style={[styles.sectionTitle, type === 'profit' ? styles.profitTitle : styles.expenseTitle]}>{title}</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Add ${type === 'profit' ? 'profit' : 'car expense'} record`}
          style={[styles.addButton, type === 'profit' ? styles.profitAddButton : styles.expenseAddButton]}
          onPress={() => openAddForm(type)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {sectionRecords.length > 0 ? (
        sectionRecords.map(renderRecord)
      ) : !isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No {type === 'profit' ? 'profit' : 'car expense'} entries</Text>
          <Text style={styles.emptyText}>Add an entry to start tracking this month.</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screenContent}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Previous month, ${formatMonthForDisplay(getPreviousMonth(selectedMonth))}`}
              style={styles.navButton}
              onPress={navigateToPreviousMonth}
            >
              <View style={[styles.chevronShape, styles.previousChevron]} />
            </TouchableOpacity>
            <Text style={styles.selectedMonth} accessibilityLiveRegion="polite">
              {formatMonthForDisplay(selectedMonth)}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Next month, ${formatMonthForDisplay(getNextMonth(selectedMonth))}`}
              accessibilityState={{ disabled: isCurrentMonth }}
              style={[styles.navButton, isCurrentMonth && styles.disabledNavButton]}
              onPress={navigateToNextMonth}
              disabled={isCurrentMonth}
            >
              <View style={styles.chevronShape} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Return to current month"
            accessibilityState={{ disabled: isCurrentMonth }}
            style={styles.currentMonthButton}
            onPress={() => setSelectedMonth(startOfMonth(new Date()))}
            disabled={isCurrentMonth}
          >
            <Text style={[styles.currentMonthButtonText, isCurrentMonth && styles.disabledCurrentMonthText]}>
              Current Month
            </Text>
          </TouchableOpacity>

          <View style={styles.summary} accessibilityLabel="Monthly profit summary">
            <SummaryItem label="Gross Profit" value={calculations.grossProfit} color={COLORS.profit} />
            <SummaryItem label="Car Expenses" value={calculations.carExpenses} color={COLORS.expense} />
            <Text style={styles.summaryEquation}>Gross Profit - Car Expenses = Net Profit</Text>
            <SummaryItem
              label="Net Monthly Profit"
              value={calculations.netMonthlyProfit}
              color={calculations.netMonthlyProfit >= 0 ? COLORS.profit : COLORS.loss}
              emphasized
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingState} accessibilityRole="progressbar" accessibilityLabel="Loading monthly records">
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading monthly records…</Text>
            </View>
          ) : null}
          {error ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {formError && !formType ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          {formType ? (
            <View style={[styles.form, formType === 'profit' ? styles.profitForm : styles.expenseForm]}>
              <Text style={styles.formTitle}>{editingRecord ? 'Edit Entry' : `Add ${formType === 'profit' ? 'Profit' : 'Car Expense'}`}</Text>

              <Text style={styles.inputLabel}>Entry date</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Previous entry date"
                  style={styles.dateChangeButton}
                  onPress={() => moveEntryDate(-1)}
                >
                  <View style={[styles.chevronShape, styles.previousChevron]} />
                </TouchableOpacity>
                <Text style={styles.dateText}>{format(entryDate, 'd MMM yyyy')}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Next entry date"
                  style={styles.dateChangeButton}
                  onPress={() => moveEntryDate(1)}
                >
                  <View style={styles.chevronShape} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                accessibilityLabel={`${formType === 'profit' ? 'Profit' : 'Car expense'} description`}
                style={styles.input}
                placeholder="Description"
                placeholderTextColor={COLORS.hintText}
                value={description}
                onChangeText={setDescription}
                autoCapitalize="sentences"
              />
              <Text style={styles.inputLabel}>Amount (Rs.)</Text>
              <TextInput
                accessibilityLabel={`${formType === 'profit' ? 'Profit' : 'Car expense'} amount in rupees`}
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor={COLORS.hintText}
                value={amount}
                onChangeText={value => setAmount(value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
              {formError ? (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}
              <View style={styles.formActions}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Cancel entry"
                  accessibilityState={{ disabled: isSaving }}
                  style={styles.cancelButton}
                  onPress={closeForm}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={isSaving ? 'Saving entry' : 'Save entry'}
                  accessibilityState={{ disabled: isSaving, busy: isSaving }}
                  style={[styles.saveButton, isSaving && styles.disabledSaveButton]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? <ActivityIndicator color={COLORS.lightBg} /> : <Text style={styles.saveButtonText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {renderSection('Profit', 'profit', profitRecords)}
          {renderSection('Car Expense', 'carExpense', expenseRecords)}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const SummaryItem: React.FC<{ label: string; value: number; color: string; emphasized?: boolean }> = ({
  label,
  value,
  color,
  emphasized = false,
}) => (
  <View style={[styles.summaryItem, emphasized && styles.summaryProfitItem]}>
    <Text style={[styles.summaryLabel, emphasized && styles.summaryProfitLabel]}>{label}</Text>
    <Text style={[styles.summaryValue, emphasized && styles.summaryProfitValue, { color }]}>{formatRupees(value)}</Text>
  </View>
);

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
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
  monthNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  disabledNavButton: {
    backgroundColor: COLORS.lightText,
  },
  chevronShape: {
    borderColor: COLORS.lightBg,
    borderRightWidth: 2,
    borderTopWidth: 2,
    height: 9,
    transform: [{ rotate: '45deg' }],
    width: 9,
  },
  previousChevron: {
    transform: [{ rotate: '-135deg' }],
  },
  currentMonthButton: {
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  currentMonthButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  disabledCurrentMonthText: {
    color: COLORS.mediumText,
  },
  selectedMonth: {
    color: COLORS.darkText,
    flex: 1,
    flexShrink: 1,
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  summaryItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  summaryProfitItem: {
    backgroundColor: COLORS.lightBg,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
    paddingLeft: SPACING.md,
  },
  summaryLabel: {
    color: COLORS.mediumText,
    flexShrink: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
  },
  summaryProfitLabel: {
    color: COLORS.darkText,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  summaryValue: {
    flexShrink: 0,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
    textAlign: 'right',
  },
  summaryProfitValue: {
    fontSize: TYPOGRAPHY.fontSize.h4,
  },
  summaryEquation: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.caption,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.xs,
    textAlign: 'right',
  },
  loadingState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  loadingText: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
  },
  errorBanner: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  form: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  profitForm: {
    borderLeftColor: COLORS.profit,
  },
  expenseForm: {
    borderLeftColor: COLORS.expense,
  },
  formTitle: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h4,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: SPACING.sm,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dateChangeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  dateText: {
    color: COLORS.darkText,
    flex: 1,
    flexShrink: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.lightBg,
    borderColor: COLORS.dividerColor,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    minHeight: 48,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: COLORS.mediumText,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: SPACING.md,
  },
  cancelButtonText: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: SPACING.md,
  },
  disabledSaveButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: SPACING.sm,
  },
  sectionMark: {
    borderRadius: BORDER_RADIUS.full,
    height: 10,
    width: 10,
  },
  profitMark: {
    backgroundColor: COLORS.profit,
  },
  expenseMark: {
    backgroundColor: COLORS.expense,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  profitTitle: {
    color: COLORS.profit,
  },
  expenseTitle: {
    color: COLORS.expense,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 88,
    paddingHorizontal: SPACING.md,
  },
  profitAddButton: {
    backgroundColor: COLORS.profit,
  },
  expenseAddButton: {
    backgroundColor: COLORS.expense,
  },
  addButtonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
  recordRow: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBg,
    borderColor: COLORS.dividerColor,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  profitRecord: {
    borderLeftColor: COLORS.profit,
  },
  expenseRecord: {
    borderLeftColor: COLORS.expense,
  },
  recordDetails: {
    flex: 1,
    minWidth: 0,
  },
  recordDate: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.caption,
    marginBottom: SPACING.xs,
  },
  recordDescription: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    flexShrink: 1,
  },
  recordAmount: {
    fontSize: TYPOGRAPHY.fontSize.h4,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xs,
  },
  profitAmount: {
    color: COLORS.profit,
  },
  expenseAmount: {
    color: COLORS.expense,
  },
  recordActions: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: SPACING.xs,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 52,
    paddingHorizontal: SPACING.xs,
  },
  actionText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  deleteText: {
    color: COLORS.error,
  },
});
