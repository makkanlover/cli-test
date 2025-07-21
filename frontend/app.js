class CLIComparisonApp {
    constructor() {
        this.socket = null;
        this.terminal = null;
        this.fitAddon = null;
        this.currentLibrary = null;
        this.libraries = [];
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoading();
            await this.loadLibraries();
            this.setupEventListeners();
            this.initializeSocket();
            this.renderLibraryGrid();
            this.hideLoading();
        } catch (error) {
            this.showError('初期化エラー: ' + error.message);
            this.hideLoading();
        }
    }
    
    async loadLibraries() {
        try {
            const response = await fetch('/api/libraries');
            if (!response.ok) {
                throw new Error('ライブラリデータの取得に失敗しました');
            }
            this.libraries = await response.json();
        } catch (error) {
            throw new Error('ライブラリデータの読み込みに失敗: ' + error.message);
        }
    }
    
    initializeSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });
        
        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });
        
        this.socket.on('command-result', (result) => {
            this.handleCommandResult(result);
        });
        
        this.socket.on('library-selected', (result) => {
            if (!result.success) {
                this.showError('ライブラリ選択エラー: ' + result.error);
            }
        });
        
        this.socket.on('error', (error) => {
            this.showError('通信エラー: ' + error);
        });
    }
    
    setupEventListeners() {
        // メインメニューイベント
        document.getElementById('screenshots-btn').addEventListener('click', () => {
            this.showScreen('gallery-screen');
            this.loadScreenshots();
        });
        
        document.getElementById('help-btn').addEventListener('click', () => {
            this.showScreen('help-screen');
        });
        
        // ターミナルイベント
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.backToMenu();
        });
        
        document.getElementById('clear-terminal').addEventListener('click', () => {
            if (this.terminal) {
                this.terminal.clear();
            }
        });
        
        // ギャラリーイベント
        document.getElementById('back-from-gallery').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
        
        // ヘルプイベント
        document.getElementById('back-from-help').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
        
        // エラーモーダルイベント
        document.getElementById('close-error').addEventListener('click', () => {
            this.hideError();
        });
        
        // ウィンドウリサイズイベント
        window.addEventListener('resize', () => {
            if (this.terminal && this.fitAddon) {
                this.fitAddon.fit();
            }
        });
    }
    
    renderLibraryGrid() {
        const grid = document.querySelector('.library-grid');
        grid.innerHTML = '';
        
        this.libraries.forEach(library => {
            const card = this.createLibraryCard(library);
            grid.appendChild(card);
        });
    }
    
    createLibraryCard(library) {
        const card = document.createElement('div');
        card.className = 'library-card';
        card.addEventListener('click', () => this.selectLibrary(library));
        
        const features = library.features.slice(0, 3).map(feature => 
            `<li>${feature}</li>`
        ).join('');
        
        card.innerHTML = `
            <div class="language-tag">${library.language}</div>
            <h3 class="library-name">${library.name}</h3>
            <p class="library-description">${library.description}</p>
            <ul class="library-features">
                ${features}
                ${library.features.length > 3 ? '<li>その他の機能...</li>' : ''}
            </ul>
        `;
        
        return card;
    }
    
    async selectLibrary(library) {
        try {
            this.showLoading();
            this.currentLibrary = library;
            
            // バックエンドにライブラリ選択を通知
            const response = await fetch('/api/select-library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ libraryId: library.id })
            });
            
            if (!response.ok) {
                throw new Error('ライブラリ選択に失敗しました');
            }
            
            await this.setupTerminalScreen(library);
            this.showScreen('terminal-screen');
            this.hideLoading();
        } catch (error) {
            this.showError('ライブラリ選択エラー: ' + error.message);
            this.hideLoading();
        }
    }
    
    async setupTerminalScreen(library) {
        // ライブラリ情報の表示
        document.getElementById('current-library-name').textContent = library.name;
        document.getElementById('library-info-name').textContent = library.name;
        document.getElementById('library-info-description').textContent = library.description;
        
        // 特徴の表示
        const featuresList = document.getElementById('library-features-list');
        featuresList.innerHTML = '';
        library.features.forEach(feature => {
            const tag = document.createElement('span');
            tag.className = 'feature-tag';
            tag.textContent = feature;
            featuresList.appendChild(tag);
        });
        
        // サンプルコマンドの表示
        const commandsList = document.getElementById('sample-commands-list');
        commandsList.innerHTML = '';
        library.sampleCommands.forEach(command => {
            const tag = document.createElement('span');
            tag.className = 'command-tag';
            tag.textContent = command;
            tag.addEventListener('click', () => {
                if (this.terminal) {
                    this.terminal.write(command);
                }
            });
            commandsList.appendChild(tag);
        });
        
        // ターミナルの初期化
        this.initializeTerminal();
    }
    
    initializeTerminal() {
        const terminalElement = document.getElementById('terminal');
        terminalElement.innerHTML = '';
        
        // xterm.js の初期化
        this.terminal = new Terminal({
            fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
            fontSize: 14,
            theme: {
                background: '#000000',
                foreground: '#ffffff',
                cursor: '#ffffff',
                black: '#000000',
                red: '#cd3131',
                green: '#0dbc79',
                yellow: '#e5e510',
                blue: '#2472c8',
                magenta: '#bc3fbc',
                cyan: '#11a8cd',
                white: '#e5e5e5',
                brightBlack: '#666666',
                brightRed: '#f14c4c',
                brightGreen: '#23d18b',
                brightYellow: '#f5f543',
                brightBlue: '#3b8eea',
                brightMagenta: '#d670d6',
                brightCyan: '#29b8db',
                brightWhite: '#e5e5e5'
            },
            cursorBlink: true,
            allowTransparency: false
        });
        
        // FitAddon の初期化
        this.fitAddon = new FitAddon.FitAddon();
        this.terminal.loadAddon(this.fitAddon);
        
        // ターミナルをDOMに接続
        this.terminal.open(terminalElement);
        this.fitAddon.fit();
        
        // ウェルカムメッセージ
        this.terminal.writeln(`\\x1b[1;32m*** ${this.currentLibrary.name} CLI Demo ***\\x1b[0m`);
        this.terminal.writeln(`\\x1b[36m${this.currentLibrary.description}\\x1b[0m`);
        this.terminal.writeln('');
        this.terminal.writeln('\\x1b[33mTips:\\x1b[0m');
        this.terminal.writeln('  - Type "--help" for available commands');
        this.terminal.writeln('  - Click sample commands above to try them');
        this.terminal.writeln('  - Use Ctrl+C to cancel running commands');
        this.terminal.writeln('');
        
        // 入力処理の設定
        let currentLine = '';
        let cursorPosition = 0;
        
        const prompt = `\\x1b[1;34m${this.currentLibrary.name.toLowerCase()}\\x1b[0m$ `;
        
        const writePrompt = () => {
            this.terminal.write('\\r\\x1b[K' + prompt);
        };
        
        writePrompt();
        
        this.terminal.onKey(({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.altGraphKey && !domEvent.ctrlKey && !domEvent.metaKey;
            
            if (domEvent.keyCode === 13) { // Enter
                this.terminal.write('\\r\\n');
                if (currentLine.trim()) {
                    this.executeCommand(currentLine.trim());
                }
                currentLine = '';
                cursorPosition = 0;
                writePrompt();
            } else if (domEvent.keyCode === 8) { // Backspace
                if (cursorPosition > 0) {
                    currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition);
                    cursorPosition--;
                    this.terminal.write('\\b \\b');
                }
            } else if (domEvent.keyCode === 46) { // Delete
                if (cursorPosition < currentLine.length) {
                    currentLine = currentLine.slice(0, cursorPosition) + currentLine.slice(cursorPosition + 1);
                    this.terminal.write('\\x1b[1P');
                }
            } else if (domEvent.keyCode === 37) { // Left arrow
                if (cursorPosition > 0) {
                    cursorPosition--;
                    this.terminal.write('\\x1b[D');
                }
            } else if (domEvent.keyCode === 39) { // Right arrow
                if (cursorPosition < currentLine.length) {
                    cursorPosition++;
                    this.terminal.write('\\x1b[C');
                }
            } else if (domEvent.keyCode === 36) { // Home
                while (cursorPosition > 0) {
                    cursorPosition--;
                    this.terminal.write('\\x1b[D');
                }
            } else if (domEvent.keyCode === 35) { // End
                while (cursorPosition < currentLine.length) {
                    cursorPosition++;
                    this.terminal.write('\\x1b[C');
                }
            } else if (printable) {
                currentLine = currentLine.slice(0, cursorPosition) + key + currentLine.slice(cursorPosition);
                cursorPosition++;
                this.terminal.write(key);
            }
        });
    }
    
    async executeCommand(command) {
        try {
            // ローカル処理のコマンド
            if (command === 'clear') {
                this.terminal.clear();
                return;
            }
            
            if (command === 'exit') {
                this.backToMenu();
                return;
            }
            
            // バックエンドにコマンド送信
            const response = await fetch('/api/execute-command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command })
            });
            
            const result = await response.json();
            this.handleCommandResult(result);
            
        } catch (error) {
            this.terminal.writeln(`\\x1b[1;31mError: ${error.message}\\x1b[0m`);
        }
    }
    
    handleCommandResult(result) {
        if (result.success) {
            if (result.output) {
                const lines = result.output.split('\\n');
                lines.forEach(line => {
                    this.terminal.writeln(line);
                });
            }
            if (result.error && result.error.trim()) {
                this.terminal.writeln(`\\x1b[1;33m${result.error}\\x1b[0m`);
            }
        } else {
            this.terminal.writeln(`\\x1b[1;31mError: ${result.error}\\x1b[0m`);
            if (result.suggestion) {
                this.terminal.writeln(`\\x1b[1;36mSuggestion: ${result.suggestion}\\x1b[0m`);
            }
        }
    }
    
    async loadScreenshots() {
        try {
            const response = await fetch('/api/screenshots');
            const screenshots = await response.json();
            
            const gallery = document.querySelector('.gallery-grid');
            gallery.innerHTML = '';
            
            if (screenshots.length === 0) {
                gallery.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">スクリーンショットはまだありません。</p>';
                return;
            }
            
            screenshots.forEach(screenshot => {
                const item = document.createElement('div');
                item.className = 'screenshot-item';
                
                if (screenshot.isPlaceholder) {
                    // For text placeholders, show a styled preview
                    item.innerHTML = `
                        <div class="placeholder-preview">
                            <div class="placeholder-terminal">
                                <div class="placeholder-header">
                                    <span class="placeholder-title">${screenshot.library} CLI</span>
                                </div>
                                <div class="placeholder-content">
                                    <div class="placeholder-prompt">$ ${screenshot.library} --help</div>
                                    <div class="placeholder-output">Usage: ${screenshot.library} [options] [command]</div>
                                    <div class="placeholder-output">Options:</div>
                                    <div class="placeholder-output">  -h, --help     Show help</div>
                                </div>
                            </div>
                        </div>
                        <div class="screenshot-info">
                            <div class="screenshot-title">${screenshot.library}</div>
                            <div class="screenshot-description">${screenshot.description}</div>
                            <div class="placeholder-badge">Preview</div>
                        </div>
                    `;
                } else {
                    // For actual images
                    item.innerHTML = `
                        <img src="${screenshot.path}" alt="${screenshot.library} screenshot" loading="lazy" />
                        <div class="screenshot-info">
                            <div class="screenshot-title">${screenshot.library}</div>
                            <div class="screenshot-description">${screenshot.description}</div>
                        </div>
                    `;
                }
                
                gallery.appendChild(item);
            });
            
        } catch (error) {
            console.error('Screenshots loading error:', error);
            const gallery = document.querySelector('.gallery-grid');
            gallery.innerHTML = '<p style="text-align: center; color: var(--danger-color);">スクリーンショットの読み込みに失敗しました。</p>';
        }
    }
    
    backToMenu() {
        if (this.terminal) {
            this.terminal.dispose();
            this.terminal = null;
            this.fitAddon = null;
        }
        this.currentLibrary = null;
        this.showScreen('menu-screen');
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
    
    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-modal').classList.remove('hidden');
    }
    
    hideError() {
        document.getElementById('error-modal').classList.add('hidden');
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CLIComparisonApp();
});

// サービスワーカーの登録（オフライン対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}