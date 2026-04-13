import React from 'react';
import { Cpu, Play, Settings, Loader2 } from 'lucide-react';

const FlowHeader = ({ prompt, setPrompt, runFlow, flowStatus, onOpenSettings }) => {
  const isRunning = flowStatus === 'running';

  return (
    <header
      className="glass flex items-center justify-between px-5 py-3 z-30 relative"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
          }}
        >
          <Cpu className="text-white" size={16} />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-200">
           Agentic flow
          </h1>
          <p className="text-[8px] uppercase tracking-[0.2em] text-slate-600 -mt-0.5">
            Agentic Design
          </p>
        </div>
      </div>

      {/* Center: Prompt Input */}
      <div className="flex-1 max-w-xl mx-6">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your task… e.g. 'Write an article on design cycles'"
          className="w-full px-4 py-2 rounded-lg text-xs text-slate-300 placeholder:text-slate-600"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-lg btn-glass text-slate-400 hover:text-slate-200"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          title="API Settings"
        >
          <Settings size={16} />
        </button>

        <button
          onClick={runFlow}
          disabled={isRunning}
          className="btn-run px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              Run Flow
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default FlowHeader;
