use std::env;
use std::fs;
use std::io::{self, Read, Write};
use tokendiet::engine::{compress_prompt, decompress_response, CompressOptions};
use std::collections::HashMap;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 || args[1] == "--help" || args[1] == "help" {
        println!("TokenDiet: Zero-Cost Lossless Prompt & AST Token Compressor (Rust Runner)");
        println!("Usage: tokendiet compress [file] [--format json|code|markdown] [--output file]");
        println!("       cat code.ts | tokendiet compress --format code");
        return;
    }

    let command = &args[1];
    let mut file_path: Option<String> = None;
    let mut format = "auto".to_string();
    let mut output_path: Option<String> = None;
    let mut preserve_comments = false;
    let mut symbol_aliasing = true;

    let mut i = 2;
    while i < args.len() {
        match args[i].as_str() {
            "--format" if i + 1 < args.len() => {
                format = args[i + 1].clone();
                i += 1;
            }
            "--output" if i + 1 < args.len() => {
                output_path = Some(args[i + 1].clone());
                i += 1;
            }
            "--preserve-comments" => {
                preserve_comments = true;
            }
            "--no-aliasing" => {
                symbol_aliasing = false;
            }
            arg if !arg.starts_with("--") && file_path.is_none() => {
                file_path = Some(arg.to_string());
            }
            _ => {}
        }
        i += 1;
    }

    let input_content = match file_path {
        Some(path) => fs::read_to_string(path).expect("Failed to read input file"),
        None => {
            let mut buffer = String::new();
            io::stdin().read_to_string(&mut buffer).expect("Failed to read from stdin");
            buffer
        }
    };

    if command == "compress" {
        let options = CompressOptions {
            target_format: format,
            preserve_comments,
            symbol_aliasing,
        };
        let result = compress_prompt(&input_content, options);

        if let Some(out) = output_path {
            fs::write(out, &result.compressed).expect("Failed to write output file");
        } else {
            print!("{}", result.compressed);
        }
    } else if command == "decompress" {
        let restored = decompress_response(&input_content, &HashMap::new());
        if let Some(out) = output_path {
            fs::write(out, &restored).expect("Failed to write output file");
        } else {
            print!("{}", restored);
        }
    }
}
