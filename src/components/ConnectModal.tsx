import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Wallet, ExternalLink } from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';
import { Badge } from '@/components/ui/instinct/Badge';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal = ({ isOpen, onClose }: ConnectModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDemoLogin = () => {
    // In a real app, this would set authentication state
    navigate('/dashboard');
    onClose();
  };

  const handleWalletConnect = (walletName: string) => {
    // In a real app, this would connect to the wallet
    console.log(`Connecting to ${walletName}...`);
    // For demo purposes, just navigate to dashboard
    navigate('/dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      {/* CRT Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-50" />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md mx-4 animate-in slide-in-from-bottom-8 duration-500">
        <Panel className="p-8 border-indigo-500/30 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-zinc-950 border border-indigo-500/30 rounded-full flex items-center justify-center">
                <Wallet size={32} className="text-indigo-500" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              Connect to <span className="text-indigo-500">instinctfi.xyz</span>
            </h2>
            <p className="text-sm text-zinc-500 font-mono">
              Connect your Solana wallet or use mock login for demo
            </p>
          </div>

          {/* Connection Options */}
          <div className="space-y-4 mb-6">
            {/* Wallet Options Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <span className="text-xs uppercase tracking-widest text-zinc-600 font-mono font-bold">
                1. Choose Your Wallet
              </span>
            </div>

            {/* Wallet Detection Notice */}
            <div className="bg-amber-900/10 border border-amber-500/20 rounded px-4 py-3">
              <p className="text-xs text-amber-400/90 font-mono mb-2 font-bold">
                ⚠ No wallets detected
              </p>
              <p className="text-xs text-zinc-500 font-mono">
                Install a Solana wallet to continue:
              </p>
            </div>

            {/* Install Phantom */}
            <button
              onClick={() => window.open('https://phantom.app/', '_blank')}
              className="w-full bg-zinc-950 border border-zinc-800 hover:border-purple-500/30 rounded p-4 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white">
                  P
                </div>
                <span className="text-white font-display">Install Phantom</span>
              </div>
              <ExternalLink size={16} className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
            </button>

            {/* Install Solflare */}
            <button
              onClick={() => window.open('https://solflare.com/', '_blank')}
              className="w-full bg-zinc-950 border border-zinc-800 hover:border-amber-500/30 rounded p-4 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center font-bold text-white">
                  S
                </div>
                <span className="text-white font-display">Install Solflare</span>
              </div>
              <ExternalLink size={16} className="text-zinc-600 group-hover:text-amber-400 transition-colors" />
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0a] px-4 text-zinc-600 font-mono tracking-widest">or</span>
              </div>
            </div>

            {/* Demo Login Button */}
            <Button
              variant="primary"
              className="w-full py-4 text-base"
              onClick={handleDemoLogin}
            >
              <span className="font-display font-bold">Demo Login</span>
            </Button>
          </div>

          {/* Devnet Notice */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded p-4">
            <div className="flex items-start gap-2">
              <Badge color="indigo" className="mt-0.5 shrink-0">DEVNET</Badge>
              <p className="text-xs text-zinc-500 font-mono leading-relaxed">
                This app uses Solana Devnet for testing. You'll need devnet SOL in your wallet for transactions.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

