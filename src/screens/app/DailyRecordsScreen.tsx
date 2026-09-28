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
import { useDailyRecords } from '../../hooks/useDailyRecords';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { DailyRecord, EntryType } from '../../types/records';
import {
  formatDateForDisplay,
  getNextDay,
  getPreviousDay,
  getStartOfDayTimestamp,
  getTodayTimestamp,
} from '../../utils/dateUtils';
import { formatRupees } from '../../utils/currencyUtils';
import { validateDailyEntry } from '../../utils/validation';

export const DailyRecordsScreen: React.FC = () => {
  const { state: authState } = useAuth();
  const userId = authState.user?.uid ?? '';
  const [selectedDate, setSelectedDate] = React.useState(getTodayTimestamp());
  const [formType, setFormType] = React.useState<EntryType | null>(null);
  const [editingRecord, setEditingRecord] = React.useState<DailyRecord | null>(null);
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const todayTimestamp = getTodayTimestamp();
  const safeSelectedDate = Math.min(selectedDate, todayTimestamp);
  const nextDate = getStartOfDayTimestamp(getNextDay(safeSelectedDate));

  React.useEffect(() => {
    if (selectedDate > todayTimestamp) {
      setSelectedDate(todayTimestamp);
    }
  }, [selectedDate, todayTimestamp]);

  const {
    records,
    totalIncome,
    totalExpenses,
    dailyProfit,
    isLoading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
  } = useDailyRecords(userId, safeSelectedDate);

  const openAddForm = (type: EntryType) => {
    setFormType(type);
    setEditingRecord(null);
    setDescription('');
    setAmount('');
    setFormError(null);
  };

  const openEditForm = (record: DailyRecord) => {
    setFormType(record.type);
    setEditingRecord(record);
    setDescription(record.description);
    setAmount(record.amount.toString());
    setFormError(null);
  };

  const closeForm = () => {
    setFormType(null);
    setEditingRecord(null);
    setFormError(null);
  };

  const handleSave = async () => {
    const amountInRupees = Number(amount);

    if (!Number.isInteger(amountInRupees) || amountInRupees <= 0) {
      setFormError('Amount must be greater than zero');
      return;
    }

    const validation = validateDailyEntry(description, amountInRupees);

    if (!validation.isValid || !formType || !userId) {
      setFormError(validation.error || 'You must be signed in to save a record');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      if (editingRecord?.id) {
        await updateRecord(editingRecord.id, {
          description: description.trim(),
          amount: amountInRupees,
        });
      } else {
        await addRecord({
          userId,
          date: safeSelectedDate,
          type: formType,
          description: description.trim(),
          amount: amountInRupees,
        });
      }
      closeForm();
    } catch {
      // The hook exposes the operation error for the screen to display.
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (record: DailyRecord) => {
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
            // The hook exposes the operation error for the screen to display.
          }
        },
      },
    ]);
  };

  const changeDate = (date: Date) => {
    setSelectedDate(Math.min(getStartOfDayTimestamp(date), todayTimestamp));
    closeForm();
  };

  const renderRecord = (record: DailyRecord) => (
    <View
      key={record.id}
      style={[styles.recordRow, record.type === 'income' ? styles.incomeRecord : styles.expenseRecord]}
    >
      <View style={styles.recordDetails}>
        <Text style={styles.recordDescription}>{record.description}</Text>
        <Text style={[styles.recordAmount, record.type === 'income' ? styles.incomeAmount : styles.expenseAmount]}>
          {formatRupees(record.amount)}
        </Text>
      </View>
      <View style={styles.recordActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Edit ${record.type} record: ${record.description}`}
          onPress={() => openEditForm(record)}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Delete ${record.type} record: ${record.description}`}
          onPress={() => handleDelete(record)}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title: string, type: EntryType, sectionRecords: DailyRecord[]) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeading}>
          <View style={[styles.sectionMark, type === 'income' ? styles.incomeMark : styles.expenseMark]} />
          <Text style={[styles.sectionTitle, type === 'income' ? styles.incomeTitle : styles.expenseTitle]}>{title}</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Add ${type} record`}
          style={[styles.addButton, type === 'income' ? styles.incomeAddButton : styles.expenseAddButton]}
          onPress={() => openAddForm(type)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {sectionRecords.length > 0 ? (
        sectionRecords.map(renderRecord)
      ) : !isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No {type} records</Text>
          <Text style={styles.emptyText}>Add an entry to start tracking this day.</Text>
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
          <View style={styles.dateNavigation}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Previous day, ${formatDateForDisplay(getPreviousDay(safeSelectedDate))}`}
              style={styles.dateButton}
              onPress={() => changeDate(getPreviousDay(safeSelectedDate))}
            >
              <View style={[styles.chevronShape, styles.previousChevron]} />
            </TouchableOpacity>
            <Text style={styles.dateText}>{formatDateForDisplay(safeSelectedDate)}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Next day, ${formatDateForDisplay(getNextDay(safeSelectedDate))}`}
              accessibilityState={{ disabled: nextDate > todayTimestamp }}
              style={[styles.dateButton, nextDate > todayTimestamp && styles.disabledDateButton]}
              onPress={() => {
                if (nextDate <= todayTimestamp) {
                  changeDate(getNextDay(safeSelectedDate));
                }
              }}
              disabled={nextDate > todayTimestamp}
            >
              <View style={styles.chevronShape} />
            </TouchableOpacity>
          </View>

          <View style={styles.summary}>
            <SummaryItem label="Income" value={totalIncome} color={COLORS.income} />
            <SummaryItem label="Expenses" value={totalExpenses} color={COLORS.expense} />
            <SummaryItem
              label="Daily Profit"
              value={dailyProfit}
              color={dailyProfit < 0 ? COLORS.loss : COLORS.profit}
              emphasized
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingState} accessibilityRole="progressbar" accessibilityLabel="Loading daily records">
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading records…</Text>
            </View>
          ) : null}
          {error ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {formType ? (
            <View style={[styles.form, formType === 'income' ? styles.incomeForm : styles.expenseForm]}>
              <Text style={styles.formTitle}>
                {editingRecord ? 'Edit Entry' : `Add ${formType === 'income' ? 'Income' : 'Expense'}`}
              </Text>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                accessibilityLabel={`${formType === 'income' ? 'Income' : 'Expense'} description`}
                style={styles.input}
                placeholder="Description or name"
                placeholderTextColor={COLORS.hintText}
                value={description}
                onChangeText={setDescription}
                autoCapitalize="sentences"
              />
              <Text style={styles.inputLabel}>Amount (Rs.)</Text>
              <TextInput
                accessibilityLabel={`${formType === 'income' ? 'Income' : 'Expense'} amount in rupees`}
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

          {renderSection('Income', 'income', records.income)}
          {renderSection('Expenses', 'expense', records.expenses)}
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
  dateNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  disabledDateButton: {
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
  dateText: {
    color: COLORS.darkText,
    flex: 1,
    flexShrink: 1,
    fontSize: TYPOGRAPHY.fontSize.h3,
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
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 4,
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
  incomeForm: {
    borderLeftColor: COLORS.income,
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
  incomeMark: {
    backgroundColor: COLORS.income,
  },
  expenseMark: {
    backgroundColor: COLORS.expense,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  incomeTitle: {
    color: COLORS.income,
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
  incomeAddButton: {
    backgroundColor: COLORS.income,
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
  incomeRecord: {
    borderLeftColor: COLORS.income,
  },
  expenseRecord: {
    borderLeftColor: COLORS.expense,
  },
  recordDetails: {
    flex: 1,
    minWidth: 0,
  },
  recordDescription: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  recordAmount: {
    fontSize: TYPOGRAPHY.fontSize.h4,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xs,
  },
  incomeAmount: {
    color: COLORS.income,
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
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  deleteText: {
    color: COLORS.error,
  },
});
