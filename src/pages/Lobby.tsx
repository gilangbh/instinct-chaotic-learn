import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/instinct/Button';
import { Panel } from '@/components/ui/instinct/Panel';
import { Badge } from '@/components/ui/instinct/Badge';
import { Input } from '@/components/ui/input'; // Keep shadcn input for now, or style it manually
import { waitingRun, currentUser, formatUSDC, formatTime } from '@/lib/mockData';
import { ChevronRight, Coins, Users, Clock, Dice5, Plus, ArrowLeft } from 'lucide-react';
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

  return (
    <div className="h-full flex flex-col p-4 lg:p-8 animate-in zoom-in-95 duration-300 overflow-y-auto custom-scrollbar">
      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
         <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="text-zinc-500 hover:text-white transition-colors">
               <ChevronRight className="rotate-180" />
            </button>
            <div>
               <h2 className="text-2xl font-mono text-white tracking-tight">Run #{waitingRun.id}</h2>
               <div className="text-[10px] text-zinc-500 font-mono mt-1">STATUS: WAITING_FOR_PLAYERS</div>
            </div>
            <Badge label="WAITING" color="zinc" />
         </div>
         
         <div className="flex items-center gap-8 font-mono">
            <div className="text-right">
               <div className="text-[10px] text-zinc-500">POOL SIZE</div>
               <div className="text-xl text-[#00F0FF]">${formatUSDC(waitingRun.totalPool)}</div>
            </div>
            <div className="h-8 w-[1px] bg-zinc-800" />
            <div className="text-right">
               <div className="text-[10px] text-zinc-500">STARTS IN</div>
               <div className="text-2xl text-white font-bold">{formatTime(waitingRun.countdown || 0)}</div>
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Countdown / Hero */}
        <Panel className="p-8 text-center bg-gradient-to-b from-zinc-900 to-black border-indigo-500/20">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-3xl font-light text-white mb-2">Game Starting Soon</h2>
            <div className="text-5xl font-mono font-bold text-indigo-500 my-6">
              {formatTime(waitingRun.countdown || 0)}
            </div>
            <p className="text-zinc-500 font-mono text-sm">
              // SYSTEM_STATUS: WAITING_FOR_QUORUM
            </p>
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
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xl font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
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

                  <div className="flex gap-2">
                    {['10', '25', '50', '100'].map(amt => (
                        <button
                            key={amt}
                            onClick={() => setDepositAmount(amt)}
                            className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs font-mono transition-colors"
                        >
                            {amt}
                        </button>
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full py-4 text-sm"
                    onClick={handleJoin}
                  >
                    <Coins className="mr-2 w-4 h-4 inline" />
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
              <Panel className="p-8 text-center border-emerald-500/30 bg-emerald-900/5">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-light text-emerald-500 mb-2">
                    Access Granted
                  </h3>
                  <p className="text-zinc-400 mb-6">
                    You have joined the run with{' '}
                    <span className="font-bold text-emerald-400">{depositAmount} USDC</span>
                  </p>
                  <div className="bg-zinc-950 border border-zinc-800 p-4 inline-block min-w-[200px]">
                    <div className="text-[10px] uppercase text-zinc-500 mb-1">Your Position</div>
                    <div className="text-xl font-mono font-bold text-white">
                      {(
                        (parseFloat(depositAmount) * 1000) /
                        (waitingRun.totalPool + parseFloat(depositAmount) * 1000)
                      ).toFixed(1)}
                      %
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
                    { label: "Total Pool", val: `${formatUSDC(waitingRun.totalPool)} USDC` },
                    { label: "Players", val: `${waitingRun.participantCount} / ${waitingRun.maxParticipants}` },
                    { label: "Duration", val: `${waitingRun.duration} Minutes` },
                    { label: "Interval", val: `${waitingRun.votingInterval} Minutes` },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-zinc-900/50 border border-zinc-800/50">
                        <span className="text-xs text-zinc-500 uppercase">{item.label}</span>
                        <span className="font-mono text-zinc-300">{item.val}</span>
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
                        h-20 flex flex-col items-center justify-center border transition-all
                        ${selectedCoin === coin.symbol 
                            ? 'bg-indigo-900/20 border-indigo-500 text-indigo-400' 
                            : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}
                      `}
                      onClick={() => handleCoinSelect(coin.symbol)}
                    >
                      <div className="text-2xl mb-1">{coin.emoji}</div>
                      <div className="font-bold font-mono text-sm">{coin.symbol}</div>
                      <div className="text-[10px] opacity-60">
                        {coinVotes[coin.symbol as keyof typeof coinVotes]} votes
                      </div>
                    </button>
                  ))}
              </div>

              {selectedCoin && (
                  <div className="bg-indigo-900/10 border border-indigo-500/30 p-3 text-center text-xs text-indigo-300 mb-3 font-mono">
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
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Connected Nodes</h3>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {waitingRun.participants.map((participant, index) => (
                    <div
                      key={participant.user.id}
                      className={`flex items-center justify-between p-3 border ${
                        participant.user.id === currentUser.id
                          ? 'bg-indigo-900/10 border-indigo-500/30'
                          : 'bg-zinc-900/30 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-400">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-zinc-300 flex items-center gap-2">
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
                        <div className="text-emerald-500 text-sm">
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
  );
}
