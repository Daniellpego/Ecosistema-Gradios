export interface Article {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
}
