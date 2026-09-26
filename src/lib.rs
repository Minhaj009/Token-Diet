pub mod parsers;
pub mod dictionary;
pub mod engine;

use wasm_bindgen::prelude::*;
use crate::engine::{compress_prompt, decompress_response, CompressOptions};
use std::collections::HashMap;

#[wasm_bindgen]
pub fn compress_prompt_wasm(
    input: &str,
    target_format: &str,
    preserve_comments: bool,
    symbol_aliasing: bool,
) -> String {
    let options = CompressOptions {
        target_format: target_format.to_string(),
        preserve_comments,
        symbol_aliasing,
    };
    let result = compress_prompt(input, options);
    serde_json::to_string(&result).unwrap_or_default()
}

#[wasm_bindgen]
pub fn decompress_response_wasm(input: &str, dictionary_json: &str) -> String {
    let dict: HashMap<String, String> = serde_json::from_str(dictionary_json).unwrap_or_default();
    decompress_response(input, &dict)
}
