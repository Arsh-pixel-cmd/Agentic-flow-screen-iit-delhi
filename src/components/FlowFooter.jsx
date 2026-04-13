import React, { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const FlowFooter = ({ flowStatus, logs, completedCount, totalCount }) => {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollLeft = logRef.current.scrollWidth;
    }
  }, [logs]);

  const statusText = {
    idle: 'System Standing By',
    running: 'Workflow Executing…',
    completed: 'Workflow Complete — System LIVE',
  };

  const statusColor = {
    idle: '#64748b',
    running: '#818cf8',
    completed: '#34d399',
  };

  return (
    <footer
      className="glass flex items-center justify-between px-5 py-2 z-30 relative"
      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Left: Status */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${flowStatus === 'running' ? 'status-running' : ''}`}
            style={{ background: statusColor[flowStatus] || '#64748b' }}
          />
          <span
            className="text-[10px] font-semibold tracking-wide"
            style={{ color: statusColor[flowStatus] }}
          >
            {statusText[flowStatus] || 'Ready'}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <span className="text-[9px] font-mono text-slate-600">
          {completedCount}/{totalCount} agents
        </span>
      </div>

      {/* Center: Inline Logs */}
      <div
        ref={logRef}
        className="flex-1 mx-6 overflow-x-auto no-scrollbar flex items-center gap-3"
      >
        {logs.slice(-4).map((log, i) => (
          <div
            key={log.id || i}
            className="flex items-center gap-1.5 flex-shrink-0 log-enter"
          >
            <Terminal size={8} className="text-slate-600" />
            <span
              className="text-[9px] font-mono whitespace-nowrap"
              style={{
                color:
                  log.type === 'success'
                    ? '#34d399'
                    : log.type === 'error'
                    ? '#ef4444'
                    : log.type === 'info'
                    ? '#818cf8'
                    : '#64748b',
              }}
            >
              {log.text}
            </span>
          </div>
        ))}
      </div>

      {/* Right: Framework Label */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Mandelbrot · 16 Agents
        </span>
      </div>
    </footer>
  );
};

export default FlowFooter;
