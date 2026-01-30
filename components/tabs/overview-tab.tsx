'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import {
  formatCurrency,
  getMonthStartEnd,
  calculatePercentage,
} from '@/lib/utils/formatting';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonthPicker } from '@/components/ui/month-picker';

export default function OverviewTab() {
  const { transactions, categories, wallets } = useFinanceStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const baseCurrency = wallets[0]?.currency || 'UZS';
  const { start, end } = getMonthStartEnd(currentMonth);

  // Filter transactions for current month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t?.dateTime) return false;
      const tDate = new Date(t.dateTime);
      return tDate >= start && tDate <= end;
    });
  }, [transactions, start, end]);

  // Calculate totals
  const totals = useMemo(() => {
    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    return { expense, income };
  }, [monthTransactions]);

  // Group transactions by category
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (t.categoryId) {
          breakdown[t.categoryId] = (breakdown[t.categoryId] || 0) + t.amount;
        }
      });

    return Object.entries(breakdown)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          categoryId,
          name: category?.name || 'Other',
          amount,
          icon: category?.icon,
          color: category?.color,
          percentage: calculatePercentage(amount, totals.expense),
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, categories, totals.expense]);

  // Daily breakdown for chart
  const dailyData = useMemo(() => {
    const daily: Record<string, { date: string; income: number; expense: number }> = {};
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      daily[dateKey] = { date: dateKey, income: 0, expense: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    monthTransactions.forEach((t) => {
      if (!t?.dateTime) return;
      const dateKey = new Date(t.dateTime).toISOString().split('T')[0];
      if (t.type === 'income') {
        daily[dateKey].income += t.amount;
      } else if (t.type === 'expense') {
        daily[dateKey].expense += t.amount;
      }
    });

    return Object.values(daily).map((d) => ({
      ...d,
      date: new Date(d.date).getDate().toString(),
    }));
  }, [monthTransactions, start, end]);

  // Calculate metrics
  const dayAverage =
    monthTransactions.length > 0
      ? totals.expense / new Set(monthTransactions.filter((t) => t?.dateTime).map((t) => new Date(t.dateTime).toDateString())).size
      : 0;

  const todaySpend = monthTransactions
    .filter((t) => {
      if (!t?.dateTime) return false;
      const tDate = new Date(t.dateTime);
      const today = new Date();
      return (
        tDate.toDateString() === today.toDateString() && t.type === 'expense'
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const weekStart = new Date(currentMonth);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekSpend = monthTransactions
    .filter((t) => {
      if (!t?.dateTime) return false;
      const tDate = new Date(t.dateTime);
      return tDate >= weekStart && tDate <= weekEnd && t.type === 'expense';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-card border-b border-[#e5e7eb] dark:border-[#374151] p-3 sticky top-0 z-10">
        <MonthPicker value={currentMonth} onChange={setCurrentMonth} />
      </div>
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">

      {/* Balance Card */}
        <Card className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-4">
        <div className="text-muted-foreground text-sm mb-1">Balance</div>
        <div className="text-3xl font-bold text-emerald-400">
          {formatCurrency(totals.income - totals.expense, baseCurrency)}
        </div>
      </Card>

      {/* Income/Expense Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-pink-500/20 border border-pink-500/50 p-4">
          <div className="text-muted-foreground text-sm mb-1">Expenses</div>
          <div className="text-xl font-bold text-pink-400">
            {formatCurrency(totals.expense, baseCurrency)}
          </div>
        </Card>
        <Card className="bg-emerald-500/20 border border-emerald-500/50 p-4">
          <div className="text-muted-foreground text-sm mb-1">Income</div>
          <div className="text-xl font-bold text-emerald-400">
            {formatCurrency(totals.income, baseCurrency)}
          </div>
        </Card>
      </div>

      {/* Daily Chart */}
      {dailyData.length > 0 && (
      <Card className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #333' }}
                formatter={(value: number) => formatCurrency(value, baseCurrency)}
              />
              <Bar dataKey="expense" fill="#f472b6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Day (avg.)</div>
          <div className="text-sm font-bold">{formatCurrency(dayAverage, baseCurrency)}</div>
        </Card>
        <Card className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Today</div>
          <div className="text-sm font-bold">{formatCurrency(todaySpend, baseCurrency)}</div>
        </Card>
        <Card className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Week</div>
          <div className="text-sm font-bold">{formatCurrency(weekSpend, baseCurrency)}</div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Category Breakdown</h3>
        {categoryBreakdown.map((cat) => (
          <div key={cat.categoryId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cat.name}</span>
              <span className="font-medium">{cat.percentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color || '#3b82f6',
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">{formatCurrency(cat.amount, baseCurrency)}</div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
