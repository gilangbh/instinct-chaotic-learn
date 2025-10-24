import { useEffect, useState, useCallback } from 'react';
import { PriceData } from '@/lib/types';

interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
}

/**
 * Hook to subscribe to real-time price updates via WebSocket
 * No authentication required for public price data
 */
export const usePriceWebSocket = (symbol: string) => {
  const [currentPrice, setCurrentPrice] = useState<PriceUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    // Listen for price update events broadcasted by WebSocket
    const handlePriceUpdate = (event: CustomEvent) => {
      const priceData = event.detail;
      
      if (priceData.symbol === symbol) {
        setCurrentPrice(priceData);
      }
    };

    // Subscribe to price update events
    window.addEventListener(`ws:PRICE_UPDATE`, handlePriceUpdate as EventListener);

    return () => {
      window.removeEventListener(`ws:PRICE_UPDATE`, handlePriceUpdate as EventListener);
    };
  }, [symbol]);

  return {
    currentPrice,
    isConnected,
  };
};

/**
 * Hook to get live price history updates
 * Combines HTTP polling with WebSocket for best of both worlds
 */
export const useLivePriceHistory = (symbol: string, initialData: PriceData[]) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>(initialData);
  const { currentPrice } = usePriceWebSocket(symbol);

  // Update price history when new price comes via WebSocket
  useEffect(() => {
    if (currentPrice && priceHistory.length > 0) {
      const newDataPoint: PriceData = {
        id: `${currentPrice.symbol}_${Date.now()}`,
        symbol: currentPrice.symbol,
        price: currentPrice.price,
        high: currentPrice.price * 1.01, // Approximate
        low: currentPrice.price * 0.99, // Approximate
        volume: 0,
        timestamp: new Date(),
      };

      // Add new point and keep last 60 points
      setPriceHistory((prev) => [...prev.slice(-59), newDataPoint]);
    }
  }, [currentPrice, symbol]);

  // Update history when initial data changes (from HTTP polling)
  useEffect(() => {
    setPriceHistory(initialData);
  }, [initialData]);

  return priceHistory;
};



