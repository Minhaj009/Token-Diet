export function compressMarkdown(markdown: string): string {
  const codeBlocks: string[] = [];
  const placeholder = (idx: number) => `__TD_MD_BLOCK_${idx}__`;

  // Protect fenced code blocks ``` ... ```
  let protectedMd = markdown.replace(/(```[\s\S]*?```)/g, (match) => {
    codeBlocks.push(match);
    return placeholder(codeBlocks.length - 1);
  });

  // Compress Markdown tables: compact | col 1 | col 2 | to |col 1|col 2|
  const tableRowRegex = /^\|(.+)\|$/gm;
  protectedMd = protectedMd.replace(tableRowRegex, (_full, content: string) => {
    const cells = content.split('|').map(cell => cell.trim());
    return `|${cells.join('|')}|`;
  });

  // Collapse consecutive blank lines and trim trailing whitespace
  const lines = protectedMd.split(/\r?\n/)
    .map(line => line.trimEnd())
    .filter((line, index, arr) => {
      if (line.trim().length === 0) {
        return index > 0 && arr[index - 1].trim().length > 0;
      }
      return true;
    });

  let result = lines.join('\n').trim();

  // Restore protected code blocks
  result = result.replace(/__TD_MD_BLOCK_(\d+)__/g, (_, idx) => {
    return codeBlocks[Number(idx)];
  });

  return result;
}
