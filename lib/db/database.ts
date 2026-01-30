import Dexie, { Table } from 'dexie';
import {
  UserPreferences,
  Wallet,
  Transaction,
  Category,
  Debt,
  Subscription,
  SavingsGoal,
  SyncQueueItem,
} from '../models';

export class FinanceDB extends Dexie {
  userPreferences!: Table<UserPreferences>;
  wallets!: Table<Wallet>;
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  debts!: Table<Debt>;
  subscriptions!: Table<Subscription>;
  savingsGoals!: Table<SavingsGoal>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('FinanceDB');
    this.version(1).stores({
      userPreferences: 'id',
      wallets: 'id, active, group, currency',
      transactions: 'id, walletId, categoryId, dateTime',
      categories: 'id, archived, type',
      debts: 'id, direction, status, currency',
      subscriptions: 'id, walletId, active',
      savingsGoals: 'id, currency',
      syncQueue: 'id, entityType, status, entityId',
    });
  }
}

function createDb(): FinanceDB {
  const d = new FinanceDB();
  // Hook to convert Date objects to timestamps for storage
  d.transactions.hook('creating', (primKey, obj) => {
    if (obj == null) return;
    if (obj.dateTime instanceof Date) {
      obj.dateTime = obj.dateTime.getTime();
    }
    if (obj.createdAt instanceof Date) {
      obj.createdAt = obj.createdAt.getTime();
    }
    if (obj.updatedAt instanceof Date) {
      obj.updatedAt = obj.updatedAt.getTime();
    }
  });
  d.transactions.hook('updating', (mods) => {
    if (mods == null) return;
    if (mods.dateTime instanceof Date) {
      mods.dateTime = mods.dateTime.getTime();
    }
    if (mods.updatedAt instanceof Date) {
      mods.updatedAt = mods.updatedAt.getTime();
    }
  });
  d.wallets.hook('creating', (primKey, obj) => {
    if (obj == null) return;
    if (obj.createdAt instanceof Date) obj.createdAt = obj.createdAt.getTime();
    if (obj.updatedAt instanceof Date) obj.updatedAt = obj.updatedAt.getTime();
  });
  d.wallets.hook('updating', (mods) => {
    if (mods == null) return;
    if (mods.updatedAt instanceof Date) mods.updatedAt = mods.updatedAt.getTime();
  });
  d.categories.hook('creating', (primKey, obj) => {
    if (obj == null) return;
    if (obj.createdAt instanceof Date) obj.createdAt = obj.createdAt.getTime();
    if (obj.updatedAt instanceof Date) obj.updatedAt = obj.updatedAt.getTime();
  });
  d.categories.hook('updating', (mods) => {
    if (mods == null) return;
    if (mods.updatedAt instanceof Date) mods.updatedAt = mods.updatedAt.getTime();
  });
  d.debts.hook('creating', (primKey, obj) => {
    if (obj == null) return;
    if (obj.dueDate instanceof Date) obj.dueDate = obj.dueDate.getTime();
    if (obj.createdAt instanceof Date) obj.createdAt = obj.createdAt.getTime();
    if (obj.updatedAt instanceof Date) obj.updatedAt = obj.updatedAt.getTime();
  });
  d.debts.hook('updating', (mods) => {
    if (mods == null) return;
    if (mods.dueDate instanceof Date) mods.dueDate = mods.dueDate.getTime();
    if (mods.updatedAt instanceof Date) mods.updatedAt = mods.updatedAt.getTime();
  });
  const convertTimestampsToDate = (obj: any) => {
    if (obj == null) return;
    if (typeof obj.dateTime === 'number') obj.dateTime = new Date(obj.dateTime);
    if (typeof obj.dueDate === 'number') obj.dueDate = new Date(obj.dueDate);
    if (typeof obj.createdAt === 'number') obj.createdAt = new Date(obj.createdAt);
    if (typeof obj.updatedAt === 'number') obj.updatedAt = new Date(obj.updatedAt);
  };
  d.transactions.hook('reading', convertTimestampsToDate);
  d.wallets.hook('reading', convertTimestampsToDate);
  d.categories.hook('reading', convertTimestampsToDate);
  d.debts.hook('reading', convertTimestampsToDate);
  d.subscriptions.hook('reading', convertTimestampsToDate);
  d.savingsGoals.hook('reading', convertTimestampsToDate);
  d.userPreferences.hook('reading', convertTimestampsToDate);
  return d;
}

const DB_KEY = '__FINANCE_DB_SINGLETON__';

/** Always use getDb() at runtime so seed and repositories share the same instance. Stored on window to survive chunk boundaries. */
export function getDb(): FinanceDB {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB only in browser');
  }
  const win = window as Window & { [key: string]: unknown };
  if (!win[DB_KEY]) {
    win[DB_KEY] = createDb();
  }
  return win[DB_KEY] as FinanceDB;
}

export const db =
  typeof window !== 'undefined' ? getDb() : (null as unknown as FinanceDB);
