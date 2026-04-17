import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSavedKeys } from '../lib/llm';
import { useWorkflowStore } from '../lib/store';

const ThinkingTerminal = ({ node, isRunning }) => {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);
  const projectPrompt = useWorkflowStore(state => state.projectPrompt);

  useEffect(() => {
    if (!isRunning) {
        if (text) {
           // delay hiding slightly
           setTimeout(() => {
               setActive(false);
               setText('');
           }, 2000);
        }
        return;
    }
    
    setText('> Initializing neural bridge...\n');
    setActive(true);
    let isMounted = true;

    const startStream = async () => {
      const keys = getSavedKeys();
      const activeKey = keys.openrouterKey || keys.groqKey;
      
      if (!activeKey) {
         setText(prev => prev + '\n> Missing active API key. Stream aborted.');
         return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/agent/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userTask: projectPrompt,
            agent: { name: node.category?.name || 'Agent' },
            activeKey
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
              } catch (e) {
                 // incomplete chunk wait for next
              }
            }
          }
        }
        
        if (isMounted) setText(prev => prev + '\n\n> [Sequence Terminated]');
      } catch (err) {
         if (isMounted) setText(prev => prev + '\n> Error establishing neural link...');
      }
    };

    // Add a slight artificial delay so it doesn't fly by instantly.
    setTimeout(startStream, 500);

    return () => { isMounted = false; };
  }, [isRunning, node, projectPrompt]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
           initial={{ opacity: 0, scale: 0.9, x: 10, y: 10 }}
           animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, x: 10, y: 10 }}
           transition={{ duration: 0.3 }}
           className="absolute z-[100] pointer-events-none"
           style={{ left: '100%', bottom: 0, marginLeft: '12px' }}
        >
           <div className="bg-[#050505]/95 backdrop-blur-xl border border-[#8B5CF6]/50 rounded-lg w-64 shadow-[0_0_20px_rgba(139,92,246,0.15)] flex flex-col overflow-hidden relative">
              
              {/* Header */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                 <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                 <div className="w-1.5 h-1.5 rounded-full bg-[#DEF767] shadow-[0_0_5px_#DEF767] animate-pulse" />
                 <span className="text-[9px] uppercase tracking-widest text-[#A259FF] ml-auto font-bold opacity-80">COM-LINK // RUNNING</span>
              </div>
              
              {/* Terminal Output */}
              <div className="p-3 font-mono text-[10px] text-[#A78BFA] leading-relaxed break-words whitespace-pre-wrap flex-1 max-h-32 overflow-y-auto custom-scrollbar-neon scroll-smooth flex flex-col justify-end">
                 <div>
                   {text}
                   <span className="animate-pulse font-bold ml-1 text-white">_</span>
                 </div>
              </div>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThinkingTerminal;
