import { describe, it, expect } from 'vitest';
import { compressPrompt, decompressResponse } from '../src/index.js';
import { initWasm } from '../bindings/wasm/index.js';

describe('End-to-End Lossless Verification Matrix', () => {
  it('should achieve 30-50%+ token reduction on repetitive JSON schemas losslessly', () => {
    const rawSchema = JSON.stringify(Array.from({ length: 30 }, (_, i) => ({
      customer_record_identifier: `rec_${i}`,
      customer_authentication_status: 'authenticated',
      account_balance_cents: 15000 + i * 100,
      timestamp_epoch_seconds: 1711000000 + i,
      location_region_code: 'US-WEST-2'
    })), null, 2);

    const result = compressPrompt(rawSchema, { symbolAliasing: true });
    expect(result.savingsPercentage).toBeGreaterThanOrEqual(30);

    const decompressed = decompressResponse(result.compressed, result.dictionary);
    const restoredData = JSON.parse(decompressed);
    expect(restoredData.length).toBe(30);
    expect(restoredData[0].customer_record_identifier).toBe('rec_0');
    expect(restoredData[29].location_region_code).toBe('US-WEST-2');
  });

  it('should compress Markdown tables and maintain code block fidelity', () => {
    const markdownDoc = `
# API Reference

| Endpoint Route Path               | HTTP Action Method | Authentication Required | Rate Limit Tier       |
|-----------------------------------|--------------------|-------------------------|-----------------------|
| /api/v1/user/profile              | GET                | Bearer Token Required   | standard_tier_limit   |
| /api/v1/user/update               | POST               | Bearer Token Required   | standard_tier_limit   |
| /api/v1/auth/login                | POST               | Public Access           | unauthenticated_tier  |
| /api/v1/payments/create           | POST               | Bearer Token Required   | restricted_tier_limit |
| /api/v1/payments/verify           | GET                | Bearer Token Required   | restricted_tier_limit |

\`\`\`json
{
  "preserve": "this block strictly intact",
  "spaces": "    should not be collapsed inside here    "
}
\`\`\`
    `;

    const result = compressPrompt(markdownDoc, { targetFormat: 'markdown' });
    expect(result.compressedTokens).toBeLessThan(result.originalTokens);
    expect(result.compressed).toContain('|/api/v1/user/profile|GET|Bearer Token Required|standard_tier_limit|');
    expect(result.compressed).toContain('should not be collapsed inside here');
  });

  it('should compress real-world TypeScript code safely', () => {
    const tsCode = `
      /**
       * Primary API controller
       */
      // Internal logging helper
      export class PaymentController {
        // Handle checkout session creation
        public async createSession(sessionId: string): Promise<boolean> {
          const formatted = "Session ID: // not a comment";
          console.log(formatted);
          return true;
        }
      }
    `;

    const result = compressPrompt(tsCode, { targetFormat: 'code', lang: 'typescript', preserveComments: false });
    expect(result.compressed).not.toContain('Handle checkout session creation');
    expect(result.compressed).not.toContain('Internal logging helper');
    expect(result.compressed).toContain('formatted = "Session ID: // not a comment"');
    expect(result.savingsPercentage).toBeGreaterThan(0);
  });

  it('should work via WASM binding abstraction seamlessly', async () => {
    const wasm = await initWasm();
    const raw = JSON.stringify(Array.from({ length: 10 }, (_, i) => ({
      item_id: i,
      item_name: `Product_${i}`,
      item_status: 'in_stock'
    })));
    const jsonStr = wasm.compressPromptWasm(raw, 'json', false, false);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.compressed).toContain('@td:columnar');
    expect(parsed.savingsPercentage).toBeGreaterThan(0);

    const restored = wasm.decompressResponseWasm(parsed.compressed);
    expect(JSON.parse(restored).length).toBe(10);
    expect(JSON.parse(restored)[0].item_name).toBe('Product_0');
  });
});
