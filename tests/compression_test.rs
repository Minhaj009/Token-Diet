#[cfg(test)]
mod tests {
    use tokendiet::engine::{compress_prompt, decompress_response, CompressOptions};
    use std::collections::HashMap;

    #[test]
    fn test_rust_columnar_json_compression() {
        let json_input = r#"[{"id":1,"status":"ok"},{"id":2,"status":"ok"}]"#;
        let options = CompressOptions {
            target_format: "json".to_string(),
            preserve_comments: false,
            symbol_aliasing: true,
        };

        let result = compress_prompt(json_input, options);
        assert!(result.compressed.contains("@td:columnar"));
        assert!(result.savings_percentage > 0.0);

        let restored = decompress_response(&result.compressed, &HashMap::new());
        assert!(restored.contains("id"));
        assert!(restored.contains("status"));
    }

    #[test]
    fn test_rust_code_stripping() {
        let code_input = "// Comment line\nlet value = 42;\n";
        let options = CompressOptions {
            target_format: "code".to_string(),
            preserve_comments: false,
            symbol_aliasing: false,
        };

        let result = compress_prompt(code_input, options);
        assert!(!result.compressed.contains("Comment line"));
        assert!(result.compressed.contains("let value = 42;"));
    }

    #[test]
    fn test_rust_markdown_compression() {
        let md_input = "| name | status |\n|---|---|\n| Alice | active |";
        let options = CompressOptions {
            target_format: "markdown".to_string(),
            preserve_comments: false,
            symbol_aliasing: false,
        };

        let result = compress_prompt(md_input, options);
        assert!(result.compressed.contains("|name|status|"));
        assert!(result.compressed.contains("|Alice|active|"));
    }
}
