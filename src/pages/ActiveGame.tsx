import { useState, useMemo, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/instinct/Button';
import { Panel } from '@/components/ui/instinct/Panel';
import { Badge } from '@/components/ui/instinct/Badge';
import { toast } from 'sonner';
import { formatUSDC, formatTime } from '@/lib/mockData';
import { useMarket, useRuns } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useVoteWebSocket } from '@/hooks/useVoteWebSocket';
import {
  ChevronRight,
  Activity,
  Shield,
  TrendingUp,
  TrendingDown,
  Terminal,
  Globe,
  Scan,
  Dice5,
  Clock,
  Users,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const ActiveGame = () => {
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [vote, setVote] = useState<'long' | 'short' | 'skip' | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);

  // Generate animated chart data
  useEffect(() => {
    const points = Array.from({ length: 50 }, (_, i) => {
      return 50 + Math.sin(i * 0.15) * 15 + Math.sin(i * 0.5) * 5 + Math.random() * 8;
    });
    setChartData(points);
  }, []);

  // Fetch data
  const enableQueries = Boolean(runId && user);
  const runQuery = useRuns.useGetRun(runId || '', { enabled: enableQueries });
  const run = runQuery.data?.data;
  
  // Only fetch voting round if run is ACTIVE
  const votingRoundQuery = useRuns.useGetCurrentVotingRound(runId || '', { 
    enabled: enableQueries && run?.status === 'ACTIVE' 
  });
  const tradesQuery = useRuns.useGetRunTrades(runId || '', { enabled: enableQueries });
  const systemLogsQuery = useRuns.useGetSystemLogs(runId || '', { enabled: enableQueries, limit: 20 });
  const castVoteMutation = useRuns.useCastVote();
  
  // WebSocket for real-time vote updates
  const { voteUpdate, isConnected: isWsConnected } = useVoteWebSocket(runId);

  const currentVotingRound = votingRoundQuery.data?.data;
  const trades = tradesQuery.data?.data || [];
  const systemLogs = systemLogsQuery.data?.data || [];
  
  // Get last trade
  const lastTrade = trades.length > 0 ? trades[trades.length - 1] : null;

  const isLoading = runQuery.isLoading || !run;
  const shouldRedirect = Boolean(run) && run.status !== 'ACTIVE';
  const shouldRedirectToResults = Boolean(run) && run.status === 'ENDED';

  // Calculate pool and PnL
  const totalPoolCents = run?.totalPool ?? 0;
  const startingPoolCents = run?.startingPool ?? 0;
  const profitLoss = totalPoolCents - startingPoolCents;
  const profitLossPercent = startingPoolCents > 0 ? ((profitLoss / startingPoolCents) * 100).toFixed(2) : '0.00';
  const isProfit = profitLoss >= 0;

  // Get user's participant data
  const userParticipant = run?.participants?.find((p: any) => p.userId === user?.id);
  const userDeposit = userParticipant?.depositAmount || 0;

  // Handle vote submission
  const handleVote = async (choice: 'long' | 'short' | 'skip') => {
    if (!runId || !currentVotingRound) {
      toast.error('No active voting round');
      return;
    }

    setVote(choice);

    try {
      await castVoteMutation.mutateAsync({
        id: runId,
        data: {
          round: currentVotingRound.round,
          choice: choice.toUpperCase() as 'LONG' | 'SHORT' | 'SKIP',
        },
      });
      
      toast.success(`Vote cast: ${choice.toUpperCase()}`);
      
      // Invalidate queries after a short delay to allow backend to process
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['run', runId, 'voting-round'] });
        queryClient.invalidateQueries({ queryKey: ['run', runId, 'trades'] });
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cast vote');
      setVote(null);
    }
  };

  // Redirect logic
  if (shouldRedirectToResults) {
    return <Navigate to={`/results/${runId}`} replace />;
  }

  if (shouldRedirect) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!run) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render chart
  const renderChart = () => {
    const max = Math.max(...chartData, 100);
    const min = Math.min(...chartData, 0);
    const path = chartData.map((val, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      const y = 100 - ((val - min) / (max - min)) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="glow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
          </linearGradient>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
          </pattern>
          <mask id="mask-fade">
            <linearGradient id="grad1" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="white" stopOpacity="1"/>
            </linearGradient>
            <rect x="0" y="0" width="100" height="100" fill="url(#grad1)" />
          </mask>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <polyline 
          points={path} 
          fill="none" 
          stroke="#00F0FF" 
          strokeWidth="0.5" 
          vectorEffect="non-scaling-stroke"
          className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
          mask="url(#mask-fade)"
        />
        <polygon points={`0,100 ${path} 100,100`} fill="url(#glow)" mask="url(#mask-fade)" />
        <line x1="100" y1="0" x2="100" y2="100" stroke="#00F0FF" strokeWidth="0.2" className="opacity-50">
          <animate attributeName="x1" from="0" to="100" dur="5s" repeatCount="indefinite" />
          <animate attributeName="x2" from="0" to="100" dur="5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur="5s" repeatCount="indefinite" />
        </line>
        <circle cx="100" cy="50" r="1" fill="white" className="animate-pulse shadow-[0_0_10px_white]" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeDasharray="2" strokeWidth="0.2" />
      </svg>
    );
  };

  // Format log timestamp
  const formatLogTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get log type color
  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'CONSENSUS_REACHED': return 'text-emerald-500';
      case 'USER_JOIN': return 'text-indigo-400';
      case 'USER_LEAVE': return 'text-red-400';
      case 'SIGNAL_DETECTED': return 'text-purple-400';
      case 'TRADE_EXECUTED': return 'text-cyan-400';
      case 'ROUND_START': return 'text-amber-400';
      case 'ROUND_END': return 'text-orange-400';
      case 'RUN_START': return 'text-green-500';
      case 'RUN_END': return 'text-red-500';
      default: return 'text-zinc-500';
    }
  };

  // Get current round number
  const currentRound = currentVotingRound?.round || run.currentRound || 1;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col p-4 lg:p-6 max-w-[1800px] mx-auto animate-in zoom-in-95 duration-300 min-h-full">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4 relative z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <ChevronRight className="rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge label={`Run #${run.id.slice(0, 8)}`} color="zinc" />
                <Badge label={`Round ${currentRound}/${run.totalRounds}`} color="indigo" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                {run.coin} / USDC 
                <span className={`text-sm px-2 py-0.5 rounded border font-mono ${
                  isProfit 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                }`}>
                  {isProfit ? '+' : ''}{profitLossPercent}%
                </span>
              </h2>
            </div>
            <Badge label={`Round ${currentRound}/${run.totalRounds}`} color="purple" pulse />
          </div>
          
          <div className="flex items-center gap-8 font-mono bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-right px-2 hidden md:block">
              <div className="text-[10px] text-zinc-500 uppercase">Pool Value</div>
              <div className="text-xl text-[#00F0FF] font-bold text-shadow-glow">${formatUSDC(totalPoolCents)}</div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden md:block" />
            <div className="text-right px-2 hidden md:block">
              <div className="text-[10px] text-zinc-500 uppercase">Your Stake</div>
              <div className="text-xl text-zinc-200">${formatUSDC(userDeposit)}</div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden md:block" />
            <div className="text-right px-2 hidden md:block">
              <div className="text-[10px] text-zinc-500 uppercase"># Players</div>
              <div className="text-xl text-zinc-200">{run.participants?.length || 0}</div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden md:block" />
            <div className="text-right px-2 hidden lg:block">
              <div className="text-[10px] text-zinc-500 uppercase">Your Votes</div>
              <div className="text-xl text-zinc-200">
                {userParticipant?.totalVotes || 0}/{currentRound - 1} 
                <span className="text-sm text-emerald-400 ml-1">
                  {userParticipant?.totalVotes ? Math.round((userParticipant.votesCorrect / userParticipant.totalVotes) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden lg:block" />
            <div className="text-right px-2">
              <div className="text-[10px] text-zinc-500 uppercase">Timer</div>
              <div className="text-2xl text-white font-bold animate-pulse text-red-500">
                {formatTime(currentVotingRound?.timeRemaining || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 relative z-10 overflow-y-auto custom-scrollbar pb-4">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            {/* Chart */}
            <Panel className="h-[400px] lg:h-[500px] relative bg-[#000000]/60 overflow-hidden border-indigo-500/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 to-transparent" />
              {renderChart()}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1.5 border border-[#00F0FF]/30 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <Activity size={14} /> LEVERAGE: <span className="font-bold">{currentVotingRound ? (currentVotingRound.leverage / 10).toFixed(1) : '?'}x</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/30 backdrop-blur-md">
                  <Shield size={14} /> POSITION: {currentVotingRound ? (currentVotingRound.positionSize / 10).toFixed(0) : '?'}%
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/80 border-t border-zinc-800 flex items-center overflow-hidden">
                <div className="whitespace-nowrap text-[10px] font-mono text-zinc-500 animate-marquee flex gap-8 px-4">
                  <span>BTC: $94,230 (+1.2%)</span>
                  <span>ETH: $3,120 (-0.4%)</span>
                  <span>SOL: $142.50 (+5.1%)</span>
                  <span>LUNA: $0.00 (REKT)</span>
                  <span>BTC: $94,230 (+1.2%)</span>
                  <span>ETH: $3,120 (-0.4%)</span>
                  <span>SOL: $142.50 (+5.1%)</span>
                </div>
              </div>
            </Panel>

            {/* System Logs */}
            <Panel className="mt-4 h-32 lg:h-40 p-4 font-mono text-xs overflow-y-auto custom-scrollbar bg-black border-t-0 shadow-inner">
              <div className="text-zinc-500 mb-3 border-b border-zinc-800/50 pb-2 flex justify-between items-center sticky top-0 bg-black z-10">
                <span className="flex items-center gap-2"><Terminal size={12}/> SYSTEM_LOGS</span>
                <span className="text-[10px] text-emerald-500 animate-pulse">● LIVE FEED</span>
              </div>
              <div className="space-y-2">
                {systemLogs.length > 0 ? (
                  systemLogs.map((log: any, i: number) => (
                    <div key={i} className="flex gap-3 text-zinc-500 hover:bg-zinc-900/30 p-1 rounded transition-colors">
                      <span className="opacity-50">[{formatLogTime(log.createdAt)}]</span>
                      <span className={`${getLogTypeColor(log.type)} font-bold`}>{log.type}</span>
                      <span className="text-zinc-300">:: {log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-3 text-zinc-500 opacity-50 p-1">
                    <span>[--:--:--]</span>
                    <span className="animate-pulse">waiting for system events..._</span>
                  </div>
                )}
              </div>
            </Panel>
            
            {/* Last Round Result */}
            {lastTrade && (
              <Panel className="p-6 bg-zinc-900/50 border-zinc-800">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  {lastTrade.direction === 'LONG' ? (
                    <TrendingUp size={14} className="text-cyan-400" />
                  ) : (
                    <TrendingDown size={14} className="text-red-400" />
                  )} Last Round Result (Round {lastTrade.round})
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Decision</div>
                    <div className={`text-lg font-display font-bold flex items-center gap-2 ${
                      lastTrade.direction === 'LONG' ? 'text-cyan-400' : 
                      lastTrade.direction === 'SHORT' ? 'text-red-400' : 'text-zinc-400'
                    }`}>
                      {lastTrade.direction} {lastTrade.direction === 'LONG' ? <TrendingUp size={16} /> : lastTrade.direction === 'SHORT' ? <TrendingDown size={16} /> : null}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Strategy</div>
                    <div className="text-sm text-zinc-300 font-mono">
                      {(lastTrade.leverage / 10).toFixed(1)}x leverage, {(lastTrade.positionSize / 10).toFixed(0)}% size
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Entry → Exit</div>
                    <div className="text-sm text-zinc-300 font-mono">
                      ${parseFloat(lastTrade.entryPrice.toString()).toFixed(2)} → {lastTrade.exitPrice ? `$${parseFloat(lastTrade.exitPrice.toString()).toFixed(2)}` : 'Open'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Result</div>
                    <div className={`text-lg font-display font-bold ${
                      lastTrade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {lastTrade.pnl >= 0 ? '+' : ''}{formatUSDC(lastTrade.pnl)} USDC
                    </div>
                  </div>
                </div>
                
                {currentVotingRound?.voteDistribution && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-[10px] text-zinc-600 uppercase mb-2">Vote Distribution</div>
                    <div className="flex items-center gap-4 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-cyan-400" />
                        <span className="text-zinc-500">LONG:</span>
                        <span className="text-cyan-400">{(currentVotingRound.voteDistribution as any).long || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown size={14} className="text-red-400" />
                        <span className="text-zinc-500">SHORT:</span>
                        <span className="text-red-400">{(currentVotingRound.voteDistribution as any).short || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-zinc-500" />
                        <span className="text-zinc-500">SKIP:</span>
                        <span className="text-zinc-400">{(currentVotingRound.voteDistribution as any).skip || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* This Round's Strategy */}
            {currentVotingRound && (
              <Panel className="p-4 bg-zinc-900/50 border-amber-500/20">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Dice5 size={14} /> This Round's Strategy
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Leverage</span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {(currentVotingRound.leverage / 10).toFixed(1)}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Position Size</span>
                    <span className="text-lg font-mono font-bold text-zinc-300">
                      {(currentVotingRound.positionSize / 10).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-2 border-t border-zinc-800 pt-2">
                    Chaos parameters are random each round 🎲
                  </div>
                </div>
              </Panel>
            )}
            
            {/* Voting Panel */}
            <Panel className="p-6 flex-1 flex flex-col gap-4 justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
              <div className="text-center mb-4 relative z-10">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Scan size={16} className="text-indigo-500"/> Input Command
                </h3>
                <p className="text-xs text-zinc-600 mt-1">Predict the next price action</p>
              </div>
              <Button 
                variant="long" 
                className="h-24 text-lg flex items-center justify-between group relative overflow-visible"
                onClick={() => handleVote('long')}
                active={vote === 'long'}
                disabled={!currentVotingRound || castVoteMutation.isPending}
              >
                <span className="flex flex-col items-start z-10">
                  <span className="font-display font-bold text-2xl tracking-wide">LONG</span>
                  <span className="text-[10px] opacity-80 font-mono uppercase text-cyan-200">Expect Upside</span>
                </span>
                <div className="relative z-10 bg-[#00F0FF]/10 p-3 rounded-full group-hover:bg-[#00F0FF]/20 group-hover:scale-110 transition-all duration-300 border border-[#00F0FF]/30">
                  <TrendingUp size={28} className="group-hover:-translate-y-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-[#00F0FF]/5 blur-xl group-hover:bg-[#00F0FF]/10 transition-colors" />
              </Button>
              <Button 
                variant="short" 
                className="h-24 text-lg flex items-center justify-between group relative overflow-visible"
                onClick={() => handleVote('short')}
                active={vote === 'short'}
                disabled={!currentVotingRound || castVoteMutation.isPending}
              >
                <span className="flex flex-col items-start z-10">
                  <span className="font-display font-bold text-2xl tracking-wide">SHORT</span>
                  <span className="text-[10px] opacity-80 font-mono uppercase text-rose-200">Expect Downside</span>
                </span>
                <div className="relative z-10 bg-[#FF2A6D]/10 p-3 rounded-full group-hover:bg-[#FF2A6D]/20 group-hover:scale-110 transition-all duration-300 border border-[#FF2A6D]/30">
                  <TrendingDown size={28} className="group-hover:translate-y-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-[#FF2A6D]/5 blur-xl group-hover:bg-[#FF2A6D]/10 transition-colors" />
              </Button>
              <Button 
                variant="neutral" 
                onClick={() => handleVote('skip')} 
                active={vote === 'skip'} 
                className="h-16 opacity-70 hover:opacity-100"
                disabled={!currentVotingRound || castVoteMutation.isPending}
              >
                <span className="text-xs tracking-widest">SKIP ROUND (CONSERVE)</span>
              </Button>
              
              <div className="text-[10px] text-center text-zinc-600 font-mono mt-2 border-t border-zinc-800 pt-2">
                Votes are hidden until the round ends. No penalties for missing votes!
              </div>
            </Panel>

            {/* Participants Panel */}
            <Panel className="p-4 max-h-64 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <Globe size={12}/> Node Network ({run.participants?.length || 0})
                </span>
                <Badge label={`ACC: ${userParticipant?.totalVotes ? Math.round((userParticipant.votesCorrect / userParticipant.totalVotes) * 100) : 0}%`} color="cyan" />
              </div>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {run.participants?.map((p: any, i: number) => {
                  const accuracy = p.totalVotes > 0 ? Math.round((p.votesCorrect / p.totalVotes) * 100) : 50;
                  
                  return (
                    <div key={i} className="flex justify-between items-center p-2 bg-zinc-900/30 border border-zinc-800/30 rounded-sm hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-1 h-10 transition-all group-hover:scale-y-110 ${
                          accuracy >= 60 ? 'bg-emerald-500' : accuracy >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-300 font-mono font-bold group-hover:text-white">
                              {p.user?.username || 'Anonymous'}
                            </span>
                            {p.userId === user?.id && (
                              <Badge label="You" color="indigo" />
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-600">${formatUSDC(p.depositAmount)} USDC</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-mono font-bold ${
                          accuracy >= 60 ? 'text-emerald-400' : accuracy >= 40 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {accuracy}%
                        </div>
                        <div className="text-[9px] text-zinc-600">correct</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveGame;
