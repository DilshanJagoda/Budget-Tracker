import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, parseEuroInputToCents } from '../../utils/formatters';
import { Account } from '../../types';
import { 
  CreditCard, 
  Wallet, 
  PiggyBank, 
  Lock, 
  Plus, 
  ArrowLeftRight, 
  Edit3, 
  Trash2, 
  Building2,
  X
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    editAccount, 
    deleteAccount, 
    transferFunds, 
    summary, 
    settings, 
    t 
  } = useApp();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // New account form
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<Account['type']>('checking');
  const [accBalanceStr, setAccBalanceStr] = useState('');
  const [accInstitution, setAccInstitution] = useState('');
  const [accDesc, setAccDesc] = useState('');

  // Transfer form
  const [fromAccId, setFromAccId] = useState(accounts[0]?.id || '');
  const [toAccId, setToAccId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [transferAmountStr, setTransferAmountStr] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // Edit account balance state
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editBalanceStr, setEditBalanceStr] = useState('');
  const [editNameStr, setEditNameStr] = useState('');

  const handleOpenEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setEditBalanceStr((acc.balanceCents / 100).toFixed(2));
    setEditNameStr(acc.name);
  };

  const handleSaveEditAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    const newBalanceCents = parseEuroInputToCents(editBalanceStr);
    editAccount(editingAccount.id, {
      name: editNameStr.trim() || editingAccount.name,
      balanceCents: newBalanceCents,
    });
    setEditingAccount(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceCents = parseEuroInputToCents(accBalanceStr);
    if (!accName.trim()) return;

    addAccount({
      name: accName.trim(),
      nameDe: accName.trim(),
      type: accType,
      balanceCents,
      initialBalanceCents: balanceCents,
      currency: 'EUR',
      description: accDesc,
      institution: accInstitution,
    });

    setIsAddAccountOpen(false);
    setAccName('');
    setAccBalanceStr('');
    setAccInstitution('');
    setAccDesc('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parseEuroInputToCents(transferAmountStr);
    if (cents <= 0 || fromAccId === toAccId) return;

    transferFunds(fromAccId, toAccId, cents, transferNote);

    setIsTransferOpen(false);
    setTransferAmountStr('');
    setTransferNote('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.accounts}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Liquid: {formatEuro(summary.liquidBalanceCents)} • Mietkaution: {formatEuro(summary.depositBalanceCents)} • Net Worth: {formatEuro(summary.totalNetWorthCents)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{t.dashboard.quickTransfer}</span>
          </button>

          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{settings.language === 'de' ? 'Konto anlegen' : 'Add Account'}</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map(acc => {
          const isDeposit = acc.type === 'deposit';
          const isSavings = acc.type === 'savings';
          const isCash = acc.type === 'cash';

          return (
            <div
              key={acc.id}
              className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                isDeposit
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700'
                  : isSavings
                  ? 'bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 border-blue-200 dark:border-blue-900/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    isDeposit
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : isSavings
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : isCash
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {isDeposit ? <Lock className="w-5 h-5" /> : isSavings ? <PiggyBank className="w-5 h-5" /> : isCash ? <Wallet className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {settings.language === 'de' ? acc.nameDe : acc.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {acc.institution || 'Bank'} • <span className="capitalize">{acc.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditAccount(acc)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={settings.language === 'de' ? 'Kontostand anpassen' : 'Edit Balance / Name'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {accounts.length > 1 && !isDeposit && (
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Balance */}
              <div>
                <span className="text-[11px] text-slate-400 block">
                  {isDeposit ? 'Gesperrte Mietkaution' : 'Aktueller Saldo'}
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {formatEuro(acc.balanceCents)}
                </div>
              </div>

              {acc.description && (
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {acc.description}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Transfer Funds */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.dashboard.quickTransfer}
              </h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Von Konto (Quelle)</label>
                <select
                  value={fromAccId}
                  onChange={e => setFromAccId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatEuro(a.balanceCents)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nach Konto (Ziel)</label>
                <select
                  value={toAccId}
                  onChange={e => setToAccId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatEuro(a.balanceCents)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Betrag (€)</label>
                <input
                  type="text"
                  required
                  value={transferAmountStr}
                  onChange={e => setTransferAmountStr(e.target.value)}
                  placeholder="50.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Notiz</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={e => setTransferNote(e.target.value)}
                  placeholder="z.B. Bargeldabhebung am Geldautomat, Überweisung auf Tagesgeld"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Umbuchung durchführen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Account */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Neues Konto anlegen
              </h3>
              <button onClick={() => setIsAddAccountOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Kontoname</label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  placeholder="e.g. N26 Student, Sparkasse, Bar, Trade Republic"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kontotyp</label>
                  <select
                    value={accType}
                    onChange={e => setAccType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <option value="checking">Girokonto</option>
                    <option value="cash">Bargeld</option>
                    <option value="savings">Tagesgeld / Sparen</option>
                    <option value="deposit">Mietkaution (gesperrt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Startsaldo (€)</label>
                  <input
                    type="text"
                    value={accBalanceStr}
                    onChange={e => setAccBalanceStr(e.target.value)}
                    placeholder="100.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bank / Institut</label>
                <input
                  type="text"
                  value={accInstitution}
                  onChange={e => setAccInstitution(e.target.value)}
                  placeholder="e.g. DKB, Sparkasse, ING"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Konto erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Account Balance / Name */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {settings.language === 'de' ? 'Kontostand & Name bearbeiten' : 'Edit Account Balance'}
              </h3>
              <button onClick={() => setEditingAccount(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAccount} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {settings.language === 'de' ? 'Kontoname' : 'Account Name'}
                </label>
                <input
                  type="text"
                  required
                  value={editNameStr}
                  onChange={e => setEditNameStr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {settings.language === 'de' ? 'Aktueller Kontostand (€)' : 'Current Balance (€)'}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editBalanceStr}
                  onChange={e => setEditBalanceStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
