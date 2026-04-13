import React from 'react';
import { X, Terminal, Cpu, Play, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Search, Eye, Users, BookOpen, User, Compass, Target, Lightbulb,
  Sparkles, Layers, Box, Palette, ShieldCheck, RefreshCw, FileText, Rocket,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const ICON_MAP = {
  Search, Eye, Users, BookOpen, User, Compass, Target, Lightbulb,
  Sparkles, Layers, Box, Palette, ShieldCheck, RefreshCw, FileText, Rocket,
};

const NodePanel = ({
  agent,
  state,
  task,
  onTaskChange,
  onRunAgent,
  nodeResult,
  isFlowRunning,
  onClose,
}) => {
  if (!agent) return null;

  const IconComponent = ICON_MAP[agent.icon] || Box;
  const isExecuting = state === 'running';
  const canExecute = !isExecuting && !isFlowRunning;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] z-50 slide-in flex flex-col">
      <div
        className="flex-1 glass flex flex-col overflow-hidden"
        style={{ borderLeft: '1px solid rgba(99,102,241,0.1)' }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)' }}
            >
              <IconComponent size={17} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200">{agent.name}</h2>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-indigo-400/70">
                Phase {agent.phase} · {agent.phaseName}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Status ── */}
        <div
          className="px-5 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Status
            </span>
            <StatusBadge state={state} />
          </div>
        </div>

        {/* ── Agent Persona ── */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <Cpu size={11} className="text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Agent Persona
            </span>
          </div>
          <div
            className="p-3 rounded-lg text-[11px] text-slate-400 leading-relaxed max-h-24 overflow-y-auto"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {agent.systemPrompt}
          </div>
        </div>

        {/* ── Task Input ── */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <Terminal size={11} className="text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Your Task
            </span>
          </div>
          <textarea
            value={task}
            onChange={(e) => onTaskChange(e.target.value)}
            placeholder={`e.g. "Write an article on design cycles" or "Analyze competitor landing pages"…`}
            className="w-full h-28 p-3 rounded-lg text-xs text-slate-300 resize-none placeholder:text-slate-600"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
          <p className="text-[9px] text-slate-600 mt-1.5">
            This task + the agent persona are sent to the LLM for synthesis.
          </p>
        </div>

        {/* ── Execute Button ── */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
        >
          <button
            onClick={() => onRunAgent(agent)}
            disabled={!canExecute}
            className="w-full btn-run px-4 py-3 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            {isExecuting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Executing {agent.name}…
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Execute Agent
              </>
            )}
          </button>
        </div>

        {/* ── Result Section ── */}
        {nodeResult && (
          <div className="px-5 py-4 flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center gap-2 mb-2.5">
              <CheckCircle2 size={11} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
                Agent Output
              </span>
            </div>
            <div
              className="p-3 rounded-lg text-[11px] text-slate-400 leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {nodeResult.content?.substring(0, 500)}
              {nodeResult.content?.length > 500 && (
                <span className="text-indigo-400 ml-1">… (see Visual Output)</span>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div
          className="px-5 py-3 flex items-center justify-between mt-auto flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span className="text-[9px] text-slate-600 font-mono">{agent.id}</span>
          <span className="text-[9px] text-slate-600">Mandelbrot Framework</span>
        </div>
      </div>
    </div>
  );
};

export default NodePanel;
