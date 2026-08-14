import { StageOption } from '../types';

export const ESTAGIOS_IA: StageOption[] = [
  {
    id: 'estagio_0',
    nivel: 0,
    titulo: 'Estágio 0: Curioso',
    subtitulo: 'Ainda não utilizo IA no dia a dia do negócio',
    descricao: 'Sua empresa está nos primeiros passos do ecossistema digital. Excelente momento para iniciar com estratégias estruturadas e sem desperdício de tempo.',
    icone: 'Sparkles',
    cor: 'border-slate-300 hover:border-slate-400 bg-white text-slate-700',
    badge: 'Nível Inicial'
  },
  {
    id: 'estagio_1',
    nivel: 1,
    titulo: 'Estágio 1: Explorador',
    subtitulo: 'Uso pontual de ferramentas gratuitas (ex: ChatGPT)',
    descricao: 'Você já utiliza inteligência artificial para tarefas simples e geração de ideias, mas os processos ainda são individuais e informais.',
    icone: 'Compass',
    cor: 'border-blue-200 hover:border-blue-400 bg-blue-50/50 text-blue-900',
    badge: 'Explorando'
  },
  {
    id: 'estagio_2',
    nivel: 2,
    titulo: 'Estágio 2: Praticante',
    subtitulo: 'Uso recorrente em áreas específicas sem integração',
    descricao: 'Sua equipe utiliza IA de forma frequente para criar conteúdo, analisar dados ou rascunhar respostas, porém sem padronização ou fluxos automatizados.',
    icone: 'Zap',
    cor: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 text-indigo-900',
    badge: 'Em Expansão'
  },
  {
    id: 'estagio_3',
    nivel: 3,
    titulo: 'Estágio 3: Integrador',
    subtitulo: 'Automações conectadas com IA (n8n, CRM, Chatbots)',
    descricao: 'Sua operação possui fluxos automatizados conectando IA aos sistemas centrais (WhatsApp, CRM, ERP, E-mail), gerando ganho real de produtividade.',
    icone: 'Cpu',
    cor: 'border-purple-200 hover:border-purple-400 bg-purple-50/50 text-purple-900',
    badge: 'Produtividade Avançada'
  },
  {
    id: 'estagio_4',
    nivel: 4,
    titulo: 'Estágio 4: Avançado',
    subtitulo: 'IA como pilar estratégico e diferencial competitivo',
    descricao: 'A inteligência artificial orienta a tomada de decisão, personaliza produtos em escala e é o motor de inovação contínua da sua empresa.',
    icone: 'Flame',
    cor: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 text-emerald-900',
    badge: 'Líder em Inovação'
  }
];

export const SETORES = [
  'Serviços',
  'Comércio / Varejo',
  'Indústria',
  'Tecnologia / Software',
  'Saúde / Bem-estar',
  'Educação / Treinamento',
  'Alimentação / Gastronomia',
  'Agronegócio',
  'Outro'
];

export const PORTES_EMPRESA = [
  'Apenas eu (Euconômico / Startup)',
  '2 a 5 colaboradores',
  '6 a 20 colaboradores',
  'Mais de 20 colaboradores'
];

export const AREAS_APLICACAO = [
  { id: 'vendas', label: 'Vendas & Atendimento ao Cliente', icone: 'Headphones' },
  { id: 'marketing', label: 'Marketing & Criação de Conteúdo', icone: 'Megaphone' },
  { id: 'operacoes', label: 'Operações & Gestão de Processos', icone: 'Briefcase' },
  { id: 'rh', label: 'RH & Treinamento de Equipe', icone: 'Users' },
  { id: 'financas', label: 'Finanças & Análise de Dados', icone: 'TrendingUp' },
  { id: 'nenhuma', label: 'Nenhuma área por enquanto', icone: 'XCircle' }
];

export const FERRAMENTAS_SUGERIDAS = [
  'ChatGPT',
  'Claude',
  'n8n',
  'Midjourney',
  'Make',
  'Microsoft Copilot',
  'Perplexity',
  'Gemini',
  'WhatsApp Bot',
  'ManyChat',
  'Zapier'
];

export const OBSTACULOS = [
  'Falta de conhecimento prático em IA',
  'Dificuldade em engajar e treinar a equipe',
  'Falta de tempo para implementar novidades',
  'Preocupação com segurança e privacidade de dados',
  'Alto custo perceptível de ferramentas e licenças',
  'Outro'
];

export const OBJETIVOS = [
  'Automatizar tarefas repetitivas e operacionais',
  'Reduzir custos e otimizar tempo da equipe',
  'Aumentar vendas e velocidade de atendimento ao cliente',
  'Criar uma cultura forte de inovação na empresa'
];
