import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { saveKeys, getSavedKeys, getKeyStatus } from '../lib/llm';

const SettingsModal = ({ isOpen, onClose }) => {
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const keys = getSavedKeys();
      setOpenrouterKey(keys.openrouterKey);
      setGroqKey(keys.groqKey);
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const status = getKeyStatus();

  const handleSave = () => {
    saveKeys({ openrouterKey, groqKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl w-full max-w-md modal-content"
        style={{
          border: '1px solid rgba(99,102,241,0.12)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)' }}
            >
              <Key size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200">API Configuration</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Bring Your Own Key — stored in localStorage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* OpenRouter Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                OpenRouter API Key
              </label>
              {status.openrouter ? (
                <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                  <CheckCircle2 size={10} /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] text-slate-600">
                  <AlertCircle size={10} /> Not set
                </span>
              )}
            </div>
            <input
              type="password"
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
              placeholder="sk-or-..."
              className="w-full px-3 py-2.5 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 font-mono"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />
            <p className="text-[9px] text-slate-600 mt-1.5">
              Routes to GPT-4o and Claude 3.5 Sonnet
            </p>
          </div>

          {/* Groq Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Groq API Key
              </label>
              {status.groq ? (
                <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                  <CheckCircle2 size={10} /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] text-slate-600">
                  <AlertCircle size={10} /> Not set
                </span>
              )}
            </div>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-3 py-2.5 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 font-mono"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />
            <p className="text-[9px] text-slate-600 mt-1.5">
              Routes to Llama 3.1 70B (high-speed inference)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span className="text-[9px] text-slate-600">
            Keys are stored locally and never sent to our servers.
          </span>
          <button
            onClick={handleSave}
            className="btn-run px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 size={14} /> Saved
              </>
            ) : (
              <>
                <Save size={14} /> Save Keys
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
