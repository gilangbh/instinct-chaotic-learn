// API Service Layer for Instinct.fi
import { User, Run, Badge, VoteChoice, CreateUserRequest, JoinRunRequest, CastVoteRequest } from './types';

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
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
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
    getDetails: (id: string) => apiClient.get<User & { badges: Badge[]; xpHistory: any[] }>(`/users/${id}/details`),
    getStats: (id: string) => apiClient.get<any>(`/users/${id}/stats`),
    getLevel: (id: string) => apiClient.get<any>(`/users/${id}/level`),
    getLeaderboard: (limit?: number) => apiClient.get<User[]>(`/users/leaderboard${limit ? `?limit=${limit}` : ''}`),
  },

  // Run endpoints
  runs: {
    getActive: () => apiClient.get<Run[]>('/runs/active'),
    getHistory: (page = 1, limit = 20) => apiClient.get<PaginatedResponse<Run>>(`/runs/history?page=${page}&limit=${limit}`),
    getById: (id: string) => apiClient.get<Run>(`/runs/${id}`),
    create: (data: any) => apiClient.post<Run>('/runs', data),
    join: (id: string, data: JoinRunRequest) => apiClient.post<any>(`/runs/${id}/join`, data),
    leave: (id: string) => apiClient.delete(`/runs/${id}/leave`),
    withdraw: (id: string, data: { userWalletAddress?: string; walletSignature?: string }) => 
      apiClient.post<any>(`/runs/${id}/withdraw`, data),
    vote: (id: string, data: CastVoteRequest & { round: number }) => apiClient.post(`/runs/${id}/vote`, data),
    getParticipants: (id: string) => apiClient.get<any[]>(`/runs/${id}/participants`),
    getTrades: (id: string) => apiClient.get<any[]>(`/runs/${id}/trades`),
    getUnrealizedPnL: (id: string, round: number) => apiClient.get<{ unrealizedPnL: number | null }>(`/runs/${id}/trades/${round}/unrealized-pnl`),
    getCurrentVotingRound: (id: string) => apiClient.get<any>(`/runs/${id}/voting-round`),
    mintTestUsdc: (walletAddress: string, amount: number = 1000) => 
      apiClient.post<{ signature: string; amount: number; walletAddress: string }>('/runs/mint-test-usdc', { walletAddress, amount }),
  },

  // Market data endpoints
  market: {
    getPriceHistory: (symbol: string, timeframe: string = '1h') => 
      apiClient.get<any>(`/market/price-history/${symbol}?timeframe=${timeframe}`),
    getCurrentPrice: (symbol: string) => 
      apiClient.get<any>(`/market/price/${symbol}`),
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
  health: () => apiClient.get<any>('/health'),
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

  private handleMessage(message: any) {
    // Emit custom events for different message types
    const event = new CustomEvent(`ws:${message.type}`, { detail: message.data });
    window.dispatchEvent(event);
  }

  send(data: any) {
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

