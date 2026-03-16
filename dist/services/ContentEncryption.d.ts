/**
 * Content Encryption Service
 * Uses CryptoJS for encryption (same library as client-side)
 */
export declare class ContentEncryption {
    /**
     * Encrypt content using AES (CryptoJS)
     * @param content The content to encrypt
     * @param password The password to use for encryption
     * @returns Encrypted content in CryptoJS format (base64)
     */
    static encrypt(content: string, password: string): string;
    /**
     * Generate SHA-256 hash of password for verification
     * @param password The password to hash
     * @returns SHA-256 hash as hex string
     */
    static hashPassword(password: string): string;
    /**
     * Decrypt content using AES (for testing purposes)
     * @param encryptedContent The encrypted content
     * @param password The password to use for decryption
     * @returns Decrypted content
     */
    static decrypt(encryptedContent: string, password: string): string;
}
//# sourceMappingURL=ContentEncryption.d.ts.map