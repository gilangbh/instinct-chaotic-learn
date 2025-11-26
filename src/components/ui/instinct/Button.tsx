import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'long' | 'short' | 'system';
  className?: string;
  onClick?: () => void;
  active?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button = ({ children, variant = 'neutral', className = "", onClick, active = false, type = 'button', disabled = false }: ButtonProps) => {
  const styles = {
    neutral: `border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800`,
    primary: `border-indigo-500/50 text-indigo-300 bg-indigo-950/40 hover:bg-indigo-500/20 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]`,
    long: `border-[#00F0FF]/30 text-[#00F0FF] bg-[#00F0FF]/5 hover:bg-[#00F0FF]/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]`,
    short: `border-[#FF2A6D]/30 text-[#FF2A6D] bg-[#FF2A6D]/5 hover:bg-[#FF2A6D]/20 hover:shadow-[0_0_20px_rgba(255,42,109,0.3)]`,
    system: `border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10`,
  };
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 border uppercase text-xs font-bold tracking-widest transition-all duration-200 overflow-hidden group
        ${styles[variant]}
        ${active ? 'bg-opacity-30 border-opacity-100 ring-1 ring-current shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform`} style={{ transitionDuration: '1s' }} />
    </button>
  );
};



