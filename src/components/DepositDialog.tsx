import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createTransferInstruction } from '@solana/spl-token';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, ArrowDownToLine, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import solanaConfig from '@/lib/solana-config';

interface DepositDialogProps {
  runId?: string;
  minDeposit?: number;
  maxDeposit?: number;
}

export function DepositDialog({ 
  runId, 
  minDeposit = 10, 
  maxDeposit = 100 
}: DepositDialogProps) {
  const { publicKey, sendTransaction, connected, wallet } = useWallet();
  const { connection } = useConnection();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  const fetchBalances = async () => {
    if (!publicKey || !connected) return;

    try {
      // Get SOL balance
      const solBal = await connection.getBalance(publicKey);
      setSolBalance(solBal / LAMPORTS_PER_SOL);

      // Get USDC balance
      try {
        const usdcMint = new PublicKey(solanaConfig.usdcMint);
        const ata = await getAssociatedTokenAddress(
          usdcMint,
          publicKey
        );
        const tokenAccount = await connection.getTokenAccountBalance(ata);
        setUsdcBalance(parseFloat(tokenAccount.value.amount) / 1_000_000);
      } catch (err) {
        // Token account might not exist yet
        setUsdcBalance(0);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Fetch balances when dialog opens or wallet connects
  useEffect(() => {
    if (open && publicKey && connected) {
      // Small delay to ensure wallet adapter state is fully updated
      const timer = setTimeout(() => {
        fetchBalances();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, publicKey, connected]);

  // Force refresh when wallet connection state changes
  useEffect(() => {
    if (!open) return;

    if (connected && publicKey) {
      console.log('🔌 Wallet connected in DepositDialog, refreshing balances...');
      // Small delay to ensure wallet adapter state is fully updated
      const timer = setTimeout(() => {
        fetchBalances();
      }, 300);
      return () => clearTimeout(timer);
    } else if (!connected) {
      // Clear balances when disconnected
      setUsdcBalance(null);
      setSolBalance(null);
    }
  }, [open, connected, publicKey?.toString(), fetchBalances]);

  const handleDeposit = async () => {
    if (!connected || !publicKey) {
      toast.error('Wallet not connected. Please reconnect your wallet.');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < minDeposit || depositAmount > maxDeposit) {
      toast.error(`Deposit amount must be between ${minDeposit} and ${maxDeposit} USDC`);
      return;
    }

    if (usdcBalance !== null && depositAmount > usdcBalance) {
      toast.error('Insufficient USDC balance');
      return;
    }

    setIsDepositing(true);

    try {
      const programId = new PublicKey(solanaConfig.programId);
      const usdcMint = new PublicKey(solanaConfig.usdcMint);

      // Get user's USDC token account
      const userUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        publicKey
      );

      // Derive run vault PDA using your program's seeds
      // Seeds: ['vault', run_id as u64 little-endian]
      const runNumericId = runId ? parseInt(runId) : Date.now();
      const runIdBuffer = Buffer.alloc(8);
      runIdBuffer.writeBigUInt64LE(BigInt(runNumericId));
      
      const [runVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), runIdBuffer],
        programId
      );

      // Get run vault's USDC token account
      const runVaultUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        runVaultPDA,
        true // Allow PDA as owner
      );

      // Create transfer instruction
      const transferIx = createTransferInstruction(
        userUsdcAccount,
        runVaultUsdcAccount,
        publicKey,
        depositAmount * 1_000_000, // Convert to smallest unit (6 decimals)
        [],
        TOKEN_PROGRAM_ID
      );

      // Build and send transaction
      const transaction = new Transaction().add(transferIx);
      
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      toast.loading('Confirming transaction...', { id: 'deposit' });
      
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      toast.success(`Successfully deposited ${depositAmount} USDC!`, { id: 'deposit' });
      toast.info(`TX: ${signature.slice(0, 8)}...`, { 
        id: 'tx-info',
        description: 'Click to view on explorer',
        action: {
          label: 'View',
          onClick: () => window.open(solanaConfig.getTxUrl(signature), '_blank')
        }
      });

      // Call backend API to record deposit
      try {
        // TODO: Uncomment when backend endpoint is ready
        // const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/runs/${runId}/join`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('instinct_fi_token')}`
        //   },
        //   body: JSON.stringify({ depositAmount, transactionSignature: signature })
        // });
        
        console.log('✅ Deposit recorded on-chain:', signature);
        console.log('💡 TODO: Call backend API to record in database');
      } catch (apiError) {
        console.error('Warning: Failed to record deposit in backend:', apiError);
        // Don't fail the whole transaction - the on-chain deposit still succeeded
      }

      // Refresh balances
      await fetchBalances();
      setAmount('');
      setOpen(false); // Close dialog on success

    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Failed to deposit. Please try again.', { id: 'deposit' });
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen && connected) {
        fetchBalances();
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="shadow-soft-sm"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Deposit USDC
          </DialogTitle>
          <DialogDescription>
            Deposit USDC from your wallet to join runs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            {/* Wallet Status Warning */}
            {!connected ? (
              <div className="space-y-3">
                <Alert className="bg-warning/10 border-warning/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your Solana wallet is disconnected. Please connect to deposit USDC.
                  </AlertDescription>
                </Alert>
                <WalletMultiButton className="w-full !bg-primary hover:!bg-primary/90" />
              </div>
            ) : (
              <>
            {/* Balance Display */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wallet</span>
                <span className="font-mono text-xs">
                  {publicKey ? (
                    `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
                  ) : (
                    'Not connected'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">USDC Balance</span>
                <span className="font-bold">
                  {usdcBalance !== null ? `${usdcBalance.toFixed(2)} USDC` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SOL Balance</span>
                <span className="font-medium">
                  {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Loading...'}
                </span>
              </div>
            </div>

            {/* Deposit Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Deposit Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder={`${minDeposit} - ${maxDeposit}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minDeposit}
                  max={maxDeposit}
                  step="1"
                  className="pr-16"
                  disabled={isDepositing}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                  USDC
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Min: {minDeposit} USDC • Max: {maxDeposit} USDC
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                  disabled={isDepositing}
                >
                  {preset}
                </Button>
              ))}
            </div>

            {/* Warning */}
            {usdcBalance === 0 && (
              <Alert className="bg-warning/10 border-warning/30">
                <AlertDescription className="text-sm">
                  ⚠️ You don't have any USDC. Get devnet USDC from a faucet first.
                </AlertDescription>
              </Alert>
            )}

            {/* Deposit Button */}
            <Button
              onClick={handleDeposit}
              disabled={!connected || !amount || isDepositing || usdcBalance === 0}
              className="w-full"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {isDepositing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Depositing...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Deposit {amount || '0'} USDC
                </>
              )}
            </Button>

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Deposits are sent to the run vault on Solana</p>
              <p>• Network: {solanaConfig.network.charAt(0).toUpperCase() + solanaConfig.network.slice(1)}</p>
              <p>• You'll need SOL for transaction fees (~0.00001 SOL)</p>
            </div>
            </>
            )}
          </div>
      </DialogContent>
    </Dialog>
  );
}

