"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HugoIntegration = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * Hugo Integration Layer
 * Handles conversion between Article format and Hugo frontmatter format
 * Supports YAML frontmatter format for Hugo static site generation
 */
class HugoIntegration {
    /**
     * Convert an Article to Hugo frontmatter format
     * Returns a string with YAML frontmatter and content separated by ---
     *
     * @param article The article to convert
     * @param password Optional password for encryption (if article is protected)
     * @returns String with Hugo frontmatter and content
     */
    static toHugoFrontMatter(article, password) {
        // Build YAML frontmatter
        const frontmatter = {
            title: article.title,
            date: article.publishedAt || article.createdAt,
            lastmod: article.modifiedAt,
            draft: article.state === 'draft',
            tags: article.tags.length > 0 ? article.tags : undefined,
            categories: article.categories.length > 0 ? article.categories : undefined,
            author: article.author,
            description: article.metadata.description,
            keywords: article.metadata.keywords,
            // Add password protection flag and hash
            protected: article.isProtected ? true : undefined,
            passwordHash: article.passwordHash || undefined,
            passwordHint: article.passwordHint || undefined,
        };
        // If article is protected and we have encrypted content, add it
        if (article.isProtected && article.encryptedContent) {
            frontmatter.encryptedContent = article.encryptedContent;
        }
        // Add custom fields if present
        if (article.metadata.customFields) {
            Object.assign(frontmatter, article.metadata.customFields);
        }
        // Remove undefined values
        Object.keys(frontmatter).forEach(key => {
            if (frontmatter[key] === undefined) {
                delete frontmatter[key];
            }
        });
        // Convert to YAML format
        const yamlFrontmatter = this.objectToYaml(frontmatter);
        // Return frontmatter with content
        return `---\n${yamlFrontmatter}---\n\n${article.content}`;
    }
    /**
     * Parse Hugo frontmatter to Article
     * Expects format: ---\nYAML\n---\n\nContent
     *
     * @param content The Hugo file content with frontmatter
     * @returns Article object
     */
    static fromHugoFrontMatter(content) {
        // Extract frontmatter and content
        const parts = content.split('---');
        if (parts.length < 3) {
            throw new Error('Invalid Hugo frontmatter format. Expected: ---\\nYAML\\n---\\n\\nContent');
        }
        const yamlContent = parts[1].trim();
        // Join remaining parts and handle the content carefully
        let articleContent = parts.slice(2).join('---');
        // Remove leading newline if present, but preserve internal structure
        if (articleContent.startsWith('\n')) {
            articleContent = articleContent.substring(1);
        }
        // Remove only trailing whitespace
        articleContent = articleContent.trimEnd();
        // Parse YAML frontmatter
        const frontmatter = this.yamlToObject(yamlContent);
        // Extract standard fields
        const title = frontmatter.title || '';
        const date = frontmatter.date ? new Date(frontmatter.date) : new Date();
        const lastmod = frontmatter.lastmod ? new Date(frontmatter.lastmod) : new Date();
        const isDraft = frontmatter.draft === true || frontmatter.draft === 'true';
        const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
        const categories = Array.isArray(frontmatter.categories) ? frontmatter.categories : [];
        const author = frontmatter.author;
        const description = frontmatter.description;
        const keywords = Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [];
        const isProtected = frontmatter.protected === true || frontmatter.protected === 'true';
        const passwordHash = frontmatter.passwordHash;
        const passwordHint = frontmatter.passwordHint;
        // Extract custom fields (everything not in standard fields)
        const standardFields = ['title', 'date', 'lastmod', 'draft', 'tags', 'categories', 'author', 'description', 'keywords', 'protected', 'passwordHash', 'passwordHint'];
        const customFields = {};
        Object.keys(frontmatter).forEach(key => {
            if (!standardFields.includes(key)) {
                customFields[key] = frontmatter[key];
            }
        });
        // Create Article object
        const article = {
            id: '', // Will be set by caller if needed
            title,
            content: articleContent,
            excerpt: undefined,
            tags,
            categories,
            author,
            state: isDraft ? 'draft' : 'published',
            createdAt: date,
            publishedAt: isDraft ? undefined : date,
            modifiedAt: lastmod,
            version: 1,
            isProtected,
            passwordHash,
            passwordHint,
            metadata: {
                title,
                description,
                keywords: keywords.length > 0 ? keywords : undefined,
                author,
                customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
            },
        };
        return article;
    }
    /**
     * Generate a static file for the article
     * Writes the article as a Hugo content file with frontmatter
     *
     * @param article The article to write
     * @param outputPath The path where the file should be written
     */
    static async generateStaticFile(article, outputPath) {
        try {
            // Create directory if it doesn't exist
            const directory = path.dirname(outputPath);
            await fs.mkdir(directory, { recursive: true });
            // Generate Hugo frontmatter content
            const hugoContent = this.toHugoFrontMatter(article);
            // Write to file
            await fs.writeFile(outputPath, hugoContent, 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to generate static file at ${outputPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Convert a plain object to YAML format
     * Simple YAML serialization for frontmatter
     *
     * @param obj The object to convert
     * @returns YAML string
     */
    static objectToYaml(obj) {
        const lines = [];
        for (const [key, value] of Object.entries(obj)) {
            if (value === undefined || value === null) {
                continue;
            }
            if (Array.isArray(value)) {
                lines.push(`${key}:`);
                for (const item of value) {
                    lines.push(`  - ${this.escapeYamlValue(item)}`);
                }
            }
            else if (typeof value === 'object' && !(value instanceof Date)) {
                lines.push(`${key}:`);
                for (const [subKey, subValue] of Object.entries(value)) {
                    lines.push(`  ${subKey}: ${this.escapeYamlValue(subValue)}`);
                }
            }
            else if (value instanceof Date) {
                lines.push(`${key}: ${value.toISOString()}`);
            }
            else if (typeof value === 'string') {
                lines.push(`${key}: ${this.escapeYamlValue(value)}`);
            }
            else {
                lines.push(`${key}: ${value}`);
            }
        }
        return lines.join('\n') + '\n';
    }
    /**
     * Convert YAML format to a plain object
     * Simple YAML deserialization for frontmatter
     *
     * @param yaml The YAML string to parse
     * @returns Plain object
     */
    static yamlToObject(yaml) {
        const obj = {};
        const lines = yaml.split('\n').filter(line => line.trim());
        let currentKey = null;
        let currentArray = null;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            // Check if this is an array item
            if (trimmed.startsWith('- ')) {
                if (currentArray === null) {
                    currentArray = [];
                    if (currentKey) {
                        obj[currentKey] = currentArray;
                    }
                }
                const value = trimmed.substring(2).trim();
                currentArray.push(this.parseYamlValue(value));
                continue;
            }
            // Check if this is a nested object
            if (line.startsWith('  ') && !trimmed.startsWith('-')) {
                const match = trimmed.match(/^([^:]+):\s*(.*)$/);
                if (match && currentKey) {
                    const [, subKey, subValue] = match;
                    if (!obj[currentKey]) {
                        obj[currentKey] = {};
                    }
                    if (typeof obj[currentKey] === 'object' && !Array.isArray(obj[currentKey])) {
                        obj[currentKey][subKey] = this.parseYamlValue(subValue);
                    }
                }
                continue;
            }
            // Regular key-value pair
            const match = trimmed.match(/^([^:]+):\s*(.*)$/);
            if (match) {
                const [, key, value] = match;
                currentKey = key.trim();
                currentArray = null;
                obj[currentKey] = this.parseYamlValue(value);
            }
        }
        return obj;
    }
    /**
     * Parse a YAML value string
     * Handles strings, numbers, booleans, and dates
     *
     * @param value The value string to parse
     * @returns Parsed value
     */
    static parseYamlValue(value) {
        const trimmed = value.trim();
        // Handle empty values
        if (!trimmed)
            return '';
        // Handle quoted strings
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }
        // Handle booleans
        if (trimmed === 'true')
            return true;
        if (trimmed === 'false')
            return false;
        // Handle numbers
        if (/^\d+$/.test(trimmed))
            return parseInt(trimmed, 10);
        if (/^\d+\.\d+$/.test(trimmed))
            return parseFloat(trimmed);
        // Handle ISO dates
        if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
            return new Date(trimmed);
        }
        // Default to string
        return trimmed;
    }
    /**
     * Escape a value for YAML format
     *
     * @param value The value to escape
     * @returns Escaped value
     */
    static escapeYamlValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'string') {
            // Quote strings that contain special characters
            if (value.includes(':') || value.includes('#') || value.includes('"') || value.includes("'")) {
                return `"${value.replace(/"/g, '\\"')}"`;
            }
            return value;
        }
        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        return String(value);
    }
}
exports.HugoIntegration = HugoIntegration;
//# sourceMappingURL=HugoIntegration.js.map