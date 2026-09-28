/**
 * Monthly Profit Screen (Module 2)
 */

import React from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
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
    <View key={record.id} style={styles.recordRow}>
      <View style={styles.recordDetails}>
        <Text style={styles.recordDate}>{format(new Date(record.date), 'd MMM yyyy')}</Text>
        <Text style={styles.recordDescription}>{record.description}</Text>
        <Text style={styles.recordAmount}>{formatRupees(record.amount)}</Text>
      </View>
      <View style={styles.recordActions}>
        <TouchableOpacity onPress={() => openEditForm(record)} style={styles.actionButton}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(record)} style={styles.actionButton}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title: string, type: MonthlyEntryType, sectionRecords: MonthlyRecord[]) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openAddForm(type)}>
          <Text style={styles.addButtonText}>+ Add {type === 'profit' ? 'Profit' : 'Expense'}</Text>
        </TouchableOpacity>
      </View>
      {sectionRecords.length > 0 ? (
        sectionRecords.map(renderRecord)
      ) : (
        <Text style={styles.emptyText}>No {type === 'profit' ? 'profit' : 'car expense'} entries for this month.</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Monthly Profit</Text>

      <View style={styles.monthNavigation}>
        <TouchableOpacity
          style={[styles.navButton, !isCurrentMonth && styles.navButtonActive]}
          onPress={navigateToPreviousMonth}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.currentMonthButton, isCurrentMonth && styles.currentMonthButtonDisabled]}
          onPress={() => setSelectedMonth(startOfMonth(new Date()))}
          disabled={isCurrentMonth}
        >
          <Text style={styles.currentMonthButtonText}>Current Month</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !isCurrentMonth && styles.navButtonActive]}
          onPress={navigateToNextMonth}
          disabled={isCurrentMonth}
        >
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.selectedMonth}>{formatMonthForDisplay(selectedMonth)}</Text>

      <View style={styles.summary}>
        <SummaryItem label="Gross Monthly Profit" value={calculations.grossProfit} color={COLORS.profit} />
        <SummaryItem label="Total Car Expenses" value={calculations.carExpenses} color={COLORS.expense} />
        <SummaryItem label="Net Monthly Profit" value={calculations.netMonthlyProfit} color={calculations.netMonthlyProfit >= 0 ? COLORS.profit : COLORS.loss} />
      </View>

      {isLoading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {formType ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{editingRecord ? 'Edit Entry' : `Add ${formType === 'profit' ? 'Profit' : 'Car Expense'}`}</Text>

          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateChangeButton} onPress={() => moveEntryDate(-1)}>
              <Text style={styles.dateChangeText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.dateText}>{format(entryDate, 'd MMM yyyy')}</Text>
            <TouchableOpacity style={styles.dateChangeButton} onPress={() => moveEntryDate(1)}>
              <Text style={styles.dateChangeText}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor={COLORS.hintText}
            value={description}
            onChangeText={setDescription}
            autoCapitalize="sentences"
          />
          <TextInput
            style={styles.input}
            placeholder="Amount (Rs.)"
            placeholderTextColor={COLORS.hintText}
            value={amount}
            onChangeText={value => setAmount(value.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
          />
          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={closeForm} disabled={isSaving}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color={COLORS.lightBg} /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {renderSection('Profit', 'profit', profitRecords)}
      {renderSection('Car Expense', 'carExpense', expenseRecords)}
    </ScrollView>
  );
};

const SummaryItem: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryValue, { color }]}>{formatRupees(value)}</Text>
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
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  monthNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  navButton: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  navButtonActive: {
    backgroundColor: COLORS.primary,
  },
  navButtonText: {
    color: COLORS.darkText,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  currentMonthButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  currentMonthButtonDisabled: {
    opacity: 0.5,
  },
  currentMonthButtonText: {
    color: COLORS.lightBg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  selectedMonth: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  loader: {
    marginVertical: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.caption,
    marginBottom: SPACING.sm,
  },
  form: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  formTitle: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h4,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dateChangeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  dateChangeText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  dateText: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  input: {
    backgroundColor: COLORS.lightBg,
    borderColor: COLORS.dividerColor,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.body,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },
  cancelButton: {
    borderColor: COLORS.mediumText,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.mediumText,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 80,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  saveButtonText: {
    color: COLORS.lightBg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
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
  sectionTitle: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  addButtonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  emptyText: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
    paddingVertical: SPACING.md,
  },
  recordRow: {
    alignItems: 'center',
    borderBottomColor: COLORS.dividerColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  recordDetails: {
    flex: 1,
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
  },
  recordAmount: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.caption,
    marginTop: SPACING.xs,
  },
  recordActions: {
    flexDirection: 'row',
    marginLeft: SPACING.sm,
  },
  actionButton: {
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
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
