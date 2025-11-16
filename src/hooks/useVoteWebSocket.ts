import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface VoteDistribution {
  long: number;
  short: number;
  skip: number;
}

interface VoteUpdate {
  runId: string;
  round: number;
  voteDistribution: VoteDistribution;
  timeRemaining: number;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

const getWebSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  // Convert HTTP URL to WebSocket URL
  const wsUrl = apiUrl
    .replace(/^http:/, 'ws:')
    .replace(/^https:/, 'wss:')
    .replace(/\/api\/v1$/, '')
    .replace(/\/$/, '');
  return `${wsUrl}/ws`;
};

/**
 * Hook to subscribe to real-time vote updates via WebSocket for a specific run
 */
export const useVoteWebSocket = (runId: string | undefined) => {
  const { user } = useAuth();
  const [voteUpdate, setVoteUpdate] = useState<VoteUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!runId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected to vote updates');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Authenticate if user is available
        if (user?.id) {
          ws.send(
            JSON.stringify({
              type: 'AUTHENTICATE',
              data: { userId: user.id },
            })
          );
        }

        // Subscribe to run updates
        ws.send(
          JSON.stringify({
            type: 'SUBSCRIBE_RUN',
            data: { runId },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'AUTHENTICATED':
              console.log('[WebSocket] Authenticated');
              break;
            case 'SUBSCRIBED':
              console.log('[WebSocket] Subscribed to run:', message.data.runId);
              break;
            case 'VOTE_UPDATE':
              if (message.data.runId === runId) {
                setVoteUpdate(message.data as VoteUpdate);
              }
              break;
            case 'PONG':
              // Heartbeat response
              break;
            case 'ERROR':
              console.error('[WebSocket] Error:', message.data.error);
              break;
            default:
              console.log('[WebSocket] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current += 1;
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('[WebSocket] Max reconnect attempts reached');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error);
      setIsConnected(false);
    }
  }, [runId, user?.id]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Connect when runId is available
  useEffect(() => {
    if (runId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [runId, connect, disconnect]);

  // Send ping to keep connection alive
  useEffect(() => {
    if (!isConnected || !wsRef.current) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  return {
    voteUpdate,
    isConnected,
    reconnect: connect,
  };
};

