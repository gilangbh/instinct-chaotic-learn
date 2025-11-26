import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Hexagon, AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/instinct/Button";
import { Panel } from "@/components/ui/instinct/Panel";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030303] relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
      }} />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      <div className="relative z-10 text-center max-w-2xl px-4">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-30 animate-pulse" />
            <div className="w-32 h-32 bg-[#030303] flex items-center justify-center border border-red-500/50 hexagon-clip relative z-10 shadow-2xl">
              <AlertTriangle size={64} className="text-red-500" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* 404 Text with Glitch Effect */}
        <div className="mb-6 relative">
          <h1 className="text-9xl font-display font-bold text-white tracking-tighter relative inline-block animate-glitch">
            404
            <span className="absolute top-0 left-0 text-red-500 opacity-70 -z-10" style={{ transform: 'translate(-2px, -2px)' }}>404</span>
            <span className="absolute top-0 left-0 text-cyan-500 opacity-70 -z-10" style={{ transform: 'translate(2px, 2px)' }}>404</span>
          </h1>
        </div>
        
        <Panel className="p-8 mb-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-display text-zinc-200 uppercase tracking-wider">
              ERROR: <span className="text-red-400">ROUTE_NOT_FOUND</span>
            </h2>
            
            <div className="font-mono text-xs text-zinc-500 bg-black/50 p-4 border border-zinc-800/50 text-left overflow-x-auto">
              <div className="flex gap-2">
                <span className="text-red-500">×</span>
                <span>Path: <span className="text-cyan-400">"{location.pathname}"</span></span>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-zinc-600">→</span>
                <span className="text-zinc-600">Status: 404 NOT_FOUND</span>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-zinc-600">→</span>
                <span className="text-zinc-600">Timestamp: {new Date().toISOString()}</span>
              </div>
            </div>

            <p className="text-zinc-400 font-mono text-sm">
              The requested protocol endpoint does not exist in the network.
            </p>
          </div>
        </Panel>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="primary" 
            className="flex items-center justify-center gap-3 px-8 py-4"
            onClick={() => navigate('/')}
          >
            <Home size={20} /> Return to Base
          </Button>
          
          <Button 
            variant="neutral" 
            className="flex items-center justify-center gap-3 px-8 py-4"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600 font-mono">
          <Hexagon size={12} className="text-red-500/50" />
          <span>SYSTEM ERROR • INSTINCT PROTOCOL</span>
          <Hexagon size={12} className="text-red-500/50" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
