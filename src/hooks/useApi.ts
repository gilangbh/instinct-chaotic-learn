// React Query hooks for Instinct.fi API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, Run, CreateUserRequest, JoinRunRequest, CastVoteRequest, UserStats, UserLevelInfo } from '@/lib/types';
import { toast } from 'sonner';

// User hooks
export const useUsers = {
  // Get user by ID
  useGetUser: (id: string) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => api.users.getById(id),
      enabled: !!id,
    });
  },

  // Get user by wallet address
  useGetUserByWallet: (walletAddress: string) => {
    return useQuery({
      queryKey: ['user', 'wallet', walletAddress],
      queryFn: () => api.users.getByWallet(walletAddress),
      enabled: !!walletAddress,
    });
  },

  // Get user details (with badges and XP history)
  useGetUserDetails: (id: string) => {
    return useQuery({
      queryKey: ['user', id, 'details'],
      queryFn: () => api.users.getDetails(id),
      enabled: !!id,
    });
  },

  // Get user statistics
  useGetUserStats: (id: string) => {
    return useQuery({
      queryKey: ['user', id, 'stats'],
      queryFn: () => api.users.getStats(id),
      enabled: !!id,
    });
  },

  // Get user level information
  useGetUserLevel: (id: string) => {
    return useQuery({
      queryKey: ['user', id, 'level'],
      queryFn: () => api.users.getLevel(id),
      enabled: !!id,
    });
  },

  // Get leaderboard
  useGetLeaderboard: (limit?: number) => {
    return useQuery({
      queryKey: ['users', 'leaderboard', limit],
      queryFn: () => api.users.getLeaderboard(limit),
    });
  },

  // Create user mutation
  useCreateUser: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (data: CreateUserRequest) => api.users.create(data),
      onSuccess: (response) => {
        if (response.success && response.data) {
          queryClient.setQueryData(['user', response.data.id], response);
          toast.success('User created successfully!');
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create user');
      },
    });
  },

  // Update user mutation
  useUpdateUser: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
        api.users.update(id, data),
      onSuccess: (response, variables) => {
        if (response.success && response.data) {
          queryClient.setQueryData(['user', variables.id], response);
          queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
          toast.success('Profile updated successfully!');
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update profile');
      },
    });
  },
};

// Run hooks
export const useRuns = {
  // Get active runs
  useGetActiveRuns: () => {
    return useQuery({
      queryKey: ['runs', 'active'],
      queryFn: () => api.runs.getActive(),
      refetchInterval: 5000, // Refetch every 5 seconds
    });
  },

  // Get run history
  useGetRunHistory: (page = 1, limit = 20) => {
    return useQuery({
      queryKey: ['runs', 'history', page, limit],
      queryFn: () => api.runs.getHistory(page, limit),
    });
  },

  // Get run by ID
  useGetRun: (id: string) => {
    return useQuery({
      queryKey: ['run', id],
      queryFn: () => api.runs.getById(id),
      enabled: !!id,
      refetchInterval: 5000, // Refetch every 5 seconds
    });
  },

  // Get run participants
  useGetRunParticipants: (id: string) => {
    return useQuery({
      queryKey: ['run', id, 'participants'],
      queryFn: () => api.runs.getParticipants(id),
      enabled: !!id,
    });
  },

  // Get run trades
  useGetRunTrades: (id: string) => {
    return useQuery({
      queryKey: ['run', id, 'trades'],
      queryFn: () => api.runs.getTrades(id),
      enabled: !!id,
    });
  },

  // Get current voting round
  useGetCurrentVotingRound: (id: string) => {
    return useQuery({
      queryKey: ['run', id, 'voting-round'],
      queryFn: () => api.runs.getCurrentVotingRound(id),
      enabled: !!id,
      refetchInterval: 3000, // Refetch every 3 seconds
    });
  },

  // Join run mutation
  useJoinRun: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: JoinRunRequest }) => 
        api.runs.join(id, data),
      onSuccess: (response, variables) => {
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ['run', variables.id] });
          queryClient.invalidateQueries({ queryKey: ['runs', 'active'] });
          toast.success('Successfully joined the run!');
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to join run');
      },
    });
  },

  // Leave run mutation
  useLeaveRun: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (id: string) => api.runs.leave(id),
      onSuccess: (response, id) => {
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ['run', id] });
          queryClient.invalidateQueries({ queryKey: ['runs', 'active'] });
          toast.success('Successfully left the run');
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to leave run');
      },
    });
  },

  // Cast vote mutation
  useCastVote: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, round, choice }: { id: string; round: number; choice: string }) => 
        api.runs.vote(id, { choice: choice as any, round }),
      onSuccess: (response, variables) => {
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ['run', variables.id, 'voting-round'] });
          queryClient.invalidateQueries({ queryKey: ['run', variables.id] });
          toast.success('Vote cast successfully!');
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to cast vote');
      },
    });
  },
};

// Market data hooks
export const useMarket = {
  // Get price history
  useGetPriceHistory: (symbol: string, timeframe: string = '1h') => {
    return useQuery({
      queryKey: ['market', 'price-history', symbol, timeframe],
      queryFn: () => api.market.getPriceHistory(symbol, timeframe),
      enabled: !!symbol,
      refetchInterval: 60000, // Refetch every 1 minute
    });
  },

  // Get current price
  useGetCurrentPrice: (symbol: string) => {
    return useQuery({
      queryKey: ['market', 'price', symbol],
      queryFn: () => api.market.getCurrentPrice(symbol),
      enabled: !!symbol,
      refetchInterval: 60000, // Refetch every 1 minute
    });
  },
};

// Health check hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
    refetchInterval: 30000, // Check every 30 seconds
  });
};

// Utility hook for WebSocket events
export const useWebSocketEvent = (eventType: string, callback: (data: any) => void) => {
  const { useEffect } = require('react');
  
  useEffect(() => {
    const handleEvent = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener(`ws:${eventType}`, handleEvent as EventListener);
    
    return () => {
      window.removeEventListener(`ws:${eventType}`, handleEvent as EventListener);
    };
  }, [eventType, callback]);
};
