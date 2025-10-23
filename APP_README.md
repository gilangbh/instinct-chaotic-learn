# Instinct.fi Frontend Demo

A comprehensive frontend demo for **Instinct.fi** - a gamified social trading app on Solana with complete mock data.

## 🎮 Overview

This is a fully functional frontend with mockup data showcasing the entire user journey of Instinct.fi, a social trading game where users:

- 🗳️ **Vote together** every 10 minutes on Buy/Sell/Skip decisions
- 🎲 **Embrace chaos** with random leverage (1x-20x) and position sizes
- 💰 **Share outcomes** - profits and losses are distributed proportionally
- 🏆 **Earn rewards** - XP, badges, and achievements for participation
- 👥 **Build community** through collaborative trading

## 🚀 Features

### Complete App Screens

1. **Landing Page** (`/`)
   - Marketing site with product information
   - "Try Demo" button to explore the app
   - Waitlist signup integration

2. **Dashboard** (`/dashboard`)
   - View active/waiting runs
   - User stats overview (XP, runs, win rate, badges)
   - Quick actions to join or spectate games
   - Recent badges display

3. **Lobby** (`/lobby`)
   - Waiting phase for upcoming runs
   - Deposit USDC (10-100 range)
   - Vote for trading coin (SOL, ETH, BTC, etc.)
   - Live player list with deposits
   - Countdown timer to game start

4. **Active Game** (`/game`)
   - Live price chart with real-time data
   - Voting interface (Long/Short/Skip)
   - Strategy display (leverage & position size)
   - Last trade results
   - Player leaderboard
   - Round progress tracker

5. **Results** (`/results`)
   - Final pool balance and P/L
   - Your performance breakdown
   - Badge awards (Most Correct Votes, Perfect Attendance, etc.)
   - Final leaderboard
   - Withdraw/Play Again actions

6. **Profile** (`/profile`)
   - User stats and level progression
   - XP progress bar
   - Badge collection showcase
   - Run history
   - Achievement progress tracking

7. **History** (`/history`)
   - Browse past runs
   - Win/loss statistics
   - Detailed run breakdowns
   - Filter and search capabilities

## 📊 Mock Data

Comprehensive mock data structure in `src/lib/mockData.ts`:

- **Users** - 6 mock users including current user and bot
- **Active Run** - Ongoing game in round 7/12
- **Waiting Run** - Lobby with 3 players waiting
- **Ended Run** - Completed game with results
- **Trades** - Historical trade data with P/L
- **Price Data** - 120 data points for chart visualization
- **Badges** - Achievement system with emojis and descriptions

## 🎨 UI/UX Features

### Design Principles
- **ELI5 Language** - No trading jargon, simple terms like "Buy/Sell"
- **Mobile-First** - Responsive design optimized for all screen sizes
- **Dark Theme** - Gradient backgrounds with neon accents
- **Visual Feedback** - Large buttons, clear status indicators
- **Gamification** - XP, levels, badges, and progress bars

### Components Used
- **shadcn/ui** - Beautiful, accessible UI components
- **Recharts** - Interactive price charts
- **Lucide Icons** - Modern icon system
- **Sonner** - Toast notifications for user feedback
- **Tailwind CSS** - Utility-first styling

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for price visualization

## 📁 Project Structure

```
instinct-chaotic-learn/src/
├── components/
│   ├── ui/              # shadcn/ui components (49 files)
│   ├── HeroSection.tsx  # Landing page hero
│   ├── FeaturesSection.tsx
│   └── ...              # Other landing page sections
├── pages/
│   ├── Index.tsx        # Landing page
│   ├── Dashboard.tsx    # Main app dashboard
│   ├── ActiveGame.tsx   # Live trading game
│   ├── Lobby.tsx        # Waiting room
│   ├── Results.tsx      # Game results
│   ├── Profile.tsx      # User profile
│   └── History.tsx      # Past runs
├── lib/
│   ├── mockData.ts      # All mock data and types
│   └── utils.ts         # Helper functions
├── hooks/
│   ├── use-mobile.tsx   # Mobile detection
│   └── use-toast.ts     # Toast notifications
└── App.tsx              # Main app with routing
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
cd instinct-chaotic-learn
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
```

## 🎯 Key User Flows

### Flow 1: New User Experience
1. Land on homepage → Click "Try Demo"
2. View Dashboard → See active run
3. Click "Join Game" → Go to Active Game screen
4. Vote on trade direction
5. See results after round ends

### Flow 2: Joining a Waiting Run
1. Dashboard → Click "Join Run" on waiting run
2. Enter deposit amount (10-100 USDC)
3. Vote for trading coin preference
4. Wait for countdown to complete
5. Game starts → Vote phase begins

### Flow 3: Viewing Results
1. Game ends after 2 hours
2. View final P/L and pool balance
3. See awarded badges
4. Check leaderboard position
5. Withdraw funds or play again

## 🎲 Game Mechanics (Mock Implementation)

### Voting System
- **Options**: Long (Buy), Short (Sell), Skip (Pass)
- **Timing**: 10-minute voting windows
- **Decision**: Majority vote wins
- **Privacy**: Votes hidden until execution

### Chaos Parameters
- **Random Leverage**: 1x to 20x (displayed before voting)
- **Random Position Size**: 10% to 100% of pool
- **Transparency**: All parameters shown to users

### Rewards System
- **Voting XP**: Earn XP for each vote cast
- **Correct Vote Bonus**: Extra XP for accurate predictions
- **Badges**: Achievement system with 10+ badge types
- **Share Calculation**: Proportional distribution + vote accuracy bonus

## 📱 Responsive Design

All screens are fully responsive:
- **Mobile** (320px+): Optimized touch targets, stacked layouts
- **Tablet** (768px+): Grid layouts, side-by-side content
- **Desktop** (1024px+): Full multi-column layouts

## 🎨 Theme & Styling

### Color Palette
- **Primary**: Blue (#3B82F6) → Calls to action
- **Secondary**: Purple (#A855F7) → Accents
- **Success**: Green (#22C55E) → Profits, wins
- **Error**: Red (#EF4444) → Losses, warnings
- **Warning**: Yellow (#F59E0B) → Alerts, chaos mode

### Typography
- **Font Family**: System fonts (Inter fallback)
- **Headings**: Bold, large sizes (2xl-4xl)
- **Body**: Regular 16-18px for readability
- **Mono**: For countdowns and numeric data

## 🔧 Customization

### Modifying Mock Data

Edit `src/lib/mockData.ts` to customize:
- User profiles and stats
- Run configurations (duration, pool size, etc.)
- Trade history and results
- Badge definitions
- Price chart data

### Adding New Screens

1. Create component in `src/pages/`
2. Import in `src/App.tsx`
3. Add route to `<Routes>` section
4. Update navigation links

### Styling Changes

Use Tailwind utility classes:
```tsx
// Example: Change button color
<Button className="bg-blue-600 hover:bg-blue-500">
  Click Me
</Button>
```

## 🧪 Testing the App

### Manual Testing Checklist

- [ ] Landing page loads correctly
- [ ] "Try Demo" button navigates to dashboard
- [ ] Dashboard shows active run data
- [ ] Navigation between all pages works
- [ ] Vote buttons show toast notifications
- [ ] Charts render with data
- [ ] Responsive on mobile/tablet/desktop
- [ ] All badges display correctly
- [ ] Profile shows user stats

## 📈 Future Enhancements

### Potential Additions
- [ ] Wallet connection (Phantom, Solflare)
- [ ] Real-time WebSocket updates
- [ ] Chat functionality
- [ ] Tutorial/onboarding flow
- [ ] Sound effects and haptics
- [ ] Advanced charts (candlesticks, volume)
- [ ] Filter/sort history
- [ ] Export data to CSV
- [ ] Social sharing features
- [ ] Notification system

## 🎓 Learning Resources

### Understanding the Code
- `mockData.ts` - Start here to understand data structures
- `Dashboard.tsx` - Main app entry point
- `ActiveGame.tsx` - Most complex UI interactions
- Component hierarchy follows feature-based organization

### Key Patterns Used
- **React Router** for client-side routing
- **React Hooks** (useState, useNavigate)
- **Functional Components** throughout
- **TypeScript Interfaces** for type safety
- **Utility Functions** for formatting (formatUSDC, formatTime)

## 🤝 Contributing

This is a demo/prototype. For production implementation:
1. Replace mock data with real API calls
2. Add proper error handling
3. Implement authentication
4. Connect to Solana blockchain
5. Add comprehensive tests

## 📄 License

This demo is part of the Instinct.fi project.

## 🎉 What You Get

✅ **7 Complete Screens** - Full user journey  
✅ **Comprehensive Mock Data** - Realistic test data  
✅ **Beautiful UI** - Modern, gamified design  
✅ **Fully Responsive** - Mobile, tablet, desktop  
✅ **Type-Safe** - Full TypeScript support  
✅ **Production-Ready Components** - shadcn/ui library  
✅ **Interactive Charts** - Real-time price visualization  
✅ **Toast Notifications** - User feedback system  
✅ **Badge System** - Achievement tracking  
✅ **No Backend Required** - Pure frontend demo  

## 🚀 Start Exploring

```bash
npm run dev
```

Then visit `http://localhost:5173/dashboard` to jump straight into the app!

---

**Built with ❤️ for Instinct.fi**

