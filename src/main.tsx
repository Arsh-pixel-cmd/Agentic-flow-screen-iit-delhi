import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider, SupabaseAuthAdapter } from './lib/auth'

// ╔════════════════════════════════════════════════════════════╗
// ║  TO SWITCH AUTH BACKENDS, CHANGE THIS ONE LINE:           ║
// ║                                                           ║
// ║  import { LocalServerAuthAdapter } from './lib/auth';     ║
// ║  const authAdapter = new LocalServerAuthAdapter();        ║
// ╚════════════════════════════════════════════════════════════╝
const authAdapter = new SupabaseAuthAdapter();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider adapter={authAdapter}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
