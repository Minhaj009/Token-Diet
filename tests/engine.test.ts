import { describe, it, expect } from 'vitest';
import { compressPrompt, decompressResponse, detectFormat } from '../src/index.js';

describe('TokenDiet Core Orchestration Engine', () => {
  it('should correctly detect formats', () => {
    expect(detectFormat('{"id": 1}')).toBe('json');
    expect(detectFormat('function test() { return 1; }')).toBe('code');
    expect(detectFormat('# Header\n\n|a|b|')).toBe('markdown');
    expect(detectFormat('Just a plain sentence here.')).toBe('text');
  });

  it('should auto-detect and compress JSON with columnar canonicalization', () => {
    const rawJson = JSON.stringify([
      { transaction_identifier: 'TX_100', transaction_timestamp: 1710000000 },
      { transaction_identifier: 'TX_101', transaction_timestamp: 1710000001 }
    ], null, 2);

    const result = compressPrompt(rawJson, {
      targetFormat: 'auto',
      preserveComments: false
    });

    expect(result.format).toBe('json');
    expect(result.compressedTokens).toBeLessThan(result.originalTokens);
    expect(result.savingsPercentage).toBeGreaterThan(0);
    expect(result.compressed).toContain('@td:columnar');
  });

  it('should alias repeated identifiers and attach Aliases grammar header', () => {
    const rawPrompt = `
      Instructions for user account management:
      const user_authentication_session_token = "tok_123456789";
      verify_token(user_authentication_session_token);
      validate_token(user_authentication_session_token);
      persist_token(user_authentication_session_token);
      refresh_token(user_authentication_session_token);
      audit_token(user_authentication_session_token);
      log_token(user_authentication_session_token);
    `;

    const result = compressPrompt(rawPrompt, {
      symbolAliasing: true
    });

    expect(result.compressed).toContain('Aliases: $a=user_authentication_session_token');
    expect(result.compressedTokens).toBeLessThan(result.originalTokens);
    expect(result.savingsPercentage).toBeGreaterThan(0);
    expect(result.dictionary['$a']).toBeDefined();
  });

  it('should auto-detect and compress TypeScript code', () => {
    const code = `
      // Customer authentication handler
      export function authenticateCustomer(customer_session_token: string) {
        console.log(customer_session_token);
        return customer_session_token;
      }
    `;

    const result = compressPrompt(code, {
      targetFormat: 'code',
      lang: 'typescript',
      preserveComments: false,
      symbolAliasing: true
    });

    expect(result.format).toBe('code');
    expect(result.compressed).not.toContain('Customer authentication handler');
  });

  it('should decompress responses deterministically using local dictionary', () => {
    const compressed = 'Status for $a: confirmed';
    const dict = { '$a': 'customer_transaction_id' };
    const restored = decompressResponse(compressed, dict);
    expect(restored).toBe('Status for customer_transaction_id: confirmed');
  });

  it('should round-trip decompress a columnar JSON payload losslessly', () => {
    const rawJson = JSON.stringify([
      { sku: 'A1', quantity: 10 },
      { sku: 'B2', quantity: 20 }
    ]);
    const result = compressPrompt(rawJson, { targetFormat: 'json', symbolAliasing: false });
    const restored = decompressResponse(result.compressed);
    expect(JSON.parse(restored)).toEqual(JSON.parse(rawJson));
  });
});
