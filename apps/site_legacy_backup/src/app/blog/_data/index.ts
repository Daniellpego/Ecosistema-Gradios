import { articles01 } from './articles-01';
import { articles02 } from './articles-02';
import { articles03 } from './articles-03';
import { articles04 } from './articles-04';
import { articles05 } from './articles-05';
import type { Article } from './types';

export type { Article };

export const allArticles: Article[] = [
  ...articles01,
  ...articles02,
  ...articles03,
  ...articles04,
  ...articles05,
].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export function getArticleBySlug(slug: string): Article | undefined {
  return allArticles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  return allArticles.filter((a) => a.category === category);
}

export const categories = Array.from(new Set(allArticles.map((a) => a.category)));
