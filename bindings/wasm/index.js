/**
 * WebAssembly Loader and Runtime wrapper for TokenDiet
 */
import { compressPrompt, decompressResponse } from '../../dist/index.js';

export async function initWasm() {
  return {
    compressPromptWasm: (input, format = 'auto', preserveComments = false, symbolAliasing = true) => {
      const res = compressPrompt(input, {
        targetFormat: format,
        preserveComments,
        symbolAliasing
      });
      return JSON.stringify(res);
    },
    decompressResponseWasm: (input, dictionaryJson = '{}') => {
      const dict = JSON.parse(dictionaryJson);
      return decompressResponse(input, dict);
    }
  };
}

export { compressPrompt, decompressResponse };
