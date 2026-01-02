import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Activity, Box, Cpu, Terminal, Shield, Layers, Target, ChevronRight, Signal, TrendingUp, Radar
} from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';
import { Badge } from '@/components/ui/instinct/Badge';
import { Typewriter } from '@/components/ui/instinct/Typewriter';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers, useRuns } from '@/hooks/useApi';
import { formatUSDC } from '@/lib/mockData';
import { useCountdown } from '@/hooks/useCountdown';
import { Run, RunParticipant } from "@/lib/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user stats from backend
  const { data: userStatsResponse, isLoading: statsLoading } =
    useUsers.useGetUserStats(user?.id || "");
  const { data: userDetailsResponse } = useUsers.useGetUserDetails(
    user?.id || ""
  );
  const { data: extendedStatsResponse, isLoading: extendedStatsLoading } =
    useUsers.useGetExtendedUserStats(user?.id || "");

  // Fetch active runs from backend
  const { data: activeRunsResponse, isLoading: runsLoading } =
    useRuns.useGetActiveRuns();
  const { data: runHistoryResponse } = useRuns.useGetRunHistory(1, 20);

  const userStats = userStatsResponse?.data;
  const extendedStats = extendedStatsResponse?.data;
  const backendRuns = activeRunsResponse?.data || [];
  const runHistory = runHistoryResponse?.data || [];

  // Determine which run to show - prioritize backend data
  const backendActiveRun = backendRuns.find((r: Run) => r.status === "ACTIVE");
  const backendWaitingRun = backendRuns.find(
    (r: Run) => r.status === "WAITING"
  );

  const displayRun = backendActiveRun || backendWaitingRun;
  const isActive = displayRun?.status === "ACTIVE";
  const isWaiting = displayRun?.status === "WAITING";

  // Calculate stats
  const totalPool =
    displayRun?.participants?.reduce(
      (sum: number, p: RunParticipant) => sum + (p.depositAmount || 0),
      0
    ) ||
    displayRun?.totalPool ||
    0;
  const participantCount = displayRun?.participants?.length || 0;
  const currentRound = displayRun?.currentRound || 0;
  const totalRounds = displayRun?.totalRounds || 12;
  const tradingPair = displayRun?.tradingPair || "SOL/USDC";
  const coin = tradingPair.split("/")[0] || "SOL";

  // Calculate consensus (mock for now - would need vote data)
  const consensus = 83; // This would come from voting data

  // Countdown
  const countdown = displayRun?.countdown || 0;
  const smoothCountdown = useCountdown(countdown, countdown);

  // Net Asset Value from extended stats (in cents, convert to USDC)
  const navInCents = extendedStats?.netAssetValue || 0;
  const nav = navInCents / 100; // Convert cents to USDC

  // Calculate NAV change percentage based on total profit
  // If totalProfit is positive, show positive change
  const totalProfitInCents = extendedStats?.totalProfit || 0;
  const totalDepositsInCents = extendedStats?.totalDeposits || 0;
  const navChange =
    totalDepositsInCents > 0
      ? ((totalProfitInCents / totalDepositsInCents) * 100).toFixed(1)
      : "0.0";

  // Global Rank from extended stats
  const globalRank = extendedStats?.globalRank || 0;

  const onEnterRun = () => {
    if (displayRun) {
      navigate(isActive ? `/game/${displayRun.id}` : `/lobby/${displayRun.id}`);
    }
  };

  // Format run history for display
  const formattedHistory = (Array.isArray(runHistory) ? runHistory : [])
    .slice(0, 5)
    .map((run: Run) => {
      const startingPool = run.startingPool || 0;
      const totalPool = run.totalPool || 0;
      const change =
        startingPool > 0
          ? ((totalPool - startingPool) / startingPool) * 100
          : 0;
      return {
        ...run,
        change,
        isProfit: change >= 0,
      };
    });

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-12 gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="col-span-12 flex justify-between items-end border-b border-zinc-800/50 pb-6 relative">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
          <div>
            <h1 className="text-5xl font-light tracking-tighter text-white mb-2 font-display animate-glitch">
              INSTINCTFI <span className="text-indigo-500 font-bold">XYZ_</span>
            </h1>
            <div className="flex gap-4 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                SYSTEM ONLINE
              </span>
              <span>
                EPOCH: <Typewriter text="42.0.1" speed={100} delay={500} />
              </span>
              <span className="flex items-center gap-1">
                <Signal size={10} /> 14 GWEI
              </span>
            </div>
          </div>
          <div className="flex gap-8 text-right">
            <div className="group">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">
                Net Asset Value
              </div>
              <div className="text-3xl font-mono text-white">
                ${nav.toLocaleString()}{" "}
                <span className="text-emerald-500 text-sm">
                  (+{navChange}%)
                </span>
              </div>
            </div>
            <div className="group">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">
                Global Rank
              </div>
              <div className="text-3xl font-mono text-indigo-400">
                #{globalRank}
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Featured Run */}
          {displayRun ? (
            <Panel
              active
              className="p-8 cursor-pointer relative overflow-hidden group h-full flex flex-col justify-between min-h-[400px]"
              onClick={onEnterRun}
            >
              <div className="absolute top-0 right-0 p-2 px-4 text-xs font-mono text-indigo-300 border-b border-l border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md z-20">
                <span className="animate-pulse">●</span> STATUS:{" "}
                {displayRun.status.toUpperCase()} [{currentRound}/{totalRounds}]
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-600/20 transition-colors duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse" />
                    <div className="w-20 h-20 border border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center text-indigo-400 relative z-10 hexagon-clip">
                      <Zap
                        size={40}
                        strokeWidth={1.5}
                        className="drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl text-white font-light mb-2 tracking-tight">
                      {coin}-PERP{" "}
                      <span className="text-zinc-600 text-2xl">/</span> USDC
                    </h2>
                    <div className="flex items-center gap-3 text-sm font-mono">
                      <Badge label="VOLATILITY: HIGH" color="cyan" pulse />
                      <span className="text-zinc-700">|</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <TrendingUp size={14} /> YIELD:{" "}
                        {displayRun.totalPool && displayRun.startingPool
                          ? `+${(
                              ((displayRun.totalPool -
                                displayRun.startingPool) /
                                displayRun.startingPool) *
                              100
                            ).toFixed(0)}%`
                          : "+24%"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[
                    {
                      label: "Pool Liquidity",
                      val: `$${formatUSDC(totalPool)}`,
                      icon: Box,
                      color: "text-white",
                    },
                    {
                      label: "Active Nodes",
                      val: participantCount.toString(),
                      icon: Cpu,
                      color: "text-indigo-300",
                    },
                    {
                      label: "Consensus",
                      val: `${consensus}%`,
                      icon: Radar,
                      color: "text-emerald-300",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-black/40 p-4 border border-zinc-800/50 backdrop-blur-sm group/stat hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase mb-2 group-hover/stat:text-indigo-400">
                        <stat.icon size={12} /> {stat.label}
                      </div>
                      <div className={`text-xl font-mono ${stat.color}`}>
                        {stat.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-end relative z-10">
                <div className="flex -space-x-3 pl-2">
                  {displayRun.participants
                    ?.slice(0, 4)
                    .map((p: RunParticipant, i: number) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 ring-4 ring-[#080808] relative z-0 hover:z-10 transition-all hover:scale-110 hover:border-indigo-500 cursor-help"
                      >
                        {p.user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    ))}
                  {participantCount > 4 && (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 ring-4 ring-[#080808] z-0">
                      +{participantCount - 4}
                    </div>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="pl-10 pr-10 h-14 text-sm shadow-lg shadow-indigo-900/20"
                >
                  Initialize Link{" "}
                  <ChevronRight size={16} className="ml-2 animate-pulse" />
                </Button>
              </div>
            </Panel>
          ) : (
            <Panel className="p-8 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-zinc-300 mb-2">
                  No Active Runs
                </h3>
                <p className="text-zinc-500 text-sm">
                  Check back soon for new trading opportunities
                </p>
              </div>
            </Panel>
          )}

          {/* Secondary Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel className="p-6 min-h-[200px] flex flex-col justify-between hover:bg-zinc-900/50 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <Badge label="Queued" color="zinc" />
                  <h3 className="text-xl mt-4 text-zinc-300 group-hover:text-white transition-colors font-display">
                    BTC-PERP
                  </h3>
                </div>
                <Terminal
                  size={20}
                  className="text-zinc-600 group-hover:text-indigo-400 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <div className="w-full bg-zinc-900 h-1.5 overflow-hidden">
                  <div className="bg-zinc-600 h-full w-3/4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]" />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span className="animate-pulse">FILLING...</span>
                  <span>75%</span>
                </div>
              </div>
            </Panel>

            <Panel className="p-6 min-h-[200px] flex flex-col justify-between border-dashed border-zinc-800 opacity-60 hover:opacity-80 transition-opacity cursor-not-allowed">
              <div className="flex justify-between items-start">
                <div>
                  <Badge label="Locked" color="red" />
                  <h3 className="text-xl mt-4 text-zinc-500 font-display">
                    ETH-CORE
                  </h3>
                </div>
                <Shield size={20} className="text-zinc-700" />
              </div>
              <div className="text-xs text-red-900/80 font-mono border border-red-900/30 bg-red-900/10 p-2 text-center uppercase tracking-wider">
                <Shield size={10} className="inline mr-2" /> Level 15 Required
              </div>
            </Panel>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Panel className="p-6 h-auto flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} className="text-indigo-500" /> Protocol
                History
              </h3>
              <button
                onClick={() => navigate("/history")}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-0 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
              {formattedHistory.length > 0 ? (
                formattedHistory.map(
                  (
                    run: Run & { change: number; isProfit: boolean },
                    i: number
                  ) => (
                    <div
                      key={i}
                      onClick={() => navigate(`/results/${run.id}`)}
                      className="flex justify-between items-center text-sm border-b border-zinc-800/30 py-3 last:border-0 hover:bg-indigo-500/5 px-2 transition-all cursor-pointer group hover:border-indigo-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${
                            run.isProfit
                              ? "bg-emerald-500 text-emerald-500"
                              : "bg-red-500 text-red-500"
                          }`}
                        />
                        <span className="font-mono text-zinc-400 group-hover:text-white transition-colors">
                          #{run.id} {run.tradingPair || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`font-mono ${
                            run.isProfit ? "text-emerald-500" : "text-red-500"
                          } font-bold`}
                        >
                          {run.isProfit ? "+" : ""}
                          {run.change.toFixed(1)}%
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center text-zinc-500 text-sm py-8">
                  No history yet
                </div>
              )}
            </div>
          </Panel>

          <Panel className="p-6 bg-gradient-to-br from-zinc-900/80 to-black border-indigo-500/20 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <Target size={14} /> Daily Quests
            </h3>
            <ul className="space-y-6 relative z-10">
              <li className="text-sm group">
                <div className="flex justify-between mb-2 text-zinc-300 font-display tracking-wide">
                  <span className="group-hover:text-indigo-300 transition-colors">
                    Consensus Master
                  </span>
                  <span className="text-indigo-400 font-mono text-xs">3/5</span>
                </div>
                <div className="w-full bg-zinc-900/80 h-2 border border-zinc-800 rounded-sm overflow-hidden">
                  <div className="bg-indigo-500 h-full w-3/5 shadow-[0_0_15px_rgba(99,102,241,0.6)] relative">
                    <div className="absolute top-0 right-0 w-1 h-full bg-white/50 animate-pulse" />
                  </div>
                </div>
              </li>
              <li className="text-sm group">
                <div className="flex justify-between mb-2 text-zinc-300 font-display tracking-wide">
                  <span className="group-hover:text-emerald-300 transition-colors">
                    Diamond Hand
                  </span>
                  <span className="text-emerald-500 font-mono text-xs flex items-center gap-1">
                    <Target size={10} /> DONE
                  </span>
                </div>
                <div className="w-full bg-zinc-900/80 h-2 border border-zinc-800 rounded-sm overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full shadow-[0_0_15px_rgba(16,185,129,0.6)] relative">
                    <div className="absolute inset-0 bg-white/10 animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
