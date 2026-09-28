/**
 * Financial calculations
 * Pure functions for calculating income, expenses, profits
 * These should be deterministic and testable
 */

import { DailyRecord, MonthlyRecord, MonthlyCalculations, CarTrackerCalculations, MonthlyProfitHistory } from '../types/records';
import { formatMonthForDisplay } from './dateUtils';

/**
 * Calculate total income for a day
 */
export const calculateDailyIncome = (records: DailyRecord[]): number => {
  return records
    .filter(r => r.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0);
};

/**
 * Calculate total expenses for a day
 */
export const calculateDailyExpenses = (records: DailyRecord[]): number => {
  return records
    .filter(r => r.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0);
};

/**
 * Calculate daily profit
 */
export const calculateDailyProfit = (records: DailyRecord[]): number => {
  const income = calculateDailyIncome(records);
  const expenses = calculateDailyExpenses(records);
  return income - expenses;
};

/**
 * Calculate monthly totals
 */
export const calculateMonthlyTotals = (records: MonthlyRecord[]): MonthlyCalculations => {
  const grossProfit = records
    .filter(r => r.type === 'profit')
    .reduce((sum, record) => sum + record.amount, 0);

  const carExpenses = records
    .filter(r => r.type === 'carExpense')
    .reduce((sum, record) => sum + record.amount, 0);

  return {
    grossProfit,
    carExpenses,
    netMonthlyProfit: grossProfit - carExpenses,
    entries: records,
  };
};

/**
 * Calculate car payment progress
 * This is the CRITICAL calculation - never store remainingAmount as source of truth
 * Always calculate from purchase price and sum of all monthly profits
 */
export const calculateCarPaymentProgress = (
  purchasePrice: number,
  monthlyRecords: MonthlyRecord[]
): CarTrackerCalculations => {
  // Group records by month
  const monthlyMap = new Map<string, MonthlyRecord[]>();

  monthlyRecords.forEach(record => {
    const monthKey = record.monthKey;
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, []);
    }
    monthlyMap.get(monthKey)!.push(record);
  });

  // Calculate net profit for each month and total
  let totalPaidThroughProfits = 0;
  const monthlyHistory: MonthlyProfitHistory[] = [];

  // Sort months in chronological order
  const sortedMonths = Array.from(monthlyMap.keys()).sort();

  sortedMonths.forEach(monthKey => {
    const monthRecords = monthlyMap.get(monthKey)!;
    const calculation = calculateMonthlyTotals(monthRecords);
    const netProfit = calculation.netMonthlyProfit;

    totalPaidThroughProfits += netProfit;

    monthlyHistory.push({
      monthKey,
      netProfit,
      displayMonth: formatMonthForDisplay(new Date(`${monthKey}-01`)),
    });
  });

  const remainingAmount = Math.max(0, purchasePrice - totalPaidThroughProfits);

  return {
    originalPrice: purchasePrice,
    totalPaidThroughProfits,
    remainingAmount,
    monthlyHistory,
  };
};

/**
 * Get net profit for a specific month
 */
export const getMonthlyNetProfit = (records: MonthlyRecord[], monthKey: string): number => {
  const monthRecords = records.filter(r => r.monthKey === monthKey);
  const calculation = calculateMonthlyTotals(monthRecords);
  return calculation.netMonthlyProfit;
};

/**
 * Validate financial data consistency
 * Used for debugging and testing
 */
export const validateFinancialConsistency = (
  purchasePrice: number,
  monthlyRecords: MonthlyRecord[]
): { isValid: boolean; message: string } => {
  // Calculate totals
  const totals = monthlyRecords.reduce(
    (acc, record) => {
      if (record.type === 'profit') {
        acc.totalProfit += record.amount;
      } else if (record.type === 'carExpense') {
        acc.totalExpense += record.amount;
      }
      return acc;
    },
    { totalProfit: 0, totalExpense: 0 }
  );

  const netProfit = totals.totalProfit - totals.totalExpense;
  const remainingAmount = purchasePrice - netProfit;

  if (remainingAmount < 0) {
    return {
      isValid: false,
      message: `Total paid (${netProfit}) exceeds purchase price (${purchasePrice})`,
    };
  }

  return {
    isValid: true,
    message: 'Financial data is consistent',
  };
};
