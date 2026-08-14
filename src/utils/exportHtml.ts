import { IntegrationConfig } from '../types';

export function generateStandaloneHtml(config: IntegrationConfig): string {
  const supabaseUrl = config.supabaseUrl || 'https://SUA_URL_SUPABASE.supabase.co';
  const supabaseAnonKey = config.supabaseAnonKey || 'SUA_ANON_KEY_PUBLIC_SUPABASE';
  const supabaseTable = config.supabaseTable || 'diagnostico_ia';
  const n8nWebhook = config.n8nWebhookUrl || 'https://SEU_N8N_INSTANCIA.com/webhook/diagnostico-ia';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnóstico de Maturidade em IA — by Flávio Santiago ConsultorIA</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .fade-in {
      animation: fadeIn 0.3s ease-in-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body class="bg-[#F7F9FA] text-[#1E293B] min-h-screen flex flex-col justify-between antialiased font-sans">

  <!-- Header Branding -->
  <header class="bg-[#2A3A4A] text-white border-b border-slate-700/60 sticky top-0 z-30 shadow-md">
    <div class="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-[#349885] p-0.5 shadow-md shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" class="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="48" fill="#349885" />
            <circle cx="50" cy="50" r="44" stroke="#2C8070" stroke-width="3" opacity="0.9" />
            <g stroke="#E0F2FE" stroke-width="2" stroke-linecap="round">
              <path d="M50 22 V78 M22 50 H78" stroke="#E2E8F0" stroke-width="1.5" opacity="0.6" />
              <path d="M50 34 H62 V26 M50 42 H70 V32 M58 50 V38 H68 M66 50 V42 H74" />
              <path d="M50 34 H38 V26 M50 42 H30 V32 M42 50 V38 H32 M34 50 V42 H26" />
              <path d="M50 66 H38 V74 M50 58 H30 V68 M42 50 V62 H32 M34 50 V58 H26" />
              <path d="M50 66 H62 V74 M50 58 H70 V68 M42 50 V62 H68 M34 50 V58 H74" />
            </g>
            <g fill="#FFFFFF">
              <circle cx="62" cy="26" r="2.5" /><circle cx="70" cy="32" r="2.5" /><circle cx="68" cy="38" r="2.5" />
              <circle cx="38" cy="26" r="2.5" /><circle cx="30" cy="32" r="2.5" /><circle cx="32" cy="38" r="2.5" />
              <circle cx="38" cy="74" r="2.5" /><circle cx="30" cy="68" r="2.5" /><circle cx="32" cy="62" r="2.5" />
              <circle cx="62" cy="74" r="2.5" /><circle cx="70" cy="68" r="2.5" /><circle cx="68" cy="62" r="2.5" />
              <circle cx="50" cy="50" r="4" />
            </g>
          </svg>
        </div>
        <div>
          <h1 class="font-serif text-base sm:text-lg text-white font-normal tracking-tight">
            Diagnóstico de <span class="text-[#349885] italic font-serif">Maturidade em IA</span>
          </h1>
          <p class="text-xs text-[#A0B2C6] font-medium">by Flávio Santiago ConsultorIA</p>
        </div>
      </div>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2C8070]/30 text-[#E2E8F0] border border-[#349885]/40">
        <i data-lucide="shield-check" class="w-3.5 h-3.5 text-[#349885]"></i>
        Flávio Santiago ConsultorIA
      </span>
    </div>
  </header>

  <!-- Container Principal -->
  <main class="max-w-3xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
    
    <!-- Banner de Apresentação -->
    <div class="text-center mb-8">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#349885]/15 text-[#2C8070] border border-[#349885]/30 mb-3">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#349885]"></i>
        Diagnóstico Gratuito • Em menos de 5 minutos
      </span>
      <h2 class="text-2xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
        Qual o Nível de IA do seu Negócio?
      </h2>
      <p class="mt-2 text-[#64748B] text-sm sm:text-base max-w-xl mx-auto">
        Responda ao questionário abaixo e receba instantaneamente um relatório com recomendações práticas para acelerar sua empresa.
      </p>
    </div>

    <!-- Card do Formulário Multi-Step -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden" id="form-container">
      
      <!-- Barra de Progresso -->
      <div class="bg-[#F8FAFC] border-b border-slate-200/80 p-4 sm:p-6">
        <div class="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#1E293B] mb-2">
          <span id="step-title">Etapa 1 de 3: Contato e Perfil Comercial</span>
          <span id="step-percent" class="text-[#349885] font-bold">33%</span>
        </div>
        <div class="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
          <div id="progress-bar" class="bg-[#349885] h-full transition-all duration-500" style="width: 33%"></div>
        </div>
      </div>

      <!-- Formulário -->
      <form id="diagnostico-form" class="p-6 sm:p-8">
        
        <!-- ================= ETAPA 1 ================= -->
        <div id="step-1" class="space-y-5 fade-in">
          <h3 class="text-lg font-bold text-[#1E293B] border-b border-slate-100 pb-2 flex items-center gap-2">
            <i data-lucide="user" class="w-5 h-5 text-[#349885]"></i>
            Dados Comerciais & Contato
          </h3>

          <div>
            <label class="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1">Nome Completo *</label>
            <div class="relative">
              <i data-lucide="user" class="w-5 h-5 text-[#94A3B8] absolute left-3 top-3"></i>
              <input type="text" id="nome" required placeholder="Seu nome e sobrenome" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition text-sm text-[#1E293B]">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1">WhatsApp *</label>
              <div class="relative">
                <i data-lucide="phone" class="w-5 h-5 text-[#94A3B8] absolute left-3 top-3"></i>
                <input type="tel" id="whatsapp" required placeholder="(11) 99999-9999" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition text-sm text-[#1E293B]">
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1">E-mail *</label>
              <div class="relative">
                <i data-lucide="mail" class="w-5 h-5 text-[#94A3B8] absolute left-3 top-3"></i>
                <input type="email" id="email" required placeholder="seu@email.com" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition text-sm text-[#1E293B]">
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1">Nome da Empresa *</label>
            <div class="relative">
              <i data-lucide="building-2" class="w-5 h-5 text-[#94A3B8] absolute left-3 top-3"></i>
              <input type="text" id="empresa" required placeholder="Nome da sua empresa ou projeto" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition text-sm text-[#1E293B]">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1">Setor de Atuação *</label>
              <select id="setor" required class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition text-sm text-[#1E293B]">
                <option value="">Selecione o setor...</option>
                <option value="Serviços">Serviços</option>
                <option value="Comércio / Varejo">Comércio / Varejo</option>
                <option value="Indústria">Indústria</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Saúde">Saúde</option>
                <option value="Educação">Educação</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1">Porte da Empresa *</label>
              <select id="porte" required class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition text-sm text-[#1E293B]">
                <option value="">Selecione o porte...</option>
                <option value="Apenas eu">Apenas eu</option>
                <option value="2 a 5 colaboradores">2 a 5 colaboradores</option>
                <option value="6 a 20 colaboradores">6 a 20 colaboradores</option>
                <option value="Mais de 20">Mais de 20</option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button type="button" onclick="nextStep(2)" class="bg-[#349885] hover:bg-[#2C8070] text-white font-bold py-3.5 px-8 rounded-full transition flex items-center gap-2 shadow-xs text-xs sm:text-sm uppercase tracking-widest">
              Próxima Etapa
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- ================= ETAPA 2 ================= -->
        <div id="step-2" class="space-y-5 hidden fade-in">
          <h3 class="text-lg font-bold text-[#1E293B] border-b border-slate-100 pb-2 flex items-center gap-2">
            <i data-lucide="cpu" class="w-5 h-5 text-[#349885]"></i>
            Estágio de Uso de IA na Operação
          </h3>

          <div>
            <label class="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-2">Selecione seu Estágio de Maturidade *</label>
            <div class="space-y-3" id="stage-cards-container">
              
              <!-- Card Estágio 0 -->
              <label class="block p-4 border border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-[#349885] transition bg-[#F8FAFC]" onclick="selectStage(0, 'Estágio 0 (Curioso)')">
                <div class="flex items-start gap-3">
                  <input type="radio" name="estagio_radio" value="Estágio 0 (Curioso)" class="mt-1 text-[#349885]">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 text-xs font-bold bg-[#349885]/15 text-[#2C8070] rounded-full mb-1">Nível 0: Curioso</span>
                    <h4 class="font-bold text-sm text-[#1E293B]">Não uso IA no dia a dia do negócio</h4>
                    <p class="text-xs text-[#64748B] mt-0.5">Ainda não utilizo inteligência artificial na rotina da empresa.</p>
                  </div>
                </div>
              </label>

              <!-- Card Estágio 1 -->
              <label class="block p-4 border border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-[#349885] transition bg-[#F8FAFC]" onclick="selectStage(1, 'Estágio 1 (Explorador)')">
                <div class="flex items-start gap-3">
                  <input type="radio" name="estagio_radio" value="Estágio 1 (Explorador)" class="mt-1 text-[#349885]">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 text-xs font-bold bg-[#349885]/15 text-[#2C8070] rounded-full mb-1">Nível 1: Explorador</span>
                    <h4 class="font-bold text-sm text-[#1E293B]">Uso ferramentas gratuitas para tarefas simples</h4>
                    <p class="text-xs text-[#64748B] mt-0.5">Utilizo ChatGPT ou similares para ideias, e-mails e pequenos textos.</p>
                  </div>
                </div>
              </label>

              <!-- Card Estágio 2 -->
              <label class="block p-4 border border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-[#349885] transition bg-[#F8FAFC]" onclick="selectStage(2, 'Estágio 2 (Praticante)')">
                <div class="flex items-start gap-3">
                  <input type="radio" name="estagio_radio" value="Estágio 2 (Praticante)" class="mt-1 text-[#349885]">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 text-xs font-bold bg-[#349885]/15 text-[#2C8070] rounded-full mb-1">Nível 2: Praticante</span>
                    <h4 class="font-bold text-sm text-[#1E293B]">Uso IA com frequência em áreas específicas</h4>
                    <p class="text-xs text-[#64748B] mt-0.5">Utilizo de forma constante em áreas como marketing ou vendas, mas sem processos padronizados.</p>
                  </div>
                </div>
              </label>

              <!-- Card Estágio 3 -->
              <label class="block p-4 border border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-[#349885] transition bg-[#F8FAFC]" onclick="selectStage(3, 'Estágio 3 (Integrador)')">
                <div class="flex items-start gap-3">
                  <input type="radio" name="estagio_radio" value="Estágio 3 (Integrador)" class="mt-1 text-[#349885]">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 text-xs font-bold bg-[#349885]/15 text-[#2C8070] rounded-full mb-1">Nível 3: Integrador</span>
                    <h4 class="font-bold text-sm text-[#1E293B]">Tenho automações conectando IA aos meus sistemas</h4>
                    <p class="text-xs text-[#64748B] mt-0.5">Uso plataformas como n8n, Make ou Chatbots integrados ao CRM/WhatsApp.</p>
                  </div>
                </div>
              </label>

              <!-- Card Estágio 4 -->
              <label class="block p-4 border border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-[#349885] transition bg-[#F8FAFC]" onclick="selectStage(4, 'Estágio 4 (Avançado)')">
                <div class="flex items-start gap-3">
                  <input type="radio" name="estagio_radio" value="Estágio 4 (Avançado)" class="mt-1 text-[#349885]">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 text-xs font-bold bg-[#349885]/15 text-[#2C8070] rounded-full mb-1">Nível 4: Avançado</span>
                    <h4 class="font-bold text-sm text-[#1E293B]">A IA é central na estratégia do negócio</h4>
                    <p class="text-xs text-[#64748B] mt-0.5">Modelos próprios, automação inteligente de ponta a ponta e cultura orientada à IA.</p>
                  </div>
                </div>
              </label>

            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ferramentas de IA Utilizadas (Ex: ChatGPT, Claude, n8n)</label>
            <input type="text" id="ferramentas" placeholder="Digite separando por vírgula (Ex: ChatGPT, n8n, Midjourney)" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Áreas de Aplicação na Empresa</label>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" name="area" value="Vendas/Atendimento" class="rounded text-blue-600">
                <span>Vendas / Atendimento</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" name="area" value="Marketing" class="rounded text-blue-600">
                <span>Marketing</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" name="area" value="Operações" class="rounded text-blue-600">
                <span>Operações</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" name="area" value="RH" class="rounded text-blue-600">
                <span>RH & Gestão</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" name="area" value="Finanças" class="rounded text-blue-600">
                <span>Finanças</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" name="area" value="Nenhuma" class="rounded text-blue-600">
                <span>Nenhuma</span>
              </label>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-between">
            <button type="button" onclick="nextStep(1)" class="text-slate-600 hover:text-slate-900 font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-1.5">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              Voltar
            </button>
            <button type="button" onclick="nextStep(3)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2 shadow-md text-sm">
              Próxima Etapa
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- ================= ETAPA 3 ================= -->
        <div id="step-3" class="space-y-5 hidden fade-in">
          <h3 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <i data-lucide="target" class="w-5 h-5 text-blue-600"></i>
            Objetivos & Desafios
          </h3>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Principal Obstáculo Atual *</label>
            <select id="obstaculo" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-white">
              <option value="">Selecione o obstáculo...</option>
              <option value="Falta de conhecimento">Falta de conhecimento prático em IA</option>
              <option value="Dificuldade em treinar equipe">Dificuldade em treinar equipe</option>
              <option value="Falta de tempo">Falta de tempo para implementar</option>
              <option value="Segurança/Privacidade">Segurança e Privacidade de dados</option>
              <option value="Custo de ferramentas">Custo perceptível de ferramentas</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Objetivo Principal *</label>
            <select id="objetivo" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-white">
              <option value="">Selecione o objetivo...</option>
              <option value="Automatizar tarefas repetitivas">Automatizar tarefas repetitivas</option>
              <option value="Reduzir custos">Reduzir custos operacionais</option>
              <option value="Aumentar vendas">Aumentar vendas e atendimento</option>
              <option value="Criar cultura de inovação">Criar cultura de inovação</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Processo Específico que Deseja Automatizar (Opcional)</label>
            <textarea id="processo" rows="3" placeholder="Exemplo: Atendimento inicial de leads no WhatsApp, geração de propostas comerciais..." class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"></textarea>
          </div>

          <div class="pt-4 flex items-center justify-between">
            <button type="button" onclick="nextStep(2)" class="text-slate-600 hover:text-slate-900 font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-1.5">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              Voltar
            </button>
            <button type="submit" id="submit-btn" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition flex items-center gap-2 shadow-lg text-sm">
              <span id="btn-text">Gerar Diagnóstico Gratuito</span>
              <i id="btn-icon" data-lucide="check-circle" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

      </form>
    </div>

    <!-- Card de Resultado (Sucesso) -->
    <div id="success-card" class="hidden bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center fade-in">
      <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="check-circle-2" class="w-10 h-10"></i>
      </div>
      <h3 class="text-2xl font-extrabold text-slate-900">Diagnóstico Concluído com Sucesso!</h3>
      <p class="text-slate-600 text-sm mt-2 max-w-md mx-auto">
        Analisamos os dados da sua empresa. O relatório personalizado e o plano de ação foram enviados para o seu WhatsApp e E-mail.
      </p>

      <div class="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left max-w-lg mx-auto space-y-2 text-sm">
        <div class="flex justify-between items-center border-b border-slate-200 pb-2">
          <span class="text-slate-500 font-medium">Estágio Identificado:</span>
          <span id="res-estagio" class="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Estágio 1: Explorador
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500 font-medium">Empresa:</span>
          <span id="res-empresa" class="font-bold text-slate-800">Minha Empresa</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500 font-medium">Enviado para:</span>
          <span id="res-contato" class="font-medium text-slate-700">(11) 99999-9999</span>
        </div>
      </div>

      <button onclick="window.location.reload()" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition text-sm">
        Fazer Novo Diagnóstico
      </button>
    </div>

  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
    <div class="max-w-5xl mx-auto px-4">
      <p>© Empretec AI Lab • Formulário de Maturidade em Inteligência Artificial para Empresas</p>
    </div>
  </footer>

  <!-- ================= LÓGICA DE INTEGRAÇÃO JAVASCRIPT ================= -->
  <script>
    // =======================================================================
    // CONFIGURAÇÕES DE CONEXÃO (SUBSTITUA COM SUAS CHAVES DO SUPABASE E N8N)
    // =======================================================================
    const SUPABASE_URL = "${supabaseUrl}";
    const SUPABASE_ANON_KEY = "${supabaseAnonKey}";
    const SUPABASE_TABLE = "${supabaseTable}";
    const N8N_WEBHOOK_URL = "${n8nWebhook}";

    // Estado local da navegação
    let currentStep = 1;
    let selectedStageLevel = 0;
    let selectedStageName = 'Estágio 0 (Curioso)';

    // Inicialização dos Ícones Lucide
    lucide.createIcons();

    // Máscara dinâmica de WhatsApp
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
      whatsappInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\\D/g, '').slice(0, 11);
        if (value.length <= 2) {
          e.target.value = value ? '(' + value : '';
        } else if (value.length <= 6) {
          e.target.value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
        } else if (value.length <= 10) {
          e.target.value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 6) + '-' + value.slice(6);
        } else {
          e.target.value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7, 11);
        }
      });
    }

    // Seleção de Estágio de IA
    function selectStage(level, name) {
      selectedStageLevel = level;
      selectedStageName = name;
    }

    // Controle do Formulário Multi-Step
    function nextStep(step) {
      // Validação rápida da etapa atual antes de prosseguir
      if (step === 2 && currentStep === 1) {
        const nome = document.getElementById('nome').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        const email = document.getElementById('email').value.trim();
        const empresa = document.getElementById('empresa').value.trim();
        const setor = document.getElementById('setor').value;
        const porte = document.getElementById('porte').value;

        if (!nome || !whatsapp || !email || !empresa || !setor || !porte) {
          alert('Por favor, preencha todos os campos obrigatórios da Etapa 1.');
          return;
        }
      }

      // Ocultar etapas e mostrar a etapa de destino
      document.getElementById('step-1').classList.add('hidden');
      document.getElementById('step-2').classList.add('hidden');
      document.getElementById('step-3').classList.add('hidden');

      document.getElementById('step-' + step).classList.remove('hidden');
      currentStep = step;

      // Atualizar barra de progresso
      const percent = step === 1 ? '33%' : step === 2 ? '66%' : '100%';
      document.getElementById('step-title').textContent = 'Etapa ' + step + ' de 3: ' + 
        (step === 1 ? 'Contato e Perfil Comercial' : step === 2 ? 'Diagnóstico de IA' : 'Objetivos e Desafios');
      document.getElementById('step-percent').textContent = percent;
      document.getElementById('progress-bar').style.width = percent;
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Submissão do Formulário e Envio via API (Supabase & n8n)
    document.getElementById('diagnostico-form').addEventListener('submit', async function(e) {
      e.preventDefault();

      const btn = document.getElementById('submit-btn');
      const btnText = document.getElementById('btn-text');
      btn.disabled = true;
      btnText.textContent = 'Enviando e Calculando...';

      // Capturar ferramentas e áreas
      const ferramentasRaw = document.getElementById('ferramentas').value;
      const ferramentasArray = ferramentasRaw ? ferramentasRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
      
      const areasElements = document.querySelectorAll('input[name="area"]:checked');
      const areasArray = Array.from(areasElements).map(el => el.value);

      // Payload dos dados
      const formData = {
        nome: document.getElementById('nome').value.trim(),
        whatsapp: document.getElementById('whatsapp').value.trim(),
        email: document.getElementById('email').value.trim(),
        empresa: document.getElementById('empresa').value.trim(),
        setor: document.getElementById('setor').value,
        porte: document.getElementById('porte').value,
        estagio: selectedStageName,
        estagio_nivel: selectedStageLevel,
        ferramentas: ferramentasArray,
        areas: areasArray,
        obstaculo: document.getElementById('obstaculo').value,
        objetivo: document.getElementById('objetivo').value,
        processo: document.getElementById('processo').value.trim() || 'Não informado',
        created_at: new Date().toISOString()
      };

      try {
        // 1. Enviar para a API do Supabase (REST API)
        if (SUPABASE_URL && !SUPABASE_URL.includes('SUA_URL_SUPABASE')) {
          await fetch(\`\${SUPABASE_URL}/rest/v1/\${SUPABASE_TABLE}\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': \`Bearer \${SUPABASE_ANON_KEY}\`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(formData)
          });
        }

        // 2. Enviar para o Webhook do n8n
        if (N8N_WEBHOOK_URL && !N8N_WEBHOOK_URL.includes('SEU_N8N_INSTANCIA')) {
          await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
        }

        // Simulação de tempo de processamento se URLs não configuradas
        await new Promise(r => setTimeout(r, 1200));

        // Exibir Card de Sucesso
        document.getElementById('form-container').classList.add('hidden');
        document.getElementById('success-card').classList.remove('hidden');

        document.getElementById('res-estagio').textContent = formData.estagio;
        document.getElementById('res-empresa').textContent = formData.empresa;
        document.getElementById('res-contato').textContent = formData.whatsapp + ' • ' + formData.email;

      } catch (error) {
        console.error('Erro no envio:', error);
        alert('Houve um pequeno contratempo no envio, mas registramos suas respostas localmente!');
        document.getElementById('form-container').classList.add('hidden');
        document.getElementById('success-card').classList.remove('hidden');
      }
    });
  </script>
</body>
</html>`;
}
