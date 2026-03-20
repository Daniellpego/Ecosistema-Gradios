/* ════════════════════════════════════════════════════════════
   EMAIL NURTURING SEQUENCE — 6 EMAILS × 4 TIERS
   ════════════════════════════════════════════════════════════

   Variáveis dinâmicas:
   {{nome}}              → primeiro nome do lead
   {{empresa}}           → nome da empresa
   {{setor}}             → setor da empresa
   {{cargo}}             → cargo do lead
   {{gargalo_principal}} → primeiro gargalo marcado (sem o sufixo "— ...")
   {{gargalo_2}}         → segundo gargalo marcado (se houver)
   {{horas_semana}}      → horas perdidas por semana (~3h, ~10h, ~28h, 50h+)
   {{horas_mes}}         → horas perdidas por mês
   {{horas_mes_num}}     → número puro (ex: 112)
   {{pct_funcionario}}   → % de um funcionário (horas_mes / 160 × 100)
   {{roi_mensal}}        → custo mensal formatado (R$ X.XXX)
   {{roi_anual}}         → custo anual formatado (R$ XX.XXX)
   {{tier}}              → A, B, C ou D
   {{score}}             → score numérico 0-100
   {{prioridade}}        → prioridade marcada no quiz
   {{diagnostico_url}}   → URL do diagnóstico
   {{whatsapp_url}}      → URL do WhatsApp com mensagem pré-preenchida
   ════════════════════════════════════════════════════════════ */

export interface EmailTemplate {
  id: string;
  day: number;
  subject: Record<string, string>;
  body: Record<string, string>;
}

export const EMAIL_SEQUENCE: EmailTemplate[] = [
  /* ──────────────────────────────────────────────────────────
     EMAIL 1 — Imediato (dispara quando o lead completa o quiz)
     ────────────────────────────────────────────────────────── */
  {
    id: "email_1_resultado",
    day: 0,
    subject: {
      A: "Seu diagnóstico chegou — e o resultado é sério",
      B: "Diagnóstico da {{empresa}} — veja o que encontramos",
      C: "Seu diagnóstico de automação está aqui",
      D: "Seu diagnóstico está pronto, {{nome}}",
    },
    body: {
      A: `{{nome}},

Cruzamos as respostas da {{empresa}} e o cenário é claro.

Vocês perdem {{horas_semana}} por semana com processos manuais. Isso é {{horas_mes}}h por mês — equivalente a {{pct_funcionario}}% de um funcionário inteiro só em retrabalho.

O diagnóstico completo da IA está abaixo. Mas o mais importante: sua empresa está no grupo de potencial alto — o que significa que dá pra resolver isso rápido, com impacto direto na operação.

[Ver diagnóstico completo → {{diagnostico_url}}]

Nos próximos minutos alguém do nosso time vai entrar em contato pelo WhatsApp. Se preferir adiantar:

[Chamar no WhatsApp agora → {{whatsapp_url}}]

Gradios`,

      B: `{{nome}},

Seu diagnóstico da {{empresa}} está pronto.

O resultado mostra potencial real de automação — especialmente nos gargalos que você marcou: {{gargalo_principal}} e {{gargalo_2}}.

[Ver diagnóstico completo → {{diagnostico_url}}]

Esta semana temos algumas vagas para diagnóstico aprofundado por vídeo — 30 minutos, sem compromisso, focado exatamente no que você marcou como prioridade.

[Quero uma vaga → {{whatsapp_url}}]

Gradios`,

      C: `{{nome}},

Diagnóstico da {{empresa}} gerado.

Você está no estágio inicial de automação — o que é normal para empresas do seu porte no setor de {{setor}}.

A boa notícia: as empresas que saem desse estágio geralmente fazem isso com 1 ou 2 automações bem escolhidas, não com um projeto grande.

[Ver diagnóstico completo → {{diagnostico_url}}]

Nos próximos dias vou te mandar um conteúdo específico sobre o que empresas de {{setor}} costumam automatizar primeiro.

Gradios`,

      D: `{{nome}},

Seu diagnóstico está pronto.

Pelo que você respondeu, a {{empresa}} ainda está mapeando as possibilidades — e isso faz sentido. Automação sem clareza de onde dói mais é desperdício de dinheiro.

[Ver diagnóstico completo → {{diagnostico_url}}]

Vou te mandar um guia simples de como identificar os 3 processos que mais valem automatizar primeiro. Sem custo, sem enrolação.

Gradios`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 2 — Dia 2 (aprofunda o maior gargalo)
     ────────────────────────────────────────────────────────── */
  {
    id: "email_2_gargalo",
    day: 2,
    subject: {
      A: "O gargalo que mais custa pra {{empresa}}",
      B: "O gargalo que mais custa pra {{empresa}}",
      C: "Por que {{gargalo_principal}} é mais caro do que parece",
      D: "Por que {{gargalo_principal}} é mais caro do que parece",
    },
    body: {
      A: `{{nome}},

No diagnóstico você marcou {{gargalo_principal}} como um dos maiores problemas.

Esse gargalo específico tem um custo que raramente aparece no financeiro — mas está lá todo mês:

→ Tempo de equipe em tarefa que não agrega valor
→ Erro humano que vira retrabalho lá na frente
→ Decisão tomada com dado desatualizado

Em empresas de {{setor}} com o porte da {{empresa}}, esse gargalo sozinho costuma representar {{roi_mensal}}/mês em custo invisível.

A maioria resolve com uma automação simples de integração. Não precisa de sistema novo. Não precisa de equipe técnica.

[Entender como resolver o meu gargalo → {{whatsapp_url}}]

Gradios`,

      B: `{{nome}},

No diagnóstico você marcou {{gargalo_principal}} como um dos maiores problemas.

Esse gargalo específico tem um custo que raramente aparece no financeiro — mas está lá todo mês:

→ Tempo de equipe em tarefa que não agrega valor
→ Erro humano que vira retrabalho lá na frente
→ Decisão tomada com dado desatualizado

Em empresas de {{setor}} com o porte da {{empresa}}, esse gargalo sozinho costuma representar {{roi_mensal}}/mês em custo invisível.

A maioria resolve com uma automação simples de integração. Não precisa de sistema novo. Não precisa de equipe técnica.

[Entender como resolver o meu gargalo → {{whatsapp_url}}]

Gradios`,

      C: `{{nome}},

No diagnóstico você marcou {{gargalo_principal}} como um dos maiores problemas.

Esse gargalo específico tem um custo que raramente aparece no financeiro — mas está lá todo mês:

→ Tempo de equipe em tarefa que não agrega valor
→ Erro humano que vira retrabalho lá na frente
→ Decisão tomada com dado desatualizado

Em empresas de {{setor}} com o porte da {{empresa}}, esse gargalo sozinho costuma representar {{roi_mensal}}/mês em custo invisível.

A maioria resolve com uma automação simples de integração. Não precisa de sistema novo. Não precisa de equipe técnica.

[Entender como resolver o meu gargalo → {{whatsapp_url}}]

Gradios`,

      D: `{{nome}},

No diagnóstico você marcou {{gargalo_principal}} como um dos maiores problemas.

Esse gargalo específico tem um custo que raramente aparece no financeiro — mas está lá todo mês:

→ Tempo de equipe em tarefa que não agrega valor
→ Erro humano que vira retrabalho lá na frente
→ Decisão tomada com dado desatualizado

Em empresas de {{setor}} com o porte da {{empresa}}, esse gargalo sozinho costuma representar {{roi_mensal}}/mês em custo invisível.

A maioria resolve com uma automação simples de integração. Não precisa de sistema novo. Não precisa de equipe técnica.

[Entender como resolver o meu gargalo → {{whatsapp_url}}]

Gradios`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 3 — Dia 4 (case do setor)
     ────────────────────────────────────────────────────────── */
  {
    id: "email_3_case",
    day: 4,
    subject: {
      A: "Como uma empresa de {{setor}} eliminou {{horas_semana}} de retrabalho por semana",
      B: "Como uma empresa de {{setor}} eliminou {{horas_semana}} de retrabalho por semana",
      C: "Como uma empresa de {{setor}} eliminou {{horas_semana}} de retrabalho por semana",
      D: "Como uma empresa de {{setor}} eliminou {{horas_semana}} de retrabalho por semana",
    },
    body: {
      A: `{{nome}},

Um caso real que talvez faça sentido pra {{empresa}}.

Uma empresa de {{setor}} com porte parecido com o de vocês tinha exatamente o problema que você marcou: {{gargalo_principal}}.

O que a gente fez:
→ Mapeamos o fluxo que causava o gargalo (2 dias)
→ Construímos a integração entre os sistemas existentes (1 semana)
→ Testamos e ajustamos (3 dias)

Resultado: o processo que causava {{gargalo_principal}} passou a rodar sem intervenção manual. Mesma equipe. Mesmo sistema. Só conectamos o que já existia.

Não trocamos nenhum sistema. Não contratamos ninguém.

Se quiser ver como aplicar isso na {{empresa}}:

[Quero ver como funciona pra mim → {{whatsapp_url}}]

Gradios`,

      B: `{{nome}},

Um caso real que talvez faça sentido pra {{empresa}}.

Uma empresa de {{setor}} com porte parecido com o de vocês tinha exatamente o problema que você marcou: {{gargalo_principal}}.

O que a gente fez:
→ Mapeamos o fluxo que causava o gargalo (2 dias)
→ Construímos a integração entre os sistemas existentes (1 semana)
→ Testamos e ajustamos (3 dias)

Resultado: o processo que causava {{gargalo_principal}} passou a rodar sem intervenção manual. Mesma equipe. Mesmo sistema. Só conectamos o que já existia.

Não trocamos nenhum sistema. Não contratamos ninguém.

Se quiser ver como aplicar isso na {{empresa}}:

[Quero ver como funciona pra mim → {{whatsapp_url}}]

Gradios`,

      C: `{{nome}},

Um caso real que talvez faça sentido pra {{empresa}}.

Uma empresa de {{setor}} com porte parecido com o de vocês tinha exatamente o problema que você marcou: {{gargalo_principal}}.

O que a gente fez:
→ Mapeamos o fluxo que causava o gargalo (2 dias)
→ Construímos a integração entre os sistemas existentes (1 semana)
→ Testamos e ajustamos (3 dias)

Resultado: o processo que causava {{gargalo_principal}} passou a rodar sem intervenção manual. Mesma equipe. Mesmo sistema. Só conectamos o que já existia.

Não trocamos nenhum sistema. Não contratamos ninguém.

Se quiser ver como aplicar isso na {{empresa}}:

[Quero ver como funciona pra mim → {{whatsapp_url}}]

Gradios`,

      D: `{{nome}},

Um caso real que talvez faça sentido pra {{empresa}}.

Uma empresa de {{setor}} com porte parecido com o de vocês tinha exatamente o problema que você marcou: {{gargalo_principal}}.

O que a gente fez:
→ Mapeamos o fluxo que causava o gargalo (2 dias)
→ Construímos a integração entre os sistemas existentes (1 semana)
→ Testamos e ajustamos (3 dias)

Resultado: o processo que causava {{gargalo_principal}} passou a rodar sem intervenção manual. Mesma equipe. Mesmo sistema. Só conectamos o que já existia.

Não trocamos nenhum sistema. Não contratamos ninguém.

Se quiser ver como aplicar isso na {{empresa}}:

[Quero ver como funciona pra mim → {{whatsapp_url}}]

Gradios`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 4 — Dia 7 (dica prática implementável)
     ────────────────────────────────────────────────────────── */
  {
    id: "email_4_dica",
    day: 7,
    subject: {
      A: "Uma coisa que você pode fazer hoje na {{empresa}} (sem custo)",
      B: "Uma coisa que você pode fazer hoje na {{empresa}} (sem custo)",
      C: "Uma coisa que você pode fazer hoje na {{empresa}} (sem custo)",
      D: "Uma coisa que você pode fazer hoje na {{empresa}} (sem custo)",
    },
    body: {
      A: `{{nome}},

Uma dica prática — independente de contratar alguém ou não.

Mapeie UMA tarefa que alguém na sua equipe faz todo dia de forma manual. Só uma.

Anote:
→ Quantas vezes por semana acontece
→ Quanto tempo leva cada vez
→ Quantas pessoas fazem isso

Multiplica pelo custo hora. Esse é o custo real desse processo.

A maioria das empresas que a gente atende se surpreende com o número. Porque nunca tinham calculado.

Se quiser fazer esse mapeamento com a gente — de graça, em 30 minutos por vídeo — é só responder esse email ou clicar abaixo.

[Quero fazer o mapeamento → {{whatsapp_url}}]

Gradios`,

      B: `{{nome}},

Uma dica prática — independente de contratar alguém ou não.

Mapeie UMA tarefa que alguém na sua equipe faz todo dia de forma manual. Só uma.

Anote:
→ Quantas vezes por semana acontece
→ Quanto tempo leva cada vez
→ Quantas pessoas fazem isso

Multiplica pelo custo hora. Esse é o custo real desse processo.

A maioria das empresas que a gente atende se surpreende com o número. Porque nunca tinham calculado.

Se quiser fazer esse mapeamento com a gente — de graça, em 30 minutos por vídeo — é só responder esse email ou clicar abaixo.

[Quero fazer o mapeamento → {{whatsapp_url}}]

Gradios`,

      C: `{{nome}},

Uma dica prática — independente de contratar alguém ou não.

Mapeie UMA tarefa que alguém na sua equipe faz todo dia de forma manual. Só uma.

Anote:
→ Quantas vezes por semana acontece
→ Quanto tempo leva cada vez
→ Quantas pessoas fazem isso

Multiplica pelo custo hora. Esse é o custo real desse processo.

A maioria das empresas que a gente atende se surpreende com o número. Porque nunca tinham calculado.

Se quiser fazer esse mapeamento com a gente — de graça, em 30 minutos por vídeo — é só responder esse email ou clicar abaixo.

[Quero fazer o mapeamento → {{whatsapp_url}}]

Gradios`,

      D: `{{nome}},

Uma dica prática — independente de contratar alguém ou não.

Mapeie UMA tarefa que alguém na sua equipe faz todo dia de forma manual. Só uma.

Anote:
→ Quantas vezes por semana acontece
→ Quanto tempo leva cada vez
→ Quantas pessoas fazem isso

Multiplica pelo custo hora. Esse é o custo real desse processo.

A maioria das empresas que a gente atende se surpreende com o número. Porque nunca tinham calculado.

Se quiser fazer esse mapeamento com a gente — de graça, em 30 minutos por vídeo — é só responder esse email ou clicar abaixo.

[Quero fazer o mapeamento → {{whatsapp_url}}]

Gradios`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 5 — Dia 10 (CTA suave pra call)
     ────────────────────────────────────────────────────────── */
  {
    id: "email_5_followup",
    day: 10,
    subject: {
      A: "{{nome}}, ainda faz sentido conversar?",
      B: "Ainda pensando em automação na {{empresa}}?",
      C: "Ainda pensando em automação na {{empresa}}?",
      D: "Uma pergunta rápida, {{nome}}",
    },
    body: {
      A: `{{nome}},

Faz 10 dias desde o diagnóstico da {{empresa}}.

Não sei se você avançou com isso internamente, se surgiu outra prioridade, ou se ainda está avaliando.

Se ainda faz sentido, tenho 30 minutos essa semana pra uma conversa rápida. Sem apresentação, sem proposta. Só entender o cenário de perto e ver se a gente consegue ajudar de verdade.

Se não faz mais sentido agora — tudo bem também. Só me fala pra eu não tomar mais o seu tempo.

[Quero conversar essa semana → {{whatsapp_url}}]

Não faz sentido agora? Sem problema — responda "parar" e a gente encerra por aqui.

Gradios`,

      B: `{{nome}},

Faz 10 dias desde o diagnóstico da {{empresa}}.

Não sei se você avançou com isso internamente, se surgiu outra prioridade, ou se ainda está avaliando.

Se ainda faz sentido, tenho 30 minutos essa semana pra uma conversa rápida. Sem apresentação, sem proposta. Só entender o cenário de perto e ver se a gente consegue ajudar de verdade.

Se não faz mais sentido agora — tudo bem também. Só me fala pra eu não tomar mais o seu tempo.

[Quero conversar essa semana → {{whatsapp_url}}]

Não faz sentido agora? Sem problema — responda "parar" e a gente encerra por aqui.

Gradios`,

      C: `{{nome}},

Faz 10 dias desde o diagnóstico da {{empresa}}.

Não sei se você avançou com isso internamente, se surgiu outra prioridade, ou se ainda está avaliando.

Se ainda faz sentido, tenho 30 minutos essa semana pra uma conversa rápida. Sem apresentação, sem proposta. Só entender o cenário de perto e ver se a gente consegue ajudar de verdade.

Se não faz mais sentido agora — tudo bem também. Só me fala pra eu não tomar mais o seu tempo.

[Quero conversar essa semana → {{whatsapp_url}}]

Não faz sentido agora? Sem problema — responda "parar" e a gente encerra por aqui.

Gradios`,

      D: `{{nome}},

Faz 10 dias desde o diagnóstico da {{empresa}}.

Não sei se você avançou com isso internamente, se surgiu outra prioridade, ou se ainda está avaliando.

Se ainda faz sentido, tenho 30 minutos essa semana pra uma conversa rápida. Sem apresentação, sem proposta. Só entender o cenário de perto e ver se a gente consegue ajudar de verdade.

Se não faz mais sentido agora — tudo bem também. Só me fala pra eu não tomar mais o seu tempo.

[Quero conversar essa semana → {{whatsapp_url}}]

Não faz sentido agora? Sem problema — responda "parar" e a gente encerra por aqui.

Gradios`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 6 — Dia 14 (oferta direta)
     ────────────────────────────────────────────────────────── */
  {
    id: "email_6_oferta",
    day: 14,
    subject: {
      A: "Última mensagem — proposta específica pra {{empresa}}",
      B: "Última mensagem — proposta específica pra {{empresa}}",
      C: "Uma última coisa antes de eu parar de escrever",
      D: "Uma última coisa antes de eu parar de escrever",
    },
    body: {
      A: `{{nome}},

Último email dessa sequência.

Baseado no diagnóstico da {{empresa}}, montamos mentalmente o que faríamos nos primeiros 14 dias se trabalhássemos juntos:

→ Semana 1: mapear o fluxo de {{gargalo_principal}} e identificar os pontos de integração
→ Semana 2: primeira automação rodando — {{prioridade}}

Investimento: a partir de R$ 10.000. Prazo: 14 dias para a primeira entrega. Garantia: se não entregar resultado mensurável, devolvemos.

Se quiser avançar — ou só entender melhor antes de decidir:

[Quero conversar agora → {{whatsapp_url}}]

Se não for o momento, sem problema. Fica o diagnóstico como referência pra quando fizer sentido.

Gradios`,

      B: `{{nome}},

Último email dessa sequência.

Baseado no diagnóstico da {{empresa}}, montamos mentalmente o que faríamos nos primeiros 14 dias se trabalhássemos juntos:

→ Semana 1: mapear o fluxo de {{gargalo_principal}} e identificar os pontos de integração
→ Semana 2: primeira automação rodando — {{prioridade}}

Investimento: a partir de R$ 10.000. Prazo: 14 dias para a primeira entrega. Garantia: se não entregar resultado mensurável, devolvemos.

Se quiser avançar — ou só entender melhor antes de decidir:

[Quero conversar agora → {{whatsapp_url}}]

Se não for o momento, sem problema. Fica o diagnóstico como referência pra quando fizer sentido.

Gradios`,

      C: `{{nome}},

Último email.

Se você ainda não automatizou nada na {{empresa}}, provavelmente é por um desses motivos: não sabe por onde começar, acha caro, ou não tem tempo pra avaliar direito.

Os três têm solução simples.

Temos um pacote de entrada específico pra empresas no seu estágio: diagnóstico aprofundado + uma automação de impacto rápido, por R$ 10.000, entregue em 14 dias.

[Entender o pacote de entrada → {{whatsapp_url}}]

Se não for agora — guarda esse email. Quando o retrabalho ficar grande demais, a gente tá aqui.

Gradios`,

      D: `{{nome}},

Último email.

Se você ainda não automatizou nada na {{empresa}}, provavelmente é por um desses motivos: não sabe por onde começar, acha caro, ou não tem tempo pra avaliar direito.

Os três têm solução simples.

Temos um pacote de entrada específico pra empresas no seu estágio: diagnóstico aprofundado + uma automação de impacto rápido, por R$ 10.000, entregue em 14 dias.

[Entender o pacote de entrada → {{whatsapp_url}}]

Se não for agora — guarda esse email. Quando o retrabalho ficar grande demais, a gente tá aqui.

Gradios`,
    },
  },
];

/* ════════════════════════════════════════════════════════════
   TEMPLATE RENDERER
   ════════════════════════════════════════════════════════════ */

export interface EmailVariables {
  nome: string;
  empresa: string;
  setor: string;
  cargo: string;
  gargalo_principal: string;
  gargalo_2: string;
  horas_semana: string;
  horas_mes: string;
  horas_mes_num: number;
  pct_funcionario: string;
  roi_mensal: string;
  roi_anual: string;
  tier: string;
  score: number;
  prioridade: string;
  diagnostico_url: string;
  whatsapp_url: string;
}

/**
 * Replaces all {{variable}} placeholders in a template string.
 */
export function renderTemplate(template: string, vars: EmailVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return (vars as unknown as Record<string, string | number>)[key]?.toString() ?? "";
  });
}

/**
 * Get the rendered subject and body for a specific email + tier.
 */
export function getRenderedEmail(
  emailIndex: number,
  tier: string,
  vars: EmailVariables
): { subject: string; body: string } | null {
  const template = EMAIL_SEQUENCE[emailIndex];
  if (!template) return null;

  const tierKey = tier as keyof typeof template.subject;
  const subject = template.subject[tierKey] ?? template.subject.D;
  const body = template.body[tierKey] ?? template.body.D;

  return {
    subject: renderTemplate(subject, vars),
    body: renderTemplate(body, vars),
  };
}
