#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
    log(`${description}...`, 'blue');
    try {
        const result = execSync(command, { 
            stdio: 'pipe',
            encoding: 'utf8'
        });
        log(`✅ ${description} completed`, 'green');
        return result;
    } catch (error) {
        log(`❌ ${description} failed: ${error.message}`, 'red');
        throw error;
    }
}

function getBundleSize(filePath) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return (stats.size / 1024).toFixed(2);
    }
    return 'N/A';
}

function generateBuildReport() {
    const report = {
        timestamp: new Date().toISOString(),
        bundles: {
            'Main JS Bundle': {
                path: 'dist/js/bundle.min.js',
                size: getBundleSize('dist/js/bundle.min.js') + 'KB'
            },
            'FAQ Module': {
                path: 'dist/js/faq.js',
                size: getBundleSize('dist/js/faq.js') + 'KB'
            },
            'Analytics Module': {
                path: 'dist/js/analytics.js',
                size: getBundleSize('dist/js/analytics.js') + 'KB'
            },
            'CSS Bundle': {
                path: 'dist/css/styles.min.css',
                size: getBundleSize('dist/css/styles.min.css') + 'KB'
            }
        }
    };
    
    fs.writeFileSync('dist/build-report.json', JSON.stringify(report, null, 2));
    
    log('\n📊 Build Report:', 'cyan');
    log('═'.repeat(50), 'cyan');
    Object.entries(report.bundles).forEach(([name, info]) => {
        log(`${name}: ${info.size} (${info.path})`, 'yellow');
    });
    log('═'.repeat(50), 'cyan');
}

async function main() {
    const startTime = Date.now();
    
    log('🚀 Starting optimized build process...', 'bright');
    log('─'.repeat(50), 'blue');
    
    try {
        // 1. Clean previous build
        execCommand('npm run clean', 'Cleaning previous build');
        
        // 2. Extract and process CSS
        execCommand('npm run build:css:extract', 'Extracting CSS from HTML');
        
        // 3. Purge unused CSS
        execCommand('npm run build:css:purge', 'Removing unused CSS');
        
        // 4. Minify CSS
        execCommand('npm run build:css:minify', 'Minifying CSS');
        
        // 5. Bundle JavaScript
        execCommand('npm run build:js:bundle', 'Bundling JavaScript');
        
        // 6. Minify JavaScript
        execCommand('npm run build:js:minify', 'Minifying JavaScript');
        
        // 7. Optimize images
        execCommand('node build/optimize-images.js', 'Optimizing images');
        
        // 8. Inline critical CSS
        execCommand('node build/critical-css.js index.optimized.html dist/index.html', 'Inlining critical CSS');
        
        // 9. Copy additional assets
        log('Copying additional assets...', 'blue');
        if (!fs.existsSync('dist/assets')) {
            fs.mkdirSync('dist/assets', { recursive: true });
        }
        
        // Copy HTML files
        const htmlFiles = ['privacy.html', 'terms.html', 'refund.html', 'success.html', 'earnings_disclaimer.html'];
        htmlFiles.forEach(file => {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, `dist/${file}`);
            }
        });
        
        // 10. Generate build report
        generateBuildReport();
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        log('\n🎉 Build completed successfully!', 'green');
        log(`⏱️  Total build time: ${duration}s`, 'yellow');
        
        // Performance recommendations
        log('\n💡 Performance Recommendations:', 'magenta');
        log('─'.repeat(30), 'magenta');
        log('• Use dist/index.html as your main file', 'reset');
        log('• Serve files with gzip/brotli compression', 'reset');
        log('• Add cache headers for static assets', 'reset');
        log('• Consider using a CDN for assets', 'reset');
        
    } catch (error) {
        log(`\n💥 Build failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Check if running directly
if (require.main === module) {
    main();
}

module.exports = main;
