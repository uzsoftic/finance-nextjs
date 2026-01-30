# Mobile-First Finance Tracker App

## Overview
This is a production-grade, mobile-first personal finance tracking application built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The app is designed exclusively for mobile (375px first) with a native app feel.

## Architecture

### Bottom Navigation (5 Tabs - Mobile Only)
1. **Accounts** - Wallet management and debt tracking
2. **Transactions** - Transaction history with filters
3. **Categories** (DEFAULT) - Category breakdown with charts
4. **Budget** - Monthly budgets and savings goals
5. **Overview** - Financial analytics and insights

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: lucide-react
- **Charts**: Recharts (PieChart for donut charts)
- **State**: Zustand
- **Database**: Dexie (IndexedDB)

### Key Features

#### 1. Accounts Tab
**Top Segmented Tabs:**
- **Accounts** - List of wallets/cards with balances and currencies
- **Debts** - Track who owes you (green) and who you owe (red)
- **My finances** - Summary cards for total balance, debts, savings

#### 2. Transactions Tab
- Month selector with prev/next navigation
- Search functionality (by category, wallet, note)
- Transactions grouped by date (Today, Yesterday, date)
- Transaction types: Income (green +), Expense (red -), Transfer (neutral)
- Quick add transaction button

#### 3. Categories Tab (Default Open)
- **Toggle**: Switch between Expenses and Income
- **Donut Chart**: Central visualization with total in center
- **Category List**: Sorted by amount (highest to lowest)
- **Month Selector**: Filter by month
- Each category shows: icon, name, amount

#### 4. Budget Tab
- Monthly budget overview
- Sections: Expenses, Savings, Income, Subscriptions, Cycle Payments
- Progress bars for each category
- Highlight exceeded budgets

#### 5. Overview Tab
- Summary cards: Today's spend, Daily avg, Weekly avg, Projected end-of-month
- Top spending categories (sorted)
- Upcoming subscriptions
- Incoming/outgoing debts before deadline
- Vertical scroll layout

### Mobile Optimization

✅ **Mobile-First Design**
- 375px viewport as baseline
- No desktop grids or wide layouts
- Touch-friendly spacing and buttons
- Compact cards and efficient space usage

✅ **Safe Area Support**
- Top and bottom inset padding for notches
- Properly spaced from edges

✅ **Dark Theme**
- Applied by default (`className="dark"` on html)
- Finance app aesthetic colors
- Good contrast and readability

✅ **Fixed Bottom Navigation**
- Always visible 5-tab navigation
- Proper padding for content (pb-20)
- Icons with labels

✅ **Smooth Transitions**
- Page transitions between tabs
- Hover states for interactive elements
- Proper focus states for accessibility

## File Structure

```
/app
  /page.tsx              - Main app entry, tab routing
  /layout.tsx            - Root layout with dark theme
  /globals.css           - Tailwind config + dark theme colors

/components
  /layout
    /main-layout.tsx     - Header + bottom nav
  /tabs
    /accounts-tab.tsx    - Accounts with top tabs
    /transactions-tab.tsx - Transactions + search + month
    /categories-tab.tsx  - Donut chart + categories
    /budget-tab.tsx      - Budget planning
    /overview-tab.tsx    - Financial overview
  /ui                    - shadcn/ui components

/lib
  /models.ts             - TypeScript interfaces
  /store.ts              - Zustand state management
  /db
    /database.ts         - Dexie IndexedDB setup
    /repositories.ts     - Data access layer
  /utils
    /formatting.ts       - Currency, date formatting
```

## Component Hierarchy

```
RootLayout (dark theme enabled)
└── Page (tab router)
    └── MainLayout (header + bottom nav)
        ├── AccountsTab (with top sub-tabs)
        ├── TransactionsTab
        ├── CategoriesTab (default)
        ├── BudgetTab
        └── OverviewTab
```

## State Management

Uses Zustand with IndexedDB persistence:
- Wallets (accounts/cards/savings)
- Transactions (income/expense/transfer)
- Categories (with colors and icons)
- Debts (who owes what)
- Subscriptions
- Savings goals
- User preferences

All data stored locally in browser's IndexedDB.

## Styling Approach

- **Design Tokens**: CSS variables for colors, spacing, radius
- **Dark Theme**: Comprehensive dark mode color palette
- **Tailwind**: Utility-first with predefined tokens
- **Responsive**: Mobile-only (no breakpoints needed)
- **Compact**: Optimal spacing for thumb reach on mobile

## Data Flow

1. **User Interaction** → Component state changes
2. **State Update** → Zustand store updated
3. **Database Sync** → Dexie persists to IndexedDB
4. **UI Render** → Components re-render with new data
5. **Offline First** → All data available offline

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

The app will:
1. Initialize IndexedDB database
2. Load seed data (demo transactions, wallets, debts)
3. Display Categories tab by default
4. Allow navigation via bottom tabs

## Mobile-First Principles Applied

✅ Touch-friendly tap targets (44px minimum)
✅ Vertical scrolling as primary interaction
✅ Thumb-zone optimized layout
✅ No hover states required
✅ Swipe-friendly card layouts
✅ Fast load times (IndexedDB local)
✅ Proper viewport configuration
✅ No desktop responsive breakpoints

## Browser Support

- Modern browsers with IndexedDB support
- Mobile Safari (iOS)
- Chrome/Edge (Android)
- No IE11 support required

## Future Enhancements

- Cloud sync with backend
- Receipt image capture
- Budget notifications
- Recurring transactions
- Multiple users/accounts
- Export to CSV/PDF
- Biometric authentication
