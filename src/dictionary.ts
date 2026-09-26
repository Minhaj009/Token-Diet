export interface AliasOptions {
  minLength?: number;
  minOccurrences?: number;
  prefix?: string;
  headerPrefix?: string;
}

export interface AliasResult {
  aliased: string;
  header: string;
  dictionary: Record<string, string>;
}

export class SymbolAliaser {
  private minLength: number;
  private minOccurrences: number;
  private prefix: string;
  private headerPrefix: string;

  constructor(options: AliasOptions = {}) {
    this.minLength = options.minLength ?? 4;
    this.minOccurrences = options.minOccurrences ?? 2;
    this.prefix = options.prefix ?? '$';
    this.headerPrefix = options.headerPrefix ?? 'Aliases: ';
  }

  private generateAlias(index: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let alias = '';
    let n = index;
    do {
      alias = chars[n % chars.length] + alias;
      n = Math.floor(n / chars.length) - 1;
    } while (n >= 0);
    return `${this.prefix}${alias}`;
  }

  public alias(text: string): AliasResult {
    const identifierRegex = /\b[a-zA-Z_][a-zA-Z0-9_]{3,}\b/g;
    const frequency = new Map<string, number>();
    let match: RegExpExecArray | null;

    while ((match = identifierRegex.exec(text)) !== null) {
      const word = match[0];
      if (word.length >= this.minLength) {
        frequency.set(word, (frequency.get(word) || 0) + 1);
      }
    }

    // Filter candidates where character/token savings beat header overhead
    const candidates = Array.from(frequency.entries())
      .filter(([_, count]) => count >= this.minOccurrences)
      .map(([word, count]) => {
        const charSavings = (word.length - 2) * count;
        const headerCost = word.length + 5; // e.g., "$a=word,"
        return { word, count, netSavings: charSavings - headerCost };
      })
      .filter(c => c.netSavings > 0)
      .sort((a, b) => b.netSavings - a.netSavings);

    if (candidates.length === 0) {
      return { aliased: text, header: '', dictionary: {} };
    }

    const dictionary: Record<string, string> = {};
    let aliased = text;
    const headerParts: string[] = [];

    candidates.forEach((cand, idx) => {
      const aliasToken = this.generateAlias(idx);
      dictionary[aliasToken] = cand.word;
      headerParts.push(`${aliasToken}=${cand.word}`);

      const replaceRegex = new RegExp(`\\b${cand.word}\\b`, 'g');
      aliased = aliased.replace(replaceRegex, aliasToken);
    });

    const header = `${this.headerPrefix}${headerParts.join(',')}\n`;

    return {
      aliased,
      header,
      dictionary
    };
  }

  public restore(text: string, dictionary: Record<string, string>): string {
    let restored = text;
    // Strip header if present (supports both 'Aliases: ...' and '[TokenDiet Grammar: ...]')
    restored = restored.replace(/^(?:Aliases: |\[TokenDiet Grammar: )[^\]\n]+\]?\n?/, '');

    // Replace aliases in reverse order of key length
    const sortedAliases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    for (const alias of sortedAliases) {
      const original = dictionary[alias];
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      restored = restored.replace(new RegExp(escapedAlias, 'g'), original);
    }
    return restored;
  }
}
