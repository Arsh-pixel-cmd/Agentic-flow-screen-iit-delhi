import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useWorkflowStore } from '../lib/store';

const ThinkingTerminal = ({ node, isRunning }: any) => {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const projectPrompt = useWorkflowStore((state: any) => state.projectPrompt);
  const textRef = useRef('');
  const expandedRef = useRef(false);
  const scrollSmallRef = useRef<HTMLDivElement>(null);
  const scrollLargeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollSmallRef.current) scrollSmallRef.current.scrollTop = scrollSmallRef.current.scrollHeight;
    if (scrollLargeRef.current) scrollLargeRef.current.scrollTop = scrollLargeRef.current.scrollHeight;
  }, [text, expanded]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);

  useEffect(() => {
    if (!isRunning) {
        if (textRef.current) {
           const timer = setTimeout(() => {
               if (!expandedRef.current) {
                 setActive(false);
                 setText('');
               }
           }, 2000);
           return () => clearTimeout(timer);
        }
        return;
    }
    
    let isMounted = true;

    const initTimer = setTimeout(() => {
      if (isMounted) {
        setText('> Initializing neural bridge...\n');
        setActive(true);
      }
    }, 0);

    const startStream = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
         setText(prev => prev + '\n> Not authenticated. Stream aborted.');
         return;
      }

      try {
        const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3001';
        const response = await fetch(`${API_BASE}/api/agent/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userTask: projectPrompt,
            agent: { name: node.category?.name || 'Agent' },
            userId
          })
        });

        if (!response.body) throw new Error('No body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!isMounted) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(dataStr);
                const token = parsed.choices?.[0]?.delta?.content || '';
                setText(prev => prev + token);
              } catch {
                // Ignore partial JSON chunks from SSE stream
              }
            }
          }
        }
        
        if (isMounted) setText(prev => prev + '\n\n> [Sequence Terminated]');
      } catch {
         if (isMounted) setText(prev => prev + '\n> Error establishing neural link...');
      }
    };

    const streamTimer = setTimeout(startStream, 500);

    return () => { isMounted = false; clearTimeout(initTimer); clearTimeout(streamTimer); };
  }, [isRunning, node, projectPrompt]);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
             initial={{ opacity: 0, scale: 0.9, x: 10, y: 10 }}
             animate={{ opacity: expanded ? 0 : 1, scale: expanded ? 0.9 : 1, x: 0, y: 0, pointerEvents: expanded ? 'none' : 'auto' }}
             exit={{ opacity: 0, scale: 0.9, x: 10, y: 10 }}
             transition={{ duration: 0.3 }}
             className="absolute z-[100] cursor-pointer group"
             style={{ left: '100%', bottom: 0, marginLeft: '12px' }}
             onClick={(e) => {
               e.stopPropagation();
               setExpanded(true);
             }}
          >
             <div className="flex flex-col overflow-hidden relative transition-all duration-300 bg-[#050505]/95 backdrop-blur-xl border border-[#8B5CF6]/50 rounded-lg w-64 shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:border-[#8B5CF6] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                
                {/* Header */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-white/[0.02]">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                   <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                   <div className="w-1.5 h-1.5 rounded-full bg-[#DEF767] shadow-[0_0_5px_#DEF767] animate-pulse" />
                   <span className="text-[9px] uppercase tracking-[0.2em] text-[#A259FF] ml-auto font-bold opacity-80 flex items-center gap-2">
                      COM-LINK // {isRunning ? 'RUNNING' : 'TERMINATED'}
                   </span>
                   <button 
                     title="Expand Terminal" 
                     className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white"
                     onClick={(e) => {
                       e.stopPropagation();
                       setExpanded(true);
                     }}
                   >
                     <Maximize2 size={12} />
                   </button>
                </div>
                
                {/* Terminal Output */}
                <div 
                  ref={scrollSmallRef}
                  className="p-3 font-mono text-[10px] text-[#A78BFA] leading-relaxed break-words whitespace-pre-wrap flex-1 max-h-32 overflow-y-auto custom-scrollbar-neon scroll-smooth flex flex-col"
                >
                   <div>
                     {text}
                     <span className="animate-pulse font-bold ml-1 text-white">_</span>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onPointerDown={(e) => { 
              if (e.target === e.currentTarget) {
                e.stopPropagation(); 
                setExpanded(false); 
                if (!isRunning) setActive(false); 
              }
            }}
          >
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-[#050505] border border-[#8B5CF6] rounded-2xl w-[800px] h-[600px] shadow-[0_0_80px_rgba(139,92,246,0.4)] flex flex-col overflow-hidden relative"
               onClick={(e) => e.stopPropagation()}
            >
               {/* Header */}
               <div className="flex items-center gap-1.5 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-[#DEF767] shadow-[0_0_8px_#DEF767] animate-pulse" />
                  <span className="text-xs uppercase tracking-[0.2em] text-[#A259FF] ml-auto font-bold opacity-80 flex items-center gap-2">
                     <span className="text-white">AGENT LOGS // </span>
                     {isRunning ? 'RUNNING' : 'TERMINATED'}
                  </span>
                  <button 
                    title="Close Terminal"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setExpanded(false); 
                      if (!isRunning) setActive(false); 
                    }} 
                    className="ml-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
               </div>
               
               {/* Terminal Output */}
               <div 
                 ref={scrollLargeRef}
                 className="p-6 font-mono text-sm text-[#A78BFA] leading-relaxed break-words whitespace-pre-wrap flex-1 overflow-y-auto custom-scrollbar-neon scroll-smooth flex flex-col"
               >
                  <div>
                    {text}
                    <span className="animate-pulse font-bold ml-1 text-white">_</span>
                  </div>
               </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
};

export default ThinkingTerminal;
