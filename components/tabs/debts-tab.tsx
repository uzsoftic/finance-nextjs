'use client';

import React from "react"

import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils/formatting';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DebtsTab() {
  const { debts, addDebt, updateDebt } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    personOrEntityName: '',
    amount: 0,
    currency: 'UZS',
    direction: 'I_OWE' as const,
    note: '',
    status: 'open' as const,
  });

  // Separate into owe and owed
  const { owedByMe, owedToMe } = useMemo(() => {
    const owedByMe = debts.filter((d) => d != null && d.direction === 'I_OWE');
    const owedToMe = debts.filter((d) => d != null && d.direction === 'IM_OWED');
    return { owedByMe, owedToMe };
  }, [debts]);

  // Calculate totals
  const totals = useMemo(() => {
    const iOwe = owedByMe.reduce((sum, d) => sum + d.amount, 0);
    const imOwed = owedToMe.reduce((sum, d) => sum + d.amount, 0);
    return { iOwe, imOwed };
  }, [owedByMe, owedToMe]);

  const baseCurrency = 'UZS';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Default 30 days from now
    
    await addDebt({
      ...formData,
      dueDate,
    });
    
    setFormData({
      personOrEntityName: '',
      amount: 0,
      currency: 'UZS',
      direction: 'I_OWE',
      note: '',
      status: 'open',
    });
    setShowForm(false);
  };

  const handleStatusChange = async (debtId: string, newStatus: any) => {
    await updateDebt(debtId, { status: newStatus });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header with totals */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Debts</h2>
        <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Totals Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-pink-500/20 border-pink-500/50 p-4">
          <p className="text-xs text-muted-foreground mb-1">I Owe</p>
          <p className="text-xl font-bold text-pink-400">
            {'-'}
            {formatCurrency(totals.iOwe, baseCurrency)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{owedByMe.length} debts</p>
        </Card>
        <Card className="bg-emerald-500/20 border-emerald-500/50 p-4">
          <p className="text-xs text-muted-foreground mb-1">I Am Owed</p>
          <p className="text-xl font-bold text-emerald-400">
            {'+'}
            {formatCurrency(totals.imOwed, baseCurrency)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{owedToMe.length} debts</p>
        </Card>
      </div>

      {/* Add Debt Form */}
      {showForm && (
        <Card className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-4 space-y-3">
          <h3 className="font-semibold">New Debt</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Person or entity name"
              value={formData.personOrEntityName}
              onChange={(e) => setFormData({ ...formData, personOrEntityName: e.target.value })}
              className="w-full bg-muted border border-[#e5e7eb] dark:border-[#374151] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-muted border border-[#e5e7eb] dark:border-[#374151] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <select
              value={formData.direction}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value as any })}
              className="w-full bg-muted border border-[#e5e7eb] dark:border-[#374151] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="I_OWE">I Owe</option>
              <option value="IM_OWED">I Am Owed</option>
            </select>
            <input
              type="text"
              placeholder="Note (optional)"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-muted border border-[#e5e7eb] dark:border-[#374151] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* I Owe Section */}
      {owedByMe.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-pink-400">I Owe</h3>
          <div className="space-y-2">
            {owedByMe.map((debt) => (
              <Card
                key={debt.id}
                className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-4 hover:bg-muted transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{debt.personOrEntityName}</h4>
                    {debt.note && <p className="text-sm text-muted-foreground">{debt.note}</p>}
                  </div>
                  <p className="font-bold text-pink-400">-{formatCurrency(debt.amount, debt.currency)}</p>
                </div>
                <select
                  value={debt.status}
                  onChange={(e) => handleStatusChange(debt.id, e.target.value)}
                  className="w-full bg-muted border border-[#e5e7eb] dark:border-[#374151] rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="open">Open</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* I Am Owed Section */}
      {owedToMe.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-emerald-400">I Am Owed</h3>
          <div className="space-y-2">
            {owedToMe.map((debt) => (
              <Card
                key={debt.id}
                className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-4 hover:bg-muted transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{debt.personOrEntityName}</h4>
                    {debt.note && <p className="text-sm text-muted-foreground">{debt.note}</p>}
                  </div>
                  <p className="font-bold text-emerald-400">+{formatCurrency(debt.amount, debt.currency)}</p>
                </div>
                <select
                  value={debt.status}
                  onChange={(e) => handleStatusChange(debt.id, e.target.value)}
                  className="w-full bg-muted border border-[#e5e7eb] dark:border-[#374151] rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="open">Open</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </Card>
            ))}
          </div>
        </div>
      )}

      {debts.length === 0 && !showForm && (
        <Card className="bg-card border border-[#e5e7eb] dark:border-[#374151] p-8 text-center">
          <p className="text-muted-foreground">No debts yet</p>
        </Card>
      )}
    </div>
  );
}
