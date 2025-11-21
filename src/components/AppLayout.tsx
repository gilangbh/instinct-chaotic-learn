import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Crosshair, 
  Activity, 
  User, 
  Hexagon, 
  Power 
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'dashboard', path: '/dashboard', icon: LayoutGrid, label: "Hub" },
    { id: 'trade', path: '/game', icon: Crosshair, label: "Run" }, // Maps to ActiveGame
    { id: 'activity', path: '/history', icon: Activity, label: "Net" }, // Maps to History/Activity
    { id: 'profile', path: '/profile', icon: User, label: "Bio" },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/game' && (currentPath === '/game' || currentPath === '/lobby')) return true;
    return currentPath === path;
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-indigo-500/30 overflow-hidden flex`}>
      {/* Navigation Rail */}
      <div className="w-20 border-r border-zinc-800 bg-black flex flex-col items-center py-8 z-50 h-screen sticky top-0">
        <div className="mb-12 text-indigo-500 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Hexagon size={32} strokeWidth={1.5} />
        </div>
        <nav className="flex flex-col gap-8 w-full">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center justify-center gap-1 transition-all relative group w-full
                ${isCurrentPath(item.path) ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'}
              `}
            >
              <item.icon size={24} strokeWidth={1.5} />
              <span className="text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 absolute -bottom-4 transition-opacity duration-200 bg-black px-1 z-10 pointer-events-none">{item.label}</span>
              {isCurrentPath(item.path) && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
           <button 
             onClick={() => navigate('/')}
             className="text-zinc-700 hover:text-red-500 transition-colors"
             title="Disconnect"
           >
              <Power size={20} />
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative bg-[#050505] h-screen overflow-hidden flex flex-col">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
               backgroundSize: '32px 32px' 
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

