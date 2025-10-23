import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  activeRun,
  waitingRun,
  currentUser,
  formatUSDC,
  formatTime,
  getRunStatusEmoji,
} from '@/lib/mockData';
import { ArrowRight, TrendingUp, Users, Clock, Coins } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // Determine which run to show
  const displayRun = activeRun.status === 'active' ? activeRun : waitingRun;
  const isActive = displayRun.status === 'active';
  const isWaiting = displayRun.status === 'waiting';

  const userParticipation = displayRun.participants.find(
    (p) => p.user.id === currentUser.id
  );
  const isParticipating = !!userParticipation;

  const profitLoss = displayRun.totalPool - displayRun.startingPool;
  const profitLossPercent = ((profitLoss / displayRun.startingPool) * 100).toFixed(1);
  const isProfit = profitLoss >= 0;

  const progress = isActive
    ? (displayRun.currentRound / displayRun.totalRounds) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">🎮 Instinct.fi</h1>
            <p className="text-muted-foreground">Gamified community trading on Solana</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="shadow-soft-sm"
          >
            Profile
          </Button>
        </div>

        {/* User Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{currentUser.xp}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{currentUser.totalRuns}</div>
              <div className="text-sm text-muted-foreground">Runs Joined</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{currentUser.winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{currentUser.badges.length}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active/Waiting Run Card */}
          <Card className="bg-gradient-hero border-primary/30 shadow-soft-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
                  {getRunStatusEmoji(displayRun.status)} Run #{displayRun.id}
                </CardTitle>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className={
                    isActive
                      ? 'bg-red-500/10 text-red-600 border-red-500/30'
                      : 'bg-primary/10 text-primary border-primary/30'
                  }
                >
                  {displayRun.status.toUpperCase()}
                </Badge>
              </div>
              <CardDescription>
                {isActive
                  ? `Trading ${displayRun.tradingPair}`
                  : 'Waiting for game to start'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pool Info */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Total Pool
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatUSDC(displayRun.totalPool)} USDC
                  </span>
                </div>

                {isActive && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profit/Loss</span>
                    <span
                      className={`font-bold ${
                        isProfit ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {isProfit ? '+' : ''}
                      {formatUSDC(profitLoss)} USDC ({isProfit ? '+' : ''}
                      {profitLossPercent}%)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Players
                  </span>
                  <span className="font-medium text-foreground">
                    {displayRun.participantCount} / {displayRun.maxParticipants}
                  </span>
                </div>
              </div>

              {/* Progress */}
              {isActive && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      Round {displayRun.currentRound} / {displayRun.totalRounds}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Countdown */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {isActive ? 'Next Vote Closes' : 'Game Starts'}
                  </span>
                  <span className="text-xl font-mono font-bold text-primary">
                    {formatTime(displayRun.countdown || 0)}
                  </span>
                </div>
              </div>

              {/* Your Participation */}
              {isParticipating && (
                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Your Deposit</div>
                  <div className="text-xl font-bold text-success">
                    {formatUSDC(userParticipation.depositAmount)} USDC
                  </div>
                  {isActive && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Votes: </span>
                      <span className="text-success font-medium">
                        {userParticipation.votesCorrect} / {userParticipation.totalVotes}{' '}
                        correct
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <Button
                className="w-full font-bold text-lg py-6 shadow-soft-md hover:shadow-soft-lg transition-all"
                style={{ background: 'var(--gradient-primary)' }}
                onClick={() =>
                  navigate(isActive ? '/game' : isWaiting ? '/lobby' : '/game')
                }
              >
                {isParticipating
                  ? isActive
                    ? 'Join Game →'
                    : 'View Lobby →'
                  : isWaiting
                  ? 'Join Run →'
                  : 'Spectate →'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">🎯 How It Works</CardTitle>
              <CardDescription>ELI5 Trading Made Simple</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Join a Run</div>
                    <div className="text-sm text-muted-foreground">
                      Deposit 10-100 USDC during waiting phase
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Vote Together</div>
                    <div className="text-sm text-muted-foreground">
                      Every 10 minutes: Buy, Sell, or Skip
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Share Outcomes</div>
                    <div className="text-sm text-muted-foreground">
                      Win or lose together, earn XP and badges
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Collect Rewards</div>
                    <div className="text-sm text-muted-foreground">
                      Withdraw your share after 2 hours
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-warning text-sm">
                      Chaos Mode Active!
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Random leverage (1x-20x) and position size (10%-100%) each
                      round. Embrace the chaos! 🎲
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/history')}
              >
                View Past Runs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Badges */}
        {currentUser.badges.length > 0 && (
          <Card className="mt-6 card-elevated">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">🏆 Your Recent Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentUser.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/30 rounded-lg p-4 shadow-soft-sm"
                  >
                    <div className="text-4xl mb-2">{badge.emoji}</div>
                    <div className="font-bold text-warning">{badge.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {badge.description}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-2">
                      {badge.earnedAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

