import { Article } from '../types/index';
/**
 * Template-agnostic data format for articles
 * This format is independent of any specific template engine
 */
export interface TemplateArticleFormat {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    tags: string[];
    categories: string[];
    author?: string;
    state: 'draft' | 'published';
    createdAt: string;
    publishedAt?: string;
    modifiedAt: string;
    version: number;
    isProtected: boolean;
    metadata: {
        title: string;
        description?: string;
        keywords?: string[];
        author?: string;
        customFields?: Record<string, any>;
    };
}
/**
 * Utility class for converting between Article and template-agnostic format
 * Ensures data consistency and preserves custom fields for template-specific data
 */
export declare class TemplateFormatConverter {
    /**
     * Convert an Article to template-agnostic format
     * @param article The article to convert
     * @returns Template-agnostic format representation
     */
    static toTemplateFormat(article: Article): TemplateArticleFormat;
    /**
     * Convert template-agnostic format back to Article
     * @param format The template-agnostic format to convert
     * @returns Article object
     */
    static fromTemplateFormat(format: TemplateArticleFormat): Article;
}
//# sourceMappingURL=TemplateFormatConverter.d.ts.map