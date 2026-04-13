import React from 'react';
import { Maximize, Plus, Minus } from 'lucide-react';

const FlowControls = ({ setCamera }) => {
  return (
    <div className="absolute top-20 left-4 flex flex-col gap-1.5 z-20">
      <button
        onClick={() => setCamera({ x: 100, y: 60, zoom: 0.55 })}
        className="p-2.5 rounded-lg glass btn-glass"
        title="Fit View"
      >
        <Maximize size={15} className="text-slate-400" />
      </button>
      <button
        onClick={() => setCamera((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 2) }))}
        className="p-2.5 rounded-lg glass btn-glass"
        title="Zoom In"
      >
        <Plus size={15} className="text-slate-400" />
      </button>
      <button
        onClick={() => setCamera((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 0.1, 0.15) }))}
        className="p-2.5 rounded-lg glass btn-glass"
        title="Zoom Out"
      >
        <Minus size={15} className="text-slate-400" />
      </button>
    </div>
  );
};

export default FlowControls;
