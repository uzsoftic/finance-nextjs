# Quick Start Guide - Personal Finance Manager

## Installation

```bash
npm install
```

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You Get

The app comes pre-loaded with sample data including:
- 3 wallets (Main Card, Cash, Savings) with UZS currency
- Sample transactions for today and yesterday
- Multiple expense categories (Groceries, Restaurant, Transport, etc.)
- Sample debts (I owe vs I am owed)

## Main Screens

### Overview Tab
Shows dashboard with:
- Total balance across all wallets
- Monthly income and expenses
- Daily chart showing spending patterns
- Category breakdown by percentage

### Accounts Tab
Manage your wallets:
- View all accounts and savings
- Create new wallets with custom currencies
- See current balance per wallet

### Categories Tab
Manage expense/income categories:
- Browse all categories with color coding
- See spending per category
- Create new categories

### Transactions Tab
Track all transactions:
- View transactions grouped by date
- Add new income/expense/transfer transactions
- See category and wallet for each transaction

### Budget Tab
Monitor finances:
- Monthly summary (income vs expenses)
- Savings goals progress
- All wallets overview

### Debts Tab
Track debts:
- "I Owe" - debts you need to pay
- "I Am Owed" - debts others need to pay you
- Update debt status (open, partial, paid)

## Key Features to Try

1. **Add a Transaction**
   - Click "+" on Transactions tab
   - Fill in amount, category, wallet, date
   - Transaction automatically updates wallet balance

2. **Create a Wallet**
   - Go to Accounts tab
   - Click "Add"
   - Set name, type (card/cash/savings), currency, initial balance
   - Wallet added and balance tracked

3. **Track Debts**
   - Go to Debts tab
   - Add a debt (I owe or I am owed)
   - Update status as you pay/receive

4. **View Analytics**
   - Go to Overview tab
   - Change month with navigation arrows
   - See spending breakdown by category

## Data Persistence

All data is stored locally in IndexedDB:
- No server required
- Works completely offline
- Data persists between sessions
- Refreshing page keeps all data

## Customization

### Change Base Currency
Default is UZS. Create wallets with any currency code (USD, EUR, GBP, etc).

### Change App Theme
Edit `app/globals.css` to modify color scheme. Key variables:
- `--background`: App background
- `--foreground`: Text color
- `--primary`: Accent color

### Add Categories
Categories are auto-generated from seed data. Add custom ones in Categories tab.

### Reset Data
To start fresh, open browser DevTools:
1. Go to Application > IndexedDB
2. Delete "FinanceDB" database
3. Refresh page

## Architecture Overview

```
Data Flow:
User Action → React Component
             ↓
         Zustand Store (State)
             ↓
         Repository (Data Access)
             ↓
         IndexedDB (Persistence)
```

Components use the Zustand store to:
- Load data from IndexedDB
- Add/update/delete records
- Maintain data consistency
- Update wallet balances

## Tips & Tricks

1. **Fast Date Entry**: Use datetime picker for easy date/time selection
2. **Bulk Operations**: Create multiple wallets before adding transactions
3. **Category Colors**: Colors in seed data match category types
4. **Month Navigation**: Use arrow buttons to browse different months
5. **Balance Integrity**: Deleting a transaction automatically reverts balance

## Common Tasks

### Add Monthly Salary
- Transactions tab → "+" button
- Type: Income
- Category: Salary
- Wallet: Main Card
- Amount: Your salary
- Date: When you receive it

### Track Shared Expenses
- Add a debt under Debts tab
- "I Owe" if you owe someone
- "I Am Owed" if they owe you
- Update status as you settle

### Split Payment Tracking
- Use "Split" category or create custom one
- Add expense with Split category
- Create debt entry for tracking who owes what

### Monitor Spending
- Overview tab shows category breakdown
- Budget tab shows monthly totals
- All charts update as you add transactions

## Troubleshooting

**Transactions not appearing?**
- Check the wallet is selected correctly
- Verify the date is in selected month
- Check category is not archived

**Balance not updating?**
- Refresh the page
- Check transaction type (income vs expense)
- Verify amount and currency match wallet

**Can't find data?**
- Check you're viewing the correct month
- Verify wallet is selected
- Filter by category if needed

**App feels slow?**
- Close other browser tabs
- Clear browser cache
- Restart browser

## Next Steps

1. Try adding your own transactions
2. Create wallets for different accounts
3. Add custom categories
4. Set up savings goals
5. Track debts and payments

## Need Help?

- Check the README.md for detailed documentation
- Review the project structure in the codebase
- Look at example seed data in `lib/db/seed.ts`

Happy budgeting!
