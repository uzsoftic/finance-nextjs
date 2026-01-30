'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Plus, CreditCard, Banknote, PiggyBank, Wallet, HandCoins, Tag, Building2, DollarSign, Pencil, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, List, Wallet as WalletIcon, Delete } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { formatCurrency, getAmountColor, getAmountPrefix } from '@/lib/utils/formatting';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Wallet as WalletModel } from '@/lib/models';
import type { Debt } from '@/lib/models';
import type { Transaction } from '@/lib/models';

type AccountsSubTab = 'accounts' | 'debts' | 'finances';
type AddAccountType = 'wallet' | 'saving' | 'debt' | null;

const WALLET_ICON_NAMES = ['CreditCard', 'Banknote', 'PiggyBank', 'Wallet', 'Building2', 'DollarSign', 'Tag'] as const;
const WALLET_COLOR_PRESETS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'];

function formatAmountWithSpaces(s: string): string {
  const cleaned = s.replace(/\s/g, '').replace(',', '.');
  const [intPart, decPart] = cleaned.split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decPart != null ? `${formatted}.${decPart}` : formatted;
}
function parseAmountStr(s: string): number {
  const cleaned = s.replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function KeypadBtn({ children, onClick, className = '', disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`min-h-[48px] rounded-lg bg-card border border-border hover:bg-muted transition flex items-center justify-center text-lg font-medium active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

export default function AccountsTab({
  addOpenFromHeader = false,
  onCloseAddFromHeader,
}: {
  addOpenFromHeader?: boolean;
  onCloseAddFromHeader?: () => void;
} = {}) {
  const { wallets, debts, transactions, categories, addWallet, addDebt, addTransaction, updateWallet, deleteWallet, updateDebt, deleteDebt } = useFinanceStore();
  const [activeSubTab, setActiveSubTab] = useState<AccountsSubTab>('accounts');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [addType, setAddType] = useState<AddAccountType>(null);
  const [detailAccount, setDetailAccount] = useState<WalletModel | null>(null);
  const [detailDebt, setDetailDebt] = useState<Debt | null>(null);

  const walletList = wallets.filter((w) => w != null && w.group !== 'savings');
  const savingsList = wallets.filter((w) => w != null && w.group === 'savings');
  const addSheetOpenEffective = addSheetOpen || addOpenFromHeader;
  const effectiveAddType = addOpenFromHeader && activeSubTab === 'debts' ? 'debt' : addType;

  const getWalletIcon = (w: WalletModel) => {
    if (w.icon) return getWalletIconComponent(w.icon);
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      card: CreditCard,
      cash: Banknote,
      savings: PiggyBank,
      other: Wallet,
    };
    return iconMap[w.type] || Wallet;
  };

  const handleCloseAddSheet = () => {
    setAddSheetOpen(false);
    setAddType(null);
    onCloseAddFromHeader?.();
  };

  const getWalletIconComponent = (iconName?: string) => {
    const map: Record<string, React.ComponentType<{ className?: string }>> = {
      CreditCard, Banknote, PiggyBank, Wallet, Building2, DollarSign, Tag,
    };
    return map[iconName || 'Wallet'] || Wallet;
  };

  const otherCategoryId = useMemo(() => categories.find((c) => c.name === 'Other')?.id ?? categories.filter((c) => c.type === 'expense' || c.type === 'both')[0]?.id, [categories]);

  const handleCloseDetail = () => {
    setDetailAccount(null);
    setDetailDebt(null);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card p-3 sticky top-0 z-10">
        <div className="flex gap-2">
          {(['accounts', 'debts', 'finances'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
                activeSubTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab === 'accounts' && 'Accounts'}
              {tab === 'debts' && 'Debts'}
              {tab === 'finances' && 'My finances'}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {activeSubTab === 'accounts' && (
          <div className="space-y-6">
            {/* Wallets section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">Wallets</h2>
              </div>
              {walletList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No wallets yet</p>
              ) : (
                <div className="space-y-2">
                  {walletList.map((w) => {
                    const Icon = getWalletIcon(w);
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setDetailAccount(w)}
                        className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: w.color || '#3b82f6' }}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">{w.name}</h3>
                            <p className="text-xs text-muted-foreground">{w.currency}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm shrink-0 ml-2">
                          {formatCurrency(w.currentBalance, w.currency)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Savings section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">Savings</h2>
              </div>
              {savingsList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No savings yet</p>
              ) : (
                <div className="space-y-2">
                  {savingsList.map((w) => {
                    const Icon = getWalletIcon(w);
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setDetailAccount(w)}
                        className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: w.color || '#f59e0b' }}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">{w.name}</h3>
                            <p className="text-xs text-muted-foreground">{w.currency}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm shrink-0 ml-2">
                          {formatCurrency(w.currentBalance, w.currency)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        )}

        {activeSubTab === 'debts' && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold mb-3">Debts</h2>
            {debts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No debts recorded</p>
            ) : (
              <div className="space-y-2">
                {debts.filter((d) => d != null).map((debt) => (
                  <button
                    key={debt.id}
                    type="button"
                    onClick={() => setDetailDebt(debt)}
                    className={`w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition text-left ${
                      debt.direction === 'I_OWE'
                        ? 'border-rose-500/30 bg-rose-500/5'
                        : 'border-emerald-500/30 bg-emerald-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          debt.direction === 'I_OWE' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <HandCoins className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{debt.personOrEntityName}</h3>
                        <p className="text-xs text-muted-foreground">{debt.direction === 'I_OWE' ? 'I owe' : "I'm owed"}</p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold text-sm shrink-0 ml-2 tabular-nums ${
                        debt.direction === 'I_OWE' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {debt.direction === 'I_OWE' ? '-' : '+'}
                      {formatCurrency(debt.amount, debt.currency)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'finances' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold mb-4">Umumiy hisob kitob</h2>
            {(() => {
              const accountsTotal = walletList.reduce((sum, w) => sum + w.currentBalance, 0);
              const savingsTotal = savingsList.reduce((sum, w) => sum + w.currentBalance, 0);
              const iOwe = debts.filter((d) => d != null && d.direction === 'I_OWE').reduce((sum, d) => sum + d.amount, 0);
              const imOwed = debts.filter((d) => d != null && d.direction === 'IM_OWED').reduce((sum, d) => sum + d.amount, 0);
              const baseCurrency = wallets[0]?.currency || 'UZS';
              const netDebts = imOwed - iOwe;
              const totalNet = accountsTotal + savingsTotal + netDebts;
              return (
                <>
                  <div className="grid gap-3">
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">Accounts (hamyonlar)</p>
                      <p className="text-xl font-bold">{formatCurrency(accountsTotal, baseCurrency)}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">Savings (qo‘shimcha)</p>
                      <p className="text-xl font-bold">{formatCurrency(savingsTotal, baseCurrency)}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2">Debts</p>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Berganlarim (I&apos;m owed)</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(imOwed, baseCurrency)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Olg‘anim (I owe)</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(iOwe, baseCurrency)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">Qarzlar balansi: {netDebts >= 0 ? '+' : ''}{formatCurrency(netDebts, baseCurrency)}</p>
                    </div>
                  </div>
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Umumiy (Accounts + Savings + Qarzlar)</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalNet, baseCurrency)}</p>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </main>

      {/* Add account sheet: type selector (Wallet/Saving) yoki Debt form */}
      <Sheet open={addSheetOpenEffective} onOpenChange={(open) => { if (!open) handleCloseAddSheet(); setAddSheetOpen(false); }}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          {effectiveAddType === 'debt' ? (
            <AddDebtForm
              onSave={async (data) => {
                await addDebt(data);
                handleCloseAddSheet();
              }}
              onClose={handleCloseAddSheet}
            />
          ) : addType === 'wallet' || addType === 'saving' ? (
            <AddWalletForm
              group={addType === 'wallet' ? 'accounts' : 'savings'}
              onSave={async (data) => {
                await addWallet(data);
                handleCloseAddSheet();
              }}
              onClose={handleCloseAddSheet}
              wallets={wallets}
            />
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Add account</SheetTitle>
              </SheetHeader>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Choose type</p>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setAddType('wallet')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="font-semibold block">Wallet</span>
                    <span className="text-xs text-muted-foreground">Card, cash, etc.</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAddType('saving')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <span className="font-semibold block">Saving</span>
                    <span className="text-xs text-muted-foreground">Savings account</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Account / Debt detail – shaffof overlay + pastdan slide-up panel */}
      {(detailAccount || detailDebt) && (
        <DetailOverlay
          title={detailAccount ? detailAccount.name : detailDebt?.personOrEntityName ?? ''}
          onClose={handleCloseDetail}
        >
          {detailAccount && (
            <AccountDetailPanel
              account={detailAccount}
              wallets={wallets}
              walletList={walletList}
              savingsList={savingsList}
              transactions={transactions}
              otherCategoryId={otherCategoryId ?? ''}
              getWalletIconComponent={getWalletIconComponent}
              getWalletIcon={getWalletIcon}
              onUpdateWallet={updateWallet}
              onDeleteWallet={deleteWallet}
              onAddTransaction={addTransaction}
              onClose={handleCloseDetail}
            />
          )}
          {detailDebt && (
            <DebtDetailPanel
              debt={detailDebt}
              wallets={wallets}
              walletList={walletList}
              savingsList={savingsList}
              otherCategoryId={otherCategoryId ?? ''}
              onUpdateDebt={updateDebt}
              onDeleteDebt={deleteDebt}
              onAddTransaction={addTransaction}
              onClose={handleCloseDetail}
            />
          )}
        </DetailOverlay>
      )}
    </div>
  );
}

function DetailOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <button
        type="button"
        onClick={handleClose}
        className={`absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] cursor-pointer transition-opacity duration-300 ${isClosing ? 'opacity-0' : ''}`}
        aria-label="Close"
      />
      <div className="absolute top-2 right-2 z-30">
        <button type="button" onClick={handleClose} className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30" aria-label="Close">×</button>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 max-h-[85vh] flex flex-col bg-background text-foreground rounded-t-2xl shadow-lg overflow-hidden min-h-0 duration-300 ${
          isClosing ? 'animate-out slide-out-to-bottom' : 'animate-in slide-in-from-bottom'
        }`}
      >
        <div className="px-4 pt-3 pb-2 border-b border-border">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>
  );
}

type AccountDetailView = 'menu' | 'edit' | 'balance' | 'transactions' | 'recharge' | 'withdraw' | 'transfer';

function AccountDetailPanel({
  account,
  wallets,
  walletList,
  savingsList,
  transactions,
  otherCategoryId,
  getWalletIconComponent,
  getWalletIcon,
  onUpdateWallet,
  onDeleteWallet,
  onAddTransaction,
  onClose,
}: {
  account: WalletModel;
  wallets: WalletModel[];
  walletList: WalletModel[];
  savingsList: WalletModel[];
  transactions: Transaction[];
  otherCategoryId: string;
  getWalletIconComponent: (iconName?: string) => React.ComponentType<{ className?: string }>;
  getWalletIcon: (w: WalletModel) => React.ComponentType<{ className?: string }>;
  onUpdateWallet: (id: string, data: Partial<WalletModel>) => Promise<void>;
  onDeleteWallet: (id: string) => Promise<void>;
  onAddTransaction: (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}) {
  const [view, setView] = useState<AccountDetailView>('menu');
  const accountTransactions = useMemo(() => transactions.filter((t) => t.walletId === account.id || t.toWalletId === account.id).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()), [transactions, account.id]);
  const otherWallets = useMemo(() => [...walletList, ...savingsList].filter((w) => w.id !== account.id), [walletList, savingsList]);

  if (view === 'edit') {
    return (
      <div className="p-4">
        <button type="button" onClick={() => setView('menu')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">← Back</button>
        <EditWalletForm
          wallet={account}
          onSave={async (data) => { await onUpdateWallet(account.id, data); onClose(); }}
          onDelete={async () => { await onDeleteWallet(account.id); onClose(); }}
          onClose={() => setView('menu')}
          getWalletIconComponent={getWalletIconComponent}
        />
      </div>
    );
  }
  if (view === 'balance') {
    return (
      <BalanceUpdateForm
        currentBalance={account.currentBalance}
        currency={account.currency}
        walletId={account.id}
        otherCategoryId={otherCategoryId}
        onSave={async (newBalance) => {
          const diff = newBalance - account.currentBalance;
          if (diff !== 0 && otherCategoryId) {
            await onAddTransaction({
              type: diff > 0 ? 'income' : 'expense',
              amount: Math.abs(diff),
              currency: account.currency,
              walletId: account.id,
              categoryId: otherCategoryId,
              dateTime: new Date(),
            });
          }
          setView('menu');
        }}
        onClose={() => setView('menu')}
      />
    );
  }
  if (view === 'transactions') {
    return (
      <div className="p-4">
        <button type="button" onClick={() => setView('menu')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">← Back</button>
        <h3 className="font-semibold mb-2">Transactions</h3>
        {accountTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No transactions</p>
        ) : (
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {accountTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 px-2 rounded-lg bg-muted/30">
                <span className="text-sm truncate">{t.type === 'transfer' ? (t.walletId === account.id ? 'To account' : 'From account') : t.type}</span>
                <span className={`text-sm font-medium tabular-nums ${getAmountColor(t.type)}`}>
                  {t.type === 'transfer' ? (t.walletId === account.id ? '-' : '+') : getAmountPrefix(t.type)}{formatCurrency(t.amount, t.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (view === 'recharge') {
    return (
      <RechargeWithdrawForm
        mode="recharge"
        account={account}
        otherCategoryId={otherCategoryId}
        onSave={async (amount, note) => {
          await onAddTransaction({ type: 'income', amount, currency: account.currency, walletId: account.id, categoryId: otherCategoryId, note: note || undefined, dateTime: new Date() });
          setView('menu');
        }}
        onClose={() => setView('menu')}
      />
    );
  }
  if (view === 'withdraw') {
    return (
      <RechargeWithdrawForm
        mode="withdraw"
        account={account}
        otherCategoryId={otherCategoryId}
        onSave={async (amount, note) => {
          await onAddTransaction({ type: 'expense', amount, currency: account.currency, walletId: account.id, categoryId: otherCategoryId, note: note || undefined, dateTime: new Date() });
          setView('menu');
        }}
        onClose={() => setView('menu')}
      />
    );
  }
  if (view === 'transfer') {
    return (
      <TransferForm
        fromAccount={account}
        otherWallets={otherWallets}
        getWalletIcon={getWalletIcon}
        onSave={async (toWalletId, amount) => {
          await onAddTransaction({ type: 'transfer', amount, currency: account.currency, walletId: account.id, toWalletId, dateTime: new Date() });
          setView('menu');
        }}
        onClose={() => setView('menu')}
      />
    );
  }

  return (
    <div className="p-4 space-y-2">
      <MenuButton icon={Pencil} label="Edit" onClick={() => setView('edit')} />
      <MenuButton icon={WalletIcon} label="Balance (update)" onClick={() => setView('balance')} />
      <MenuButton icon={List} label="Transactions" onClick={() => setView('transactions')} />
      <MenuButton icon={ArrowDownToLine} label="Recharge" onClick={() => setView('recharge')} />
      <MenuButton icon={ArrowUpFromLine} label="Withdraw" onClick={() => setView('withdraw')} />
      <MenuButton icon={ArrowLeftRight} label="Transfer" onClick={() => setView('transfer')} />
    </div>
  );
}

type DebtDetailView = 'menu' | 'edit' | 'balance' | 'transactions' | 'recharge' | 'withdraw';

function DebtDetailPanel({
  debt,
  wallets,
  walletList,
  savingsList,
  otherCategoryId,
  onUpdateDebt,
  onDeleteDebt,
  onAddTransaction,
  onClose,
}: {
  debt: Debt;
  wallets: WalletModel[];
  walletList: WalletModel[];
  savingsList: WalletModel[];
  otherCategoryId: string;
  onUpdateDebt: (id: string, data: Partial<Debt>) => Promise<void>;
  onDeleteDebt: (id: string) => Promise<void>;
  onAddTransaction: (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}) {
  const [view, setView] = useState<DebtDetailView>('menu');
  const toAccounts = useMemo(() => [...walletList, ...savingsList], [walletList, savingsList]);

  if (view === 'edit') {
    return (
      <div className="p-4">
        <button type="button" onClick={() => setView('menu')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">← Back</button>
        <EditDebtFormWithAmountChange
          debt={debt}
          wallets={toAccounts}
          otherCategoryId={otherCategoryId}
          onSave={async (data) => { await onUpdateDebt(debt.id, data); onClose(); }}
          onDelete={async () => { await onDeleteDebt(debt.id); onClose(); }}
          onClose={() => setView('menu')}
          onAmountChangeTransaction={onAddTransaction}
        />
      </div>
    );
  }
  if (view === 'balance') {
    return (
      <div className="p-4">
        <button type="button" onClick={() => setView('menu')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">← Back</button>
        <p className="text-sm text-muted-foreground">Use Edit to change debt amount. The difference will be recorded to Other category.</p>
      </div>
    );
  }
  if (view === 'transactions') {
    return (
      <div className="p-4">
        <button type="button" onClick={() => setView('menu')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">← Back</button>
        <p className="text-sm text-muted-foreground">Debt transactions (amount changes) are recorded when you edit the debt or use Recharge/Withdraw.</p>
      </div>
    );
  }
  if (view === 'recharge') {
    return (
      <DebtRechargeWithdrawForm
        mode="recharge"
        debt={debt}
        toAccounts={toAccounts}
        otherCategoryId={otherCategoryId}
        onSave={async (walletId, amount) => {
          await onAddTransaction({ type: 'expense', amount, currency: debt.currency, walletId, categoryId: otherCategoryId, dateTime: new Date() });
          await onUpdateDebt(debt.id, { amount: Math.max(0, debt.amount - amount) });
          setView('menu');
        }}
        onClose={() => setView('menu')}
      />
    );
  }
  if (view === 'withdraw') {
    return (
      <DebtRechargeWithdrawForm
        mode="withdraw"
        debt={debt}
        toAccounts={toAccounts}
        otherCategoryId={otherCategoryId}
        onSave={async (walletId, amount) => {
          await onAddTransaction({ type: 'income', amount, currency: debt.currency, walletId, categoryId: otherCategoryId, dateTime: new Date() });
          await onUpdateDebt(debt.id, { amount: debt.amount + amount });
          setView('menu');
        }}
        onClose={() => setView('menu')}
      />
    );
  }

  return (
    <div className="p-4 space-y-2">
      <MenuButton icon={Pencil} label="Edit" onClick={() => setView('edit')} />
      <MenuButton icon={WalletIcon} label="Balance (update)" onClick={() => setView('balance')} />
      <MenuButton icon={List} label="Transactions" onClick={() => setView('transactions')} />
      <MenuButton icon={ArrowDownToLine} label="Recharge" onClick={() => setView('recharge')} />
      <MenuButton icon={ArrowUpFromLine} label="Withdraw" onClick={() => setView('withdraw')} />
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition text-left">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function BalanceUpdateForm({ currentBalance, currency, walletId, otherCategoryId, onSave, onClose }: { currentBalance: number; currency: string; walletId: string; otherCategoryId: string; onSave: (newBalance: number) => Promise<void>; onClose: () => void }) {
  const [amountStr, setAmountStr] = useState(String(currentBalance).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  const amount = parseAmountStr(amountStr);
  const handleKey = (key: string) => {
    if (key === 'backspace') setAmountStr((s) => s.replace(/\s/g, '').slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    else if (key === '.') setAmountStr((s) => (s.replace(/\s/g, '') || '0') + '.');
    else if (key >= '0' && key <= '9') setAmountStr((s) => {
      const raw = s.replace(/\s/g, '') || '0';
      const next = raw === '0' && key !== '0' && !raw.includes('.') ? key : raw + key;
      return next.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    });
  };
  return (
    <div className="p-4 flex flex-col min-h-0">
      <button type="button" onClick={onClose} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">← Back</button>
      <p className="text-xs text-muted-foreground mb-1">New balance</p>
      <div className="mb-3 flex items-baseline gap-1 flex-wrap">
        <input type="text" inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(formatAmountWithSpaces(e.target.value.replace(/[^\d.\s,]/g, '')))} placeholder="0" className="flex-1 min-w-[120px] text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50 text-foreground" />
        <span className="text-lg font-medium text-muted-foreground shrink-0">{currency}</span>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-1 p-2 bg-muted/30 rounded-xl min-h-[180px]">
        <KeypadBtn onClick={() => handleKey('7')}>7</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('8')}>8</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('9')}>9</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('4')}>4</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('5')}>5</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('6')}>6</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('1')}>1</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('2')}>2</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('3')}>3</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('backspace')}><Delete className="w-5 h-5" /></KeypadBtn>
        <KeypadBtn onClick={() => handleKey('0')}>0</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('.')}>.</KeypadBtn>
        <KeypadBtn onClick={() => onSave(amount)} disabled={amount < 0} className="col-span-3 bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px] font-semibold">Update</KeypadBtn>
      </div>
    </div>
  );
}

function RechargeWithdrawForm({ mode, account, otherCategoryId, onSave, onClose }: { mode: 'recharge' | 'withdraw'; account: WalletModel; otherCategoryId: string; onSave: (amount: number, note?: string) => Promise<void>; onClose: () => void }) {
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const amount = parseAmountStr(amountStr);
  const handleKey = (key: string) => {
    if (key === 'backspace') setAmountStr((s) => s.replace(/\s/g, '').slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    else if (key === '.') setAmountStr((s) => (s.replace(/\s/g, '') || '0') + '.');
    else if (key >= '0' && key <= '9') setAmountStr((s) => { const raw = s.replace(/\s/g, '') || '0'; const next = raw === '0' && key !== '0' && !raw.includes('.') ? key : raw + key; return next.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); });
  };
  const isExpense = mode === 'withdraw';
  return (
    <div className="p-4 flex flex-col min-h-0">
      <button type="button" onClick={onClose} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">← Back</button>
      <div className={`rounded-xl p-2.5 mb-3 flex flex-col gap-1 ${isExpense ? 'bg-rose-500/15 border border-rose-500/25' : 'bg-emerald-500/15 border border-emerald-500/25'}`}>
        <span className={`text-[10px] font-medium uppercase tracking-wide ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{mode === 'recharge' ? 'Recharge (income)' : 'Withdraw (expense)'}</span>
        <div className="flex items-baseline gap-1 flex-wrap">
          <input type="text" inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(formatAmountWithSpaces(e.target.value.replace(/[^\d.\s,]/g, '')))} placeholder="0" className={`flex-1 min-w-[100px] text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50 ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
          <span className="text-lg font-medium text-muted-foreground shrink-0">{account.currency}</span>
        </div>
      </div>
      <input type="text" placeholder="Notes..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3" />
      <div className="mt-auto grid grid-cols-3 gap-1 p-2 bg-muted/30 rounded-xl min-h-[180px]">
        <KeypadBtn onClick={() => handleKey('7')}>7</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('8')}>8</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('9')}>9</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('4')}>4</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('5')}>5</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('6')}>6</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('1')}>1</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('2')}>2</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('3')}>3</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('backspace')}><Delete className="w-5 h-5" /></KeypadBtn>
        <KeypadBtn onClick={() => handleKey('0')}>0</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('.')}>.</KeypadBtn>
        <KeypadBtn onClick={() => onSave(amount, note || undefined)} disabled={amount <= 0} className="col-span-3 bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px] font-semibold">Save</KeypadBtn>
      </div>
    </div>
  );
}

function TransferForm({ fromAccount, otherWallets, getWalletIcon, onSave, onClose }: { fromAccount: WalletModel; otherWallets: WalletModel[]; getWalletIcon: (w: WalletModel) => React.ComponentType<{ className?: string }>; onSave: (toWalletId: string, amount: number) => Promise<void>; onClose: () => void }) {
  const [toWalletId, setToWalletId] = useState(otherWallets[0]?.id ?? '');
  const [amountStr, setAmountStr] = useState('');
  const amount = parseAmountStr(amountStr);
  const toWallet = otherWallets.find((w) => w.id === toWalletId);
  const ToIcon = toWallet ? getWalletIcon(toWallet) : Wallet;
  const handleKey = (key: string) => {
    if (key === 'backspace') setAmountStr((s) => s.replace(/\s/g, '').slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    else if (key === '.') setAmountStr((s) => (s.replace(/\s/g, '') || '0') + '.');
    else if (key >= '0' && key <= '9') setAmountStr((s) => { const raw = s.replace(/\s/g, '') || '0'; const next = raw === '0' && key !== '0' && !raw.includes('.') ? key : raw + key; return next.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); });
  };
  return (
    <div className="p-4 flex flex-col min-h-0">
      <button type="button" onClick={onClose} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">← Back</button>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl p-2.5 bg-sky-500/15 border border-sky-500/25">
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium uppercase tracking-wide">From</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: fromAccount.color || '#0ea5e9' }}>
              {React.createElement(getWalletIcon(fromAccount), { className: 'w-4 h-4' })}
            </div>
            <span className="text-sm font-medium truncate">{fromAccount.name}</span>
          </div>
        </div>
        <div className="rounded-xl p-2.5 bg-muted/25 border border-border">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">To</span>
          <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} className="w-full mt-1 bg-transparent border-none outline-none text-sm font-medium focus:ring-0 p-0">
            {otherWallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-1">Amount</p>
      <div className="mb-3 flex items-baseline gap-1 flex-wrap">
        <input type="text" inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(formatAmountWithSpaces(e.target.value.replace(/[^\d.\s,]/g, '')))} placeholder="0" className="flex-1 min-w-[120px] text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50 text-foreground" />
        <span className="text-lg font-medium text-muted-foreground shrink-0">{fromAccount.currency}</span>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-1 p-2 bg-muted/30 rounded-xl min-h-[180px]">
        <KeypadBtn onClick={() => handleKey('7')}>7</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('8')}>8</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('9')}>9</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('4')}>4</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('5')}>5</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('6')}>6</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('1')}>1</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('2')}>2</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('3')}>3</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('backspace')}><Delete className="w-5 h-5" /></KeypadBtn>
        <KeypadBtn onClick={() => handleKey('0')}>0</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('.')}>.</KeypadBtn>
        <KeypadBtn onClick={() => onSave(toWalletId, amount)} disabled={amount <= 0 || !toWalletId} className="col-span-3 bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px] font-semibold">Transfer</KeypadBtn>
      </div>
    </div>
  );
}

function DebtRechargeWithdrawForm({ mode, debt, toAccounts, otherCategoryId, onSave, onClose }: { mode: 'recharge' | 'withdraw'; debt: Debt; toAccounts: WalletModel[]; otherCategoryId: string; onSave: (walletId: string, amount: number) => Promise<void>; onClose: () => void }) {
  const [walletId, setWalletId] = useState(toAccounts[0]?.id ?? '');
  const [amountStr, setAmountStr] = useState('');
  const amount = parseAmountStr(amountStr);
  const handleKey = (key: string) => {
    if (key === 'backspace') setAmountStr((s) => s.replace(/\s/g, '').slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    else if (key === '.') setAmountStr((s) => (s.replace(/\s/g, '') || '0') + '.');
    else if (key >= '0' && key <= '9') setAmountStr((s) => { const raw = s.replace(/\s/g, '') || '0'; const next = raw === '0' && key !== '0' && !raw.includes('.') ? key : raw + key; return next.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); });
  };
  const isRecharge = mode === 'recharge';
  return (
    <div className="p-4 flex flex-col min-h-0">
      <button type="button" onClick={onClose} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">← Back</button>
      <div className="rounded-xl p-2.5 mb-2 bg-muted/25 border border-border">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">To account (Accounts / Savings)</span>
        <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full mt-1 bg-transparent border-none outline-none text-sm font-medium focus:ring-0 p-0">
          {toAccounts.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      <div className={`rounded-xl p-2.5 mb-3 flex flex-col gap-1 ${isRecharge ? 'bg-rose-500/15 border border-rose-500/25' : 'bg-emerald-500/15 border border-emerald-500/25'}`}>
        <span className={`text-[10px] font-medium uppercase tracking-wide ${isRecharge ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{isRecharge ? 'Pay debt (recharge)' : 'Borrow more (withdraw)'}</span>
        <div className="flex items-baseline gap-1 flex-wrap">
          <input type="text" inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(formatAmountWithSpaces(e.target.value.replace(/[^\d.\s,]/g, '')))} placeholder="0" className={`flex-1 min-w-[100px] text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50 ${isRecharge ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
          <span className="text-lg font-medium text-muted-foreground shrink-0">{debt.currency}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{isRecharge ? 'Amount will be deducted from selected account and debt reduced.' : 'Amount will be added to selected account and debt increased.'}</p>
      <div className="mt-auto grid grid-cols-3 gap-1 p-2 bg-muted/30 rounded-xl min-h-[180px]">
        <KeypadBtn onClick={() => handleKey('7')}>7</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('8')}>8</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('9')}>9</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('4')}>4</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('5')}>5</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('6')}>6</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('1')}>1</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('2')}>2</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('3')}>3</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('backspace')}><Delete className="w-5 h-5" /></KeypadBtn>
        <KeypadBtn onClick={() => handleKey('0')}>0</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('.')}>.</KeypadBtn>
        <KeypadBtn onClick={() => onSave(walletId, amount)} disabled={amount <= 0 || !walletId} className="col-span-3 bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px] font-semibold">Save</KeypadBtn>
      </div>
    </div>
  );
}

function EditDebtFormWithAmountChange({
  debt,
  wallets,
  otherCategoryId,
  onSave,
  onDelete,
  onClose,
  onAmountChangeTransaction,
}: {
  debt: Debt;
  wallets: WalletModel[];
  otherCategoryId: string;
  onSave: (data: Partial<Debt>) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
  onAmountChangeTransaction: (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}) {
  const [personOrEntityName, setPersonOrEntityName] = useState(debt.personOrEntityName);
  const [amountStr, setAmountStr] = useState(() => String(debt.amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  const [currency, setCurrency] = useState(debt.currency);
  const [direction, setDirection] = useState(debt.direction);
  const [note, setNote] = useState(debt.note || '');
  const [dueDate, setDueDate] = useState(debt.dueDate ? new Date(debt.dueDate).toISOString().slice(0, 10) : '');
  const [walletIdForDiff, setWalletIdForDiff] = useState(wallets[0]?.id ?? '');
  const prevAmountRef = useRef(debt.amount);
  const amount = parseAmountStr(amountStr);

  const handleAmountKey = (key: string) => {
    if (key === 'backspace') setAmountStr((s) => s.replace(/\s/g, '').slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    else if (key === '.') setAmountStr((s) => (s.replace(/\s/g, '') || '0') + '.');
    else if (key >= '0' && key <= '9') setAmountStr((s) => { const raw = s.replace(/\s/g, '') || '0'; const next = raw === '0' && key !== '0' && !raw.includes('.') ? key : raw + key; return next.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const diff = amount - prevAmountRef.current;
    if (diff !== 0 && otherCategoryId && walletIdForDiff) {
      await onAmountChangeTransaction({
        type: diff > 0 ? 'expense' : 'income',
        amount: Math.abs(diff),
        currency: debt.currency,
        walletId: walletIdForDiff,
        categoryId: otherCategoryId,
        dateTime: new Date(),
      });
    }
    await onSave({ personOrEntityName, amount, currency, direction, note: note || undefined, dueDate: dueDate ? new Date(dueDate) : undefined });
    onClose();
  };

  return (
    <div className="p-4 pb-8">
      <h3 className="text-lg font-semibold">Edit debt</h3>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <Label className="text-sm">Person or entity</Label>
          <Input value={personOrEntityName} onChange={(e) => setPersonOrEntityName(e.target.value)} className="mt-1" required />
        </div>
        <div>
          <Label className="text-sm">Amount</Label>
          <div className="flex items-baseline gap-1 flex-wrap mt-1">
            <input type="text" inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(formatAmountWithSpaces(e.target.value.replace(/[^\d.\s,]/g, '')))} placeholder="0" className="flex-1 min-w-[120px] text-xl font-bold bg-muted/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary" />
            <span className="text-sm font-medium text-muted-foreground shrink-0">{currency}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2">
            <KeypadBtn onClick={() => handleAmountKey('7')}>7</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('8')}>8</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('9')}>9</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('backspace')}><Delete className="w-4 h-4" /></KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('4')}>4</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('5')}>5</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('6')}>6</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('0')}>0</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('1')}>1</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('2')}>2</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('3')}>3</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('.')}>.</KeypadBtn>
          </div>
        </div>
        {amount !== prevAmountRef.current && (
          <div>
            <Label className="text-sm">Record difference in account (Other category)</Label>
            <select value={walletIdForDiff} onChange={(e) => setWalletIdForDiff(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1">
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <Label className="text-sm">Direction</Label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setDirection('I_OWE')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${direction === 'I_OWE' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}>I owe</button>
            <button type="button" onClick={() => setDirection('IM_OWED')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${direction === 'IM_OWED' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>I&apos;m owed</button>
          </div>
        </div>
        <div>
          <Label className="text-sm">Currency</Label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1">
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <Label className="text-sm">Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-sm">Note</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1" />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1">Save</Button>
        </div>
        <div className="pt-4 border-t border-border">
          <Button type="button" variant="destructive" className="w-full" onClick={async () => { await onDelete(); }}>Qarzni o‘chirish</Button>
        </div>
      </form>
    </div>
  );
}

function EditWalletForm({
  wallet,
  onSave,
  onDelete,
  onClose,
  getWalletIconComponent,
}: {
  wallet: WalletModel;
  onSave: (data: Partial<WalletModel>) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
  getWalletIconComponent: (iconName?: string) => React.ComponentType<{ className?: string }>;
}) {
  const [name, setName] = useState(wallet.name);
  const [type, setType] = useState(wallet.type);
  const [color, setColor] = useState(wallet.color || '#3b82f6');
  const [icon, setIcon] = useState(wallet.icon || 'Wallet');
  const IconC = getWalletIconComponent(icon);

  return (
    <div className="p-4 pb-8">
      <h3 className="text-lg font-semibold">Edit {wallet.group === 'savings' ? 'Saving' : 'Wallet'}</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({ name, type, color, icon });
        }}
        className="space-y-4 mt-4"
      >
        <div>
          <Label className="text-sm">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" required />
        </div>
        {wallet.group !== 'savings' && (
          <div>
            <Label className="text-sm">Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WalletModel['type'])}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="savings">Savings</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
        <div>
          <Label className="text-sm">Icon</Label>
          <div className="mt-1">
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-left hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                    <IconC className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{icon}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="grid grid-cols-4 gap-1">
                  {WALLET_ICON_NAMES.map((iconName) => {
                    const I = getWalletIconComponent(iconName);
                    const isSelected = icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(iconName)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}
                      >
                        <I className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <Label className="text-sm">Color</Label>
          <div className="flex gap-2 mt-1 flex-wrap items-center">
            {WALLET_COLOR_PRESETS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-primary' : 'hover:opacity-90'}`} style={{ backgroundColor: c }} />
            ))}
            <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="font-mono text-sm w-24" placeholder="#hex" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1">Save</Button>
        </div>
        <div className="pt-4 border-t border-border">
          <Button type="button" variant="destructive" className="w-full" onClick={async () => { await onDelete(); }}>
            Hisobni o‘chirish
          </Button>
        </div>
      </form>
    </div>
  );
}

function AddWalletForm({
  group,
  onSave,
  onClose,
  wallets,
}: {
  group: 'accounts' | 'savings';
  onSave: (data: Omit<WalletModel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
  wallets: WalletModel[];
}) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(wallets[0]?.currency || 'UZS');
  const [type, setType] = useState<'cash' | 'card' | 'savings' | 'other'>(group === 'savings' ? 'savings' : 'card');
  const [initialBalanceStr, setInitialBalanceStr] = useState('');
  const [color, setColor] = useState(group === 'savings' ? '#f59e0b' : '#3b82f6');
  const [icon, setIcon] = useState('Wallet');
  const initialBalance = parseAmountStr(initialBalanceStr);
  const handleBalanceKey = (key: string) => {
    if (key === 'backspace') setInitialBalanceStr((s) => s.replace(/\s/g, '').slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    else if (key === '.') setInitialBalanceStr((s) => (s.replace(/\s/g, '') || '0') + '.');
    else if (key >= '0' && key <= '9') setInitialBalanceStr((s) => { const raw = s.replace(/\s/g, '') || '0'; const next = raw === '0' && key !== '0' && !raw.includes('.') ? key : raw + key; return next.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); });
  };
  const getIcon = (iconName?: string) => {
    const map: Record<string, React.ComponentType<{ className?: string }>> = {
      CreditCard, Banknote, PiggyBank, Wallet, Building2, DollarSign, Tag,
    };
    return map[iconName || 'Wallet'] || Wallet;
  };
  const AddFormIcon = getIcon(icon);

  return (
    <div className="p-4 pb-8">
      <SheetHeader>
        <SheetTitle>{group === 'savings' ? 'New Saving' : 'New Wallet'}</SheetTitle>
      </SheetHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({
            name,
            currency,
            type,
            initialBalance,
            currentBalance: initialBalance,
            color,
            icon,
            group,
            active: true,
          });
        }}
        className="space-y-4 mt-4"
      >
        <div>
          <Label className="text-sm">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={group === 'savings' ? 'Savings name' : 'Wallet name'} className="mt-1" required />
        </div>
        <div>
          <Label className="text-sm">Currency</Label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
          >
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        {group === 'accounts' && (
          <div>
            <Label className="text-sm">Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
        <div>
          <Label className="text-sm">Initial balance</Label>
          <div className="flex items-baseline gap-1 flex-wrap mt-1">
            <input type="text" inputMode="decimal" value={initialBalanceStr} onChange={(e) => setInitialBalanceStr(formatAmountWithSpaces(e.target.value.replace(/[^\d.\s,]/g, '')))} placeholder="0" className="flex-1 min-w-[120px] text-xl font-bold bg-muted/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary" />
            <span className="text-sm font-medium text-muted-foreground shrink-0">{currency}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2">
            <KeypadBtn onClick={() => handleBalanceKey('7')}>7</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('8')}>8</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('9')}>9</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('backspace')}><Delete className="w-4 h-4" /></KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('4')}>4</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('5')}>5</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('6')}>6</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('0')}>0</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('1')}>1</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('2')}>2</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('3')}>3</KeypadBtn>
            <KeypadBtn onClick={() => handleBalanceKey('.')}>.</KeypadBtn>
          </div>
        </div>
        <div>
          <Label className="text-sm">Icon</Label>
          <div className="mt-1">
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-left hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                    <AddFormIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{icon}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="grid grid-cols-4 gap-1">
                  {WALLET_ICON_NAMES.map((iconName) => {
                    const I = getIcon(iconName);
                    const isSelected = icon === iconName;
                    return (
                      <button key={iconName} type="button" onClick={() => setIcon(iconName)} className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}>
                        <I className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <Label className="text-sm">Color</Label>
          <div className="flex gap-2 mt-1 flex-wrap items-center">
            {WALLET_COLOR_PRESETS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-primary' : 'hover:opacity-90'}`} style={{ backgroundColor: c }} />
            ))}
            <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="font-mono text-sm w-24" placeholder="#hex" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1">Save</Button>
        </div>
      </form>
    </div>
  );
}

function EditDebtForm({
  debt,
  onSave,
  onDelete,
  onClose,
}: {
  debt: Debt;
  onSave: (data: Partial<Debt>) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  const [personOrEntityName, setPersonOrEntityName] = useState(debt.personOrEntityName);
  const [amount, setAmount] = useState(debt.amount);
  const [currency, setCurrency] = useState(debt.currency);
  const [direction, setDirection] = useState(debt.direction);
  const [note, setNote] = useState(debt.note || '');
  const [dueDate, setDueDate] = useState(debt.dueDate ? new Date(debt.dueDate).toISOString().slice(0, 10) : '');

  return (
    <div className="p-4 pb-8">
      <SheetHeader>
        <SheetTitle>Edit debt</SheetTitle>
      </SheetHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({
            personOrEntityName,
            amount,
            currency,
            direction,
            note: note || undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
          });
        }}
        className="space-y-4 mt-4"
      >
        <div>
          <Label className="text-sm">Person or entity</Label>
          <Input value={personOrEntityName} onChange={(e) => setPersonOrEntityName(e.target.value)} placeholder="Who" className="mt-1" required />
        </div>
        <div>
          <Label className="text-sm">Direction</Label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setDirection('I_OWE')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${direction === 'I_OWE' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}
            >
              I owe
            </button>
            <button
              type="button"
              onClick={() => setDirection('IM_OWED')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${direction === 'IM_OWED' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}
            >
              I&apos;m owed
            </button>
          </div>
        </div>
        <div>
          <Label className="text-sm">Amount</Label>
          <Input type="number" value={amount || ''} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="mt-1" required />
        </div>
        <div>
          <Label className="text-sm">Currency</Label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1">
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <Label className="text-sm">Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-sm">Note</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="mt-1" />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1">Save</Button>
        </div>
        <div className="pt-4 border-t border-border">
          <Button type="button" variant="destructive" className="w-full" onClick={async () => { await onDelete(); }}>
            Qarzni o‘chirish
          </Button>
        </div>
      </form>
    </div>
  );
}

function AddDebtForm({
  onSave,
  onClose,
}: {
  onSave: (data: { personOrEntityName: string; amount: number; currency: string; direction: 'I_OWE' | 'IM_OWED'; status: 'open' }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [currency, setCurrency] = useState('UZS');
  const [direction, setDirection] = useState<'I_OWE' | 'IM_OWED'>('I_OWE');
  const amount = parseAmountStr(amountStr);
  const handleAmountKey = (key: string) => {
    if (key === 'backspace') setAmountStr((s) => s.replace(/\s/g, '').slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    else if (key === '.') setAmountStr((s) => (s.replace(/\s/g, '') || '0') + '.');
    else if (key >= '0' && key <= '9') setAmountStr((s) => { const raw = s.replace(/\s/g, '') || '0'; const next = raw === '0' && key !== '0' && !raw.includes('.') ? key : raw + key; return next.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); });
  };

  return (
    <div className="p-4 pb-8">
      <SheetHeader>
        <SheetTitle>New Debt</SheetTitle>
      </SheetHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({ personOrEntityName: name, amount, currency, direction, status: 'open' });
        }}
        className="space-y-4 mt-4"
      >
        <div>
          <Label className="text-sm">Person or entity</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Who" className="mt-1" required />
        </div>
        <div>
          <Label className="text-sm">Direction</Label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setDirection('I_OWE')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${direction === 'I_OWE' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}>I owe</button>
            <button type="button" onClick={() => setDirection('IM_OWED')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${direction === 'IM_OWED' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>I&apos;m owed</button>
          </div>
        </div>
        <div>
          <Label className="text-sm">Amount</Label>
          <div className="flex items-baseline gap-1 flex-wrap mt-1">
            <input type="text" inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(formatAmountWithSpaces(e.target.value.replace(/[^\d.\s,]/g, '')))} placeholder="0" className={`flex-1 min-w-[120px] text-xl font-bold bg-muted/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary ${direction === 'I_OWE' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span className="text-sm font-medium text-muted-foreground shrink-0">{currency}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2">
            <KeypadBtn onClick={() => handleAmountKey('7')}>7</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('8')}>8</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('9')}>9</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('backspace')}><Delete className="w-4 h-4" /></KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('4')}>4</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('5')}>5</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('6')}>6</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('0')}>0</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('1')}>1</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('2')}>2</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('3')}>3</KeypadBtn>
            <KeypadBtn onClick={() => handleAmountKey('.')}>.</KeypadBtn>
          </div>
        </div>
        <div>
          <Label className="text-sm">Currency</Label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1">
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={amount <= 0}>Save</Button>
        </div>
      </form>
    </div>
  );
}
