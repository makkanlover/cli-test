package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "cobra-demo",
	Short: "Cobra CLI デモアプリケーション",
	Long: `Cobra CLI デモアプリケーション

Cobraライブラリの特徴的な機能を体験できるサンプルです。
サブコマンド構造、フラグ処理、POSIX準拠などの機能を実装しています。`,
	Version: "1.0.0",
}

var helloCmd = &cobra.Command{
	Use:   "hello [name]",
	Short: "基本的な挨拶コマンド",
	Long:  "指定された名前で挨拶を行います。名前が指定されない場合は'World'が使用されます。",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		name := "World"
		if len(args) > 0 {
			name = args[0]
		}

		count, _ := cmd.Flags().GetInt("count")
		shout, _ := cmd.Flags().GetBool("shout")
		
		greeting := "Hello"
		if shout {
			greeting = strings.ToUpper(greeting)
			name = strings.ToUpper(name)
		}

		for i := 0; i < count; i++ {
			fmt.Printf("%s, %s!\n", greeting, name)
			if count > 1 {
				fmt.Printf("  (%d/%d)\n", i+1, count)
			}
		}
	},
}

var createUserCmd = &cobra.Command{
	Use:   "create-user <username>",
	Short: "ユーザー作成のデモ",
	Long:  "新しいユーザープロファイルを作成するためのデモコマンドです。",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]
		email, _ := cmd.Flags().GetString("email")
		age, _ := cmd.Flags().GetInt("age")
		active, _ := cmd.Flags().GetBool("active")

		fmt.Println("Creating user...")
		fmt.Println("User Information:")
		fmt.Printf("  Username: %s\n", username)
		fmt.Printf("  Email: %s\n", getStringOrDefault(email, "Not provided"))
		fmt.Printf("  Age: %s\n", getIntOrDefault(age, "Not provided"))
		fmt.Printf("  Active: %t\n", active)
		fmt.Printf("  Created: %s\n", time.Now().Format("2006-01-02 15:04:05"))
		fmt.Println("✓ User created successfully!")
	},
}

var deployCmd = &cobra.Command{
	Use:   "deploy",
	Short: "デプロイメントのシミュレーション",
	Long:  "アプリケーションのデプロイメントをシミュレートするコマンドです。",
	Run: func(cmd *cobra.Command, args []string) {
		env, _ := cmd.Flags().GetString("env")
		force, _ := cmd.Flags().GetBool("force")
		dryRun, _ := cmd.Flags().GetBool("dry-run")
		config, _ := cmd.Flags().GetString("config")

		fmt.Println("Deployment Configuration:")
		fmt.Printf("  Environment: %s\n", env)
		fmt.Printf("  Force: %t\n", force)
		fmt.Printf("  Dry Run: %t\n", dryRun)
		fmt.Printf("  Config: %s\n", getStringOrDefault(config, "Default"))

		if dryRun {
			fmt.Printf("\n[DRY RUN] Would deploy to %s\n", env)
			return
		}

		fmt.Printf("\nDeploying to %s...\n", env)
		time.Sleep(1 * time.Second)
		fmt.Println("✓ Deployment completed successfully!")
	},
}

var fileCmd = &cobra.Command{
	Use:   "file",
	Short: "ファイル操作のデモ",
	Long:  "ファイル操作に関連するサブコマンドを提供します。",
}

var fileCreateCmd = &cobra.Command{
	Use:   "create <filename>",
	Short: "ファイルを作成",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		filename := args[0]
		content, _ := cmd.Flags().GetString("content")
		
		if content == "" {
			content = "Hello from Cobra!"
		}

		err := os.WriteFile(filename, []byte(content), 0644)
		if err != nil {
			fmt.Printf("✗ Error creating file: %v\n", err)
			return
		}
		
		fmt.Printf("✓ File created: %s\n", filename)
		fmt.Printf("Content: %s\n", content)
	},
}

var fileReadCmd = &cobra.Command{
	Use:   "read <filename>",
	Short: "ファイルを読み取り",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		filename := args[0]
		
		content, err := os.ReadFile(filename)
		if err != nil {
			fmt.Printf("✗ Error reading file: %v\n", err)
			return
		}
		
		fmt.Printf("File: %s\n", filename)
		fmt.Printf("Content: %s\n", string(content))
	},
}

var processCmd = &cobra.Command{
	Use:   "process",
	Short: "アイテム処理のデモ",
	Long:  "複数のアイテムを処理するデモコマンドです。",
	Run: func(cmd *cobra.Command, args []string) {
		items, _ := cmd.Flags().GetStringSlice("items")
		verbose, _ := cmd.Flags().GetBool("verbose")
		
		if len(items) == 0 {
			items = []string{"item1", "item2", "item3"}
		}

		fmt.Printf("Processing %d items...\n", len(items))
		
		for i, item := range items {
			if verbose {
				fmt.Printf("  Processing: %s\n", item)
			}
			time.Sleep(100 * time.Millisecond)
			fmt.Printf("  [%d/%d] Completed: %s\n", i+1, len(items), item)
		}
		
		fmt.Println("✓ All items processed!")
	},
}

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "設定管理",
	Long:  "アプリケーションの設定を管理するためのコマンドです。",
}

var configGetCmd = &cobra.Command{
	Use:   "get <key>",
	Short: "設定値を取得",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		key := args[0]
		global, _ := cmd.Flags().GetBool("global")
		
		scope := "local"
		if global {
			scope = "global"
		}
		
		// デモ用の設定値
		configs := map[string]string{
			"theme":   "dark",
			"debug":   "false",
			"timeout": "30",
		}
		
		fmt.Printf("Configuration [%s]:\n", scope)
		if value, exists := configs[key]; exists {
			fmt.Printf("  %s: %s\n", key, value)
		} else {
			fmt.Printf("  %s: not found\n", key)
		}
	},
}

var configSetCmd = &cobra.Command{
	Use:   "set <key> <value>",
	Short: "設定値を設定",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		key := args[0]
		value := args[1]
		global, _ := cmd.Flags().GetBool("global")
		
		scope := "local"
		if global {
			scope = "global"
		}
		
		fmt.Printf("Configuration [%s]:\n", scope)
		fmt.Printf("  Setting %s = %s\n", key, value)
		fmt.Println("✓ Configuration updated!")
	},
}

var infoCmd = &cobra.Command{
	Use:   "info",
	Short: "システム情報を表示",
	Run: func(cmd *cobra.Command, args []string) {
		format, _ := cmd.Flags().GetString("format")
		
		info := map[string]string{
			"Library":   "Cobra",
			"Version":   "1.6+",
			"Language":  "Go",
			"Features":  "Subcommands, Flags, POSIX compliant",
			"Timestamp": time.Now().Format(time.RFC3339),
		}
		
		switch format {
		case "json":
			fmt.Println("{")
			i := 0
			for key, value := range info {
				comma := ","
				if i == len(info)-1 {
					comma = ""
				}
				fmt.Printf("  \"%s\": \"%s\"%s\n", key, value, comma)
				i++
			}
			fmt.Println("}")
		default:
			fmt.Println("System Information:")
			for key, value := range info {
				fmt.Printf("  %s: %s\n", key, value)
			}
		}
	},
}

func getStringOrDefault(value, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}

func getIntOrDefault(value int, defaultValue string) string {
	if value == 0 {
		return defaultValue
	}
	return strconv.Itoa(value)
}

func init() {
	// Hello command flags
	helloCmd.Flags().IntP("count", "c", 1, "挨拶を繰り返す回数")
	helloCmd.Flags().BoolP("shout", "s", false, "大声で挨拶する")

	// Create user command flags
	createUserCmd.Flags().StringP("email", "e", "", "メールアドレス")
	createUserCmd.Flags().IntP("age", "a", 0, "年齢")
	createUserCmd.Flags().Bool("active", true, "アクティブ状態")

	// Deploy command flags
	deployCmd.Flags().StringP("env", "e", "development", "環境を指定")
	deployCmd.Flags().BoolP("force", "f", false, "強制実行")
	deployCmd.Flags().Bool("dry-run", false, "ドライランモード")
	deployCmd.Flags().StringP("config", "c", "", "設定ファイルのパス")

	// File create command flags
	fileCreateCmd.Flags().StringP("content", "c", "", "ファイルの内容")

	// Process command flags
	processCmd.Flags().StringSliceP("items", "i", []string{}, "処理するアイテム")
	processCmd.Flags().BoolP("verbose", "v", false, "詳細な出力を表示")

	// Config command flags
	configGetCmd.Flags().BoolP("global", "g", false, "グローバル設定を使用")
	configSetCmd.Flags().BoolP("global", "g", false, "グローバル設定を使用")

	// Info command flags
	infoCmd.Flags().StringP("format", "f", "table", "出力フォーマット (json|table)")

	// Add subcommands to file command
	fileCmd.AddCommand(fileCreateCmd, fileReadCmd)
	
	// Add subcommands to config command
	configCmd.AddCommand(configGetCmd, configSetCmd)

	// Add all commands to root
	rootCmd.AddCommand(helloCmd, createUserCmd, deployCmd, fileCmd, processCmd, configCmd, infoCmd)
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}