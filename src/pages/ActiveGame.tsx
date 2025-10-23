import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  activeRun,
  currentVotingRound,
  currentUser,
  formatUSDC,
  formatTime,
  priceChartData,
} from '@/lib/mockData';
import {
  ArrowUp,
  ArrowDown,
  SkipForward,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Zap,
  Target,
  ArrowLeft,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ActiveGame() {
  const navigate = useNavigate();
  const [userVote, setUserVote] = useState<'long' | 'short' | 'skip' | null>(null);

  const userParticipation = activeRun.participants.find(
    (p) => p.user.id === currentUser.id
  );

  const profitLoss = activeRun.totalPool - activeRun.startingPool;
  const profitLossPercent = ((profitLoss / activeRun.startingPool) * 100).toFixed(1);
  const isProfit = profitLoss >= 0;

  const lastTrade = activeRun.trades[activeRun.trades.length - 1];

  const handleVote = (vote: 'long' | 'short' | 'skip') => {
    setUserVote(vote);
    const voteLabels = {
      long: 'BUY 📈',
      short: 'SELL 📉',
      skip: 'SKIP ⏭️',
    };
    toast.success(`Vote cast: ${voteLabels[vote]}`, {
      description: 'Your vote has been recorded! Check back in 7 minutes.',
    });
  };

  // Format chart data
  const chartData = priceChartData.slice(-60).map((d) => ({
    time: d.timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    price: d.price,
  }));

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10 shadow-soft-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Run #{activeRun.id}</div>
            <div className="font-bold text-foreground">{activeRun.tradingPair}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Round</div>
            <div className="font-bold text-foreground">
              {activeRun.currentRound}/{activeRun.totalRounds}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Pool</div>
              <div className="text-2xl font-bold text-foreground">
                {formatUSDC(activeRun.totalPool)} USDC
              </div>
              <div
                className={`text-sm font-medium ${
                  isProfit ? 'text-success' : 'text-destructive'
                }`}
              >
                {isProfit ? '+' : ''}
                {formatUSDC(profitLoss)} ({isProfit ? '+' : ''}
                {profitLossPercent}%)
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Your Deposit</div>
              <div className="text-2xl font-bold text-foreground">
                {formatUSDC(userParticipation?.depositAmount || 0)} USDC
              </div>
              <div className="text-sm text-muted-foreground">
                {userParticipation
                  ? `${(
                      (userParticipation.depositAmount / activeRun.startingPool) *
                      100
                    ).toFixed(1)}% of pool`
                  : 'Spectating'}
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Players
              </div>
              <div className="text-2xl font-bold text-foreground">{activeRun.participantCount}</div>
              <div className="text-sm text-muted-foreground">
                {activeRun.trades.length} trades executed
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Your Votes</div>
              <div className="text-2xl font-bold text-success">
                {userParticipation?.votesCorrect || 0}/
                {userParticipation?.totalVotes || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {userParticipation
                  ? `${(
                      (userParticipation.votesCorrect / userParticipation.totalVotes) *
                      100
                    ).toFixed(0)}% correct`
                  : 'No votes yet'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column - Chart and Last Trade */}
          <div className="lg:col-span-2 space-y-4">
            {/* Price Chart */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                    📊 {activeRun.tradingPair}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      ${currentVotingRound.currentPrice}
                    </div>
                    <div
                      className={`text-sm ${
                        currentVotingRound.priceChange24h >= 0
                          ? 'text-success'
                          : 'text-destructive'
                      }`}
                    >
                      {currentVotingRound.priceChange24h >= 0 ? '+' : ''}
                      {currentVotingRound.priceChange24h}% 24h
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Last Trade Result */}
            {lastTrade && (
              <Card
                className={`border-2 ${
                  lastTrade.pnl >= 0
                    ? 'bg-success/10 border-success/50'
                    : 'bg-destructive/10 border-destructive/50'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    {lastTrade.pnl >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                    Last Round Result (Round {lastTrade.round})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Decision</div>
                      <div className="font-bold text-lg text-foreground">
                        {lastTrade.direction.toUpperCase()}{' '}
                        {lastTrade.direction === 'long' ? '📈' : '📉'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Strategy</div>
                      <div className="font-bold text-lg text-foreground">
                        {lastTrade.leverage}x leverage, {lastTrade.positionSize}% size
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Entry → Exit</div>
                      <div className="font-medium text-foreground">
                        ${lastTrade.entryPrice} → ${lastTrade.exitPrice}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Result</div>
                      <div
                        className={`font-bold text-lg ${
                          lastTrade.pnl >= 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {lastTrade.pnl >= 0 ? '+' : ''}
                        {formatUSDC(lastTrade.pnl)} USDC
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted rounded p-3">
                    <div className="text-sm text-muted-foreground mb-2">Vote Distribution</div>
                    <div className="flex gap-4 text-sm text-foreground">
                      <span>
                        📈 LONG: <span className="font-bold">{lastTrade.votes.long}</span>
                      </span>
                      <span>
                        📉 SHORT:{' '}
                        <span className="font-bold">{lastTrade.votes.short}</span>
                      </span>
                      <span>
                        ⏭️ SKIP: <span className="font-bold">{lastTrade.votes.skip}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Voting Interface */}
          <div className="space-y-4">
            {/* Countdown Timer */}
            <Card className="bg-gradient-hero border-primary/30 shadow-soft-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time to Vote
                  </div>
                  <div className="text-5xl font-mono font-bold text-primary mb-2">
                    {formatTime(currentVotingRound.timeRemaining)}
                  </div>
                  <Progress
                    value={(currentVotingRound.timeRemaining / 600) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* This Round's Strategy */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  🎲 This Round's Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Leverage
                    </span>
                    <span className="text-2xl font-bold text-warning">
                      {currentVotingRound.leverage}x
                    </span>
                  </div>
                </div>

                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Position Size
                    </span>
                    <span className="text-2xl font-bold text-secondary">
                      {currentVotingRound.positionSize}%
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center mt-2">
                  Chaos parameters are random each round! 🎰
                </div>
              </CardContent>
            </Card>

            {/* Voting Buttons */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">🗳️ Cast Your Vote</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className={`w-full h-20 text-lg font-bold shadow-soft-sm ${
                    userVote === 'long'
                      ? 'bg-success hover:bg-success/90'
                      : 'bg-success/80 hover:bg-success'
                  }`}
                  onClick={() => handleVote('long')}
                  disabled={userVote !== null}
                >
                  <div className="flex items-center gap-3">
                    <ArrowUp className="w-6 h-6" />
                    <div>
                      <div>LONG (BUY)</div>
                      <div className="text-sm font-normal">
                        Price will go UP 📈
                      </div>
                    </div>
                    {userVote === 'long' && <span className="ml-2">✅</span>}
                  </div>
                </Button>

                <Button
                  className={`w-full h-20 text-lg font-bold shadow-soft-sm ${
                    userVote === 'short'
                      ? 'bg-destructive hover:bg-destructive/90'
                      : 'bg-destructive/80 hover:bg-destructive'
                  }`}
                  onClick={() => handleVote('short')}
                  disabled={userVote !== null}
                >
                  <div className="flex items-center gap-3">
                    <ArrowDown className="w-6 h-6" />
                    <div>
                      <div>SHORT (SELL)</div>
                      <div className="text-sm font-normal">
                        Price will go DOWN 📉
                      </div>
                    </div>
                    {userVote === 'short' && <span className="ml-2">✅</span>}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className={`w-full h-16 text-lg font-bold ${
                    userVote === 'skip'
                      ? 'border-primary bg-primary/10'
                      : ''
                  }`}
                  onClick={() => handleVote('skip')}
                  disabled={userVote !== null}
                >
                  <div className="flex items-center gap-3">
                    <SkipForward className="w-5 h-5" />
                    <div>SKIP (PASS) ⏭️</div>
                    {userVote === 'skip' && <span className="ml-2">✅</span>}
                  </div>
                </Button>

                {userVote && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center text-sm text-foreground">
                    ✅ Vote recorded! Check back when the round ends.
                  </div>
                )}

                {!userVote && (
                  <div className="text-xs text-muted-foreground text-center">
                    Votes are hidden until the round ends. No penalties for missing
                    votes!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5" />
                  Players ({activeRun.participantCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeRun.participants.map((participant, index) => (
                    <div
                      key={participant.user.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        participant.user.id === currentUser.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {participant.user.username}
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
                            {formatUSDC(participant.depositAmount)} USDC
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-success">
                          {participant.votesCorrect}/{participant.totalVotes}
                        </div>
                        <div className="text-muted-foreground">correct</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

