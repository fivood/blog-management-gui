import { describe, it, expect } from 'vitest';
import { SecurityService } from '../src/services/SecurityService';

describe('SecurityService', () => {
  const password = 'test-password-123';
  const content = 'This is secret content that needs protection.';

  describe('hashPassword', () => {
    it('should generate a consistent SHA-256 hash', () => {
      const hash1 = SecurityService.hashPassword(password);
      const hash2 = SecurityService.hashPassword(password);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // Hex string of SHA-256
      expect(hash1).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate different hashes for different passwords', () => {
      const hash1 = SecurityService.hashPassword(password);
      const hash2 = SecurityService.hashPassword(password + 'extra');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Encryption/Decryption Round-trip', () => {
    it('should correctly encrypt and decrypt content', async () => {
      const encrypted = await SecurityService.encrypt(content, password);
      
      expect(encrypted.v).toBe(1);
      expect(encrypted.alg).toBe('AES-256-GCM');
      expect(encrypted.data).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();

      const decrypted = await SecurityService.decrypt(encrypted, password);
      expect(decrypted).toBe(content);
    });

    it('should fail to decrypt with wrong password', async () => {
      const encrypted = await SecurityService.encrypt(content, password);
      
      await expect(SecurityService.decrypt(encrypted, 'wrong-password'))
        .rejects.toThrow();
    });

    it('should produce different ciphertexts for the same content and password (due to random IV/salt)', async () => {
      const encrypted1 = await SecurityService.encrypt(content, password);
      const encrypted2 = await SecurityService.encrypt(content, password);
      
      expect(encrypted1.data).not.toBe(encrypted2.data);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
    });
  });
});
