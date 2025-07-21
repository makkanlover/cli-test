#!/usr/bin/env ruby

require 'thor'
require 'json'
require 'time'
require 'fileutils'

class ThorDemo < Thor
  desc "hello [NAME]", "基本的な挨拶コマンド"
  long_desc <<-LONGDESC
    指定された名前で挨拶を行います。名前が指定されない場合は'World'が使用されます。

    例:
    $ ruby app.rb hello
    $ ruby app.rb hello John --count 3 --shout
  LONGDESC
  method_option :count, aliases: '-c', type: :numeric, default: 1, desc: '挨拶を繰り返す回数'
  method_option :shout, aliases: '-s', type: :boolean, desc: '大声で挨拶する'
  def hello(name = 'World')
    greeting = options[:shout] ? 'HELLO' : 'Hello'
    display_name = options[:shout] ? name.upcase : name
    
    options[:count].times do |i|
      say "#{greeting}, #{display_name}!", :green
      if options[:count] > 1
        say "  (#{i + 1}/#{options[:count]})", :cyan
      end
    end
  end

  desc "create_user USERNAME", "ユーザー作成のデモ"
  long_desc <<-LONGDESC
    新しいユーザープロファイルを作成するためのデモコマンドです。

    例:
    $ ruby app.rb create_user john --email john@example.com --age 25
  LONGDESC
  method_option :email, aliases: '-e', type: :string, desc: 'メールアドレス'
  method_option :age, aliases: '-a', type: :numeric, desc: '年齢'
  method_option :active, type: :boolean, default: true, desc: 'アクティブ状態'
  def create_user(username)
    say "Creating user...", :yellow
    say "User Information:", :cyan
    say "  Username: #{username}"
    say "  Email: #{options[:email] || 'Not provided'}"
    say "  Age: #{options[:age] || 'Not provided'}"
    say "  Active: #{options[:active]}"
    say "  Created: #{Time.now.strftime('%Y-%m-%d %H:%M:%S')}"
    say "✓ User created successfully!", :green
  end

  desc "deploy", "デプロイメントのシミュレーション"
  long_desc <<-LONGDESC
    アプリケーションのデプロイメントをシミュレートするコマンドです。

    例:
    $ ruby app.rb deploy --env production --force
    $ ruby app.rb deploy --dry-run
  LONGDESC
  method_option :env, aliases: '-e', type: :string, default: 'development', desc: '環境を指定'
  method_option :force, aliases: '-f', type: :boolean, desc: '強制実行'
  method_option :dry_run, type: :boolean, desc: 'ドライランモード'
  method_option :config, aliases: '-c', type: :string, desc: '設定ファイルのパス'
  def deploy
    say "Deployment Configuration:", :cyan
    say "  Environment: #{options[:env]}"
    say "  Force: #{options[:force]}"
    say "  Dry Run: #{options[:dry_run]}"
    say "  Config: #{options[:config] || 'Default'}"

    if options[:dry_run]
      say "\n[DRY RUN] Would deploy to #{options[:env]}", :yellow
      return
    end

    say "\nDeploying to #{options[:env]}...", :yellow
    sleep 1
    say "✓ Deployment completed successfully!", :green
  end

  desc "file SUBCOMMAND", "ファイル操作のデモ"
  subcommand "file", FileCommands

  desc "process", "アイテム処理のデモ"
  long_desc <<-LONGDESC
    複数のアイテムを処理するデモコマンドです。

    例:
    $ ruby app.rb process --items item1,item2,item3 --verbose
  LONGDESC
  method_option :items, aliases: '-i', type: :array, desc: '処理するアイテム'
  method_option :verbose, aliases: '-v', type: :boolean, desc: '詳細な出力を表示'
  def process
    items = options[:items] || ['item1', 'item2', 'item3']
    
    say "Processing #{items.length} items...", :yellow
    
    items.each_with_index do |item, index|
      if options[:verbose]
        say "  Processing: #{item}", :cyan
      end
      sleep 0.1
      say "  [#{index + 1}/#{items.length}] Completed: #{item}", :green
    end
    
    say "\n✓ All items processed!", :green
  end

  desc "config SUBCOMMAND", "設定管理"
  subcommand "config", ConfigCommands

  desc "info", "システム情報を表示"
  long_desc <<-LONGDESC
    システム情報を表示します。

    例:
    $ ruby app.rb info
    $ ruby app.rb info --format json --verbose
  LONGDESC
  method_option :format, aliases: '-f', type: :string, default: 'table', desc: '出力フォーマット (json|table)'
  method_option :verbose, aliases: '-v', type: :boolean, desc: '詳細な情報を表示'
  def info
    info_data = {
      'Library' => 'Thor',
      'Version' => '1.2+',
      'Language' => 'Ruby',
      'Features' => 'Rake-like tasks, Template engine, File helpers',
      'Timestamp' => Time.now.iso8601
    }

    if options[:verbose]
      info_data['Extras'] = {
        'Documentation' => 'https://github.com/rails/thor/wiki',
        'Repository' => 'https://github.com/rails/thor',
        'License' => 'MIT'
      }
    end

    case options[:format]
    when 'json'
      say JSON.pretty_generate(info_data)
    else
      say "System Information:", :cyan
      print_table(info_data)
    end
  end

  desc "interactive", "インタラクティブなデモ"
  def interactive
    say "Interactive Demo", :cyan
    
    name = ask("What's your name?")
    age = ask("What's your age?", :cyan) { |q| q.validate = /^\d+$/ }
    
    if yes?("Are you sure you want to continue?")
      say "Hello #{name}! You are #{age} years old.", :green
    else
      say "Operation cancelled.", :yellow
    end
  end

  desc "generate TEMPLATE", "テンプレート生成のデモ"
  long_desc <<-LONGDESC
    Thorの強力なテンプレート機能をデモンストレーションします。

    例:
    $ ruby app.rb generate basic
    $ ruby app.rb generate advanced --name myproject
  LONGDESC
  method_option :name, aliases: '-n', type: :string, default: 'demo-project', desc: 'プロジェクト名'
  method_option :output, aliases: '-o', type: :string, default: '.', desc: '出力ディレクトリ'
  def generate(template)
    case template
    when 'basic'
      generate_basic_template
    when 'advanced'
      generate_advanced_template
    else
      say "Unknown template: #{template}", :red
      say "Available templates: basic, advanced"
    end
  end

  private

  def generate_basic_template
    project_name = options[:name]
    output_dir = File.join(options[:output], project_name)

    say "Generating basic template for #{project_name}...", :yellow

    # シミュレーション用のファイル作成
    files = [
      "#{project_name}/README.md",
      "#{project_name}/lib/#{project_name}.rb",
      "#{project_name}/test/test_#{project_name}.rb"
    ]

    files.each do |file|
      say "  create #{file}", :green
    end

    say "✓ Basic template generated!", :green
  end

  def generate_advanced_template
    project_name = options[:name]
    
    say "Generating advanced template for #{project_name}...", :yellow

    # より複雑なプロジェクト構造をシミュレーション
    files = [
      "#{project_name}/Gemfile",
      "#{project_name}/Rakefile",
      "#{project_name}/lib/#{project_name}.rb",
      "#{project_name}/lib/#{project_name}/version.rb",
      "#{project_name}/lib/#{project_name}/cli.rb",
      "#{project_name}/test/test_helper.rb",
      "#{project_name}/test/test_#{project_name}.rb",
      "#{project_name}/bin/#{project_name}"
    ]

    files.each do |file|
      say "  create #{file}", :green
    end

    say "✓ Advanced template generated!", :green
  end

  def print_table(data, indent = 0)
    prefix = '  ' * indent
    
    data.each do |key, value|
      if value.is_a?(Hash)
        say "#{prefix}#{key}:", :cyan
        print_table(value, indent + 1)
      else
        say "#{prefix}#{key}: #{value}"
      end
    end
  end
end

class FileCommands < Thor
  desc "create FILENAME", "ファイルを作成"
  method_option :content, aliases: '-c', type: :string, default: 'Hello from Thor!', desc: 'ファイルの内容'
  def create(filename)
    begin
      File.write(filename, options[:content])
      say "✓ File created: #{filename}", :green
      say "Content: #{options[:content]}", :cyan
    rescue => e
      say "✗ Error creating file: #{e.message}", :red
    end
  end

  desc "read FILENAME", "ファイルを読み取り"
  def read(filename)
    begin
      content = File.read(filename)
      say "File: #{filename}", :cyan
      say "Content: #{content}"
    rescue => e
      say "✗ Error reading file: #{e.message}", :red
    end
  end

  desc "list [DIRECTORY]", "ディレクトリの内容をリスト表示"
  method_option :all, aliases: '-a', type: :boolean, desc: '隠しファイルも表示'
  def list(directory = '.')
    begin
      say "Contents of #{File.expand_path(directory)}:", :cyan
      Dir.entries(directory).each do |entry|
        next if entry == '.' || entry == '..'
        next if !options[:all] && entry.start_with?('.')
        
        full_path = File.join(directory, entry)
        type = File.directory?(full_path) ? '[DIR]' : '[FILE]'
        say "  #{type} #{entry}"
      end
    rescue => e
      say "✗ Error listing directory: #{e.message}", :red
    end
  end
end

class ConfigCommands < Thor
  desc "get KEY", "設定値を取得"
  method_option :global, aliases: '-g', type: :boolean, desc: 'グローバル設定を使用'
  def get(key)
    scope = options[:global] ? 'global' : 'local'
    say "Configuration [#{scope}]:", :cyan

    # デモ用の設定値
    configs = {
      'theme' => 'dark',
      'debug' => 'false',
      'timeout' => '30'
    }

    if configs.key?(key)
      say "  #{key}: #{configs[key]}"
    else
      say "  #{key}: not found", :red
    end
  end

  desc "set KEY VALUE", "設定値を設定"
  method_option :global, aliases: '-g', type: :boolean, desc: 'グローバル設定を使用'
  def set(key, value)
    scope = options[:global] ? 'global' : 'local'
    say "Configuration [#{scope}]:", :cyan
    say "  Setting #{key} = #{value}"
    say "✓ Configuration updated!", :green
  end

  desc "list", "全ての設定を表示"
  method_option :global, aliases: '-g', type: :boolean, desc: 'グローバル設定を使用'
  def list
    scope = options[:global] ? 'global' : 'local'
    say "Configuration [#{scope}]:", :cyan
    say "  theme: dark"
    say "  debug: false"
    say "  timeout: 30"
  end
end

ThorDemo.start(ARGV)