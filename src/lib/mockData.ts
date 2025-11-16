// Mock Data for Instinct.fi

export interface User {
  id: string;
  walletAddress: string;
  username: string;
  xp: number;
  totalRuns: number;
  winRate: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earnedAt: Date;
}

export interface Run {
  id: number;
  status: 'waiting' | 'active' | 'ended';
  tradingPair: string;
  coin: string;
  participantCount: number;
  totalPool: number;
  startingPool: number;
  minDeposit: number;
  maxDeposit: number;
  maxParticipants: number;
  startedAt?: Date;
  endedAt?: Date;
  currentRound: number;
  totalRounds: number;
  duration: number; // in minutes
  votingInterval: number; // in minutes
  participants: Participant[];
  trades: Trade[];
  countdown?: number; // seconds until start/next vote
}

export interface Participant {
  user: User;
  depositAmount: number;
  withdrawn: boolean;
  finalShare?: number;
  votesCorrect: number;
  totalVotes: number;
}

export interface Trade {
  id: string;
  round: number;
  timestamp: Date;
  direction: 'long' | 'short' | 'skip';
  leverage: number;
  positionSize: number; // percentage of pool
  entryPrice: number;
  exitPrice?: number;
  pnl: number;
  pnlPercentage: number;
  votes: VoteDistribution;
}

export interface VoteDistribution {
  long: number;
  short: number;
  skip: number;
}

export interface VotingRound {
  round: number;
  status: 'open' | 'closed' | 'executing' | 'settled';
  timeRemaining: number; // seconds
  leverage: number;
  positionSize: number;
  currentPrice: number;
  priceChange24h: number;
  userVote?: 'long' | 'short' | 'skip';
  voteDistribution?: VoteDistribution;
}

export interface PriceData {
  timestamp: Date;
  price: number;
  high: number;
  low: number;
  volume: number;
}

// Current User (Mock)
export const currentUser: User = {
  id: 'user-1',
  walletAddress: '7xKz...9kL2',
  username: 'CryptoNinja',
  xp: 2450,
  totalRuns: 12,
  winRate: 58.3,
  badges: [
    {
      id: 'badge-1',
      name: 'Most Correct Votes',
      emoji: '🎯',
      description: 'Won most prediction votes in a run',
      earnedAt: new Date('2025-10-14'),
    },
    {
      id: 'badge-2',
      name: 'Perfect Attendance',
      emoji: '🗳️',
      description: 'Voted in all rounds',
      earnedAt: new Date('2025-10-13'),
    },
    {
      id: 'badge-3',
      name: 'Lucky Winner',
      emoji: '🍀',
      description: 'Won 5 runs in a row',
      earnedAt: new Date('2025-10-10'),
    },
  ],
};

// Mock Users
export const mockUsers: User[] = [
  currentUser,
  {
    id: 'user-2',
    walletAddress: '3yHd...5mP8',
    username: 'MoonTrader',
    xp: 1850,
    totalRuns: 8,
    winRate: 62.5,
    badges: [],
  },
  {
    id: 'user-3',
    walletAddress: '9pQw...2nK5',
    username: 'DiamondHands',
    xp: 3200,
    totalRuns: 15,
    winRate: 53.3,
    badges: [],
  },
  {
    id: 'user-4',
    walletAddress: '4rTy...8lM3',
    username: 'SolanaKing',
    xp: 1200,
    totalRuns: 5,
    winRate: 40.0,
    badges: [],
  },
  {
    id: 'user-5',
    walletAddress: '6wEr...4pN9',
    username: 'HODLer',
    xp: 980,
    totalRuns: 4,
    winRate: 75.0,
    badges: [],
  },
  {
    id: 'bot-1',
    walletAddress: 'Bot...Bot1',
    username: 'GameBot',
    xp: 0,
    totalRuns: 100,
    winRate: 50.0,
    badges: [],
  },
];

// Active Run (Currently in progress)
export const activeRun: Run = {
  id: 42,
  status: 'active',
  tradingPair: 'SOL/USDC',
  coin: 'SOL',
  participantCount: 6,
  totalPool: 156400, // 156.4 USDC (in cents for precision)
  startingPool: 127000, // 127 USDC
  minDeposit: 10000, // 10 USDC
  maxDeposit: 100000, // 100 USDC
  maxParticipants: 100,
  startedAt: new Date(Date.now() - 65 * 60 * 1000), // Started 65 minutes ago
  currentRound: 7,
  totalRounds: 12,
  duration: 120, // 2 hours
  votingInterval: 10, // 10 minutes
  countdown: 420, // 7 minutes until next vote closes
  participants: [
    {
      user: currentUser,
      depositAmount: 50000,
      withdrawn: false,
      votesCorrect: 5,
      totalVotes: 6,
    },
    {
      user: mockUsers[1],
      depositAmount: 25000,
      withdrawn: false,
      votesCorrect: 4,
      totalVotes: 6,
    },
    {
      user: mockUsers[2],
      depositAmount: 30000,
      withdrawn: false,
      votesCorrect: 3,
      totalVotes: 6,
    },
    {
      user: mockUsers[3],
      depositAmount: 20000,
      withdrawn: false,
      votesCorrect: 2,
      totalVotes: 5,
    },
    {
      user: mockUsers[4],
      depositAmount: 42000,
      withdrawn: false,
      votesCorrect: 4,
      totalVotes: 6,
    },
    {
      user: mockUsers[5],
      depositAmount: 10000,
      withdrawn: false,
      votesCorrect: 3,
      totalVotes: 6,
    },
  ],
  trades: [
    {
      id: 'trade-1',
      round: 1,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      direction: 'long',
      leverage: 3,
      positionSize: 45,
      entryPrice: 142.5,
      exitPrice: 145.2,
      pnl: 5800,
      pnlPercentage: 4.5,
      votes: { long: 4, short: 1, skip: 1 },
    },
    {
      id: 'trade-2',
      round: 2,
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      direction: 'short',
      leverage: 8,
      positionSize: 60,
      entryPrice: 145.2,
      exitPrice: 146.8,
      pnl: -3200,
      pnlPercentage: -2.4,
      votes: { long: 2, short: 3, skip: 1 },
    },
    {
      id: 'trade-3',
      round: 3,
      timestamp: new Date(Date.now() - 40 * 60 * 1000),
      direction: 'skip',
      leverage: 0,
      positionSize: 0,
      entryPrice: 146.8,
      pnl: 0,
      pnlPercentage: 0,
      votes: { long: 2, short: 1, skip: 3 },
    },
    {
      id: 'trade-4',
      round: 4,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      direction: 'long',
      leverage: 5,
      positionSize: 70,
      entryPrice: 146.8,
      exitPrice: 151.2,
      pnl: 12600,
      pnlPercentage: 9.8,
      votes: { long: 5, short: 1, skip: 0 },
    },
    {
      id: 'trade-5',
      round: 5,
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      direction: 'long',
      leverage: 12,
      positionSize: 80,
      entryPrice: 151.2,
      exitPrice: 155.8,
      pnl: 18400,
      pnlPercentage: 14.2,
      votes: { long: 4, short: 2, skip: 0 },
    },
    {
      id: 'trade-6',
      round: 6,
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      direction: 'short',
      leverage: 4,
      positionSize: 50,
      entryPrice: 155.8,
      exitPrice: 153.6,
      pnl: 4200,
      pnlPercentage: 3.2,
      votes: { long: 1, short: 4, skip: 1 },
    },
  ],
};

// Waiting Run (Lobby phase)
export const waitingRun: Run = {
  id: 43,
  status: 'waiting',
  tradingPair: 'TBD',
  coin: 'TBD',
  participantCount: 3,
  totalPool: 65000,
  startingPool: 65000,
  minDeposit: 10000,
  maxDeposit: 100000,
  maxParticipants: 100,
  currentRound: 0,
  totalRounds: 12,
  duration: 120,
  votingInterval: 10,
  countdown: 480, // 8 minutes until start
  participants: [
    {
      user: mockUsers[1],
      depositAmount: 30000,
      withdrawn: false,
      votesCorrect: 0,
      totalVotes: 0,
    },
    {
      user: mockUsers[2],
      depositAmount: 25000,
      withdrawn: false,
      votesCorrect: 0,
      totalVotes: 0,
    },
    {
      user: mockUsers[5],
      depositAmount: 10000,
      withdrawn: false,
      votesCorrect: 0,
      totalVotes: 0,
    },
  ],
  trades: [],
};

// Ended Run (Results phase)
export const endedRun: Run = {
  id: 41,
  status: 'ended',
  tradingPair: 'BTC/USDC',
  coin: 'BTC',
  participantCount: 5,
  totalPool: 92500,
  startingPool: 105000,
  minDeposit: 10000,
  maxDeposit: 100000,
  maxParticipants: 100,
  startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  endedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  currentRound: 12,
  totalRounds: 12,
  duration: 120,
  votingInterval: 10,
  participants: [
    {
      user: currentUser,
      depositAmount: 40000,
      withdrawn: false,
      finalShare: 35200,
      votesCorrect: 7,
      totalVotes: 12,
    },
    {
      user: mockUsers[1],
      depositAmount: 25000,
      withdrawn: true,
      finalShare: 22000,
      votesCorrect: 8,
      totalVotes: 12,
    },
    {
      user: mockUsers[2],
      depositAmount: 20000,
      withdrawn: false,
      finalShare: 17600,
      votesCorrect: 6,
      totalVotes: 10,
    },
    {
      user: mockUsers[3],
      depositAmount: 10000,
      withdrawn: false,
      finalShare: 8800,
      votesCorrect: 5,
      totalVotes: 8,
    },
    {
      user: mockUsers[5],
      depositAmount: 10000,
      withdrawn: false,
      finalShare: 8900,
      votesCorrect: 6,
      totalVotes: 12,
    },
  ],
  trades: [
    // Simplified - just showing it had trades
    {
      id: 'trade-41-1',
      round: 1,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      direction: 'short',
      leverage: 5,
      positionSize: 60,
      entryPrice: 68200,
      exitPrice: 67100,
      pnl: 8500,
      pnlPercentage: 8.1,
      votes: { long: 2, short: 3, skip: 0 },
    },
  ],
};

// Current Voting Round (for active run)
export const currentVotingRound: VotingRound = {
  round: 7,
  status: 'open',
  timeRemaining: 420, // 7 minutes
  leverage: 6,
  positionSize: 55,
  currentPrice: 153.6,
  priceChange24h: 2.3,
  userVote: undefined, // User hasn't voted yet
};

// Price Chart Data (Last 2 hours)
export const priceChartData: PriceData[] = Array.from({ length: 120 }, (_, i) => {
  const basePrice = 142.5;
  const volatility = 8;
  const trend = 0.08;
  const time = Date.now() - (120 - i) * 60 * 1000;
  const noise = Math.sin(i / 10) * volatility + Math.random() * 3;
  const price = basePrice + trend * i + noise;

  return {
    timestamp: new Date(time),
    price: parseFloat(price.toFixed(2)),
    high: parseFloat((price + Math.random() * 2).toFixed(2)),
    low: parseFloat((price - Math.random() * 2).toFixed(2)),
    volume: Math.floor(Math.random() * 100000) + 50000,
  };
});

// Run History (Past runs)
export const runHistory: Run[] = [
  endedRun,
  {
    id: 40,
    status: 'ended',
    tradingPair: 'ETH/USDC',
    coin: 'ETH',
    participantCount: 8,
    totalPool: 168000,
    startingPool: 160000,
    minDeposit: 10000,
    maxDeposit: 100000,
    maxParticipants: 100,
    startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    currentRound: 12,
    totalRounds: 12,
    duration: 120,
    votingInterval: 10,
    participants: [],
    trades: [],
  },
  {
    id: 39,
    status: 'ended',
    tradingPair: 'SOL/USDC',
    coin: 'SOL',
    participantCount: 4,
    totalPool: 35000,
    startingPool: 75000,
    minDeposit: 10000,
    maxDeposit: 100000,
    maxParticipants: 100,
    startedAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    endedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    currentRound: 12,
    totalRounds: 12,
    duration: 120,
    votingInterval: 10,
    participants: [],
    trades: [],
  },
];

// Helper Functions
export const formatUSDC = (amount: number): string => {
  return (amount / 100).toFixed(2);
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getRunStatusColor = (status: string): string => {
  switch (status) {
    case 'waiting':
      return 'text-blue-500';
    case 'active':
      return 'text-green-500';
    case 'ended':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
};

export const getRunStatusEmoji = (status: string): string => {
  switch (status) {
    case 'waiting':
      return '🟢';
    case 'active':
      return '🔴';
    case 'ended':
      return '⚫';
    default:
      return '⚪';
  }
};

