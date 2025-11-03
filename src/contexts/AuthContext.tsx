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
      
      // DO NOT fallback to mock data in production
      // User should see the error and cannot proceed
      alert(`Login failed: ${error.message || 'Unable to connect to backend'}`);
      
      // Clear any stored data
      localStorage.removeItem('instinct_fi_wallet');
      localStorage.removeItem('instinct_fi_username');
      apiClient.clearToken();
      
      throw error; // Propagate error so UI can handle it
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
        // Extract user and token from response
        const userData = {
          ...(response.data.user || response.data),
          badges: (response.data.user?.badges || response.data.badges) || [],
        };
        
        // Get the actual JWT token from backend
        const token = (response.data as any).token || (response as any).token;
        
        if (token) {
          apiClient.setToken(token);
          localStorage.setItem('instinct_fi_token', token);
        } else {
          console.warn('No token received from backend, using mock token');
          const mockToken = `wallet_token_${Date.now()}`;
          apiClient.setToken(mockToken);
          localStorage.setItem('instinct_fi_token', mockToken);
        }
        
        setUser(userData);
        localStorage.setItem('instinct_fi_wallet', walletAddress);
        localStorage.setItem('instinct_fi_username', username);
        
        // Initialize WebSocket connection
        initializeWebSocket(userData.id);
      } else {
        throw new Error(response.error || 'Wallet authentication failed');
      }
    } catch (error: any) {
      console.error('Wallet login error:', error);
      
      // DO NOT fallback to mock data - wallet authentication MUST succeed
      alert(`Wallet authentication failed: ${error.message || 'Unable to verify wallet signature with backend'}`);
      
      // Clear any stored data
      localStorage.removeItem('instinct_fi_wallet');
      localStorage.removeItem('instinct_fi_username');
      localStorage.removeItem('instinct_fi_token');
      apiClient.clearToken();
      
      throw error; // Propagate error so user stays on login page
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
