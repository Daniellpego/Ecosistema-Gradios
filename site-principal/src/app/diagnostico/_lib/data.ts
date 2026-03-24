/* ════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════ */

export type Phase = "intro" | "quiz" | "capture" | "loading" | "result";

export interface Question {
  id: string;
  categoria: string;
  pergunta: string;
  sub: string;
  tipo: "single" | "multi";
  opcoes: string[];
  scores: number[] | null;
  horasMap?: string[];
  /** Micro-reaction text shown after selecting a high-impact option */
  reactions?: Record<number, string>;
}

export interface LeadData {
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
}

export interface TierInfo {
  label: string;
  tier: string;
  color: string;
}

/* ════════════════════════════════════════════════════════════
   QUESTIONS DATA
   ════════════════════════════════════════════════════════════ */

export const QUESTIONS: Question[] = [
  {
    id: "cargo",
    categoria: "Perfil",
    pergunta: "Com quem a gente está falando?",
    sub: "Porque o diagnóstico de um CEO é diferente do de um analista.",
    tipo: "single",
    opcoes: [
      "Sócio(a)/Fundador(a)",
      "Diretor(a)/CEO/C-level",
      "Head/Gerente",
      "Coordenador(a)",
      "Analista/Operação",
      "Outro",
    ],
    scores: [10, 10, 8, 5, 0, 3],
    reactions: {
      0: "Quem decide está respondendo. O diagnóstico vai direto ao ponto.",
      1: "Perfil decisor. Vamos focar em números e impacto financeiro.",
    },
  },
  {
    id: "tamanho",
    categoria: "Empresa",
    pergunta: "Qual é o porte da empresa hoje?",
    sub: "Cada tamanho tem gargalos diferentes — e soluções diferentes.",
    tipo: "single",
    opcoes: ["Até 10", "11 a 50", "51 a 200", "201 a 500", "Mais de 500"],
    scores: [2, 5, 12, 18, 20],
    reactions: {
      2: "Nessa faixa, cada processo manual custa proporcionalmente mais. Vamos medir.",
      3: "200+ pessoas. Um gargalo que custa 2h/dia = 400h/mês de empresa. Vamos calcular.",
      4: "Escala grande. Qualquer ineficiência se multiplica. Bom contexto para o diagnóstico.",
    },
  },
  {
    id: "setor",
    categoria: "Empresa",
    pergunta: "Em qual setor vocês atuam?",
    sub: "Cada setor tem seus gargalos típicos — a gente conhece todos.",
    tipo: "single",
    opcoes: [
      "Varejo/E-commerce",
      "Indústria/Manufatura",
      "Logística/Distribuição",
      "Saúde/Clínicas",
      "Financeiro/Contabilidade",
      "SaaS/Tecnologia",
      "Serviços em geral",
      "Outro",
    ],
    scores: null,
  },
  {
    id: "gargalos",
    categoria: "Operação",
    pergunta: "Onde estão os maiores gargalos da operação hoje?",
    sub: "Selecione tudo que se aplica — seja honesto, quanto mais marcar, mais preciso o diagnóstico.",
    tipo: "multi",
    opcoes: [
      "Financeiro — fechamentos manuais",
      "Comercial — CRM desatualizado",
      "Atendimento — respostas lentas",
      "Operações — dependem de pessoas",
      "Logística/Estoque — planilha como sistema",
      "RH — onboarding manual",
      "Dados/Relatórios — fechamento leva dias",
    ],
    scores: null,
    reactions: {
      4: "Planilha como sistema é o gargalo mais comum que a gente resolve.",
      6: "Relatórios lentos = decisões atrasadas. Isso tem custo.",
    },
  },
  {
    id: "processos",
    categoria: "Operação",
    pergunta: "Quantos processos dependem de digitação manual hoje?",
    sub: "Aqueles que param se a pessoa-chave tirar férias.",
    tipo: "single",
    opcoes: ["Nenhum", "1 a 2", "3 a 5", "6 a 10", "Mais de 10"],
    scores: [0, 5, 12, 18, 20],
    reactions: {
      3: "6-10 processos manuais. Equivale a pelo menos 1 pessoa em tempo integral só nisso.",
      4: "+10 processos. Se alguém sai de férias, o que para?",
    },
  },
  {
    id: "sistemas",
    categoria: "Operação",
    pergunta: "Quantos sistemas não conversam entre si?",
    sub: "ERP sem CRM. Planilha paralela. O sistema que só o João sabe usar.",
    tipo: "single",
    opcoes: [
      "Poucos sistemas",
      "2 a 3 parcialmente integrados",
      "4 a 6 desconectados",
      "7 ou mais",
    ],
    scores: [3, 8, 13, 15],
    reactions: {
      2: "4-6 sistemas sem integração. Dado entra num, não chega no outro.",
      3: "7+ sistemas. Cada um é uma ilha. Isso custa caro.",
    },
  },
  {
    id: "tempo",
    categoria: "Operação",
    pergunta: "Quanto tempo por semana vai para retrabalho manual?",
    sub: "Esse número vai aparecer no seu diagnóstico — e o custo em reais.",
    tipo: "single",
    opcoes: ["Menos de 5h", "5 a 15h", "16 a 40h", "Mais de 40h"],
    scores: [3, 8, 13, 15],
    horasMap: ["~20h", "~40-60h", "~65-160h", "+160h"],
    reactions: {
      2: "16-40h/semana = R$ 3.000-8.000/mês em salário queimado com retrabalho.",
      3: "+40h/semana. Você está pagando um CLT inteiro para fazer o que um script faz em segundos.",
    },
  },
  {
    id: "impactos",
    categoria: "Operação",
    pergunta: "O que esse cenário causa na prática?",
    sub: "Selecione tudo que acontece com frequência na operação.",
    tipo: "multi",
    opcoes: [
      "Atrasos em entregas",
      "Erros por dado desatualizado",
      "Decisões sem dado em tempo real",
      "Custo alto com equipe em tarefas automáticas",
      "Perda de cliente por lentidão",
      "Dificuldade de escalar",
    ],
    scores: null,
    reactions: {
      4: "Cliente perdido por lentidão não aparece no DRE, mas destrói o MRR.",
      5: "Sem escalar, receita tem teto. Automação remove o teto sem contratar.",
    },
  },
  {
    id: "urgencia",
    categoria: "Prioridade",
    pergunta: "Quando vocês precisam resolver isso?",
    sub: "Sem julgamento — define como a gente prioriza a recomendação.",
    tipo: "single",
    opcoes: [
      "Só estou mapeando",
      "Próximos 6 meses",
      "Próximos 3 meses",
      "Próximos 30 dias",
      "Prioridade imediata",
    ],
    scores: [1, 4, 7, 9, 10],
    reactions: {
      3: "30 dias. Janela curta. Vamos priorizar o que dá resultado mais rápido.",
      4: "Prioridade imediata. O diagnóstico vai mostrar exatamente o primeiro passo.",
    },
  },
  {
    id: "prioridade",
    categoria: "Prioridade",
    pergunta: "Se a Gradios resolvesse uma coisa agora, o que seria?",
    sub: "Define a recomendação personalizada do seu diagnóstico.",
    tipo: "single",
    opcoes: [
      "Eliminar processos manuais",
      "Integrar sistemas",
      "Software sob medida",
      "Dashboard e KPIs",
      "IA no atendimento/análise",
      "Ainda não sei",
    ],
    scores: null,
    reactions: {
      0: "Processos manuais primeiro. Menor investimento, maior retorno. Escolha certa.",
      4: "IA aplicada. Temos cases rodando com Groq + n8n. O diagnóstico vai detalhar.",
    },
  },
];

/* ════════════════════════════════════════════════════════════
   CATEGORY TRANSITIONS
   ════════════════════════════════════════════════════════════ */

export interface CategoryTransition {
  fromCategoria: string;
  toCategoria: string;
  title: string;
  subtitle: string;
  icon: string; // SVG path
}

export const CATEGORY_TRANSITIONS: CategoryTransition[] = [
  {
    fromCategoria: "Empresa",
    toCategoria: "Operação",
    title: "Perfil mapeado",
    subtitle: "Agora vamos entender onde sua operação trava no dia a dia.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    fromCategoria: "Operação",
    toCategoria: "Prioridade",
    title: "Cenário identificado",
    subtitle: "Faltam 2 perguntas. Vamos definir o que atacar primeiro.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
];

/* ════════════════════════════════════════════════════════════
   SCORE CALCULATION
   ════════════════════════════════════════════════════════════ */

export function multiScore(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 3;
  if (count <= 5) return 5;
  return 7;
}

export function calculateScore(answers: Record<string, number[]>): number {
  let raw = 0;

  if (answers.cargo?.[0] != null) raw += [10, 10, 8, 5, 0, 3][answers.cargo[0]];
  if (answers.tamanho?.[0] != null) raw += [2, 5, 12, 18, 20][answers.tamanho[0]];
  if (answers.gargalos) raw += multiScore(answers.gargalos.length);
  if (answers.processos?.[0] != null) raw += [0, 5, 12, 18, 20][answers.processos[0]];
  if (answers.sistemas?.[0] != null) raw += [3, 8, 13, 15][answers.sistemas[0]];
  if (answers.tempo?.[0] != null) raw += [3, 8, 13, 15][answers.tempo[0]];
  if (answers.impactos) raw += multiScore(answers.impactos.length);
  if (answers.urgencia?.[0] != null) raw += [1, 4, 7, 9, 10][answers.urgencia[0]];

  let score = Math.min(100, Math.round((raw / 94) * 100));

  // Soft penalty: Analista/Operação → -20 pontos (ainda pode subir de tier)
  if (answers.cargo?.[0] === 4) score = Math.max(0, score - 20);
  // Soft penalty: "Até 10" funcionários → -15 pontos
  if (answers.tamanho?.[0] === 0) score = Math.max(0, score - 15);
  // Urgência imediata garante mínimo Tier B
  if (answers.urgencia?.[0] === 4) score = Math.max(score, 55);

  return score;
}

export function getTier(score: number): TierInfo {
  if (score >= 75) return { label: "Potencial Alto", tier: "A", color: "#16a34a" };
  if (score >= 55) return { label: "Potencial Moderado", tier: "B", color: "#d97706" };
  if (score >= 40) return { label: "Potencial Inicial", tier: "C", color: "#0A1B5C" };
  return { label: "Em Desenvolvimento", tier: "D", color: "#64748B" };
}

/** Calculate partial score from current answers (for live progress) */
export function calculatePartialScore(answers: Record<string, number[]>): number {
  let answeredScored = 0;
  let raw = 0;

  if (answers.cargo?.[0] != null) { raw += [10, 10, 8, 5, 0, 3][answers.cargo[0]]; answeredScored++; }
  if (answers.tamanho?.[0] != null) { raw += [2, 5, 12, 18, 20][answers.tamanho[0]]; answeredScored++; }
  if (answers.processos?.[0] != null) { raw += [0, 5, 12, 18, 20][answers.processos[0]]; answeredScored++; }
  if (answers.sistemas?.[0] != null) { raw += [3, 8, 13, 15][answers.sistemas[0]]; answeredScored++; }
  if (answers.tempo?.[0] != null) { raw += [3, 8, 13, 15][answers.tempo[0]]; answeredScored++; }
  if (answers.urgencia?.[0] != null) { raw += [1, 4, 7, 9, 10][answers.urgencia[0]]; answeredScored++; }
  if (answers.gargalos) raw += multiScore(answers.gargalos.length);
  if (answers.impactos) raw += multiScore(answers.impactos.length);

  if (answeredScored === 0) return 0;
  return Math.min(100, Math.round((raw / 94) * 100));
}

/* ════════════════════════════════════════════════════════════
   SECTOR CONTEXT FOR AI PROMPT
   ════════════════════════════════════════════════════════════ */

export const SECTOR_CONTEXT: Record<string, string> = {
  "Varejo/E-commerce":
    "Sistemas como VTEX, Tiny, Bling, Shopify raramente conversam com o financeiro sem integração. Gargalo típico: pedido entra, estoque não atualiza, NF emitida manualmente. Divergência de estoque vira rotina. Resultado esperado com automação: fechamento de 3 dias para 2 horas, eliminação de divergência de estoque, pedido→estoque→financeiro rodando sem intervenção humana.",
  "Indústria/Manufatura":
    "ERP existe (Totvs, SAP, Senior) mas não está integrado ao chão de fábrica. Apontamento de produção manual, OEE invisível, relatórios de produção chegam com 24-48h de atraso. Decisões tomadas com dados de ontem. Resultado esperado: visibilidade em tempo real do chão de fábrica, redução de 40% no retrabalho, relatórios automáticos no fechamento do turno.",
  "Logística/Distribuição":
    "Emissão manual de NF + comunicação com transportadora feita uma por uma. WMS não conectado ao ERP do cliente. Rastreamento depende de ligação. Resultado esperado: eliminar 80% das ligações de status, NF emitida automaticamente ao confirmar pedido, tracking integrado ao sistema do cliente.",
  "Saúde/Clínicas":
    "Confirmação de consulta ainda por ligação manual, prontuário + agendamento + faturamento em sistemas separados, risco de glosa no faturamento ao plano de saúde. Retrabalho constante na conciliação. Resultado esperado: redução de 35% no no-show com confirmação automática, aceleração do ciclo de recebimento, faturamento ao convênio sem retrabalho.",
  "Financeiro/Contabilidade":
    "Case real da Gradios — fechamento mensal de 3 dias para 4 horas com automação de conciliação bancária e fluxo de aprovações. Lançamentos manuais e relatórios gerenciais sempre atrasados. Planilhas paralelas como fonte de verdade. Resultado esperado: conciliação automática, relatórios em tempo real, fluxo de aprovação digital sem e-mail.",
  "SaaS/Tecnologia":
    "Onboarding do cliente manual e lento, integração CRM (HubSpot, Pipedrive) + billing (Stripe, Iugu) + suporte feita por gambiarras ou Zapier frágil. CS sem visão completa do cliente. Resultado esperado: redução de 50% no time-to-value, CS com dashboard unificado, churn detectado antes de acontecer.",
  "Serviços em geral":
    "Proposta + contrato + NF + cobrança ainda por e-mail manual, follow-up dependente de memória, CRM inexistente ou subutilizado. Vendedor gasta mais tempo em admin do que vendendo. Resultado esperado: ciclo de vendas 30% mais rápido com fluxo automatizado de proposta→contrato→NF→cobrança.",
  Outro:
    "Diagnóstico consultivo amplo, foco nos gargalos específicos mencionados pelo lead. Análise cruzada entre processos manuais, sistemas desconectados e impacto financeiro do retrabalho.",
};

/* ════════════════════════════════════════════════════════════
   ROI CALCULATION
   ════════════════════════════════════════════════════════════ */

/** Average hourly cost by sector (CLT, BRL, including encargos ~1.8x) */
const SECTOR_HOURLY_COST: Record<string, number> = {
  "Varejo/E-commerce": 32,
  "Indústria/Manufatura": 41,
  "Logística/Distribuição": 35,
  "Saúde/Clínicas": 45,
  "Financeiro/Contabilidade": 54,
  "SaaS/Tecnologia": 63,
  "Serviços em geral": 36,
  Outro: 38,
};

/** Monthly hours wasted by tempo answer index */
const HOURS_PER_MONTH = [20, 50, 112, 180];

export function calculateROI(answers: Record<string, number[]>): {
  monthlyHours: number;
  monthlyCost: number;
  annualCost: number;
  hourlyCost: number;
} | null {
  const tempoIdx = answers.tempo?.[0];
  const setorIdx = answers.setor?.[0];
  if (tempoIdx == null) return null;

  const setor = setorIdx != null ? QUESTIONS[2].opcoes[setorIdx] : "Outro";
  const hourlyCost = SECTOR_HOURLY_COST[setor] ?? 38;
  const monthlyHours = HOURS_PER_MONTH[tempoIdx] ?? 20;
  const monthlyCost = Math.round(monthlyHours * hourlyCost * 0.8);
  const annualCost = monthlyCost * 12;

  return { monthlyHours, monthlyCost, annualCost, hourlyCost };
}

/* ════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════ */

/** Detect if lead is an Analista (champion routing) */
export function isAnalista(answers: Record<string, number[]>): boolean {
  return answers.cargo?.[0] === 4;
}

/** Detect if lead is micro company (≤10 employees) */
export function isMicroEmpresa(answers: Record<string, number[]>): boolean {
  return answers.tamanho?.[0] === 0;
}

export function getOptionText(questionId: string, answerIndex: number | undefined): string {
  if (answerIndex == null) return "Não informado";
  const q = QUESTIONS.find((q) => q.id === questionId);
  return q?.opcoes[answerIndex] ?? "Não informado";
}

export function getMultiOptionTexts(questionId: string, answerIndexes: number[] | undefined): string[] {
  if (!answerIndexes || answerIndexes.length === 0) return [];
  const q = QUESTIONS.find((q) => q.id === questionId);
  if (!q) return [];
  return answerIndexes.map((i) => q.opcoes[i]).filter(Boolean);
}

export function getHorasMes(tempoIndex: number | undefined): string {
  if (tempoIndex == null) return "Não informado";
  return ["~20h/mês", "~40-60h/mês", "~65-160h/mês", "+160h/mês"][tempoIndex] ?? "Não informado";
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
