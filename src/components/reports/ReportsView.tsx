import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, formatDateGerman, getMonthYearLabel } from '../../utils/formatters';
import { calculateCategorySpending } from '../../utils/calculations';
import { 
  BarChart3, 
  Printer, 
  Download, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Percent
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    accounts, 
    selectedMonth, 
    summary, 
    settings, 
    user, 
    t 
  } = useApp();

  // Transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Essential vs Discretionary breakdown
  const { essentialCents, flexibleCents } = useMemo(() => {
    let ess = 0;
    let flex = 0;
    for (const t of monthTransactions) {
      if (t.type === 'expense') {
        if (t.isEssential) {
          ess += t.amountCents;
        } else {
          flex += t.amountCents;
        }
      }
    }
    return { essentialCents: ess, flexibleCents: flex };
  }, [monthTransactions]);

  const totalExpenseCents = essentialCents + flexibleCents;
  const essentialPercent = totalExpenseCents > 0 ? Math.round((essentialCents / totalExpenseCents) * 100) : 0;
  const flexiblePercent = totalExpenseCents > 0 ? Math.round((flexibleCents / totalExpenseCents) * 100) : 0;

  // Largest expenses
  const largestExpenses = useMemo(() => {
    return [...monthTransactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amountCents - a.amountCents)
      .slice(0, 5);
  }, [monthTransactions]);

  // Week-by-week spending
  const weeklyBreakdown = useMemo(() => {
    const weeks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const t of monthTransactions) {
      if (t.type === 'expense') {
        const day = parseInt(t.date.split('-')[2], 10);
        const w = Math.min(5, Math.ceil(day / 7));
        weeks[w] = (weeks[w] || 0) + t.amountCents;
      }
    }
    return [
      { week: 1, label: 'Woche 1 (Tag 1-7)', cents: weeks[1] },
      { week: 2, label: 'Woche 2 (Tag 8-14)', cents: weeks[2] },
      { week: 3, label: 'Woche 3 (Tag 15-21)', cents: weeks[3] },
      { week: 4, label: 'Woche 4 (Tag 22-28)', cents: weeks[4] },
      { week: 5, label: 'Woche 5 (Tag 29+)', cents: weeks[5] },
    ];
  }, [monthTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount_EUR', 'Category', 'Account', 'Merchant', 'Description', 'Essential'];
    const rows = monthTransactions.map(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      const acc = accounts.find(a => a.id === tx.accountId);
      return [
        tx.date,
        tx.type,
        (tx.amountCents / 100).toFixed(2),
        `"${cat?.name || tx.categoryId}"`,
        `"${acc?.name || tx.accountId}"`,
        `"${tx.merchantOrPayee.replace(/"/g, '""')}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.isEssential ? 'Yes' : 'No',
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `studentflow_report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.reports.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {getMonthYearLabel(selectedMonth, settings.language)} • {user.name} ({user.university})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.reports.printReport}</span>
          </button>
        </div>
      </div>

      {/* Printable Financial Statement Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Printable Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">StudentFlow</span>
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Monthly Statement
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Student: <strong>{user.name}</strong> • {user.university || 'Uni München'} • {user.city}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div className="font-bold text-slate-900 dark:text-white text-sm">{getMonthYearLabel(selectedMonth, settings.language)}</div>
            <div>Generated: {new Date().toLocaleDateString('de-DE')}</div>
          </div>
        </div>

        {/* 4 Key KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 block">{t.dashboard.incomeThisMonth}</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatEuro(summary.incomeThisMonthCents)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 block">{t.dashboard.expensesThisMonth}</span>
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
              {formatEuro(summary.expensesThisMonthCents)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 block">{t.dashboard.savingsThisMonth}</span>
            <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 block">
              {formatEuro(summary.savingsThisMonthCents)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-emerald-800 dark:text-emerald-300 block font-semibold">{t.reports.savingsRate}</span>
            <span className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">
              {summary.savingsRatePercent}%
            </span>
          </div>
        </div>

        {/* Savings Rate Formula Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
            <Percent className="w-4 h-4 text-emerald-500" />
            <span>Formel für studentische Sparquote:</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            Sparquote = (Einnahmen − Ausgaben) ÷ Einnahmen × 100 = ({formatEuro(summary.incomeThisMonthCents)} − {formatEuro(summary.expensesThisMonthCents)}) ÷ {formatEuro(summary.incomeThisMonthCents)} = <strong>{summary.savingsRatePercent}%</strong>
          </p>
        </div>

        {/* Essential vs Discretionary Ratio */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.reports.essentialVsFlex}
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Fixbedarf (Miete, Semesterbeitrag, Lebensmittel, Ticket): {formatEuro(essentialCents)} ({essentialPercent}%)
              </span>
              <span className="text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Freizeit & Flexibel: {formatEuro(flexibleCents)} ({flexiblePercent}%)
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${essentialPercent}%` }}
                title="Essential spending"
              />
              <div 
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${flexiblePercent}%` }}
                title="Flexible spending"
              />
            </div>
          </div>
        </div>

        {/* Week by Week Spending Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.reports.weekByWeek}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {weeklyBreakdown.map(wb => (
              <div 
                key={wb.week} 
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs"
              >
                <div className="text-[11px] text-slate-500">{wb.label}</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {formatEuro(wb.cents)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Largest Transactions This Month */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.reports.largestExpenses}
          </h4>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {largestExpenses.map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{tx.merchantOrPayee || tx.description}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({formatDateGerman(tx.date)})</span>
                    <span className="text-[10px] ml-2 text-slate-500">[{cat?.name || 'General'}]</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {formatEuro(tx.amountCents)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
