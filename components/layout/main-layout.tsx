'use client';

import React from "react"
import { Wallet, Send, Layers2, PieChart, BarChart3, User, Building2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils/formatting';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  categoriesEditMode?: boolean;
  onCategoriesEditToggle?: () => void;
  /** When set, shown in header right instead of default icon (e.g. Transactions: Create transaction) */
  headerRightAction?: { icon: React.ReactNode; onClick: () => void; ariaLabel?: string };
}

const TABS = [
  { id: 'accounts', label: 'Accounts', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: Send },
  { id: 'categories', label: 'Categories', icon: Layers2 },
  { id: 'budget', label: 'Budget', icon: PieChart },
  { id: 'overview', label: 'Overview', icon: BarChart3 },
];

export default function MainLayout({
  children,
  activeTab,
  onTabChange,
  categoriesEditMode = false,
  onCategoriesEditToggle,
  headerRightAction,
}: MainLayoutProps) {
  const { wallets } = useFinanceStore();
  const isCategories = activeTab === 'categories';
  const showEditButton = isCategories && onCategoriesEditToggle;

  // Calculate total balance
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.currentBalance, 0);
  const baseCurrency = wallets[0]?.currency || 'UZS';

  const renderHeaderRight = () => {
    if (showEditButton) {
      return (
        <button
          type="button"
          onClick={onCategoriesEditToggle}
          className={cn('p-2 rounded-full transition', categoriesEditMode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          aria-label="Edit categories"
        >
          <Pencil className="w-6 h-6" />
        </button>
      );
    }
    if (headerRightAction) {
      return (
        <button
          type="button"
          onClick={headerRightAction.onClick}
          className="p-2 rounded-full hover:bg-muted transition"
          aria-label={headerRightAction.ariaLabel ?? 'Action'}
        >
          {headerRightAction.icon}
        </button>
      );
    }
    return (
      <button type="button" className="p-2 rounded-full hover:bg-muted transition" aria-label="Menu">
        <Building2 className="w-6 h-6 text-muted-foreground" />
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header – profile left, All accounts + balance center, icon right */}
      <header className="border-b border-border bg-card px-3 py-3 safe-area-inset-top">
        <div className="flex items-center justify-between gap-2">
          <button type="button" className="p-2 rounded-full hover:bg-muted transition" aria-label="Profile">
            <User className="w-6 h-6 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-xs font-medium text-muted-foreground">All accounts</h1>
            <div className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {formatCurrency(totalBalance, baseCurrency)}
            </div>
          </div>
          {renderHeaderRight()}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[#e5e7eb] dark:border-[#374151] bg-card safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 py-3 px-4 transition',
                  'hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeTab === tab.id ? 'text-primary bg-muted' : 'text-muted-foreground'
                )}
                aria-label={tab.label}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
