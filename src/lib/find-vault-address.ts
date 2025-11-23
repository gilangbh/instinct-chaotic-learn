/**
 * Utility to find the Run Vault address for a specific run
 * 
 * The vault is a PDA (Program Derived Address) that holds all USDC deposits
 * for a specific run. It's not a regular wallet - it's controlled by the Solana program.
 */

import { PublicKey } from '@solana/web3.js';
import solanaConfig from './solana-config';

/**
 * Get the Run Vault PDA address for a specific run
 * 
 * @param runId - The numeric run ID (from database run.id or createdAt timestamp)
 * @returns The vault PDA address
 */
export function getRunVaultAddress(runId: number | string): string {
  const programId = new PublicKey(solanaConfig.programId);
  
  // Convert runId to buffer (u64 little-endian)
  const runIdBuffer = Buffer.alloc(8);
  const numericId = typeof runId === 'string' ? parseInt(runId) || new Date().getTime() : runId;
  runIdBuffer.writeBigUInt64LE(BigInt(numericId), 0);
  
  // Derive the vault PDA
  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), runIdBuffer],
    programId
  );
  
  return vaultPDA.toString();
}

/**
 * Get both Run PDA and Run Vault PDA addresses
 */
export function getRunAddresses(runId: number | string): {
  runPDA: string;
  vaultPDA: string;
} {
  const programId = new PublicKey(solanaConfig.programId);
  
  // Convert runId to buffer
  const runIdBuffer = Buffer.alloc(8);
  const numericId = typeof runId === 'string' ? parseInt(runId) || new Date().getTime() : runId;
  runIdBuffer.writeBigUInt64LE(BigInt(numericId), 0);
  
  // Derive PDAs
  const [runPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('run'), runIdBuffer],
    programId
  );
  
  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), runIdBuffer],
    programId
  );
  
  return {
    runPDA: runPDA.toString(),
    vaultPDA: vaultPDA.toString(),
  };
}

