import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, formatDateGerman, getRelativeDateLabel } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { RecurringSchedule } from '../../types';
import { 
  CalendarCheck2, 
  Plus, 
  Calendar, 
  Clock, 
  Check, 
  AlertCircle, 
  Trash2, 
  Repeat, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export const BillsCalendarView: React.FC = () => {
  const { 
    recurring, 
    addRecurringBill, 
    deleteRecurringBill, 
    executeRecurringBill, 
    categories, 
    accounts, 
    selectedMonth, 
    settings, 
    t 
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);

  // Form states for new recurring bill
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState(`${selectedMonth}-01`);
  const [categoryId, setCategoryId] = useState('cat-rent');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [merchant, setMerchant] = useState('');
  const [isEssential, setIsEssential] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);

  // Month navigation for calendar view
  const [calendarDate, setCalendarDate] = useState(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const handlePrevCalMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextCalMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 is Sun
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon is 0

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const cents = Math.round(parseFloat(amountStr.replace(',', '.')) * 100);
    if (!title || cents <= 0) return;

    addRecurringBill({
      type: 'expense',
      title,
      amountCents: cents,
      frequency,
      startDate: new Date().toISOString().split('T')[0],
      nextDueDate,
      categoryId,
      accountId,
      merchantOrPayee: merchant || title,
      isEssential,
      isActive: true,
      reminderDaysBefore: reminderDays,
    });

    setIsAddBillOpen(false);
    setTitle('');
    setAmountStr('');
  };

  // Group recurring bills for calendar days
  const billsByDay = useMemo(() => {
    const map: Record<number, RecurringSchedule[]> = {};
    const curYearMonth = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;

    for (const b of recurring) {
      if (b.isActive && b.nextDueDate.startsWith(curYearMonth)) {
        const day = parseInt(b.nextDueDate.split('-')[2], 10);
        if (!map[day]) map[day] = [];
        map[day].push(b);
      }
    }
    return map;
  }, [recurring, calYear, calMonth]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.bills.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.bills.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* List vs Calendar Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {settings.language === 'de' ? 'Liste' : 'List View'}
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {settings.language === 'de' ? 'Kalender' : 'Calendar'}
            </button>
          </div>

          <button
            onClick={() => setIsAddBillOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.bills.addRecurring}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {recurring.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {settings.language === 'de' ? 'Keine wiederkehrenden Fixkosten eingetragen' : 'No recurring bills added yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {settings.language === 'de'
                  ? 'Trage deine monatliche Miete, das Deutschlandticket oder Abos ein, damit StudentFlow diese im Safe-to-Spend Budget reserviert.'
                  : 'Add your rent, Deutschlandticket, or subscriptions so StudentFlow can automatically reserve them in your Safe-to-Spend budget.'}
              </p>
              <button
                onClick={() => setIsAddBillOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                + {t.bills.addRecurring}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recurring.map(bill => {
                const cat = categories.find(c => c.id === bill.categoryId);
                const acc = accounts.find(a => a.id === bill.accountId);
                const isDueSoon = getRelativeDateLabel(bill.nextDueDate, settings.language).includes('Tagen') || getRelativeDateLabel(bill.nextDueDate, settings.language).includes('Heute');

              return (
                <div
                  key={bill.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2.5 rounded-2xl text-white shadow-xs"
                        style={{ backgroundColor: cat?.color || '#3b82f6' }}
                      >
                        <IconRenderer name={cat?.icon || 'CalendarCheck2'} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {bill.title}
                        </h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{bill.merchantOrPayee}</span>
                          <span>•</span>
                          <span className="capitalize">{bill.frequency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                        {formatEuro(bill.amountCents)}
                      </div>
                      {bill.isEssential && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Fix
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>{t.bills.nextDue}: </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatDateGerman(bill.nextDueDate)} ({getRelativeDateLabel(bill.nextDueDate, settings.language)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => executeRecurringBill(bill.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                        title={t.bills.payNow}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{settings.language === 'de' ? 'Verbuchen' : 'Pay & Log'}</span>
                      </button>

                      <button
                        onClick={() => deleteRecurringBill(bill.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {calendarDate.toLocaleDateString(settings.language === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevCalMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextCalMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header (Mon to Sun) */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2">
            <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1.5 text-xs">
            {/* Empty slots before first day */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-24 p-1 rounded-xl bg-slate-50/40 dark:bg-slate-800/20 opacity-30" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const billsForDay = billsByDay[day] || [];
              const isToday = day === new Date().getDate() && calMonth === new Date().getMonth() && calYear === new Date().getFullYear();

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[96px] p-1.5 rounded-2xl border transition-colors flex flex-col justify-between ${
                    isToday
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isToday ? 'w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center' : 'text-slate-700 dark:text-slate-300'}`}>
                      {day}
                    </span>
                    {billsForDay.length > 0 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        {billsForDay.length}
                      </span>
                    )}
                  </div>

                  {/* Day bills */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-16">
                    {billsForDay.map(b => (
                      <div
                        key={b.id}
                        className="p-1 rounded-lg text-[9px] font-bold bg-white dark:bg-slate-700 shadow-xs text-slate-800 dark:text-slate-200 truncate border border-slate-100 dark:border-slate-600"
                        title={`${b.title} - ${formatEuro(b.amountCents)}`}
                      >
                        {b.title} • {formatEuro(b.amountCents)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Recurring Bill */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.bills.addRecurring}
              </h3>
              <button onClick={() => setIsAddBillOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Warmmiete, Rundfunkbeitrag, Gym"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (€)</label>
                  <input
                    type="text"
                    required
                    value={amountStr}
                    onChange={e => setAmountStr(e.target.value)}
                    placeholder="450.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly (GEZ)</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={e => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  >
                    {categories.filter(c => !c.id.startsWith('inc-')).map(c => (
                      <option key={c.id} value={c.id}>
                        {settings.language === 'de' ? c.nameDe : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBillOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
