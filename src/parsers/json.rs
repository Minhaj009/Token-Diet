use serde_json::Value;

pub const COLUMNAR_PREFIX: &str = "@td:columnar[";
pub const COLUMNAR_SUFFIX: &str = "]";

/// Splits a columnar payload string on '|' only outside of double quotes
fn split_rows(payload: &str) -> Vec<String> {
    let mut rows = Vec::new();
    let mut current = String::new();
    let mut in_string = false;
    let mut escape = false;

    for c in payload.chars() {
        if escape {
            current.push(c);
            escape = false;
        } else if c == '\\' {
            current.push(c);
            escape = true;
        } else if c == '"' {
            in_string = !in_string;
            current.push(c);
        } else if c == '|' && !in_string {
            rows.push(current);
            current = String::new();
        } else {
            current.push(c);
        }
    }
    if !current.is_empty() {
        rows.push(current);
    }
    rows
}

pub fn compress_json(input: &str) -> String {
    if let Ok(Value::Array(items)) = serde_json::from_str::<Value>(input) {
        if items.len() >= 2 && items.iter().all(|i| i.is_object()) {
            if let Some(first_obj) = items[0].as_object() {
                let keys: Vec<String> = first_obj.keys().cloned().collect();
                let mut is_uniform = true;
                for item in &items {
                    if let Some(obj) = item.as_object() {
                        if obj.len() != keys.len() || !keys.iter().all(|k| obj.contains_key(k)) {
                            is_uniform = false;
                            break;
                        }
                    }
                }
                if is_uniform && !keys.is_empty() {
                    let mut rows: Vec<String> = Vec::new();
                    for item in &items {
                        if let Some(obj) = item.as_object() {
                            let row_vals: Vec<String> = keys.iter()
                                .map(|k| serde_json::to_string(&obj[k]).unwrap_or_default())
                                .collect();
                            rows.push(row_vals.join(","));
                        }
                    }
                    return format!("{}keys:{}|{}{}", COLUMNAR_PREFIX, keys.join(","), rows.join("|"), COLUMNAR_SUFFIX);
                }
            }
        }
    }
    if let Ok(val) = serde_json::from_str::<Value>(input) {
        return serde_json::to_string(&val).unwrap_or_else(|_| input.to_string());
    }
    input.trim().to_string()
}

pub fn decompress_json(compressed: &str) -> String {
    let trimmed = compressed.trim();
    if trimmed.starts_with(COLUMNAR_PREFIX) && trimmed.ends_with(COLUMNAR_SUFFIX) {
        let inner = &trimmed[COLUMNAR_PREFIX.len()..trimmed.len() - COLUMNAR_SUFFIX.len()];
        let parts = split_rows(inner);
        if parts.len() >= 2 && parts[0].starts_with("keys:") {
            let keys: Vec<&str> = parts[0][5..].split(',').collect();
            let mut result_items: Vec<serde_json::Map<String, Value>> = Vec::new();

            for row in parts.iter().skip(1) {
                let wrapped = format!("[{}]", row);
                if let Ok(Value::Array(values)) = serde_json::from_str::<Value>(&wrapped) {
                    let mut map = serde_json::Map::new();
                    for (i, key) in keys.iter().enumerate() {
                        if let Some(val) = values.get(i) {
                            map.insert(key.to_string(), val.clone());
                        }
                    }
                    result_items.push(map);
                }
            }
            return serde_json::to_string(&Value::Array(result_items.into_iter().map(Value::Object).collect()))
                .unwrap_or_else(|_| compressed.to_string());
        }
    }
    compressed.to_string()
}
