import type { Metadata } from "next";
import Link from "next/link";
import { allArticles, categories } from "./_data";

export const metadata: Metadata = {
  title: "Blog | Gradios — Automação, Software e IA para Empresas",
  description:
    "Artigos sobre automação de processos, n8n, integração de sistemas, IA para negócios e desenvolvimento de software sob medida. Conteúdo prático para empresas B2B.",
  keywords: [
    "blog automação",
    "automação de processos",
    "n8n",
    "software sob medida",
    "integração de sistemas",
    "IA para empresas",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Gradios — Automação, Software e IA para Empresas",
    description:
      "Artigos práticos sobre automação, n8n, integração de sistemas e IA aplicada ao negócio.",
    url: "https://gradios.co/blog",
    type: "website",
  },
};

const categoryColors: Record<string, string> = {
  Automação: "bg-blue-100 text-blue-700",
  Desenvolvimento: "bg-purple-100 text-purple-700",
  Integração: "bg-emerald-100 text-emerald-700",
  IA: "bg-amber-100 text-amber-700",
  Gestão: "bg-rose-100 text-rose-700",
  Ferramentas: "bg-cyan-100 text-cyan-700",
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: "https://gradios.co" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://gradios.co/blog" },
  ],
};

const jsonLdBlog = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": "https://gradios.co/blog#blog",
  name: "Blog Gradios",
  description: "Conteúdo técnico e estratégico sobre automação de processos B2B, software sob medida, integração de sistemas e IA aplicada ao negócio.",
  url: "https://gradios.co/blog",
  inLanguage: "pt-BR",
  publisher: { "@id": "https://gradios.co/#organization" },
};

export default function BlogPage() {
  return (
    <section className="py-16 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlog) }}
      />
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">
            Blog Gradios
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-text mb-4 leading-tight">
            Automação, Software e IA
            <br />
            <span className="text-highlight">na prática</span>
          </h1>
          <p className="text-lg text-text-muted leading-relaxed">
            Conteúdo técnico e estratégico para empresas que querem eliminar
            processos manuais, integrar sistemas e escalar operações com
            tecnologia.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold ${categoryColors[cat] ?? "bg-gray-100 text-gray-700"}`}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Article grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group bg-white rounded-card border border-card-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Color bar */}
              <div className="h-1 bg-brand-gradient" />

              <div className="p-6 flex flex-col flex-1">
                {/* Meta */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-pill text-[11px] font-semibold ${categoryColors[article.category] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-text-muted">
                    {article.readingTime} min de leitura
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-text mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1 line-clamp-3">
                  {article.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-card-border">
                  <time
                    dateTime={article.publishedAt}
                    className="text-xs text-text-muted"
                  >
                    {new Date(article.publishedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                  <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Ler artigo
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-card p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-text mb-3">
            Quer ver como a automação funciona na sua empresa?
          </h2>
          <p className="text-text-muted mb-6">
            Faça o diagnóstico gratuito e receba um relatório personalizado com
            oportunidades de automação para o seu negócio.
          </p>
          <Link
            href="/diagnostico"
            className="btn-primary inline-flex items-center gap-2"
          >
            Diagnóstico Gratuito
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
