/**
 * useMonthlyRecords hook
 * Manages monthly profit and car expense records
 */

import { useState, useEffect, useCallback } from 'react';
import { firestoreService } from '../firebase/firestore';
import { MonthlyRecord, MonthlyCalculations } from '../types/records';
import { calculateMonthlyTotals } from '../utils/calculations';

interface UseMonthlyRecordsReturn {
  records: MonthlyRecord[];
  calculations: MonthlyCalculations;
  isLoading: boolean;
  error: string | null;
  addRecord: (record: Omit<MonthlyRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecord: (recordId: string, updates: Partial<MonthlyRecord>) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  refreshRecords: () => Promise<void>;
}

export const useMonthlyRecords = (monthKey: string, workspaceId: string): UseMonthlyRecordsReturn => {
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedScopeKey, setLoadedScopeKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scopeKey = `${workspaceId}:${monthKey}`;

  // Subscribe to real-time updates
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setRecords([]);

    const unsubscribe = firestoreService.onMonthlyRecordsChanged(
      monthKey,
      workspaceId,
      (monthlyRecords: MonthlyRecord[]) => {
        setRecords(monthlyRecords);
        setLoadedScopeKey(scopeKey);
        setIsLoading(false);
      },
      listenerError => {
        setLoadedScopeKey(scopeKey);
        setIsLoading(false);
        setError(listenerError.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [monthKey, scopeKey, workspaceId]);

  // Calculate totals
  const calculations = calculateMonthlyTotals(records);

  // Methods
  const addRecord = useCallback(
    async (record: Omit<MonthlyRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setError(null);
        await firestoreService.addMonthlyRecord(record, workspaceId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add record';
        setError(errorMessage);
        throw err;
      }
    },
    [workspaceId]
  );

  const updateRecord = useCallback(
    async (recordId: string, updates: Partial<MonthlyRecord>) => {
      try {
        setError(null);
        await firestoreService.updateMonthlyRecord(recordId, updates);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteRecord = useCallback(async (recordId: string) => {
    try {
      setError(null);
      await firestoreService.deleteMonthlyRecord(recordId);
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
      const freshRecords = await firestoreService.getMonthlyRecords(monthKey, workspaceId);
      setRecords(freshRecords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh records';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [monthKey, workspaceId]);

  return {
    records,
    calculations,
    isLoading: isLoading || loadedScopeKey !== scopeKey,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refreshRecords,
  };
};
