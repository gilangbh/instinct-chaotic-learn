import React from 'react';

interface BadgeProps {
  label: string;
  color?: 'zinc' | 'cyan' | 'red' | 'indigo' | 'emerald' | 'purple';
}

export const Badge = ({ label, color = "zinc" }: BadgeProps) => {
  const colors = {
    zinc: "text-zinc-400 bg-zinc-900 border-zinc-700",
    cyan: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30",
    red: "text-[#FF2A6D] bg-[#FF2A6D]/10 border-[#FF2A6D]/30",
    indigo: "text-indigo-400 bg-indigo-900/20 border-indigo-500/30",
    emerald: "text-emerald-400 bg-emerald-900/20 border-emerald-500/30",
    purple: "text-purple-400 bg-purple-900/20 border-purple-500/30",
  };
  return (
    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider border ${colors[color] || colors.zinc}`}>
      {label}
    </span>
  );
};

