import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Activity, Box, Cpu, Terminal, Shield, Layers, Target, ChevronRight 
} from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';
import { Badge } from '@/components/ui/instinct/Badge';
import { activeRun, runHistory, formatUSDC } from '@/lib/mockData';

const Dashboard = () => {
  const navigate = useNavigate();

  const onEnterRun = () => {
    navigate('/game');
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full p-8 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="col-span-12 flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-light tracking-tighter text-white mb-2 font-display">
            INSTINCT <span className="text-indigo-500 font-bold">PROTOCOL_</span>
          </h1>
          <div className="flex gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> SYSTEM ONLINE</span>
            <span>EPOCH: 42.0.1</span>
            <span>GAS: 14 GWEI</span>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Net Asset Value</div>
            <div className="text-2xl font-mono text-white">$2,450.00 <span className="text-emerald-500 text-sm">(+12%)</span></div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Global Rank</div>
            <div className="text-2xl font-mono text-indigo-400">#842</div>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Featured Run */}
        <Panel className="p-8 group hover:border-indigo-500/50 transition-colors cursor-pointer relative overflow-hidden" onClick={onEnterRun}>
          <div className="absolute top-0 right-0 p-4 text-xs font-mono text-indigo-400 border-b border-l border-zinc-800 bg-zinc-900/50">
            STATUS: {activeRun.status.toUpperCase()} [{activeRun.currentRound}/{activeRun.totalRounds}]
          </div>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Zap size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-3xl text-white font-light mb-1">{activeRun.coin}-PERP <span className="text-zinc-600">/</span> USDC</h2>
              <div className="flex gap-3 text-sm font-mono">
                <span className="text-[#00F0FF]">VOLATILITY: HIGH</span>
                <span className="text-zinc-500">|</span>
                <span className="text-emerald-400">YIELD: +24%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
             {[
               { label: "Pool Size", val: `$${formatUSDC(activeRun.totalPool)}`, icon: Box },
               { label: "Active Nodes", val: activeRun.participantCount.toString(), icon: Cpu },
               { label: "Consensus", val: "83%", icon: Activity }
             ].map((stat, i) => (
               <div key={i} className="bg-zinc-900/50 p-4 border border-zinc-800/50">
                 <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase mb-2">
                   <stat.icon size={12} /> {stat.label}
                 </div>
                 <div className="text-lg font-mono text-zinc-200">{stat.val}</div>
               </div>
             ))}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex -space-x-2">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
                    U{i}
                 </div>
               ))}
               <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">
                 +{activeRun.participantCount > 4 ? activeRun.participantCount - 4 : 0}
               </div>
            </div>
            <Button variant="primary" className="pl-8 pr-8">
               Initialize Link <ChevronRight size={14} className="ml-2" />
            </Button>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        </Panel>

        {/* Secondary Feeds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Panel className="p-6 min-h-[200px] flex flex-col justify-between hover:bg-zinc-900/30 transition-colors">
              <div className="flex justify-between items-start">
                 <div>
                    <Badge label="Queued" color="zinc" />
                    <h3 className="text-xl mt-3 text-zinc-300">BTC-PERP</h3>
                 </div>
                 <Terminal size={20} className="text-zinc-600" />
              </div>
              <div className="space-y-2">
                 <div className="w-full bg-zinc-900 h-1">
                    <div className="bg-zinc-700 h-full w-3/4" />
                 </div>
                 <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>FILLING...</span>
                    <span>75%</span>
                 </div>
              </div>
           </Panel>
           
           <Panel className="p-6 min-h-[200px] flex flex-col justify-between border-dashed border-zinc-800 opacity-60">
              <div className="flex justify-between items-start">
                 <div>
                    <Badge label="Locked" color="red" />
                    <h3 className="text-xl mt-3 text-zinc-500">ETH-CORE</h3>
                 </div>
                 <Shield size={20} className="text-zinc-700" />
              </div>
              <div className="text-xs text-zinc-600 font-mono">
                 REQUIRED CLEARANCE: LVL 15
              </div>
           </Panel>
        </div>
      </div>

      {/* Sidebar */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
         <Panel className="p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Layers size={14} /> Protocol History
            </h3>
            <div className="space-y-3">
               {runHistory.slice(0, 5).map((run, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2 last:border-0">
                     <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${run.totalPool >= run.startingPool ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="font-mono text-zinc-400">#{run.id} {run.tradingPair}</span>
                     </div>
                     <div className={`font-mono ${run.totalPool >= run.startingPool ? 'text-emerald-500' : 'text-red-500'}`}>
                        {run.totalPool >= run.startingPool ? '+' : ''}{((run.totalPool - run.startingPool) / run.startingPool * 100).toFixed(1)}%
                     </div>
                  </div>
               ))}
            </div>
         </Panel>
         
         <Panel className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-indigo-500/20">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Target size={14} /> Daily Quests
            </h3>
            <ul className="space-y-4">
               <li className="text-sm">
                  <div className="flex justify-between mb-1 text-zinc-300">
                     <span>Consensus Master</span>
                     <span className="text-indigo-400">3/5</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5">
                     <div className="bg-indigo-500 h-full w-3/5 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  </div>
               </li>
               <li className="text-sm">
                  <div className="flex justify-between mb-1 text-zinc-300">
                     <span>Diamond Hand</span>
                     <span className="text-indigo-400">Completed</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5">
                     <div className="bg-emerald-500 h-full w-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
               </li>
            </ul>
         </Panel>
      </div>
    </div>
  );
};

export default Dashboard;
