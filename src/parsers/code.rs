use regex::Regex;

pub fn compress_code(input: &str, preserve_comments: bool) -> String {
    let mut result = input.to_string();
    if !preserve_comments {
        let single_line = Regex::new(r"//[^\r\n]*").unwrap();
        result = single_line.replace_all(&result, "").to_string();
        let multi_line = Regex::new(r"/\*[\s\S]*?\*/").unwrap();
        result = multi_line.replace_all(&result, "").to_string();
    }
    let lines: Vec<&str> = result.lines()
        .map(|l| l.trim_end())
        .filter(|l| !l.trim().is_empty())
        .collect();
    lines.join("\n")
}
