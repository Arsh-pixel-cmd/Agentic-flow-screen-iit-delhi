import React, { useRef, useState } from 'react';
import { X, Download, Copy, FileText, CheckCircle2 } from 'lucide-react';
import { useWorkflowStore } from '../lib/store';
import { WORKFLOW_PHASES } from '../data/schema';
import { callLLM } from '../lib/llm';

interface OutputScreenProps {
  isOpen: boolean;
  onClose: () => void;
  phaseFilter?: string; // If set, only show results for this phase ID
}

const OutputScreen = ({ isOpen, onClose, phaseFilter }: OutputScreenProps) => {
  const contentRef = useRef(null);
  const nodeResults = useWorkflowStore((state: any) => state.nodeResults);
  const projectPrompt = useWorkflowStore((state: any) => state.projectPrompt);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Determine which phases to render
  const visiblePhases = phaseFilter
    ? WORKFLOW_PHASES.filter(p => p.id === phaseFilter)
    : WORKFLOW_PHASES;
  
  const phaseTitle = phaseFilter
    ? (WORKFLOW_PHASES.find(p => p.id === phaseFilter)?.label || phaseFilter) + ' Phase Report'
    : 'Full Strategic Briefing';

  // ── Detect builder pipeline results (non-standard keys) ──
  const standardKeys = new Set<string>();
  WORKFLOW_PHASES.forEach(phase => {
    phase.categories.forEach(c => standardKeys.add(`${phase.id}::${c}`));
  });
  const builderResults = Object.entries(nodeResults || {})
    .filter(([key]) => !standardKeys.has(key))
    .map(([id, result]) => ({ id, result: result as any }));
  const hasBuilderResults = builderResults.length > 0;

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const printWindow = window.open('', '', 'width=800,height=800');
    if (!printWindow) {
      alert("Please allow popups to generate the PDF.");
      setIsDownloading(false);
      return;
    }

    try {
      // 1. Loading screen in print window to bypass popup blockers
      printWindow.document.write(`
        <html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; background:#fafafa; color:#111; text-align:center; flex-direction:column;">
          <h2 style="font-weight:900; letter-spacing:-0.5px;">Synthesizing Strategic Briefing...</h2>
          <p style="color:#666; max-width:400px; line-height:1.6;">Our Senior Research Analyst is currently deduplicating outputs, extracting insights, and rendering Mermaid.js architecture diagrams. This may take 15-30 seconds.</p>
        </body></html>
      `);

      // 2. Gather raw output (scoped to phaseFilter if set)
      let rawOutputs = visiblePhases.map(phase => {
        const phaseNodes = phase.categories.map(c => `${phase.id}::${c}`);
        const content = phaseNodes.map(nId => nodeResults[nId]?.content).filter(Boolean).join('\\n\\n');
        return content ? `=== ${phase.label.toUpperCase()} ===\n${content}` : '';
      }).filter(Boolean).join('\\n\\n---\\n\\n');

      // Include builder pipeline results if present
      if (hasBuilderResults) {
        const builderContent = builderResults
          .map(({ id, result }) => result?.content ? `[Agent: ${id}]\n${result.content}` : '')
          .filter(Boolean)
          .join('\\n\\n');
        if (builderContent) {
          rawOutputs = rawOutputs ? `${rawOutputs}\\n\\n---\\n\\n=== CUSTOM PIPELINE ===\n${builderContent}` : `=== CUSTOM PIPELINE ===\n${builderContent}`;
        }
      }

      // 3. Synthesis Prompt (scoped)
      const synthesisPrompt = `
Act as a Senior Research Analyst. I am providing you with output from a multi-agent pipeline regarding '${projectPrompt || 'the provided topic'}' — specifically the ${phaseTitle}.

Your Task:
1. Strip the Metadata: Remove all 'System Initialized,' 'Sequence Complete,' and technical log headers.
2. Deduplicate: Merge repeated definitions into one concise 'Core Concept' section.
3. Extract Insights: Create a high-fidelity HTML table comparing key findings.
4. Visual Architecture: Where relevant, convert architecture logs into a clean Mermaid.js sequence diagram. YOU MUST USE EXACTLY THIS FORMAT: <div class="mermaid">sequenceDiagram ...</div>. 
CRITICAL RULE: DO NOT wrap the mermaid code in markdown ticks. DO NOT use special characters inside Mermaid node names.
5. Output HTML: You MUST output the entire briefing as clean HTML. Do NOT use markdown \`\`\`html blocks. Just output raw HTML tags.

RAW OUTPUT:
${rawOutputs}
      `;

      // 4. Call LLM
      const agent = { name: 'Senior Research Analyst', role: 'Synthesize data into an Executive Briefing' };
      const response = await callLLM(synthesisPrompt, agent, '');
      let synthesizedHtml = response.content || '';
      
      // Clean up potential markdown formatting (including nested mermaid blocks)
      synthesizedHtml = synthesizedHtml.replace(/^\`\`\`html/, '');
      synthesizedHtml = synthesizedHtml.replace(/^\`\`\`/, '');
      synthesizedHtml = synthesizedHtml.replace(/\`\`\`$/, '');
      synthesizedHtml = synthesizedHtml.replace(/\`\`\`mermaid\\n?/g, '');
      synthesizedHtml = synthesizedHtml.replace(/\`\`\`/g, '');

      // 5. Build final printable HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Agentic Flow - Strategic Briefing</title>
            <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
            <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
            <style>
              @page { size: A4 portrait; margin: 20mm; }
              * { color: #000 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
              body { padding: 40px; background: #fff !important; line-height: 1.6; max-width: 900px; margin: 0 auto; }
              h1 { font-size: 32px; font-weight: 900; text-transform: uppercase; border-bottom: 4px solid #000; padding-bottom: 10px; }
              h2 { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-top: 40px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; font-size: 13px; border: 1px solid #000; }
              th, td { border: 1px solid #000; padding: 12px; text-align: left; }
              th { font-weight: bold; text-transform: uppercase; }
              .mermaid { display: flex; justify-content: center; margin: 40px 0; }
              .header-meta { font-family: monospace !important; font-size: 12px; margin-bottom: 30px; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div class="header-meta">
              <strong>REPORT:</strong> Full Pipeline Execution & Strategic Briefing<br>
              <strong>TOPIC:</strong> ${projectPrompt || 'Pipeline Execution'}<br>
              <strong>DATE:</strong> ${new Date().toLocaleDateString()}
            </div>
            
            <h1>Part 1: Raw Agent Output</h1>
            ${WORKFLOW_PHASES.map((phase, pIdx) => {
              const phaseNodes = phase.categories.map(c => `${phase.id}::${c}`);
              const phaseResults = phaseNodes
                .map(nId => ({ id: nId, result: nodeResults[nId] }))
                .filter(({ result }) => result);

              if (phaseResults.length === 0) return '';
              
              return `
                <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; color: #444 !important;">${pIdx + 1}. ${phase.label}</h2>
                ${phaseResults.map(({ id, result }) => {
                  const agentName = id.split('::')[1]?.replace(/-/g, ' ');
                  return `
                    <div style="border: 1px solid #ddd; border-radius: 8px; margin-top: 15px; padding: 20px; page-break-inside: avoid;">
                      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">Agent: ${agentName}</div>
                      ${result.content ? `<pre style="white-space: pre-wrap; font-family: inherit; font-size: 13px;">${result.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>` : ''}
                    </div>
                  `;
                }).join('')}
              `;
            }).join('')}

            <div style="page-break-before: always;"></div>
            <h1>Part 2: Executive Strategic Briefing</h1>
            ${synthesizedHtml}
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for Mermaid to render before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsDownloading(false);
      }, 2000);

    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Failed to generate synthesized PDF.");
      setIsDownloading(false);
      if (printWindow) printWindow.close();
    }
  };

  const handleCopyAll = () => {
    let allContent = WORKFLOW_PHASES.map(phase => {
      const phaseNodes = phase.categories.map(c => `${phase.id}::${c}`);
      const nodeOutputs = phaseNodes
        .map(nId => nodeResults[nId]?.content)
        .filter(Boolean)
        .join('\n\n');
      return nodeOutputs ? `## ${phase.label}\n${nodeOutputs}` : '';
    }).filter(Boolean).join('\n\n---\n\n');

    // Include builder pipeline results
    if (hasBuilderResults) {
      const builderContent = builderResults
        .map(({ id, result }) => result?.content ? `### Agent: ${id}\n${result.content}` : '')
        .filter(Boolean)
        .join('\n\n');
      if (builderContent) {
        allContent = allContent ? `${allContent}\n\n---\n\n## Custom Pipeline\n${builderContent}` : `## Custom Pipeline\n${builderContent}`;
      }
    }

    navigator.clipboard.writeText(allContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalResults = Object.keys(nodeResults).length;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center modal-overlay"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col modal-content"
        style={{
          background: 'linear-gradient(180deg, #0c0c14 0%, #050508 100%)',
          border: '1px solid rgba(162, 89, 255, 0.2)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.9), 0 0 80px rgba(162,89,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-black/40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#DEF767]/10 border border-[#DEF767]/20">
              <FileText size={18} className="text-[#DEF767]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">{phaseTitle}</h2>
              <p className="text-[10px] text-slate-500 font-secondary mt-0.5 tracking-wide uppercase">
                {totalResults} agent{totalResults !== 1 ? 's' : ''} completed • {projectPrompt?.substring(0, 50)}{projectPrompt?.length > 50 ? '...' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              {copied ? <><CheckCircle2 size={14} className="text-[#DEF767]" /> Copied</> : <><Copy size={14} /> Copy All</>}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A259FF] to-[#46B1FF] text-white text-xs font-bold uppercase tracking-wider transition-opacity shadow-lg shadow-[#A259FF]/20 ${isDownloading ? 'opacity-50 cursor-wait' : 'hover:opacity-80'}`}
            >
              <Download size={14} className={isDownloading ? "animate-bounce" : ""} /> 
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              title="Close Output Screen"
              className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div ref={contentRef} className="p-8 space-y-10" style={{ background: '#0a0a10', color: '#e2e8f0' }}>
            {/* Title Section for PDF */}
            <div className="text-center pb-6 border-b border-white/[0.04]">
              <h1 className="text-3xl font-black text-white font-display tracking-tight mb-2">Agentic Flow — {phaseTitle}</h1>
              <p className="text-sm text-slate-400 font-secondary">{projectPrompt}</p>
              <p className="text-[10px] text-slate-600 mt-2 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Phase by Phase Results — filtered if phaseFilter is set */}
            {visiblePhases.map((phase, pIdx) => {
              const phaseNodes = phase.categories.map(c => `${phase.id}::${c}`);
              const phaseResults = phaseNodes
                .map(nId => ({ id: nId, result: nodeResults[nId] }))
                .filter(({ result }) => result);

              if (phaseResults.length === 0) return null;

              const PHASE_ACCENT = {
                discover: '#46B1FF',
                define: '#CEA3FF',
                develop: '#A259FF',
                deliver: '#DEF767',
              };
              const accent = PHASE_ACCENT[phase.id as keyof typeof PHASE_ACCENT] || '#A259FF';

              return (
                <div key={phase.id} className="space-y-6">
                  {/* Phase Header */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black text-black" style={{ background: accent }}>
                      {pIdx + 1}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white uppercase tracking-[0.15em] font-display">{phase.label}</h2>
                      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: accent }}>{phase.subtitle}</p>
                    </div>
                    <div className="flex-1 h-px ml-4" style={{ background: `linear-gradient(to right, ${accent}40, transparent)` }} />
                  </div>

                  {/* Agent Results */}
                  <div className="grid gap-4">
                    {phaseResults.map(({ id, result }) => {
                      const agentName = id.split('::')[1]?.replace(/-/g, ' ');
                      return (
                        <div
                          key={id}
                          className="rounded-2xl overflow-hidden"
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div className="px-5 py-3 flex items-center gap-3 border-b border-white/[0.04]" style={{ background: 'rgba(0,0,0,0.3)' }}>
                            <div className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">{agentName}</span>
                          </div>

                          {/* Content Output */}
                          {result.content && (
                            <div className="px-5 py-4">
                              <pre className="text-xs text-slate-300 leading-relaxed font-secondary whitespace-pre-wrap break-words">{result.content}</pre>
                            </div>
                          )}

                          {result.ui && (
                            <div className="px-5 py-4 border-t border-white/[0.03]">
                              <div className="text-[9px] text-[#A259FF] uppercase font-bold tracking-widest mb-3">Rendered UI Asset</div>
                              <iframe 
                                srcDoc={`
                                  <!DOCTYPE html>
                                  <html>
                                    <head>
                                      <meta charset="utf-8">
                                      <style>
                                        body { margin: 0; padding: 0; background: transparent; color-scheme: dark; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                                        ::-webkit-scrollbar { width: 6px; height: 6px; }
                                        ::-webkit-scrollbar-track { background: transparent; }
                                        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                                        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                                      </style>
                                    </head>
                                    <body>
                                      ${result.ui}
                                    </body>
                                  </html>
                                `}
                                className="w-full h-[400px] border-0 bg-transparent rounded-xl" 
                                sandbox="allow-scripts" 
                                title={`Output for ${agentName}`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* ── Builder Pipeline Results (non-standard node IDs) ── */}
            {hasBuilderResults && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black text-black" style={{ background: '#DEF767' }}>
                    ★
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.15em] font-display">Custom Pipeline Results</h2>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#DEF767]">Builder-generated agents</p>
                  </div>
                  <div className="flex-1 h-px ml-4" style={{ background: 'linear-gradient(to right, #DEF76740, transparent)' }} />
                </div>

                <div className="grid gap-4">
                  {builderResults.map(({ id, result }) => {
                    if (!result) return null;
                    // Try to extract a human-readable agent name from the result metadata
                    const agentName = result.agentName || id;
                    return (
                      <div
                        key={id}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="px-5 py-3 flex items-center gap-3 border-b border-white/[0.04]" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: '#DEF767', boxShadow: '0 0 8px #DEF767' }} />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">{agentName}</span>
                        </div>

                        {result.content && (
                          <div className="px-5 py-4">
                            <pre className="text-xs text-slate-300 leading-relaxed font-secondary whitespace-pre-wrap break-words">{result.content}</pre>
                          </div>
                        )}

                        {result.ui && (
                          <div className="px-5 py-4 border-t border-white/[0.03]">
                            <div className="text-[9px] text-[#A259FF] uppercase font-bold tracking-widest mb-3">Rendered UI Asset</div>
                            <iframe 
                              srcDoc={`
                                <!DOCTYPE html>
                                <html>
                                  <head>
                                    <meta charset="utf-8">
                                    <style>
                                      body { margin: 0; padding: 0; background: transparent; color-scheme: dark; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                                    </style>
                                  </head>
                                  <body>${result.ui}</body>
                                </html>
                              `}
                              className="w-full h-[400px] border-0 bg-transparent rounded-xl" 
                              sandbox="allow-scripts" 
                              title={`Output for ${agentName}`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer for PDF */}
            <div className="text-center pt-8 border-t border-white/[0.04]">
              <p className="text-[9px] text-slate-600 uppercase tracking-[0.3em]">Generated by Agentic Flow • Neuro-Agentic Systems</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputScreen;
