import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const THEME = {
  panel: "bg-[#080808]/80",
};

export const Panel = ({ children, className = "", noBorder = false, active = false, onClick }: PanelProps) => (
  <div 
    onClick={onClick}
    className={`
    relative backdrop-blur-md ${THEME.panel} 
    ${noBorder ? '' : `border ${active ? 'border-indigo-500/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]' : 'border-zinc-800/50 hover:border-zinc-700'}`} 
    transition-all duration-300 group overflow-hidden
    ${className}
  `}>
    {!noBorder && (
      <>
        <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 transition-colors duration-300 ${active ? 'border-indigo-400' : 'border-zinc-600 group-hover:border-zinc-400'}`} />
        <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 transition-colors duration-300 ${active ? 'border-indigo-400' : 'border-zinc-600 group-hover:border-zinc-400'}`} />
        <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 transition-colors duration-300 ${active ? 'border-indigo-400' : 'border-zinc-600 group-hover:border-zinc-400'}`} />
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 transition-colors duration-300 ${active ? 'border-indigo-400' : 'border-zinc-600 group-hover:border-zinc-400'}`} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      </>
    )}
    <div className="relative z-10">{children}</div>
  </div>
);

