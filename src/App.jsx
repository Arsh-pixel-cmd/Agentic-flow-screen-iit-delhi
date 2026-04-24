import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Engine from './Engine';
import Dashboard from './components/Dashboard';
import LandingPage from './components/landing';
import { ProfileView } from './components/landing/ProfileView';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30 selection:text-white">
      <Routes>
        {/* Default route loads the beautiful Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Your two clean pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/canvas" element={<Engine />} />
        <Route path="/profile" element={<ProfileView />} />
      </Routes>
    </div>
  );
}
