import { describe, it, expect } from 'vitest';
import { compressCode } from '../src/parsers/code.js';

describe('AST Code Stripper', () => {
  it('should remove comments while preserving string literals and docstrings when requested', () => {
    const code = `
      // Single line comment
      const apiEndpoint = "https://api.example.com // not a comment";
      /* Multi-line
         comment */
      /** JSDoc description */
      function fetchData() {
        return apiEndpoint;
      }
    `;

    const compressed = compressCode(code, { lang: 'typescript', preserveComments: false });
    expect(compressed).not.toContain('Single line comment');
    expect(compressed).not.toContain('Multi-line');
    expect(compressed).toContain('https://api.example.com // not a comment');
    expect(compressed).toContain('function fetchData()');
  });

  it('should fold redundant whitespace and blank lines safely', () => {
    const code = `
      const a = 1;


      const b = 2;
    `;
    const compressed = compressCode(code, { lang: 'typescript' });
    expect(compressed).not.toMatch(/\n\s*\n\s*\n/);
  });

  it('should preserve Python indentation semantics without breaking indentation blocks', () => {
    const pythonCode = `
      def calculate_tax(amount):
          # Tax calculator
          rate = 0.2
          
          return amount * rate
    `;
    const compressed = compressCode(pythonCode, { lang: 'python', preserveComments: false });
    expect(compressed).toContain('def calculate_tax(amount):');
    expect(compressed).toContain('    rate = 0.2');
    expect(compressed).not.toContain('Tax calculator');
  });

  it('should retain comments if preserveComments is true', () => {
    const code = '// Important notice\nconst x = 10;';
    const compressed = compressCode(code, { preserveComments: true });
    expect(compressed).toContain('Important notice');
  });
});
