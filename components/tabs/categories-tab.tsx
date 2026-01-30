'use client';

import React from "react";
import { useFinanceStore } from '@/lib/store';
import {
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
  Gamepad2,
  Heart,
  Gift,
  ShoppingBag,
  Globe,
  Smile,
  Briefcase,
  Code,
  TrendingUp,
  Delete,
  Calendar as CalendarIcon,
  Check,
  Pencil,
  Plus,
  MoreHorizontal,
  Home,
  Car,
  Plane,
  Coffee,
  Film,
  Music,
  BookOpen,
  Camera,
  Smartphone,
  Tv,
  Shirt,
  Baby,
  Flower2,
  Star,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { formatCurrency, getMonthStartEnd, formatDateShort } from '@/lib/utils/formatting';
import { format, isToday, isYesterday } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MonthPicker } from '@/components/ui/month-picker';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category } from '@/lib/models';
import type { Wallet } from '@/lib/models';

const ICON_NAMES = [
  'Tag', 'ShoppingCart', 'UtensilsCrossed', 'Bus', 'Zap', 'Building2', 'DollarSign', 'CreditCard', 'Banknote',
  'PiggyBank', 'Gamepad2', 'Heart', 'Gift', 'ShoppingBag', 'Globe', 'Smile', 'Briefcase', 'Code', 'TrendingUp',
  'Home', 'Car', 'Plane', 'Coffee', 'Film', 'Music', 'BookOpen', 'Camera', 'Smartphone', 'Tv', 'Shirt', 'Baby',
  'Flower2', 'Star', 'Moon', 'Sun', 'Palette',
] as const;

const COLOR_PRESETS = [
  '#60A5FA', '#6366F1', '#F59E0B', '#10B981', '#A855F7', '#F43F5E', '#DC2626', '#6b7280',
  '#0EA5E9', '#8B5CF6', '#EC4899', '#14B8A6', '#84CC16', '#EAB308', '#EF4444', '#F97316',
  '#06B6D4', '#6366F1', '#D946EF', '#22C55E', '#E5E7EB', '#78716C', '#1E3A8A', '#4C1D95',
  '#831843', '#134E4A', '#14532D', '#713F12', '#7F1D1D', '#1E293B', '#0F172A', '#18181B',
];

// Pastel: lighten hex for softer chart colors
function pastelize(hex: string, factor = 0.75): string {
  const n = hex.replace('#', '');
  const r = Math.min(255, Math.round(parseInt(n.slice(0, 2), 16) * (1 - factor) + 255 * factor));
  const g = Math.min(255, Math.round(parseInt(n.slice(2, 4), 16) * (1 - factor) + 255 * factor));
  const b = Math.min(255, Math.round(parseInt(n.slice(4, 6), 16) * (1 - factor) + 255 * factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Dark theme uchun yorqinroq rang (pastel kamroq, rang to‘yinroq)
function chartColorForCategory(hex: string): string {
  return pastelize(hex, 0.5);
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
  Gamepad2,
  Heart,
  Gift,
  ShoppingBag,
  Globe,
  Smile,
  Briefcase,
  Code,
  TrendingUp,
  Home,
  Car,
  Plane,
  Coffee,
  Film,
  Music,
  BookOpen,
  Camera,
  Smartphone,
  Tv,
  Shirt,
  Baby,
  Flower2,
  Star,
  Moon,
  Sun,
  Palette,
};

function getIcon(iconName?: string) {
  return iconMap[iconName || 'Tag'] || Tag;
}

// Date bar: « (31) JANUARY 2026 »
function formatDateBar(date: Date): string {
  const d = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const year = date.getFullYear();
  return `(${d}) ${month} ${year}`;
}

const INITIAL_VISIBLE = 19; // 4+2+2+2+2+4+3, then "..." for more

// Chiroyli chart ranglari (yumshoq, aniq)
const CHART_PALETTE = [
  '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626',
  '#DB2777', '#4F46E5', '#0D9488', '#65A30D', '#CA8A04',
];

const CategoriesTab = ({ editMode = false, setEditMode }: { editMode?: boolean; setEditMode?: (v: boolean) => void } = {}) => {
  const { categories, transactions, wallets, addTransaction, addCategory, updateCategory } = useFinanceStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addScreenOpen, setAddScreenOpen] = useState(false);
  const [addCategoryForTx, setAddCategoryForTx] = useState<Category | null>(null);
  const [addType, setAddType] = useState<'expense' | 'income'>('expense');
  const [chartViewMode, setChartViewMode] = useState<'expense' | 'income'>('expense');
  const [internalEditMode, setInternalEditMode] = useState(false);
  const editModeActive = setEditMode !== undefined ? editMode : internalEditMode;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [editCategorySheetOpen, setEditCategorySheetOpen] = useState(false);
  const [addCategorySheetOpen, setAddCategorySheetOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const baseCurrency = wallets[0]?.currency || 'UZS';
  const { start, end } = getMonthStartEnd(currentMonth);

  const { totalExpense, totalIncome } = useMemo(() => {
    let expense = 0;
    let income = 0;
    transactions.forEach((t) => {
      if (!t?.dateTime) return;
      const tDate = new Date(t.dateTime);
      if (tDate < start || tDate > end) return;
      if (t.type === 'expense') expense += t.amount;
      else if (t.type === 'income') income += t.amount;
    });
    return { totalExpense: expense, totalIncome: income };
  }, [transactions, start, end]);

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

  const byCategory = chartViewMode === 'expense' ? expenseByCategory : incomeByCategory;
  const categoryList = useMemo(() => {
    const list = categories.filter(
      (c) => c != null && (c.type === chartViewMode || c.type === 'both')
    );
    return [...list].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [categories, chartViewMode]);

  const moveCategoryUp = async (category: Category) => {
    const idx = categoryList.findIndex((c) => c.id === category.id);
    if (idx <= 0) return;
    const prev = categoryList[idx - 1];
    const curOrder = category.order ?? idx;
    const prevOrder = prev.order ?? idx - 1;
    await updateCategory(category.id, { order: prevOrder });
    await updateCategory(prev.id, { order: curOrder });
  };

  const moveCategoryDown = async (category: Category) => {
    const idx = categoryList.findIndex((c) => c.id === category.id);
    if (idx < 0 || idx >= categoryList.length - 1) return;
    const next = categoryList[idx + 1];
    const curOrder = category.order ?? idx;
    const nextOrder = next.order ?? idx + 1;
    await updateCategory(category.id, { order: nextOrder });
    await updateCategory(next.id, { order: curOrder });
  };

  const chartData = useMemo(() => {
    return categoryList
      .map((cat, i) => ({
        id: cat.id,
        name: cat.name,
        value: byCategory[cat.id] || 0,
        color: chartColorForCategory(cat.color || CHART_PALETTE[i % CHART_PALETTE.length]),
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [categoryList, byCategory]);

  const displayTotal = chartViewMode === 'expense' ? totalExpense : totalIncome;

  const visibleList = useMemo(() => categoryList.slice(0, visibleCount), [categoryList, visibleCount]);
  const hasMore = categoryList.length > INITIAL_VISIBLE && visibleCount <= INITIAL_VISIBLE;

  const openAddScreen = (category: Category, type: 'expense' | 'income') => {
    setAddCategoryForTx(category);
    setAddType(type);
    setAddScreenOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setEditCategorySheetOpen(true);
  };

  const handleCategoryPress = (category: Category, type: 'expense' | 'income') => {
    if (editModeActive) {
      openEditCategory(category);
    } else {
      openAddScreen(category, type);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Date bar – qalam headerda (MainLayout) */}
      <div className="bg-card border-b border-border px-2 py-2 sticky top-0 z-10">
        <MonthPicker value={currentMonth} onChange={setCurrentMonth} className="w-full" />
      </div>

      <main className="flex-1 overflow-y-auto px-3 py-3 pb-24">
        {/* 4 ustunli setka: chart 2–3 qator, 2–3 ustun (markaziy 4 katak). Qo‘shish oxirgi elementdan keyin. */}
        <div className="grid grid-cols-4 gap-2 auto-rows-auto">
          {/* 1-qator: 4 ta (0–3) */}
          {Array.from({ length: 4 }, (_, i) => visibleList[i] ? (
            <CategoryCard
              key={visibleList[i].id}
              category={visibleList[i]}
              amount={byCategory[visibleList[i].id] || 0}
              type={chartViewMode}
              baseCurrency={baseCurrency}
              onPress={() => handleCategoryPress(visibleList[i], chartViewMode)}
              onLongPress={() => editModeActive && openEditCategory(visibleList[i])}
            />
          ) : (
            <div key={`slot-${i}`} className="min-h-[72px] rounded-xl" aria-hidden />
          ))}

          {/* 2-qator chap: 2 ta (4–5) */}
          {Array.from({ length: 2 }, (_, i) => visibleList[4 + i] ? (
            <CategoryCard
              key={visibleList[4 + i].id}
              category={visibleList[4 + i]}
              amount={byCategory[visibleList[4 + i].id] || 0}
              type={chartViewMode}
              baseCurrency={baseCurrency}
              onPress={() => handleCategoryPress(visibleList[4 + i], chartViewMode)}
              onLongPress={() => editModeActive && openEditCategory(visibleList[4 + i])}
            />
          ) : (
            <div key={`slot-${4 + i}`} className="min-h-[72px] rounded-xl" aria-hidden />
          ))}

          {/* Chart: 2–3 qator, 2–3 ustun (markaziy 4 katak), joyi hech o‘zgarmaydi */}
          <div
            className="col-span-2 row-span-2 flex flex-col items-center justify-center min-h-[180px] rounded-xl bg-card border border-border cursor-pointer hover:bg-muted/50 transition"
            style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}
            onClick={() => setChartViewMode((m) => (m === 'expense' ? 'income' : 'expense'))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setChartViewMode((m) => (m === 'expense' ? 'income' : 'expense'));
              }
            }}
          >
            <div className="relative w-full h-[160px] max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.length > 0 ? chartData : [{ name: 'No data', value: 1, color: 'var(--muted)' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                  >
                    {(chartData.length > 0 ? chartData : [{ color: 'var(--muted)' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2.5} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0] || !baseCurrency) return null;
                      const p = payload[0].payload as { name: string; value: number };
                      return (
                        <div className="bg-card border border-border rounded-lg px-2 py-1.5 shadow-lg text-xs">
                          <span className="font-medium">{p.name}</span>
                          <span className="ml-1.5 text-muted-foreground">{formatCurrency(p.value, baseCurrency)}</span>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] text-muted-foreground font-medium">
                  {chartViewMode === 'expense' ? 'Expenses' : 'Incomes'}
                </p>
                <p className={`text-xs font-bold ${chartViewMode === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatCurrency(displayTotal, baseCurrency)}
                </p>
                <p className="text-[8px] text-muted-foreground mt-0.5">{formatCurrency(chartViewMode === 'expense' ? totalIncome : totalExpense, baseCurrency)}</p>
              </div>
            </div>
          </div>

          {/* 2–3 qator o‘ng + 4–5 qator: 6–19 va undan keyin 20+ va oxirida Qo‘shish */}
          {visibleList.slice(6).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              amount={byCategory[category.id] || 0}
              type={chartViewMode}
              baseCurrency={baseCurrency}
              onPress={() => handleCategoryPress(category, chartViewMode)}
              onLongPress={() => editModeActive && openEditCategory(category)}
            />
          ))}

          {/* Qo‘shish – doim oxirgi qo‘shilgan element ketidan */}
          {editModeActive && (
            <button
              type="button"
              onClick={() => setAddCategorySheetOpen(true)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-muted/60 border-2 border-dashed border-border hover:bg-muted transition min-h-[72px]"
            >
              <Plus className="w-8 h-8 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">Qo‘shish</span>
            </button>
          )}
          {!editModeActive && hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => Math.min(c + 12, categoryList.length))}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-card border border-border hover:bg-muted/50 transition min-h-[72px]"
            >
              <MoreHorizontal className="w-6 h-6 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">More</span>
            </button>
          )}
        </div>
      </main>

      {/* Add Transaction – partial height, blur on top (tap → back to Categories) */}
      {addScreenOpen && addCategoryForTx && (
        <AddTransactionScreen
          category={addCategoryForTx}
          type={addType}
          wallets={wallets}
          baseCurrency={baseCurrency}
          lastUsedWalletIds={lastUsedWalletIds}
          expenseCategories={categories.filter((c) => c != null && c.type === 'expense')}
          incomeCategories={categories.filter((c) => c != null && c.type === 'income')}
          expenseCategoryAmounts={expenseByCategory}
          incomeCategoryAmounts={incomeByCategory}
          onClose={() => {
            setAddScreenOpen(false);
            setAddCategoryForTx(null);
          }}
          onSuccess={async (payload) => {
            await addTransaction(payload);
            setAddScreenOpen(false);
            setAddCategoryForTx(null);
          }}
        />
      )}

      {/* Edit category sheet */}
      <Sheet open={editCategorySheetOpen} onOpenChange={setEditCategorySheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          {categoryToEdit && (
            <EditCategoryForm
              category={categoryToEdit}
              categoryList={categoryList}
              onSave={async (data) => {
                await updateCategory(categoryToEdit.id, data);
                setEditCategorySheetOpen(false);
                setCategoryToEdit(null);
              }}
              onClose={() => {
                setEditCategorySheetOpen(false);
                setCategoryToEdit(null);
              }}
              onMoveUp={() => moveCategoryUp(categoryToEdit)}
              onMoveDown={() => moveCategoryDown(categoryToEdit)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Add category sheet */}
      <Sheet open={addCategorySheetOpen} onOpenChange={setAddCategorySheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <AddCategoryForm
            defaultType={chartViewMode}
            nextOrder={categoryList.length ? Math.max(0, ...categoryList.map((c) => c.order ?? 0)) + 1 : 0}
            onSave={async (data) => {
              await addCategory(data);
              setAddCategorySheetOpen(false);
            }}
            onClose={() => setAddCategorySheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

function CategoryCard({
  category,
  amount,
  type,
  baseCurrency,
  onPress,
  onLongPress,
}: {
  category: Category;
  amount: number;
  type: 'expense' | 'income';
  baseCurrency: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const Icon = getIcon(category.icon);
  const color = category.color || '#6b7280';
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = () => {
    if (!onLongPress) return;
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      onLongPress();
    }, 500);
  };
  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <button
      type="button"
      onClick={onPress}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-card border border-border hover:bg-muted/80 transition text-left w-full"
    >
      <div className="w-full flex justify-between items-start">
        <span className="text-[10px] font-medium truncate flex-1 text-muted-foreground">{category.name}</span>
        <span className="text-[9px] text-muted-foreground shrink-0">0 {baseCurrency}</span>
      </div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold truncate w-full text-center" style={{ color }}>
        {formatCurrency(amount, baseCurrency)}
      </span>
    </button>
  );
}

function IconPickerPopover({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 transition border border-border">
          {React.createElement(getIcon(value), { className: 'w-6 h-6' })}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-2" align="start">
        <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Ikonka tanlang</p>
        <div className="grid grid-cols-6 gap-1.5 max-h-[240px] overflow-y-auto">
          {ICON_NAMES.map((iconName) => {
            const IconC = getIcon(iconName);
            const isSelected = value === iconName;
            return (
              <button key={iconName} type="button" onClick={() => onChange(iconName)} className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}>
                <IconC className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColorPickerPopover({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const [hex, setHex] = useState(value);
  React.useEffect(() => { setHex(value); }, [value]);
  const applyHex = () => {
    const v = hex.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(v) || /^[0-9A-Fa-f]{6}$/.test(v)) onChange(v.startsWith('#') ? v : '#' + v);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="w-12 h-12 rounded-xl border-2 border-border transition shrink-0" style={{ backgroundColor: value }} aria-label="Rang" />
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <p className="text-xs font-medium text-muted-foreground pb-2">Rang tanlang</p>
        <div className="grid grid-cols-8 gap-1.5 max-h-[180px] overflow-y-auto">
          {COLOR_PRESETS.map((c) => (
            <button key={c} type="button" onClick={() => onChange(c)} className={`w-8 h-8 rounded-full transition ${value === c ? 'ring-2 ring-offset-2 ring-primary' : 'hover:opacity-90'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input type="text" value={hex} onChange={(e) => setHex(e.target.value)} className="font-mono text-sm flex-1" placeholder="#hex" />
          <button type="button" onClick={applyHex} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm">Qo‘llash</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EditCategoryForm({
  category,
  categoryList,
  onSave,
  onClose,
  onMoveUp,
  onMoveDown,
}: {
  category: Category;
  categoryList: Category[];
  onSave: (data: Partial<Category>) => Promise<void>;
  onClose: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [type, setType] = useState<'expense' | 'income'>(category.type === 'both' ? 'expense' : category.type);
  const [icon, setIcon] = useState(category.icon || 'Tag');
  const [color, setColor] = useState(category.color || '#6b7280');
  const idx = categoryList.findIndex((c) => c.id === category.id);
  const canMoveUp = idx > 0;
  const canMoveDown = idx >= 0 && idx < categoryList.length - 1;

  return (
    <div className="p-4 pb-8">
      <SheetHeader>
        <SheetTitle>Edit category</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 mt-4">
        <div>
          <Label className="text-sm">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="Category name" />
        </div>
        <div>
          <Label className="text-sm">Type</Label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'expense' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}>Expense</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>Income</button>
          </div>
        </div>
        <div>
          <Label className="text-sm">Joyini almashtirish</Label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 disabled:opacity-50">Yuqoriga</button>
            <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 disabled:opacity-50">Pastga</button>
          </div>
        </div>
        <div>
          <Label className="text-sm">Icon</Label>
          <div className="mt-1">
            <IconPickerPopover value={icon} onChange={setIcon} />
          </div>
        </div>
        <div>
          <Label className="text-sm">Color</Label>
          <div className="mt-1 flex items-center gap-2">
            <ColorPickerPopover value={color} onChange={setColor} />
            <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="font-mono text-sm flex-1 max-w-[120px]" placeholder="#hex" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border bg-muted">Cancel</button>
          <button type="button" onClick={() => onSave({ name, type, icon, color })} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground">Save</button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryForm({
  defaultType,
  nextOrder,
  onSave,
  onClose,
}: {
  defaultType: 'expense' | 'income';
  nextOrder: number;
  onSave: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#6b7280');

  return (
    <div className="p-4 pb-8">
      <SheetHeader>
        <SheetTitle>New category</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 mt-4">
        <div>
          <Label className="text-sm">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="Category name" />
        </div>
        <div>
          <Label className="text-sm">Type</Label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'expense' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}>Expense</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>Income</button>
          </div>
        </div>
        <div>
          <Label className="text-sm">Icon</Label>
          <div className="mt-1">
            <IconPickerPopover value={icon} onChange={setIcon} />
          </div>
        </div>
        <div>
          <Label className="text-sm">Color</Label>
          <div className="mt-1 flex items-center gap-2">
            <ColorPickerPopover value={color} onChange={setColor} />
            <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="font-mono text-sm flex-1 max-w-[120px]" placeholder="#hex" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border bg-muted">Cancel</button>
          <button type="button" onClick={() => onSave({ name, type, icon, color, archived: false, order: nextOrder })} disabled={!name.trim()} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Add</button>
        </div>
      </div>
    </div>
  );
}

export function AddTransactionScreen({
  category: initialCategory,
  type: initialType,
  wallets,
  baseCurrency,
  lastUsedWalletIds,
  expenseCategories,
  incomeCategories,
  expenseCategoryAmounts,
  incomeCategoryAmounts,
  onClose,
  onSuccess,
}: {
  category?: Category | null;
  type: 'expense' | 'income';
  wallets: Wallet[];
  baseCurrency: string;
  lastUsedWalletIds: { expense: string | null; income: string | null };
  expenseCategories: Category[];
  incomeCategories: Category[];
  expenseCategoryAmounts: Record<string, number>;
  incomeCategoryAmounts: Record<string, number>;
  onClose: () => void;
  onSuccess: (payload: { type: 'expense' | 'income'; amount: number; currency: string; walletId: string; categoryId: string; dateTime: Date; note?: string }) => Promise<void>;
}) {
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [category, setCategory] = useState<Category | null>(initialCategory ?? null);
  const [walletId, setWalletId] = useState<string>(() => lastUsedWalletIds[initialType] ?? wallets[0]?.id ?? '');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [txDate, setTxDate] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [showEqualsButton, setShowEqualsButton] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const categoryAmounts = type === 'expense' ? expenseCategoryAmounts : incomeCategoryAmounts;
  const categoriesRaw = type === 'expense' ? expenseCategories : incomeCategories;
  const categories = useMemo(
    () => [...categoriesRaw].sort((a, b) => (categoryAmounts[b.id] || 0) - (categoryAmounts[a.id] || 0)),
    [categoriesRaw, categoryAmounts]
  );
  function evalAmount(s: string): number {
    const cleaned = s.replace(/\s/g, '').replace(',', '.').replace(/[^\d.+*/\-]/g, '').replace(/[+*/\-]+$/, '');
    if (!cleaned) return 0;
    try {
      const v = new Function('return ' + cleaned)();
      return typeof v === 'number' && Number.isFinite(v) ? v : 0;
    } catch {
      return 0;
    }
  }
  const amount = evalAmount(amountStr);

  const hasOperator = /[+*/\-]/.test(amountStr.replace(/\s/g, ''));
  const showEquals = hasOperator && showEqualsButton;

  function formatAmountWithSpaces(s: string): string {
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  const handleKey = (key: string) => {
    if (key === 'backspace') {
      setAmountStr((s) => s.slice(0, -1));
      return;
    }
    if (key === '.') {
      setAmountStr((s) => (s || '0') + '.');
      return;
    }
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      setAmountStr((s) => (s || '0') + key);
      setShowEqualsButton(true);
      return;
    }
    if (key === '=') {
      const result = evalAmount(amountStr);
      setAmountStr(result > 0 ? String(result) : '');
      setShowEqualsButton(false);
      return;
    }
    if (key >= '0' && key <= '9') {
      setAmountStr((s) => (s === '0' && !s.includes('.') && !s.includes('+') && !s.includes('-') && !s.includes('*') && !s.includes('/') ? key : s + key));
    }
  };

  const handleAmountInputChange = (raw: string) => {
    const cleaned = raw.replace(/\s/g, '').replace(/[^\d.+*/\-]/g, '');
    setAmountStr(cleaned);
    if (/[+*/\-]/.test(cleaned)) setShowEqualsButton(true);
  };

  const handleSubmit = async () => {
    if (amount <= 0 || !walletId || !category) return;
    setSubmitting(true);
    try {
      await onSuccess({
        type,
        amount,
        currency: baseCurrency,
        walletId,
        categoryId: category.id,
        dateTime: new Date(txDate),
        note: note || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const IconCategory = category ? getIcon(category.icon) : Tag;
  const selectedWallet = wallets.find((w) => w.id === walletId);

  const getWalletIcon = (w: Wallet) => {
    const map: Record<string, React.ComponentType<{ className?: string }>> = {
      card: CreditCard,
      cash: Banknote,
      savings: PiggyBank,
      other: Banknote,
    };
    return map[w.type] || Banknote;
  };

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const todayDate = new Date();

  const selectedDayLabel = isToday(txDate)
    ? `Today, ${format(txDate, 'MMM d, yyyy')}`
    : isYesterday(txDate)
      ? `Yesterday, ${format(txDate, 'MMM d, yyyy')}`
      : format(txDate, 'EEE, MMM d, yyyy');

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Full-screen blur – 40% kamroq (yengil); yopilganda ham fade-out */}
      <button
        type="button"
        onClick={handleClose}
        className={`absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] cursor-pointer transition-opacity duration-300 ${isClosing ? 'opacity-0' : ''}`}
        aria-label="Back to Categories"
      />
      <div className="absolute top-2 right-2 z-30">
        <button type="button" onClick={handleClose} className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20" aria-label="Close">
          ×
        </button>
      </div>

      {/* Bottom panel – yopilganda slide-out-to-bottom (ochilishning reversi) */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 max-h-[85vh] flex flex-col bg-background text-foreground rounded-t-2xl shadow-lg overflow-hidden min-h-0 duration-300 ${
          isClosing ? 'animate-out slide-out-to-bottom' : 'animate-in slide-in-from-bottom'
        }`}
      >
      {/* Two panels: From account | To category – ixcham, kam fokus */}
      <div className="grid grid-cols-2 gap-2 px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={() => setAccountSheetOpen(true)}
          className="rounded-xl p-2.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/25 flex flex-col items-start gap-1 text-left w-full transition shadow-sm"
        >
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium uppercase tracking-wide">From account</span>
          <div className="flex items-center gap-2 w-full min-h-0">
            {selectedWallet && (
              <>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: selectedWallet.color || '#0d9488' }}
                >
                  {React.createElement(getWalletIcon(selectedWallet), { className: 'w-4 h-4' })}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-base font-medium text-foreground block truncate">{selectedWallet.name}</span>
                  <span className="text-xs text-muted-foreground">{formatCurrency(selectedWallet.currentBalance, selectedWallet.currency)}</span>
                </div>
              </>
            )}
          </div>
        </button>
        <div
          className={`rounded-xl p-2.5 flex flex-col items-end gap-1 text-right shadow-sm ${
            type === 'expense'
              ? 'bg-rose-500/15 border border-rose-500/25'
              : 'bg-muted/25 border border-border'
          }`}
        >
          <span className={`text-[10px] font-medium uppercase tracking-wide ${type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>To category</span>
          <div className="flex flex-row-reverse items-center gap-2 w-full min-h-0">
            {category ? (
              <>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: category.color || (type === 'expense' ? '#e11d48' : '#059669') }}
                >
                  <IconCategory className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <span className="text-base font-medium text-foreground block truncate">{category.name}</span>
                  <span className="text-xs text-muted-foreground block leading-tight mt-0.5">{formatCurrency(categoryAmounts[category.id] ?? 0, baseCurrency)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/70 shrink-0 border border-dashed border-border">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <span className="text-sm font-medium text-muted-foreground block">Kategoriyani tanlang</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category strip – har holatda to‘liq ko‘rinadi, shrink qilmaydi */}
      <div className="flex-shrink-0 min-h-[88px] px-3 py-3 border-b border-border/60 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex gap-5 pb-1 min-w-max">
          {categories.map((c) => {
            const IconC = getIcon(c.icon);
            const isSelected = category != null && c.id === category.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCategory(c); }}
                className={`flex flex-col items-center gap-1.5 shrink-0 min-w-[56px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full ${isSelected ? '' : 'opacity-60 hover:opacity-80'}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 transition shadow-sm ${isSelected ? 'ring-0 scale-105' : ''}`}
                  style={{ backgroundColor: c.color || '#71717a' }}
                >
                  <IconC className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium truncate max-w-[64px] text-center text-muted-foreground">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* From account – Sheet (Accounts-tab style) */}
      <Sheet open={accountSheetOpen} onOpenChange={setAccountSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[70vh] border-t">
          <SheetHeader>
            <SheetTitle>From account</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto overflow-x-hidden px-4 pb-6 space-y-3 scrollbar-vertical-pretty">
            {wallets.map((w) => {
              const IconW = getWalletIcon(w);
              const isSelected = w.id === walletId;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => { setWalletId(w.id); setAccountSheetOpen(false); }}
                  className={`w-full rounded-xl p-4 flex items-center justify-between border-2 transition ${isSelected ? 'border-sky-500 bg-sky-500/10' : 'border-border bg-card hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: w.color || '#10b981' }}
                    >
                      <IconW className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h3 className="font-semibold text-sm truncate">{w.name}</h3>
                      <p className="text-xs text-muted-foreground">{w.currency}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-semibold text-sm">{formatCurrency(w.currentBalance, w.currency)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Expense/Income + amount + Notes – extra padding after Notes */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              if (category && !expenseCategories.find((c) => c.id === category.id)) setCategory(initialCategory != null ? (expenseCategories[0] ?? null) : null);
              if (!category && initialCategory != null) setCategory(expenseCategories[0] ?? null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${type === 'expense' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              if (category && !incomeCategories.find((c) => c.id === category.id)) setCategory(initialCategory != null ? (incomeCategories[0] ?? null) : null);
              if (!category && initialCategory != null) setCategory(incomeCategories[0] ?? null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}
          >
            Income
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-0.5">
          {type === 'expense' ? 'Expense' : 'Income'}
        </p>
        <div className="mb-3 flex items-baseline gap-1 flex-wrap">
          <input
            type="text"
            inputMode="decimal"
            value={formatAmountWithSpaces(amountStr)}
            onChange={(e) => handleAmountInputChange(e.target.value)}
            placeholder="0"
            className={`flex-1 min-w-[120px] text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50 ${type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}
            aria-label="Amount"
          />
          <span className="text-lg font-medium text-muted-foreground shrink-0">{baseCurrency}</span>
        </div>
        <input
          type="text"
          placeholder="Notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Numeric keypad: / 7 8 9 backspace | * 4 5 6 calendar | - 1 2 3 submit(2 rows) | + UZS 0 . submit(2 rows) */}
      <div className="mt-auto grid grid-cols-5 gap-1 p-3 bg-muted/30 grid-rows-4 min-h-[200px]">
        <KeypadBtn onClick={() => handleKey('/')} className="text-muted-foreground">/</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('7')}>7</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('8')}>8</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('9')}>9</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('backspace')}>
          <Delete className="w-5 h-5" />
        </KeypadBtn>

        <KeypadBtn onClick={() => handleKey('*')} className="text-muted-foreground">×</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('4')}>4</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('5')}>5</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('6')}>6</KeypadBtn>
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="min-h-[48px] rounded-lg bg-card border border-border hover:bg-muted transition flex items-center justify-center text-lg font-medium active:scale-95"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 max-w-[min(90vw,320px)]" align="center" side="top">
            <h3 className="font-semibold text-sm mb-3">Select day</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => { setTxDate(yesterdayDate); setDatePopoverOpen(false); }}
                className="rounded-xl border-2 border-border bg-card hover:bg-muted/80 p-3 text-left transition"
              >
                <span className="block font-medium text-sm">Yesterday</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{format(yesterdayDate, 'MMMM d')}</span>
              </button>
              <button
                type="button"
                onClick={() => { setTxDate(todayDate); setDatePopoverOpen(false); }}
                className="rounded-xl border-2 border-border bg-card hover:bg-muted/80 p-3 text-left transition"
              >
                <span className="block font-medium text-sm">Today</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{format(todayDate, 'MMMM d')}</span>
              </button>
            </div>
            <CalendarUI
              mode="single"
              selected={txDate}
              onSelect={(d) => {
                if (d) setTxDate(d);
                setDatePopoverOpen(false);
              }}
              defaultMonth={txDate}
            />
          </PopoverContent>
        </Popover>

        <KeypadBtn onClick={() => handleKey('-')} className="text-muted-foreground">−</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('1')}>1</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('2')}>2</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('3')}>3</KeypadBtn>
        {showEquals ? (
          <KeypadBtn
            onClick={() => handleKey('=')}
            className="row-span-2 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground min-h-[104px] text-2xl font-bold"
          >
            =
          </KeypadBtn>
        ) : (
          <KeypadBtn
            onClick={handleSubmit}
            disabled={amount <= 0 || !category || submitting}
            className="row-span-2 flex items-center justify-center bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white min-h-[104px]"
          >
            <Check className="w-8 h-8" />
          </KeypadBtn>
        )}

        <KeypadBtn onClick={() => handleKey('+')} className="text-muted-foreground">+</KeypadBtn>
        <div className="bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground text-sm font-medium">UZS</div>
        <KeypadBtn onClick={() => handleKey('0')}>0</KeypadBtn>
        <KeypadBtn onClick={() => handleKey('.')}>.</KeypadBtn>
      </div>

      {/* Selected day at the very bottom */}
      <div className="py-3 text-center text-sm text-muted-foreground border-t border-border bg-background">
        {selectedDayLabel}
      </div>
      </div>
    </div>
  );
}

function KeypadBtn({
  children,
  onClick,
  className = '',
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[48px] rounded-lg bg-card border border-border hover:bg-muted transition flex items-center justify-center text-lg font-medium active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export default CategoriesTab;
