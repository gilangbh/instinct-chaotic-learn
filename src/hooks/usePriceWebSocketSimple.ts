import { useEffect, useState } from 'react';

/**
 * Hook to connect to WebSocket for price updates without authentication
 * This provides real-time price updates every 5 seconds
 */
export const usePriceWebSocket = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [priceUpdates, setPriceUpdates] = useState<Map<string, { price: number; change24h: number }>>(new Map());

  useEffect(() => {
    // Connect to WebSocket without authentication
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('✅ Connected to price WebSocket');
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'PRICE_UPDATE') {
          const { symbol, price, change24h } = message.data;
          setPriceUpdates(prev => {
            const newMap = new Map(prev);
            newMap.set(symbol, { price, change24h });
            return newMap;
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, []);

  return {
    isConnected,
    priceUpdates,
    getPrice: (symbol: string) => priceUpdates.get(symbol),
  };
};



