import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, formatDateGerman, getRelativeDateLabel } from '../../utils/formatters';
import { calculateCategorySpending, calculateDailySpending } from '../../utils/calculations';
import { IconRenderer } from '../common/IconRenderer';
import { 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  CalendarCheck2, 
  Sliders, 
  Sparkles,
  Info
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    summary, 
    transactions, 
    categories, 
    accounts, 
    recurring, 
    savingsGoals, 
    selectedMonth, 
    openAddTxModal, 
    setActiveTab, 
    deleteTransaction,
    settings, 
    t 
  } = useApp();

  const [showSafeBreakdown, setShowSafeBreakdown] = useState(false);

  // Category breakdown for doughnut chart
  const categorySpending = useMemo(() => {
    return calculateCategorySpending(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const categoryChartData = useMemo(() => {
    const list = Object.entries(categorySpending).map(([catId, data]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat ? (settings.language === 'de' ? cat.nameDe : cat.name) : catId,
        color: cat?.color || '#94a3b8',
        icon: cat?.icon || 'HelpCircle',
        totalCents: data.totalCents,
        count: data.count,
      };
    });
    // Sort descending
    return list.sort((a, b) => b.totalCents - a.totalCents);
  }, [categorySpending, categories, settings.language]);

  // Daily spending trend data
  const dailyData = useMemo(() => {
    return calculateDailySpending(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const maxDailyCents = useMemo(() => {
    const max = Math.max(...dailyData.map(d => d.amountCents), 1000);
    return max;
  }, [dailyData]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  // Upcoming essential bills
  const upcomingBills = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return recurring
      .filter(r => r.isActive && r.type === 'expense' && r.nextDueDate >= todayStr && r.nextDueDate.startsWith(selectedMonth))
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
  }, [recurring, selectedMonth]);

  // Doughnut math for SVG
  const totalCategoryExpenseCents = useMemo(() => {
    return categoryChartData.reduce((acc, c) => acc + c.totalCents, 0);
  }, [categoryChartData]);

  // Calculate SVG doughnut segments
  let cumulativeAngle = 0;
  const doughnutSegments = categoryChartData.slice(0, 5).map(item => {
    const fraction = totalCategoryExpenseCents > 0 ? item.totalCents / totalCategoryExpenseCents : 0;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...item,
      fraction,
      startAngle,
      endAngle: cumulativeAngle,
    };
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Critical Alert if Safe-to-Spend is Negative */}
      {summary.safeToSpendCents < 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-900 dark:text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-red-700 dark:text-red-300">
              {t.dashboard.safeToSpendWarning}
            </h4>
            <p className="mt-1 opacity-90 leading-relaxed">
              {settings.language === 'de'
                ? `Dein flüssiges Guthaben beträgt ${formatEuro(summary.liquidBalanceCents)}, doch anstehende Fixkosten & Miete erfordern ${formatEuro(summary.upcomingEssentialBillsCents)}. Du liegst aktuell um ${formatEuro(Math.abs(summary.safeToSpendCents))} im Defizit.`
                : `Your liquid balance is ${formatEuro(summary.liquidBalanceCents)}, but upcoming reserved essential bills require ${formatEuro(summary.upcomingEssentialBillsCents)}. You are currently at a ${formatEuro(Math.abs(summary.safeToSpendCents))} deficit.`}
            </p>
          </div>
        </div>
      )}

      {/* Welcome & Quick Onboarding Banner when clean */}
      {transactions.length === 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>{settings.language === 'de' ? 'Bereit für deine Finanzen' : 'Ready for your finances'}</span>
            </div>
            <h3 className="text-xl font-black">
              {settings.language === 'de' ? 'Willkommen bei StudentFlow!' : 'Welcome to StudentFlow!'}
            </h3>
            <p className="text-xs text-emerald-50 mt-1 leading-relaxed">
              {settings.language === 'de'
                ? 'Dein Budget-Tracker ist komplett sauber und einsatzbereit. Erfasse jetzt dein aktuelles Bankguthaben, deine monatlichen Einnahmen oder deine Miete.'
                : 'Your budget tracker is clean and ready to use. Start by entering your current bank balance or logging your first transaction.'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              <button
                onClick={() => openAddTxModal('income')}
                className="px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
              >
                {settings.language === 'de' ? '+ Einnahme erfassen' : '+ Add First Income'}
              </button>
              <button
                onClick={() => openAddTxModal('expense')}
                className="px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {settings.language === 'de' ? '+ Ausgabe buchen' : '+ Add Expense'}
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className="px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {settings.language === 'de' ? 'Kontostand anpassen' : 'Set Bank Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Available Liquid Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.availableBalance}</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatEuro(summary.liquidBalanceCents)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.depositBalance}:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
              {formatEuro(summary.depositBalanceCents)}
            </span>
          </div>
        </div>

        {/* Card 2: Safe-to-Spend Allowance (HIGHLIGHT FEATURE) */}
        <div className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
          summary.safeToSpendCents < 0
            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
            : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={summary.safeToSpendCents < 0 ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-emerald-700 dark:text-emerald-300 font-bold'}>
              {t.dashboard.safeToSpend}
            </span>
            <button
              onClick={() => setShowSafeBreakdown(!showSafeBreakdown)}
              className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/80 hover:bg-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Toggle Safe-to-Spend formula details"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className={`mt-2 text-2xl lg:text-3xl font-black tracking-tight ${
            summary.safeToSpendCents < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {formatEuro(summary.safeToSpendCents)}
          </div>
          <div className="mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400">{t.dashboard.safeToSpendDaily}:</span>
            <span className="font-extrabold text-slate-900 dark:text-white font-mono">
              {formatEuro(summary.dailySafeToSpendCents)}
              <span className="text-[10px] text-slate-400 font-normal"> / day ({summary.remainingDaysInPeriod}d left)</span>
            </span>
          </div>
        </div>

        {/* Card 3: Income This Month */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.incomeThisMonth}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatEuro(summary.incomeThisMonthCents)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t.reports.savingsRate}:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {summary.savingsRatePercent}%
            </span>
          </div>
        </div>

        {/* Card 4: Expenses This Month */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.expensesThisMonth}</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatEuro(summary.expensesThisMonthCents)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.remainingBudget}:</span>
            <span className={`font-bold font-mono ${summary.remainingBudgetCents < 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {formatEuro(summary.remainingBudgetCents)}
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Safe-to-Spend Calculation Explainer Drawer */}
      {showSafeBreakdown && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white dark:bg-slate-800/90 border border-slate-700 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm">{t.safeCalc.title}</h3>
            </div>
            <button
              onClick={() => setShowSafeBreakdown(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            {t.safeCalc.formulaText}
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>{t.safeCalc.currentLiquid}</span>
                <span className="font-bold font-mono text-emerald-400">{formatEuro(summary.liquidBalanceCents)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>{t.safeCalc.minusReservedBills}</span>
                <span className="font-mono">− {formatEuro(summary.upcomingEssentialBillsCents)}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>{t.safeCalc.minusPlannedEssentials}</span>
                <span className="font-mono">− {formatEuro(summary.plannedEssentialExpensesCents)}</span>
              </div>
              <div className="flex justify-between text-blue-300">
                <span>{t.safeCalc.minusProtectedSavings}</span>
                <span className="font-mono">− {formatEuro(summary.protectedSavingsCents)}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col justify-center">
              <div className="text-[11px] text-emerald-300 font-semibold">{t.safeCalc.resultSafe}</div>
              <div className="text-2xl font-black text-white mt-0.5">
                {formatEuro(summary.safeToSpendCents)}
              </div>
              <div className="mt-2 text-[11px] text-slate-300">
                ÷ {summary.remainingDaysInPeriod} {t.dashboard.daysLeft} = <span className="font-bold text-emerald-300 font-mono">{formatEuro(summary.dailySafeToSpendCents)} / Tag</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Row */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
          {t.dashboard.quickActions}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => openAddTxModal('expense')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800/60 dark:hover:bg-rose-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-rose-300 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mb-1.5 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-center leading-tight">{t.dashboard.quickAddExpense}</span>
          </button>

          <button
            onClick={() => openAddTxModal('income')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-emerald-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-300 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-center leading-tight">{t.dashboard.quickAddIncome}</span>
          </button>

          <button
            onClick={() => openAddTxModal('transfer')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/60 dark:hover:bg-blue-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-center leading-tight">{t.dashboard.quickTransfer}</span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/60 dark:hover:bg-purple-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-300 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-center leading-tight">{t.dashboard.quickNewBudget}</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 dark:bg-slate-800/60 dark:hover:bg-amber-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-amber-300 text-slate-700 dark:text-slate-300 hover:text-amber-600 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-center leading-tight">{t.dashboard.quickAddBill}</span>
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 dark:bg-slate-800/60 dark:hover:bg-teal-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-teal-300 text-slate-700 dark:text-slate-300 hover:text-teal-600 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 mb-1.5 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-center leading-tight">{t.dashboard.quickAddGoal}</span>
          </button>
        </div>
      </div>

      {/* Budget Progress Meter */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.dashboard.budgetProgress}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatEuro(summary.expensesThisMonthCents)} {settings.language === 'de' ? 'von' : 'of'} {formatEuro(summary.monthlyBudgetLimitCents)} limit
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
            summary.budgetUsagePercent >= 100
              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              : summary.budgetUsagePercent >= 75
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          }`}>
            {summary.budgetUsagePercent}% {settings.language === 'de' ? 'ausgeschöpft' : 'used'}
          </span>
        </div>

        {/* Multi-segment progress bar with 75% and 90% markers */}
        <div className="relative w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              summary.budgetUsagePercent >= 100
                ? 'bg-red-500'
                : summary.budgetUsagePercent >= 90
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, summary.budgetUsagePercent)}%` }}
          />
          {/* 75% warning notch */}
          <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-slate-400/40 z-10" title="75% threshold" />
          {/* 90% warning notch */}
          <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-red-400/60 z-10" title="90% threshold" />
        </div>
      </div>

      {/* Visualizations Grid: Category Breakdown & Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown (Doughnut & Legend) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.dashboard.spendingByCategory}
            </h3>
            <span className="text-xs text-slate-500">
              Total: {formatEuro(totalCategoryExpenseCents)}
            </span>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {t.common.emptySub}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category bars */}
              <div className="space-y-2.5">
                {categoryChartData.slice(0, 5).map(cat => {
                  const pct = totalCategoryExpenseCents > 0 
                    ? Math.round((cat.totalCents / totalCategoryExpenseCents) * 100) 
                    : 0;

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                        </div>
                        <div className="font-mono text-slate-600 dark:text-slate-400">
                          {formatEuro(cat.totalCents)} ({pct}%)
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300" 
                          style={{ width: `${pct}%`, backgroundColor: cat.color }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Daily Spending Trend (SVG Bars) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.dashboard.dailySpendingTrend}
            </h3>
            <span className="text-xs text-slate-500">
              {selectedMonth}
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-44 w-full flex items-end gap-1 pt-6 pb-2 px-1 border-b border-slate-100 dark:border-slate-800">
            {dailyData.map(d => {
              const heightPercent = maxDailyCents > 0 ? (d.amountCents / maxDailyCents) * 100 : 0;
              const isToday = d.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div 
                  key={d.day} 
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-md pointer-events-none whitespace-nowrap z-20">
                    Day {d.day}: {formatEuro(d.amountCents)}
                  </div>

                  <div 
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      d.amountCents > 0 
                        ? (isToday ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600 hover:bg-emerald-400') 
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Day 1</span>
            <span>Day 15</span>
            <span>Day {dailyData.length}</span>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Upcoming Bills & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Essential Bills Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.dashboard.upcomingBills}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {settings.language === 'de' ? 'Alle anzeigen →' : 'View all →'}
            </button>
          </div>

          {upcomingBills.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {settings.language === 'de' ? 'Keine fälligen Fixkosten diesen Monat.' : 'No upcoming essential bills due this month.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingBills.slice(0, 4).map(bill => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{bill.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {getRelativeDateLabel(bill.nextDueDate, settings.language)} ({formatDateGerman(bill.nextDueDate)})
                    </div>
                  </div>
                  <div className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {formatEuro(bill.amountCents)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.dashboard.recentTransactions}
            </h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t.dashboard.viewAllTransactions} →
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-700 dark:text-slate-300">
                {settings.language === 'de' ? 'Noch keine Buchungen erfasst' : 'No transactions recorded yet'}
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                {settings.language === 'de'
                  ? 'Erfasse deine erste Einnahme oder Ausgabe, um deinen Kontostand zu aktualisieren.'
                  : 'Log your first income or expense to see your live financial breakdown.'}
              </p>
              <button
                onClick={() => openAddTxModal('expense')}
                className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                + {t.common.addTransaction}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : tx.type === 'transfer'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        <IconRenderer name={cat?.icon || 'HelpCircle'} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
                          {tx.merchantOrPayee || tx.description}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span>{formatDateGerman(tx.date)}</span>
                          <span>•</span>
                          <span>{cat ? (settings.language === 'de' ? cat.nameDe : cat.name) : 'General'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold font-mono ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : tx.type === 'transfer'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {formatEuro(tx.amountCents, isIncome)}
                      </div>
                      {tx.isEssential && isExpense && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                          Fix
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
