import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const THEME = {
  bg: "bg-[#050505]",
  panel: "bg-[#0A0A0A]",
  panelBorder: "border-zinc-800",
};

export const Panel = ({ children, className = "", noBorder = false, active = false, onClick }: PanelProps) => (
  <div 
    onClick={onClick}
    className={`
    relative backdrop-blur-sm ${THEME.panel} 
    ${noBorder ? '' : `border ${active ? 'border-indigo-500/50' : 'border-zinc-800'}`} 
    ${className}
  `}>
    {!noBorder && (
      <>
        <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${active ? 'border-indigo-500' : 'border-zinc-600'}`} />
        <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${active ? 'border-indigo-500' : 'border-zinc-600'}`} />
        <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${active ? 'border-indigo-500' : 'border-zinc-600'}`} />
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${active ? 'border-indigo-500' : 'border-zinc-600'}`} />
      </>
    )}
    {children}
  </div>
);

