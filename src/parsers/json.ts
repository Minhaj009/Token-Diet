const COLUMNAR_PREFIX = '@td:columnar[';
const COLUMNAR_SUFFIX = ']';

/**
 * Splits a columnar payload by delimiter '|' only when outside of double-quoted strings.
 */
function splitRows(payload: string): string[] {
  const rows: string[] = [];
  let current = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < payload.length; i++) {
    const char = payload[i];
    if (escape) {
      current += char;
      escape = false;
    } else if (char === '\\') {
      current += char;
      escape = true;
    } else if (char === '"') {
      inString = !inString;
      current += char;
    } else if (char === '|' && !inString) {
      rows.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.length > 0) {
    rows.push(current);
  }
  return rows;
}

export function compressJson(rawJson: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return rawJson.trim();
  }

  // Check if eligible for columnar compression: Array of uniform objects
  if (
    Array.isArray(parsed) &&
    parsed.length >= 2 &&
    parsed.every(item => item !== null && typeof item === 'object' && !Array.isArray(item))
  ) {
    const sampleKeys = Object.keys(parsed[0]);
    const isUniform = parsed.every(item => {
      const keys = Object.keys(item);
      return keys.length === sampleKeys.length && keys.every(k => k in item);
    });

    if (isUniform && sampleKeys.length > 0) {
      const header = `keys:${sampleKeys.join(',')}`;
      const rows = parsed.map(item => {
        return sampleKeys.map(k => JSON.stringify(item[k])).join(',');
      });
      return `${COLUMNAR_PREFIX}${header}|${rows.join('|')}${COLUMNAR_SUFFIX}`;
    }
  }

  // Fallback to minified standard JSON
  return JSON.stringify(parsed);
}

export function decompressJson(compressed: string): string {
  const trimmed = compressed.trim();
  if (trimmed.startsWith(COLUMNAR_PREFIX) && trimmed.endsWith(COLUMNAR_SUFFIX)) {
    const payload = trimmed.slice(COLUMNAR_PREFIX.length, -COLUMNAR_SUFFIX.length);
    const parts = splitRows(payload);
    if (parts.length >= 2 && parts[0].startsWith('keys:')) {
      const keys = parts[0].slice(5).split(',');
      const rows = parts.slice(1);

      const reconstructed = rows.map(row => {
        const values: unknown[] = JSON.parse(`[${row}]`);
        const obj: Record<string, unknown> = {};
        keys.forEach((key, idx) => {
          obj[key] = values[idx];
        });
        return obj;
      });

      return JSON.stringify(reconstructed);
    }
  }

  return compressed;
}
