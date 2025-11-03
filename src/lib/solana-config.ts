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
  
  // USDC Mint Address
  usdcMint: import.meta.env.VITE_USDC_MINT || '4S3JAFSr7HZg4T8WFPPhXs2HsSz8TyEhEyURVQUxHE5Y',
  
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


