import { Account, Transaction, RecurringSchedule, MonthlyBudget, SavingsGoal } from '../types';
import { getRemainingDaysInMonth, getCurrentMonthStr } from './formatters';

export interface FinancialSummary {
  // Accounts
  liquidBalanceCents: number; // Checking + Cash + Tagesgeld (immediate money)
  depositBalanceCents: number; // Mietkaution (locked deposit)
  totalNetWorthCents: number;

  // Month-to-date actuals
  incomeThisMonthCents: number;
  expensesThisMonthCents: number;
  savingsThisMonthCents: number;
  netCashFlowThisMonthCents: number; // Income - Expenses

  // Week-to-date actuals
  expensesThisWeekCents: number;

  // Safe to Spend breakdown
  upcomingEssentialBillsCents: number;
  plannedEssentialExpensesCents: number;
  protectedSavingsCents: number;
  safeToSpendCents: number;
  remainingDaysInPeriod: number;
  dailySafeToSpendCents: number;
  weeklySafeToSpendCents: number;

  // Budget
  monthlyBudgetLimitCents: number;
  remainingBudgetCents: number;
  budgetUsagePercent: number;

  // Savings rate
  savingsRatePercent: number;
}

export function calculateFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  recurringBills: RecurringSchedule[],
  budget: MonthlyBudget | undefined,
  savingsGoals: SavingsGoal[],
  selectedMonth: string = getCurrentMonthStr()
): FinancialSummary {
  // 1. Account balances
  let liquidBalanceCents = 0;
  let depositBalanceCents = 0;

  for (const acc of accounts) {
    if (acc.type === 'deposit') {
      depositBalanceCents += acc.balanceCents;
    } else {
      liquidBalanceCents += acc.balanceCents;
    }
  }
  const totalNetWorthCents = liquidBalanceCents + depositBalanceCents;

  // 2. Month transactions
  let incomeThisMonthCents = 0;
  let expensesThisMonthCents = 0;
  let expensesThisWeekCents = 0;

  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0 is Sun
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  for (const t of transactions) {
    if (t.date.startsWith(selectedMonth)) {
      if (t.type === 'income') {
        incomeThisMonthCents += t.amountCents;
      } else if (t.type === 'expense') {
        expensesThisMonthCents += t.amountCents;
      }
    }

    // Check week spending
    if (t.type === 'expense') {
      const tDate = new Date(t.date);
      if (tDate >= startOfWeek && tDate <= today) {
        expensesThisWeekCents += t.amountCents;
      }
    }
  }

  // 3. Savings this month
  let savingsThisMonthCents = 0;
  for (const goal of savingsGoals) {
    for (const h of goal.history) {
      if (h.date.startsWith(selectedMonth) && h.amountCents > 0) {
        savingsThisMonthCents += h.amountCents;
      }
    }
  }

  const netCashFlowThisMonthCents = incomeThisMonthCents - expensesThisMonthCents;

  // 4. Upcoming essential bills until end of the month
  // Find recurring bills where nextDueDate is in this month and >= today and essential
  const todayStr = today.toISOString().split('T')[0];
  let upcomingEssentialBillsCents = 0;

  for (const bill of recurringBills) {
    if (bill.isActive && bill.type === 'expense' && bill.isEssential) {
      // If the due date is in this month and today or future
      if (bill.nextDueDate.startsWith(selectedMonth) && bill.nextDueDate >= todayStr) {
        upcomingEssentialBillsCents += bill.amountCents;
      }
    }
  }

  // 5. Protected savings (e.g. emergency fund target contribution or locked allocations)
  let protectedSavingsCents = 0;
  for (const goal of savingsGoals) {
    if (goal.isEmergencyFund && goal.monthlyContributionTargetCents) {
      // Check if already paid this month
      const contributedThisMonth = goal.history
        .filter(h => h.date.startsWith(selectedMonth))
        .reduce((sum, h) => sum + h.amountCents, 0);
      const remainingTarget = Math.max(0, goal.monthlyContributionTargetCents - contributedThisMonth);
      protectedSavingsCents += remainingTarget;
    }
  }

  // 6. Planned essential expenses from budget (if budget essential limit exceeds what's already spent)
  let plannedEssentialExpensesCents = 0;
  if (budget && budget.essentialLimitCents > 0) {
    // calculate essential expenses already paid this month
    const essentialPaid = transactions
      .filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense' && t.isEssential)
      .reduce((sum, t) => sum + t.amountCents, 0);
    const essentialRemaining = Math.max(0, budget.essentialLimitCents - essentialPaid);
    // Don't double count bills that are already in upcomingEssentialBillsCents
    plannedEssentialExpensesCents = Math.max(0, essentialRemaining - upcomingEssentialBillsCents);
  }

  // 7. Safe-to-Spend Calculation
  // Safe-to-spend = Current available balance - Reserved for upcoming essential bills - Other planned essential expenses - Protected savings
  const safeToSpendCents = liquidBalanceCents - upcomingEssentialBillsCents - plannedEssentialExpensesCents - protectedSavingsCents;

  const remainingDaysInPeriod = getRemainingDaysInMonth(1);
  const dailySafeToSpendCents = Math.round(safeToSpendCents / remainingDaysInPeriod);
  const weeklySafeToSpendCents = dailySafeToSpendCents * 7;

  // 8. Monthly Budget limit & usage
  const monthlyBudgetLimitCents = budget?.totalLimitCents || 0;
  const remainingBudgetCents = monthlyBudgetLimitCents > 0 
    ? monthlyBudgetLimitCents - expensesThisMonthCents 
    : 0;
  const budgetUsagePercent = monthlyBudgetLimitCents > 0 
    ? Math.round((expensesThisMonthCents / monthlyBudgetLimitCents) * 100) 
    : 0;

  // 9. Savings rate: (Income - Expenses) / Income * 100
  let savingsRatePercent = 0;
  if (incomeThisMonthCents > 0) {
    const rawRate = ((incomeThisMonthCents - expensesThisMonthCents) / incomeThisMonthCents) * 100;
    savingsRatePercent = Math.max(0, Math.round(rawRate));
  }

  return {
    liquidBalanceCents,
    depositBalanceCents,
    totalNetWorthCents,
    incomeThisMonthCents,
    expensesThisMonthCents,
    savingsThisMonthCents,
    netCashFlowThisMonthCents,
    expensesThisWeekCents,
    upcomingEssentialBillsCents,
    plannedEssentialExpensesCents,
    protectedSavingsCents,
    safeToSpendCents,
    remainingDaysInPeriod,
    dailySafeToSpendCents,
    weeklySafeToSpendCents,
    monthlyBudgetLimitCents,
    remainingBudgetCents,
    budgetUsagePercent,
    savingsRatePercent,
  };
}

export function calculateCategorySpending(
  transactions: Transaction[],
  monthStr: string
): Record<string, { totalCents: number; count: number }> {
  const result: Record<string, { totalCents: number; count: number }> = {};
  for (const t of transactions) {
    if (t.type === 'expense' && t.date.startsWith(monthStr)) {
      if (!result[t.categoryId]) {
        result[t.categoryId] = { totalCents: 0, count: 0 };
      }
      result[t.categoryId].totalCents += t.amountCents;
      result[t.categoryId].count += 1;
    }
  }
  return result;
}

export function calculateDailySpending(
  transactions: Transaction[],
  monthStr: string
): { day: number; dateStr: string; amountCents: number }[] {
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyMap: Record<number, number> = {};

  for (let i = 1; i <= daysInMonth; i++) {
    dailyMap[i] = 0;
  }

  for (const t of transactions) {
    if (t.type === 'expense' && t.date.startsWith(monthStr)) {
      const dayNum = parseInt(t.date.split('-')[2], 10);
      if (dailyMap[dayNum] !== undefined) {
        dailyMap[dayNum] += t.amountCents;
      }
    }
  }

  return Object.keys(dailyMap).map(k => {
    const d = Number(k);
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
    return {
      day: d,
      dateStr,
      amountCents: dailyMap[d],
    };
  });
}
