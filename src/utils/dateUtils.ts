/**
 * Date utility functions
 * Uses date-fns for reliable date handling
 * Uses the device's local calendar time for daily and monthly boundaries
 */

import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  format,
  parse,
  getTime,
  isValid,
} from 'date-fns';

/**
 * Get the start of day in milliseconds (local midnight)
 * This is the key date used to group daily records
 */
export const getStartOfDayTimestamp = (date: Date | number): number => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return getTime(startOfDay(d));
};

/**
 * Get end of day in milliseconds (local 23:59:59.999)
 */
export const getEndOfDayTimestamp = (date: Date | number): number => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return getTime(endOfDay(d));
};

/**
 * Navigate to next day
 */
export const getNextDay = (date: Date | number): Date => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return addDays(d, 1);
};

/**
 * Navigate to previous day
 */
export const getPreviousDay = (date: Date | number): Date => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return subDays(d, 1);
};

/**
 * Format date for display (e.g., "31 Aug 2026")
 */
export const formatDateForDisplay = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return format(d, 'd MMM yyyy');
};

/**
 * Get month key for Firestore queries (e.g., "2026-09")
 */
export const getMonthKey = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return format(d, 'yyyy-MM');
};

/**
 * Get start of month timestamp
 */
export const getStartOfMonthTimestamp = (date: Date | number): number => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return getTime(startOfMonth(d));
};

/**
 * Get end of month timestamp
 */
export const getEndOfMonthTimestamp = (date: Date | number): number => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return getTime(endOfMonth(d));
};

/**
 * Format month for display (e.g., "September 2026")
 */
export const formatMonthForDisplay = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return format(d, 'MMMM yyyy');
};

/**
 * Get start of next month
 */
export const getNextMonth = (date: Date | number): Date => {
  const d = typeof date === 'number' ? new Date(date) : date;
  const endOfCurrentMonth = endOfMonth(d);
  return addDays(endOfCurrentMonth, 1);
};

/**
 * Get start of previous month
 */
export const getPreviousMonth = (date: Date | number): Date => {
  const d = typeof date === 'number' ? new Date(date) : date;
  const startOfCurrentMonth = startOfMonth(d);
  return subDays(startOfCurrentMonth, 1);
};

/**
 * Check if a timestamp falls on a specific date
 */
export const isSameDay = (timestamp: number, date: Date | number): boolean => {
  const d = typeof date === 'number' ? new Date(date) : date;
  const dayStart = getStartOfDayTimestamp(d);
  const dayEnd = getEndOfDayTimestamp(d);
  return timestamp >= dayStart && timestamp <= dayEnd;
};

/**
 * Check if a timestamp falls in a specific month
 */
export const isSameMonth = (timestamp: number, monthKey: string): boolean => {
  const date = new Date(timestamp);
  return getMonthKey(date) === monthKey;
};

/**
 * Today's date at start of day
 */
export const getTodayTimestamp = (): number => {
  return getStartOfDayTimestamp(new Date());
};

/**
 * Parse a date string safely
 */
export const parseDate = (dateString: string, formatStr: string): Date | null => {
  const parsed = parse(dateString, formatStr, new Date());
  return isValid(parsed) ? parsed : null;
};
