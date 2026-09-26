use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::parsers::{
    json::{compress_json, decompress_json},
    code::compress_code,
    markdown::compress_markdown
};
use crate::dictionary::SymbolAliaser;

#[derive(Serialize, Deserialize, Clone)]
pub struct CompressOptions {
    pub target_format: String,
    pub preserve_comments: bool,
    pub symbol_aliasing: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CompressResult {
    pub original_tokens: usize,
    pub compressed_tokens: usize,
    pub savings_percentage: f64,
    pub compressed: String,
    pub header: String,
    pub dictionary: HashMap<String, String>,
}

fn estimate_tokens(text: &str) -> usize {
    if text.trim().is_empty() {
        0
    } else {
        text.split_whitespace().count()
    }
}

pub fn compress_prompt(input: &str, options: CompressOptions) -> CompressResult {
    let transformed = match options.target_format.as_str() {
        "json" => compress_json(input),
        "code" => compress_code(input, options.preserve_comments),
        "markdown" => compress_markdown(input),
        _ => input.trim().to_string(),
    };

    let (final_compressed, header, dict) = if options.symbol_aliasing {
        let aliaser = SymbolAliaser::default();
        let (aliased, hdr, d) = aliaser.alias(&transformed);
        if !d.is_empty() {
            (format!("{}{}", hdr, aliased), hdr, d)
        } else {
            (transformed, String::new(), HashMap::new())
        }
    } else {
        (transformed, String::new(), HashMap::new())
    };

    let orig_tokens = estimate_tokens(input);
    let comp_tokens = estimate_tokens(&final_compressed);
    let savings = if orig_tokens > 0 && orig_tokens > comp_tokens {
        ((orig_tokens - comp_tokens) as f64 / orig_tokens as f64) * 100.0
    } else {
        0.0
    };

    CompressResult {
        original_tokens: orig_tokens,
        compressed_tokens: comp_tokens,
        savings_percentage: savings,
        compressed: final_compressed,
        header,
        dictionary: dict,
    }
}

pub fn decompress_response(input: &str, dict: &HashMap<String, String>) -> String {
    let aliaser = SymbolAliaser::default();
    let text = aliaser.restore(input, dict);
    decompress_json(&text)
}
