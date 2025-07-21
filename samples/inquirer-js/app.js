#!/usr/bin/env node
const { createPromptModule } = require('inquirer');
const inquirer = { prompt: createPromptModule() };
const fs = require('fs');
const path = require('path');

// カスタムバリデーション関数
const validateEmail = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input) || 'Please enter a valid email address';
};

const validateAge = (input) => {
  const age = parseInt(input);
  if (isNaN(age)) return 'Please enter a valid number';
  if (age < 0 || age > 150) return 'Please enter a realistic age (0-150)';
  return true;
};

// メイン関数
async function main() {
  console.log('Inquirer.js CLI Demo Application');
  console.log('Interactive prompts and beautiful CLI interfaces\n');

  try {
    const mainChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '👋 Basic greeting demo', value: 'greeting' },
          { name: '👤 Create user profile', value: 'profile' },
          { name: '📝 Project setup wizard', value: 'setup' },
          { name: '⚙️  Configuration manager', value: 'config' },
          { name: '📊 Survey demo', value: 'survey' },
          { name: '📋 Todo list manager', value: 'todo' },
          { name: '❓ Interactive help', value: 'help' },
          { name: '🚪 Exit', value: 'exit' }
        ],
        pageSize: 10
      }
    ]);

    switch (mainChoice.action) {
      case 'greeting':
        await greetingDemo();
        break;
      case 'profile':
        await createProfile();
        break;
      case 'setup':
        await projectSetup();
        break;
      case 'config':
        await configManager();
        break;
      case 'survey':
        await surveyDemo();
        break;
      case 'todo':
        await todoManager();
        break;
      case 'help':
        await showHelp();
        break;
      case 'exit':
        console.log('\nGoodbye! 👋');
        process.exit(0);
        break;
    }
  } catch (error) {
    if (error.isTtyError) {
      console.error('This CLI requires an interactive terminal');
    } else {
      console.error('An error occurred:', error.message);
    }
  }
}

async function greetingDemo() {
  console.log('\n🎯 Greeting Demo');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: "What's your name?",
      default: 'World',
      validate: (input) => input.trim() !== '' || 'Name cannot be empty'
    },
    {
      type: 'number',
      name: 'count',
      message: 'How many times should I greet you?',
      default: 1,
      validate: (input) => input > 0 && input <= 10 || 'Please enter 1-10'
    },
    {
      type: 'confirm',
      name: 'shout',
      message: 'Should I SHOUT?',
      default: false
    }
  ]);

  const greeting = answers.shout ? 'HELLO' : 'Hello';
  const name = answers.shout ? answers.name.toUpperCase() : answers.name;

  console.log('\n🗨️  Greeting you:');
  for (let i = 0; i < answers.count; i++) {
    console.log(`${greeting}, ${name}!`);
  }
}

async function createProfile() {
  console.log('\n👤 User Profile Creation');
  
  const profile = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username:',
      validate: (input) => input.length >= 3 || 'Username must be at least 3 characters'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Email address:',
      validate: validateEmail
    },
    {
      type: 'input',
      name: 'age',
      message: 'Age:',
      validate: validateAge
    },
    {
      type: 'list',
      name: 'role',
      message: 'Role:',
      choices: ['Developer', 'Designer', 'Manager', 'Student', 'Other']
    },
    {
      type: 'checkbox',
      name: 'skills',
      message: 'Skills (select all that apply):',
      choices: [
        'JavaScript',
        'Python',
        'React',
        'Node.js',
        'CSS',
        'HTML',
        'Git',
        'Docker'
      ]
    },
    {
      type: 'confirm',
      name: 'newsletter',
      message: 'Subscribe to newsletter?',
      default: true
    }
  ]);

  console.log('\n📋 Profile Summary:');
  console.log(`Username: ${profile.username}`);
  console.log(`Email: ${profile.email}`);
  console.log(`Age: ${profile.age}`);
  console.log(`Role: ${profile.role}`);
  console.log(`Skills: ${profile.skills.join(', ') || 'None specified'}`);
  console.log(`Newsletter: ${profile.newsletter ? 'Yes' : 'No'}`);
}

async function projectSetup() {
  console.log('\n📝 Project Setup Wizard');
  
  const setup = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input) => input.trim() !== '' || 'Project name is required'
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Choose a framework:',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue.js', value: 'vue' },
        { name: 'Angular', value: 'angular' },
        { name: 'Svelte', value: 'svelte' },
        { name: 'Vanilla JS', value: 'vanilla' }
      ]
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [
        { name: 'TypeScript', value: 'typescript' },
        { name: 'ESLint', value: 'eslint' },
        { name: 'Testing (Jest)', value: 'testing' },
        { name: 'CSS Preprocessor', value: 'css-preprocessor' },
        { name: 'Bundle Analyzer', value: 'analyzer' }
      ]
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: ['npm', 'yarn', 'pnpm'],
      default: 'npm'
    },
    {
      type: 'confirm',
      name: 'git',
      message: 'Initialize git repository?',
      default: true
    }
  ]);

  console.log('\n🚀 Project Configuration:');
  console.log(`Name: ${setup.projectName}`);
  console.log(`Framework: ${setup.framework}`);
  console.log(`Features: ${setup.features.join(', ') || 'None'}`);
  console.log(`Package Manager: ${setup.packageManager}`);
  console.log(`Git: ${setup.git ? 'Yes' : 'No'}`);
  
  const proceed = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'create',
      message: 'Create project with these settings?',
      default: true
    }
  ]);

  if (proceed.create) {
    console.log('✓ Project would be created with these settings!');
  }
}

async function configManager() {
  console.log('\n⚙️ Configuration Manager');
  
  const config = {
    theme: 'dark',
    language: 'en',
    debug: false,
    timeout: 30
  };

  const action = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'View current config', value: 'view' },
        { name: 'Update config', value: 'update' },
        { name: 'Reset to defaults', value: 'reset' }
      ]
    }
  ]);

  if (action.action === 'view') {
    console.log('\n📋 Current Configuration:');
    Object.entries(config).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  } else if (action.action === 'update') {
    const updates = await inquirer.prompt([
      {
        type: 'list',
        name: 'theme',
        message: 'Theme:',
        choices: ['dark', 'light', 'auto'],
        default: config.theme
      },
      {
        type: 'list',
        name: 'language',
        message: 'Language:',
        choices: ['en', 'ja', 'es', 'fr'],
        default: config.language
      },
      {
        type: 'confirm',
        name: 'debug',
        message: 'Enable debug mode?',
        default: config.debug
      },
      {
        type: 'number',
        name: 'timeout',
        message: 'Timeout (seconds):',
        default: config.timeout,
        validate: (input) => input > 0 || 'Timeout must be positive'
      }
    ]);
    
    console.log('\n✓ Configuration updated!');
    Object.entries(updates).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  } else {
    console.log('\n↻ Configuration reset to defaults!');
  }
}

async function surveyDemo() {
  console.log('\n📊 Quick Survey');
  
  const survey = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'experience',
      message: 'How would you rate your CLI experience?',
      choices: [
        'Beginner',
        'Intermediate', 
        'Advanced',
        'Expert'
      ]
    },
    {
      type: 'checkbox',
      name: 'tools',
      message: 'Which CLI tools do you use regularly?',
      choices: [
        'Git',
        'Docker',
        'npm/yarn',
        'AWS CLI',
        'kubectl',
        'curl',
        'grep/sed/awk'
      ]
    },
    {
      type: 'number',
      name: 'rating',
      message: 'Rate this demo (1-10):',
      validate: (input) => (input >= 1 && input <= 10) || 'Please enter 1-10'
    },
    {
      type: 'input',
      name: 'feedback',
      message: 'Any feedback?'
    }
  ]);

  console.log('\n📈 Survey Results:');
  console.log(`Experience Level: ${survey.experience}`);
  console.log(`Tools Used: ${survey.tools.join(', ')}`);
  console.log(`Rating: ${survey.rating}/10`);
  console.log(`Feedback: ${survey.feedback || 'None provided'}`);
}

async function todoManager() {
  console.log('\n📋 Todo List Manager');
  
  const todos = ['Learn Inquirer.js', 'Build CLI app', 'Write documentation'];
  
  const action = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'View todos', value: 'view' },
        { name: 'Add todo', value: 'add' },
        { name: 'Mark complete', value: 'complete' }
      ]
    }
  ]);

  if (action.action === 'view') {
    console.log('\n✅ Current Todos:');
    todos.forEach((todo, index) => {
      console.log(`  ${index + 1}. ${todo}`);
    });
  } else if (action.action === 'add') {
    const newTodo = await inquirer.prompt([
      {
        type: 'input',
        name: 'todo',
        message: 'Enter new todo:',
        validate: (input) => input.trim() !== '' || 'Todo cannot be empty'
      }
    ]);
    console.log(`✓ Added: ${newTodo.todo}`);
  } else {
    if (todos.length === 0) {
      console.log('No todos to complete!');
    } else {
      const complete = await inquirer.prompt([
        {
          type: 'list',
          name: 'todo',
          message: 'Which todo to mark complete?',
          choices: todos
        }
      ]);
      console.log(`✓ Completed: ${complete.todo}`);
    }
  }
}

async function showHelp() {
  console.log('\n❓ Help Information');
  console.log('This is an Inquirer.js demo showcasing:');
  console.log('• Interactive prompts');
  console.log('• Input validation');
  console.log('• Multiple choice selections');
  console.log('• Conditional questions');
  console.log('• Beautiful CLI interfaces');
  
  const moreInfo = await inquirer.prompt([
    {
      type: 'expand',
      name: 'info',
      message: 'Need more information?',
      default: 'h',
      choices: [
        { key: 'd', name: 'Documentation', value: 'docs' },
        { key: 'e', name: 'Examples', value: 'examples' },
        { key: 'g', name: 'GitHub', value: 'github' },
        { key: 'h', name: 'Help', value: 'help' }
      ]
    }
  ]);

  switch (moreInfo.info) {
    case 'docs':
      console.log('📖 Visit: https://github.com/SBoudrias/Inquirer.js/');
      break;
    case 'examples':
      console.log('💡 Check the examples folder in the GitHub repo');
      break;
    case 'github':
      console.log('🐙 GitHub: https://github.com/SBoudrias/Inquirer.js');
      break;
    default:
      console.log('❓ This is the help section you\'re already in!');
  }
}

// 引数解析
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Inquirer.js Demo Application');
  console.log('\nUsage:');
  console.log('  node app.js [options]');
  console.log('\nOptions:');
  console.log('  -h, --help     Show help');
  console.log('  --version      Show version');
  console.log('  --preset <preset>  Use preset configuration');
  process.exit(0);
}

if (args.includes('--version')) {
  console.log('1.0.0');
  process.exit(0);
}

// プリセットオプションの処理
if (args.includes('--preset')) {
  const presetIndex = args.indexOf('--preset');
  const preset = args[presetIndex + 1];
  
  console.log(`Using preset: ${preset}`);
  console.log('This would skip interactive prompts and use predefined values.');
  process.exit(0);
}

// メイン関数を実行
if (require.main === module) {
  main().catch(console.error);
}