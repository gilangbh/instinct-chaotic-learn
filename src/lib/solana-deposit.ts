/**
 * Solana Deposit Utilities
 * 
 * Functions to interact with the InstinctFi Solana program for deposits
 */

import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import solanaConfig from './solana-config';

/**
 * Build a deposit transaction for joining a run
 * 
 * @param runId - The numeric run ID (from database run.id or createdAt timestamp)
 * @param userPubkey - The user's Solana wallet public key
 * @param amount - Deposit amount in USDC (will be converted to micro-USDC)
 * @param usdcMint - The USDC mint address (should match the vault's mint)
 * @returns Transaction ready to be signed and sent
 */
export async function buildDepositTransaction(
  runId: number,
  userPubkey: PublicKey,
  amount: number,
  usdcMint?: PublicKey
): Promise<Transaction> {
  const programId = new PublicKey(solanaConfig.programId);
  // Use provided mint or fall back to config mint
  const mint = usdcMint || new PublicKey(solanaConfig.usdcMint);

  // Derive PDAs
  const [platformPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('platform')],
    programId
  );

  // Convert runId to buffer (u64 little-endian)
  const runIdBuffer = Buffer.alloc(8);
  runIdBuffer.writeBigUInt64LE(BigInt(runId), 0);

  const [runPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('run'), runIdBuffer],
    programId
  );

  const [userParticipationPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('participation'),
      runIdBuffer,
      userPubkey.toBuffer(),
    ],
    programId
  );

  const [runVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), runIdBuffer],
    programId
  );

  // Get user's USDC token account (associated token account)
  const { getAssociatedTokenAddressSync } = await import('@solana/spl-token');
  const userTokenAccount = getAssociatedTokenAddressSync(
    mint,
    userPubkey
  );

  // Convert USDC to micro-USDC (6 decimals)
  const amountMicro = BigInt(Math.floor(amount * 1_000_000));

  // Build instruction data
  // Discriminator for deposit: [242, 35, 198, 137, 82, 225, 242, 182]
  const discriminator = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]);
  
  const runIdBuf = Buffer.alloc(8);
  runIdBuf.writeBigUInt64LE(BigInt(runId), 0);
  
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(amountMicro, 0);

  const data = Buffer.concat([discriminator, runIdBuf, amountBuf]);

  // Log all derived addresses for debugging
  console.log('🔍 Deposit transaction accounts:');
  console.log('   Platform PDA:', platformPDA.toString());
  console.log('   Run PDA:', runPDA.toString());
  console.log('   User Participation PDA:', userParticipationPDA.toString());
  console.log('   Run Vault PDA:', runVaultPDA.toString());
  console.log('   User Token Account:', userTokenAccount.toString());
  console.log('   USDC Mint:', mint.toString());
  console.log('   User:', userPubkey.toString());
  console.log('   Amount (micro-USDC):', amountMicro.toString());

  // Build instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: platformPDA, isSigner: false, isWritable: false },
      { pubkey: runPDA, isSigner: false, isWritable: true },
      { pubkey: userParticipationPDA, isSigner: false, isWritable: true },
      { pubkey: runVaultPDA, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: userPubkey, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = userPubkey;

  return transaction;
}

/**
 * Build a withdraw transaction for withdrawing funds after run settlement
 * 
 * @param runId - The numeric run ID (from database run.id or createdAt timestamp)
 * @param userPubkey - The user's Solana wallet public key
 * @param usdcMint - The USDC mint address (should match the vault's mint)
 * @returns Transaction ready to be signed and sent
 */
export async function buildWithdrawTransaction(
  runId: number,
  userPubkey: PublicKey,
  usdcMint?: PublicKey
): Promise<Transaction> {
  const programId = new PublicKey(solanaConfig.programId);
  // Use provided mint or fall back to config mint
  const mint = usdcMint || new PublicKey(solanaConfig.usdcMint);

  // Derive PDAs
  const [platformPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('platform')],
    programId
  );

  // Convert runId to buffer (u64 little-endian)
  const runIdBuffer = Buffer.alloc(8);
  runIdBuffer.writeBigUInt64LE(BigInt(runId), 0);

  const [runPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('run'), runIdBuffer],
    programId
  );

  const [userParticipationPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('participation'),
      runIdBuffer,
      userPubkey.toBuffer(),
    ],
    programId
  );

  const [runVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), runIdBuffer],
    programId
  );

  // Get user's USDC token account (associated token account)
  const { getAssociatedTokenAddressSync } = await import('@solana/spl-token');
  const userTokenAccount = getAssociatedTokenAddressSync(
    mint,
    userPubkey
  );

  // Build instruction data
  // Discriminator for withdraw: [183, 18, 70, 156, 148, 109, 161, 34]
  const discriminator = Buffer.from([183, 18, 70, 156, 148, 109, 161, 34]);
  
  const runIdBuf = Buffer.alloc(8);
  runIdBuf.writeBigUInt64LE(BigInt(runId), 0);

  const data = Buffer.concat([discriminator, runIdBuf]);

  // Log all derived addresses for debugging
  console.log('🔍 Withdraw transaction accounts:');
  console.log('   Platform PDA:', platformPDA.toString());
  console.log('   Run PDA:', runPDA.toString());
  console.log('   User Participation PDA:', userParticipationPDA.toString());
  console.log('   Run Vault PDA:', runVaultPDA.toString());
  console.log('   User Token Account:', userTokenAccount.toString());
  console.log('   USDC Mint:', mint.toString());
  console.log('   User:', userPubkey.toString());

  // Build instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: platformPDA, isSigner: false, isWritable: false },
      { pubkey: runPDA, isSigner: false, isWritable: true },
      { pubkey: userParticipationPDA, isSigner: false, isWritable: true },
      { pubkey: runVaultPDA, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId,
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = userPubkey;

  return transaction;
}

/**
 * Get the numeric run ID from a database run ID (CUID)
 * Uses the same logic as the backend: parseInt or createdAt timestamp
 */
export function getNumericRunId(runId: string, createdAt?: Date | string): number {
  // Try to parse as number first
  const parsed = parseInt(runId);
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  // Fall back to timestamp (milliseconds)
  if (createdAt) {
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    return date.getTime();
  }
  
  // Last resort: current timestamp
  return Date.now();
}

