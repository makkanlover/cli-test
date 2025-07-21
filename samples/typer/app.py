#!/usr/bin/env python3
import typer
from typing import Optional, List
from enum import Enum
from datetime import datetime
import time

app = typer.Typer(help="Typer CLI デモアプリケーション")

# Rich console fallback
try:
    from rich.console import Console
    from rich.table import Table
    from rich.progress import Progress, SpinnerColumn, TextColumn
    console = Console()
    HAS_RICH = True
except ImportError:
    HAS_RICH = False
    console = None

class OutputFormat(str, Enum):
    json = "json"
    table = "table"
    csv = "csv"

@app.command()
def hello(
    name: str = typer.Option("World", "--name", "-n", help="挨拶する相手の名前"),
    count: int = typer.Option(1, "--count", "-c", help="挨拶を繰り返す回数", min=1),
    shout: bool = typer.Option(False, "--shout", help="大声で挨拶する")
):
    """基本的な挨拶コマンド（型ヒント付き）"""
    greeting = "Hello"
    if shout:
        greeting = greeting.upper()
        name = name.upper()
    
    for i in range(count):
        if HAS_RICH:
            console.print(f"{greeting}, {name}!", style="bold green")
            if count > 1:
                console.print(f"  ({i + 1}/{count})", style="dim")
        else:
            print(f"{greeting}, {name}!")
            if count > 1:
                print(f"  ({i + 1}/{count})")

@app.command()
def create_user(
    username: str = typer.Argument(..., help="ユーザー名"),
    email: Optional[str] = typer.Option(None, "--email", "-e", help="メールアドレス"),
    age: Optional[int] = typer.Option(None, "--age", "-a", help="年齢", min=0, max=150),
    active: bool = typer.Option(True, "--active/--inactive", help="アクティブ状態")
):
    """ユーザー作成のデモ"""
    if HAS_RICH:
        console.print("Creating user...", style="bold blue")
        
        table = Table(title="User Information")
        table.add_column("Field", style="cyan", no_wrap=True)
        table.add_column("Value", style="white")
        
        table.add_row("Username", username)
        table.add_row("Email", email or "Not provided")
        table.add_row("Age", str(age) if age else "Not provided")
        table.add_row("Active", "Yes" if active else "No")
        table.add_row("Created", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        
        console.print(table)
        console.print("✓ User created successfully!", style="bold green")
    else:
        print("Creating user...")
        print("User Information:")
        print(f"  Username: {username}")
        print(f"  Email: {email or 'Not provided'}")
        print(f"  Age: {str(age) if age else 'Not provided'}")
        print(f"  Active: {'Yes' if active else 'No'}")
        print(f"  Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("✓ User created successfully!")

@app.command()
def process_items(
    items: Optional[List[str]] = typer.Option(None, "--item", "-i", help="処理するアイテム"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="詳細な出力を表示")
):
    """アイテムの処理（プログレスバー付き）"""
    if not items:
        items = ["item1", "item2", "item3", "item4", "item5"]
    
    if HAS_RICH:
        console.print(f"Processing {len(items)} items...", style="bold")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Processing items...", total=len(items))
            
            for i, item in enumerate(items):
                if verbose:
                    console.print(f"  Processing: {item}", style="dim")
                progress.update(task, advance=1, description=f"Processing {item}...")
                time.sleep(0.2)  # シミュレーション
        
        console.print("✓ All items processed!", style="bold green")
    else:
        print(f"Processing {len(items)} items...")
        
        for i, item in enumerate(items):
            if verbose:
                print(f"  Processing: {item}")
            print(f"  [{i+1}/{len(items)}] Processing: {item}")
            time.sleep(0.2)  # シミュレーション
        
        print("✓ All items processed!")

@app.command()
def show_info(
    format: OutputFormat = typer.Option(OutputFormat.table, "--format", "-f", help="出力フォーマット")
):
    """システム情報の表示（リッチ出力）"""
    data = {
        "Library": "Typer",
        "Version": "0.9+",
        "Language": "Python",
        "Features": "Type hints, Rich output, Auto-completion",
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    if format == OutputFormat.json:
        import json
        if HAS_RICH:
            console.print_json(json.dumps(data, indent=2))
        else:
            print(json.dumps(data, indent=2))
    elif format == OutputFormat.csv:
        print("Key,Value")
        for key, value in data.items():
            print(f"{key},{value}")
    else:  # table
        if HAS_RICH:
            table = Table(title="System Information", show_header=True)
            table.add_column("Property", style="cyan", no_wrap=True)
            table.add_column("Value", style="white")
            
            for key, value in data.items():
                table.add_row(key, str(value))
            
            console.print(table)
        else:
            print("System Information:")
            for key, value in data.items():
                print(f"  {key}: {value}")

@app.command()
def interactive():
    """インタラクティブな入力のデモ"""
    if HAS_RICH:
        console.print("Interactive Demo", style="bold blue")
    else:
        print("Interactive Demo")
    
    name = typer.prompt("What's your name?")
    age = typer.prompt("What's your age?", type=int)
    password = typer.prompt("Enter password", hide_input=True)
    
    confirm = typer.confirm("Are you sure you want to continue?")
    if confirm:
        if HAS_RICH:
            console.print(f"Hello {name}! You are {age} years old.", style="green")
            console.print("Password confirmed ✓", style="green")
        else:
            print(f"Hello {name}! You are {age} years old.")
            print("Password confirmed ✓")
    else:
        if HAS_RICH:
            console.print("Operation cancelled.", style="yellow")
        else:
            print("Operation cancelled.")
        raise typer.Abort()

@app.command()
def validate_email(
    email: str = typer.Argument(..., help="検証するメールアドレス")
):
    """メールアドレスの簡単な検証"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(pattern, email):
        if HAS_RICH:
            console.print(f"✓ Valid email: {email}", style="green")
        else:
            print(f"✓ Valid email: {email}")
    else:
        if HAS_RICH:
            console.print(f"✗ Invalid email: {email}", style="red")
        else:
            print(f"✗ Invalid email: {email}")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()