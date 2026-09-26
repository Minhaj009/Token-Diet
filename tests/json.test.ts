import { describe, it, expect } from 'vitest';
import { compressJson, decompressJson } from '../src/parsers/json.js';

describe('Columnar JSON Compressor', () => {
  it('should transform arrays of objects into columnar tabular tuples', () => {
    const rawJson = JSON.stringify([
      { id: 1, status: 'ok', score: 98.5 },
      { id: 2, status: 'ok', score: 85.0 }
    ], null, 2);

    const compressed = compressJson(rawJson);
    expect(compressed).toContain('@td:columnar');
    expect(compressed).toContain('keys:id,status,score');
    expect(compressed).toContain('1,"ok",98.5');
    expect(compressed).toContain('2,"ok",85');
  });

  it('should decompress columnar JSON losslessly back to exact original object values', () => {
    const originalData = [
      { user_id: 'usr_100', role: 'admin', active: true, notes: 'Special chars: | and ,' },
      { user_id: 'usr_200', role: 'member', active: false, notes: 'Normal note' }
    ];
    const rawJson = JSON.stringify(originalData);

    const compressed = compressJson(rawJson);
    const restored = decompressJson(compressed);
    const parsed = JSON.parse(restored);

    expect(parsed).toEqual(originalData);
  });

  it('should minify arbitrary non-columnar JSON without altering content', () => {
    const complexJson = JSON.stringify({
      version: '1.0',
      settings: { enabled: true, tags: ['a', 'b'] }
    }, null, 4);

    const compressed = compressJson(complexJson);
    expect(compressed).not.toContain('@td:columnar');
    expect(JSON.parse(compressed)).toEqual(JSON.parse(complexJson));
  });

  it('should handle non-JSON strings gracefully by trimming without crashing', () => {
    const invalidJson = '{ not quite json }';
    expect(compressJson(invalidJson)).toBe(invalidJson);
    expect(decompressJson(invalidJson)).toBe(invalidJson);
  });
});
