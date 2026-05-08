import { allArticles } from '../_data';

export async function GET() {
  const baseUrl = 'https://gradios.co';

  const items = allArticles
    .map(
      (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/blog/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${article.slug}</guid>
      <description><![CDATA[${article.description}]]></description>
      <category>${article.category}</category>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Gradios — Automação, Software e IA para Empresas</title>
    <link>${baseUrl}/blog</link>
    <description>Artigos sobre automação de processos, n8n, integração de sistemas, IA para negócios e desenvolvimento de software sob medida.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.webp</url>
      <title>Gradios</title>
      <link>${baseUrl}</link>
    </image>${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
