import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, Zap, Users, Target, TrendingUp, Brain, Rocket, Heart, ArrowRight } from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';
import { Badge } from '@/components/ui/instinct/Badge';
import { Typewriter } from '@/components/ui/instinct/Typewriter';
import { ConnectModal } from '@/components/ConnectModal';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Successfully joined the waitlist!', {
      description: 'We\'ll notify you when we launch.',
    });
    setEmail('');
  };

  const coreFeatures = [
    {
      icon: Users,
      title: 'Community Trading Cycles',
      description: 'Users collaborate through votes. Every week feels like a new "run"',
      color: 'text-indigo-400',
    },
    {
      icon: Target,
      title: 'Gamified Progression',
      description: 'XP, streaks, and levels for active participants. Keeps people engaged and learning.',
      color: 'text-cyan-400',
    },
    {
      icon: Zap,
      title: 'Chaos-as-a-Feature',
      description: 'Randomized strategies and unpredictable outcomes. Embraces volatility as part of the experience.',
      color: 'text-amber-400',
    },
    {
      icon: Brain,
      title: 'Collective Learning',
      description: 'Transparent results, leaderboards, and shared insights. Turns market chaos into group education.',
      color: 'text-emerald-400',
    },
    {
      icon: TrendingUp,
      title: 'Behavioral Insights',
      description: 'Observe crowd psychology in action. Generates data on decision-making under uncertainty.',
      color: 'text-purple-400',
    },
    {
      icon: Rocket,
      title: 'Beyond Trading',
      description: 'A social for neurodiverse, governance, and vibes. Experiment with captain-trading at scale.',
      color: 'text-red-400',
    },
  ];

  return (
    <>
      <ConnectModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
      
      <div className="min-h-screen bg-[#030303] text-zinc-200 relative overflow-hidden">
        {/* Animated Grid Background */}
        <div className="fixed inset-0 opacity-10 pointer-events-none animate-grid" style={{ 
            backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }} />
        
        {/* Floating Orbs */}
        <div className="fixed top-20 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="fixed top-1/2 left-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        
        {/* Vignette */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
        
        {/* Scanline Effect */}
        <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30" />

      {/* Header */}
      <header className="relative z-20 border-b border-zinc-800/50 backdrop-blur-md bg-[#030303]/80 sticky top-0 shadow-lg shadow-indigo-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/instinctfi spiky logo.png" alt="InstinctFi" className="w-8 h-8 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <span className="text-xl font-display font-light text-white group-hover:text-indigo-400 transition-colors">instinctfi<span className="text-indigo-500 font-bold">.xyz</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsConnectModalOpen(true)}
              className="text-zinc-400 hover:text-white transition-all font-mono text-sm flex items-center gap-2 hover:gap-3 group"
            >
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /> Login
            </button>
            <Button variant="primary" className="px-6 py-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow" onClick={() => setIsConnectModalOpen(true)}>
              Join the Waitlist
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center relative">
          <div className="flex justify-center mb-8 animate-in zoom-in duration-700">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 animate-pulse group-hover:opacity-50 transition-opacity" />
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="w-32 h-32 bg-[#030303] flex items-center justify-center border border-indigo-500/50 hexagon-clip relative z-10 shadow-2xl p-4 group-hover:border-indigo-500/80 transition-all group-hover:scale-110 group-hover:rotate-180 duration-500">
                <img src="/instinctfi spiky logo.png" alt="InstinctFi Logo" className="w-full h-full object-contain group-hover:rotate-180 transition-transform duration-500" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl lg:text-8xl font-display font-light tracking-tighter text-white mb-6 animate-in slide-in-from-bottom duration-1000 bg-gradient-to-b from-white to-zinc-400 bg-clip-text">
            instinctfi<span className="text-indigo-500 font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text">.xyz</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-zinc-400 mb-4 font-display animate-in slide-in-from-bottom duration-1000 delay-100">
            An intentionally chaotic social trading experiment
          </p>
          
          <p className="text-sm text-indigo-400/80 font-mono uppercase tracking-widest mb-12 animate-in slide-in-from-bottom duration-1000 delay-200">
            <Typewriter text="// Collaborative Trading Protocol v2.0" speed={50} delay={1000} />
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom duration-1000 delay-300">
            <Button variant="primary" className="px-10 py-4 text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all group" onClick={() => setIsConnectModalOpen(true)}>
              <Zap size={20} className="mr-2 group-hover:animate-pulse" /> Try Demo
            </Button>
            <Button variant="neutral" className="px-10 py-4 text-lg hover:scale-105 transition-all" onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}>
              Join the Waitlist
            </Button>
          </div>
          
          {/* Stats Row */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-in fade-in duration-1000 delay-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400 font-mono mb-1">24/7</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest">Active Trading</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 font-mono mb-1">100+</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 font-mono mb-1">$50K+</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest">Volume Traded</div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute left-0 top-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-8 animate-in slide-in-from-left duration-700">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-red-500/30" />
              <h2 className="text-4xl font-display font-bold text-red-400 uppercase tracking-wide whitespace-nowrap">Problem</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-red-500/30" />
            </div>
            
            <Panel className="p-8 lg:p-10 bg-gradient-to-br from-red-900/10 to-transparent border-red-500/20 hover:border-red-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all duration-500" />
              <p className="text-lg text-zinc-300 leading-relaxed relative z-10">
                Crypto trading is <span className="text-red-400 font-bold relative inline-block hover:scale-110 transition-transform">overwhelming</span> for newcomers and <span className="text-red-400 font-bold relative inline-block hover:scale-110 transition-transform">frustrating</span> for casual users. People trade in isolation, follow hype, and rarely learn. Platforms focus on profit, not education or collective learning.
              </p>
            </Panel>
          </div>
        </section>

        {/* Market Opportunity Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute right-0 top-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-8 animate-in slide-in-from-right duration-700">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-indigo-500/30" />
              <h2 className="text-4xl font-display font-bold text-indigo-400 uppercase tracking-wide whitespace-nowrap">Market Opportunity</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-indigo-500/50 to-indigo-500/30" />
            </div>
            
            <Panel className="p-8 lg:p-10 bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />
              <p className="text-lg text-zinc-300 leading-relaxed relative z-10">
                instinctfi.xyz creates a <span className="text-indigo-400 font-bold relative inline-block hover:scale-110 transition-transform">new category</span> of social-finance experimentation where communities explore markets together, coordinate decisions, and learn from transparent outcomes.
              </p>
            </Panel>
          </div>
        </section>

        {/* Solution Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-8 animate-in zoom-in duration-700">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500/30" />
              <h2 className="text-4xl font-display font-bold text-emerald-400 uppercase tracking-wide whitespace-nowrap">Solution</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500/30" />
            </div>
            
            <Panel className="p-8 lg:p-10 bg-gradient-to-br from-emerald-900/10 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 group relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
              <p className="text-lg text-zinc-300 leading-relaxed relative z-10">
                instinctfi.xyz reframes trading as a <span className="text-emerald-400 font-bold relative inline-block hover:scale-110 transition-transform">social roguelike</span>. Users vote on trades, spin randomized strategies, and face unpredictable outcomes in weekly "runs," making each cycle chaotic yet educational.
              </p>
            </Panel>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-32 bg-gradient-to-r from-transparent to-indigo-500/50" />
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white uppercase tracking-wide">Core Features</h2>
              <div className="h-px w-32 bg-gradient-to-l from-transparent to-indigo-500/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <Panel 
                key={index} 
                className="p-6 hover:border-indigo-500/30 transition-all duration-500 group cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-transparent transition-all duration-500" />
                <div className={`w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-indigo-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ${feature.color} relative z-10`}>
                  <feature.icon size={28} strokeWidth={1.5} className="group-hover:drop-shadow-[0_0_8px_currentColor]" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors relative z-10">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors relative z-10">{feature.description}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Panel>
            ))}
          </div>
        </section>

        {/* Waitlist Section */}
        <section id="waitlist" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />
          
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-30 animate-pulse" />
                <Heart size={48} className="text-indigo-500 animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text">
              Join the Waitlist
            </h2>
            <p className="text-zinc-400 mb-8 font-mono text-sm">
              Be among the first to experience the chaos. <span className="text-indigo-400">Limited spots available.</span>
            </p>

            <Panel className="p-8 border-indigo-500/30 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
              <form onSubmit={handleWaitlistSubmit} className="space-y-4 relative z-10">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all font-mono hover:border-zinc-700"
                  />
                  <Button variant="primary" className="px-8 py-3 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all group" type="submit">
                    Join <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
                <Users size={14} /> <span>Join <span className="text-indigo-400 font-bold">500+</span> traders already on the waitlist</span>
              </div>
            </Panel>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="flex items-center gap-3 group cursor-pointer">
                <img src="/instinctfi spiky logo.png" alt="InstinctFi" className="w-8 h-8 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-xl font-display font-light text-white group-hover:text-indigo-400 transition-colors">instinctfi<span className="text-indigo-500 font-bold">.xyz</span></span>
              </div>
              <div className="flex items-center gap-6 text-sm text-zinc-500">
                <button className="hover:text-indigo-400 transition-colors font-mono">Twitter</button>
                <button className="hover:text-indigo-400 transition-colors font-mono">Discord</button>
                <button className="hover:text-indigo-400 transition-colors font-mono">Docs</button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-zinc-800/50">
              <div className="text-sm text-zinc-600 font-mono">
                © 2025 instinctfi.xyz • All rights reserved
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 font-mono group">
                <span>Built in collaboration with</span>
                <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">Superteam Indonesia</span>
                <Rocket size={16} className="text-indigo-500 group-hover:translate-y-[-2px] transition-transform" />
              </div>
            </div>
          </div>
        </footer>
      </div>
      </div>
    </>
  );
};

export default Index;
