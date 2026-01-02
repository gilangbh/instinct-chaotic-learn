// API Service Layer for Instinct.fi
import { User, Run, Badge, VoteChoice, CreateUserRequest, JoinRunRequest, CastVoteRequest, ExtendedUserStats, Item, LoadoutItem, ItemWithLoadout, ActiveBuffs, Achievement, UserStats, UserLevelInfo, RunParticipant, Trade, VotingRound, PriceData } from './types';

// SystemLog type definition
interface SystemLog {
  id: string;
  runId?: string;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const normalizeApiBaseUrl = (value?: string): string => {
  const fallback = 'http://localhost:3001/api/v1';
  if (!value) {
    return fallback;
  }

  const trimmed = value.replace(/\/+$/, '');
  if (trimmed.includes('/api/')) {
    return trimmed;
  }

  return `${trimmed}/api/v1`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// HTTP Client with authentication
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('instinct_fi_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('instinct_fi_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('instinct_fi_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error: unknown) {
      console.error('API request failed:', error);

      // Enhance network errors with more context
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error(
          `NetworkError: Unable to connect to ${url}. Please check if the backend server is running.`
        );
        // Store original error in a way compatible with older TypeScript versions
        (networkError as Error & { cause?: unknown }).cause = error;
        throw networkError;
      }

      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// API Service Functions
export const api = {
  // User endpoints
  users: {
    create: (data: CreateUserRequest) => apiClient.post<User>('/users', data),
    getById: (id: string) => apiClient.get<User>(`/users/${id}`),
    getByWallet: (walletAddress: string) => apiClient.get<User>(`/users/wallet/${walletAddress}`),
    update: (id: string, data: Partial<User>) => apiClient.put<User>(`/users/${id}`, data),
    getDetails: (id: string) => apiClient.get<User & { badges: Badge[]; xpHistory: Array<{ id: string; amount: number; reason: string; createdAt: Date }> }>(`/users/${id}/details`),
    getStats: (id: string) => apiClient.get<UserStats>(`/users/${id}/stats`),
    getLevel: (id: string) => apiClient.get<UserLevelInfo>(`/users/${id}/level`),
    getExtendedStats: (id: string) => apiClient.get<ExtendedUserStats>(`/users/${id}/extended-stats`),
    getAchievements: (id: string) => apiClient.get<Achievement[]>(`/users/${id}/achievements`),
    getLeaderboard: (limit?: number) => apiClient.get<User[]>(`/users/leaderboard${limit ? `?limit=${limit}` : ''}`),
  },

  // Run endpoints
  items: {
    getUserLoadout: (userId: string) => apiClient.get<LoadoutItem[]>(`/items/user/${userId}/loadout`),
    getAvailableItems: (userId: string) => apiClient.get<ItemWithLoadout[]>(`/items/user/${userId}/available`),
    getActiveBuffs: (userId: string) => apiClient.get<ActiveBuffs>(`/items/user/${userId}/buffs`),
    equipItem: (userId: string, itemId: string, slot?: number) =>
      apiClient.post<LoadoutItem>(`/items/user/${userId}/equip`, { itemId, slot }),
    unequipItem: (userId: string, itemId: string) =>
      apiClient.post<void>(`/items/user/${userId}/unequip`, { itemId }),
  },
  runs: {
    getActive: () => apiClient.get<Run[]>('/runs/active'),
    getHistory: (page = 1, limit = 20) => apiClient.get<PaginatedResponse<Run>>(`/runs/history?page=${page}&limit=${limit}`),
    getById: (id: string) => apiClient.get<Run>(`/runs/${id}`),
    create: (data: Partial<Run>) => apiClient.post<Run>('/runs', data),
    join: (id: string, data: JoinRunRequest) => apiClient.post<{ success: boolean; message?: string }>(`/runs/${id}/join`, data),
    leave: (id: string) => apiClient.delete(`/runs/${id}/leave`),
    withdraw: (id: string, data: { userWalletAddress?: string; walletSignature?: string }) =>
      apiClient.post<{ success: boolean; message?: string }>(`/runs/${id}/withdraw`, data),
    vote: (id: string, data: CastVoteRequest & { round: number }) => apiClient.post<{ success: boolean; message?: string }>(`/runs/${id}/vote`, data),
    getParticipants: (id: string) => apiClient.get<RunParticipant[]>(`/runs/${id}/participants`),
    getTrades: (id: string) => apiClient.get<Trade[]>(`/runs/${id}/trades`),
    getUnrealizedPnL: (id: string, round: number) => apiClient.get<{ unrealizedPnL: number | null }>(`/runs/${id}/trades/${round}/unrealized-pnl`),
    getCurrentVotingRound: (id: string) => apiClient.get<VotingRound>(`/runs/${id}/voting-round`),
    getSystemLogs: (id: string, limit: number = 50) => apiClient.get<SystemLog[]>(`/runs/${id}/logs?limit=${limit}`),
    mintTestUsdc: (walletAddress: string, amount: number = 1000) =>
      apiClient.post<{ signature: string; amount: number; walletAddress: string }>('/runs/mint-test-usdc', { walletAddress, amount }),
  },

  // Market data endpoints
  market: {
    getPriceHistory: (symbol: string, timeframe: string = '1h') =>
      apiClient.get<PriceData[]>(`/market/price-history/${symbol}?timeframe=${timeframe}`),
    getCurrentPrice: (symbol: string) =>
      apiClient.get<PriceData>(`/market/price/${symbol}`),
  },

  // Wallet authentication endpoints
  auth: {
    verifyWallet: (data: { walletAddress: string; username: string; message: string; signature: string }) =>
      apiClient.post<User>('/auth/wallet/verify', data),
  },

  waitlist: {
    subscribe: (email: string) => apiClient.post<{ messageId: string }>('/waitlist', { email }),
  },

  // Health check
  health: () => apiClient.get<{ status: string; timestamp: string }>('/health'),
};

// WebSocket connection
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId?: string) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;

      // Authenticate if user ID provided
      if (userId) {
        this.send({
          type: 'AUTHENTICATE',
          data: { userId }
        });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(userId);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(userId?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(message: { type: string; data?: unknown }) {
    // Emit custom events for different message types
    const event = new CustomEvent(`ws:${message.type}`, { detail: message.data });
    window.dispatchEvent(event);
  }

  send(data: { type: string; data?: unknown }) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  subscribeToRun(runId: string) {
    this.send({
      type: 'SUBSCRIBE_RUN',
      data: { runId }
    });
  }

  unsubscribeFromRun(runId: string) {
    this.send({
      type: 'UNSUBSCRIBE_RUN',
      data: { runId }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export API client for direct access if needed
export { apiClient };
export default api;

