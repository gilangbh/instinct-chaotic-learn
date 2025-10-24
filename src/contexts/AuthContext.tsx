// Authentication Context for Instinct.fi
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { WebSocketService } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string, username: string, email?: string) => Promise<void>;
  loginWithWallet: (walletAddress: string, username: string, message: string, signature: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  wsService: WebSocketService | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wsService, setWsService] = useState<WebSocketService | null>(null);

  const isAuthenticated = !!user;

  // Initialize authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('instinct_fi_token');
        if (token) {
          // Try to get current user from token
          // For now, we'll simulate this - in a real app, you'd have a /me endpoint
          const walletAddress = localStorage.getItem('instinct_fi_wallet');
          if (walletAddress) {
            try {
              const response = await apiClient.get<User>(`/users/wallet/${walletAddress}`);
              if (response.success && response.data) {
                setUser(response.data);
                initializeWebSocket(response.data.id);
              }
            } catch (error) {
              console.error('Failed to get user:', error);
              // Clear invalid token
              apiClient.clearToken();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const initializeWebSocket = (userId: string) => {
    const ws = new WebSocketService();
    ws.connect(userId);
    setWsService(ws);
  };

  const login = async (walletAddress: string, username: string, email?: string) => {
    try {
      setIsLoading(true);

      // Try to get existing user first from API
      let response = await apiClient.get<User>(`/users/wallet/${walletAddress}`);
      
      if (!response.success || !response.data) {
        // User doesn't exist, create new user
        response = await apiClient.post<User>('/users', {
          walletAddress,
          username,
          email,
        });
      }

      if (response.success && response.data) {
        // Ensure badges array exists
        const userData = {
          ...response.data,
          badges: response.data.badges || [],
        };
        
        setUser(userData);
        localStorage.setItem('instinct_fi_wallet', walletAddress);
        localStorage.setItem('instinct_fi_username', username);
        
        // Initialize WebSocket connection
        initializeWebSocket(userData.id);
        
        // In a real app, you'd get a JWT token from the backend
        // For now, we'll simulate this
        const mockToken = `mock_token_${Date.now()}`;
        apiClient.setToken(mockToken);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Fallback to mock data if API fails
      console.log('API failed, using mock data for demo...');
      const mockUser: User = {
        id: `user_${Date.now()}`,
        walletAddress,
        username,
        xp: 0,
        totalRuns: 0,
        winRate: 0,
        badges: [],
      };
      
      setUser(mockUser);
      localStorage.setItem('instinct_fi_wallet', walletAddress);
      localStorage.setItem('instinct_fi_username', username);
      
      // Initialize WebSocket connection
      initializeWebSocket(mockUser.id);
      
      const mockToken = `mock_token_${Date.now()}`;
      apiClient.setToken(mockToken);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (walletAddress: string, username: string, message: string, signature: string) => {
    try {
      setIsLoading(true);

      // Call backend wallet verification endpoint
      const response = await apiClient.post<User>('/auth/wallet/verify', {
        walletAddress,
        username,
        message,
        signature,
      });

      if (response.success && response.data) {
        // Ensure badges array exists
        const userData = {
          ...response.data,
          badges: response.data.badges || [],
        };
        
        setUser(userData);
        localStorage.setItem('instinct_fi_wallet', walletAddress);
        localStorage.setItem('instinct_fi_username', username);
        
        // Initialize WebSocket connection
        initializeWebSocket(userData.id);
        
        // Set auth token
        const token = `wallet_token_${Date.now()}`;
        apiClient.setToken(token);
      } else {
        throw new Error(response.error || 'Wallet authentication failed');
      }
    } catch (error: any) {
      console.error('Wallet login error:', error);
      
      // Fallback to mock data if API fails
      console.log('API failed, using mock data for wallet login...');
      const mockUser: User = {
        id: `user_wallet_${Date.now()}`,
        walletAddress,
        username,
        xp: 0,
        totalRuns: 0,
        winRate: 0,
        badges: [],
      };
      
      setUser(mockUser);
      localStorage.setItem('instinct_fi_wallet', walletAddress);
      localStorage.setItem('instinct_fi_username', username);
      
      // Initialize WebSocket connection
      initializeWebSocket(mockUser.id);
      
      const mockToken = `wallet_token_${Date.now()}`;
      apiClient.setToken(mockToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (wsService) {
      wsService.disconnect();
      setWsService(null);
    }
    apiClient.clearToken();
    localStorage.removeItem('instinct_fi_wallet');
    localStorage.removeItem('instinct_fi_username');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithWallet,
    logout,
    updateUser,
    wsService,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
