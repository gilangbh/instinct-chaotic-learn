import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Layers, Trophy, XCircle, Users, ChevronRight } from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Badge } from '@/components/ui/instinct/Badge';
import { Button } from '@/components/ui/instinct/Button';
import { runHistory, mockUsers, formatUSDC } from '@/lib/mockData';

const History = () => {
  const navigate = useNavigate();
  
  const historyLogs = runHistory.map(run => ({
    id: `RUN #${run.id}`,
    pair: run.tradingPair || 'Unknown',
    result: run.totalPool >= run.startingPool ? 'WIN' : 'LOSS',
    change: `${run.totalPool >= run.startingPool ? '+' : ''}${((run.totalPool - run.startingPool) / run.startingPool * 100).toFixed(1)}%`,
    amount: `${run.totalPool >= run.startingPool ? '+' : ''}${formatUSDC(run.totalPool - run.startingPool)} USDC`,
    start: formatUSDC(run.startingPool),
    end: formatUSDC(run.totalPool),
    players: run.participantCount,
    duration: `${run.duration}m`
  }));

  const stats = [
    { label: "Total Runs", val: runHistory.length.toString(), icon: Layers, color: "text-indigo-400" },
    { label: "Victories", val: runHistory.filter(r => r.totalPool >= r.startingPool).length.toString(), icon: Trophy, color: "text-emerald-400" },
    { label: "Defeats", val: runHistory.filter(r => r.totalPool < r.startingPool).length.toString(), icon: XCircle, color: "text-red-400" },
    { label: "Participants", val: runHistory.reduce((acc, r) => acc + r.participantCount, 0).toString(), icon: Users, color: "text-zinc-200" },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 lg:p-6 max-w-[1800px] mx-auto animate-in fade-in duration-500">
       {/* Header */}
       <div className="flex items-center gap-4 mb-8 border-b border-zinc-800/50 pb-6 relative">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
          <div className="w-16 h-16 bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 hexagon-clip animate-pulse">
             <Activity size={32} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-light text-white font-display">ARCHIVE <span className="text-zinc-600">//</span> LOGS</h1>
            <p className="text-zinc-500 font-mono text-xs tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
               PAST_CYCLE_DATA
            </p>
          </div>
       </div>

       {/* Summary Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         {stats.map((stat, i) => (
            <Panel key={i} className="p-4 flex flex-col items-center justify-center hover:border-indigo-500/30">
               <div className={`mb-2 opacity-80 ${stat.color}`}><stat.icon size={20} /></div>
               <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.val}</div>
               <div className="text-[10px] uppercase tracking-widest text-zinc-600">{stat.label}</div>
            </Panel>
         ))}
       </div>

       {/* History List */}
       <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-1">Operation Logs</h3>
          {historyLogs.map((log, i) => (
             <Panel key={i} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-indigo-500/30 transition-all hover:bg-indigo-500/5">
                
                {/* Left: Status */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <div className={`w-1 h-16 transition-all group-hover:h-20 group-hover:w-1.5 rounded-full ${log.result === 'WIN' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`} />
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <Badge label={log.id} color="zinc" />
                         <Badge label={log.result} color={log.result === 'WIN' ? 'emerald' : 'red'} pulse={log.result === 'WIN'} />
                      </div>
                      <div className="text-xl text-white font-display tracking-wide">{log.pair}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">timestamp: 11/21/2025</div>
                   </div>
                </div>

                {/* Middle: Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 w-full md:w-auto bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                   <div>
                      <div className="text-[9px] uppercase text-zinc-600 mb-0.5">Start Pool</div>
                      <div className="font-mono text-zinc-300 text-xs">{log.start}</div>
                   </div>
                   <div>
                      <div className="text-[9px] uppercase text-zinc-600 mb-0.5">Final Pool</div>
                      <div className="font-mono text-white text-xs">{log.end}</div>
                   </div>
                   <div>
                      <div className="text-[9px] uppercase text-zinc-600 mb-0.5">Players</div>
                      <div className="font-mono text-zinc-300 text-xs">{log.players}</div>
                   </div>
                   <div>
                      <div className="text-[9px] uppercase text-zinc-600 mb-0.5">Duration</div>
                      <div className="font-mono text-zinc-300 text-xs">{log.duration}</div>
                   </div>
                </div>

                {/* Right: Result */}
                <div className="text-right w-full md:w-auto">
                   <div className={`text-2xl font-display font-bold ${log.result === 'WIN' ? 'text-emerald-400' : 'text-red-500'}`}>
                      {log.change}
                   </div>
                   <div className="text-xs font-mono text-zinc-500">{log.amount}</div>
                   <button 
                      onClick={() => navigate('/results')}
                      className="mt-2 text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:underline flex items-center gap-1 hover:gap-2 transition-all"
                   >
                      VIEW_FULL_ANALYSIS <ChevronRight size={12} />
                   </button>
                </div>
             </Panel>
          ))}
       </div>
      </div>
    </div>
  );
};

export default History;
