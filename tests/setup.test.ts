import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Project Setup & Manifest Verification', () => {
  it('should have a valid package.json with tokendiet name and bin entry', () => {
    const pkgPath = resolve(process.cwd(), 'package.json');
    expect(existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBe('tokendiet');
    expect(pkg.version).toBe('0.1.0');
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin.tokendiet).toBe('./bin/tokendiet.js');
  });

  it('should have a valid tsconfig.json', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.json');
    expect(existsSync(tsconfigPath)).toBe(true);
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    expect(tsconfig.compilerOptions.target).toBeDefined();
  });
});
