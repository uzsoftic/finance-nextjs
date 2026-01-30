import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { TimeFormat, Currency, Theme } from '../models';

// Currency formatting
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  UZS: 'UZS',
  AUD: 'A$',
  CAD: 'C$',
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${amount < 0 ? '-' : ''}${formatted} ${symbol}`;
};

export const formatCurrencyCompact = (amount: number, currency: Currency): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  let displayAmount = Math.abs(amount);
  let suffix = '';

  if (displayAmount >= 1_000_000) {
    displayAmount = displayAmount / 1_000_000;
    suffix = 'M';
  } else if (displayAmount >= 1_000) {
    displayAmount = displayAmount / 1_000;
    suffix = 'K';
  }

  const formatted = displayAmount.toFixed(displayAmount >= 1 ? 1 : 2);
  return `${amount < 0 ? '-' : ''}${formatted}${suffix} ${symbol}`;
};

// Date formatting
export const formatDate = (date: Date, timeFormat: TimeFormat = '24h'): string => {
  const dateStr = format(date, 'MMM d, yyyy');
  const timeStr = format(date, timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
  return `${dateStr} ${timeStr}`;
};

export const formatDateShort = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d, yyyy');
};

export const formatDateLong = (date: Date): string => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

export const formatTime = (date: Date, timeFormat: TimeFormat = '24h'): string => {
  return format(date, timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const formatDateHeader = (date: Date): string => {
  const dateNum = format(date, 'd');
  const label = isToday(date) ? 'TODAY' : isYesterday(date) ? 'YESTERDAY' : format(date, 'MMMM yyyy');
  return `${dateNum} ${label}`.toLocaleUpperCase();
};

// Number formatting
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Wallet balance formatting
export const getTotalLabel = (amount: number, currency: Currency): string => {
  const isNegative = amount < 0;
  return `${isNegative ? '-' : '+'}${formatCurrency(Math.abs(amount), currency)}`;
};

// Category percentage calculation
export const calculatePercentage = (value: number, total: number): number => {
  return total === 0 ? 0 : (value / total) * 100;
};

// Month navigation
export const getPreviousMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
};

export const getNextMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

export const getMonthStartEnd = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Amount sign color helper
export const getAmountColor = (type: 'income' | 'expense' | 'transfer'): string => {
  switch (type) {
    case 'income':
      return 'text-emerald-400';
    case 'expense':
      return 'text-pink-400';
    case 'transfer':
      return 'text-blue-400';
    default:
      return 'text-foreground';
  }
};

export const getAmountPrefix = (type: 'income' | 'expense' | 'transfer'): string => {
  switch (type) {
    case 'income':
      return '+';
    case 'expense':
      return '-';
    case 'transfer':
      return '→';
    default:
      return '';
  }
};
