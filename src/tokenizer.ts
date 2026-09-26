export interface TokenStats {
  originalTokens: number;
  compressedTokens: number;
  originalBytes: number;
  compressedBytes: number;
  savingsPercentage: number;
  byteSavingsPercentage: number;
}

/**
 * Deterministic, offline BPE-approximating tokenizer.
 * Adheres to cl100k_base / Llama regex word boundaries without network or large weight dependencies.
 */
const TOKEN_PATTERN = /'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  const matches = text.match(TOKEN_PATTERN);
  if (!matches) {
    return Math.ceil(text.length / 4);
  }
  return matches.length;
}

export function calculateSavings(original: string, compressed: string): TokenStats {
  const originalTokens = estimateTokens(original);
  const compressedTokens = estimateTokens(compressed);
  const originalBytes = Buffer.byteLength(original, 'utf-8');
  const compressedBytes = Buffer.byteLength(compressed, 'utf-8');

  const tokenDiff = originalTokens - compressedTokens;
  const savingsPercentage = originalTokens > 0 && tokenDiff > 0
    ? Math.max(0, Number(((tokenDiff / originalTokens) * 100).toFixed(2)))
    : 0;

  const byteDiff = originalBytes - compressedBytes;
  const byteSavingsPercentage = originalBytes > 0 && byteDiff > 0
    ? Math.max(0, Number(((byteDiff / originalBytes) * 100).toFixed(2)))
    : 0;

  return {
    originalTokens,
    compressedTokens,
    originalBytes,
    compressedBytes,
    savingsPercentage,
    byteSavingsPercentage
  };
}
