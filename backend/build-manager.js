const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class BuildManager {
    constructor() {
        this.buildDir = path.join(__dirname, '../samples');
        this.buildCache = new Map();
        this.buildStatus = new Map();
        
        // Initialize build status for all compiled languages
        this.buildStatus.set('cobra', { built: false, lastBuild: null, error: null });
        this.buildStatus.set('clap', { built: false, lastBuild: null, error: null });
    }

    async buildAll() {
        logger.info('Starting build process for all compiled languages');
        
        const results = {
            cobra: await this.buildGo(),
            clap: await this.buildRust()
        };

        const successCount = Object.values(results).filter(r => r.success).length;
        logger.info(`Build process completed: ${successCount}/2 successful builds`);
        
        return results;
    }

    async buildGo() {
        const projectPath = path.join(this.buildDir, 'cobra');
        const executablePath = path.join(projectPath, 'app.exe');
        
        logger.info('Building Go (Cobra) project', { projectPath });
        
        try {
            // Check if Go is available
            const goVersion = await this.runCommand('go', ['version'], { timeout: 5000 });
            logger.debug('Go version detected', { version: goVersion.stdout });

            // Initialize go module if go.mod doesn't exist
            const goModPath = path.join(projectPath, 'go.mod');
            if (!fs.existsSync(goModPath)) {
                logger.warn('go.mod not found, initializing module');
                await this.runCommand('go', ['mod', 'init', 'cobra-demo'], { 
                    cwd: projectPath,
                    timeout: 10000 
                });
            }

            // Download dependencies
            logger.info('Downloading Go dependencies');
            await this.runCommand('go', ['mod', 'tidy'], { 
                cwd: projectPath,
                timeout: 30000 
            });

            // Build the application
            logger.info('Building Go application');
            const buildResult = await this.runCommand('go', ['build', '-o', 'app.exe', 'main.go'], {
                cwd: projectPath,
                timeout: 60000
            });

            // Verify executable was created
            if (fs.existsSync(executablePath)) {
                this.buildStatus.set('cobra', {
                    built: true,
                    lastBuild: new Date(),
                    error: null,
                    executablePath
                });
                
                logger.info('Go build completed successfully', { executablePath });
                return { success: true, message: 'Go build completed', executablePath };
            } else {
                throw new Error('Executable not created after build');
            }

        } catch (error) {
            logger.error('Go build failed', { error: error.message, projectPath });
            
            this.buildStatus.set('cobra', {
                built: false,
                lastBuild: null,
                error: error.message
            });

            return { 
                success: false, 
                error: error.message,
                fallback: 'Using Go source execution (slower but functional)'
            };
        }
    }

    async buildRust() {
        const projectPath = path.join(this.buildDir, 'clap');
        const executablePath = path.join(projectPath, 'target', 'release', 'app.exe');
        const targetExePath = path.join(projectPath, 'app.exe');
        
        logger.info('Building Rust (Clap) project', { projectPath });
        
        try {
            // Check if Rust is available
            const rustVersion = await this.runCommand('rustc', ['--version'], { timeout: 5000 });
            logger.debug('Rust version detected', { version: rustVersion.stdout });

            // Check if Cargo is available
            const cargoVersion = await this.runCommand('cargo', ['--version'], { timeout: 5000 });
            logger.debug('Cargo version detected', { version: cargoVersion.stdout });

            // Build the application
            logger.info('Building Rust application (release mode)');
            const buildResult = await this.runCommand('cargo', ['build', '--release'], {
                cwd: projectPath,
                timeout: 120000 // Rust builds can take longer
            });

            // Copy executable to project root for easier access
            if (fs.existsSync(executablePath)) {
                fs.copyFileSync(executablePath, targetExePath);
                
                this.buildStatus.set('clap', {
                    built: true,
                    lastBuild: new Date(),
                    error: null,
                    executablePath: targetExePath
                });
                
                logger.info('Rust build completed successfully', { executablePath: targetExePath });
                return { success: true, message: 'Rust build completed', executablePath: targetExePath };
            } else {
                throw new Error('Executable not created after build');
            }

        } catch (error) {
            logger.error('Rust build failed', { error: error.message, projectPath });
            
            this.buildStatus.set('clap', {
                built: false,
                lastBuild: null,
                error: error.message
            });

            return { 
                success: false, 
                error: error.message,
                fallback: 'Using Rust source execution (requires cargo run)'
            };
        }
    }

    async runCommand(command, args, options = {}) {
        const { cwd, timeout = 30000 } = options;
        
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd: cwd || process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
                } else {
                    reject(new Error(stderr || `Process exited with code ${code}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });

            // Set timeout
            setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error(`Command timeout after ${timeout}ms`));
            }, timeout);
        });
    }

    getBuildStatus(language) {
        if (language === 'go' || language === 'cobra') {
            return this.buildStatus.get('cobra');
        } else if (language === 'rust' || language === 'clap') {
            return this.buildStatus.get('clap');
        }
        return null;
    }

    getAllBuildStatus() {
        return {
            cobra: this.buildStatus.get('cobra'),
            clap: this.buildStatus.get('clap')
        };
    }

    async rebuild(language) {
        logger.info(`Rebuilding ${language} project`);
        
        if (language === 'cobra' || language === 'go') {
            return await this.buildGo();
        } else if (language === 'clap' || language === 'rust') {
            return await this.buildRust();
        } else {
            throw new Error(`Unknown language: ${language}`);
        }
    }

    isBuilt(language) {
        const status = this.getBuildStatus(language);
        return status ? status.built : false;
    }

    getExecutablePath(language) {
        const status = this.getBuildStatus(language);
        return status && status.built ? status.executablePath : null;
    }

    async clean() {
        logger.info('Cleaning build artifacts');
        
        try {
            // Clean Go build
            const cobraExe = path.join(this.buildDir, 'cobra', 'app.exe');
            if (fs.existsSync(cobraExe)) {
                fs.unlinkSync(cobraExe);
                logger.debug('Removed Go executable');
            }

            // Clean Rust build
            const clapTarget = path.join(this.buildDir, 'clap', 'target');
            const clapExe = path.join(this.buildDir, 'clap', 'app.exe');
            
            if (fs.existsSync(clapExe)) {
                fs.unlinkSync(clapExe);
                logger.debug('Removed Rust executable');
            }

            // Reset build status
            this.buildStatus.set('cobra', { built: false, lastBuild: null, error: null });
            this.buildStatus.set('clap', { built: false, lastBuild: null, error: null });
            
            logger.info('Build artifacts cleaned successfully');
            
        } catch (error) {
            logger.error('Error cleaning build artifacts', { error: error.message });
        }
    }

    cleanup() {
        logger.info('Build manager cleanup completed');
    }
}

module.exports = BuildManager;