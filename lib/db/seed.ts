import { getDb } from './database';
import { Wallet, Transaction, Debt, Category } from '../models';

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export type SeededData = {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  debts: Debt[];
};

async function doSeed(): Promise<SeededData> {
  const db = getDb();
  const now = new Date();

  // Create wallets
  const wallets: Wallet[] = [
    {
      id: generateId(),
      name: 'Main Card',
      currency: 'UZS',
      type: 'card',
      initialBalance: 6088244,
      currentBalance: 6088244,
      icon: 'CreditCard',
      color: '#3b82f6',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Cash',
      currency: 'UZS',
      type: 'cash',
      initialBalance: 500000,
      currentBalance: 500000,
      icon: 'Banknote',
      color: '#10b981',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Savings',
      currency: 'UZS',
      type: 'savings',
      initialBalance: 10000000,
      currentBalance: 10000000,
      icon: 'PiggyBank',
      color: '#f59e0b',
      group: 'savings',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.wallets.bulkAdd(wallets);
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[seed] after bulkAdd wallets, count=', await db.wallets.count());
  }

  // Create default categories
  const categories: Category[] = [
    {
      id: generateId(),
      name: 'Groceries',
      type: 'expense',
      icon: 'ShoppingCart',
      color: '#60A5FA',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Restaurant',
      type: 'expense',
      icon: 'UtensilsCrossed',
      color: '#6366F1',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Transport',
      type: 'expense',
      icon: 'Bus',
      color: '#F59E0B',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Communal',
      type: 'expense',
      icon: 'Zap',
      color: '#10B981',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Credit',
      type: 'expense',
      icon: 'Building2',
      color: '#DC2626',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Salary',
      type: 'income',
      icon: 'DollarSign',
      color: '#10B981',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.categories.bulkAdd(categories);
  const categoryCountCheck = await db.categories.count();
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[seed] after bulkAdd categories, count=', categoryCountCheck);
  }

  // Demo transactions: December 2025 + January 2026
  const mainCardId = wallets[0].id;
  const cashId = wallets[1].id;
  const groceriesId = categories[0].id;
  const restaurantId = categories[1].id;
  const transportId = categories[2].id;
  const communalId = categories[3].id;
  const creditId = categories[4].id;
  const salaryId = categories[5].id;

  const tx = (
    type: 'expense' | 'income',
    amount: number,
    categoryId: string,
    walletId: string,
    date: Date,
    note?: string
  ): Transaction => ({
    id: generateId(),
    type,
    amount,
    currency: 'UZS',
    walletId,
    categoryId,
    note,
    dateTime: date,
    createdAt: now,
    updatedAt: now,
  });

  const dec = (d: number) => new Date(2025, 11, d);
  const jan = (d: number) => new Date(2026, 0, d);

  const transactions: Transaction[] = [
    // December 2025 – income
    tx('income', 8_500_000, salaryId, mainCardId, dec(5), 'Salary December'),
    tx('income', 500_000, salaryId, mainCardId, dec(15), 'Bonus'),
    // December 2025 – expenses
    tx('expense', 1_200_000, communalId, mainCardId, dec(3), 'Utilities'),
    tx('expense', 450_000, groceriesId, mainCardId, dec(4)),
    tx('expense', 320_000, restaurantId, mainCardId, dec(7)),
    tx('expense', 180_000, transportId, mainCardId, dec(8)),
    tx('expense', 2_500_000, creditId, mainCardId, dec(10), 'Loan payment'),
    tx('expense', 380_000, groceriesId, mainCardId, dec(12)),
    tx('expense', 150_000, transportId, mainCardId, dec(14)),
    tx('expense', 275_000, restaurantId, mainCardId, dec(18)),
    tx('expense', 95_000, transportId, cashId, dec(20)),
    tx('expense', 520_000, groceriesId, mainCardId, dec(22)),
    tx('expense', 1_100_000, communalId, mainCardId, dec(25), 'Internet + phone'),
    tx('expense', 410_000, restaurantId, mainCardId, dec(28)),
    // January 2026 – income
    tx('income', 9_000_000, salaryId, mainCardId, jan(5), 'Salary January'),
    tx('income', 200_000, salaryId, cashId, jan(12), 'Freelance'),
    // January 2026 – expenses
    tx('expense', 1_350_000, communalId, mainCardId, jan(2), 'Utilities'),
    tx('expense', 310_000, groceriesId, mainCardId, jan(3)),
    tx('expense', 275_000, transportId, mainCardId, jan(4)),
    tx('expense', 2_800_000, creditId, mainCardId, jan(8), 'Loan payment'),
    tx('expense', 185_000, restaurantId, mainCardId, jan(9)),
    tx('expense', 420_000, groceriesId, mainCardId, jan(11)),
    tx('expense', 165_000, transportId, mainCardId, jan(14)),
    tx('expense', 390_000, restaurantId, mainCardId, jan(16)),
    tx('expense', 548_000, groceriesId, mainCardId, jan(18)),
    tx('expense', 980_000, communalId, mainCardId, jan(20), 'Internet + phone'),
    tx('expense', 220_000, transportId, mainCardId, jan(22)),
    tx('expense', 305_000, restaurantId, mainCardId, jan(25)),
    tx('expense', 412_000, groceriesId, mainCardId, jan(28)),
  ];

  await db.transactions.bulkAdd(transactions);

  // Create sample debts
  const debts: Debt[] = [
    {
      id: generateId(),
      personOrEntityName: 'Split',
      amount: 3324000,
      currency: 'UZS',
      direction: 'I_OWE',
      status: 'open',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      personOrEntityName: 'TBC 1',
      amount: 14792000,
      currency: 'UZS',
      direction: 'I_OWE',
      status: 'open',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      personOrEntityName: 'TBC 2',
      amount: 4312000,
      currency: 'UZS',
      direction: 'I_OWE',
      status: 'open',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      personOrEntityName: 'Work',
      amount: 5000000,
      currency: 'UZS',
      direction: 'IM_OWED',
      status: 'open',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.debts.bulkAdd(debts);
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.log('[seed] Demo data loaded: wallets, categories, transactions, debts');
  }
  return { wallets, categories, transactions, debts };
}

/** Returns seeded data when it ran, so store can set state without reading from DB (avoids chunk/instance mismatch). */
export async function seedDatabase(): Promise<SeededData | null> {
  if (typeof window === 'undefined') return null;
  const db = getDb();
  let existingWallets = 0;
  try {
    existingWallets = await db.wallets.count();
  } catch (e) {
    console.error('[seed] db.wallets.count failed', e);
    throw e;
  }
  if (existingWallets > 0) return null;
  try {
    return await doSeed();
  } catch (err) {
    console.error('[seed] Failed to seed database:', err);
    throw err;
  }
}

/** Clear DB and load demo data. Returns the loaded data so store can set state directly. */
export async function loadDemoData(): Promise<SeededData> {
  if (typeof window === 'undefined') {
    throw new Error('loadDemoData only in browser');
  }
  const db = getDb();
  try {
    await db.wallets.clear();
    await db.categories.clear();
    await db.transactions.clear();
    await db.debts.clear();
    return await doSeed();
  } catch (err) {
    console.error('[seed] loadDemoData failed', err);
    throw err;
  }
}
