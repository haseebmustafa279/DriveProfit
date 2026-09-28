/**
 * Daily and Monthly Record types
 */

export type EntryType = 'income' | 'expense';
export type MonthlyEntryType = 'profit' | 'carExpense';

export interface DailyRecord {
  id?: string;
  userId: string;
  date: number; // timestamp at local start of day
  type: EntryType;
  description: string;
  amount: number; // stored as integer Pakistani Rupees
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface DailyRecordsForDay {
  income: DailyRecord[];
  expenses: DailyRecord[];
}

export interface MonthlyRecord {
  id?: string;
  monthKey: string; // format: "YYYY-MM"
  date: number; // timestamp of the actual entry date
  type: MonthlyEntryType;
  description: string;
  amount: number; // stored as integer Pakistani Rupees (no decimals)
  createdBy: string; // uid
  updatedBy: string; // uid
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  workspaceId?: string;
}

export interface MonthlyCalculations {
  grossProfit: number; // sum of all profit entries
  carExpenses: number; // sum of all carExpense entries
  netMonthlyProfit: number; // grossProfit - carExpenses
  entries: MonthlyRecord[];
}

export interface CarPaymentData {
  purchasePrice: number; // integer Pakistani rupees
  lastUpdated: number; // timestamp
}

export interface CarTrackerCalculations {
  originalPrice: number;
  totalPaidThroughProfits: number;
  remainingAmount: number;
  monthlyHistory: MonthlyProfitHistory[];
}

export interface MonthlyProfitHistory {
  monthKey: string; // "YYYY-MM"
  netProfit: number;
  displayMonth: string; // formatted display like "August 2026"
}
