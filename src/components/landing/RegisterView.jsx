import React, { useState } from 'react';
import { User, Mail, Building2, UserPlus, ChevronRight } from 'lucide-react';

export const RegisterView = ({ onRegister }) => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onRegister({ ...formData, plan: 'Trial', joined: new Date().toLocaleDateString() });
    }
  };

  return (
    <div className="min-h-screen pt-32 px-6 flex items-center justify-center relative overflow-hidden bg-[#030303]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-zinc-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
          <UserPlus className="w-6 h-6 text-zinc-300" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">Create Profile</h2>
        <p className="text-zinc-500 font-light text-sm mb-8">Register to initialize your neuro-orchestration workspace.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name</label>
            <div className="flex items-center w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
              <User className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent text-zinc-200 outline-none placeholder-zinc-600" placeholder="Jane Doe" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="flex items-center w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
              <Mail className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent text-zinc-200 outline-none placeholder-zinc-600" placeholder="jane@company.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Company / Team (Optional)</label>
            <div className="flex items-center w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
              <Building2 className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
              <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full bg-transparent text-zinc-200 outline-none placeholder-zinc-600" placeholder="Acme Corp" />
            </div>
          </div>
          
          <button type="submit" className="w-full mt-6 bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 hover:scale-[1.02]">
            Establish Profile <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
