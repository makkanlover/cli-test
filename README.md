# CLI Library Comparison

10種類の人気CLIライブラリを体験・比較できるWebアプリケーションです。

## 概要

このアプリケーションは、異なるプログラミング言語のCLIライブラリを一つのWebインターフェースで比較体験できるツールです。ブラウザ上でターミナル風の環境を提供し、各ライブラリの特徴や使用感を実際に体験できます。

## 対応ライブラリ

### Python
- **Click** - デコレーターベースのコマンド定義
- **Typer** - 型ヒント活用とリッチ出力
- **Fire** - 自動CLI生成

### Node.js
- **Commander.js** - チェーン可能なAPI
- **Yargs** - 複雑なオプション処理
- **Inquirer.js** - インタラクティブプロンプト

### その他の言語
- **Cobra (Go)** - サブコマンド構造
- **Clap (Rust)** - 強力な引数解析
- **Thor (Ruby)** - Rakeライクなタスク定義
- **OptionParser (Ruby)** - シンプルなオプション解析

## インストールと起動

### 必要な環境

- Node.js 16.x 以上
- Python 3.8 以上
- 各ライブラリの実行に必要な言語環境（オプション）

### セットアップ

1. リポジトリをクローンまたはダウンロード
2. 依存関係をインストール:
   ```bash
   npm install
   ```

3. サーバーを起動:
   ```bash
   npm start
   ```

4. ブラウザで `http://localhost:3000` を開く

### 開発モード

開発時はファイル変更を監視するため、以下のコマンドを使用:

```bash
npm run dev
```

## 使用方法

1. **ライブラリ選択**: メインページで比較したいCLIライブラリを選択
2. **コマンド実行**: ターミナル画面でコマンドを入力して実行
3. **サンプルコマンド**: 画面上部のサンプルコマンドをクリックして試用
4. **比較**: メニューに戻って他のライブラリと比較

### 基本コマンド

- `--help` - ヘルプを表示
- `hello --name Your-Name` - 基本的な挨拶コマンド
- `info` - ライブラリ情報を表示
- `clear` - ターミナルをクリア
- `exit` - メインメニューに戻る

## ライブラリのインストール

各ライブラリを実際に動作させるには、以下のコマンドでインストールしてください:

### Python ライブラリ
```bash
pip install click typer fire
```

### Node.js ライブラリ
```bash
npm install commander yargs inquirer
```

### Go ライブラリ
```bash
go install github.com/spf13/cobra/cobra@latest
```

### Rust ライブラリ
```bash
cargo install clap --features derive
```

### Ruby ライブラリ
```bash
gem install thor
# OptionParserは標準ライブラリのため追加インストール不要
```

## プロジェクト構造

```
cli-test/
├── backend/              # バックエンドサーバー
│   ├── server.js         # メインサーバー
│   ├── library-config.js # ライブラリ設定
│   └── process-manager.js # プロセス管理
├── frontend/             # フロントエンド
│   ├── index.html        # メインHTML
│   ├── styles.css        # スタイル
│   └── app.js           # JavaScript
├── samples/              # 各ライブラリのサンプル
│   ├── click/
│   ├── typer/
│   ├── fire/
│   ├── commander-js/
│   ├── yargs/
│   └── inquirer-js/
└── sample/photos/        # スクリーンショット格納
```

## 機能

- **Webベースのターミナルエミュレーション** - xterm.jsを使用
- **リアルタイム通信** - WebSocketによる双方向通信
- **レスポンシブデザイン** - モバイルデバイス対応
- **エラーハンドリング** - 適切なエラー表示とユーザーガイダンス
- **スクリーンショット機能** - 各ライブラリの見た目を保存・閲覧

## トラブルシューティング

### サーバーが起動しない
- Node.jsのバージョンを確認してください（16.x以上が必要）
- ポート3000が他のプロセスで使用されていないか確認してください

### ライブラリが実行できない
- 該当する言語の実行環境がインストールされているか確認してください
- ライブラリが正しくインストールされているか確認してください

### ターミナルが表示されない
- ブラウザのコンソールでJavaScriptエラーがないか確認してください
- xterm.jsのCDNが読み込まれているか確認してください

## 開発

新しいライブラリの追加や機能拡張については、以下のファイルを編集してください:

- `backend/library-config.js` - ライブラリメタデータ
- `samples/` - 新しいサンプルアプリケーション
- `frontend/app.js` - フロントエンド機能

## ライセンス

MIT License

## 貢献

プルリクエストや Issue の報告を歓迎します！