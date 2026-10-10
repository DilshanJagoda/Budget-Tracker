/**
 * Verification Test Suite for StudentFlow - Dilshan Jagoda
 * Validates Requirement 22 and financial precision.
 */

import { calculateFinancialSummary } from './calculations';
import { Account, Transaction, RecurringSchedule, MonthlyBudget, SavingsGoal } from '../types';

export function runStudentFlowVerificationTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];

  // Scenario 1: Requirement 22 Test Fixture
  // 1. Income: €900
  // 2. Rent: €450
  // 3. Groceries: €120
  // 4. Transport: €49
  // 5. Subscriptions: €30
  // 6. Savings: €100

  const testAccounts: Account[] = [
    {
      id: 'acc-check',
      name: 'Girokonto',
      nameDe: 'Girokonto',
      type: 'checking',
      balanceCents: 15100, // 900 - (450+120+49+30+100) = 151.00 €
      initialBalanceCents: 0,
      currency: 'EUR',
    },
    {
      id: 'acc-savings',
      name: 'Tagesgeld',
      nameDe: 'Tagesgeld',
      type: 'savings',
      balanceCents: 10000, // €100
      initialBalanceCents: 0,
      currency: 'EUR',
    },
    {
      id: 'acc-deposit',
      name: 'Mietkaution',
      nameDe: 'Mietkaution',
      type: 'deposit',
      balanceCents: 135000, // €1350
      initialBalanceCents: 135000,
      currency: 'EUR',
    },
  ];

  const testTransactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'income',
      amountCents: 90000,
      categoryId: 'inc-workingstudent',
      accountId: 'acc-check',
      date: '2026-10-01',
      merchantOrPayee: 'Employer',
      description: 'Income',
      paymentMethod: 'bank_transfer',
      isEssential: true,
      tags: [],
      createdAt: '2026-10-01',
    },
    {
      id: 'tx-2',
      type: 'expense',
      amountCents: 45000,
      categoryId: 'cat-rent',
      accountId: 'acc-check',
      date: '2026-10-01',
      merchantOrPayee: 'Studentenwerk',
      description: 'Rent',
      paymentMethod: 'direct_debit',
      isEssential: true,
      tags: [],
      createdAt: '2026-10-01',
    },
    {
      id: 'tx-3',
      type: 'expense',
      amountCents: 12000,
      categoryId: 'cat-groceries',
      accountId: 'acc-check',
      date: '2026-10-05',
      merchantOrPayee: 'Supermarket',
      description: 'Groceries',
      paymentMethod: 'card',
      isEssential: true,
      tags: [],
      createdAt: '2026-10-05',
    },
    {
      id: 'tx-4',
      type: 'expense',
      amountCents: 4900,
      categoryId: 'cat-dticket',
      accountId: 'acc-check',
      date: '2026-10-02',
      merchantOrPayee: 'MVG',
      description: 'Deutschlandticket',
      paymentMethod: 'direct_debit',
      isEssential: true,
      tags: [],
      createdAt: '2026-10-02',
    },
    {
      id: 'tx-5',
      type: 'expense',
      amountCents: 3000,
      categoryId: 'cat-subscriptions',
      accountId: 'acc-check',
      date: '2026-10-07',
      merchantOrPayee: 'Streaming',
      description: 'Subscriptions',
      paymentMethod: 'paypal',
      isEssential: false,
      tags: [],
      createdAt: '2026-10-07',
    },
  ];

  const testSavingsGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetCents: 100000,
      currentCents: 10000,
      targetDate: '2027-01-01',
      priority: 'high',
      isEmergencyFund: true,
      history: [
        { id: 'h-1', date: '2026-10-08', amountCents: 10000, note: 'Saved €100' },
      ],
      icon: 'Shield',
      color: '#10b981',
    },
  ];

  const testBudget: MonthlyBudget = {
    month: '2026-10',
    totalLimitCents: 80000,
    categoryBudgets: { 'cat-rent': 45000, 'cat-groceries': 15000, 'cat-dticket': 4900, 'cat-subscriptions': 3000 },
    essentialLimitCents: 65000,
    flexibleLimitCents: 15000,
    savingsTargetCents: 10000,
    weeklyLimitCents: 20000,
    warnThreshold1: 75,
    warnThreshold2: 90,
  };

  const summary = calculateFinancialSummary(
    testAccounts,
    testTransactions,
    [],
    testBudget,
    testSavingsGoals,
    '2026-10'
  );

  // Assertions
  const asserts = [
    { name: 'Income should be exactly €900 (90000 cents)', pass: summary.incomeThisMonthCents === 90000 },
    { name: 'Expenses should be exactly €649 (64900 cents: 450+120+49+30)', pass: summary.expensesThisMonthCents === 64900 },
    { name: 'Savings should be exactly €100 (10000 cents)', pass: summary.savingsThisMonthCents === 10000 },
    { name: 'Liquid balance should equal 25100 cents (Checking 15100 + Savings 10000)', pass: summary.liquidBalanceCents === 25100 },
    { name: 'Deposit balance (Kaution) separated at 135000 cents', pass: summary.depositBalanceCents === 135000 },
    { name: 'Total Net Worth includes Kaution (160100 cents)', pass: summary.totalNetWorthCents === 160100 },
    { name: 'Net cash flow is 90000 - 64900 = 25100 cents', pass: summary.netCashFlowThisMonthCents === 25100 },
    { name: 'Savings rate is ((900 - 649) / 900) * 100 = 28%', pass: summary.savingsRatePercent === 28 },
  ];

  let allPassed = true;
  for (const a of asserts) {
    if (a.pass) {
      results.push(`✓ PASS: ${a.name}`);
    } else {
      results.push(`✗ FAIL: ${a.name}`);
      allPassed = false;
    }
  }

  return { passed: allPassed, results };
}
