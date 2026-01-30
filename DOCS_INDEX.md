# Documentation Index

## Quick Navigation

### Getting Started (5 minutes)
1. **[QUICKSTART.md](./QUICKSTART.md)** - Installation and basic usage
   - How to install and run
   - What's pre-loaded
   - Main screens overview
   - Key features to try

### Understanding the Project
2. **[README.md](./README.md)** - Complete project documentation
   - Feature overview
   - Project structure
   - How data flows
   - Technology stack
   - Database schema

3. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project statistics and completion
   - What was built
   - Complete feature list
   - Technical implementation details
   - Files created
   - Key statistics

### Architecture & Design
4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design documentation
   - System architecture diagrams
   - Component hierarchy
   - Data flow diagrams
   - Database schema details
   - State management structure
   - Repository pattern
   - Transaction integrity rules
   - Performance considerations

5. **[FILE_MANIFEST.md](./FILE_MANIFEST.md)** - Detailed file structure
   - All files created
   - File dependencies
   - Database tables
   - Component breakdown
   - Naming conventions
   - Color palette
   - Configuration details

## Documentation by Purpose

### For New Users
Start here to get the app running:
- [QUICKSTART.md](./QUICKSTART.md) - Run app and explore features
- [README.md](./README.md) - Understand what the app does

### For Developers
Understanding the codebase:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [FILE_MANIFEST.md](./FILE_MANIFEST.md) - File structure
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Technical details

### For Architects
System design and scalability:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Design patterns
- [FILE_MANIFEST.md](./FILE_MANIFEST.md) - Dependencies
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Future readiness

## Key Topics

### Installation & Setup
- See: [QUICKSTART.md - Installation](./QUICKSTART.md#installation)

### Running the App
- See: [QUICKSTART.md - Running the App](./QUICKSTART.md#running-the-app)

### Features Overview
- See: [README.md - Features](./README.md#features)

### Architecture Pattern
- Repository Pattern: [ARCHITECTURE.md - Repository Pattern](./ARCHITECTURE.md#repository-pattern)
- State Management: [ARCHITECTURE.md - State Management](./ARCHITECTURE.md#state-management-flow)
- Data Flow: [ARCHITECTURE.md - Data Flow](./ARCHITECTURE.md#data-flow-diagram)

### Database
- Schema: [ARCHITECTURE.md - Database Schema](./ARCHITECTURE.md#database-schema)
- Tables: [FILE_MANIFEST.md - Database Tables](./FILE_MANIFEST.md#database-tables-and-schemas)

### Components
- Structure: [FILE_MANIFEST.md - Components](./FILE_MANIFEST.md#component-breakdown)
- Types: [README.md - Types](./README.md#type-safety)

### Deployment
- Building: [FILE_MANIFEST.md - Deployment](./FILE_MANIFEST.md#deployment)
- Performance: [FILE_MANIFEST.md - Performance](./FILE_MANIFEST.md#performance-metrics)

### Adding Features
- Extending: [ARCHITECTURE.md - Future Scaling](./ARCHITECTURE.md#future-scaling)

## File Structure

```
/
├── DOCS_INDEX.md           ← You are here
├── QUICKSTART.md           ← Start here for users
├── README.md               ← Complete documentation
├── PROJECT_SUMMARY.md      ← What was built
├── ARCHITECTURE.md         ← How it works
├── FILE_MANIFEST.md        ← File details
│
├── app/
│   ├── page.tsx            ← Main app
│   ├── layout.tsx          ← Root layout
│   └── globals.css         ← Styles
│
├── components/
│   ├── layout/
│   │   └── main-layout.tsx ← Main layout
│   ├── tabs/               ← 6 tab components
│   └── ui/                 ← shadcn components
│
├── lib/
│   ├── models.ts           ← Types
│   ├── store.ts            ← State management
│   ├── utils/
│   │   └── formatting.ts   ← Utilities
│   └── db/
│       ├── database.ts     ← Dexie schema
│       ├── repositories.ts ← Data access
│       └── seed.ts         ← Mock data
│
├── package.json            ← Dependencies
└── tsconfig.json          ← TypeScript config
```

## Quick Reference

### npm Commands
```bash
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Create production build
npm start      # Run production server
npm run lint   # Run ESLint
```

### Key Files to Know

| File | Purpose | Lines |
|------|---------|-------|
| `lib/models.ts` | TypeScript types | 145 |
| `lib/store.ts` | State management | 301 |
| `lib/db/database.ts` | Database schema | 39 |
| `lib/db/repositories.ts` | Data access | 310 |
| `lib/db/seed.ts` | Mock data | 253 |
| `components/layout/main-layout.tsx` | App layout | 87 |
| `components/tabs/overview-tab.tsx` | Dashboard | 233 |
| `components/tabs/accounts-tab.tsx` | Wallets | 189 |
| `components/tabs/transactions-tab.tsx` | Transactions | 225 |
| `components/tabs/categories-tab.tsx` | Categories | 124 |
| `components/tabs/budget-tab.tsx` | Budget | 114 |
| `components/tabs/debts-tab.tsx` | Debts | 221 |

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| Runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| State Management | Zustand |
| Database | Dexie (IndexedDB) |
| Icons | Lucide React |
| Charts | Recharts |

## Feature Checklist

### Core Features
- ✅ Wallet management (multiple currencies)
- ✅ Transaction tracking (income/expense/transfer)
- ✅ Category management
- ✅ Debt tracking (I owe / I am owed)
- ✅ Financial analytics & charts
- ✅ Budget tracking
- ✅ Savings goals

### Technical Features
- ✅ Offline-first architecture
- ✅ IndexedDB persistence
- ✅ Zustand state management
- ✅ TypeScript throughout
- ✅ Responsive mobile design
- ✅ Mock seed data
- ✅ Clean repository pattern

### UI/UX
- ✅ Bottom navigation (5 tabs)
- ✅ Dark theme
- ✅ Mobile-optimized
- ✅ Form validation
- ✅ Real-time updates
- ✅ Color-coded amounts
- ✅ Date grouping

## How to Contribute

### Adding a New Feature

1. **Define types** in `lib/models.ts`
2. **Create schema** in `lib/db/database.ts`
3. **Add repository** in `lib/db/repositories.ts`
4. **Create store actions** in `lib/store.ts`
5. **Build UI component** in `components/`
6. **Add seed data** in `lib/db/seed.ts` (optional)

### Modifying Existing Features

1. Update types if needed
2. Update repository methods
3. Update store actions
4. Update components
5. Test with seed data

### Styling

- Use Tailwind CSS classes
- Follow dark theme colors
- Use semantic design tokens
- Mobile-first approach

## Common Tasks

### Add a New Category
See: [QUICKSTART.md - Add Categories](./QUICKSTART.md#common-tasks)

### Create a Wallet
See: [QUICKSTART.md - Common Tasks](./QUICKSTART.md#common-tasks)

### Add a Transaction
See: [QUICKSTART.md - Common Tasks](./QUICKSTART.md#common-tasks)

### Track Debts
See: [QUICKSTART.md - Common Tasks](./QUICKSTART.md#common-tasks)

### Reset Data
See: [QUICKSTART.md - Troubleshooting](./QUICKSTART.md#reset-data)

## Troubleshooting

### Common Issues
See: [QUICKSTART.md - Troubleshooting](./QUICKSTART.md#troubleshooting)

### Performance Issues
See: [FILE_MANIFEST.md - Performance](./FILE_MANIFEST.md#performance-metrics)

### Browser Issues
See: [FILE_MANIFEST.md - Browser Support](./FILE_MANIFEST.md#browser-compatibility)

## Resources

### Documentation Structure
- User-focused: QUICKSTART.md
- Feature-focused: README.md
- Statistics-focused: PROJECT_SUMMARY.md
- Architecture-focused: ARCHITECTURE.md
- File-focused: FILE_MANIFEST.md

### Code Examples
Look at tab components for:
- Form handling
- State management
- Component composition
- Styling patterns

### Database Examples
Look at seed.ts for:
- Creating records
- Bulk operations
- Data structure examples

## Contact & Support

For issues or questions, review:
1. [QUICKSTART.md](./QUICKSTART.md) - Common questions
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Design questions
3. [README.md](./README.md) - Feature questions

## Version History

**Current Version**: 1.0.0 (Complete)

### What's Included
- Full offline-first personal finance app
- 8 database tables
- 6 tab screens
- 26+ Zustand actions
- 7 repository classes
- Complete TypeScript coverage
- Production-ready code

### Future Enhancements
See: [README.md - Future Enhancements](./README.md#future-enhancements)

---

## Document Map

```
DOCS_INDEX.md (You are here)
├── ├─ QUICKSTART.md (Users: Start here)
│   ├─ README.md (Documentation)
│   ├─ PROJECT_SUMMARY.md (Statistics)
│   ├─ ARCHITECTURE.md (Design)
│   └─ FILE_MANIFEST.md (Files)
```

## Last Updated
January 30, 2026

## Status
✅ Complete and Production-Ready

---

**Total Documentation**: 5 files, ~2,000 lines
**Covers**: Architecture, Files, Features, Setup, Deployment
**For**: Users, Developers, Architects, Contributors
