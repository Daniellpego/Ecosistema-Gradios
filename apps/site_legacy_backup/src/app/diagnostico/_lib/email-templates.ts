/* ════════════════════════════════════════════════════════════
   EMAIL NURTURING SEQUENCE — 5 EMAILS × 4 TIERS (21 dias)
   ════════════════════════════════════════════════════════════

   Cadência: Dia 0, 3, 7, 14, 21
   Tom: plain text, resposta direta, assinatura pessoal Bryan Gradi.
   Regra: 1 CTA por email. Frases curtas. Sem template HTML.

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
   {{roi_mensal}}        → custo mensal formatado (R$ X.XXX) — conservador (×0.8)
   {{roi_anual}}         → custo anual formatado (R$ XX.XXX) — conservador (×0.8)
   {{tier}}              → A, B, C ou D
   {{score}}             → score numérico 0-100
   {{prioridade}}        → prioridade marcada no quiz
   {{sistemas}}          → sistemas desconectados (ex: "4 a 6 desconectados")
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
     EMAIL 1 — Dia 0 (Entrega + Choque de Realidade)
     Plain text, direto, tangibiliza o prejuízo.
     ────────────────────────────────────────────────────────── */
  {
    id: "email_1_resultado",
    day: 0,
    subject: {
      A: "O diagnóstico da {{empresa}} está pronto (e o gargalo é {{prioridade}})",
      B: "O diagnóstico da {{empresa}} está pronto (e o gargalo é {{prioridade}})",
      C: "O diagnóstico da {{empresa}} está pronto",
      D: "O diagnóstico da {{empresa}} está pronto, {{nome}}",
    },
    body: {
      A: `Fala {{nome}}, tudo bem?

O sistema da Gradios acabou de processar os dados da {{empresa}}.

Sendo bem direto: mapeamos que hoje vocês perdem em torno de {{horas_semana}} por semana com processos manuais, principalmente na área de {{gargalo_principal}}.

Projetando isso no ano, não é apenas tempo perdido. É margem de lucro deixada na mesa e um teto muito claro que impede a operação de escalar.

A boa notícia é que estancar esse vazamento não exige contratar mais gente. Exige plugar a automação certa.

[Acessar o Diagnóstico Completo → {{diagnostico_url}}]

Dá uma olhada detalhada nos números. Se fizer sentido resolver isso de forma definitiva ainda este mês, responde este email ou me chama direto no WhatsApp.

[Chamar no WhatsApp → {{whatsapp_url}}]

Abraço,
Bryan Gradi
Co-fundador | Gradios`,

      B: `Fala {{nome}}, tudo bem?

O sistema da Gradios acabou de processar os dados da {{empresa}}.

Sendo bem direto: mapeamos que hoje vocês perdem em torno de {{horas_semana}} por semana com processos manuais, principalmente na área de {{gargalo_principal}}.

Projetando isso no ano, não é apenas tempo perdido. É margem de lucro deixada na mesa e um teto que impede a operação de escalar.

A boa notícia: estancar esse vazamento não exige contratar mais gente. Exige plugar a automação certa.

[Acessar o Diagnóstico Completo → {{diagnostico_url}}]

Se quiser entender como resolver isso na prática, responde aqui ou me chama no WhatsApp. Sem compromisso, sem proposta pronta.

[Chamar no WhatsApp → {{whatsapp_url}}]

Abraço,
Bryan Gradi
Co-fundador | Gradios`,

      C: `Fala {{nome}},

Seu diagnóstico da {{empresa}} ficou pronto.

Vocês estão no estágio inicial de automação — e tá tudo bem. A maioria das empresas de {{setor}} começa exatamente assim.

O ponto de atenção: você marcou {{gargalo_principal}} como gargalo e {{horas_semana}} por semana de retrabalho. Isso não é pouco.

A boa notícia: empresas que saem desse estágio geralmente fazem com 1 ou 2 automações certeiras, não com projeto grande.

[Acessar o Diagnóstico Completo → {{diagnostico_url}}]

Nos próximos dias vou te mandar um conteúdo sobre o que empresas de {{setor}} costumam automatizar primeiro.

Abraço,
Bryan Gradi
Co-fundador | Gradios`,

      D: `Fala {{nome}},

Seu diagnóstico da {{empresa}} está pronto.

Pelo que você respondeu, vocês ainda estão mapeando — e isso faz sentido. Automação sem clareza de onde dói mais é desperdício de dinheiro.

[Acessar o Diagnóstico Completo → {{diagnostico_url}}]

Vou te mandar um guia simples de como identificar os 3 processos que mais valem automatizar primeiro. Sem custo, sem enrolação.

Abraço,
Bryan Gradi
Co-fundador | Gradios`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 2 — Dia 3 (Agitação da dor + Autoridade)
     Mostra que entende o negócio deles melhor que eles mesmos.
     ────────────────────────────────────────────────────────── */
  {
    id: "email_2_gargalo_setor",
    day: 3,
    subject: {
      A: "O problema não é o seu time, {{nome}}.",
      B: "O problema não é o seu time, {{nome}}.",
      C: "Por que {{gargalo_principal}} custa mais do que parece",
      D: "Por que {{gargalo_principal}} custa mais do que parece",
    },
    body: {
      A: `{{nome}},

Uma coisa que vejo muito em empresas de {{setor}} é o gestor achar que a equipe está improdutiva, quando na verdade o erro está na arquitetura do processo.

No seu diagnóstico, notei que vocês usam {{sistemas}} que não conversam entre si.

Sabe o que acontece na prática? Seu time virou um "copiador e colador de dados de luxo". Eles não estão pensando no crescimento do negócio. Estão alimentando planilhas e telas pra manter as coisas funcionando.

A gente constrói integrações que fazem esses sistemas conversarem em background. O dado entra num lugar, atualiza todo o resto, e seu time foca no que gera receita.

Quer entender como ficaria a arquitetura dessa automação pra realidade da {{empresa}}?

Responde aqui ou me chama no WhatsApp que eu te explico em 5 minutos.

[Chamar no WhatsApp → {{whatsapp_url}}]

Abraço,
Bryan`,

      B: `{{nome}},

Uma coisa que vejo muito em empresas de {{setor}} é o gestor achar que a equipe está improdutiva, quando na verdade o erro está na arquitetura do processo.

No seu diagnóstico, notei que vocês usam {{sistemas}} que não conversam entre si.

Sabe o que acontece na prática? Seu time virou um "copiador e colador de dados de luxo". Eles não estão pensando no crescimento do negócio. Estão alimentando planilhas e telas pra manter as coisas funcionando.

A gente constrói integrações que fazem esses sistemas conversarem em background. O dado entra num lugar, atualiza todo o resto, e seu time foca no que gera receita.

Quer entender como ficaria essa automação pra {{empresa}}?

[Chamar no WhatsApp → {{whatsapp_url}}]

Abraço,
Bryan`,

      C: `{{nome}},

No diagnóstico você marcou {{gargalo_principal}} como gargalo.

Esse problema tem um custo que nunca aparece no financeiro — mas está lá todo mês:

Tempo de equipe em tarefa repetitiva. Erro humano que vira retrabalho lá na frente. Decisão tomada com dado de ontem.

Em empresas de {{setor}} com porte parecido com o da {{empresa}}, isso sozinho costuma representar {{roi_mensal}}/mês em custo invisível.

A maioria resolve com uma integração simples. Sem sistema novo. Sem equipe técnica.

Se quiser entender como:

[Chamar no WhatsApp → {{whatsapp_url}}]

Abraço,
Bryan`,

      D: `{{nome}},

No diagnóstico você marcou {{gargalo_principal}} como gargalo.

Esse problema tem um custo que nunca aparece no financeiro — mas está lá todo mês. Tempo da equipe em tarefa repetitiva. Erro que vira retrabalho. Decisão tomada com dado atrasado.

A maioria das empresas resolve isso com uma integração simples. Sem trocar sistema. Sem contratar.

Se quiser entender como:

[Chamar no WhatsApp → {{whatsapp_url}}]

Abraço,
Bryan`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 3 — Dia 7 (Prova Social concreta)
     Case real do setor, timeline de execução, resultado.
     ────────────────────────────────────────────────────────── */
  {
    id: "email_3_case",
    day: 7,
    subject: {
      A: "Uma empresa de {{setor}} cortou {{horas_semana}} de retrabalho em 14 dias",
      B: "Uma empresa de {{setor}} cortou {{horas_semana}} de retrabalho em 14 dias",
      C: "Como uma empresa de {{setor}} parou de perder dinheiro com {{gargalo_principal}}",
      D: "Como uma empresa de {{setor}} parou de perder dinheiro com {{gargalo_principal}}",
    },
    body: {
      A: `{{nome}},

Um caso real que provavelmente faz sentido pra {{empresa}}.

Empresa de {{setor}}, porte parecido com o de vocês. Mesmo problema: {{gargalo_principal}}.

O que a gente fez:

Dia 1-2: mapeamos o fluxo que causava o gargalo. Sentamos com a equipe, desenhamos o processo real (não o que estava no manual).

Dia 3-10: construímos a integração entre os sistemas que eles já usavam. Zero troca de ferramenta.

Dia 11-14: testamos, ajustamos, validamos com o time.

Resultado: o processo que dependia de 3 pessoas fazendo manualmente agora roda sozinho. Mesma equipe. Mesmo sistema. Só plugamos o que já existia.

Se quiser ver como isso se aplica na {{empresa}}, me chama. 30 minutos de conversa, sem apresentação, sem proposta.

[Chamar no WhatsApp → {{whatsapp_url}}]

Bryan`,

      B: `{{nome}},

Um caso real que provavelmente faz sentido pra {{empresa}}.

Empresa de {{setor}}, porte parecido. Mesmo problema: {{gargalo_principal}}.

O que a gente fez:

Dia 1-2: mapeamos o fluxo real que causava o gargalo.
Dia 3-10: construímos a integração entre os sistemas existentes.
Dia 11-14: testamos e ajustamos com o time.

Resultado: processo que dependia de gente fazendo na mão agora roda sozinho. Mesma equipe. Mesmo sistema.

Se quiser entender como aplicar na {{empresa}}:

[Chamar no WhatsApp → {{whatsapp_url}}]

Bryan`,

      C: `{{nome}},

Um caso que talvez faça sentido.

Empresa de {{setor}}, problema parecido com o da {{empresa}}: {{gargalo_principal}}.

A gente mapeou o fluxo em 2 dias, construiu a automação em 1 semana, e em 14 dias o processo rodava sozinho.

Sem trocar sistema. Sem contratar. Só conectamos o que já existia.

Se quiser ver como funciona:

[Chamar no WhatsApp → {{whatsapp_url}}]

Bryan`,

      D: `{{nome}},

Uma empresa de {{setor}} tinha o mesmo gargalo que você marcou: {{gargalo_principal}}.

Em 14 dias a gente conectou os sistemas que eles já usavam e o processo passou a rodar sem intervenção manual.

Quando fizer sentido pra {{empresa}}, a gente conversa.

[Chamar no WhatsApp → {{whatsapp_url}}]

Bryan`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 4 — Dia 14 (Insight acionável — pura autoridade)
     Dá valor real sem pedir nada. Constrói confiança.
     ────────────────────────────────────────────────────────── */
  {
    id: "email_4_insight",
    day: 14,
    subject: {
      A: "Um exercício de 10 minutos que vai te assustar, {{nome}}",
      B: "Um exercício de 10 minutos que vai te assustar, {{nome}}",
      C: "Como calcular o custo real de um processo manual (sem planilha)",
      D: "Como calcular o custo real de um processo manual (sem planilha)",
    },
    body: {
      A: `{{nome}},

Um exercício rápido. Não precisa de ferramenta, só caneta e papel.

Pega UM processo que alguém faz todo dia na mão na {{empresa}}. Pode ser qualquer um. Anota:

1. Quantas vezes por semana acontece
2. Quanto tempo leva cada vez
3. Quantas pessoas fazem isso

Multiplica: vezes por semana x tempo x 4 semanas x custo hora da pessoa.

Esse número é o que esse processo custa por mês. Um único processo.

A maioria dos gestores que faz esse exercício se assusta. Porque nunca calculou. O retrabalho é invisível até você colocar no papel.

No seu diagnóstico, esse cálculo deu {{roi_mensal}}/mês no total. E isso é sendo conservador.

Se quiser fazer esse mapeamento com a gente — de graça, 30 minutos por vídeo — responde aqui.

[Quero fazer o mapeamento → {{whatsapp_url}}]

Bryan`,

      B: `{{nome}},

Um exercício rápido. Sem ferramenta, só caneta e papel.

Pega UM processo manual da {{empresa}}. Anota:

1. Quantas vezes por semana acontece
2. Quanto tempo leva cada vez
3. Quantas pessoas fazem

Multiplica: vezes x tempo x 4 semanas x custo hora.

Esse número é o custo mensal de um único processo manual. A maioria dos gestores se assusta quando calcula.

No seu diagnóstico, o total deu {{roi_mensal}}/mês. Conservador.

Se quiser mapear isso junto com a gente — de graça, 30 minutos — responde aqui.

[Quero fazer o mapeamento → {{whatsapp_url}}]

Bryan`,

      C: `{{nome}},

Uma dica prática. Independente de contratar alguém ou não.

Pega UM processo manual da {{empresa}}. Anota quantas vezes por semana acontece, quanto tempo leva, quantas pessoas fazem.

Multiplica pelo custo hora. Esse é o custo real desse processo.

A maioria nunca calculou. Quando calcula, se assusta.

Se quiser fazer isso com a gente — 30 minutos, sem custo:

[Quero fazer o mapeamento → {{whatsapp_url}}]

Bryan`,

      D: `{{nome}},

Uma dica rápida.

Pega UM processo que alguém faz na mão todo dia na {{empresa}}. Anota quantas vezes por semana, quanto tempo leva, e multiplica pelo custo hora.

Esse número é o custo invisível de um processo manual. Quando você somar todos, vai entender por que automação faz sentido.

Se quiser, a gente faz esse mapeamento junto. 30 minutos, sem custo.

[Quero fazer o mapeamento → {{whatsapp_url}}]

Bryan`,
    },
  },

  /* ──────────────────────────────────────────────────────────
     EMAIL 5 — Dia 21 (Soft pitch + despedida respeitosa)
     Check-in + proposta concreta. Última chance com classe.
     ────────────────────────────────────────────────────────── */
  {
    id: "email_5_proposta",
    day: 21,
    subject: {
      A: "{{nome}}, 3 semanas depois",
      B: "{{nome}}, 3 semanas depois",
      C: "Última mensagem, {{nome}}",
      D: "Última mensagem, {{nome}}",
    },
    body: {
      A: `{{nome}},

Faz 3 semanas desde o diagnóstico. Não sei se você avançou com isso internamente, se surgiu outra prioridade, ou se está avaliando.

Mas o cenário que a gente mapeou dificilmente mudou sozinho. {{roi_mensal}}/mês em retrabalho não some sem intervenção.

Se fizer sentido, isso é o que a gente faria nos primeiros 14 dias:

Semana 1: mapear o fluxo de {{gargalo_principal}} e identificar os pontos de integração.
Semana 2: primeira automação rodando — {{prioridade}}.

Investimento: a partir de R$ 10.000. Prazo: 14 dias. Garantia: se não entregar resultado mensurável, devolvemos.

Se quiser avançar, responde aqui ou me chama no WhatsApp.

[Chamar no WhatsApp → {{whatsapp_url}}]

Se não for o momento, sem problema. Guarda esse email. Quando fizer sentido, a gente tá aqui.

Responde "parar" se quiser que eu pare de escrever.

Abraço,
Bryan Gradi
Co-fundador | Gradios`,

      B: `{{nome}},

Faz 3 semanas desde o diagnóstico. Não sei se avançou com isso ou se surgiu outra prioridade.

O cenário que a gente mapeou dificilmente mudou sozinho. {{roi_mensal}}/mês em retrabalho não some sem intervenção.

Se fizer sentido resolver, isso é o que a gente faria:

Semana 1: mapear o fluxo de {{gargalo_principal}}.
Semana 2: primeira automação rodando — {{prioridade}}.

Investimento: a partir de R$ 10.000. Prazo: 14 dias. Garantia de resultado.

[Chamar no WhatsApp → {{whatsapp_url}}]

Se não for agora, sem problema. Responde "parar" pra encerrar.

Abraço,
Bryan Gradi
Co-fundador | Gradios`,

      C: `{{nome}},

Último email.

Se você não automatizou nada ainda na {{empresa}}, provavelmente é por um desses motivos: não sabe por onde começar, acha caro, ou não tem tempo pra avaliar.

Os três têm solução simples.

Pacote de entrada: diagnóstico aprofundado + uma automação de impacto rápido. R$ 10.000, entregue em 14 dias.

[Entender o pacote → {{whatsapp_url}}]

Se não for agora, guarda esse email. Quando o retrabalho apertar, a gente tá aqui.

Responde "parar" pra encerrar.

Bryan Gradi
Co-fundador | Gradios`,

      D: `{{nome}},

Último email dessa sequência.

Quando fizer sentido automatizar alguma coisa na {{empresa}}, a gente tá aqui. Sem pressa.

Temos um pacote de entrada: R$ 10.000, 14 dias, uma automação de impacto rápido.

[Saber mais → {{whatsapp_url}}]

Responde "parar" se quiser que eu pare de escrever.

Bryan Gradi
Co-fundador | Gradios`,
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
  sistemas: string;
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
