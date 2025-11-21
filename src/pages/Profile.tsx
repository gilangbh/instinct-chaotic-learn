import React from 'react';
import { User, Shield, Wifi, Database, Cpu, Hexagon, Lock } from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';
import { currentUser, formatUSDC } from '@/lib/mockData';

const Profile = () => {
  // Hardcoded Augments from sample.tsx
  const augments = [
     { name: "Neural Link I", type: "PASSIVE", desc: "View order book depth for 5s", active: true },
     { name: "Fee Override", type: "ECONOMY", desc: "-10% Protocol fees", active: true },
     { name: "Flash Loan", type: "ACTIVE", desc: "Access 10x leverage once per epoch", active: false },
  ];

  // Calculate total PnL mock
  const totalPnL = 450.20; // Mock value or derive from history if possible

  return (
    <div className="p-8 animate-in fade-in duration-500 h-full overflow-y-auto custom-scrollbar">
       {/* Profile Header */}
       <div className="relative h-48 mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-black border-b border-zinc-800" />
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
             <Panel className="w-32 h-32 flex items-center justify-center bg-black border-2 border-zinc-700 shadow-2xl">
                <User size={48} className="text-zinc-500" />
             </Panel>
             <div className="mb-4">
                <h1 className="text-4xl font-light text-white font-display mb-1">OPERATOR <span className="text-indigo-500 font-bold">#{currentUser.id.split('-')[1] || '842'}</span></h1>
                <div className="flex gap-4 text-xs font-mono text-zinc-400">
                   <span className="flex items-center gap-1"><Shield size={12} /> CLEARANCE: LEVEL 4</span>
                   <span className="flex items-center gap-1 text-emerald-500"><Wifi size={12} /> CONNECTED</span>
                </div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-12 gap-8">
          {/* Stats Matrix */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database size={14} /> Performance Matrix
             </h3>
             <div className="grid grid-cols-2 gap-4">
                {[
                   { label: "Total PnL", val: `+$${formatUSDC(totalPnL * 1000)}`, color: "text-emerald-400" },
                   { label: "Win Rate", val: `${currentUser.winRate}%`, color: "text-indigo-400" },
                   { label: "Total Epochs", val: currentUser.totalRuns.toString(), color: "text-white" },
                   { label: "Avg Leverage", val: "4.5x", color: "text-zinc-400" },
                ].map((stat, i) => (
                   <Panel key={i} className="p-4">
                      <div className="text-[10px] text-zinc-500 uppercase mb-1">{stat.label}</div>
                      <div className={`text-xl font-mono ${stat.color}`}>{stat.val}</div>
                   </Panel>
                ))}
             </div>
          </div>

          {/* Augments / Loadout */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <Cpu size={14} /> Installed Augments (3/5)
                </h3>
                <Button variant="neutral" className="py-1 px-3 text-[10px]">Manage Loadout</Button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {augments.map((aug, i) => (
                   <Panel key={i} className={`p-5 flex flex-col justify-between h-40 group ${aug.active ? 'border-indigo-500/30' : 'border-zinc-800 opacity-50'}`}>
                      <div className="flex justify-between items-start">
                         <Hexagon size={24} className={aug.active ? 'text-indigo-500' : 'text-zinc-600'} />
                         {aug.active ? <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /> : <Lock size={14} className="text-zinc-600" />}
                      </div>
                      <div>
                         <div className="text-[10px] text-zinc-500 mb-1">{aug.type}</div>
                         <h4 className={`text-lg font-display mb-2 ${aug.active ? 'text-white' : 'text-zinc-500'}`}>{aug.name}</h4>
                         <p className="text-xs text-zinc-400 leading-tight">{aug.desc}</p>
                      </div>
                   </Panel>
                ))}
                <Panel className="p-5 flex flex-col justify-center items-center h-40 border-dashed border-zinc-800 text-zinc-700">
                   <Lock size={24} className="mb-2" />
                   <span className="text-xs uppercase">Slot Locked</span>
                   <span className="text-[10px] mt-1">Req Lvl 5</span>
                </Panel>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Profile;
