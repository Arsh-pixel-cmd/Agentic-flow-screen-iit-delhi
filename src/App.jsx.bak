import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Engine from './Engine';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30 selection:text-white">
      <Routes>
        {/* Default route redirects to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Your two clean pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/canvas" element={<Engine />} />
      </Routes>
    </div>
  );
}
