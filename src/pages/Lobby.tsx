import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/instinct/Button';
import { Panel } from '@/components/ui/instinct/Panel';
import { Badge } from '@/components/ui/instinct/Badge';
import { ProgressBar } from '@/components/ui/instinct/ProgressBar';
import { waitingRun, currentUser, formatUSDC, formatTime } from '@/lib/mockData';
import { ChevronRight, Coins, Users, Clock, Dice5, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Lobby() {
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState('50');
  const [selectedCoin, setSelectedCoin] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);

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

  const poolFillPercent = (waitingRun.totalPool / (waitingRun.maxParticipants * 50000)) * 100;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col p-4 lg:p-6 max-w-[1800px] mx-auto animate-in zoom-in-95 duration-300 min-h-full">
      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800/50 pb-4 relative">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
         <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
               <ChevronRight className="rotate-180" />
            </button>
            <div>
               <h2 className="text-3xl font-display font-bold text-white tracking-tight">Run #{waitingRun.id}</h2>
               <div className="text-[10px] text-zinc-500 font-mono mt-1">STATUS: WAITING_FOR_PLAYERS</div>
            </div>
            <Badge label="WAITING" color="cyan" pulse />
         </div>
         
         <div className="flex items-center gap-8 font-mono bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-right px-2 hidden md:block">
               <div className="text-[10px] text-zinc-500 uppercase">Pool Size</div>
               <div className="text-xl text-[#00F0FF] font-bold text-shadow-glow">${formatUSDC(waitingRun.totalPool)}</div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden md:block" />
            <div className="text-right px-2">
               <div className="text-[10px] text-zinc-500 uppercase">Starts In</div>
               <div className="text-2xl text-white font-bold animate-pulse">{formatTime(waitingRun.countdown || 0)}</div>
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Countdown / Hero */}
        <Panel active className="p-8 text-center bg-gradient-to-b from-zinc-900/80 to-black border-indigo-500/20 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30 hexagon-clip">
                <Clock size={40} className="text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-display font-light text-white mb-2">Initialization Sequence</h2>
              <div className="text-6xl font-mono font-bold text-indigo-400 my-6 animate-pulse">
                {formatTime(waitingRun.countdown || 0)}
              </div>
              <p className="text-zinc-500 font-mono text-sm mb-4">
                // SYSTEM_STATUS: WAITING_FOR_QUORUM
              </p>
              
              {/* Pool Fill Progress */}
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex justify-between text-xs text-zinc-500 mb-2 font-mono">
                  <span>Pool Filling</span>
                  <span>{waitingRun.participantCount} / {waitingRun.maxParticipants} Nodes</span>
                </div>
                <ProgressBar value={poolFillPercent} max={100} color="bg-cyan-500" />
              </div>
            </div>
        </Panel>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Join/Deposit Section */}
          <div className="space-y-4">
            {!hasJoined && !isParticipating ? (
              <Panel className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Plus className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold text-zinc-200 uppercase tracking-widest">Join Protocol</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 mb-2 block tracking-widest">
                      Deposit Amount (USDC)
                    </label>
                    <div className="relative group">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xl font-mono text-white focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
                        USDC
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-2">
                      <span>MIN: 10 USDC</span>
                      <span>MAX: 100 USDC</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {['10', '25', '50', '100'].map(amt => (
                        <button
                            key={amt}
                            onClick={() => setDepositAmount(amt)}
                            className={`py-2 border transition-all font-mono text-xs ${
                              depositAmount === amt 
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                                : 'border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400'
                            }`}
                        >
                            {amt}
                        </button>
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full py-4 text-sm shadow-lg"
                    onClick={handleJoin}
                  >
                    <Zap className="mr-2 w-4 h-4 inline" />
                    Deposit & Initialize
                  </Button>

                  <div className="bg-zinc-900/50 border border-zinc-800 p-4 text-xs text-zinc-500 font-mono">
                    <div className="font-bold text-zinc-400 mb-2">
                      // PROTOCOL_RULES:
                    </div>
                    <ul className="space-y-1 pl-2">
                      <li>• Funds pooled with other nodes</li>
                      <li>• Vote every 10m (Duration: 2h)</li>
                      <li>• PnL distributed proportionally</li>
                      <li>• XP rewards for consensus participation</li>
                    </ul>
                  </div>
                </div>
              </Panel>
            ) : (
              <Panel active className="p-8 text-center border-emerald-500/30 bg-emerald-900/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 hexagon-clip">
                      <Zap size={40} className="text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-display font-light text-emerald-400 mb-2">
                      Access Granted
                    </h3>
                    <p className="text-zinc-400 mb-6">
                      You have joined the run with{' '}
                      <span className="font-bold text-emerald-400">{depositAmount} USDC</span>
                    </p>
                    <div className="bg-zinc-950 border border-emerald-500/30 p-4 inline-block min-w-[200px]">
                      <div className="text-[10px] uppercase text-zinc-500 mb-1">Your Position</div>
                      <div className="text-xl font-mono font-bold text-emerald-400">
                        {(
                          (parseFloat(depositAmount) * 1000) /
                          (waitingRun.totalPool + parseFloat(depositAmount) * 1000)
                        ).toFixed(1)}
                        % of pool
                      </div>
                    </div>
                  </div>
              </Panel>
            )}

            {/* Pool Info */}
            <Panel className="p-6">
              <div className="flex items-center gap-2 mb-4">
                  <Coins className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pool Data</h3>
              </div>
              <div className="space-y-2">
                {[
                    { label: "Total Pool", val: `${formatUSDC(waitingRun.totalPool)} USDC`, highlight: true },
                    { label: "Players", val: `${waitingRun.participantCount} / ${waitingRun.maxParticipants}` },
                    { label: "Duration", val: `${waitingRun.duration} Minutes` },
                    { label: "Interval", val: `${waitingRun.votingInterval} Minutes` },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                        <span className="text-xs text-zinc-500 uppercase">{item.label}</span>
                        <span className={`font-mono ${item.highlight ? 'text-cyan-400' : 'text-zinc-300'}`}>{item.val}</span>
                    </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Coin Selection */}
            <Panel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Dice5 className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Vote Asset</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                  {coins.map((coin) => (
                    <button
                      key={coin.symbol}
                      className={`
                        h-20 flex flex-col items-center justify-center border transition-all relative overflow-hidden group
                        ${selectedCoin === coin.symbol 
                            ? 'bg-indigo-900/20 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                            : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 hover:border-zinc-700'}
                      `}
                      onClick={() => handleCoinSelect(coin.symbol)}
                    >
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{coin.emoji}</div>
                      <div className="font-bold font-mono text-sm">{coin.symbol}</div>
                      <div className="text-[10px] opacity-60">
                        {coinVotes[coin.symbol as keyof typeof coinVotes]} votes
                      </div>
                      {selectedCoin === coin.symbol && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                      )}
                    </button>
                  ))}
              </div>

              {selectedCoin && (
                  <div className="bg-indigo-900/10 border border-indigo-500/30 p-3 text-center text-xs text-indigo-300 mb-3 font-mono animate-in fade-in duration-300">
                    // VOTE_REGISTERED: {selectedCoin}
                  </div>
              )}
              
              <div className="bg-zinc-900 p-3 text-[10px] text-zinc-600 border-l-2 border-zinc-700">
                  NOTE: Selection is weighted random based on votes.
              </div>
            </Panel>

            {/* Current Players */}
            <Panel className="p-6">
              <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Connected Nodes ({waitingRun.participantCount})</h3>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {waitingRun.participants.map((participant, index) => (
                    <div
                      key={participant.user.id}
                      className={`flex items-center justify-between p-3 border transition-all group ${
                        participant.user.id === currentUser.id
                          ? 'bg-indigo-900/10 border-indigo-500/30'
                          : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-mono border ${
                          participant.user.id === currentUser.id 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-zinc-300 flex items-center gap-2 group-hover:text-white transition-colors">
                            {participant.user.username}
                            {participant.user.id === currentUser.id && (
                                <span className="text-[9px] bg-indigo-500 text-black px-1 rounded">YOU</span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-600">
                            {participant.user.walletAddress}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-emerald-500 text-sm font-bold">
                          {formatUSDC(participant.depositAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </Panel>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
