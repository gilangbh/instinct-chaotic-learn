import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Crosshair, 
  Activity, 
  User, 
  Power 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'dashboard', path: '/dashboard', icon: LayoutGrid, label: "Nexus" },
    { id: 'trade', path: '/game', icon: Crosshair, label: "Rift" },
    { id: 'activity', path: '/history', icon: Activity, label: "Logs" },
    { id: 'profile', path: '/profile', icon: User, label: "Codex" },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/game' && (currentPath === '/game' || currentPath.startsWith('/game/') || currentPath.startsWith('/lobby/'))) return true;
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <div className={`min-h-screen bg-[#030303] text-zinc-200 font-sans selection:bg-indigo-500/30 overflow-hidden flex relative`}>
      {/* Global CRT Effects */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none z-40 animate-scanline bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-[10vh]" />

      {/* Navigation Rail */}
      <div className="w-24 border-r border-zinc-800/50 bg-[#020202] flex flex-col items-center py-8 z-30 relative h-screen sticky top-0">
        <div className="mb-12 cursor-pointer hover:scale-110 transition-transform hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" onClick={() => navigate('/dashboard')}>
          <img src="/instinctfi spiky logo.png" alt="InstinctFi" className="w-9 h-9" />
        </div>
        <nav className="flex flex-col gap-8 w-full">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center justify-center gap-2 transition-all relative group w-full h-16
                ${isCurrentPath(item.path) ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'}
              `}
            >
              <div className={`absolute inset-0 bg-indigo-500/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${isCurrentPath(item.path) ? 'scale-x-100 opacity-100' : ''}`} />
              
              <item.icon size={24} strokeWidth={1.5} className={`transition-transform group-hover:scale-110 ${isCurrentPath(item.path) ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : ''}`} />
              
              <span className="text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono">{item.label}</span>
              
              {isCurrentPath(item.path) && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
           <button 
             onClick={() => {
               logout();
               navigate('/');
             }}
             className="text-zinc-700 hover:text-red-500 transition-colors p-3 hover:bg-red-900/10 rounded-full"
             title="Terminate Connection"
           >
              <Power size={20} />
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative bg-[#050505] h-screen overflow-hidden flex flex-col">
        {/* Animated Grid Floor */}
        <div className="absolute inset-0 pointer-events-none opacity-20 animate-grid origin-top" 
             style={{ 
               backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
               transformStyle: 'preserve-3d',
               transform: 'perspective(500px) rotateX(10deg)'
             }} 
        />
        
        <div className="relative z-10 flex-1 overflow-hidden">
           {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

