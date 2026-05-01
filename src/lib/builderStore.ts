import { create } from 'zustand';
import { supabase } from './supabaseClient';

const generateId = () => `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export interface BuilderStore {
  viewMode: string;
  setViewMode: (mode: string) => void;
  blocks: any[];
  connections: any[];
  stickyNotes: any[];
  textLabels: any[];
  templates: any[];
  nodeStatus: Record<string, string>;
  nodeResults: Record<string, any>;
  setNodeStatus: (id: string, status: string) => void;
  setNodeResult: (id: string, result: any) => void;
  resetExecution: () => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  addTextLabel: (position: any) => void;
  updateTextLabel: (id: string, text: string) => void;
  deleteTextLabel: (id: string) => void;
  addBlock: (position?: any) => void;
  updateBlock: (id: string, updates: any) => void;
  deleteBlock: (id: string) => void;
  connectBlocks: (sourceId: string, targetId: string, sourcePort: string, targetPort: string) => void;
  deleteConnection: (id: string) => void;
  addStickyNote: (position?: any) => void;
  updateStickyNote: (id: string, updates: any) => void;
  deleteStickyNote: (id: string) => void;
  clearAnnotations: () => void;
  deployedTemplateId: string | null;
  setTemplates: (templates: any[]) => void;
  deployProject: (name?: string) => Promise<void>;
  saveAsTemplate: (name?: string) => Promise<void>;
  applyTemplate: (templateId: string) => void;
  updateTemplate: (id: string, updates: any) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  viewMode: 'pipeline', // 'pipeline' | 'builder' | 'templates'
  setViewMode: (mode: any) => set({ viewMode: mode, selectedElementId: null }),

  blocks: [],
  connections: [],
  stickyNotes: [],
  textLabels: [],
  templates: [],
  
  nodeStatus: {}, // id -> 'idle'|'running'|'success'|'error'
  nodeResults: {}, // id -> output

  setNodeStatus: (id: any, status: any) => set(state => ({ nodeStatus: { ...state.nodeStatus, [id]: status } })),
  setNodeResult: (id: any, result: any) => set(state => ({ nodeResults: { ...state.nodeResults, [id]: result } })),
  resetExecution: () => set(state => {
    const emptyStatus: Record<string, string> = {};
    state.blocks.forEach(b => { emptyStatus[b.id] = 'idle'; });
    return { nodeStatus: emptyStatus, nodeResults: {} };
  }),

  selectedElementId: null,
  setSelectedElementId: (id: any) => set({ selectedElementId: id }),

  // --- TEXT LABELS ---
  addTextLabel: (position: any) => set((state) => ({
    textLabels: [...state.textLabels, { id: generateId(), text: '', x: position.x, y: position.y }]
  })),
  updateTextLabel: (id: any, text: any) => set((state) => ({
    textLabels: state.textLabels.map(l => l.id === id ? { ...l, text } : l)
  })),
  deleteTextLabel: (id: any) => set((state) => ({
    textLabels: state.textLabels.filter(l => l.id !== id)
  })),

  // --- BLOCKS ---
  addBlock: (position: any) => {
    const newBlock = {
      id: generateId(),
      name: 'New Agent',
      description: 'Describe the agent objective...',
      apiKey: '',
      phase: 'discover', // default phase for agent buckets
      waitConfig: { type: 'none', delay: 0 },
      triggerConfig: { type: 'manual' },
      position: position || { 
        x: 400 + (Math.random() * 200), 
        y: 400 + (Math.random() * 200) 
      },
    };
    set((state) => ({
      blocks: [...state.blocks, newBlock],
      selectedElementId: newBlock.id
    }));
  },
  
  updateBlock: (id: any, updates: any) => set((state) => ({
    blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
  })),

  deleteBlock: (id: any) => set((state) => ({
    blocks: state.blocks.filter(b => b.id !== id),
    connections: state.connections.filter(c => c.sourceBlockId !== id && c.targetBlockId !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),

  // --- CONNECTIONS ---
  connectBlocks: (sourceId: any, targetId: any, sourcePort: any, targetPort: any) => set((state) => {
    // Prevent duplicate or self connections
    if (sourceId === targetId) return state;
    if (state.connections.find(c => c.sourceBlockId === sourceId && c.targetBlockId === targetId && c.sourcePort === sourcePort && c.targetPort === targetPort)) {
       return state;
    }
    return {
      connections: [...state.connections, { id: generateId(), sourceBlockId: sourceId, targetBlockId: targetId, sourcePort, targetPort }]
    };
  }),

  deleteConnection: (id: any) => set((state) => ({
    connections: state.connections.filter(c => c.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),

  // --- STICKY NOTES ---
  addStickyNote: (position: any) => {
    const newNote = {
      id: generateId(),
      text: '',
      color: '#A259FF',
      position: position || { 
        x: 400 + (Math.random() * 200), 
        y: 400 + (Math.random() * 200) 
      }
    };
    set((state) => ({
      stickyNotes: [...state.stickyNotes, newNote],
      selectedElementId: `sticky-${newNote.id}`
    }));
  },

  updateStickyNote: (id: any, updates: any) => set((state) => ({
    stickyNotes: state.stickyNotes.map(n => n.id === id ? { ...n, ...updates } : n)
  })),

  deleteStickyNote: (id: any) => set((state) => ({
    stickyNotes: state.stickyNotes.filter(n => n.id !== id),
    selectedElementId: state.selectedElementId === `sticky-${id}` ? null : state.selectedElementId
  })),

  clearAnnotations: () => set({ stickyNotes: [] }),

  // --- TEMPLATES & PIPELINE DEPLOYMENT ---
  deployedTemplateId: null,

  setTemplates: (templates: any) => set({ templates }),

  deployProject: async (name: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("Must be logged in to deploy!");

      const state = get();
      const newTemplate = {
          user_id: session.user.id,
          name: name || 'Untitled Template',
          blocks: JSON.parse(JSON.stringify(state.blocks)),
          connections: JSON.parse(JSON.stringify(state.connections)),
          is_template: true,
          status: 'active',
          generated_from: 'builder'
      };

      try {
        const { data, error } = await supabase
          .from('templates')
          .insert([newTemplate])
          .select()
          .single();

        if (error) throw error;
        
        set((state) => ({
            templates: [...state.templates, data],
            deployedTemplateId: data.id
        }));
      } catch (err) {
        console.error("Failed to deploy template", err);
      }
  },

  saveAsTemplate: async (name: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const state = get();
      
      const newTemplate = {
          user_id: session.user.id,
          name: name || 'Untitled Template',
          blocks: JSON.parse(JSON.stringify(state.blocks)),
          connections: JSON.parse(JSON.stringify(state.connections)),
          is_template: true,
          status: 'active',
          generated_from: 'builder'
      };
      const { data } = await supabase.from('templates').insert([newTemplate]).select().single();
      if (data) {
         set(state => ({ templates: [...state.templates, data] }));
      }
  },

  applyTemplate: (templateId: any) => set((state) => {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return state;
    
    // We should regenerate IDs so we don't conflict. 
    // For simplicity, we just clone blocks with new IDs and update connections
    const idMap: Record<string, string> = {};
    const newBlocks = template.blocks.map((b: any) => {
      const newId = generateId();
      idMap[b.id] = newId;
      return { ...b, id: newId };
    });
    
    const newConns = template.connections.map((c: any) => ({
      id: generateId(),
      sourceBlockId: idMap[c.sourceBlockId] || c.sourceBlockId, 
      targetBlockId: idMap[c.targetBlockId] || c.targetBlockId
    }));

    return {
      blocks: newBlocks,
      connections: newConns,
      stickyNotes: [],
      selectedElementId: null,
      viewMode: 'builder' // switch to builder automatically
    };
  }),
  
  updateTemplate: async (id: any, updates: any) => {
    set((state) => ({
      templates: state.templates.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
    await supabase.from('templates').update(updates).eq('id', id);
  },

  deleteTemplate: async (id: any) => {
    set((state) => ({
      templates: state.templates.filter(t => t.id !== id)
    }));
    await supabase.from('templates').delete().eq('id', id);
  }
}));
