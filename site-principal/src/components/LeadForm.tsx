"use client";
import { submitLead } from "@/app/actions";
import { useInView } from "@/hooks/useAnimations";
import { useState } from "react";

export function LeadForm() {
  const { ref, inView } = useInView();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    try {
      await submitLead(formData);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contato" className={`relative z-10 py-16 lg:py-20 overflow-hidden bg-[#f1f5f9] text-left transition-all duration-700 ${
      inView ? "opacity-100" : "opacity-0"
    }`} ref={ref}>
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-secondary/5 -z-10" />
      {/* Blob esquerdo */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl -z-10 -translate-x-1/3 -translate-y-1/3" />
      {/* Blob direito */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-3xl -z-10 translate-x-1/3 translate-y-1/3" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* COLUNA ESQUERDA (texto de convencimento) */}
          <div>
            <div className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6">
              Consultoria Gradios
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-text leading-tight mb-4">
              Sua equipe ainda<br />perde tempo com isso?
            </h2>
            
            <p className="text-text-muted text-lg mt-4 leading-relaxed max-w-lg mb-4">
              Conta pra gente o que trava vocês hoje. A gente mapeia o que dá pra resolver e mostra como. Sem cobrar nada por isso.
            </p>
            <p className="text-primary font-semibold text-sm mb-8 italic">
              Imagine sua operação rodando sozinha enquanto você foca no que importa.
            </p>
            
            <div className="flex flex-col gap-4 mb-8">
              {["Sem compromisso", "Resposta em até 24h", "Diagnóstico 100% gratuito"].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text">{item}</span>
                </div>
              ))}
            </div>

            {/* Social proof block */}
            <div className="mt-8 flex items-center gap-3 p-4 bg-bg-alt rounded-card border border-card-border inline-flex max-w-md w-full">
              <div className="flex -space-x-2">
                {["C", "A", "R"].map((initial, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-white flex items-center justify-center relative" style={{ zIndex: 3 - i }}>
                    <span className="text-white text-xs font-bold">{initial}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-text-muted">
                <span className="font-bold text-text">+17 empresas</span> já automatizaram com a Gradios
              </p>
            </div>
            <a href="https://wa.me/5543988372540" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.227-2.01l-.435-.327-2.646.887.887-2.646-.327-.435A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
              (43) 98837-2540
            </a>
            
          </div>

          {/* COLUNA DIREITA (formulário) */}
          <div className="bg-bg-alt border border-card-border rounded-card p-8 shadow-sm">
            <h3 className="text-xl font-bold text-text mb-6">Conta o que trava vocês</h3>
            
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-text mb-2">Mensagem enviada!</h4>
                <p className="text-sm text-text-muted">Vamos analisar e responder em até 24h.</p>
              </div>
            ) : (
              <form action={handleSubmit} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text" htmlFor="nome">Nome completo</label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    aria-required="true"
                    placeholder="João Silva"
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text" htmlFor="empresa">Empresa</label>
                  <input
                    id="empresa"
                    name="empresa"
                    type="text"
                    required
                    aria-required="true"
                    placeholder="Empresa Ltda."
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text" htmlFor="email">E-mail corporativo</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    aria-required="true"
                    placeholder="joao@empresa.com.br"
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text" htmlFor="desafio">Qual é seu maior desafio hoje?</label>
                  <textarea
                    id="desafio"
                    name="desafio"
                    rows={3}
                    required
                    aria-required="true"
                    placeholder="Ex: Nosso processo de faturamento é 100% manual e toma 2 dias por mês..."
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="mt-2 pt-2">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full animate-cta-pulse bg-brand-gradient text-white rounded-pill py-4 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#2546BD]/30 transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:animate-none"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : "Quero meu Diagnóstico Gratuito"}
                  </button>
                  {status === "error" && (
                    <p className="text-center text-xs text-red-500 mt-3">
                      Erro ao enviar. Tente novamente.
                    </p>
                  )}
                  {status === "idle" && (
                    <p className="text-center text-xs text-text-muted mt-3">
                      Sem compromisso. Sem spam. Resposta em até 24h.
                    </p>
                  )}
                </div>

              </form>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}
