import React from 'react';
import { MousePointer2, StickyNote, Highlighter, LayoutTemplate } from 'lucide-react';

const ToolDock = ({ activeTool, setActiveTool, openTemplates }) => {
  return (
    <div className="absolute left-[20px] top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-3 rounded-2xl shadow-2xl"
         style={{
           background: 'rgba(10, 10, 15, 0.4)',
           backdropFilter: 'blur(12px)',
           border: '1px solid #3B2B85'
         }}>
      <ToolButton active={activeTool === 'cursor'} onClick={() => setActiveTool('cursor')} icon={<MousePointer2 size={18} />} title="Cursor" />
      <ToolButton active={activeTool === 'sticky'} onClick={() => setActiveTool('sticky')} icon={<StickyNote size={18} />} title="Sticky Note" />
      <ToolButton active={activeTool === 'highlighter'} onClick={() => setActiveTool('highlighter')} icon={<Highlighter size={18} />} title="Highlighter" />
      <div className="w-full h-px bg-[#3B2B85]/50 my-1" />
      <ToolButton onClick={openTemplates} icon={<LayoutTemplate size={18} />} title="Templates" />
    </div>
  );
};

const ToolButton = ({ active, onClick, icon, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-3 rounded-xl transition-all ${active ? 'bg-[#A259FF]/20 text-[#A259FF] shadow-[0_0_12px_rgba(162,89,255,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
  </button>
);

export default ToolDock;
