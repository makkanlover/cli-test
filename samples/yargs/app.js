#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const path = require('path');

const argv = yargs(hideBin(process.argv))
  .scriptName('yargs-demo')
  .usage('$0 <command> [options]')
  .command(
    'hello [name]',
    'Basic greeting command',
    (yargs) => {
      return yargs
        .positional('name', {
          describe: '挨拶する相手の名前',
          default: 'World',
          type: 'string'
        })
        .option('count', {
          alias: 'c',
          describe: '挨拶を繰り返す回数',
          default: 1,
          type: 'number'
        })
        .option('shout', {
          alias: 's',
          describe: '大声で挨拶する',
          type: 'boolean'
        });
    },
    (argv) => {
      const { name, count, shout } = argv;
      const greeting = shout ? 'HELLO' : 'Hello';
      const targetName = shout ? name.toUpperCase() : name;
      
      for (let i = 0; i < count; i++) {
        console.log(`${greeting}, ${targetName}!`);
        if (count > 1) {
          console.log(`  (${i + 1}/${count})`);
        }
      }
    }
  )
  .command(
    'serve [port]',
    'Start a server',
    (yargs) => {
      return yargs
        .positional('port', {
          describe: 'Port to bind on',
          default: 3000,
          type: 'number'
        })
        .option('host', {
          alias: 'h',
          describe: 'Host to bind on',
          default: 'localhost',
          type: 'string'
        })
        .option('ssl', {
          describe: 'Enable SSL',
          type: 'boolean'
        })
        .option('config', {
          alias: 'c',
          describe: 'Configuration file',
          type: 'string'
        });
    },
    (argv) => {
      console.log('Server Configuration:');
      console.log(`  Host: ${argv.host}`);
      console.log(`  Port: ${argv.port}`);
      console.log(`  SSL: ${argv.ssl ? 'Enabled' : 'Disabled'}`);
      console.log(`  Config: ${argv.config || 'Default'}`);
      
      console.log(`\nStarting server on ${argv.ssl ? 'https' : 'http'}://${argv.host}:${argv.port}...`);
      console.log('✓ Server started successfully!');
    }
  )
  .command(
    'build',
    'Build the project',
    (yargs) => {
      return yargs
        .option('output', {
          alias: 'o',
          describe: 'Output directory',
          default: 'dist',
          type: 'string'
        })
        .option('minify', {
          alias: 'm',
          describe: 'Minify output',
          type: 'boolean'
        })
        .option('source-map', {
          describe: 'Generate source maps',
          type: 'boolean',
          default: true
        })
        .option('watch', {
          alias: 'w',
          describe: 'Watch for changes',
          type: 'boolean'
        });
    },
    (argv) => {
      console.log('Build Configuration:');
      console.log(`  Output: ${argv.output}`);
      console.log(`  Minify: ${argv.minify ? 'Yes' : 'No'}`);
      console.log(`  Source Maps: ${argv.sourceMap ? 'Yes' : 'No'}`);
      console.log(`  Watch: ${argv.watch ? 'Yes' : 'No'}`);
      
      console.log('\nBuilding project...');
      
      setTimeout(() => {
        console.log(`✓ Build completed! Output in ${argv.output}/`);
      }, 1500);
    }
  )
  .command(
    'config <action> [key] [value]',
    'Configuration management',
    (yargs) => {
      return yargs
        .positional('action', {
          describe: 'Action to perform',
          choices: ['get', 'set', 'list', 'delete']
        })
        .positional('key', {
          describe: 'Configuration key',
          type: 'string'
        })
        .positional('value', {
          describe: 'Configuration value',
          type: 'string'
        })
        .option('global', {
          alias: 'g',
          describe: 'Use global configuration',
          type: 'boolean'
        });
    },
    (argv) => {
      const { action, key, value, global } = argv;
      const scope = global ? 'global' : 'local';
      
      console.log(`Configuration [${scope}]:`);
      
      switch (action) {
        case 'get':
          console.log(`  ${key}: ${value || 'not found'}`);
          break;
        case 'set':
          console.log(`  Setting ${key} = ${value}`);
          break;
        case 'list':
          console.log('  Available configurations:');
          console.log('    theme: dark');
          console.log('    debug: false');
          console.log('    timeout: 30');
          break;
        case 'delete':
          console.log(`  Deleted ${key}`);
          break;
      }
    }
  )
  .command(
    'process',
    'Process items with advanced options',
    (yargs) => {
      return yargs
        .option('items', {
          alias: 'i',
          describe: 'Items to process',
          type: 'array',
          default: ['item1', 'item2', 'item3']
        })
        .option('verbose', {
          alias: 'v',
          describe: 'Verbose output',
          type: 'boolean'
        })
        .option('parallel', {
          alias: 'p',
          describe: 'Process items in parallel',
          type: 'boolean'
        })
        .option('timeout', {
          alias: 't',
          describe: 'Timeout per item (ms)',
          type: 'number',
          default: 1000
        });
    },
    (argv) => {
      const { items, verbose, parallel, timeout } = argv;
      
      console.log(`Processing ${items.length} items...`);
      console.log(`Mode: ${parallel ? 'Parallel' : 'Sequential'}`);
      console.log(`Timeout: ${timeout}ms per item\n`);
      
      if (parallel) {
        items.forEach((item, index) => {
          setTimeout(() => {
            if (verbose) console.log(`Processing: ${item}`);
            console.log(`✓ Completed: ${item}`);
            if (index === items.length - 1) {
              console.log('\n✓ All items processed!');
            }
          }, Math.random() * timeout);
        });
      } else {
        items.forEach((item, index) => {
          setTimeout(() => {
            if (verbose) console.log(`Processing: ${item}`);
            console.log(`[${index + 1}/${items.length}] Completed: ${item}`);
            if (index === items.length - 1) {
              console.log('\n✓ All items processed!');
            }
          }, (index + 1) * (timeout / 2));
        });
      }
    }
  )
  .command(
    'info',
    'Show system information',
    (yargs) => {
      return yargs
        .option('format', {
          alias: 'f',
          describe: 'Output format',
          choices: ['json', 'table', 'yaml'],
          default: 'table'
        })
        .option('verbose', {
          alias: 'v',
          describe: 'Show detailed information',
          type: 'boolean'
        });
    },
    (argv) => {
      const info = {
        library: 'Yargs',
        version: '17.0+',
        language: 'Node.js',
        features: 'Complex options, Command chaining, Middleware support',
        timestamp: new Date().toISOString()
      };
      
      if (argv.verbose) {
        info.extras = {
          documentation: 'https://yargs.js.org/',
          repository: 'https://github.com/yargs/yargs',
          license: 'MIT'
        };
      }
      
      switch (argv.format) {
        case 'json':
          console.log(JSON.stringify(info, null, 2));
          break;
        case 'yaml':
          console.log('# System Information');
          Object.entries(info).forEach(([key, value]) => {
            if (typeof value === 'object') {
              console.log(`${key}:`);
              Object.entries(value).forEach(([subKey, subValue]) => {
                console.log(`  ${subKey}: ${subValue}`);
              });
            } else {
              console.log(`${key}: ${value}`);
            }
          });
          break;
        default: // table
          console.log('System Information:');
          Object.entries(info).forEach(([key, value]) => {
            if (typeof value === 'object') {
              console.log(`  ${key}:`);
              Object.entries(value).forEach(([subKey, subValue]) => {
                console.log(`    ${subKey}: ${subValue}`);
              });
            } else {
              console.log(`  ${key}: ${value}`);
            }
          });
      }
    }
  )
  .middleware((argv) => {
    // Yargs ミドルウェアのデモ
    if (argv.verbose) {
      console.log(`[DEBUG] Command: ${argv._[0] || 'none'}`);
      console.log(`[DEBUG] Arguments:`, argv);
      console.log('---');
    }
  })
  .help('h')
  .alias('h', 'help')
  .version('1.0.0')
  .wrap(Math.min(120, process.stdout.columns || 120))
  .demandCommand(1, 'Please provide a command')
  .recommendCommands()
  .strict()
  .epilogue('For more information, visit https://yargs.js.org/')
  .argv;