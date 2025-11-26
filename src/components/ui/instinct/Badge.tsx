import React from 'react';

interface BadgeProps {
  label: string;
  color?: 'zinc' | 'cyan' | 'red' | 'indigo' | 'emerald' | 'purple' | 'amber';
  pulse?: boolean;
  className?: string;
}

export const Badge = ({ label, color = "zinc", pulse = false, className = "" }: BadgeProps) => {
  const colors = {
    zinc: "text-zinc-400 bg-zinc-900 border-zinc-700",
    cyan: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]",
    red: "text-[#FF2A6D] bg-[#FF2A6D]/10 border-[#FF2A6D]/30 shadow-[0_0_10px_rgba(255,42,109,0.1)]",
    indigo: "text-indigo-400 bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
    emerald: "text-emerald-400 bg-emerald-900/20 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    purple: "text-purple-400 bg-purple-900/20 border-purple-500/30 shadow-[0_0_10px_rgba(192,132,252,0.1)]",
    amber: "text-amber-400 bg-amber-900/20 border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.1)]",
  };
  return (
    <span className={`
      px-2 py-1 text-[10px] uppercase tracking-wider border flex items-center gap-1.5
      ${colors[color] || colors.zinc}
      ${pulse ? 'animate-pulse' : ''}
      ${className}
    `}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
};



