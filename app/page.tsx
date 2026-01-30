'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import MainLayout from '@/components/layout/main-layout';
import AccountsTab from '@/components/tabs/accounts-tab';
import TransactionsTab from '@/components/tabs/transactions-tab';
import CategoriesTab from '@/components/tabs/categories-tab';
import BudgetTab from '@/components/tabs/budget-tab';
import OverviewTab from '@/components/tabs/overview-tab';
import { Button } from '@/components/ui/button';

type TabType = 'accounts' | 'transactions' | 'categories' | 'budget' | 'overview';

export default function Home() {
  const { initialize, loadDemoData, isLoading, wallets, categories } = useFinanceStore();
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [categoriesEditMode, setCategoriesEditMode] = useState(false);
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);
  const [accountsAddOpen, setAccountsAddOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();
  }, [initialize]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading your finances...</p>
        </div>
      </div>
    );
  }

  const isEmpty = wallets.length === 0 && categories.length === 0;
  if (isEmpty) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-sm px-4">
          <p className="text-muted-foreground mb-2">Ma&apos;lumotlar bo&apos;sh. Demo ma&apos;lumotlarni yuklash uchun tugmani bosing.</p>
          <Button onClick={() => loadDemoData()} size="lg">
            Demo yuklash
          </Button>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: TabType) => {
    if (activeTab === 'transactions' && tab !== 'transactions') setCreateTransactionOpen(false);
    if (activeTab === 'accounts' && tab !== 'accounts') setAccountsAddOpen(false);
    setActiveTab(tab);
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      categoriesEditMode={categoriesEditMode}
      onCategoriesEditToggle={() => setCategoriesEditMode((e) => !e)}
      headerRightAction={
        activeTab === 'transactions'
          ? { icon: <Plus className="w-6 h-6 text-muted-foreground" />, onClick: () => setCreateTransactionOpen(true), ariaLabel: 'Create transaction' }
          : activeTab === 'accounts'
            ? { icon: <Plus className="w-6 h-6 text-muted-foreground" />, onClick: () => setAccountsAddOpen(true), ariaLabel: 'Add account or debt' }
            : undefined
      }
    >
      {activeTab === 'accounts' && (
        <AccountsTab
          addOpenFromHeader={accountsAddOpen}
          onCloseAddFromHeader={() => setAccountsAddOpen(false)}
        />
      )}
      {activeTab === 'transactions' && (
        <TransactionsTab
          createTransactionOpen={createTransactionOpen}
          onCloseCreateTransaction={() => setCreateTransactionOpen(false)}
        />
      )}
      {activeTab === 'categories' && <CategoriesTab editMode={categoriesEditMode} setEditMode={setCategoriesEditMode} />}
      {activeTab === 'budget' && <BudgetTab />}
      {activeTab === 'overview' && <OverviewTab />}
    </MainLayout>
  );
}
