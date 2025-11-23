import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  // Use devnet (or custom RPC from env)
  const network = WalletAdapterNetwork.Devnet;

  // Use custom RPC URL from env if available, otherwise use cluster API URL
  const endpoint = useMemo(() => {
    const customRpc = import.meta.env.VITE_SOLANA_RPC_URL;
    if (customRpc) {
      console.log('🌐 Using custom RPC endpoint:', customRpc);
      return customRpc;
    }
    const clusterUrl = clusterApiUrl(network);
    console.log('🌐 Using cluster RPC endpoint:', clusterUrl);
    return clusterUrl;
  }, [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // Add more wallets as needed
    ],
    [network] // Include network in dependency array
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

