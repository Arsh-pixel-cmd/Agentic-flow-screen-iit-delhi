import React from 'react';
import { X, Terminal, Cpu } from 'lucide-react';
import {
  Search, Eye, Users, BookOpen, User, Compass, Target, Lightbulb,
  Sparkles, Layers, Box, Palette, ShieldCheck, RefreshCw, FileText, Rocket,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const ICON_MAP = {
  Search, Eye, Users, BookOpen, User, Compass, Target, Lightbulb,
  Sparkles, Layers, Box, Palette, ShieldCheck, RefreshCw, FileText, Rocket,
};

const SidePanel = ({ agent, state, context, onContextChange, onClose }) => {
  if (!agent) return null;

  const IconComponent = ICON_MAP[agent.icon] || Box;

  return (
    <div className="fixed inset-y-0 right-0 w-[380px] z-50 slide-in flex flex-col">
      {/* Panel Body */}
      <div className="flex-1 glass flex flex-col overflow-hidden"
        style={{ borderLeft: '1px solid rgba(99,102,241,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)' }}
            >
              <IconComponent size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200">{agent.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-indigo-400/70">
                  Phase {agent.phase} — {agent.phaseName}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Agent Status
            </span>
            <StatusBadge state={state} />
          </div>
        </div>

        {/* System Prompt */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2 mb-2.5">
            <Cpu size={11} className="text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Agent Persona
            </span>
          </div>
          <div className="p-3 rounded-lg text-[11px] text-slate-400 leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            {agent.systemPrompt}
          </div>
        </div>

        {/* User Context Input */}
        <div className="px-5 py-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2.5">
            <Terminal size={11} className="text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Your Context
            </span>
          </div>
          <textarea
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder={`Add specific context for the ${agent.name} agent...`}
            className="flex-1 w-full p-3 rounded-lg text-xs text-slate-300 resize-none placeholder:text-slate-600"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
          <p className="text-[9px] text-slate-600 mt-2">
            This context is fed to the agent during the workflow execution.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span className="text-[9px] text-slate-600 font-mono">
            {agent.id} · {agent.diamondPos}
          </span>
          <span className="text-[9px] text-slate-600">
            Double Diamond Framework
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
