use std::collections::HashMap;
use regex::Regex;

#[derive(Default)]
pub struct SymbolAliaser;

impl SymbolAliaser {
    pub fn alias(&self, input: &str) -> (String, String, HashMap<String, String>) {
        let mut frequency: HashMap<String, usize> = HashMap::new();
        let id_regex = Regex::new(r"\b[a-zA-Z_][a-zA-Z0-9_]{3,}\b").unwrap();

        for mat in id_regex.find_iter(input) {
            *frequency.entry(mat.as_str().to_string()).or_insert(0) += 1;
        }

        let mut candidates: Vec<(String, usize)> = frequency.into_iter()
            .filter(|(word, count)| *count >= 2 && (word.len() - 2) * *count > (word.len() + 5))
            .collect();
        candidates.sort_by(|a, b| b.1.cmp(&a.1));

        if candidates.is_empty() {
            return (input.to_string(), String::new(), HashMap::new());
        }

        let mut dict = HashMap::new();
        let mut aliased = input.to_string();
        let mut header_parts = Vec::new();

        for (idx, (word, _)) in candidates.iter().enumerate() {
            let alias = format!("${}", (b'a' + (idx as u8)) as char);
            dict.insert(alias.clone(), word.clone());
            header_parts.push(format!("{}={}", alias, word));
            let rep_regex = Regex::new(&format!(r"\b{}\b", word)).unwrap();
            aliased = rep_regex.replace_all(&aliased, alias.as_str()).to_string();
        }

        let header = format!("Aliases: {}\n", header_parts.join(","));
        (aliased, header, dict)
    }

    pub fn restore(&self, input: &str, dict: &HashMap<String, String>) -> String {
        let header_regex = Regex::new(r"^(?:Aliases: |\[TokenDiet Grammar: )[^\]\n]+\]?\n?").unwrap();
        let mut restored = header_regex.replace(input, "").to_string();

        let mut sorted_keys: Vec<&String> = dict.keys().collect();
        sorted_keys.sort_by(|a, b| b.len().cmp(&a.len()));

        for key in sorted_keys {
            if let Some(orig) = dict.get(key) {
                restored = restored.replace(key.as_str(), orig.as_str());
            }
        }
        restored
    }
}
