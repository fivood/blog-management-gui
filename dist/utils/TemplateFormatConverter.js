"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateFormatConverter = void 0;
/**
 * Utility class for converting between Article and template-agnostic format
 * Ensures data consistency and preserves custom fields for template-specific data
 */
class TemplateFormatConverter {
    /**
     * Convert an Article to template-agnostic format
     * @param article The article to convert
     * @returns Template-agnostic format representation
     */
    static toTemplateFormat(article) {
        return {
            id: article.id,
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            tags: article.tags,
            categories: article.categories,
            author: article.author,
            state: article.state,
            createdAt: article.createdAt.toISOString(),
            publishedAt: article.publishedAt?.toISOString(),
            modifiedAt: article.modifiedAt.toISOString(),
            version: article.version,
            isProtected: article.isProtected,
            metadata: {
                title: article.metadata.title,
                description: article.metadata.description,
                keywords: article.metadata.keywords,
                author: article.metadata.author,
                customFields: article.metadata.customFields,
            },
        };
    }
    /**
     * Convert template-agnostic format back to Article
     * @param format The template-agnostic format to convert
     * @returns Article object
     */
    static fromTemplateFormat(format) {
        return {
            id: format.id,
            title: format.title,
            content: format.content,
            excerpt: format.excerpt,
            tags: format.tags,
            categories: format.categories,
            author: format.author,
            state: format.state,
            createdAt: new Date(format.createdAt),
            publishedAt: format.publishedAt ? new Date(format.publishedAt) : undefined,
            modifiedAt: new Date(format.modifiedAt),
            version: format.version,
            isProtected: format.isProtected,
            passwordHash: undefined, // Password hash is never included in template format
            metadata: {
                title: format.metadata.title,
                description: format.metadata.description,
                keywords: format.metadata.keywords,
                author: format.metadata.author,
                customFields: format.metadata.customFields,
            },
        };
    }
}
exports.TemplateFormatConverter = TemplateFormatConverter;
//# sourceMappingURL=TemplateFormatConverter.js.map