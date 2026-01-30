/**
 * Core TypeScript models for personal finance app
 */

export type Currency = 'USD' | 'UZS' | 'EUR' | 'GBP' | 'JPY' | string;
export type WalletType = 'cash' | 'card' | 'savings' | 'other';
export type TransactionType = 'expense' | 'income' | 'transfer';
export type CategoryType = 'expense' | 'income' | 'both';
export type DebtDirection = 'I_OWE' | 'IM_OWED';
export type DebtStatus = 'open' | 'paid' | 'partial';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type CalendarType = 'gregorian' | 'hijri' | 'jalali';
export type TimeFormat = '12h' | '24h';
export type Theme = 'dark' | 'light';

// User Preferences
export interface UserPreferences {
  id: string;
  baseCurrency: Currency;
  calendarType: CalendarType;
  timeFormat: TimeFormat;
  theme: Theme;
  createdAt: Date;
  updatedAt: Date;
}

// Wallets/Accounts
export interface Wallet {
  id: string;
  name: string;
  currency: Currency;
  type: WalletType;
  initialBalance: number;
  currentBalance: number;
  icon?: string; // lucide icon name
  color?: string;
  group?: 'accounts' | 'savings'; // Group type
  order?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Categories
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string; // lucide icon name
  color?: string;
  archived: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Transactions
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  walletId: string;
  toWalletId?: string; // For transfer type
  categoryId?: string;
  note?: string;
  tags?: string[];
  dateTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Debts
export interface Debt {
  id: string;
  personOrEntityName: string;
  amount: number;
  currency: Currency;
  direction: DebtDirection;
  dueDate?: Date;
  note?: string;
  status: DebtStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Subscriptions/Recurring
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  walletId: string;
  categoryId?: string;
  frequency: RecurrenceFrequency;
  nextRunAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Savings Goals
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currency: Currency;
  currentAmount: number;
  targetDate?: Date;
  linkedSavingsWalletId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sync Queue (for offline-first architecture)
export interface SyncQueueItem {
  id: string;
  entityType: 'wallet' | 'transaction' | 'debt' | 'category' | 'subscription' | 'goal';
  action: 'create' | 'update' | 'delete';
  entityId: string;
  data: any;
  status: 'pending' | 'synced';
  createdAt: Date;
  syncedAt?: Date;
}

// Default Categories
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: '#60A5FA', archived: false },
  { name: 'Restaurant', type: 'expense', icon: 'UtensilsCrossed', color: '#6366F1', archived: false },
  { name: 'Transport', type: 'expense', icon: 'Bus', color: '#F59E0B', archived: false },
  { name: 'Leisure', type: 'expense', icon: 'Gamepad2', color: '#A855F7', archived: false },
  { name: 'Health', type: 'expense', icon: 'Heart', color: '#10B981', archived: false },
  { name: 'Gifts', type: 'expense', icon: 'Gift', color: '#F43F5E', archived: false },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#C97D8C', archived: false },
  { name: 'Communication', type: 'expense', icon: 'Globe', color: '#6366F1', archived: false },
  { name: 'Communal', type: 'expense', icon: 'Zap', color: '#10B981', archived: false },
  { name: 'Credit', type: 'expense', icon: 'Building2', color: '#DC2626', archived: false },
  { name: 'Family', type: 'expense', icon: 'Smile', color: '#A855F7', archived: false },
  { name: 'Work', type: 'income', icon: 'Briefcase', color: '#6366F1', archived: false },
  { name: 'Salary', type: 'income', icon: 'DollarSign', color: '#10B981', archived: false },
  { name: 'Freelance', type: 'income', icon: 'Code', color: '#3B82F6', archived: false },
  { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#F59E0B', archived: false },
  { name: 'Other', type: 'both', icon: 'Tag', color: '#6b7280', archived: false },
];
