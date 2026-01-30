/**
 * API client – hozircha mock demo data.
 * Kelajakda: haqiqiy backend URL va auth.
 */
import type { SeededData } from '@/lib/db/seed';
import type { Wallet, Category, Transaction, Debt } from '@/lib/models';

const MOCK_DELAY_MS = 400;

function toIso(d: Date): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function fromIso<T extends Record<string, unknown>>(obj: T, dateKeys: (keyof T)[]): T {
  const out = { ...obj };
  for (const key of dateKeys) {
    const v = out[key];
    if (typeof v === 'string') out[key] = new Date(v) as T[keyof T];
    if (typeof v === 'number') out[key] = new Date(v) as T[keyof T];
  }
  return out;
}

/** Mock demo data – API dan keladigan format (datelar string). */
async function fetchMockAccountData(): Promise<{
  wallets: Array<Omit<Wallet, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }>;
  categories: Array<Omit<Category, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }>;
  transactions: Array<Omit<Transaction, 'dateTime' | 'createdAt' | 'updatedAt'> & { dateTime: string; createdAt: string; updatedAt: string }>;
  debts: Array<Omit<Debt, 'dueDate' | 'createdAt' | 'updatedAt'> & { dueDate?: string; createdAt: string; updatedAt: string }>;
}> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  const now = new Date();
  const genId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  const w1 = genId(), w2 = genId(), w3 = genId();
  const cat1 = genId(), cat2 = genId(), cat3 = genId(), catSalary = genId();
  const wallets = [
    { id: w1, name: 'Main Card', currency: 'UZS', type: 'card' as const, initialBalance: 6088244, currentBalance: 6088244, icon: 'CreditCard', color: '#3b82f6', active: true, createdAt: toIso(now), updatedAt: toIso(now) },
    { id: w2, name: 'Cash', currency: 'UZS', type: 'cash' as const, initialBalance: 500000, currentBalance: 500000, icon: 'Banknote', color: '#10b981', active: true, createdAt: toIso(now), updatedAt: toIso(now) },
    { id: w3, name: 'Savings', currency: 'UZS', type: 'savings' as const, initialBalance: 10000000, currentBalance: 10000000, icon: 'PiggyBank', color: '#f59e0b', group: 'savings', active: true, createdAt: toIso(now), updatedAt: toIso(now) },
  ];
  const categories = [
    { id: cat1, name: 'Groceries', type: 'expense' as const, icon: 'ShoppingCart', color: '#60A5FA', archived: false, createdAt: toIso(now), updatedAt: toIso(now) },
    { id: cat2, name: 'Restaurant', type: 'expense' as const, icon: 'UtensilsCrossed', color: '#6366F1', archived: false, createdAt: toIso(now), updatedAt: toIso(now) },
    { id: cat3, name: 'Transport', type: 'expense' as const, icon: 'Bus', color: '#F59E0B', archived: false, createdAt: toIso(now), updatedAt: toIso(now) },
    { id: catSalary, name: 'Salary', type: 'income' as const, icon: 'DollarSign', color: '#10b981', archived: false, createdAt: toIso(now), updatedAt: toIso(now) },
  ];
  const tx = (type: 'expense' | 'income', amount: number, categoryId: string, walletId: string, date: Date, note?: string) => ({
    id: genId(), type, amount, currency: 'UZS', walletId, categoryId, note,
    dateTime: toIso(date), createdAt: toIso(now), updatedAt: toIso(now),
  });
  const dec = (d: number) => new Date(2025, 11, d);
  const jan = (d: number) => new Date(2026, 0, d);
  const transactions = [
    tx('income', 8_500_000, catSalary, w1, dec(5), 'Salary December'),
    tx('expense', 450_000, cat1, w1, dec(4)),
    tx('expense', 320_000, cat2, w1, dec(7)),
    tx('income', 9_000_000, catSalary, w1, jan(5), 'Salary January'),
    tx('expense', 310_000, cat1, w1, jan(3)),
  ];
  const debts = [
    { id: genId(), personOrEntityName: 'Split', amount: 3324000, currency: 'UZS', direction: 'I_OWE' as const, status: 'open' as const, createdAt: toIso(now), updatedAt: toIso(now) },
    { id: genId(), personOrEntityName: 'Work', amount: 5000000, currency: 'UZS', direction: 'IM_OWED' as const, status: 'open' as const, createdAt: toIso(now), updatedAt: toIso(now) },
  ];
  return { wallets, categories, transactions, debts };
}

/** API dan akkaunt ma’lumotlarini olish (mock). Kelajakda: GET /api/account. Offline da null. */
export async function getAccountData(): Promise<SeededData | null> {
  if (typeof window === 'undefined') return null;
  if (!navigator.onLine) return null;
  try {
    const raw = await fetchMockAccountData();
    const wallets: Wallet[] = raw.wallets.map((w) => fromIso(w as Wallet, ['createdAt', 'updatedAt']) as Wallet);
    const categories: Category[] = raw.categories.map((c) => fromIso(c as Category, ['createdAt', 'updatedAt']) as Category);
    const transactions: Transaction[] = raw.transactions.map((t) =>
      fromIso(t as Transaction, ['dateTime', 'createdAt', 'updatedAt']) as Transaction
    );
    const debts: Debt[] = raw.debts.map((d) =>
      fromIso(d as Debt, ['dueDate', 'createdAt', 'updatedAt']) as Debt
    );
    return { wallets, categories, transactions, debts };
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.warn('[api] getAccountData failed', e);
    return null;
  }
}
