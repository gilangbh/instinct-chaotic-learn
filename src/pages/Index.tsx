import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, CreditCard, Lock } from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';

const Index = () => {
  const navigate = useNavigate();

  const onConnect = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black relative overflow-hidden font-sans">
       {/* Animated Grid Background */}
       <div className="absolute inset-0 opacity-20" style={{ 
           backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', 
           backgroundSize: '40px 40px' 
       }} />
       
       <div className="relative z-10 text-center space-y-8 max-w-md w-full p-4">
          <div className="flex justify-center mb-6">
             <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30 animate-pulse">
                <Hexagon size={48} className="text-indigo-500" strokeWidth={1} />
             </div>
          </div>
          
          <div>
             <h1 className="text-5xl font-light text-white font-display tracking-tighter mb-2">
                INSTINCT
             </h1>
             <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                Collaborative Trading Protocol
             </p>
          </div>

          <Panel className="p-8 border-zinc-800/50">
             <div className="space-y-4">
                <Button variant="primary" className="w-full flex items-center justify-center gap-3 py-4" onClick={onConnect}>
                   <CreditCard size={16} /> Connect Wallet
                </Button>
                <div className="flex items-center gap-3 text-xs text-zinc-600 justify-center">
                   <Lock size={12} /> Encrypted Connection
                </div>
             </div>
          </Panel>
       </div>
    </div>
  );
};

export default Index;
