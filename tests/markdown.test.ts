import { describe, it, expect } from 'vitest';
import { compressMarkdown } from '../src/parsers/markdown.js';

describe('Markdown Minimizer', () => {
  it('should trim padding spaces in markdown tables', () => {
    const md = `
| Customer Name       | Status      | Total Spent |
|---------------------|-------------|-------------|
| John Doe            | Active      | $120.50     |
| Jane Smith          | Inactive    | $45.00      |
    `;
    const compressed = compressMarkdown(md);
    expect(compressed).toContain('|Customer Name|Status|Total Spent|');
    expect(compressed).toContain('|John Doe|Active|$120.50|');
  });

  it('should preserve fenced code blocks verbatim without corrupting syntax', () => {
    const md = `
# Title

\`\`\`json
{
  "keep": "spaces   preserved"
}
\`\`\`
    `;
    const compressed = compressMarkdown(md);
    expect(compressed).toContain('"keep": "spaces   preserved"');
  });

  it('should collapse excessive blank lines between markdown blocks', () => {
    const md = '# Header\n\n\n\nParagraph text\n\n\n\n- Item 1';
    const compressed = compressMarkdown(md);
    expect(compressed).not.toMatch(/\n\s*\n\s*\n/);
  });
});
