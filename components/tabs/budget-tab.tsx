'use client';

import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatCurrency, getMonthStartEnd, calculatePercentage } from '@/lib/utils/formatting';
import { Card } from '@/components/ui/card';
import { MonthPicker } from '@/components/ui/month-picker';

export default function BudgetTab() {
  const { transactions, categories, wallets, savingsGoals } = useFinanceStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const baseCurrency = wallets[0]?.currency || 'UZS';
  const { start, end } = getMonthStartEnd(currentMonth);

  // Filter current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t?.dateTime) return false;
      const tDate = new Date(t.dateTime);
      return tDate >= start && tDate <= end;
    });
  }, [transactions, start, end]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense };
  }, [monthTransactions]);

  // Goals progress
  const goalsData = useMemo(() => {
    return savingsGoals.map((goal) => ({
      ...goal,
      progress: calculatePercentage(goal.currentAmount, goal.targetAmount),
    }));
  }, [savingsGoals]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-card border-b border-[#e5e7eb] dark:border-[#374151] p-3 sticky top-0 z-10">
        <MonthPicker value={currentMonth} onChange={setCurrentMonth} />
      </div>
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
      {/* Month Summary */}
      <Card className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-4 space-y-3">
        <h2 className="text-lg font-semibold">Month Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-pink-500/20 border border-pink-500/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Expenses</p>
            <p className="text-xl font-bold text-pink-400">
              {formatCurrency(totals.expense, baseCurrency)}
            </p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Income</p>
            <p className="text-xl font-bold text-emerald-400">
              {formatCurrency(totals.income, baseCurrency)}
            </p>
          </div>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p className={`text-xl font-bold ${totals.income >= totals.expense ? 'text-emerald-400' : 'text-pink-400'}`}>
            {formatCurrency(totals.income - totals.expense, baseCurrency)}
          </p>
        </div>
      </Card>

      {/* Savings Goals */}
      {goalsData.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Savings Goals</h2>
          <div className="space-y-4">
            {goalsData.map((goal) => (
              <Card key={goal.id} className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{goal.name}</h3>
                  <span className="text-xs text-muted-foreground">{goal.progress.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.currentAmount, goal.currency)}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.targetAmount, goal.currency)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Wallets Summary */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Wallets</h2>
        <div className="space-y-2">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-3 flex items-center justify-between">
              <span className="text-sm">{wallet.name}</span>
              <span className="font-semibold">{formatCurrency(wallet.currentBalance, wallet.currency)}</span>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
