const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const libraryConfig = require('./library-config');
const BuildManager = require('./build-manager');
const logger = require('./logger');

class ProcessManager {
  constructor() {
    this.currentLibrary = null;
    this.activeProcesses = new Map();
    this.workingDirectory = process.cwd();
    this.buildManager = new BuildManager();
    this.initializeBuild();
  }

  async initializeBuild() {
    try {
      logger.info('Initializing build process for compiled languages');
      const buildResults = await this.buildManager.buildAll();
      
      // Log build results
      Object.entries(buildResults).forEach(([lang, result]) => {
        if (result.success) {
          logger.info(`${lang} build successful`, { executablePath: result.executablePath });
        } else {
          logger.warn(`${lang} build failed`, { 
            error: result.error,
            fallback: result.fallback
          });
        }
      });
      
    } catch (error) {
      logger.error('Build initialization failed', { error: error.message });
    }
  }

  selectLibrary(libraryId) {
    const library = libraryConfig.getLibrary(libraryId);
    if (!library) {
      throw new Error(`Library ${libraryId} not found`);
    }

    this.cleanup();
    this.currentLibrary = library;
    console.log(`Selected library: ${library.name} (${library.language})`);
    return library;
  }

  async executeCommand(command) {
    if (!this.currentLibrary) {
      throw new Error('No library selected');
    }

    const library = this.currentLibrary;
    const processId = Date.now().toString();
    
    try {
      let fullCommand;
      let args;
      const sampleDir = path.resolve(this.workingDirectory, library.samplePath.replace('../', ''));

      const commandParts = command === 'help' || command === '--help' || command === '-h' 
        ? ['--help'] 
        : command.split(' ');

      if (library.language === 'Python') {
        fullCommand = library.executable;
        args = [path.join(sampleDir, 'app.py'), ...commandParts];
      } else if (library.language === 'Node.js') {
        fullCommand = library.executable;
        args = [path.join(sampleDir, 'app.js'), ...commandParts];
      } else if (library.language === 'Ruby') {
        fullCommand = library.executable;
        args = [path.join(sampleDir, 'app.rb'), ...commandParts];
      } else if (library.language === 'Go') {
        // Try to use built executable first, fallback to source execution
        const executablePath = this.buildManager.getExecutablePath('cobra');
        if (executablePath && fs.existsSync(executablePath)) {
          fullCommand = executablePath;
          args = commandParts;
          logger.debug('Using built Go executable', { executablePath });
        } else {
          // Fallback to source execution (slower)
          fullCommand = 'go';
          args = ['run', 'main.go', ...commandParts];
          logger.debug('Using Go source execution (fallback)', { sampleDir });
        }
      } else if (library.language === 'Rust') {
        // Try to use built executable first, fallback to cargo run
        const executablePath = this.buildManager.getExecutablePath('clap');
        if (executablePath && fs.existsSync(executablePath)) {
          fullCommand = executablePath;
          args = commandParts;
          logger.debug('Using built Rust executable', { executablePath });
        } else {
          // Fallback to cargo run (slower)
          fullCommand = 'cargo';
          args = ['run', '--', ...commandParts];
          logger.debug('Using Rust source execution (fallback)', { sampleDir });
        }
      }

      const result = await this.runProcess(processId, fullCommand, args, sampleDir);
      return {
        success: true,
        output: result.stdout,
        error: result.stderr,
        command: command,
        library: library.name
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        command: command,
        library: library.name,
        suggestion: this.getErrorSuggestion(error.message)
      };
    }
  }

  runProcess(processId, command, args, cwd) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      this.activeProcesses.set(processId, child);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        this.activeProcesses.delete(processId);
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(stderr || `Process exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        this.activeProcesses.delete(processId);
        reject(error);
      });

      setTimeout(() => {
        if (this.activeProcesses.has(processId)) {
          child.kill('SIGTERM');
          this.activeProcesses.delete(processId);
          reject(new Error('Command timeout'));
        }
      }, 30000);
    });
  }

  getErrorSuggestion(errorMessage) {
    if (errorMessage.includes('ENOENT')) {
      return 'コマンドまたはファイルが見つかりません。実行環境が正しく設定されているか確認してください。';
    }
    if (errorMessage.includes('timeout')) {
      return 'コマンドの実行時間が長すぎます。より軽量なコマンドを試してください。';
    }
    if (errorMessage.includes('No library selected')) {
      return 'ライブラリを選択してからコマンドを実行してください。';
    }
    return 'エラーが発生しました。コマンドの構文を確認してください。';
  }

  async buildCompiledSamples() {
    const goLibrary = libraryConfig.getLibrary('cobra');
    const rustLibrary = libraryConfig.getLibrary('clap');

    try {
      if (goLibrary) {
        await this.buildGoSample(goLibrary);
      }
    } catch (error) {
      console.warn('Go sample build failed:', error.message);
    }

    try {
      if (rustLibrary) {
        await this.buildRustSample(rustLibrary);
      }
    } catch (error) {
      console.warn('Rust sample build failed:', error.message);
    }
  }

  async buildGoSample(library) {
    const sampleDir = path.resolve(this.workingDirectory, library.samplePath.replace('../', ''));
    await this.runProcess('go-build', 'go', ['build', '-o', 'app', '.'], sampleDir);
  }

  async buildRustSample(library) {
    const sampleDir = path.resolve(this.workingDirectory, library.samplePath.replace('../', ''));
    await this.runProcess('rust-build', 'cargo', ['build', '--release'], sampleDir);
    
    const sourceExe = path.join(sampleDir, 'target', 'release', 'app');
    const targetExe = path.join(sampleDir, 'app');
    if (fs.existsSync(sourceExe)) {
      fs.copyFileSync(sourceExe, targetExe);
    }
  }

  cleanup() {
    for (const [processId, process] of this.activeProcesses) {
      try {
        process.kill('SIGTERM');
        logger.debug(`Killed process ${processId}`);
      } catch (error) {
        logger.error(`Error killing process ${processId}`, { error: error.message });
      }
    }
    this.activeProcesses.clear();
    
    if (this.buildManager) {
      this.buildManager.cleanup();
    }
  }

  // Build management methods
  async rebuildLibrary(libraryId) {
    const library = libraryConfig.getLibrary(libraryId);
    if (!library) {
      throw new Error(`Library ${libraryId} not found`);
    }

    if (library.language === 'Go') {
      return await this.buildManager.rebuild('cobra');
    } else if (library.language === 'Rust') {
      return await this.buildManager.rebuild('clap');
    } else {
      throw new Error(`Library ${libraryId} does not require building`);
    }
  }

  getBuildStatus(libraryId) {
    const library = libraryConfig.getLibrary(libraryId);
    if (!library) {
      return null;
    }

    if (library.language === 'Go') {
      return this.buildManager.getBuildStatus('cobra');
    } else if (library.language === 'Rust') {
      return this.buildManager.getBuildStatus('clap');
    } else {
      return { built: true, message: 'No build required' };
    }
  }

  getAllBuildStatus() {
    return this.buildManager.getAllBuildStatus();
  }

  getCurrentLibrary() {
    return this.currentLibrary;
  }

  getActiveProcessCount() {
    return this.activeProcesses.size;
  }
}

module.exports = ProcessManager;