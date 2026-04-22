# AgenticFlow — Project Context

## Architecture
- **Frontend**: React + Vite, Zustand state management, Framer Motion animations
- **Backend**: Node.js server (server.js) for LLM proxy
- **Routing**: react-router-dom with BrowserRouter
  - / redirects to /dashboard
  - /dashboard — Dashboard (sequence list, project spaces)
  - /canvas — Engine (Pipeline + Builder views)

## Key Files
- src/App.jsx — Clean router, no landing page code
- src/Engine.jsx — Core orchestration engine (Pipeline & Builder views)
- src/lib/builderStore.js — Zustand store for builder blocks, connections, templates
- src/lib/store.js — Zustand store for workflow execution state
- src/lib/layoutEngine.js — Double Diamond layout for default 16 schema nodes
- src/lib/edgeRouter.js — Edge path computation and bundling
- src/data/schema.js — 16 UX categories, 4 workflow phases, explicit edges
- src/components/Dashboard.jsx — Sequence list, sidebar navigation
- src/components/BuilderCanvas.jsx — Infinite canvas for building custom agent graphs
- src/components/BuilderSidebar.jsx — Properties panel for builder blocks
- src/components/NodeContainer.jsx — Visual node rendering (140x140, phase-colored)

## Pipeline Execution Model
- **Default Schema**: 16 nodes in 4 phases (Discover→Define→Develop→Deliver), executed phase-by-phase
- **Deployed Templates**: Builder-created graphs executed via topological sort by dependency depth
- Nodes at depth 0 = Phase 1, depth 1 = Phase 2, etc.
- Neural Bridges rendered as horizontal bezier curves between node output/input ports

## Design Decisions
- Removed entire landing page (Navbar, Hero, Pricing, Register, Profile) — app is Dashboard + Canvas only
- Dashboard cards navigate to /canvas on click
- Phase opacity in pipeline uses 
ode.phase property (not ID parsing) to support builder nodes