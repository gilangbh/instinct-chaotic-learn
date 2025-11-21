import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/instinct/Button';
import { Panel } from '@/components/ui/instinct/Panel';
import { Badge } from '@/components/ui/instinct/Badge';
import { endedRun, currentUser, formatUSDC } from '@/lib/mockData';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Download,
  RotateCcw,
  Award,
  Target,
  Users,
  Zap,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function Results() {
  const navigate = useNavigate();

  const userParticipation = endedRun.participants.find(
    (p) => p.user.id === currentUser.id
  );

  const profitLoss = endedRun.totalPool - endedRun.startingPool;
  const profitLossPercent = ((profitLoss / endedRun.startingPool) * 100).toFixed(1);
  const isProfit = profitLoss >= 0;

  const userProfit = userParticipation
    ? (userParticipation.finalShare || 0) - userParticipation.depositAmount
    : 0;
  const userProfitPercent = userParticipation
    ? ((userProfit / userParticipation.depositAmount) * 100).toFixed(1)
    : '0';

  const handleWithdraw = () => {
    toast.success('Funds withdrawn!', {
      description: `${formatUSDC(
        userParticipation?.finalShare || 0
      )} USDC sent to your wallet`,
    });
  };

  const handlePlayAgain = () => {
    toast.info('Joining next run...', {
      description: 'Your funds will be rolled into the next game',
    });
    navigate('/dashboard');
  };

  // Award badges based on performance
  const earnedBadges = [
    {
      id: 'perfect-attendance',
      name: 'Perfect Attendance',
      emoji: '🗳️',
      description: 'Voted in all rounds',
      earned: userParticipation && userParticipation.totalVotes === endedRun.totalRounds,
    },
    {
      id: 'most-correct',
      name: 'Oracle',
      emoji: '🎯',
      description: 'Most correct votes',
      earned: userParticipation && userParticipation.votesCorrect >= 8,
    },
  ].filter(b => b.earned);

  // Sort participants by final share for leaderboard
  const leaderboard = [...endedRun.participants].sort(
    (a, b) => (b.finalShare || 0) - (a.finalShare || 0)
  );

  const onExit = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col p-4 lg:p-6 max-w-[1800px] mx-auto animate-in fade-in duration-500 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800/50 pb-4 relative">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
        <div className="flex items-center gap-6">
          <button onClick={onExit} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <ChevronRight className="rotate-180" />
          </button>
          <div>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
              RUN #{endedRun.id} COMPLETE
            </h2>
            <div className="text-[10px] text-zinc-500 font-mono mt-1 flex gap-3">
              <span>{endedRun.tradingPair}</span>
              <span className="text-zinc-700">|</span>
              <span>DURATION: {endedRun.duration}m</span>
            </div>
          </div>
          <Badge label="ENDED" color="zinc" />
        </div>
      </div>

      {/* Result Hero Section */}
      <div className="mb-8">
        <Panel active className="p-8 relative overflow-hidden">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isProfit ? 'bg-emerald-600/10' : 'bg-red-600/10'} rounded-full blur-[120px] pointer-events-none`} />
          
          <div className="relative z-10 text-center space-y-6">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${isProfit ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'bg-red-500/10 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.3)]'} hexagon-clip`}>
              {isProfit ? <Trophy size={48} className="animate-pulse" /> : <TrendingDown size={48} />}
            </div>
            
            <div>
              <h3 className="text-2xl font-display text-zinc-400 mb-2">FINAL POOL VALUE</h3>
              <div className="text-6xl font-display font-bold text-white mb-4">
                {formatUSDC(endedRun.totalPool)} <span className="text-2xl text-zinc-500">USDC</span>
              </div>
              <div className={`text-3xl font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-500'}`}>
                {isProfit ? '+' : ''}{profitLossPercent}%
                <span className="text-lg ml-3 text-zinc-500">
                  ({isProfit ? '+' : ''}{formatUSDC(profitLoss)} USDC)
                </span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - User Stats & Badges */}
        <div className="lg:col-span-7 space-y-6">
          {/* Your Performance */}
          <Panel className="p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={14} className="text-indigo-500" /> Your Performance
            </h3>
            
            {userParticipation ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 p-4 border border-zinc-800/50">
                    <div className="text-[10px] uppercase text-zinc-500 mb-2">Initial Deposit</div>
                    <div className="text-2xl font-mono text-zinc-200">
                      {formatUSDC(userParticipation.depositAmount)} USDC
                    </div>
                  </div>
                  
                  <div className={`bg-zinc-900/50 p-4 border ${userProfit >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                    <div className="text-[10px] uppercase text-zinc-500 mb-2">Final Share</div>
                    <div className="text-2xl font-mono text-white">
                      {formatUSDC(userParticipation.finalShare || 0)} USDC
                    </div>
                  </div>
                </div>

                <div className={`p-6 border-2 ${userProfit >= 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'} relative overflow-hidden`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase text-zinc-400 mb-2">Your Result</div>
                      <div className={`text-4xl font-display font-bold ${userProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                        {userProfit >= 0 ? '+' : ''}{formatUSDC(userProfit)} USDC
                      </div>
                      <div className={`text-xl font-mono mt-1 ${userProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                        {userProfit >= 0 ? '+' : ''}{userProfitPercent}%
                      </div>
                    </div>
                    <div className={`text-6xl opacity-10 ${userProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {userProfit >= 0 ? <TrendingUp /> : <TrendingDown />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-900/30 p-4 border border-zinc-800/50 text-center">
                    <div className="text-2xl font-display font-bold text-indigo-400">
                      {userParticipation.totalVotes}
                    </div>
                    <div className="text-[10px] uppercase text-zinc-500 mt-1">Total Votes</div>
                  </div>
                  
                  <div className="bg-zinc-900/30 p-4 border border-zinc-800/50 text-center">
                    <div className="text-2xl font-display font-bold text-emerald-400">
                      {userParticipation.votesCorrect}
                    </div>
                    <div className="text-[10px] uppercase text-zinc-500 mt-1">Correct</div>
                  </div>
                  
                  <div className="bg-zinc-900/30 p-4 border border-zinc-800/50 text-center">
                    <div className="text-2xl font-display font-bold text-cyan-400">
                      {userParticipation.totalVotes > 0 ? Math.round((userParticipation.votesCorrect / userParticipation.totalVotes) * 100) : 0}%
                    </div>
                    <div className="text-[10px] uppercase text-zinc-500 mt-1">Accuracy</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                You did not participate in this run
              </div>
            )}
          </Panel>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <Panel className="p-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Award size={14} className="text-amber-500" /> Badges Earned
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-gradient-to-br from-amber-900/20 to-amber-900/5 border border-amber-500/30 rounded p-4 flex items-center gap-4 animate-in slide-in-from-left duration-500"
                  >
                    <div className="text-4xl">{badge.emoji}</div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-amber-200">{badge.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">{badge.description}</div>
                    </div>
                    <CheckCircle size={20} className="text-amber-500" />
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Action Buttons */}
          {userParticipation && !userParticipation.withdrawn && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="primary" className="w-full h-16 flex items-center justify-center gap-3" onClick={handleWithdraw}>
                <Download size={20} /> Withdraw Funds
              </Button>
              
              <Button variant="system" className="w-full h-16 flex items-center justify-center gap-3" onClick={handlePlayAgain}>
                <RotateCcw size={20} /> Play Again
              </Button>
            </div>
          )}
        </div>

        {/* Right Column - Leaderboard */}
        <div className="lg:col-span-5">
          <Panel className="p-6 h-full">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Users size={14} className="text-indigo-500" /> Final Leaderboard
            </h3>
            
            <div className="space-y-2">
              {leaderboard.map((participant, index) => {
                const profit = (participant.finalShare || 0) - participant.depositAmount;
                const isCurrentUser = participant.user.id === currentUser.id;
                
                return (
                  <div
                    key={participant.user.id}
                    className={`flex items-center justify-between p-3 border transition-all ${
                      isCurrentUser
                        ? 'bg-indigo-900/20 border-indigo-500/30'
                        : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center font-mono font-bold ${
                        index === 0 ? 'text-amber-400 text-xl' : 
                        index === 1 ? 'text-zinc-300' : 
                        index === 2 ? 'text-amber-600' : 
                        'text-zinc-500'
                      }`}>
                        {index === 0 ? '👑' : index + 1}
                      </div>
                      
                      <div>
                        <div className={`font-mono text-sm ${isCurrentUser ? 'text-indigo-300 font-bold' : 'text-zinc-300'}`}>
                          {participant.user.username}
                          {isCurrentUser && <span className="ml-2 text-[9px] bg-indigo-500 text-black px-1 rounded">YOU</span>}
                        </div>
                        <div className="text-[10px] text-zinc-600">
                          {participant.user.walletAddress}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-sm text-white">
                        {formatUSDC(participant.finalShare || 0)}
                      </div>
                      <div className={`text-[10px] font-mono ${profit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                        {profit >= 0 ? '+' : ''}{formatUSDC(profit)}
                      </div>
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
}
