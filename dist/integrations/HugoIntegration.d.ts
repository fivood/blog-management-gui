import { Article } from '../types/index';
/**
 * Hugo Integration Layer
 * Handles conversion between Article format and Hugo frontmatter format
 * Supports YAML frontmatter format for Hugo static site generation
 */
export declare class HugoIntegration {
    /**
     * Convert an Article to Hugo frontmatter format
     * Returns a string with YAML frontmatter and content separated by ---
     *
     * @param article The article to convert
     * @param password Optional password for encryption (if article is protected)
     * @returns String with Hugo frontmatter and content
     */
    static toHugoFrontMatter(article: Article, password?: string): string;
    /**
     * Parse Hugo frontmatter to Article
     * Expects format: ---\nYAML\n---\n\nContent
     *
     * @param content The Hugo file content with frontmatter
     * @returns Article object
     */
    static fromHugoFrontMatter(content: string): Article;
    /**
     * Generate a static file for the article
     * Writes the article as a Hugo content file with frontmatter
     *
     * @param article The article to write
     * @param outputPath The path where the file should be written
     */
    static generateStaticFile(article: Article, outputPath: string): Promise<void>;
    /**
     * Convert a plain object to YAML format
     * Simple YAML serialization for frontmatter
     *
     * @param obj The object to convert
     * @returns YAML string
     */
    private static objectToYaml;
    /**
     * Convert YAML format to a plain object
     * Simple YAML deserialization for frontmatter
     *
     * @param yaml The YAML string to parse
     * @returns Plain object
     */
    private static yamlToObject;
    /**
     * Parse a YAML value string
     * Handles strings, numbers, booleans, and dates
     *
     * @param value The value string to parse
     * @returns Parsed value
     */
    private static parseYamlValue;
    /**
     * Escape a value for YAML format
     *
     * @param value The value to escape
     * @returns Escaped value
     */
    private static escapeYamlValue;
}
//# sourceMappingURL=HugoIntegration.d.ts.map