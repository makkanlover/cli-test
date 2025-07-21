const ScreenshotManager = require('./backend/screenshot-manager');

async function testScreenshots() {
    const manager = new ScreenshotManager();
    
    console.log('Testing screenshot generation...');
    
    const libraries = ['commander-js', 'yargs', 'inquirer-js', 'click', 'typer'];
    
    for (const lib of libraries) {
        console.log(`\nGenerating screenshot for ${lib}...`);
        const result = await manager.captureScreenshot(lib);
        console.log('Result:', result);
    }
    
    console.log('\nAll screenshots generated!');
    console.log('Available screenshots:', manager.getScreenshots());
}

testScreenshots().catch(console.error);