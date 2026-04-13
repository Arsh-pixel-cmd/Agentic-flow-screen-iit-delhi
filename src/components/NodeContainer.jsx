import React from 'react';
import {
  Search, Eye, Users, BookOpen, User, Compass, Target, Lightbulb,
  Sparkles, Layers, Box, Palette, ShieldCheck, RefreshCw, FileText, Rocket,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { NODE_WIDTH, NODE_HEIGHT } from '../lib/agents';

const ICON_MAP = {
  Search, Eye, Users, BookOpen, User, Compass, Target, Lightbulb,
  Sparkles, Layers, Box, Palette, ShieldCheck, RefreshCw, FileText, Rocket,
};

const PHASE_COLORS = {
  1: { accent: '#818cf8', bg: 'rgba(99,102,241,0.06)' },   // indigo
  2: { accent: '#a78bfa', bg: 'rgba(167,139,250,0.06)' },  // violet
  3: { accent: '#f472b6', bg: 'rgba(244,114,182,0.06)' },   // pink
  4: { accent: '#34d399', bg: 'rgba(52,211,153,0.06)' },    // emerald
};

const NodeContainer = ({ agent, state, onClick }) => {
  const IconComponent = ICON_MAP[agent.icon] || Box;
  const phaseColor = PHASE_COLORS[agent.phase] || PHASE_COLORS[1];

  const stateClass =
    state === 'running'
      ? 'node-running'
      : state === 'completed'
      ? 'node-completed'
      : 'node-idle';

  return (
    <div
      className={`absolute pointer-events-auto glass-node rounded-xl cursor-pointer
        transition-all duration-300 hover:scale-[1.03] ${stateClass}`}
      style={{
        left: agent.x,
        top: agent.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: phaseColor.bg }}
          >
            <IconComponent size={13} style={{ color: phaseColor.accent }} />
          </div>
          <h3 className="text-[11px] font-bold text-slate-200 truncate tracking-wide">
            {agent.name}
          </h3>
        </div>
        <StatusBadge state={state} />
      </div>

      {/* Body */}
      <div className="px-4 pt-2 pb-3">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          {agent.description}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span
            className="text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded"
            style={{
              color: phaseColor.accent,
              background: phaseColor.bg,
            }}
          >
            {agent.phaseName}
          </span>
          <span className="text-[8px] text-slate-600 font-mono">
            P{agent.phase}.{agent.diamondPos}
          </span>
        </div>
      </div>

      {/* Connection Ports */}
      {/* Top Port */}
      {(agent.diamondPos === 'left' || agent.diamondPos === 'right' || agent.diamondPos === 'bottom') && (
        <div
          className="absolute w-3 h-3 rounded-full flex items-center justify-center"
          style={{
            left: NODE_WIDTH / 2 - 6,
            top: -6,
            background: '#0a0a0e',
            border: `1.5px solid ${state === 'running' ? phaseColor.accent : state === 'completed' ? '#22c55e' : '#1e293b'}`,
          }}
        >
          <div
            className="w-1 h-1 rounded-full"
            style={{
              background: state === 'running' ? phaseColor.accent : state === 'completed' ? '#22c55e' : '#334155',
            }}
          />
        </div>
      )}

      {/* Bottom Port */}
      {(agent.diamondPos === 'top' || agent.diamondPos === 'left' || agent.diamondPos === 'right') && (
        <div
          className="absolute w-3 h-3 rounded-full flex items-center justify-center"
          style={{
            left: NODE_WIDTH / 2 - 6,
            bottom: -6,
            background: '#0a0a0e',
            border: `1.5px solid ${state === 'completed' ? '#22c55e' : '#1e293b'}`,
          }}
        >
          <div
            className="w-1 h-1 rounded-full"
            style={{ background: state === 'completed' ? '#22c55e' : '#334155' }}
          />
        </div>
      )}

      {/* Left Port (for bridge connections) */}
      {agent.diamondPos === 'top' && agent.phase > 1 && (
        <div
          className="absolute w-3 h-3 rounded-full flex items-center justify-center"
          style={{
            left: -6,
            top: NODE_HEIGHT / 2 - 6,
            background: '#0a0a0e',
            border: `1.5px solid ${state === 'running' ? phaseColor.accent : '#1e293b'}`,
          }}
        >
          <div className="w-1 h-1 rounded-full" style={{ background: '#334155' }} />
        </div>
      )}

      {/* Right Port (for bridge connections) */}
      {agent.diamondPos === 'bottom' && agent.phase < 4 && (
        <div
          className="absolute w-3 h-3 rounded-full flex items-center justify-center"
          style={{
            right: -6,
            top: NODE_HEIGHT / 2 - 6,
            background: '#0a0a0e',
            border: `1.5px solid ${state === 'completed' ? '#22c55e' : '#1e293b'}`,
          }}
        >
          <div className="w-1 h-1 rounded-full" style={{ background: '#334155' }} />
        </div>
      )}
    </div>
  );
};

export default React.memo(NodeContainer);
