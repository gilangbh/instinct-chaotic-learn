import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatUSDC } from '@/lib/mockData';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  RotateCcw,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRuns } from '@/hooks/useApi';

export default function Results() {
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();
  const { user } = useAuth();

  // Redirect to dashboard if no runId provided
  if (!runId) {
    navigate('/dashboard');
    return null;
  }

  // Fetch run data from API
  const { data: runResponse, isLoading: runLoading } = useRuns.useGetRun(runId);
  const { data: tradesResponse } = useRuns.useGetRunTrades(runId);

  // Extract run data
  const run = runResponse?.data;
  const trades = tradesResponse?.data || [];

  // Show loading state
  if (runLoading || !run) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  // Redirect if run is not ended
  if (run.status !== 'ENDED') {
    toast.error('This run has not ended yet');
    navigate('/dashboard');
    return null;
  }

  const userParticipation = run.participants?.find(
    (p: any) => p.userId === user?.id || p.user?.id === user?.id
  );

  const profitLoss = run.totalPool - run.startingPool;
  const profitLossPercent = run.startingPool > 0
    ? ((profitLoss / run.startingPool) * 100).toFixed(1)
    : '0.0';
  const isProfit = profitLoss >= 0;

  const userProfit = userParticipation
    ? (userParticipation.finalShare || 0) - userParticipation.depositAmount
    : 0;
  const userProfitPercent = userParticipation && userParticipation.depositAmount > 0
    ? ((userProfit / userParticipation.depositAmount) * 100).toFixed(1)
    : '0';

  const handleWithdraw = () => {
    toast.success('Funds withdrawn!', {
      description: `${formatUSDC(
        userParticipation?.finalShare || 0
      )} USDC sent to your wallet`,
    });
    // TODO: Implement actual withdrawal via Solana
  };

  const handlePlayAgain = () => {
    toast.info('Joining next run...', {
      description: 'Your funds will be rolled into the next game',
    });
    navigate('/dashboard');
  };

  // Award badges based on performance
  const badges = [
    {
      id: 'most-correct',
      name: 'Most Correct Votes',
      emoji: '🎯',
      winner: run.participants.reduce((prev, current) =>
        prev.votesCorrect > current.votesCorrect ? prev : current
      ).user,
    },
    {
      id: 'perfect-attendance',
      name: 'Perfect Attendance',
      emoji: '🗳️',
      winner: run.participants.find((p) => p.totalVotes === 12)?.user,
    },
    {
      id: 'just-vibing',
      name: 'Just Vibing',
      emoji: '🎵',
      winner: run.participants.find(
        (p) => p.votesCorrect / p.totalVotes > 0.4 && p.votesCorrect / p.totalVotes < 0.6
      )?.user,
    },
  ];

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
            <div className="font-bold text-foreground">{run.tradingPair}</div>
          </div>
          <Badge className="bg-muted text-muted-foreground">ENDED</Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Hero Section */}
        <Card className="bg-gradient-hero border-primary/30 shadow-soft-lg">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">
              {isProfit ? '🎉' : '💪'}
            </div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              {isProfit ? 'Game Won!' : 'Game Complete!'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isProfit
                ? 'The community made money together! 🚀'
                : 'Better luck next time! Keep learning and growing.'}
            </p>
          </CardContent>
        </Card>

        {/* Pool Results */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Trophy className="w-5 h-5 text-warning" />
                Pool Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Starting Pool</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatUSDC(run.startingPool)} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Final Pool</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatUSDC(run.totalPool)} USDC
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    {isProfit ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                    Total P/L
                  </span>
                  <span
                    className={`text-3xl font-bold ${
                      isProfit ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {isProfit ? '+' : ''}
                    {formatUSDC(profitLoss)} USDC
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className={`text-2xl font-bold ${
                      isProfit ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    ({isProfit ? '+' : ''}
                    {profitLossPercent}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Performance */}
          {userParticipation && (
            <Card className="bg-success/10 border-success/30 shadow-soft-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5 text-success" />
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Your Deposit</span>
                    <span className="text-xl font-bold text-foreground">
                      {formatUSDC(userParticipation.depositAmount)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Your Final Share</span>
                    <span className="text-xl font-bold text-foreground">
                      {formatUSDC(userParticipation.finalShare || 0)} USDC
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="text-muted-foreground">Your P/L</span>
                    <span
                      className={`text-3xl font-bold ${
                        userProfit >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {userProfit >= 0 ? '+' : ''}
                      {formatUSDC(userProfit)} USDC
                    </span>
                  </div>
                  <div className="text-center">
                    <span
                      className={`text-2xl font-bold ${
                        userProfit >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      ({userProfit >= 0 ? '+' : ''}
                      {userProfitPercent}%)
                    </span>
                  </div>

                  <div className="bg-muted rounded-lg p-3 mt-4">
                    <div className="text-sm text-muted-foreground mb-1">Voting Accuracy</div>
                    <div className="text-2xl font-bold text-primary">
                      {userParticipation.votesCorrect}/{userParticipation.totalVotes}{' '}
                      correct
                    </div>
                    <div className="text-sm text-muted-foreground">
                      (
                      {(
                        (userParticipation.votesCorrect /
                          userParticipation.totalVotes) *
                        100
                      ).toFixed(0)}
                      % accuracy)
                    </div>
                  </div>

                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">XP Earned</div>
                    <div className="text-2xl font-bold text-warning">
                      +145 XP ⭐
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Badges Earned */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">🏆 Badges Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-lg p-6 text-center ${
                    badge.winner?.id === currentUser.id
                      ? 'bg-warning/10 border-2 border-warning/50'
                      : 'bg-muted border border-border'
                  }`}
                >
                  <div className="text-5xl mb-3">{badge.emoji}</div>
                  <div className="font-bold text-lg mb-2 text-foreground">{badge.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {badge.winner ? (
                      <>
                        Winner: <span className="text-warning">{badge.winner.username}</span>
                        {badge.winner.id === currentUser.id && (
                          <div className="mt-2 text-success font-medium">✨ You earned this!</div>
                        )}
                      </>
                    ) : (
                      'No winner'
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">📊 Final Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {run.participants
                .sort((a, b) => (b.finalShare || 0) - (a.finalShare || 0))
                .map((participant, index) => {
                  const profit =
                    (participant.finalShare || 0) - participant.depositAmount;
                  const isCurrentUser = participant.user.id === currentUser.id;

                  return (
                    <div
                      key={participant.user.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isCurrentUser
                          ? 'bg-primary/10 border-2 border-primary/50'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                            index === 0
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                              : index === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                              : index === 2
                              ? 'bg-gradient-to-br from-amber-600 to-amber-800'
                              : ''
                          }`}
                          style={index > 2 ? { background: 'hsl(var(--muted-foreground))' } : {}}
                        >
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            {participant.user.username}
                            {isCurrentUser && (
                              <Badge
                                variant="outline"
                                className="ml-2 border-primary text-primary"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {participant.votesCorrect}/{participant.totalVotes} votes
                            correct
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground">
                          {formatUSDC(participant.finalShare || 0)} USDC
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            profit >= 0 ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {profit >= 0 ? '+' : ''}
                          {formatUSDC(profit)} USDC
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {userParticipation && !userParticipation.withdrawn && (
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="font-bold text-lg py-6 shadow-soft-md"
              style={{ background: 'linear-gradient(to right, hsl(var(--success)), hsl(142 71% 40%))' }}
              onClick={handleWithdraw}
            >
              <Download className="mr-2 w-5 h-5" />
              Withdraw {formatUSDC(userParticipation.finalShare || 0)} USDC
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-bold text-lg py-6"
              onClick={handlePlayAgain}
            >
              <RotateCcw className="mr-2 w-5 h-5" />
              Play Again
            </Button>
          </div>
        )}

        {userParticipation?.withdrawn && (
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-bold text-lg text-success">
                Funds Already Withdrawn
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Your funds have been sent to your wallet
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

