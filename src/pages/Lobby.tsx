import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  TOKEN_PROGRAM_ID, 
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount
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
        const tokenAccount = await connection.getTokenAccountBalance(ata);
        setUsdcBalance(parseFloat(tokenAccount.value.amount) / 1_000_000);
      } catch (err) {
        setUsdcBalance(0);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [publicKey, connected, connection]);

  // Fetch wallet balances when connected (MUST be before early returns)
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    }
  }, [connected, publicKey, fetchBalances]);

  // NOW we can do conditional logic and early returns
  // Redirect to dashboard if no runId provided
  if (!runId) {
    navigate('/dashboard');
    return null;
  }

  // Extract run data
  const run = runResponse?.data;

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

  // Redirect if run is not waiting
  if (run.status !== 'WAITING') {
    toast.error('This lobby is no longer accepting participants');
    navigate('/dashboard');
    return null;
  }

  const participantCount = run.participantCount ?? run.participants?.length ?? 0;

  const isParticipating = run.participants?.some(
    (p: any) => p.userId === user?.id || p.user?.id === user?.id
  );

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

      // Create and send USDC transfer transaction
      const usdcMint = new PublicKey(solanaConfig.usdcMint);
      const poolUsdcAccount = new PublicKey(solanaConfig.communityWalletUSDC);

      // Get user's USDC token account (their ATA)
      const userUsdcAccount = await getAssociatedTokenAddress(usdcMint, publicKey);

      console.log('User USDC Account:', userUsdcAccount.toBase58());
      console.log('Pool USDC Account:', poolUsdcAccount.toBase58());

      // Check if user's USDC account exists
      let userAccountExists = true;
      try {
        await getAccount(connection, userUsdcAccount);
      } catch (error) {
        userAccountExists = false;
        console.log('User USDC account does not exist yet');
      }

      // Verify pool USDC account exists
      try {
        await getAccount(connection, poolUsdcAccount);
      } catch (error) {
        toast.error('Pool USDC account not found', {
          description: 'Please contact support – community vault is missing.',
        });
        setIsDepositing(false);
        return;
      }

      const amountInSmallestUnit = Math.floor(amount * 1_000_000);
      const transaction = new Transaction();

      // If user doesn't have USDC account, create it first
      if (!userAccountExists) {
        console.log('Creating user USDC token account...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            userUsdcAccount, // account to create
            publicKey, // owner
            usdcMint // mint
          )
        );
        toast.info('Creating your USDC account...', {
          description: 'This is a one-time setup',
        });
      }

      // Add the transfer instruction
      transaction.add(
        createTransferInstruction(
          userUsdcAccount,
          poolUsdcAccount,
          publicKey,
          amountInSmallestUnit,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('Sending transaction...');
      const signature = await sendTransaction(transaction, connection);
      
      toast.success('Transaction sent! Waiting for confirmation...', {
        description: `Signature: ${signature.slice(0, 8)}...`,
      });

      await connection.confirmTransaction(signature, 'confirmed');

      // Now join the run via API with the transaction signature
      await joinRunMutation.mutateAsync({
        id: runId,
        data: {
          depositAmount: amount,
          walletSignature: signature,
        },
      });

      setHasJoined(true);
      await fetchBalances(); // Refresh balances
      
      toast.success(`Successfully deposited ${amount} USDC!`, {
        description: 'You are now part of this run',
      });
    } catch (error: any) {
      console.error('Deposit error:', error);
      
      // Provide specific error messages
      let errorMessage = 'Deposit failed';
      let errorDescription = 'Please try again';
      
      if (error.message?.includes('0x1')) {
        errorMessage = 'Insufficient USDC balance';
        errorDescription = 'You need devnet USDC. Visit https://faucet.solana.com/ for devnet SOL, then swap for USDC';
      } else if (error.message?.includes('insufficient funds') || error.message?.includes('0x0')) {
        errorMessage = 'Insufficient SOL for fees';
        errorDescription = 'You need at least 0.01 SOL for transaction fees. Get devnet SOL from https://faucet.solana.com/';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction cancelled';
        errorDescription = 'You rejected the transaction in your wallet';
      } else if (error.message?.includes('blockhash')) {
        errorMessage = 'Network timeout';
        errorDescription = 'Transaction expired. Please try again';
      } else {
        errorDescription = error.message || 'Check console for details';
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
                    <span className="font-bold text-foreground">{depositAmount} USDC</span>
                  </p>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Your Position</div>
                    <div className="text-xl font-bold text-foreground">
                      {(
                        (parseFloat(depositAmount) * 100) /
                        Math.max(run.totalPool + parseFloat(depositAmount) * 100, 1)
                      * 100
                      ).toFixed(1)}
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
                    {formatUSDC(run.totalPool)} USDC
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
                  SOL/USD perpetual futures (more pairs coming soon!)
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
                    ✅ Voted for {selectedCoin}/USD! Trading on Drift Protocol.
                  </div>
                )}

                <div className="bg-muted rounded-lg p-3 mt-3 text-xs">
                  <div className="font-medium text-foreground mb-1">
                    📊 Current Trading Pair
                  </div>
                  <div className="text-muted-foreground">
                    This run will trade <strong className="text-foreground">SOL/USD</strong> perpetual futures on Drift Protocol. 
                    More trading pairs will be available in future runs!
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

