import React, { useState } from 'react';
import { ChevronLeft, GitMerge, LayoutGrid, Play, Loader2, LayoutDashboard, AlertTriangle, X } from 'lucide-react';
import { useBuilderStore } from '../lib/builderStore';
import { useWorkflowStore } from '../lib/store';
import { supabase } from '../lib/supabaseClient';

const FlowHeader = () => {
  const { viewMode, setViewMode, blocks } = useBuilderStore();
  const [isDeploying, setIsDeploying] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  const handleInitializeEngine = async () => {
    // ── BUILDER VALIDATION: Require exactly 8 nodes, each with name + description ──
    const errors: string[] = [];

    if (blocks.length !== 8) {
      errors.push(`You have ${blocks.length} node${blocks.length !== 1 ? 's' : ''}. Exactly 8 agent nodes are required.`);
    }

    blocks.forEach((block: any, idx: number) => {
      const label = block.name && block.name.trim() !== '' && block.name !== 'New Agent' ? block.name : null;
      const desc = block.description && block.description.trim() !== '' && block.description !== 'Describe the agent objective...' ? block.description : null;

      if (!label) {
        errors.push(`Node ${idx + 1}: Missing a custom agent name.`);
      }
      if (!desc) {
        errors.push(`Node ${idx + 1}${label ? ` (${label})` : ''}: Missing agent description.`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationPopup(true);
      return;
    }

    setIsDeploying(true);
    
    // Zoom out canvas elements visually
    const canvasRef = document.getElementById('builder-canvas-area');
    if (canvasRef) canvasRef.classList.add('scale-75', 'opacity-0', 'transition-all', 'duration-1000');
    
    // Gradient Pulse transition effect portal hook
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = "fixed inset-0 z-[150] bg-gradient-to-r from-cyan-500/0 via-purple-500/20 to-cyan-500/0 backdrop-blur-3xl animate-fade-in pointer-events-none flex flex-col items-center justify-center";
    transitionOverlay.innerHTML = `<h1 class="text-4xl font-display font-black text-white mix-blend-overlay tracking-widest uppercase shadow-black drop-shadow-xl animate-pulse">Compiling Neural Path...</h1>`;
    document.body.appendChild(transitionOverlay);

    // Save configuration — MUST await before switching view
    const templateName = blocks.length > 0 ? blocks[0].name : "Custom Builder Flow";
    const deployedId = await useBuilderStore.getState().deployProject(templateName);

    // Remove Overlay
    document.body.removeChild(transitionOverlay);
    setIsDeploying(false);
    
    // Clear styles
    if (canvasRef) canvasRef.classList.remove('scale-75', 'opacity-0');
    
    if (!deployedId) {
      alert('Compilation failed. Please try again or add blocks first.');
      return;
    }

    // Only switch after store has deployedTemplateId confirmed
    setViewMode('pipeline');
  };

  return (
    <>
      <header
        className="bg-black/40 backdrop-blur-3xl flex items-center px-8 py-5 z-40 relative border-b border-white/[0.03] shadow-2xl"
      >
        {/* Left: Navigation & Logo */}
        <div className="flex items-center gap-6 flex-1 min-w-0">
          
          {/* Return to Hub */}
          <a 
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 text-gray-400 transition-all duration-300 hover:border-[#A259FF]/50 hover:text-white hover:bg-white/10 shadow-lg text-[11px] font-black uppercase tracking-wider group"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <LayoutDashboard size={16} className="group-hover:scale-110 transition-transform" />
            <span>Dashboard</span>
          </a>

          {/* Logo and Title */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="flex items-center gap-4 border-r border-white/10 pr-6 flex-shrink-0">
              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-lg logo-gradient-box">
                <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <h1 className="text-[18px] font-black tracking-tight text-white font-display leading-tight">
                  Agentic<span className="text-[#A259FF]">Flow</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center group flex-1 min-w-0 mr-4">
              <input 
                type="text"
                value={useWorkflowStore(state => state.flowTitle) || ''}
                onChange={(e) => useWorkflowStore.getState().setFlowTitle(e.target.value)}
                placeholder="Untitled Flow"
                className="bg-transparent border-none outline-none text-sm font-medium text-zinc-300 placeholder-zinc-600 focus:text-white transition-colors w-full min-w-0 text-ellipsis overflow-hidden whitespace-nowrap"
              />
            </div>
          </div>
        </div>

        {/* Center: View Toggles */}
        <div className="flex items-center justify-center gap-[4rem] bg-white/[0.02] border border-white/[0.05] py-2 px-8 rounded-3xl shadow-xl backdrop-blur-xl flex-shrink-0 mx-4">
          <button
            data-tour="pipeline-toggle"
            onClick={() => setViewMode('pipeline')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              viewMode === 'pipeline' 
                ? 'bg-[#46B1FF] text-white shadow-[0_5px_20px_rgba(70,177,255,0.3)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <GitMerge size={14} className={viewMode === 'pipeline' ? 'animate-pulse' : ''} /> Pipeline
          </button>
          <button
            onClick={() => setViewMode('builder')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              viewMode === 'builder' 
                ? 'bg-[#A259FF] text-white shadow-[0_5px_20px_rgba(162,89,255,0.3)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <LayoutGrid size={14} /> Builder
          </button>
        </div>

        {/* Right: Action */}
        <div className="flex items-center justify-end gap-4 flex-1">
          {viewMode === 'builder' && (
            <button 
              onClick={handleInitializeEngine}
              disabled={isDeploying}
              className={`bg-gradient-to-r from-[#A259FF] to-[#6c39b3] text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(162,89,255,0.4)] ${isDeploying ? 'opacity-80 scale-95 cursor-wait' : 'hover:scale-105'}`}
            >
              {isDeploying ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {isDeploying ? 'Deploying...' : 'Initialize Engine'}
            </button>
          )}
        </div>
      </header>

      {/* ── VALIDATION POPUP ── */}
      {showValidationPopup && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={() => setShowValidationPopup(false)}
        >
          <div 
            className="w-full max-w-lg rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #14141f 0%, #0a0a12 100%)',
              border: '1px solid rgba(255,75,75,0.25)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(255,75,75,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#ff4b4b]/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#ff4b4b]/10 border border-[#ff4b4b]/20">
                  <AlertTriangle size={18} className="text-[#ff4b4b]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-display">Pipeline Setup Incomplete</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">Please fix the following before compiling</p>
                </div>
              </div>
              <button 
                onClick={() => setShowValidationPopup(false)}
                className="p-2 rounded-xl hover:bg-white/5 transition-all text-slate-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error List */}
            <div className="px-6 py-5 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-2">
              {validationErrors.map((err, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <span className="text-[#ff4b4b] text-xs font-black mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="text-sm text-slate-300 leading-relaxed">{err}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-black/30">
              <button 
                onClick={() => setShowValidationPopup(false)}
                className="w-full py-3 rounded-xl bg-[#A259FF] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#A259FF]/80 transition-colors"
              >
                Got it — I'll fix it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlowHeader;

