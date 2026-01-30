'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';

type TabType = 'accounts' | 'transactions' | 'categories' | 'budget' | 'overview';

/* Lazy tab chunks – only active tab JS runs, improves FPS on mobile */
const AccountsTab = dynamic(() => import('@/components/tabs/accounts-tab').then((m) => ({ default: m.default })), {
  loading: () => <TabPlaceholder />,
  ssr: false,
});
const TransactionsTab = dynamic(() => import('@/components/tabs/transactions-tab').then((m) => ({ default: m.default })), {
  loading: () => <TabPlaceholder />,
  ssr: false,
});
const CategoriesTab = dynamic(() => import('@/components/tabs/categories-tab').then((m) => ({ default: m.default })), {
  loading: () => <TabPlaceholder />,
  ssr: false,
});
const BudgetTab = dynamic(() => import('@/components/tabs/budget-tab').then((m) => ({ default: m.default })), {
  loading: () => <TabPlaceholder />,
  ssr: false,
});
const OverviewTab = dynamic(() => import('@/components/tabs/overview-tab').then((m) => ({ default: m.default })), {
  loading: () => <TabPlaceholder />,
  ssr: false,
});

function TabPlaceholder() {
  return <div className="min-h-[200px] animate-pulse rounded-lg bg-muted/30" aria-hidden />;
}

export default function Home() {
  const { initialize, loadDemoData, isLoading, wallets, categories } = useFinanceStore(
    useShallow((s) => ({
      initialize: s.initialize,
      loadDemoData: s.loadDemoData,
      isLoading: s.isLoading,
      wallets: s.wallets,
      categories: s.categories,
    }))
  );
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [categoriesEditMode, setCategoriesEditMode] = useState(false);
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);
  const [accountsAddOpen, setAccountsAddOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();
  }, [initialize]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab((prev) => {
      if (prev === 'transactions' && tab !== 'transactions') setCreateTransactionOpen(false);
      if (prev === 'accounts' && tab !== 'accounts') setAccountsAddOpen(false);
      return tab;
    });
  }, []);

  const toggleCategoriesEdit = useCallback(() => setCategoriesEditMode((e) => !e), []);
  const openCreateTransaction = useCallback(() => setCreateTransactionOpen(true), []);
  const closeCreateTransaction = useCallback(() => setCreateTransactionOpen(false), []);
  const openAccountsAdd = useCallback(() => setAccountsAddOpen(true), []);
  const closeAccountsAdd = useCallback(() => setAccountsAddOpen(false), []);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading your finances...</p>
        </div>
      </div>
    );
  }

  const isEmpty = wallets.length === 0 && categories.length === 0;
  if (isEmpty) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="text-center max-w-sm px-4">
          <p className="text-muted-foreground mb-2">Ma&apos;lumotlar bo&apos;sh. Demo ma&apos;lumotlarni yuklash uchun tugmani bosing.</p>
          <Button onClick={() => loadDemoData()} size="lg">
            Demo yuklash
          </Button>
        </div>
      </div>
    );
  }

  const headerRightAction =
    activeTab === 'transactions'
      ? { icon: <Plus className="w-6 h-6 text-muted-foreground" />, onClick: openCreateTransaction, ariaLabel: 'Create transaction' as const }
      : activeTab === 'accounts'
        ? { icon: <Plus className="w-6 h-6 text-muted-foreground" />, onClick: openAccountsAdd, ariaLabel: 'Add account or debt' as const }
        : undefined;

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      categoriesEditMode={categoriesEditMode}
      onCategoriesEditToggle={toggleCategoriesEdit}
      headerRightAction={headerRightAction}
    >
      <Suspense fallback={<TabPlaceholder />}>
        {activeTab === 'accounts' && (
          <AccountsTab addOpenFromHeader={accountsAddOpen} onCloseAddFromHeader={closeAccountsAdd} />
        )}
        {activeTab === 'transactions' && (
          <TransactionsTab createTransactionOpen={createTransactionOpen} onCloseCreateTransaction={closeCreateTransaction} />
        )}
        {activeTab === 'categories' && <CategoriesTab editMode={categoriesEditMode} setEditMode={setCategoriesEditMode} />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'overview' && <OverviewTab />}
      </Suspense>
    </MainLayout>
  );
}
