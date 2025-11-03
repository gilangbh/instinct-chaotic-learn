import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { runHistory, formatUSDC } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Star,
  LogOut,
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If no user is logged in, redirect to home
  if (!user) {
    navigate('/');
    return null;
  }

  // Determine which profile to show
  const isOwnProfile = !userId || userId === user.id;
  // TODO: Fetch other user's data from API when viewing someone else's profile
  // For now, just show own profile
  const profileUser = isOwnProfile ? user : user; // Will be replaced with API call

  // Ensure badges array exists
  const userBadges = profileUser.badges || [];

  // Calculate stats
  const totalProfit = 15400; // Mock total profit across all runs
  const nextLevelXP = 3000;
  const xpProgress = (profileUser.xp / nextLevelXP) * 100;
  const userLevel = Math.floor(profileUser.xp / 1000) + 1;

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
            <div className="font-bold text-foreground">Profile</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Profile Hero */}
        <Card className="bg-gradient-hero border-primary/30 shadow-soft-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl" style={{ background: 'var(--gradient-primary)' }}>
                  🥷
                </div>
                <div className="absolute -bottom-2 -right-2 bg-warning text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-lg border-4 border-background">
                  {userLevel}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2 text-foreground">{profileUser.username}</h1>
                <div className="text-muted-foreground mb-4 font-mono text-sm">
                  {profileUser.walletAddress}
                </div>

                {/* XP Progress */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Level {userLevel}</span>
                    <span className="text-sm text-muted-foreground">
                      {profileUser.xp} / {nextLevelXP} XP
                    </span>
                  </div>
                  <Progress value={xpProgress} className="h-3" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {nextLevelXP - profileUser.xp} XP until level {userLevel + 1}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success">
                    +{formatUSDC(totalProfit)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Profit</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userBadges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Badges</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-warning" />
                <span className="text-muted-foreground text-sm">Total Runs</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{profileUser.totalRuns}</div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-muted-foreground text-sm">Win Rate</span>
              </div>
              <div className="text-3xl font-bold text-success">
                {profileUser.winRate}%
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground text-sm">Total XP</span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {profileUser.xp}
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground text-sm">Badges</span>
              </div>
              <div className="text-3xl font-bold text-secondary">
                {userBadges.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Collection */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-foreground">
              <Award className="w-6 h-6 text-warning" />
              Badge Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {userBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-warning/10 border-2 border-warning/50 rounded-lg p-6 shadow-soft-sm"
                >
                  <div className="text-6xl mb-3 text-center">{badge.emoji}</div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-warning mb-2">
                      {badge.name}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {badge.description}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {badge.earnedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {userBadges.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-lg text-foreground">No badges yet!</div>
                <div className="text-sm">
                  Participate in runs to earn your first badge
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Run History */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-foreground">
              <Star className="w-6 h-6 text-primary" />
              Recent Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {runHistory.map((run) => {
                const profitLoss = run.totalPool - run.startingPool;
                const profitLossPercent = (
                  (profitLoss / run.startingPool) *
                  100
                ).toFixed(1);
                const isProfit = profitLoss >= 0;

                return (
                  <div
                    key={run.id}
                    className="bg-muted rounded-lg p-4 flex items-center justify-between hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                        #{run.id}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{run.tradingPair}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {run.endedAt?.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            isProfit
                              ? 'bg-success/10 text-success border-success/50'
                              : 'bg-destructive/10 text-destructive border-destructive/50'
                          }
                        >
                          {isProfit ? '🟢' : '🔴'} {isProfit ? 'WIN' : 'LOSS'}
                        </Badge>
                      </div>
                      <div
                        className={`text-lg font-bold mt-1 ${
                          isProfit ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {profitLossPercent}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {run.participantCount} players
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {runHistory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-6xl mb-4">📊</div>
                <div className="text-lg text-foreground">No run history yet!</div>
                <div className="text-sm">Join your first run to get started</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements Progress */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">🎯 Achievement Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Win 10 Runs</span>
                <span className="text-sm text-muted-foreground">7/10</span>
              </div>
              <Progress value={70} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Earn 5,000 XP</span>
                <span className="text-sm text-muted-foreground">
                  {profileUser.xp}/5000
                </span>
              </div>
              <Progress value={(profileUser.xp / 5000) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Collect 10 Badges</span>
                <span className="text-sm text-muted-foreground">
                  {userBadges.length}/10
                </span>
              </div>
              <Progress
                value={(userBadges.length / 10) * 100}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">100% Vote Accuracy</span>
                <span className="text-sm text-muted-foreground">83%</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

