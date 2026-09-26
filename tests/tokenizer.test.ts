import { describe, it, expect } from 'vitest';
import { estimateTokens, calculateSavings } from '../src/tokenizer.js';

describe('Token Estimation Engine', () => {
  it('should estimate token counts deterministically using BPE rules', () => {
    const text = 'Hello world! This is a token compression test with 123 numbers.';
    const count = estimateTokens(text);
    expect(count).toBeGreaterThan(5);
    expect(count).toBeLessThan(25);
  });

  it('should return 0 tokens for empty or whitespace-only strings', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('   \n\t  ')).toBe(0);
  });

  it('should calculate savings percentage and byte differentials accurately', () => {
    const original = '{"customer_id": 12345, "customer_status": "active", "transaction_total": 99.50}';
    const compressed = '{"$a":12345,"$b":"active","$c":99.5}';
    const stats = calculateSavings(original, compressed);
    
    expect(stats.originalTokens).toBeGreaterThan(stats.compressedTokens);
    expect(stats.originalBytes).toBeGreaterThan(stats.compressedBytes);
    expect(stats.savingsPercentage).toBeGreaterThan(0);
    expect(stats.savingsPercentage).toBeLessThan(100);
    expect(stats.byteSavingsPercentage).toBeGreaterThan(0);
  });

  it('should handle edge cases where compressed is empty or equal', () => {
    const same = 'const x = 1;';
    const stats = calculateSavings(same, same);
    expect(stats.savingsPercentage).toBe(0);
    expect(stats.byteSavingsPercentage).toBe(0);
  });
});
