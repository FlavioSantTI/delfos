import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LandingPage } from './components/LandingPage';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Step1Contact } from './components/Step1Contact';
import { Step2Diagnosis } from './components/Step2Diagnosis';
import { Step3Goals } from './components/Step3Goals';
import { SuccessCard } from './components/SuccessCard';
import { ProgressBar } from './components/ProgressBar';
import { IntegrationModal } from './components/IntegrationModal';
import { HtmlExportModal } from './components/HtmlExportModal';
import { ReportsView } from './components/ReportsView';
import { ArrowLeft } from 'lucide-react';
import { FormData, IntegrationConfig, SubmissionResult } from './types';
import { calculateMaturityScore, isValidEmail, isValidPhone } from './utils/mask';
import { saveDiagnosticoToSupabase } from './lib/supabase';

const DEFAULT_CONFIG: IntegrationConfig = {
  postgresDbUrl: 'postgresql://questionario:Favuca%401970@PostGres:5432/DB_Automacoes',
  supabaseUrl: 'https://rbcghgztrbggtonvorsr.supabase.co',
  supabaseAnonKey: 'sb_publishable_VpSgH8HokATbjmALM54WWw_cgN7m4c8',
  supabaseTable: 'diagnostico_ia',
  n8nWebhookUrl: 'https://n8n.suaempresa.com/webhook/diagnostico-ia'
};

const INITIAL_FORM_DATA: FormData = {
  nome: '',
  whatsapp: '',
  email: '',
  empresa: '',
  setor: '',
  porte: '',
  estagio: 'Estágio 0 (Curioso)',
  estagioNivel: 0,
  ferramentas: [],
  areas: [],
  obstaculo: '',
  objetivo: '',
  processo: '',
  lgpdConsent: true
};

export default function App() {
  // Check if session is already authenticated for admin
  const isSessionAdmin = typeof window !== 'undefined' && sessionStorage.getItem('admin_authenticated') === 'true';

  const checkInitialAdminMode = () => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    return (
      (search.includes('admin') || search.includes('relatorio') || hash.includes('admin') || pathname.startsWith('/admin')) &&
      isSessionAdmin
    );
  };

  const [isAdminMode, setIsAdminMode] = useState<boolean>(checkInitialAdminMode);
  const [currentTab, setCurrentTab] = useState<'diagnostico' | 'relatorio'>(
    checkInitialAdminMode() ? 'relatorio' : 'diagnostico'
  );
  const [viewMode, setViewMode] = useState<'landing' | 'wizard'>('landing');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState<boolean>(false);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState<boolean>(false);

  // Toggle or Request Admin Mode with Authentication Gate
  const handleRequestAdminMode = (enableAdmin: boolean) => {
    if (!enableAdmin) {
      setIsAdminMode(false);
      setCurrentTab('diagnostico');
      return;
    }

    const authenticated = sessionStorage.getItem('admin_authenticated') === 'true';
    if (authenticated) {
      setIsAdminMode(true);
      setCurrentTab('relatorio');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthModalOpen(false);
    setIsAdminMode(true);
    setCurrentTab('relatorio');
  };

  const handleStartDiagnosis = () => {
    setViewMode('wizard');
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy WhatsApp Public Link
  const handleCopyPublicLink = () => {
    const publicUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Config State
  const [config, setConfig] = useState<IntegrationConfig>(() => {
    try {
      const saved = localStorage.getItem('empretec_ai_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const handleSaveConfig = (newConfig: IntegrationConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('empretec_ai_config', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  const isConfigured = Boolean(
    config.supabaseUrl &&
    !config.supabaseUrl.includes('sua-url-supabase') &&
    config.supabaseAnonKey &&
    !config.supabaseAnonKey.includes('sua-anon-key')
  );

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.nome.trim()) {
      errs.nome = 'Informe seu nome completo';
    }
    if (!formData.whatsapp.trim() || !isValidPhone(formData.whatsapp)) {
      errs.whatsapp = 'Informe um WhatsApp válido com DDD';
    }
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      errs.email = 'Informe um endereço de e-mail corporativo válido';
    }
    if (!formData.empresa.trim()) {
      errs.empresa = 'Informe o nome da sua empresa';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.estagio) {
      errs.estagio = 'Selecione o estágio atual da sua empresa';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.obstaculo) {
      errs.obstaculo = 'Selecione seu maior obstáculo';
    }
    if (!formData.objetivo) {
      errs.objetivo = 'Selecione seu objetivo principal';
    }
    if (formData.lgpdConsent === false) {
      errs.lgpdConsent = 'É necessário concordar com os termos de privacidade para gerar o diagnóstico';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleBackToLanding();
    }
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!validateStep3()) return;

    setIsSubmitting(true);
    const score = calculateMaturityScore(formData);
    const submissionId = `DIAG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      const serverRes = await saveDiagnosticoToSupabase(formData, score, config.supabaseUrl, config.supabaseAnonKey);

      const resolvedId = serverRes.data?.id || submissionId;

      setSubmissionResult({
        id: resolvedId,
        score: score,
        data: { ...formData },
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        postgresSuccess: serverRes.success,
        supabaseSuccess: serverRes.success,
        n8nSuccess: true,
        mensagem: serverRes.success 
          ? 'Diagnóstico processado com sucesso e salvo com segurança!' 
          : (serverRes.error ? `Processado localmente (${serverRes.error})` : 'Diagnóstico processado localmente.')
      });

    } catch (error: any) {
      console.error('Falha na submissão:', error);
      setSubmissionResult({
        id: submissionId,
        score: score,
        data: { ...formData },
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        postgresSuccess: false,
        supabaseSuccess: false,
        n8nSuccess: false,
        mensagem: error?.message || 'Diagnóstico processado localmente.'
      });
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setSubmissionResult(null);
    setCurrentStep(1);
    setErrors({});
    setViewMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F9FA] text-[#1E293B] font-sans antialiased">
      
      {/* Header Navbar */}
      <Header
        onOpenIntegrationModal={() => setIsIntegrationModalOpen(true)}
        onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
        isConfigured={isConfigured}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        isAdminMode={isAdminMode}
        onToggleAdminMode={handleRequestAdminMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Admin Bar Notification */}
        {isAdminMode && (
          <div className="mb-6 bg-[#2A3A4A] text-white p-4 rounded-2xl border border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#349885] animate-pulse shrink-0"></span>
              <span className="text-xs font-semibold text-[#A0B2C6]">
                Painel Administrativo ativo • <strong className="text-white">Flávio Santiago ConsultorIA</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyPublicLink}
                className="bg-[#349885] hover:bg-[#2C8070] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copiedLink ? 'Link Copiado! ✓' : 'Copiar Link para WhatsApp'}
              </button>
              <button
                onClick={() => handleRequestAdminMode(false)}
                className="bg-slate-800 hover:bg-slate-700 text-[#A0B2C6] hover:text-white px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                Sair do Admin
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {isAdminMode && currentTab === 'relatorio' ? (
          <ReportsView />
        ) : viewMode === 'landing' && !submissionResult ? (
          /* Fluid Executive Landing Page */
          <LandingPage onStartDiagnosis={handleStartDiagnosis} />
        ) : (
          /* Focused Diagnosis Form Wizard */
          <div className="space-y-4">
            
            {/* Back to landing button */}
            {!submissionResult && (
              <div className="px-2 sm:px-0">
                <button
                  onClick={handleBackToLanding}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para Apresentação</span>
                </button>
              </div>
            )}

            <div className="bg-white sm:rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden max-w-3xl mx-auto">
              
              {/* Focused Form Area */}
              <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
                <div>
                  {/* Progress Bar (hidden on success view) */}
                  {!submissionResult && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200/80 mb-6 bg-[#F8FAFC] shadow-2xs">
                      <ProgressBar currentStep={currentStep} totalSteps={3} />
                    </div>
                  )}

                  {/* Form Views or Success Card */}
                  {submissionResult ? (
                    <SuccessCard
                      result={submissionResult}
                      onReset={handleReset}
                      onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
                    />
                  ) : (
                    <div className="mt-4">
                      {currentStep === 1 && (
                        <Step1Contact
                          formData={formData}
                          onChange={handleFieldChange}
                          onNext={handleNextStep}
                          errors={errors}
                        />
                      )}

                      {currentStep === 2 && (
                        <Step2Diagnosis
                          formData={formData}
                          onChange={handleFieldChange}
                          onNext={handleNextStep}
                          onBack={handleBackStep}
                          errors={errors}
                        />
                      )}

                      {currentStep === 3 && (
                        <Step3Goals
                          formData={formData}
                          onChange={handleFieldChange}
                          onSubmit={handleSubmit}
                          onBack={handleBackStep}
                          isSubmitting={isSubmitting}
                          errors={errors}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Subtext info */}
                {!submissionResult && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                    <span>🔒 Seus dados estão seguros e protegidos pela LGPD.</span>
                    <span className="font-semibold text-[#1E293B]">Flávio Santiago ConsultorIA</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2A3A4A] text-[#A0B2C6] border-t border-slate-700/60 py-6 text-center text-xs">
        <div className="max-w-5xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-white">
            Diagnóstico de Maturidade em IA — by Flávio Santiago ConsultorIA
          </p>
          <p className="text-[#A0B2C6]/80">
            Ferramenta desenvolvida para diagnóstico empresarial e automação estratégica via Supabase REST API & Webhook n8n.
          </p>
          {!isAdminMode && (
            <div className="pt-2">
              <button
                onClick={() => handleRequestAdminMode(true)}
                className="text-[11px] text-[#A0B2C6]/60 hover:text-white underline transition cursor-pointer"
              >
                Área Administrativa (Acesso do Consultor)
              </button>
            </div>
          )}
        </div>
      </footer>

      {/* Modals */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      <IntegrationModal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <HtmlExportModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        config={config}
      />

    </div>
  );
}
