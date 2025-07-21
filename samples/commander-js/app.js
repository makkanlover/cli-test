#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .name('commander-demo')
  .description('Commander.js CLI デモアプリケーション')
  .version('1.0.0');

program
  .command('hello')
  .description('基本的な挨拶コマンド')
  .option('-n, --name <name>', '挨拶する相手の名前', 'World')
  .option('-c, --count <count>', '挨拶を繰り返す回数', '1')
  .option('-s, --shout', '大声で挨拶する')
  .action((options) => {
    const { name, count, shout } = options;
    const greeting = shout ? 'HELLO' : 'Hello';
    const targetName = shout ? name.toUpperCase() : name;
    
    for (let i = 0; i < parseInt(count); i++) {
      console.log(`${greeting}, ${targetName}!`);
      if (count > 1) {
        console.log(`  (${i + 1}/${count})`);
      }
    }
  });

program
  .command('create-user <username>')
  .description('ユーザー作成のデモ')
  .option('-e, --email <email>', 'メールアドレス')
  .option('-a, --age <age>', '年齢', parseInt)
  .option('--active', 'アクティブ状態', true)
  .option('--inactive', 'インアクティブ状態')
  .action((username, options) => {
    const user = {
      username,
      email: options.email || 'Not provided',
      age: options.age || 'Not provided',
      active: options.inactive ? false : options.active,
      created: new Date().toISOString()
    };
    
    console.log('Creating user...');
    console.log('User Information:');
    Object.entries(user).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('✓ User created successfully!');
  });

program
  .command('deploy')
  .description('デプロイメントのシミュレーション')
  .option('-e, --env <environment>', '環境を指定', 'development')
  .option('-f, --force', '強制実行')
  .option('--dry-run', 'ドライランモード')
  .option('--config <path>', '設定ファイルのパス')
  .action((options) => {
    console.log('Deployment Configuration:');
    console.log(`  Environment: ${options.env}`);
    console.log(`  Force: ${options.force ? 'Yes' : 'No'}`);
    console.log(`  Dry Run: ${options.dryRun ? 'Yes' : 'No'}`);
    console.log(`  Config: ${options.config || 'Default'}`);
    
    if (options.dryRun) {
      console.log('\n[DRY RUN] Would deploy to', options.env);
      return;
    }
    
    console.log(`\nDeploying to ${options.env}...`);
    
    setTimeout(() => {
      console.log('✓ Deployment completed successfully!');
    }, 1000);
  });

const fileCmd = program
  .command('file')
  .description('ファイル操作のデモ');

fileCmd
  .command('create <filename>')
  .description('ファイルを作成')
  .option('-c, --content <content>', 'ファイルの内容', 'Hello from Commander.js!')
  .action((filename, options) => {
    try {
      fs.writeFileSync(filename, options.content);
      console.log(`✓ File created: ${filename}`);
      console.log(`Content: ${options.content}`);
    } catch (error) {
      console.error(`✗ Error creating file: ${error.message}`);
    }
  });

fileCmd
  .command('read <filename>')
  .description('ファイルを読み取り')
  .action((filename) => {
    try {
      const content = fs.readFileSync(filename, 'utf8');
      console.log(`File: ${filename}`);
      console.log(`Content: ${content}`);
    } catch (error) {
      console.error(`✗ Error reading file: ${error.message}`);
    }
  });

fileCmd
  .command('list [directory]')
  .description('ディレクトリの内容をリスト表示')
  .option('-a, --all', '隠しファイルも表示')
  .action((directory = '.', options) => {
    try {
      const files = fs.readdirSync(directory);
      console.log(`Contents of ${path.resolve(directory)}:`);
      files.forEach(file => {
        if (options.all || !file.startsWith('.')) {
          const stats = fs.statSync(path.join(directory, file));
          const type = stats.isDirectory() ? '[DIR]' : '[FILE]';
          console.log(`  ${type} ${file}`);
        }
      });
    } catch (error) {
      console.error(`✗ Error listing directory: ${error.message}`);
    }
  });

program
  .command('process')
  .description('アイテム処理のデモ')
  .option('-i, --items <items...>', '処理するアイテム')
  .option('-v, --verbose', '詳細な出力を表示')
  .action((options) => {
    const items = options.items || ['item1', 'item2', 'item3'];
    console.log(`Processing ${items.length} items...`);
    
    items.forEach((item, index) => {
      if (options.verbose) {
        console.log(`  Processing: ${item}`);
      }
      setTimeout(() => {
        console.log(`  [${index + 1}/${items.length}] Completed: ${item}`);
        if (index === items.length - 1) {
          console.log('✓ All items processed!');
        }
      }, (index + 1) * 100);
    });
  });

program
  .command('info')
  .description('システム情報を表示')
  .option('-f, --format <format>', '出力フォーマット (json|table)', 'table')
  .action((options) => {
    const info = {
      library: 'Commander.js',
      version: '9.0+',
      language: 'Node.js',
      features: 'Chainable API, Subcommands, Option parsing',
      timestamp: new Date().toISOString()
    };
    
    if (options.format === 'json') {
      console.log(JSON.stringify(info, null, 2));
    } else {
      console.log('System Information:');
      Object.entries(info).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
  });

program
  .command('interactive')
  .description('インタラクティブなデモ')
  .action(() => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('Interactive Demo');
    
    rl.question("What's your name? ", (name) => {
      rl.question("What's your favorite color? ", (color) => {
        console.log(`Hello ${name}! I see you like ${color}.`);
        rl.close();
      });
    });
  });

program.parse();