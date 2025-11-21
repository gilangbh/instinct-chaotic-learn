import React from 'react';
import { User, Shield, Wifi, TrendingUp, Disc, Trophy, Award, Cpu, Hexagon, Lock, Clock, BarChart3, Scan } from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';
import { Badge } from '@/components/ui/instinct/Badge';
import { ProgressBar } from '@/components/ui/instinct/ProgressBar';
import { currentUser, formatUSDC, runHistory } from '@/lib/mockData';

const Profile = () => {
  const badges = [
    { name: "Oracle's Eye", desc: "Most Correct Votes", icon: Scan, rare: true },
    { name: "Iron Will", desc: "Perfect Attendance", icon: Shield, rare: false },
    { name: "Lucky Strike", desc: "Won 5 runs in a row", icon: Trophy, rare: true },
  ];

  const totalPnL = 450.20;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 lg:p-6 max-w-[1800px] mx-auto animate-in fade-in duration-500">
       {/* Profile Header */}
       <div className="relative h-56 mb-12 group">
          <div className="absolute inset-0 bg-zinc-900 overflow-hidden rounded-lg border border-zinc-800">
             <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_10s_linear_infinite]" />
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/50 to-transparent" />
          </div>

          <div className="absolute -bottom-6 left-8 flex items-end gap-6 z-20">
             <div className="relative group/avatar">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 group-hover/avatar:opacity-60 transition-opacity" />
                <div className="w-32 h-32 bg-[#030303] flex items-center justify-center border border-indigo-500/50 hexagon-clip relative z-10 shadow-2xl">
                   <User size={48} className="text-zinc-400 group-hover/avatar:text-indigo-400 transition-colors" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-black border border-indigo-500 text-indigo-400 text-[10px] px-2 py-0.5 font-mono z-20">
                   LVL 03
                </div>
             </div>
             
             <div className="mb-4 flex-1">
                <h1 className="text-4xl font-light text-white font-display mb-2 flex items-center gap-3">
                   {currentUser.username} <span className="text-indigo-500 text-lg border border-indigo-500/30 px-2 rounded bg-indigo-500/10">#842</span>
                </h1>
                
                {/* XP Bar */}
                <div className="max-w-md space-y-1">
                   <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>{currentUser.xp} XP</span>
                      <span>3000 XP</span>
                   </div>
                   <ProgressBar value={currentUser.xp} max={3000} color="bg-amber-500" />
                   <div className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">{3000 - currentUser.xp} XP UNTIL LEVEL 4</div>
                </div>
             </div>

             <div className="mb-6 hidden md:block text-right">
                <div className="text-xs text-zinc-500 uppercase tracking-widest">Total Profit</div>
                <div className="text-3xl font-display text-emerald-400">+{formatUSDC(totalPnL * 1000)} USDC</div>
             </div>
          </div>
       </div>

       {/* Stats Matrix */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 mt-8">
          {[
             { label: "Total Runs", val: currentUser.totalRuns.toString(), icon: Trophy, color: "text-amber-400" },
             { label: "Win Rate", val: `${currentUser.winRate}%`, icon: TrendingUp, color: "text-emerald-400" },
             { label: "Total XP", val: currentUser.xp.toString(), icon: Disc, color: "text-indigo-400" },
             { label: "Badges", val: currentUser.badges.length.toString(), icon: Award, color: "text-purple-400" },
          ].map((stat, i) => (
             <Panel key={i} className="p-4 hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <div className="text-[10px] text-zinc-500 uppercase font-mono">{stat.label}</div>
                   <stat.icon size={14} className={stat.color} />
                </div>
                <div className={`text-2xl font-display ${stat.color}`}>{stat.val}</div>
             </Panel>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Col: Badges & Achievements */}
          <div className="lg:col-span-8 space-y-8">
             
             {/* Badge Collection */}
             <section>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Award size={14} /> Service Medals (Badges)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {badges.map((badge, i) => (
                      <Panel key={i} className={`p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform ${badge.rare ? 'border-amber-500/20 bg-amber-900/5' : ''}`}>
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badge.rare ? 'bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-800 text-zinc-400'}`}>
                            <badge.icon size={24} />
                         </div>
                         <div>
                            <div className={`font-display font-bold ${badge.rare ? 'text-amber-200' : 'text-zinc-200'}`}>{badge.name}</div>
                            <div className="text-[10px] text-zinc-500 mt-1">{badge.desc}</div>
                         </div>
                         {badge.rare && <div className="text-[9px] text-amber-500 border border-amber-500/30 px-1.5 rounded uppercase mt-1">Rare</div>}
                      </Panel>
                   ))}
                </div>
             </section>

             {/* Achievement Progress */}
             <section>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <BarChart3 size={14} /> Achievement Progress
                </h3>
                <div className="space-y-4 bg-zinc-900/30 p-6 rounded border border-zinc-800/50">
                   {[
                      { label: "Win 10 Runs", current: 7, max: 10, color: "bg-indigo-500" },
                      { label: "Earn 5,000 XP", current: currentUser.xp, max: 5000, color: "bg-purple-500" },
                      { label: "Collect 10 Badges", current: currentUser.badges.length, max: 10, color: "bg-emerald-500" },
                      { label: "100% Vote Accuracy", current: 83, max: 100, color: "bg-cyan-500", suffix: "%" }
                   ].map((ach, i) => (
                      <div key={i} className="group">
                         <div className="flex justify-between text-xs mb-2 font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            <span>{ach.label}</span>
                            <span>{ach.current} / {ach.max}{ach.suffix || ''}</span>
                         </div>
                         <ProgressBar value={ach.current} max={ach.max} color={ach.color} />
                      </div>
                   ))}
                </div>
             </section>

          </div>

          {/* Right Col: Loadout & Recent */}
          <div className="lg:col-span-4 space-y-8">
             {/* Loadout */}
             <section>
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Cpu size={14} /> Active Loadout
                   </h3>
                   <Button variant="neutral" className="py-1 px-3 text-[10px]">Edit</Button>
                </div>
                <div className="space-y-3">
                   {[
                      { name: "Neural Link I", type: "PASSIVE", active: true },
                      { name: "Fee Override", type: "ECONOMY", active: true },
                      { name: "Flash Loan", type: "ACTIVE", active: false },
                   ].map((aug, i) => (
                      <Panel key={i} active={aug.active} className={`p-3 flex items-center justify-between group ${!aug.active && 'opacity-50'}`}>
                         <div className="flex items-center gap-3">
                            <Hexagon size={16} className={aug.active ? 'text-indigo-400' : 'text-zinc-600'} />
                            <span className="text-xs font-bold text-zinc-300">{aug.name}</span>
                         </div>
                         {aug.active ? <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> : <Lock size={12} />}
                      </Panel>
                   ))}
                </div>
             </section>
             
             {/* Recent Runs */}
             <section>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Clock size={14} /> Recent Logs
                </h3>
                <div className="space-y-2">
                   {runHistory.slice(0, 3).map((run, i) => (
                      <Panel key={i} className="p-3 flex justify-between items-center hover:bg-white/5">
                         <div className="flex items-center gap-3">
                            <Badge label={`#${run.id}`} color="zinc" />
                            <span className="text-xs text-zinc-300 font-mono">{run.tradingPair}</span>
                         </div>
                         <div className={`text-xs font-bold ${run.totalPool >= run.startingPool ? 'text-emerald-400' : 'text-red-500'}`}>
                            {run.totalPool >= run.startingPool ? '+' : ''}{((run.totalPool - run.startingPool) / run.startingPool * 100).toFixed(1)}%
                         </div>
                      </Panel>
                   ))}
                </div>
             </section>
          </div>
       </div>
      </div>
    </div>
  );
};

export default Profile;
