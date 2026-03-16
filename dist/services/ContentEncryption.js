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
exports.ContentEncryption = void 0;
const CryptoJS = __importStar(require("crypto-js"));
/**
 * Content Encryption Service
 * Uses CryptoJS for encryption (same library as client-side)
 */
class ContentEncryption {
    /**
     * Encrypt content using AES (CryptoJS)
     * @param content The content to encrypt
     * @param password The password to use for encryption
     * @returns Encrypted content in CryptoJS format (base64)
     */
    static encrypt(content, password) {
        try {
            const encrypted = CryptoJS.AES.encrypt(content, password);
            return encrypted.toString();
        }
        catch (error) {
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate SHA-256 hash of password for verification
     * @param password The password to hash
     * @returns SHA-256 hash as hex string
     */
    static hashPassword(password) {
        return CryptoJS.SHA256(password).toString();
    }
    /**
     * Decrypt content using AES (for testing purposes)
     * @param encryptedContent The encrypted content
     * @param password The password to use for decryption
     * @returns Decrypted content
     */
    static decrypt(encryptedContent, password) {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedContent, password);
            return decrypted.toString(CryptoJS.enc.Utf8);
        }
        catch (error) {
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.ContentEncryption = ContentEncryption;
//# sourceMappingURL=ContentEncryption.js.map