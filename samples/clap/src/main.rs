use clap::{Args, Parser, Subcommand, ValueEnum};
use serde_json;
use std::fs;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
#[command(name = "clap-demo")]
#[command(about = "Clap CLI デモアプリケーション")]
#[command(long_about = "Rustの強力なコマンドライン引数解析ライブラリClapの機能を体験できるサンプルです。")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// 基本的な挨拶コマンド
    Hello {
        /// 挨拶する相手の名前
        #[arg(short, long, default_value = "World")]
        name: String,
        
        /// 挨拶を繰り返す回数
        #[arg(short, long, default_value = "1")]
        count: u32,
        
        /// 大声で挨拶する
        #[arg(short, long)]
        shout: bool,
    },
    
    /// ユーザー作成のデモ
    CreateUser {
        /// ユーザー名
        username: String,
        
        /// メールアドレス
        #[arg(short, long)]
        email: Option<String>,
        
        /// 年齢
        #[arg(short, long)]
        age: Option<u32>,
        
        /// アクティブ状態
        #[arg(long, default_value = "true")]
        active: bool,
    },
    
    /// デプロイメントのシミュレーション
    Deploy {
        /// 環境を指定
        #[arg(short, long, default_value = "development")]
        env: String,
        
        /// 強制実行
        #[arg(short, long)]
        force: bool,
        
        /// ドライランモード
        #[arg(long)]
        dry_run: bool,
        
        /// 設定ファイルのパス
        #[arg(short, long)]
        config: Option<String>,
    },
    
    /// ファイル操作のデモ
    File {
        #[command(subcommand)]
        action: FileCommands,
    },
    
    /// アイテム処理のデモ
    Process {
        /// 処理するアイテム
        #[arg(short, long, value_delimiter = ',')]
        items: Option<Vec<String>>,
        
        /// 詳細な出力を表示
        #[arg(short, long)]
        verbose: bool,
        
        /// 並列処理を有効にする
        #[arg(short, long)]
        parallel: bool,
    },
    
    /// 設定管理
    Config {
        #[command(subcommand)]
        action: ConfigCommands,
    },
    
    /// システム情報を表示
    Info {
        /// 出力フォーマット
        #[arg(short, long, value_enum, default_value = "table")]
        format: OutputFormat,
        
        /// 詳細な情報を表示
        #[arg(short, long)]
        verbose: bool,
    },
}

#[derive(Subcommand)]
enum FileCommands {
    /// ファイルを作成
    Create {
        /// ファイル名
        filename: String,
        
        /// ファイルの内容
        #[arg(short, long, default_value = "Hello from Clap!")]
        content: String,
    },
    
    /// ファイルを読み取り
    Read {
        /// ファイル名
        filename: String,
    },
}

#[derive(Subcommand)]
enum ConfigCommands {
    /// 設定値を取得
    Get {
        /// 設定キー
        key: String,
        
        /// グローバル設定を使用
        #[arg(short, long)]
        global: bool,
    },
    
    /// 設定値を設定
    Set {
        /// 設定キー
        key: String,
        
        /// 設定値
        value: String,
        
        /// グローバル設定を使用
        #[arg(short, long)]
        global: bool,
    },
    
    /// 全ての設定を表示
    List {
        /// グローバル設定を使用
        #[arg(short, long)]
        global: bool,
    },
}

#[derive(ValueEnum, Clone)]
enum OutputFormat {
    Json,
    Table,
    Yaml,
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Hello { name, count, shout } => {
            let greeting = if shout { "HELLO" } else { "Hello" };
            let display_name = if shout { name.to_uppercase() } else { name };
            
            for i in 0..count {
                println!("{}, {}!", greeting, display_name);
                if count > 1 {
                    println!("  ({}/{})", i + 1, count);
                }
            }
        },
        
        Commands::CreateUser { username, email, age, active } => {
            println!("Creating user...");
            println!("User Information:");
            println!("  Username: {}", username);
            println!("  Email: {}", email.unwrap_or("Not provided".to_string()));
            println!("  Age: {}", age.map_or("Not provided".to_string(), |a| a.to_string()));
            println!("  Active: {}", active);
            println!("  Created: {}", get_current_timestamp());
            println!("✓ User created successfully!");
        },
        
        Commands::Deploy { env, force, dry_run, config } => {
            println!("Deployment Configuration:");
            println!("  Environment: {}", env);
            println!("  Force: {}", force);
            println!("  Dry Run: {}", dry_run);
            println!("  Config: {}", config.unwrap_or("Default".to_string()));
            
            if dry_run {
                println!("\n[DRY RUN] Would deploy to {}", env);
            } else {
                println!("\nDeploying to {}...", env);
                thread::sleep(Duration::from_secs(1));
                println!("✓ Deployment completed successfully!");
            }
        },
        
        Commands::File { action } => {
            match action {
                FileCommands::Create { filename, content } => {
                    match fs::write(&filename, &content) {
                        Ok(_) => {
                            println!("✓ File created: {}", filename);
                            println!("Content: {}", content);
                        },
                        Err(e) => {
                            println!("✗ Error creating file: {}", e);
                        }
                    }
                },
                
                FileCommands::Read { filename } => {
                    match fs::read_to_string(&filename) {
                        Ok(content) => {
                            println!("File: {}", filename);
                            println!("Content: {}", content);
                        },
                        Err(e) => {
                            println!("✗ Error reading file: {}", e);
                        }
                    }
                },
            }
        },
        
        Commands::Process { items, verbose, parallel } => {
            let items = items.unwrap_or_else(|| vec!["item1".to_string(), "item2".to_string(), "item3".to_string()]);
            
            println!("Processing {} items...", items.len());
            if parallel {
                println!("Mode: Parallel");
            } else {
                println!("Mode: Sequential");
            }
            println!();
            
            for (i, item) in items.iter().enumerate() {
                if verbose {
                    println!("  Processing: {}", item);
                }
                thread::sleep(Duration::from_millis(100));
                println!("  [{}/{}] Completed: {}", i + 1, items.len(), item);
            }
            
            println!("\n✓ All items processed!");
        },
        
        Commands::Config { action } => {
            match action {
                ConfigCommands::Get { key, global } => {
                    let scope = if global { "global" } else { "local" };
                    println!("Configuration [{}]:", scope);
                    
                    // デモ用の設定値
                    let value = match key.as_str() {
                        "theme" => Some("dark"),
                        "debug" => Some("false"),
                        "timeout" => Some("30"),
                        _ => None,
                    };
                    
                    match value {
                        Some(v) => println!("  {}: {}", key, v),
                        None => println!("  {}: not found", key),
                    }
                },
                
                ConfigCommands::Set { key, value, global } => {
                    let scope = if global { "global" } else { "local" };
                    println!("Configuration [{}]:", scope);
                    println!("  Setting {} = {}", key, value);
                    println!("✓ Configuration updated!");
                },
                
                ConfigCommands::List { global } => {
                    let scope = if global { "global" } else { "local" };
                    println!("Configuration [{}]:", scope);
                    println!("  theme: dark");
                    println!("  debug: false");
                    println!("  timeout: 30");
                },
            }
        },
        
        Commands::Info { format, verbose } => {
            let mut info = serde_json::json!({
                "Library": "Clap",
                "Version": "4.0+",
                "Language": "Rust",
                "Features": "Type-safe parsing, Derive macros, Shell completion",
                "Timestamp": get_current_timestamp()
            });
            
            if verbose {
                info["Extras"] = serde_json::json!({
                    "Documentation": "https://docs.rs/clap/",
                    "Repository": "https://github.com/clap-rs/clap",
                    "License": "MIT/Apache-2.0"
                });
            }
            
            match format {
                OutputFormat::Json => {
                    println!("{}", serde_json::to_string_pretty(&info).unwrap());
                },
                OutputFormat::Yaml => {
                    println!("# System Information");
                    print_yaml(&info, 0);
                },
                OutputFormat::Table => {
                    println!("System Information:");
                    print_table(&info, 0);
                },
            }
        },
    }
}

fn get_current_timestamp() -> String {
    let now = SystemTime::now();
    let unix_timestamp = now.duration_since(UNIX_EPOCH).unwrap().as_secs();
    
    // Simple timestamp formatting
    format!("{}", unix_timestamp)
}

fn print_table(value: &serde_json::Value, indent: usize) {
    let prefix = "  ".repeat(indent);
    
    match value {
        serde_json::Value::Object(map) => {
            for (key, val) in map {
                match val {
                    serde_json::Value::Object(_) => {
                        println!("{}{}:", prefix, key);
                        print_table(val, indent + 1);
                    },
                    _ => {
                        println!("{}{}: {}", prefix, key, format_value(val));
                    }
                }
            }
        },
        _ => println!("{}{}", prefix, format_value(value)),
    }
}

fn print_yaml(value: &serde_json::Value, indent: usize) {
    let prefix = "  ".repeat(indent);
    
    match value {
        serde_json::Value::Object(map) => {
            for (key, val) in map {
                match val {
                    serde_json::Value::Object(_) => {
                        println!("{}{}:", prefix, key);
                        print_yaml(val, indent + 1);
                    },
                    _ => {
                        println!("{}{}: {}", prefix, key, format_value(val));
                    }
                }
            }
        },
        _ => println!("{}{}", prefix, format_value(value)),
    }
}

fn format_value(value: &serde_json::Value) -> String {
    match value {
        serde_json::Value::String(s) => s.clone(),
        serde_json::Value::Number(n) => n.to_string(),
        serde_json::Value::Bool(b) => b.to_string(),
        _ => value.to_string(),
    }
}