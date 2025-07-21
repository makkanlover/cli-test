const libraries = {
  'click': {
    id: 'click',
    name: 'Click',
    language: 'Python',
    description: 'Pythonでコマンドラインインターフェースを作るためのパッケージ。デコレーターを使った直感的なコマンド定義が特徴。',
    features: [
      'デコレーターベースのコマンド定義',
      'ネストしたサブコマンド',
      'オプション・引数の自動検証',
      'カラフルな出力',
      'プログレスバー'
    ],
    sampleCommands: [
      'python app.py --help',
      'python app.py hello --name World',
      'python app.py count --count 5'
    ],
    installCommand: 'pip install click',
    executable: 'python',
    samplePath: '../samples/click/app.py'
  },
  
  'typer': {
    id: 'typer',
    name: 'Typer',
    language: 'Python',
    description: 'FastAPIの作者によるモダンなCLIライブラリ。型ヒントを活用し、リッチな出力機能を提供。',
    features: [
      '型ヒント活用',
      'リッチテキスト出力',
      '自動補完機能',
      'プログレスバー',
      'カラフルなヘルプ表示'
    ],
    sampleCommands: [
      'python app.py --help',
      'python app.py hello --name World',
      'python app.py create-user John --age 25'
    ],
    installCommand: 'pip install typer[all]',
    executable: 'python',
    samplePath: '../samples/typer/app.py'
  },

  'fire': {
    id: 'fire',
    name: 'Fire',
    language: 'Python',
    description: 'Googleが開発したライブラリ。既存のPython関数やクラスを自動的にCLIに変換。',
    features: [
      '自動CLI生成',
      'ゼロ設定',
      'クラスや関数の自動解析',
      'チェーン可能なコマンド',
      'IPythonとの統合'
    ],
    sampleCommands: [
      'python app.py -- --help',
      'python app.py hello --name=World',
      'python app.py Calculator add 10 5'
    ],
    installCommand: 'pip install fire',
    executable: 'python',
    samplePath: '../samples/fire/app.py'
  },

  'commander-js': {
    id: 'commander-js',
    name: 'Commander.js',
    language: 'Node.js',
    description: 'Node.js用の完全なコマンドラインソリューション。チェーン可能なAPIで直感的な設定が可能。',
    features: [
      'チェーン可能なAPI',
      'サブコマンドサポート',
      'オプション解析',
      'ヘルプ生成',
      'カスタムアクション'
    ],
    sampleCommands: [
      'node app.js --help',
      'node app.js hello --name World',
      'node app.js deploy --env production'
    ],
    installCommand: 'npm install commander',
    executable: 'node',
    samplePath: '../samples/commander-js/app.js'
  },

  'yargs': {
    id: 'yargs',
    name: 'Yargs',
    language: 'Node.js',
    description: '海賊をテーマにしたNode.js用引数解析ライブラリ。複雑なコマンドライン引数の処理に優れている。',
    features: [
      '複雑なオプション処理',
      'コマンドチェーン',
      'バリデーション機能',
      'ミドルウェアサポート',
      '国際化対応'
    ],
    sampleCommands: [
      'node app.js --help',
      'node app.js serve --port 8080',
      'node app.js build --minify --output dist'
    ],
    installCommand: 'npm install yargs',
    executable: 'node',
    samplePath: '../samples/yargs/app.js'
  },

  'inquirer-js': {
    id: 'inquirer-js',
    name: 'Inquirer.js',
    language: 'Node.js',
    description: '美しいインタラクティブなコマンドラインプロンプトを作成するライブラリ。',
    features: [
      'インタラクティブプロンプト',
      '複数の入力タイプ',
      '条件分岐質問',
      'バリデーション',
      'カスタムプロンプト'
    ],
    sampleCommands: [
      'node app.js',
      'node app.js --preset web',
      'node app.js --interactive'
    ],
    installCommand: 'npm install inquirer',
    executable: 'node',
    samplePath: '../samples/inquirer-js/app.js'
  },

  'cobra': {
    id: 'cobra',
    name: 'Cobra',
    language: 'Go',
    description: 'Go言語用のCLIライブラリ。KubernetesやDockerなどで使用されている信頼性の高いライブラリ。',
    features: [
      'サブコマンド構造',
      'フラグとオプション',
      'ヘルプ自動生成',
      'シェル補完',
      'POSIX準拠'
    ],
    sampleCommands: [
      './app --help',
      './app hello --name World',
      './app version'
    ],
    installCommand: 'go get -u github.com/spf13/cobra/cobra',
    executable: './app',
    samplePath: '../samples/cobra/'
  },

  'clap': {
    id: 'clap',
    name: 'Clap',
    language: 'Rust',
    description: 'Rustの強力なコマンドライン引数解析ライブラリ。型安全性とパフォーマンスを重視。',
    features: [
      '型安全な引数解析',
      'サブコマンドサポート',
      'ヘルプ自動生成',
      'シェル補完',
      'カスタムバリデーション'
    ],
    sampleCommands: [
      './app --help',
      './app hello --name World',
      './app config set --key value'
    ],
    installCommand: 'cargo add clap --features derive',
    executable: './app',
    samplePath: '../samples/clap/'
  },

  'thor': {
    id: 'thor',
    name: 'Thor',
    language: 'Ruby',
    description: 'Ruby用のコマンドラインインターフェース構築ツール。Rails generatorでも使用されている。',
    features: [
      'Rakeライクなタスク定義',
      'テンプレートエンジン',
      'ファイル操作ヘルパー',
      'カラー出力',
      'インタラクティブ機能'
    ],
    sampleCommands: [
      'ruby app.rb help',
      'ruby app.rb hello --name World',
      'ruby app.rb generate --template basic'
    ],
    installCommand: 'gem install thor',
    executable: 'ruby',
    samplePath: '../samples/thor/app.rb'
  },

  'option-parser': {
    id: 'option-parser',
    name: 'OptionParser',
    language: 'Ruby',
    description: 'Ruby標準ライブラリのコマンドラインオプション解析クラス。シンプルで軽量。',
    features: [
      '標準ライブラリ',
      'シンプルなAPI',
      'オプション解析',
      'ヘルプ生成',
      '軽量'
    ],
    sampleCommands: [
      'ruby app.rb --help',
      'ruby app.rb --name World',
      'ruby app.rb --verbose --file config.txt'
    ],
    installCommand: '標準ライブラリ（追加インストール不要）',
    executable: 'ruby',
    samplePath: '../samples/option-parser/app.rb'
  }
};

class LibraryConfig {
  getLibraries() {
    return Object.values(libraries);
  }

  getLibrary(id) {
    return libraries[id];
  }

  getLanguageLibraries(language) {
    return Object.values(libraries).filter(lib => lib.language === language);
  }

  getSupportedLanguages() {
    const languages = new Set(Object.values(libraries).map(lib => lib.language));
    return Array.from(languages);
  }
}

module.exports = new LibraryConfig();