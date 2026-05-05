import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createServer } from 'http';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ── SUPABASE CLIENT ──────────────────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Server] Supabase credentials missing! API Key storage may fail.');
}
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

// ── ENCRYPTION & KEY MANAGEMENT (AES-256-GCM) ──────────────────────
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'agentic-flow-default-secret-change-in-production!!';

function deriveKey(secret) {
  return crypto.scryptSync(secret, 'agentic-flow-salt', 32);
}

function encryptKey(text) {
  const key = deriveKey(ENCRYPTION_SECRET);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { encrypted, iv: iv.toString('hex'), authTag };
}

function decryptKey(encData) {
  const key = deriveKey(ENCRYPTION_SECRET);
  const iv = Buffer.from(encData.iv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(encData.authTag, 'hex'));
  let decrypted = decipher.update(encData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function getStoredKey(userId, projectId = 'global') {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('user_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();
  if (error || !data) return null;
  return data;
}

async function saveStoredKey(userId, projectId, encryptedData, lastFour) {
  const { error } = await supabase
    .from('user_keys')
    .upsert({
      user_id: userId,
      project_id: projectId,
      encrypted: encryptedData.encrypted,
      iv: encryptedData.iv,
      auth_tag: encryptedData.authTag,
      last_four: lastFour,
      saved_at: new Date().toISOString()
    }, { onConflict: 'user_id, project_id' });
  if (error) throw new Error(error.message);
}

async function deleteStoredKey(userId, projectId = 'global') {
  const { error } = await supabase
    .from('user_keys')
    .delete()
    .eq('user_id', userId)
    .eq('project_id', projectId);
  if (error) throw new Error(error.message);
}

/**
 * Resolve the API key for a user.
 * Priority: project-stored encrypted key > global-stored encrypted key > fallback key from client.
 */
async function resolveApiKey(userId, sequenceId, fallbackKey) {
  if (userId) {
    // 1. Try project-scoped key
    if (sequenceId) {
      const pData = await getStoredKey(userId, sequenceId);
      if (pData) {
        try { 
          return decryptKey({ encrypted: pData.encrypted, iv: pData.iv, authTag: pData.auth_tag }); 
        } catch (err) { console.error('[Server] Project key decryption failed:', err.message); }
      }
    }

    // 2. Try global key
    const gData = await getStoredKey(userId, 'global');
    if (gData) {
      try { 
        return decryptKey({ encrypted: gData.encrypted, iv: gData.iv, authTag: gData.auth_tag }); 
      } catch (err) { console.error('[Server] Global key decryption failed:', err.message); }
    }
  }
  return fallbackKey || process.env.VITE_OPENROUTER_API_KEY_1 || process.env.VITE_GROQ_API_KEY_1 || process.env.VITE_OPENROUTER_API_KEY_2 || '';
}

// ── UNIVERSAL GATEWAY PROTOCOL ──────────────────────────────────────
function determineProvider(key, requestedModel) {
  if (key.startsWith('sk-or-')) {
    return { url: 'https://openrouter.ai/api/v1/chat/completions', defaultModel: requestedModel || 'openrouter/auto' };
  } else if (key.startsWith('sk-ant-')) {
    return { url: 'https://api.anthropic.com/v1/messages', defaultModel: requestedModel || 'claude-3-5-sonnet-20240620' };
  } else if (key.startsWith('gsk_')) {
    return { url: 'https://api.groq.com/openai/v1/chat/completions', defaultModel: requestedModel || 'llama-3.3-70b-versatile' };
  } else if (key.startsWith('xai-')) {
    return { url: 'https://api.x.ai/v1/chat/completions', defaultModel: requestedModel || 'grok-beta' };
  } else if (key.startsWith('AIzaSy')) {
    return { url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', defaultModel: requestedModel || 'gemini-2.0-flash' };
  } else if (key.startsWith('sk-')) {
    return { url: 'https://api.openai.com/v1/chat/completions', defaultModel: requestedModel || 'gpt-4o' };
  }
  
  return { url: 'https://openrouter.ai/api/v1/chat/completions', defaultModel: requestedModel || 'openrouter/auto' };
}

// ── KEY MANAGEMENT ENDPOINTS ────────────────────────────────────────

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Save (or replace) an API key — encrypted at rest
app.post('/api/keys/save', async (req, res) => {
  const { userId, apiKey } = req.body;
  if (!userId || !apiKey) {
    return res.status(400).json({ error: 'userId and apiKey are required.' });
  }

  try {
    const trimmed = apiKey.trim();
    const encryptedData = encryptKey(trimmed);
    const lastFour = trimmed.slice(-4);
    
    await saveStoredKey(userId, 'global', encryptedData, lastFour);
    console.log(`[Server] ✓ API key saved for user ${userId.substring(0, 8)}...`);
    res.json({ success: true, lastFour });
  } catch (err) {
    console.error('[Server] Failed to save key:', err.message);
    res.status(500).json({ error: 'Failed to encrypt and save the key.' });
  }
});

// Check if a key exists for a user (never returns the actual key)
app.get('/api/keys/status/:userId', async (req, res) => {
  const { userId } = req.params;
  const entry = await getStoredKey(userId, 'global');
  if (!entry) return res.json({ hasKey: false });
  res.json({ hasKey: true, lastFour: entry.last_four || '****', savedAt: entry.saved_at });
});

app.get('/api/keys/project-status/:userId/:sequenceId', async (req, res) => {
  const { userId, sequenceId } = req.params;
  const entry = await getStoredKey(userId, sequenceId);
  if (!entry) return res.json({ hasKey: false });
  res.json({ hasKey: true, lastFour: entry.last_four || '****' });
});

app.post('/api/keys/save-project', async (req, res) => {
  const { userId, sequenceId, apiKey } = req.body;
  if (!userId || !sequenceId || !apiKey) return res.status(400).json({ error: 'Missing data' });

  try {
    const encrypted = encryptKey(apiKey);
    const lastFour = apiKey.slice(-4);
    await saveStoredKey(userId, sequenceId, encrypted, lastFour);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a stored key
app.delete('/api/keys/:userId', async (req, res) => {
  try {
    await deleteStoredKey(req.params.userId, 'global');
    console.log(`[Server] ✗ API key deleted for user ${req.params.userId.substring(0, 8)}...`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/keys/project/:userId/:sequenceId', async (req, res) => {
  const { userId, sequenceId } = req.params;
  try {
    await deleteStoredKey(userId, sequenceId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify a stored key works by making a lightweight test call
app.post('/api/keys/verify', async (req, res) => {
  const { userId, apiKey: explicitKey } = req.body;
  if (!userId && !explicitKey) return res.status(400).json({ error: 'userId or apiKey is required.' });

  // Use explicitKey if provided (for pre-save validation), otherwise fetch from DB
  const apiKey = explicitKey || await resolveApiKey(userId, null, null);
  if (!apiKey) return res.json({ valid: false, reason: 'No key stored.' });

  const { url, defaultModel } = determineProvider(apiKey, null);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey.startsWith('sk-ant-')) {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: defaultModel,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('[Verify Error] Status:', response.status, 'Response:', errorText);
      return res.json({ valid: false, statusCode: response.status, reason: `Provider Error (${response.status}): ${errorText.substring(0, 100)}` });
    }
    
    res.json({ valid: true, statusCode: response.status });
  } catch (err) {
    console.log('[Verify Exception]', err.message);
    res.json({ valid: false, reason: err.message });
  }
});

app.post('/api/models', async (req, res) => {
  const { userId, apiKey: explicitKey } = req.body;
  if (!userId && !explicitKey) return res.status(400).json({ error: 'userId or apiKey is required.' });

  const apiKey = explicitKey || await resolveApiKey(userId, null, null);
  if (!apiKey) return res.json({ models: [] });

  const { url } = determineProvider(apiKey, null);
  
  try {
    if (apiKey.startsWith('sk-ant-')) {
      return res.json({ models: [
        { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
      ]});
    }
    if (apiKey.startsWith('AIzaSy')) {
      return res.json({ models: [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
        { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro Experimental' }
      ]});
    }

    const modelsUrl = url.replace('/chat/completions', '/models');
    
    const response = await fetch(modelsUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Provider returned ${response.status}`);

    const data = await response.json();
    let models = [];
    if (data && data.data && Array.isArray(data.data)) {
      models = data.data.map(m => ({ id: m.id, name: m.name || m.id }));
      models.sort((a, b) => a.id.localeCompare(b.id));
    }

    res.json({ models });
  } catch (err) {
    console.error('[Server] Failed to fetch models:', err.message);
    res.json({ models: [] });
  }
});

// ── LLM EXECUTION ENDPOINT ─────────────────────────────────────────

app.post('/api/llm', async (req, res) => {
  const { userTask, agent, neuralContext, activeKey, userId, sequenceId, requestedModel } = req.body;

  console.log(`[Server] Incoming request for agent: ${agent?.name || 'unknown'}, phase: ${agent?.phaseLabel || 'unknown'}`);

  // Resolve key: project > global > client-provided
  const resolvedKey = await resolveApiKey(userId, sequenceId, activeKey);

  if (!resolvedKey) {
    return res.status(401).json({
      _errorType: 'NO_KEY',
      content: 'No API key configured. Please add a key for this project or globally.',
      ui: `<div style="padding:32px;font-family:Outfit,sans-serif;background:rgba(10,10,15,0.8);backdrop-filter:blur(16px);border-radius:24px;border:1px solid rgba(255,255,255,0.08);color:#fff;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#A259FF,#46B1FF);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px;box-shadow:0 8px 32px rgba(162,89,255,0.3)">⚡</div>
          <h2 style="font-size:24px;font-weight:800;margin:0;letter-spacing:-0.5px">Gateway Authentication Required</h2>
        </div>
        <p style="color:#8b949e;font-size:15px;line-height:1.7;margin:0">No API key found. Please add your key to proceed.</p>
      </div>`,
    });
  }

  const { url, defaultModel } = determineProvider(resolvedKey, requestedModel);
  console.log(`[Server] Routing to provider: ${url} with model: ${defaultModel}`);

  // ── NODE EXECUTION & DELIVERY (DOUBLE DIAMOND PROTOCOL) ─────────
  let productSpec = "Provide deep expert analysis and structured technical output. Avoid placeholders.";
  const phaseTitle = (agent.phaseLabel || agent.categoryName || '').toUpperCase();
  
  if (phaseTitle.includes('DISCOVER') || phaseTitle.includes('RESEARCH')) {
    productSpec = `* Phase: [DISCOVER] - Research & Exploration
* Deliverable: Deep-dive market sentiment analysis, competitor feature mapping, and user persona profiling. 
* Context: Search for real-world trends. Create a sophisticated comparison matrix in the UI.`;
  } else if (phaseTitle.includes('DEFINE') || phaseTitle.includes('ARCHITECTURE')) {
    productSpec = `* Phase: [DEFINE] - Synthesis & Technical Strategy
* Deliverable: Comprehensive system architecture, data flow diagrams (Mermaid.js), and technical specifications. 
* Context: Define actual technical stacks and integration logic. Include Mermaid syntax.`;
  } else if (phaseTitle.includes('DEVELOP') || phaseTitle.includes('BUILD')) {
    productSpec = `* Phase: [DEVELOP] - Ideation & Prototype Creation
* Deliverable: Production-ready Tailwind CSS code, React component structures, or complex logic handlers. 
* Context: Write actual functional code blocks. Deliver extreme technical depth.`;
  } else if (phaseTitle.includes('DELIVER') || phaseTitle.includes('DEPLOY')) {
    productSpec = `* Phase: [DELIVER] - Finalization & Deployment Plan
* Deliverable: Deployment manifest, CI/CD pipeline strategy, and final Project Summary for stakeholders. 
* Context: Provide actual cloud deployment steps (AWS/Vercel/GCP) based on the architecture.`;
  }

  const systemPrompt = `You are a specialized worker in the "Agentic Flow" Engine.
CORE MISSION: Transform visual nodes into functional workers that deliver high-fidelity products.
Tone: Professional, futuristic, and efficient. Start your analysis with "[System Initialized: ${agent.name || 'Component'} Sequence]".

YOUR DIRECTIVE:
${productSpec}

${neuralContext ? `PREVIOUS NEURAL BRIDGE DATA:\n${neuralContext}\n\nBuild upon this previous context.` : ''}

RESPONSE FORMAT — Return a valid JSON object with exactly two keys:
{
  "content": "Your complete text output based on the Node Deliverable Spec. Include status like [Sequence Complete] at the end.",
  "ui": "A self-contained HTML component that renders your output beautifully. Use ONLY valid HTML tags with inline styles. DO NOT USE MARKDOWN. NO **bold**, NO ## headers. Use <strong>, <h1>, <ul>, etc.
         Midnight Luxe Design System:
         - Backgrounds: Deep black (#000000) or high-gloss navy-black (#0a0a0f). Use glassmorphism (backdrop-filter: blur(16px), background: rgba(255,255,255,0.02)).
         - Accents: Electric Purple (#A259FF), Azure Blue (#46B1FF), Lime Green (#DEF767).
         - Borders: 1px solid rgba(255,255,255,0.08).
         - Typography: Headers use 'Syne, sans-serif', body uses 'Outfit, sans-serif'.
         - Tables: Render any tables as beautiful HTML <table> elements."
}
CRITICAL: Return ONLY the raw JSON object. No markdown fences. NO Markdown syntax in the UI field.`;

  try {
    console.log(`[Server] Sending request to LLM provider...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resolvedKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Agentic Flow Express Server',
      },
      body: JSON.stringify({
        model: defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userTask || 'Begin execution sequence.' },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error(`[Server] Provider Error: ${response.status} ${response.statusText}`);
      const errJson = await response.json().catch(() => ({}));
      const errMessage = errJson.error?.message || errJson.message || response.statusText || '';
      
      // Classify error type precisely
      let errorType = 'PROVIDER_ERROR';
      if (response.status === 401 || response.status === 403) errorType = 'INVALID_KEY';
      if (response.status === 429) errorType = 'RATE_LIMIT';

      // Token / context-window exceeded — check message content across all providers
      const tokenKeywords = [
        'context_length_exceeded', 'context length', 'maximum context',
        'token limit', 'insufficient_quota', 'quota exceeded',
        'too many tokens', 'max_tokens', 'string too long', 'input too long'
      ];
      const isTokenError = response.status === 413 ||
        tokenKeywords.some(kw => errMessage.toLowerCase().includes(kw));
      if (isTokenError) errorType = 'TOKEN_LIMIT';

      console.log(`[Server] Error classified as: ${errorType} | Message: ${errMessage.substring(0, 80)}`);

      return res.status(response.status).json({
        _errorType: errorType,
        _keyError: errorType !== 'TOKEN_LIMIT', // Only key-errors open the key modal
        _tokenError: errorType === 'TOKEN_LIMIT',
        _model: defaultModel,
        _provider: url.includes('groq') ? 'Groq' : url.includes('openrouter') ? 'OpenRouter' : url.includes('anthropic') ? 'Anthropic' : url.includes('googleapis') ? 'Google' : 'OpenAI',
        content: `Upstream Provider Error (${response.status}): ${errMessage}`,
        ui: `<div style="padding:24px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:16px;color:#ef4444">
               <h4 style="margin:0 0 8px 0">Execution Halted — ${errorType.replace('_', ' ')}</h4>
               <p style="margin:0;font-size:13px;opacity:0.8">${errMessage || 'The upstream model provider returned an error.'}</p>
             </div>`
      });
    }

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content || '';
    console.log(`[Server] Raw LLM response length: ${raw.length} chars`);
    
    const formatMarkdownToHTML = (text) => {
      if (!text) return '';
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#A259FF">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/### (.*?)\n/g, '<h3 style="color:#fff;margin-top:16px;font-family:Syne,sans-serif">$1</h3>')
        .replace(/## (.*?)\n/g, '<h2 style="color:#fff;margin-top:20px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:8px;font-family:Syne,sans-serif">$1</h2>')
        .replace(/# (.*?)\n/g, '<h1 style="color:#fff;margin-top:24px;font-family:Syne,sans-serif">$1</h1>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');
    };

    let parsed;
    try {
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        let extractedRaw = raw.substring(firstBrace, lastBrace + 1);
        const cleanedRaw = extractedRaw.replace(/[\u0000-\u0019]+/g, "");
        parsed = JSON.parse(cleanedRaw);
        if (!parsed.content || !parsed.ui) throw new Error('Response missing required fields.');
        
        // If the LLM still returned markdown in the UI instead of HTML, format it beautifully
        if (!/<[a-z][\s\S]*>/i.test(parsed.ui) || parsed.ui.includes('**')) {
          let safeContent = parsed.ui.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          parsed.ui = `<div style="padding:32px; color:#e2e8f0; font-family:Outfit,sans-serif; line-height:1.7; font-size:15px; background:rgba(255,255,255,0.02); border-radius:24px; border:1px solid rgba(255,255,255,0.05);">${formatMarkdownToHTML(safeContent)}</div>`;
        }
      } else {
        throw new Error('No valid JSON object found in response.');
      }
    } catch (parseError) {
      console.warn(`[Server] Strict JSON parse failed for ${agent.name}. Salvaging content...`);
      let salvagedContent = raw;
      const contentRegex = /"content"\s*:\s*"?([\s\S]*?)"?(?:,\s*"ui"|\}$)/;
      const match = raw.match(contentRegex);
      if (match && match[1]) {
          salvagedContent = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }

      let safeContent = salvagedContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      let htmlContent = formatMarkdownToHTML(safeContent);

      parsed = {
        content: salvagedContent,
        ui: `<div style="padding:32px; color:#e2e8f0; font-family:Outfit,sans-serif; line-height:1.7; font-size:15px; background:rgba(255,255,255,0.02); border-radius:24px; border:1px solid rgba(255,255,255,0.05);">
               <div style="color:#DEF767; font-size:10px; font-weight:bold; margin-bottom:20px; text-transform:uppercase; letter-spacing:1px; border:1px solid rgba(222,247,103,0.3); padding:4px 8px; border-radius:6px; display:inline-block; background:rgba(222,247,103,0.1);">Auto-Recovered Mode</div>
               ${htmlContent}
             </div>`
      };
    }

    console.log(`[Server] Successfully processed LLM output for ${agent.name}`);
    res.json(parsed);
  } catch (error) {
    console.error(`[Server] LLM Fallback Triggered:`, error.message);
    res.status(500).json({
      content: `[System Error] Sequence halted. ${error.message}`,
      ui: `<div style="padding:32px;font-family:Outfit,sans-serif;background:rgba(10,10,15,0.9);backdrop-filter:blur(16px);border-radius:24px;border:1px solid rgba(239,68,68,0.25)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;color:#ef4444;font-size:18px;border:1px solid rgba(239,68,68,0.3)">⚠</div>
          <h3 style="color:#ef4444;font-size:20px;font-weight:700;margin:0;font-family:Syne,sans-serif">Gateway Routing Failure</h3>
        </div>
        <p style="color:#8b949e;font-size:14px;line-height:1.6;margin:0 0 16px 0">${error.message.replace(/"/g, '&quot;')}</p>
        <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05)">
           <p style="color:#A259FF;font-size:12px;margin:0;font-weight:600;text-transform:uppercase;letter-spacing:1px">Fallback Protocol</p>
           <p style="color:#64748b;font-size:13px;margin:6px 0 0 0">Verify your API key in Profile, or try a different provider.</p>
        </div>
      </div>`,
    });
  }
});

app.post('/api/agent/stream', async (req, res) => {
  const { userTask, agent, activeKey, userId, requestedModel } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Resolve key: prefer server-stored encrypted key
  const resolvedKey = await resolveApiKey(userId, null, activeKey);

  if (!resolvedKey) {
    res.write('data: {"choices":[{"delta":{"content":"No API key detected. Add one in Profile → API Key Management.\\n"}}]}\n\n');
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  const { url, defaultModel } = determineProvider(resolvedKey, requestedModel);
  const systemPrompt = `You are a sub-processor computing the neural logic for: ${agent?.name}. Output a rapid chain-of-thought (3-4 technical sentences simulating log processing) detailing how you are evaluating this prompt. Provide raw streamable text with no formatting.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resolvedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: defaultModel,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userTask || 'Begin execution log.' },
        ],
      }),
    });

    if (!response.ok) throw new Error('Stream failed upstream');

    for await (const chunk of response.body) {
      res.write(chunk);
    }
  } catch (err) {
    res.write(`data: {"choices":[{"delta":{"content":"\\n[STREAM FAILURE: ${err.message}]"}}]}\n\n`);
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
});

// Use http.createServer to keep the process alive (Express 5 compat)
if (!process.env.VERCEL) {
  const server = createServer(app);
  server.listen(PORT, () => {
    console.log(`[Agentic Flow] ✓ Backend server running on http://localhost:${PORT}`);
    console.log(`[Agentic Flow] ✓ Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Agentic Flow] ✓ Key Management: /api/keys/save, /api/keys/status/:userId`);
  });
}

export default app;
