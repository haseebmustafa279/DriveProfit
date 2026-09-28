/**
 * useDailyRecords hook
 * Manages daily income and expense records for a specific date
 */

import { useState, useEffect, useCallback } from 'react';
import { firestoreService } from '../firebase/firestore';
import { DailyRecord, DailyRecordsForDay } from '../types/records';
import {
  calculateDailyIncome,
  calculateDailyExpenses,
  calculateDailyProfit,
} from '../utils/calculations';
import {
  isValidAmountInput,
  isValidDescription,
  validateDailyEntry,
} from '../utils/validation';

interface UseDailyRecordsReturn {
  records: DailyRecordsForDay;
  totalIncome: number;
  totalExpenses: number;
  dailyProfit: number;
  isLoading: boolean;
  error: string | null;
  addRecord: (record: Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecord: (recordId: string, updates: Partial<DailyRecord>) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  refreshRecords: () => Promise<void>;
}

export const useDailyRecords = (_userId: string, dateTimestamp: number): UseDailyRecordsReturn => {
  const [allRecords, setAllRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = firestoreService.onDailyRecordsChanged(
      dateTimestamp,
      (records: DailyRecord[]) => {
        setAllRecords(records);
        setIsLoading(false);
      },
      listenerError => {
        setIsLoading(false);
        setError(listenerError.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [dateTimestamp]);

  // Calculate totals
  const records: DailyRecordsForDay = {
    income: allRecords.filter(r => r.type === 'income'),
    expenses: allRecords.filter(r => r.type === 'expense'),
  };

  const totalIncome = calculateDailyIncome(allRecords);
  const totalExpenses = calculateDailyExpenses(allRecords);
  const dailyProfit = calculateDailyProfit(allRecords);

  // Methods
  const addRecord = useCallback(async (record: Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const validation = validateDailyEntry(record.description, record.amount);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid daily record');
      }

      await firestoreService.addDailyRecord(record);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add record';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateRecord = useCallback(async (recordId: string, updates: Partial<DailyRecord>) => {
    try {
      setError(null);
      if (updates.description !== undefined && !isValidDescription(updates.description)) {
        throw new Error('Description cannot be empty');
      }
      if (
        updates.amount !== undefined &&
        (!Number.isInteger(updates.amount) || !isValidAmountInput(updates.amount))
      ) {
        throw new Error('Amount must be greater than zero');
      }

      await firestoreService.updateDailyRecord(recordId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteRecord = useCallback(async (recordId: string) => {
    try {
      setError(null);
      await firestoreService.deleteDailyRecord(recordId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const freshRecords = await firestoreService.getDailyRecords(dateTimestamp);
      setAllRecords(freshRecords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh records';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dateTimestamp]);

  return {
    records,
    totalIncome,
    totalExpenses,
    dailyProfit,
    isLoading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refreshRecords,
  };
};
