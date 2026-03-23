"use client";

interface IntroPhaseProps {
  city: string;
  onStart: () => void;
}

export default function IntroPhase({ city, onStart }: IntroPhaseProps) {
  return (
    <div className="animate-fade-slide-up text-center">
      {/* Trust bar */}
      <div className="flex items-center justify-center gap-2 mb-8 opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex -space-x-2">
          {["#0A1B5C", "#1440A0", "#0090D9", "#00BFFF"].map((c, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: c, zIndex: 4 - i }}
            >
              {["G", "M", "R", "T"][i]}
            </div>
          ))}
        </div>
        <p className="text-text-muted text-sm">
          <span className="font-bold text-text">2.400+</span> empresas diagnosticadas
        </p>
      </div>

      <span className="inline-flex items-center bg-primary/[0.08] text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide">
        Diagnóstico Gratuito · 2 minutos
      </span>

      <h1
        className="mt-6 text-3xl sm:text-4xl md:text-5xl font-black text-text leading-tight"
        style={{ letterSpacing: "-0.02em" }}
      >
        Descubra quanto sua empresa{" "}
        <span className="relative inline-block">
          perde
          <svg
            className="absolute -bottom-1 left-0 w-full"
            viewBox="0 0 200 12"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M2 8C40 2 80 2 100 6C120 10 160 4 198 6"
              stroke="url(#grad-line)"
              strokeWidth="3"
              strokeLinecap="round"
              className="path-anim"
            />
            <defs>
              <linearGradient id="grad-line" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0A1B5C" />
                <stop offset="1" stopColor="#00BFFF" />
              </linearGradient>
            </defs>
          </svg>
        </span>{" "}
        com processos manuais
      </h1>

      <p className="mt-4 text-lg text-text-muted" style={{ animationDelay: "0.15s" }}>
        {city ? `${city} | ` : ""}7 perguntas. 2 minutos.{"\n"}Diagnóstico real da sua operação, gerado por IA na hora.
      </p>

      <button
        onClick={onStart}
        className="mt-8 bg-brand-gradient text-white rounded-pill px-8 py-4 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700 text-lg"
      >
        Fazer meu diagnóstico gratuito
      </button>

      {/* Social proof metrics */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-text-muted">
        {[
          ["2 min", "para responder"],
          ["IA", "diagnóstico real"],
          ["R$", "custo calculado"],
        ].map(([big, small], i) => (
          <div
            key={big}
            className="flex flex-col items-center opacity-0 animate-fade-slide-up"
            style={{ animationDelay: `${0.3 + i * 0.15}s` }}
          >
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {big}
            </span>
            <span>{small}</span>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="mt-10 max-w-md mx-auto opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.6s" }}>
        <div className="bg-white border border-card-border rounded-card p-4 text-left shadow-sm">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-text text-sm leading-relaxed">
            &ldquo;Fizemos o diagnóstico achando que era mais um quiz genérico. Em 2 minutos, eles mostraram que a gente perdia <strong>R$14 mil/mês</strong> em retrabalho. Fechamos com a Gradios na mesma semana.&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              RM
            </div>
            <div>
              <p className="text-text text-xs font-bold">Rafael M.</p>
              <p className="text-text-muted text-[10px]">COO · Empresa de logística · 120 func.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
