import React from 'react';
import { Activity } from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Badge } from '@/components/ui/instinct/Badge';
import { runHistory, mockUsers, formatUSDC } from '@/lib/mockData';

const History = () => {
  // Map runHistory to recentEpochs format
  const recentEpochs = runHistory.map(run => {
     const isWin = run.totalPool >= run.startingPool;
     const profit = ((run.totalPool - run.startingPool) / run.startingPool) * 100;
     
     return {
        id: run.id,
        pair: run.tradingPair || 'Unknown',
        result: isWin ? 'WIN' : 'LOSS',
        profit: `${isWin ? '+' : ''}${profit.toFixed(1)}%`,
        consensus: run.participants.length > 0 ? 'LONG (Majority)' : 'Mixed', // Mock consensus logic
        rawProfit: profit
     };
  });

  // Map mockUsers to topNodes format
  const topNodes = [...mockUsers]
     .sort((a, b) => b.xp - a.xp)
     .map((user, i) => ({
        rank: i + 1,
        name: user.username,
        score: user.xp.toLocaleString(),
        winRate: `${user.winRate.toFixed(0)}%`,
        me: user.id === 'user-1' // currentUser id
     }));

  return (
    <div className="p-8 animate-in fade-in duration-500 h-full overflow-y-auto custom-scrollbar">
       <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <Activity size={32} className="text-indigo-500" />
          <div>
            <h1 className="text-3xl font-light text-white font-display">NETWORK <span className="text-zinc-600">ACTIVITY</span></h1>
            <p className="text-zinc-500 font-mono text-xs">GLOBAL_CONSENSUS_TRACKING</p>
          </div>
       </div>

       <div className="grid grid-cols-12 gap-8">
          {/* Recent Epochs */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Recent Consensus Epochs</h3>
             {recentEpochs.map((epoch, i) => (
                <Panel key={i} className="p-4 flex items-center justify-between group hover:border-zinc-700">
                   <div className="flex items-center gap-4">
                      <div className={`w-1 h-12 ${epoch.result === 'WIN' ? 'bg-emerald-500' : 'bg-[#FF2A6D]'}`} />
                      <div>
                         <div className="text-lg text-white font-light">{epoch.pair}</div>
                         <div className="text-xs text-zinc-500 font-mono">#{epoch.id} • {epoch.consensus}</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <Badge 
                        label={epoch.result} 
                        color={epoch.result === 'WIN' ? 'emerald' : 'red'} 
                      />
                      <div className={`text-sm font-mono mt-1 ${epoch.result === 'WIN' ? 'text-emerald-400' : 'text-[#FF2A6D]'}`}>
                         {epoch.profit}
                      </div>
                   </div>
                </Panel>
             ))}
          </div>

          {/* Leaderboard */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Top Active Nodes</h3>
             <Panel className="p-0 overflow-hidden">
                {topNodes.map((node, i) => (
                   <div 
                     key={i} 
                     className={`
                       p-4 flex items-center justify-between border-b border-zinc-800 last:border-0
                       ${node.me ? 'bg-indigo-900/10 border-l-2 border-l-indigo-500' : ''}
                     `}
                   >
                      <div className="flex items-center gap-4">
                         <div className="font-mono text-zinc-500 w-6">#{node.rank}</div>
                         <div className={node.me ? 'text-indigo-400 font-bold' : 'text-zinc-300'}>
                            {node.name} {node.me && <span className="text-[10px] ml-2 bg-indigo-500 text-black px-1 rounded">YOU</span>}
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-zinc-200 font-mono">{node.score} XP</div>
                         <div className="text-[10px] text-zinc-500">{node.winRate} ACC</div>
                      </div>
                   </div>
                ))}
             </Panel>
          </div>
       </div>
    </div>
  );
};

export default History;
