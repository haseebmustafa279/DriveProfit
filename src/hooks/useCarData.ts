/**
 * useCarData hook
 * Manages car payment tracking and calculations
 */

import { useState, useEffect, useCallback } from 'react';
import { firestoreService } from '../firebase/firestore';
import { MonthlyRecord, CarTrackerCalculations } from '../types/records';
import { calculateCarPaymentProgress } from '../utils/calculations';
import { CAR_CONFIG } from '../constants/config';

interface UseCarDataReturn {
  carData: CarTrackerCalculations;
  isLoading: boolean;
  error: string | null;
  refreshCarData: () => Promise<void>;
}

export const useCarData = (workspaceId: string): UseCarDataReturn => {
  const [allMonthlyRecords, setAllMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [purchasePrice, setPurchasePrice] = useState(CAR_CONFIG.purchasePrice);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to all monthly records for car tracking
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setAllMonthlyRecords([]);
    setPurchasePrice(CAR_CONFIG.purchasePrice);

    if (!workspaceId) {
      setIsLoading(false);
      return () => {};
    }

    firestoreService.getCarSettings(workspaceId).then(settings => {
      setPurchasePrice(settings.purchasePrice);
    }).catch(() => {
      setError('Failed to load car tracker settings');
    });

    const unsubscribe = firestoreService.onAllMonthlyRecordsChanged(
      workspaceId,
      (records: MonthlyRecord[]) => {
        setAllMonthlyRecords(records);
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
  }, [workspaceId]);

  // Calculate car payment progress
  const carData = calculateCarPaymentProgress(purchasePrice, allMonthlyRecords);

  const refreshCarData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [freshRecords, settings] = await Promise.all([
        firestoreService.getAllMonthlyRecords(workspaceId),
        firestoreService.getCarSettings(workspaceId),
      ]);
      setAllMonthlyRecords(freshRecords);
      setPurchasePrice(settings.purchasePrice);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh car data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  return {
    carData,
    isLoading,
    error,
    refreshCarData,
  };
};
