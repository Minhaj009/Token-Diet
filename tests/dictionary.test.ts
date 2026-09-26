import { describe, it, expect } from 'vitest';
import { SymbolAliaser } from '../src/dictionary.js';

describe('Symbol Aliasing & Decompression Grammar', () => {
  it('should alias frequent long identifiers and append a decompression grammar header', () => {
    const aliaser = new SymbolAliaser({ minLength: 4, minOccurrences: 2 });
    const input = `
      const transaction_timestamp = get_transaction_timestamp();
      validate_timestamp(transaction_timestamp);
      save_timestamp(transaction_timestamp);
    `;
    const result = aliaser.alias(input);

    expect(result.aliased).toContain('$a');
    expect(result.header).toContain('$a=transaction_timestamp');
    expect(result.dictionary['$a']).toBe('transaction_timestamp');
  });

  it('should reverse aliased text losslessly using the dictionary', () => {
    const aliaser = new SymbolAliaser();
    const input = 'order_reference_number is verified. order_reference_number complete.';
    const { aliased, dictionary } = aliaser.alias(input);
    const restored = aliaser.restore(aliased, dictionary);
    expect(restored).toBe(input);
  });

  it('should not alias when overhead of header exceeds savings', () => {
    const aliaser = new SymbolAliaser();
    const input = 'short unique text without repetition';
    const result = aliaser.alias(input);
    expect(Object.keys(result.dictionary).length).toBe(0);
    expect(result.header).toBe('');
    expect(result.aliased).toBe(input);
  });

  it('should support stripping grammar header during restore automatically if header is embedded', () => {
    const aliaser = new SymbolAliaser();
    const input = 'super_long_identifier and super_long_identifier matched!';
    const result = aliaser.alias(input);
    const textWithHeader = `${result.header}${result.aliased}`;
    const restored = aliaser.restore(textWithHeader, result.dictionary);
    expect(restored).toBe(input);
  });
});
