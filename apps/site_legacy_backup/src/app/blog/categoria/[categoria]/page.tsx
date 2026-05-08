import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getArticlesByCategory } from "../../_data";

interface Props {
  params: Promise<{ categoria: string }>;
}

const categoryDescriptions: Record<string, string> = {
  Automação:
    "Artigos sobre automação de processos empresariais, workflows, WhatsApp, cobranças e fluxos de trabalho automatizados.",
  Desenvolvimento:
    "Conteúdo sobre desenvolvimento de software sob medida, sistemas B2B, arquitetura de software e boas práticas.",
  Integração:
    "Guias de integração de sistemas, APIs, ERPs, CRMs, webhooks e conexão entre ferramentas empresariais.",
  IA: "Artigos sobre inteligência artificial aplicada a negócios, agentes de IA, chatbots e automação inteligente.",
  Gestão:
    "Conteúdo sobre gestão empresarial, processos, dashboards, relatórios e tomada de decisão baseada em dados.",
  Ferramentas:
    "Comparativos e tutoriais de ferramentas como n8n, Make, Zapier, Supabase e plataformas de automação.",
};

const categoryColors: Record<string, string> = {
  Automação: "bg-blue-100 text-blue-700",
  Desenvolvimento: "bg-purple-100 text-purple-700",
  Integração: "bg-emerald-100 text-emerald-700",
  IA: "bg-amber-100 text-amber-700",
  Gestão: "bg-rose-100 text-rose-700",
  Ferramentas: "bg-cyan-100 text-cyan-700",
};

function slugToCategory(slug: string): string | undefined {
  const map: Record<string, string> = {
    automacao: "Automação",
    desenvolvimento: "Desenvolvimento",
    integracao: "Integração",
    ia: "IA",
    gestao: "Gestão",
    ferramentas: "Ferramentas",
  };
  return map[slug];
}

function categoryToSlug(cat: string): string {
  const map: Record<string, string> = {
    Automação: "automacao",
    Desenvolvimento: "desenvolvimento",
    Integração: "integracao",
    IA: "ia",
    Gestão: "gestao",
    Ferramentas: "ferramentas",
  };
  return map[cat] ?? cat.toLowerCase();
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ categoria: categoryToSlug(cat) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const cat = slugToCategory(categoria);
  if (!cat) return {};

  return {
    title: `${cat} | Blog Gradios`,
    description:
      categoryDescriptions[cat] ??
      `Artigos sobre ${cat.toLowerCase()} para empresas.`,
    alternates: { canonical: `/blog/categoria/${categoria}` },
    openGraph: {
      title: `${cat} — Blog Gradios`,
      description:
        categoryDescriptions[cat] ??
        `Artigos sobre ${cat.toLowerCase()} para empresas.`,
      url: `https://gradios.co/blog/categoria/${categoria}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const cat = slugToCategory(categoria);
  if (!cat) notFound();

  const articles = getArticlesByCategory(cat);
  if (articles.length === 0) notFound();

  return (
    <section className="py-16 lg:py-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-text">{cat}</span>
        </nav>

        <h1 className="text-3xl lg:text-4xl font-bold text-text mb-3">
          {cat}
        </h1>
        <p className="text-lg text-text-muted max-w-2xl">
          {categoryDescriptions[cat]}
        </p>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/blog/categoria/${categoryToSlug(c)}`}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-all ${
                c === cat
                  ? "bg-primary text-white"
                  : `${categoryColors[c] ?? "bg-gray-100 text-gray-700"} hover:opacity-80`
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-text-muted mb-6">
          {articles.length} artigo{articles.length !== 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group bg-white rounded-card border border-card-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="h-1 bg-brand-gradient" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-pill text-[11px] font-semibold ${categoryColors[article.category] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-text-muted">
                    {article.readingTime} min
                  </span>
                </div>
                <h2 className="text-lg font-bold text-text mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1 line-clamp-3">
                  {article.description}
                </p>
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
    </section>
  );
}
