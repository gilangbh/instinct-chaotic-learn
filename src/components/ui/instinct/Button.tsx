import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'long' | 'short' | 'system';
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export const Button = ({ children, variant = 'neutral', className = "", onClick, active = false }: ButtonProps) => {
  const styles = {
    neutral: `border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900`,
    primary: `border-indigo-500/50 text-indigo-400 bg-indigo-950/20 hover:bg-indigo-900/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]`,
    long: `border-[#00F0FF]/30 text-[#00F0FF] bg-[#00F0FF]/5 hover:bg-[#00F0FF]/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]`,
    short: `border-[#FF2A6D]/30 text-[#FF2A6D] bg-[#FF2A6D]/5 hover:bg-[#FF2A6D]/10 shadow-[0_0_15px_rgba(255,42,109,0.15)]`,
    system: `border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10`,
  };
  return (
    <button 
      onClick={onClick}
      className={`
        relative px-6 py-3 border uppercase text-xs font-bold tracking-widest transition-all duration-200
        ${styles[variant]}
        ${active ? 'bg-opacity-20 border-opacity-100 ring-1 ring-current' : ''}
        ${className}
      `}
    >
      {children}
      {active && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-current rounded-full animate-ping" />}
    </button>
  );
};

