import { calculateCarPaymentProgress, calculateMonthlyTotals } from '../src/utils/calculations';
import { validateMonthlyEntry } from '../src/utils/validation';

describe('Monthly profit calculations', () => {
  it('sums profit and car expense entries into gross and net totals', () => {
    const totals = calculateMonthlyTotals([
      { id: '1', monthKey: '2026-09', date: 1725744000000, type: 'profit', description: 'Daily Profit', amount: 3000, createdBy: 'u1', updatedBy: 'u1', createdAt: 1725744000000, updatedAt: 1725744000000 },
      { id: '2', monthKey: '2026-09', date: 1725830400000, type: 'profit', description: 'Daily Profit', amount: 4500, createdBy: 'u1', updatedBy: 'u1', createdAt: 1725830400000, updatedAt: 1725830400000 },
      { id: '3', monthKey: '2026-09', date: 1725916800000, type: 'carExpense', description: 'Oil Change', amount: 1000, createdBy: 'u1', updatedBy: 'u1', createdAt: 1725916800000, updatedAt: 1725916800000 },
    ]);

    expect(totals.grossProfit).toBe(7500);
    expect(totals.carExpenses).toBe(1000);
    expect(totals.netMonthlyProfit).toBe(6500);
  });
});

describe('Monthly profit validation', () => {
  it('requires whole rupee integer amounts and rejects decimals', () => {
    expect(validateMonthlyEntry('Daily Profit', 500).isValid).toBe(true);
    expect(validateMonthlyEntry('Daily Profit', 500.5).isValid).toBe(false);
    expect(validateMonthlyEntry('Daily Profit', -1).isValid).toBe(false);
  });
});

describe('Module 3 car payment calculations', () => {
  const purchasePrice = 3500000;

  it('returns the full purchase price when no monthly records exist', () => {
    expect(calculateCarPaymentProgress(purchasePrice, []).remainingAmount).toBe(3500000);
  });

  it('subtracts cumulative net monthly profit from the purchase price', () => {
    expect(calculateCarPaymentProgress(purchasePrice, [
      { monthKey: '2026-08', date: 1, type: 'profit', description: 'Profit', amount: 500000, createdBy: 'u1', updatedBy: 'u1', createdAt: 1, updatedAt: 1 },
    ]).remainingAmount).toBe(3000000);

    expect(calculateCarPaymentProgress(purchasePrice, [
      { monthKey: '2026-08', date: 1, type: 'profit', description: 'Profit', amount: 1200000, createdBy: 'u1', updatedBy: 'u1', createdAt: 1, updatedAt: 1 },
    ]).remainingAmount).toBe(2300000);
  });

  it('uses monthly profits minus monthly car expenses and ignores daily records', () => {
    const records = [
      { monthKey: '2026-08', date: 1, type: 'profit' as const, description: 'Profit', amount: 500000, createdBy: 'u1', updatedBy: 'u1', createdAt: 1, updatedAt: 1 },
      { monthKey: '2026-08', date: 2, type: 'profit' as const, description: 'Profit', amount: 300000, createdBy: 'u1', updatedBy: 'u1', createdAt: 1, updatedAt: 1 },
      { monthKey: '2026-08', date: 3, type: 'carExpense' as const, description: 'Expense', amount: 100000, createdBy: 'u1', updatedBy: 'u1', createdAt: 1, updatedAt: 1 },
    ];

    expect(calculateCarPaymentProgress(purchasePrice, records).remainingAmount).toBe(2800000);
  });

  it('does not allow the remaining amount to become negative', () => {
    expect(calculateCarPaymentProgress(purchasePrice, [
      { monthKey: '2026-08', date: 1, type: 'profit', description: 'Profit', amount: 3500001, createdBy: 'u1', updatedBy: 'u1', createdAt: 1, updatedAt: 1 },
    ]).remainingAmount).toBe(0);
  });
});
