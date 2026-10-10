import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Account, 
  Transaction, 
  Category, 
  MonthlyBudget, 
  RecurringSchedule, 
  GroceryItem, 
  GroceryTrip, 
  SavingsGoal, 
  AppSettings, 
  UserProfile, 
  InAppAlert,
  TransactionType
} from '../types';
import { loadAppState, saveAppState, FullAppState, createRequirement22TestFixture, getStorageKey } from '../utils/storage';
import { calculateFinancialSummary, FinancialSummary } from '../utils/calculations';
import { getCurrentMonthStr } from '../utils/formatters';
import { translations } from '../utils/translations';

interface AppContextType {
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budget: MonthlyBudget;
  recurring: RecurringSchedule[];
  savingsGoals: SavingsGoal[];
  groceryItems: GroceryItem[];
  groceryTrips: GroceryTrip[];
  settings: AppSettings;
  alerts: InAppAlert[];
  selectedMonth: string;
  activeTab: string;
  isAddTxOpen: boolean;
  initialTxType: TransactionType;
  summary: FinancialSummary;
  t: typeof translations.en;

  // Setters & Navigation
  setSelectedMonth: (month: string) => void;
  setActiveTab: (tab: string) => void;
  openAddTxModal: (type?: TransactionType) => void;
  closeAddTxModal: () => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Accounts
  addAccount: (acc: Omit<Account, 'id'>) => void;
  editAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amountCents: number, description?: string) => void;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  editCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Budget
  updateBudget: (budget: MonthlyBudget) => void;
  updateCategoryBudgetLimit: (categoryId: string, limitCents: number) => void;

  // Recurring & Bills
  addRecurringBill: (bill: Omit<RecurringSchedule, 'id'>) => void;
  editRecurringBill: (id: string, updates: Partial<RecurringSchedule>) => void;
  deleteRecurringBill: (id: string) => void;
  executeRecurringBill: (id: string) => void;

  // Savings
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'history'>) => void;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addSavingsContribution: (goalId: string, amountCents: number, fromAccountId: string, note?: string) => void;

  // Grocery
  addGroceryItem: (item: Omit<GroceryItem, 'id'>) => void;
  toggleGroceryItem: (id: string) => void;
  deleteGroceryItem: (id: string) => void;
  addGroceryTrip: (trip: Omit<GroceryTrip, 'id'>) => void;
  deleteGroceryTrip: (id: string) => void;

  // Settings & Theme
  updateSettings: (updates: Partial<AppSettings>) => void;
  setLanguage: (lang: 'en' | 'de') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Alerts
  dismissAlert: (id: string) => void;
  addAlert: (alert: Omit<InAppAlert, 'id' | 'createdAt' | 'isDismissed'>) => void;

  // Fixtures & Maintenance
  loadTestFixture: () => void;
  resetAllData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string>('usr-dilshan');
  const [state, setState] = useState<FullAppState>(() => loadAppState('usr-dilshan'));
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddTxOpen, setIsAddTxOpen] = useState<boolean>(false);
  const [initialTxType, setInitialTxType] = useState<TransactionType>('expense');

  // Sync state to local storage whenever state changes
  useEffect(() => {
    saveAppState(currentUserId, state);
  }, [currentUserId, state]);

  // Handle theme changes on document root
  useEffect(() => {
    const root = document.documentElement;
    const isDark = 
      state.settings.theme === 'dark' || 
      (state.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.theme]);

  // Derived financial summary
  const summary = useMemo(() => {
    return calculateFinancialSummary(
      state.accounts,
      state.transactions,
      state.recurring,
      state.budget,
      state.savingsGoals,
      selectedMonth
    );
  }, [state.accounts, state.transactions, state.recurring, state.budget, state.savingsGoals, selectedMonth]);

  // Translations
  const t = useMemo(() => {
    return state.settings.language === 'de' ? translations.de : translations.en;
  }, [state.settings.language]);

  // Check budget thresholds for automated in-app alerts
  useEffect(() => {
    if (!state.settings.enableAlerts || !state.budget || state.budget.totalLimitCents <= 0) return;

    const limit = state.budget.totalLimitCents;
    const spent = summary.expensesThisMonthCents;
    const pct = Math.round((spent / limit) * 100);

    if (pct >= 100) {
      // Check if alert already exists
      const hasAlert = state.alerts.some(a => a.id === `alert-budget-exceeded-${selectedMonth}`);
      if (!hasAlert) {
        setState(prev => ({
          ...prev,
          alerts: [
            {
              id: `alert-budget-exceeded-${selectedMonth}`,
              type: 'danger',
              title: state.settings.language === 'de' ? 'Monatsbudget überschritten!' : 'Monthly Budget Exceeded!',
              message: state.settings.language === 'de' 
                ? `Du hast dein Budget für ${selectedMonth} um ${(spent - limit)/100}€ überschritten.` 
                : `You have exceeded your total budget for ${selectedMonth} by €${((spent - limit)/100).toFixed(2)}.`,
              createdAt: new Date().toISOString(),
              isDismissed: false,
              linkTab: 'budgets',
            },
            ...prev.alerts,
          ],
        }));
      }
    } else if (pct >= state.settings.budgetWarnThreshold2) {
      const hasAlert = state.alerts.some(a => a.id === `alert-budget-90-${selectedMonth}`);
      if (!hasAlert) {
        setState(prev => ({
          ...prev,
          alerts: [
            {
              id: `alert-budget-90-${selectedMonth}`,
              type: 'warning',
              title: state.settings.language === 'de' ? 'Achtung: 90% des Budgets erreicht' : 'Warning: 90% Budget Reached',
              message: state.settings.language === 'de'
                ? `Du hast bereits ${pct}% deines Monatsbudgets ausgegeben.`
                : `You have consumed ${pct}% of your monthly budget allowance.`,
              createdAt: new Date().toISOString(),
              isDismissed: false,
              linkTab: 'budgets',
            },
            ...prev.alerts,
          ],
        }));
      }
    }
  }, [summary.expensesThisMonthCents, state.budget, selectedMonth, state.settings, state.alerts]);

  // Safe to Spend negative alert
  useEffect(() => {
    if (summary.safeToSpendCents < 0) {
      const alertId = `alert-negative-safe-${selectedMonth}`;
      if (!state.alerts.some(a => a.id === alertId)) {
        setState(prev => ({
          ...prev,
          alerts: [
            {
              id: alertId,
              type: 'danger',
              title: state.settings.language === 'de' ? 'Kritisches Freibudget' : 'Negative Safe-to-Spend Alert',
              message: state.settings.language === 'de'
                ? 'Dein verfügbares Guthaben deckt anstehende Fixkosten nicht vollständig ab. Bitte Ausgaben einschränken.'
                : 'Your current balance does not fully cover reserved essential bills. Please pause discretionary purchases.',
              createdAt: new Date().toISOString(),
              isDismissed: false,
              linkTab: 'dashboard',
            },
            ...prev.alerts,
          ],
        }));
      }
    }
  }, [summary.safeToSpendCents, selectedMonth, state.alerts, state.settings.language]);

  // Modal navigation
  const openAddTxModal = useCallback((type: TransactionType = 'expense') => {
    setInitialTxType(type);
    setIsAddTxOpen(true);
  }, []);

  const closeAddTxModal = useCallback(() => {
    setIsAddTxOpen(false);
  }, []);

  // Transaction Actions
  const addTransaction = useCallback((newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const fullTx: Transaction = {
      ...newTx,
      id,
      createdAt: new Date().toISOString(),
    };

    setState(prev => {
      // Update account balance
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === fullTx.accountId) {
          if (fullTx.type === 'expense') {
            return { ...acc, balanceCents: acc.balanceCents - fullTx.amountCents };
          } else if (fullTx.type === 'income') {
            return { ...acc, balanceCents: acc.balanceCents + fullTx.amountCents };
          } else if (fullTx.type === 'transfer' && fullTx.targetAccountId) {
            return { ...acc, balanceCents: acc.balanceCents - fullTx.amountCents };
          }
        }
        if (fullTx.type === 'transfer' && acc.id === fullTx.targetAccountId) {
          return { ...acc, balanceCents: acc.balanceCents + fullTx.amountCents };
        }
        return acc;
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: [fullTx, ...prev.transactions],
      };
    });
  }, []);

  const editTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState(prev => {
      const oldTx = prev.transactions.find(t => t.id === id);
      if (!oldTx) return prev;

      // Reverse old transaction impact on accounts
      let accounts = prev.accounts.map(acc => {
        if (acc.id === oldTx.accountId) {
          if (oldTx.type === 'expense') {
            return { ...acc, balanceCents: acc.balanceCents + oldTx.amountCents };
          } else if (oldTx.type === 'income') {
            return { ...acc, balanceCents: acc.balanceCents - oldTx.amountCents };
          } else if (oldTx.type === 'transfer' && oldTx.targetAccountId) {
            return { ...acc, balanceCents: acc.balanceCents + oldTx.amountCents };
          }
        }
        if (oldTx.type === 'transfer' && acc.id === oldTx.targetAccountId) {
          return { ...acc, balanceCents: acc.balanceCents - oldTx.amountCents };
        }
        return acc;
      });

      const updatedTx: Transaction = { ...oldTx, ...updates };

      // Apply new transaction impact
      accounts = accounts.map(acc => {
        if (acc.id === updatedTx.accountId) {
          if (updatedTx.type === 'expense') {
            return { ...acc, balanceCents: acc.balanceCents - updatedTx.amountCents };
          } else if (updatedTx.type === 'income') {
            return { ...acc, balanceCents: acc.balanceCents + updatedTx.amountCents };
          } else if (updatedTx.type === 'transfer' && updatedTx.targetAccountId) {
            return { ...acc, balanceCents: acc.balanceCents - updatedTx.amountCents };
          }
        }
        if (updatedTx.type === 'transfer' && acc.id === updatedTx.targetAccountId) {
          return { ...acc, balanceCents: acc.balanceCents + updatedTx.amountCents };
        }
        return acc;
      });

      return {
        ...prev,
        accounts,
        transactions: prev.transactions.map(t => t.id === id ? updatedTx : t),
      };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => {
      const oldTx = prev.transactions.find(t => t.id === id);
      if (!oldTx) return prev;

      // Reverse account impact
      const accounts = prev.accounts.map(acc => {
        if (acc.id === oldTx.accountId) {
          if (oldTx.type === 'expense') {
            return { ...acc, balanceCents: acc.balanceCents + oldTx.amountCents };
          } else if (oldTx.type === 'income') {
            return { ...acc, balanceCents: acc.balanceCents - oldTx.amountCents };
          } else if (oldTx.type === 'transfer' && oldTx.targetAccountId) {
            return { ...acc, balanceCents: acc.balanceCents + oldTx.amountCents };
          }
        }
        if (oldTx.type === 'transfer' && acc.id === oldTx.targetAccountId) {
          return { ...acc, balanceCents: acc.balanceCents - oldTx.amountCents };
        }
        return acc;
      });

      return {
        ...prev,
        accounts,
        transactions: prev.transactions.filter(t => t.id !== id),
      };
    });
  }, []);

  // Account Transfer
  const transferFunds = useCallback((fromAccountId: string, toAccountId: string, amountCents: number, description?: string) => {
    if (fromAccountId === toAccountId || amountCents <= 0) return;

    addTransaction({
      type: 'transfer',
      amountCents,
      categoryId: 'cat-banking',
      accountId: fromAccountId,
      targetAccountId: toAccountId,
      date: new Date().toISOString().split('T')[0],
      merchantOrPayee: 'Account Transfer',
      description: description || 'Transfer between accounts',
      paymentMethod: 'bank_transfer',
      isEssential: false,
      tags: ['transfer'],
    });
  }, [addTransaction]);

  // Account CRUD
  const addAccount = useCallback((acc: Omit<Account, 'id'>) => {
    const id = `acc-${Date.now()}`;
    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, { ...acc, id }],
    }));
  }, []);

  const editAccount = useCallback((id: string, updates: Partial<Account>) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.filter(a => a.id !== id),
    }));
  }, []);

  // Categories CRUD
  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const id = `cat-custom-${Date.now()}`;
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, { ...cat, id, isCustom: true }],
    }));
  }, []);

  const editCategory = useCallback((id: string, updates: Partial<Category>) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  }, []);

  // Budget
  const updateBudget = useCallback((budget: MonthlyBudget) => {
    setState(prev => ({ ...prev, budget }));
  }, []);

  const updateCategoryBudgetLimit = useCallback((categoryId: string, limitCents: number) => {
    setState(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        categoryBudgets: {
          ...prev.budget.categoryBudgets,
          [categoryId]: limitCents,
        },
      },
    }));
  }, []);

  // Recurring bills
  const addRecurringBill = useCallback((bill: Omit<RecurringSchedule, 'id'>) => {
    const id = `rec-${Date.now()}`;
    setState(prev => ({
      ...prev,
      recurring: [...prev.recurring, { ...bill, id }],
    }));
  }, []);

  const editRecurringBill = useCallback((id: string, updates: Partial<RecurringSchedule>) => {
    setState(prev => ({
      ...prev,
      recurring: prev.recurring.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  }, []);

  const deleteRecurringBill = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      recurring: prev.recurring.filter(r => r.id !== id),
    }));
  }, []);

  // Mark recurring bill as paid & record transaction safely
  const executeRecurringBill = useCallback((id: string) => {
    setState(prev => {
      const bill = prev.recurring.find(r => r.id === id);
      if (!bill) return prev;

      const dateStr = bill.nextDueDate;
      // Prevent duplicate transaction for this bill on the same date
      const alreadyLogged = prev.transactions.some(
        t => t.recurringId === id && t.date === dateStr
      );

      if (alreadyLogged) {
        return prev;
      }

      // Calculate next due date
      const currentDue = new Date(bill.nextDueDate);
      if (bill.frequency === 'monthly') {
        currentDue.setMonth(currentDue.getMonth() + 1);
      } else if (bill.frequency === 'weekly') {
        currentDue.setDate(currentDue.getDate() + 7);
      } else if (bill.frequency === 'quarterly') {
        currentDue.setMonth(currentDue.getMonth() + 3);
      } else if (bill.frequency === 'yearly') {
        currentDue.setFullYear(currentDue.getFullYear() + 1);
      }
      const nextDueStr = currentDue.toISOString().split('T')[0];

      const newTx: Transaction = {
        id: `tx-rec-${Date.now()}`,
        type: bill.type,
        amountCents: bill.amountCents,
        categoryId: bill.categoryId,
        accountId: bill.accountId,
        date: dateStr,
        merchantOrPayee: bill.merchantOrPayee,
        description: `Scheduled: ${bill.title}`,
        paymentMethod: 'direct_debit',
        isEssential: bill.isEssential,
        isRecurring: true,
        recurringId: id,
        tags: ['recurring', 'scheduled'],
        createdAt: new Date().toISOString(),
      };

      // Update account balance
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === bill.accountId) {
          const delta = bill.type === 'expense' ? -bill.amountCents : bill.amountCents;
          return { ...acc, balanceCents: acc.balanceCents + delta };
        }
        return acc;
      });

      // Update recurring schedule next due date
      const updatedRecurring = prev.recurring.map(r => 
        r.id === id ? { ...r, nextDueDate: nextDueStr } : r
      );

      return {
        ...prev,
        accounts: updatedAccounts,
        recurring: updatedRecurring,
        transactions: [newTx, ...prev.transactions],
      };
    });
  }, []);

  // Savings Goals
  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'history'>) => {
    const id = `goal-${Date.now()}`;
    setState(prev => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, { ...goal, id, history: [] }],
    }));
  }, []);

  const editSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g),
    }));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter(g => g.id !== id),
    }));
  }, []);

  const addSavingsContribution = useCallback((goalId: string, amountCents: number, fromAccountId: string, note?: string) => {
    setState(prev => {
      const goal = prev.savingsGoals.find(g => g.id === goalId);
      if (!goal) return prev;

      const dateStr = new Date().toISOString().split('T')[0];
      const contributionId = `sh-${Date.now()}`;

      // Update goal's current saved amount and history
      const updatedGoals = prev.savingsGoals.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            currentCents: Math.max(0, g.currentCents + amountCents),
            history: [
              {
                id: contributionId,
                date: dateStr,
                amountCents,
                note: note || (amountCents > 0 ? 'Savings deposit' : 'Savings withdrawal'),
              },
              ...g.history,
            ],
          };
        }
        return g;
      });

      // Deduct from checking account and move to savings account if transferring
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === fromAccountId) {
          return { ...acc, balanceCents: acc.balanceCents - amountCents };
        }
        if (acc.type === 'savings' && fromAccountId !== acc.id) {
          return { ...acc, balanceCents: acc.balanceCents + amountCents };
        }
        return acc;
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        savingsGoals: updatedGoals,
      };
    });
  }, []);

  // Grocery
  const addGroceryItem = useCallback((item: Omit<GroceryItem, 'id'>) => {
    const id = `g-${Date.now()}`;
    setState(prev => ({
      ...prev,
      groceryItems: [...prev.groceryItems, { ...item, id }],
    }));
  }, []);

  const toggleGroceryItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      groceryItems: prev.groceryItems.map(item => 
        item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
      ),
    }));
  }, []);

  const deleteGroceryItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      groceryItems: prev.groceryItems.filter(item => item.id !== id),
    }));
  }, []);

  const addGroceryTrip = useCallback((trip: Omit<GroceryTrip, 'id'>) => {
    const id = `gt-${Date.now()}`;
    const newTrip = { ...trip, id };

    setState(prev => {
      // Also automatically record as an expense transaction under groceries!
      const defaultAccount = prev.accounts.find(a => a.id === prev.settings.defaultAccountId) || prev.accounts[0];
      const newTx: Transaction = {
        id: `tx-trip-${Date.now()}`,
        type: 'expense',
        amountCents: trip.totalCents,
        categoryId: 'cat-groceries',
        accountId: defaultAccount.id,
        date: trip.date,
        merchantOrPayee: trip.storeName,
        description: `Supermarket trip: ${trip.storeName} (${trip.itemCount} items)`,
        paymentMethod: 'card',
        isEssential: true,
        tags: ['groceries', trip.storeName.toLowerCase()],
        createdAt: new Date().toISOString(),
      };

      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === defaultAccount.id) {
          return { ...acc, balanceCents: acc.balanceCents - trip.totalCents };
        }
        return acc;
      });

      return {
        ...prev,
        groceryTrips: [newTrip, ...prev.groceryTrips],
        transactions: [newTx, ...prev.transactions],
        accounts: updatedAccounts,
      };
    });
  }, []);

  const deleteGroceryTrip = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      groceryTrips: prev.groceryTrips.filter(t => t.id !== id),
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const setLanguage = useCallback((lang: 'en' | 'de') => {
    updateSettings({ language: lang });
  }, [updateSettings]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  }, [updateSettings]);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...profile },
    }));
  }, []);

  // Alerts
  const dismissAlert = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === id ? { ...a, isDismissed: true } : a),
    }));
  }, []);

  const addAlert = useCallback((alert: Omit<InAppAlert, 'id' | 'createdAt' | 'isDismissed'>) => {
    const id = `alt-${Date.now()}`;
    setState(prev => ({
      ...prev,
      alerts: [
        { ...alert, id, createdAt: new Date().toISOString(), isDismissed: false },
        ...prev.alerts,
      ],
    }));
  }, []);

  // Fixtures & Data Management
  const loadTestFixture = useCallback(() => {
    const fixture = createRequirement22TestFixture(currentUserId);
    setState(fixture);
  }, [currentUserId]);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(getStorageKey(currentUserId, 'transactions'));
    localStorage.removeItem(getStorageKey(currentUserId, 'accounts'));
    localStorage.removeItem(getStorageKey(currentUserId, 'budget'));
    localStorage.removeItem(getStorageKey(currentUserId, 'recurring'));
    localStorage.removeItem(getStorageKey(currentUserId, 'savings'));
    localStorage.removeItem(getStorageKey(currentUserId, 'grocery_items'));
    localStorage.removeItem(getStorageKey(currentUserId, 'grocery_trips'));
    localStorage.removeItem(getStorageKey(currentUserId, 'alerts'));
    setState(loadAppState(currentUserId));
  }, [currentUserId]);

  const exportDataJson = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importDataJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.accounts && parsed.transactions) {
        setState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user: state.user,
        accounts: state.accounts,
        transactions: state.transactions,
        categories: state.categories,
        budget: state.budget,
        recurring: state.recurring,
        savingsGoals: state.savingsGoals,
        groceryItems: state.groceryItems,
        groceryTrips: state.groceryTrips,
        settings: state.settings,
        alerts: state.alerts,
        selectedMonth,
        activeTab,
        isAddTxOpen,
        initialTxType,
        summary,
        t,
        setSelectedMonth,
        setActiveTab,
        openAddTxModal,
        closeAddTxModal,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addAccount,
        editAccount,
        deleteAccount,
        transferFunds,
        addCategory,
        editCategory,
        deleteCategory,
        updateBudget,
        updateCategoryBudgetLimit,
        addRecurringBill,
        editRecurringBill,
        deleteRecurringBill,
        executeRecurringBill,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        addSavingsContribution,
        addGroceryItem,
        toggleGroceryItem,
        deleteGroceryItem,
        addGroceryTrip,
        deleteGroceryTrip,
        updateSettings,
        setLanguage,
        setTheme,
        updateProfile,
        dismissAlert,
        addAlert,
        loadTestFixture,
        resetAllData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
