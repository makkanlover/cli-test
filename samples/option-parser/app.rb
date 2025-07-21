#!/usr/bin/env ruby

require 'optparse'
require 'json'
require 'time'
require 'fileutils'

class OptionParserDemo
  def initialize
    @options = {}
    @parser = create_parser
  end

  def run(args = ARGV)
    begin
      @parser.parse!(args)
      
      # サブコマンド処理
      if args.empty?
        puts @parser
        exit
      end

      command = args.shift
      case command
      when 'hello'
        hello_command(args)
      when 'create-user'
        create_user_command(args)
      when 'deploy'
        deploy_command(args)
      when 'file'
        file_command(args)
      when 'process'
        process_command(args)
      when 'config'
        config_command(args)
      when 'info'
        info_command(args)
      when 'help'
        show_help
      else
        puts "Unknown command: #{command}"
        puts "Use 'ruby app.rb help' for available commands"
        exit 1
      end
    rescue OptionParser::InvalidOption => e
      puts "Error: #{e.message}"
      puts @parser
      exit 1
    end
  end

  private

  def create_parser
    OptionParser.new do |opts|
      opts.banner = "OptionParser CLI デモアプリケーション\n\n"
      opts.banner += "使用方法: ruby app.rb [options] <command> [command-options]\n\n"
      opts.banner += "利用可能なコマンド:\n"
      opts.banner += "  hello         基本的な挨拶コマンド\n"
      opts.banner += "  create-user   ユーザー作成のデモ\n"
      opts.banner += "  deploy        デプロイメントのシミュレーション\n"
      opts.banner += "  file          ファイル操作のデモ\n"
      opts.banner += "  process       アイテム処理のデモ\n"
      opts.banner += "  config        設定管理\n"
      opts.banner += "  info          システム情報を表示\n"
      opts.banner += "  help          ヘルプを表示\n\n"
      opts.banner += "グローバルオプション:\n"

      opts.on('-v', '--verbose', 'Verbose output') do |v|
        @options[:verbose] = v
      end

      opts.on('--version', 'Show version') do
        puts "OptionParser Demo 1.0.0"
        exit
      end

      opts.on('-h', '--help', 'Show this help message') do
        puts opts
        exit
      end
    end
  end

  def hello_command(args)
    options = { name: 'World', count: 1, shout: false }
    
    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb hello [options] [name]\n\n"
      
      opts.on('-n', '--name NAME', 'Name to greet') do |name|
        options[:name] = name
      end
      
      opts.on('-c', '--count COUNT', Integer, 'Number of greetings') do |count|
        options[:count] = count
      end
      
      opts.on('-s', '--shout', 'Shout the greeting') do |shout|
        options[:shout] = shout
      end
      
      opts.on('-h', '--help', 'Show help for hello command') do
        puts opts
        exit
      end
    end.parse!(args)

    # 位置引数の処理
    options[:name] = args.first if args.first

    greeting = options[:shout] ? 'HELLO' : 'Hello'
    display_name = options[:shout] ? options[:name].upcase : options[:name]

    options[:count].times do |i|
      puts "#{greeting}, #{display_name}!"
      if options[:count] > 1
        puts "  (#{i + 1}/#{options[:count]})"
      end
    end
  end

  def create_user_command(args)
    if args.empty?
      puts "Error: Username is required"
      puts "使用方法: ruby app.rb create-user <username> [options]"
      exit 1
    end

    username = args.shift
    options = { active: true }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb create-user <username> [options]\n\n"
      
      opts.on('-e', '--email EMAIL', 'Email address') do |email|
        options[:email] = email
      end
      
      opts.on('-a', '--age AGE', Integer, 'Age') do |age|
        options[:age] = age
      end
      
      opts.on('--[no-]active', 'Active status') do |active|
        options[:active] = active
      end
      
      opts.on('-h', '--help', 'Show help for create-user command') do
        puts opts
        exit
      end
    end.parse!(args)

    puts "Creating user..."
    puts "User Information:"
    puts "  Username: #{username}"
    puts "  Email: #{options[:email] || 'Not provided'}"
    puts "  Age: #{options[:age] || 'Not provided'}"
    puts "  Active: #{options[:active]}"
    puts "  Created: #{Time.now.strftime('%Y-%m-%d %H:%M:%S')}"
    puts "✓ User created successfully!"
  end

  def deploy_command(args)
    options = { env: 'development', force: false, dry_run: false }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb deploy [options]\n\n"
      
      opts.on('-e', '--env ENVIRONMENT', 'Target environment') do |env|
        options[:env] = env
      end
      
      opts.on('-f', '--force', 'Force deployment') do |force|
        options[:force] = force
      end
      
      opts.on('--dry-run', 'Dry run mode') do |dry_run|
        options[:dry_run] = dry_run
      end
      
      opts.on('-c', '--config FILE', 'Configuration file path') do |config|
        options[:config] = config
      end
      
      opts.on('-h', '--help', 'Show help for deploy command') do
        puts opts
        exit
      end
    end.parse!(args)

    puts "Deployment Configuration:"
    puts "  Environment: #{options[:env]}"
    puts "  Force: #{options[:force]}"
    puts "  Dry Run: #{options[:dry_run]}"
    puts "  Config: #{options[:config] || 'Default'}"

    if options[:dry_run]
      puts "\n[DRY RUN] Would deploy to #{options[:env]}"
    else
      puts "\nDeploying to #{options[:env]}..."
      sleep 1
      puts "✓ Deployment completed successfully!"
    end
  end

  def file_command(args)
    if args.empty?
      puts "Available file subcommands: create, read, list"
      puts "使用方法: ruby app.rb file <subcommand> [options]"
      exit
    end

    subcommand = args.shift
    case subcommand
    when 'create'
      file_create_command(args)
    when 'read'
      file_read_command(args)
    when 'list'
      file_list_command(args)
    else
      puts "Unknown file subcommand: #{subcommand}"
      exit 1
    end
  end

  def file_create_command(args)
    if args.empty?
      puts "Error: Filename is required"
      puts "使用方法: ruby app.rb file create <filename> [options]"
      exit 1
    end

    filename = args.shift
    options = { content: 'Hello from OptionParser!' }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb file create <filename> [options]\n\n"
      
      opts.on('-c', '--content CONTENT', 'File content') do |content|
        options[:content] = content
      end
      
      opts.on('-h', '--help', 'Show help for file create command') do
        puts opts
        exit
      end
    end.parse!(args)

    begin
      File.write(filename, options[:content])
      puts "✓ File created: #{filename}"
      puts "Content: #{options[:content]}"
    rescue => e
      puts "✗ Error creating file: #{e.message}"
    end
  end

  def file_read_command(args)
    if args.empty?
      puts "Error: Filename is required"
      puts "使用方法: ruby app.rb file read <filename>"
      exit 1
    end

    filename = args.shift

    begin
      content = File.read(filename)
      puts "File: #{filename}"
      puts "Content: #{content}"
    rescue => e
      puts "✗ Error reading file: #{e.message}"
    end
  end

  def file_list_command(args)
    directory = args.first || '.'
    options = { all: false }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb file list [directory] [options]\n\n"
      
      opts.on('-a', '--all', 'Show hidden files') do |all|
        options[:all] = all
      end
      
      opts.on('-h', '--help', 'Show help for file list command') do
        puts opts
        exit
      end
    end.parse!(args)

    begin
      puts "Contents of #{File.expand_path(directory)}:"
      Dir.entries(directory).each do |entry|
        next if entry == '.' || entry == '..'
        next if !options[:all] && entry.start_with?('.')
        
        full_path = File.join(directory, entry)
        type = File.directory?(full_path) ? '[DIR]' : '[FILE]'
        puts "  #{type} #{entry}"
      end
    rescue => e
      puts "✗ Error listing directory: #{e.message}"
    end
  end

  def process_command(args)
    options = { items: ['item1', 'item2', 'item3'], verbose: false }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb process [options]\n\n"
      
      opts.on('-i', '--items ITEMS', Array, 'Items to process (comma-separated)') do |items|
        options[:items] = items
      end
      
      opts.on('-v', '--verbose', 'Verbose output') do |verbose|
        options[:verbose] = verbose
      end
      
      opts.on('-h', '--help', 'Show help for process command') do
        puts opts
        exit
      end
    end.parse!(args)

    puts "Processing #{options[:items].length} items..."

    options[:items].each_with_index do |item, index|
      if options[:verbose]
        puts "  Processing: #{item}"
      end
      sleep 0.1
      puts "  [#{index + 1}/#{options[:items].length}] Completed: #{item}"
    end

    puts "\n✓ All items processed!"
  end

  def config_command(args)
    if args.empty?
      puts "Available config subcommands: get, set, list"
      puts "使用方法: ruby app.rb config <subcommand> [options]"
      exit
    end

    subcommand = args.shift
    case subcommand
    when 'get'
      config_get_command(args)
    when 'set'
      config_set_command(args)
    when 'list'
      config_list_command(args)
    else
      puts "Unknown config subcommand: #{subcommand}"
      exit 1
    end
  end

  def config_get_command(args)
    if args.empty?
      puts "Error: Key is required"
      puts "使用方法: ruby app.rb config get <key> [options]"
      exit 1
    end

    key = args.shift
    options = { global: false }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb config get <key> [options]\n\n"
      
      opts.on('-g', '--global', 'Use global configuration') do |global|
        options[:global] = global
      end
      
      opts.on('-h', '--help', 'Show help for config get command') do
        puts opts
        exit
      end
    end.parse!(args)

    scope = options[:global] ? 'global' : 'local'
    puts "Configuration [#{scope}]:"

    # デモ用の設定値
    configs = {
      'theme' => 'dark',
      'debug' => 'false',
      'timeout' => '30'
    }

    if configs.key?(key)
      puts "  #{key}: #{configs[key]}"
    else
      puts "  #{key}: not found"
    end
  end

  def config_set_command(args)
    if args.length < 2
      puts "Error: Key and value are required"
      puts "使用方法: ruby app.rb config set <key> <value> [options]"
      exit 1
    end

    key = args.shift
    value = args.shift
    options = { global: false }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb config set <key> <value> [options]\n\n"
      
      opts.on('-g', '--global', 'Use global configuration') do |global|
        options[:global] = global
      end
      
      opts.on('-h', '--help', 'Show help for config set command') do
        puts opts
        exit
      end
    end.parse!(args)

    scope = options[:global] ? 'global' : 'local'
    puts "Configuration [#{scope}]:"
    puts "  Setting #{key} = #{value}"
    puts "✓ Configuration updated!"
  end

  def config_list_command(args)
    options = { global: false }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb config list [options]\n\n"
      
      opts.on('-g', '--global', 'Use global configuration') do |global|
        options[:global] = global
      end
      
      opts.on('-h', '--help', 'Show help for config list command') do
        puts opts
        exit
      end
    end.parse!(args)

    scope = options[:global] ? 'global' : 'local'
    puts "Configuration [#{scope}]:"
    puts "  theme: dark"
    puts "  debug: false"
    puts "  timeout: 30"
  end

  def info_command(args)
    options = { format: 'table', verbose: false }

    OptionParser.new do |opts|
      opts.banner = "使用方法: ruby app.rb info [options]\n\n"
      
      opts.on('-f', '--format FORMAT', ['json', 'table'], 'Output format (json, table)') do |format|
        options[:format] = format
      end
      
      opts.on('-v', '--verbose', 'Verbose output') do |verbose|
        options[:verbose] = verbose
      end
      
      opts.on('-h', '--help', 'Show help for info command') do
        puts opts
        exit
      end
    end.parse!(args)

    info_data = {
      'Library' => 'OptionParser',
      'Version' => 'Ruby標準ライブラリ',
      'Language' => 'Ruby',
      'Features' => 'Simple API, Built-in, Lightweight',
      'Timestamp' => Time.now.iso8601
    }

    if options[:verbose]
      info_data['Extras'] = {
        'Documentation' => 'https://ruby-doc.org/stdlib/libdoc/optparse/rdoc/OptionParser.html',
        'Type' => 'Standard Library',
        'License' => 'Ruby License'
      }
    end

    case options[:format]
    when 'json'
      puts JSON.pretty_generate(info_data)
    else
      puts "System Information:"
      print_table(info_data)
    end
  end

  def print_table(data, indent = 0)
    prefix = '  ' * indent
    
    data.each do |key, value|
      if value.is_a?(Hash)
        puts "#{prefix}#{key}:"
        print_table(value, indent + 1)
      else
        puts "#{prefix}#{key}: #{value}"
      end
    end
  end

  def show_help
    puts @parser
    puts "\n各コマンドの詳細なヘルプを表示するには:"
    puts "  ruby app.rb <command> --help"
    puts "\n例:"
    puts "  ruby app.rb hello --help"
    puts "  ruby app.rb create-user --help"
  end
end

# スクリプトが直接実行された場合のみ実行
if __FILE__ == $0
  demo = OptionParserDemo.new
  demo.run
end