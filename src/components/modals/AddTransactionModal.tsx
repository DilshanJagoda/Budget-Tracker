import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionType, PaymentMethod, Transaction } from '../../types';
import { parseEuroInputToCents, centsToDecimalString } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Check, Calendar, Tag, CreditCard, Store, FileText } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  editingTransaction = null,
}) => {
  const { 
    accounts, 
    categories, 
    addTransaction, 
    editTransaction, 
    settings, 
    t 
  } = useApp();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [merchantOrPayee, setMerchantOrPayee] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isEssential, setIsEssential] = useState<boolean>(true);
  const [tagsStr, setTagsStr] = useState<string>('');
  const [receiptNote, setReceiptNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(centsToDecimalString(editingTransaction.amountCents));
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setTargetAccountId(editingTransaction.targetAccountId || accounts[1]?.id || accounts[0]?.id || '');
      setDate(editingTransaction.date);
      setMerchantOrPayee(editingTransaction.merchantOrPayee);
      setDescription(editingTransaction.description);
      setPaymentMethod(editingTransaction.paymentMethod);
      setIsEssential(editingTransaction.isEssential);
      setTagsStr(editingTransaction.tags.join(', '));
      setReceiptNote(editingTransaction.receiptNote || '');
    } else {
      setType(initialType);
      setAmountStr('');
      const defaultCat = initialType === 'income' 
        ? 'inc-workingstudent' 
        : 'cat-groceries';
      setCategoryId(defaultCat);
      setAccountId(settings.defaultAccountId || accounts[0]?.id || '');
      setTargetAccountId(accounts.find(a => a.id !== settings.defaultAccountId)?.id || accounts[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setMerchantOrPayee('');
      setDescription('');
      setPaymentMethod('card');
      setIsEssential(true);
      setTagsStr('');
      setReceiptNote('');
    }
    setError('');
  }, [editingTransaction, initialType, isOpen, settings.defaultAccountId, accounts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = parseEuroInputToCents(amountStr);

    if (amountCents <= 0) {
      setError(settings.language === 'de' ? 'Bitte einen gültigen Betrag größer als 0 eingeben.' : 'Please enter a valid amount greater than €0.00.');
      return;
    }

    if (!accountId) {
      setError(settings.language === 'de' ? 'Bitte ein Quellkonto auswählen.' : 'Please select an account.');
      return;
    }

    if (type === 'transfer' && accountId === targetAccountId) {
      setError(settings.language === 'de' ? 'Quell- und Zielkonto müssen unterschiedlich sein.' : 'Source and destination accounts must be different.');
      return;
    }

    const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);

    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        type,
        amountCents,
        categoryId: type === 'transfer' ? 'cat-banking' : categoryId,
        accountId,
        targetAccountId: type === 'transfer' ? targetAccountId : undefined,
        date,
        merchantOrPayee: merchantOrPayee || (type === 'transfer' ? 'Transfer' : 'General'),
        description,
        paymentMethod,
        isEssential: type === 'income' ? true : isEssential,
        tags,
        receiptNote,
      });
    } else {
      addTransaction({
        type,
        amountCents,
        categoryId: type === 'transfer' ? 'cat-banking' : categoryId,
        accountId,
        targetAccountId: type === 'transfer' ? targetAccountId : undefined,
        date,
        merchantOrPayee: merchantOrPayee || (type === 'transfer' ? 'Transfer' : 'General'),
        description,
        paymentMethod,
        isEssential: type === 'income' ? true : isEssential,
        tags,
        receiptNote,
      });
    }

    onClose();
  };

  const filteredCategories = categories.filter(c => {
    if (type === 'income') {
      return c.id.startsWith('inc-');
    }
    return !c.id.startsWith('inc-');
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header & Tabs */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {editingTransaction ? (settings.language === 'de' ? 'Buchung bearbeiten' : 'Edit Transaction') : t.transactions.newTransaction}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Toggle: Expense / Income / Transfer */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => { setType('expense'); if (categoryId.startsWith('inc-')) setCategoryId('cat-groceries'); }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              {t.common.expense}
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId('inc-workingstudent'); }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              {t.common.income}
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              {t.common.transfer}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
              {error}
            </div>
          )}

          {/* Amount Input with big focus */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t.common.amount} (€)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                €
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="0,00"
                autoFocus
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* If Transfer: From Account & To Account */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {t.transactions.fromAccount}
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {settings.language === 'de' ? acc.nameDe : acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {t.transactions.toAccount}
                </label>
                <select
                  value={targetAccountId}
                  onChange={e => setTargetAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {settings.language === 'de' ? acc.nameDe : acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {t.common.category}
                </label>
                <select
                  value={categoryId}
                  onChange={e => {
                    setCategoryId(e.target.value);
                    const sel = categories.find(c => c.id === e.target.value);
                    if (sel && type === 'expense') {
                      setIsEssential(sel.isEssential);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {settings.language === 'de' ? cat.nameDe : cat.name} {cat.isEssential ? '• [Fix]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account selection & Essential toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t.common.account}
                  </label>
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {settings.language === 'de' ? acc.nameDe : acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {type === 'expense' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {settings.language === 'de' ? 'Einstufung' : 'Classification'}
                    </label>
                    <div className="flex gap-2 h-10">
                      <button
                        type="button"
                        onClick={() => setIsEssential(true)}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isEssential
                            ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t.common.essentialBadge}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEssential(false)}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          !isEssential
                            ? 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t.common.flexibleBadge}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Date & Quick Date buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t.common.date}
              </label>
              <div className="flex gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().split('T')[0])}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  {t.common.today}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setDate(y.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  {settings.language === 'de' ? 'Gestern' : 'Yesterday'}
                </button>
              </div>
            </div>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Merchant / Payee & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.transactions.merchantOrPayee}
              </label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={merchantOrPayee}
                  onChange={e => setMerchantOrPayee(e.target.value)}
                  placeholder={type === 'income' ? 'e.g. Werkstudent Tech GmbH' : 'e.g. ALDI Süd, Mensa, DB'}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.transactions.paymentMethod}
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="card">EC / Debit Card (Karte)</option>
                  <option value="cash">Cash (Bargeld)</option>
                  <option value="bank_transfer">SEPA Bank Transfer (Überweisung)</option>
                  <option value="direct_debit">Direct Debit (Lastschrift)</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description & Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.common.notes}
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Weekly vegetable run, WG groceries, Course book"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.transactions.tags}
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tagsStr}
                  onChange={e => setTagsStr(e.target.value)}
                  placeholder="food, study, tum"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.transactions.receiptNote}
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={receiptNote}
                  onChange={e => setReceiptNote(e.target.value)}
                  placeholder="Receipt # or invoice ref"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              {editingTransaction ? t.common.save : t.common.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
