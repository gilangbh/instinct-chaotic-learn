import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress
} from '@solana/spl-token';
import { Button } from '@/components/ui/instinct/Button';
import { Panel } from '@/components/ui/instinct/Panel';
import { Badge } from '@/components/ui/instinct/Badge';
import { ProgressBar } from '@/components/ui/instinct/ProgressBar';
import { formatUSDC, formatTime } from '@/lib/mockData';
import { ChevronRight, Coins, Users, Clock, Dice5, Plus, Zap, Wallet, AlertCircle, Loader2 } from 'lucide-react';
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
      <div className="h-full flex items-center justify-center text-zinc-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading lobby...</p>
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
    { symbol: 'SOL', name: 'Solana', emoji: '◎' },
    { symbol: 'ETH', name: 'Ethereum', emoji: 'Ξ' },
    { symbol: 'BTC', name: 'Bitcoin', emoji: '₿' },
    { symbol: 'BONK', name: 'Bonk', emoji: '🐕' },
    { symbol: 'WIF', name: 'Dogwifhat', emoji: '🐶' },
    { symbol: 'JUP', name: 'Jupiter', emoji: '🪐' },
  ];

  const coinVotes = {
    SOL: 2,
    ETH: 1,
    BTC: 0,
    BONK: 0,
    WIF: 0,
    JUP: 0,
  };

  const poolFillPercent = totalPoolCents > 0 && run.maxParticipants > 0
    ? Math.min(100, (totalPoolCents / (run.maxParticipants * (run.maxDeposit || 100000))) * 100)
    : 0;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col p-4 lg:p-6 max-w-[1800px] mx-auto animate-in zoom-in-95 duration-300 min-h-full">
      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800/50 pb-4 relative">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
         <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
               <ChevronRight className="rotate-180" />
            </button>
            <div>
               <h2 className="text-3xl font-display font-bold text-white tracking-tight">Run #{run.id}</h2>
               <div className="text-[10px] text-zinc-500 font-mono mt-1">STATUS: WAITING_FOR_PLAYERS</div>
            </div>
            <Badge label="WAITING" color="cyan" pulse />
         </div>
         
         <div className="flex items-center gap-8 font-mono bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-right px-2 hidden md:block">
               <div className="text-[10px] text-zinc-500 uppercase">Pool Size</div>
               <div className="text-xl text-[#00F0FF] font-bold text-shadow-glow">${formatUSDC(totalPoolCents)}</div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden md:block" />
            <div className="text-right px-2">
               <div className="text-[10px] text-zinc-500 uppercase">Starts In</div>
               <div className="text-2xl text-white font-bold animate-pulse">{formatTime(run.countdown || 0)}</div>
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Countdown / Hero */}
        <Panel active className="p-8 text-center bg-gradient-to-b from-zinc-900/80 to-black border-indigo-500/20 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30 hexagon-clip">
                <Clock size={40} className="text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-2">Initialization Sequence</h2>
              <div className="text-6xl font-mono font-bold text-indigo-400 my-6 animate-pulse">
                {formatTime(run.countdown || 0)}
              </div>
              <p className="text-zinc-500 font-mono text-sm mb-4">
                // SYSTEM_STATUS: WAITING_FOR_QUORUM
              </p>
              
              {/* Pool Fill Progress */}
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex justify-between text-xs text-zinc-500 mb-2 font-mono">
                  <span>Pool Filling</span>
                  <span>{participantCount} / {run.maxParticipants} Nodes</span>
                </div>
                <ProgressBar value={poolFillPercent} max={100} color="bg-cyan-500" />
              </div>
            </div>
        </Panel>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Join/Deposit Section */}
          <div className="space-y-4">
            {!hasJoined && !isParticipating ? (
              <Panel className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Plus className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold text-zinc-200 uppercase tracking-widest">Join Protocol</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 mb-2 block tracking-widest">
                      Deposit Amount (USDC)
                    </label>
                    <div className="relative group">
                      <input
                        type="number"
                        min={run.minDeposit / 100}
                        max={run.maxDeposit / 100}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={!connected}
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xl font-mono text-white focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
                        USDC
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-2">
                      <span>MIN: {run.minDeposit / 100} USDC</span>
                      <span>MAX: {run.maxDeposit / 100} USDC</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {['10', '25', '50', '100'].map(amt => (
                        <button
                            key={amt}
                            onClick={() => setDepositAmount(amt)}
                            disabled={!connected}
                            className={`py-2 border transition-all font-mono text-xs ${
                              depositAmount === amt 
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                                : 'border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 disabled:opacity-50'
                            }`}
                        >
                            {amt}
                        </button>
                    ))}
                  </div>

                  {!connected ? (
                    <div className="space-y-3">
                      <div className="bg-zinc-900/50 border border-zinc-800 p-4 text-xs text-zinc-500">
                        <div className="font-bold text-zinc-400 mb-2">Wallet Required for Deposits</div>
                        <p>To deposit USDC on-chain, please connect your Solana wallet.</p>
                      </div>
                      <WalletMultiButton className="!w-full !bg-indigo-500 !hover:bg-indigo-600 !font-bold !text-lg !py-6" />
                      <p className="text-xs text-zinc-600 text-center font-mono">
                        This enables secure USDC transfers directly from your wallet to the community pool
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Wallet Balances */}
                      <div className="bg-zinc-900/50 border border-zinc-800 p-3 space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-zinc-500">Network:</span>
                          <span className="text-zinc-300">{solanaConfig.network.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-zinc-500">USDC Balance:</span>
                          <span className="text-zinc-200 font-bold">
                            {usdcBalance !== null ? `${usdcBalance.toFixed(2)} USDC` : 'Loading...'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-zinc-500">SOL Balance:</span>
                          <span className="text-zinc-200 font-bold">
                            {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Loading...'}
                          </span>
                        </div>
                        {usdcBalance === 0 && (
                          <div className="bg-red-900/10 border border-red-900/30 p-3 text-xs text-red-400 mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-bold">No USDC found on {solanaConfig.network}</span>
                            </div>
                            <div className="text-red-500/80 space-y-1 mt-2">
                              <p>• Check browser console (F12) for detailed info</p>
                              <p>• Make sure wallet is on <strong>{solanaConfig.network}</strong> network</p>
                            </div>
                          </div>
                        )}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full py-4 text-sm shadow-lg"
                    onClick={handleJoin}
                    disabled={isDepositing || !connected}
                  >
                    {isDepositing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 w-4 h-4 inline" />
                        Deposit & Initialize
                      </>
                    )}
                  </Button>
                    </>
                  )}

                  <div className="bg-zinc-900/50 border border-zinc-800 p-4 text-xs text-zinc-500 font-mono">
                    <div className="font-bold text-zinc-400 mb-2">
                      // PROTOCOL_RULES:
                    </div>
                    <ul className="space-y-1 pl-2">
                      <li>• Funds pooled with other nodes</li>
                      <li>• Vote every {run.votingInterval}m (Duration: {run.duration}m)</li>
                      <li>• PnL distributed proportionally</li>
                      <li>• XP rewards for consensus participation</li>
                    </ul>
                  </div>
                </div>
              </Panel>
            ) : (
              <Panel active className="p-8 text-center border-emerald-500/30 bg-emerald-900/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 hexagon-clip">
                      <Zap size={40} className="text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-display font-light text-emerald-400 mb-2">
                      Access Granted
                    </h3>
                    <p className="text-zinc-400 mb-6">
                      You have joined the run with{' '}
                      <span className="font-bold text-emerald-400">{formatUSDC(userDepositCents || parseFloat(depositAmount) * 100)} USDC</span>
                    </p>
                    <div className="bg-zinc-950 border border-emerald-500/30 p-4 inline-block min-w-[200px]">
                      <div className="text-[10px] uppercase text-zinc-500 mb-1">Your Position</div>
                      <div className="text-xl font-mono font-bold text-emerald-400">
                        {totalPoolCents > 0
                          ? (((userDepositCents || parseFloat(depositAmount) * 100) / totalPoolCents) * 100).toFixed(1)
                          : '0.0'}
                        % of pool
                      </div>
                    </div>
                  </div>
              </Panel>
            )}

            {/* Pool Info */}
            <Panel className="p-6">
              <div className="flex items-center gap-2 mb-4">
                  <Coins className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pool Data</h3>
              </div>
              <div className="space-y-2">
                {[
                    { label: "Total Pool", val: `${formatUSDC(totalPoolCents)} USDC`, highlight: true },
                    { label: "Players", val: `${participantCount} / ${run.maxParticipants}` },
                    { label: "Duration", val: `${run.duration} Minutes` },
                    { label: "Interval", val: `${run.votingInterval} Minutes` },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                        <span className="text-xs text-zinc-500 uppercase">{item.label}</span>
                        <span className={`font-mono ${item.highlight ? 'text-cyan-400' : 'text-zinc-300'}`}>{item.val}</span>
                    </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Coin Selection */}
            <Panel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Dice5 className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Vote Asset</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                  {coins.map((coin) => (
                    <button
                      key={coin.symbol}
                      className={`
                        h-20 flex flex-col items-center justify-center border transition-all relative overflow-hidden group
                        ${selectedCoin === coin.symbol 
                            ? 'bg-indigo-900/20 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                            : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 hover:border-zinc-700'}
                      `}
                      onClick={() => handleCoinSelect(coin.symbol)}
                    >
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{coin.emoji}</div>
                      <div className="font-bold font-mono text-sm">{coin.symbol}</div>
                      <div className="text-[10px] opacity-60">
                        {coinVotes[coin.symbol as keyof typeof coinVotes]} votes
                      </div>
                      {selectedCoin === coin.symbol && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                      )}
                    </button>
                  ))}
              </div>

              {selectedCoin && (
                  <div className="bg-indigo-900/10 border border-indigo-500/30 p-3 text-center text-xs text-indigo-300 mb-3 font-mono animate-in fade-in duration-300">
                    // VOTE_REGISTERED: {selectedCoin}
                  </div>
              )}
              
              <div className="bg-zinc-900 p-3 text-[10px] text-zinc-600 border-l-2 border-zinc-700">
                  NOTE: Selection is weighted random based on votes.
              </div>
            </Panel>

            {/* Current Players */}
            <Panel className="p-6">
              <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Connected Nodes ({participantCount})</h3>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {run.participants?.map((participant, index) => (
                    <div
                      key={participant.user?.id || participant.userId}
                      className={`flex items-center justify-between p-3 border transition-all group ${
                        (participant.user?.id || participant.userId) === user?.id
                          ? 'bg-indigo-900/10 border-indigo-500/30'
                          : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-mono border ${
                          (participant.user?.id || participant.userId) === user?.id 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-zinc-300 flex items-center gap-2 group-hover:text-white transition-colors">
                            {participant.user?.username || 'Unknown'}
                            {(participant.user?.id || participant.userId) === user?.id && (
                                <span className="text-[9px] bg-indigo-500 text-black px-1 rounded">YOU</span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-600">
                            {participant.user?.walletAddress?.slice(0, 8) || 'N/A'}...
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-emerald-500 text-sm font-bold">
                          {formatUSDC(participant.depositAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </Panel>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

