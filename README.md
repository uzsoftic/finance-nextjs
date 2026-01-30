# Personal Finance Manager - Production-Grade Web App

A mobile-first personal finance management app built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Features offline-first architecture with IndexedDB for data persistence.

## Features

### Core Functionality
- **Wallets/Accounts Management**: Create and manage multiple wallets (cash, card, savings) with different currencies
- **Transactions**: Track income, expenses, and transfers with categories and notes
- **Categories**: Customizable expense/income categories with icons and colors
- **Debts**: Track debts owed and debts you're owed with status updates
- **Overview Dashboard**: Visual charts showing daily spending, category breakdown, and financial metrics
- **Budget Tracking**: Monitor monthly spending, income, and savings goals

### Technical Features
- **Offline-First Architecture**: Uses IndexedDB (Dexie) for client-side data persistence
- **Responsive Design**: Mobile-first design that works seamlessly on all screen sizes
- **Real-Time State Management**: Zustand for application state with devtools support
- **Type Safety**: Full TypeScript implementation for type safety
- **Mock Seed Data**: Comes pre-populated with example data for immediate use

## Project Structure

```
├── app/
│   ├── page.tsx                 # Main app entry point
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── layout/
│   │   └── main-layout.tsx      # Main app layout with navigation
│   └── tabs/
│       ├── overview-tab.tsx     # Dashboard with charts
│       ├── accounts-tab.tsx     # Wallet management
│       ├── transactions-tab.tsx # Transaction list and creation
│       ├── categories-tab.tsx   # Category management
│       ├── budget-tab.tsx       # Budget and goals
│       └── debts-tab.tsx        # Debt tracking
├── lib/
│   ├── models.ts                # TypeScript types and interfaces
│   ├── store.ts                 # Zustand state management
│   ├── utils/
│   │   └── formatting.ts        # Date, currency, and number formatting
│   └── db/
│       ├── database.ts          # Dexie database schema
│       ├── repositories.ts      # Data access layer
│       └── seed.ts              # Initial seed data
└── components/ui/               # shadcn/ui components
```

## Key Files Explained

### `lib/models.ts`
Defines all TypeScript interfaces:
- `Wallet`: Account/wallet data structure
- `Transaction`: Income/expense/transfer records
- `Category`: Expense categories with icons
- `Debt`: Debt tracking records
- `SavingsGoal`: Goals for saving money
- `UserPreferences`: User settings (currency, theme, time format)

### `lib/db/database.ts`
Dexie database schema definition:
- Creates tables for all entities
- Defines indexes for efficient querying
- Handles version management

### `lib/db/repositories.ts`
Clean data access layer with repository classes:
- `WalletRepository`: Wallet CRUD operations
- `TransactionRepository`: Transaction queries and updates
- `CategoryRepository`: Category management
- `DebtRepository`: Debt operations
- Each repository handles balance updates and data consistency

### `lib/store.ts`
Zustand store with actions for:
- Loading data from IndexedDB
- Adding/updating/deleting entities
- Maintaining balance consistency
- Global state management

### `lib/utils/formatting.ts`
Utility functions for:
- Currency formatting (supports multiple currencies)
- Date formatting with i18n support
- Number formatting
- Color and icon helpers

## How Data Flows

1. **Initialization**: App loads, `initialize()` is called which seeds database if empty
2. **Load Data**: All repositories load data into Zustand store
3. **User Interaction**: Components trigger store actions (add, update, delete)
4. **Persist**: Store actions use repositories to persist to IndexedDB
5. **Update Balance**: Transactions automatically update wallet balances
6. **Re-render**: React automatically re-renders with new state

## Transactions and Balance Integrity

When a transaction is added:
1. Create transaction record
2. Update wallet `currentBalance` based on transaction type:
   - Income: `balance += amount`
   - Expense: `balance -= amount`
   - Transfer: Source and destination wallets updated

When a transaction is deleted:
1. Revert the balance effect
2. Delete transaction record

When a transaction is updated:
1. Revert old balance effect
2. Apply new balance effect
3. Update transaction

This ensures balance integrity even if transactions are edited or deleted.

## Multi-Currency Support

- Each wallet can have a different currency (UZS, USD, EUR, etc.)
- Transactions inherit wallet's currency
- Categories and debts support any currency
- No automatic currency conversion (user manually defines rates if needed)

## Customization Points

### Add New Categories
New default categories can be added in `DEFAULT_CATEGORIES` in `lib/models.ts`.

### Add New Wallet Types
Wallet types are defined in the `WalletType` union. Add new type and corresponding icon in `accounts-tab.tsx`.

### Customize Colors
All colors use Tailwind classes. Modify theme colors in `globals.css` to change app appearance.

### Add New Transaction Fields
Update `Transaction` interface in `models.ts` and corresponding repository methods.

## Performance Considerations

- **Virtualization Ready**: Structure supports `react-virtual` for large lists
- **Indexed Queries**: All frequently accessed fields are indexed in IndexedDB
- **Lazy Loading**: Components only load data they need
- **Memoization**: useMemo used throughout to prevent unnecessary recalculations

## Future Enhancements

- Server sync: Connect to real backend API without changing UI
- Recurring transactions: Automatic transaction generation
- Budget alerts: Notifications when categories exceed budget
- Export/Import: CSV/JSON export and import
- Multi-device sync: Cloud synchronization
- Advanced analytics: Trend analysis and forecasting
- Subscriptions: Automatic payment tracking
- Tax reports: Generate tax documentation

## Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open http://localhost:3000
4. App comes with seed data pre-loaded
5. All data is stored locally in IndexedDB

## Database Schema

### Wallets Table
- `id` (primary key)
- `name`, `currency`, `type`, `currentBalance`
- `icon`, `color`, `group`, `active`
- Indexes: `active`, `group`, `currency`

### Transactions Table
- `id` (primary key)
- `type`, `amount`, `currency`, `walletId`, `categoryId`
- `dateTime`, `note`, `tags`
- Indexes: `walletId`, `categoryId`, `[walletId+dateTime]`

### Categories Table
- `id` (primary key)
- `name`, `type`, `icon`, `color`, `archived`
- Indexes: `archived`, `type`

### Debts Table
- `id` (primary key)
- `personOrEntityName`, `amount`, `currency`, `direction`, `status`
- Indexes: `direction`, `status`, `currency`

### Wallets, Subscriptions, Goals, Preferences
Similar structure with appropriate indexes for common queries.

## Browser Support

- Modern browsers with IndexedDB support
- Works offline completely
- Sync-ready for server integration

## License

Created with v0.app - MIT License
