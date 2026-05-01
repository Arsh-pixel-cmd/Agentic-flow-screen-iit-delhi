import { UX_CATEGORIES } from '../data/schema';

// Explicit literal mapping for the 16 nodes to geometrically form Two Diamonds.
const DIAMOND_COORDS = {
  // --- DIAMOND 1: DISCOVER (Diverging) --- (Spans 500)
  "discover::reviews": { x: 0, y: 0, colIndex: 0 },
  "discover::observations": { x: 250, y: -180, colIndex: 1 },
  "discover::primary-research": { x: 250, y: 180, colIndex: 1 },
  "discover::secondary-research": { x: 500, y: -360, colIndex: 2 },
  "discover::technology-channels": { x: 500, y: 360, colIndex: 2 },
  
  // --- DIAMOND 1: DEFINE (Converging) --- (Starts with 300 gap)
  "define::architecture": { x: 800, y: -180, colIndex: 3 },
  "define::persuasion": { x: 800, y: 180, colIndex: 3 },
  "define::ux-flow": { x: 1050, y: 0, colIndex: 4 }, // Hub Node

  // --- DIAMOND 2: DEVELOP (Diverging) --- (Starts with 300 gap)
  "develop::screens": { x: 1350, y: -180, colIndex: 5 },
  "develop::images-text": { x: 1350, y: 180, colIndex: 5 },
  "develop::interactions": { x: 1600, y: -360, colIndex: 6 },
  "develop::navigations": { x: 1600, y: 360, colIndex: 6 },

  // --- DIAMOND 2: DELIVER (Converging) --- (Starts with 300 gap)
  "deliver::expert-review": { x: 1900, y: -180, colIndex: 7 },
  "deliver::usability-test": { x: 1900, y: 180, colIndex: 7 },
  "deliver::brand-test": { x: 2150, y: -360, colIndex: 8 }, // Tapered off angle
  "deliver::ux-test": { x: 2150, y: 0, colIndex: 8 }, // Final Convergence point
};

// eslint-disable-next-line no-unused-vars
export const computeLayout = (_mode: any = 'desktop', _containerWidth: any, containerHeight: any) => {
  const nodeRegistry: Record<string, any> = {};
  
  const h = containerHeight || 800;
  const centerY = h / 2;

  // Render exactly the hardcoded visual diamond.
  (Object.keys(DIAMOND_COORDS) as Array<keyof typeof DIAMOND_COORDS>).forEach((nodeId) => {
    const coords = DIAMOND_COORDS[nodeId];
    const catId = nodeId.split('::')[1] || '';
    const phaseId = nodeId.split('::')[0] || '';

    nodeRegistry[nodeId] = {
      id: nodeId,
      x: coords.x + 300, // global X shift
      y: centerY + coords.y,
      phase: phaseId,
      category: (UX_CATEGORIES as any)[catId],
      colIndex: coords.colIndex
    };
  });

  return nodeRegistry;
};
