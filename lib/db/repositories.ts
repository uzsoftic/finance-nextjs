import { getDb } from './database';
import {
  Wallet,
  Transaction,
  Category,
  Debt,
  Subscription,
  SavingsGoal,
  UserPreferences,
  DEFAULT_CATEGORIES,
} from '../models';

// Helper to generate IDs (for browser environment)
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class WalletRepository {
  async create(data: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wallet> {
    const db = getDb();
    const wallet: Wallet = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await getDb().wallets.add(wallet);
    return wallet;
  }

  async getAll(): Promise<Wallet[]> {
    const db = getDb();
    const all = await getDb().wallets.toArray();
    return all.filter((w) => w != null && w.active === true);
  }

  async getById(id: string): Promise<Wallet | undefined> {
    return getDb().wallets.get(id);
  }

  async update(id: string, data: Partial<Wallet>): Promise<Wallet | undefined> {
    const db = getDb();
    const wallet = await getDb().wallets.get(id);
    if (!wallet) return undefined;
    const updated = { ...wallet, ...data, updatedAt: new Date() };
    await getDb().wallets.put(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const wallet = await getDb().wallets.get(id);
    if (!wallet) return false;
    await getDb().wallets.put({ ...wallet, active: false, updatedAt: new Date() });
    return true;
  }

  async getTotalBalance(): Promise<Record<string, number>> {
    const wallets = await this.getAll();
    const totals: Record<string, number> = {};
    wallets.forEach((w) => {
      totals[w.currency] = (totals[w.currency] || 0) + w.currentBalance;
    });
    return totals;
  }
}

export class TransactionRepository {
  async create(
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    const db = getDb();
    const transaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await getDb().transactions.add(transaction);
    return transaction;
  }

  async getAll(): Promise<Transaction[]> {
    const db = getDb();
    const raw = await getDb().transactions.toArray();
    return raw.filter((t) => t != null && t.dateTime != null);
  }

  async getById(id: string): Promise<Transaction | undefined> {
    return getDb().transactions.get(id);
  }

  async getByWallet(walletId: string): Promise<Transaction[]> {
    return getDb().transactions.where('walletId').equals(walletId).toArray();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return getDb()
      .transactions.where('dateTime')
      .between(startDate, endDate)
      .toArray();
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = await getDb().transactions.get(id);
    if (!transaction) return undefined;
    const updated = { ...transaction, ...data, updatedAt: new Date() };
    await getDb().transactions.put(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const transaction = await getDb().transactions.get(id);
    if (!transaction) return false;
    await getDb().transactions.delete(id);
    return true;
  }

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    return getDb().transactions.where('categoryId').equals(categoryId).toArray();
  }
}

export class CategoryRepository {
  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const category: Category = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await getDb().categories.add(category);
    return category;
  }

  async getAll(): Promise<Category[]> {
    // IndexedDB does not accept boolean as index key; filter in memory
    const all = await getDb().categories.toArray();
    return all.filter((c) => c != null && c.archived === false);
  }

  async getById(id: string): Promise<Category | undefined> {
    return getDb().categories.get(id);
  }

  async update(id: string, data: Partial<Category>): Promise<Category | undefined> {
    const category = await getDb().categories.get(id);
    if (!category) return undefined;
    const updated = { ...category, ...data, updatedAt: new Date() };
    await getDb().categories.put(updated);
    return updated;
  }

  async archive(id: string): Promise<Category | undefined> {
    return this.update(id, { archived: true });
  }

  async initializeDefaults(): Promise<void> {
    const count = await getDb().categories.count();
    if (count === 0) {
      const defaultCategories = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await getDb().categories.bulkAdd(defaultCategories);
    }
  }
}

export class DebtRepository {
  async create(data: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Debt> {
    const debt: Debt = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await getDb().debts.add(debt);
    return debt;
  }

  async getAll(): Promise<Debt[]> {
    return getDb().debts.toArray();
  }

  async getById(id: string): Promise<Debt | undefined> {
    return getDb().debts.get(id);
  }

  async getByDirection(direction: 'I_OWE' | 'IM_OWED'): Promise<Debt[]> {
    return getDb().debts.where('direction').equals(direction).toArray();
  }

  async update(id: string, data: Partial<Debt>): Promise<Debt | undefined> {
    const debt = await getDb().debts.get(id);
    if (!debt) return undefined;
    const updated = { ...debt, ...data, updatedAt: new Date() };
    await getDb().debts.put(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const debt = await getDb().debts.get(id);
    if (!debt) return false;
    await getDb().debts.delete(id);
    return true;
  }
}

export class SubscriptionRepository {
  async create(
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Subscription> {
    const subscription: Subscription = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await getDb().subscriptions.add(subscription);
    return subscription;
  }

  async getAll(): Promise<Subscription[]> {
    // IndexedDB does not accept boolean as index key; filter in memory
    const all = await getDb().subscriptions.toArray();
    return all.filter((s) => s != null && s.active === true);
  }

  async getById(id: string): Promise<Subscription | undefined> {
    return getDb().subscriptions.get(id);
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = await getDb().subscriptions.get(id);
    if (!subscription) return undefined;
    const updated = { ...subscription, ...data, updatedAt: new Date() };
    await getDb().subscriptions.put(updated);
    return updated;
  }

  async getDueForToday(): Promise<Subscription[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const list = await getDb().subscriptions
      .where('nextRunAt')
      .between(today, tomorrow)
      .toArray();
    return list.filter((s) => s != null && s.active === true);
  }
}

export class UserPreferencesRepository {
  async create(
    data: Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserPreferences> {
    const prefs: UserPreferences = {
      ...data,
      id: 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await getDb().userPreferences.put(prefs);
    return prefs;
  }

  async get(): Promise<UserPreferences | undefined> {
    return getDb().userPreferences.get('default');
  }

  async update(data: Partial<UserPreferences>): Promise<UserPreferences | undefined> {
    const prefs = await this.get();
    if (!prefs) return undefined;
    const updated = { ...prefs, ...data, updatedAt: new Date() };
    await getDb().userPreferences.put(updated);
    return updated;
  }
}

export class SavingsGoalRepository {
  async create(
    data: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SavingsGoal> {
    const goal: SavingsGoal = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await getDb().savingsGoals.add(goal);
    return goal;
  }

  async getAll(): Promise<SavingsGoal[]> {
    return getDb().savingsGoals.toArray();
  }

  async getById(id: string): Promise<SavingsGoal | undefined> {
    return getDb().savingsGoals.get(id);
  }

  async update(id: string, data: Partial<SavingsGoal>): Promise<SavingsGoal | undefined> {
    const goal = await getDb().savingsGoals.get(id);
    if (!goal) return undefined;
    const updated = { ...goal, ...data, updatedAt: new Date() };
    await getDb().savingsGoals.put(updated);
    return updated;
  }
}
