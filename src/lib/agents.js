// ── Double Diamond Agent Framework ──────────────────────────────────
// 16 agents across 4 phases: Discover → Define → Develop → Deliver
// Each phase forms a diamond shape on the infinite canvas.

export const NODE_WIDTH = 260;
export const NODE_HEIGHT = 140;

export const AGENTS = [
  // ═══════════════════════════════════════════════
  // PHASE 1: DISCOVER (Diverge)
  // ═══════════════════════════════════════════════
  {
    id: 'reviews',
    name: 'Reviews',
    phase: 1,
    phaseName: 'Discover',
    icon: 'Search',
    diamondPos: 'top',
    x: 200, y: 80,
    description: 'Analyze existing feedback & ratings',
    systemPrompt:
      'You are a Review Analyst Agent. Analyze existing product reviews, app store ratings, and customer feedback to identify recurring themes, pain points, and desired features. Return structured insights as JSON.',
  },
  {
    id: 'observations',
    name: 'Observations',
    phase: 1,
    phaseName: 'Discover',
    icon: 'Eye',
    diamondPos: 'left',
    x: 40, y: 310,
    description: 'Study user behavior patterns',
    systemPrompt:
      'You are a Behavioral Observation Agent. Study user behavior patterns through analytics, session recordings, and heatmaps. Identify usability issues and unexpected usage patterns.',
  },
  {
    id: 'primaryResearch',
    name: 'Primary Research',
    phase: 1,
    phaseName: 'Discover',
    icon: 'Users',
    diamondPos: 'right',
    x: 360, y: 310,
    description: 'Conduct interviews & surveys',
    systemPrompt:
      'You are a Primary Research Agent. Design and analyze user interviews, surveys, and usability tests. Extract qualitative insights about user needs and motivations.',
  },
  {
    id: 'deskResearch',
    name: 'Desk Research',
    phase: 1,
    phaseName: 'Discover',
    icon: 'BookOpen',
    diamondPos: 'bottom',
    x: 200, y: 540,
    description: 'Analyze market & competitor data',
    systemPrompt:
      'You are a Desk Research Agent. Analyze market reports, competitor products, industry trends, and academic research. Provide comprehensive landscape analysis.',
  },

  // ═══════════════════════════════════════════════
  // PHASE 2: DEFINE (Converge)
  // ═══════════════════════════════════════════════
  {
    id: 'personas',
    name: 'Personas',
    phase: 2,
    phaseName: 'Define',
    icon: 'User',
    diamondPos: 'top',
    x: 830, y: 80,
    description: 'Build detailed user archetypes',
    systemPrompt:
      'You are a Persona Creation Agent. Synthesize research data into detailed user personas with demographics, goals, behaviors, and pain points.',
  },
  {
    id: 'userJourney',
    name: 'User Journey',
    phase: 2,
    phaseName: 'Define',
    icon: 'Compass',
    diamondPos: 'left',
    x: 670, y: 310,
    description: 'Map touchpoints & emotions',
    systemPrompt:
      'You are a Journey Mapping Agent. Create comprehensive user journey maps showing touchpoints, emotions, pain points, and opportunities.',
  },
  {
    id: 'problemStatement',
    name: 'Problem Statement',
    phase: 2,
    phaseName: 'Define',
    icon: 'Target',
    diamondPos: 'right',
    x: 990, y: 310,
    description: 'Define core HMW challenges',
    systemPrompt:
      'You are a Problem Definition Agent. Synthesize all research into clear, actionable problem statements using the "How Might We" framework.',
  },
  {
    id: 'insights',
    name: 'Insights',
    phase: 2,
    phaseName: 'Define',
    icon: 'Lightbulb',
    diamondPos: 'bottom',
    x: 830, y: 540,
    description: 'Distill actionable patterns',
    systemPrompt:
      'You are an Insight Synthesis Agent. Distill all research and analysis into key actionable insights driving design direction.',
  },

  // ═══════════════════════════════════════════════
  // PHASE 3: DEVELOP (Diverge)
  // ═══════════════════════════════════════════════
  {
    id: 'ideation',
    name: 'Ideation',
    phase: 3,
    phaseName: 'Develop',
    icon: 'Sparkles',
    diamondPos: 'top',
    x: 1460, y: 80,
    description: 'Generate creative solutions',
    systemPrompt:
      'You are an Ideation Agent. Generate diverse creative solutions using brainstorming, SCAMPER, and lateral thinking techniques.',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    phase: 3,
    phaseName: 'Develop',
    icon: 'Layers',
    diamondPos: 'left',
    x: 1300, y: 310,
    description: 'Design info hierarchy & nav',
    systemPrompt:
      'You are an Information Architecture Agent. Design structural organization of content, navigation systems, and information hierarchy.',
  },
  {
    id: 'prototyping',
    name: 'Prototyping',
    phase: 3,
    phaseName: 'Develop',
    icon: 'Box',
    diamondPos: 'right',
    x: 1620, y: 310,
    description: 'Build rapid interactive demos',
    systemPrompt:
      'You are a Rapid Prototyping Agent. Create interactive prototypes demonstrating key interactions, user flows, and feature concepts.',
  },
  {
    id: 'visualDesign',
    name: 'Visual Design',
    phase: 3,
    phaseName: 'Develop',
    icon: 'Palette',
    diamondPos: 'bottom',
    x: 1460, y: 540,
    description: 'Create the visual system',
    systemPrompt:
      'You are a Visual Design Agent. Create the visual design system including typography, color palettes, spacing, and component styles.',
  },

  // ═══════════════════════════════════════════════
  // PHASE 4: DELIVER (Converge)
  // ═══════════════════════════════════════════════
  {
    id: 'testing',
    name: 'Testing',
    phase: 4,
    phaseName: 'Deliver',
    icon: 'ShieldCheck',
    diamondPos: 'top',
    x: 2090, y: 80,
    description: 'Validate with real users',
    systemPrompt:
      'You are a Usability Testing Agent. Design and execute usability tests, A/B tests, and accessibility audits.',
  },
  {
    id: 'iteration',
    name: 'Iteration',
    phase: 4,
    phaseName: 'Deliver',
    icon: 'RefreshCw',
    diamondPos: 'left',
    x: 1930, y: 310,
    description: 'Refine based on feedback',
    systemPrompt:
      'You are a Design Iteration Agent. Refine designs based on test results, prioritize changes by impact.',
  },
  {
    id: 'documentation',
    name: 'Documentation',
    phase: 4,
    phaseName: 'Deliver',
    icon: 'FileText',
    diamondPos: 'right',
    x: 2250, y: 310,
    description: 'Create specs & handoff docs',
    systemPrompt:
      'You are a Documentation Agent. Create comprehensive design specifications and handoff materials for engineering teams.',
  },
  {
    id: 'deployment',
    name: 'Deployment',
    phase: 4,
    phaseName: 'Deliver',
    icon: 'Rocket',
    diamondPos: 'bottom',
    x: 2090, y: 540,
    description: 'Ship to production edge',
    systemPrompt:
      'You are a Deployment Agent. Manage the production rollout process including staging, QA validation, performance optimization, and go-live coordination.',
  },
];

// ── Wire Connections ────────────────────────────────────────────────
// Each diamond: top → left, top → right, left → bottom, right → bottom
// Between diamonds: bottom.right → next-top.left
export const WIRE_CONNECTIONS = [
  // Diamond 1: Discover
  { from: 'reviews', to: 'observations', fromPort: 'bottom', toPort: 'top' },
  { from: 'reviews', to: 'primaryResearch', fromPort: 'bottom', toPort: 'top' },
  { from: 'observations', to: 'deskResearch', fromPort: 'bottom', toPort: 'top' },
  { from: 'primaryResearch', to: 'deskResearch', fromPort: 'bottom', toPort: 'top' },

  // Bridge: Discover → Define
  { from: 'deskResearch', to: 'personas', fromPort: 'right', toPort: 'left' },

  // Diamond 2: Define
  { from: 'personas', to: 'userJourney', fromPort: 'bottom', toPort: 'top' },
  { from: 'personas', to: 'problemStatement', fromPort: 'bottom', toPort: 'top' },
  { from: 'userJourney', to: 'insights', fromPort: 'bottom', toPort: 'top' },
  { from: 'problemStatement', to: 'insights', fromPort: 'bottom', toPort: 'top' },

  // Bridge: Define → Develop
  { from: 'insights', to: 'ideation', fromPort: 'right', toPort: 'left' },

  // Diamond 3: Develop
  { from: 'ideation', to: 'architecture', fromPort: 'bottom', toPort: 'top' },
  { from: 'ideation', to: 'prototyping', fromPort: 'bottom', toPort: 'top' },
  { from: 'architecture', to: 'visualDesign', fromPort: 'bottom', toPort: 'top' },
  { from: 'prototyping', to: 'visualDesign', fromPort: 'bottom', toPort: 'top' },

  // Bridge: Develop → Deliver
  { from: 'visualDesign', to: 'testing', fromPort: 'right', toPort: 'left' },

  // Diamond 4: Deliver
  { from: 'testing', to: 'iteration', fromPort: 'bottom', toPort: 'top' },
  { from: 'testing', to: 'documentation', fromPort: 'bottom', toPort: 'top' },
  { from: 'iteration', to: 'deployment', fromPort: 'bottom', toPort: 'top' },
  { from: 'documentation', to: 'deployment', fromPort: 'bottom', toPort: 'top' },
];

// ── Execution Order ─────────────────────────────────────────────────
// Each sub-array runs in parallel, then the next sub-array starts.
// The LLM call happens at the 'visualDesign' step.
export const EXECUTION_ORDER = [
  // Phase 1: Discover
  ['reviews'],
  ['observations', 'primaryResearch'],
  ['deskResearch'],
  // Phase 2: Define
  ['personas'],
  ['userJourney', 'problemStatement'],
  ['insights'],
  // Phase 3: Develop (LLM call at visualDesign)
  ['ideation'],
  ['architecture', 'prototyping'],
  ['visualDesign'],
  // Phase 4: Deliver
  ['testing'],
  ['iteration', 'documentation'],
  ['deployment'],
];

// ── Phase Labels ────────────────────────────────────────────────────
export const PHASE_LABELS = [
  { name: 'DISCOVER', x: 330, y: 30, phase: 1, subtitle: 'Diverge' },
  { name: 'DEFINE', x: 960, y: 30, phase: 2, subtitle: 'Converge' },
  { name: 'DEVELOP', x: 1590, y: 30, phase: 3, subtitle: 'Diverge' },
  { name: 'DELIVER', x: 2220, y: 30, phase: 4, subtitle: 'Converge' },
];

// ── Geometry Helpers ────────────────────────────────────────────────
export function getPortPosition(agent, port) {
  switch (port) {
    case 'top':
      return { x: agent.x + NODE_WIDTH / 2, y: agent.y };
    case 'bottom':
      return { x: agent.x + NODE_WIDTH / 2, y: agent.y + NODE_HEIGHT };
    case 'left':
      return { x: agent.x, y: agent.y + NODE_HEIGHT / 2 };
    case 'right':
      return { x: agent.x + NODE_WIDTH, y: agent.y + NODE_HEIGHT / 2 };
    default:
      return { x: agent.x + NODE_WIDTH / 2, y: agent.y + NODE_HEIGHT / 2 };
  }
}

export function getWirePath(fromPos, toPos, fromPort, toPort) {
  if (fromPort === 'bottom' && toPort === 'top') {
    const dy = Math.abs(toPos.y - fromPos.y);
    const cp = dy * 0.5;
    return `M ${fromPos.x},${fromPos.y} C ${fromPos.x},${fromPos.y + cp} ${toPos.x},${toPos.y - cp} ${toPos.x},${toPos.y}`;
  }
  if (fromPort === 'right' && toPort === 'left') {
    const dx = Math.abs(toPos.x - fromPos.x);
    const cp = dx * 0.4;
    return `M ${fromPos.x},${fromPos.y} C ${fromPos.x + cp},${fromPos.y} ${toPos.x - cp},${toPos.y} ${toPos.x},${toPos.y}`;
  }
  return `M ${fromPos.x},${fromPos.y} L ${toPos.x},${toPos.y}`;
}
