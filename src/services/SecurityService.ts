import * as crypto from 'crypto';

/**
 * Security Service
 * Unified service for password hashing and content encryption using Node.js native crypto.
 * Uses PBKDF2 for key derivation and AES-256-GCM for authenticated encryption.
 */
export class SecurityService {
  private static readonly ITERATIONS = 210000;
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly DIGEST = 'sha256';
  private static readonly SALT_LENGTH = 16;
  private static readonly IV_LENGTH = 12;

  /**
   * Encrypt content using AES-256-GCM
   * Returns a structured object containing all necessary data for decryption
   * 
   * @param content Plaintext content to encrypt
   * @param password Password for encryption
   * @returns Encryption result object
   */
  static async encrypt(content: string, password: string): Promise<any> {
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, this.DIGEST);

    // Encrypt using AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(content, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      v: 1,
      alg: 'AES-256-GCM',
      kdf: 'PBKDF2',
      digest: this.DIGEST,
      iterations: this.ITERATIONS,
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      data: encrypted.toString('base64')
    };
  }

  /**
   * Generate a simple SHA-256 hash for password verification in frontmatter
   * This is used for quick client-side checks before intensive decryption
   * 
   * @param password Password to hash
   * @returns SHA-256 hash as hex string
   */
  static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Decrypt content using AES-256-GCM
   * 
   * @param encryptedData The encryption result object
   * @param password Password for decryption
   * @returns Decrypted content
   */
  static async decrypt(encryptedData: any, password: string): Promise<string> {
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');
    const data = Buffer.from(encryptedData.data, 'base64');

    // Derive key using same parameters
    const key = crypto.pbkdf2Sync(password, salt, encryptedData.iterations || this.ITERATIONS, this.KEY_LENGTH, encryptedData.digest || this.DIGEST);

    // Decrypt using AES-256-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(data);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }
}
