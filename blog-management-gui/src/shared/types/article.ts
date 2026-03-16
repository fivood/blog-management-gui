// Article Types

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  categories: string[];
  author?: string;
  slug?: string;
  state: 'draft' | 'published';
  createdAt: Date;
  publishedAt?: Date;
  modifiedAt: Date;
  version: number;
  isProtected: boolean;
  passwordHash?: string;
  metadata: ArticleMetadata;
}

export interface ArticleMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  author?: string;
  customFields?: Record<string, any>;
}

export interface ArticleListItem {
  id: string;
  title: string;
  createdAt: Date;
  modifiedAt: Date;
  tags: string[];
  categories: string[];
  isProtected: boolean;
  state: 'draft' | 'published';
}

export interface CreateArticleData {
  title: string;
  content: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  slug?: string;
  publishedAt?: Date;
  password?: string;
}

export interface ArticleUpdate {
  title?: string;
  content?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  slug?: string;
  publishedAt?: Date;
  password?: string;
  isProtected?: boolean;
}

export interface ArticleFilters {
  searchText?: string;
  tags?: string[];
  categories?: string[];
  state?: 'draft' | 'published';
}
