use regex::Regex;

pub fn compress_markdown(input: &str) -> String {
    let table_regex = Regex::new(r"^\|(.+)\|$").unwrap();
    let lines: Vec<String> = input.lines().map(|line| {
        let trimmed = line.trim();
        if table_regex.is_match(trimmed) && trimmed.len() >= 2 {
            let cells: Vec<&str> = trimmed[1..trimmed.len()-1].split('|').map(|c| c.trim()).collect();
            format!("|{}|", cells.join("|"))
        } else {
            trimmed.to_string()
        }
    }).filter(|l| !l.is_empty()).collect();
    lines.join("\n")
}
