import { Category, Account, RecurringSchedule, MonthlyBudget, GroceryItem, GroceryTrip, SavingsGoal, AppSettings } from '../types';
import { getCurrentMonthStr } from './formatters';

export const DEFAULT_CATEGORIES: Category[] = [
  // Housing
  { id: 'cat-rent', name: 'Rent', nameDe: 'Miete', superCategory: 'housing', icon: 'Home', color: '#3b82f6', isEssential: true },
  { id: 'cat-electricity', name: 'Electricity', nameDe: 'Strom', superCategory: 'housing', icon: 'Zap', color: '#eab308', isEssential: true },
  { id: 'cat-heating', name: 'Heating', nameDe: 'Heizung', superCategory: 'housing', icon: 'Flame', color: '#f97316', isEssential: true },
  { id: 'cat-internet', name: 'Internet', nameDe: 'Internet & WLAN', superCategory: 'housing', icon: 'Wifi', color: '#06b6d4', isEssential: true },
  { id: 'cat-mobile', name: 'Mobile Phone', nameDe: 'Handyvertrag', superCategory: 'housing', icon: 'Smartphone', color: '#8b5cf6', isEssential: true },
  { id: 'cat-household', name: 'Household Supplies', nameDe: 'Haushaltsbedarf', superCategory: 'housing', icon: 'Package', color: '#64748b', isEssential: false },

  // Food
  { id: 'cat-groceries', name: 'Groceries', nameDe: 'Supermarkt / Lebensmittel', superCategory: 'food', icon: 'ShoppingCart', color: '#10b981', isEssential: true },
  { id: 'cat-mensa', name: 'University Cafeteria (Mensa)', nameDe: 'Uni-Mensa', superCategory: 'food', icon: 'Utensils', color: '#14b8a6', isEssential: true },
  { id: 'cat-restaurants', name: 'Restaurants', nameDe: 'Restaurants', superCategory: 'food', icon: 'Coffee', color: '#f59e0b', isEssential: false },
  { id: 'cat-takeaway', name: 'Takeaway & Delivery', nameDe: 'Lieferdienst', superCategory: 'food', icon: 'Pizza', color: '#ef4444', isEssential: false },
  { id: 'cat-snacks', name: 'Coffee & Snacks', nameDe: 'Kaffee & Snacks', superCategory: 'food', icon: 'CupSoda', color: '#d97706', isEssential: false },

  // Transportation
  { id: 'cat-dticket', name: 'Deutschlandticket', nameDe: 'Deutschlandticket (49€)', superCategory: 'transportation', icon: 'TrainTrack', color: '#0284c7', isEssential: true },
  { id: 'cat-traintickets', name: 'Additional Train Tickets', nameDe: 'DB Bahntickets', superCategory: 'transportation', icon: 'Train', color: '#3b82f6', isEssential: false },
  { id: 'cat-bike', name: 'Bicycle Maintenance', nameDe: 'Fahrradreparatur', superCategory: 'transportation', icon: 'Bike', color: '#10b981', isEssential: false },
  { id: 'cat-taxi', name: 'Taxi & Rideshare', nameDe: 'Taxi & Uber', superCategory: 'transportation', icon: 'Car', color: '#6b7280', isEssential: false },
  { id: 'cat-transport-other', name: 'Other Transport', nameDe: 'Sonstiger Nahverkehr', superCategory: 'transportation', icon: 'Navigation', color: '#6366f1', isEssential: false },

  // Education
  { id: 'cat-semesterfee', name: 'University Fees (Semesterbeitrag)', nameDe: 'Semesterbeitrag', superCategory: 'education', icon: 'GraduationCap', color: '#4f46e5', isEssential: true },
  { id: 'cat-books', name: 'Books & Textbooks', nameDe: 'Fachbücher & Skripte', superCategory: 'education', icon: 'BookOpen', color: '#7c3aed', isEssential: true },
  { id: 'cat-stationery', name: 'Stationery', nameDe: 'Schreibwaren', superCategory: 'education', icon: 'PenTool', color: '#a855f7', isEssential: false },
  { id: 'cat-software', name: 'Software & Study Tools', nameDe: 'Software & Lizenzen', superCategory: 'education', icon: 'Laptop', color: '#2563eb', isEssential: false },
  { id: 'cat-printing', name: 'Printing & Copies', nameDe: 'Drucken & Kopieren', superCategory: 'education', icon: 'Printer', color: '#475569', isEssential: false },
  { id: 'cat-studymaterials', name: 'Study Materials', nameDe: 'Lernmaterialien', superCategory: 'education', icon: 'Layers', color: '#9333ea', isEssential: false },

  // Personal and lifestyle
  { id: 'cat-clothing', name: 'Clothing', nameDe: 'Kleidung', superCategory: 'personal', icon: 'Shirt', color: '#ec4899', isEssential: false },
  { id: 'cat-health', name: 'Healthcare & Pharmacy', nameDe: 'Apotheke & Gesundheit', superCategory: 'personal', icon: 'HeartPulse', color: '#ef4444', isEssential: true },
  { id: 'cat-toiletries', name: 'Toiletries & Drugstore', nameDe: 'Drogerie (dm/Rossmann)', superCategory: 'personal', icon: 'Sparkles', color: '#06b6d4', isEssential: true },
  { id: 'cat-entertainment', name: 'Entertainment & Cinema', nameDe: 'Freizeit & Kultur', superCategory: 'personal', icon: 'Film', color: '#8b5cf6', isEssential: false },
  { id: 'cat-gym', name: 'Gym & Sports', nameDe: 'Fitnessstudio & Sport', superCategory: 'personal', icon: 'Activity', color: '#10b981', isEssential: false },
  { id: 'cat-hobbies', name: 'Hobbies', nameDe: 'Hobbys', superCategory: 'personal', icon: 'Gamepad2', color: '#f59e0b', isEssential: false },
  { id: 'cat-social', name: 'Social Activities', nameDe: 'Ausgehen & Freunde', superCategory: 'personal', icon: 'Users', color: '#3b82f6', isEssential: false },

  // Financial and miscellaneous
  { id: 'cat-banking', name: 'Banking Fees', nameDe: 'Kontoführungsgebühren', superCategory: 'financial', icon: 'CreditCard', color: '#64748b', isEssential: false },
  { id: 'cat-subscriptions', name: 'Subscriptions', nameDe: 'Abonnements (Spotify, etc.)', superCategory: 'financial', icon: 'Repeat', color: '#ec4899', isEssential: false },
  { id: 'cat-insurance', name: 'Insurance (Health/Liability)', nameDe: 'Versicherungen', superCategory: 'financial', icon: 'ShieldCheck', color: '#059669', isEssential: true },
  { id: 'cat-rundfunk', name: 'Broadcasting Fee (Rundfunkbeitrag)', nameDe: 'Rundfunkbeitrag (GEZ)', superCategory: 'financial', icon: 'Radio', color: '#d97706', isEssential: true },
  { id: 'cat-gifts', name: 'Gifts', nameDe: 'Geschenke', superCategory: 'financial', icon: 'Gift', color: '#f43f5e', isEssential: false },
  { id: 'cat-emergency', name: 'Emergency Expenses', nameDe: 'Notfallausgaben', superCategory: 'financial', icon: 'AlertTriangle', color: '#dc2626', isEssential: true },
  { id: 'cat-other', name: 'Other Expenses', nameDe: 'Sonstiges', superCategory: 'financial', icon: 'HelpCircle', color: '#94a3b8', isEssential: false },
];

export const INCOME_SOURCES = [
  { id: 'inc-parttime', name: 'Part-time Job (Minijob)', nameDe: 'Minijob (bis 538€)' },
  { id: 'inc-workingstudent', name: 'Working-Student (Werkstudent)', nameDe: 'Werkstudentenjob' },
  { id: 'inc-family', name: 'Family Support', nameDe: 'Unterhalt der Eltern' },
  { id: 'inc-scholarship', name: 'Scholarship', nameDe: 'Stipendium' },
  { id: 'inc-bafoeg', name: 'BAföG / Student Assistance', nameDe: 'BAföG' },
  { id: 'inc-allowance', name: 'Monthly Allowance', nameDe: 'Monatliches Taschengeld' },
  { id: 'inc-freelance', name: 'Freelance Income', nameDe: 'Freiberufliche Einnahmen' },
  { id: 'inc-refund', name: 'Refunds', nameDe: 'Rückerstattung / Pfand' },
  { id: 'inc-other', name: 'Other Income', nameDe: 'Sonstige Einnahmen' },
];

// Clean accounts ready to use with 0.00 € starting balances
export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-checking',
    name: 'Main Bank Account (Girokonto)',
    nameDe: 'Girokonto',
    type: 'checking',
    balanceCents: 0,
    initialBalanceCents: 0,
    currency: 'EUR',
    description: 'Daily expenses, rent, bills',
    institution: 'Girokonto',
  },
  {
    id: 'acc-cash',
    name: 'Cash (Bargeld)',
    nameDe: 'Bargeld',
    type: 'cash',
    balanceCents: 0,
    initialBalanceCents: 0,
    currency: 'EUR',
    description: 'Wallet cash for Mensa and small purchases',
    institution: 'Bargeld',
  },
  {
    id: 'acc-savings',
    name: 'Savings Account (Tagesgeld)',
    nameDe: 'Tagesgeldkonto',
    type: 'savings',
    balanceCents: 0,
    initialBalanceCents: 0,
    currency: 'EUR',
    description: 'Student buffer & emergency fund',
    institution: 'Tagesgeld',
  },
  {
    id: 'acc-deposit',
    name: 'Rent Deposit (Mietkaution)',
    nameDe: 'Mietkautionskonto',
    type: 'deposit',
    balanceCents: 0,
    initialBalanceCents: 0,
    currency: 'EUR',
    description: 'Locked rental deposit for student apartment',
    institution: 'Kautionskasse',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'light',
  currency: 'EUR',
  monthStartDay: 1,
  budgetWarnThreshold1: 75,
  budgetWarnThreshold2: 90,
  enableAlerts: true,
  defaultAccountId: 'acc-checking',
  groceryMonthlyBudgetCents: 0,
  groceryWeeklyBudgetCents: 0,
};

// Clean recurring list ready for user's own bills
export const DEFAULT_RECURRING: RecurringSchedule[] = [];

// Clean initial monthly budget ready to be configured by the user
export const DEFAULT_BUDGET: MonthlyBudget = {
  month: getCurrentMonthStr(),
  totalLimitCents: 0,
  categoryBudgets: {},
  essentialLimitCents: 0,
  flexibleLimitCents: 0,
  savingsTargetCents: 0,
  weeklyLimitCents: 0,
  warnThreshold1: 75,
  warnThreshold2: 90,
};

// Clean initial savings goals
export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [];

// Clean initial grocery items & trips
export const DEFAULT_GROCERY_ITEMS: GroceryItem[] = [];
export const DEFAULT_GROCERY_TRIPS: GroceryTrip[] = [];
