import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress
} from '@solana/spl-token';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatUSDC, formatTime } from '@/lib/mockData';
import { ArrowLeft, Coins, Users, Clock, Dice5, Plus, Wallet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRuns } from '@/hooks/useApi';
import { buildDepositTransaction, getNumericRunId } from '@/lib/solana-deposit';
import solanaConfig from '@/lib/solana-config';

export default function Lobby() {
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();
  const { user } = useAuth();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  
  const [depositAmount, setDepositAmount] = useState('50');
  const [selectedCoin, setSelectedCoin] = useState<string>('SOL'); // Auto-select SOL as default
  const [hasJoined, setHasJoined] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  // Fetch run data from API (MUST be before early returns)
  const { data: runResponse, isLoading: runLoading } = useRuns.useGetRun(runId || '');
  const joinRunMutation = useRuns.useJoinRun();

  // Memoize fetchBalances to prevent infinite re-renders (MUST be before early returns)
  const fetchBalances = useCallback(async () => {
    if (!publicKey || !connected) return;

    try {
      // Get SOL balance
      const solBal = await connection.getBalance(publicKey);
      setSolBalance(solBal / LAMPORTS_PER_SOL);

      // Get USDC balance
      try {
        const usdcMint = new PublicKey(solanaConfig.usdcMint);
        const ata = await getAssociatedTokenAddress(usdcMint, publicKey);
        
        console.log('🔍 Checking USDC balance:');
        console.log('   Network:', solanaConfig.network);
        console.log('   RPC Endpoint:', connection.rpcEndpoint);
        console.log('   USDC Mint:', usdcMint.toString());
        console.log('   User Wallet:', publicKey.toString());
        console.log('   Token Account (ATA):', ata.toString());
        
        // Check if account exists first
        const accountInfo = await connection.getAccountInfo(ata);
        if (!accountInfo) {
          console.log('   ⚠️  Token account does not exist on', solanaConfig.network);
          console.log('   💡 You need to receive USDC first to create the token account');
          
          // List all token accounts to help debug
          try {
            const allTokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
              programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
            });
            console.log(`   📋 Found ${allTokenAccounts.value.length} token account(s) on ${solanaConfig.network}:`);
            allTokenAccounts.value.forEach((acc, idx) => {
              const info = acc.account.data.parsed.info;
              console.log(`      ${idx + 1}. Mint: ${info.mint}, Balance: ${info.tokenAmount.uiAmount} ${info.tokenAmount.decimals} decimals`);
            });
            
            // Check if user has USDC on a different mint
            const usdcAccounts = allTokenAccounts.value.filter(acc => {
              const mint = acc.account.data.parsed.info.mint;
              return mint === usdcMint.toString();
            });
            if (usdcAccounts.length === 0) {
              console.warn('   ⚠️  No USDC token accounts found. Make sure you have USDC on', solanaConfig.network);
            }
          } catch (listError) {
            console.error('   Error listing token accounts:', listError);
          }
          
          setUsdcBalance(0);
        } else {
          const tokenAccount = await connection.getTokenAccountBalance(ata);
          const balance = parseFloat(tokenAccount.value.amount) / 1_000_000;
          console.log('   ✅ Token account exists');
          console.log('   Balance:', balance, 'USDC');
          setUsdcBalance(balance);
        }
      } catch (err: any) {
        console.error('❌ Error fetching USDC balance:', err);
        console.error('   Error message:', err.message);
        
        // Check if it's a network mismatch
        if (err.message?.includes('Invalid param') || err.message?.includes('not found')) {
          console.warn('   ⚠️  Token account not found - this might be a network mismatch');
          console.warn('   Make sure your wallet is on', solanaConfig.network, 'network');
        }
        
        setUsdcBalance(0);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [publicKey, connected, connection]);

  // Fetch wallet balances when connected (MUST be before early returns)
  useEffect(() => {
    if (!connected || !publicKey) {
      return;
    }

    let cancelled = false;

    const refresh = async () => {
      await fetchBalances();
    };

    void refresh();

    const intervalId = window.setInterval(() => {
      if (!cancelled) {
        void refresh();
      }
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [connected, publicKey, fetchBalances]);

  // NOW we can do conditional logic and early returns
  // Redirect to dashboard if no runId provided
  if (!runId) {
    navigate('/dashboard');
    return null;
  }

  // Extract run data
  const run = runResponse?.data;

  const redirectHandledRef = useRef(false);

  useEffect(() => {
    if (!run || !runId || redirectHandledRef.current) {
      return;
    }

    if (run.status === 'ACTIVE') {
      redirectHandledRef.current = true;
      toast.success('Run has started! Redirecting to the game...');
      navigate(`/game/${runId}`, { replace: true });
    } else if (run.status !== 'WAITING') {
      redirectHandledRef.current = true;
      toast.error('This lobby is no longer accepting participants');
      navigate('/dashboard', { replace: true });
    }
  }, [run, runId, navigate]);

  // Show loading state
  if (runLoading || !run) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (run.status !== 'WAITING') {
    return null;
  }

  const participantCount = run.participants?.length ?? 0;

  const isParticipating = run.participants?.some(
    (p: any) => p.userId === user?.id || p.user?.id === user?.id
  );

  const totalPoolFromParticipants =
    run.participants?.reduce((sum: number, participant: any) => {
      return sum + (participant.depositAmount || 0);
    }, 0) ?? 0;

  const totalPoolCents =
    totalPoolFromParticipants > 0 ? totalPoolFromParticipants : run.totalPool;

  const userParticipation = run.participants?.find(
    (p: any) => p.userId === user?.id || p.user?.id === user?.id
  );

  const userDepositCents = userParticipation?.depositAmount ?? 0;

  const handleJoin = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your Solana wallet first');
      return;
    }

    const amount = parseFloat(depositAmount);
    const minDepositUsdc = run.minDeposit / 100;
    const maxDepositUsdc = run.maxDeposit / 100;

    if (isNaN(amount) || amount < minDepositUsdc || amount > maxDepositUsdc) {
      toast.error(`Deposit amount must be between ${minDepositUsdc} and ${maxDepositUsdc} USDC`);
      return;
    }

    if (usdcBalance !== null && amount > usdcBalance) {
      toast.error('Insufficient USDC balance');
      return;
    }

    setIsDepositing(true);

    try {
      // Validate SOL balance for transaction fees
      if (solBalance !== null && solBalance < 0.001) {
        toast.error('Insufficient SOL for transaction fees', {
          description: 'You need at least 0.001 SOL for network fees',
        });
        setIsDepositing(false);
      return;
    }

      // Get numeric run ID (same logic as backend)
      const numericRunId = getNumericRunId(runId, run.createdAt);

      console.log('📝 Building deposit transaction...');
      console.log(`   Database Run ID (CUID): ${runId}`);
      console.log(`   Run Created At: ${run.createdAt}`);
      console.log(`   Numeric Run ID: ${numericRunId}`);
      console.log(`   Amount: ${amount} USDC`);
      console.log(`   User: ${publicKey.toString()}`);

      // Verify run and vault exist on-chain before attempting deposit
      const programId = new PublicKey(solanaConfig.programId);
      const runIdBuffer = Buffer.alloc(8);
      runIdBuffer.writeBigUInt64LE(BigInt(numericRunId), 0);
      
      const [runPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('run'), runIdBuffer],
        programId
      );
      
      const [runVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), runIdBuffer],
        programId
      );

      console.log('🔍 Verifying on-chain accounts exist...');
      console.log(`   Program ID: ${programId.toString()}`);
      console.log(`   Run ID Buffer (hex): ${runIdBuffer.toString('hex')}`);
      console.log(`   Run PDA: ${runPDA.toString()}`);
      console.log(`   Vault PDA: ${runVaultPDA.toString()}`);
      console.log(`   View on Explorer: https://explorer.solana.com/address/${runPDA.toString()}?cluster=devnet`);

      // Try to get account info
      const runAccountInfo = await connection.getAccountInfo(runPDA);
      if (!runAccountInfo) {
        // Try alternative run ID calculations to help debug
        console.warn('   ⚠️  Run account not found at expected PDA');
        console.warn('   Attempting alternative run ID calculations...');
        
        // Try with just the timestamp (if it was milliseconds)
        const timestampMs = new Date(run.createdAt).getTime();
        const timestampSec = Math.floor(timestampMs / 1000);
        console.log(`   Timestamp (ms): ${timestampMs}`);
        console.log(`   Timestamp (sec): ${timestampSec}`);
        
        // Try with seconds
        const runIdBufferSec = Buffer.alloc(8);
        runIdBufferSec.writeBigUInt64LE(BigInt(timestampSec), 0);
        const [runPDASec] = PublicKey.findProgramAddressSync(
          [Buffer.from('run'), runIdBufferSec],
          programId
        );
        console.log(`   Alternative Run PDA (seconds): ${runPDASec.toString()}`);
        
        const altAccountInfo = await connection.getAccountInfo(runPDASec);
        if (altAccountInfo) {
          console.log('   ✅ Found run at alternative PDA!');
          throw new Error(
            `Run ID calculation mismatch!\n\n` +
            `Expected PDA (milliseconds): ${runPDA.toString()}\n` +
            `Found PDA (seconds): ${runPDASec.toString()}\n\n` +
            `The backend may have used a different timestamp format.\n` +
            `Please check how the run was created on-chain.`
          );
        }
        
        throw new Error(
          `Run does not exist on-chain at expected PDA: ${runPDA.toString()}\n\n` +
          `Database Run ID: ${runId}\n` +
          `Numeric Run ID: ${numericRunId}\n` +
          `Created At: ${run.createdAt}\n\n` +
          `Please verify:\n` +
          `1. The run was created on-chain (check Solana Explorer)\n` +
          `2. The run ID calculation matches between frontend and backend\n` +
          `3. View on Explorer: https://explorer.solana.com/address/${runPDA.toString()}?cluster=devnet`
        );
      }
      console.log('   ✅ Run account exists');

      const vaultAccountInfo = await connection.getAccountInfo(runVaultPDA);
      if (!vaultAccountInfo) {
        throw new Error('Run vault does not exist on-chain. The vault must be created before deposits can be made. Please contact support or wait for the vault to be initialized.');
      }
      console.log('   ✅ Vault account exists');

      // Verify vault is a token account and get its mint
      const { getAccount } = await import('@solana/spl-token');
      let vaultMint: PublicKey;
      try {
        const vaultTokenAccount = await getAccount(connection, runVaultPDA);
        vaultMint = vaultTokenAccount.mint;
        const expectedUsdcMint = new PublicKey(solanaConfig.usdcMint);
        console.log(`   Vault mint: ${vaultMint.toString()}`);
        console.log(`   Config mint: ${expectedUsdcMint.toString()}`);
        
        if (!vaultMint.equals(expectedUsdcMint)) {
          console.warn(`   ⚠️  Mint mismatch detected! Using vault's mint (${vaultMint.toString()}) for transaction.`);
          console.warn(`   💡 Consider updating VITE_USDC_MINT to match the vault's mint.`);
        } else {
          console.log('   ✅ Vault mint matches config');
        }
      } catch (tokenError: any) {
        if (tokenError.message?.includes('InvalidAccountData') || tokenError.message?.includes('not a token account')) {
          throw new Error('Run vault exists but is not a valid token account. The vault may not have been properly initialized.');
        }
        throw tokenError;
      }

      // Verify user's token account exists and uses the same mint as the vault
      const userTokenAccount = await getAssociatedTokenAddress(vaultMint, publicKey);
      console.log(`   User token account: ${userTokenAccount.toString()}`);
      console.log(`   Checking token account for mint: ${vaultMint.toString()}`);
      
      try {
        const userTokenAccountInfo = await getAccount(connection, userTokenAccount);
        console.log(`   ✅ Token account exists`);
        console.log(`   User token account mint: ${userTokenAccountInfo.mint.toString()}`);
        
        if (!userTokenAccountInfo.mint.equals(vaultMint)) {
          throw new Error(`Mint mismatch! Your token account uses ${userTokenAccountInfo.mint.toString()} but the vault uses ${vaultMint.toString()}. You need USDC from the same mint as the vault.`);
        }
        console.log('   ✅ User token account mint matches vault');
        
        // Check balance
        const balance = Number(userTokenAccountInfo.amount);
        const balanceUsdc = balance / 1_000_000;
        console.log(`   User USDC balance: ${balanceUsdc} USDC`);
        
        if (balance < amount * 1_000_000) {
          throw new Error(`Insufficient USDC balance. You have ${balanceUsdc} USDC but need ${amount} USDC.`);
        }
        console.log('   ✅ Sufficient balance');
      } catch (tokenError: any) {
        console.error('   ❌ Error checking user token account:', tokenError);
        console.error('   Error type:', tokenError?.constructor?.name || typeof tokenError);
        console.error('   Error message:', tokenError?.message || 'No error message');
        console.error('   Error code:', tokenError?.code);
        console.error('   Error name:', tokenError?.name);
        console.error('   Full error:', JSON.stringify(tokenError, Object.getOwnPropertyNames(tokenError), 2));
        
        // Check for specific error types
        const errorMsg = tokenError?.message || String(tokenError) || 'Unknown error';
        const errorCode = tokenError?.code || tokenError?.name;
        const errorName = tokenError?.name || tokenError?.constructor?.name;
        
        // Handle account doesn't exist errors (including TokenAccountNotFoundError)
        if (
          errorName === 'TokenAccountNotFoundError' ||
          errorMsg.includes('TokenAccountNotFoundError') ||
          errorMsg.includes('InvalidAccountData') || 
          errorMsg.includes('not a token account') ||
          errorMsg.includes('could not find account') ||
          errorMsg.includes('AccountNotFound') ||
          errorCode === 'InvalidAccountData' ||
          errorCode === 'AccountNotFound'
        ) {
          const standardDevnetUsdc = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
          const isNonStandardMint = !vaultMint.equals(new PublicKey(standardDevnetUsdc));
          
          let errorDetails = `Your USDC token account does not exist for mint ${vaultMint.toString()}.\n\n`;
          errorDetails += `Your wallet: ${publicKey.toString()}\n`;
          errorDetails += `Expected token account: ${userTokenAccount.toString()}\n\n`;
          
          if (isNonStandardMint) {
            errorDetails += `⚠️  WARNING: The vault uses a non-standard USDC mint!\n\n`;
            errorDetails += `Vault mint: ${vaultMint.toString()}\n`;
            errorDetails += `Standard devnet USDC: ${standardDevnetUsdc}\n\n`;
            errorDetails += `To fix this:\n`;
            errorDetails += `1. Get USDC from mint ${vaultMint.toString()} (you may need to mint it yourself if it's a test mint)\n`;
            errorDetails += `2. OR recreate the vault with the standard devnet USDC mint\n`;
            errorDetails += `   (Run: node scripts/sync-runs-onchain.js in the backend)\n\n`;
            errorDetails += `View vault on explorer: https://explorer.solana.com/address/${runVaultPDA.toString()}?cluster=devnet`;
          } else {
            errorDetails += `You need to receive USDC from this mint first to create the token account.\n\n`;
            errorDetails += `Vault mint: ${vaultMint.toString()}\n`;
            errorDetails += `Network: ${solanaConfig.network}\n\n`;
            errorDetails += `To get devnet USDC:\n`;
            errorDetails += `1. Use a devnet USDC faucet\n`;
            errorDetails += `2. Or swap SOL for USDC on a devnet DEX\n`;
            errorDetails += `3. The token account will be created automatically when you receive USDC`;
          }
          
          throw new Error(errorDetails);
        }
        
        // Re-throw known errors
        if (errorMsg.includes('Insufficient') || errorMsg.includes('Mint mismatch')) {
          throw tokenError;
        }
        
        // Generic error with full details
        throw new Error(
          `Failed to verify user token account.\n\n` +
          `Error: ${errorMsg}\n` +
          `Code: ${errorCode || 'N/A'}\n\n` +
          `This might mean:\n` +
          `- Your token account doesn't exist for mint ${vaultMint.toString()}\n` +
          `- Network connection issue\n` +
          `- Account data is invalid\n\n` +
          `Check the console for more details.`
        );
      }

      // Check if user has already deposited on-chain
      // Derive UserParticipation PDA (numericRunId, programId, and runIdBuffer are already calculated above)
      const [userParticipationPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('participation'),
          runIdBuffer,
          publicKey.toBuffer(),
        ],
        programId
      );
      
      // Check if participation account already exists
      try {
        const participationAccount = await connection.getAccountInfo(userParticipationPDA);
        if (participationAccount) {
          // Account exists - check if it has a deposit
          // We can't easily decode without Anchor, so we'll check the account size
          // A valid UserParticipation account should be at least 60+ bytes
          if (participationAccount.data.length >= 60) {
            // Try to read the deposit_amount field (it's at offset 8+32+8 = 48 bytes)
            // deposit_amount is a u64 (8 bytes) at offset 48
            const depositAmountBytes = participationAccount.data.slice(48, 56);
            const depositAmount = Number(BigInt.asUintN(64, BigInt('0x' + depositAmountBytes.toString('hex'))));
            
            if (depositAmount > 0) {
              const depositAmountUsdc = depositAmount / 1_000_000;
              throw new Error(
                `You have already deposited ${depositAmountUsdc} USDC to this run. ` +
                `Each user can only deposit once per run.`
              );
            }
          } else {
            // Account exists but seems incomplete - warn user
            console.warn('Participation account exists but appears incomplete');
            throw new Error(
              `You may have already deposited to this run. ` +
              `Please check your participation status or try a different run.`
            );
          }
        }
      } catch (checkError: any) {
        // If it's our custom error about already deposited, throw it
        if (checkError.message && checkError.message.includes('already deposited')) {
          throw checkError;
        }
        // Otherwise, log and continue (account doesn't exist, which is fine)
        console.log('   Participation account check:', checkError.message || 'Account does not exist (OK for new deposit)');
      }

      // Build deposit transaction using Solana program
      // Use the vault's mint to ensure compatibility
      const transaction = await buildDepositTransaction(
        numericRunId,
        publicKey,
        amount,
        vaultMint // Pass the vault's actual mint
      );

      // Validate transaction structure
      if (!transaction.instructions || transaction.instructions.length === 0) {
        throw new Error('Transaction has no instructions');
      }

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('📤 Transaction built:');
      console.log(`   Instructions: ${transaction.instructions.length}`);
      console.log(`   Blockhash: ${blockhash}`);
      console.log(`   Fee Payer: ${publicKey.toString()}`);
      console.log(`   First instruction program: ${transaction.instructions[0].programId.toString()}`);
      console.log(`   First instruction keys: ${transaction.instructions[0].keys.length}`);

      // Simulate transaction first to catch errors early
      try {
        // For Transaction objects, simulateTransaction doesn't accept config as second param
        // We'll use the transaction as-is, and the RPC will handle blockhash replacement
        const simulation = await connection.simulateTransaction(transaction);
        
        console.log('📊 Simulation result:', simulation);
        console.log(`   Compute units: ${simulation.value.unitsConsumed || 'N/A'}`);
        if (simulation.value.logs) {
          console.log(`   Logs (${simulation.value.logs.length} entries):`);
          simulation.value.logs.slice(0, 10).forEach((log: string, idx: number) => {
            console.log(`      ${idx + 1}. ${log}`);
          });
          if (simulation.value.logs.length > 10) {
            console.log(`      ... and ${simulation.value.logs.length - 10} more`);
          }
        }
        
        if (simulation.value.err) {
          const errStr = JSON.stringify(simulation.value.err, null, 2);
          console.error('❌ Simulation error details:', errStr);
          console.error('   Full simulation:', simulation);
          
          // Try to decode the error
          let errorMsg = 'Transaction simulation failed';
          if (errStr.includes('Custom')) {
            const customMatch = errStr.match(/Custom":(\d+)/);
            if (customMatch) {
              const errorCode = parseInt(customMatch[1]);
              errorMsg = `On-chain error code ${errorCode}. `;
              if (errorCode === 3) {
                errorMsg += 'This usually means the run vault does not exist on-chain. The vault must be created before deposits can be made.';
              } else if (errorCode === 2) {
                errorMsg += 'Run is not in waiting phase.';
              } else if (errorCode === 5) {
                errorMsg += 'Deposit amount is below minimum.';
              } else if (errorCode === 6) {
                errorMsg += 'Deposit amount exceeds maximum.';
              } else if (errorCode === 7) {
                errorMsg += 'Run is full.';
              }
            }
          }
          
          throw new Error(`${errorMsg}\n\nError details: ${errStr}`);
        }
        console.log('✅ Transaction simulation successful');
      } catch (simError: any) {
        console.error('❌ Transaction simulation failed:', simError);
        console.error('   Error details:', {
          message: simError.message,
          name: simError.name,
          stack: simError.stack,
        });
        
        // Check if it's an "Invalid arguments" error
        if (simError.message?.includes('Invalid arguments')) {
          throw new Error('Transaction simulation failed: Invalid transaction format. This might indicate a problem with the transaction structure or missing accounts.');
        }
        
        // Re-throw with more context
        if (simError.message && !simError.message.includes('On-chain error')) {
          throw new Error(`Transaction simulation failed: ${simError.message}`);
        }
        throw simError;
      }

      // Send transaction
      console.log('📤 Sending transaction to wallet...');
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      toast.loading('Confirming deposit transaction...', { id: 'deposit' });

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      toast.success('Deposit confirmed on-chain!', { 
        id: 'deposit',
        description: `TX: ${signature.slice(0, 8)}...`,
      });

      // Now join the run via API with the user's wallet address
      await joinRunMutation.mutateAsync({
        id: runId,
        data: {
          depositAmount: amount,
          walletSignature: signature,
          userWalletAddress: publicKey.toString(), // Include wallet address for on-chain deposit
        },
      });

    setHasJoined(true);
      await fetchBalances(); // Refresh balances
      
      toast.success(`Successfully deposited ${amount} USDC!`, {
        description: 'You are now part of this run',
      });
    } catch (error: any) {
      console.error('❌ Deposit error:', error);
      console.error('   Error type:', error.constructor?.name || typeof error);
      console.error('   Error message:', error.message);
      console.error('   Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Log transaction details if available
      if (error.transaction) {
        console.error('   Transaction:', error.transaction);
      }
      
      const logs = (error as any)?.logs;
      if (Array.isArray(logs) && logs.length) {
        console.error('   Transaction logs:');
        logs.forEach((log: string) => console.error(`      ${log}`));
      }
      
      // Provide specific error messages
      let errorMessage = 'Deposit failed';
      let errorDescription = 'Please try again';
      
      const errorMsg = error.message || String(error);
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('User cancelled') || errorMsg.includes('User declined')) {
        errorMessage = 'Transaction cancelled';
        errorDescription = 'You rejected the transaction in your wallet';
      } else if (errorMsg.includes('Mint mismatch') && errorMsg.includes('token account')) {
        errorMessage = 'Token Account Mint Mismatch';
        errorDescription = 'Your USDC token account uses a different mint than the vault. You need USDC from the same mint as the vault.';
      } else if (errorMsg.includes('Unexpected error') || errorMsg.includes('WalletSendTransactionError')) {
        errorMessage = 'Transaction failed';
        errorDescription = 'The wallet could not send the transaction. Check console for details.';
        console.error('   💡 This might be due to:');
        console.error('      - Invalid transaction format');
        console.error('      - Missing or incorrect accounts');
        console.error('      - Network mismatch');
        console.error('      - Wallet connection issue');
        console.error('      - Run or vault not initialized on-chain');
      } else if (errorMsg.includes('0x1') || errorMsg.includes('Insufficient')) {
        errorMessage = 'Insufficient USDC balance';
        errorDescription = 'You need devnet USDC. Visit https://faucet.solana.com/ for devnet SOL, then swap for USDC';
      } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('0x0')) {
        errorMessage = 'Insufficient SOL for fees';
        errorDescription = 'You need at least 0.001 SOL for transaction fees. Get devnet SOL from https://faucet.solana.com/';
      } else if (errorMsg.includes('blockhash') || errorMsg.includes('expired')) {
        errorMessage = 'Network timeout';
        errorDescription = 'Transaction expired. Please try again';
      } else if (errorMsg.includes('RunNotInWaitingPhase') || errorMsg.includes('InvalidRunStatus')) {
        errorMessage = 'Run is not accepting deposits';
        errorDescription = 'The run may have already started or ended';
      } else if (errorMsg.includes('DepositTooLow') || errorMsg.includes('DepositTooHigh')) {
        errorMessage = 'Invalid deposit amount';
        errorDescription = `Amount must be between ${run.minDeposit / 100} and ${run.maxDeposit / 100} USDC`;
      } else if (errorMsg.includes('RunFull')) {
        errorMessage = 'Run is full';
        errorDescription = 'Maximum participants reached';
      } else if (errorMsg.includes('0x')) {
        errorDescription = 'Transaction failed. Check if the run and vault exist on-chain.';
      } else {
        errorDescription = errorMsg || 'Check console for details';
      }
      
      toast.error(errorMessage, { description: errorDescription });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleCoinSelect = (coin: string) => {
    setSelectedCoin(coin);
    toast.success(`Voted for ${coin}`, {
      description: 'Your coin preference has been recorded',
    });
  };

  const coins = [
    { symbol: 'SOL', name: 'Solana', emoji: '◎', enabled: true },
    { symbol: 'ETH', name: 'Ethereum', emoji: 'Ξ', enabled: false },
    { symbol: 'BTC', name: 'Bitcoin', emoji: '₿', enabled: false },
    { symbol: 'BONK', name: 'Bonk', emoji: '🐕', enabled: false },
    { symbol: 'WIF', name: 'Dogwifhat', emoji: '🐶', enabled: false },
    { symbol: 'JUP', name: 'Jupiter', emoji: '🪐', enabled: false },
  ];

  // Get coin votes from participants (count how many voted for each)
  const coinVotes = run.participants?.reduce((acc: Record<string, number>, p: any) => {
    const votedCoin = p.votedCoin || 'SOL'; // Default to SOL if no vote
    acc[votedCoin] = (acc[votedCoin] || 0) + 1;
    return acc;
  }, { SOL: 0, ETH: 0, BTC: 0, BONK: 0, WIF: 0, JUP: 0 }) || { SOL: 0, ETH: 0, BTC: 0, BONK: 0, WIF: 0, JUP: 0 };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 shadow-soft-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Run #{run.id}</div>
            <div className="font-bold text-foreground">Waiting Lobby</div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/50">
            WAITING
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Countdown Timer */}
        <Card className="bg-gradient-hero border-primary/30 shadow-soft-lg">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-3xl font-bold mb-2 text-foreground">Game Starting Soon!</h2>
            <div className="text-5xl font-mono font-bold text-primary my-6">
              {formatTime(run.countdown || 0)}
            </div>
            <p className="text-muted-foreground">
              Join now or watch the action! Game starts when the timer hits zero.
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Join/Deposit Section */}
          <div className="space-y-4">
            {!hasJoined && !isParticipating ? (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-success" />
                    Join This Run
                  </CardTitle>
                  <CardDescription>Deposit USDC to participate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Deposit Amount (USDC)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={run.minDeposit / 100}
                        max={run.maxDeposit / 100}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="pr-16 text-xl font-bold"
                        disabled={!connected}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        USDC
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>Min: {run.minDeposit / 100} USDC</span>
                      <span>Max: {run.maxDeposit / 100} USDC</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount('10')}
                      className="flex-1"
                      disabled={!connected}
                    >
                      10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount('25')}
                      className="flex-1"
                      disabled={!connected}
                    >
                      25
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount('50')}
                      className="flex-1"
                      disabled={!connected}
                    >
                      50
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount('100')}
                      className="flex-1"
                      disabled={!connected}
                    >
                      100
                    </Button>
                  </div>

                  {!connected ? (
                    <div className="space-y-3">
                      <Alert>
                        <Wallet className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-semibold mb-1">Wallet Required for Deposits</div>
                          <p className="text-xs">
                            To deposit USDC on-chain, please connect your Solana wallet. 
                            {user?.walletAddress && (
                              <span className="block mt-1 text-primary font-mono">
                                Using: {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
                              </span>
                            )}
                          </p>
                        </AlertDescription>
                      </Alert>
                      <WalletMultiButton className="!w-full !bg-primary !hover:bg-primary/90 !font-bold !text-lg !py-6" />
                      <p className="text-xs text-muted-foreground text-center">
                        This enables secure USDC transfers directly from your wallet to the community pool
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Wallet Balances */}
                      <div className="bg-muted rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Network:</span>
                          <span className="font-medium text-foreground">
                            {solanaConfig.network.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">USDC Balance:</span>
                          <span className="font-bold text-foreground">
                            {usdcBalance !== null ? `${usdcBalance.toFixed(2)} USDC` : 'Loading...'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">SOL Balance:</span>
                          <span className="font-bold text-foreground">
                            {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Loading...'}
                          </span>
                        </div>
                        {usdcBalance === 0 && (
                          <Alert className="mt-2 bg-warning/10 border-warning/30">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              <div className="font-semibold mb-1">No USDC found on {solanaConfig.network}</div>
                              <div className="text-muted-foreground space-y-1">
                                <p>• Check browser console (F12) for detailed info</p>
                                <p>• Make sure wallet is on <strong>{solanaConfig.network}</strong> network</p>
                                <p>• If you have USDC on mainnet, switch to devnet in wallet</p>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                  </div>

                  <Button
                    className="w-full font-bold text-lg py-6 shadow-soft-md"
                    style={{ background: 'linear-gradient(to right, hsl(var(--success)), hsl(142 71% 40%))' }}
                    onClick={handleJoin}
                        disabled={isDepositing || !connected}
                      >
                        {isDepositing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Processing Deposit...
                          </>
                        ) : (
                          <>
                    <Coins className="mr-2 w-5 h-5" />
                    Deposit & Join Run
                          </>
                        )}
                  </Button>
                    </>
                  )}

                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm">
                    <div className="font-medium text-primary mb-1">
                      💡 How it works:
                    </div>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>• Your funds are pooled with other players</li>
                      <li>• Vote every 10 minutes during the 2-hour game</li>
                      <li>• Share profits/losses proportionally</li>
                      <li>• Earn XP and badges for participation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-success/10 border-success/50 shadow-soft-lg">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-success mb-2">
                    You're In!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You've joined the run with{' '}
                    <span className="font-bold text-foreground">
                      {formatUSDC(userDepositCents || parseFloat(depositAmount) * 100)} USDC
                    </span>
                  </p>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Your Position</div>
                    <div className="text-xl font-bold text-foreground">
                      {totalPoolCents > 0
                        ? ((
                            (userDepositCents || parseFloat(depositAmount) * 100) /
                            totalPoolCents
                          ) * 100).toFixed(1)
                        : '0.0'}
                      % of pool
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pool Info */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Coins className="w-5 h-5 text-warning" />
                  Pool Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Total Pool</span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatUSDC(totalPoolCents)} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Players</span>
                  <span className="text-xl font-bold text-foreground">
                    {participantCount} / {run.maxParticipants}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-xl font-bold text-foreground">{run.duration} minutes</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Vote Interval</span>
                  <span className="text-xl font-bold text-foreground">
                    Every {run.votingInterval} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Coin Selection */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Dice5 className="w-5 h-5 text-secondary" />
                  Trading Pair
                </CardTitle>
                <CardDescription>
                  {run?.tradingPair || 'SOL/USDC'} perpetual futures {run?.tradingPair ? '' : '(more pairs coming soon!)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {coins.map((coin) => (
                    <Button
                      key={coin.symbol}
                      variant="outline"
                      className={`h-20 flex flex-col items-center justify-center relative ${
                        coin.enabled && selectedCoin === coin.symbol
                          ? 'bg-primary/10 border-primary'
                          : coin.enabled
                          ? ''
                          : 'opacity-40 cursor-not-allowed'
                      }`}
                      onClick={() => coin.enabled && handleCoinSelect(coin.symbol)}
                      disabled={!coin.enabled}
                    >
                      <div className="text-2xl mb-1">{coin.emoji}</div>
                      <div className="font-bold">{coin.symbol}</div>
                      {coin.enabled ? (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {coinVotes[coin.symbol as keyof typeof coinVotes]} votes
                      </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Coming Soon
                        </div>
                      )}
                      {coin.enabled && coin.symbol === 'SOL' && (
                        <Badge className="absolute top-2 right-2 text-xs bg-success/20 text-success border-success/50">
                          Active
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {selectedCoin === 'SOL' && (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center text-sm text-foreground">
                    ✅ Voted for {run?.tradingPair || `${selectedCoin}/USDC`}! Trading on Drift Protocol.
                  </div>
                )}

                <div className="bg-muted rounded-lg p-3 mt-3 text-xs">
                  <div className="font-medium text-foreground mb-1">
                    📊 Current Trading Pair
                  </div>
                  <div className="text-muted-foreground">
                    This run will trade <strong className="text-foreground">{run?.tradingPair || 'SOL/USDC'}</strong> perpetual futures on Drift Protocol.
                    {!run?.tradingPair && ' More trading pairs will be available in future runs!'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Players */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  Current Players ({participantCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {run.participants.map((participant, index) => (
                    <div
                      key={participant.user?.id || participant.userId}
                      className={`flex items-center justify-between p-3 rounded ${
                        (participant.user?.id || participant.userId) === user?.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {participant.user.username}
                            {participant.user.username.includes('Bot') && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                              >
                                BOT
                              </Badge>
                            )}
                            {(participant.user?.id || participant.userId) === user?.id && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs border-primary text-primary"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {participant.user?.walletAddress || 'Wallet hidden'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success">
                          {formatUSDC(participant.depositAmount)}
                        </div>
                        <div className="text-xs text-muted-foreground">USDC</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-primary/10 border border-primary/30 rounded-lg p-3 text-xs text-center text-foreground">
                  <Clock className="w-4 h-4 inline mr-1" />
                  New players can join until the game starts
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Rules Reminder */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-foreground">📋 Game Rules Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-muted rounded-lg p-4">
                <div className="font-medium text-primary mb-2">⏱️ Timing</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Game duration: 2 hours</li>
                  <li>• Vote every 10 minutes</li>
                  <li>• 12 total rounds</li>
                  <li>• No penalties for missing votes</li>
                </ul>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="font-medium text-success mb-2">💰 Rewards</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Share profits/losses proportionally</li>
                  <li>• Earn XP for voting</li>
                  <li>• Bonus XP for correct votes</li>
                  <li>• Win badges for achievements</li>
                </ul>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="font-medium text-warning mb-2">🎲 Chaos Mode</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Random leverage (1x-20x)</li>
                  <li>• Random position size (10%-100%)</li>
                  <li>• Displayed before each vote</li>
                  <li>• Keeps things exciting!</li>
                </ul>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="font-medium text-secondary mb-2">🗳️ Voting</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Options: Long, Short, or Skip</li>
                  <li>• Majority vote wins</li>
                  <li>• Votes are hidden during voting</li>
                  <li>• Missing votes = accept group decision</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

