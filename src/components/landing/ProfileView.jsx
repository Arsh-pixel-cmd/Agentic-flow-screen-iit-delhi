import React from 'react';
import { User, LogOut, Workflow, Cpu, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfileView = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-32 px-6 pb-24 relative overflow-hidden bg-[#030303]">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-zinc-100 tracking-tight">Agentic Profile</h2>
          <button onClick={onLogout} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/5">
            <LogOut className="w-4 h-4" /> <span className="text-sm font-medium">Terminate Session</span>
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-6 shadow-inner mx-auto md:mx-0">
              <User className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-100 mb-1 text-center md:text-left">{user.name}</h3>
            <p className="text-zinc-500 font-light mb-6 text-center md:text-left">{user.email}</p>
            
            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Plan</span>
                <span className="text-zinc-200 font-medium bg-zinc-800 px-2 py-0.5 rounded border border-white/10">{user.plan}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Company</span>
                <span className="text-zinc-200">{user.company || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Joined</span>
                <span className="text-zinc-200">{user.joined}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div>
                <h4 className="text-lg font-medium text-zinc-200 mb-1">System Status</h4>
                <p className="text-zinc-500 text-sm font-light">Your neural bridge is configured and ready.</p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 hover:scale-105">
                Launch Engine <Play className="w-4 h-4 fill-current" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-inner">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <Workflow className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-zinc-100 mb-1">0</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Active Workflows</div>
              </div>
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-inner">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-zinc-100 mb-1">0h</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Compute Used</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
