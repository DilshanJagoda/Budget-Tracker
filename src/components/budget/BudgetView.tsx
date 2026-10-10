import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, parseEuroInputToCents, centsToDecimalString } from '../../utils/formatters';
import { calculateCategorySpending } from '../../utils/calculations';
import { IconRenderer } from '../common/IconRenderer';
import { 
  Sliders, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  PieChart, 
  Calculator,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { 
    budget, 
    updateBudget, 
    updateCategoryBudgetLimit, 
    transactions, 
    categories, 
    recurring, 
    selectedMonth, 
    summary, 
    settings, 
    t 
  } = useApp();

  const [isEditingOverall, setIsEditingOverall] = useState(false);
  const [totalLimitInput, setTotalLimitInput] = useState(centsToDecimalString(budget.totalLimitCents));
  const [savingsTargetInput, setSavingsTargetInput] = useState(centsToDecimalString(budget.savingsTargetCents));
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(budget.categoryBudgets)) {
      map[k] = centsToDecimalString(v);
    }
    return map;
  });

  // Calculate actual spending per category in selected month
  const actualCategorySpending = useMemo(() => {
    return calculateCategorySpending(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Expected monthly income from recurring income items
  const expectedMonthlyIncomeCents = useMemo(() => {
    const recurringIncome = recurring
      .filter(r => r.isActive && r.type === 'income')
      .reduce((sum, r) => sum + r.amountCents, 0);
    // If user has higher actual income, use max
    return Math.max(recurringIncome, summary.incomeThisMonthCents, 90000);
  }, [recurring, summary.incomeThisMonthCents]);

  // Total planned category allocations
  const totalAllocatedCents = useMemo(() => {
    return Object.values(budget.categoryBudgets).reduce((sum, val) => sum + val, 0);
  }, [budget.categoryBudgets]);

  // Available to Allocate = Expected Income - Total Category Budget - Savings Target
  const availableToAllocateCents = expectedMonthlyIncomeCents - totalAllocatedCents - budget.savingsTargetCents;

  const handleSaveOverall = () => {
    const newTotalLimit = parseEuroInputToCents(totalLimitInput);
    const newSavingsTarget = parseEuroInputToCents(savingsTargetInput);

    const updatedCategoryBudgets: Record<string, number> = {};
    for (const [catId, strVal] of Object.entries(categoryInputs)) {
      updatedCategoryBudgets[catId] = parseEuroInputToCents(strVal);
    }

    updateBudget({
      ...budget,
      totalLimitCents: newTotalLimit,
      savingsTargetCents: newSavingsTarget,
      categoryBudgets: updatedCategoryBudgets,
      weeklyLimitCents: Math.round(newTotalLimit / 4),
    });

    setIsEditingOverall(false);
  };

  const expenseCategories = categories.filter(c => !c.id.startsWith('inc-'));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Title & Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.budgets.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.budgets.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            if (isEditingOverall) {
              handleSaveOverall();
            } else {
              setIsEditingOverall(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isEditingOverall
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          {isEditingOverall ? (
            <>
              <Check className="w-4 h-4" />
              <span>{t.common.save}</span>
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4" />
              <span>{t.budgets.editAllocations}</span>
            </>
          )}
        </button>
      </div>

      {/* Income Allocator Workflow Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white dark:bg-slate-800/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {settings.language === 'de' ? 'Studentischer Einkommensverteiler' : 'Income Allocation Workflow'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{settings.language === 'de' ? 'Erwartete Einnahmen' : 'Expected Income'}</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
              {formatEuro(expectedMonthlyIncomeCents)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{settings.language === 'de' ? 'Geplante Ausgaben' : 'Planned Expenses'}</span>
            <span className="text-lg font-bold font-mono text-rose-300 mt-1 block">
              − {formatEuro(totalAllocatedCents)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{settings.language === 'de' ? 'Sparziel' : 'Target Savings'}</span>
            <span className="text-lg font-bold font-mono text-blue-300 mt-1 block">
              − {formatEuro(budget.savingsTargetCents)}
            </span>
          </div>

          <div className={`p-3 rounded-2xl border ${
            availableToAllocateCents < 0 
              ? 'bg-rose-950/40 border-rose-800 text-rose-300' 
              : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
          }`}>
            <span className="block text-[11px] font-semibold">{t.budgets.availableToAllocate}</span>
            <span className="text-lg font-extrabold font-mono mt-1 block">
              {formatEuro(availableToAllocateCents)}
            </span>
          </div>
        </div>

        {availableToAllocateCents < 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800/60">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              {settings.language === 'de'
                ? 'Warnung: Geplante Ausgaben und Sparziele übersteigen dein erwartetes Monatseinkommen!'
                : 'Warning: Planned allocations and savings exceed expected monthly student income! Please trim discretionary categories.'}
            </span>
          </div>
        )}
      </div>

      {/* Overall Limits Config Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          {settings.language === 'de' ? 'Gesamt-Budgetgrenzen' : 'Monthly Spending Limits'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.budgets.totalSpendingLimit}
            </label>
            {isEditingOverall ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input
                  type="text"
                  value={totalLimitInput}
                  onChange={e => setTotalLimitInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ) : (
              <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {formatEuro(budget.totalLimitCents)}
              </div>
            )}
            <span className="text-[10px] text-slate-400 block mt-1">
              {settings.language === 'de' ? 'Aktuell ausgegeben' : 'Actual spent'}: {formatEuro(summary.expensesThisMonthCents)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.budgets.savingsTarget}
            </label>
            {isEditingOverall ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input
                  type="text"
                  value={savingsTargetInput}
                  onChange={e => setSavingsTargetInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ) : (
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatEuro(budget.savingsTargetCents)}
              </div>
            )}
            <span className="text-[10px] text-slate-400 block mt-1">
              {settings.language === 'de' ? 'Bereits gespart' : 'Actual saved'}: {formatEuro(summary.savingsThisMonthCents)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {settings.language === 'de' ? 'Wöchentliches Ausgabenlimit' : 'Weekly Spending Limit'}
            </label>
            <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300 font-mono">
              {formatEuro(Math.round(budget.totalLimitCents / 4))}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {settings.language === 'de' ? 'Ausgaben diese Woche' : 'Spent this week'}: {formatEuro(summary.expensesThisWeekCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid with 75%, 90%, 100% Meters */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.budgets.categoryBudgets}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {settings.language === 'de' ? 'Warnstufen bei 75% & 90%' : 'Warnings trigger at 75% & 90%'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {expenseCategories.map(cat => {
            const limitCents = budget.categoryBudgets[cat.id] || 0;
            const spentCents = actualCategorySpending[cat.id]?.totalCents || 0;
            const usagePercent = limitCents > 0 ? Math.round((spentCents / limitCents) * 100) : 0;
            const remainingCents = limitCents - spentCents;

            const isExceeded = limitCents > 0 && spentCents > limitCents;
            const isCritical = limitCents > 0 && usagePercent >= settings.budgetWarnThreshold2 && !isExceeded;
            const isWarning = limitCents > 0 && usagePercent >= settings.budgetWarnThreshold1 && !isCritical && !isExceeded;

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isExceeded
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                    : isCritical
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="p-2 rounded-xl text-white shadow-xs" 
                      style={{ backgroundColor: cat.color }}
                    >
                      <IconRenderer name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {settings.language === 'de' ? cat.nameDe : cat.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {cat.isEssential ? (settings.language === 'de' ? 'Fixbedarf' : 'Essential') : (settings.language === 'de' ? 'Flexibel' : 'Flexible')}
                      </div>
                    </div>
                  </div>

                  {/* Warning Pill if Threshold reached */}
                  {isExceeded && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                      {t.budgets.warningExceeded}
                    </span>
                  )}
                  {isCritical && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                      {t.budgets.warning90}
                    </span>
                  )}
                  {isWarning && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      75%
                    </span>
                  )}
                </div>

                {/* Limit input vs display */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">{t.budgets.usage}: </span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatEuro(spentCents)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Limit: </span>
                    {isEditingOverall ? (
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">€</span>
                        <input
                          type="text"
                          value={categoryInputs[cat.id] ?? '0'}
                          onChange={e => {
                            const val = e.target.value;
                            setCategoryInputs(prev => ({ ...prev, [cat.id]: val }));
                          }}
                          className="w-full pl-6 pr-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        {formatEuro(limitCents)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meter Bar */}
                <div className="mt-2 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isCritical
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, usagePercent)}%` }}
                  />
                </div>

                <div className="mt-1.5 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{usagePercent}% {t.budgets.usage.toLowerCase()}</span>
                  <span className={remainingCents < 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                    {remainingCents >= 0 ? `${formatEuro(remainingCents)} ${t.budgets.remaining.toLowerCase()}` : `${formatEuro(Math.abs(remainingCents))} überzogen`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
