'use client';

import React from "react"
import { Tag, ShoppingCart, UtensilsCrossed, Bus, Zap, Building2, DollarSign, CreditCard, Banknote, PiggyBank, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { isToday, isYesterday } from 'date-fns';
import { useFinanceStore } from '@/lib/store';
import {
  formatCurrency,
  getMonthStartEnd,
  getAmountColor,
  getAmountPrefix,
} from '@/lib/utils/formatting';
import { MonthPicker } from '@/components/ui/month-picker';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/lib/models';
import { AddTransactionScreen } from '@/components/tabs/categories-tab';

function formatDayHeader(date: Date): { dateLine: string; dayLine: string } {
  const dateLine = format(date, 'd MMMM yyyy');
  const dayLine = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'EEEE');
  return { dateLine, dayLine };
}

interface TransactionsTabProps {
  createTransactionOpen?: boolean;
  onCloseCreateTransaction?: () => void;
}

export default function TransactionsTab({ createTransactionOpen = false, onCloseCreateTransaction }: TransactionsTabProps = {}) {
  const { transactions, categories, wallets, updateTransaction, addTransaction } = useFinanceStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const { start, end } = getMonthStartEnd(currentMonth);
  const baseCurrency = wallets[0]?.currency || 'UZS';

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.forEach((t) => {
      if (!t?.dateTime || t.type !== 'expense' || !t.categoryId) return;
      const tDate = new Date(t.dateTime);
      if (tDate < start || tDate > end) return;
      data[t.categoryId] = (data[t.categoryId] || 0) + t.amount;
    });
    return data;
  }, [transactions, start, end]);

  const incomeByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.forEach((t) => {
      if (!t?.dateTime || t.type !== 'income' || !t.categoryId) return;
      const tDate = new Date(t.dateTime);
      if (tDate < start || tDate > end) return;
      data[t.categoryId] = (data[t.categoryId] || 0) + t.amount;
    });
    return data;
  }, [transactions, start, end]);

  const lastUsedWalletIds = useMemo(() => {
    const byType: { expense: string | null; income: string | null } = { expense: null, income: null };
    const sorted = [...transactions].filter((t) => t.type === 'expense' || t.type === 'income').sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
    for (const t of sorted) {
      if (t.type === 'expense' && byType.expense == null) byType.expense = t.walletId;
      if (t.type === 'income' && byType.income == null) byType.income = t.walletId;
      if (byType.expense != null && byType.income != null) break;
    }
    return byType;
  }, [transactions]);

  // Filter and group transactions
  const groupedTransactions = useMemo(() => {
    const filtered = transactions.filter((t) => {
      if (!t?.dateTime) return false;
      const tDate = new Date(t.dateTime);
      const isInMonth = tDate >= start && tDate <= end;
      if (!isInMonth) return false;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const category = categories.find((c) => c.id === t.categoryId);
        const wallet = wallets.find((w) => w.id === t.walletId);
        
        return (
          (category?.name || '').toLowerCase().includes(query) ||
          (wallet?.name || '').toLowerCase().includes(query) ||
          (t.note || '').toLowerCase().includes(query)
        );
      }
      return true;
    });

    const grouped: Record<string, typeof transactions> = {};
    filtered.forEach((t) => {
      if (!t?.dateTime) return;
      const dateStr = new Date(t.dateTime).toDateString();
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(t);
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([dateStr, items]) => {
        const date = new Date(dateStr);
        const sorted = items.sort((a, b) => new Date(b?.dateTime ?? 0).getTime() - new Date(a?.dateTime ?? 0).getTime());
        let dailyIncome = 0;
        let dailyExpense = 0;
        sorted.forEach((t) => {
          if (t.type === 'income') dailyIncome += t.amount;
          else if (t.type === 'expense') dailyExpense += t.amount;
        });
        const dailyTotal = dailyIncome - dailyExpense;
        return {
          date,
          items: sorted,
          dailyIncome,
          dailyExpense,
          dailyTotal,
          currency: baseCurrency,
        };
      });
  }, [transactions, start, end, searchQuery, categories, wallets]);

  const getIcon = (iconName?: string) => {
    const iconMap: Record<string, any> = {
      Tag,
      ShoppingCart,
      UtensilsCrossed,
      Bus,
      Zap,
      Building2,
      DollarSign,
      CreditCard,
      Banknote,
      PiggyBank,
    };
    return iconMap[iconName || 'Tag'] || Tag;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Oy tanlash tepada, keyin Search */}
      <div className="bg-card border-b border-border px-3 py-2 space-y-2 sticky top-0 z-10">
        <MonthPicker value={currentMonth} onChange={setCurrentMonth} className="w-full" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-3 py-3">
        {/* Transactions List */}
        {groupedTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No transactions yet</p>
        ) : (
          groupedTransactions.map(({ date, items, dailyTotal, currency }) => {
            const { dateLine, dayLine } = formatDayHeader(date);
            return (
              <div key={date.toISOString()} className="mb-5">
                {/* Bir qator: chapda sana + hafta kuni, o‘ngda kunlik umumiy soft badge */}
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-foreground">{dateLine}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">· {dayLine}</span>
                  </div>
                  <div
                    className={`
                      shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs
                      ${dailyTotal > 0 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : dailyTotal < 0 ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' : 'bg-muted/60 text-muted-foreground'}
                    `}
                  >
                    <span className="font-medium">Kunlik umumiy</span>
                    <span className="font-bold tabular-nums">
                      {dailyTotal > 0 ? '+' : ''}{formatCurrency(dailyTotal, currency)}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {items.map((transaction) => {
                    const wallet = wallets.find((w) => w.id === transaction.walletId);
                    const category = categories.find((c) => c.id === transaction.categoryId);
                    const CategoryIcon = getIcon(category?.icon);
                    const subtitle = transaction.note ? transaction.note : (wallet?.name || '');
                    const lineText = [category?.name || 'Other', subtitle].filter(Boolean).join(' · ') || '—';

                    return (
                      <button
                        key={transaction.id}
                        type="button"
                        onClick={() => {
                          setTransactionToEdit(transaction);
                          setEditSheetOpen(true);
                        }}
                        className="w-full flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-muted/50 transition min-h-0 text-left"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: category?.color || '#666' }}
                        >
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate text-foreground">{lineText}</p>
                        </div>
                        <div className={`flex-shrink-0 font-semibold text-sm tabular-nums ${getAmountColor(transaction.type)}`}>
                          {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </main>

      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          {transactionToEdit && (
            <EditTransactionForm
              transaction={transactionToEdit}
              wallets={wallets}
              categories={categories}
              onSave={async (data) => {
                await updateTransaction(transactionToEdit.id, data);
                setEditSheetOpen(false);
                setTransactionToEdit(null);
              }}
              onClose={() => {
                setEditSheetOpen(false);
                setTransactionToEdit(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create transaction – Categories dagi kabi to‘liq ekran, kategoriya tanlanmagan */}
      {createTransactionOpen && (
        <AddTransactionScreen
          category={undefined}
          type="expense"
          wallets={wallets}
          baseCurrency={baseCurrency}
          lastUsedWalletIds={lastUsedWalletIds}
          expenseCategories={categories.filter((c) => c != null && (c.type === 'expense' || c.type === 'both'))}
          incomeCategories={categories.filter((c) => c != null && (c.type === 'income' || c.type === 'both'))}
          expenseCategoryAmounts={expenseByCategory}
          incomeCategoryAmounts={incomeByCategory}
          onClose={() => onCloseCreateTransaction?.()}
          onSuccess={async (payload) => {
            await addTransaction(payload);
            onCloseCreateTransaction?.();
          }}
        />
      )}
    </div>
  );
}

function EditTransactionForm({
  transaction,
  wallets,
  categories,
  onSave,
  onClose,
}: {
  transaction: Transaction;
  wallets: { id: string; name: string; currency: string }[];
  categories: { id: string; name: string; type: string }[];
  onSave: (data: Partial<Transaction>) => Promise<void>;
  onClose: () => void;
}) {
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(transaction.amount);
  const [walletId, setWalletId] = useState(transaction.walletId);
  const [categoryId, setCategoryId] = useState(transaction.categoryId || '');
  const [note, setNote] = useState(transaction.note || '');
  const [dateTime, setDateTime] = useState(new Date(transaction.dateTime));

  const filteredCategories = type === 'income'
    ? categories.filter((c) => c.type === 'income' || c.type === 'both')
    : type === 'expense'
      ? categories.filter((c) => c.type === 'expense' || c.type === 'both')
      : categories;

  return (
    <div className="p-4 pb-8">
      <SheetHeader>
        <SheetTitle>Edit transaction</SheetTitle>
      </SheetHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({
            type,
            amount,
            walletId,
            categoryId: categoryId || undefined,
            note: note || undefined,
            dateTime: new Date(dateTime),
          });
        }}
        className="space-y-4 mt-4"
      >
        <div>
          <Label className="text-sm">Type</Label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'expense' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}>Expense</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>Income</button>
          </div>
        </div>
        <div>
          <Label className="text-sm">Amount</Label>
          <Input type="number" value={amount || ''} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="mt-1" required />
        </div>
        <div>
          <Label className="text-sm">Wallet</Label>
          <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1" required>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-sm">Category</Label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1">
            <option value="">—</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-sm">Date & time</Label>
          <Input
            type="datetime-local"
            value={new Date(dateTime).toISOString().slice(0, 16)}
            onChange={(e) => setDateTime(new Date(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm">Note</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="mt-1" />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1">Save</Button>
        </div>
      </form>
    </div>
  );
}
