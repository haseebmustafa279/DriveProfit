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
import { useDailyRecords } from '../../hooks/useDailyRecords';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
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
    <View key={record.id} style={styles.recordRow}>
      <View style={styles.recordDetails}>
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

  const renderSection = (title: string, type: EntryType, sectionRecords: DailyRecord[]) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openAddForm(type)}>
          <Text style={styles.addButtonText}>+ Add {type === 'income' ? 'Income' : 'Expense'}</Text>
        </TouchableOpacity>
      </View>
      {sectionRecords.length > 0 ? (
        sectionRecords.map(renderRecord)
      ) : (
        <Text style={styles.emptyText}>No {type} records for this date.</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Daily Records</Text>

      <View style={styles.dateNavigation}>
        <TouchableOpacity
          accessibilityLabel="Previous date"
          style={styles.dateButton}
          onPress={() => changeDate(getPreviousDay(safeSelectedDate))}
        >
          <Text style={styles.dateButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatDateForDisplay(safeSelectedDate)}</Text>
        <TouchableOpacity
          accessibilityLabel="Next date"
          style={[styles.dateButton, nextDate > todayTimestamp && styles.disabledDateButton]}
          onPress={() => {
            if (nextDate <= todayTimestamp) {
              changeDate(getNextDay(safeSelectedDate));
            }
          }}
          disabled={nextDate > todayTimestamp}
        >
          <Text style={styles.dateButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <SummaryItem label="Total Income" value={totalIncome} color={COLORS.income} />
        <SummaryItem label="Total Expenses" value={totalExpenses} color={COLORS.expense} />
        <SummaryItem label="Daily Profit" value={dailyProfit} color={dailyProfit < 0 ? COLORS.loss : COLORS.profit} />
      </View>

      {isLoading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {formType ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{editingRecord ? 'Edit Entry' : `Add ${formType === 'income' ? 'Income' : 'Expense'}`}</Text>
          <TextInput
            style={styles.input}
            placeholder="Description or name"
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

      {renderSection('Income', 'income', records.income)}
      {renderSection('Expenses', 'expense', records.expenses)}
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
  dateNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  dateButtonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  disabledDateButton: {
    backgroundColor: COLORS.lightText,
  },
  dateText: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
