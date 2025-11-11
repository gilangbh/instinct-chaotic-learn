/**
 * Solana Configuration
 * Centralized configuration for Solana blockchain integration
 */

export const solanaConfig = {
  // Network
  network: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
  
  // RPC URL
  rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  
  // Program ID (Instinct Trading Program)
  programId: import.meta.env.VITE_SOLANA_PROGRAM_ID || '7gmTYKqNX4xKsrd6NfNRscL3XSUoUTQyyTPhySWoABUc',
  
  // USDC Mint Address (Devnet USDC)
  usdcMint: import.meta.env.VITE_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  
  // Community Wallet (where deposits go)
  communityWallet: import.meta.env.VITE_COMMUNITY_WALLET || '2f2GzFzxrvqQ2E8pAt7EVwq6YWcuZqegA5HBge7qiCfn',
  
  // Community Wallet USDC Token Account (ATA for receiving USDC)
  communityWalletUSDC: import.meta.env.VITE_COMMUNITY_WALLET_USDC || 'He3sCJtvZzeb8fuafZ7cVMeJQVHtjvwfundzJVBCxdS7',
  
  // Explorer base URL
  explorerUrl: import.meta.env.VITE_SOLANA_NETWORK === 'mainnet-beta'
    ? 'https://explorer.solana.com'
    : 'https://explorer.solana.com',
  
  // Cluster suffix for explorer
  get clusterParam() {
    return this.network === 'devnet' ? '?cluster=devnet' : '';
  },
  
  // Get transaction URL
  getTxUrl(signature: string): string {
    return `${this.explorerUrl}/tx/${signature}${this.clusterParam}`;
  },
  
  // Get account URL
  getAccountUrl(address: string): string {
    return `${this.explorerUrl}/address/${address}${this.clusterParam}`;
  },
} as const;

export default solanaConfig;



