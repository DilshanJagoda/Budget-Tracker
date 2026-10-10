import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, formatDateGerman } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { AddTransactionModal } from '../modals/AddTransactionModal';
import { Transaction } from '../../types';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Tag, 
  FileText, 
  CheckCircle,
  HelpCircle,
  Layers
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    accounts, 
    deleteTransaction, 
    openAddTxModal, 
    settings, 
    t 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedEssential, setSelectedEssential] = useState('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchMerchant = tx.merchantOrPayee.toLowerCase().includes(query);
        const matchDesc = tx.description.toLowerCase().includes(query);
        const matchTags = tx.tags.some(t => t.toLowerCase().includes(query));
        const matchReceipt = tx.receiptNote?.toLowerCase().includes(query);
        if (!matchMerchant && !matchDesc && !matchTags && !matchReceipt) return false;
      }

      // Category
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // Account
      if (selectedAccount !== 'all' && tx.accountId !== selectedAccount && tx.targetAccountId !== selectedAccount) {
        return false;
      }

      // Type
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // Essential
      if (selectedEssential === 'essential' && !tx.isEssential) return false;
      if (selectedEssential === 'flexible' && tx.isEssential) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount_desc') return b.amountCents - a.amountCents;
      if (sortBy === 'amount_asc') return a.amountCents - b.amountCents;
      return 0;
    });
  }, [transactions, searchTerm, selectedCategory, selectedAccount, selectedType, selectedEssential, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const pagedTransactions = filteredTransactions.slice(0, page * pageSize);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount_EUR', 'Category', 'Account', 'Merchant_Payee', 'Description', 'Essential', 'Payment_Method', 'Tags'];
    const rows = filteredTransactions.map(tx => {
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
        tx.paymentMethod,
        `"${tx.tags.join(', ')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `studentflow_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.transactions.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredTransactions.length} {settings.language === 'de' ? 'Buchungen gefunden' : 'records found'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.transactions.csvExport}</span>
          </button>
          <button
            onClick={() => openAddTxModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.common.addTransaction}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={settings.language === 'de' ? 'Suche nach Händler, Beschreibung, Notiz oder Tags...' : 'Search merchant, description, tags, notes...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.transactions.filterCategory}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {settings.language === 'de' ? c.nameDe : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.transactions.filterAccount}</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {settings.language === 'de' ? a.nameDe : a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.transactions.filterType}</option>
              <option value="expense">{t.common.expense}</option>
              <option value="income">{t.common.income}</option>
              <option value="transfer">{t.common.transfer}</option>
            </select>
          </div>

          {/* Essential filter */}
          <div>
            <select
              value={selectedEssential}
              onChange={e => setSelectedEssential(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.transactions.filterEssential}</option>
              <option value="essential">{t.transactions.onlyEssential}</option>
              <option value="flexible">{t.transactions.onlyDiscretionary}</option>
            </select>
          </div>

          {/* Sort */}
          <div className="col-span-2 sm:col-span-1">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="date_desc">Neueste zuerst (Datum ↓)</option>
              <option value="date_asc">Älteste zuerst (Datum ↑)</option>
              <option value="amount_desc">Höchster Betrag (€ ↓)</option>
              <option value="amount_asc">Niedrigster Betrag (€ ↑)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.common.emptyTitle}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">{t.common.emptySub}</p>
            <button
              onClick={() => openAddTxModal('expense')}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              + {t.common.addTransaction}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pagedTransactions.map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const acc = accounts.find(a => a.id === tx.accountId);
              const targetAcc = tx.targetAccountId ? accounts.find(a => a.id === tx.targetAccountId) : null;
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Icon, Details */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                      isIncome
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : isTransfer
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      <IconRenderer name={cat?.icon || 'HelpCircle'} className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {tx.merchantOrPayee || tx.description}
                        </span>

                        {tx.isEssential && tx.type === 'expense' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Fix
                          </span>
                        )}

                        {tx.isRecurring && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            Abo
                          </span>
                        )}
                      </div>

                      {/* Description & metadata */}
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{formatDateGerman(tx.date)}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {cat ? (settings.language === 'de' ? cat.nameDe : cat.name) : 'Transfer'}
                        </span>
                        <span>•</span>
                        <span>
                          {isTransfer && targetAcc
                            ? `${acc?.name} → ${targetAcc.name}`
                            : acc?.name || 'Account'}
                        </span>
                        {tx.description && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-xs">{tx.description}</span>
                          </>
                        )}
                      </div>

                      {/* Tags & notes */}
                      {(tx.tags.length > 0 || tx.receiptNote) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {tx.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                          {tx.receiptNote && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5" />
                              {tx.receiptNote}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className={`text-base font-black font-mono tracking-tight ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isTransfer
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {formatEuro(tx.amountCents, isIncome)}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit transaction"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTxToDelete(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Pagination */}
        {filteredTransactions.length > pageSize && pagedTransactions.length < filteredTransactions.length && (
          <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
            >
              {settings.language === 'de' ? 'Weitere Buchungen laden' : 'Load more transactions'}
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <AddTransactionModal
          isOpen={true}
          onClose={() => setEditingTx(null)}
          editingTransaction={editingTx}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(txToDelete)}
        title={settings.language === 'de' ? 'Transaktion löschen?' : 'Delete Transaction?'}
        message={settings.language === 'de' 
          ? 'Möchtest du diese Buchung wirklich unwiderruflich löschen? Der Kontostand wird automatisch zurückgerechnet.' 
          : 'Are you sure you want to permanently delete this transaction? Your account balances and budgets will be recalculated.'}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        isDestructive={true}
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete);
            setTxToDelete(null);
          }
        }}
        onCancel={() => setTxToDelete(null)}
      />

    </div>
  );
};
