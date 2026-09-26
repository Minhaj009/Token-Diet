export interface CodeCompressOptions {
  lang?: string;
  preserveComments?: boolean;
}

export function compressCode(code: string, options: CodeCompressOptions = {}): string {
  const lang = (options.lang || 'typescript').toLowerCase();
  const preserveComments = options.preserveComments ?? false;

  let result = code;

  // Protect string literals before stripping comments
  const stringLiterals: string[] = [];
  const stringPlaceholder = (idx: number) => `__TD_STR_${idx}__`;

  // Matches Python triple quotes, template literals, double quotes, and single quotes
  const strRegex = /("""[\s\S]*?"""|'''[\s\S]*?'''|`[\s\S]*?`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;

  result = result.replace(strRegex, (match) => {
    stringLiterals.push(match);
    return stringPlaceholder(stringLiterals.length - 1);
  });

  if (!preserveComments) {
    if (lang === 'python') {
      // Remove Python # comments
      result = result.replace(/#[^\r\n]*/g, '');
    } else {
      // Remove // comments and /* */ comments
      result = result.replace(/\/\/[^\r\n]*/g, '');
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    }
  }

  // Restore string literals
  result = result.replace(/__TD_STR_(\d+)__/g, (_, idx) => {
    return stringLiterals[Number(idx)];
  });

  // Whitespace folding: trim trailing whitespace on lines
  const lines = result.split(/\r?\n/)
    .map(line => line.trimEnd())
    .filter((line, index, arr) => {
      // Collapse multiple consecutive empty lines to maximum 1
      if (line.trim().length === 0) {
        return index > 0 && arr[index - 1].trim().length > 0;
      }
      return true;
    });

  return lines.join('\n').trim();
}
