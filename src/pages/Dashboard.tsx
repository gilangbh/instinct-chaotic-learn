import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  activeRun,
  waitingRun,
  formatUSDC,
  formatTime,
  getRunStatusEmoji,
} from '@/lib/mockData';
import { ArrowRight, TrendingUp, Users, Clock, Coins, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers, useRuns } from '@/hooks/useApi';
import { DepositDialog } from '@/components/DepositDialog';
import { useCountdown } from '@/hooks/useCountdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Fetch user stats from backend
  const { data: userStatsResponse, isLoading: statsLoading } = useUsers.useGetUserStats(user?.id || '');
  const { data: userDetailsResponse, isLoading: detailsLoading } = useUsers.useGetUserDetails(user?.id || '');
  
  // Fetch active runs from backend
  const { data: activeRunsResponse, isLoading: runsLoading } = useRuns.useGetActiveRuns();

  const userStats = userStatsResponse?.data;
  const userDetails = userDetailsResponse?.data;
  const backendRuns = activeRunsResponse?.data || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine which run to show - prioritize backend data, fallback to mock
  const backendActiveRun = backendRuns.find((r: any) => r.status === 'ACTIVE');
  const backendWaitingRun = backendRuns.find((r: any) => r.status === 'WAITING');
  
  // Use backend run if available, otherwise fallback to mock data
  const hasBackendRuns = !runsLoading && backendRuns.length > 0;
  let displayRun;
  
  if (backendActiveRun) {
    displayRun = {
      ...backendActiveRun,
      status: backendActiveRun.status.toLowerCase(),
      participants: backendActiveRun.participants || [],
      participantCount: backendActiveRun.participants?.length || 0,
      minDeposit: backendActiveRun.minDeposit || 10000,
      maxDeposit: backendActiveRun.maxDeposit || 100000,
    };
  } else if (backendWaitingRun) {
    displayRun = {
      ...backendWaitingRun,
      status: backendWaitingRun.status.toLowerCase(),
      participants: backendWaitingRun.participants || [],
      participantCount: backendWaitingRun.participants?.length || 0,
      minDeposit: backendWaitingRun.minDeposit || 10000,
      maxDeposit: backendWaitingRun.maxDeposit || 100000,
    };
  } else {
    // Fallback to mock data
    displayRun = activeRun.status === 'active' ? activeRun : waitingRun;
  }
  
  const isActive = displayRun.status === 'active';
  const isWaiting = displayRun.status === 'waiting';

  // Use smooth client-side countdown
  const smoothCountdown = useCountdown(displayRun.countdown, displayRun.countdown);

  const userParticipation = displayRun.participants?.find(
    (p: any) => p.user?.id === user?.id || p.userId === user?.id
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
            <p className="text-muted-foreground">
              Gamified community trading on Solana
              {user && (
                <span className="ml-2 text-primary font-semibold">
                  • {user.username}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DepositDialog 
              runId={displayRun.id.toString()}
              minDeposit={displayRun.minDeposit / 1000} 
              maxDeposit={displayRun.maxDeposit / 1000}
            />
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="shadow-soft-sm"
            >
              Profile
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="shadow-soft-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* User Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-elevated">
            <CardContent className="p-4">
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {userStats?.totalXp || user?.xp || 0}
                </div>
              )}
              <div className="text-sm text-muted-foreground">Total XP</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {userStats?.totalRuns || user?.totalRuns || 0}
                </div>
              )}
              <div className="text-sm text-muted-foreground">Runs Joined</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {userStats?.winRate?.toFixed(1) || user?.winRate || 0}%
                </div>
              )}
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              {detailsLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {userDetails?.badges?.length || user?.badges?.length || 0}
                </div>
              )}
              <div className="text-sm text-muted-foreground">Badges</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active/Waiting Run Card */}
          {hasBackendRuns ? (
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
                    {isActive ? 'Next Vote Closes' : 'Lobby Ends In'}
                  </span>
                  <span className="text-xl font-mono font-bold text-primary">
                    {formatTime(smoothCountdown)}
                  </span>
                </div>
                {isWaiting && smoothCountdown > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Run starts automatically in {Math.floor(smoothCountdown / 60)} min {smoothCountdown % 60} sec
                  </div>
                )}
                {isWaiting && (displayRun.participants?.length || 0) === 0 && (
                  <div className="mt-2 text-xs text-warning text-center">
                    ⚠️ Run will be canceled if no one joins
                  </div>
                )}
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
                  navigate(isActive ? `/game/${displayRun.id}` : isWaiting ? `/lobby/${displayRun.id}` : `/game/${displayRun.id}`)
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
          ) : (
          <Card className="bg-muted/50 border-dashed border-2 shadow-soft-lg">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Currently Active Runs</h3>
              <p className="text-muted-foreground mb-6">
                There are no trading runs available right now.<br />
                New runs are created regularly - check back soon!
              </p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <div className="text-sm text-muted-foreground">
                  When a run is available, you can:
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-primary" />
                  <span>Deposit 10-100 USDC to join</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Vote with the community</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>Share profits & earn XP</span>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

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
        {!detailsLoading && userDetails?.badges && userDetails.badges.length > 0 && (
          <Card className="mt-6 card-elevated">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">🏆 Your Recent Badges</CardTitle>
            </CardHeader>
            <CardContent>
              {detailsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userDetails.badges.slice(0, 6).map((badgeItem: any) => {
                    // Handle both UserBadge structure (from API) and simplified Badge structure (fallback)
                    const badge = badgeItem.badge || badgeItem;
                    const badgeId = badgeItem.badgeId || badgeItem.id;
                    const earnedAt = badgeItem.earnedAt;
                    
                    return (
                      <div
                        key={badgeId}
                        className="bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/30 rounded-lg p-4 shadow-soft-sm"
                      >
                        <div className="text-4xl mb-2">{badge.emoji}</div>
                        <div className="font-bold text-warning">{badge.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {badge.description}
                        </div>
                        <div className="text-xs text-muted-foreground/70 mt-2">
                          {new Date(earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

