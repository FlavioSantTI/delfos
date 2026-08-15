import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import {
  adminPasswordMatches,
  clearSessionCookies,
  createAdminSession,
  isAdminPasswordConfigured,
  requireAdminSession,
  setSessionCookies,
} from './adminSession.ts';
import { createRateLimiter } from './rateLimit.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const IS_PROD = process.env.NODE_ENV === 'production';
const LGPD_TERM_VERSION = '2026-08-14';

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    IS_PROD
      ? "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
      : "frame-ancestors 'self'"
  );
  const proto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (IS_PROD && (req.secure || proto === 'https')) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

function sanitizeString(str: any, maxLength: number = 300): string {
  if (typeof str !== 'string') return '';
  return str.replace(/\0/g, '').trim().slice(0, maxLength);
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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function supabaseAnonHeaders(): Record<string, string> | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

function supabaseAdminHeaders(): Record<string, string> | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
}

function requireSupabaseAdmin(res: express.Response): Record<string, string> | null {
  const headers = supabaseAdminHeaders();
  if (!headers) {
    res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível.' });
    return null;
  }
  return headers;
}

app.post('/api/admin/auth', createRateLimiter(10, 15 * 60 * 1000, 'Muitas tentativas de login. Aguarde 15 minutos.'), (req, res) => {
  if (!isAdminPasswordConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Login administrativo não configurado no servidor.',
    });
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Senha não fornecida.' });
  }

  if (!adminPasswordMatches(password)) {
    return res.status(401).json({
      success: false,
      error: 'Senha incorreta. Acesso não autorizado.',
    });
  }

  const session = createAdminSession();
  setSessionCookies(req, res, session);
  return res.json({
    success: true,
    csrfToken: session.csrf,
    message: 'Autenticação bem-sucedida.',
  });
});

app.get('/api/admin/session', requireAdminSession, (_req, res) => {
  res.json({ success: true, authenticated: true });
});

app.post('/api/admin/logout', (req, res) => {
  clearSessionCookies(req, res);
  res.json({ success: true });
});

app.get('/api/health', async (_req, res) => {
  const headers = supabaseAnonHeaders();
  if (!headers || !SUPABASE_URL) {
    return res.json({ status: 'ok' });
  }
  try {
    const supabaseCheck = await fetch(`${SUPABASE_URL}/rest/v1/diagnostico_ia?select=id&limit=1`, {
      headers,
    });
    res.json({
      status: supabaseCheck.ok ? 'ok' : 'degraded',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.json({ status: 'degraded' });
  }
});

app.post(
  '/api/test-db',
  requireAdminSession,
  createRateLimiter(15, 60 * 1000, 'Limite de testes de conexão atingido. Tente em 1 minuto.'),
  async (_req, res) => {
    const headers = supabaseAdminHeaders() || supabaseAnonHeaders();
    if (!headers || !SUPABASE_URL) {
      return res.status(503).json({
        success: false,
        error: 'Banco não configurado no servidor.',
      });
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/diagnostico_ia?select=id&limit=1`, {
        headers,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('test-db upstream:', response.status, errText);
        return res.status(502).json({
          success: false,
          error: 'Falha ao conectar ao banco.',
        });
      }

      res.json({
        success: true,
        message: 'Conexão com o banco verificada com sucesso.',
      });
    } catch (error) {
      console.error('test-db failed:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao conectar ao banco.',
      });
    }
  }
);

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
      lgpdConsent,
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

    if (lgpdConsent !== true) {
      return res.status(400).json({
        success: false,
        error: 'É necessário concordar com os termos de privacidade para gerar o diagnóstico.',
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

    const headers = supabaseAnonHeaders();
    if (!headers || !SUPABASE_URL) {
      return res.status(503).json({
        success: false,
        error: 'Serviço temporariamente indisponível.',
      });
    }

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
      status_processamento: 'pending',
      lgpd_consent_at: new Date().toISOString(),
      lgpd_term_version: LGPD_TERM_VERSION,
    };

    const insert = (body: object) =>
      fetch(`${SUPABASE_URL}/rest/v1/diagnostico_ia`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(body),
      });

    let spRes = await insert(payload);
    if (!spRes.ok) {
      const errText = await spRes.text();
      if (/lgpd_/i.test(errText)) {
        const { lgpd_consent_at: _a, lgpd_term_version: _b, ...basePayload } = payload;
        spRes = await insert(basePayload);
      } else {
        console.error('Erro ao salvar no Supabase REST API:', spRes.status, errText);
        return res.status(502).json({
          success: false,
          error: 'Erro ao gravar o diagnóstico.',
        });
      }
    }

    if (!spRes.ok) {
      const errText = await spRes.text();
      console.error('Erro ao salvar no Supabase REST API:', spRes.status, errText);
      return res.status(502).json({
        success: false,
        error: 'Erro ao gravar o diagnóstico.',
      });
    }

    const insertedData = await spRes.json();
    const row = Array.isArray(insertedData) ? insertedData[0] : insertedData;

    res.json({
      success: true,
      id: row?.id,
      created_at: row?.created_at,
      message: 'Diagnóstico validado e salvo com sucesso.'
    });
  } catch (error) {
    console.error('Erro no servidor ao gravar no Supabase:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gravar no banco de dados',
    });
  }
});

app.use('/api/reports', requireAdminSession);

// Fetch View Relatório Diagnóstico IA (vw_relatorio_diagnostico_ia)
app.get('/api/reports/view_relatorio', async (_req, res) => {
  const headers = requireSupabaseAdmin(res);
  if (!headers) return;
  try {
    const spRes = await fetch(`${SUPABASE_URL}/rest/v1/vw_relatorio_diagnostico_ia?select=*&order=total_empresas.desc`, {
      headers
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      console.error('view_relatorio upstream:', spRes.status, errText);
      return res.json({
        success: false,
        tableExists: false,
        data: [],
        error: 'View indisponível.',
      });
    }

    const data = await spRes.json();
    res.json({
      success: true,
      tableExists: true,
      data: data || []
    });
  } catch (error) {
    console.error('view_relatorio failed:', error);
    res.json({
      success: false,
      tableExists: false,
      data: [],
      error: 'Erro ao buscar dados da view.',
    });
  }
});

// Fetch Tabela Física Relatório Diagnóstico IA (relatorio_diagnostico_ia)
app.get('/api/reports/tabela_relatorio', async (_req, res) => {
  const headers = requireSupabaseAdmin(res);
  if (!headers) return;
  try {
    const spRes = await fetch(`${SUPABASE_URL}/rest/v1/relatorio_diagnostico_ia?select=*&order=created_at.desc`, {
      headers
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      console.error('tabela_relatorio upstream:', spRes.status, errText);
      return res.json({
        success: false,
        tableExists: false,
        data: [],
        error: 'Tabela indisponível.',
      });
    }

    const data = await spRes.json();
    res.json({
      success: true,
      tableExists: true,
      data: data || []
    });
  } catch (error) {
    console.error('tabela_relatorio failed:', error);
    res.json({
      success: false,
      tableExists: false,
      data: [],
      error: 'Erro ao buscar dados da tabela.',
    });
  }
});

// Fetch Relatório Diagnóstico IA (fallback)
app.get('/api/reports/relatorio', async (_req, res) => {
  const headers = requireSupabaseAdmin(res);
  if (!headers) return;
  try {
    let spRes = await fetch(`${SUPABASE_URL}/rest/v1/vw_relatorio_diagnostico_ia?select=*&order=total_empresas.desc`, {
      headers
    });

    if (!spRes.ok) {
      spRes = await fetch(`${SUPABASE_URL}/rest/v1/relatorio_diagnostico_ia?select=*`, {
        headers
      });
    }

    if (!spRes.ok) {
      const errText = await spRes.text();
      console.error('relatorio upstream:', spRes.status, errText);
      return res.json({
        success: false,
        tableExists: false,
        data: [],
        error: 'Relatório indisponível.',
      });
    }

    const data = await spRes.json();
    res.json({
      success: true,
      tableExists: true,
      data: data || []
    });
  } catch (error) {
    console.error('relatorio failed:', error);
    res.json({
      success: false,
      tableExists: false,
      data: [],
      error: 'Erro ao buscar relatórios',
    });
  }
});

// Fetch all Diagnósticos for Reports Page
app.get('/api/reports', async (_req, res) => {
  const headers = requireSupabaseAdmin(res);
  if (!headers) return;
  try {
    const spRes = await fetch(`${SUPABASE_URL}/rest/v1/diagnostico_ia?select=*&order=created_at.desc`, {
      headers
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      console.error('reports upstream:', spRes.status, errText);
      return res.status(502).json({
        success: false,
        error: 'Erro ao carregar relatórios.',
      });
    }

    const data = await spRes.json();
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('reports failed:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados de relatórios',
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

  const headers = requireSupabaseAdmin(res);
  if (!headers) return;

  try {
    const spRes = await fetch(`${SUPABASE_URL}/rest/v1/diagnostico_ia?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers
    });

    if (!spRes.ok) {
      const errText = await spRes.text();
      console.error('delete upstream:', spRes.status, errText);
      return res.status(502).json({
        success: false,
        error: 'Erro ao excluir registro.',
      });
    }

    res.json({
      success: true,
      message: 'Registro excluído com sucesso.'
    });
  } catch (error) {
    console.error('delete failed:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir registro',
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

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
}

startServer();
