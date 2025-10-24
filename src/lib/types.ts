// Type definitions for Instinct.fi API integration
// These types match the backend API types

export interface User {
  id: string;
  walletAddress: string;
  username: string;
  email?: string;
  xp: number;
  totalRuns: number;
  winRate: number;
  reputation?: number;
  isBanned?: boolean;
  banReason?: string;
  banExpiresAt?: Date;
  badges?: Array<{
    id: string;
    name: string;
    emoji: string;
    description: string;
    earnedAt: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  xpReward: number;
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge: Badge;
}

export interface Run {
  id: string;
  status: 'WAITING' | 'ACTIVE' | 'SETTLING' | 'COOLDOWN' | 'ENDED';
  tradingPair: string;
  coin: string;
  duration: number;
  votingInterval: number;
  minDeposit: number;
  maxDeposit: number;
  maxParticipants: number;
  totalPool: number;
  startingPool: number;
  currentRound: number;
  totalRounds: number;
  countdown?: number;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  participants?: RunParticipant[];
  trades?: Trade[];
  votingRounds?: VotingRound[];
}

export interface RunParticipant {
  id: string;
  runId: string;
  userId: string;
  depositAmount: number;
  withdrawn: boolean;
  finalShare?: number;
  votesCorrect: number;
  totalVotes: number;
  joinedAt: Date;
  withdrawnAt?: Date;
  user?: User;
}

export interface Trade {
  id: string;
  runId: string;
  round: number;
  direction: 'LONG' | 'SHORT' | 'SKIP';
  leverage: number;
  positionSize: number;
  entryPrice: number;
  exitPrice?: number;
  pnl: number;
  pnlPercentage: number;
  executedAt: Date;
  settledAt?: Date;
}

export interface Vote {
  id: string;
  runId: string;
  userId: string;
  round: number;
  choice: VoteChoice;
  votedAt: Date;
  user?: User;
}

export interface VotingRound {
  id: string;
  runId: string;
  round: number;
  status: 'OPEN' | 'CLOSED' | 'EXECUTING' | 'SETTLED';
  timeRemaining: number;
  leverage: number;
  positionSize: number;
  currentPrice: number;
  priceChange24h: number;
  voteDistribution?: VoteDistribution;
  startedAt: Date;
  closedAt?: Date;
  executedAt?: Date;
}

export interface VoteDistribution {
  long: number;
  short: number;
  skip: number;
}

export interface ChatMessage {
  id: string;
  runId: string;
  userId: string;
  message: string;
  downvotes: number;
  isDeleted: boolean;
  createdAt: Date;
  user?: User;
}

export interface XpHistory {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  runId?: string;
  createdAt: Date;
}

export interface PriceData {
  id: string;
  symbol: string;
  price: number;
  high: number;
  low: number;
  volume: number;
  change24h?: number;
  timestamp: Date;
}

// API Request/Response types
export interface CreateUserRequest {
  walletAddress: string;
  username: string;
  email?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
}

export interface JoinRunRequest {
  depositAmount: number;
}

export interface CastVoteRequest {
  choice: VoteChoice;
}

export interface SendMessageRequest {
  message: string;
}

// Enums
export type VoteChoice = 'LONG' | 'SHORT' | 'SKIP';
export type RunStatus = 'WAITING' | 'ACTIVE' | 'SETTLING' | 'COOLDOWN' | 'ENDED';
export type TradeDirection = 'LONG' | 'SHORT' | 'SKIP';
export type RoundStatus = 'OPEN' | 'CLOSED' | 'EXECUTING' | 'SETTLED';

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface RunUpdateMessage {
  type: 'RUN_UPDATE';
  data: {
    runId: string;
    status: RunStatus;
    currentRound: number;
    countdown?: number;
    totalPool: number;
  };
}

export interface VoteUpdateMessage {
  type: 'VOTE_UPDATE';
  data: {
    runId: string;
    round: number;
    voteDistribution: VoteDistribution;
    timeRemaining: number;
  };
}

export interface TradeUpdateMessage {
  type: 'TRADE_UPDATE';
  data: {
    runId: string;
    trade: Trade;
  };
}

export interface ChatMessageUpdateMessage {
  type: 'CHAT_MESSAGE';
  data: {
    runId: string;
    message: ChatMessage;
  };
}

export interface PriceUpdateMessage {
  type: 'PRICE_UPDATE';
  data: {
    symbol: string;
    price: number;
    change24h: number;
  };
}

// User statistics
export interface UserStats {
  totalRuns: number;
  winRate: number;
  totalVotes: number;
  correctVotes: number;
  consecutiveWins: number;
  consecutiveParticipation: number;
  totalXp: number;
}

// Level information
export interface UserLevelInfo {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  progress: number;
}
