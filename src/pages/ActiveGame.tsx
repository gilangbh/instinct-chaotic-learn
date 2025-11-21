import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Activity, Shield, TrendingUp, TrendingDown, 
  Terminal, Users, Box, Clock
} from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';
import { Badge } from '@/components/ui/instinct/Badge';
import { activeRun, formatUSDC, formatTime } from '@/lib/mockData';

const ActiveGame = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<number[]>([]);
  const [vote, setVote] = useState<'long' | 'short' | 'skip' | null>(null);

  // Fake chart data generator
  useEffect(() => {
    const points = Array.from({ length: 40 }, (_, i) => 50 + Math.sin(i * 0.2) * 20 + Math.random() * 10);
    setChartData(points);
  }, []);

  const onExit = () => {
    navigate('/dashboard');
  };

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
                 <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.2" />
                 <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
              </linearGradient>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                 <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
              </pattern>
           </defs>
           <rect width="100" height="100" fill="url(#grid)" />
           
           {/* The Line */}
           <polyline 
              points={path} 
              fill="none" 
              stroke="#00F0FF" 
              strokeWidth="0.5" 
              vectorEffect="non-scaling-stroke"
              className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
           />
           <polygon points={`0,100 ${path} 100,100`} fill="url(#glow)" />
           
           {/* Current Price Indicator */}
           <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeDasharray="2" strokeWidth="0.2" />
        </svg>
     );
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-8 animate-in zoom-in-95 duration-300 overflow-y-auto custom-scrollbar">
      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
         <div className="flex items-center gap-6">
            <button onClick={onExit} className="text-zinc-500 hover:text-white transition-colors">
               <ChevronRight className="rotate-180" />
            </button>
            <div>
               <h2 className="text-2xl font-mono text-white tracking-tight">{activeRun.coin} / USDC</h2>
               <div className="text-[10px] text-zinc-500 font-mono mt-1">ID: 0x84...29A • PERPETUAL</div>
            </div>
            <Badge label={`Round ${activeRun.currentRound}/${activeRun.totalRounds}`} color="purple" />
         </div>
         
         <div className="flex items-center gap-8 font-mono">
            <div className="text-right hidden md:block">
               <div className="text-[10px] text-zinc-500">POOL VALUE</div>
               <div className="text-xl text-[#00F0FF]">${formatUSDC(activeRun.totalPool)}</div>
            </div>
            <div className="text-right hidden md:block">
               <div className="text-[10px] text-zinc-500">YOUR STAKE</div>
               <div className="text-xl text-zinc-200">$50.00</div>
            </div>
            <div className="h-8 w-[1px] bg-zinc-800 hidden md:block" />
            <div className="text-right">
               <div className="text-[10px] text-zinc-500">TIMER</div>
               <div className="text-2xl text-white font-bold">{formatTime(activeRun.countdown || 0)}</div>
            </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
         {/* CHART SECTION */}
         <div className="col-span-12 lg:col-span-8 flex flex-col min-h-[400px]">
            <Panel className="flex-1 relative bg-zinc-900/20 overflow-hidden min-h-[300px]">
               {renderChart()}
               
               {/* Overlay UI on Chart */}
               <div className="absolute top-4 left-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-1 border border-[#00F0FF]/30">
                     <Activity size={12} /> LEVERAGE: 5x
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 border border-emerald-500/30">
                     <Shield size={12} /> STOP-LOSS: -2%
                  </div>
               </div>
            </Panel>

            {/* Event Log / "Terminal" */}
            <Panel className="mt-4 h-48 p-4 font-mono text-xs overflow-y-auto custom-scrollbar bg-black border-t-0">
               <div className="text-zinc-600 mb-2 border-b border-zinc-900 pb-1 flex justify-between">
                  <span>// SYSTEM_LOGS</span>
                  <span>AUTO_SCROLL: ON</span>
               </div>
               <div className="space-y-1.5">
                  <div className="flex gap-2 text-zinc-500">
                     <span>[12:04:42]</span>
                     <span className="text-emerald-500">consensus_reached</span>
                     <span>:: Round 6 Result: WIN (+4.20 USDC)</span>
                  </div>
                  <div className="flex gap-2 text-zinc-500">
                     <span>[12:05:01]</span>
                     <span className="text-blue-400">user_join</span>
                     <span>:: 0x77...3a joined the pool</span>
                  </div>
                  <div className="flex gap-2 text-zinc-500">
                     <span>[12:05:15]</span>
                     <span className="text-purple-400">signal_detected</span>
                     <span>:: RSI Divergence on 5m chart</span>
                  </div>
                  <div className="flex gap-2 text-zinc-400 opacity-50">
                     <span>[12:05:20]</span>
                     <span>waiting for input...</span>
                  </div>
               </div>
            </Panel>
         </div>

         {/* CONTROL DECK */}
         <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            
            {/* Vote Controls */}
            <Panel className="p-6 flex-1 flex flex-col gap-4 justify-center relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20" />
               
               <div className="text-center mb-4">
                  <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Input Command</h3>
                  <p className="text-xs text-zinc-600 mt-1">Predict the next price action</p>
               </div>

               <Button 
                  variant="long" 
                  className="h-20 text-lg flex items-center justify-between group"
                  onClick={() => setVote('long')}
                  active={vote === 'long'}
               >
                  <span className="flex flex-col items-start">
                     <span>Long</span>
                     <span className="text-[10px] opacity-60 font-normal">Expect Upside</span>
                  </span>
                  <TrendingUp size={24} className="group-hover:scale-110 transition-transform" />
               </Button>

               <Button 
                  variant="short" 
                  className="h-20 text-lg flex items-center justify-between group"
                  onClick={() => setVote('short')}
                  active={vote === 'short'}
               >
                  <span className="flex flex-col items-start">
                     <span>Short</span>
                     <span className="text-[10px] opacity-60 font-normal">Expect Downside</span>
                  </span>
                  <TrendingDown size={24} className="group-hover:scale-110 transition-transform" />
               </Button>

               <Button variant="neutral" onClick={() => setVote('skip')} active={vote === 'skip'}>
                  Skip Round (Conserve Capital)
               </Button>
            </Panel>

            {/* Squad / Network Status */}
            <Panel className="p-4 max-h-64 overflow-hidden flex flex-col">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Node Network ({activeRun.participantCount})</span>
                  <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-1 rounded">ACCURACY: 83%</span>
               </div>
               <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                  {activeRun.participants.map((p, i) => (
                     <div key={i} className="flex justify-between items-center p-2 bg-zinc-900/50 border border-zinc-800/50 rounded-sm">
                        <div className="flex items-center gap-3">
                           <div className={`w-1 h-8 ${p.user.id === 'user-1' ? 'bg-zinc-700' : 'bg-zinc-700'}`} />
                           <div>
                              <div className="text-xs text-zinc-300 font-mono">{p.user.username}</div>
                              <div className="text-[10px] text-zinc-600 uppercase">{p.user.id === 'user-1' ? 'Operator' : 'Node'}</div>
                           </div>
                        </div>
                        <div className="text-xs font-mono text-zinc-500">${formatUSDC(p.depositAmount)}</div>
                     </div>
                  ))}
               </div>
            </Panel>
         </div>
      </div>
    </div>
  );
};

export default ActiveGame;
