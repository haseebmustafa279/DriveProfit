/**
 * Currency utility functions
 * Handles Pakistani Rupees (Rs.)
 * All amounts stored as integers (cents)
 */

/**
 * Format amount to display string with Rs. prefix
 * Input: 123450 (representing Rs. 1234.50)
 * Output: "Rs. 1,234.50"
 */
export const formatCurrency = (amountInCents: number): string => {
  if (!isFinite(amountInCents)) {
    return 'Rs. 0';
  }

  const amountInRupees = amountInCents / 100;
  return `Rs. ${amountInRupees.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Format an integer Pakistani Rupee amount for Daily Records.
 */
export const formatRupees = (amountInRupees: number): string => {
  if (!isFinite(amountInRupees)) {
    return 'Rs. 0';
  }

  return `Rs. ${amountInRupees.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Format amount with decimal places
 * Input: 123450 (representing Rs. 1234.50)
 * Output: "1,234.50"
 */
export const formatCurrencyNumber = (amountInCents: number): string => {
  if (!isFinite(amountInCents)) {
    return '0';
  }

  const amountInRupees = amountInCents / 100;
  return amountInRupees.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Convert user input string to cents
 * Input: "1234.50" or "1234" or "1,234.50"
 * Output: 123450
 */
export const parseInputToCents = (input: string): number | null => {
  // Remove all non-digit and non-dot characters
  const cleaned = input.replace(/[^\d.]/g, '');

  const parsed = parseFloat(cleaned);

  if (!isFinite(parsed) || parsed < 0) {
    return null;
  }

  // Convert to cents and round to avoid floating point issues
  return Math.round(parsed * 100);
};

/**
 * Check if amount is valid
 */
export const isValidAmount = (amountInCents: number | null): boolean => {
  return amountInCents !== null && amountInCents > 0 && isFinite(amountInCents);
};

/**
 * Get color based on amount (for profit/loss visualization)
 */
export const getAmountColor = (amountInCents: number): string => {
  if (amountInCents > 0) return '#4CAF50'; // green for profit
  if (amountInCents < 0) return '#F44336'; // red for loss
  return '#FFC107'; // amber for zero
};
