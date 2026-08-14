import { FormData } from '../types';

/**
 * Formats phone input to Brazilian WhatsApp format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export function formatWhatsApp(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Calculates a maturity percentage score (0 to 100%) based on form data
 */
export function calculateMaturityScore(data: FormData): number {
  let score = 0;

  // Base score from stage (0 to 40 points)
  score += data.estagioNivel * 10;

  // Tools used (up to 20 points)
  const toolCount = data.ferramentas.length;
  score += Math.min(toolCount * 5, 20);

  // Application areas (up to 25 points)
  const nonNoneAreas = data.areas.filter(a => a !== 'Nenhuma área por enquanto');
  score += Math.min(nonNoneAreas.length * 5, 25);

  // Objective clarity (15 points)
  if (data.objetivo) score += 15;

  return Math.min(score, 100);
}

/**
 * Generates custom Empretec recommendations based on AI stage and obstacle
 */
export function getRecommendations(data: FormData) {
  const recommendations: string[] = [];

  if (data.estagioNivel === 0) {
    recommendations.push("Participe de um workshop prático de 'IA para Empreendedores' focado em prompts de produtividade para o dia a dia.");
    recommendations.push("Mapeie 3 tarefas manuais que consomem mais de 1 hora por dia e teste o ChatGPT/Gemini gratuitamente.");
  } else if (data.estagioNivel === 1) {
    recommendations.push("Crie um repositório de Prompts Padrão (SOPs com IA) para sua equipe utilizar no atendimento e marketing.");
    recommendations.push("Explore ferramentas como Claude para análise de textos longos e contratos, e Midjourney/Ideogram para peças visuais.");
  } else if (data.estagioNivel === 2) {
    recommendations.push("Passe do uso manual para a automação: conecte seu formulário ou WhatsApp a uma ferramenta de automação (ex: n8n ou Make).");
    recommendations.push("Defina diretrizes claras de privacidade e uso ético de dados de clientes no uso de IA pela equipe.");
  } else if (data.estagioNivel >= 3) {
    recommendations.push("Crie um Chatbot de IA com base de conhecimento própria (RAG) treinado com a FAQ e catálogo de produtos do seu negócio.");
    recommendations.push("Implemente agentes inteligentes autônomos para qualificação de leads e acompanhamento de funil de vendas.");
  }

  if (data.obstaculo.includes('conhecimento')) {
    recommendations.push("Acelere o aprendizado com capacitações focadas na metodologia Empretec aplicadas à tecnologia e inovação.");
  } else if (data.obstaculo.includes('equipe')) {
    recommendations.push("Proporcione aos colaboradores pequenos desafios práticos com premiações para incentivar o uso diário de IA.");
  } else if (data.obstaculo.includes('tempo')) {
    recommendations.push("Priorize a automação do canal de entrada de clientes (WhatsApp / Direct) para recuperar até 10 horas semanais do time.");
  }

  return recommendations;
}
