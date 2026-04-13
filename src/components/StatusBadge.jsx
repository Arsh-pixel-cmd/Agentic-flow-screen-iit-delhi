import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

const StatusBadge = ({ state }) => {
  if (state === 'running') {
    return (
      <div className="flex items-center gap-1.5">
        <Loader2 className="animate-spin text-indigo-400" size={12} />
        <span className="text-[9px] font-semibold uppercase tracking-widest text-indigo-400">
          Running
        </span>
      </div>
    );
  }

  if (state === 'completed') {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="text-emerald-400" size={12} />
        <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-400">
          Done
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full border border-slate-600" />
      <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-600">
        Idle
      </span>
    </div>
  );
};

export default StatusBadge;
