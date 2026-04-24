import React, { useState } from 'react';
import { User, Mail, Building2, UserPlus, ChevronRight, Lock, Loader2, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const RegisterView = ({ onRegister }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (data.user) {
          onRegister({ email: data.user.email, name: data.user.user_metadata?.full_name || 'User' });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              company: formData.company
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          onRegister({ email: data.user.email, name: formData.name });
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-6 flex items-center justify-center relative overflow-hidden bg-[#030303]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-zinc-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
          {isLogin ? <LogIn className="w-6 h-6 text-zinc-300" /> : <UserPlus className="w-6 h-6 text-zinc-300" />}
        </div>
        <h2 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create Profile'}
        </h2>
        <p className="text-zinc-500 font-light text-sm mb-8">
          {isLogin ? 'Sign in to access your workspaces.' : 'Register to initialize your neuro-orchestration workspace.'}
        </p>
        
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="flex items-center w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
                <User className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
                <input type="text" required={!isLogin} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent text-zinc-200 outline-none placeholder-zinc-600" placeholder="Jane Doe" />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="flex items-center w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
              <Mail className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent text-zinc-200 outline-none placeholder-zinc-600" placeholder="jane@company.com" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="flex items-center w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
              <Lock className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-transparent text-zinc-200 outline-none placeholder-zinc-600" placeholder="••••••••" />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Company / Team (Optional)</label>
              <div className="flex items-center w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
                <Building2 className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
                <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full bg-transparent text-zinc-200 outline-none placeholder-zinc-600" placeholder="Acme Corp" />
              </div>
            </div>
          )}
          
          <button disabled={loading} type="submit" className="w-full mt-6 bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Access Workspace' : 'Establish Profile')} 
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
