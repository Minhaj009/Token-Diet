#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compressPrompt, decompressResponse } from '../dist/index.js';

function parseArgs(args) {
  const options = {
    command: args[0] || 'help',
    file: null,
    format: 'auto',
    lang: 'typescript',
    output: null,
    preserveComments: false,
    noAliasing: false,
    jsonOutput: false
  };

  let i = 1;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--format' && args[i + 1]) {
      options.format = args[++i];
    } else if (arg === '--lang' && args[i + 1]) {
      options.lang = args[++i];
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (arg === '--preserve-comments') {
      options.preserveComments = true;
    } else if (arg === '--no-aliasing') {
      options.noAliasing = true;
    } else if (arg === '--json') {
      options.jsonOutput = true;
    } else if (!arg.startsWith('--') && !options.file) {
      options.file = arg;
    }
    i++;
  }
  return options;
}

async function readInput(filePath) {
  if (filePath) {
    return readFileSync(resolve(process.cwd(), filePath), 'utf-8');
  }
  return new Promise((resolvePromise) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolvePromise(data);
    });
    // If running in interactive terminal without pipe and no file specified
    if (process.stdin.isTTY) {
      resolvePromise('');
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.command === 'help' || args.length === 0) {
    console.log(`
TokenDiet: Zero-Cost Lossless Prompt & AST Token Compressor
Usage:
  tokendiet compress [file] [options]
  cat file.ts | tokendiet compress --lang typescript

Options:
  --format <auto|json|code|markdown>   Target format
  --lang <typescript|python|rust|...> Language for code compression
  --output <file>                      Write output to file
  --preserve-comments                  Keep comments in code
  --no-aliasing                        Disable symbol aliasing
  --json                               Output stats in JSON format
    `);
    process.exit(0);
  }

  const rawInput = await readInput(options.file);
  if (!rawInput || rawInput.trim().length === 0) {
    console.error('Error: No input provided via file or stdin.');
    process.exit(1);
  }

  if (options.command === 'compress') {
    const result = compressPrompt(rawInput, {
      targetFormat: options.format,
      lang: options.lang,
      preserveComments: options.preserveComments,
      symbolAliasing: !options.noAliasing
    });

    if (options.output) {
      writeFileSync(resolve(process.cwd(), options.output), result.compressed, 'utf-8');
    }

    if (options.jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else if (process.stdout.isTTY && !options.output) {
      console.log('='.repeat(60));
      console.log('  TokenDiet: Lossless Compression Complete');
      console.log('='.repeat(60));
      console.log(`  Original Tokens:    ${result.originalTokens}`);
      console.log(`  Compressed Tokens:  ${result.compressedTokens}`);
      console.log(`  Token Savings:      ${result.savingsPercentage}%`);
      console.log(`  Byte Savings:       ${result.byteSavingsPercentage}%`);
      console.log('-'.repeat(60));
      console.log(result.compressed);
    } else {
      process.stdout.write(result.compressed);
    }
  } else if (options.command === 'decompress') {
    const restored = decompressResponse(rawInput);
    if (options.output) {
      writeFileSync(resolve(process.cwd(), options.output), restored, 'utf-8');
    } else {
      process.stdout.write(restored);
    }
  }
}

main().catch(err => {
  console.error('TokenDiet Error:', err.message);
  process.exit(1);
});
