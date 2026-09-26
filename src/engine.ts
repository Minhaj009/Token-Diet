import { compressJson, decompressJson } from './parsers/json.js';
import { compressCode } from './parsers/code.js';
import { compressMarkdown } from './parsers/markdown.js';
import { SymbolAliaser } from './dictionary.js';
import { calculateSavings, TokenStats } from './tokenizer.js';

export type TargetFormat = 'auto' | 'json' | 'code' | 'markdown' | 'text';

export interface CompressOptions {
  targetFormat?: TargetFormat;
  preserveComments?: boolean;
  symbolAliasing?: boolean;
  lang?: string;
}

export interface CompressResult extends TokenStats {
  compressed: string;
  header: string;
  dictionary: Record<string, string>;
  format: TargetFormat;
}

export function detectFormat(content: string): TargetFormat {
  const trimmed = content.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // not valid JSON, proceed to other checks
    }
  }
  if (/^(\s*#|\s*```|\|.*\|)/m.test(trimmed)) {
    return 'markdown';
  }
  if (/\b(function|const|let|var|def|class|import|export|fn|pub|struct)\b/.test(trimmed)) {
    return 'code';
  }
  return 'text';
}

export function compressPrompt(rawInput: string, options: CompressOptions = {}): CompressResult {
  const format = (!options.targetFormat || options.targetFormat === 'auto')
    ? detectFormat(rawInput)
    : options.targetFormat;

  let transformed = rawInput;

  switch (format) {
    case 'json':
      transformed = compressJson(rawInput);
      break;
    case 'code':
      transformed = compressCode(rawInput, {
        lang: options.lang,
        preserveComments: options.preserveComments
      });
      break;
    case 'markdown':
      transformed = compressMarkdown(rawInput);
      break;
    default:
      transformed = rawInput.trim();
  }

  let finalCompressed = transformed;
  let header = '';
  let dictionary: Record<string, string> = {};

  if (options.symbolAliasing) {
    const aliaser = new SymbolAliaser();
    const aliasResult = aliaser.alias(transformed);
    if (Object.keys(aliasResult.dictionary).length > 0) {
      header = aliasResult.header;
      dictionary = aliasResult.dictionary;
      finalCompressed = `${header}${aliasResult.aliased}`;
    }
  }

  const stats = calculateSavings(rawInput, finalCompressed);

  return {
    ...stats,
    compressed: finalCompressed,
    header,
    dictionary,
    format
  };
}

export function decompressResponse(compressedText: string, dictionary?: Record<string, string>): string {
  const aliaser = new SymbolAliaser();
  let decompressed = aliaser.restore(compressedText, dictionary || {});
  decompressed = decompressJson(decompressed);
  return decompressed;
}
