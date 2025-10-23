# 🚀 Quick Start Guide - Instinct.fi Demo

Get up and running with the Instinct.fi frontend demo in **under 5 minutes**!

## ⚡ Super Quick Start

```bash
cd instinct-chaotic-learn
npm install
npm run dev
```

Then open:
- 🏠 **Landing Page**: http://localhost:5173
- 🎮 **App Dashboard**: http://localhost:5173/dashboard
- 🎯 **Active Game**: http://localhost:5173/game

## 📍 Available Routes

| Route | Description | Key Features |
|-------|-------------|--------------|
| `/` | Landing Page | Marketing site, "Try Demo" button |
| `/dashboard` | Main Dashboard | Active run status, user stats |
| `/lobby` | Waiting Lobby | Join run, deposit, coin voting |
| `/game` | Active Game | Live voting, price chart, trades |
| `/results` | Game Results | Final P/L, badges, leaderboard |
| `/profile` | User Profile | Stats, badges, XP, history |
| `/history` | Past Runs | Browse completed games |

## 🎯 What to Try

### 1. Explore the Dashboard (2 min)
```
Navigate to: /dashboard
- See active run stats
- Check user profile info
- View badges earned
- Click "Join Game" button
```

### 2. Experience Active Trading (3 min)
```
Navigate to: /game
- View live price chart
- See current chaos parameters (leverage/size)
- Click voting buttons (Long/Short/Skip)
- Watch toast notification confirm vote
- Check participant list
- View last trade results
```

### 3. Join a Waiting Run (2 min)
```
Navigate to: /lobby
- Enter deposit amount (10-100 USDC)
- Select trading coin preference
- See live player list
- Watch countdown timer
```

### 4. View Results (2 min)
```
Navigate to: /results
- See final pool balance
- Check your P/L breakdown
- View awarded badges
- Explore leaderboard
- Try "Withdraw" or "Play Again"
```

### 5. Check Your Profile (1 min)
```
Navigate to: /profile
- View XP and level progress
- Browse badge collection
- Check run history
- See achievement progress
```

## 🎲 Understanding Mock Data

All data comes from `src/lib/mockData.ts`:

```typescript
// Current user
currentUser.xp = 2450
currentUser.badges = [3 badges]

// Active Run #42
activeRun.status = 'active'
activeRun.currentRound = 7/12
activeRun.totalPool = 156.4 USDC (profit!)

// Waiting Run #43
waitingRun.status = 'waiting'
waitingRun.participantCount = 3
waitingRun.countdown = 8 minutes

// Ended Run #41
endedRun.status = 'ended'
endedRun.totalPool = 92.5 USDC (loss)
```

## 🎨 Key UI Components

### Voting Buttons (Active Game)
```tsx
// Long (Buy) - Green button
// Short (Sell) - Red button  
// Skip (Pass) - Gray outline button
```

### Status Badges
```tsx
🟢 WAITING - Blue badge
🔴 ACTIVE - Red badge  
⚫ ENDED - Gray badge
```

### Charts
- **Recharts** line chart showing last 60 minutes
- Updates with mock price data
- Responsive to screen size

## 🔧 Customization Examples

### Change Active Run Status

Edit `src/lib/mockData.ts`:
```typescript
export const activeRun: Run = {
  id: 42,
  status: 'active', // Change to 'waiting' or 'ended'
  currentRound: 7,  // Change to any round 1-12
  totalPool: 156400, // Adjust pool size
  // ... rest of config
};
```

### Add More Users

```typescript
export const mockUsers: User[] = [
  // Add new user
  {
    id: 'user-7',
    walletAddress: '8xYz...3kM9',
    username: 'NewTrader',
    xp: 500,
    totalRuns: 2,
    winRate: 50.0,
    badges: [],
  },
  // ... existing users
];
```

### Modify Badge System

```typescript
export const currentUser: User = {
  // ... other fields
  badges: [
    {
      id: 'badge-custom',
      name: 'Custom Badge',
      emoji: '🚀',
      description: 'Your custom achievement',
      earnedAt: new Date(),
    },
  ],
};
```

## 🎮 Interactive Features

### Toast Notifications
Clicking vote buttons shows toast messages:
```typescript
toast.success('Vote cast: BUY 📈', {
  description: 'Your vote has been recorded!',
});
```

### Navigation
All pages have:
- ← Back button (top left)
- Profile button (top right)
- Status badges
- Breadcrumbs/context

### Responsive Breakpoints
```css
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

## 🎯 Testing Scenarios

### Scenario 1: New User Flow
1. Start at landing page → Click "Try Demo"
2. See dashboard with active run
3. Click "Join Game" 
4. Experience voting interface
5. Check profile to see stats

### Scenario 2: Waiting Phase
1. Go to `/lobby`
2. Change deposit amount with quick buttons
3. Select different coins
4. Watch countdown timer
5. See player list update

### Scenario 3: Results Phase
1. Go to `/results`
2. View P/L breakdown
3. Check badge awards
4. Explore leaderboard
5. Try action buttons

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
# Press Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Chart Not Rendering
- Check browser console for errors
- Ensure `recharts` is installed: `npm i recharts`
- Verify mock data has price data

## 📚 File Reference

### Key Files to Know

```
📁 src/
├── 📄 App.tsx              # Routing setup
├── 📁 pages/
│   ├── 📄 Dashboard.tsx    # Main app screen
│   ├── 📄 ActiveGame.tsx   # Voting interface
│   ├── 📄 Lobby.tsx        # Waiting room
│   ├── 📄 Results.tsx      # Game results
│   ├── 📄 Profile.tsx      # User profile
│   └── 📄 History.tsx      # Past runs
├── 📁 lib/
│   └── 📄 mockData.ts      # ALL MOCK DATA HERE
└── 📁 components/ui/       # shadcn components
```

## 💡 Pro Tips

1. **Start with Dashboard**: It's the main hub
2. **Modify mockData.ts**: All data in one file
3. **Use Browser DevTools**: Check console for logs
4. **Test Responsive**: Use Chrome DevTools mobile view
5. **Watch for Toasts**: They provide user feedback

## 🎨 Design System

### Colors
```typescript
Primary:   #3B82F6 (Blue)
Secondary: #A855F7 (Purple)
Success:   #22C55E (Green)
Error:     #EF4444 (Red)
Warning:   #F59E0B (Yellow)
```

### Spacing
```typescript
xs: 0.5rem  // 8px
sm: 1rem    // 16px
md: 1.5rem  // 24px
lg: 2rem    // 32px
xl: 3rem    // 48px
```

## 🔥 Hot Tips

### Quick Navigation in Code
```bash
# Search for specific component
Ctrl/Cmd + P → "ActiveGame.tsx"

# Find all votes
Ctrl/Cmd + Shift + F → "handleVote"

# Jump to definition
Ctrl/Cmd + Click on function name
```

### Chrome DevTools
```bash
# Responsive mode
Ctrl/Cmd + Shift + M

# Console
Ctrl/Cmd + Option + J

# Network tab
Ctrl/Cmd + Option + I → Network
```

## ✅ Verification Checklist

After starting the app, verify:

- [ ] Landing page loads at `/`
- [ ] "Try Demo" button works
- [ ] Dashboard shows run #42
- [ ] Game page shows price chart
- [ ] Vote buttons show toasts
- [ ] Profile displays badges
- [ ] History shows past runs
- [ ] All navigation links work
- [ ] Responsive on mobile size
- [ ] No console errors

## 🎓 Next Steps

1. **Explore Code**: Read through components
2. **Modify Data**: Change mockData.ts values
3. **Add Features**: Create new components
4. **Style Changes**: Update Tailwind classes
5. **Build**: Run `npm run build` for production

## 🚀 Deploy Demo

### Quick Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Quick Deploy to Netlify
```bash
npm run build
# Drag dist/ folder to netlify.com/drop
```

## 📞 Need Help?

- Read full docs: `APP_README.md`
- Check mock data: `src/lib/mockData.ts`
- Inspect components: `src/pages/`
- Review types: Look for `interface` definitions

---

**Ready? Let's go! 🚀**

```bash
npm run dev
```

Visit http://localhost:5173/dashboard and start exploring!

