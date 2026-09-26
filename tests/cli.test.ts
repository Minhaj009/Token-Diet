import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

describe('TokenDiet CLI Terminal Runner', () => {
  const sampleJsonPath = resolve(process.cwd(), 'sample_test_input.json');

  it('should compress a file via CLI and display token savings', () => {
    writeFileSync(sampleJsonPath, JSON.stringify([
      { item_identifier: 'ID_1', item_description: 'Widget A' },
      { item_identifier: 'ID_2', item_description: 'Widget B' }
    ]));

    try {
      const output = execSync(`node ./bin/tokendiet.js compress "${sampleJsonPath}" --format json`, {
        encoding: 'utf-8'
      });
      expect(output).toContain('@td:columnar');
    } finally {
      try {
        unlinkSync(sampleJsonPath);
      } catch {}
    }
  });

  it('should support stdin piping into tokendiet compress', () => {
    const input = 'const transaction_identifier = "TX_100";';
    const output = execSync(`node ./bin/tokendiet.js compress --format code --lang typescript`, {
      input,
      encoding: 'utf-8'
    });
    expect(output).toContain('transaction_identifier');
  });

  it('should support outputting stats as json with --json flag', () => {
    const input = JSON.stringify([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
    const output = execSync(`node ./bin/tokendiet.js compress --format json --json`, {
      input,
      encoding: 'utf-8'
    });
    const parsed = JSON.parse(output);
    expect(parsed.originalTokens).toBeDefined();
    expect(parsed.compressedTokens).toBeDefined();
    expect(parsed.savingsPercentage).toBeDefined();
  });
});
