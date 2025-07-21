# Design Document

## Overview

CLIライブラリ比較アプリケーションは、Web技術を使用してターミナル環境をシミュレートし、複数のCLIライブラリの体験を提供するシングルページアプリケーションです。Node.jsバックエンドで各ライブラリのサンプルアプリケーションを実行し、フロントエンドでターミナル風のインターフェースを提供します。

## Architecture

### システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   CLI Samples   │
│   (React/HTML)  │◄──►│   (Node.js)     │◄──►│   (各言語)      │
│   - Terminal UI │    │   - API Server  │    │   - Python      │
│   - Library     │    │   - Process     │    │   - Node.js     │
│     Selection   │    │     Manager     │    │   - Go          │
└─────────────────┘    └─────────────────┘    │   - Rust        │
                                              │   - Ruby        │
                                              └─────────────────┘
```

### 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (Vanilla or React)
- **バックエンド**: Node.js with Express
- **ターミナルエミュレーション**: xterm.js
- **プロセス管理**: Node.js child_process
- **WebSocket**: Socket.io (リアルタイム通信用)

## Components and Interfaces

### 1. Frontend Components

#### MainMenu Component
- 10種類のCLIライブラリの選択メニューを表示
- ライブラリ選択時にバックエンドに通知
- スクリーンショットギャラリーへのリンク

#### TerminalEmulator Component
- xterm.jsを使用したターミナル風インターフェース
- ユーザー入力の受付とバックエンドへの送信
- コマンド実行結果の表示
- メインメニューへの戻り機能

#### PhotoGallery Component
- sample/photos下のスクリーンショット表示
- ライブラリ別の画像閲覧機能

### 2. Backend Components

#### API Server
```javascript
// Express routes
GET  /api/libraries          // 利用可能なライブラリリスト取得
POST /api/select-library     // ライブラリ選択
POST /api/execute-command    // コマンド実行
GET  /api/screenshots        // スクリーンショット一覧
```

#### Process Manager
```javascript
class ProcessManager {
  selectLibrary(libraryName)   // ライブラリ環境の初期化
  executeCommand(command)      // コマンドの実行
  cleanup()                    // プロセスのクリーンアップ
}
```

#### Library Adapters
各CLIライブラリ用のアダプター実装：
```javascript
class LibraryAdapter {
  initialize()                 // ライブラリ環境の準備
  createSampleApp()           // サンプルアプリケーションの作成
  executeCommand(cmd)         // コマンドの実行
  getHelp()                   // ヘルプ情報の取得
}
```

### 3. CLI Sample Applications

各ライブラリごとに以下の機能を持つサンプルアプリケーションを作成：

#### 共通機能
- ヘルプコマンド (`help`, `--help`)
- バージョン表示 (`version`, `--version`)
- 基本的なコマンド実行
- オプション処理のデモ
- インタラクティブな入力処理

#### ライブラリ固有機能
- **Click**: デコレーターベースのコマンド定義
- **Typer**: 型ヒント活用とリッチな出力
- **Fire**: 自動CLI生成
- **Commander.js**: チェーン可能なAPI
- **Yargs**: 複雑なオプション処理
- **Inquirer.js**: インタラクティブプロンプト
- **Cobra**: サブコマンド構造
- **Clap**: 強力な引数解析
- **Thor**: Rakeライクなタスク定義
- **OptionParser**: シンプルなオプション解析

## Data Models

### Library Configuration
```javascript
{
  id: string,
  name: string,
  language: string,
  description: string,
  features: string[],
  sampleCommands: string[],
  installCommand: string,
  executable: string
}
```

### Command Execution
```javascript
{
  library: string,
  command: string,
  args: string[],
  options: object,
  timestamp: Date
}
```

### Screenshot Metadata
```javascript
{
  library: string,
  filename: string,
  path: string,
  description: string,
  timestamp: Date
}
```

## Error Handling

### Frontend Error Handling
- ネットワークエラーの適切な表示
- 無効なコマンド入力に対するフィードバック
- ライブラリ選択エラーの処理

### Backend Error Handling
- プロセス実行エラーのキャッチと適切なレスポンス
- ライブラリ初期化失敗時のフォールバック
- リソース不足時の適切なエラーメッセージ

### Process Error Handling
```javascript
try {
  const result = await executeCommand(command);
  return { success: true, output: result };
} catch (error) {
  return { 
    success: false, 
    error: error.message,
    suggestion: getSuggestion(error.type)
  };
}
```

## Testing Strategy

### Unit Tests
- 各ライブラリアダプターの動作確認
- プロセス管理機能のテスト
- API エンドポイントのテスト

### Integration Tests
- フロントエンド・バックエンド間の通信テスト
- 各CLIライブラリとの統合テスト
- WebSocket通信のテスト

### E2E Tests
- ユーザーフローの完全なテスト
- ライブラリ切り替え機能のテスト
- スクリーンショット機能のテスト

### Manual Testing
- 各ライブラリの視覚的な確認
- ユーザビリティテスト
- パフォーマンステスト

## Implementation Notes

### Development Environment Setup
各言語環境の準備が必要：
- Python 3.8+ (Click, Typer, Fire用)
- Node.js 16+ (Commander.js, Yargs, Inquirer.js用)
- Go 1.19+ (Cobra用)
- Rust 1.60+ (Clap用)
- Ruby 3.0+ (Thor, OptionParser用)

### Screenshot Generation
- 自動スクリーンショット生成のためのヘッドレスブラウザ使用
- 各ライブラリの特徴的な画面をキャプチャ
- 統一されたフォーマットでの保存

### Performance Considerations
- プロセスの適切な管理とクリーンアップ
- 同時実行数の制限
- メモリ使用量の監視