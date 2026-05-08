import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allArticles, getArticleBySlug } from "../_data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.title} | Blog Gradios`,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://gradios.co/blog/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: ["Gradios Soluções em Tecnologia"],
      locale: "pt_BR",
      siteName: "Gradios",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  // Related articles: same category, excluding current, max 3
  const related = allArticles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  // Cross-links: pick 2 articles from different categories for internal linking
  const crossLinks = allArticles
    .filter(
      (a) => a.category !== article.category && a.slug !== article.slug
    )
    .slice(0, 2);

  // JSON-LD Article schema (com autor Person para E-E-A-T)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": "Person",
      name: "Daniel Pego",
      jobTitle: "Co-fundador & Head de Engenharia",
      url: "https://gradios.co/sobre",
      image: "https://gradios.co/daniel-pego.webp",
      worksFor: {
        "@type": "Organization",
        name: "Gradios Soluções em Tecnologia",
        "@id": "https://gradios.co/#organization",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Gradios",
      "@id": "https://gradios.co/#organization",
      logo: { "@type": "ImageObject", url: "https://gradios.co/logo.webp" },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://gradios.co/blog/${article.slug}`,
    },
    image: {
      "@type": "ImageObject",
      url: `https://gradios.co/blog/${article.slug}/opengraph-image`,
      width: 1200,
      height: 630,
    },
    articleSection: article.category,
    keywords: article.keywords.join(", "),
    wordCount: article.readingTime * 200,
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
  };

  // JSON-LD BreadcrumbList schema
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://gradios.co" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://gradios.co/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://gradios.co/blog/${article.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <article className="py-16 lg:py-24">
        {/* Header */}
        <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-text truncate max-w-[200px]">
              {article.title}
            </span>
          </nav>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-pill text-xs font-semibold bg-primary/10 text-primary">
              {article.category}
            </span>
            <span className="text-sm text-text-muted">
              {article.readingTime} min de leitura
            </span>
            <time
              dateTime={article.publishedAt}
              className="text-sm text-text-muted"
            >
              {new Date(article.publishedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-text leading-tight mb-4">
            {article.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-text-muted leading-relaxed">
            {article.description}
          </p>
        </header>

        {/* Content */}
        <div
          className="article-content max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Cross-links — internal linking between categories */}
        {crossLinks.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="bg-primary/5 border border-primary/10 rounded-card p-5">
              <p className="text-sm font-semibold text-text mb-3">
                Leia também
              </p>
              <ul className="space-y-2">
                {crossLinks.map((cl) => (
                  <li key={cl.slug}>
                    <Link
                      href={`/blog/${cl.slug}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {cl.title}
                    </Link>
                    <span className="text-xs text-text-muted ml-2">
                      — {cl.category}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Related articles */}
        {related.length > 0 && (
          <aside className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-card-border">
            <h2 className="text-xl font-bold text-text mb-6">
              Artigos relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group bg-white rounded-card border border-card-border p-5 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <span className="text-[11px] font-semibold text-primary/70 uppercase tracking-wider">
                    {r.category}
                  </span>
                  <h3 className="text-sm font-bold text-text mt-1 mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {r.title}
                  </h3>
                  <span className="text-xs text-text-muted">
                    {r.readingTime} min
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </article>
    </>
  );
}
