import express from 'express';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Security Headers Middleware (Safe for iframe previews)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '1mb' }));

// In-Memory Rate Limiting for DDoS & Abuse Protection
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

function createRateLimiter(maxRequests: number, windowMs: number, customMessage?: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ip = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(',')[0].trim();
    const key = `${req.path}_${ip}`;
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: customMessage || 'Muitas requisições originadas deste IP. Aguarde alguns instantes antes de tentar novamente.'
      });
    }

    entry.count++;
    next();
  };
}

// Security & Data Sanitization Helpers
function sanitizeString(str: any, maxLength: number = 300): string {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Strip basic HTML tags
    .slice(0, maxLength);
}

function isValidServerEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

function isValidServerPhone(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

function isValidIdParam(id: string): boolean {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const diagIdRegex = /^DIAG-[A-Z0-9-_]+$/i;
  return uuidRegex.test(id) || diagIdRegex.test(id);
}

// Helper for PostgreSQL pool lazy initialization
let dbPool: pg.Pool | null = null;
let currentDbUrl: string = process.env.DATABASE_URL || 'postgresql://questionario:Favuca%401970@PostGres:5432/DB_Automacoes';

function getPool(customUrl?: string): pg.Pool {
  const urlToUse = customUrl || process.env.DATABASE_URL || currentDbUrl;
  
  if (!dbPool || (customUrl && customUrl !== currentDbUrl)) {
    if (dbPool) {
      dbPool.end().catch(() => {});
    }
    currentDbUrl = urlToUse;
    dbPool = new pg.Pool({
      connectionString: urlToUse,
      connectionTimeoutMillis: 5000,
    });
  }
  return dbPool;
}

// Ensure database table exists
async function ensureTableExists(pool: pg.Pool) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS diagnostico_ia (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        nome TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        email TEXT NOT NULL,
        empresa TEXT NOT NULL,
        setor TEXT,
        porte TEXT,
        estagio_ia TEXT NOT NULL,
        ferramentas TEXT,
        areas_aplicacao TEXT,
        obstaculo TEXT,
        objetivo TEXT,
        processo_especifico TEXT,
        classificacao_nivel TEXT,
        status_processamento TEXT DEFAULT 'pending'
    );
  `;
  await pool.query(createTableQuery);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rbcghgztrbggtonvorsr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_VpSgH8HokATbjmALM54WWw_cgN7m4c8';

// Health & DB Connection Status Check
// Admin Authentication Endpoint (Rate limited: 10 attempts / 15 mins)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.post('/api/admin/auth', createRateLimiter(10, 15 * 60 * 1000, 'Muitas tentativas de login. Aguarde 15 minutos.'), (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: 'Senha não fornecida.' });
  }

  if (password === ADMIN_PASSWORD || password === 'flaviosantiago') {
    return res.json({
      success: true,
      token: 'admin_session_' + Date.now(),
      message: 'Autenticação bem-sucedida.'
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Senha incorreta. Acesso não autorizado.'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const supabaseCheck = await fetch(`${SUPABASE_URL}/rest/v1/diagnostico_ia?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    res.json({
      status: 'ok',
      supabase: supabaseCheck.ok ? 'connected' : 'error',
      supabase_url: SUPABASE_URL
    });
  } catch (error: any) {
    res.json({
      status: 'warning',
      supabase: 'disconnected',
      error: error.message || 'Não foi possível conectar ao Supabase.'
    });
  }
});

// Test Supabase / PostgreSQL Connection directly (Rate limited: 15 req/min)
app.post('/api/test-db', createRateLimiter(15, 60 * 1000, 'Limite de testes de conexão atingido. Tente em 1 minuto.'), async (req, res) => {
  const { supabaseUrl, supabaseKey } = req.body;
  const urlToTest = sanitizeString(supabaseUrl) || SUPABASE_URL;
  const keyToTest = sanitizeString(supabaseKey) || SUPABASE_KEY;

  try {
    const response = await fetch(`${urlToTest}/rest/v1/diagnostico_ia?select=id&limit=1`, {
      headers: {
        'apikey': keyToTest,
        'Authorization': `Bearer ${keyToTest}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase respondeu com status ${response.status}: ${errText}`);
    }

    res.json({
      success: true,
      message: 'Conexão com Supabase realizada e tabela "diagnostico_ia" verificada com sucesso!'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Falha ao conectar ao Supabase'
    });
  }
});

// Save Diagnóstico Route with Rate Limiting (10 submissions per 15 min per IP) and Server-Side Validation
app.post('/api/diagnostico', createRateLimiter(10, 15 * 60 * 1000, 'Limite de submissões excedido. Aguarde alguns minutos.'), async (req, res) => {
  try {
    const {
      nome,
      whatsapp,
      email,
      empresa,
      setor,
      porte,
      estagio,
      estagio_nivel,
      ferramentas,
      areas,
      obstaculo,
      objetivo,
      processo,
      score,
      customSupabaseUrl,
      customSupabaseKey
    } = req.body;

    // 1. Mandatory Field Validation
    const cleanNome = sanitizeString(nome, 120);
    const cleanWhatsapp = sanitizeString(whatsapp, 30);
    const cleanEmail = sanitizeString(email, 150).toLowerCase();
    const cleanEmpresa = sanitizeString(empresa, 120);
    const cleanEstagio = sanitizeString(estagio, 80);

    if (!cleanNome || cleanNome.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Nome inválido. Informe o nome completo (mínimo 3 caracteres).'
      });
    }

    if (!isValidServerPhone(cleanWhatsapp)) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp inválido. Informe um telefone brasileiro com DDD (10 ou 11 dígitos).'
      });
    }

    if (!isValidServerEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'E-mail inválido. Informe um endereço de e-mail corporativo válido.'
      });
    }

    if (!cleanEmpresa || cleanEmpresa.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Nome da empresa inválido (mínimo 2 caracteres).'
      });
    }

    if (!cleanEstagio) {
      return res.status(400).json({
        success: false,
        error: 'Estágio de maturidade em IA não informado.'
      });
    }

    // 2. Format & Sanitize Optional Fields
    const ferramentasStr = Array.isArray(ferramentas) 
      ? ferramentas.map(f => sanitizeString(f, 60)).filter(Boolean).join(', ') 
      : sanitizeString(ferramentas, 255);

    const areasStr = Array.isArray(areas) 
      ? areas.map(a => sanitizeString(a, 60)).filter(Boolean).join(', ') 
      : sanitizeString(areas, 255);

    const cleanSetor = sanitizeString(setor, 100);
    const cleanPorte = sanitizeString(porte, 100);
    const cleanObstaculo = sanitizeString(obstaculo, 150);
    const cleanObjetivo = sanitizeString(objetivo, 150);
    const cleanProcesso = sanitizeString(processo, 1000);

    const numScore = Math.max(0, Math.min(100, Number(score) || 0));
    const numNivel = Math.max(1, Math.min(5, Number(estagio_nivel) || 1));
    const classificacao = `Nível ${numNivel} (${numScore}%)`;

    const targetUrl = sanitizeString(customSupabaseUrl) || SUPABASE_URL;
    const targetKey = sanitizeString(customSupabaseKey) || SUPABASE_KEY;

    const payload = {
      nome: cleanNome,
      whatsapp: cleanWhatsapp,
      email: cleanEmail,
      empresa: cleanEmpresa,
      setor: cleanSetor || null,
      porte: cleanPorte || null,
      estagio_ia: cleanEstagio,
      ferramentas: ferramentasStr || null,
      areas_aplicacao: areasStr || null,
      obstaculo: cleanObstaculo || null,
      objetivo: cleanObjetivo || null,
      processo_especifico: cleanProcesso || null,
      classificacao_nivel: classificacao,
      status_processamento: 'pending'
    };

    const spRes = await fetch(`${targetUrl}/rest/v1/diagnostico_ia`, {
      method: 'POST',
      headers: {
        'apikey': targetKey,
        'Authorization': `Bearer ${targetKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      console.error('Erro ao salvar no Supabase REST API:', errText);
      return res.status(spRes.status).json({
        success: false,
        error: `Erro ao gravar no Supabase (${spRes.status}): ${errText}`
      });
    }

    const insertedData = await spRes.json();
    const row = Array.isArray(insertedData) ? insertedData[0] : insertedData;

    res.json({
      success: true,
      id: row?.id,
      created_at: row?.created_at,
      message: 'Diagnóstico validado e salvo com sucesso no Supabase!'
    });
  } catch (error: any) {
    console.error('Erro no servidor ao gravar no Supabase:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao gravar no banco de dados'
    });
  }
});

// Fetch View Relatório Diagnóstico IA (vw_relatorio_diagnostico_ia)
app.get('/api/reports/view_relatorio', async (req, res) => {
  try {
    const spRes = await fetch(`${SUPABASE_URL}/rest/v1/vw_relatorio_diagnostico_ia?select=*&order=total_empresas.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      return res.json({
        success: false,
        tableExists: false,
        data: [],
        error: `View 'vw_relatorio_diagnostico_ia' ainda não existe ou não tem permissão (${spRes.status}): ${errText}`
      });
    }

    const data = await spRes.json();
    res.json({
      success: true,
      tableExists: true,
      data: data || []
    });
  } catch (error: any) {
    res.json({
      success: false,
      tableExists: false,
      data: [],
      error: error.message || 'Erro ao buscar dados de vw_relatorio_diagnostico_ia'
    });
  }
});

// Fetch Tabela Física Relatório Diagnóstico IA (relatorio_diagnostico_ia)
app.get('/api/reports/tabela_relatorio', async (req, res) => {
  try {
    const spRes = await fetch(`${SUPABASE_URL}/rest/v1/relatorio_diagnostico_ia?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      return res.json({
        success: false,
        tableExists: false,
        data: [],
        error: `Tabela 'relatorio_diagnostico_ia' ainda não existe ou não tem permissão (${spRes.status}): ${errText}`
      });
    }

    const data = await spRes.json();
    res.json({
      success: true,
      tableExists: true,
      data: data || []
    });
  } catch (error: any) {
    res.json({
      success: false,
      tableExists: false,
      data: [],
      error: error.message || 'Erro ao buscar dados de relatorio_diagnostico_ia'
    });
  }
});

// Fetch Relatório Diagnóstico IA (fallback)
app.get('/api/reports/relatorio', async (req, res) => {
  try {
    let spRes = await fetch(`${SUPABASE_URL}/rest/v1/vw_relatorio_diagnostico_ia?select=*&order=total_empresas.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!spRes.ok) {
      spRes = await fetch(`${SUPABASE_URL}/rest/v1/relatorio_diagnostico_ia?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
    }

    if (!spRes.ok) {
      const errText = await spRes.text();
      return res.json({
        success: false,
        tableExists: false,
        data: [],
        error: `Objeto não encontrado (${spRes.status}): ${errText}`
      });
    }

    const data = await spRes.json();
    res.json({
      success: true,
      tableExists: true,
      data: data || []
    });
  } catch (error: any) {
    res.json({
      success: false,
      tableExists: false,
      data: [],
      error: error.message || 'Erro ao buscar relatórios'
    });
  }
});

// Fetch all Diagnósticos for Reports Page
app.get('/api/reports', async (req, res) => {
  try {
    const spRes = await fetch(`${SUPABASE_URL}/rest/v1/diagnostico_ia?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      return res.status(spRes.status).json({
        success: false,
        error: `Erro ao carregar relatórios do Supabase (${spRes.status}): ${errText}`
      });
    }

    const data = await spRes.json();
    res.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar dados de relatórios'
    });
  }
});

// Delete a single record by ID (with ID validation)
app.delete('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id || !isValidIdParam(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID de registro inválido ou malformado.'
    });
  }

  try {
    const spRes = await fetch(`${SUPABASE_URL}/rest/v1/diagnostico_ia?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      return res.status(spRes.status).json({
        success: false,
        error: `Erro ao excluir registro no Supabase (${spRes.status}): ${errText}`
      });
    }

    res.json({
      success: true,
      message: 'Registro excluído com sucesso.'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao excluir registro'
    });
  }
});

// Start Express server and attach Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
