const ScreenshotManager = require('./backend/screenshot-manager');

async function generateAllScreenshots() {
    const manager = new ScreenshotManager();
    
    const libraries = [
        'click', 'typer', 'fire',
        'commander-js', 'yargs', 'inquirer-js',
        'cobra', 'clap', 'thor', 'option-parser'
    ];
    
    console.log('Generating screenshots for all libraries...\n');
    
    for (const lib of libraries) {
        console.log(`Generating screenshot for ${lib}...`);
        const result = await manager.captureScreenshot(lib);
        if (result.success) {
            console.log(`✅ ${lib}: ${result.message}`);
        } else {
            console.log(`❌ ${lib}: ${result.message}`);
        }
    }
    
    console.log('\nAll screenshots generated!');
    console.log('\nCleaning up old placeholder files...');
    
    // Check final results
    const screenshots = manager.getScreenshots();
    const svgCount = screenshots.filter(s => s.type === 'svg').length;
    const placeholderCount = screenshots.filter(s => s.isPlaceholder).length;
    
    console.log(`\nFinal results:`);
    console.log(`- Generated SVG screenshots: ${svgCount}`);
    console.log(`- Placeholder files: ${placeholderCount}`);
    console.log(`- Total files: ${screenshots.length}`);
}

generateAllScreenshots().catch(console.error);