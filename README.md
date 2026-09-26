# TokenDiet 🥗

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: Passing](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen.svg)](#testing)
[![Zero API Cost](https://img.shields.io/badge/Zero--Cost-100%25%20Offline-orange.svg)](#architecture)
[![WebAssembly & TypeScript](https://img.shields.io/badge/Runtime-TypeScript%20%7C%20Rust%20%7C%20WASM-purple.svg)](#architecture)

> **Zero-Cost, Lossless Prompt & AST Token Compressor for LLMs**  
> Drops token counts by **30–50%+** offline before transmission to GPT-4, Claude, Llama, and Gemini without secondary model costs or network latency.

---

## ⚡ The Problem

Developers burn massive context windows and budget sending verbose payloads into LLMs:
- **Repetitive JSON schemas and database rows** repeat identical object keys dozens of times.
- **Code ASTs** include comments, docstrings, and non-essential whitespace that bloat prompt sizes.
- **Markdown tables** include dozens of padding spaces for column alignment.

Existing prompt compressors (like LLMLingua) rely on secondary language models—introducing **latency, GPU requirements, or additional API costs**.

---

## 💡 How TokenDiet Solves It

TokenDiet uses deterministic grammar tokenizers and reversible lexical compaction to achieve **30–50%+ token reduction** losslessly:

| Strategy | What It Does | Typical Savings |
|---|---|---|
| **Columnar JSON Canonicalization** | Converts arrays of uniform objects into compact tabular tuples (`keys:id,status\|1,ok\|2,ok`) | **40–65%** |
| **Reversible Symbol Aliasing** | Replaces repeated identifiers with single-character tokens (`$a`, `$b`) and appends a 1-line decompression grammar header (`Aliases: $a=customer_id`) | **15–35%** |
| **AST & Code Stripper** | Safely strips comment noise and collapses indentation whitespace while protecting string literals and Python blocks | **20–40%** |
| **Markdown Table Folding** | Compacts padded ASCII tables (`\|  col  \|` $\rightarrow$ `\|col\|`) while strictly protecting fenced code blocks | **25–45%** |
| **Zero-Cost $0 Runtime** | 100% deterministic algorithms in TypeScript & WebAssembly—runs completely offline | **$0 / 0ms API Latency** |

---

## 📦 Installation

```bash
# Install via npm
npm install tokendiet

# Or run directly via npx without installing
npx tokendiet --help
```

---

## 💻 CLI Usage

### 1. Compress a JSON Payload
```bash
tokendiet compress data.json --format json --output prompt.txt
```

### 2. Pipe Codebase AST into LLM via Stdin
```bash
cat src/index.ts | tokendiet compress --lang typescript | llm query "Refactor this module"
```

### 3. Get JSON Analytics Output
```bash
tokendiet compress input.json --json
```

Output:
```json
{
  "originalTokens": 1420,
  "compressedTokens": 780,
  "savingsPercentage": 45.07,
  "byteSavingsPercentage": 52.3,
  "format": "json"
}
```

### 4. Decompress Responses or Datasets
```bash
tokendiet decompress prompt.txt --output restored.json
```

---

## 📚 TypeScript / Node Library Usage

```typescript
import { compressPrompt, decompressResponse } from 'tokendiet';

// 1. Compress prompt before LLM dispatch
const inputData = JSON.stringify([
  { transaction_id: "TX_101", user_identifier: "usr_alice", status: "confirmed" },
  { transaction_id: "TX_102", user_identifier: "usr_bob", status: "confirmed" }
]);

const result = compressPrompt(inputData, {
  targetFormat: 'auto',      // 'auto' | 'json' | 'code' | 'markdown'
  preserveComments: false,   // Strip comment noise
  symbolAliasing: true       // Reversible short-symbol aliasing
});

console.log(`Original tokens:   ${result.originalTokens}`);
console.log(`Compressed tokens: ${result.compressedTokens}`);
console.log(`Token savings:     ${result.savingsPercentage}%`);

// Dispatch result.compressed to OpenAI, Anthropic, or Ollama...
// const response = await openai.chat.completions.create({ ... messages: [{ role: 'user', content: result.compressed }] });

// 2. Deterministically decompress response if needed
const restored = decompressResponse(result.compressed, result.dictionary);
```

---

## 🦀 Rust Core & WebAssembly

TokenDiet provides a high-performance native Rust core and WebAssembly bindings:

```bash
# Build Rust crate
cargo build --release

# Run Rust test suite
cargo test
```

Using WASM in browser or edge workers:
```typescript
import { initWasm } from 'tokendiet/wasm';

const wasm = await initWasm();
const compressed = wasm.compressPromptWasm(inputPayload, 'json', false, true);
```

---

## 🧪 Testing

TokenDiet includes automated test coverage verifying losslessness and token reduction across JSON, Code, Markdown, and CLI operations:

```bash
# Run all automated tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🗺️ Project Structure

```
tokendiet/
├── Cargo.toml               # Rust core crate configuration
├── package.json             # NPM package manifest
├── tsconfig.json            # TypeScript configuration
├── bin/
│   └── tokendiet.js         # Fast CLI runner with stdin/stdout streaming
├── src/
│   ├── index.ts             # Public TypeScript API contract
│   ├── engine.ts            # Orchestration engine & format autodetection
│   ├── tokenizer.ts         # Deterministic offline BPE token estimator
│   ├── dictionary.ts        # Reversible symbol aliasing & grammar generator
│   ├── lib.rs               # Rust WASM entrypoint and public C-ABI
│   ├── engine.rs            # Rust orchestration logic
│   ├── dictionary.rs        # Rust symbol aliasing table
│   └── parsers/
│       ├── json.ts / json.rs         # Columnar JSON compressor & restorer
│       ├── code.ts / code.rs         # AST & code normalizer / comment stripper
│       └── markdown.ts / markdown.rs # Markdown table & whitespace minimizer
├── bindings/
│   └── wasm/                # WebAssembly package bindings
├── cli/
│   └── main.rs              # Native Rust terminal runner
└── tests/
    ├── setup.test.ts        # Manifest & config validation
    ├── tokenizer.test.ts    # Token counter & savings metrics tests
    ├── dictionary.test.ts   # Reversible symbol aliasing tests
    ├── json.test.ts         # Columnar JSON tests
    ├── code.test.ts         # Code stripper tests
    ├── markdown.test.ts     # Markdown table tests
    ├── engine.test.ts       # Engine orchestration tests
    ├── cli.test.ts          # CLI runner & pipe tests
    ├── e2e.test.ts          # Full end-to-end integration tests
    └── compression_test.rs  # Rust verification suite
```

---

## 📄 License

MIT License. Free and open source for the community.
