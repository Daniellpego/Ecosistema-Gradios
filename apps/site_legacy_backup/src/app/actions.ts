"use server";

function sanitize(value: FormDataEntryValue | null): string {
  if (!value || typeof value !== "string") return "";
  return value.slice(0, 500).replace(/[<>]/g, "").trim();
}

export async function submitLead(formData: FormData): Promise<void> {
  const data = {
    nome: sanitize(formData.get("nome")),
    empresa: sanitize(formData.get("empresa")),
    email: sanitize(formData.get("email")),
    desafio: sanitize(formData.get("desafio")),
  };

  // Validação server-side
  if (!data.nome || !data.email || !data.empresa || !data.desafio) {
    throw new Error("Campos obrigatórios não preenchidos.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error("E-mail inválido.");
  }

  const discordPayload = {
    content: `🚨 **NOVO LEAD RECEBIDO!** 🚨\n\n**Nome:** ${data.nome}\n**Empresa:** ${data.empresa}\n**E-mail:** ${data.email}\n**Desafio:** ${data.desafio}\n\n*Contato via Gradios Landing Page* 🚀`
  };

  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });
      console.log("Lead enviado com sucesso para o webhook.");
    } catch (err) {
      console.error("Erro ao enviar lead ao webhook:", err);
      throw new Error("Erro ao processar. Tente novamente.");
    }
  } else {
    console.log("Lead recebido (dev):", discordPayload);
  }
}
