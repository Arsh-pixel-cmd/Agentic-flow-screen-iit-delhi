import React from 'react';
import { ChevronLeft } from 'lucide-react';

const FlowHeader = () => {
  return (
    <header
      className="bg-black/90 backdrop-blur-2xl flex items-center justify-between px-6 py-4 z-40 relative border-b border-white/[0.04]"
    >
      {/* Left: Navigation & Logo */}
      <div className="flex items-center gap-5 flex-shrink-0">
        
        {/* Return to Hub */}
        <a 
          href="/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-gray-400 transition-all duration-300 hover:border-[#8B5CF6]/50 hover:text-white hover:bg-white/10 group shadow-lg"
          title="Return to Hub"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </a>

        {/* Logo */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple) 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 18px rgba(162, 89, 255, 0.35)',
            }}
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain" 
            />
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-tight text-white font-display leading-tight">
              Agentic Flow
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#CEA3FF] opacity-60">
              Neuro-Agentic Systems
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FlowHeader;
