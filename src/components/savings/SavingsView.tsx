import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, formatDateGerman, parseEuroInputToCents } from '../../utils/formatters';
import { SavingsGoal } from '../../types';
import { IconRenderer } from '../common/IconRenderer';
import { 
  PiggyBank, 
  ShieldCheck, 
  Plus, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  Target, 
  Calendar,
  Sparkles,
  X
} from 'lucide-react';

export const SavingsView: React.FC = () => {
  const { 
    savingsGoals, 
    addSavingsGoal, 
    deleteSavingsGoal, 
    addSavingsContribution, 
    accounts, 
    settings, 
    t 
  } = useApp();

  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [selectedGoalForAction, setSelectedGoalForAction] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmountStr, setActionAmountStr] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionAccountId, setActionAccountId] = useState(accounts[0]?.id || '');

  // New goal state
  const [goalName, setGoalName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('2027-06-30');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [monthlyContributionStr, setMonthlyContributionStr] = useState('');
  const [isEmergencyFund, setIsEmergencyFund] = useState(false);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCents = parseEuroInputToCents(targetAmountStr);
    const monthlyCents = parseEuroInputToCents(monthlyContributionStr);
    if (!goalName || targetCents <= 0) return;

    addSavingsGoal({
      name: goalName,
      targetCents,
      currentCents: 0,
      targetDate,
      priority,
      isEmergencyFund,
      monthlyContributionTargetCents: monthlyCents,
      icon: isEmergencyFund ? 'Shield' : 'Target',
      color: isEmergencyFund ? '#10b981' : '#6366f1',
    });

    setIsNewGoalOpen(false);
    setGoalName('');
    setTargetAmountStr('');
    setMonthlyContributionStr('');
  };

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForAction) return;
    const cents = parseEuroInputToCents(actionAmountStr);
    if (cents <= 0) return;

    const finalAmount = actionType === 'deposit' ? cents : -cents;
    addSavingsContribution(selectedGoalForAction.id, finalAmount, actionAccountId, actionNote);

    setSelectedGoalForAction(null);
    setActionAmountStr('');
    setActionNote('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.savings.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.savings.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsNewGoalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.savings.newGoal}</span>
        </button>
      </div>

      {/* Savings Goals Grid */}
      {savingsGoals.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {settings.language === 'de' ? 'Noch keine Sparziele angelegt' : 'No savings goals created yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {settings.language === 'de'
              ? 'Erstelle ein Sparziel (z.B. Notgroschen, Semesterbeitrag, Kaution oder Laptop), um dein studentisches Sparpolster aufzubauen.'
              : 'Create a savings goal (e.g. Emergency Fund, Semesterbeitrag, Rental Deposit, or Laptop) to build your financial cushion.'}
          </p>
          <button
            onClick={() => setIsNewGoalOpen(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            + {t.savings.newGoal}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savingsGoals.map(goal => {
            const progressPercent = Math.min(100, Math.round((goal.currentCents / goal.targetCents) * 100));
            const remainingCents = Math.max(0, goal.targetCents - goal.currentCents);

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 transition-all ${
                goal.isEmergencyFund
                  ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Header: Title, Icon, Priority */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-2xl text-white shadow-xs"
                    style={{ backgroundColor: goal.color }}
                  >
                    <IconRenderer name={goal.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{goal.name}</span>
                      {goal.isEmergencyFund && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Notgroschen
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateGerman(goal.targetDate)}</span>
                      <span>•</span>
                      <span className="capitalize">{goal.priority} {t.savings.priority}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteSavingsGoal(goal.id)}
                  className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors"
                  title="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="text-slate-500">{t.savings.savedSoFar}: </span>
                    <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                      {formatEuro(goal.currentCents)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">{t.savings.targetAmount}: </span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                      {formatEuro(goal.targetCents)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="font-bold" style={{ color: goal.color }}>
                    {progressPercent}% {settings.language === 'de' ? 'erreicht' : 'achieved'}
                  </span>
                  <span>
                    Noch {formatEuro(remainingCents)} bis zum Ziel
                  </span>
                </div>
              </div>

              {/* Contribution Actions & History Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-500">
                  {goal.monthlyContributionTargetCents ? (
                    <span>Empfohlen: <strong className="text-slate-800 dark:text-slate-200">{formatEuro(goal.monthlyContributionTargetCents)}</strong> / Mo</span>
                  ) : (
                    <span>{goal.history.length} {settings.language === 'de' ? 'Buchungen' : 'transactions'}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedGoalForAction(goal);
                      setActionType('deposit');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>{settings.language === 'de' ? 'Einzahlen' : 'Deposit'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGoalForAction(goal);
                      setActionType('withdraw');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{settings.language === 'de' ? 'Entnehmen' : 'Withdraw'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Modal: Deposit / Withdraw from Goal */}
      {selectedGoalForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {actionType === 'deposit' ? 'Geld sparen / einzahlen' : 'Ersparnisse entnehmen'}
              </h3>
              <button onClick={() => setSelectedGoalForAction(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-4 mt-4">
              <div className="text-xs text-slate-500">
                Ziel: <strong className="text-slate-900 dark:text-white">{selectedGoalForAction.name}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Betrag (€)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={actionAmountStr}
                  onChange={e => setActionAmountStr(e.target.value)}
                  placeholder="50.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Girokonto</label>
                <select
                  value={actionAccountId}
                  onChange={e => setActionAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatEuro(a.balanceCents)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Notiz / Zweck</label>
                <input
                  type="text"
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  placeholder="z.B. Monatliche Sparrate, Notfallkauf"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForAction(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Bestätigen & Verbuchen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Savings Goal */}
      {isNewGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.savings.newGoal}
              </h3>
              <button onClick={() => setIsNewGoalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Name des Ziels</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                  placeholder="e.g. Neuer Laptop, Semesterbeitrag, Reise"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Zielbetrag (€)</label>
                  <input
                    type="text"
                    required
                    value={targetAmountStr}
                    onChange={e => setTargetAmountStr(e.target.value)}
                    placeholder="500.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Zieldatum</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Priorität</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <option value="high">Hoch</option>
                    <option value="medium">Mittel</option>
                    <option value="low">Niedrig</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Monatliche Sparrate (€)</label>
                  <input
                    type="text"
                    value={monthlyContributionStr}
                    onChange={e => setMonthlyContributionStr(e.target.value)}
                    placeholder="50.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEmergency"
                  checked={isEmergencyFund}
                  onChange={e => setIsEmergencyFund(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isEmergency" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Als geschützten Notgroschen (Notfall-Puffer) deklarieren
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewGoalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Sparziel speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
