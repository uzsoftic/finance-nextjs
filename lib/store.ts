'use client';

import { create } from 'zustand';
import { devtools as zDevtools } from 'zustand/middleware';
import {
  Wallet,
  Transaction,
  Category,
  Debt,
  Subscription,
  SavingsGoal,
  UserPreferences,
} from './models';
import {
  WalletRepository,
  TransactionRepository,
  CategoryRepository,
  DebtRepository,
  SubscriptionRepository,
  UserPreferencesRepository,
  SavingsGoalRepository,
} from './db/repositories';
import { seedDatabase, loadDemoData as seedLoadDemoData } from './db/seed';
import { isOnline, pullFromServer } from './sync/sync';

interface FinanceStore {
  // Wallets
  wallets: Wallet[];
  loadWallets: () => Promise<void>;
  addWallet: (wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWallet: (id: string, data: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  loadTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  loadCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  archiveCategory: (id: string) => Promise<void>;

  // Debts
  debts: Debt[];
  loadDebts: () => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDebt: (id: string, data: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;

  // Subscriptions
  subscriptions: Subscription[];
  loadSubscriptions: () => Promise<void>;
  addSubscription: (
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>;

  // Savings Goals
  savingsGoals: SavingsGoal[];
  loadSavingsGoals: () => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => Promise<void>;

  // User Preferences
  preferences: UserPreferences | null;
  loadPreferences: () => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;

  // Global actions
  initialize: () => Promise<void>;
  loadDemoData: () => Promise<void>;
  isLoading: boolean;
}

const walletRepo = new WalletRepository();
const transactionRepo = new TransactionRepository();
const categoryRepo = new CategoryRepository();
const debtRepo = new DebtRepository();
const subscriptionRepo = new SubscriptionRepository();
const preferencesRepo = new UserPreferencesRepository();
const goalsRepo = new SavingsGoalRepository();

const devtools = typeof window !== 'undefined' ? zDevtools : (fn: any) => fn;

export const useFinanceStore = create<FinanceStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      wallets: [],
      transactions: [],
      categories: [],
      debts: [],
      subscriptions: [],
      savingsGoals: [],
      preferences: null,
      isLoading: false,

      // Wallet methods
      loadWallets: async () => {
        const wallets = await walletRepo.getAll();
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
          console.log('[store] loadWallets:', wallets.length, 'wallets');
        }
        set({ wallets });
      },
      addWallet: async (data) => {
        const wallet = await walletRepo.create(data);
        set((state) => ({ wallets: [...state.wallets, wallet] }));
      },
      updateWallet: async (id, data) => {
        const wallet = await walletRepo.update(id, data);
        if (wallet) {
          set((state) => ({
            wallets: state.wallets.map((w) => (w?.id === id ? wallet : w)),
          }));
        }
      },
      deleteWallet: async (id) => {
        await walletRepo.delete(id);
        set((state) => ({ wallets: state.wallets.filter((w) => w != null && w.id !== id) }));
      },

      // Transaction methods
      loadTransactions: async () => {
        const raw = await transactionRepo.getAll();
        const transactions = raw.filter((t) => t != null && t.dateTime != null);
        set({ transactions });
      },
      addTransaction: async (data) => {
        const transaction = await transactionRepo.create(data);
        const wallet = await walletRepo.getById(data.walletId);
        if (wallet) {
          if (data.type === 'transfer' && data.toWalletId && data.toWalletId !== data.walletId) {
            const toWallet = await walletRepo.getById(data.toWalletId);
            if (toWallet && data.amount > 0) {
              await walletRepo.update(data.walletId, { currentBalance: wallet.currentBalance - data.amount });
              await walletRepo.update(data.toWalletId, { currentBalance: toWallet.currentBalance + data.amount });
            }
          } else if (data.type !== 'transfer') {
            const newBalance =
              data.type === 'income'
                ? wallet.currentBalance + data.amount
                : wallet.currentBalance - data.amount;
            await walletRepo.update(data.walletId, { currentBalance: newBalance });
          }
        }
        await get().loadWallets();
        set((state) => ({ transactions: [...state.transactions, transaction] }));
      },
      updateTransaction: async (id, data) => {
        const oldTransaction = await transactionRepo.getById(id);
        const transaction = await transactionRepo.update(id, data);
        if (transaction && oldTransaction) {
          const wallet = await walletRepo.getById(oldTransaction.walletId);
          if (wallet) {
            let newBalance = wallet.currentBalance;
            if (oldTransaction.type === 'transfer' && oldTransaction.toWalletId) {
              newBalance += oldTransaction.amount;
              const toW = await walletRepo.getById(oldTransaction.toWalletId);
              if (toW) await walletRepo.update(oldTransaction.toWalletId, { currentBalance: toW.currentBalance - oldTransaction.amount });
            } else if (oldTransaction.type === 'income') {
              newBalance -= oldTransaction.amount;
            } else {
              newBalance += oldTransaction.amount;
            }
            if (transaction.type === 'transfer' && transaction.toWalletId) {
              const toWallet = await walletRepo.getById(transaction.toWalletId);
              if (toWallet) {
                await walletRepo.update(transaction.walletId, { currentBalance: newBalance - transaction.amount });
                await walletRepo.update(transaction.toWalletId, { currentBalance: toWallet.currentBalance + transaction.amount });
              }
            } else {
              if (transaction.type === 'income') newBalance += transaction.amount;
              else newBalance -= transaction.amount;
              await walletRepo.update(oldTransaction.walletId, { currentBalance: newBalance });
            }
          }
          set((state) => ({ transactions: state.transactions.map((t) => (t?.id === id ? transaction : t)) }));
          await get().loadWallets();
        }
      },
      deleteTransaction: async (id) => {
        const transaction = await transactionRepo.getById(id);
        if (transaction) {
          const wallet = await walletRepo.getById(transaction.walletId);
          if (wallet) {
            if (transaction.type === 'transfer' && transaction.toWalletId) {
              const toW = await walletRepo.getById(transaction.toWalletId);
              if (toW) {
                await walletRepo.update(transaction.walletId, { currentBalance: wallet.currentBalance + transaction.amount });
                await walletRepo.update(transaction.toWalletId, { currentBalance: toW.currentBalance - transaction.amount });
              }
            } else {
              const newBalance =
                transaction.type === 'income'
                  ? wallet.currentBalance - transaction.amount
                  : wallet.currentBalance + transaction.amount;
              await walletRepo.update(transaction.walletId, { currentBalance: newBalance });
            }
            await get().loadWallets();
          }
        }
        await transactionRepo.delete(id);
        set((state) => ({ transactions: state.transactions.filter((t) => t != null && t.id !== id) }));
      },

      // Category methods
      loadCategories: async () => {
        await categoryRepo.initializeDefaults();
        const categories = await categoryRepo.getAll();
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
          console.log('[store] loadCategories:', categories.length, 'categories');
        }
        set({ categories });
      },
      addCategory: async (data) => {
        const category = await categoryRepo.create(data);
        set((state) => ({ categories: [...state.categories, category] }));
      },
      updateCategory: async (id, data) => {
        const category = await categoryRepo.update(id, data);
        if (category) {
          set((state) => ({
            categories: state.categories.map((c) => (c?.id === id ? category : c)),
          }));
        }
      },
      archiveCategory: async (id) => {
        const category = await categoryRepo.archive(id);
        if (category) {
          set((state) => ({
            categories: state.categories.filter((c) => c != null && c.id !== id),
          }));
        }
      },

      // Debt methods
      loadDebts: async () => {
        const debts = await debtRepo.getAll();
        set({ debts });
      },
      addDebt: async (data) => {
        const debt = await debtRepo.create(data);
        set((state) => ({ debts: [...state.debts, debt] }));
      },
      updateDebt: async (id, data) => {
        const debt = await debtRepo.update(id, data);
        if (debt) {
          set((state) => ({
            debts: state.debts.map((d) => (d?.id === id ? debt : d)),
          }));
        }
      },
      deleteDebt: async (id) => {
        await debtRepo.delete(id);
        set((state) => ({ debts: state.debts.filter((d) => d != null && d.id !== id) }));
      },

      // Subscription methods
      loadSubscriptions: async () => {
        const subscriptions = await subscriptionRepo.getAll();
        set({ subscriptions });
      },
      addSubscription: async (data) => {
        const subscription = await subscriptionRepo.create(data);
        set((state) => ({ subscriptions: [...state.subscriptions, subscription] }));
      },
      updateSubscription: async (id, data) => {
        const subscription = await subscriptionRepo.update(id, data);
        if (subscription) {
          set((state) => ({
            subscriptions: state.subscriptions.map((s) => (s?.id === id ? subscription : s)),
          }));
        }
      },

      // Savings Goals methods
      loadSavingsGoals: async () => {
        const savingsGoals = await goalsRepo.getAll();
        set({ savingsGoals });
      },
      addSavingsGoal: async (data) => {
        const goal = await goalsRepo.create(data);
        set((state) => ({ savingsGoals: [...state.savingsGoals, goal] }));
      },
      updateSavingsGoal: async (id, data) => {
        const goal = await goalsRepo.update(id, data);
        if (goal) {
          set((state) => ({
            savingsGoals: state.savingsGoals.map((g) => (g?.id === id ? goal : g)),
          }));
        }
      },

      // Preferences methods
      loadPreferences: async () => {
        const prefs = await preferencesRepo.get();
        set({ preferences: prefs || null });
      },
      updatePreferences: async (data) => {
        const prefs = await preferencesRepo.update(data);
        set({ preferences: prefs });
      },

      // Initialize: local DB first (offline-first). When online, sync from API then reload from DB.
      initialize: async () => {
        if (typeof window === 'undefined') return;
        set({ isLoading: true });
        try {
          const seeded = await seedDatabase();
          if (seeded) {
            set({
              wallets: seeded.wallets,
              categories: seeded.categories,
              transactions: seeded.transactions.filter((t) => t != null && t.dateTime != null),
              debts: seeded.debts,
            });
            await Promise.all([
              get().loadSubscriptions(),
              get().loadSavingsGoals(),
              get().loadPreferences(),
            ]);
          } else {
            await Promise.all([
              get().loadWallets(),
              get().loadTransactions(),
              get().loadCategories(),
              get().loadDebts(),
              get().loadSubscriptions(),
              get().loadSavingsGoals(),
              get().loadPreferences(),
            ]);
          }
          // Onlaynda API dan sync qilib local DB ni yangilaymiz
          if (isOnline()) {
            try {
              const synced = await pullFromServer();
              if (synced) {
                await Promise.all([
                  get().loadWallets(),
                  get().loadTransactions(),
                  get().loadCategories(),
                  get().loadDebts(),
                ]);
              }
            } catch (_) {
              // Sync xato bo‘lsa ham lokal ma’lumot bilan ishlashda davom etamiz
            }
          }
        } catch (err) {
          console.error('[FinanceStore] initialize failed:', err);
        } finally {
          set({ isLoading: false });
        }
      },
      loadDemoData: async () => {
        if (typeof window === 'undefined') return;
        set({ isLoading: true });
        try {
          const data = await seedLoadDemoData();
          set({
            wallets: data.wallets,
            categories: data.categories,
            transactions: data.transactions.filter((t) => t != null && t.dateTime != null),
            debts: data.debts,
          });
          await Promise.all([
            get().loadSubscriptions(),
            get().loadSavingsGoals(),
            get().loadPreferences(),
          ]);
        } catch (err) {
          console.error('[FinanceStore] loadDemoData failed:', err);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: 'FinanceStore' }
  )
);
