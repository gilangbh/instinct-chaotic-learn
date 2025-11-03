import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { waitingRun, currentUser, formatUSDC, formatTime } from '@/lib/mockData';
import { ArrowLeft, Coins, Users, Clock, Dice5, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Lobby() {
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();
  const [depositAmount, setDepositAmount] = useState('50');
  const [selectedCoin, setSelectedCoin] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);

  // Redirect to dashboard if no runId provided
  if (!runId) {
    navigate('/dashboard');
    return null;
  }

  const isParticipating = waitingRun.participants.some(
    (p) => p.user.id === currentUser.id
  );

  const handleJoin = () => {
    const amount = parseFloat(depositAmount);
    if (amount < 10) {
      toast.error('Minimum deposit is 10 USDC');
      return;
    }
    if (amount > 100) {
      toast.error('Maximum deposit is 100 USDC');
      return;
    }

    setHasJoined(true);
    toast.success('Successfully joined the run!', {
      description: `Deposited ${amount} USDC`,
    });
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
            <div className="text-sm text-muted-foreground">Run #{waitingRun.id}</div>
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
              {formatTime(waitingRun.countdown || 0)}
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
                        min="10"
                        max="100"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="pr-16 text-xl font-bold"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        USDC
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>Min: 10 USDC</span>
                      <span>Max: 100 USDC</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount('10')}
                      className="flex-1"
                    >
                      10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount('25')}
                      className="flex-1"
                    >
                      25
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount('50')}
                      className="flex-1"
                    >
                      50
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount('100')}
                      className="flex-1"
                    >
                      100
                    </Button>
                  </div>

                  <Button
                    className="w-full font-bold text-lg py-6 shadow-soft-md"
                    style={{ background: 'linear-gradient(to right, hsl(var(--success)), hsl(142 71% 40%))' }}
                    onClick={handleJoin}
                  >
                    <Coins className="mr-2 w-5 h-5" />
                    Deposit & Join Run
                  </Button>

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
                        (parseFloat(depositAmount) * 1000) /
                        (waitingRun.totalPool + parseFloat(depositAmount) * 1000)
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
                    {formatUSDC(waitingRun.totalPool)} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Players</span>
                  <span className="text-xl font-bold text-foreground">
                    {waitingRun.participantCount} / {waitingRun.maxParticipants}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-xl font-bold text-foreground">{waitingRun.duration} minutes</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Vote Interval</span>
                  <span className="text-xl font-bold text-foreground">
                    Every {waitingRun.votingInterval} min
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
                  Vote for Trading Pair
                </CardTitle>
                <CardDescription>
                  Final coin will be randomly selected based on votes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {coins.map((coin) => (
                    <Button
                      key={coin.symbol}
                      variant="outline"
                      className={`h-20 flex flex-col items-center justify-center ${
                        selectedCoin === coin.symbol
                          ? 'bg-secondary/10 border-secondary'
                          : ''
                      }`}
                      onClick={() => handleCoinSelect(coin.symbol)}
                    >
                      <div className="text-2xl mb-1">{coin.emoji}</div>
                      <div className="font-bold">{coin.symbol}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {coinVotes[coin.symbol as keyof typeof coinVotes]} votes
                      </div>
                    </Button>
                  ))}
                </div>

                {selectedCoin && (
                  <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 text-center text-sm text-foreground">
                    ✅ Voted for {selectedCoin}! All coins will be weighted randomly.
                  </div>
                )}

                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mt-3 text-xs">
                  <div className="font-medium text-warning mb-1">
                    🎲 Weighted Random Selection
                  </div>
                  <div className="text-muted-foreground">
                    More votes = higher chance. The coin with the most votes has the
                    best odds, but it's still random!
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Players */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  Current Players ({waitingRun.participantCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {waitingRun.participants.map((participant, index) => (
                    <div
                      key={participant.user.id}
                      className={`flex items-center justify-between p-3 rounded ${
                        participant.user.id === currentUser.id
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
                            {participant.user.id === currentUser.id && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs border-primary text-primary"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {participant.user.walletAddress}
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

