const fs = require('fs');
const path = require('path');

class ScreenshotManager {
    constructor() {
        this.screenshotDir = path.join(__dirname, '../sample/photos');
        this.ensureDirectoryExists();
        this.initializePlaceholderScreenshots();
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    initializePlaceholderScreenshots() {
        const libraries = [
            'click', 'typer', 'fire',
            'commander-js', 'yargs', 'inquirer-js',
            'cobra', 'clap', 'thor', 'option-parser'
        ];

        libraries.forEach(lib => {
            const screenshotPath = path.join(this.screenshotDir, `${lib}.png`);
            if (!fs.existsSync(screenshotPath)) {
                this.createPlaceholderScreenshot(lib, screenshotPath);
            }
        });
    }

    createPlaceholderScreenshot(libraryName, outputPath) {
        // SVG placeholder screenshot
        const svgContent = this.generatePlaceholderSVG(libraryName);
        
        // For now, create a simple text file as placeholder
        // In a real implementation, you would convert SVG to PNG
        const placeholderContent = `${libraryName.toUpperCase()} CLI Screenshot Placeholder
        
This is a placeholder for the ${libraryName} CLI library screenshot.
To capture real screenshots, you would typically use tools like:
- Puppeteer with a headless browser
- Playwright for cross-browser screenshots  
- Terminal screenshot tools like 'script' or 'asciinema'

Generated: ${new Date().toISOString()}
`;

        try {
            fs.writeFileSync(outputPath.replace('.png', '.txt'), placeholderContent);
            console.log(`Created placeholder screenshot for ${libraryName}`);
        } catch (error) {
            console.error(`Error creating placeholder for ${libraryName}:`, error.message);
        }
    }

    generatePlaceholderSVG(libraryName) {
        const colors = {
            'click': '#2E8B57',
            'typer': '#FF6347', 
            'fire': '#FF4500',
            'commander-js': '#32CD32',
            'yargs': '#1E90FF',
            'inquirer-js': '#9370DB',
            'cobra': '#00CED1',
            'clap': '#FF69B4',
            'thor': '#DC143C',
            'option-parser': '#DAA520'
        };

        const color = colors[libraryName] || '#666666';
        
        return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="300" fill="#1a1a1a"/>
            <rect x="10" y="10" width="380" height="280" fill="#2d2d2d" stroke="#404040" stroke-width="2" rx="8"/>
            <rect x="20" y="20" width="360" height="30" fill="#404040" rx="4"/>
            <circle cx="35" cy="35" r="6" fill="#ff5f56"/>
            <circle cx="55" cy="35" r="6" fill="#ffbd2e"/>
            <circle cx="75" cy="35" r="6" fill="#27ca3f"/>
            <text x="200" y="40" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="14">${libraryName} CLI</text>
            
            <text x="30" y="80" fill="${color}" font-family="monospace" font-size="14" font-weight="bold">${libraryName.toUpperCase()} DEMO</text>
            <text x="30" y="110" fill="#00ff00" font-family="monospace" font-size="12">$ ${libraryName} --help</text>
            <text x="30" y="130" fill="#ffffff" font-family="monospace" font-size="11">Usage: ${libraryName} [options] [command]</text>
            <text x="30" y="150" fill="#ffffff" font-family="monospace" font-size="11">Options:</text>
            <text x="40" y="170" fill="#cccccc" font-family="monospace" font-size="10">  -h, --help     Show help</text>
            <text x="40" y="185" fill="#cccccc" font-family="monospace" font-size="10">  -v, --version  Show version</text>
            <text x="30" y="210" fill="#ffffff" font-family="monospace" font-size="11">Commands:</text>
            <text x="40" y="230" fill="#cccccc" font-family="monospace" font-size="10">  hello          Basic greeting</text>
            <text x="40" y="245" fill="#cccccc" font-family="monospace" font-size="10">  info           Show information</text>
            <text x="30" y="270" fill="#00ff00" font-family="monospace" font-size="12">$ _</text>
        </svg>`;
    }

    getScreenshots() {
        try {
            const files = fs.readdirSync(this.screenshotDir);
            return files
                .filter(file => file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.txt'))
                .map(file => {
                    const libraryName = path.parse(file).name;
                    const isPlaceholder = file.endsWith('.txt');
                    const isGenerated = file.endsWith('.svg');
                    
                    return {
                        library: libraryName,
                        filename: file,
                        path: `/sample/photos/${file}`,
                        description: `${libraryName} CLI interface${isPlaceholder ? ' (placeholder)' : isGenerated ? ' (generated)' : ''}`,
                        timestamp: fs.statSync(path.join(this.screenshotDir, file)).mtime,
                        isPlaceholder: isPlaceholder,
                        type: file.split('.').pop()
                    };
                })
                .sort((a, b) => a.library.localeCompare(b.library));
        } catch (error) {
            console.error('Error reading screenshots:', error.message);
            return [];
        }
    }

    async captureScreenshot(libraryName, url) {
        console.log(`Screenshot capture requested for ${libraryName} at ${url}`);
        
        try {
            // Try to use Puppeteer if available
            const puppeteer = require('puppeteer');
            return await this.capturePuppeteerScreenshot(libraryName, url, puppeteer);
        } catch (error) {
            console.warn('Puppeteer not available, generating HTML-based screenshot:', error.message);
            return await this.generateHTMLScreenshot(libraryName);
        }
    }

    async generateHTMLScreenshot(libraryName) {
        try {
            // Generate terminal-style screenshot using HTML to SVG conversion
            const svgContent = this.generateTerminalSVG(libraryName);
            const screenshotPath = path.join(this.screenshotDir, `${libraryName}.svg`);
            
            fs.writeFileSync(screenshotPath, svgContent);
            
            console.log(`HTML-based screenshot generated for ${libraryName}: ${screenshotPath}`);
            
            return {
                success: true,
                message: `HTML-based screenshot generated for ${libraryName}`,
                path: screenshotPath,
                placeholder: false,
                type: 'svg'
            };
            
        } catch (error) {
            console.error(`Error generating HTML screenshot for ${libraryName}:`, error.message);
            return {
                success: false,
                message: `Failed to generate screenshot: ${error.message}`,
                placeholder: true
            };
        }
    }

    async capturePuppeteerScreenshot(libraryName, url, puppeteer) {
        let browser = null;
        
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            const page = await browser.newPage();
            await page.setViewport({ width: 1200, height: 800 });
            
            // Navigate to the URL or generate HTML for terminal
            if (url) {
                await page.goto(url, { waitUntil: 'networkidle0' });
            } else {
                // Generate HTML content for the library
                const htmlContent = this.generateScreenshotHTML(libraryName);
                await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            }
            
            // Take screenshot
            const screenshotPath = path.join(this.screenshotDir, `${libraryName}.png`);
            await page.screenshot({ 
                path: screenshotPath,
                fullPage: false,
                clip: { x: 0, y: 0, width: 800, height: 600 }
            });
            
            console.log(`Real screenshot captured for ${libraryName}: ${screenshotPath}`);
            
            return {
                success: true,
                message: `Screenshot captured for ${libraryName}`,
                path: screenshotPath,
                placeholder: false
            };
            
        } catch (error) {
            console.error(`Error capturing screenshot for ${libraryName}:`, error.message);
            return {
                success: false,
                message: `Failed to capture screenshot: ${error.message}`,
                placeholder: true
            };
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    generateTerminalSVG(libraryName) {
        const colors = {
            'click': '#2E8B57',
            'typer': '#FF6347', 
            'fire': '#FF4500',
            'commander-js': '#32CD32',
            'yargs': '#1E90FF',
            'inquirer-js': '#9370DB',
            'cobra': '#00CED1',
            'clap': '#FF69B4',
            'thor': '#DC143C',
            'option-parser': '#DAA520'
        };

        const color = colors[libraryName] || '#00ff00';
        
        // Generate library-specific commands and outputs
        const libraryExamples = {
            'click': {
                commands: ['click --help', 'click hello --name Claude', 'click process --verbose'],
                outputs: ['Usage: click [OPTIONS] COMMAND [ARGS]...', 'Hello, Claude!', '✓ Processing complete!']
            },
            'typer': {
                commands: ['typer --help', 'typer hello --name Claude', 'typer create-user John --age 25'],
                outputs: ['Usage: typer [OPTIONS] COMMAND [ARGS]...', 'Hello, Claude! 🎉', '✅ User created successfully!']
            },
            'commander-js': {
                commands: ['commander-demo --help', 'commander-demo hello --name Claude', 'commander-demo info'],
                outputs: ['Usage: commander-demo [options] [command]', 'Hello, Claude!', 'Library: Commander.js']
            },
            'yargs': {
                commands: ['yargs-demo --help', 'yargs-demo hello --name Claude', 'yargs-demo serve --port 8080'],
                outputs: ['yargs-demo <command>', 'Hello, Claude!', 'Starting server on http://localhost:8080...']
            },
            'inquirer-js': {
                commands: ['inquirer-js', 'What\'s your name? Claude', 'Hello Claude! ✅'],
                outputs: ['Interactive Demo', '? What\'s your name? Claude', '✅ Hello Claude!']
            },
            'cobra': {
                commands: ['cobra-demo --help', 'cobra-demo hello --name Claude', 'cobra-demo info'],
                outputs: ['Cobra CLI デモアプリケーション', 'Hello, Claude!', 'Library: Cobra (Go)']
            },
            'clap': {
                commands: ['clap-demo --help', 'clap-demo hello --name Claude', 'clap-demo info --format json'],
                outputs: ['Clap CLI デモアプリケーション', 'Hello, Claude!', '{"library": "Clap", "language": "Rust"}']
            },
            'thor': {
                commands: ['thor help', 'thor hello --name Claude', 'thor info'],
                outputs: ['Thor CLI デモアプリケーション', 'Hello, Claude!', 'Library: Thor (Ruby)']
            }
        };

        const example = libraryExamples[libraryName] || {
            commands: [`${libraryName} --help`, `${libraryName} hello`, `${libraryName} info`],
            outputs: [`Usage: ${libraryName} [options] [command]`, 'Hello, World!', `Library: ${libraryName}`]
        };

        return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="terminalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0d0d0d;stop-opacity:1" />
                </linearGradient>
            </defs>
            
            <!-- Background -->
            <rect width="800" height="600" fill="url(#terminalGradient)"/>
            
            <!-- Terminal window -->
            <rect x="20" y="20" width="760" height="560" fill="#000" stroke="#404040" stroke-width="2" rx="12"/>
            
            <!-- Title bar -->
            <rect x="20" y="20" width="760" height="40" fill="#2d2d2d" rx="12"/>
            <rect x="20" y="40" width="760" height="20" fill="#2d2d2d"/>
            
            <!-- Window controls -->
            <circle cx="45" cy="40" r="8" fill="#ff5f56"/>
            <circle cx="70" cy="40" r="8" fill="#ffbd2e"/>
            <circle cx="95" cy="40" r="8" fill="#27ca3f"/>
            
            <!-- Title text -->
            <text x="400" y="45" text-anchor="middle" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="14" font-weight="500">
                ${libraryName} CLI Demo Terminal
            </text>
            
            <!-- Terminal content -->
            <g font-family="JetBrains Mono, monospace" font-size="14">
                <!-- First command -->
                <text x="40" y="100" fill="${color}" font-weight="600">$</text>
                <text x="60" y="100" fill="#ffff88">${example.commands[0]}</text>
                <text x="40" y="125" fill="#ffffff">${example.outputs[0]}</text>
                <text x="40" y="145" fill="#cccccc">Commands:</text>
                <text x="60" y="165" fill="#cccccc">  hello     Basic greeting command</text>
                <text x="60" y="185" fill="#cccccc">  info      Show library information</text>
                <text x="60" y="205" fill="#cccccc">  --help    Show this help message</text>
                
                <!-- Second command -->
                <text x="40" y="250" fill="${color}" font-weight="600">$</text>
                <text x="60" y="250" fill="#ffff88">${example.commands[1]}</text>
                <text x="40" y="275" fill="#00ff88" font-weight="500">${example.outputs[1]}</text>
                
                <!-- Third command -->
                <text x="40" y="320" fill="${color}" font-weight="600">$</text>
                <text x="60" y="320" fill="#ffff88">${example.commands[2]}</text>
                <text x="40" y="345" fill="#88ccff">${example.outputs[2]}</text>
                
                <!-- Library badge -->
                <rect x="40" y="380" width="200" height="60" fill="#1a1a1a" stroke="${color}" stroke-width="2" rx="8"/>
                <text x="140" y="400" text-anchor="middle" fill="${color}" font-size="12" font-weight="600">
                    ${libraryName.toUpperCase()}
                </text>
                <text x="140" y="420" text-anchor="middle" fill="#ffffff" font-size="11">
                    CLI Library Demo
                </text>
                
                <!-- Cursor -->
                <text x="40" y="480" fill="${color}" font-weight="600">$</text>
                <rect x="58" y="468" width="10" height="16" fill="${color}" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite"/>
                </rect>
                
                <!-- Footer -->
                <text x="400" y="550" text-anchor="middle" fill="#666666" font-size="10">
                    CLI Library Comparison Tool - Interactive Terminal Demo
                </text>
            </g>
        </svg>`;
    }

    generateScreenshotHTML(libraryName) {
        const colors = {
            'click': '#2E8B57',
            'typer': '#FF6347', 
            'fire': '#FF4500',
            'commander-js': '#32CD32',
            'yargs': '#1E90FF',
            'inquirer-js': '#9370DB',
            'cobra': '#00CED1',
            'clap': '#FF69B4',
            'thor': '#DC143C',
            'option-parser': '#DAA520'
        };

        const color = colors[libraryName] || '#00ff00';
        
        // Generate library-specific commands and outputs
        const libraryExamples = {
            'click': {
                commands: ['click --help', 'click hello --name Claude', 'click process --verbose'],
                outputs: ['Usage: click [OPTIONS] COMMAND [ARGS]...', 'Hello, Claude!', 'Processing items...']
            },
            'typer': {
                commands: ['typer --help', 'typer hello --name Claude', 'typer create-user John --age 25'],
                outputs: ['Usage: typer [OPTIONS] COMMAND [ARGS]...', 'Hello, Claude!', '✓ User created successfully!']
            },
            'commander-js': {
                commands: ['commander-demo --help', 'commander-demo hello --name Claude', 'commander-demo info'],
                outputs: ['Usage: commander-demo [options] [command]', 'Hello, Claude!', 'Library: Commander.js']
            },
            'yargs': {
                commands: ['yargs-demo --help', 'yargs-demo hello --name Claude', 'yargs-demo serve --port 8080'],
                outputs: ['yargs-demo <command>', 'Hello, Claude!', 'Starting server on http://localhost:8080...']
            },
            'inquirer-js': {
                commands: ['inquirer-js', 'What\'s your name? Claude', 'Hello Claude!'],
                outputs: ['Interactive Demo', '? What\'s your name? Claude', 'Hello Claude! ✓']
            },
            'cobra': {
                commands: ['cobra-demo --help', 'cobra-demo hello --name Claude', 'cobra-demo info'],
                outputs: ['Cobra CLI デモアプリケーション', 'Hello, Claude!', 'Library: Cobra']
            },
            'clap': {
                commands: ['clap-demo --help', 'clap-demo hello --name Claude', 'clap-demo info --format json'],
                outputs: ['Clap CLI デモアプリケーション', 'Hello, Claude!', '{"Library": "Clap"}']
            },
            'thor': {
                commands: ['thor help', 'thor hello --name Claude', 'thor info'],
                outputs: ['Thor CLI デモアプリケーション', 'Hello, Claude!', 'Library: Thor']
            }
        };

        const example = libraryExamples[libraryName] || {
            commands: [`${libraryName} --help`, `${libraryName} hello`, `${libraryName} info`],
            outputs: [`Usage: ${libraryName} [options] [command]`, 'Hello, World!', `Library: ${libraryName}`]
        };

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${libraryName} CLI Demo</title>
            <style>
                body { 
                    background: #1a1a1a; 
                    color: #ffffff; 
                    font-family: 'JetBrains Mono', 'Courier New', monospace; 
                    padding: 20px;
                    margin: 0;
                }
                .terminal {
                    background: #000;
                    border: 2px solid #404040;
                    border-radius: 8px;
                    padding: 20px;
                    max-width: 760px;
                    margin: 20px auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }
                .terminal-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #333;
                }
                .terminal-controls {
                    display: flex;
                    gap: 8px;
                }
                .control-btn {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                .control-btn.close { background: #ff5f56; }
                .control-btn.minimize { background: #ffbd2e; }
                .control-btn.maximize { background: #27ca3f; }
                .terminal-title {
                    flex: 1;
                    text-align: center;
                    font-size: 14px;
                    color: #ccc;
                }
                .prompt { color: ${color}; font-weight: bold; }
                .output { color: #ffffff; margin: 4px 0 8px 20px; line-height: 1.4; }
                .command { color: #ffff00; }
                .success { color: #00ff00; }
                .info { color: #00bfff; }
                .line { margin: 4px 0; }
            </style>
        </head>
        <body>
            <div class="terminal">
                <div class="terminal-header">
                    <div class="terminal-controls">
                        <div class="control-btn close"></div>
                        <div class="control-btn minimize"></div>
                        <div class="control-btn maximize"></div>
                    </div>
                    <div class="terminal-title">${libraryName} CLI Demo</div>
                </div>
                
                <div class="line">
                    <span class="prompt">$</span> 
                    <span class="command">${example.commands[0]}</span>
                </div>
                <div class="output">${example.outputs[0]}</div>
                <div class="output">Commands:</div>
                <div class="output">  hello     Basic greeting command</div>
                <div class="output">  info      Show library information</div>
                
                <div class="line">
                    <span class="prompt">$</span> 
                    <span class="command">${example.commands[1]}</span>
                </div>
                <div class="output success">${example.outputs[1]}</div>
                
                <div class="line">
                    <span class="prompt">$</span> 
                    <span class="command">${example.commands[2]}</span>
                </div>
                <div class="output info">${example.outputs[2]}</div>
                
                <div class="line">
                    <span class="prompt">$</span> 
                    <span class="command">_</span>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    cleanup() {
        // Cleanup any temporary files if needed
        console.log('Screenshot manager cleanup completed');
    }
}

module.exports = ScreenshotManager;