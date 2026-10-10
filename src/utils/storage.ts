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
  InAppAlert 
} from '../types';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_ACCOUNTS, 
  DEFAULT_SETTINGS, 
  DEFAULT_BUDGET, 
  DEFAULT_RECURRING, 
  DEFAULT_SAVINGS_GOALS, 
  DEFAULT_GROCERY_ITEMS, 
  DEFAULT_GROCERY_TRIPS 
} from './defaults';
import { getCurrentMonthStr } from './formatters';

export interface FullAppState {
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
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-dilshan',
  name: 'Dilshan Jagoda',
  email: 'dilshanjagoda2008@gmail.com',
  university: 'University Student',
  city: 'Germany',
};

const CLEAN_MIGRATION_KEY = 'studentflow_clean_slate_active_v1';

export function getStorageKey(userId: string, key: string): string {
  return `studentflow_${userId}_${key}`;
}

export function loadAppState(userId: string = DEFAULT_USER.id): FullAppState {
  try {
    // Purge any old pre-existing mock draft data from earlier test builds
    const isCleaned = localStorage.getItem(CLEAN_MIGRATION_KEY);
    if (!isCleaned) {
      localStorage.removeItem(getStorageKey(userId, 'transactions'));
      localStorage.removeItem(getStorageKey(userId, 'accounts'));
      localStorage.removeItem(getStorageKey(userId, 'recurring'));
      localStorage.removeItem(getStorageKey(userId, 'savings'));
      localStorage.removeItem(getStorageKey(userId, 'grocery_items'));
      localStorage.removeItem(getStorageKey(userId, 'grocery_trips'));
      localStorage.removeItem(getStorageKey(userId, 'budget'));
      localStorage.removeItem(getStorageKey(userId, 'alerts'));
      localStorage.setItem(CLEAN_MIGRATION_KEY, 'true');
    }

    const rawUser = localStorage.getItem(`studentflow_${userId}_profile`);
    const user: UserProfile = rawUser ? JSON.parse(rawUser) : DEFAULT_USER;

    const rawAccounts = localStorage.getItem(getStorageKey(userId, 'accounts'));
    const accounts: Account[] = rawAccounts ? JSON.parse(rawAccounts) : DEFAULT_ACCOUNTS;

    const rawCategories = localStorage.getItem(getStorageKey(userId, 'categories'));
    const categories: Category[] = rawCategories ? JSON.parse(rawCategories) : DEFAULT_CATEGORIES;

    const rawTransactions = localStorage.getItem(getStorageKey(userId, 'transactions'));
    const transactions: Transaction[] = rawTransactions ? JSON.parse(rawTransactions) : [];

    const rawBudget = localStorage.getItem(getStorageKey(userId, 'budget'));
    const budget: MonthlyBudget = rawBudget ? JSON.parse(rawBudget) : DEFAULT_BUDGET;

    const rawRecurring = localStorage.getItem(getStorageKey(userId, 'recurring'));
    const recurring: RecurringSchedule[] = rawRecurring ? JSON.parse(rawRecurring) : DEFAULT_RECURRING;

    const rawSavings = localStorage.getItem(getStorageKey(userId, 'savings'));
    const savingsGoals: SavingsGoal[] = rawSavings ? JSON.parse(rawSavings) : DEFAULT_SAVINGS_GOALS;

    const rawGroceryItems = localStorage.getItem(getStorageKey(userId, 'grocery_items'));
    const groceryItems: GroceryItem[] = rawGroceryItems ? JSON.parse(rawGroceryItems) : DEFAULT_GROCERY_ITEMS;

    const rawGroceryTrips = localStorage.getItem(getStorageKey(userId, 'grocery_trips'));
    const groceryTrips: GroceryTrip[] = rawGroceryTrips ? JSON.parse(rawGroceryTrips) : DEFAULT_GROCERY_TRIPS;

    const rawSettings = localStorage.getItem(getStorageKey(userId, 'settings'));
    const settings: AppSettings = rawSettings ? JSON.parse(rawSettings) : DEFAULT_SETTINGS;

    const rawAlerts = localStorage.getItem(getStorageKey(userId, 'alerts'));
    const alerts: InAppAlert[] = rawAlerts ? JSON.parse(rawAlerts) : [];

    return {
      user,
      accounts,
      transactions,
      categories,
      budget,
      recurring,
      savingsGoals,
      groceryItems,
      groceryTrips,
      settings,
      alerts,
    };
  } catch (err) {
    console.error('Failed to load app state from localStorage:', err);
    return {
      user: DEFAULT_USER,
      accounts: DEFAULT_ACCOUNTS,
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      budget: DEFAULT_BUDGET,
      recurring: [],
      savingsGoals: [],
      groceryItems: [],
      groceryTrips: [],
      settings: DEFAULT_SETTINGS,
      alerts: [],
    };
  }
}

export function saveAppState(userId: string, state: FullAppState): void {
  try {
    localStorage.setItem(`studentflow_${userId}_profile`, JSON.stringify(state.user));
    localStorage.setItem(getStorageKey(userId, 'accounts'), JSON.stringify(state.accounts));
    localStorage.setItem(getStorageKey(userId, 'transactions'), JSON.stringify(state.transactions));
    localStorage.setItem(getStorageKey(userId, 'categories'), JSON.stringify(state.categories));
    localStorage.setItem(getStorageKey(userId, 'budget'), JSON.stringify(state.budget));
    localStorage.setItem(getStorageKey(userId, 'recurring'), JSON.stringify(state.recurring));
    localStorage.setItem(getStorageKey(userId, 'savings'), JSON.stringify(state.savingsGoals));
    localStorage.setItem(getStorageKey(userId, 'grocery_items'), JSON.stringify(state.groceryItems));
    localStorage.setItem(getStorageKey(userId, 'grocery_trips'), JSON.stringify(state.groceryTrips));
    localStorage.setItem(getStorageKey(userId, 'settings'), JSON.stringify(state.settings));
    localStorage.setItem(getStorageKey(userId, 'alerts'), JSON.stringify(state.alerts));
  } catch (err) {
    console.error('Failed to save app state to localStorage:', err);
  }
}

/**
 * Loads test fixture on explicit user demand from Settings/QA for verification testing
 */
export function createRequirement22TestFixture(userId: string = DEFAULT_USER.id): FullAppState {
  const currentMonth = getCurrentMonthStr();
  const testTransactions: Transaction[] = [
    {
      id: 'tx-req22-income',
      type: 'income',
      amountCents: 90000, // €900
      categoryId: 'inc-workingstudent',
      accountId: 'acc-checking',
      date: `${currentMonth}-01`,
      merchantOrPayee: 'Werkstudent Employer',
      description: 'Requirement 22 Test: Student received €900 income',
      paymentMethod: 'bank_transfer',
      isEssential: true,
      tags: ['test-req22', 'income'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-req22-rent',
      type: 'expense',
      amountCents: 45000, // €450
      categoryId: 'cat-rent',
      accountId: 'acc-checking',
      date: `${currentMonth}-01`,
      merchantOrPayee: 'Studentenwerk Munich',
      description: 'Requirement 22 Test: Student paid €450 rent',
      paymentMethod: 'direct_debit',
      isEssential: true,
      tags: ['test-req22', 'rent'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-req22-groceries',
      type: 'expense',
      amountCents: 12000, // €120
      categoryId: 'cat-groceries',
      accountId: 'acc-checking',
      date: `${currentMonth}-05`,
      merchantOrPayee: 'ALDI & Rewe Groceries',
      description: 'Requirement 22 Test: Student spent €120 on groceries',
      paymentMethod: 'card',
      isEssential: true,
      tags: ['test-req22', 'groceries'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-req22-transport',
      type: 'expense',
      amountCents: 4900, // €49
      categoryId: 'cat-dticket',
      accountId: 'acc-checking',
      date: `${currentMonth}-02`,
      merchantOrPayee: 'Deutschlandticket',
      description: 'Requirement 22 Test: Student spent €49 on transportation',
      paymentMethod: 'direct_debit',
      isEssential: true,
      tags: ['test-req22', 'transport'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-req22-subscriptions',
      type: 'expense',
      amountCents: 3000, // €30
      categoryId: 'cat-subscriptions',
      accountId: 'acc-checking',
      date: `${currentMonth}-07`,
      merchantOrPayee: 'Streaming & Software (Spotify + Netflix + Cloud)',
      description: 'Requirement 22 Test: Student paid €30 in subscriptions',
      paymentMethod: 'paypal',
      isEssential: false,
      tags: ['test-req22', 'subscriptions'],
      createdAt: new Date().toISOString(),
    },
  ];

  const testAccounts: Account[] = [
    {
      id: 'acc-checking',
      name: 'Main Bank Account (Girokonto)',
      nameDe: 'Girokonto',
      type: 'checking',
      balanceCents: 15100, // 151.00 € remaining
      initialBalanceCents: 0,
      currency: 'EUR',
      description: 'Girokonto with Requirement 22 test transactions',
      institution: 'Sparkasse',
    },
    {
      id: 'acc-cash',
      name: 'Cash (Bargeld)',
      nameDe: 'Bargeld',
      type: 'cash',
      balanceCents: 2000, // 20.00 €
      initialBalanceCents: 2000,
      currency: 'EUR',
      institution: 'Bargeld',
    },
    {
      id: 'acc-savings',
      name: 'Savings Account (Tagesgeld)',
      nameDe: 'Tagesgeldkonto',
      type: 'savings',
      balanceCents: 10000, // 100.00 € from savings contribution
      initialBalanceCents: 0,
      currency: 'EUR',
      institution: 'Trade Republic',
    },
    {
      id: 'acc-deposit',
      name: 'Rent Deposit (Mietkaution)',
      nameDe: 'Mietkautionskonto',
      type: 'deposit',
      balanceCents: 135000, // 1350.00 € (3x 450€)
      initialBalanceCents: 135000,
      currency: 'EUR',
      institution: 'Kautionskasse',
    },
  ];

  const testSavings: SavingsGoal[] = [
    {
      id: 'goal-emergency',
      name: 'Emergency Fund (Notgroschen)',
      targetCents: 100000, // 1000 €
      currentCents: 10000, // 100 € recorded savings
      targetDate: '2027-01-01',
      priority: 'high',
      isEmergencyFund: true,
      monthlyContributionTargetCents: 10000,
      history: [
        {
          id: 'sh-req22-1',
          date: `${currentMonth}-10`,
          amountCents: 10000, // €100 recorded savings
          note: 'Requirement 22 Test: €100 savings recorded',
        },
      ],
      icon: 'Shield',
      color: '#10b981',
    },
  ];

  const testBudget: MonthlyBudget = {
    month: currentMonth,
    totalLimitCents: 80000,
    categoryBudgets: {
      'cat-rent': 45000,
      'cat-groceries': 15000,
      'cat-dticket': 4900,
      'cat-subscriptions': 3000,
    },
    essentialLimitCents: 65000,
    flexibleLimitCents: 15000,
    savingsTargetCents: 10000,
    weeklyLimitCents: 20000,
    warnThreshold1: 75,
    warnThreshold2: 90,
  };

  return {
    user: DEFAULT_USER,
    accounts: testAccounts,
    transactions: testTransactions,
    categories: DEFAULT_CATEGORIES,
    budget: testBudget,
    recurring: [
      {
        id: 'rec-test-rent',
        type: 'expense',
        title: 'Warmmiete',
        amountCents: 45000,
        frequency: 'monthly',
        startDate: '2026-01-01',
        nextDueDate: `${currentMonth}-01`,
        categoryId: 'cat-rent',
        accountId: 'acc-checking',
        merchantOrPayee: 'Studentenwerk',
        isEssential: true,
        isActive: true,
        reminderDaysBefore: 3,
      },
    ],
    savingsGoals: testSavings,
    groceryItems: [],
    groceryTrips: [
      {
        id: 'gt-test-1',
        date: `${currentMonth}-05`,
        storeName: 'ALDI & Rewe',
        totalCents: 12000,
        itemCount: 22,
        itemsSummary: 'Requirement 22 groceries test',
      },
    ],
    settings: DEFAULT_SETTINGS,
    alerts: [
      {
        id: 'alt-req22',
        type: 'success',
        title: 'Requirement 22 Test Suite Loaded',
        message: 'Loaded: €900 Income, €450 Rent, €120 Groceries, €49 Transport, €30 Subscriptions, €100 Savings.',
        createdAt: new Date().toISOString(),
        isDismissed: false,
      },
    ],
  };
}
