import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, StickyNote, Highlighter, LayoutTemplate, Eraser, Camera, Lock, Unlock, Type, PlusSquare, Network, Webhook } from 'lucide-react';
import { useBuilderStore } from '../lib/builderStore';

interface ToolDockProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  canvasLocked: boolean;
  setCanvasLocked: (locked: boolean) => void;
  onScreenshot: () => void;
  onEraseAll: () => void;
  onLockToggle?: (locked: boolean) => void;
}

const ToolDock = ({ activeTool, setActiveTool, canvasLocked, setCanvasLocked, onScreenshot, onEraseAll, onLockToggle }: ToolDockProps) => {
  const { viewMode, setViewMode, addBlock, addWebhookBlock } = useBuilderStore();
  
  // Apple-style persistent scaling state
  const [dockScale, setDockScale] = useState(1);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedScale = localStorage.getItem('agentic_flow_dock_scale');
    if (savedScale) {
      setDockScale(parseFloat(savedScale));
    }
  }, []);

  const handleSeparatorDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startScale = dockScale;
    
    // Lock the cursor globally so it doesn't flicker if you move the mouse fast
    document.body.style.cursor = 'ns-resize';

    const onPointerMove = (moveEvent: PointerEvent) => {
      // Dragging up (negative delta clientY) increases scale since dock is at bottom
      const deltaY = startY - moveEvent.clientY;
      const sensitivity = 0.005;
      const newScale = Math.min(Math.max(0.5, startScale + deltaY * sensitivity), 2.5);
      
      setDockScale(newScale);
      localStorage.setItem('agentic_flow_dock_scale', newScale.toString());
    };

    const onPointerUp = () => {
      document.body.style.cursor = ''; // Release cursor lock
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const Separator = () => (
    <div 
      className="w-4 h-12 flex items-center justify-center group/sep self-center"
      style={{ cursor: 'ns-resize' }}
      onPointerDown={handleSeparatorDrag}
      title="Drag to resize dock"
    >
      <div className="w-px h-8 bg-white/10 group-hover/sep:bg-white/40 transition-colors rounded-full" />
    </div>
  );

  return (
    <div 
      ref={dockRef}
      className="absolute bottom-8 left-1/2 z-50 flex items-end gap-4 p-3 px-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0f0f14]/60 backdrop-blur-2xl border border-white/5 group/dock"
      style={{
        transform: `translateX(-50%) scale(${dockScale})`,
        transformOrigin: 'bottom center',
        // We use transition only when not dragging to keep live-dragging completely smooth
        transition: 'transform 0.1s ease-out, background-color 0.3s, border 0.3s'
      }}
    >
      
      {viewMode === 'builder' && (
        <>
          <ToolButton data-tour="add-agent-btn" onClick={() => addBlock()} icon={<PlusSquare size={20} />} title="Add Agent Block" />
          <ToolButton data-tour="add-webhook-btn" onClick={() => addWebhookBlock()} icon={<Webhook size={20} />} title="Add Webhook Bridge" />
          <ToolButton active={activeTool === 'connect'} onClick={() => setActiveTool('connect')} icon={<Network size={20} />} title="Connect Blocks" />
          <Separator />
        </>
      )}

      <ToolButton active={activeTool === 'cursor'} onClick={() => setActiveTool('cursor')} icon={<MousePointer2 size={20} />} title="Cursor" />
      <ToolButton active={activeTool === 'sticky'} onClick={() => setActiveTool('sticky')} icon={<StickyNote size={20} />} title="Sticky Note" />
      <ToolButton active={activeTool === 'text'} onClick={() => setActiveTool('text')} icon={<Type size={20} />} title="Text Label" />
      <ToolButton active={activeTool === 'highlighter'} onClick={() => setActiveTool('highlighter')} icon={<Highlighter size={20} />} title="Highlighter" />
      
      <Separator />
      
      <ToolButton onClick={onEraseAll} icon={<Eraser size={20} />} title="Clear & Reset" />
      <ToolButton onClick={onScreenshot} icon={<Camera size={20} />} title="Screenshot Canvas" />
      <ToolButton 
        active={canvasLocked} 
        onClick={() => {
          const newState = !canvasLocked;
          setCanvasLocked(newState);
          onLockToggle?.(newState);
        }} 
        icon={canvasLocked ? <Lock size={20} /> : <Unlock size={20} />} 
        title={canvasLocked ? "Unlock Canvas" : "Lock Canvas"} 
      />
      
      <Separator />
      
      <ToolButton 
        active={viewMode === 'templates'} 
        onClick={() => setViewMode(viewMode === 'templates' ? 'builder' : 'templates')} 
        icon={<LayoutTemplate size={20} />} 
        title="Templates Library" 
      />
    </div>
  );
};

interface ToolButtonProps {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  'data-tour'?: string;
}

const ToolButton = ({ active, onClick, icon, title, ...rest }: ToolButtonProps) => (
  <div className="relative group/btn h-12 flex items-center" data-tour={rest['data-tour']}>
    <button
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all duration-300 origin-bottom group-hover/btn:scale-[1.2] group-hover/btn:-translate-y-2 active:scale-95 ${
        active 
          ? 'bg-[#A259FF] text-white shadow-[0_0_20px_rgba(162,89,255,0.4)]' 
          : 'text-slate-400 group-hover/btn:text-white group-hover/btn:bg-white/10'
      }`}
    >
      {icon}
    </button>
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {title}
    </div>
    {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#A259FF]" />}
  </div>
);

export default ToolDock;
