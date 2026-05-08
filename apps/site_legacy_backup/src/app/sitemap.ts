import { MetadataRoute } from 'next'
import { allArticles, categories } from './blog/_data'

const categorySlugMap: Record<string, string> = {
  Automação: 'automacao',
  Desenvolvimento: 'desenvolvimento',
  Integração: 'integracao',
  IA: 'ia',
  Gestão: 'gestao',
  Ferramentas: 'ferramentas',
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gradios.co'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/diagnostico`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/respostas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const blogPages: MetadataRoute.Sitemap = allArticles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt ?? article.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/blog/categoria/${categorySlugMap[cat] ?? cat.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...blogPages]
}
