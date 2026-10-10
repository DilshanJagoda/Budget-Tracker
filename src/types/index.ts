export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod = 'card' | 'cash' | 'bank_transfer' | 'paypal' | 'direct_debit' | 'sepa';

export type ExpenseSuperCategory = 
  | 'housing' 
  | 'food' 
  | 'transportation' 
  | 'education' 
  | 'personal' 
  | 'financial' 
  | 'custom';

export interface Category {
  id: string;
  name: string;
  nameDe: string;
  superCategory: ExpenseSuperCategory;
  icon: string;
  color: string;
  isEssential: boolean;
  isCustom?: boolean;
}

export interface Account {
  id: string;
  name: string;
  nameDe: string;
  type: 'checking' | 'cash' | 'savings' | 'deposit'; // checking = Girokonto, deposit = Mietkaution
  balanceCents: number;
  initialBalanceCents: number;
  currency: string;
  description?: string;
  institution?: string; // e.g., Sparkasse, N26, DKB, Cash
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number; // Stored in euro cents (e.g. 45000 = 450.00 €)
  categoryId: string;
  accountId: string; // Source account (or receiving account for income)
  targetAccountId?: string; // For transfers
  date: string; // ISO date string YYYY-MM-DD
  merchantOrPayee: string;
  description: string;
  paymentMethod: PaymentMethod;
  isEssential: boolean;
  isRecurring?: boolean;
  recurringId?: string;
  tags: string[];
  receiptNote?: string;
  createdAt: string;
}

export interface RecurringSchedule {
  id: string;
  type: 'expense' | 'income';
  title: string;
  amountCents: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  endDate?: string;
  categoryId: string;
  accountId: string;
  merchantOrPayee: string;
  isEssential: boolean;
  isActive: boolean;
  reminderDaysBefore: number;
}

export interface CategoryBudget {
  categoryId: string;
  limitCents: number;
  warnThresholdPercent?: number; // e.g. 75 or 90
}

export interface MonthlyBudget {
  month: string; // Format: "YYYY-MM"
  totalLimitCents: number;
  categoryBudgets: Record<string, number>; // categoryId -> limitCents
  essentialLimitCents: number;
  flexibleLimitCents: number;
  savingsTargetCents: number;
  weeklyLimitCents: number;
  warnThreshold1: number; // default 75
  warnThreshold2: number; // default 90
}

export interface GroceryItem {
  id: string;
  name: string;
  subCategory: 'produce' | 'staples' | 'protein' | 'dairy' | 'frozen' | 'snacks' | 'essentials';
  estimatedPriceCents: number;
  actualPriceCents?: number;
  isPurchased: boolean;
  quantity?: string;
}

export interface GroceryTrip {
  id: string;
  date: string;
  storeName: string; // Aldi, Lidl, Rewe, Edeka, Penny, etc.
  totalCents: number;
  itemCount: number;
  itemsSummary?: string;
}

export interface SavingsContribution {
  id: string;
  date: string;
  amountCents: number; // positive for deposit, negative for withdrawal
  note: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetCents: number;
  currentCents: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  isEmergencyFund?: boolean;
  monthlyContributionTargetCents?: number;
  history: SavingsContribution[];
  icon: string;
  color: string;
}

export interface InAppAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  createdAt: string;
  isDismissed: boolean;
  linkTab?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university?: string;
  city?: string;
}

export interface AppSettings {
  language: 'en' | 'de';
  theme: 'light' | 'dark' | 'system';
  currency: 'EUR';
  monthStartDay: number; // 1 = 1st of month, 25 = 25th of month (typical salary/BAföG date)
  budgetWarnThreshold1: number;
  budgetWarnThreshold2: number;
  enableAlerts: boolean;
  defaultAccountId: string;
  groceryMonthlyBudgetCents: number;
  groceryWeeklyBudgetCents: number;
}
