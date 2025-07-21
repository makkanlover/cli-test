#!/usr/bin/env python3
import fire
from datetime import datetime
import time

class Calculator:
    """Fire CLI 計算機デモクラス"""
    
    def add(self, a: float, b: float) -> float:
        """2つの数値を加算"""
        result = a + b
        print(f"{a} + {b} = {result}")
        return result
    
    def subtract(self, a: float, b: float) -> float:
        """2つの数値を減算"""
        result = a - b
        print(f"{a} - {b} = {result}")
        return result
    
    def multiply(self, a: float, b: float) -> float:
        """2つの数値を乗算"""
        result = a * b
        print(f"{a} × {b} = {result}")
        return result
    
    def divide(self, a: float, b: float) -> float:
        """2つの数値を除算"""
        if b == 0:
            print("Error: Division by zero!")
            return None
        result = a / b
        print(f"{a} ÷ {b} = {result}")
        return result

class TextProcessor:
    """Fire CLI テキスト処理デモクラス"""
    
    def upper(self, text: str) -> str:
        """テキストを大文字に変換"""
        result = text.upper()
        print(f"Original: {text}")
        print(f"Upper: {result}")
        return result
    
    def lower(self, text: str) -> str:
        """テキストを小文字に変換"""
        result = text.lower()
        print(f"Original: {text}")
        print(f"Lower: {result}")
        return result
    
    def reverse(self, text: str) -> str:
        """テキストを逆順に"""
        result = text[::-1]
        print(f"Original: {text}")
        print(f"Reversed: {result}")
        return result
    
    def count_words(self, text: str) -> int:
        """単語数をカウント"""
        words = text.split()
        count = len(words)
        print(f"Text: {text}")
        print(f"Word count: {count}")
        return count

class FileManager:
    """Fire CLI ファイル管理デモクラス"""
    
    def create_file(self, filename: str, content: str = "Hello from Fire!"):
        """ファイルを作成"""
        try:
            with open(filename, 'w') as f:
                f.write(content)
            print(f"✓ File created: {filename}")
            print(f"Content: {content}")
        except Exception as e:
            print(f"✗ Error creating file: {e}")
    
    def read_file(self, filename: str):
        """ファイルを読み取り"""
        try:
            with open(filename, 'r') as f:
                content = f.read()
            print(f"File: {filename}")
            print(f"Content: {content}")
            return content
        except Exception as e:
            print(f"✗ Error reading file: {e}")
            return None
    
    def append_to_file(self, filename: str, content: str):
        """ファイルに追記"""
        try:
            with open(filename, 'a') as f:
                f.write(f"\n{content}")
            print(f"✓ Content appended to {filename}")
            print(f"Added: {content}")
        except Exception as e:
            print(f"✗ Error appending to file: {e}")

def hello(name="World", count=1, shout=False):
    """基本的な挨拶関数"""
    greeting = "Hello"
    if shout:
        greeting = greeting.upper()
        name = name.upper()
    
    for i in range(count):
        print(f"{greeting}, {name}!")
        if count > 1:
            print(f"  ({i + 1}/{count})")

def system_info():
    """システム情報を表示"""
    info = {
        "Library": "Fire",
        "Version": "0.5+",
        "Language": "Python", 
        "Features": "Auto CLI generation, Zero configuration",
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    print("System Information:")
    for key, value in info.items():
        print(f"  {key:12}: {value}")

def process_items(items=None, verbose=False):
    """アイテム処理のデモ"""
    if items is None:
        items = ["item1", "item2", "item3"]
    elif isinstance(items, str):
        items = [items]
    
    print(f"Processing {len(items)} items...")
    
    for i, item in enumerate(items, 1):
        if verbose:
            print(f"  Processing: {item}")
        time.sleep(0.1)  # シミュレーション
        print(f"  [{i}/{len(items)}] Completed: {item}")
    
    print("✓ All items processed!")

def demo_chaining():
    """Fire のチェーン機能のデモ用"""
    return {
        'calculator': Calculator(),
        'text': TextProcessor(),
        'files': FileManager()
    }

class FireDemo:
    """Fire CLI メインデモクラス"""
    
    def __init__(self):
        self.calculator = Calculator()
        self.text = TextProcessor()
        self.files = FileManager()
    
    def hello(self, name="World", count=1, shout=False):
        return hello(name, count, shout)
    
    def info(self):
        return system_info()
    
    def process(self, items=None, verbose=False):
        return process_items(items, verbose)

if __name__ == '__main__':
    # Fire は自動的に以下を CLI として公開します:
    # - FireDemo クラス
    # - その全てのメソッド
    # - ネストしたクラス（calculator, text, files）
    fire.Fire(FireDemo)