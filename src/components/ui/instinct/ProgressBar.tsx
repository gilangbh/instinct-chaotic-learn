import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

export const ProgressBar = ({ value, max, color = "bg-indigo-500" }: ProgressBarProps) => {
  const width = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800/50 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out relative`} 
        style={{ width: `${width}%` }} 
      >
        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
};

