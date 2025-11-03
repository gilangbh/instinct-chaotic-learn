import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { runHistory, formatUSDC } from '@/lib/mockData';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Users } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();

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
            <div className="font-bold text-foreground">Run History</div>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Header */}
        <Card className="bg-gradient-hero border-primary/30 shadow-soft-lg">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">Past Runs</h1>
            <p className="text-muted-foreground">
              Browse through previous trading games and their results
            </p>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary">{runHistory.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Runs</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success">
                {runHistory.filter((r) => r.totalPool > r.startingPool).length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Winning Runs</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-destructive">
                {runHistory.filter((r) => r.totalPool < r.startingPool).length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Losing Runs</div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary">
                {runHistory.reduce((sum, r) => sum + r.participantCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Participants</div>
            </CardContent>
          </Card>
        </div>

        {/* Runs List */}
        <div className="space-y-4">
          {runHistory.map((run) => {
            const profitLoss = run.totalPool - run.startingPool;
            const profitLossPercent = ((profitLoss / run.startingPool) * 100).toFixed(1);
            const isProfit = profitLoss >= 0;

            return (
              <Card
                key={run.id}
                className="card-elevated hover:shadow-soft-lg transition-all cursor-pointer"
                onClick={() => navigate(`/results/${run.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                        #{run.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-foreground">
                          {run.tradingPair}
                          <Badge
                            className={
                              isProfit
                                ? 'bg-success/10 text-success border-success/50'
                                : 'bg-destructive/10 text-destructive border-destructive/50'
                            }
                          >
                            {isProfit ? '🟢 WIN' : '🔴 LOSS'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground font-normal mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {run.endedAt?.toLocaleDateString()} at{' '}
                          {run.endedAt?.toLocaleTimeString()}
                        </div>
                      </div>
                    </CardTitle>
                    <div className="text-right">
                      <div
                        className={`text-3xl font-bold ${
                          isProfit ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {profitLossPercent}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isProfit ? '+' : ''}
                        {formatUSDC(profitLoss)} USDC
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-muted rounded p-3">
                      <div className="text-sm text-muted-foreground mb-1">Starting Pool</div>
                      <div className="font-bold text-foreground">{formatUSDC(run.startingPool)} USDC</div>
                    </div>
                    <div className="bg-muted rounded p-3">
                      <div className="text-sm text-muted-foreground mb-1">Final Pool</div>
                      <div className="font-bold text-foreground">{formatUSDC(run.totalPool)} USDC</div>
                    </div>
                    <div className="bg-muted rounded p-3">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Players
                      </div>
                      <div className="font-bold text-foreground">{run.participantCount}</div>
                    </div>
                    <div className="bg-muted rounded p-3">
                      <div className="text-sm text-muted-foreground mb-1">Duration</div>
                      <div className="font-bold text-foreground">{run.duration} minutes</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {isProfit ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span>Community earned together</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-destructive" />
                          <span>Tough market, better luck next time</span>
                        </>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {runHistory.length === 0 && (
          <Card className="card-elevated">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-2xl font-bold mb-2 text-foreground">No runs yet!</div>
              <div className="text-muted-foreground">
                History will appear here after runs are completed
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

