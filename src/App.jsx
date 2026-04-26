import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Route-level code splitting — each page loads on demand
const LandingPage = lazy(() => import('./components/landing/index.jsx'));
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const Engine = lazy(() => import('./Engine.jsx'));
const ProfileView = lazy(() => import('./components/landing/ProfileView.jsx').then(m => ({ default: m.ProfileView })));

const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-[#A259FF] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Loading Module...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30 selection:text-white">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Default route loads the beautiful Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Your two clean pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/canvas" element={<Engine />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </Suspense>
    </div>
  );
}
